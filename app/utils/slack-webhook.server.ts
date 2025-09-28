// --- SLACK WEBHOOK INTEGRATION --- //
/**
 * Slack webhook utilities for sending notifications and support requests
 *
 * This module provides robust webhook functionality for sending formatted
 * notifications to Slack channels. It includes retry logic, error handling,
 * and proper payload formatting for different notification types.
 *
 * @module slackWebhook
 */

// --- WEBHOOK TYPES --- //

/**
 * Base Slack webhook payload structure
 *
 * @interface SlackWebhookPayload
 */
export interface SlackWebhookPayload {
  /** Main message text */
  text: string;
  /** Optional channel to post to (overrides webhook default) */
  channel?: string;
  /** Username to display as sender */
  username?: string;
  /** Emoji icon for the message */
  icon_emoji?: string;
  /** Rich attachments with formatted content */
  attachments?: SlackAttachment[];
}

/**
 * Slack message attachment for rich formatting
 *
 * @interface SlackAttachment
 */
export interface SlackAttachment {
  /** Color bar for the attachment (good, warning, danger, or hex) */
  color: "good" | "warning" | "danger" | string;
  /** Optional title for the attachment */
  title?: string;
  /** Optional title link */
  title_link?: string;
  /** Main attachment text */
  text?: string;
  /** Structured fields for key-value data */
  fields?: SlackField[];
  /** Footer text */
  footer?: string;
  /** Timestamp for the message */
  ts?: number;
}

/**
 * Slack attachment field for structured data
 *
 * @interface SlackField
 */
export interface SlackField {
  /** Field title/label */
  title: string;
  /** Field value/content */
  value: string;
  /** Whether field should be displayed in short format (side-by-side) */
  short?: boolean;
}

// --- WEBHOOK FUNCTIONS --- //

/**
 * Sends a formatted notification to Slack webhook
 *
 * Handles support requests, user signups, errors, and other notifications
 * with proper formatting, retry logic, and error handling. Includes
 * exponential backoff for transient failures.
 *
 * @param webhookUrl - Slack webhook URL from environment variables
 * @param payload - Message payload to send
 * @returns Promise resolving when message is sent successfully
 * @throws Error if all retry attempts fail
 *
 * @example
 * ```typescript
 * // Send support request notification
 * await sendSlackWebhook(env.SLACK_WEBHOOK_URL, {
 *   text: '🆘 New support request received',
 *   attachments: [{
 *     color: 'warning',
 *     fields: [
 *       { title: 'User', value: username, short: true },
 *       { title: 'Issue', value: supportMessage, short: false }
 *     ]
 *   }]
 * });
 *
 * // Send simple notification
 * await sendSlackWebhook(env.SLACK_WEBHOOK_URL, {
 *   text: '✅ User signup completed successfully',
 *   username: 'Signup Bot',
 *   icon_emoji: ':white_check_mark:'
 * });
 * ```
 */
export async function sendSlackWebhook(
  webhookUrl: string,
  payload: SlackWebhookPayload
): Promise<void> {
  // WHY: Validate webhook URL to prevent runtime errors and security issues
  if (!webhookUrl || !webhookUrl.startsWith("https://hooks.slack.com/")) {
    throw new Error(
      "Invalid Slack webhook URL - must be a valid Slack webhook endpoint"
    );
  }

  // WHY: Validate payload to ensure required fields are present
  if (!payload.text?.trim()) {
    throw new Error("Slack webhook payload must include non-empty text field");
  }

  // WHY: Add retry logic with exponential backoff for transient network failures
  const maxRetries = 3;
  const baseDelay = 1000; // 1 second
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Infima-Games-Signup-Bot/1.0",
        },
        body: JSON.stringify(payload),
      });

      // WHY: Check for various Slack API error responses
      if (!response.ok) {
        const responseText = await response.text();
        throw new Error(
          `Slack webhook failed: ${response.status} ${response.statusText} - ${responseText}`
        );
      }

      // WHY: Log successful webhook for debugging and monitoring
      console.log(`Slack webhook sent successfully on attempt ${attempt}`, {
        text:
          payload.text.substring(0, 50) +
          (payload.text.length > 50 ? "..." : ""),
        timestamp: new Date().toISOString(),
      });

      return; // Success - exit retry loop
    } catch (error) {
      lastError = error as Error;

      // WHY: Don't retry on client errors (4xx) - these won't succeed
      if (error instanceof Error && error.message.includes("400")) {
        console.error(
          "Slack webhook client error (not retrying):",
          error.message
        );
        throw error;
      }

      // WHY: Exponential backoff for retry attempts (1s, 2s, 4s)
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt - 1);
        console.warn(
          `Slack webhook attempt ${attempt} failed, retrying in ${delay}ms:`,
          error instanceof Error ? error.message : "Unknown error"
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  // WHY: Log final failure for monitoring and alerting
  console.error("All Slack webhook attempts failed:", lastError?.message);
  throw lastError || new Error("Unknown error sending Slack webhook");
}

// --- PAYLOAD BUILDERS --- //

