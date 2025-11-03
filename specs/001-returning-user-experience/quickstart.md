# Quickstart: Returning User Experience Implementation

1. **Run tests first**
   - Add Vitest specs for the new session utility (`app/utils/session.server.ts`) covering serialization, signature verification, and expiration handling.
   - Add loader/unit specs asserting each welcome state branch (collaborator, pending, new) plus failure fallbacks.
   - Create/extend Storybook stories for the loading spinner, welcome, and pending UI states.

2. **Implement server-side session helpers**
   - Introduce `createReturningUserSession` and `parseReturningUserSession` in `app/utils/session.server.ts` using HMAC-SHA256 with `env.SESSION_HMAC_SECRET`.
   - Update `app/routes/api.discord.callback.tsx` and GitHub callback to write the signed cookie after successful completion.
   - Update `app/routes/signup.tsx` loader to consume the cookie, call Discord bot + GitHub status helpers, and map to UI state.

3. **Wire Discord & GitHub validation**
   - Add `fetchDiscordMemberRolesByUsername` helper that hits `env.DISCORD_BOT_API_BASE` and returns role ids.
   - Reuse `checkCollaboratorStatus` for GitHub state; expose a thin wrapper returning pending/collaborator flags.
   - Handle API failures gracefully by logging and restoring the legacy flow.

4. **Enhance the UI flow**
   - Extend `SignupFlow` props with returning state data and a loading flag for the spinner.
   - Add a `WelcomeBack` subcomponent showing the personalized message, `Member since` date, and CTA button.
   - Ensure pending invitation and fallback flows still route through existing support steps.

5. **Verify end-to-end**
   - Run `npm run typecheck` and the Vitest suite.
   - Execute Playwright smoke test (to be added) ensuring a returning collaborator lands on the welcome screen and the CTA opens the repo.
   - Confirm cookies include `HttpOnly; Secure; SameSite=Lax` attributes and expire after 90 days.
