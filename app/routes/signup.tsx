import React, { useState, useEffect } from 'react';
import type { Route } from './+types/signup';
import { redirect } from 'react-router';

// Updated components for Discord OAuth
import DiscordOAuthButton from '../components/DiscordOAuthButton';
import DiscordErrorDisplay from '../components/DiscordErrorDisplay';
import SupportRequestForm from '../components/SupportRequestForm';

// Updated step flow - removed manual Discord verification
type FormStep = 'discord-oauth' | 'github-oauth' | 'support-request' | 'complete';

// SERVER-SIDE LOADER (handles Discord OAuth results and GitHub setup)
export async function loader({ request, context }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const env = context.cloudflare.env;
  
  // Handle Discord OAuth results
  const discordSuccess = url.searchParams.get('discord_success');
  const discordError = url.searchParams.get('discord_error');
  const discordUsername = url.searchParams.get('discord_username');
  const discordId = url.searchParams.get('discord_id');
  const discordDisplayName = url.searchParams.get('discord_display');
  const discordVerified = url.searchParams.get('discord_verified');
  const userRoles = url.searchParams.get('user_roles');
  
  // Handle GitHub OAuth results (existing)
  const username = url.searchParams.get('username');
  const status = url.searchParams.get('status');
  const isCollaborator = url.searchParams.get('isCollaborator') === 'true';
  const hasPendingInvitation = url.searchParams.get('hasPendingInvitation') === 'true';
  const error = url.searchParams.get('error');
  
  // Parse user roles if available
  let parsedUserRoles: { id: string; name: string }[] = [];
  try {
    if (userRoles) {
      parsedUserRoles = JSON.parse(decodeURIComponent(userRoles));
    }
  } catch (error) {
    console.error('Error parsing user roles:', error);
  }
  
  let message = null;
  if (error) {
    message = `Error: ${error}`;
  } else if (username) {
    message = isCollaborator
      ? `Welcome, ${username}! You're now a collaborator.`
      : hasPendingInvitation
        ? `${username}, you have a pending invitation. Check your GitHub notifications.`
        : `${username} could not be added. Status: ${status}`;
  }
  
  return {
    clientId: env.GITHUB_CLIENT_ID,
    backendBase: url.origin,
    redirectUri: `${url.origin}/api/github/callback`,
    message,
    // Discord OAuth results
    discordSuccess: discordSuccess === 'true',
    discordError,
    discordUsername,
    discordId,
    discordDisplayName,
    discordVerified: discordVerified === 'true',
    userRoles: parsedUserRoles,
  };
}

// SERVER-SIDE ACTION (handles support requests)
export async function action({ request, context }: Route.ActionArgs) {
  const formData = await request.formData();
  const actionType = formData.get('actionType') as string;
  const env = context.cloudflare.env;
  
  //User requests support. Triggered when 'submit' is clicked on support form.
  if (actionType === 'support-request') {
    const supportData = {
      discordUsername: formData.get('discordUsername') as string,
      message: formData.get('message') as string,
      discordId: formData.get('discordId') as string,
      verificationError: formData.get('verificationError') as string,
    };
    
    try {
      const requestId = await createSupportRequest(supportData, env);
      return { success: true, requestId };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }
  
  return { success: false, error: 'Unknown action' };
}

// Support request function (migrated backend logic)
async function createSupportRequest(data: any, env: any): Promise<string> {
  const requestId = crypto.randomUUID();
  
  // Send webhook notification (if configured)
  if (env.WEBHOOK_URL) {
    await fetch(env.WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'discord_support_request',
        requestId,
        timestamp: new Date().toISOString(),
        data: {
          discordUsername: data.discordUsername,
          discordId: data.discordId,
          message: data.message,
          verificationError: data.verificationError,
        }
      })
    });
  }
  
  return requestId;
}

