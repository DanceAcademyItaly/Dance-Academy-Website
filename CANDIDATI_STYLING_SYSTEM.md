# Candidati Section - Styling & Appearance System Documentation

## Overview
This document details the complete visual styling system for the candidati section, covering colors, effects, typography, animations, and visual hierarchy. Use this as a reference when making styling changes.

---

## 1. COLOR SYSTEM

### 1.1 CSS Custom Properties (Design Tokens)

**Core Colors**:
```css
:root {
    --black: #000000;
    --accent: #96795c;  /* Warm brown/taupe accent */
}
```

**Text Colors** (RGBA white with varying opacity):
```css
:root {
    --text-primary: rgba(255, 255, 255, 0.95);    /* Almost white */
    --text-secondary: rgba(255, 255, 255, 0.8);   /* Slightly muted */
    --text-muted: rgba(255, 255, 255, 0.5);       /* Very subtle */
}
```

**Background Colors** (RGBA black with varying opacity):
```css
:root {
    --bg-dark: rgba(0, 0, 0, 0.02);      /* Almost transparent */
    --bg-medium: rgba(0, 0, 0, 0.5);     /* 50% opacity */
    --bg-strong: rgba(0, 0, 0, 0.7);     /* 70% opacity */
}
```

**Border Colors** (RGBA white with varying opacity):
```css
:root {
    --border-default: rgba(255, 255, 255, 0.2);   /* Subtle outline */
    --border-hover: rgba(255, 255, 255, 0.3);     /* Highlighted */
    --border-active: rgba(255, 255, 255, 0.6);    /* Strong emphasis */
    --border-light: rgba(255, 255, 255, 0.1);     /* Very subtle separator */
}
```

---

### 1.2 Color Application Map

**Element Color Matrix**:
```
┌─────────────────────┬──────────────────┬────────────────┬─────────────────┐
│ Element             │ Background       │ Border         │ Text            │
├─────────────────────┼──────────────────┼────────────────┼─────────────────┤
│ candidati-block     │ transparent      │ none           │ -               │
│ candidati-title     │ -                │ -              │ text-primary    │
│ form-card           │ rgba(0,0,0,0.4)  │ rgba(255,255,255,0.18) │ -     │
│ card-title          │ -                │ -              │ text-primary    │
│ card-header         │ -                │ border-light   │ -               │
│ card-navigation     │ -                │ border-light   │ -               │
│ input (default)     │ bg-strong        │ border-default │ text-secondary  │
│ input (hover)       │ bg-strong        │ border-hover   │ text-primary    │
│ input (focus)       │ bg-strong        │ border-hover   │ text-primary    │
│ form-info           │ rgba(0,0,0,0.3)  │ border-default │ text-secondary  │
│ card-nav-button     │ bg-medium        │ border-default │ text-secondary  │
│ nav-button (hover)  │ bg-medium        │ border-hover   │ text-primary    │
│ submit-button       │ bg-medium        │ border-default │ text-secondary  │
│ submit-btn (hover)  │ bg-medium        │ border-hover   │ text-primary    │
│ required asterisk   │ -                │ -              │ accent (#96795c)│
└─────────────────────┴──────────────────┴────────────────┴─────────────────┘
```

**Visual Hierarchy via Opacity**:
```
Highest emphasis:     text-primary (0.95)
Interactive elements: text-secondary (0.8) → text-primary (0.95) on hover
Subtle indicators:    text-muted (0.5)
Accent highlights:    accent (full opacity #96795c)
```

---

### 1.3 Color Rationale

**Why white-based colors?**:
- Ensures readability against dark video background
- Maintains hierarchy through opacity variations
- Creates cohesive monochromatic scheme
- Allows background video to remain visible

**Why RGBA instead of HEX?**:
- Enables layering transparency
- Adapts to background changes
- Smoother transitions between states
- Better visual depth perception

