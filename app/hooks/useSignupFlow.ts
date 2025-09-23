import { useState, useEffect } from 'react';
import type { Route } from '../routes/+types/signup';

/**
 * Represents the current state of the signup flow
 */
export type SignupFlowState = {
  /** Current step in the signup process */
  currentStep: FormStep;
  /** Username of verified Discord user */
  verifiedDiscordUsername: string;
  /** ID of submitted support request */
  supportRequestId: string;
  /** Current status message */
  message: string | null;
};

/**
 * Actions available in the signup flow
 */
export type SignupFlowActions = {
  /** Navigate back to Discord OAuth step */
  goToDiscord: () => void;
  /** Handle successful support request submission */
  handleSupportSubmitted: (requestId: string) => void;
  /** Start the signup flow over */
  startOver: () => void;
};

/**
 * Hook for managing the signup flow state and logic.
 * Encapsulates all step transitions and state management for the OAuth process.
 *
 * @param loaderData - Data from the server loader containing OAuth results
 * @param actionData - Data from server actions containing support request results
 * @returns Current flow state and available actions
 */
export function useSignupFlow(
  loaderData: Route.ComponentProps['loaderData'],
  actionData?: Route.ComponentProps['actionData']
): SignupFlowState & SignupFlowActions {
  const {
    message: initialMessage,
    discordSuccess,
    discordError,
    discordUsername,
    discordVerified,
  } = loaderData;

  const [currentStep, setCurrentStep] = useState<FormStep>('discord-oauth');
  const [verifiedDiscordUsername, setVerifiedDiscordUsername] = useState<string>('');
  const [supportRequestId, setSupportRequestId] = useState<string>('');
  const [message, setMessage] = useState<string | null>(initialMessage);

  // Handle Discord OAuth results on mount
  useEffect(() => {
    if (discordSuccess && discordVerified) {
      // User has verified role in Discord server - proceed to GitHub
      setVerifiedDiscordUsername(discordUsername || '');
      setCurrentStep('github-oauth');
    } else if (discordError) {
      // Discord verification failed - show support request
      setCurrentStep('support-request');
    }
  }, [discordSuccess, discordVerified, discordError, discordUsername]);

  // Handle server action responses (support requests)
  useEffect(() => {
    if (actionData?.success && actionData.requestId) {
      setSupportRequestId(actionData.requestId);
      setCurrentStep('complete');
    }
  }, [actionData]);

  const goToDiscord = () => {
    setCurrentStep('discord-oauth');
    // Clear URL parameters to reset state
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  const handleSupportSubmitted = (requestId: string) => {
    setSupportRequestId(requestId);
    setCurrentStep('complete');
  };

  const startOver = goToDiscord; // Alias for clarity

  return {
    currentStep,
    verifiedDiscordUsername,
    supportRequestId,
    message,
    goToDiscord,
    handleSupportSubmitted,
    startOver,
  };
}

/**
 * Available steps in the signup flow
 */
export type FormStep = 'discord-oauth' | 'github-oauth' | 'support-request' | 'complete';

/**
 * Configuration for signup flow steps
 */
export const SIGNUP_STEPS = [
  { key: 'discord-oauth' as const, label: 'Connect Discord' },
  { key: 'github-oauth' as const, label: 'Connect GitHub' },
  { key: 'complete' as const, label: 'Complete' },
] as const;

/**
 * Calculates the current step index for UI display.
 * Handles special case where support-request shows as first step.
 *
 * @param currentStep - Current step in the flow
 * @returns Zero-based index for step indicator
 */
export function getStepIndex(currentStep: FormStep): number {
  if (currentStep === 'support-request') {
    return 0; // Show as first step when support needed
  }
  return SIGNUP_STEPS.findIndex(step => step.key === currentStep);
}