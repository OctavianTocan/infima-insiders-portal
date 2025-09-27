# Infima Games Insiders Access Worker

[![Infima Games Logo](public/infima-games-logo.svg)](https://infima-games.com)

## Overview

This Cloudflare Worker application streamlines access to an exclusive "insiders" GitHub repository for verified owners of Infima Games' Realistic Assault Rifle Template. Users must have a specific role in the Infima Games Discord server to qualify.

Built as a full-stack app starting from the React Router Cloudflare template, it features separate frontend and backend routes (backend routes prefixed with `/api/`). The app handles Discord OAuth for verification and GitHub OAuth to invite users as collaborators to the organization repository.

Key goals: Secure verification, automated invites, and a clean, Notion-inspired UI.

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

Started from React Router template, evolved into full-stack with API routes. Initially used Bun for speed and dual staging/production workers, but restarted Sept 23, 2025, for cleaner setup: React composition, lifted state, preview URLs instead.

Used GitHub Spec Kit for planning (discarded for fresh start with up-to-date deps). AI assistance: GitHub Copilot, Perplexity's GitHub connector with Grok-4 & GPT-5 for changes. Employed `.instructions.md` files to guide Copilot.

Frontend obsession: Dragged/improved Notion-like CSS across projects (beat Tailwind urge). Planned mascot but removed for brand fit; code remains. To enable it, uncomment the following block in `app/routes/signup.tsx` (around lines 229-231):

```tsx
<div className='mascot-container'>
  <img src="/mascot.svg" alt="Infima Games Mascot" className="mascot" />
</div>
```

This adds a mascot image above the signup form.

Insights: Manual deploys avoid annoyances; custom OAuth keeps deps minimal; AI agents shine with good specs but need oversight.

## Contributing

Fork and PR! Focus on security, UX, or OAuth enhancements.

## License

MIT License. See LICENSE file.

---

Built with ❤️ by Octavian Tocan for Infima Games.
