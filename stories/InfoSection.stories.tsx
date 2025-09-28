import type { Meta, StoryObj } from "@storybook/react";
import { InfoSection } from "../app/components/InfoSection";

const meta: Meta<typeof InfoSection> = {
  title: "Components/InfoSection",
  component: InfoSection,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Information section displaying signup benefits and branding",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
