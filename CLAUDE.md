# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"Hjemme" is a Norwegian-language "am I home?" app. Friends/family visit the public page to see if Oliver is available for visits. Oliver uses the `/admin` page to toggle his status. It's a PWA-capable Express.js app with no build step.

## Commands

- `npm install` — install dependencies
- `npm start` — start the server (default port 3000)
- No test framework, linter, or build pipeline is configured

## Architecture

Single-file Express server (`server.js`) with two HTML pages served as static files. No frontend framework — vanilla JS with inline `<script>` and `<style>` blocks.

**Server (`server.js`):** Express app with three API endpoints and static file serving. State is persisted to `state.json` on disk (read on startup, written on every status change).

**API:**
- `GET /api/status` — public, returns `{ home, updatedAt }`
- `POST /api/status` — requires `X-Admin-Token` header, body `{ home: boolean }`
- `GET /api/health` — health check

**Pages:**
- `public/index.html` — visitor-facing page, polls `/api/status` every 30s, shows house SVG illustration with animated window lights
- `public/admin.html` — toggle switch to update status, stores admin token in localStorage

**Environment variables:**
- `PORT` (default: 3000)
- `ADMIN_TOKEN` (default: `endre-dette-til-noe-hemmelig`) — used for admin authentication

## Conventions

- UI text and error messages are in Norwegian
- CSS uses custom properties defined in `:root` with a light warm color scheme (`--bg-dark: #f5f0eb`)
- Fonts: DM Serif Display (headings), Nunito (body) loaded from Google Fonts
