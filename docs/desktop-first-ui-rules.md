# Desktop-First UI Rules

## Goal

LingTube should feel like a desktop learning workspace first, with mobile treated as a fallback that remains usable but does not dictate the main layout.

## Rules

### 1. Start from a working desktop canvas

- Design primary pages for `1280px-1600px` width first.
- Assume desktop users can handle two-column or three-panel layouts when the task benefits from context.
- Avoid collapsing everything into a single centered column unless the content is intentionally article-like.

### 2. Use width intentionally

- Reserve narrow reading widths for long-form text only.
- Do not cap task-heavy pages too early with small wrappers like `max-w-3xl` or `max-w-4xl` unless readability clearly improves.
- Discovery pages should usually span `max-w-6xl` or `max-w-7xl`.

### 3. Keep context visible during workflows

- Analysis, practice, and review flows should keep key context on screen:
  - video/player
  - transcript or sentence source
  - controls or progress
- Prefer sticky side panels on desktop over hiding context behind extra navigation.

### 4. Prefer panels over stacked cards for settings

- On desktop, settings should use a structured panel or modal with:
  - clear title and summary
  - grouped sections
  - a persistent action row
- Use a left summary rail when the user is choosing between multiple technical configurations.

### 5. Let actions stay close to content

- Global actions belong in the page header or panel footer.
- Task-specific actions should remain visually attached to the content they affect.
- Avoid full-width CTAs on desktop unless they are the only meaningful action in that region.

### 6. Use responsive behavior to degrade gracefully, not to define the layout

- Desktop layout should remain the source of truth.
- Mobile should simplify or stack the same structure instead of forcing the desktop version to become overly compact.
- Hide secondary metadata on smaller widths before collapsing core structure.

### 7. Maintain information hierarchy

- Use title, supporting description, and metadata rows consistently.
- For workbench pages, the visual hierarchy should usually be:
  - task title / page purpose
  - active workspace
  - tools and controls
  - detailed content

### 8. Separate reading surfaces from utility surfaces

- Reading surfaces should have calmer widths, softer backgrounds, and more line-height.
- Utility surfaces such as filters, tabs, and provider selectors can be denser and more compact.
- Mixing both on the same card should be avoided unless the interaction is extremely simple.

## Current Audit

### Stronger now

- `AI Settings` is now closer to a proper desktop settings surface:
  - left summary rail
  - right configuration workspace
  - persistent footer actions
  - escape-to-close and locked background scroll

### Still worth revisiting

#### Home page

File: `client/src/pages/HomePage.jsx`

- The page is still capped at `max-w-3xl`, which makes the discovery experience feel narrower than it should on desktop.
- The hero remains heavily centered and single-column, which is fine for marketing copy but underuses width for a content library.
- `Available Videos` is still a vertical list rather than a desktop-friendly grid or split discovery layout.

#### Practice page

File: `client/src/pages/PracticePage.jsx`

- `max-w-4xl` is conservative for a page that already uses a player plus a practice workspace.
- The player column and practice column work, but the whole screen still reads more like a compressed tablet layout than a desktop study interface.

#### Review page

File: `client/src/pages/ReviewPage.jsx`

- Both the intro and completion states are mobile-sized (`max-w-lg`) and look sparse on desktop.
- The active review state uses `max-w-2xl`, which leaves a lot of unused space and misses the chance to show source/video context or upcoming queue information.

#### Video workspace

Files:
- `client/src/pages/VideoPage.jsx`
- `client/src/components/Learning/ProgressDashboard.jsx`

- The left/right workspace structure is good, but the progress dashboard and practice CTA still read like stacked mobile cards inserted into a desktop workspace.
- This page would benefit from a denser desktop sublayout for progress, stats, and actions.

#### Header

File: `client/src/components/Layout/Header.jsx`

- The header currently degrades safely across widths, which is good.
- Long term, desktop can carry more persistent workspace metadata without forcing mobile-style wrapping logic to influence the whole top bar.

## Suggested Priority

1. Expand `HomePage` to a wider desktop discovery layout.
2. Turn `PracticePage` into a clearer study workbench with more width.
3. Upgrade `ReviewPage` from a narrow flow to a desktop review workspace.
4. Tighten the `VideoPage` progress/action area so it feels more like a desktop control surface.
