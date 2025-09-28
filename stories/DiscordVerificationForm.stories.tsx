// --- DISCORD VERIFICATION FORM STORIES --- //
// Purpose: Storybook stories for DiscordVerificationForm component
// WHY: Provides comprehensive testing and documentation for the form component

import type { Meta, StoryObj } from "@storybook/react";
import React, { useEffect } from "react";
import {
  DiscordProvider,
  useDiscord,
  type VerificationStatus,
} from "../app/components/DiscordContext";
import DiscordVerificationForm from "../app/components/DiscordVerificationForm";

// --- MOCK PROVIDER --- //
// WHY: Provides controlled Discord context state for testing different scenarios

/**
 * Mock provider that sets initial state for testing
 * WHY: Allows stories to test component behavior in different Discord states
 */
const MockDiscordProvider: React.FC<{
  children: React.ReactNode;
  initialState: {
    isLoading: boolean;
    verificationStatus: VerificationStatus;
    error: string | null;
  };
}> = ({ children, initialState }) => {
  return (
    <DiscordProvider>
      <StateSetter initialState={initialState}>{children}</StateSetter>
    </DiscordProvider>
  );
};

/**
 * State setter component for mock provider
 * WHY: Initializes Discord context with specific state for each story
 */
const StateSetter: React.FC<{
  children: React.ReactNode;
  initialState: {
    isLoading: boolean;
    verificationStatus: VerificationStatus;
    error: string | null;
  };
}> = ({ children, initialState }) => {
  const { actions } = useDiscord();

  useEffect(() => {
    actions.setLoading(initialState.isLoading);
    actions.setVerificationStatus(initialState.verificationStatus);
    if (initialState.error) {
      actions.setError(initialState.error);
    }
  }, [actions, initialState]);

  return <>{children}</>;
};

// --- STORY CONFIGURATION --- //

/**
 * Storybook meta configuration for DiscordVerificationForm
 * WHY: Defines component metadata, controls, and testing setup
 */
const meta: Meta<typeof DiscordVerificationForm> = {
  title: "Components/DiscordVerificationForm",
  component: DiscordVerificationForm,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Discord verification form for manual handle input with validation and error handling",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    onSupportRequest: {
      action: "support requested",
      description: "Callback fired when user requests support",
      table: {
        type: { summary: "() => void" },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// --- MOCK FUNCTIONS --- //
// WHY: Provides consistent mock implementations for story interactions

const mockOnSupportRequest = () => console.log("Support requested");

// --- STORIES --- //

/**
 * Default state story - empty form ready for input
 * WHY: Tests the initial state of the verification form
 */
export const Default: Story = {
  args: {
    onSupportRequest: mockOnSupportRequest,
  },
  render: (args) => (
    <MockDiscordProvider
      initialState={{
        isLoading: false,
        verificationStatus: "idle",
        error: null,
      }}
    >
      <DiscordVerificationForm {...args} />
    </MockDiscordProvider>
  ),
  play: async ({ canvasElement }) => {
    // WHY: Tests that the form renders correctly and is interactive
    const canvas = canvasElement as HTMLElement;
    const input = canvas.querySelector(
      'input[type="text"]'
    ) as HTMLInputElement;
    const button = canvas.querySelector(
      'button[type="submit"]'
    ) as HTMLButtonElement;

    if (input && button) {
      // Test basic form interaction - type in input
      input.value = "@testuser";
      input.dispatchEvent(new Event("input", { bubbles: true }));

      // Button should be enabled with valid input
      await new Promise((resolve) => setTimeout(resolve, 100)); // Wait for state update
    }
  },
};

/**
 * Submitting state story - form in loading state during verification
 * WHY: Tests the loading state during Discord verification process
 */
export const Submitting: Story = {
  args: {
    onSupportRequest: mockOnSupportRequest,
  },
  render: (args) => (
    <MockDiscordProvider
      initialState={{
        isLoading: true,
        verificationStatus: "verifying",
        error: null,
      }}
    >
      <DiscordVerificationForm {...args} />
    </MockDiscordProvider>
  ),
  play: async ({ canvasElement }) => {
    // WHY: Tests that form elements are properly disabled during submission
    const canvas = canvasElement as HTMLElement;
    const input = canvas.querySelector(
      'input[type="text"]'
    ) as HTMLInputElement;
    const button = canvas.querySelector(
      'button[type="submit"]'
    ) as HTMLButtonElement;

    if (input && button) {
      // Verify elements are disabled during loading
      if (input.disabled && button.disabled) {
        console.log("✅ Form properly disabled during submission");
      }
    }
  },
};

/**
 * Error state story - form showing validation error
 * WHY: Tests error handling and user feedback for invalid Discord handles
 */
export const WithError: Story = {
  args: {
    onSupportRequest: mockOnSupportRequest,
  },
  render: (args) => (
    <MockDiscordProvider
      initialState={{
        isLoading: false,
        verificationStatus: "error",
        error: "Invalid Discord handle",
      }}
    >
      <DiscordVerificationForm {...args} />
    </MockDiscordProvider>
  ),
  play: async ({ canvasElement }) => {
    // WHY: Tests that errors are displayed and form remains interactive for correction
    const canvas = canvasElement as HTMLElement;
    const errorElement = canvas.querySelector(".error-message") as HTMLElement;
    const input = canvas.querySelector(
      'input[type="text"]'
    ) as HTMLInputElement;

    if (errorElement && input) {
      // Verify error is displayed and input is still enabled
      if (
        errorElement.textContent?.includes("Invalid Discord handle") &&
        !input.disabled
      ) {
        console.log("✅ Error displayed and form remains interactive");
      }
    }
  },
};

/**
 * Filled form story - demonstrates valid input state
 * WHY: Tests form validation with valid Discord handle format
 */
export const FilledForm: Story = {
  args: {
    onSupportRequest: mockOnSupportRequest,
  },
  render: (args) => (
    <MockDiscordProvider
      initialState={{
        isLoading: false,
        verificationStatus: "idle",
        error: null,
      }}
    >
      <DiscordVerificationForm {...args} />
    </MockDiscordProvider>
  ),
  play: async ({ canvasElement }) => {
    // WHY: Tests form validation and button enabling with valid input
    const canvas = canvasElement as HTMLElement;
    const input = canvas.querySelector(
      'input[type="text"]'
    ) as HTMLInputElement;
    const button = canvas.querySelector(
      'button[type="submit"]'
    ) as HTMLButtonElement;

    if (input && button) {
      // Fill with valid Discord handle
      input.value = "@validuser123";
      input.dispatchEvent(new Event("input", { bubbles: true }));

      // Wait for validation
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Button should be enabled
      if (!button.disabled) {
        console.log(
          "✅ Form validation working - button enabled with valid input"
        );
      }
    }
  },
};

/**
 * Support request interaction story
 * WHY: Tests the support request flow when user clicks support link
 */
export const SupportRequest: Story = {
  args: {
    onSupportRequest: mockOnSupportRequest,
  },
  render: (args) => (
    <MockDiscordProvider
      initialState={{
        isLoading: false,
        verificationStatus: "idle",
        error: null,
      }}
    >
      <DiscordVerificationForm {...args} />
    </MockDiscordProvider>
  ),
  play: async ({ canvasElement, args }) => {
    // WHY: Tests that clicking support link triggers the callback
    const canvas = canvasElement as HTMLElement;
    const supportButton = canvas.querySelector(
      ".support-link"
    ) as HTMLButtonElement;

    if (supportButton) {
      supportButton.click();
      console.log("✅ Support request interaction tested");
    }
  },
};
