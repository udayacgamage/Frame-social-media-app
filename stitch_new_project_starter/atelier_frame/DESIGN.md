---
name: Atelier Frame
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0edec'
  surface-container-high: '#ebe7e7'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#5a403c'
  inverse-surface: '#313030'
  inverse-on-surface: '#f3f0ef'
  outline: '#8e706b'
  outline-variant: '#e3beb8'
  surface-tint: '#b42719'
  primary: '#b12417'
  on-primary: '#ffffff'
  primary-container: '#d43e2d'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffb4a8'
  secondary: '#5e5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e1dfdf'
  on-secondary-container: '#626262'
  tertiary: '#006577'
  on-tertiary: '#ffffff'
  tertiary-container: '#008096'
  on-tertiary-container: '#f9fdff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad4'
  primary-fixed-dim: '#ffb4a8'
  on-primary-fixed: '#410000'
  on-primary-fixed-variant: '#910803'
  secondary-fixed: '#e4e2e2'
  secondary-fixed-dim: '#c7c6c6'
  on-secondary-fixed: '#1b1c1c'
  on-secondary-fixed-variant: '#464747'
  tertiary-fixed: '#acedff'
  tertiary-fixed-dim: '#6dd4ee'
  on-tertiary-fixed: '#001f26'
  on-tertiary-fixed-variant: '#004e5c'
  background: '#fcf9f8'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Inter
    fontSize: 17px
    fontWeight: '600'
    lineHeight: 22px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-md-medium:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0em
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm-bold:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  margin: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system establishes a high-precision, photo-first editorial environment designed for visual artists, photographers, and creative communities. The ethos balances deliberate structural restraint with intimate creative collaboration. 

The aesthetic is grounded in modern gallery minimalism: chrome recedes completely, surrendering visual priority to user media, intentional white space, and typographic clarity. Rather than dopamine-driven neon indicators or heavy decorative containers, the UI utilizes crisp spatial boundaries, hairline delineation, and singular micro-accents.

Visual interactions should evoke deliberate contemplation rather than chaotic consumption. Elements reflect surgical precision—quiet structural frames, razor-thin lines, and authentic tactile rhythm across Rooms, Shared Stories, Challenges, and creative Process breakdowns.

## Colors

The system relies strictly on a hyper-disciplined triad: Pure Gallery White, Near-Black Ink, and an energetic, singular Venetian Coral accent reserved for critical actions and state changes.

### Core Canvas & Surfaces
- **Canvas Base / Surface Bright:** `#FFFFFF` — Primary background for feeds, stories, process galleries, and modal layers.
- **Surface Dim:** `#F8F8F8` — Secondary surface applied to inactive tabs, card backings, system pill backgrounds, and image placeholder states.
- **Hairline Border / Separators:** `#EAEAEA` — Structural micro-dividers (1px physical or 0.5pt on retina) for toolbars, list rows, and modular partitions.

### Typography & Content Tokens
- **Primary Ink:** `#111111` — Maximum-legibility neutral for titles, display headers, user handles, and primary interactions.
- **Secondary Muted:** `#666666` — Editorial captions, timestamps, photo EXIF data, and passive interface icons.
- **Subtle Muted:** `#999999` — Form field placeholders and subtle unselected indicators.

### Accent & Feedback
- **Brand Coral (`#E64B38`):** Restrained strictly to primary action buttons (Publish, Join Room), unread indicator dots, and focused active bottom bar highlights. Never diluted into decorative background gradients.

## Typography

Inter powers the entirely uniform typographic architecture, delivering mechanical consistency, dense tabular numerals, and neutral neutrality across diverse photography genres.

### Typographic Hierarchy Rules
- **Display & Main Headers (`24px`, Semibold):** Screen titles, featured room banners, challenge headlines. Tight negative tracking (`-0.02em`) preserves architectural stability.
- **Section Headers (`17px`, Semibold):** Canonical subheadings for section titles, feed groupings, creator profiles, and bottom sheet titles.
- **Primary Body (`14px` - `16px`):** 16px is reserved for standalone captions and body copy in text posts. 14px handles feed metadata, threaded comments, and modal descriptions.
- **Metadata & System Captions (`12px` - `13px`):** Used for photographic equipment details (aperture, shutter speed), timestamps, challenge tags, and compact badge labels.

## Layout & Spacing

The spatial foundation is based strictly on an 8pt modular grid (`0.5rem` increments), allowing predictable scaling across varied screen form factors.

