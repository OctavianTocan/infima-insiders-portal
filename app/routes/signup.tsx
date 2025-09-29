// --- SIGNUP ROUTE --- //
/**
 * Multi-step OAuth signup flow route
 *
 * This route handles the complete Discord + GitHub OAuth flow with proper
 * error handling, Slack notifications, and support request functionality.
 *
 * @module SignupRoute
 */

import type { Route } from "./+types/signup";
import {
  SignupFlow,
  StepIndicator,
  InfoSection,
  FooterLinks,
  ErrorMessageDisplay,
} from "../components";
import { useSignupFlow } from "../hooks/useSignupFlow";
import {
  sendSlackWebhook,
  createSupportRequestPayload,
} from "../utils/slack-webhook.server";

/**
 * Server-side loader for the signup route.
 * Handles OAuth callback parameters from Discord and GitHub,
 * and prepares data for the signup flow.
 *
 * Processes URL parameters to determine OAuth results and user state,
 * then returns structured data for the client component.
 *
 * @param request - The incoming request object containing URL parameters
 * @param context - Route context containing Cloudflare environment variables
 * @returns Structured loader data with OAuth results and configuration
 */
export async function loader({ request, context }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const env = context.cloudflare.env as any; // Cast to any for Cloudflare Workers compatibility

  // Extract Discord OAuth callback parameters
  const discordSuccess = url.searchParams.get("discord_success");
  const discordError = url.searchParams.get("discord_error");
  const discordUsername = url.searchParams.get("discord_username");
  const discordId = url.searchParams.get("discord_id");
  const discordDisplayName = url.searchParams.get("discord_display");
  const discordVerified = url.searchParams.get("discord_verified");
  const userRoles = url.searchParams.get("user_roles");
  const errorDetails = url.searchParams.get("error_details");

  // Extract GitHub OAuth callback parameters
  const username = url.searchParams.get("username");
  const status = url.searchParams.get("status");
  const isCollaborator = url.searchParams.get("isCollaborator") === "true";
  const hasPendingInvitation =
    url.searchParams.get("hasPendingInvitation") === "true";
  const error = url.searchParams.get("error");

  // Parse user roles from JSON string if present
  let parsedUserRoles: { id: string; name: string }[] = [];
  try {
    if (userRoles) {
      parsedUserRoles = JSON.parse(decodeURIComponent(userRoles));
    }
  } catch (parseError) {
    console.error("Error parsing user roles from URL parameter:", parseError);
  }

  // Generate status message based on OAuth results
  let message = null;
  if (error) {
    message = `Error: ${error}`;
    if (errorDetails) {
      message += ` - ${errorDetails}`;
    }
  } else if (username) {
    if (isCollaborator) {
      if (status === "The user is already a collaborator") {
        message = `Welcome back, ${username}! You're already a collaborator on the repository.`;
      } else {
        message = `Welcome, ${username}! You're now a collaborator on the repository.`;
      }
    } else if (hasPendingInvitation) {
      message = `${username}, you have a pending invitation. Check your GitHub notifications.`;
    } else {
      message = `${username} could not be added. Status: ${status}`;
    }
  }
  return {
    clientId: env.GITHUB_CLIENT_ID,
    backendBase: url.origin,
    redirectUri: `${url.origin}/api/github/callback`,
    message,
    // Discord OAuth results
    discordSuccess: discordSuccess === "true",
    discordError,
    discordUsername,
    discordId,
    discordDisplayName,
    discordVerified: discordVerified === "true",
    userRoles: parsedUserRoles,
    errorDetails,
  };
}

/**
 * Server-side action for handling support requests.
 * Processes form submissions for Discord verification support.
 *
 * Validates form data, creates a support request record, and sends
 * webhook notifications if configured. Returns success/error status
 * for client-side feedback.
 *
 * @param request - The form submission request containing support data
 * @param context - Route context containing Cloudflare environment variables
 * @returns Action response with success status and request ID, or error details
 */
export async function action({ request, context }: Route.ActionArgs) {
  const formData = await request.formData();
  const actionType = formData.get("actionType") as string;
  const env = context.cloudflare.env as any; // Cast to any for Cloudflare Workers compatibility

  // Handle support request submission
  if (actionType === "support-request") {
    const supportData = {
      discordUsername: formData.get("discordUsername") as string,
      message: formData.get("message") as string,
      discordId: formData.get("discordId") as string,
      verificationError: formData.get("verificationError") as string,
    };

    try {
      const requestId = await createSupportRequest(supportData, env);
      return { success: true, requestId };
    } catch (submissionError) {
      console.error("Support request submission failed:", submissionError);
      return { success: false, error: (submissionError as Error).message };
    }
  }

  return { success: false, error: "Unknown action type" };
}

/**
 * Creates and processes a support request with Slack notification
 *
 * Generates a unique request ID, sends formatted notification to Slack,
 * and handles webhook failures gracefully without blocking the request.
 *
 * @param supportData - Support request information
 * @param env - Environment variables for webhook configuration
 * @returns Promise resolving to unique request ID
 *
 * @example
 * ```typescript
 * const requestId = await createSupportRequest({
 *   discordUsername: 'john_doe',
 *   discordId: '123456789',
 *   message: 'Cannot verify Discord membership',
 *   verificationError: 'DISCORD_NOT_MEMBER'
 * }, env);
 * ```
 */