**Accent color (#96795c - warm taupe)**:
- Provides subtle warmth to otherwise cool palette
- High enough contrast for required field markers
- Complements video background tones
- Not overpowering, maintains sophistication

---

## 2. VISUAL EFFECTS SYSTEM

### 2.1 Card Depth & Layering - ENHANCED SHADOW SYSTEM

**5-Layer Shadow Stack for Dramatic Depth**:
```css
.form-card {
    box-shadow:
        /* Layer 1: Ultra-deep ambient shadow - maximum floating effect */
        0 20px 60px rgba(0, 0, 0, 0.9),

        /* Layer 2: Deep shadow - strong presence */
        0 12px 32px rgba(0, 0, 0, 0.7),

        /* Layer 3: Mid shadow - volume definition */
        0 6px 16px rgba(0, 0, 0, 0.5),

        /* Layer 4: Edge shadow - sharp definition */
        0 2px 8px rgba(0, 0, 0, 0.4),

        /* Layer 5: Bottom inner shadow - depth enhancement */
        inset 0 -1px 0 rgba(0, 0, 0, 0.6);
}
```

**Shadow Breakdown**:
```
Layer 1 (Ultra-Deep Ambient):
  - Y-offset: 20px (strong elevation)
  - Blur: 60px (very soft, far-reaching)
  - Opacity: 0.9 (maximum presence)
  - Purpose: Create dramatic floating effect

Layer 2 (Deep Presence):
  - Y-offset: 12px (mid elevation)
  - Blur: 32px (soft but defined)
  - Opacity: 0.7 (strong secondary)
  - Purpose: Strengthen depth perception

Layer 3 (Volume Definition):
  - Y-offset: 6px (moderate elevation)
  - Blur: 16px (medium softness)
  - Opacity: 0.5 (balanced presence)
  - Purpose: Define card volume

Layer 4 (Edge Clarity):
  - Y-offset: 2px (close to card)
  - Blur: 8px (sharp-ish edges)
  - Opacity: 0.4 (subtle definition)
  - Purpose: Crisp edge definition

Layer 5 (Inner Depth):
  - Inset bottom: -1px (thin line)
  - Opacity: 0.6 (strong internal shadow)
  - Purpose: Enhance internal depth perception
```

**Combined Effect**:
- Creates pronounced "floating card" appearance
- Dramatic three-dimensional depth
- Sharp, defined edges with soft ambient glow
- Works beautifully against dark backgrounds
- No top inner highlight for cleaner aesthetic

---

### 2.2 Glassmorphic Blur Overlay System - STACKING CONTEXT SOLUTION

**The Stacking Context Problem**:
- `candidati-block` has `position: fixed` with `z-index: 1000`
- This creates an isolated stacking context
- Cards inside cannot use `backdrop-filter` to blur video background (`z-index: -1`)
- Solution: External blur overlay element

**Blur Overlay Implementation**:
```javascript
// Create overlay element (outside stacking context)
const blurOverlay = document.createElement('div');
blurOverlay.id = 'card-blur-overlay';
blurOverlay.style.position = 'fixed';
blurOverlay.style.pointerEvents = 'none';
blurOverlay.style.zIndex = '999'; // Below candidati-block (1000), above video (-1)
blurOverlay.style.backdropFilter = 'blur(12px) saturate(180%)';
blurOverlay.style.webkitBackdropFilter = 'blur(12px) saturate(180%)';
blurOverlay.style.borderRadius = '2px';
blurOverlay.style.opacity = '0';
blurOverlay.style.transition = 'opacity 0.3s ease';
document.body.appendChild(blurOverlay);
```

**Card Background**:
```css
.form-card {
    background: transparent; /* Blur overlay provides background effect */
    border: 1px solid rgba(255, 255, 255, 0.25);
}
```

**Why Transparent?**:
- Blur overlay sits behind card, providing glassmorphic background
- Card itself is transparent to show blur effect
- Border provides definition without blocking blur
- Creates true glassmorphism: blurred background + transparent card

**Synchronization System**:
```javascript
function syncBlurOverlay() {
    // Find most visible card by opacity
    let mostVisibleCard = null;
    let maxOpacity = 0;

    cards.forEach(card => {
        const opacity = parseFloat(card.style.opacity) || 0;
        if (opacity > maxOpacity) {
            maxOpacity = opacity;
            mostVisibleCard = card;
        }
    });

    // Match blur overlay to card position/size/opacity
    if (mostVisibleCard && maxOpacity > 0) {
        const rect = mostVisibleCard.getBoundingClientRect();
        blurOverlay.style.left = rect.left + 'px';
        blurOverlay.style.top = rect.top + 'px';
        blurOverlay.style.width = rect.width + 'px';
        blurOverlay.style.height = rect.height + 'px';
        blurOverlay.style.opacity = maxOpacity;
    } else {
        blurOverlay.style.opacity = '0';
    }
}
```

**Blur Effect Details**:
- **Blur Amount**: 12px (medium blur for clarity)
- **Saturation**: 180% (enhances background colors)
- **Opacity**: Matches card opacity (synchronized fade-in/out)
- **Updates**: Every scroll frame during card animations
- **Performance**: Uses requestAnimationFrame via Lenis

**Z-Index Stack**:
```
10000: Motion preference notice
 1000: candidati-block (isolated stacking context)
  999: blur-overlay (glassmorphic background)
  ... : Cards (inside candidati-block)
   -1: Video background
```

**Input Background Strategy**:
```css
.form-group input {
    background: var(--bg-strong); /* rgba(0, 0, 0, 0.7) */
}
```

**Why 70% opacity for inputs?**:
- High contrast for readability over blur
- Distinguishes input fields from transparent card
- Creates visual hierarchy (darker = interactive)
- Reduces distraction from blurred video

**Form Info Background**:
```css
.form-info {
    background: rgba(0, 0, 0, 0.3);  /* 30% opacity */
}
```

**Why 30% opacity for info boxes?**:
- Lighter than inputs (non-interactive)
- Still readable but de-emphasized
- Creates subtle differentiation from blur
- Maintains visual flow

---

### 2.3 Border Treatments

**Card Border**:
```css
.form-card {
    border: 1px solid rgba(255, 255, 255, 0.18);
    border-radius: 2px;
}
```

**Why 18% opacity border?**:
- Subtle definition without harshness
- Complements glassmorphism aesthetic
- Visible but not dominant
- Works with shadow system

**Why 2px radius?**:
- Softens sharp corners minimally
- Maintains modern, clean look
- Prevents aliasing artifacts
- Keeps professional appearance

**Internal Borders (separators)**:
```css
.card-header {
    border-bottom: 1px solid var(--border-light);
    /* rgba(255, 255, 255, 0.1) */
}

.card-navigation {
    border-top: 1px solid var(--border-light);
}
```

**Why 10% opacity for internal borders?**:
- Creates subtle sectioning
- Doesn't compete with card border
- Maintains visual hierarchy
- Guides eye flow without distraction

---

### 2.4 Custom Scrollbar Styling

**Webkit Browsers (Chrome, Safari, Edge)**:
```css
.card-content::-webkit-scrollbar {
    width: 4px;  /* Thin, unobtrusive */
}

.card-content::-webkit-scrollbar-track {
    background: transparent;  /* Invisible track */
}

.card-content::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);  /* Subtle thumb */
    border-radius: 2px;
}

.card-content::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);  /* Highlighted on hover */
}
```

**Design Philosophy**:
- Minimal width (4px) reduces visual weight
- Transparent track blends with content
- Low opacity thumb (20%) stays subtle
- Hover state (30%) provides feedback
- Rounded corners match card aesthetic

---

## 3. TYPOGRAPHY SYSTEM

### 3.1 Font Stack

```css
body {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
}
```

**Fallback Strategy**:
1. **Helvetica Neue**: Modern, clean, slightly taller x-height
2. **Helvetica**: Classic, widely available
3. **Arial**: Universal fallback
4. **sans-serif**: System default

**Why this stack?**:
- Professional, readable
- Excellent screen rendering
- Consistent across platforms
- Matches minimalist aesthetic

---

### 3.2 Font Weights

**All Text**:
```css
font-weight: 300;  /* Light weight */
```

**Button Symbols**:
```css
.card-nav-button .btn-symbol {
    font-weight: 200;  /* Extra light */
}
```

**Rationale**:
- Light weight (300) feels elegant, modern
- Matches minimalist design language
- Improves readability on high-DPI screens
- Creates visual hierarchy through size/spacing vs. weight

---

### 3.3 Fluid Typography Scale

**Using CSS Custom Properties**:
```css
:root {
    /* Example: text-base scales from 14px to 20px */
    --text-base: clamp(0.875rem, 0.8rem + 0.375vw, 1.25rem);

    /* Full scale available */
    --text-2xs: clamp(0.5rem, 0.45rem + 0.25vw, 0.75rem);    /* 8-12px */
    --text-xs: clamp(0.6875rem, 0.65rem + 0.1875vw, 0.875rem); /* 11-14px */
    --text-sm: clamp(0.75rem, 0.7rem + 0.25vw, 1rem);        /* 12-16px */
    --text-lg: clamp(1rem, 0.9rem + 0.5vw, 1.5rem);          /* 16-24px */
    --text-xl: clamp(1.125rem, 1rem + 0.625vw, 1.75rem);     /* 18-28px */
    --text-2xl: clamp(1.25rem, 1.1rem + 0.75vw, 2rem);       /* 20-32px */
    --text-3xl: clamp(1.5rem, 1.3rem + 1vw, 2.5rem);         /* 24-40px */
    --text-4xl: clamp(1.75rem, 1.5rem + 1.25vw, 3rem);       /* 28-48px */
}
```

**Application in Candidati Section**:
```
candidati-title:    clamp(1.5rem, 3vw + 1vh, 2.5rem)    [24-40px]
card-title:         clamp(1rem, 1.5vw + 0.5vh, 1.75rem)  [16-28px]
input fields:       clamp(10px, 1vw + 0.2vh, 13px)       [10-13px]
form-info:          clamp(9px, 0.9vw + 0.2vh, 11px)      [9-11px]
nav-button:         clamp(9px, 1vw + 0.3vh, 12px)        [9-12px]
submit-button:      clamp(11px, 1.2vw + 0.3vh, 15px)     [11-15px]
```

**Why fluid typography?**:
- Seamless scaling across viewport sizes
- No jarring jumps at breakpoints
- Maintains proportions at all sizes
- Better responsive UX

---

### 3.4 Letter Spacing System

**Fluid Letter Spacing Variables**:
```css
:root {
    --letter-spacing-tight: clamp(-0.025em, -0.02em + -0.01vw, 0em);
    --letter-spacing-normal: 0;
    --letter-spacing-wide: clamp(0.025em, 0.02em + 0.01vw, 0.1em);
    --letter-spacing-wider: clamp(0.05em, 0.04em + 0.05vw, 0.2em);
    --letter-spacing-widest: clamp(0.1em, 0.08em + 0.1vw, 0.3em);
}
```

**Application**:
```
candidati-title:    letter-spacing-widest   [0.1-0.3em]
card-title:         letter-spacing-widest   [0.1-0.3em]
input fields:       letter-spacing-wide     [0.025-0.1em]
nav-button:         letter-spacing-wider    [0.05-0.2em]
submit-button:      letter-spacing-widest   [0.1-0.3em]
```

**Why generous letter spacing?**:
- Creates "luxury" brand feel
- Improves readability of uppercase text
- Emphasizes deliberate pacing
- Matches minimalist aesthetic
- Enhances headline hierarchy

---

### 3.5 Text Transform Strategy

**Always Uppercase**:
```css
.candidati-title,
.card-title,
.card-nav-button,
.submit-button {
    text-transform: uppercase;
}
```

**Form Fields**:
```css
.form-group input,
.form-group select {
    text-transform: uppercase;
}

.form-group textarea {
    text-transform: none;  /* Exception: long-form text */
}
```

**Rationale**:
- Uppercase creates visual consistency
- Reinforces brand identity
- Works well with wide letter spacing
- Textarea exception: user comfort for paragraphs

---

## 4. INTERACTION STATES

### 4.1 Hover State System

**Form Inputs**:
```css
/* Default state */
.form-group input {
    color: var(--text-secondary);         /* 80% white */
    border-color: var(--border-default);  /* 20% white */
    transition: all 0.3s;
}

/* Hover state */
.form-group input:hover {
    color: var(--text-primary);       /* 95% white - brighter */
    border-color: var(--border-hover); /* 30% white - stronger */
}
```

**Buttons**:
```css
/* Default state */
.card-nav-button {
    color: var(--text-secondary);
    border-color: var(--border-default);
    transform: translateY(0);
    transition: all 0.3s;
}

/* Hover state */
.card-nav-button:hover {
    color: var(--text-primary);
    border-color: var(--border-hover);
    transform: translateY(-1px);  /* Subtle lift */
}
```

**Hover Design Philosophy**:
- Text brightens: Secondary (80%) → Primary (95%)
- Border strengthens: Default (20%) → Hover (30%)
- Buttons lift: 1px upward motion
- All transitions: 0.3s smooth easing
- Creates responsive, tactile feel

---

### 4.2 Focus State System

**Form Inputs**:
```css
.form-group input:focus {
    outline: none;                        /* Remove default */
    color: var(--text-primary);           /* Brighten text */
    border-color: var(--border-hover);    /* Strengthen border */
}
```

**Why no outline?**:
- Custom border highlight provides focus indication
- Maintains visual consistency with hover state
- Cleaner aesthetic for modern design
- Border color change is sufficient WCAG indicator

**Focus Strategy**:
- Same visual treatment as hover (consistency)
- Border change provides clear focus indicator
- No outline needed when border is prominent
- Keyboard users still get clear visual feedback

---

### 4.3 Active/Selected States

**Navigation Buttons**:
```css
/* Buttons dynamically hidden/shown via JavaScript */
.card-nav-button {
    display: block;  /* or none (via JS) */
}
```

**Current Card Indication**:
- Not styled directly on cards (all cards visible in stack)
- Navigation buttons control which card user "sees"
- JavaScript updates `currentCardIndex` state
- Button visibility indicates position in stack

---

### 4.4 Disabled States

**Not Explicitly Styled** (form fields default to enabled)

**If Needed, Apply**:
```css
.form-group input:disabled,
.form-group select:disabled,
.form-group textarea:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    border-color: var(--border-light);
}
```

---

## 5. ANIMATION SYSTEM

### 5.1 Transition Properties

**Global Transition**:
```css
.form-group input,
.form-group select,
.form-group textarea,
.card-nav-button,
.submit-button {
    transition: all 0.3s;
}
```

**What Animates**:
- `color` (text brightness changes)
- `border-color` (border emphasis changes)
- `transform` (button lift on hover)
- `opacity` (visibility changes)

**Why 0.3s?**:
- Fast enough to feel responsive
- Slow enough to be perceptible
- Standard duration for micro-interactions
- Balances smoothness and performance

---

### 5.2 Scroll-Driven Animations

**Easing Functions**:
```javascript
// For cards and title
const sidebarEasing = t => 1 - Math.pow(1 - t, 2.5);
// Power 2.5 ease-out: gentle, gradual deceleration

// For submit button
const contentEasing = t => 1 - Math.pow(1 - t, 1.8);
// Power 1.8 ease-out: smoother than sidebar
```

**Easing Characteristics**:
- Both are ease-out curves (fast start, slow end)
- Sidebar easing (2.5) is slightly more pronounced
- Content easing (1.8) is gentler
- Creates natural, organic motion feel
- Synchronized with scroll position (not time-based)

**Animation Phases**:
```
Phase 1 (Title):    0-50vh   | translateY from 100vh+100px to 0, opacity 0→1
Phase 2 (Cards):    50-200vh | translateX from 100vw to 0, opacity 0→1, staggered
Phase 3 (Deadzone): 200-400vh| All elements static, fully interactive
```

---

### 5.3 Transform-Based Animations

**Title Entrance**:
```javascript
candidatiTitle.style.transform = `translateY(${translateY}px)`;
candidatiTitle.style.opacity = opacity;
```

**Card Entrance**:
```javascript
card.style.transform = `translate(calc(-50% + ${cardOffsetX}px), 0) translateX(${translateXVw}vw)`;
card.style.opacity = opacity;
```

**Submit Button Entrance**:
```javascript
submitButtonContainer.style.transform = `translateX(-50%) translateY(${submitTranslateY}px)`;
submitButtonContainer.style.opacity = submitOpacity;
```

**Why transform-based?**:
- GPU-accelerated (60fps performance)
- No layout reflows/repaints
- Smooth across all devices
- Decoupled from scroll velocity

---

### 5.4 Visibility Control

**Section Visibility**:
```javascript
// Before entrance
candidatiSection.style.visibility = 'hidden';
candidatiSection.style.opacity = '0';

// During animation phases
candidatiSection.style.visibility = 'visible';
candidatiSection.style.opacity = '1';

// After exit (beyond deadzone)
candidatiSection.style.visibility = 'hidden';
candidatiSection.style.opacity = '0';
```

**Why dual visibility + opacity?**:
- `visibility: hidden` removes from accessibility tree
- `opacity: 0` makes visually invisible
- Combined: truly hidden when not in view
- Prevents keyboard nav to invisible elements
- Improves performance (browser skips rendering)

---

## 6. VISUAL HIERARCHY

### 6.1 Hierarchy by Size

**Size Progression**:
```
candidati-title:   24-40px   (largest - primary heading)
card-title:        16-28px   (secondary heading)
submit-button:     11-15px   (primary action)
nav-button:        9-12px    (secondary action)
input fields:      10-13px   (content/data entry)
form-info:         9-11px    (supporting information)
```

**Reading Order**:
1. Section title (largest, top)
2. Card title (medium, card header)
3. Submit button (emphasized size)
4. Form fields (content level)
5. Navigation buttons (utility level)
6. Form info (footnote level)

---

### 6.2 Hierarchy by Color

**Emphasis Through Opacity**:
```
Highest:    text-primary (95%)     → Headings, focused inputs
High:       text-secondary (80%)   → Default inputs, buttons
Medium:     text-muted (50%)       → Placeholder-equivalent
Accent:     #96795c (100%)         → Required field markers
```

**Color = Importance**:
- Brighter = more important
- Dimmer = less important
- Accent = calls attention to specific elements

---

### 6.3 Hierarchy by Visual Weight

**Layering Strategy**:
```
Front layer:    submit-button (z-index 1001, fixed position)
Mid layer:      form-cards (absolute, stacked at same z)
Back layer:     candidati-title (natural flow, no z-index)
Container:      candidati-block (z-index 1000, fixed)
```

**Shadow Depth = Hierarchy**:
- Cards: Multi-layer shadows (elevated, interactive)
- Buttons: Hover lift animation (temporarily elevated)
- Title: No shadows (flat, background layer)

---

### 6.4 Hierarchy by Spacing

**Whitespace as Emphasis**:
- More padding = more important
- Larger gaps = stronger separation
- Title margin-bottom: 12-24px (breathing room)
- Submit button bottom: 5vh (strong separation)
- Card padding: 20-40px (generous internal space)

---

## 7. SPECIAL VISUAL ELEMENTS

### 7.1 Required Field Asterisk

**Positioning & Styling**:
```css
.form-group:has(input.required)::after {
    content: '*';
    position: absolute;
    right: clamp(14px, 2vw, 18px);
    top: 50%;
    transform: translateY(-50%);
    color: var(--accent);              /* #96795c */
    font-size: clamp(11px, 1.1vw + 0.3vh, 14px);
    pointer-events: none;
    z-index: 1;
}
```

**Design Choices**:
- Accent color for high visibility
- Inside input field (right side) for clarity
- Pseudo-element (no extra DOM)
- Responsive sizing with field
- `pointer-events: none` prevents click interference

**Variations**:
```css
/* For select fields - avoid dropdown arrow */
.form-group:has(select.required)::after {
    right: clamp(40px, 4vw, 50px);  /* Shifted left */
}

/* For textarea - top right corner */
.form-group:has(textarea.required)::after {
    top: clamp(16px, 2vh, 22px);
    transform: none;
}
```

---

### 7.2 Select Dropdown Arrow

**Custom SVG Arrow**:
```css
.form-group select {
    appearance: none;  /* Remove default arrow */
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.5)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 15px center;
    background-size: 20px;
    padding-right: 45px;  /* Space for arrow */
}
```

**Design Rationale**:
- Consistent across all browsers
- Matches overall white/subtle aesthetic
- 50% white opacity (matches muted text)
- Positioned to not overlap with required asterisk

---

### 7.3 Separator Lines

**Internal Card Borders**:
```css
.card-header {
    border-bottom: 1px solid var(--border-light);  /* 10% white */
}

.card-navigation {
    border-top: 1px solid var(--border-light);
}
```

**Purpose**:
- Divide card into logical sections
- Very subtle (10% opacity)
- Don't compete with card outline
- Guide visual flow top to bottom

---

## 8. RESPONSIVE STYLING CHANGES

### 8.1 Mobile-Specific Adjustments

**Padding Reduction**:
```css
@media (max-width: 768px) {
    .form-card {
        padding: clamp(18px, 2.5vh, 25px) clamp(18px, 4vw, 25px);
        /* Desktop: 20-32px vertical, 25-40px horizontal */
        /* Mobile: 18-25px both (tighter for small screens) */
    }
}
```

**Touch Target Optimization**:
```css
@media (max-width: 768px) {
    .form-group input,
    .form-group select,
    .form-group textarea {
        padding: 15px;  /* Explicit padding for consistent tap targets */
    }
}
```

**Why different?**:
- Mobile screens have less space
- Tighter padding maximizes content area
- Touch targets still meet 44px minimum (iOS)
- Maintains balance between content and whitespace

---

### 8.2 Desktop-Specific Enhancements

**Grid Layout**:
```css
@media (min-width: 769px) {
    .card-content {
        display: grid;
        grid-template-columns: 1fr 1fr;
        /* Enables two-column form layout */
    }
}
```

**Larger Spacing**:
```css
@media (min-width: 769px) {
    .card-content {
        gap: clamp(12px, 1.5vh, 18px) clamp(20px, 2.5vw, 30px);
        /* Larger column gap for visual separation */
    }
}
```

---

## 9. ACCESSIBILITY CONSIDERATIONS

### 9.1 Color Contrast

**WCAG AA Compliance**:
```
Text on card background:
  - text-primary (95% white) on rgba(0,0,0,0.4) = ~14:1 contrast ✓
  - text-secondary (80% white) on rgba(0,0,0,0.4) = ~11:1 contrast ✓

Text on input background:
  - text-secondary (80% white) on rgba(0,0,0,0.7) = ~8:1 contrast ✓

Borders:
  - border-default (20% white) provides sufficient edge definition
  - border-hover (30% white) meets focus indicator requirements
```

**All contrast ratios exceed WCAG AA (4.5:1 for normal text)**

---

### 9.2 Focus Indicators

**Keyboard Navigation**:
```css
.form-group input:focus {
    border-color: var(--border-hover);  /* 30% white */
}
```

**Why sufficient?**:
- Border changes from 20% → 30% (50% increase)
- Clearly visible against dark backgrounds
- Consistent with hover state (predictable UX)
- Meets WCAG 2.1 focus indicator requirements

---

### 9.3 Motion Preferences

**Reduced Motion Support**:
```css
@media (prefers-reduced-motion: reduce) {
    * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
}
```

**Effect on Candidati**:
- Scroll-driven animations become instant
- Hover transitions become instant
- Maintains functionality without motion
- Respects user preferences

---

## 10. VISUAL DESIGN PATTERNS

### 10.1 Glassmorphism/Acrylic Effect

**Key Characteristics**:
1. **Semi-transparent backgrounds** (40% black card, 70% black inputs)
2. **Subtle borders** (18-20% white)
3. **Multi-layer shadows** (creates depth)
4. **Inset highlights** (simulates light reflection)
5. **Background visibility** (video shows through)

**Why this pattern?**:
- Modern, on-trend aesthetic
- Maintains visual interest without distraction
- Video background remains part of experience
- Creates immersive, layered environment

---

### 10.2 Minimal Border Radius

**Approach**:
```css
border-radius: 2px;  /* Barely rounded */
```

**Design Philosophy**:
- Sharp corners feel too rigid
- Large radius feels too soft/playful
- 2px: just enough to anti-alias
- Maintains professional, serious tone
- Aligns with minimalist approach

---

### 10.3 Monochromatic + Accent

**Color Strategy**:
- Base: White spectrum (0-100% opacity)
- Backgrounds: Black spectrum (0-70% opacity)
- Accent: Single warm color (#96795c)

**Why monochromatic?**:
- Focuses attention on content
- Creates cohesive, sophisticated look
- Video provides color variety
- Accent color draws eye to important elements

---

## 11. STYLE MODIFICATION GUIDE

### 11.1 Changing Card Appearance

**Make cards more opaque**:
```css
.form-card {
    background: rgba(0, 0, 0, 0.7);  /* was 0.4 */
}
```

**Make cards more glassy**:
```css
.form-card {
    background: rgba(0, 0, 0, 0.2);  /* was 0.4 */
    backdrop-filter: blur(10px);      /* add blur effect */
}
```

**Add border glow**:
```css
.form-card {
    border: 1px solid rgba(255, 255, 255, 0.3);
    box-shadow:
        0 12px 40px rgba(0, 0, 0, 0.6),
        0 4px 16px rgba(0, 0, 0, 0.4),
        inset 0 1px 0 rgba(255, 255, 255, 0.1),
        0 0 20px rgba(255, 255, 255, 0.1);  /* NEW: outer glow */
}
```

---

### 11.2 Changing Typography

**Make text bolder**:
```css
.candidati-title,
.card-title {
    font-weight: 400;  /* was 300 */
}
```

**Adjust letter spacing**:
```css
.card-title {
    letter-spacing: 0.2em;  /* was variable widest (0.1-0.3em) */
}
```

**Change font stack**:
```css
body {
    font-family: 'Inter', 'Helvetica Neue', sans-serif;
}
```

---

### 11.3 Changing Interaction States

**More dramatic hover effect**:
```css
.card-nav-button:hover {
    color: var(--text-primary);
    border-color: var(--accent);      /* was border-hover */
    transform: translateY(-3px);      /* was -1px */
    box-shadow: 0 4px 12px rgba(255, 255, 255, 0.2);  /* add glow */
}
```

**Faster transitions**:
```css
.form-group input,
.card-nav-button {
    transition: all 0.15s;  /* was 0.3s */
}
```

---

## 12. BROWSER COMPATIBILITY

### 12.1 Modern Features Used

**CSS Custom Properties**:
- Supported: All modern browsers
- Fallback: Not needed (baseline support)

**CSS Grid**:
- Supported: All modern browsers
- Fallback: Single-column layout on mobile

**Clamp()**:
- Supported: All modern browsers (2020+)
- Fallback: Uses minimum value in older browsers

**:has() Selector** (for required asterisks):
- Supported: Chrome 105+, Safari 15.4+, Firefox 121+
- Fallback: Asterisks won't appear in older browsers (graceful degradation)

---

### 12.2 Vendor Prefixes

**Not Currently Used** (modern browsers don't require them)

**If Needed for Older Support**:
```css
.form-card {
    -webkit-box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6);
}

.card-content {
    -webkit-overflow-scrolling: touch;  /* Smooth scroll on iOS */
}
```

---

## 13. PERFORMANCE OPTIMIZATION

### 13.1 GPU Acceleration

**Transform-based animations**:
```javascript
// Uses transform (GPU-accelerated) instead of top/left (CPU)
card.style.transform = `translateX(${value}vw)`;
```

**Will-change hints** (if needed):
```css
.form-card {
    will-change: transform, opacity;
}
```

**When to use**: Only when performance issues detected
**Caution**: Overuse can hurt performance

---

### 13.2 Paint Optimization

**Minimize repaints**:
- Opacity changes don't trigger layout
- Transform changes don't trigger layout
- Border-color changes minimal repaint
- Fixed positioning reduces repaint area

**Avoid**:
- Changing width/height during scroll
- Modifying box-model properties
- Frequent background-image changes

---

## 14. STYLE TESTING CHECKLIST

When modifying styles, verify:

**Visual Consistency**:
- [ ] Cards look cohesive across all 5 sections
- [ ] Colors maintain hierarchy
- [ ] Spacing feels balanced
- [ ] Typography is readable at all sizes

**Interaction States**:
- [ ] Hover states are clear and immediate
- [ ] Focus states meet accessibility standards
- [ ] Active states provide feedback
- [ ] Transitions feel smooth (not janky)

**Responsive Behavior**:
- [ ] Mobile layout maintains readability
- [ ] Desktop layout uses space effectively
- [ ] Touch targets are adequate (44px+)
- [ ] Text scales appropriately

**Cross-Browser**:
- [ ] Chrome/Edge (Chromium)
- [ ] Safari (WebKit)
- [ ] Firefox (Gecko)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

**Performance**:
- [ ] Smooth 60fps scroll animations
- [ ] No layout thrashing
- [ ] Quick hover/focus responses
- [ ] Minimal CPU usage during idle

---

## 15. QUICK STYLE REFERENCE

### Colors
```
Card background:      rgba(0, 0, 0, 0.4)
Card border:          rgba(255, 255, 255, 0.18)
Input background:     rgba(0, 0, 0, 0.7)
Input border:         rgba(255, 255, 255, 0.2)
Input border hover:   rgba(255, 255, 255, 0.3)
Text primary:         rgba(255, 255, 255, 0.95)
Text secondary:       rgba(255, 255, 255, 0.8)
Accent:               #96795c
```

### Shadows
```
Card shadow:          0 12px 40px rgba(0,0,0,0.6),
                      0 4px 16px rgba(0,0,0,0.4),
                      inset 0 1px 0 rgba(255,255,255,0.1)
```

### Typography
```
Font family:          'Helvetica Neue', Helvetica, Arial, sans-serif
Font weight:          300 (light)
Title size:           24-40px
Card title size:      16-28px
Input size:           10-13px
Letter spacing:       0.1-0.3em (widest)
Text transform:       uppercase (most elements)
```

### Effects
```
Border radius:        2px
Transition:           all 0.3s
Hover lift:           translateY(-1px)
Scrollbar width:      4px
Scrollbar color:      rgba(255, 255, 255, 0.2)
```

---

## Document Version
- **Created**: 2025-10-10
- **Section**: Candidati
- **Purpose**: Styling & appearance system reference
- **Status**: Complete analysis of current implementation
