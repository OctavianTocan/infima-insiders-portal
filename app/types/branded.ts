// --- BRANDED TYPES --- //
// Purpose: Prevent accidental mixing of string values that represent different domains
// WHY: Using branded types prevents bugs where user IDs could be confused with access tokens

/**
 * Branded type for Discord user IDs
 * Prevents mixing Discord IDs with other string values
 */
export type DiscordUserId = string & { readonly __brand: "DiscordUserId" };

/**
 * Branded type for GitHub usernames
 * Ensures GitHub usernames are treated distinctly from other strings
 */
export type GitHubUsername = string & { readonly __brand: "GitHubUsername" };

/**
 * Branded type for access tokens
 * Prevents accidental logging or misuse of sensitive tokens
 */
export type AccessToken = string & { readonly __brand: "AccessToken" };

/**
 * Branded type for Discord guild IDs
 * Distinguishes guild IDs from user IDs and other identifiers
 */
export type DiscordGuildId = string & { readonly __brand: "DiscordGuildId" };

/**
 * Branded type for Discord role IDs
 * Prevents confusion between role IDs and user/guild IDs
 */
export type DiscordRoleId = string & { readonly __brand: "DiscordRoleId" };

// --- BRAND CONSTRUCTORS --- //
// WHY: These functions provide safe ways to create branded types from raw strings
// They serve as the single source of truth for validation and conversion

/**
 * Creates a branded Discord user ID from a string
 * @param id - Raw string ID from Discord API
 * @returns Branded Discord user ID
 */
export function toDiscordUserId(id: string): DiscordUserId {
  return id as DiscordUserId;
}

/**
 * Creates a branded GitHub username from a string
 * @param username - Raw username string from GitHub API
 * @returns Branded GitHub username
 */
export function toGitHubUsername(username: string): GitHubUsername {
  return username as GitHubUsername;
}

/**
 * Creates a branded access token from a string
 * @param token - Raw access token string
 * @returns Branded access token
 */
export function toAccessToken(token: string): AccessToken {
  return token as AccessToken;
}

/**
 * Creates a branded Discord guild ID from a string
 * @param id - Raw string ID from Discord API
 * @returns Branded Discord guild ID
 */
export function toDiscordGuildId(id: string): DiscordGuildId {
  return id as DiscordGuildId;
}

/**
 * Creates a branded Discord role ID from a string
 * @param id - Raw string ID from Discord API
 * @returns Branded Discord role ID
 */
export function toDiscordRoleId(id: string): DiscordRoleId {
  return id as DiscordRoleId;
}
