import React from 'react';
import type { FormStep } from '../hooks/useSignupFlow';
import { DiscordOAuthStep, DiscordOAuthStepWithMessage, GitHubOAuthStep, SupportRequestStep, CompleteStep } from './index';

interface SignupFlowProps {
  /** Current step in the signup flow */
  currentStep: FormStep;
  /** Username of verified Discord user */
  verifiedDiscordUsername: string;
  /** Current status message */
  message: string | null;
  /** ID of submitted support request */
  supportRequestId: string;
  /** Discord error from OAuth callback */
  discordError: string | null;
  /** Discord username from OAuth callback */
  discordUsername: string | null;
  /** User roles from Discord OAuth callback */
  userRoles: Array<{ id: string; name: string }>;
  /** Error details from OAuth callback */
  errorDetails: string | null;
  /** GitHub OAuth configuration */
  githubConfig: {
    clientId: string;
    redirectUri: string;
  };
  /** Callback when GitHub login is initiated */
  onGitHubLogin: () => void;
  /** Callback when navigating back to Discord step */
  onBackToDiscord: () => void;
  /** Callback when support request is submitted */
  onSupportSubmitted: (requestId: string) => void;
}

/**
 * Renders the appropriate step component based on current signup flow state.
 * Uses composition pattern instead of conditional rendering with boolean props.
 */
export function SignupFlow({
  currentStep,
  verifiedDiscordUsername,
  message,
  supportRequestId,
  discordError,
  discordUsername,
  userRoles,
  errorDetails,
  githubConfig,
  onGitHubLogin,
  onBackToDiscord,
  onSupportSubmitted,
}: SignupFlowProps) {
  // Use composition - render the appropriate step component
  switch (currentStep) {
    case 'discord-oauth':
      return message ? <DiscordOAuthStepWithMessage message={message} /> : <DiscordOAuthStep />;

    case 'github-oauth':
      return (
        <GitHubOAuthStep
          verifiedDiscordUsername={verifiedDiscordUsername}
          message={message}
          onLogin={onGitHubLogin}
          onBack={onBackToDiscord}
        />
      );

    case 'support-request':
      return (
        <SupportRequestStep
          discordError={discordError}
          discordUsername={discordUsername}
          userRoles={userRoles}
          errorDetails={errorDetails}
          onSupportSubmitted={onSupportSubmitted}
          onBack={onBackToDiscord}
        />
      );

    case 'complete':
      return (
        <CompleteStep
          supportRequestId={supportRequestId}
          onStartOver={onBackToDiscord}
        />
      );

    default:
      return <DiscordOAuthStep />;
  }
}