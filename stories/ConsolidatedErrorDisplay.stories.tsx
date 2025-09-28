import type { Meta, StoryObj } from '@storybook/react';
import { ConsolidatedErrorDisplay } from '../app/components/ConsolidatedErrorDisplay';

const meta: Meta<typeof ConsolidatedErrorDisplay> = {
  title: 'Components/ConsolidatedErrorDisplay',
  component: ConsolidatedErrorDisplay,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Single source of truth for all error messages in the application',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    error: {
      control: 'text',
      description: 'Primary error message to display',
    },
    errorDetails: {
      control: 'text',
      description: 'Additional error details (collapsible)',
    },
    errorType: {
      control: { type: 'select' },
      options: ['auth', 'network', 'validation', 'permission', 'rate_limit', 'server'],
      description: 'Error type for appropriate styling and icons',
    },
    severity: {
      control: { type: 'select' },
      options: ['info', 'warning', 'error', 'critical'],
      description: 'Error severity for prioritization',
    },
    dismissible: {
      control: 'boolean',
      description: 'Whether the error can be dismissed',
    },
    canRetry: {
      control: 'boolean',
      description: 'Whether a retry action is available',
    },
    actionText: {
      control: 'text',
      description: 'Custom action button text',
    },
    actionUrl: {
      control: 'text',
      description: 'Custom action URL for external links',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Mock functions for callbacks
const mockOnDismiss = () => console.log('Error dismissed');
const mockOnRetry = () => console.log('Retry action triggered');
const mockOnAction = () => console.log('Custom action triggered');

export const Default: Story = {
  args: {
    error: 'An unexpected error occurred',
    errorType: 'server',
    severity: 'error',
    dismissible: true,
    canRetry: false,
    onDismiss: mockOnDismiss,
  },
};

export const AuthError: Story = {
  args: {
    ...Default.args,
    error: 'Failed to authenticate with Discord',
    errorType: 'auth',
    severity: 'error',
    canRetry: true,
    onRetry: mockOnRetry,
  },
};

export const NetworkError: Story = {
  args: {
    ...Default.args,
    error: 'Unable to connect to the server',
    errorType: 'network',
    severity: 'warning',
    canRetry: true,
    onRetry: mockOnRetry,
  },
};

export const ValidationError: Story = {
  args: {
    ...Default.args,
    error: 'Please fill in all required fields',
    errorType: 'validation',
    severity: 'warning',
    dismissible: false,
  },
};

export const PermissionError: Story = {
  args: {
    ...Default.args,
    error: 'You do not have permission to access this resource',
    errorType: 'permission',
    severity: 'error',
    actionText: 'Request Access',
    onAction: mockOnAction,
  },
};

export const RateLimitError: Story = {
  args: {
    ...Default.args,
    error: 'Too many requests. Please try again later.',
    errorType: 'rate_limit',
    severity: 'warning',
    dismissible: false,
  },
};

export const CriticalError: Story = {
  args: {
    ...Default.args,
    error: 'Critical system failure. Please contact support.',
    errorType: 'server',
    severity: 'critical',
    actionText: 'Contact Support',
    actionUrl: 'https://support.example.com',
  },
};

export const InfoMessage: Story = {
  args: {
    ...Default.args,
    error: 'Your account has been successfully verified!',
    errorType: 'auth',
    severity: 'info',
    dismissible: true,
    actionText: 'Continue',
    onAction: mockOnAction,
  },
};

export const WithErrorDetails: Story = {
  args: {
    ...Default.args,
    error: 'Authentication failed',
    errorDetails: 'Error: OAuth token expired\nTimestamp: 2024-01-15T10:30:00Z\nUser-Agent: Mozilla/5.0...',
    errorType: 'auth',
    severity: 'error',
    canRetry: true,
    onRetry: mockOnRetry,
  },
};

export const NonDismissible: Story = {
  args: {
    ...Default.args,
    error: 'This error cannot be dismissed',
    dismissible: false,
  },
};