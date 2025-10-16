# Infima Games Insiders Access Worker

[![Infima Games Logo](public/infima-games-logo.svg)](https://infima-games.com)

## Overview

This Cloudflare Worker grants verified Infima Games Discord members access to an exclusive GitHub "insiders" repository for our Realistic Assault Rifle Template. You need a specific role in the Discord to qualify.

I made this as a portfolio piece and a helpful public resource to show how these integrations work. It's built on the React Router Cloudflare template, with frontend and backend routes (backend prefixed with /api/). It uses Discord OAuth for role verification through a custom bot, and GitHub OAuth to add you as a collaborator to the repo.

The main goals are secure verification, automatic invites, and a simple Notion-like UI.

## Features

- **Discord Verification**: OAuth login with role check via Discord API (custom bot, no extra deps).
- **GitHub Integration**: Automatic collaborator invites to org repo.
- **Multi-Step Flow**: Composed React components for Discord connect, GitHub access, support requests, and completion.
- **Custom Styling**: Notion-like CSS for modern UX.
- **Error Handling**: Support form for unverified users.
- **Debug Tools**: API endpoint for role debugging.

## Tech Stack

- **Core**: React 19, React Router 7, TypeScript 5
- **Build/Dev**: Vite 6, tsconfig-paths
- **Deployment**: Cloudflare Workers, Wrangler CLI 4
- **Package Mgmt**: npm (optional Bun for faster installs)
- **Other**: Custom OAuth utils, Notion CSS suite

## Getting Started

### Prerequisites

- Node.js 20+
- Cloudflare account
- GitHub OAuth app
- Discord app/bot with guild access

#### Environment Variables

Copy `.env.example` to `.env` and fill in the values. Here's a detailed list:

**Discord Variables** (Create an app at https://discord.com/developers/applications):

- `DISCORD_CLIENT_ID`: Your Discord app's client ID
- `DISCORD_CLIENT_SECRET`: Your Discord app's client secret
- `DISCORD_BOT_TOKEN`: Bot token for API access
- `DISCORD_GUILD_ID`: Your server ID (enable Developer Mode, right-click server > Copy ID)
- `DISCORD_VERIFIED_ROLE_ID`: ID of the role required for verification
- `DISCORD_REDIRECT_URI`: Matches the redirect URI in your Discord app settings

**GitHub Variables** (Create OAuth app at https://github.com/settings/developers):

- `GITHUB_REPO_NAME`: Name of the target repository (e.g., "insiders-repo")
- `GITHUB_REPO_OWNER`: Username or organization name owning the repo
- `GITHUB_PAT`: Personal Access Token with "repo" and "read:org" scopes (generate at https://github.com/settings/tokens)
- `GITHUB_CLIENT_SECRET`: OAuth app client secret
- `GITHUB_CLIENT_ID`: OAuth app client ID

### Installation

```bash
git clone https://github.com/InfimaGames/New-Github-Insiders-Cloudflare-Worker.git
cd New-Github-Insiders-Cloudflare-Worker
npm install  # or bun install
cp .env.example .env  # Fill in vars
```

### Development

```bash
npm run dev
```

Visit `http://localhost:5173/signup`.

### Testing and Storybook

This project uses Storybook for component development and testing. All UI components have dedicated stories showcasing different states and props.

To run Storybook:

```bash
npm run storybook
```

Visit `http://localhost:6006` to browse all component stories. Each story represents a specific state of a component, making it easy to test and develop UI in isolation.

Key stories include:

- **Button**: Default, disabled, loading states
- **SignupFlow**: Complete signup process steps
- **Discord Components**: OAuth button, verification form, error displays
- **Support Components**: Request forms and steps
- **Layout Components**: Info sections, footers, step indicators

Use these stories to verify component behavior, test edge cases, and develop new features without running the full app.

📖 **[Component States Testing Guide](./COMPONENT_STATES_GUIDE.md)** - Comprehensive guide for activating and testing different component states during development.

### Dependency Auditing

This project runs automated dependency audits on every pull request via GitHub Actions. If your PR fails the audit check:

1. **Check the audit report**:
   ```bash
   npm audit
   ```

2. **Review vulnerabilities**: Examine the severity and affected packages. Focus on `moderate` and higher severity issues.

3. **Fix vulnerabilities**:
   ```bash
   npm audit fix
   ```
   
   For breaking changes that require manual review:
   ```bash
   npm audit fix --force
   ```
   ⚠️ **Warning**: `--force` may install breaking changes. Test thoroughly after using this option.

4. **Update specific packages** if automatic fixes don't work:
   ```bash
   npm update <package-name>
   ```

5. **Check for updates** to see what packages can be safely upgraded:
   ```bash
   npm outdated
   ```

6. **Verify the fix**:
   ```bash
   npm audit
   npm run typecheck
   npm run storybook  # Test that nothing broke
   ```

7. **Commit and push** your package updates. The PR check will re-run automatically.

If a vulnerability cannot be fixed (no patch available), document it in the PR description and discuss with maintainers.

### Build & Deploy

```bash
npm run build
npm run deploy  # To production
```

For previews: `npx wrangler versions upload`. Promote via `npx wrangler versions deploy`.

No auto-deploys; manual via Wrangler for control.

## Project Structure

```
├── app/                # Core app code
│   ├── components/     # React components (e.g., SignupFlow.tsx)
│   ├── hooks/          # Custom hooks (e.g., useSignupFlow.ts)
│   ├── routes/         # Routes & APIs (e.g., api.discord.callback.tsx)
│   ├── styles/         # Notion-like CSS
│   ├── utils/          # Server utils (discord.server.ts, github.server.ts)
│   └── ...
├── public/             # Assets (logos, favicon)
├── workers/            # Worker entry (app.ts)
├── wrangler.jsonc      # Cloudflare config
└── package.json        # Dependencies
```

## Behind the Scenes

This project started from the React Router Cloudflare template and turned into a full-stack app with API routes. Initially, it had a two-worker setup for staging and production (staging is disabled now), using Bun for package management (though not currently), Vite for fast builds, and Wrangler CLI for deployments.

I restarted the project on September 23, 2025, to make it cleaner: using composition for React components, lifting state up, and opting for preview URLs instead of dual workers. I chose my custom Notion-like CSS over TailwindCSS, which I've been refining across projects.

For planning, I used the GitHub Spec Kit but scrapped it for a fresh start with updated deps. I used AI a lot: GitHub Copilot for code, Perplexity with Grok 4 and GPT-5 for changes, and .instructions.md files to guide Copilot.

I thought about adding a mascot but decided against it for brand reasons, though the code remains. To enable it, uncomment this in app/routes/signup.tsx (lines 229-231):

```tsx
<div className="mascot-container">
  <img src="/mascot.svg" alt="Infima Games Mascot" className="mascot" />
</div>
```

It adds a mascot image above the signup form.

Insights: Manual deploys avoid issues, custom OAuth keeps deps low, AI agents work well with good specs but need checking.

## Contributing

Fork and PR! Focus on security, UX, or OAuth enhancements.

## License

MIT License. See LICENSE file.

---

Built with ❤️ by Octavian Tocan for Infima Games.
