import { redirect } from 'react-router';
import type { Route } from './+types/api.discord.callback';
import { exchangeDiscordCodeForToken, fetchDiscordUser, fetchDiscordMember, hasVerifiedRole } from '~/utils/discord.server';

export async function loader({ request, context }: Route.LoaderArgs) {
  const env = context.cloudflare.env as any;
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  
  if (!code) {
    return redirect('/signup?discord_error=no_code');
  }
  
  try {
    // 1. Exchange code for access token
    const accessToken = await exchangeDiscordCodeForToken(code, env);
    
    // 2. Get user information
    const userData = await fetchDiscordUser(accessToken);
    const discordId = userData.id;
    const discordUsername = userData.username;
    const discordDisplayName = userData.global_name || userData.username;
    
    // 3. Get user's guild member info with roles
    const memberData = await fetchDiscordMember(discordId, accessToken, env);
    
    // 4. Check if user has the required verified role
    const isVerified = hasVerifiedRole(memberData, env);
    
    if (isVerified) {
      // User is verified! Redirect to GitHub OAuth step
      return redirect(`/signup?discord_success=true&discord_username=${encodeURIComponent(discordUsername)}&discord_id=${discordId}&discord_display=${encodeURIComponent(discordDisplayName)}&discord_verified=true`);
    } else {
      // User is in server but doesn't have verified role
      return redirect(`/signup?discord_error=not_verified&discord_username=${encodeURIComponent(discordUsername)}&discord_id=${discordId}&user_roles=${encodeURIComponent(JSON.stringify(memberData.roles))}`);
    }
    
  } catch (error) {
    console.error('Discord OAuth error:', error);
    return redirect('/signup?discord_error=oauth_failed&error_details=' + encodeURIComponent((error as Error).message));
  }
}

export default function DiscordCallback() {
  return null;
}