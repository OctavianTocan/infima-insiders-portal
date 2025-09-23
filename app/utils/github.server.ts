/**
 * GitHub OAuth utilities for handling authentication and repository access.
 */

interface GitHubEnv {
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  GITHUB_PAT: string;
  GITHUB_REPO_OWNER: string;
  GITHUB_REPO_NAME: string;
  WEBHOOK_URL?: string;
  FRONTEND_URL?: string;
}

interface GitHubTokenResponse {
  access_token: string;
}

interface GitHubUser {
  login: string;
}

interface CollaboratorStatus {
  isCollaborator: boolean;
  hasPendingInvitation: boolean;
}

/**
 * Exchanges authorization code for access token.
 */
export async function exchangeCodeForToken(
  code: string,
  env: GitHubEnv
): Promise<string> {
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

  const tokenData: GitHubTokenResponse = await tokenResponse.json();
  const accessToken = tokenData.access_token;

  if (!accessToken) {
    throw new Error('Failed to obtain access token');
  }

  return accessToken;
}

/**
 * Fetches GitHub user information using access token.
 */
export async function fetchGitHubUser(accessToken: string): Promise<string> {
  const userResponse = await fetch('https://api.github.com/user', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/vnd.github.v3+json',
    },
  });

  const userData: GitHubUser = await userResponse.json();
  const username = userData.login;

  if (!username) {
    throw new Error('Failed to fetch username from GitHub API');
  }

  return username;
}

/**
 * Adds user as repository collaborator.
 */
export async function addCollaborator(
  username: string,
  env: GitHubEnv
): Promise<{ status: number; invitationStatus: string }> {
  const addCollaboratorResponse = await fetch(
    `https://api.github.com/repos/${env.GITHUB_REPO_OWNER}/${env.GITHUB_REPO_NAME}/collaborators/${username}`,
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
    return { status: 201, invitationStatus: 'new' };
  } else if (addCollaboratorResponse.status === 204) {
    return { status: 204, invitationStatus: 'existing' };
  } else if (addCollaboratorResponse.status === 422) {
    return { status: 422, invitationStatus: 'pending' };
  } else {
    const errorData = await addCollaboratorResponse.text();
    throw new Error(`GitHub API error: ${addCollaboratorResponse.status} - ${errorData}`);
  }
}

/**
 * Checks collaborator and invitation status.
 */
export async function checkCollaboratorStatus(
  username: string,
  env: GitHubEnv
): Promise<CollaboratorStatus> {
  let isCollaborator = false;
  try {
    const collaboratorResponse = await fetch(
      `https://api.github.com/repos/${env.GITHUB_REPO_OWNER}/${env.GITHUB_REPO_NAME}/collaborators/${username}`,
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

  let hasPendingInvitation = false;
  try {
    const invitationsResponse = await fetch(
      `https://api.github.com/repos/${env.GITHUB_REPO_OWNER}/${env.GITHUB_REPO_NAME}/invitations`,
      {
        headers: {
          'Authorization': `Bearer ${env.GITHUB_PAT}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    );
    const invitationsData = await invitationsResponse.json() as { invitee: { login: string } }[];
    hasPendingInvitation = invitationsData.some((inv) => inv.invitee.login === username);
  } catch (error) {
    console.error('Error checking invitations:', error);
  }

  return { isCollaborator, hasPendingInvitation };
}

/**
 * Sends webhook notification.
 */
export async function sendWebhookNotification(
  env: GitHubEnv,
  data: {
    event: string;
    username: string;
    status: string;
    message: string;
    metadata?: any;
  }
): Promise<void> {
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