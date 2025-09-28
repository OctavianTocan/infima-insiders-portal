import type { Meta, StoryObj } from "@storybook/react";
import CompleteStep from "../app/components/CompleteStep";

const meta: Meta<typeof CompleteStep> = {
  title: "Components/CompleteStep",
  component: CompleteStep,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "Completion step component for signup flow success states",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    supportRequestId: {
      control: "text",
      description:
        "ID of the submitted support request (shows support completion)",
    },
    onStartOver: {
      action: "start over clicked",
      description: "Callback when user wants to start the process over",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const GitHubOAuthSuccess: Story = {
  args: {
    supportRequestId: undefined,
    onStartOver: undefined,
  },
};

export const SupportRequestCompleted: Story = {
  args: {
    supportRequestId: "REQ-12345",
    onStartOver: () => console.log("Start over clicked"),
  },
  play: async ({ canvasElement, args }) => {
    // WHY: Tests start over interaction for support request completion
    const canvas = canvasElement as HTMLElement;
    const startOverButton = canvas.querySelector("button") as HTMLButtonElement;

    if (startOverButton) {
      startOverButton.click();
      console.log("✅ Start over interaction tested");
    }
  },
};
