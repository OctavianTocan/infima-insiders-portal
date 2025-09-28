import type { Meta, StoryObj } from "@storybook/react";
import { FooterLinks } from "../app/components/FooterLinks";

const meta: Meta<typeof FooterLinks> = {
  title: "Components/FooterLinks",
  component: FooterLinks,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "Footer links for GitHub signup and legal pages",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    showGitHubSignup: {
      control: "boolean",
      description: "Whether to show the GitHub signup link",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    showGitHubSignup: true,
  },
};

export const WithoutGitHubSignup: Story = {
  args: {
    showGitHubSignup: false,
  },
};
