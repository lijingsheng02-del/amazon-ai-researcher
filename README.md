# Amazon AI Researcher

Amazon AI Researcher is a Windows desktop research assistant for Amazon operators, product researchers, and listing teams. It helps evaluate product ideas before launch by generating structured, simulated feedback from virtual US buyer personas.

The app is designed for internal research, product planning, listing strategy, and risk discovery. It is not a review-generation tool and must not be used to fabricate, imitate, or manipulate real Amazon customer reviews.

## Current Version

`v0.3.0`

## Key Features

- Simulated buyer research for Amazon products, categories, and listing ideas.
- Built-in pool of 100 virtual US consumer personas.
- Dynamic persona selection based on product category and research context instead of blindly averaging all 100 personas.
- Two research modes:
  - **Offline Rules Mode**: works without an external API key.
  - **API Enhanced Mode**: uses an OpenAI-compatible chat completions API when configured.
- Local project storage with SQLite.
- Custom report names before generation and report renaming after generation.
- Styled `.xlsx` export for finished reports, including embedded uploaded product images when the image format is Excel-compatible.
- More visible research progress states during offline and API-enhanced generation.
- Product image upload for report context, up to 9 images per product.
- Buyer-level image evaluation, including image impact on purchase intent and consistency between images, selling points, size/material claims, and usage scenarios.
- Amazon product link and competitor link input.
- Operator-facing report modules covering:
  - Purchase intent
  - Positive buying drivers
  - Bad-review risk triggers
  - Pricing feedback
  - Target customer ranking
  - Listing optimization suggestions
  - Main image ideas
  - A+ content image ideas
  - Buyer image feedback
  - Predicted customer Q&A

## Product Philosophy

Amazon AI Researcher is not a real market survey and does not claim to represent actual Amazon customers. It is a structured thinking tool that helps operators pressure-test product assumptions before spending time and money on sourcing, listing, photography, advertising, or inventory.

The output should be treated as research hypotheses, not verified market facts.

## Research Workflow

1. Enter product information, category notes, or Amazon links.
2. The app detects a relevant category research template.
3. The system selects matching personas from the 100-person virtual buyer pool.
4. Offline rules or API-enhanced AI generates structured persona feedback.
5. The app aggregates the results into an operator-focused report.
6. Reports are saved locally for later comparison, renaming, review, and Excel export.

## Built-In Category Templates

The MVP includes broad templates for:

- Home & Kitchen
- Baby / Family
- Pet Supplies
- Electronics
- Beauty & Personal Care
- Outdoor & Sports
- Apparel & Accessories
- General Product

Each template defines decision dimensions, risk lenses, persona-selection signals, and report modules.

## Tech Stack

- React
- TypeScript
- Tailwind CSS
- Electron
- SQLite with `better-sqlite3`
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

Build a distributable Windows installer:

```bash
npm run dist
```

## API Configuration

API Enhanced Mode expects an OpenAI-compatible chat completions endpoint.

Required settings:

- API key
- Base URL
- Model name

These settings are stored locally. Do not commit API keys, `.env` files, SQLite databases, packaged binaries, generated reports, or local build output.

## Local Data

Application data is stored in Electron's local user data directory. This may include settings, persona data, projects, reports, and training examples.

The repository intentionally excludes:

- `node_modules`
- `dist`
- `release`
- `.env`
- local logs
- local screenshots
- user SQLite databases
- generated build artifacts

## Versioning

See [VERSIONING.md](./VERSIONING.md).

Short rule:

- Patch version: bug fixes, copy changes, documentation updates, and compatibility fixes.
- Minor version: new product capabilities or workflow improvements.
- Major version: stable production release.

## Roadmap

Near-term priorities:

- Add legally and technically appropriate Amazon market signals.
- Add competitor ASIN comparison modules.
- Add keyword and pricing-band research inputs.
- Improve historical report comparison.
- Add export formats for operator handoff.
- Improve category-specific templates and persona weighting.

## Ethical Boundary

This software must not be used to create fake reviews, fake buyer feedback, review-like content, or misleading Amazon content. Its output is simulated research analysis for internal decision support only.

Use it to find risks, improve product planning, and make better operator decisions before launch.
