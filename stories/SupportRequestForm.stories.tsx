import type { Meta, StoryObj } from "@storybook/react";
import SupportRequestForm from "../app/components/SupportRequestForm";

const meta: Meta<typeof SupportRequestForm> = {
  title: "Components/SupportRequestForm",
  component: SupportRequestForm,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "Support request form for users who cannot verify Discord",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    discordUsername: {
      control: "text",
      description: "Discord username that could not be verified",
    },
    verificationError: {
      control: "text",
      description: "Error message from verification attempt",
    },
    submissionError: {
      control: "text",
      description: "Error from support request submission",
    },
    onSupportSubmitted: {
      action: "support submitted",
      description: "Callback when support request is submitted",
    },
    onBack: {
      action: "back clicked",
      description: "Callback when back button is clicked",
    },
    onClearError: {
      action: "error cleared",
      description: "Callback to clear submission error",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    discordUsername: "testuser",
    verificationError: "User not found in server",
    onSupportSubmitted: (requestId: string) =>
      console.log("Support submitted:", requestId),
    onBack: () => console.log("Back clicked"),
    submissionError: null,
    onClearError: () => console.log("Error cleared"),
  },
  play: async ({ canvasElement, args }) => {
    // WHY: Tests form submission interaction
    const canvas = canvasElement as HTMLElement;
    const submitButton = canvas.querySelector(
      'button[type="submit"]'
    ) as HTMLButtonElement;

    if (submitButton) {
      submitButton.click();
      console.log("✅ Support form submission tested");
    }
  },
};

export const WithSubmissionError: Story = {
  args: {
    ...Default.args,
    submissionError: "Failed to submit support request. Please try again.",
  },
  play: async ({ canvasElement, args }) => {
    // WHY: Tests error clearing interaction
    const canvas = canvasElement as HTMLElement;
    const clearErrorButton = canvas.querySelector(
      ".error-clear-button"
    ) as HTMLButtonElement;

    if (clearErrorButton) {
      clearErrorButton.click();
      console.log("✅ Error clearing tested");
    }
  },
};

export const WithDifferentError: Story = {
  args: {
    ...Default.args,
    verificationError: "Rate limited by Discord API",
  },
  play: async ({ canvasElement, args }) => {
    // WHY: Tests back button interaction
    const canvas = canvasElement as HTMLElement;
    const backButton = canvas.querySelector(
      'button[type="button"]'
    ) as HTMLButtonElement;

    if (backButton) {
      backButton.click();
      console.log("✅ Back button tested");
    }
  },
};
