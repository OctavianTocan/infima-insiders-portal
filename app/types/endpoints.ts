// --- API ENDPOINT TYPES --- //
// Purpose: Type-safe API endpoint definitions using template literal types
// WHY: Prevents typos in API URLs and enables autocomplete for endpoint construction

/**
 * Discord API base URL pattern
 */
type DiscordAPIBase = "https://discord.com/api/v10";

/**
 * GitHub API base URL pattern
 */
type GitHubAPIBase = "https://api.github.com";

/**
 * Slack API base URL pattern
 */
type SlackAPIBase = "https://slack.com/api";

// --- DISCORD ENDPOINTS --- //

/**
 * Discord OAuth2 endpoints
 */
export type DiscordOAuthEndpoint =
  | `${DiscordAPIBase}/oauth2/token`
  | "https://discord.com/oauth2/authorize";

/**
 * Discord user endpoints
 */
export type DiscordUserEndpoint =
  | `${DiscordAPIBase}/users/@me`
  | `${DiscordAPIBase}/users/@me/guilds/${string}/member`;

// --- GITHUB ENDPOINTS --- //

/**
 * GitHub OAuth endpoints
 */
export type GitHubOAuthEndpoint =
  | "https://github.com/login/oauth/access_token"
  | "https://api.github.com/user";

/**
 * GitHub repository endpoints
 * Template literal type ensures repo owner and name are included
 */
export type GitHubRepoEndpoint<
  Owner extends string = string,
  Repo extends string = string,
> =
  | `${GitHubAPIBase}/repos/${Owner}/${Repo}/collaborators/${string}`
  | `${GitHubAPIBase}/repos/${Owner}/${Repo}/invitations`;

// --- SLACK ENDPOINTS --- //

/**
 * Slack API endpoints
 */
export type SlackAPIEndpoint =
  | `${SlackAPIBase}/conversations.open`
  | `${SlackAPIBase}/chat.postMessage`;

// --- HTTP METHODS --- //
// WHY: Constrains HTTP methods to only valid ones, prevents typos

/**
 * Valid HTTP methods for API calls
 */
export type HTTPMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

/**
 * API route definition combining method and endpoint
 */
export type APIRoute<
  Method extends HTTPMethod = HTTPMethod,
  Endpoint extends string = string,
> = `${Method} ${Endpoint}`;

// --- ROUTE HELPERS --- //
// WHY: Helper functions provide type-safe ways to construct API URLs

/**
 * Constructs a GitHub repository collaborator endpoint
 * @param owner - Repository owner
 * @param repo - Repository name
 * @param username - GitHub username to add as collaborator
 * @returns Type-safe GitHub API endpoint
 */
export function buildGitHubCollaboratorEndpoint(
  owner: string,
  repo: string,
  username: string
): GitHubRepoEndpoint {
  return `https://api.github.com/repos/${owner}/${repo}/collaborators/${username}` as GitHubRepoEndpoint;
}

/**
 * Constructs a Discord guild member endpoint
 * @param guildId - Discord guild ID
 * @returns Type-safe Discord API endpoint
 */
export function buildDiscordGuildMemberEndpoint(
  guildId: string
): DiscordUserEndpoint {
  return `https://discord.com/api/v10/users/@me/guilds/${guildId}/member` as DiscordUserEndpoint;
}
