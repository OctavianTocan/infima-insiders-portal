# Manual Test Scenarios for Friendly Error Messages

## Test Case 1: User Already a Collaborator (404 Error)
**Scenario:** A Discord-verified user who is already a GitHub collaborator attempts to sign up again.

**Expected Behavior:**
1. User completes Discord OAuth successfully
2. User proceeds to GitHub OAuth step
3. System detects user is already a collaborator
4. User sees message: "Welcome back, {username}! You're already a collaborator on the repository."
5. No raw API errors are displayed

**Error Conditions to Test:**
- GitHub API returns 404 when checking collaborator status
- System should fallback to verification check
- If verified as existing collaborator, show friendly message
- If genuinely not found, show: "Unable to add GitHub user '{username}' to the repository. Please verify the username is correct."

---

## Test Case 2: GitHub API Error (Non-404)
**Scenario:** GitHub API returns an unexpected error.

**Expected Behavior:**
1. User completes Discord OAuth successfully
2. User proceeds to GitHub OAuth step
3. GitHub API returns error (e.g., 500, 403, etc.)
4. User sees message: "Unable to connect to GitHub. Please try again later." OR "Service configuration error. Please contact support."
5. Support link is displayed: "Need help? Contact support for assistance."
6. No raw API errors or JSON responses are displayed

---

## Test Case 3: Support Link Functionality
**Scenario:** User encounters an error with support link enabled.

**Expected Behavior:**
1. Error message is displayed with friendly text
2. Support link appears below error message: "Need help? Contact support for assistance."
3. Clicking "Contact support" navigates to support request form
4. Support form pre-fills with error context (if applicable)

---

## Test Case 4: Successful New Collaborator
**Scenario:** A new Discord-verified user signs up for the first time.

**Expected Behavior:**
1. User completes Discord OAuth successfully
2. User proceeds to GitHub OAuth step
3. User is added as collaborator (201 status)
4. User is redirected to GitHub invitations page or sees success message
5. No errors are displayed

---

## Test Case 5: User with Pending Invitation
**Scenario:** A Discord-verified user who already has a pending invitation attempts to sign up again.

**Expected Behavior:**
1. User completes Discord OAuth successfully
2. User proceeds to GitHub OAuth step
3. System detects pending invitation (422 status)
4. User sees message: "{username}, you have a pending invitation. Check your GitHub notifications."
5. No raw API errors are displayed

---

## Validation Checklist
- [ ] No raw GitHub API errors visible to users
- [ ] All error messages are user-friendly and actionable
- [ ] Support link appears when `show_support=true` is set
- [ ] Support link correctly navigates to support form
- [ ] Error messages maintain appropriate styling (red background, error icon)
- [ ] Success messages maintain appropriate styling (green background)
- [ ] Error details are logged to console for debugging
- [ ] Slack notifications still sent for monitoring
- [ ] OAuth flow completes successfully for valid users
- [ ] Already-collaborator case handled gracefully

---

## Expected User-Facing Error Messages

### Friendly Error Messages:
1. **Already a collaborator:** "Welcome back, {username}! You're already a collaborator on the repository."
2. **User not found:** "GitHub user not found. Please verify your username."
3. **API error:** "Unable to connect to GitHub. Please try again later."
4. **Configuration error:** "Service configuration error. Please contact support."
5. **No authorization code:** "GitHub authorization failed. Please try signing in again."
6. **Pending invitation:** "{username}, you have a pending invitation. Check your GitHub notifications."

### Never Shown to Users:
- Raw API responses like `{"message":"Not Found","documentation_url":"...","status":"404"}`
- Error stack traces
- Internal error codes without context
- HTTP status codes without explanation
