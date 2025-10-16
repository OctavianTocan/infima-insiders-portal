import React from "react";
import ErrorMessageDisplay from "./ErrorMessageDisplay";
import SupportRequestForm from "./SupportRequestForm";

interface SupportRequestStepProps {
  discordError: string | null;
  discordUsername: string | null;
  userRoles: { id: string; name: string }[];
  errorDetails: string | null;
  onSupportSubmitted: (requestId: string) => void;
  onBack: () => void;
  supportError?: string | null;
  onSupportErrorClear?: () => void;
}

/**
 * Component for the support request step in the signup flow.
 * Displays Discord error and support request form.
 */
// --- HELPER FUNCTIONS --- //

/**
 * Get user-friendly error message based on Discord error type
 * WHY: Provides clear, actionable error messages to users
 */
function getErrorMessage(error: string, username: string | null): string {
  const displayName = username ? `Discord user ${username}` : "You";

  switch (error) {
    case "not_member":
      return `${displayName} is not a member of the Infima Games Discord server. Please join our server to continue.`;
    case "not_verified":
      return `${displayName} needs to complete verification in our Discord server.`;
    case "oauth_failed":
      return "Discord authentication failed. Please try again.";
    case "rate_limited":
      return "Too many requests to Discord. Please wait a few minutes and try again.";
    default:
      return `Discord verification issue: ${error}. Please provide details below for support.`;
  }
}

export default function SupportRequestStep({
  discordError,
  discordUsername,
  userRoles,
  errorDetails,
  onSupportSubmitted,
  onBack,
  supportError,
  onSupportErrorClear,
}: SupportRequestStepProps) {
  return (
    <div className="form-content">
      <div className="form-header">
        <h3 className="form-title">Discord Verification Issue</h3>
        {/* <p className="form-subtitle">We couldn't verify your Discord account</p> */}
      </div>

      {/* WHY: Show user-friendly error message for Discord verification issues */}
      {discordError && (
        <ErrorMessageDisplay
          message={getErrorMessage(discordError, discordUsername)}
          type="error"
        />
      )}

      {/* <div className="form-header">
        <h3 className="form-title">Request Support</h3>
        <p className="form-subtitle">Having trouble? We're here to help</p>
      </div> */}

      <SupportRequestForm
        discordUsername={discordUsername || ""}
        verificationError={discordError || "Discord verification failed"}
        onSupportSubmitted={onSupportSubmitted}
        onBack={onBack}
        submissionError={supportError}
        onClearError={onSupportErrorClear}
      />
    </div>
  );
}
