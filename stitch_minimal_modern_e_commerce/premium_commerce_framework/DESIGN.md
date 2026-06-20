---
name: Premium Commerce Framework
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#45464d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#5c5f61'
  on-secondary: '#ffffff'
  secondary-container: '#e0e3e5'
  on-secondary-container: '#626567'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#271901'
  on-tertiary-container: '#98805d'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#e0e3e5'
  secondary-fixed-dim: '#c4c7c9'
  on-secondary-fixed: '#191c1e'
  on-secondary-fixed-variant: '#444749'
  tertiary-fixed: '#fcdeb5'
  tertiary-fixed-dim: '#dec29a'
  on-tertiary-fixed: '#271901'
  on-tertiary-fixed-variant: '#574425'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '600'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.2'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  gutter: 24px
  margin: 32px
---

## Brand & Style

The design system is rooted in the principles of **high-end SaaS minimalism**, drawing inspiration from the precise execution of Apple and the functional elegance of Stripe. It is designed to evoke a sense of quiet confidence, reliability, and effortless sophistication.

The aesthetic prioritizes clarity over decoration. By utilizing significant whitespace, refined typography, and a restrained color palette, the UI recedes to let product imagery and content take center stage. The target audience values efficiency and premium craftsmanship, expecting a frictionless transaction experience that feels both modern and timeless.

## Colors

The palette is built on a foundation of "Soft Neutrals." We avoid pure black for text to maintain a high-end, softer feel, opting instead for **Deep Charcoal** (#0F172A) for primary headings and UI actions.

- **Primary:** A deep, ink-like navy/black used for primary buttons, active states, and brand-critical elements.
- **Surface:** High-use of white (#FFFFFF) and subtle off-whites (#F8FAFC) to create a layered, "airy" environment.
- **Neutral/Stroke:** Cool grays used for borders, secondary labels, and icon backgrounds to maintain a low-friction visual hierarchy.
- **Functional:** Success, error, and warning states should use desaturated, sophisticated tones rather than bright neon hues to stay consistent with the professional SaaS aesthetic.

## Typography

The design system utilizes **Inter** for all roles, leaning into its systematic and utilitarian nature. The hierarchy is established through deliberate weight shifts and tight tracking on larger sizes.

- **Headlines:** Use Semi-Bold (600) with slight negative letter spacing to create a compact, "editorial" look.
- **Body:** Standardized at 16px for optimal readability, utilizing a generous line height (1.5) to reinforce the spacious feel.
- **Labels:** Small labels and captions use Medium (500) or Semi-Bold (600) weights to ensure legibility despite the reduced size.

## Layout & Spacing

This design system follows a strict **8px linear grid** to ensure mathematical harmony across all components.

- **Grid Model:** A 12-column fluid grid for desktop with 24px gutters. For mobile, a 4-column grid with 16px margins.
- **Containers:** Content should be centered in a max-width container of 1280px for desktop viewing.
- **Vertical Spacing:** Use "generous breathing room." Sections should be separated by `xl` (80px) or `lg` (48px) spacing to prevent the interface from feeling cluttered, mimicking the "museum" aesthetic of premium brands.

## Elevation & Depth

We utilize **Ambient Shadows** to create a sense of natural depth without the harshness of traditional drop shadows. Depth is used sparingly to signify interactivity and layering.

- **Level 1 (Default):** Flat or 1px subtle border (#E2E8F0). Used for input fields and static cards.
- **Level 2 (Hover/Floating):** A soft, diffused shadow: `0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)`.
- **Level 3 (Modals/Overlays):** A deeper, more expansive shadow to pull the element forward: `0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)`.

Surfaces should primarily be white, using elevation rather than color to separate the background from the foreground.

## Shapes

The shape language is "Soft-Modern." We use a consistent corner radius to bridge the gap between friendly consumer tech and professional SaaS tools.

- **Components:** Standard buttons, inputs, and small cards use a **12px** (rounded) radius.
- **Containers:** Large product cards and modal containers use a **16px** (rounded-lg) radius.
- **Full-round:** Icons backgrounds and specific pill-tags use a fully rounded (999px) radius to provide visual contrast against the structured grid.

## Components

### Buttons
- **Primary:** Solid Deep Charcoal background with White text. No border. 12px radius. High-padding (12px vertical, 24px horizontal).
- **Secondary:** Ghost style. 1px light gray border. Deep Charcoal text. Smooth transition to a light gray background on hover.

### Input Fields
- **Standard:** 1px border (#E2E8F0), 12px radius. Background is pure white. Placeholder text in light neutral (#94A3B8). On focus, the border thickens or changes to the primary accent color with a subtle outer glow.

### Product Cards
- **Structure:** Image first, followed by a minimal details section. 
- **Style:** No border; instead, use a very subtle "Level 1" shadow or a light gray background fill (#F8FAFC). The product title should be prominent, with the price in a slightly lighter weight.

### Chips & Tags
- **Style:** Pill-shaped, low-contrast. Use light gray backgrounds with charcoal text for categories. Use small, 8px circular indicators for status-based tags (e.g., "In Stock").

### Lists & Navigation
- **Header:** Sticky with a backdrop-blur (glassmorphism) effect: `blur(12px)` and `80% opacity` white background.
- **Links:** Understated. No underlines by default; use a subtle weight change or color shift on hover.