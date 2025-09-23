import type { Route } from './+types/api.discord.debug-roles';

export async function loader({ request, context }: Route.LoaderArgs) {
  const env = context.cloudflare.env;
  const url = new URL(request.url);
  const userId = url.searchParams.get('user_id');
  
  if (!userId) {
    return new Response(JSON.stringify({ error: 'Missing user_id parameter' }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  try {
    // Get guild member using Bot Token
    const memberResponse = await fetch(
      `https://discord.com/api/v10/guilds/${env.DISCORD_GUILD_ID}/members/${userId}`,
      {
        headers: {
          'Authorization': `Bot ${env.DISCORD_BOT_TOKEN}`,
        },
      }
    );
    
    if (!memberResponse.ok) {
      return new Response(JSON.stringify({ error: 'User not found in guild' }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const memberData = await memberResponse.json();
    
    // Get guild roles to resolve names
    const rolesResponse = await fetch(
      `https://discord.com/api/v10/guilds/${env.DISCORD_GUILD_ID}/roles`,
      {
        headers: {
          'Authorization': `Bot ${env.DISCORD_BOT_TOKEN}`,
        },
      }
    );
    
    const allRoles = await rolesResponse.json();
    const roleMap = Object.fromEntries(allRoles.map((role: any) => [role.id, role.name]));
    
    const userRoleNames = memberData.roles.map((roleId: string) => ({
      id: roleId,
      name: roleMap[roleId] || 'Unknown Role'
    }));
    
    return new Response(JSON.stringify({
      user: memberData.user,
      roles: userRoleNames,
      hasVerifiedRole: memberData.roles.includes(env.DISCORD_VERIFIED_ROLE_ID),
      verifiedRoleId: env.DISCORD_VERIFIED_ROLE_ID,
      guildId: env.DISCORD_GUILD_ID
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export default function DiscordDebugRoles() {
  return null;
}