// REACT COMPONENT (updated for Discord OAuth flow)
export default function SignupPage({ loaderData, actionData }: Route.ComponentProps) {
  const { 
    clientId, 
    redirectUri, 
    message: initialMessage,
    discordSuccess,
    discordError,
    discordUsername,
    discordId,
    discordDisplayName,
    discordVerified,
    userRoles
  } = loaderData;
  
  const [currentStep, setCurrentStep] = useState<FormStep>('discord-oauth');
  const [verifiedDiscordUsername, setVerifiedDiscordUsername] = useState<string>('');
  const [supportRequestId, setSupportRequestId] = useState<string>('');
  const [message, setMessage] = useState<string | null>(initialMessage);

  // Handle Discord OAuth results on mount
  useEffect(() => {
    if (discordSuccess && discordVerified) {
      // User has verified role in Discord server
      setVerifiedDiscordUsername(discordUsername || '');
      setCurrentStep('github-oauth');
    } else if (discordError) {
      // Discord verification failed - show error and support request
      setCurrentStep('support-request');
    }
  }, [discordSuccess, discordVerified, discordError, discordUsername]);

  // Handle server action responses (support requests)
  useEffect(() => {
    if (actionData) {
      if (actionData.success && actionData.requestId) {
        setSupportRequestId(actionData.requestId);
        setCurrentStep('complete');
      }
    }
  }, [actionData]);

  // Updated steps for Discord OAuth flow
  const steps = [
    { key: 'discord-oauth', label: 'Connect Discord' },
    { key: 'github-oauth', label: 'Connect GitHub' },
    { key: 'complete', label: 'Complete' }
  ];

  const getStepIndex = () => {
    if (currentStep === 'support-request') {
      return 0; // Show as first step when support needed
    }
    return steps.findIndex(s => s.key === currentStep);
  };

  const StepIndicator = () => (
    <div className='step-dots'>
      {steps.map((step, idx) => (
        <div key={step.key} className={`step-dot ${idx === getStepIndex() ? 'active' : ''} ${idx < getStepIndex() ? 'completed' : ''}`}>
          <span className='step-number'>{idx + 1}</span>
        </div>
      ))}
    </div>
  );

  const handleLogin = () => {
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=read:user`;
    window.location.href = authUrl;
  };

  const handleBackToDiscord = () => {
    setCurrentStep('discord-oauth');
    // Clear URL parameters
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  const handleSupportSubmitted = (requestId: string) => {
    setSupportRequestId(requestId);
    setCurrentStep('complete');
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'discord-oauth':
        return (
          <div className='form-content'>
            <div className='form-header'>
              <h3 className='form-title'>Connect Your Discord</h3>
              <p className='form-subtitle'>Sign in with Discord to verify your membership in the Infima Games server</p>
            </div>
            
            <div className='action-section'>
              <DiscordOAuthButton />
            </div>
            
            <div className='form-footer'>
              <p className='privacy-note'>
                <span className='privacy-icon'>🔒</span>
                We'll check if you have the "Verified" role in our Discord server
              </p>
            </div>
          </div>
        );

      case 'github-oauth':
        return (
          <div className='form-content'>
            <div className='form-header'>
              <h3 className='form-title'>Connect GitHub</h3>
              <p className='form-subtitle'>
                Welcome, <strong>{verifiedDiscordUsername}</strong>! Connect your GitHub account to get repository access.
              </p>
            </div>

            {message && (
              <div className='status-message'>
                <p className={`message ${message.startsWith('Error') ? 'error' : 'success'}`}>
                  {message}
                </p>
              </div>
            )}

            <div className='action-section'>
              <div className='github-btn-container'>
                <button className='github-btn' onClick={handleLogin} title='Connect your GitHub account securely'>
                  <div className='github-icon'>
                    <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='currentColor'>
                      <path d='M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z' />
                    </svg>
                  </div>
                  <span>Connect GitHub Account</span>
                </button>
              </div>
            </div>

            <div className='form-footer'>
              <button onClick={handleBackToDiscord} className='back-link' title='Go back to Discord connection'>
                ← Back to Discord connection
              </button>
            </div>
          </div>
        );

      case 'support-request':
        return (
          <div className='form-content'>
            <div className='form-header'>
              <h3 className='form-title'>Discord Verification Issue</h3>
              <p className='form-subtitle'>We couldn't verify your Discord account</p>
            </div>
            
            <DiscordErrorDisplay 
              error={discordError || 'unknown'}
              username={discordUsername}
              userRoles={userRoles}
            />
            
            <div className='form-header'>
              <h3 className='form-title'>Request Support</h3>
              <p className='form-subtitle'>Having trouble? We're here to help</p>
            </div>
            
            <SupportRequestForm
              discordUsername={discordUsername || ''}
              verificationError={discordError || 'Discord verification failed'}
              onSupportSubmitted={handleSupportSubmitted}
              onBack={handleBackToDiscord}
            />
          </div>
        );

      case 'complete':
        if (supportRequestId) {
          // Support request completed
          return (
            <div className='form-content'>
              <div className='form-header'>
                <h3 className='form-title'>Support Request Submitted</h3>
                <p className='form-subtitle'>We've received your request</p>
              </div>

              <div className='success-content'>
                <div className='success-icon'>📧</div>
                <p className='success-text'>
                  Your support request has been submitted successfully. Request ID: <strong>{supportRequestId}</strong>
                </p>
                <p className='success-text'>
                  We'll review your request and get back to you soon.
                </p>
              </div>

              <div className='form-footer'>
                <button onClick={handleBackToDiscord} className='back-link' title='Start over'>
                  ← Start over
                </button>
              </div>
            </div>
          );
        } else {
          // GitHub OAuth completed
          return (
            <div className='form-content'>
              <div className='form-header'>
                <h3 className='form-title'>Welcome to Insiders!</h3>
                <p className='form-subtitle'>You're all set up</p>
              </div>

              <div className='success-content'>
                <div className='success-icon'>🎉</div>
                <p className='success-text'>
                  Congratulations! You now have access to the Insiders repository.
                </p>
                <p className='success-text'>
                  Check your GitHub notifications for the invitation link.
                </p>
              </div>
            </div>
          );
        }

      default:
        return null;
    }
  };

  return (
    <div className='app-container'>
      <div className='info-section'>
        <div className='logo-container'>
          <img src='/infima-games-logo.svg' alt='Infima Games Logo' className='logo' />
        </div>
        <h2 className='title'>Join the Insiders Build: Get Updates Before the Marketplace</h2>
        <p className='subtitle'>
          The Realistic Assault Rifle Template has always been about more than some animations and a pretty 3D model. It's about giving you a solid, extensible foundation for shooter mechanics so you can build prototypes faster and focus on what matters: your game.
        </p>
        <ul className='benefits'>
          <li>
            <span className='check-mark'>✔</span> 
            <p><strong>Access to the Insider GitHub: </strong>
              Get the latest build of the template as it's being updated, before it hits the Marketplace.</p>
          </li>
          <li>
            <span className='check-mark'>✔</span> 
            <p><strong>Transparent Development: </strong>
              Follow along as we improve the core systems, fix long-standing issues, and expand features.</p>
          </li>
          <li>
            <span className='check-mark'>✔</span> 
            <p><strong>Direct Contribution to Stability: </strong>
              By using the Insider build, you help raise the quality bar for everyone.</p>
          </li>
        </ul>
      </div>
      <div className='signup-section'>
        <StepIndicator />
        {renderCurrentStep()}
        <div className='footer-links'>
          <p className='no-account'>
            No account? <a href='https://github.com/signup'>Sign up on GitHub</a>
          </p>
        </div>
      </div>
    </div>
  );
}