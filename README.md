# Amazon AI Researcher

Amazon AI Researcher is a Windows desktop research tool for Amazon operators. It simulates structured feedback from US virtual buyer personas to help evaluate product concepts, listing strategy, image planning, pricing risk, and likely bad-review triggers before launch.

This tool is for operational research hypotheses only. It must not be used to generate, imitate, or fabricate real Amazon reviews.

## Current Version

`v0.1.1`

## What It Does

- Runs simulated buyer research for Amazon products and categories.
- Uses a built-in pool of 100 US virtual consumer personas.
- Dynamically selects the most relevant personas for each product instead of blindly averaging all 100 personas.
- Supports two research modes:
  - Offline Rules Mode: works without any external API key.
  - API Enhanced Mode: uses an OpenAI-compatible chat completions API when configured.
- Saves projects, product inputs, persona outputs, and reports locally with SQLite.
- Supports product image upload for report context.
- Supports Amazon product links and competitor links as structured input.
- Displays report modules for purchase intent, positive drivers, bad-review risks, pricing feedback, target customer ranking, listing suggestions, main image ideas, A+ image ideas, and predicted QA questions.

## Core Product Logic

The app is not a real market survey. It is a structured thinking tool.

The current research flow is:

1. User enters product or Amazon link information.
2. System detects a category research template.
3. System selects a relevant persona sample from the 100-person pool.
4. Offline rules or API-enhanced AI generates structured persona feedback.
5. The app aggregates the outputs into an operator-facing report.
6. The report is saved locally for later review.

## Built-In Category Templates

The MVP includes these broad templates:

- Home & Kitchen
- Baby / Family
- Pet Supplies
- Electronics
- Beauty & Personal Care
- Outdoor & Sports
- Apparel & Accessories
- General Product

Each template defines decision dimensions, risk lenses, report modules, and persona-selection signals.

## Tech Stack

- React
- TypeScript
- Tailwind CSS
- Electron
- SQLite via `better-sqlite3`
- Vite
- Oxlint

## Local Development

Install dependencies:

```bash
npm install
```

Run the desktop app in development mode:

```bash
npm run dev
```

Run validation:

```bash
npm run build
npm run lint
```

Build an unpacked Windows desktop app:

```bash
npm run pack
```

Build a distributable installer:

```bash
npm run dist
```

## API Configuration

API Enhanced Mode expects an OpenAI-compatible chat completions endpoint.

Required settings:

- API Key
- Base URL
- Model name

The app stores settings locally. Do not commit API keys, local SQLite databases, `.env` files, packaged binaries, or generated build output.

## Local Data

SQLite data is stored in Electron's user data directory on the local machine. This includes settings, persona data, projects, reports, and training examples.

The repository intentionally excludes:

- `node_modules`
- `dist`
- `release`
- `.env`
- local logs
- local screenshots
- user SQLite databases

## Versioning

See [VERSIONING.md](./VERSIONING.md).

Short rule:

- Patch version: bug fixes, copy changes, documentation updates, compatibility fixes.
- Minor version: new product capabilities or workflow improvements.
- Major version: stable production release.

## Roadmap

Near-term priorities:

- Add real Amazon market signals where legally and technically appropriate.
- Add competitor ASIN comparison modules.
- Add keyword and pricing-band research inputs.
- Improve report comparison across historical projects.
- Add export formats for operator handoff.
- Improve category-specific templates and persona weighting.

## Hard Boundary

This software must not be used to create fake reviews, fake buyer feedback, or misleading Amazon content. Its output is simulated research analysis for internal decision support only.
