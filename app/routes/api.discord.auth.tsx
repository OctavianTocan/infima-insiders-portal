import { redirect } from 'react-router';
import type { Route } from './+types/api.discord.auth';

export async function loader({ context }: Route.LoaderArgs) {
  const env = context.cloudflare.env;
  
  const state = crypto.randomUUID();
  
  const discordAuthUrl = new URL('https://discord.com/oauth2/authorize');
  discordAuthUrl.searchParams.set('client_id', env.DISCORD_CLIENT_ID);
  discordAuthUrl.searchParams.set('redirect_uri', env.DISCORD_REDIRECT_URI);
  discordAuthUrl.searchParams.set('response_type', 'code');
  discordAuthUrl.searchParams.set('scope', 'identify guilds.members.read');
  discordAuthUrl.searchParams.set('state', state);
  
  return redirect(discordAuthUrl.toString());
}

export default function DiscordAuth() {
  return null; // This route only redirects
}