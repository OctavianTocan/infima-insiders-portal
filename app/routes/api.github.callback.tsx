// --- GITHUB OAUTH CALLBACK ROUTE --- //
/**
 * GitHub OAuth callback handler with Slack notifications
 *
 * This route handles the GitHub OAuth callback, processes user authentication,
 * adds users as repository collaborators, and sends comprehensive notifications.
 *
 * @module GitHubCallbackRoute
 */

import type { Route } from "./+types/api.github.callback";
import { redirect } from "react-router";
import {
  exchangeCodeForToken,
  fetchGitHubUser,
  addCollaborator,
  checkCollaboratorStatus,
  sendWebhookNotification,
} from "~/utils/github.server";
import {
  sendSlackWebhook,
  createSignupNotificationPayload,
  createErrorNotificationPayload,
} from "~/utils/slack-webhook.server";

// SERVER-SIDE LOADER (handles GitHub OAuth callback - your backend logic)
export async function loader({ request, context }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const env = context.cloudflare.env as any;

  console.log("OAuth callback received with code:", code);

  let username = "unknown";

  try {
    // Validate required environment variables
    if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET || !env.GITHUB_PAT) {
      throw new Error("Missing required GitHub environment variables");
    }

    if (!code) {
      throw new Error("No authorization code received from GitHub");
    }

    // Exchange code for access token
    const accessToken = await exchangeCodeForToken(code, env);

    // Fetch user details
    username = await fetchGitHubUser(accessToken);

    // Add user as collaborator using PAT
    let invitationStatus = "";
    let redirectToGitHubInvitations = false;

    try {
      const result = await addCollaborator(username, env);

      if (result.status === 201) {
        invitationStatus = "Successfully invited to repository";
        redirectToGitHubInvitations = true;

        await sendWebhookNotification(env, {
          event: "user_invited",
          username: username,
          status: "success",
          message: `Successfully invited ${username} to repository`,
          metadata: { invitationType: result.invitationStatus },
        });
      } else if (result.status === 204) {
        invitationStatus = "The user is already a collaborator";
        await sendWebhookNotification(env, {
          event: "user_already_collaborator",
          username: username,
          status: "info",
          message: `${username} is already a collaborator`,
          metadata: { invitationType: result.invitationStatus },
        });
      } else if (result.status === 422) {
        invitationStatus = "The user is already invited or a collaborator";
        await sendWebhookNotification(env, {
          event: "user_already_invited",
          username: username,
          status: "info",
          message: `${username} already has a pending invitation`,
          metadata: { invitationType: result.invitationStatus },
        });
      }
    } catch (error) {
      await sendWebhookNotification(env, {
        event: "invitation_failed",
        username: username,
        status: "error",
        message: `Failed to invite ${username}: ${(error as Error).message}`,
        metadata: { error: (error as Error).message },
      });
      throw error;
    }

    // Verify collaborator status
    const { isCollaborator, hasPendingInvitation } =
      await checkCollaboratorStatus(username, env);

    // WHY: Send comprehensive Slack notification for signup completion
    const shouldSendSlackNotification =
      Boolean(env.SLACK_WEBHOOK_URL) &&
      (isCollaborator || hasPendingInvitation || redirectToGitHubInvitations);

    if (shouldSendSlackNotification) {
      try {
        const signupStatus = isCollaborator ? "success" : "partial";
        const slackPayload = createSignupNotificationPayload({
          username,
          githubUsername: username,
          status: signupStatus,
          timestamp: new Date(),
        });

        await sendSlackWebhook(env.SLACK_WEBHOOK_URL, slackPayload);
        console.log(`Slack notification sent for GitHub signup: ${username}`);
      } catch (slackError) {
        console.error(
          "Failed to send GitHub signup Slack notification:",
          slackError instanceof Error ? slackError.message : "Unknown error"
        );
        // Don't throw - webhook failure shouldn't block signup
      }
    }

    // Send final webhook notification
    await sendWebhookNotification(env, {
      event: "authentication_completed",
      username: username,
      status: "completed",
      message: `Authentication flow completed for ${username}`,
      metadata: {
        invitationStatus,
        isCollaborator,
        hasPendingInvitation,
        redirectedToGitHubInvitations: redirectToGitHubInvitations,
        finalStatus: isCollaborator
          ? "collaborator"
          : hasPendingInvitation
            ? "pending_invitation"
            : "already_invited",
      },
    });

    if (redirectToGitHubInvitations) {
      return redirect(
        `https://github.com/${env.GITHUB_REPO_OWNER}/${env.GITHUB_REPO_NAME}/invitations`
      );
    }

    // Redirect back to signup page with status
    const frontendUrl = env.FRONTEND_URL || url.origin;
    const redirectUrl = new URL("/signup", frontendUrl);
    redirectUrl.searchParams.set("username", username);
    redirectUrl.searchParams.set("status", invitationStatus);
    redirectUrl.searchParams.set("isCollaborator", isCollaborator.toString());
    redirectUrl.searchParams.set(
      "hasPendingInvitation",
      hasPendingInvitation.toString()
    );

    return redirect(redirectUrl.toString());
  } catch (error) {
    console.error("Error during GitHub OAuth process:", error);

    // WHY: Parse error message to provide user-friendly feedback
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    let userFriendlyError = "We encountered an issue processing your request.";
    let shouldShowSupportLink = true;

    // Check for specific error types and provide appropriate messages
    if (errorMessage.includes("GITHUB_USER_NOT_FOUND")) {
      userFriendlyError = "GitHub user not found. Please verify your username.";
    } else if (errorMessage.includes("GITHUB_API_ERROR")) {
      userFriendlyError = "Unable to connect to GitHub. Please try again later.";
    } else if (errorMessage.includes("Missing required GitHub environment variables")) {
      userFriendlyError = "Service configuration error. Please contact support.";
    } else if (errorMessage.includes("No authorization code")) {
      userFriendlyError = "GitHub authorization failed. Please try signing in again.";
      shouldShowSupportLink = false;
    }

    // WHY: Send error notification to Slack for monitoring
    if (env.SLACK_WEBHOOK_URL) {
      try {
        const errorPayload = createErrorNotificationPayload({
          error: errorMessage,
          context: `GitHub OAuth callback for user: ${username}`,
          userId: username !== "unknown" ? username : undefined,
          timestamp: new Date(),
        });

        await sendSlackWebhook(env.SLACK_WEBHOOK_URL, errorPayload);
      } catch (slackError) {
        console.error(
          "Failed to send error notification to Slack:",
          slackError
        );
      }
    }

    // WHY: Send legacy webhook notification for backward compatibility
    await sendWebhookNotification(env, {
      event: "authentication_failed",
      username: username || "unknown",
      status: "error",
      message: `OAuth process failed: ${errorMessage}`,
      metadata: {
        error: errorMessage,
        userFriendlyError,
      },
    });

    const frontendUrl = env.FRONTEND_URL || url.origin;
    const redirectUrl = new URL("/signup", frontendUrl);
    redirectUrl.searchParams.set("error", userFriendlyError);
    if (shouldShowSupportLink) {
      redirectUrl.searchParams.set("show_support", "true");
    }
    // Keep the raw error for debugging (only logged, not shown to user)
    console.error("Raw error details:", errorMessage);

    return redirect(redirectUrl.toString());
  }
}

// This route doesn't render anything, it just handles the redirect
export default function GitHubCallback() {
  return null;
}