/**
 * Creates a formatted support request payload for Slack
 *
 * Generates a rich, well-formatted Slack message for support requests
 * with all relevant user and error information.
 *
 * @param supportData - Support request information
 * @returns Formatted Slack webhook payload
 *
 * @example
 * ```typescript
 * const payload = createSupportRequestPayload({
 *   requestId: 'req_123456',
 *   username: 'john_doe',
 *   discordId: '123456789012345678',
 *   message: 'Unable to verify Discord membership',
 *   errorType: 'DISCORD_NOT_MEMBER',
 *   timestamp: new Date()
 * });
 *
 * await sendSlackWebhook(env.SLACK_WEBHOOK_URL, payload);
 * ```
 */
export function createSupportRequestPayload(supportData: {
  requestId: string;
  username: string;
  discordId?: string;
  message: string;
  errorType?: string;
  errorDetails?: string;
  timestamp: Date;
}): SlackWebhookPayload {
  return {
    text: "🆘 New Support Request Submitted",
    username: "Support Bot",
    icon_emoji: ":sos:",
    attachments: [
      {
        color: "warning",
        title: `Support Request: ${supportData.requestId}`,
        fields: [
          {
            title: "Request ID",
            value: `\`${supportData.requestId}\``,
            short: true,
          },
          {
            title: "Username",
            value: supportData.username,
            short: true,
          },
          {
            title: "Discord ID",
            value: supportData.discordId || "Not provided",
            short: true,
          },
          {
            title: "Error Type",
            value: supportData.errorType || "General Issue",
            short: true,
          },
          {
            title: "User Message",
            value: supportData.message,
            short: false,
          },
          ...(supportData.errorDetails
            ? [
                {
                  title: "Technical Details",
                  value: `\`\`\`${supportData.errorDetails}\`\`\``,
                  short: false,
                },
              ]
            : []),
          {
            title: "Submitted At",
            value: supportData.timestamp.toLocaleString("en-US", {
              timeZone: "UTC",
              dateStyle: "full",
              timeStyle: "long",
            }),
            short: false,
          },
        ],
        footer: "Infima Games Signup System",
        ts: Math.floor(supportData.timestamp.getTime() / 1000),
      },
    ],
  };
}

/**
 * Creates a user signup notification payload for Slack
 *
 * @param signupData - User signup information
 * @returns Formatted Slack webhook payload
 */
export function createSignupNotificationPayload(signupData: {
  username: string;
  discordUsername?: string;
  githubUsername?: string;
  status: "success" | "partial" | "failed";
  timestamp: Date;
}): SlackWebhookPayload {
  const statusEmoji = {
    success: ":white_check_mark:",
    partial: ":warning:",
    failed: ":x:",
  }[signupData.status];

  const statusColor = {
    success: "good",
    partial: "warning",
    failed: "danger",
  }[signupData.status] as "good" | "warning" | "danger";

  return {
    text: `${statusEmoji} User Signup ${signupData.status.charAt(0).toUpperCase() + signupData.status.slice(1)}`,
    username: "Signup Bot",
    icon_emoji: statusEmoji,
    attachments: [
      {
        color: statusColor,
        fields: [
          {
            title: "Username",
            value: signupData.username,
            short: true,
          },
          {
            title: "Discord",
            value: signupData.discordUsername || "Not connected",
            short: true,
          },
          {
            title: "GitHub",
            value: signupData.githubUsername || "Not connected",
            short: true,
          },
          {
            title: "Status",
            value: signupData.status.toUpperCase(),
            short: true,
          },
          {
            title: "Completed At",
            value: signupData.timestamp.toLocaleString("en-US", {
              timeZone: "UTC",
              dateStyle: "medium",
              timeStyle: "short",
            }),
            short: false,
          },
        ],
        footer: "Infima Games Signup System",
        ts: Math.floor(signupData.timestamp.getTime() / 1000),
      },
    ],
  };
}

/**
 * Creates an error notification payload for Slack
 *
 * @param errorData - Error information
 * @returns Formatted Slack webhook payload
 */
export function createErrorNotificationPayload(errorData: {
  error: string;
  context?: string;
  userId?: string;
  stackTrace?: string;
  timestamp: Date;
}): SlackWebhookPayload {
  return {
    text: ":rotating_light: Application Error Detected",
    username: "Error Bot",
    icon_emoji: ":rotating_light:",
    attachments: [
      {
        color: "danger",
        title: "Error Details",
        fields: [
          {
            title: "Error Message",
            value: errorData.error,
            short: false,
          },
          ...(errorData.context
            ? [
                {
                  title: "Context",
                  value: errorData.context,
                  short: true,
                },
              ]
            : []),
          ...(errorData.userId
            ? [
                {
                  title: "User ID",
                  value: errorData.userId,
                  short: true,
                },
              ]
            : []),
          ...(errorData.stackTrace
            ? [
                {
                  title: "Stack Trace",
                  value: `\`\`\`${errorData.stackTrace.substring(0, 1000)}\`\`\``,
                  short: false,
                },
              ]
            : []),
          {
            title: "Occurred At",
            value: errorData.timestamp.toISOString(),
            short: true,
          },
        ],
        footer: "Infima Games Signup System",
        ts: Math.floor(errorData.timestamp.getTime() / 1000),
      },
    ],
  };
}
