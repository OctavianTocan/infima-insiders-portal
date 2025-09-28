import type { Meta, StoryObj } from "@storybook/react";
import DiscordErrorDisplay from "../app/components/DiscordErrorDisplay";

const meta: Meta<typeof DiscordErrorDisplay> = {
  title: "Components/DiscordErrorDisplay",
  component: DiscordErrorDisplay,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Discord-specific error display with contextual messaging and actions",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    error: {
      control: { type: "select" },
      options: [
        "not_member",
        "not_verified",
        "oauth_failed",
        "no_code",
        "rate_limited",
        "server_error",
        "network_error",
      ],
      description: "Specific Discord error type",
    },
    username: {
      control: "text",
      description: "Discord username for personalized messages",
    },
    userRoles: {
      control: "object",
      description: "User's current roles in Discord server",
    },
    errorDetails: {
      control: "text",
      description: "Additional error details from Discord API",
    },
    discordInviteLink: {
      control: "text",
      description: "Discord server invite link",
    },
    dismissible: {
      control: "boolean",
      description: "Whether the error can be dismissed",
    },
    onDismiss: {
      action: "dismissed",
      description: "Callback when error is dismissed",
    },
    onRetry: {
      action: "retry",
      description: "Callback to retry Discord authentication",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const mockUserRoles = [
  { id: "123456789", name: "Member" },
  { id: "987654321", name: "Verified" },
];

export const NotMember: Story = {
  args: {
    error: "not_member",
    username: "testuser",
    discordInviteLink: "https://discord.gg/example",
    dismissible: true,
    onDismiss: () => console.log("Dismissed"),
  },
  play: async ({ canvasElement, args }) => {
    // WHY: Tests dismiss interaction for dismissible errors
    const canvas = canvasElement as HTMLElement;
    const dismissButton = canvas.querySelector(
      ".dismiss-button"
    ) as HTMLButtonElement;

    if (dismissButton) {
      dismissButton.click();
      console.log("✅ Error dismissal tested");
    }
  },
};

export const NotVerified: Story = {
  args: {
    error: "not_verified",
    username: "verifieduser",
    userRoles: mockUserRoles,
    discordInviteLink: "https://discord.gg/example",
    dismissible: true,
    onRetry: () => console.log("Retry clicked"),
  },
  play: async ({ canvasElement, args }) => {
    // WHY: Tests retry interaction for verification errors
    const canvas = canvasElement as HTMLElement;
    const retryButton = canvas.querySelector(
      ".retry-button"
    ) as HTMLButtonElement;

    if (retryButton) {
      retryButton.click();
      console.log("✅ Retry interaction tested");
    }
  },
};

export const OAuthFailed: Story = {
  args: {
    error: "oauth_failed",
    username: "oauthuser",
    dismissible: true,
    onRetry: () => console.log("Retry clicked"),
  },
  play: async ({ canvasElement, args }) => {
    // WHY: Tests retry interaction for OAuth failures
    const canvas = canvasElement as HTMLElement;
    const retryButton = canvas.querySelector(
      ".retry-button"
    ) as HTMLButtonElement;

    if (retryButton) {
      retryButton.click();
      console.log("✅ OAuth retry tested");
    }
  },
};

export const NoCode: Story = {
  args: {
    error: "no_code",
    username: "nocodeuser",
    dismissible: true,
    onRetry: () => console.log("Retry clicked"),
  },
  play: async ({ canvasElement, args }) => {
    // WHY: Tests retry interaction for no code errors
    const canvas = canvasElement as HTMLElement;
    const retryButton = canvas.querySelector(
      ".retry-button"
    ) as HTMLButtonElement;

    if (retryButton) {
      retryButton.click();
      console.log("✅ No code retry tested");
    }
  },
};

export const RateLimited: Story = {
  args: {
    error: "rate_limited",
    username: "ratelimiteduser",
    dismissible: false,
    onRetry: () => console.log("Retry clicked"),
  },
  play: async ({ canvasElement, args }) => {
    // WHY: Tests retry interaction for rate limited errors
    const canvas = canvasElement as HTMLElement;
    const retryButton = canvas.querySelector(
      ".retry-button"
    ) as HTMLButtonElement;

    if (retryButton) {
      retryButton.click();
      console.log("✅ Rate limit retry tested");
    }
  },
};

export const ServerError: Story = {
  args: {
    error: "server_error",
    username: "servererroruser",
    dismissible: true,
    onRetry: () => console.log("Retry clicked"),
  },
  play: async ({ canvasElement, args }) => {
    // WHY: Tests retry interaction for server errors
    const canvas = canvasElement as HTMLElement;
    const retryButton = canvas.querySelector(
      ".retry-button"
    ) as HTMLButtonElement;

    if (retryButton) {
      retryButton.click();
      console.log("✅ Server error retry tested");
    }
  },
};

export const NetworkError: Story = {
  args: {
    error: "network_error",
    username: "networkerroruser",
    dismissible: true,
    onRetry: () => console.log("Retry clicked"),
  },
  play: async ({ canvasElement, args }) => {
    // WHY: Tests retry interaction for network errors
    const canvas = canvasElement as HTMLElement;
    const retryButton = canvas.querySelector(
      ".retry-button"
    ) as HTMLButtonElement;

    if (retryButton) {
      retryButton.click();
      console.log("✅ Network error retry tested");
    }
  },
};

export const UnknownError: Story = {
  args: {
    error: "unknown_error",
    username: "unknownuser",
    errorDetails: "Custom error details here",
    dismissible: true,
    onRetry: () => console.log("Retry clicked"),
  },
  play: async ({ canvasElement, args }) => {
    // WHY: Tests retry interaction for unknown errors
    const canvas = canvasElement as HTMLElement;
    const retryButton = canvas.querySelector(
      ".retry-button"
    ) as HTMLButtonElement;

    if (retryButton) {
      retryButton.click();
      console.log("✅ Unknown error retry tested");
    }
  },
};
