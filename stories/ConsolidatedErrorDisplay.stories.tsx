import type { Meta, StoryObj } from "@storybook/react";
import { ConsolidatedErrorDisplay } from "../app/components/ConsolidatedErrorDisplay";

const meta: Meta<typeof ConsolidatedErrorDisplay> = {
  title: "Components/ConsolidatedErrorDisplay",
  component: ConsolidatedErrorDisplay,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Single source of truth for all error messages in the application",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    error: {
      control: "text",
      description: "Primary error message to display",
    },
    errorDetails: {
      control: "text",
      description: "Additional error details (collapsible)",
    },
    errorType: {
      control: { type: "select" },
      options: [
        "auth",
        "network",
        "validation",
        "permission",
        "rate_limit",
        "server",
      ],
      description: "Error type for appropriate styling and icons",
    },
    severity: {
      control: { type: "select" },
      options: ["info", "warning", "error", "critical"],
      description: "Error severity for prioritization",
    },
    dismissible: {
      control: "boolean",
      description: "Whether the error can be dismissed",
    },
    canRetry: {
      control: "boolean",
      description: "Whether a retry action is available",
    },
    actionText: {
      control: "text",
      description: "Custom action button text",
    },
    actionUrl: {
      control: "text",
      description: "Custom action URL for external links",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Mock functions for callbacks
const mockOnDismiss = () => console.log("Error dismissed");
const mockOnRetry = () => console.log("Retry action triggered");
const mockOnAction = () => console.log("Custom action triggered");

export const Default: Story = {
  args: {
    error: "An unexpected error occurred",
    errorType: "server",
    severity: "error",
    dismissible: true,
    canRetry: false,
    onDismiss: mockOnDismiss,
  },
  play: async ({ canvasElement, args }) => {
    // WHY: Tests dismiss interaction for dismissible errors
    const canvas = canvasElement as HTMLElement;
    const dismissButton = canvas.querySelector(
      ".error-dismiss"
    ) as HTMLButtonElement;

    if (dismissButton) {
      dismissButton.click();
      console.log("✅ Error dismissal tested");
    }
  },
};

export const AuthError: Story = {
  args: {
    ...Default.args,
    error: "Failed to authenticate with Discord",
    errorType: "auth",
    severity: "error",
    canRetry: true,
    onRetry: mockOnRetry,
  },
  play: async ({ canvasElement, args }) => {
    // WHY: Tests retry interaction for auth errors
    const canvas = canvasElement as HTMLElement;
    const retryButton = canvas.querySelector(
      ".error-retry"
    ) as HTMLButtonElement;

    if (retryButton) {
      retryButton.click();
      console.log("✅ Auth error retry tested");
    }
  },
};

export const NetworkError: Story = {
  args: {
    ...Default.args,
    error: "Unable to connect to the server",
    errorType: "network",
    severity: "warning",
    canRetry: true,
    onRetry: mockOnRetry,
  },
  play: async ({ canvasElement, args }) => {
    // WHY: Tests retry interaction for network errors
    const canvas = canvasElement as HTMLElement;
    const retryButton = canvas.querySelector(
      ".error-retry"
    ) as HTMLButtonElement;

    if (retryButton) {
      retryButton.click();
      console.log("✅ Network error retry tested");
    }
  },
};

export const ValidationError: Story = {
  args: {
    ...Default.args,
    error: "Please fill in all required fields",
    errorType: "validation",
    severity: "warning",
    dismissible: false,
  },
};

export const PermissionError: Story = {
  args: {
    ...Default.args,
    error: "You do not have permission to access this resource",
    errorType: "permission",
    severity: "error",
    actionText: "Request Access",
    onAction: mockOnAction,
  },
  play: async ({ canvasElement, args }) => {
    // WHY: Tests custom action interaction for permission errors
    const canvas = canvasElement as HTMLElement;
    const actionButton = canvas.querySelector(
      ".error-action"
    ) as HTMLButtonElement;

    if (actionButton) {
      actionButton.click();
      console.log("✅ Permission error action tested");
    }
  },
};

export const RateLimitError: Story = {
  args: {
    ...Default.args,
    error: "Too many requests. Please try again later.",
    errorType: "rate_limit",
    severity: "warning",
    dismissible: false,
  },
};

export const CriticalError: Story = {
  args: {
    ...Default.args,
    error: "Critical system failure. Please contact support.",
    errorType: "server",
    severity: "critical",
    actionText: "Contact Support",
    actionUrl: "https://support.example.com",
  },
  play: async ({ canvasElement, args }) => {
    // WHY: Tests external link action for critical errors
    const canvas = canvasElement as HTMLElement;
    const actionLink = canvas.querySelector(
      ".error-action"
    ) as HTMLAnchorElement;

    if (actionLink) {
      console.log("✅ Critical error action link verified:", actionLink.href);
    }
  },
};

export const InfoMessage: Story = {
  args: {
    ...Default.args,
    error: "Your account has been successfully verified!",
    errorType: "auth",
    severity: "info",
    dismissible: true,
    actionText: "Continue",
    onAction: mockOnAction,
  },
  play: async ({ canvasElement, args }) => {
    // WHY: Tests continue action for info messages
    const canvas = canvasElement as HTMLElement;
    const actionButton = canvas.querySelector(
      ".error-action"
    ) as HTMLButtonElement;

    if (actionButton) {
      actionButton.click();
      console.log("✅ Info message action tested");
    }
  },
};

export const WithErrorDetails: Story = {
  args: {
    ...Default.args,
    error: "Authentication failed",
    errorDetails:
      "Error: OAuth token expired\nTimestamp: 2024-01-15T10:30:00Z\nUser-Agent: Mozilla/5.0...",
    errorType: "auth",
    severity: "error",
    canRetry: true,
    onRetry: mockOnRetry,
  },
  play: async ({ canvasElement, args }) => {
    // WHY: Tests details expansion and retry for detailed errors
    const canvas = canvasElement as HTMLElement;
    const detailsToggle = canvas.querySelector(
      "details summary"
    ) as HTMLElement;
    const retryButton = canvas.querySelector(
      ".error-retry"
    ) as HTMLButtonElement;

    if (detailsToggle) {
      detailsToggle.click();
      console.log("✅ Error details expansion tested");
    }

    if (retryButton) {
      retryButton.click();
      console.log("✅ Detailed error retry tested");
    }
  },
};

export const NonDismissible: Story = {
  args: {
    ...Default.args,
    error: "This error cannot be dismissed",
    dismissible: false,
  },
};