### Viewport Framing & Dimensions
- **Screen Margins:** Fixed `16px` (`margin: 1rem`) horizontal inset across mobile screens, ensuring content stays safely away from physical edges.
- **Header Dimensions:** Compact `56px` fixed app header housing contextual room status, search, and activity triggers.
- **Navigation Bar:** Persistent `49px` bottom tab bar height (excluding home indicator safe-area insets).
- **Media Inset Philosophy:** Feed imagery may span full-bleed (`0px` margin edge-to-edge) to maximize visual immersion, while text groupings and profile headers adhere strictly to the `16px` margin.
- **Grid Reflow:** Single-column stream for primary feeds; balanced 2-column or 3-column masonry with `1px` to `8px` gutters for Process shots, Rooms, and Challenge grids.

## Elevation & Depth

This system avoids decorative drop shadows, blurred ambient colored glows, or multi-tiered synthetic elevations. Separation of planes is produced strictly via structural surfaces and crisp boundaries.

- **Base Flatness:** The main viewport resides directly on `#FFFFFF`. Secondary panels, image carousels, and challenge containers rely on `#F8F8F8` (Surface Dim) rather than elevated card drops.
- **Hairline Borders:** `#EAEAEA` single-pixel strokes delineate sticky headers, persistent navigation bars, and list items. 
- **Modals & Overlays:** Persistent overlay sheets (Comments, Process Steps, Metadata Sheets) use `#FFFFFF` with a 1px top stroke in `#EAEAEA`, supported by an ambient scrim (`#000000` at 35% opacity) to isolate the active plane without heavy drop shadows.

## Shapes

The design system uses moderate, disciplined corner radii ranging from 8px to 12px (`roundedness: 2`), reflecting the physical form factor of contemporary photo slides and medium format film frames.

- **Cards & Media Viewports:** `8px` or `12px` corner rounding. Full-bleed feed images retain `0px` outer edge sharpness.
- **Buttons & Control Insets:** `8px` fixed radius for interactive surfaces (inputs, buttons, action targets). 
- **Tags & Badges:** `6px` to `8px` micro-radii. Avoid circular oversized "pill" buttons to preserve an editorial visual hierarchy.
- **Avatars & Room Tokens:** Fully circular (`rounded-full`) for individual creators; slightly rounded squircle (`8px`) for collaborative Shared Rooms.

## Components

### App Header & Navigation
- **App Header (56px):** Flat `#FFFFFF` background with a bottom 1px `#EAEAEA` border. Left-aligned `headline-sm` title or brand wordmark. Right-aligned icon buttons with 24px bounding boxes.
- **Bottom Tab Bar (49px):** Clean horizontal row containing 5 fixed slots: Home, Rooms, Create, Challenges, and You. Clean 24px outline icons (`stroke-width: 1.75px`). No oversized, floating, or off-axis create button. The active tab switches icon to filled or highlights with `#E64B38`.

### Buttons & Action Controls
- **Primary Button:** Solid `#E64B38` fill, white `#FFFFFF` text (`label-md`), height `40px` or `44px`, `8px` corner radius. 
- **Secondary Button:** `#FFFFFF` surface with a 1px `#EAEAEA` border, `#111111` text, height `40px` or `44px`, `8px` corner radius.
- **Ghost/Text Action:** Transparent background with `#111111` or `#666666` text and zero padding.

### Chips & Filters
- **Category / Room Filter Chips:** Compact `32px` height, `8px` corner radius. Inactive state: `#F8F8F8` background, `#666666` text, no border. Active state: `#111111` solid background with `#FFFFFF` text.

### Form Inputs
- **Text Field:** Height `44px`, background `#FFFFFF`, border 1px `#EAEAEA`, corner radius `8px`, typography `body-md`. Focus state switches border to `#111111`.
- **Search Field:** Height `36px`, background `#F8F8F8`, zero default border, `8px` corner radius, with 16px search icon in `#666666`.

### Feed Cards & Creative Features
- **Feed Item:** Full width or `16px` inset. Header features 32px circular creator avatar, handle in `body-md-medium`, and an auxiliary right menu trigger. Photo aspect ratios favor 4:5, 1:1, or 16:9 widescreen. Footer consists of icon actions (Like, Comment, Process, Share) followed by `14px` caption.
- **Process Accordion / Carousel:** A nested, step-by-step metadata strip under creative posts showcasing stages (Raw, Grade, Retouch) with small `48px` square thumbnails and `12px` metadata descriptions.
- **Room Banner / Card:** `#F8F8F8` background, 1px `#EAEAEA` border, `12px` corner radius. Displays Room Name (`headline-sm`), participant avatar stacks, and an unread media badge in `#E64B38`.
- **Challenge Progress Card:** Visual card with dual-split image view (Prompt vs. Submission), featuring a compact `#111111` or `#E64B38` timer tag with `12px` semibold tracking.