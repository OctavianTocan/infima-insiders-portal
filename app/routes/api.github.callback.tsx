import type { Route } from './+types/api.github.callback';
import { redirect } from 'react-router';

// SERVER-SIDE LOADER (handles GitHub OAuth callback - your backend logic)
export async function loader({ request, context }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const env = context.cloudflare.env;
  
  console.log('OAuth callback received with code:', code);
  
  let username = 'unknown';
  
  try {
    // Validate required environment variables
    if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET || !env.GITHUB_PAT) {
      throw new Error('Missing required GitHub environment variables');
    }
    
    if (!code) {
      throw new Error('No authorization code received from GitHub');
    }
    
    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });
    
    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    
    if (!accessToken) {
      await sendWebhookNotification(env, {
        event: 'authentication_failed',
        username: 'unknown',
        status: 'error',
        message: 'Failed to obtain access token from GitHub',
      });
      throw new Error('Failed to obtain access token');
    }
    
    // Fetch user details
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });
    
    const userData = await userResponse.json();
    username = userData.login;
    
    if (!username) {
      await sendWebhookNotification(env, {
        event: 'authentication_failed',
        username: 'unknown',
        status: 'error',
        message: 'Failed to fetch username from GitHub API',
      });
      throw new Error('Failed to fetch username');
    }
    
    // Add user as collaborator using PAT
    let invitationStatus = '';
    const repoOwner = env.GITHUB_REPO_OWNER;
    const repoName = env.GITHUB_REPO_NAME;
    
    try {
      const addCollaboratorResponse = await fetch(
        `https://api.github.com/repos/${repoOwner}/${repoName}/collaborators/${username}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${env.GITHUB_PAT}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ permission: 'pull' }),
        }
      );
      
      if (addCollaboratorResponse.status === 201) {
        await sendWebhookNotification(env, {
          event: 'user_invited',
          username: username,
          status: 'success',
          message: `Successfully invited ${username} to repository`,
          metadata: { invitationType: 'new' },
        });
        // Redirect to GitHub invitations page
        return redirect(`https://github.com/${repoOwner}/${repoName}/invitations`);
      } else if (addCollaboratorResponse.status === 204) {
        invitationStatus = 'The user is already a collaborator';
        await sendWebhookNotification(env, {
          event: 'user_already_collaborator',
          username: username,
          status: 'info',
          message: `${username} is already a collaborator`,
          metadata: { invitationType: 'existing' },
        });
      } else if (addCollaboratorResponse.status === 422) {
        invitationStatus = 'The user is already invited or a collaborator';
        await sendWebhookNotification(env, {
          event: 'user_already_invited',
          username: username,
          status: 'info',
          message: `${username} already has a pending invitation`,
          metadata: { invitationType: 'pending' },
        });
      } else {
        const errorData = await addCollaboratorResponse.text();
        throw new Error(`GitHub API error: ${addCollaboratorResponse.status} - ${errorData}`);
      }
    } catch (error) {
      await sendWebhookNotification(env, {
        event: 'invitation_failed',
        username: username,
        status: 'error',
        message: `Failed to invite ${username}: ${error.message}`,
        metadata: { error: error.message },
      });
      throw error;
    }
    
    // Verify collaborator status
    let isCollaborator = false;
    try {
      const collaboratorResponse = await fetch(
        `https://api.github.com/repos/${repoOwner}/${repoName}/collaborators/${username}`,
        {
          headers: {
            'Authorization': `Bearer ${env.GITHUB_PAT}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        }
      );
      isCollaborator = collaboratorResponse.status === 204;
    } catch (error) {
      console.error('Error checking collaborator:', error);
    }
    
    // Check pending invitations
    let hasPendingInvitation = false;
    try {
      const invitationsResponse = await fetch(
        `https://api.github.com/repos/${repoOwner}/${repoName}/invitations`,
        {
          headers: {
            'Authorization': `Bearer ${env.GITHUB_PAT}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        }
      );
      const invitationsData = await invitationsResponse.json();
      hasPendingInvitation = invitationsData.some((inv: any) => inv.invitee.login === username);
    } catch (error) {
      console.error('Error checking invitations:', error);
    }
    
    // Send final webhook notification
    await sendWebhookNotification(env, {
      event: 'authentication_completed',
      username: username,
      status: 'completed',
      message: `Authentication flow completed for ${username}`,
      metadata: {
        invitationStatus,
        isCollaborator,
        hasPendingInvitation,
        finalStatus: isCollaborator
          ? 'collaborator'
          : hasPendingInvitation
            ? 'pending_invitation'
            : 'already_invited',
      },
    });
    
    // Redirect back to signup page with status
    const frontendUrl = env.FRONTEND_URL || url.origin;
    const redirectUrl = new URL('/signup', frontendUrl);
    redirectUrl.searchParams.set('username', username);
    redirectUrl.searchParams.set('status', invitationStatus);
    redirectUrl.searchParams.set('isCollaborator', isCollaborator.toString());
    redirectUrl.searchParams.set('hasPendingInvitation', hasPendingInvitation.toString());
    
    return redirect(redirectUrl.toString());
    
  } catch (error) {
    console.error('Error during OAuth process:', error);
    await sendWebhookNotification(env, {
      event: 'authentication_failed',
      username: username || 'unknown',
      status: 'error',
      message: `OAuth process failed: ${error.message}`,
      metadata: { error: error.message },
    });
    
    const frontendUrl = env.FRONTEND_URL || url.origin;
    const redirectUrl = new URL('/signup', frontendUrl);
    redirectUrl.searchParams.set('error', 'OAuth process failed');
    
    return redirect(redirectUrl.toString());
  }
}

// Helper function to send webhook notifications (migrated from your backend)
async function sendWebhookNotification(env: any, data: any) {
  if (!env.WEBHOOK_URL) return;
  
  try {
    const payload = {
      timestamp: new Date().toISOString(),
      event: data.event,
      username: data.username,
      repository: `${env.GITHUB_REPO_OWNER}/${env.GITHUB_REPO_NAME}`,
      status: data.status,
      message: data.message,
      metadata: data.metadata || {},
    };
    
    await fetch(env.WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    console.log('Webhook notification sent successfully');
  } catch (error) {
    console.error('Failed to send webhook notification:', error);
  }
}

// This route doesn't render anything, it just handles the redirect
export default function GitHubCallback() {
  return null;
}