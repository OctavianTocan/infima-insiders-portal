import type { Route } from './+types/api.github.callback';
import { redirect } from 'react-router';
import {
  exchangeCodeForToken,
  fetchGitHubUser,
  addCollaborator,
  checkCollaboratorStatus,
  sendWebhookNotification,
} from '~/utils/github.server';

// SERVER-SIDE LOADER (handles GitHub OAuth callback - your backend logic)
export async function loader({ request, context }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const env = context.cloudflare.env as any;
  
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
    const accessToken = await exchangeCodeForToken(code, env);
    
    // Fetch user details
    username = await fetchGitHubUser(accessToken);
    
    // Add user as collaborator using PAT
    let invitationStatus = '';
    
    try {
      const result = await addCollaborator(username, env);
      
      if (result.status === 201) {
        await sendWebhookNotification(env, {
          event: 'user_invited',
          username: username,
          status: 'success',
          message: `Successfully invited ${username} to repository`,
          metadata: { invitationType: result.invitationStatus },
        });
        // Redirect to GitHub invitations page
        return redirect(`https://github.com/${env.GITHUB_REPO_OWNER}/${env.GITHUB_REPO_NAME}/invitations`);
      } else if (result.status === 204) {
        invitationStatus = 'The user is already a collaborator';
        await sendWebhookNotification(env, {
          event: 'user_already_collaborator',
          username: username,
          status: 'info',
          message: `${username} is already a collaborator`,
          metadata: { invitationType: result.invitationStatus },
        });
      } else if (result.status === 422) {
        invitationStatus = 'The user is already invited or a collaborator';
        await sendWebhookNotification(env, {
          event: 'user_already_invited',
          username: username,
          status: 'info',
          message: `${username} already has a pending invitation`,
          metadata: { invitationType: result.invitationStatus },
        });
      }
    } catch (error) {
      await sendWebhookNotification(env, {
        event: 'invitation_failed',
        username: username,
        status: 'error',
        message: `Failed to invite ${username}: ${(error as Error).message}`,
        metadata: { error: (error as Error).message },
      });
      throw error;
    }
    
    // Verify collaborator status
    const { isCollaborator, hasPendingInvitation } = await checkCollaboratorStatus(username, env);
    
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
      message: `OAuth process failed: ${(error as Error).message}`,
      metadata: { error: (error as Error).message },
    });
    
    const frontendUrl = env.FRONTEND_URL || url.origin;
    const redirectUrl = new URL('/signup', frontendUrl);
    redirectUrl.searchParams.set('error', 'OAuth process failed');
    redirectUrl.searchParams.set('error_details', (error as Error).message);
    
    return redirect(redirectUrl.toString());
  }
}

// This route doesn't render anything, it just handles the redirect
export default function GitHubCallback() {
  return null;
}