# Deployment Guide

## Vercel (recommended)

LingTube is configured for Vercel out of the box via `vercel.json`. The React client is served as static files, while the Express API runs as a serverless function.

### Prerequisites

1. [Vercel account](https://vercel.com/signup)
2. At least one AI provider API key:
   - [OpenAI API key](https://platform.openai.com/api-keys) (recommended, cheaper)
   - [Anthropic Claude API key](https://console.anthropic.com/)

### One-click deploy via Vercel CLI

```bash
npm install -g vercel
vercel login
cd /path/to/lingtube
vercel
```

Follow the prompts. The defaults in `vercel.json` will handle the rest.

### Deploy via GitHub integration

1. Push the repo to GitHub (already done: https://github.com/NormanKu/lingtube)
2. Go to https://vercel.com/new
3. Import the `NormanKu/lingtube` repo
4. No need to change build settings — `vercel.json` handles everything
5. Click **Deploy**

### Environment variables

Set these in the Vercel dashboard under **Settings → Environment Variables**:

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | if using OpenAI | OpenAI API key |
| `ANTHROPIC_API_KEY` | if using Claude | Anthropic Claude API key |
| `AI_PROVIDER` | no | Default provider (`openai` or `claude`). Defaults to `openai` |

Users can also enter personal API keys in the web UI (stored in their browser only), but you'll want at least one server-side key configured for the default provider to work.

### Pre-generated video data

Any `data/*.json` files in the repo at deploy time will be shipped with the serverless function (see `vercel.json` → `functions.includeFiles`). Users hit `/api/data/:videoId` to load these without burning API credits.

To add more videos:

1. Run locally: `npm run generate "https://youtu.be/VIDEO_ID"`
2. Commit the new `data/*.json` to git
3. Push → Vercel auto-deploys

### What won't work on Vercel

- **Claude Code CLI mode** — the `claude` binary isn't available on Vercel runtime, and auth isn't portable. CLI mode is local-dev only.
- **Real-time generation for un-prepared videos** — still works, but requires `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` to be set.

---

## Self-hosted (alternative)

For full control including the Claude Code CLI route, run on your own machine or VPS:

```bash
npm install
cp .env.example .env
npm run dev
```

This keeps `npm run generate` functional.

---

## Troubleshooting

### `/api/*` returns 404 after deploy
Check that `vercel.json` exists at the repo root and has the `functions` entry for `api/[[...path]].ts`.

### Function times out
Default Vercel function timeout is 10s on the free Hobby plan. AI calls can take longer. `vercel.json` sets `maxDuration: 60` which works on Pro. If you're on Hobby, lower this to `10` and expect some analyses to fail.

### Data files not found after deploy
Verify `functions["api/[[...path]].ts"].includeFiles: "data/**"` is in `vercel.json`. Vercel needs to be told to ship the data folder with the function bundle.
