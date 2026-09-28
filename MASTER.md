# MASTER — Design System

Single source of truth for the Mine Project Economics Simulator UI. Every color, size, radius and
duration in `index.html` comes from a token defined here. No magic numbers.

## Theses

**Visual** — Dark-first analytics interface on a deep slate ground, with a single emerald-teal
accent that carries all value and interactivity; system geometric sans with tight negative tracking
on large tabular-figure numerals so results read as instruments, not text; airy 4px-based spacing
that tightens inside data zones; softly rounded (6/10/14px) low-elevation panels defined by hairline
borders and restrained shadow, never heavy chrome.

**Interaction** — Choreographed but quick (180–420ms) on one expo-out curve: panels and KPI cards
stagger in 45ms apart on load and on every re-run, result values count up from their previous
number, the chart line draws left-to-right once per run (900ms), hover lifts a card 2px and
brightens its border, tab switches slide an accent underline. **Forbidden:** bounce or elastic
easing, spinners, parallax, looping ambient motion, and animating `width`/`height`/`top`/`left`.

## Color

Dark is the default theme. Light is reachable via the header toggle and persists per browser.
Ratios are computed (WCAG 2.1), not estimated.

### Dark

| Token | Value | Role | Contrast |
|---|---|---|---|
| `--bg` | `#0B1015` | page ground | — |
| `--panel` | `#121A21` | cards, sidebar | — |
| `--inset` | `#0C1319` | inputs, wells, table stripes | — |
| `--line` | `#212D36` | hairline dividers | — |
| `--line-strong` | `#33434F` | control edges, hover borders | — |
| `--tx` | `#E8EEF2` | primary text | 16.32:1 on bg |
| `--tx2` | `#9AAAB6` | secondary text | 8.01:1 on bg |
| `--tx3` | `#7C8D9A` | muted labels | 5.58:1 on bg |
| `--accent` | `#2DD4BF` | value, interactivity, focus ring | 10.26:1 on bg |
| `--accent-hi` | `#5EEAD4` | accent hover | — |
| `--accent-ink` | `#04211D` | text on accent fill | 9.09:1 on accent |
| `--pos` | `#34D399` | positive outcome only | 9.14:1 on panel |
| `--neg` | `#F87171` | negative outcome only | 6.35:1 on panel |

### Light

| Token | Value | Role | Contrast |
|---|---|---|---|
| `--bg` | `#F5F7F8` | page ground | — |
| `--panel` | `#FFFFFF` | cards | — |
| `--inset` | `#F0F3F5` | inputs, wells | — |
| `--line` | `#E1E7EA` | hairline dividers | — |
| `--line-strong` | `#C6D0D6` | control edges | — |
| `--tx` | `#0F1A20` | primary text | 16.73:1 on bg |
| `--tx2` | `#566A78` | secondary text | 5.63:1 on panel |
| `--tx3` | `#64748B` | muted labels | 4.51:1 on bg |
| `--accent` | `#0F766E` | value, interactivity | 5.47:1 on panel |
| `--accent-hi` | `#0D9488` | accent hover | — |
| `--accent-ink` | `#FFFFFF` | text on accent fill | 5.47:1 on accent |
| `--pos` | `#047857` | positive outcome only | 5.48:1 on panel |
| `--neg` | `#DC2626` | negative outcome only | 4.83:1 on panel |

**Semantic rule:** `--pos` and `--neg` are reserved exclusively for financial outcome. A red number
always means the project loses money. Never use them for decoration.

**Input identification** relies on the `--inset` fill plus the focus ring, not on border contrast —
a 3:1 border on dark would read as heavy chrome. The focus ring is `--accent` at 9.44:1, which
satisfies WCAG 1.4.11 for the control boundary.

## Typography

System stack — **no web fonts**, because the tool must run offline from `file://`.

```
--sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif
--mono: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace
```

| Step | Size | Weight | Tracking | Use |
|---|---|---|---|---|
| display | 2rem | 650 | -0.025em | hero KPI values |
| title | 1.5rem | 600 | -0.02em | page title |
| panel | 1rem | 600 | -0.01em | panel headings |
| body | 0.875rem | 400 | — | prose, controls |
| label | 0.6875rem | 600 | 0.07em, uppercase | KPI captions, legends |
| mono | 0.75rem | 400 | — | seed, technical chips |

All numeric output uses `font-variant-numeric: tabular-nums` so digits stay aligned as values change.

## Spacing

Base unit 4px. Scale: `4, 8, 12, 16, 20, 24, 32, 40, 48, 64`.

## Radius & elevation

| Token | Value |
|---|---|
| `--r-sm` | 6px (controls, chips) |
| `--r-md` | 10px (cards, inputs) |
| `--r-lg` | 14px (panels) |
| `--e1` | `0 1px 2px rgba(0,0,0,.45)` — resting panel |
| `--e2` | `0 8px 28px rgba(0,0,0,.40)` — hover lift |

## Motion

| Token | Value |
|---|---|
| `--dur-fast` | 180ms (hover, focus, color) |
| `--dur-base` | 280ms (entrance, tab slide) |
| `--dur-slow` | 420ms (panel entrance) |
| `--ease` | `cubic-bezier(.16,1,.3,1)` — entrance, movement |
| `--ease-fast` | `cubic-bezier(.22,1,.36,1)` — hover, micro |
| `--ease-exit` | `cubic-bezier(.4,0,1,1)` — exits only |
| stagger | 45ms between siblings |
| count-up | 700ms, quart-out, JS |
| chart draw | 900ms, progressive left-to-right, once per run |

**Rules:** only `transform` and `opacity` are animated. Exits are shorter and subtler than entrances
(opacity only). Every animation is disabled under `prefers-reduced-motion: reduce`, which is honored
both in CSS and in the JS count-up and chart-draw paths.

## Component states

Every interactive element defines all five: default, hover, focus-visible, active, disabled. Focus
is always a 2px `--accent` ring at `outline-offset: 2px`; `outline: none` is never used without a
replacement.

## Iconography

SVG only (inline, currentColor). No emoji as icons.

## Responsive

Breakpoints at 1100px (sidebar collapses above chart), 760px (KPI grid to 2 columns), 460px (single
column). No horizontal page scroll at any width; wide tables scroll inside their own container.
