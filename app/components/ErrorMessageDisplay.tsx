// --- ERROR MESSAGE DISPLAY COMPONENT --- //
/**
 * ErrorMessageDisplay component following composition pattern
 * 
 * This component provides a consistent way to display error, success, and info messages
 * throughout the application. It follows the composition pattern established by
 * DiscordOAuthStepWithMessage for visual consistency.
 * 
 * @module ErrorMessageDisplay
 */

import React from "react";
import type { BaseComponentProps } from "../types/react";

// --- TYPES --- //

/**
 * Message severity types for styling
 */
export type MessageType = "error" | "success" | "info" | "warning";

/**
 * Props for the ErrorMessageDisplay component
 * 
 * @interface ErrorMessageDisplayProps
 * @extends BaseComponentProps
 */
interface ErrorMessageDisplayProps extends BaseComponentProps {
  /** Message to display */
  message: string;
  /** Type of message for styling */
  type?: MessageType;
  /** Optional icon to display with the message */
  icon?: string;
  /** Whether the message can be dismissed */
  dismissible?: boolean;
  /** Callback when message is dismissed */
  onDismiss?: () => void;
  /** Optional action button text */
  actionText?: string;
  /** Callback for action button */
  onAction?: () => void;
}

// --- MAIN COMPONENT --- //

/**
 * Error message display component with consistent styling
 * 
 * Follows the composition pattern from DiscordOAuthStepWithMessage to ensure
 * consistent error handling across the application. Messages appear above
 * content with proper centering and typography.
 * 
 * @param props - Error message display configuration
 * @returns JSX element displaying the message
 * 
 * @example
 * ```tsx
 * // Basic error message
 * <ErrorMessageDisplay
 *   message="Failed to verify Discord account"
 *   type="error"
 * />
 * 
 * // Success message with action
 * <ErrorMessageDisplay
 *   message="Discord account verified successfully!"
 *   type="success"
 *   actionText="Continue"
 *   onAction={handleContinue}
 * />
 * 
 * // Warning with dismiss
 * <ErrorMessageDisplay
 *   message="Please complete verification in Discord"
 *   type="warning"
 *   dismissible
 *   onDismiss={clearWarning}
 * />
 * ```
 */
export default function ErrorMessageDisplay({
  message,
  type = "error",
  icon,
  dismissible = false,
  onDismiss,
  actionText,
  onAction,
  className = "",
  "data-testid": testId = "error-message-display",
}: ErrorMessageDisplayProps): React.ReactElement {
  // WHY: Get appropriate icon based on message type
  const displayIcon = icon || getDefaultIcon(type);
  
  // WHY: Determine CSS classes based on type
  const messageClasses = [
    "status-message",
    `message`,
    type,
    className
  ].filter(Boolean).join(" ");

  return (
    <div className={messageClasses} data-testid={testId}>
      <p className="message-content">
        {displayIcon && (
          <span className="message-icon" aria-hidden="true">
            {displayIcon}
          </span>
        )}
        {message}
      </p>
      
      {(actionText || dismissible) && (
        <div className="message-actions">
          {actionText && onAction && (
            <button
              className="btn btn--primary btn--sm"
              onClick={onAction}
              data-testid={`${testId}-action`}
            >
              {actionText}
            </button>
          )}
          
          {dismissible && onDismiss && (
            <button
              className="btn btn--ghost btn--sm"
              onClick={onDismiss}
              aria-label="Dismiss message"
              data-testid={`${testId}-dismiss`}
            >
              ✕
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// --- UTILITY FUNCTIONS --- //

/**
 * Gets default icon for message type
 * 
 * @param type - Message type
 * @returns Default icon string
 */
function getDefaultIcon(type: MessageType): string {
  switch (type) {
    case "error":
      return "❌";
    case "success":
      return "✅";
    case "warning":
      return "⚠️";
    case "info":
      return "ℹ️";
    default:
      return "";
  }
}

// --- COMPOSED VARIANTS --- //
// WHY: Pre-configured components for common use cases

/**
 * Error message variant
 */
export function ErrorMessage({
  message,
  ...props
}: Omit<ErrorMessageDisplayProps, "type">) {
  return <ErrorMessageDisplay message={message} type="error" {...props} />;
}

/**
 * Success message variant
 */
export function SuccessMessage({
  message,
  ...props
}: Omit<ErrorMessageDisplayProps, "type">) {
  return <ErrorMessageDisplay message={message} type="success" {...props} />;
}

/**
 * Warning message variant
 */
export function WarningMessage({
  message,
  ...props
}: Omit<ErrorMessageDisplayProps, "type">) {
  return <ErrorMessageDisplay message={message} type="warning" {...props} />;
}

/**
 * Info message variant
 */
export function InfoMessage({
  message,
  ...props
}: Omit<ErrorMessageDisplayProps, "type">) {
  return <ErrorMessageDisplay message={message} type="info" {...props} />;
}