import React from 'react';
import type { FormStep } from '../hooks/useSignupFlow';
import { SIGNUP_STEPS, getStepIndex } from '../hooks/useSignupFlow';

interface StepIndicatorProps {
  /** Current step in the signup flow */
  currentStep: FormStep;
}

/**
 * Visual indicator showing progress through the signup steps.
 * Displays step dots with numbers and highlights current/completed steps.
 */
export function StepIndicator({ currentStep }: StepIndicatorProps) {
  const currentIndex = getStepIndex(currentStep);

  return (
    <div className="step-dots">
      {SIGNUP_STEPS.map((step, idx) => (
        <div
          key={step.key}
          className={`step-dot ${
            idx === currentIndex ? 'active' : ''
          } ${
            idx < currentIndex ? 'completed' : ''
          }`}
        >
          <span className="step-number">{idx + 1}</span>
        </div>
      ))}
    </div>
  );
}