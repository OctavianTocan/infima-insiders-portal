# Feature Specification: Returning User Experience

**Feature Branch**: `001-returning-user-experience`  
**Created**: 2025-10-25  
**Status**: Draft  
**Input**: User description: "Improve experience for users who have already completed signup by detecting their existing GitHub collaborator status and showing a simplified welcome back page with direct repository access instead of redundant signup steps"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Existing Collaborator Welcome Back (Priority: P1)

A user who has already completed the full signup process (Discord verification + GitHub OAuth) and is an active repository collaborator returns to the signup page. Instead of seeing the multi-step OAuth flow again, they see a personalized welcome message with their Discord username and a direct link to open the GitHub repository.

**Why this priority**: This is the core value proposition—preventing confusion and duplicate signups. It directly addresses the reported problem of users going through the process multiple times unnecessarily.

**Independent Test**: Can be fully tested by having a verified Discord user who is already a GitHub collaborator visit the signup page. The system should detect their collaborator status and show the simplified welcome screen with repository link instead of OAuth steps.

**Acceptance Scenarios**:

1. **Given** a user has previously completed signup AND stored session/cookies are valid, **When** they visit the signup page, **Then** the system validates their Discord role and GitHub collaborator status in real-time (shows loading state) and displays "Welcome back, [Discord Username]! Member since: Oct 25, 2025" with a "Go to the Project" button, WITHOUT requiring manual re-authentication
2. **Given** a returning collaborator sees the welcome message, **When** they click "Go to the Project", **Then** they are redirected to the GitHub repository page in a new tab
3. **Given** a user returns days or weeks after initial signup, **When** they visit the signup page, **Then** they are still recognized as a returning user without re-authentication (persistent session)

---

### User Story 2 - Pending Invitation Clarity (Priority: P2)

A user who has completed Discord verification and received a GitHub invitation but hasn't accepted it yet returns to the signup page. They see a clear message explaining they have a pending invitation with a direct link to their GitHub invitations page.

**Why this priority**: This handles the "in-between" state where users have been invited but haven't completed the process. It reduces support requests by providing clear next steps.

**Independent Test**: Can be fully tested by having a verified Discord user with a pending GitHub invitation visit the signup page. The system should show the pending invitation message with a link to GitHub invitations.

**Acceptance Scenarios**:

1. **Given** a user has completed Discord verification AND has a pending GitHub invitation, **When** they visit the signup page, **Then** they see "You have a pending invitation! Check your GitHub invitations to accept it." with a link to GitHub invitations
2. **Given** a user sees the pending invitation message, **When** they click the invitation link, **Then** they are redirected to their GitHub repository invitations page
3. **Given** a user with a pending invitation wants to re-initiate the process, **When** they access the advanced options, **Then** they can restart the GitHub OAuth flow

---

### User Story 3 - New User Standard Flow (Priority: P3)

A first-time user who has never completed the signup process visits the page and sees the standard multi-step OAuth flow (Discord → GitHub) without any changes to the current experience.

**Why this priority**: This ensures we don't break the existing working flow for new users. It's foundational but lower priority since it's already implemented.

**Independent Test**: Can be fully tested by having a user who is NOT a Discord server member and NOT a GitHub collaborator visit the signup page. They should see the standard OAuth flow.

**Acceptance Scenarios**:

1. **Given** a user visits the signup page for the first time, **When** they load the page, **Then** they see the standard "Connect Discord" step as the first action
2. **Given** a new user completes Discord verification but fails role check, **When** they proceed, **Then** they see the support request form as per current behavior
3. **Given** a new user successfully completes both OAuth steps, **When** they return later, **Then** they fall into User Story 1 (welcome back flow)

---

### Edge Cases

- What happens when a user's collaborator status changes between visits (e.g., removed from repository)?
  - Real-time validation on page load detects this and redirects to standard signup flow
- What happens when a user loses their Discord role between visits?
  - Real-time Discord role validation detects this and redirects to support request flow
- How does the system handle users who have completed Discord verification but not GitHub OAuth?
  - Show standard GitHub OAuth step (existing behavior maintained)
- What happens when GitHub API is unavailable during validation?
  - Show appropriate error message and fall back to standard signup flow
- How does the system handle users who cleared cookies/local storage?
  - Fall back to standard signup flow—they'll go through OAuth again and get a new persistent session
- What happens when a persistent session expires (e.g., after 90 days)?
  - User sees standard signup flow again, but the process should be quick since they're already a collaborator
- What happens when a user has multiple Discord accounts but only one is verified?
  - Each Discord session is independent; only the currently authenticated Discord account's session data matters

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST detect if a user is an existing GitHub repository collaborator when they visit the signup page
- **FR-002**: System MUST retrieve the user's Discord identity to personalize the welcome message for returning collaborators
- **FR-003**: System MUST display a simplified "Welcome back" interface for users who are already repository collaborators, replacing the standard OAuth flow
- **FR-004**: System MUST provide a "Go to the Project" action that opens the GitHub repository in the user's browser for returning collaborators
- **FR-005**: System MUST differentiate between three user states: existing collaborator, pending invitation, and new user
- **FR-006**: System MUST show the pending invitation status and provide a link to GitHub invitations for users with pending invitations
- **FR-007**: System MUST maintain the existing signup flow (Discord → GitHub OAuth) for first-time users without any breaking changes
- **FR-008**: System MUST handle GitHub API failures gracefully by falling back to the standard signup flow without blocking access
- **FR-009**: System MUST validate both Discord role status AND GitHub collaborator status in real-time on each page load to ensure returning users still have required access
- **FR-010**: System MUST store the original signup completion date to display "Member since" information on the welcome screen in the format "Oct 25, 2025" (medium date format)
- **FR-010a**: System MUST store Discord username to enable Discord role re-validation via Discord bot API on subsequent visits
- **FR-010b**: System MUST store GitHub username to enable GitHub collaborator status validation via GitHub API on subsequent visits
- **FR-010c**: System MUST NOT store OAuth tokens or other sensitive authentication credentials—only usernames and signup date
- **FR-011**: System MUST maintain persistent authentication sessions (via secure cookies or similar mechanism) so returning users do NOT need to re-authenticate with Discord on subsequent visits
- **FR-012**: System MUST persist user session data across days/weeks to recognize returning users without requiring re-login
- **FR-013**: System MUST use server-side verification for collaborator status to prevent client-side spoofing
- **FR-014**: System MUST log returning user visits for analytics without storing personally identifiable information long-term

