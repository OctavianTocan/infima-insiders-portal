// Discord types and type guards for use across routes and utilities

export interface MemberData {
  roles: string[];
  user: {
    id: string;
  };
}

export interface GuildRole {
  id: string;
  name: string;
}

export function isMemberData(obj: unknown): obj is MemberData {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    Array.isArray((obj as any).roles) &&
    typeof (obj as any).user === 'object' &&
    (obj as any).user !== null &&
    typeof (obj as any).user.id === 'string'
  );
}

export function isGuildRoleArray(obj: unknown): obj is GuildRole[] {
  return (
    Array.isArray(obj) &&
    obj.every(
      (role) =>
        typeof role === 'object' &&
        role !== null &&
        typeof role.id === 'string' &&
        typeof role.name === 'string'
    )
  );
}
