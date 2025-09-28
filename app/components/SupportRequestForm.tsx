import React, { useState } from "react";
import { Form } from "react-router";

interface SupportRequestFormProps {
  discordUsername?: string;
  verificationError?: string;
  onSupportSubmitted: (requestId: string) => void;
  onBack: () => void;
  submissionError?: string | null;
  onClearError?: () => void;
}

const SupportRequestForm: React.FC<SupportRequestFormProps> = ({
  discordUsername: propDiscordUsername,
  verificationError: propVerificationError,
  onSupportSubmitted,
  onBack,
  submissionError,
  onClearError,
}) => {
  const [reason, setReason] = useState("");
  const isSubmitting = false; // TODO: Add prop or state for submitting
  const discordUsername = propDiscordUsername || "Unknown User";
  const verificationError =
    propVerificationError || "Unknown verification error";

  return (
    <div className="input-group">
      <div className="error-context">
        <p className="error-summary">
          Your Discord username <strong>{discordUsername}</strong> could not be
          verified.
        </p>
        <p className="error-details">
          <span className="error-text">{verificationError}</span>
        </p>
        <p className="instruction-text">
          Please provide details about why you should have access.
        </p>
      </div>

      <Form method="post">
        <input type="hidden" name="actionType" value="support-request" />
        <input type="hidden" name="discordUsername" value={discordUsername} />

        <div className="input-group">
          <label htmlFor="reason" className="input-label">
            Reason for Request
          </label>
          <textarea
            id="reason"
            name="message"
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (submissionError) {
                onClearError?.();
              }
            }}
            placeholder="Please explain why you should have access to the repository..."
            className="reason-textarea"
            rows={4}
            disabled={isSubmitting}
            required
          />
          <small className="input-help">
            Be specific about your involvement with the project or community
          </small>
        </div>

        {submissionError && (
          <div className="form-error" role="alert">
            {submissionError}
          </div>
        )}

        <div className="button-group">
          <button
            type="button"
            onClick={onBack}
            className="back-btn"
            disabled={isSubmitting}
          >
            Back
          </button>
          <button
            type="submit"
            className="submit-btn"
            disabled={isSubmitting || !reason.trim()}
          >
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </button>
        </div>
      </Form>
    </div>
  );
};

export default SupportRequestForm;
