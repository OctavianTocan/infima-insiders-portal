import { redirect } from 'react-router';
import type { Route } from './+types/api.discord.callback';

export async function loader({ request, context }: Route.LoaderArgs) {
  const env = context.cloudflare.env;
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  
  if (!code) {
    return redirect('/signup?discord_error=no_code');
  }
  
  try {
    // 1. Exchange code for access token
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
    
    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    
    // 2. Get user information
    const userResponse = await fetch('https://discord.com/api/v10/users/@me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    const userData = await userResponse.json();
    const discordId = userData.id;
    const discordUsername = userData.username;
    const discordDisplayName = userData.global_name || userData.username;
    
    // 3. Get user's guild member info with roles
    const memberResponse = await fetch(
      `https://discord.com/api/v10/users/@me/guilds/${env.DISCORD_GUILD_ID}/member`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );
    
    if (!memberResponse.ok) {
      // User is not a member of the guild
      return redirect(`/signup?discord_error=not_member&discord_username=${encodeURIComponent(discordUsername)}&discord_id=${discordId}`);
    }
    
    const memberData = await memberResponse.json();
    const userRoles = memberData.roles; // Array of role IDs
    
    // 4. Check if user has the required verified role
    const hasVerifiedRole = userRoles.includes(env.DISCORD_VERIFIED_ROLE_ID);
    
    if (hasVerifiedRole) {
      // User is verified! Redirect to GitHub OAuth step
      return redirect(`/signup?discord_success=true&discord_username=${encodeURIComponent(discordUsername)}&discord_id=${discordId}&discord_display=${encodeURIComponent(discordDisplayName)}&discord_verified=true`);
    } else {
      // User is in server but doesn't have verified role
      return redirect(`/signup?discord_error=not_verified&discord_username=${encodeURIComponent(discordUsername)}&discord_id=${discordId}&user_roles=${encodeURIComponent(JSON.stringify(userRoles))}`);
    }
    
  } catch (error) {
    console.error('Discord OAuth error:', error);
    return redirect('/signup?discord_error=oauth_failed');
  }
}

export default function DiscordCallback() {
  return null;
}