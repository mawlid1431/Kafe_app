---
name: Liquid Glass Coffee Aesthetic
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#504442'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f1f1f1'
  outline: '#827472'
  outline-variant: '#d3c3c0'
  surface-tint: '#745853'
  primary: '#271310'
  on-primary: '#ffffff'
  primary-container: '#3e2723'
  on-primary-container: '#ae8d87'
  inverse-primary: '#e3beb8'
  secondary: '#655d5a'
  on-secondary: '#ffffff'
  secondary-container: '#ece0dc'
  on-secondary-container: '#6b6360'
  tertiary: '#241600'
  on-tertiary: '#ffffff'
  tertiary-container: '#3e2900'
  on-tertiary-container: '#c48900'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad4'
  primary-fixed-dim: '#e3beb8'
  on-primary-fixed: '#2b1613'
  on-primary-fixed-variant: '#5b403c'
  secondary-fixed: '#ece0dc'
  secondary-fixed-dim: '#cfc4c0'
  on-secondary-fixed: '#201a18'
  on-secondary-fixed-variant: '#4c4542'
  tertiary-fixed: '#ffdeac'
  tertiary-fixed-dim: '#ffba38'
  on-tertiary-fixed: '#281900'
  on-tertiary-fixed-variant: '#604100'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-margin: 24px
  gutter: 16px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
  section-gap: 48px
---

## Brand & Style

This design system embodies a "Liquid Glass" aesthetic—a sophisticated blend of high-end skeuomorphism and modern glassmorphism. It is designed to evoke the tactile warmth of a premium coffee house filtered through a high-tech, Apple-inspired interface. 

The personality is **minimal, premium, and cozy**. It targets coffee enthusiasts who appreciate craftsmanship and seamless digital experiences. The UI relies on depth, transparency, and soft organic shapes to create an inviting, "breathable" atmosphere. 

Key stylistic pillars include:
- **Depth and Transparency:** Heavy use of backdrop blurs to simulate frosted glass.
- **Organic Flow:** Large radius curves that mimic the surface tension of liquid.
- **Premium Tactility:** Subtle inner glows and soft shadows that make elements feel physically present yet ethereal.

## Colors

The palette is rooted in the natural gradients of espresso and steamed milk, punctuated by a metallic accent.

- **Primary (Deep Roast):** A rich, dark brown used for primary text, iconography, and high-emphasis states. It provides the grounding weight for the interface.
- **Secondary (Steamed Latte):** A soft, creamy neutral used for secondary surfaces and subtle borders.
- **Tertiary (Golden Crema):** A warm amber used sparingly for calls to action, active indicators, and premium status markers.
- **Neutral (Porcelain):** A clean, off-white background color that ensures the glass effects remain crisp and legible.

Transparency is a core "color" in this system. Use 60-80% opacity on white or cream fills combined with high-saturation background blurs (20px-40px) to create the glass effect.

## Typography

The typography strategy pairs the editorial elegance of **Playfair Display** with the functional clarity of **Inter**. 

Headlines should be treated as hero elements, often using "Deep Roast" or white depending on the background contrast. Body text is kept clean and highly legible. Labels use uppercase styling with increased letter spacing to provide a structural, "architectural" feel to the UI.

On mobile, display sizes scale down aggressively to maintain the cozy, contained feel of a handheld device without sacrificing the expressive nature of the serif typeface.

## Layout & Spacing

This design system uses a **fluid-to-fixed grid** hybrid. 
- **Mobile:** A 4-column grid with 24px side margins. Elements are often stacked vertically to allow large imagery to breathe.
- **Desktop:** A 12-column centered grid (max-width 1200px) with 32px margins. 

The rhythm follows an 8px base unit. Generous white space (stack-lg and section-gap) is essential to maintain the "premium" feel; avoid crowding glass cards, as their blurs require space to be visually effective.

## Elevation & Depth

Elevation is not communicated through dark shadows, but through **light and refraction**.

1.  **Level 0 (Floor):** Base neutral color (#F5F5F5) or full-bleed imagery.
2.  **Level 1 (Glass Sheets):** Backdrop blur (40px) with a 70% white fill. 1px inner border (white, 20% opacity) to simulate a glass edge. Soft, diffused ambient shadow (0px 8px 24px, 5% opacity Primary Color).
3.  **Level 2 (Floating Elements):** Increased blur (60px) and a more pronounced inner glow. Used for tooltips, modals, or active selection states.

Shadows should never be pure black; they are always tinted with the Primary color (#3E2723) to keep the depth "warm."

## Shapes

The shape language is extremely soft and organic. 
- **Standard Cards:** Use a 24px (`custom_radius_xl`) corner radius. 
- **Main Containers:** Use a 32px (`custom_radius_max`) radius to create a "puddled" look.
- **Buttons:** Fully rounded (pill-shaped) to provide a friendly, touch-optimized contrast to the geometric grid.

Avoid sharp 90-degree angles entirely to maintain the "Liquid" aspect of the brand personality.

## Components

### Buttons
- **Primary:** Solid "Deep Roast" with white "Inter" text. Pill-shaped.
- **Glass Action:** Frosted glass background, primary color text, 1px white border.
- **Interaction:** On press, buttons should scale slightly (0.98) to simulate physical compression.

### Cards (The "Coffee Card")
The centerpiece component. High-radius (24px) corners, backdrop blur, and an image of the beverage or ingredient. Text is overlaid on a glass plate at the bottom of the card.

### Input Fields
Soft, recessed backgrounds with a subtle inner shadow to look "carved" into the glass surface. Use 16px corner radius.

### Chips & Selectors
Small, pill-shaped glass elements. Active states use the "Golden Crema" accent for the text or a subtle under-glow.

### Floating Navigation Bar
A fixed glass bar at the bottom of the screen with a heavy blur and high-radius corners (32px), making it look like a physical object floating over the content.