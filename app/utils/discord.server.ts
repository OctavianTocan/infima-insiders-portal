/**
 * Discord OAuth utilities for handling authentication and verification.
 */

interface DiscordEnv {
  DISCORD_CLIENT_ID: string;
  DISCORD_CLIENT_SECRET: string;
  DISCORD_REDIRECT_URI: string;
  DISCORD_GUILD_ID: string;
  DISCORD_VERIFIED_ROLE_ID: string;
}

interface DiscordTokenResponse {
  access_token: string;
}

interface DiscordUser {
  id: string;
  username: string;
  global_name?: string;
}

interface DiscordMember {
  roles: string[];
  user: DiscordUser;
}

/**
 * Exchanges authorization code for access token.
 */
export async function exchangeDiscordCodeForToken(
  code: string,
  env: DiscordEnv
): Promise<string> {
  const tokenResponse = await fetch('https://discord.com/api/v10/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: env.DISCORD_CLIENT_ID,
      client_secret: env.DISCORD_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: env.DISCORD_REDIRECT_URI,
    }),
  });

  const tokenData: DiscordTokenResponse = await tokenResponse.json();
  const accessToken = tokenData.access_token;

  if (!accessToken) {
    throw new Error('Failed to obtain access token from Discord');
  }

  return accessToken;
}

/**
 * Fetches Discord user information.
 */
export async function fetchDiscordUser(accessToken: string): Promise<DiscordUser> {
  const userResponse = await fetch('https://discord.com/api/v10/users/@me', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  const userData: DiscordUser = await userResponse.json();

  if (!userData.id || !userData.username) {
    throw new Error('Failed to fetch user data from Discord');
  }

  return userData;
}

/**
 * Fetches Discord guild member information.
 */
export async function fetchDiscordMember(
  userId: string,
  accessToken: string,
  env: DiscordEnv
): Promise<DiscordMember> {
  const memberResponse = await fetch(
    `https://discord.com/api/v10/users/@me/guilds/${env.DISCORD_GUILD_ID}/member`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  );

  if (!memberResponse.ok) {
    throw new Error('User is not a member of the guild');
  }

  const memberData: DiscordMember = await memberResponse.json();
  return memberData;
}

/**
 * Checks if user has the verified role.
 */
export function hasVerifiedRole(member: DiscordMember, env: DiscordEnv): boolean {
  return member.roles.includes(env.DISCORD_VERIFIED_ROLE_ID);
}