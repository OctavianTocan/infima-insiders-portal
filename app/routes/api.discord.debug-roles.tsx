import type { Route } from './+types/api.discord.debug-roles';
import type { MemberData, GuildRole } from '../types/discord';
import { isMemberData, isGuildRoleArray } from '../types/discord';
import { toDiscordRoleId } from '../types/branded';

export async function loader({ request, context }: Route.LoaderArgs) {
  const env = context.cloudflare.env;
  const verifiedRoleId = toDiscordRoleId(env.DISCORD_VERIFIED_ROLE_ID);
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


    const memberRaw = await memberResponse.json();
    if (!isMemberData(memberRaw)) {
      return new Response(JSON.stringify({ error: 'Invalid member data from Discord API' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    const memberData: MemberData = memberRaw;

    // Get guild roles to resolve names
    const rolesResponse = await fetch(
      `https://discord.com/api/v10/guilds/${env.DISCORD_GUILD_ID}/roles`,
      {
        headers: {
          'Authorization': `Bot ${env.DISCORD_BOT_TOKEN}`,
        },
      }
    );
    

    const rolesRaw = await rolesResponse.json();
    if (!isGuildRoleArray(rolesRaw)) {
      return new Response(JSON.stringify({ error: 'Invalid roles data from Discord API' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    const allRoles: GuildRole[] = rolesRaw;
    const roleMap = Object.fromEntries(allRoles.map((role) => [role.id, role.name]));
    
    const userRoleNames = memberData.roles.map((roleId: string) => ({
      id: roleId,
      name: roleMap[roleId] || 'Unknown Role'
    }));
    
    return new Response(JSON.stringify({
      user: memberData.user,
      roles: userRoleNames,
      hasVerifiedRole: memberData.roles.includes(verifiedRoleId),
      verifiedRoleId,
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