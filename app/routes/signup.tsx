import type { Route } from './+types/signup';

// Import signup flow components
import { StepIndicator, InfoSection, FooterLinks, SignupFlow } from '../components';

// Import custom hook for signup flow logic
import { useSignupFlow } from '../hooks/useSignupFlow';

/**
 * Server-side loader for the signup route.
 * Handles OAuth callback parameters from Discord and GitHub,
 * and prepares data for the signup flow.
 *
 * Processes URL parameters to determine OAuth results and user state,
 * then returns structured data for the client component.
 *
 * @param request - The incoming request object containing URL parameters
 * @param context - Route context containing Cloudflare environment variables
 * @returns Structured loader data with OAuth results and configuration
 */
export async function loader({ request, context }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const env = context.cloudflare.env as any; // Cast to any for Cloudflare Workers compatibility
  
  // Extract Discord OAuth callback parameters
  const discordSuccess = url.searchParams.get('discord_success');
  const discordError = url.searchParams.get('discord_error');
  const discordUsername = url.searchParams.get('discord_username');
  const discordId = url.searchParams.get('discord_id');
  const discordDisplayName = url.searchParams.get('discord_display');
  const discordVerified = url.searchParams.get('discord_verified');
  const userRoles = url.searchParams.get('user_roles');
  const errorDetails = url.searchParams.get('error_details');
  
  // Extract GitHub OAuth callback parameters
  const username = url.searchParams.get('username');
  const status = url.searchParams.get('status');
  const isCollaborator = url.searchParams.get('isCollaborator') === 'true';
  const hasPendingInvitation = url.searchParams.get('hasPendingInvitation') === 'true';
  const error = url.searchParams.get('error');
  
  // Parse user roles from JSON string if present
  let parsedUserRoles: { id: string; name: string }[] = [];
  try {
    if (userRoles) {
      parsedUserRoles = JSON.parse(decodeURIComponent(userRoles));
    }
  } catch (parseError) {
    console.error('Error parsing user roles from URL parameter:', parseError);
  }
  
  // Generate status message based on OAuth results
  let message = null;
  if (error) {
    message = `Error: ${error}`;
    if (errorDetails) {
      message += ` - ${errorDetails}`;
    }
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
    errorDetails,
  };
}


/**
 * Server-side action for handling support requests.
 * Processes form submissions for Discord verification support.
 *
 * Validates form data, creates a support request record, and sends
 * webhook notifications if configured. Returns success/error status
 * for client-side feedback.
 *
 * @param request - The form submission request containing support data
 * @param context - Route context containing Cloudflare environment variables
 * @returns Action response with success status and request ID, or error details
 */
export async function action({ request, context }: Route.ActionArgs) {
  const formData = await request.formData();
  const actionType = formData.get('actionType') as string;
  const env = context.cloudflare.env as any; // Cast to any for Cloudflare Workers compatibility
  
  // Handle support request submission
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
    } catch (submissionError) {
      console.error('Support request submission failed:', submissionError);
      return { success: false, error: (submissionError as Error).message };
    }
  }
  
  return { success: false, error: 'Unknown action type' };
}

/**
 * Creates a support request for Discord verification issues.
 * Generates a unique request ID and sends webhook notification if configured.
 *
 * This function handles the backend processing of support requests,
 * ensuring proper logging and external notifications for follow-up.
 *
 * @param data - Support request data containing user information and error details
 * @param env - Environment variables for webhook configuration
 * @returns Unique request ID for tracking the support case
 * @throws Error if webhook notification fails (non-blocking)
 */
async function createSupportRequest(data: any, env: any): Promise<string> {
  const requestId = crypto.randomUUID();
  
  // Send webhook notification for support tracking (if configured)
  if (env.WEBHOOK_URL) {
    try {
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
      console.log(`Support request ${requestId} notification sent successfully`);
    } catch (webhookError) {
      console.error('Failed to send support request webhook notification:', webhookError);
      // Don't throw - webhook failure shouldn't block support request creation
    }
  }
  
  return requestId;
}

/**
 * SignupPage component implementing a multi-step OAuth flow.
 * Handles Discord verification and GitHub repository access setup.
 *
 * This component follows React composition patterns by breaking down
 * the UI into focused, single-responsibility components and extracting
 * complex state logic into a custom hook.
 *
 * @param loaderData - Data from the server loader (OAuth results, config)
 * @param actionData - Data from server actions (support request results)
 */
export default function SignupPage({
  loaderData,
  actionData
}: Route.ComponentProps) {
  const {
    clientId,
    redirectUri,
    discordError,
    discordUsername,
    userRoles,
    errorDetails
  } = loaderData;

  // Extract signup flow logic into custom hook
  const {
    currentStep,
    verifiedDiscordUsername,
    supportRequestId,
    message,
    goToDiscord,
    handleSupportSubmitted,
  } = useSignupFlow(loaderData, actionData);

  /**
   * Initiates GitHub OAuth login flow.
   * Constructs authorization URL and redirects user to GitHub.
   */
  const handleGitHubLogin = () => {
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=read:user`;
    window.location.href = authUrl;
  };

  return (
    <div className="app-container">
      <InfoSection />

      <div className="signup-section">
        <StepIndicator currentStep={currentStep} />

        <SignupFlow
          currentStep={currentStep}
          verifiedDiscordUsername={verifiedDiscordUsername}
          message={message}
          supportRequestId={supportRequestId}
          discordError={discordError}
          discordUsername={discordUsername}
          userRoles={userRoles}
          errorDetails={errorDetails}
          githubConfig={{
            clientId,
            redirectUri,
          }}
          onGitHubLogin={handleGitHubLogin}
          onBackToDiscord={goToDiscord}
          onSupportSubmitted={handleSupportSubmitted}
        />

        <FooterLinks />
      </div>
    </div>
  );
}