// --- REACT COMPONENT TYPES --- //
// Purpose: Standardized React component patterns and prop types
// WHY: Consistent typing across components improves maintainability and developer experience

import type { ReactNode, ComponentPropsWithoutRef } from "react";
import type { FormStep } from "../hooks/useSignupFlow";
import type { DiscordUserId, GitHubUsername } from "./branded";

// --- BASE COMPONENT PATTERNS --- //

/**
 * Base props that all components should accept
 * Enables consistent styling and testing patterns across the app
 */
export interface BaseComponentProps {
  /** Optional CSS class name for styling */
  className?: string;
  /** Optional test identifier for automated testing */
  "data-testid"?: string;
  /** Optional children elements */
  children?: ReactNode;
}

/**
 * Props for components that can be disabled
 * Common pattern for buttons, forms, and interactive elements
 */
export interface DisableableProps {
  /** Whether the component is disabled */
  disabled?: boolean;
  /** Loading state that usually implies disabled */
  loading?: boolean;
}

/**
 * Props for components with loading states
 * Standardizes loading UI patterns across the application
 */
export interface LoadingProps {
  /** Whether the component is in loading state */
  loading?: boolean;
  /** Optional loading message to display */
  loadingMessage?: string;
}

/**
 * Props for error handling in components
 * Consistent error display patterns
 */
export interface ErrorProps {
  /** Error message to display */
  error?: string | null;
  /** Callback to clear/dismiss the error */
  onErrorDismiss?: () => void;
}

// --- FORM COMPONENT TYPES --- //

/**
 * Standard form field props
 * WHY: Ensures consistent form validation and accessibility
 */
export interface FormFieldProps extends BaseComponentProps {
  /** Field label for accessibility */
  label: string;
  /** Field name for form submission */
  name: string;
  /** Whether the field is required */
  required?: boolean;
  /** Field validation error message */
  error?: string;
  /** Help text to display below the field */
  helpText?: string;
}

/**
 * Props for form submission handling
 * Standardizes form submission patterns
 */
export interface FormSubmissionProps {
  /** Whether the form is submitting */
  isSubmitting?: boolean;
  /** Callback for form submission */
  onSubmit: (data: FormData) => void | Promise<void>;
  /** Callback for form reset */
  onReset?: () => void;
}

// --- STEP COMPONENT TYPES --- //

/**
 * Common props for signup flow step components
 * WHY: Ensures all steps have consistent navigation and state management
 */
export interface StepComponentProps
  extends BaseComponentProps,
    ErrorProps,
    LoadingProps {
  /** Current step in the flow */
  currentStep: FormStep;
  /** Optional message to display */
  message?: string | null;
  /** Callback to go back to previous step */
  onBack?: () => void;
  /** Callback to proceed to next step */
  onNext?: () => void;
}

/**
 * Props specific to Discord-related step components
 */
export interface DiscordStepProps extends StepComponentProps {
  /** Discord username if available */
  discordUsername?: string | null;
  /** Discord user ID if available */
  discordId?: DiscordUserId | null;
  /** User roles from Discord */
  userRoles?: Array<{ id: string; name: string }>;
  /** Discord verification error details */
  discordError?: string | null;
  /** Additional error details */
  errorDetails?: string | null;
}

/**
 * Props specific to GitHub-related step components
 */
export interface GitHubStepProps extends StepComponentProps {
  /** Verified Discord username to display */
  verifiedDiscordUsername?: string;
  /** GitHub username if available */
  githubUsername?: GitHubUsername | null;
  /** GitHub OAuth configuration */
  githubConfig?: {
    clientId: string;
    redirectUri: string;
  };
  /** Callback for GitHub login initiation */
  onGitHubLogin?: () => void;
}

// --- BUTTON COMPONENT TYPES --- //

/**
 * Standard button component props
 * WHY: Consistent button behavior and styling across the app
 */
export interface ButtonProps
  extends BaseComponentProps,
    DisableableProps,
    ComponentPropsWithoutRef<"button"> {
  /** Button visual variant */
  variant?: "primary" | "secondary" | "danger" | "ghost";
  /** Button size variant */
  size?: "small" | "medium" | "large";
  /** Icon to display (left side) */
  icon?: ReactNode;
  /** Icon to display (right side) */
  rightIcon?: ReactNode;
  /** Whether button should take full width */
  fullWidth?: boolean;
}

/**
 * Props for OAuth login buttons
 * Specialized button type for OAuth providers
 */
export interface OAuthButtonProps extends Omit<ButtonProps, "variant"> {
  /** OAuth provider name */
  provider: "discord" | "github";
  /** OAuth provider display name */
  providerName?: string;
  /** OAuth login callback */
  onLogin: () => void;
  /** Whether OAuth flow is in progress */
  isAuthenticating?: boolean;
}

// --- UTILITY TYPES FOR COMPONENTS --- //

/**
 * Props that exclude certain HTML attributes
 * WHY: Prevents passing invalid props to DOM elements
 */
export type PropsWithoutHTML<T, K extends keyof any> = Omit<T, K> &
  BaseComponentProps;

/**
 * Polymorphic component props
 * Allows components to render as different HTML elements
 */
export type PolymorphicProps<T extends React.ElementType> = {
  as?: T;
} & ComponentPropsWithoutRef<T>;

/**
 * Event handler types for common component interactions
 */
export interface ComponentEventHandlers {
  /** Generic click handler */
  onClick?: () => void;
  /** Form submission handler */
  onSubmit?: (data: FormData) => void | Promise<void>;
  /** Input change handler */
  onChange?: (value: string) => void;
  /** Focus handler */
  onFocus?: () => void;
  /** Blur handler */
  onBlur?: () => void;
}

// --- CONTEXT TYPES --- //

/**
 * Standard context value shape
 * WHY: Consistent pattern for React contexts across the app
 */
export interface ContextValue<TState, TActions = {}> {
  /** Current context state */
  state: TState;
  /** Available actions to modify state */
  actions: TActions;
}

/**
 * Context provider component props
 */
export interface ContextProviderProps extends BaseComponentProps {
  /** Child components that will receive the context */
  children: ReactNode;
}
