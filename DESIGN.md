# Design Brief

## Direction

Chalk & Light — a warm, encouraging study companion where the 7-step learning method is the interface itself.

## Tone

Friendly, motivating, and uncluttered — rounded shapes and warm off-white surfaces keep a beginner student calm and confident, never overwhelmed.

## Differentiation

A signature 7-step "learning path" rail (Comprendre → Exemple → S'entraîner → Corriger → Mémoriser → Tester → Maîtriser) where each node carries its own hue and fills as the student advances — the method becomes the visual identity.

## Color Palette

| Token      | OKLCH       | Role                                             |
| ---------- | ----------- | ------------------------------------------------ |
| background | 0.975 0.008 85  | Warm off-white page surface                  |
| foreground | 0.235 0.045 285 | Deep indigo text, high contrast, never black |
| card       | 0.995 0.004 85  | Near-white elevated content surface          |
| primary    | 0.47 0.185 285  | Deep indigo-violet — brand, CTAs, active nav |
| accent     | 0.76 0.155 70   | Warm motivating amber — points, highlights   |
| success    | 0.6 0.155 155   | Emerald — correct answers, mastery           |
| destructive| 0.56 0.2 25     | Coral red — wrong answers, errors            |
| step-1..7  | 285→305→250→200→155→70→15 | Per-step learning path hues   |

## Typography

- Display: Nunito — rounded, warm, humanist headings and hero text; encouraging and beginner-friendly.
- Body: Figtree — clean, highly legible UI/paragraph text at every size.
- Mono: Geist Mono — numbers, scores, timers, stats.
- Scale: hero `text-4xl md:text-6xl font-extrabold tracking-tight`; h2 `text-2xl md:text-4xl font-bold tracking-tight`; label `text-xs font-bold tracking-widest uppercase`; body `text-base md:text-lg`.

## Elevation & Depth

Soft, layered elevation: `shadow-soft` for resting cards, `shadow-lifted` for hovered/active cards and popovers; depth comes from warm surface layering (background → card → popover), never heavy borders.

## Structural Zones

| Zone    | Background          | Border            | Notes                                                        |
| ------- | ------------------- | ----------------- | ------------------------------------------------------------ |
| Header  | bg-card / backdrop-blur | border-b      | Sticky top nav, brand left, nav center, points pill right   |
| Content | bg-background       | —                 | Alternate `bg-muted/30` and `bg-secondary/20` between sections |
| Footer  | bg-muted/40         | border-t          | Slogan + language/country selectors, muted tone             |

## Spacing & Rhythm

Generous, mobile-first rhythm: section gaps `py-12 md:py-20`, card padding `p-5 md:p-6`, grid gaps `gap-4 md:gap-6`, micro-spacing in 4/8px steps; whitespace is the primary hierarchy tool.

## Component Patterns

- Buttons: fully rounded pills, `bg-primary` with `shadow-soft`, hover lifts to `shadow-lifted`; accent amber for rewards/points; success/destructive for correction actions.
- Cards: `rounded-2xl`, `bg-card`, `border border-border`, `shadow-soft`, hover `shadow-lifted` + slight translate.
- Badges: pill-shaped, tinted backgrounds (`bg-success/15 text-success`, `bg-accent/15 text-accent-foreground`, `bg-destructive/15`).
- Progress: circular rings using `--step-*` hues; horizontal stepper rail with connected nodes.

## Motion

- Entrance: `animate-fade-in-up` (0.4s) on section/card mount, staggered ~60ms.
- Hover: `transition-smooth` (0.3s) on transform + shadow for cards and buttons.
- Decorative: `animate-pop-in` for badges/rewards, `animate-ring-fill` for progress rings; one restrained motion story, no bouncing.

## Constraints

- All colors via semantic OKLCH tokens — no hex, rgb, or arbitrary Tailwind color classes.
- French-first UI copy; slogan "Apprendre. Comprendre. Maîtriser." treated as a hero element.
- Mobile-first responsive (Android/iPhone/ordinateur); touch targets ≥ 44px.
- 3–5 core colors max; the 7 step hues are a functional sequence, not decoration.

## Signature Detail

The 7-step learning path rail — seven hue-coded connected nodes that light up in sequence as the student moves from Comprendre to Maîtriser, turning the pedagogical method into a visible, motivating journey.