### Key Entities

- **Returning User**: A user who has previously completed the full signup process (Discord verification + GitHub OAuth) and has a valid persistent session stored locally
- **Collaborator Status**: The current state of a user's relationship with the GitHub repository (active collaborator, pending invitation, or non-member). Determined via GitHub API check
- **User Session**: The persistent authentication context containing:
  - Discord username (for display AND Discord bot API role re-validation)
  - GitHub username (for GitHub API collaborator re-validation)
  - Signup completion date (for "Member since" display in format "Oct 25, 2025")
  - Stored securely in httpOnly cookies and persists across multiple visits over days/weeks
  - Does NOT store OAuth tokens or sensitive credentials—only usernames
- **Signup Completion Date**: The timestamp when the user first successfully completed the full signup flow. Used for "Member since" display
- **Welcome State**: The UI state that determines which interface to show (welcome back screen, pending invitation screen, or standard signup flow)

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Returning collaborators see the welcome screen within 2 seconds of page load
- **SC-002**: Zero duplicate signup attempts from users who are already repository collaborators (measured by reduced duplicate GitHub invitation API calls)
- **SC-003**: 100% of returning collaborators can access the repository with one click from the welcome screen
- **SC-004**: Support requests related to "already signed up" or "process not working" reduce by at least 70%
- **SC-005**: New user signup flow continues to function without regression (0% increase in new user signup failures)
- **SC-006**: System maintains 99% uptime for collaborator status checks, with graceful degradation to standard flow on API failures
- **SC-007**: 95% of users with pending invitations successfully navigate to their GitHub invitations page from the provided link
- **SC-008**: Page load performance remains under 3 seconds even with added collaborator status check
- **SC-009**: Returning user identification accuracy is 100% (no false positives or false negatives in collaborator detection)
- **SC-010**: User satisfaction score for returning user experience increases by at least 40% (measured by optional feedback prompt)

### Assumptions

- **Assumption 1**: Users have cookies enabled and accept persistent cookies (required for session storage)
- **Assumption 2**: GitHub API collaborator endpoint (`/repos/{owner}/{repo}/collaborators/{username}`) will remain stable and respond within 1-2 seconds
- **Assumption 3**: The existing Discord OAuth integration can provide the user's Discord username and the completion timestamp can be captured during initial signup
- **Assumption 4**: Persistent session cookies with 30-90 day expiration are acceptable for this use case (standard for "remember me" functionality)
- **Assumption 5**: Users accessing the page are using modern browsers with JavaScript enabled (consistent with existing app requirements)
- **Assumption 6**: The current Cloudflare Workers environment has sufficient execution time for real-time Discord role and GitHub collaborator validation (estimated 1-2 seconds total)
- **Assumption 7**: 2-second validation delay on page load is acceptable user experience with loading spinner
- **Assumption 8**: Discord bot API can validate role status by Discord username without requiring stored OAuth token
- **Assumption 9**: Admin GitHub PAT (personal access token) stored in Cloudflare secrets can be used for collaborator status checks

### Security Considerations

- **Security-001**: Persistent session cookies MUST be httpOnly, secure, and use SameSite attributes to prevent XSS and CSRF attacks
- **Security-002**: Session tokens MUST be cryptographically secure and include signature validation to prevent tampering
- **Security-003**: Discord identity verification from OAuth flow MUST be stored securely in session and validated on each request
- **Security-004**: Discord role AND GitHub collaborator status MUST be re-validated on every page load using stored usernames (Discord bot API for role check, GitHub API with admin PAT for collaborator check) to ensure access hasn't been revoked
- **Security-005**: Direct repository links MUST point to the public GitHub repository page, not expose any private access tokens or credentials
- **Security-006**: Session expiration MUST be enforced (suggested 30-90 days) with automatic cleanup of expired sessions
- **Security-007**: Error messages MUST NOT reveal repository structure, collaborator lists, or internal API details to potential attackers

### Performance Considerations

- **Performance-001**: Real-time validation (Discord role + GitHub collaborator checks) MUST complete within 2 seconds on page load
- **Performance-002**: Show loading spinner while validation occurs to provide immediate user feedback during the 1-2 second validation period
- **Performance-003**: Cache validation results within the same session (5 minutes) to avoid redundant API calls if user refreshes page
- **Performance-004**: Welcome screen should be lightweight and fast-loading (minimal dependencies)

### User Experience Principles

- **UX-001**: Welcome message MUST feel personal and friendly, using the user's Discord username and showing "Member since" date
- **UX-002**: "Go to the Project" button MUST be prominent and clearly actionable (primary CTA)
- **UX-003**: Returning users MUST NOT be prompted to re-authenticate or sign in again—the experience should be instant and seamless
- **UX-004**: Pending invitation message MUST be clear about next steps and not create anxiety
- **UX-005**: Fallback to standard flow MUST be seamless and not display technical error messages to users
