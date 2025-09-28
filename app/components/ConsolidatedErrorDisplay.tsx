// --- CONSOLIDATED ERROR DISPLAY --- //
/**
 * Single source of truth for all error messages in the application
 *
 * This component consolidates all error states to prevent multiple error
 * messages from appearing simultaneously. It provides a clean, accessible
 * interface for displaying errors with appropriate actions.
 *
 * @module ConsolidatedErrorDisplay
 */

import React from "react";
import type { BaseComponentProps } from "../types/react";

// --- ERROR TYPES --- //

/**
 * Supported error types with different visual treatments
 */
type ErrorType =
  | "auth"
  | "network"
  | "validation"
  | "permission"
  | "rate_limit"
  | "server";

/**
 * Error severity levels for styling and prioritization
 */
type ErrorSeverity = "info" | "warning" | "error" | "critical";

// --- COMPONENT PROPS --- //

/**
 * Props for the ConsolidatedErrorDisplay component
 *
 * @interface ConsolidatedErrorProps
 * @extends BaseComponentProps
 */
interface ConsolidatedErrorProps extends BaseComponentProps {
  /** Primary error message to display */
  error?: string | null;
  /** Additional error details (collapsible) */
  errorDetails?: string | null;
  /** Error type for appropriate styling and icons */
  errorType?: ErrorType;
  /** Error severity for prioritization */
  severity?: ErrorSeverity;
  /** Whether the error can be dismissed */
  dismissible?: boolean;
  /** Whether a retry action is available */
  canRetry?: boolean;
  /** Custom action button text */
  actionText?: string;
  /** Custom action URL for external links */
  actionUrl?: string;
  /** Callback to dismiss the error */
  onDismiss?: () => void;
  /** Callback to retry the failed operation */
  onRetry?: () => void;
  /** Callback for custom action */
  onAction?: () => void;
}

// --- MAIN COMPONENT --- //

/**
 * Consolidated error display component
 *
 * Provides a single, consistent way to display all types of errors in the
 * application. Prevents UI clutter by ensuring only one error is shown at
 * a time, with clear action paths for users.
 *
 * The component automatically determines appropriate icons, colors, and
 * actions based on the error type and severity.
 *
 * @param props - Error display configuration
 * @returns JSX element showing the error state, or null if no error
 *
 * @example
 * ```tsx
 * // Basic error display
 * <ConsolidatedErrorDisplay
 *   error="Failed to connect to Discord"
 *   errorType="auth"
 *   onRetry={() => retryDiscordAuth()}
 * />
 *
 * // Error with external action
 * <ConsolidatedErrorDisplay
 *   error="You need to join our Discord server"
 *   errorType="permission"
 *   actionText="Join Server"
 *   actionUrl="https://discord.gg/your-server"
 *   severity="info"
 * />
 * ```
 */
