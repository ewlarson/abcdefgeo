# OpenGeoMetadata Viewer Agent Guide

## Purpose

This repository is evolving the BTAA geospatial frontend into a reusable, static-host-friendly viewer for institutions whose metadata is exposed through the BTAA Geospatial API.

The core product goal is simple:

- one lightweight frontend
- many institutions
- configuration over forks
- localization over hardcoded copy
- static hosting over custom app infrastructure

Preserve BTAA behavior as the reference preset, but make new institutional deployments possible through the default `theme.yaml`, optional `themes/*.yaml` variations, and small, documented configuration changes.

## What To Optimize For

When you make changes here, bias toward:

- static-site compatibility, including GitHub Pages style hosting
- config-driven institution branding, scope, and content
- lightweight dependencies and simple deployment
- accessible search, map, and metadata experiences
- localization readiness, even when shipping English-first UI
- preserving existing BTAA behaviors unless a change is intentionally generalized

## Active Architecture

Treat these areas as the primary implementation surface:

- `src/`: the active client-side React/Vite application
- `theme.yaml`: source of truth for the default theme, institution, and site configuration
- `themes/`: one optional theme variation per YAML file
- `src/config/institution.ts`: theme parsing, storage, and DOM variable application
- `src/i18n/`: shared UI message catalogs and locale helpers
- `src/services/api.ts`: direct BTAA Geospatial API client behavior
- `public/`: static assets and generated site files
- `scripts/`: helper scripts for scaffolding, site-file generation, and QA

Legacy or transitional areas:

- `app/`
- `server/`

Those paths came from the earlier SSR/BFF setup. Do not add new generic product behavior there unless the task explicitly calls for it. Default to the SPA path in `src/`.

## Product Rules

Follow these rules unless the user explicitly asks otherwise:

- Do not hardcode institution names, logos, URLs, or collection scope into generic components.
- Prefer extending theme configuration over adding `if themeId === "..."` branches.
- Keep the API contract fixed on the frontend side. If the API makes generalization awkward, document the proposed backend improvement instead of inventing frontend-only magic.
- Put shared product copy in `src/i18n/messages.ts`.
- Put institution-specific copy in localized theme fields.
- Keep routes compatible with static hosting. Avoid server-only assumptions, proxy-only URLs, and SSR-only data dependencies.
- Preserve direct API URL usage for search, assets, suggestions, and record detail flows when possible.
- Keep BTAA as a first-class preset so this repo remains the reference implementation.

## Localization Rules

- Every new shared UI string should go through the i18n layer.
- Every new institution-configurable string should support localized objects, not just plain strings.
- Assume labels may expand significantly in translation.
- Avoid layout decisions that only work for short English copy.
- Keep locale switching lightweight and client-side.

## Design Rules

`DESIGN.md` is the visual contract for the project.

- If you make meaningful UI or styling changes, read `DESIGN.md` first.
- If you intentionally change the visual system, update `DESIGN.md` in the same task.
- Keep the UI map-forward, institutional, calm, and utility-driven.
- Avoid generic SaaS styling drift.

## Config Rules

When you change `theme.yaml`, `themes/*.yaml`, or theme parsing:

- preserve backward compatibility when reasonable
- keep the BTAA example working
- prefer additive schema changes
- document new fields in `README.md`
- provide sensible defaults so a small institution can launch with minimal edits

If a change requires multiple branded examples, keep one consortium-scale example and one smaller single-institution example.

## Working In This Repo

Before editing:

- inspect the relevant code path first
- check whether the change belongs in `src/` rather than legacy SSR files
- look for an existing config or i18n extension point before adding new logic

While editing:

- keep changes small and composable
- favor plain TypeScript and existing patterns over new abstractions
- avoid adding dependencies unless they clearly reduce long-term complexity
- keep static hosting constraints in mind for routing, assets, and data fetching

After editing:

- run the narrowest useful verification first
- run broader checks when the surface area justifies it
- update docs when configuration, behavior, or visual rules changed

## Verification

Useful commands:

- `npm run lint`
- `npm run test`
- `npm run build`
- `npm run format:check`

Note:

- `package.json` is being reshaped around static-site generation and scaffolding helpers
- if a package script references a helper in `scripts/`, keep that contract intact rather than bypassing it with ad hoc commands

## Definition Of Done

A change is in good shape when:

- the SPA still builds cleanly for static deployment
- BTAA behavior still works unless intentionally changed
- a new institution could adopt the feature through config rather than code forking
- new text is localizable
- accessibility did not regress
- relevant docs were updated

## Common Pitfalls

- Reintroducing BTAA-only assumptions into shared UI
- Adding server-only behavior to a static deployment target
- Putting institution content into code instead of config
- Shipping English-only strings in otherwise localized flows
- Treating the map as decoration instead of a primary discovery surface
- Expanding legacy SSR paths when the SPA path is the actual product direction
