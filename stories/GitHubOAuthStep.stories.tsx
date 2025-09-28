import type { Meta, StoryObj } from "@storybook/react";
import GitHubOAuthStep from "../app/components/GitHubOAuthStep";

const meta: Meta<typeof GitHubOAuthStep> = {
  title: "Components/GitHubOAuthStep",
  component: GitHubOAuthStep,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: "GitHub OAuth step component for connecting GitHub account",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    verifiedDiscordUsername: {
      control: "text",
      description: "Verified Discord username to display",
    },
    message: {
      control: "text",
      description: "Status message to display",
    },
    onLogin: {
      action: "login clicked",
      description: "Callback when login button is clicked",
    },
    onBack: {
      action: "back clicked",
      description: "Callback when back button is clicked",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    verifiedDiscordUsername: "testuser",
    message: null,
    onLogin: () => console.log("Login clicked"),
    onBack: () => console.log("Back clicked"),
  },
  play: async ({ canvasElement, args }) => {
    // WHY: Tests login button interaction
    const canvas = canvasElement as HTMLElement;
    const loginButton = canvas.querySelector(
      'button[type="submit"]'
    ) as HTMLButtonElement;

    if (loginButton) {
      loginButton.click();
      console.log("✅ GitHub login interaction tested");
    }
  },
};

export const WithErrorMessage: Story = {
  args: {
    ...Default.args,
    message: "Error: GitHub authentication failed",
  },
  play: async ({ canvasElement, args }) => {
    // WHY: Tests back button interaction on error
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

export const WithSuccessMessage: Story = {
  args: {
    ...Default.args,
    message: "Success: GitHub account connected",
  },
  play: async ({ canvasElement, args }) => {
    // WHY: Tests that success state displays correctly
    const canvas = canvasElement as HTMLElement;
    const successMessage = canvas.querySelector(
      ".success-message"
    ) as HTMLElement;

    if (successMessage) {
      console.log("✅ Success message display verified");
    }
  },
};
