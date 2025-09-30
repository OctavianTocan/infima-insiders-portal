import type { Meta, StoryObj } from "@storybook/react";
import SupportRequestForm from "../app/components/SupportRequestForm";

const meta: Meta<typeof SupportRequestForm> = {
  title: "Components/SupportRequestForm",
  component: SupportRequestForm,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Support request form for Discord verification issues with email follow-up",
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
  play: async ({ canvasElement }) => {
    const canvas = canvasElement as HTMLElement;
    const emailInput = canvas.querySelector(
      'input[name="email"]'
    ) as HTMLInputElement | null;
    const messageInput = canvas.querySelector(
      'textarea[name="message"]'
    ) as HTMLTextAreaElement | null;

    if (emailInput) {
      emailInput.value = "player@example.com";
      emailInput.dispatchEvent(new Event("input", { bubbles: true }));
    }

    if (messageInput) {
      messageInput.value = "I cannot finish the Discord verification.";
      messageInput.dispatchEvent(new Event("input", { bubbles: true }));
    }

    const submitButton = canvas.querySelector(
      'button[type="submit"]'
    ) as HTMLButtonElement | null;

    if (submitButton) {
      submitButton.click();
      console.log("Support form submission tested");
    }
  },
};

export const WithSubmissionError: Story = {
  args: {
    ...Default.args,
    submissionError: "Failed to submit support request. Please try again.",
  },
  play: async ({ canvasElement }) => {
    const canvas = canvasElement as HTMLElement;
    const clearErrorButton = canvas.querySelector(
      ".error-clear-button"
    ) as HTMLButtonElement;

    if (clearErrorButton) {
      clearErrorButton.click();
      console.log("Error clearing tested");
    }
  },
};

export const WithDifferentError: Story = {
  args: {
    ...Default.args,
    verificationError: "Rate limited by Discord API",
  },
  play: async ({ canvasElement }) => {
    const canvas = canvasElement as HTMLElement;
    const backButton = canvas.querySelector(
      'button[type="button"]'
    ) as HTMLButtonElement;

    if (backButton) {
      backButton.click();
      console.log("Back button tested");
    }
  },
};
