// --- DISCORD ERROR DISPLAY --- //
/**
 * Discord-specific error display component
 *
 * This component handles all Discord OAuth and verification errors with
 * contextual messaging and clear action paths. It integrates with the
 * consolidated error system while providing Discord-specific styling and actions.
 *
 * @module DiscordErrorDisplay
 */

import React from "react";
import type { BaseComponentProps } from "../types/react";
import { useDiscord } from "./DiscordContext";
import ErrorMessageDisplay from "./ErrorMessageDisplay";

// --- ERROR TYPES --- //

/**
 * Discord-specific error types
 */
export type DiscordErrorType =
  | "not_member"
  | "not_verified"
  | "oauth_failed"
  | "no_code"
  | "rate_limited"
  | "server_error"
  | "network_error";

const KNOWN_DISCORD_ERRORS: ReadonlySet<DiscordErrorType> = new Set([
  "not_member",
  "not_verified",
  "oauth_failed",
  "no_code",
  "rate_limited",
  "server_error",
  "network_error",
]);

/**
 * Discord user role information
 */
interface DiscordRole {
  /** Role ID (snowflake format) */
  id: string;
  /** Human-readable role name */
  name: string;
}

// --- COMPONENT PROPS --- //

/**
 * Props for the DiscordErrorDisplay component
 *
 * @interface DiscordErrorDisplayProps
 * @extends BaseComponentProps
 */
interface DiscordErrorDisplayProps extends BaseComponentProps {
  /** Specific Discord error type */
  error?: DiscordErrorType | string;
  /** Discord username for personalized messages */
  username?: string | null;
  /** User's current roles in the Discord server */
  userRoles?: DiscordRole[];
  /** Additional error details from Discord API */
  errorDetails?: string | null;
  /** Discord server invite link (overrides context default) */
  discordInviteLink?: string;
  /** Whether the error can be dismissed */
  dismissible?: boolean;
  /** Callback to dismiss the error */
  onDismiss?: () => void;
  /** Callback to retry the Discord authentication */
  onRetry?: () => void;
}

/**
 * Error message configuration
 */
interface ErrorConfig {
  title: string;
  message: string;
  action: string;
  actionUrl?: string;
  actionText?: string;
  severity: "info" | "warning" | "error";
  canRetry: boolean;
  details?: string;
}

// --- MAIN COMPONENT --- //

/**
 * Discord error display component with contextual messaging
 *
 * Displays Discord-specific errors with personalized messages, clear action paths,
 * and appropriate styling. Integrates with the consolidated error system while
 * providing Discord-specific functionality like server invite links.
 *
 * The component automatically determines the appropriate message, actions, and
 * styling based on the error type and available context (username, roles, etc.).
 *
 * @param props - Discord error display configuration
 * @returns JSX element showing the Discord error, or null if no error
 *
 * @example
 * ```tsx
 * // Basic error display
 * <DiscordErrorDisplay
 *   error="not_member"
 *   username="john_doe"
 *   discordInviteLink="https://discord.gg/your-server"
 * />
 *
 * // Error with roles context
 * <DiscordErrorDisplay
 *   error="not_verified"
 *   username="jane_smith"
 *   userRoles={[{ id: "123", name: "Member" }]}
 *   onRetry={() => retryDiscordAuth()}
 * />
 * ```
 */
export default function DiscordErrorDisplay({
  error: propError,
  username: propUsername,
  userRoles: propUserRoles,
  errorDetails: propErrorDetails,
  discordInviteLink: propDiscordInviteLink,
  dismissible = true,
  onDismiss,
  onRetry,
  className = "",
  "data-testid": testId = "discord-error-display",
}: DiscordErrorDisplayProps): React.ReactElement | null {
  // WHY: Get error state from context if not provided as props
  const { state } = useDiscord();
  // We need this for the invite link, really.
  const { config } = state;

  const error = propError || state.error;
  const username = propUsername || state.user?.username;
  const userRoles = propUserRoles || state.user?.roles;
  const errorDetails = propErrorDetails;
  // WHY: Use prop value if provided, otherwise fall back to context
  const discordInviteLink = propDiscordInviteLink || config.inviteLink;

  // WHY: Early return prevents rendering empty error states
  if (!error) return null;

  // WHY: Get appropriate error configuration based on error type and context
  const normalizedError = typeof error === "string" ? error : String(error);
  const errorConfig = getDiscordErrorConfig(
    normalizedError,
    username,
    userRoles,
    discordInviteLink
  );

  // WHY: Handle Discord-specific actions
  const handleAction = () => {
    if (errorConfig.actionUrl) {
      window.open(errorConfig.actionUrl, "_blank", "noopener,noreferrer");
    } else if (errorConfig.canRetry && onRetry) {
      onRetry();
    }
  };

  // WHY: Map severity to MessageType
  const messageType =
    errorConfig.severity === "info"
      ? "info"
      : errorConfig.severity === "warning"
        ? "warning"
        : "error";

  return (
    <div className={`discord-error-display ${className}`} data-testid={testId}>
      <ErrorMessageDisplay
        message={`${errorConfig.title}: ${errorConfig.message}`}
        type={messageType}
        dismissible={dismissible}
        onDismiss={onDismiss}
        actionText={
          errorConfig.actionText ||
          (errorConfig.canRetry ? "Try Again" : undefined)
        }
        onAction={
          errorConfig.actionUrl
            ? handleAction
            : errorConfig.canRetry
              ? onRetry
              : undefined
        }
      />
      {errorDetails && (
        <details className="error-details">
          <summary>Technical Details</summary>
          <pre>{errorDetails}</pre>
        </details>
      )}
    </div>
  );
}

