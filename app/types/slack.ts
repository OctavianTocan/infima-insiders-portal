// Slack API response types

export interface SlackConversationOpenResponse {
  ok: boolean;
  channel: { id: string };
  error?: string;
}

export interface SlackMessagePostResponse {
  ok: boolean;
  error?: string;
}

export interface GitHubInvitation {
  invitee: { login: string };
}
