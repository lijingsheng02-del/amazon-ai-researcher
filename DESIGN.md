# Design

## Theme

Light product interface inspired by iOS materials: soft neutral canvas, restrained blue accent, translucent navigation surfaces, compact cards, and direct controls.

## Color

- Canvas: `oklch(0.975 0.006 255)`
- Surface: `oklch(1 0 0)`
- Surface elevated: `oklch(0.99 0.006 255 / 0.78)`
- Ink: `oklch(0.23 0.025 255)`
- Muted ink: `oklch(0.48 0.026 255)`
- Border: `oklch(0.9 0.012 255)`
- Primary: `oklch(0.57 0.18 252)`
- Risk: `oklch(0.58 0.18 25)`
- Success: `oklch(0.58 0.14 155)`

## Typography

System UI stack for a native desktop feel. Use fixed product UI sizes, not viewport-scaled type.

## Components

- Sidebar with glass-like blur and clear active state.
- Cards limited to report modules and repeated records.
- Buttons use one shared radius, weight, focus ring, and loading state.
- Form inputs are dense, labeled, and aligned for fast data entry.
- Report modules emphasize score, risks, target segment ordering, image recommendations, and QA predictions.

## Layout

Two-column desktop shell: left navigation, right task surface. Product input uses a responsive two-column form. Reports use a metric row plus scannable sections.

## Motion

Subtle 150-220ms transitions for hover, active view changes, and progress updates. No decorative page-load choreography.
