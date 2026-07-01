# Versioning

This project uses SemVer-style versioning.

- `0.1.0`: MVP baseline. Local Electron app, SQLite persistence, 100 persona pool, offline rules, API-enhanced mode, category templates, dynamic persona sampling, product image upload, and report history.
- `0.1.1`: README rewritten for GitHub project presentation and usage guidance.
- `0.2.0`: Added Excel report export, custom report names, report renaming, and more visible research progress updates.
- `0.2.1`: Reworked report export to styled `.xlsx` workbooks with better formatting and embedded uploaded product images where supported.
- `0.3.0`: Increased product image uploads to 9 and added buyer-level image impact and image consistency evaluation to persona results, reports, and Excel export.
- `0.3.1`: Fixed backward compatibility so older reports without newly added image feedback fields open normally instead of rendering a blank screen.
- `0.4.0`: Added vision-capable API image inspection for uploaded product images and made text-only fallback explicit when visual analysis is unavailable.
- `0.4.1`: Cleaned the README roadmap by removing completed export-format work from near-term priorities.
- `0.5.0`: Added competitor ASIN comparison across API/offline research, report display, and Excel export while keeping the no-live-Amazon-data boundary explicit.
- `0.5.1`: Increased per-image upload limit to 5MB and strengthened image optimization advice around background color, layout, target customer positioning, and per-image shooting angle.
- Patch versions such as `0.4.2`: bug fixes, copy fixes, small UI corrections, documentation updates, or compatibility fixes.
- Minor versions such as `0.5.0`: new product capabilities, new report modules, new data integrations, or major workflow improvements.
- Major versions such as `1.0.0`: stable production release with validated core workflow and migration-safe local data handling.

Do not commit local API keys, user SQLite databases, generated build output, or packaged desktop binaries.
