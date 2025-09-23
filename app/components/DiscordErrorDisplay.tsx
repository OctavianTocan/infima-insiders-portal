import React from 'react';
import { useDiscord } from './DiscordContext';

interface DiscordErrorDisplayProps {
  discordInviteLink?: string;
}

const DiscordErrorDisplay: React.FC<DiscordErrorDisplayProps> = ({
  discordInviteLink = 'https://discord.gg/your-invite-link' // Replace with your actual invite
}) => {
  const { state } = useDiscord();
  const { error, user } = state;
  const username = user?.username;
  const userRoles = user?.roles;

  if (!error) {
    return null;
  }
  const getErrorMessage = () => {
    switch (error) {
      case 'not_member':
        return {
          title: 'Not a Server Member',
          message: `Discord user ${username} is not a member of the Infima Games Discord server.`,
          action: 'Please join our Discord server first, then try again.',
          link: discordInviteLink
        };
      
      case 'not_verified':
        return {
          title: 'Not Verified',
          message: `Discord user ${username} is in the server but doesn't have the "Verified" role.`,
          action: 'Please get verified in our Discord server first, then try again.',
          details: (userRoles?.length || 0) > 0
            ? `Current roles: ${userRoles?.map(r => r.name).join(', ')}`
            : 'No roles found.'
        };
      
      case 'oauth_failed':
        return {
          title: 'Authentication Failed',
          message: 'Discord authentication failed.',
          action: 'Please try again or contact support.'
        };
      
      case 'no_code':
        return {
          title: 'Invalid Request',
          message: 'No authorization code received from Discord.',
          action: 'Please try signing in again.'
        };
      
      default:
        return {
          title: 'Unknown Error',
          message: 'An unknown error occurred.',
          action: 'Please try again or contact support.'
        };
    }
  };

  const errorInfo = getErrorMessage();

  return (
    <div className="discord-error-display">
      <div className="error-icon">❌</div>
      <h3 className="error-title">{errorInfo.title}</h3>
      <p className="error-message">{errorInfo.message}</p>
      {errorInfo.details && (
        <p className="error-details">{errorInfo.details}</p>
      )}
      <p className="error-action">{errorInfo.action}</p>
      {errorInfo.link && (
        <a 
          href={errorInfo.link} 
          target="_blank" 
          rel="noopener noreferrer"
          className="discord-invite-link"
        >
          Join Discord Server
        </a>
      )}
    </div>
  );
};

export default DiscordErrorDisplay;