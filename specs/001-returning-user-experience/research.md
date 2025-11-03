# Research Findings: Returning User Experience

## Session Persistence & Security

- **Decision**: Persist the triple `{ discordUsername, githubUsername, signupDate }` inside a signed httpOnly cookie named `ig-insider-session`, using HMAC-SHA256 with a server-side secret (`SESSION_HMAC_SECRET`) and ISO-date payload encoding.
- **Rationale**: HMAC signing prevents tampering while keeping implementation lightweight—perfect for Cloudflare Workers (SubtleCrypto is available). The payload stays tiny (<256 bytes), easily fitting cookie limits and minimizing leakage risk since no tokens are stored.
- **Alternatives Considered**:
  - _Encrypted Durable Object storage_: adds latency/state management overhead without security gain for non-sensitive usernames.
  - _JWT with external library_: larger payload and dependency for features we do not need (signature + claims validation already solved by simple HMAC).

## Discord Role Validation Path

- **Decision**: Query the existing Discord bot worker via `env.DISCORD_BOT_API_BASE` using `GET /members/:discordUsername/roles`, then confirm the configured verified role id is present.
- **Rationale**: Reuses the bot that already owns guild access, keeps OAuth tokens out of the session, and mirrors current production tooling. Username lookup is supported per user guidance; request completes within ~300ms on the same Cloudflare region.
- **Alternatives Considered**:
  - _Re-running OAuth with stored refresh token_: contradicts the "no token storage" directive and increases scope.
  - _Storing Discord user id and relying on guild member cache_: feasible but the bot endpoint already supports username lookups, reducing new code.

## GitHub Collaborator Verification

- **Decision**: Continue using `checkCollaboratorStatus` with the admin PAT; expose a lightweight wrapper that accepts the GitHub username from the cookie and returns the collaborator/pending flags.
- **Rationale**: Code already exists, PAT secret is configured, and the call is idempotent. Keeping logic server-side satisfies Security-003/004 (no client spoofing).
- **Alternatives Considered**:
  - _GraphQL API_: higher complexity without benefit for a single lookup.
  - _Client-side fetch with user token_: violates requirement to avoid re-authentication.

## Testing Approach

- **Decision**: Use Vitest with `@react-router/dev` test utilities to unit-test the loader/validation branches, plus pure unit tests for the cookie signer/verifier. Create Storybook stories (or Vitest component tests) for the spinner + welcome states, and a Playwright smoke scenario to ensure bypass works end-to-end.
- **Rationale**: Aligns with Principle V (TDD) while exercising both server and UI logic in isolation. Vitest already ships in this repo, and React Router provides a `createRemixStub` helper for loader testing.
- **Alternatives Considered**:
  - _Relying solely on manual testing_: contradicts constitution.
  - _Adding Jest_: redundant dependency when Vitest covers the needs.

## Loading UX

- **Decision**: Show an inline loading spinner component inside `SignupFlow` while validation requests execute, falling back to existing step indicator after resolution.
- **Rationale**: Matches user preference (Option A) and makes the 1–2 second wait explicit, reducing perceived latency.
- **Alternatives Considered**:
  - _Skeleton screen_: more work for negligible benefit given short delay.
  - _Optimistic welcome_: risks incorrect messaging if validations fail.
