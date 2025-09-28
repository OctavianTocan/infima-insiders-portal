import type { Meta, StoryObj } from "@storybook/react";
import React, { useEffect } from "react";
import {
  DiscordProvider,
  useDiscord,
  type VerificationStatus,
} from "../app/components/DiscordContext";
import DiscordVerificationFlow from "../app/components/DiscordVerificationFlow";

// Mock provider that sets initial state
const MockDiscordProvider: React.FC<{
  children: React.ReactNode;
  initialState: { isLoading: boolean; verificationStatus: VerificationStatus };
}> = ({ children, initialState }) => {
  return (
    <DiscordProvider>
      <StateSetter initialState={initialState}>{children}</StateSetter>
    </DiscordProvider>
  );
};

const StateSetter: React.FC<{
  children: React.ReactNode;
  initialState: { isLoading: boolean; verificationStatus: VerificationStatus };
}> = ({ children, initialState }) => {
  const { actions } = useDiscord();

  useEffect(() => {
    actions.setLoading(initialState.isLoading);
    actions.setVerificationStatus(initialState.verificationStatus);
  }, [actions, initialState]);

  return <>{children}</>;
};

const meta: Meta<typeof DiscordVerificationFlow> = {
  title: "Components/DiscordVerificationFlow",
  component: DiscordVerificationFlow,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Complete Discord verification flow component with multiple steps",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <MockDiscordProvider
      initialState={{ isLoading: false, verificationStatus: "idle" }}
    >
      <DiscordVerificationFlow />
    </MockDiscordProvider>
  ),
};
