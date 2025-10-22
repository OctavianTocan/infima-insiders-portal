// --- SIGNUP FLOW HOOK --- //
/**
 * Custom hook for managing the OAuth signup flow state and transitions
 *
 * This hook encapsulates the complex state management for the Discord + GitHub
 * OAuth flow, handling all step transitions, error states, and user interactions.
 * It provides a clean API for components to interact with the signup process.
 *
 * The flow supports these paths:
 * 1. Discord OAuth → GitHub OAuth (success path)
 * 2. Discord OAuth → Support Request (fallback for issues)
 * 3. Support Request → Complete (support submitted)
 *
 * @module useSignupFlow
 */

import { useState, useEffect, useCallback } from "react";
import type { Route } from "../routes/+types/signup";

// --- FLOW STATE TYPES --- //

/**
 * Available steps in the signup flow
 * WHY: Simplified to 2 main steps since users get redirected after GitHub OAuth
 */
export type FormStep =
  | "discord-oauth"
  | "github-oauth"
  | "support-request"
  | "complete";

/**
 * Current state of the signup flow
 *
 * @interface SignupFlowState
 */
export interface SignupFlowState {
  /** Current step in the signup process */
  currentStep: FormStep;
  /** Username of verified Discord user */
  verifiedDiscordUsername: string;
  /** ID of submitted support request */
  supportRequestId: string;
  /** Current status message (consolidated from multiple sources) */
  message: string | null;
  /** Whether any async operation is in progress */
  isLoading: boolean;
  /** Current error state (consolidated from multiple error sources) */
  error: string | null;
}

/**
 * Actions available in the signup flow
 *
 * @interface SignupFlowActions
 */
export interface SignupFlowActions {
  /** Navigate back to Discord OAuth step */
  goToDiscord: () => void;
  /** Navigate to support request form */
  goToSupportRequest: () => void;
  /** Handle successful support request submission */
  handleSupportSubmitted: (requestId: string) => void;
  /** Start the signup flow over */
  startOver: () => void;
  /** Clear current error state */
  clearError: () => void;
  /** Set loading state */
  setLoading: (loading: boolean) => void;
}

// --- STEP CONFIGURATION --- //

/**
 * Configuration for signup flow steps (simplified to 2 main steps)
 * WHY: Users get redirected after GitHub OAuth, so no need for a third visual step
 */
export const SIGNUP_STEPS = [
  {
    key: "discord-oauth" as const,
    label: "Connect Discord",
    description: "Verify your Discord membership",
  },
  {
    key: "github-oauth" as const,
    label: "Connect GitHub",
    description: "Link your GitHub account",
  },
] as const;

// --- MAIN HOOK --- //

/**
 * Custom hook for managing the signup flow state and logic
 *
 * Encapsulates all step transitions and state management for the OAuth process.
 * Consolidates error messages from multiple sources to prevent UI clutter.
 *
 * @param loaderData - Data from the server loader containing OAuth results
 * @param actionData - Data from server actions containing support request results
 * @returns Current flow state and available actions
 *
 * @example
 * ```tsx
 * function SignupPage({ loaderData, actionData }) {
 *   const {
 *     currentStep,
 *     message,
 *     error,
 *     isLoading,
 *     goToDiscord,
 *     clearError
 *   } = useSignupFlow(loaderData, actionData);
 *
 *   return (
 *     <div>
 *       {error && (
 *         <ErrorDisplay
 *           error={error}
 *           onDismiss={clearError}
 *         />
 *       )}
 *       <SignupSteps />
 *     </div>
 *   );
 * }
 * ```
 */
export function useSignupFlow(
  loaderData: Route.ComponentProps["loaderData"],
  actionData?: Route.ComponentProps["actionData"]
): SignupFlowState & SignupFlowActions {
  const {
    message: initialMessage,
    discordSuccess,
    discordError,
    discordUsername,
    discordVerified,
    errorDetails,
  } = loaderData;

  // --- STATE MANAGEMENT --- //

  const [currentStep, setCurrentStep] = useState<FormStep>("discord-oauth");
  const [verifiedDiscordUsername, setVerifiedDiscordUsername] =
    useState<string>("");
  const [supportRequestId, setSupportRequestId] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // WHY: Consolidate all possible error sources into single error state
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(initialMessage);

  // --- ERROR CONSOLIDATION --- //
  // WHY: Prevent multiple error messages by consolidating all error sources

  useEffect(() => {
    if (actionData?.error) {
      setError(`Support request failed: ${actionData.error}`);
      return;
    }

    setError(null);
  }, [actionData?.error]);

  // --- STEP TRANSITIONS --- //

  // Handle Discord OAuth results
  useEffect(() => {
    if (discordSuccess && discordVerified) {
      // WHY: User has verified role in Discord server - proceed to GitHub
      setVerifiedDiscordUsername(discordUsername || "");
      setCurrentStep("github-oauth");
      setError(null); // Clear any previous errors
    } else if (discordError) {
      // WHY: Discord verification failed - show support request option
      setCurrentStep("support-request");
    }
  }, [discordSuccess, discordVerified, discordError, discordUsername]);

  // Handle support request responses
  useEffect(() => {
    if (actionData?.success && actionData.requestId) {
      setSupportRequestId(actionData.requestId);
      setCurrentStep("complete");
      setError(null); // Clear any previous errors
    }
  }, [actionData]);

  // --- ACTIONS --- //

  const goToDiscord = useCallback(() => {
    setCurrentStep("discord-oauth");
    setError(null);
    setMessage(null);
    // WHY: Clear URL parameters to reset state
    window.history.replaceState({}, document.title, window.location.pathname);
  }, []);

  const goToSupportRequest = useCallback(() => {
    setCurrentStep("support-request");
    setError(null);
  }, []);

  const handleSupportSubmitted = useCallback((requestId: string) => {
    setSupportRequestId(requestId);
    setCurrentStep("complete");
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const setLoadingState = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);

  // WHY: startOver is an alias for goToDiscord for better semantic meaning
  const startOver = goToDiscord;

  return {
    // State
    currentStep,
    verifiedDiscordUsername,
    supportRequestId,
    message,
    isLoading,
    error,
    // Actions
    goToDiscord,
    goToSupportRequest,
    handleSupportSubmitted,
    startOver,
    clearError,
    setLoading: setLoadingState,
  };
}

// --- UTILITY FUNCTIONS --- //

/**
 * Calculates the current step index for UI display
 *
 * Handles special cases where support-request and complete steps
 * don't correspond to visual step indicators.
 *
 * @param currentStep - Current step in the flow
 * @returns Zero-based index for step indicator
 *
 * @example
 * ```tsx
 * const stepIndex = getStepIndex('github-oauth'); // Returns 1
 * const completedSteps = SIGNUP_STEPS.slice(0, stepIndex + 1);
 * ```
 */
export function getStepIndex(currentStep: FormStep): number {
  // WHY: Support request and complete are not visual steps in the indicator
  switch (currentStep) {
    case "discord-oauth":
      return 0;
    case "github-oauth":
      return 1;
    case "support-request":
      return 0; // Show as first step when support needed
    case "complete":
      return 1; // Show as completed second step
    default:
      return 0;
  }
}

/**
 * Gets the total number of visual steps for progress indication
 *
 * @returns Number of steps to show in the step indicator
 */
export function getTotalSteps(): number {
  return SIGNUP_STEPS.length;
}