export function ConsolidatedErrorDisplay({
  error,
  errorDetails,
  errorType = "server",
  severity = "error",
  dismissible = true,
  canRetry = false,
  actionText,
  actionUrl,
  onDismiss,
  onRetry,
  onAction,
  className = "",
  "data-testid": testId = "error-display",
}: ConsolidatedErrorProps): React.ReactElement | null {
  // WHY: Early return prevents rendering empty error states
  if (!error) return null;

  // WHY: Get configuration based on error type and severity
  const errorConfig = getErrorConfiguration(errorType, severity);
  const finalActionText = actionText || (canRetry ? "Try Again" : undefined);

  // WHY: Combine CSS classes for flexible styling
  const containerClasses = [
    "error-display",
    `error-display--${errorType}`,
    `error-display--${severity}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  // WHY: Handle action click based on available options
  const handleAction = () => {
    if (actionUrl) {
      window.open(actionUrl, "_blank", "noopener,noreferrer");
    } else if (onAction) {
      onAction();
    } else if (canRetry && onRetry) {
      onRetry();
    }
  };

  return (
    <div
      className={containerClasses}
      data-testid={testId}
      role="alert"
      aria-live="polite"
    >
      <div className="error-display__content">
        {/* Error icon */}
        <div className="error-display__icon" aria-hidden="true">
          {errorConfig.icon}
        </div>

        <div className="error-display__text">
          {/* Error title */}
          <h3 className="error-display__title">{errorConfig.title}</h3>

          {/* Main error message */}
          <p className="error-display__message">{error}</p>

          {/* Collapsible error details */}
          {errorDetails && (
            <details className="error-display__details">
              <summary>Technical Details</summary>
              <pre className="error-display__details-content">
                {errorDetails}
              </pre>
            </details>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="error-display__actions">
        {(finalActionText || canRetry) && (
          <button
            onClick={handleAction}
            className={`btn btn--${severity === "info" ? "primary" : "secondary"}`}
            data-testid={`${testId}-action`}
          >
            {finalActionText || "Try Again"}
          </button>
        )}

        {dismissible && onDismiss && (
          <button
            onClick={onDismiss}
            className="btn btn--ghost"
            data-testid={`${testId}-dismiss`}
            aria-label="Dismiss error"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

// --- UTILITY FUNCTIONS --- //

/**
 * Error configuration based on type and severity
 */
interface ErrorConfig {
  title: string;
  icon: string;
  description?: string;
}

/**
 * Gets error configuration for display
 *
 * @param errorType - Type of error
 * @param severity - Error severity level
 * @returns Error configuration object
 */
function getErrorConfiguration(
  errorType: ErrorType,
  severity: ErrorSeverity
): ErrorConfig {
  const configs: Record<ErrorType, Record<ErrorSeverity, ErrorConfig>> = {
    auth: {
      info: { title: "Authentication Info", icon: "ℹ️" },
      warning: { title: "Authentication Issue", icon: "⚠️" },
      error: { title: "Authentication Failed", icon: "❌" },
      critical: { title: "Authentication Error", icon: "🚨" },
    },
    network: {
      info: { title: "Connection Info", icon: "ℹ️" },
      warning: { title: "Connection Issue", icon: "⚠️" },
      error: { title: "Connection Failed", icon: "❌" },
      critical: { title: "Network Error", icon: "🚨" },
    },
    validation: {
      info: { title: "Validation Info", icon: "ℹ️" },
      warning: { title: "Invalid Input", icon: "⚠️" },
      error: { title: "Validation Failed", icon: "❌" },
      critical: { title: "Validation Error", icon: "🚨" },
    },
    permission: {
      info: { title: "Permission Required", icon: "ℹ️" },
      warning: { title: "Access Limited", icon: "⚠️" },
      error: { title: "Access Denied", icon: "❌" },
      critical: { title: "Permission Error", icon: "🚨" },
    },
    rate_limit: {
      info: { title: "Rate Limit Info", icon: "ℹ️" },
      warning: { title: "Rate Limit Approaching", icon: "⚠️" },
      error: { title: "Rate Limited", icon: "❌" },
      critical: { title: "Rate Limit Exceeded", icon: "🚨" },
    },
    server: {
      info: { title: "Server Info", icon: "ℹ️" },
      warning: { title: "Server Issue", icon: "⚠️" },
      error: { title: "Server Error", icon: "❌" },
      critical: { title: "Critical Server Error", icon: "🚨" },
    },
  };

  return configs[errorType]?.[severity] || configs.server.error;
}

// --- CONVENIENCE HOOKS --- //

/**
 * Custom hook for managing consolidated error state
 *
 * @param initialError - Optional initial error state
 * @returns Error state and management functions
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { error, setError, clearError } = useConsolidatedError();
 *
 *   const handleSubmit = async () => {
 *     try {
 *       await submitForm();
 *     } catch (err) {
 *       setError(err.message, 'validation');
 *     }
 *   };
 *
 *   return (
 *     <>
 *       <ConsolidatedErrorDisplay
 *         error={error}
 *         onDismiss={clearError}
 *       />
 *       <form onSubmit={handleSubmit}>
 *         // Form content
 *       </form>
 *     </>
 *   );
 * }
 * ```
 */
export function useConsolidatedError(initialError?: string) {
  const [error, setErrorState] = React.useState<string | null>(
    initialError || null
  );
  const [errorType, setErrorType] = React.useState<ErrorType>("server");
  const [severity, setSeverity] = React.useState<ErrorSeverity>("error");

  const setError = React.useCallback(
    (
      errorMessage: string,
      type: ErrorType = "server",
      sev: ErrorSeverity = "error"
    ) => {
      setErrorState(errorMessage);
      setErrorType(type);
      setSeverity(sev);
    },
    []
  );

  const clearError = React.useCallback(() => {
    setErrorState(null);
  }, []);

  return {
    error,
    errorType,
    severity,
    setError,
    clearError,
  };
}