async function createSupportRequest(
  supportData: {
    discordUsername: string;
    discordId?: string;
    message: string;
    verificationError?: string;
  },
  env: any
): Promise<string> {
  // WHY: Generate unique ID for tracking support requests
  const requestId = crypto.randomUUID();
  const timestamp = new Date();

  // WHY: Send Slack notification with comprehensive support request details
  if (env.SLACK_WEBHOOK_URL) {
    try {
      const slackPayload = createSupportRequestPayload({
        requestId,
        username: supportData.discordUsername,
        discordId: supportData.discordId,
        message: supportData.message,
        errorType: supportData.verificationError || "GENERAL_SUPPORT",
        timestamp,
      });

      await sendSlackWebhook(env.SLACK_WEBHOOK_URL, slackPayload);

      console.log(
        `Support request ${requestId} notification sent to Slack successfully`
      );
    } catch (webhookError) {
      // WHY: Log webhook failures but don't block support request creation
      console.error(
        "Failed to send support request Slack notification:",
        webhookError instanceof Error ? webhookError.message : "Unknown error"
      );
      // Don't throw - webhook failure shouldn't prevent support request creation
    }
  } else {
    console.warn(
      "No Slack webhook URL configured - support request notification not sent"
    );
  }

  // WHY: Send legacy webhook for backward compatibility (if configured)
  if (env.WEBHOOK_URL) {
    try {
      await fetch(env.WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "discord_support_request",
          requestId,
          timestamp: timestamp.toISOString(),
          data: {
            discordUsername: supportData.discordUsername,
            discordId: supportData.discordId,
            message: supportData.message,
            verificationError: supportData.verificationError,
          },
        }),
      });

      console.log(
        `Legacy webhook notification sent for support request ${requestId}`
      );
    } catch (legacyWebhookError) {
      console.error(
        "Failed to send legacy webhook notification:",
        legacyWebhookError instanceof Error
          ? legacyWebhookError.message
          : "Unknown error"
      );
    }
  }

  return requestId;
}

/**
 * SignupPage component with consolidated error handling
 *
 * Implements a clean, multi-step OAuth flow with consolidated error display,
 * Slack notifications, and modern React patterns. Uses composition over
 * prop drilling and centralizes all error states.
 *
 * @param props - Route component props from React Router
 * @returns JSX element representing the signup page
 */
export default function SignupPage({
  loaderData,
  actionData,
}: Route.ComponentProps): React.ReactElement {
  const {
    clientId,
    redirectUri,
    discordError,
    discordUsername,
    userRoles,
    errorDetails,
  } = loaderData;

  // WHY: Extract all signup flow logic into custom hook for clean separation
  const {
    currentStep,
    verifiedDiscordUsername,
    supportRequestId,
    message,
    error,
    isLoading,
    goToDiscord,
    handleSupportSubmitted,
    clearError,
  } = useSignupFlow(loaderData, actionData);
  const supportStepError = currentStep === "support-request" ? error : null;
  const shouldShowGlobalError =
    Boolean(error) && currentStep !== "support-request";

  /**
   * Initiates GitHub OAuth login flow
   *
   * Constructs the GitHub OAuth URL with proper scopes and redirects
   * the user to GitHub for authentication.
   */
  const handleGitHubLogin = () => {
    const authUrl = [
      "https://github.com/login/oauth/authorize",
      `?client_id=${clientId}`,
      `&redirect_uri=${encodeURIComponent(redirectUri)}`,
      "&scope=read:user",
    ].join("");

    window.location.href = authUrl;
  };

  return (
    <div className="app-container">
      <InfoSection />

      <div className="signup-wrapper">
        {/* Optional mascot display */}
        {/* <div className='mascot-container'>
          <img src="/mascot.svg" alt="Infima Games Mascot" className="mascot" />
        </div> */}

        <div className="signup-section">
          {/* WHY: Only show step indicator for main flow steps */}
          {(currentStep === "discord-oauth" ||
            currentStep === "github-oauth") && (
            <StepIndicator currentStep={currentStep} />
          )}

          {/* WHY: Single error display prevents UI clutter */}
          {shouldShowGlobalError && (
            <ErrorMessageDisplay
              message={error || "An error occurred"}
              type="error"
              dismissible
              onDismiss={clearError}
              actionText={currentStep === "discord-oauth" ? "Try Again" : undefined}
              onAction={currentStep === "discord-oauth" ? goToDiscord : undefined}
            />
          )}

          {/* Main signup flow component */}
          <SignupFlow
            currentStep={currentStep}
            verifiedDiscordUsername={verifiedDiscordUsername}
            message={message}
            supportRequestId={supportRequestId}
            discordError={discordError}
            discordUsername={discordUsername}
            userRoles={userRoles}
            errorDetails={errorDetails}
            loading={isLoading}
            onGitHubLogin={handleGitHubLogin}
            onBackToDiscord={goToDiscord}
            onSupportSubmitted={handleSupportSubmitted}
          />

          {/* WHY: Conditionally show GitHub signup link for relevant steps */}
          <FooterLinks showGitHubSignup={currentStep !== "discord-oauth"} />
        </div>
      </div>
    </div>
  );
}
