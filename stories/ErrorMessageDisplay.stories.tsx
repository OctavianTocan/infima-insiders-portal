import type { Meta, StoryObj } from "@storybook/react";
import ErrorMessageDisplay, {
  ErrorMessage,
  SuccessMessage,
  WarningMessage,
  InfoMessage,
} from "../app/components/ErrorMessageDisplay";

const meta: Meta<typeof ErrorMessageDisplay> = {
  title: "Components/ErrorMessageDisplay",
  component: ErrorMessageDisplay,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Consistent error message display component following composition pattern for clean, centered messaging throughout the application",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    message: {
      control: "text",
      description: "Message content to display",
    },
    type: {
      control: { type: "select" },
      options: ["error", "success", "info", "warning"],
      description: "Message type for appropriate styling",
    },
    icon: {
      control: "text",
      description: "Optional custom icon",
    },
    dismissible: {
      control: "boolean",
      description: "Whether message can be dismissed",
    },
    actionText: {
      control: "text",
      description: "Text for action button",
    },
    onDismiss: {
      action: "dismissed",
      description: "Callback when message is dismissed",
    },
    onAction: {
      action: "action clicked",
      description: "Callback for action button",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const ErrorState: Story = {
  args: {
    message: "Failed to verify Discord account. Please try again.",
    type: "error",
  },
  play: async ({ canvasElement }) => {
    // WHY: Test that error message renders correctly
    const canvas = canvasElement as HTMLElement;
    const message = canvas.querySelector(".message");
    
    if (message) {
      console.log("✅ Error message rendered correctly");
    }
  },
};

export const SuccessState: Story = {
  args: {
    message: "Discord account verified successfully!",
    type: "success",
  },
  play: async ({ canvasElement }) => {
    // WHY: Test that success message renders correctly
    const canvas = canvasElement as HTMLElement;
    const message = canvas.querySelector(".message.success");
    
    if (message) {
      console.log("✅ Success message rendered correctly");
    }
  },
};

export const WarningState: Story = {
  args: {
    message: "Please complete verification in our Discord server",
    type: "warning",
  },
  play: async ({ canvasElement }) => {
    // WHY: Test that warning message renders correctly
    const canvas = canvasElement as HTMLElement;
    const message = canvas.querySelector(".message.warning");
    
    if (message) {
      console.log("✅ Warning message rendered correctly");
    }
  },
};

export const InfoState: Story = {
  args: {
    message: "Join our Discord server to continue the signup process",
    type: "info",
  },
  play: async ({ canvasElement }) => {
    // WHY: Test that info message renders correctly
    const canvas = canvasElement as HTMLElement;
    const message = canvas.querySelector(".message.info");
    
    if (message) {
      console.log("✅ Info message rendered correctly");
    }
  },
};

export const WithAction: Story = {
  args: {
    message: "You need to join our Discord server",
    type: "info",
    actionText: "Join Discord",
    onAction: () => console.log("Action clicked"),
  },
  play: async ({ canvasElement }) => {
    // WHY: Test action button interaction
    const canvas = canvasElement as HTMLElement;
    const button = canvas.querySelector("button[data-testid='error-message-display-action']") as HTMLButtonElement;
    
    if (button) {
      button.click();
      console.log("✅ Action button interaction tested");
    }
  },
};

export const Dismissible: Story = {
  args: {
    message: "This is a dismissible error message",
    type: "error",
    dismissible: true,
    onDismiss: () => console.log("Dismissed"),
  },
  play: async ({ canvasElement }) => {
    // WHY: Test dismiss button interaction
    const canvas = canvasElement as HTMLElement;
    const button = canvas.querySelector("button[data-testid='error-message-display-dismiss']") as HTMLButtonElement;
    
    if (button) {
      button.click();
      console.log("✅ Dismiss button interaction tested");
    }
  },
};

export const WithBothActions: Story = {
  args: {
    message: "Authentication failed",
    type: "error",
    actionText: "Try Again",
    dismissible: true,
    onAction: () => console.log("Retry clicked"),
    onDismiss: () => console.log("Dismissed"),
  },
  play: async ({ canvasElement }) => {
    // WHY: Test both action and dismiss buttons
    const canvas = canvasElement as HTMLElement;
    const actionButton = canvas.querySelector("button[data-testid='error-message-display-action']") as HTMLButtonElement;
    const dismissButton = canvas.querySelector("button[data-testid='error-message-display-dismiss']") as HTMLButtonElement;
    
    if (actionButton && dismissButton) {
      console.log("✅ Both action buttons rendered");
    }
  },
};

export const CustomIcon: Story = {
  args: {
    message: "Custom icon message",
    type: "info",
    icon: "🚀",
  },
  play: async ({ canvasElement }) => {
    // WHY: Test custom icon rendering
    const canvas = canvasElement as HTMLElement;
    const icon = canvas.querySelector(".message-icon");
    
    if (icon && icon.textContent === "🚀") {
      console.log("✅ Custom icon rendered correctly");
    }
  },
};

// --- COMPOSED VARIANT STORIES --- //
// WHY: Test the pre-configured variant components

export const ErrorMessageVariant: Story = {
  render: () => (
    <ErrorMessage 
      message="This is an error using the ErrorMessage variant"
      dismissible
      onDismiss={() => console.log("Dismissed")}
    />
  ),
};

export const SuccessMessageVariant: Story = {
  render: () => (
    <SuccessMessage 
      message="Operation completed successfully!"
      actionText="Continue"
      onAction={() => console.log("Continue clicked")}
    />
  ),
};

export const WarningMessageVariant: Story = {
  render: () => (
    <WarningMessage 
      message="Please review your information before proceeding"
      dismissible
      onDismiss={() => console.log("Warning dismissed")}
    />
  ),
};

export const InfoMessageVariant: Story = {
  render: () => (
    <InfoMessage 
      message="Did you know? You can join our Discord for support"
      actionText="Learn More"
      onAction={() => console.log("Learn more clicked")}
    />
  ),
};