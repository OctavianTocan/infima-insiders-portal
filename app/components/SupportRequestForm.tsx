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
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const isSubmitting = false; // TODO: Add prop or state for submitting

  const discordUsername = propDiscordUsername?.trim() ?? "";
  const verificationError =
    propVerificationError || "Unknown verification error";
  // TODO: Needs to go inside of a config file, somewhere. Not here randomly. Don't hardcode invites, this is bad.
  const discordInviteUrl = "https://discord.gg/sqPFPe2uuU";

  const handleInputChange =
    (setter: React.Dispatch<React.SetStateAction<string>>) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setter(event.target.value);
      if (submissionError) {
        onClearError?.();
      }
    };

  const disableSubmit =
    isSubmitting || !reason.trim().length || !email.trim().length;

  return (
    <div className="input-group">
      <div className="error-context">
        <p className="error-summary">Your Discord could not be verified:</p>
        <p className="error-details">
          <span className="error-text">{verificationError}</span>
        </p>
        <p className="instruction-text">
          Please let us know what happened so we can help. You can also{" "}
          <a href={discordInviteUrl} target="_blank" rel="noreferrer noopener">
            join our Discord server
          </a>{" "}
          for real-time support.
        </p>
      </div>

      <Form method="post">
        <input type="hidden" name="actionType" value="support-request" />
        <input
          type="hidden"
          name="verificationError"
          value={verificationError}
        />
        <input type="hidden" name="discordUsername" value={discordUsername} />

        <div className="input-group">
          <label htmlFor="email" className="input-label">
            Contact Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={handleInputChange(setEmail)}
            placeholder="you@example.com"
            className="discord-input"
            autoComplete="email"
            disabled={isSubmitting}
            required
          />
          <small className="input-help">
            We'll use this to follow up about your request.
          </small>
        </div>

        <div className="input-group">
          <label htmlFor="reason" className="input-label">
            Message
          </label>
          <textarea
            id="reason"
            name="message"
            value={reason}
            onChange={handleInputChange(setReason)}
            placeholder="Explain what happened so we can help you out..."
            className="reason-textarea"
            rows={4}
            disabled={isSubmitting}
            required
          />
          <small className="input-help">
            Be specific about your issue to help us assist you better.
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
          <button type="submit" className="submit-btn" disabled={disableSubmit}>
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </button>
        </div>
      </Form>
    </div>
  );
};

export default SupportRequestForm;
