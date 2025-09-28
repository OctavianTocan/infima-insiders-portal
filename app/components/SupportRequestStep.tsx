import React from 'react';
import DiscordErrorDisplay from './DiscordErrorDisplay';
import SupportRequestForm from './SupportRequestForm';

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
export default function SupportRequestStep({
  discordError,
  discordUsername,
  userRoles,
  errorDetails,
  onSupportSubmitted,
  onBack,
  supportError,
  onSupportErrorClear
}: SupportRequestStepProps) {
  return (
    <div className='form-content'>
      <div className='form-header'>
        <h3 className='form-title'>Discord Verification Issue</h3>
        <p className='form-subtitle'>We couldn't verify your Discord account</p>
      </div>

      <DiscordErrorDisplay
        error={discordError || 'unknown'}
        username={discordUsername}
        userRoles={userRoles}
        errorDetails={errorDetails}
      />

      <div className='form-header'>
        <h3 className='form-title'>Request Support</h3>
        <p className='form-subtitle'>Having trouble? We're here to help</p>
      </div>

      <SupportRequestForm
        discordUsername={discordUsername || ''}
        verificationError={discordError || 'Discord verification failed'}
        onSupportSubmitted={onSupportSubmitted}
        onBack={onBack}
        submissionError={supportError}
        onClearError={onSupportErrorClear}
      />
    </div>
  );
}