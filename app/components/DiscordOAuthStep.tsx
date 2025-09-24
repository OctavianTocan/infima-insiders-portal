import React from 'react';
import DiscordOAuthButton from './DiscordOAuthButton';

/**
 * Component for the Discord OAuth step in the signup flow.
 * Handles the initial Discord connection and verification prompt.
 */
export default function DiscordOAuthStep({ message }: { message?: string | null }) {
  return (
    <div className='form-content'>
      <div className='form-header'>
        <h3 className='form-title'>Connect Your Discord</h3>
        <p className='form-subtitle'>Sign in with Discord to verify your membership in the Infima Games server</p>
      </div>

      {message && (
        <div className='status-message'>
          <p className={`message ${message.startsWith('Error') ? 'error' : 'success'}`}>
            {message}
          </p>
        </div>
      )}

      <div className='action-section'>
        <DiscordOAuthButton />
      </div>

      <div className='form-footer'>
        <p className='privacy-note'>
          <span className='privacy-icon'>🔒</span>
          We'll check if you have the "Verified" role in our Discord server
        </p>
      </div>
    </div>
  );
}