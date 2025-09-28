import type { Meta, StoryObj } from '@storybook/react';
import { reactRouterParameters } from 'storybook-addon-remix-react-router';
import { SignupFlow } from '../app/components/SignupFlow';
import { DiscordProvider } from '../app/components/DiscordContext';
import type { FormStep } from '../app/hooks/useSignupFlow';

const meta: Meta<typeof SignupFlow> = {
  title: 'Components/SignupFlow',
  component: SignupFlow,
  decorators: [
    (Story) => (
      <DiscordProvider>
        <Story />
      </DiscordProvider>
    ),
  ],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'SignupFlow component that orchestrates the multi-step OAuth authentication process',
      },
    },
    reactRouter: reactRouterParameters({
      routing: {
        path: '/signup',
        useStoryElement: true,
      },
      location: {
        path: '/signup',
      },
    }),
  },
  tags: ['autodocs'],
  argTypes: {
    currentStep: {
      control: { type: 'select' },
      options: ['discord-oauth', 'github-oauth', 'support-request', 'complete'],
      description: 'Current step in the signup flow',
    },
    verifiedDiscordUsername: {
      control: 'text',
      description: 'Username of verified Discord user',
    },
    message: {
      control: 'text',
      description: 'Optional message to display',
    },
    supportRequestId: {
      control: 'text',
      description: 'ID of submitted support request',
    },
    discordError: {
      control: 'text',
      description: 'Discord error from OAuth callback',
    },
    discordUsername: {
      control: 'text',
      description: 'Discord username from OAuth callback',
    },
    userRoles: {
      control: 'object',
      description: 'User roles from Discord OAuth callback',
    },
    errorDetails: {
      control: 'text',
      description: 'Error details from OAuth callback',
    },
    loading: {
      control: 'boolean',
      description: 'Loading state for accessibility',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Mock functions for callbacks
const mockOnGitHubLogin = () => console.log('GitHub login initiated');
const mockOnBackToDiscord = () => console.log('Back to Discord step');
const mockOnSupportSubmitted = (requestId: string) => console.log('Support submitted:', requestId);

export const DiscordOAuthStep: Story = {
  args: {
    currentStep: 'discord-oauth' as FormStep,
    verifiedDiscordUsername: '',
    message: null,
    supportRequestId: '',
    discordError: null,
    discordUsername: null,
    userRoles: [],
    errorDetails: null,
    onGitHubLogin: mockOnGitHubLogin,
    onBackToDiscord: mockOnBackToDiscord,
    onSupportSubmitted: mockOnSupportSubmitted,
    loading: false,
  },
};

export const DiscordOAuthWithMessage: Story = {
  args: {
    ...DiscordOAuthStep.args,
    message: 'Please connect your Discord account to continue.',
  },
};

export const GitHubOAuthStep: Story = {
  args: {
    ...DiscordOAuthStep.args,
    currentStep: 'github-oauth' as FormStep,
    verifiedDiscordUsername: 'johndoe#1234',
    message: 'Now connect your GitHub account to complete verification.',
  },
};

export const SupportRequestStep: Story = {
  args: {
    ...DiscordOAuthStep.args,
    currentStep: 'support-request' as FormStep,
    discordError: 'OAuth verification failed',
    discordUsername: 'johndoe#1234',
    userRoles: [
      { id: '123456789', name: 'Member' },
      { id: '987654321', name: 'Verified' },
    ],
    errorDetails: 'Unable to verify Discord account ownership. Please submit a support request.',
  },
};

export const CompleteStep: Story = {
  args: {
    ...DiscordOAuthStep.args,
    currentStep: 'complete' as FormStep,
    supportRequestId: 'REQ-2024-001',
  },
};

export const LoadingState: Story = {
  args: {
    ...DiscordOAuthStep.args,
    loading: true,
  },
};