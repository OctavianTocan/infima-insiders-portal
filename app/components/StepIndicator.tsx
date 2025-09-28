// --- STEP INDICATOR COMPONENT --- //
/**
 * StepIndicator component for displaying progress through multi-step flows
 *
 * This component provides visual feedback about the user's progress through
 * a multi-step process. It highlights the current step and shows completion
 * status for previous steps.
 *
 * @module StepIndicator
 */

import type { ReactElement } from "react";
import type { FormStep } from "../hooks/useSignupFlow";
import type { BaseComponentProps } from "../types/react";
import { SIGNUP_STEPS, getStepIndex } from "../hooks/useSignupFlow";

// --- COMPONENT PROPS --- //

/**
 * Props for the StepIndicator component
 *
 * @interface StepIndicatorProps
 * @extends BaseComponentProps
 */
interface StepIndicatorProps extends BaseComponentProps {
  /** Current step in the signup flow */
  currentStep: FormStep;
  /** Optional size variant for different contexts */
  size?: "small" | "medium" | "large";
  /** Optional orientation for different layouts */
  orientation?: "horizontal" | "vertical";
}

/**
 * Individual step dot props for internal use
 */
interface StepDotProps extends BaseComponentProps {
  /** Step index (zero-based) */
  index: number;
  /** Step configuration object */
  step: (typeof SIGNUP_STEPS)[number];
  /** Whether this step is currently active */
  isActive: boolean;
  /** Whether this step has been completed */
  isCompleted: boolean;
  /** Size variant passed from parent */
  size: NonNullable<StepIndicatorProps["size"]>;
}

// --- SUB-COMPONENTS --- //

/**
 * Individual step dot component
 *
 * Renders a single step indicator with number and styling based on state.
 * Separated into its own component for reusability and cleaner JSX.
 *
 * @param props - StepDot configuration and state
 * @returns JSX element for a single step dot
 */
function StepDot({
  index,
  step,
  isActive,
  isCompleted,
  size,
  className = "",
  "data-testid": testId,
}: StepDotProps): ReactElement {
  // WHY: Combine multiple CSS classes based on component state
  // This approach is more maintainable than inline styles
  const dotClasses = [
    "step-dot",
    `step-dot--${size}`,
    isActive && "step-dot--active",
    isCompleted && "step-dot--completed",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <li
      className={dotClasses}
      data-testid={testId || `step-dot-${step.key}`}
      // WHY: ARIA attributes improve accessibility for screen readers
      aria-current={isActive ? "step" : undefined}
      aria-label={`Step ${index + 1}: ${step.label}${isCompleted ? " (completed)" : ""}`}
    >
      <span
        className="step-dot__number"
        aria-hidden="true" // WHY: Number is decorative, label provides the info
      >
        {index + 1}
      </span>
      <span className="step-dot__label">{step.label}</span>
    </li>
  );
}

// --- MAIN COMPONENT --- //

/**
 * StepIndicator component for showing progress through signup flow
 *
 * Displays a series of numbered dots representing the steps in the signup process.
 * Highlights the current step and shows completion status for previous steps.
 * Supports different sizes and orientations for various layout contexts.
 *
 * The component automatically calculates which steps are completed based on
 * the current step position, providing a clear visual progression indicator.
 *
 * @param props - StepIndicator configuration
 * @returns JSX element showing step progress
 *
 * @example
 * ```tsx
 * // Basic usage
 * <StepIndicator currentStep="github-oauth" />
 *
 * // With custom styling
 * <StepIndicator
 *   currentStep="support-request"
 *   size="large"
 *   orientation="vertical"
 *   className="custom-stepper"
 * />
 * ```
 */
export function StepIndicator({
  currentStep,
  size = "medium",
  orientation = "horizontal",
  className = "",
  "data-testid": testId = "step-indicator",
}: StepIndicatorProps): ReactElement {
  // WHY: Calculate current index once to avoid repeated calls
  const currentIndex = getStepIndex(currentStep);

  // WHY: Combine classes based on props for flexible styling
  const containerClasses = [
    "step-indicator",
    `step-indicator--${size}`,
    `step-indicator--${orientation}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <ol
      className={containerClasses}
      data-testid={testId}
      // WHY: ARIA attributes for accessibility
      aria-label="Signup progress"
    >
      {SIGNUP_STEPS.map((step, index) => {
        // WHY: Calculate state for each step to determine styling
        const isActive = index === currentIndex;
        const isCompleted = index < currentIndex;

        return (
          <StepDot
            key={step.key}
            index={index}
            step={step}
            isActive={isActive}
            isCompleted={isCompleted}
            size={size}
            data-testid={`${testId}-${step.key}`}
          />
        );
      })}
    </ol>
  );
}
