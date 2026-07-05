---
name: Nature's Alchemy
colors:
  surface: '#fff8f5'
  surface-dim: '#e1d8d4'
  surface-bright: '#fff8f5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fbf2ed'
  surface-container: '#f5ece7'
  surface-container-high: '#efe6e2'
  surface-container-highest: '#e9e1dc'
  on-surface: '#1e1b18'
  on-surface-variant: '#434843'
  inverse-surface: '#34302c'
  inverse-on-surface: '#f8efea'
  outline: '#737973'
  outline-variant: '#c3c8c1'
  surface-tint: '#4d6453'
  primary: '#061b0e'
  on-primary: '#ffffff'
  primary-container: '#1b3022'
  on-primary-container: '#819986'
  inverse-primary: '#b4cdb8'
  secondary: '#5f5e5b'
  on-secondary: '#ffffff'
  secondary-container: '#e5e2dd'
  on-secondary-container: '#656461'
  tertiary: '#281200'
  on-tertiary: '#ffffff'
  tertiary-container: '#462300'
  on-tertiary-container: '#cb8341'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d0e9d4'
  primary-fixed-dim: '#b4cdb8'
  on-primary-fixed: '#0b2013'
  on-primary-fixed-variant: '#364c3c'
  secondary-fixed: '#e5e2dd'
  secondary-fixed-dim: '#c9c6c2'
  on-secondary-fixed: '#1c1c19'
  on-secondary-fixed-variant: '#474743'
  tertiary-fixed: '#ffdcc2'
  tertiary-fixed-dim: '#ffb77b'
  on-tertiary-fixed: '#2e1500'
  on-tertiary-fixed-variant: '#6d3a00'
  background: '#fff8f5'
  on-background: '#1e1b18'
  surface-variant: '#e9e1dc'
typography:
  headline-xl:
    fontFamily: Libre Caslon Text
    fontSize: 48px
    fontWeight: '400'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Libre Caslon Text
    fontSize: 32px
    fontWeight: '400'
    lineHeight: '1.2'
  headline-lg:
    fontFamily: Libre Caslon Text
    fontSize: 32px
    fontWeight: '400'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Libre Caslon Text
    fontSize: 24px
    fontWeight: '400'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Work Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Work Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Work Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Work Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: 0.03em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
---

## Brand & Style
The brand personality is **Trustworthy, Botanical, and Artisanal**. It positions itself as a modern authority on ancient wisdom, blending the precision of science with the soul of herbalism. The target audience seeks premium, high-quality wellness solutions and appreciates a ritualistic approach to health.

The design style is **Modern Apothecary**. It utilizes a sophisticated balance of high-contrast editorial typography and clean, structured layouts. The UI evokes a sense of "digital parchment"—tactile yet efficient—using subtle textures and organic depth to differentiate from cold, clinical wellness brands. The emotional response should be one of calm assurance and curated luxury.

## Colors
This design system uses a heritage-inspired palette that grounds the user in the botanical world.

- **Primary (Deep Forest Green):** Used for primary navigation, headings, and high-impact backgrounds. It represents the density and life of the forest.
- **Secondary (Heritage Cream):** The primary surface color. It provides a warm, accessible alternative to stark white, suggesting natural paper or muslin.
- **Tertiary (Warm Copper):** Reserved for interactive highlights, call-to-action accents, and premium badges. It evokes the quality of artisanal distillation tools.
- **Neutral (Charcoal):** Used for body text and functional icons to ensure maximum legibility against the cream background.

## Typography
The typography strategy pairings high-contrast serif with a grounded sans-serif to bridge the gap between "heritage" and "modernity."

- **Headlines:** Libre Caslon Text provides an authoritative, editorial feel. Use `headline-xl` for hero sections and storytelling. Its organic curves reflect botanical shapes.
- **Body:** Work Sans is chosen for its professional and neutral character, ensuring that dense information about ingredients and benefits remains highly readable.
- **Labels:** Small caps and increased letter-spacing should be used for labels and metadata to create a "cataloged" or "archival" appearance, reminiscent of apothecary jar labels.

## Layout & Spacing
The design system employs a **Fixed Grid** philosophy on desktop to maintain an editorial, magazine-like feel, while transitioning to a fluid model on mobile.

- **Desktop:** 12-column grid with wide margins (64px) to allow the content to "breathe."
- **Tablet:** 8-column grid with 32px margins.
- **Mobile:** 4-column grid with 20px margins.

Spacing follows an 8px linear scale. Use generous vertical padding (64px to 128px) between major sections to emphasize the premium nature of the brand. Negative space is a key component of the luxury aesthetic; avoid cluttering cards or containers.

## Elevation & Depth
The depth model avoids aggressive drop shadows in favor of **Tonal Layers** and **Subtle Organic Textures**.

- **Surface Levels:** The base layer is the Heritage Cream. Raised elements (like cards) use a slightly lighter "off-white" or a very thin 1px border in a darker cream or copper tint.
- **Shadows:** When used, shadows should be extremely diffused and "heavy" (low Y-offset, high blur) with a hint of the Forest Green in the shadow color to simulate a natural, ambient light source.
- **Parchment Effect:** A very subtle, low-opacity grain texture can be applied to the primary background to give the UI a tactile, paper-like quality.

## Shapes
The shape language is **Soft (0.25rem)**. This provides just enough curvature to feel approachable and organic without losing the structure and authority of a professional apothecary.

- **Buttons & Inputs:** Use the standard 0.25rem (4px) radius.
- **Product Cards:** Use `rounded-lg` (8px) for a slightly softer, more tactile container.
- **Imagery:** Large hero images may use 0px (sharp) corners to emphasize an editorial, "framed" look, while smaller inset photos should follow the 4px radius.

## Components
Consistent component styling reinforces the "Modern Apothecary" narrative:

- **Buttons:**
    - *Primary:* Forest Green background with Heritage Cream text. Square-ish (4px radius), high-padding.
    - *Secondary:* Transparent with a 1px Forest Green or Copper border.
- **Inputs:** Underlined or lightly bordered fields using the Charcoal neutral. Labels should always be visible above the field in the `label-md` style.
- **Cards:** Used for product listings and botanical profiles. They should have a very subtle border (1px, #E5E2DD) rather than a heavy shadow.
- **Chips/Badges:** Used for "Organic," "Wildcrafted," or "Limited Batch" tags. These should use the Copper color with small-cap typography.
- **Lists:** Detailed ingredient lists should use custom bullet points—small copper leaf or dot icons—to reinforce the botanical theme.
- **Additional Components:**
    - *Botanical Profile Card:* A specific card type for ingredients featuring an etching-style illustration and serif headings.
    - *Announcement Bar:* A slim Forest Green bar at the top with centered Copper text for special artisanal releases.