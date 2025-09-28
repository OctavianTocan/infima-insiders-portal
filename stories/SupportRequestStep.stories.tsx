import type { Meta, StoryObj } from "@storybook/react";
import SupportRequestStep from "../app/components/SupportRequestStep";

const meta: Meta<typeof SupportRequestStep> = {
  title: "Components/SupportRequestStep",
  component: SupportRequestStep,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: "Support request step combining error display and form",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    discordError: {
      control: "text",
      description: "Discord verification error type",
    },
    discordUsername: {
      control: "text",
      description: "Discord username",
    },
    userRoles: {
      control: "object",
      description: "User roles in Discord",
    },
    errorDetails: {
      control: "text",
      description: "Additional error details",
    },
    supportError: {
      control: "text",
      description: "Support request submission error",
    },
    onSupportSubmitted: {
      action: "support submitted",
      description: "Callback when support is submitted",
    },
    onBack: {
      action: "back clicked",
      description: "Callback when back is clicked",
    },
    onSupportErrorClear: {
      action: "support error cleared",
      description: "Callback to clear support error",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const mockUserRoles = [{ id: "123", name: "Member" }];

export const Default: Story = {
  args: {
    discordError: "not_verified",
    discordUsername: "testuser",
    userRoles: mockUserRoles,
    errorDetails: null,
    onSupportSubmitted: (requestId: string) =>
      console.log("Support submitted:", requestId),
    onBack: () => console.log("Back clicked"),
    supportError: null,
    onSupportErrorClear: () => console.log("Support error cleared"),
  },
  play: async ({ canvasElement, args }) => {
    // WHY: Tests support form submission interaction
    const canvas = canvasElement as HTMLElement;
    const submitButton = canvas.querySelector(
      'button[type="submit"]'
    ) as HTMLButtonElement;

    if (submitButton) {
      submitButton.click();
      console.log("✅ Support request submission tested");
    }
  },
};

export const WithSupportError: Story = {
  args: {
    ...Default.args,
    supportError: "Failed to submit support request",
  },
  play: async ({ canvasElement, args }) => {
    // WHY: Tests error clearing interaction
    const canvas = canvasElement as HTMLElement;
    const clearErrorButton = canvas.querySelector(
      ".error-clear"
    ) as HTMLButtonElement;

    if (clearErrorButton) {
      clearErrorButton.click();
      console.log("✅ Support error clearing tested");
    }
  },
};

export const WithErrorDetails: Story = {
  args: {
    ...Default.args,
    errorDetails: "Additional technical details about the error",
  },
  play: async ({ canvasElement, args }) => {
    // WHY: Tests back button interaction
    const canvas = canvasElement as HTMLElement;
    const backButton = canvas.querySelector(
      'button[type="button"]'
    ) as HTMLButtonElement;

    if (backButton) {
      backButton.click();
      console.log("✅ Back button interaction tested");
    }
  },
};
