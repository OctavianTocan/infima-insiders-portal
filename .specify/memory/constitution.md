<!--
SYNC IMPACT REPORT: Constitution v1.0.0 Initial Ratification
─────────────────────────────────────────────────────────────
VERSION: Initial → 1.0.0 (MINOR bump - new governance framework)

MODIFIED PRINCIPLES: N/A (initial creation)
ADDED SECTIONS:
  - Core Principles (7 principles based on Clean Code, Pragmatic Programmer)
  - Development Standards
  - AI-Assisted Development Policy
  - Governance

REMOVED SECTIONS: N/A (initial creation)

TEMPLATES REQUIRING UPDATES:
  ✅ spec-template.md - Already aligned (user stories, testability)
  ✅ plan-template.md - Already aligned (constitution check section)
  ✅ tasks-template.md - Already aligned (test-first, phase organization)

FOLLOW-UP TODOs:
  - Establish TDD workflow and testing infrastructure
  - Create quickstart guide for new contributors
  - Document branching and deployment strategy
─────────────────────────────────────────────────────────────
-->

# Infima Games Insiders Signup Constitution

This constitution defines the non-negotiable principles for the Infima Games Insiders Signup Worker project. It serves as both a technical contract and a learning framework.

## Core Principles

### I. Clean Code First (NON-NEGOTIABLE)

Code MUST be optimized for human comprehension, not brevity. Every module, function, and class serves a single, well-defined purpose.

**Rules:**

