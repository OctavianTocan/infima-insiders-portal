import React, { useState } from 'react';
import { Form } from 'react-router';
import { useDiscord } from './DiscordContext';

interface DiscordVerificationFormProps {
  onSupportRequest: () => void;
}

const DISCORD_HANDLE_PATTERN = /^@([a-z0-9_]{2,32})$/i;

const DiscordVerificationForm: React.FC<DiscordVerificationFormProps> = ({
  onSupportRequest,
}) => {
  const { state, actions } = useDiscord();
  const [discordUsername, setDiscordUsername] = useState('');
  const isVerifying = state.isLoading || state.verificationStatus === 'verifying';
  const error = state.error;

  const getNormalizedHandle = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      return '';
    }

    const withoutPrefix = trimmed.replace(/^@+/, '');
    if (!withoutPrefix) {
      return '';
    }

    return `@${withoutPrefix.toLowerCase()}`;
  };

  const normalizedHandle = getNormalizedHandle(discordUsername);
  const isHandleValid = normalizedHandle.length > 0 && DISCORD_HANDLE_PATTERN.test(normalizedHandle);

  const handleInputChange = (value: string) => {
    setDiscordUsername(value);
    if (error) {
      actions.clearError();
    }
  };

  const handleSubmit = () => {
    actions.startVerification();
  };

  return (
    <div className='input-group'>
      <Form method='post'>
        <input type='hidden' name='actionType' value='verify-discord' />
        
        <div className='input-group'>
          <label htmlFor='discordUsername' className='input-label'>
            Discord Handle
          </label>
          <input
            type='text'
            id='discordUsername'
            name='discordUsername'
            value={discordUsername}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder='@infimagamer'
            className='discord-input'
            disabled={isVerifying}
            required
            aria-describedby='discord-handle-help'
            inputMode='text'
            autoComplete='off'
            autoCapitalize='none'
          />
          <small id='discord-handle-help' className='input-help'>
            Handles use @username format with letters, numbers, or underscores only.
          </small>
        </div>

        {error && <div className='error-message'>{error}</div>}

        <div className='github-btn-container'>
          <button
            type='submit'
            className='verify-btn'
            disabled={isVerifying || !isHandleValid}
            onClick={handleSubmit}
          >
            {isVerifying ? 'Verifying...' : 'Verify Discord'}
          </button>
        </div>
      </Form>

      <div className='support-section'>
        Having trouble?{' '}
        <button onClick={onSupportRequest} className='support-link'>
          Request Support
        </button>
      </div>
    </div>
  );
};

export default DiscordVerificationForm;