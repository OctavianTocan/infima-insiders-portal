# Implementation Tasks: Returning User Experience

**Feature**: Returning User Experience (001-returning-user-experience)  
**Branch**: `001-returning-user-experience`  
**Created**: 2025-11-04  
**Status**: Ready for Implementation  
**Spec Reference**: [spec.md](./spec.md) | [Plan](./plan.md) | [Data Model](./data-model.md)

---

## Overview

This feature enables returning users (who have completed signup and hold active GitHub collaborator status) to bypass the multi-step OAuth flow and land on a personalized welcome screen within 2 seconds of page load.

**MVP Scope**: User Stories 1 & 2 (P1 & P2)  
**Post-Launch**: User Story 3 (P3), advanced options for pending flow

**Key Constraints**:

- Session persistence via signed httpOnly cookies (30-90 day TTL, configurable)
- Real-time Discord role + GitHub collaborator validation (timeout at 3s)
- Loading spinner during validation
- Graceful fallback to standard flow on any validation failure
- Analytics logging: timestamp + event type + API response times (90-day retention)

---

## Dependency Graph & Execution Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                      PHASE 1: SETUP                         │
│  (Infrastructure & foundational utilities)                  │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┴───────────────┐
         │                               │
┌────────▼──────────────────────┐ ┌─────▼────────────────────────┐
│ PHASE 2: FOUNDATIONAL         │ │ (Session + Validation Layer) │
│ ✓ Session utility helpers      │ │ ✓ Cookie signer/parser       │
│ ✓ Discord validation wrapper   │ │ ✓ Error handling constants   │
│ ✓ GitHub validation wrapper    │ │ ✓ Type definitions           │
└────────┬──────────────────────┘ └─────┬────────────────────────┘
         │                               │
         └───────────────┬───────────────┘
                         │
         ┌───────────────┴───────────────────────────┐
         │                                           │
┌────────▼──────────────────────┐ ┌────────────────▼────────────┐
│  PHASE 3: USER STORY 1 (P1)   │ │ PHASE 4: USER STORY 2 (P2) │
│ Existing Collaborator         │ │ Pending Invitation         │
│ ✓ Loader branching logic       │ │ ✓ Pending state handling    │
│ ✓ WelcomeBack component        │ │ ✓ Invitation link routing   │
│ ✓ LoadingSpinner component     │ │ ✓ State persistence        │
│ ✓ Integration with signup.tsx  │ │                            │
│ ✓ E2E browser test             │ │ ✓ E2E browser test        │
└────────┬──────────────────────┘ └────────┬────────────────────┘
         │                                 │
         └─────────────┬───────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│  PHASE 5: CROSS-CUTTING & POLISH                       │