// --- UTILITY FUNCTIONS --- //

/**
 * Gets error configuration for Discord-specific errors
 *
 * @param errorType - Type of Discord error
 * @param username - Discord username for personalization
 * @param userRoles - User's current roles for context
 * @param inviteLink - Discord server invite link
 * @returns Error configuration object
 */
function getDiscordErrorConfig(
  errorType: DiscordErrorType | string,
  username?: string | null,
  userRoles?: DiscordRole[],
  inviteLink?: string
): ErrorConfig {
  if (!isKnownDiscordError(errorType)) {
    const fallbackMessage =
      typeof errorType === "string" && errorType.trim().length > 0
        ? errorType
        : "An unexpected Discord error occurred.";

    return {
      title: "Discord Verification Issue",
      message: fallbackMessage,
      action:
        "Provide more details below so our team can review your access request.",
      actionText: "Request Support",
      severity: "warning",
      canRetry: false,
      details:
        typeof errorType === "string" && errorType.trim().length > 0
          ? `Discord error: ${errorType}`
          : undefined,
    };
  }

  const displayName = username ? `Discord user ${username}` : "You";

  switch (errorType) {
    case "not_member":
      return {
        title: "Join Our Discord Server",
        message: `${displayName} is not a member of the Infima Games Discord server.`,
        action:
          "You need to join our Discord server to continue with the signup process.",
        actionText: "Join Discord Server",
        actionUrl: inviteLink,
        severity: "info",
        canRetry: false,
      };

    case "not_verified":
      return {
        title: "Verification Required",
        message: `${displayName} is in the server but needs to be verified.`,
        action:
          "Please complete the verification process in our Discord server, then try again.",
        actionText: "Go to Discord",
        actionUrl: inviteLink,
        severity: "warning",
        canRetry: true,
        details:
          userRoles && userRoles.length > 0
            ? `Current roles: ${userRoles.map((r) => r.name).join(", ")}`
            : "No roles found. Please complete verification in Discord.",
      };

    case "oauth_failed":
      return {
        title: "Authentication Failed",
        message: "Discord authentication could not be completed.",
        action: "There was a problem connecting to Discord. Please try again.",
        actionText: "Try Again",
        severity: "error",
        canRetry: true,
      };

    case "no_code":
      return {
        title: "Authorization Error",
        message: "No authorization code was received from Discord.",
        action:
          "The authentication process was interrupted. Please start over.",
        actionText: "Start Over",
        severity: "error",
        canRetry: true,
      };

    case "rate_limited":
      return {
        title: "Rate Limited",
        message:
          "Too many requests to Discord. Please wait before trying again.",
        action:
          "Discord is temporarily limiting requests. Please wait a few minutes and try again.",
        actionText: "Try Again",
        severity: "warning",
        canRetry: true,
      };

    case "server_error":
      return {
        title: "Discord Server Error",
        message: "Discord servers are experiencing issues.",
        action:
          "This is a temporary issue with Discord. Please try again in a few minutes.",
        actionText: "Try Again",
        severity: "error",
        canRetry: true,
      };

    case "network_error":
      return {
        title: "Connection Problem",
        message: "Unable to connect to Discord.",
        action: "Check your internet connection and try again.",
        actionText: "Try Again",
        severity: "error",
        canRetry: true,
      };

    default:
      return {
        title: "Discord Error",
        message: "An unexpected Discord error occurred.",
        action: "Please try again or contact support if the problem persists.",
        actionText: "Try Again",
        severity: "error",
        canRetry: true,
        details: `Error type: ${errorType}`,
      };
  }
}

function isKnownDiscordError(value: unknown): value is DiscordErrorType {
  return (
    typeof value === "string" &&
    KNOWN_DISCORD_ERRORS.has(value as DiscordErrorType)
  );
}
