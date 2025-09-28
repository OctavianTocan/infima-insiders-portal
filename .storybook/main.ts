import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: [
    "../stories/**/*.mdx",
    "../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "!/../workers/**", // Exclude workers directory
    "!/../src/**/workers/**", // Exclude any workers subdirectories
  ],
  addons: [
    "@chromatic-com/storybook",
    "@storybook/addon-docs",
    "@storybook/addon-onboarding",
    "@storybook/addon-a11y",
    "@storybook/addon-vitest",
    "storybook-addon-remix-react-router",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {
      builder: {
        // We're using a custom viteConfig because react router doesn't work with Storybook and so we have to exclude that from the viteConfig that we use here.  More info: https://storybook.js.org/addons/storybook-addon-remix-react-router
        viteConfigPath: "./sb-vite.config.ts",
      },
    },
  },
  typescript: {
    reactDocgen: false,
  },
};
export default config;
