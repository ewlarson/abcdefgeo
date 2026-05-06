# abcdefgeo

A configurable, static-site-friendly geospatial discovery frontend for metadata
served by the BTAA Geospatial API.

This project is evolving the BTAA Geoportal frontend into a reusable
OpenGeoMetadata viewer that can be branded for different institutions without
forking the application. The goal is a lightweight React/Vite app that runs well
on static hosting, keeps institutional content in configuration, and preserves
BTAA as the reference preset.

## What It Does

- Searches and displays geospatial records from the BTAA Geospatial API.
- Provides search, map, bookmark, and resource detail views.
- Uses `theme.yaml` for institution branding, navigation, homepage content,
  API paths, locale settings, and deployment-facing metadata.
- Supports localized shared UI strings through `src/i18n/`.
- Builds as static assets that can be hosted on services such as GitHub Pages.

## Project Shape

The active application lives in `src/`:

- `src/config/institution.ts` parses `theme.yaml` and applies theme settings.
- `src/services/api.ts` talks directly to the BTAA Geospatial API.
- `src/i18n/` contains shared message catalogs and locale helpers.
- `src/components/` and `src/pages/` implement the viewer experience.
- `public/` contains static assets used by themes and the generated site.
- `scripts/` contains scaffolding, site generation, and QA helpers.

The `app/` and `server/` directories are legacy or transitional code from an
earlier SSR/BFF setup. Prefer the SPA path in `src/` for new product work unless
a task explicitly calls for those older surfaces.

## Getting Started

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env
```

Start the development server:

```bash
npm run dev
```

Build the static site:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Configuration

The main configuration file is `theme.yaml`.

The default theme is currently `unr`, a University of Nevada, Reno pilot. The
`btaa` theme remains the reference preset for BTAA Geoportal behavior and
localization.

Theme configuration controls:

- site title, description, locale support, and web app manifest colors
- institution name, logo, header lockup, and hero copy
- brand colors, fonts, and optional institution-hosted font stylesheets
- navigation links, utility links, and calls to action
- homepage hero content, featured records, collection spotlights, media, and
  blog modules
- footer layout, links, institutional address, and copyright text
- BTAA Geospatial API base URL, endpoint paths, and default query parameters

For new institutional deployments, prefer adding fields to `theme.yaml` over
hardcoding institution-specific behavior in components.

## Environment Variables

Most deployment behavior should come from `theme.yaml`. Environment variables
are reserved for local development, legacy fallbacks, or deployment secrets.

Common variables:

- `VITE_BASE_URL`: base path for Vite builds, usually `/`.
- `VITE_API_BASE_URL`: legacy API base URL fallback when a theme does not define
  `api.base_url`.
- `VITE_CSRF_TOKEN`: optional CSRF token placeholder for deployments that need
  it.
- `VITE_APP_VERSION`: version label sent in API diagnostic headers.
- `VITE_ENABLE_DEBUG_LOGS`: enables client debug logging when true.
- `VITE_TURNSTILE_ENABLED`: enables or disables Turnstile checks.
- `VITE_TURNSTILE_SITE_KEY`: Cloudflare Turnstile site key.
- `VITE_TURNSTILE_ACTION`: Turnstile action name.

Do not commit real `.env` files or private API keys.

## Scripts

```bash
npm run dev             # generate site files and start Vite
npm run build           # generate site files and build static assets
npm run preview         # preview the built site
npm run test            # run Vitest
npm run lint            # run ESLint
npm run lint:fix        # run ESLint with automatic fixes
npm run format          # run Prettier
npm run format:check    # check formatting
npm run scaffold        # create a starter theme snippet
npm run deploy          # publish dist/ with gh-pages
```

## Creating A New Institution Theme

Use the scaffold helper to create a starter theme snippet:

```bash
npm run scaffold -- my-institution "My Institution"
```

The scaffold is written to `/private/tmp/ogm-viewer-scaffolds/` for review and
copying into `theme.yaml`.

When adding a new theme:

- keep `btaa` working as the reference implementation
- keep copy localizable by using localized objects for configurable text
- use theme fields for institution names, logos, links, colors, and homepage
  content
- avoid server-only assumptions so the site remains static-host friendly
- update this README when new public configuration fields are introduced

## Deployment

This app builds to `dist/` and can be hosted as static files.

The repository includes a GitHub Pages workflow in
`.github/workflows/deploy.yml`. Review its branch trigger and required secrets
before relying on it for a new deployment.

Manual deployment through the `gh-pages` package is available with:

```bash
npm run deploy
```

## Development Notes

- `theme.yaml` is the source of truth for institution branding and deployment
  configuration.
- Shared UI copy belongs in `src/i18n/messages.ts`.
- Institution-specific copy should stay in localized theme fields.
- Generic product work should usually happen in `src/`, not `app/` or `server/`.
- Keep the viewer map-forward, accessible, localizable, and static-host
  compatible.
