import type { Meta, StoryObj } from '@storybook/react';
import { StepIndicator } from '../app/components/StepIndicator';
import type { FormStep } from '../app/hooks/useSignupFlow';

// Mock the SIGNUP_STEPS constant for Storybook
const mockSignupSteps = [
  { key: 'discord-oauth', label: 'Discord' },
  { key: 'github-oauth', label: 'GitHub' },
  { key: 'support-request', label: 'Support' },
] as const;

// Mock the getStepIndex function
const getStepIndex = (step: FormStep): number => {
  const index = mockSignupSteps.findIndex(s => s.key === step);
  return index >= 0 ? index : 0;
};

const meta: Meta<typeof StepIndicator> = {
  title: 'Components/StepIndicator',
  component: StepIndicator,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'StepIndicator component for displaying progress through multi-step flows',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    currentStep: {
      control: { type: 'select' },
      options: mockSignupSteps.map(step => step.key),
      description: 'Current step in the signup flow',
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
      description: 'Size variant for different contexts',
    },
    orientation: {
      control: { type: 'select' },
      options: ['horizontal', 'vertical'],
      description: 'Orientation for different layouts',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    currentStep: 'discord-oauth' as FormStep,
    size: 'medium',
    orientation: 'horizontal',
  },
};

export const DiscordStep: Story = {
  args: {
    ...Default.args,
    currentStep: 'discord-oauth' as FormStep,
  },
};

export const GithubStep: Story = {
  args: {
    ...Default.args,
    currentStep: 'github-oauth' as FormStep,
  },
};

export const SupportStep: Story = {
  args: {
    ...Default.args,
    currentStep: 'support-request' as FormStep,
  },
};

export const SmallSize: Story = {
  args: {
    ...Default.args,
    size: 'small',
  },
};

export const LargeSize: Story = {
  args: {
    ...Default.args,
    size: 'large',
  },
};

export const VerticalOrientation: Story = {
  args: {
    ...Default.args,
    orientation: 'vertical',
  },
};

export const VerticalLarge: Story = {
  args: {
    ...Default.args,
    size: 'large',
    orientation: 'vertical',
  },
};