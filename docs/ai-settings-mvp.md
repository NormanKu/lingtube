# AI Settings MVP Spec

## Goal

Let users choose which AI provider LingTube uses for analysis, and optionally bring their own API key without requiring a full account system.

## UX Scope

- Add an `AI Settings` entry in the header.
- Users can choose:
  - provider: `OpenAI` or `Claude`
  - model: free-text field seeded with the provider default
  - key source:
    - `Use LingTube server key`
    - `Use my own API key`
- Personal API keys are stored only in browser session storage.
- The UI exposes whether a provider already has a server-side key configured.
- Users can validate the current combination before saving it.

## Security Rules

- Non-sensitive preferences (`provider`, `model`, `keyMode`) are stored in local storage.
- Personal API keys are stored in session storage only.
- Personal API keys are sent to the server through the `x-lingtube-api-key` header.
- If the user explicitly chooses `personal` mode and no key is present, the server rejects the request instead of silently falling back to server credentials.

## Client Architecture

### Store

`client/src/stores/aiSettingsStore.js`

- Stores non-sensitive preferences in local storage.
- Stores provider-specific personal keys in session storage.
- Emits a browser event so the header and settings panel stay in sync.

### Hook

`client/src/hooks/useAISettings.js`

- Reads the current settings.
- Keeps components synced with store updates.

### UI

`client/src/components/Settings/AISettingsPanel.jsx`

- Loads the provider catalog from the server.
- Supports validation before save.
- Displays server-key availability and session-key behavior.

### Request Flow

`client/src/services/api.js`

- AI requests automatically attach:
  - `provider`
  - `model`
  - `keyMode`
- If `keyMode === personal`, requests also attach `x-lingtube-api-key`.

## Server Architecture

### Provider Catalog

`server/src/services/ai/catalog.ts`

- Defines supported providers and their default models.
- Reports whether each provider currently has a server-side key configured.

### Provider Factory

`server/src/services/ai/index.ts`

- Creates providers per request instead of relying on a global cached instance.
- Supports:
  - provider override
  - model override
  - per-request API key

### Routes

- `GET /api/ai/providers`
  - returns supported providers and server-key availability
- `POST /api/ai/validate`
  - validates the current provider/model/key combination
- Existing analysis routes now also accept:
  - `provider`
  - `model`
  - `keyMode`
  - optional `x-lingtube-api-key` header

## Request Precedence

1. Use request `provider` if supplied, otherwise use server default provider.
2. Use request `model` if supplied, otherwise use the provider default model.
3. If request `keyMode === personal`, require `x-lingtube-api-key`.
4. Otherwise fall back to the matching server environment variable.

## Nice Next Steps

- Add per-provider model suggestions in the UI.
- Show the active provider/model next to Analyze actions.
- Add usage/cost messaging when users switch to personal keys.
- If accounts are introduced later, move personal key storage to encrypted server-side persistence.