- **Single Responsibility Principle**: Each function does ONE thing. Each class has ONE reason to change. No god objects.
- **Meaningful Names**: Variable and function names reveal intent without requiring comments. Avoid `data`, `info`, `temp`, `handle`. Use `verifiedDiscordUsername`, not `user1`.
- **Small Functions**: Functions should be 5-20 lines. If longer, extract helpers with clear names.
- **Boy Scout Rule**: Leave code cleaner than you found it. Every commit improves something.
- **DRY (Don't Repeat Yourself)**: Duplicate code is a design smell. Extract shared logic.

**Rationale**: Reading code happens 10x more than writing it. Clarity compounds over time. Obscurity compounds technical debt.

**References**: Clean Code (Robert C. Martin), Philosophy of Software Design (Ousterhout - deep modules)

---

### II. Composition Over Inheritance

Favor composition, functional programming, and React's composition patterns over class hierarchies.

**Rules:**

- **React Components**: Build UIs by composing small, focused components (see `SignupFlow.tsx` orchestrating step components).
- **Functional Composition**: Pure functions that compose together. Avoid stateful classes when hooks + functions suffice.
- **Explicit Dependencies**: Pass what you need as parameters. No hidden coupling through inheritance chains.
- **Interface Segregation**: Components accept only the props they need. No `...allTheThings` prop drilling.

**Rationale**: Composition creates flexible, testable systems. Inheritance creates brittle, tangled hierarchies. React's model proves composition scales.

**References**: Clean Code (Robert C. Martin - composition patterns), existing codebase (`app/components/SignupFlow.tsx`)

---

### III. Type Safety & Explicitness

TypeScript strict mode is mandatory. Types document contracts and catch errors at compile time.

**Rules:**

- **Strict Mode Enabled**: `strict: true` in `tsconfig.json`. No `any` without explicit justification.
- **Branded Types**: Use branded types for domain primitives (see `app/types/branded.ts`). `DiscordUserId` is not just `string`.
- **Explicit Interfaces**: All public APIs have typed interfaces. No implicit `any` return types.
- **Type Guards & Assertions**: Runtime validation with type guards (see `app/types/assertions.ts`).
- **Union Types**: Prefer discriminated unions over boolean flags for state machines.

**Rationale**: Types are executable documentation. They make invalid states unrepresentable. The compiler is the first line of defense.

**References**: TypeScript Handbook (discriminated unions), existing codebase (branded types pattern)

---

### IV. Explain the Why

Code explains WHAT and HOW. Comments explain WHY. Every non-obvious decision requires a WHY comment.

**Rules:**

- **WHY Comments**: Prefix rationale with `// WHY:` or `/** WHY: ... */` in JSDoc.
- **Decision Documentation**: Complex logic includes a comment explaining alternatives considered.
- **JSDoc for Public APIs**: All exported functions, interfaces, types have JSDoc with `@param`, `@returns`, `@example`.
- **Architecture Decision Records**: Major architectural choices documented in `docs/decisions/` (when created).
- **No Redundant Comments**: Don't comment WHAT the code already says. `i++; // increment i` is noise.

**Rationale**: Future you (and AI assistants) need to understand WHY you chose this approach. Code is self-documenting for WHAT; humans must explain WHY.

**References**: Pragmatic Programmer (Dave Thomas & Andy Hunt - pragmatic documentation), existing codebase (WHY comments throughout)

---

### V. Test-Driven Development (NON-NEGOTIABLE)

Tests MUST be written before implementation. Red → Green → Refactor is the only workflow.

**Rules:**

- **TDD Mandatory**: Write failing test → Watch it fail → Implement → Watch it pass → Refactor.
- **Test Types Required**:
  - **Unit Tests**: For pure functions and isolated logic
  - **Integration Tests**: For API routes and OAuth flows
  - **Component Tests**: For React components (Storybook serves as visual testing)
- **Coverage Goals**: Aim for 80%+ coverage for business logic. 100% for critical paths (OAuth, role verification).
- **Test Organization**: Follow existing pattern: `stories/` for Storybook, establish `tests/` for unit/integration.
- **No Implementation Without Tests**: If code has no test, it doesn't exist.

**Rationale**: TDD catches bugs before they exist. Tests are specifications. Refactoring without tests is guessing.

**Current Status**: ⚠️ **AREA FOR IMPROVEMENT** - Project uses Storybook for component testing but lacks comprehensive unit/integration test suite.

**References**: Refactoring (Martin Fowler - test-first refactoring), Clean Code (Robert C. Martin - TDD)

---

### VI. Learning Through Implementation

AI assistants are teachers and research tools, NOT implementers. The human writes the code.

**Rules:**

- **Scaffolding Only**: AI provides structure, comments, TODOs. Human implements logic.
- **Explain Before Code**: AI explains the WHY and approach before suggesting implementation.
- **Research Delegation**: AI can research best practices, find docs, analyze approaches. Human makes decisions.
- **Spec-First Workflow**: Write detailed specs (following spec-template.md) before coding. AI helps refine specs.
- **Review & Understand**: Never accept AI code you don't fully understand. Ask questions.

**Rationale**: This is a learning project. Typing code creates muscle memory and understanding. AI assistance accelerates learning but doesn't replace it.

**References**: System instructions (COPILOT_TEACHER mode), project README (portfolio/learning focus)

---

### VII. Simplicity & YAGNI (You Aren't Gonna Need It)

Start with the simplest solution. Add complexity only when proven necessary.

**Rules:**

- **YAGNI**: Don't build features for imagined future use cases. Build what's needed now.
- **Avoid Premature Optimization**: Make it work, make it right, make it fast—in that order.
- **Prefer Boring Technology**: Use proven, well-documented tools. Innovation in product, not infrastructure.
- **Question Frameworks**: Every dependency must justify its existence. Smaller bundles, fewer surprises.
- **Delete Liberally**: Unused code is a liability. Remove mascot code when decided against (see README).

**Rationale**: Simple systems are easier to understand, test, and maintain. Complexity is a tax paid in perpetuity.

**References**: Pragmatic Programmer (reversibility, orthogonality), Philosophy of Software Design (complexity management)

---

## Development Standards

### Code Organization

**File Structure:**

- **Modules**: One primary export per file. Name file after primary export (`SignupFlow.tsx` exports `SignupFlow`).
- **Grouping**: Group by feature/domain, not type. `app/components/` groups related signup components.
- **Index Files**: Use `index.ts` for convenient imports but avoid circular dependencies.
- **Naming Conventions**:
  - Components: PascalCase (`DiscordOAuthButton.tsx`)
  - Hooks: camelCase with `use` prefix (`useSignupFlow.ts`)
  - Utils: camelCase (`discord.server.ts`)
  - Types: PascalCase for interfaces/types (`SignupFlowState`)

**Code Style:**

- **Formatting**: Use project's existing Prettier/ESLint config (to be established if missing).
- **Imports**: Group by external → internal → types → relative.
- **Constants**: ALL_CAPS for true constants, PascalCase for enums.

### Error Handling

**Rules:**

- **Type-Safe Errors**: Define error types (see `app/types/discord.ts` error types).
- **User-Facing Errors**: Always provide actionable error messages. "Discord verification failed" → "Discord verification failed. Please ensure you're a member of the Infima Games server."
- **Logging**: All errors logged with context. Use structured logging (JSON).
- **Fail Fast**: Validate early, fail early. Better to reject invalid data at the boundary.

### Security

**Rules:**

- **Environment Variables**: All secrets in `.env`, never committed. Use Cloudflare secrets in production.
- **Input Validation**: Trust nothing from users or APIs. Validate and sanitize all inputs.
- **OAuth Best Practices**: State parameter validation, token expiration, secure redirect URIs.
- **Least Privilege**: GitHub PAT and Discord bot token have minimum required scopes.

### Performance

**Standards:**

- **Bundle Size**: Keep client bundle <200KB (gzipped). Lazy load when appropriate.
- **API Response Time**: <500ms p95 for OAuth flows.
- **Cloudflare Workers**: Respect 50ms CPU time limit. Optimize hot paths.

---

## AI-Assisted Development Policy

This project embraces AI assistance within strict learning boundaries.

### Approved AI Usage

**Research & Documentation:**

- ✅ Research best practices and architectural patterns
- ✅ Find and explain relevant documentation
- ✅ Generate detailed specifications following spec-template.md
- ✅ Explain existing code and identify improvement opportunities
- ✅ Create comprehensive JSDoc and WHY comments

**Scaffolding & Structure:**

- ✅ Create file structures and module outlines
- ✅ Generate TypeScript interfaces and type definitions
- ✅ Scaffold test cases (TDD: write failing tests first)
- ✅ Provide TODO-annotated code templates

**Review & Learning:**

- ✅ Code review and architecture feedback
- ✅ Suggest refactorings with rationale
- ✅ Explain trade-offs between approaches
- ✅ Answer "why does this work?" questions

### Prohibited AI Usage

**Implementation Shortcuts:**

- ❌ Implementing business logic directly (human must write it)
- ❌ Completing TODO sections without understanding
- ❌ Copy-pasting AI code without comprehension
- ❌ Using AI to "just make it work" when stuck

**Bypassing Learning:**

- ❌ Asking AI to solve problems without attempting them
- ❌ Accepting solutions without asking "why?"
- ❌ Using AI-generated code in portfolio without attribution

### The Teaching Protocol

When collaborating with AI:

1. **Spec First**: Define what you're building in spec-template.md format
2. **Explain the Why**: AI explains the approach and trade-offs
3. **Scaffold Structure**: AI provides structure with TODOs
4. **Human Implements**: You write the actual logic
5. **Review Together**: AI reviews your implementation, you ask questions
6. **Refactor & Learn**: Improve code together, documenting rationale

**Goal**: Every commit deepens understanding. If you can't explain the code, you don't own it.

---

## Governance

### Constitution Authority

This constitution supersedes all other development practices and coding preferences. When in doubt, constitution wins.

**Conflict Resolution:**

1. Check constitution principles
2. Consult Clean Code / Pragmatic Programmer references
3. Discuss and document decision in ADR (Architecture Decision Record)

### Amendment Process

**Requirements for Amendment:**

- Document proposed change and rationale
- Assess impact on existing templates (spec, plan, tasks)
- Update all affected templates in same commit
- Version bump according to semantic versioning:
  - **MAJOR**: Backward-incompatible governance changes, principle removals
  - **MINOR**: New principles, expanded guidance, new sections
  - **PATCH**: Clarifications, wording improvements, typo fixes

**Approval:**

- For personal project: Document decision in commit message
- For team project: Requires consensus and migration plan

### Compliance Verification

**All Pull Requests MUST:**

- [ ] Pass constitution check (as defined in plan-template.md)
- [ ] Include tests (TDD: tests written before implementation)
- [ ] Follow Clean Code principles (Single Responsibility, meaningful names, small functions)
- [ ] Explain WHY for non-obvious decisions
- [ ] Use TypeScript strict mode with no unjustified `any`
- [ ] Maintain/improve existing code quality (Boy Scout Rule)

**Complexity Justification:**

- Any deviation from simplicity MUST be justified in plan.md Complexity Tracking section
- Alternatives MUST be documented

### Living Documentation

**Constitution as Foundation:**

- Templates (spec, plan, tasks) inherit principles from constitution
- Runtime guidance files reference constitution principles
- Storybook stories document component contracts and composition patterns

**Continuous Improvement:**

- Constitution evolves as project matures
- Learning insights feed back into principles
- Portfolio value increases with principled development

---

**Version**: 1.0.0 | **Ratified**: 2025-10-25 | **Last Amended**: 2025-10-25

**Changelog:**

- **1.0.0** (2025-10-25): Initial ratification with 7 core principles based on Clean Code, Pragmatic Programmer, and project-specific learning goals.
