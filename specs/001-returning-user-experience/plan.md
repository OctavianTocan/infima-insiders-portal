# Implementation Plan: Returning User Experience

**Branch**: `001-returning-user-experience` | **Date**: 2025-11-03 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-returning-user-experience/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Return visitors who already completed Discord verification and hold active GitHub collaborator access should bypass the multi-step signup. We will persist Discord/GitHub usernames with the signup date in a signed httpOnly cookie, run real-time role/collaborator validation on each page load via the existing Discord bot API and GitHub PAT, show a loading spinner during checks, and route users to the personalized welcome, pending invitation, or standard flow states accordingly.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript ^5.8 (strict mode)  
**Primary Dependencies**: React 19, React Router 7, Cloudflare Worker runtime, Wrangler tooling  
**Storage**: Signed httpOnly cookies (Cloudflare Response headers) for minimal session payload  
**Testing**: Vitest (unit/integration), Storybook stories for visual states, Playwright for end-to-end regression  
**Target Platform**: Cloudflare Workers + React Router file-based routing
**Project Type**: Cloudflare-based web worker serving React Router app  
**Performance Goals**: Welcome decision rendered within 2s (SC-001), overall page load under 3s (Performance-008)  
**Constraints**: Cloudflare CPU limits (~50ms) per request, secure SameSite/secure/httpOnly cookie requirements, zero duplicate invitations (SC-002)  
**Scale/Scope**: Hundreds of insiders per month; single signup route with shared OAuth APIs

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- ✅ **Principle I – Clean Code First**: Plan enforces small, composable helpers for cookie parsing/validation and isolates side effects in server utilities.
- ✅ **Principle V – Test-Driven Development**: Each module (cookie signer, loader branching, UI states) will have failing Vitest/spec tests (and Storybook states) written prior to implementation.
- ✅ **Principle VII – Simplicity & YAGNI**: Cookie stores only usernames + signup date; no background jobs or extra state beyond the three required user paths.
- ✅ **Principle IV – Explain the Why**: Non-obvious security decisions (cookie signing, validation fallbacks) will include WHY comments and be documented in plan/testing notes.

Post-Phase 1 review: No violations introduced by data model, contracts, or quickstart deliverables.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
app/
├── components/
│   ├── SignupFlow.tsx
│   ├── DiscordOAuthStep.tsx
│   ├── GitHubOAuthStep.tsx
│   ├── SupportRequestStep.tsx
│   └── CompleteStep.tsx
├── hooks/
│   └── useSignupFlow.ts
├── routes/
│   ├── signup.tsx
│   ├── api.discord.callback.tsx
│   ├── api.github.callback.tsx
│   └── redirect.tsx
├── types/
│   ├── branded.ts
│   ├── discord.ts
│   └── endpoints.ts
└── utils/
    ├── discord.server.ts
    ├── github.server.ts
    └── slack-webhook.server.ts

workers/
└── app.ts

tests/ (to be created)
├── unit/
└── integration/
```

**Structure Decision**: Work stays inside existing `app/` React Router worker project: update `routes/signup.tsx`, `components/SignupFlow.tsx`, and server utilities under `app/utils/`. Introduce a new `app/utils/session.server.ts` (or similar) plus Vitest suites under `tests/` for cookie + validation logic.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |
