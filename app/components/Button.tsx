// --- BUTTON COMPONENT --- //
/**
 * Reusable Button component with comprehensive TypeScript typing
 *
 * This component demonstrates modern React TypeScript patterns including:
 * - Forwarded refs for integration with form libraries
 * - Comprehensive prop interfaces for consistent styling
 * - Accessibility best practices with ARIA attributes
 *
 * @module Button
 */
import React, { forwardRef } from "react";
import type { ReactNode } from "react";
import type { ButtonProps, OAuthButtonProps } from "../types/react";

// --- BASE BUTTON COMPONENT --- //

/**
 * Base Button component with forwarded ref support
 *
 * This button component provides consistent styling and behavior across the app.
 * It supports forwarded refs for integration with form libraries and external components.
 *
 * @param props - Button configuration
 * @param ref - Forwarded ref for the button element
 * @returns Button element
 *
 * @example
 * ```tsx
 * // Regular button
 * <Button onClick={handleClick}>Click me</Button>
 *
 * // Button with custom styling
 * <Button
 *   variant="primary"
 *   size="large"
 *   icon={<PlusIcon />}
 *   disabled={loading}
 * >
 *   Add Item
 * </Button>
 * ```
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "medium",
      icon,
      rightIcon,
      fullWidth = false,
      disabled = false,
      loading = false,
      className = "",
      "data-testid": testId,
      children,
      type = "button",
      ...props
    },
    ref
  ) => {
    // WHY: Combine CSS classes based on component props for flexible styling
    const buttonClasses = [
      "btn",
      `btn--${variant}`,
      `btn--${size}`,
      fullWidth && "btn--full-width",
      (disabled || loading) && "btn--disabled",
      loading && "btn--loading",
      icon && "btn--with-icon",
      rightIcon && "btn--with-right-icon",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    // WHY: ARIA attributes improve accessibility
    const ariaAttributes = {
      "aria-disabled": disabled || loading,
      "aria-busy": loading,
      "data-testid": testId || "button",
    };

    return (
      <button
        ref={ref}
        type={type}
        className={buttonClasses}
        disabled={disabled || loading}
        {...ariaAttributes}
        {...props}
      >
        {/* WHY: Show loading icon when loading, otherwise show regular icon */}
        {loading ? (
          <span className="btn__spinner" aria-hidden="true">
            {/* Loading spinner would go here */}⟳
          </span>
        ) : (
          icon && (
            <span className="btn__icon" aria-hidden="true">
              {icon}
            </span>
          )
        )}

        {/* Button text content */}
        <span className="btn__text">{children}</span>

        {/* Right-side icon */}
        {rightIcon && !loading && (
          <span className="btn__right-icon" aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </button>
    );
  }
);

// WHY: Set display name for better debugging experience
Button.displayName = "Button";

// --- OAUTH BUTTON COMPONENT --- //

/**
 * OAuth provider button with standardized styling and behavior
 *
 * Specialized button component for OAuth authentication flows.
 * Includes provider-specific styling and loading states.
 *
 * @param props - OAuth button configuration
 * @returns OAuth button element
 *
 * @example
 * ```tsx
 * <OAuthButton
 *   provider="discord"
 *   onLogin={() => startDiscordAuth()}
 *   isAuthenticating={isLoading}
 * >
 *   Connect Discord
 * </OAuthButton>
 * ```
 */
export function OAuthButton({
  provider,
  providerName,
  onLogin,
  isAuthenticating = false,
  disabled = false,
  className = "",
  "data-testid": testId,
  children,
  ...props
}: OAuthButtonProps): React.ReactElement {
  // WHY: Get provider-specific configuration
  const providerConfig = getOAuthProviderConfig(provider);
  const displayName = providerName || providerConfig.name;

  // WHY: Combine provider-specific classes with custom classes
  const oauthButtonClasses = [
    "oauth-btn",
    `oauth-btn--${provider}`,
    isAuthenticating && "oauth-btn--authenticating",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Button
      variant="secondary"
      loading={isAuthenticating}
      disabled={disabled || isAuthenticating}
      icon={providerConfig.icon}
      onClick={onLogin}
      className={oauthButtonClasses}
      data-testid={testId || `oauth-button-${provider}`}
      aria-label={`Sign in with ${displayName}`}
      {...props}
    >
      {isAuthenticating ? `Connecting to ${displayName}...` : children}
    </Button>
  );
}

// --- OAUTH PROVIDER CONFIGURATION --- //

/**
 * OAuth provider configuration
 */
interface OAuthProviderConfig {
  name: string;
  icon: ReactNode;
  brandColor: string;
}

/**
 * Get configuration for OAuth provider
 * WHY: Centralized provider configuration for consistency
 *
 * @param provider - OAuth provider identifier
 * @returns Provider configuration object
 */
function getOAuthProviderConfig(
  provider: "discord" | "github"
): OAuthProviderConfig {
  const configs: Record<string, OAuthProviderConfig> = {
    discord: {
      name: "Discord",
      icon: "🎮", // Would be replaced with actual Discord icon
      brandColor: "#5865f2",
    },
    github: {
      name: "GitHub",
      icon: "🐱", // Would be replaced with actual GitHub icon
      brandColor: "#24292f",
    },
  };

  return configs[provider] || configs.github;
}
