// Main flow component (recommended usage)
export { default as DiscordVerificationFlow } from './DiscordVerificationFlow';

// Context and hook
export { DiscordProvider, useDiscord } from './DiscordContext';
export type { DiscordUser, DiscordState } from './DiscordContext';

// Individual components (for advanced usage)
export { default as DiscordOAuthButton } from './DiscordOAuthButton';
export { default as DiscordErrorDisplay } from './DiscordErrorDisplay';
export { default as DiscordVerificationForm } from './DiscordVerificationForm';
export { default as SupportRequestForm } from './SupportRequestForm';
export { default as DiscordOAuthStep } from './DiscordOAuthStep';
export { default as GitHubOAuthStep } from './GitHubOAuthStep';
export { default as SupportRequestStep } from './SupportRequestStep';
export { default as CompleteStep } from './CompleteStep';

// Signup flow components
export { StepIndicator } from './StepIndicator';
export { InfoSection } from './InfoSection';
export { FooterLinks } from './FooterLinks';
export { SignupFlow } from './SignupFlow';