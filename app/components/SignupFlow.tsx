// --- SIGNUP FLOW COMPONENT --- //
/**
 * SignupFlow component that orchestrates the multi-step OAuth authentication process
 *
 * This component follows the composition pattern, rendering different step components
 * based on the current flow state. It acts as a coordinator rather than containing
 * complex UI logic, which keeps components focused and testable.
 *
 * @module SignupFlow
 */

import React from "react";
import type { ReactElement } from "react";
import type { StepComponentProps } from "../types/react";
import {
  DiscordOAuthStep,
  DiscordOAuthStepWithMessage,
  GitHubOAuthStep,
  SupportRequestStep,
  CompleteStep,
} from "./index";

// --- COMPONENT PROPS --- //

/**
 * Props for the SignupFlow component
 *
 * Combines data from OAuth callbacks, user input, and configuration
 * to drive the multi-step authentication flow.
 *
 * @interface SignupFlowProps
 */
interface SignupFlowProps extends StepComponentProps {
  /** Username of verified Discord user */
  verifiedDiscordUsername: string;
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
  /** Callback when GitHub login is initiated */
  onGitHubLogin: () => void;
  /** Callback when navigating back to Discord step */
  onBackToDiscord: () => void;
  /** Callback when support request is submitted */
  onSupportSubmitted: (requestId: string) => void;
  /** Loading state for accessibility */
  loading: boolean;
}

/**
 * SignupFlow component that renders the appropriate authentication step
 *
 * Uses composition pattern instead of conditional rendering with boolean props,
 * which makes the component easier to test and reason about. Each step is a
 * separate component with focused responsibilities.
 *
 * The flow progresses through these steps:
 * 1. Discord OAuth - User connects their Discord account
 * 2. GitHub OAuth - User connects their GitHub account
 * 3. Support Request - Fallback for users who can't complete OAuth
 * 4. Complete - Success state with next steps
 *
 * @param props - SignupFlow configuration and callbacks
 * @returns JSX element for the current step
 *
 * @example
 * ```tsx
 * <SignupFlow
 *   currentStep="github-oauth"
 *   verifiedDiscordUsername="johndoe"
 *   onGitHubLogin={() => initiateGitHubOAuth()}
 *   onBackToDiscord={() => resetToDiscordStep()}
 *   // ... other props
 * />
 * ```
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
  onGitHubLogin,
  onBackToDiscord,
  onSupportSubmitted,
  loading = false,
  className = "",
  "data-testid": testId = "signup-flow",
}: SignupFlowProps): ReactElement {
  const containerClassName = className.trim() ? className : undefined;
  const resolvedTestId = `${testId}-${currentStep}`;

  let renderedStep: ReactElement;

  // WHY: Switch statement provides better performance than multiple if conditions
  // and makes the component's behavior more predictable and easier to debug
  switch (currentStep) {
    case "discord-oauth":
      // WHY: Conditional rendering based on message presence avoids prop drilling
      // and keeps components focused on their specific use cases
      renderedStep = message ? (
        <DiscordOAuthStepWithMessage message={message} />
      ) : (
        <DiscordOAuthStep />
      );
      break;

    case "github-oauth":
      renderedStep = (
        <GitHubOAuthStep
          verifiedDiscordUsername={verifiedDiscordUsername}
          message={message ?? null}
          onLogin={onGitHubLogin}
          onBack={onBackToDiscord}
        />
      );
      break;

    case "support-request":
      renderedStep = (
        <SupportRequestStep
          discordError={discordError}
          discordUsername={discordUsername}
          userRoles={userRoles}
          errorDetails={errorDetails}
          onSupportSubmitted={onSupportSubmitted}
          onBack={onBackToDiscord}
        />
      );
      break;

    case "complete":
      renderedStep = (
        <CompleteStep
          supportRequestId={supportRequestId}
          onStartOver={onBackToDiscord}
        />
      );
      break;

    default:
      // WHY: Default case ensures component always renders something valid
      // This prevents blank screens if an invalid step value is passed
      console.warn(
        `Unknown signup step: ${currentStep}. Falling back to Discord OAuth.`
      );
      renderedStep = <DiscordOAuthStep />;
      break;
  }

  return (
    <div className={containerClassName} data-testid={resolvedTestId}>
      {renderedStep}
    </div>
  );
}