│ ✓ Analytics logging setup                              │
│ ✓ Storybook stories (all states)                       │
│ ✓ End-to-end Playwright scenario                       │
│ ✓ Documentation & comments (WHY tags)                  │
│ ✓ Regression testing (new user flow unbroken)          │
│ ✓ Security audit (cookie attributes, token handling)   │
│ ✓ Performance audit (lighthouse, bundle impact)        │
└──────────────────────────────────────────────────────────┘
```

**Parallel Opportunities**:

- Phases 3 & 4 can run in parallel (independent UI states, no shared data mutations)
- Within Phase 3: Component tests (Storybook) and loader logic can be developed in parallel
- Within Phase 2: Session utility tests and Discord/GitHub wrapper tests are independent

---

## Phase 1: Setup & Infrastructure

**Goal**: Initialize project structure, establish patterns, and prepare for foundational tasks.

**Independent Test Criteria**:

- Directory structure created per plan.md
- Base TypeScript configuration validated
- Environment variable documentation complete

### Tasks

- [ ] T001 Create tests directory structure: `tests/unit/` and `tests/integration/` per plan.md
- [ ] T002 Create app/utils/session.server.ts stub with JSDoc comments (no implementation yet)
- [ ] T003 Create app/utils/validation.server.ts stub for Discord/GitHub wrappers (no implementation yet)
- [ ] T004 Create app/types/session.ts for branded types (DiscordUsername, GitHubUsername, etc.)
- [ ] T005 Document required environment variables in wrangler.jsonc.example: SESSION_HMAC_SECRET, SESSION_EXPIRY_DAYS

---

## Phase 2: Foundational — Session & Validation Utilities

**Goal**: Establish reusable, tested session management and API validation layers that all user stories depend on.

**Independent Test Criteria**:

- Session serialization/deserialization round-trip passes with valid signatures
- Session expiration logic correctly rejects old cookies
- Signature validation rejects tampered payloads
- Discord role validation handles API errors gracefully
- GitHub collaborator validation handles API errors gracefully
- All functions include WHY comments explaining security/performance decisions

### Tasks

#### Session Utility (Core)

- [ ] T006 [P] Write Vitest unit tests for session signer (app/utils/session.server.ts test file): cases for valid serialization, expiration check, signature validation failure, missing fields
- [ ] T007 [P] Implement `createReturningUserSession()` in app/utils/session.server.ts: accepts Discord username, GitHub username, signup date; returns signed cookie string with HMAC-SHA256
- [ ] T008 [P] Implement `parseReturningUserSession()` in app/utils/session.server.ts: parses cookie string, validates signature, checks expiration using SESSION_EXPIRY_DAYS env var, returns payload or null
- [ ] T009 [P] Implement `serializeSessionCookie()` in app/utils/session.server.ts: format cookie with httpOnly, secure, SameSite=Lax attributes per Security-001
- [ ] T010 [P] Implement `SESSION_HMAC_SECRET` loading and validation in app/utils/session.server.ts with clear error message if missing

#### Discord Validation Wrapper

- [ ] T011 [P] Write Vitest unit tests for Discord role validation in app/utils/validation.server.ts: cases for user found with role, user found without role, API timeout (>3s), API error, network failure
- [ ] T012 [P] Implement `fetchDiscordMemberRoles()` in app/utils/validation.server.ts: calls Discord bot API endpoint with username parameter, returns array of role IDs or null on failure
- [ ] T013 [P] Implement `hasVerifiedRole()` in app/utils/validation.server.ts: checks if returned role array includes configured DISCORD_VERIFIED_ROLE_ID
- [ ] T014 [P] Add timeout wrapper (3-second max) to Discord API calls; log if exceeded and return graceful error

#### GitHub Validation Wrapper

- [ ] T015 [P] Write Vitest unit tests for GitHub collaborator validation: cases for user is collaborator, pending invitation exists, both false, API timeout (>3s), API error
- [ ] T016 [P] Implement `fetchGitHubCollaboratorStatus()` wrapper in app/utils/validation.server.ts: reuses existing `checkCollaboratorStatus()` from github.server.ts, returns { isCollaborator, hasPendingInvitation }
- [ ] T017 [P] Add timeout wrapper (3-second max aggregate for both Discord and GitHub calls); log if exceeded and trigger fallback
- [ ] T018 [P] Implement `formatValidationError()` helper in app/utils/validation.server.ts: returns user-friendly message per UX-005 (e.g., "We're having trouble verifying your access. Please try again.")

#### Type & Constant Definitions

- [ ] T019 [P] Define WelcomeDecision type in app/types/session.ts per data model with strict discriminated unions (state: "collaborator" | "pending" | "new" | "support")
- [ ] T020 [P] Define ValidationResult type in app/types/session.ts per data model
- [ ] T021 [P] Create app/utils/session.constants.ts: error messages, cookie name constant, timeout values (all testable constants)

#### Analytics Logging Setup

- [ ] T022 [P] Implement `logReturningUserEvent()` in app/utils/analytics.server.ts: logs timestamp, event type, API response times; omits PII per FR-014
- [ ] T023 [P] Document analytics retention policy (90 days) in JSDoc for analytics.server.ts

---

## Phase 3: User Story 1 — Existing Collaborator Welcome Back (P1)

**Goal**: Implement core fast-path for returning collaborators; skip OAuth steps and show personalized welcome.

**Independent Test Criteria**:

- Returning collaborator with valid cookie sees "Welcome back" message within 2 seconds
- "Go to the Project" button opens GitHub repo in new tab
- Session persists across days/weeks without re-login (persistent cookie)
- Collaborator removed from repo detected on next visit; user redirected to standard flow
- Discord role lost detected on next visit; user redirected to support flow
- Loading spinner visible during validation
- No false positives (non-collaborators never see welcome)

### Tasks

#### Loader Branching Logic

- [ ] T024 [US1] Write Vitest tests for signup.tsx loader: mocks for valid session + collaborator, valid session + non-collaborator, expired session, no session, API timeouts
- [ ] T025 [US1] Implement session-reading logic in app/routes/signup.tsx loader: parse ReturningUserSession cookie via `parseReturningUserSession()`
- [ ] T026 [US1] Implement validation branching in signup.tsx loader: if valid session, call Discord + GitHub checks in parallel (timeout at 3s aggregate)
- [ ] T027 [US1] Implement WelcomeDecision mapping in signup.tsx loader: map ValidationResult to WelcomeDecision state per data model state transitions
- [ ] T028 [US1] Implement fallback error handling in signup.tsx loader: on any API failure or timeout, return { state: "new" } and log event per Performance-005
- [ ] T029 [US1] Implement security logging in signup.tsx loader: if signature validation fails, log event for security monitoring and treat as expired session (Security-002)

#### Welcome UI Components

- [ ] T030 [US1] Write Storybook stories for LoadingSpinner component: default state, custom message, duration timeout scenarios
- [ ] T031 [US1] Implement app/components/LoadingSpinner.tsx: shows spinner with "Verifying your access..." message for 1-2 seconds during validation
- [ ] T032 [US1] Write Storybook stories for WelcomeBack component: collaborator state, pending invitation state, error state, all CTA variations
- [ ] T033 [US1] Implement app/components/WelcomeBack.tsx: displays "Welcome back, [Discord Username]! Member since: Oct 25, 2025", primary CTA "Go to the Project", handles click to open repo in new tab
- [ ] T034 [US1] Implement date formatting helper in app/utils/date.ts: converts ISO date to "Oct 25, 2025" format (medium date) with locale support per FR-010

#### Signup Flow Integration

- [ ] T035 [US1] Update SignupFlow.tsx component: add props for `welcomeDecision` and `isValidating` flag
- [ ] T036 [US1] Implement branching logic in SignupFlow.tsx: render LoadingSpinner if isValidating, render WelcomeBack if welcomeDecision.state === "collaborator", else render standard flow
- [ ] T037 [US1] Update useSignupFlow.ts hook: expose isValidating state to parent component for conditional rendering
- [ ] T038 [US1] Update signup.tsx route component: pass loaderData.welcomeDecision to SignupFlow and handle loading state

#### Session Persistence (Completing OAuth Flows)

- [ ] T039 [US1] Update app/routes/api.discord.callback.tsx: after successful Discord verification, call `createReturningUserSession()` and set cookie in Response headers (httpOnly, secure, SameSite=Lax)
- [ ] T040 [US1] Update app/routes/api.github.callback.tsx: after successful GitHub OAuth, update existing session cookie with github username and current timestamp as signup date
- [ ] T041 [US1] Add WHY comment in both callbacks explaining why usernames are stored but tokens are not (security, simplicity)

#### E2E Browser Test (Returning Collaborator Path)

- [ ] T042 [US1] Write Playwright test (tests/integration/returning-collaborator.spec.ts):
  - Setup: Mock Discord and GitHub APIs to return valid collaborator status
  - Action: Load signup page with valid session cookie
  - Assert: Page shows WelcomeBack within 2s, "Go to the Project" visible, click opens repo in new tab
  - Teardown: Verify analytics event logged with "collaborator" type

---

## Phase 4: User Story 2 — Pending Invitation Clarity (P2)

**Goal**: Handle in-between state where Discord is verified but GitHub invitation awaits acceptance.

**Independent Test Criteria**:

- User with Discord verification + pending GitHub invitation sees "You have a pending invitation" message
- Invitation link routes to GitHub invitations page
- Pending state correctly detected when collaborator check returns hasPendingInvitation=true
- No false positives (users without pending invitations don't see pending message)

### Tasks

#### Pending UI Component

- [ ] T043 [US2] Write Storybook stories for PendingInvitation component: with invitation link, error state
- [ ] T044 [US2] Implement app/components/PendingInvitation.tsx: displays "You have a pending invitation! Check your GitHub invitations to accept it.", primary CTA links to https://github.com/notifications?query=type%3Arepo_invite
- [ ] T045 [US2] Add accessibility attributes (aria-label, role) to invitation link per existing project patterns

#### SignupFlow Branching (Pending State)

- [ ] T046 [US2] Update SignupFlow.tsx: add conditional render for welcomeDecision.state === "pending" to show PendingInvitation component
- [ ] T047 [US2] Update signup.tsx route to pass invitationUrl (GitHub invitations) to PendingInvitation via props

#### Analytics & Logging (Pending Path)

- [ ] T048 [US2] Ensure `logReturningUserEvent()` logs event_type="pending" when user lands on pending state
- [ ] T049 [US2] Update analytics.server.ts to track pending state transitions for SC-007 metric (95% successfully navigate to invitations)

#### E2E Browser Test (Pending Invitation Path)

- [ ] T050 [US2] Write Playwright test (tests/integration/pending-invitation.spec.ts):
  - Setup: Mock Discord API returns verified, GitHub API returns hasPendingInvitation=true
  - Action: Load signup page with valid session
  - Assert: Page shows PendingInvitation message within 2s, invitation link visible
  - Click link: Verify redirect to GitHub notifications page
  - Teardown: Verify analytics logged with event_type="pending"

---

## Phase 5: Cross-Cutting Concerns & Polish

**Goal**: Ensure comprehensive testing, observability, documentation, and no regressions.

**Independent Test Criteria**:

- All user stories pass their acceptance scenarios
- New user flow (P3) unchanged from baseline
- Storybook stories cover all UI states (loading, collaborator, pending, error, standard flow)
- E2E Playwright suite covers happy paths + failure scenarios
- Performance audit shows <3s page load and <200KB bundle impact
- Security audit confirms cookie attributes, no token leakage
- All WHY comments in place for non-obvious decisions

### Tasks

#### Comprehensive Testing

- [ ] T051 [P] Write Vitest unit test for all three user story branching paths (collaborator, pending, new) in app/routes/signup.tsx loader
- [ ] T052 [P] Write Vitest edge case tests: expired session, tampered cookie, Discord API timeout, GitHub API timeout, both API failures, missing environment variables
- [ ] T053 [P] Write Vitest test for session expiration boundary: cookie expires at SESSION_EXPIRY_DAYS exactly
- [ ] T054 [P] Write Vitest test for analytics logging: correct event types, no PII in logs, 90-day retention boundary

#### Storybook Stories & Visual Documentation

- [ ] T055 [P] Create comprehensive Storybook story for LoadingSpinner: states (default, long-running, with error message)
- [ ] T056 [P] Create comprehensive Storybook story for WelcomeBack: collaborator state, all CTA variations, disabled state
- [ ] T057 [P] Create comprehensive Storybook story for PendingInvitation: with link, without link, error state
- [ ] T058 [P] Create Storybook story for SignupFlow showing all states (new user, loading, collaborator, pending, error fallback)

#### Full Integration E2E Tests

- [ ] T059 [P] Write Playwright test for error recovery: API timeout at 2.5s, show error message, user can click "try again" to reload
- [ ] T060 [P] Write Playwright test for session expiration: load page with expired cookie, user sees standard flow, no error displayed
- [ ] T061 [P] Write Playwright test for tampered cookie: load page with invalid signature, session treated as absent, standard flow shown
- [ ] T062 [P] Write Playwright test for new user baseline (regression test): verify standard Discord → GitHub flow unchanged, no welcome fast-path triggered
- [ ] T063 [P] Write Playwright test for cookie persistence across days: set cookie, advance time 30+ days, reload, verify still valid; then exceed SESSION_EXPIRY_DAYS, reload, verify standard flow

#### Documentation & Comments

- [ ] T064 Update JSDoc for all new functions in app/utils/session.server.ts with @param, @returns, @example, @throws
- [ ] T065 Add WHY comments (// WHY: ...) in app/routes/signup.tsx loader explaining each branching decision (FR-009, Security-004, edge cases)
- [ ] T066 Add WHY comments in app/utils/session.server.ts explaining HMAC signing approach vs alternatives (FR-010c, Security-002)
- [ ] T067 Add architecture decision notes in plan.md summarizing: session payload minimalism, real-time validation over caching, timeout behavior, analytics retention
- [ ] T068 Create IMPLEMENTATION_NOTES.md in specs/001-returning-user-experience/ documenting: cookie lifecycle, validation flow diagram, error handling paths, testing checklist

#### Performance & Bundle Audit

- [ ] T069 [P] Run Lighthouse audit on signup page with feature enabled: verify page load remains <3s (SC-008)
- [ ] T070 [P] Verify bundle size impact: new components + utils should add <15KB gzipped (constraint from Performance-004)
- [ ] T071 [P] Profile validation API calls in DevTools: confirm Discord + GitHub checks complete in 1-2s under normal conditions

#### Security Audit

- [ ] T072 [P] Verify session cookie attributes in HTTP response: httpOnly=true, Secure=true, SameSite=Lax (Security-001)
- [ ] T073 [P] Verify no OAuth tokens stored: code review session serialization to confirm only usernames + date (FR-010c)
- [ ] T074 [P] Verify signature validation on every cookie read: test with tampered payload (Security-002)
- [ ] T075 [P] Verify error messages don't leak technical details: review all fallback error messages for PII/repository structure exposure (Security-007)
- [ ] T076 [P] Verify logging doesn't store PII: audit analytics.server.ts for username/email leakage (FR-014)

#### TypeScript & Linting

- [ ] T077 Run `npm run typecheck` to verify no `any` types without justification; all types strict-mode compliant
- [ ] T078 Run ESLint over new files; fix any violations per project style guide

#### Final Acceptance

- [ ] T079 Re-verify all acceptance scenarios from spec.md User Stories 1 & 2 against implementation
- [ ] T080 Verify success criteria SC-001 through SC-009 are measurable and achievable with current implementation
- [ ] T081 Code review: ensure all new code follows Principle I (Clean Code) – small functions, meaningful names, DRY
- [ ] T082 Code review: ensure all decisions include WHY comments per Principle IV

---

## Summary Statistics

| Metric                               | Count |
| ------------------------------------ | ----- |
| **Total Tasks**                      | 82    |
| **Phase 1 (Setup)**                  | 5     |
| **Phase 2 (Foundational)**           | 18    |
| **Phase 3 (US1 - Collaborator)**     | 19    |
| **Phase 4 (US2 - Pending)**          | 8     |
| **Phase 5 (Polish & Cross-Cutting)** | 32    |
| **Parallelizable Tasks [P]**         | 43    |
| **User Story Tasks [US1]**           | 19    |
| **User Story Tasks [US2]**           | 8     |

---

## MVP Scope & Delivery Strategy

**MVP = User Stories 1 & 2 (Phases 1-4)**

**Estimated Timeline**:

- Phase 1: 0.5 day (infrastructure)
- Phase 2: 2-3 days (session & validation layer)
- Phase 3: 2-3 days (welcome flow)
- Phase 4: 1-2 days (pending flow)
- Phase 5 (MVP subset): 1-2 days (core testing + security audit)

**Total MVP**: ~7-11 days assuming parallel execution of independent tasks.

**Post-MVP Candidates** (Phase 5 polish tasks):

- Comprehensive integration tests (can be deferred if time-constrained)
- Storybook stories (nice-to-have for documentation)
- Performance profiling (if bundle impact concerns arise)

---

## Validation Checklist

Before marking Phase as complete:

- [ ] All tasks in phase have checkboxes marked
- [ ] All new TypeScript code passes `npm run typecheck`
- [ ] All new functions have JSDoc with @param, @returns, @example
- [ ] All non-obvious decisions include WHY comments
- [ ] All user story acceptance scenarios verified
- [ ] No regression in standard new-user flow
- [ ] Security audit sign-off (cookies, no PII, no tokens)
- [ ] Tests passing (Vitest + Playwright)

---

## Next Steps

1. **Review this task list** with the user to confirm scope and timeline estimates
2. **Begin Phase 1** (setup): Create directories, stubs, type definitions
3. **Proceed to Phase 2** (foundational): Implement session & validation utilities with tests first (TDD)
4. **Execute Phases 3 & 4 in parallel** if resources allow
5. **Polish & audit** in Phase 5
6. **Deploy to staging** for user acceptance testing before production rollout
