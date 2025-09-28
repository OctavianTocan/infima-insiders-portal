import type { Meta, StoryObj } from "@storybook/react";
import React, { useEffect } from "react";
import {
  DiscordProvider,
  useDiscord,
  type VerificationStatus,
} from "../app/components/DiscordContext";
import DiscordOAuthStep, {
  DiscordOAuthStepWithMessage,
} from "../app/components/DiscordOAuthStep";

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

const meta: Meta<typeof DiscordOAuthStep> = {
  title: "Components/DiscordOAuthStep",
  component: DiscordOAuthStep,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: "Discord OAuth step component for signup flow",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    message: {
      control: "text",
      description: "Optional message to display",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const DefaultWrapper: React.FC<{ message?: string }> = ({ message }) => (
  <MockDiscordProvider
    initialState={{ isLoading: false, verificationStatus: "idle" }}
  >
    {message ? (
      <DiscordOAuthStepWithMessage message={message} />
    ) : (
      <DiscordOAuthStep />
    )}
  </MockDiscordProvider>
);

export const Default: Story = {
  render: () => <DefaultWrapper />,
};

export const WithErrorMessage: Story = {
  render: () => <DefaultWrapper message="Error: Authentication failed" />,
};

export const WithSuccessMessage: Story = {
  render: () => <DefaultWrapper message="Success: Connected to Discord" />,
};
