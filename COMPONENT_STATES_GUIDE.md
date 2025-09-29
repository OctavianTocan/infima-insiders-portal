# Component States Testing Guide

This guide explains how to activate and test different states of the signup flow components for development, testing, and demonstration purposes.

## Table of Contents

- [Overview](#overview)
- [Testing Methods](#testing-methods)
- [Main Signup Flow States](#main-signup-flow-states)
- [Error States](#error-states)
- [URL Parameter Testing](#url-parameter-testing)
- [Storybook Testing](#storybook-testing)
- [Component-Specific States](#component-specific-states)
- [Development Tips](#development-tips)

## Overview

The Infima Games Insiders signup flow consists of multiple components with various states. This guide provides practical methods to activate and test each state during development.

## Testing Methods

### 1. Storybook (Recommended for UI Development)

```bash
npm run storybook
```

Visit `http://localhost:6006` to browse all component stories with isolated state testing.

### 2. URL Parameter Manipulation

Navigate to `/signup` and modify URL parameters to simulate different OAuth callback states.

### 3. Development Server

```bash
npm run dev
```

Visit `http://localhost:5173/signup` and use URL parameters or browser developer tools.

## Main Signup Flow States

### 1. Discord OAuth Step (Initial State)

**Default URL:** 
```
http://localhost:5173/signup
```

**Description:** First step where users connect their Discord account.

**How to activate:**
- Navigate to the signup URL
- Clear all URL parameters
- This is the default state

**Visual elements:**
- Discord OAuth button
- Step indicator showing step 1/2
- Info section explaining the process

### 2. Discord OAuth with Message

**URL with parameters:**
```
http://localhost:5173/signup?message=Please%20connect%20your%20Discord%20account
```

**Description:** Discord OAuth step with an informational message.

**How to activate:**
- Add `message` parameter to the URL
- Or use Storybook: `Components/SignupFlow/DiscordOAuthWithMessage`

### 3. GitHub OAuth Step (Success State)

**URL with parameters:**
```
http://localhost:5173/signup?discord_success=true&discord_verified=true&discord_username=johndoe&discord_display=John%20Doe
```

**Description:** Second step after successful Discord verification.

**Required parameters:**
- `discord_success=true`
- `discord_verified=true` 
- `discord_username=<username>`
- `discord_display=<display_name>` (optional)

**Visual elements:**
- GitHub OAuth button
- Step indicator showing step 2/2
- Verified Discord username display
- Back to Discord option

### 4. Support Request Step (Error Fallback)

**URL with parameters:**
```
http://localhost:5173/signup?discord_error=not_member&discord_username=johndoe&error_details=User%20not%20found%20in%20server
```

**Description:** Fallback step when Discord verification fails.

**Common error scenarios:**

#### Not a Server Member
```
?discord_error=not_member&discord_username=johndoe
```

#### Verification Failed
```
?discord_error=not_verified&discord_username=johndoe&user_roles=[{"id":"123","name":"Member"}]
```

#### OAuth Failed
```
?discord_error=oauth_failed&error_details=Invalid%20authorization%20code
```

**Visual elements:**
- Error explanation
- Support request form
- User role display (if available)
- Back to Discord option

### 5. Complete Step (Success)

**How to activate:**
- Submit a support request (requires form submission)
- Or use direct state manipulation in development

**Description:** Final step after successful support request submission.

**Visual elements:**
- Success message
- Support request ID
- Start over option

## Error States

### Global Error States

Test error states that appear across the entire signup flow:

#### Network Error
```javascript
// In browser console:
window.history.pushState({}, '', '/signup?error=network_error&error_details=Connection%20timeout');
window.location.reload();
```

#### Rate Limited
```javascript
// Simulate rate limiting:
window.history.pushState({}, '', '/signup?discord_error=rate_limited&error_details=Too%20many%20requests');
window.location.reload();
```

#### Server Error
```javascript
// Simulate server error:
window.history.pushState({}, '', '/signup?discord_error=server_error&error_details=Internal%20server%20error');
window.location.reload();
```

### Discord-Specific Error States

#### User Not in Server
```
http://localhost:5173/signup?discord_error=not_member&discord_username=testuser
```

#### User Not Verified
```
http://localhost:5173/signup?discord_error=not_verified&discord_username=testuser&user_roles=[{"id":"123456","name":"Member"}]
```

#### Missing Required Role
```
http://localhost:5173/signup?discord_error=insufficient_permissions&discord_username=testuser&user_roles=[{"id":"111111","name":"Basic"}]
```

### GitHub OAuth Error States

#### GitHub OAuth Failure
```
http://localhost:5173/signup?error=github_oauth_failed&error_details=Invalid%20client%20credentials
```

#### Repository Access Denied
```
http://localhost:5173/signup?error=repository_access_denied&username=testuser&status=Insufficient%20permissions
```

## URL Parameter Testing

### Complete Parameter Reference

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `discord_success` | boolean | Discord OAuth success | `true` |
| `discord_error` | string | Discord error type | `not_member` |
| `discord_username` | string | Discord username | `johndoe#1234` |
| `discord_display` | string | Discord display name | `John Doe` |
| `discord_verified` | boolean | User role verification | `true` |
| `user_roles` | JSON string | User's Discord roles | `[{"id":"123","name":"Member"}]` |
| `error_details` | string | Additional error context | `User not found` |
| `username` | string | GitHub username | `johndoe` |
| `status` | string | GitHub operation status | `success` |
| `isCollaborator` | boolean | GitHub collaborator status | `true` |
| `hasPendingInvitation` | boolean | Pending GitHub invite | `true` |
| `error` | string | General error message | `oauth_failed` |
| `message` | string | General info message | `Welcome back!` |

### Testing Template URLs

Copy and modify these URLs for testing:

#### Successful Discord + GitHub Flow
```
http://localhost:5173/signup?discord_success=true&discord_verified=true&discord_username=testuser&username=testuser&isCollaborator=true&status=success
```

#### Discord Success, GitHub Pending
```
http://localhost:5173/signup?discord_success=true&discord_verified=true&discord_username=testuser&username=testuser&hasPendingInvitation=true&status=invitation_sent
```

#### Discord Failed, Support Needed
```
http://localhost:5173/signup?discord_error=not_member&discord_username=testuser&error_details=User%20must%20join%20Discord%20server
```

#### Complete Error Flow
```
http://localhost:5173/signup?discord_error=oauth_failed&error=network_error&error_details=Connection%20timeout%20during%20authentication
```

## Storybook Testing

### Available Stories

Navigate to these Storybook stories for isolated component testing:

#### SignupFlow Stories
- `Components/SignupFlow/DiscordOAuthStep`
- `Components/SignupFlow/DiscordOAuthWithMessage`
- `Components/SignupFlow/GitHubOAuthStep`
- `Components/SignupFlow/SupportRequestStep`
- `Components/SignupFlow/CompleteStep`
- `Components/SignupFlow/LoadingState`

#### Error Display Stories
- `Components/ConsolidatedErrorDisplay/Default`
- `Components/ConsolidatedErrorDisplay/AuthError`
- `Components/ConsolidatedErrorDisplay/NetworkError`
- `Components/ConsolidatedErrorDisplay/ValidationError`
- `Components/ConsolidatedErrorDisplay/PermissionError`
- `Components/ConsolidatedErrorDisplay/RateLimitError`
- `Components/ConsolidatedErrorDisplay/CriticalError`

#### Discord Error Stories
- `Components/DiscordErrorDisplay/NotMember`
- `Components/DiscordErrorDisplay/NotVerified`
- `Components/DiscordErrorDisplay/OAuthFailed`
- `Components/DiscordErrorDisplay/RateLimited`
- `Components/DiscordErrorDisplay/ServerError`
- `Components/DiscordErrorDisplay/NetworkError`

### Storybook Controls

Each story includes interactive controls to modify:
- Error messages and types
- User data (usernames, roles)
- Loading states
- Callback functions (logged to console)
- Visual properties (dismissible, severity)

## Component-Specific States

### DiscordOAuthButton States

Test different button states:

```typescript
// In Storybook or component props:
{
  loading: true,           // Shows spinner
  disabled: true,          // Disabled state
  error: "oauth_failed",   // Error state styling
}
```

### StepIndicator States

Test step progression:

```typescript
// Different step configurations:
{
  currentStep: "discord-oauth",  // Step 1 active
  currentStep: "github-oauth",   // Step 2 active
}
```

### SupportRequestForm States

Test form validation and submission:

```typescript
// Form state scenarios:
{
  isSubmitting: true,      // Loading state
  error: "validation_error", // Error state
  success: true,           // Success state
}
```

## Development Tips

### 1. Browser Developer Tools

Use browser console to manipulate state:

```javascript
// Change URL parameters dynamically:
const url = new URL(window.location);
url.searchParams.set('discord_error', 'not_member');
url.searchParams.set('discord_username', 'testuser');
window.history.pushState({}, '', url);
window.location.reload();
```

### 2. Local Storage Testing

Clear or modify local storage for testing:

```javascript
// Clear all stored state:
localStorage.clear();

// Set specific test data:
localStorage.setItem('lastDiscordUsername', 'testuser');
```

### 3. Network Tab Debugging

Monitor network requests during OAuth flows:
1. Open browser Developer Tools
2. Go to Network tab
3. Navigate through signup flow
4. Inspect OAuth callback requests and responses

### 4. Console Debugging

The components log important state changes:

```javascript
// Enable verbose logging:
localStorage.setItem('debug', 'signup:*');
```

### 5. Testing Error Boundaries

Test error boundary behavior:

```javascript
// Trigger React error boundary:
window.addEventListener('error', (e) => {
  console.log('Error boundary triggered:', e);
});

// In React DevTools, you can also trigger errors manually
```

### 6. Mobile Testing

Test responsive states:
1. Open browser Developer Tools
2. Enable device simulation
3. Test different screen sizes
4. Verify mobile-specific error displays

### 7. Accessibility Testing

Test screen reader compatibility:
1. Install screen reader extension
2. Navigate signup flow with keyboard only
3. Verify ARIA labels and error announcements
4. Test focus management during state changes

## Advanced Testing Scenarios

### 1. Concurrent User Sessions

Test multiple user scenarios:
1. Open multiple browser tabs
2. Use different usernames in each tab
3. Test race conditions and state conflicts

### 2. Network Interruption

Test offline/online behavior:
1. Start signup flow
2. Disable network in Developer Tools
3. Attempt actions
4. Re-enable network and test recovery

### 3. OAuth Token Expiration

Simulate expired tokens:
1. Complete Discord OAuth
2. Wait or manually expire token
3. Attempt GitHub OAuth
4. Verify error handling

### 4. Browser Back/Forward

Test navigation history:
1. Complete partial signup flow
2. Use browser back button
3. Use forward button
4. Verify state preservation

---

## Quick Reference Commands

```bash
# Start development server
npm run dev

# Start Storybook
npm run storybook

# Build for testing
npm run build

# Run tests
npm test

# Lint and format
npm run lint
npm run format
```

## Troubleshooting

### Common Issues

1. **State not updating**: Clear browser cache and localStorage
2. **OAuth errors**: Check environment variables and OAuth app configuration
3. **Component not rendering**: Verify required props and dependencies
4. **Storybook issues**: Restart Storybook server and clear cache

### Debug Checklist

- [ ] Environment variables loaded correctly
- [ ] OAuth apps configured with correct redirect URIs
- [ ] Network requests completing successfully
- [ ] Console showing expected state transitions
- [ ] URL parameters formatted correctly
- [ ] Local storage cleared of old test data

---

For more information, see the main [README.md](./README.md) or check the [Storybook documentation](http://localhost:6006).