// --- DISCORD TYPES --- //
// Purpose: Discord API response types and type guards for use across routes and utilities
// WHY: Centralizes Discord-specific types to ensure consistency and type safety

import type { DiscordUserId, DiscordRoleId } from "./branded";

/**
 * Discord member data from guild member API response
 *
 * @interface MemberData
 * @property roles - Array of role IDs that the user has in the guild
 * @property user - Basic user information from Discord
 *
 * @example
 * ```typescript
 * const member: MemberData = {
 *   roles: ["123456789", "987654321"],
 *   user: { id: "111111111" }
 * };
 * ```
 */
export interface MemberData {
  /** Array of Discord role IDs assigned to this member */
  roles: DiscordRoleId[];
  /** Basic user information */
  user: {
    /** Unique Discord user ID */
    id: DiscordUserId;
  };
}

/**
 * Discord guild role information
 *
 * @interface GuildRole
 * @property id - Unique role identifier
 * @property name - Human-readable role name
 *
 * @example
 * ```typescript
 * const role: GuildRole = {
 *   id: "123456789",
 *   name: "Verified Member"
 * };
 * ```
 */
export interface GuildRole {
  /** Unique Discord role ID */
  id: DiscordRoleId;
  /** Display name of the role */
  name: string;
}

// --- TYPE GUARDS --- //
// WHY: Type guards provide runtime type validation and TypeScript type narrowing
// This is essential when dealing with API responses that could have unexpected shapes

/**
 * Type guard to validate Discord member data structure
 *
 * Ensures the object matches the expected MemberData interface structure
 * from Discord's guild member API endpoint.
 *
 * @param obj - Unknown object to validate
 * @returns True if object is valid MemberData
 *
 * @example
 * ```typescript
 * const apiResponse: unknown = await fetch(discordAPI).then(r => r.json());
 * if (isMemberData(apiResponse)) {
 *   // apiResponse is now typed as MemberData
 *   console.log(apiResponse.user.id);
 * }
 * ```
 */
export function isMemberData(obj: unknown): obj is MemberData {
  // WHY: First check if it's an object to avoid accessing properties on primitives
  if (typeof obj !== "object" || obj === null) return false;
  const candidate = obj as Record<string, unknown>;

  return (
    // WHY: Validate roles array exists and contains only strings (Discord IDs are strings)
    Array.isArray(candidate.roles) &&
    candidate.roles.every((role): role is string => typeof role === "string") &&
    // WHY: Validate user object structure matches Discord API response
    typeof candidate.user === "object" &&
    candidate.user !== null &&
    typeof (candidate.user as Record<string, unknown>).id === "string"
  );
}

/**
 * Type guard to validate array of Discord guild roles
 *
 * Validates that an unknown value is an array of GuildRole objects
 * with the expected structure from Discord's roles API.
 *
 * @param obj - Unknown object to validate
 * @returns True if object is valid GuildRole array
 *
 * @example
 * ```typescript
 * const rolesResponse: unknown = await fetchGuildRoles();
 * if (isGuildRoleArray(rolesResponse)) {
 *   // rolesResponse is now typed as GuildRole[]
 *   rolesResponse.forEach(role => console.log(role.name));
 * }
 * ```
 */
export function isGuildRoleArray(obj: unknown): obj is GuildRole[] {
  return (
    // WHY: First check if it's an array to use array methods safely
    Array.isArray(obj) &&
    // WHY: Validate each item in the array matches GuildRole structure
    obj.every(
      (role): role is GuildRole =>
        typeof role === "object" &&
        role !== null &&
        // WHY: Discord IDs are always strings, validate both required properties
        typeof (role as Record<string, unknown>).id === "string" &&
        typeof (role as Record<string, unknown>).name === "string"
    )
  );
}
