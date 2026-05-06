# rui
React UI for our exploratory data api

![RUI Screenshot](../docs/frontend/rui.png)

## Development

Install dependencies:
```bash
npm install
```

Configure the database:
```bash
cp .env.example .env
```

Run the server:
```bash
npm run dev
```

Push to the gh-pages branch:
```bash
npm run deploy
```

Lint the code:
```bash
npm run lint
```

Fix lint errors:
```bash
npm run lint:fix
```

Format the code:
```bash
npm run format
```

Check formatting:
```bash
npm run format:check
```

## Theming

The active configuration lives in `theme.yaml`. This repo now includes:

- `btaa` as the reference preset
- `unr` as a pilot proof-of-concept for an institution-branded deployment

The UNR pilot extends the shared theme model with a few new config hooks that are intended to stay reusable for other institutions:

- `branding.assets.font_stylesheets`: load institution-hosted webfont stylesheets
- `branding.fonts.heading` and `branding.fonts.ui`: separate body, heading, and utility typography
- `navigation.utility_links` and `navigation.cta`: build a two-tier institutional header without layout forks
- `homepage.hero_background_image_url` and `homepage.hero_actions`: brand the homepage hero while keeping search and map discovery front and center
- `homepage.collection_spotlights[].collection_label`: override the secondary CTA label when a spotlight links to a search flow instead of a collection record
- `footer.style: photo`, `footer.title`, `footer.address_lines`, and `footer.background_image_url`: support photo-backed institutional footers

These additions are additive and keep BTAA working as the reference implementation.

For institution deployments, `theme.yaml` is also the frontend source of truth for
the BTAA API endpoint via `api.base_url`. The legacy `VITE_API_BASE_URL` env var is
treated as a fallback for older proxy-based setups, not the preferred configuration
path for new themes.

Recent API-facing paths are also configurable in `theme.yaml` so a static viewer
can stay aligned with the BTAA API without route forks:

- `api.gazetteer_search_path`: cached Nominatim-compatible place search used by
  search box and no-results recovery suggestions
- `api.turnstile_status_path` and `api.turnstile_verify_path`: optional
  Cloudflare Turnstile session checks when a deployment enables
  `VITE_TURNSTILE_SITE_KEY`
- `api.client_name`: client identifier sent on same-origin/server API requests
  for analytics and request diagnostics

Turnstile is disabled unless `VITE_TURNSTILE_SITE_KEY` is present and
`VITE_TURNSTILE_ENABLED` is not set to `false`.

## Todos

- [ ] Item View - Catch up to BTAA redesign
- [ ] Item View - Tabbed interface (Item View | Map Overlay | Metadata | API)
- [ ] Item View - Downloads (more options, more prominently displayed)
- [ ] Item View - Metadata tab (ISO, FGDC,JSON)
- [ ] Item View - Relations
- [ ] Item View - Code snippets
- [ ] Item View - Relations
- [ ] Item View - More like this panel
- [ ] Item View - Social media meta tags
- [ ] Item View - Add a "share" icon
- [ ] Design - Make the application themeable
- [ ] App - Progressive Web App
