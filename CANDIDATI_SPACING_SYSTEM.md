# Candidati Section - Spacing & Sizing System Documentation

## Overview
This document details the complete spacing and sizing system for the candidati section, covering both the page-level layout and internal card structure. Use this as a reference when making spacing adjustments.

---

## 1. PAGE-LEVEL LAYOUT SYSTEM

### 1.1 Section Container (`.candidati-block`)

**Positioning Strategy**: Fixed positioning (scroll-decoupled)
```css
position: fixed
top: 60px (set via JS)
left: 50%
transform: translateX(-50%)
z-index: 1000
```

**Container Dimensions**:
```css
width: auto (determined by content, set via JS to match original width)
min-height: 100vh (from CSS)
```

**Spacing - External**:
```css
margin: 0 (killed via JS to prevent position issues)
/* Original CSS had: margin-top: clamp(50px, 10vh, 100px) - removed when fixed */
```

**Spacing - Internal (Padding)**:
```css
padding: clamp(20px, 4vh, 40px) clamp(20px, 5vw, 40px) clamp(10px, 2vh, 20px)
/* Breakdown:
   - Top: clamp(20px, 4vh, 40px)      → 20-40px
   - Horizontal: clamp(20px, 5vw, 40px) → 20-40px
   - Bottom: clamp(10px, 2vh, 20px)   → 10-20px (tighter)
*/
```

**Layout Mode**:
```css
display: flex
flex-direction: column
align-items: center
justify-content: flex-start
overflow: hidden
```

**Responsive Behavior**:
- Padding adapts fluidly based on viewport size
- Tighter bottom padding to maximize card space
- Horizontal padding ensures content doesn't touch edges

---

### 1.2 Scroll Range & Spacer

**Total Scroll Range**: 600vh (6 × viewport height)
```javascript
totalScrollRange = window.innerHeight × 6
```

**Scroll Spacer**:
```javascript
// Creates invisible div to maintain scroll range
spacer.style.height = totalScrollRange + 'px'
spacer.className = 'candidati-spacer'
// Inserted after candidati-block in DOM
```

**Phase Breakdown**:
1. **Title Entrance**: 50vh (0.5 × window.innerHeight)
2. **Card Entrance**: 150vh (1.5 × window.innerHeight)
3. **Deadzone**: 200vh (2.0 × window.innerHeight)
4. **Extra Buffer**: 200vh (additional separation before contatti)

**Start Position**: Fixed at `3800px` scroll position

---

### 1.3 Vertical Element Spacing

**Element Stack** (top to bottom):
```
candidati-block (fixed container at top: 60px)
  ├─ block padding-top: clamp(20px, 4vh, 40px)
  │
  ├─ candidati-title
  │   └─ margin-bottom: clamp(12px, 1.8vh, 24px)
  │
  ├─ card-deck-container [DYNAMICALLY SIZED]
  │   ├─ Extends from title down toward submit button
  │   ├─ Height: calculated to fill available space
  │   ├─ padding-bottom: = titleMarginBottom (symmetry)
  │   │
  │   └─ Cards (absolutely positioned at top: 0px)
  │       └─ height: containerHeight - containerPaddingBottom
  │
  ├─ Gap: max(titleMarginBottom, 2vh) [viewport-responsive]
  │
  └─ submit-button-container (fixed to viewport)
      ├─ position: fixed
      ├─ bottom: 5vh
      └─ left: 50%
```

**Dynamic Spacing System** (NEW):
```javascript
// Container extends to fill space between title and button
const containerStartY = blockPaddingTop + titleHeight + titleMarginBottom;
const containerEndY = viewportHeight - blockTopPosition -
                      submitButtonHeight - submitButtonBottomMargin -
                      containerToButtonGap;

const containerHeight = containerEndY - containerStartY;

// Container padding-bottom creates symmetry with title margin
const containerPaddingBottom = titleMarginBottom;

// Cards fill container minus padding
const cardHeight = containerHeight - containerPaddingBottom;
const finalCardHeight = Math.max(400, cardHeight); // 400px minimum
```

**Spacing Values**:
```css
/* Title bottom margin */
.candidati-title {
    margin-bottom: clamp(12px, 1.8vh, 24px);
    /* Range: 12-24px depending on viewport height */
}

/* Submit button position */
.submit-button-container {
    position: fixed; /* positioned relative to viewport */
    bottom: 5vh;
    left: 50%;
    transform: translateX(-50%);
}
```

**Card Deck Container** (NEW - Dynamically Sized):
```javascript
// Container height set dynamically to extend toward button
cardDeckContainer.style.height = containerHeight + 'px';
cardDeckContainer.style.paddingBottom = titleMarginBottom + 'px';

// Gap before submit button (viewport-responsive)
const containerToButtonGap = Math.max(titleMarginBottom, viewportHeight * 0.02);
```

**Key Insights**:
- **Container extends dynamically**: Fills available vertical space down to submit button
- **Viewport-responsive gap**: Uses `max(titleMarginBottom, 2vh)` for breathing room
- **Visual symmetry**: Container padding-bottom equals title margin-bottom
- **Cards respect padding**: Card height = container height - padding-bottom
- **Minimum height**: Cards maintain 400px minimum for usability
- **Recalculates on resize**: 150ms debounced resize handler updates all dimensions

---

## 2. CARD SIZING SYSTEM

### 2.1 Card Dimensions - Responsive

**Width (Horizontal Sizing)**:

**Desktop (>768px)**:
```css
.form-card {
    width: clamp(550px, 70vw, 900px);
    /* Range: 550-900px, responsive to viewport width */
}
```

**Mobile (≤768px)**:
```css
.form-card {
    width: clamp(300px, 88vw, 400px);
    /* Range: 300-400px, wider relative to viewport */
}
```

**Height (Vertical Sizing)** - NEW: Fully Dynamic

**All Breakpoints**:
```css
.form-card {
    min-height: 400px; /* Minimum usable height */
    /* Actual height set dynamically by JavaScript */
}
```

**Dynamic Height Calculation** (JavaScript):
```javascript
function calculateAndSetCardHeight() {
    // 1. Measure all vertical elements
    const titleHeight = candidatiTitle.offsetHeight;
    const titleMarginBottom = parseFloat(titleComputedStyle.marginBottom);
    const submitButtonHeight = submitButtonContainer.offsetHeight;
    const submitButtonBottomMargin = viewportHeight * 0.05; // 5vh

    // 2. Calculate container height (extends toward button)
    const containerStartY = blockPaddingTop + titleHeight + titleMarginBottom;
    const containerEndY = viewportHeight - blockTopPosition -
                          submitButtonHeight - submitButtonBottomMargin -
                          containerToButtonGap;
    const containerHeight = containerEndY - containerStartY;

    // 3. Set container dimensions
    cardDeckContainer.style.height = containerHeight + 'px';
    cardDeckContainer.style.paddingBottom = titleMarginBottom + 'px';

    // 4. Calculate card height (fills container minus padding)
    const cardHeight = containerHeight - titleMarginBottom;
    const finalCardHeight = Math.max(400, cardHeight); // Enforce minimum

    // 5. Apply to all cards
    cards.forEach(card => {
        card.style.height = finalCardHeight + 'px';
    });

    return { containerHeight, cardHeight: finalCardHeight };
}
```

**Sizing Strategy** (UPDATED):
- **Width**: Responsive via CSS clamp() (mobile: 88vw, desktop: 70vw)
- **Height**: Fully dynamic via JavaScript calculation
- **Container extends**: From title down to near submit button
- **Cards fill container**: Account for container's padding-bottom
- **Viewport-adaptive**: Recalculates on resize (150ms debounce)
- **Minimum enforced**: 400px minimum height prevents unusable cards
- **No overlaps**: Mathematical precision prevents title/button conflicts

---

### 2.2 Card Positioning

**Absolute Positioning**:
```css
.form-card {
    position: absolute;
    left: 50%;
    top: 0px; /* Set via JS - at top of container */

    /* Initial transform (hidden state) */
    transform: translate(-50%, 0) translateX(100vw);
    opacity: 0;
}
```

**Transform Breakdown**:
```javascript
// Base centering + animation offset
card.style.transform = `translate(calc(-50% + ${cardOffsetX}px), 0) translateX(${translateXVw}vw)`

// Where:
// - translate(-50%, 0): Centers horizontally, no vertical offset
// - cardOffsetX: Stack offset for fanning (currently 0)
// - translateXVw: Animation offset (100vw → 0vw)
```

**Stacking System** (currently disabled):
```javascript
function calculateCardOffsets() {
    return { x: 0, y: 0 }; // No offset = perfect stack
    // Future: return { x: 10, y: 5 }; for card fanning
}
```

---

### 2.3 Card Internal Padding

**Desktop**:
```css
.form-card {
    padding: clamp(20px, 2.5vh, 32px) clamp(25px, 3vw, 40px);
    /* Vertical: 20-32px | Horizontal: 25-40px */
}
```

**Mobile**:
```css
.form-card {
    padding: clamp(18px, 2.5vh, 25px) clamp(18px, 4vw, 25px);
    /* Vertical: 18-25px | Horizontal: 18-25px */
}
```

**Padding Distribution**:
- Slightly more horizontal padding on desktop for wider cards
- Mobile uses more aggressive scaling (4vw vs 3vw)
- Ensures touch targets have sufficient spacing on mobile

**Note**: Card padding is internal to the card and does NOT affect the dynamic height calculation. The height calculation sets the outer dimensions, and padding creates the internal spacing for content.

---

## 3. CARD INTERNAL SPACING SYSTEM

### 3.1 Card Structure Layout - CSS GRID

**Grid Column Layout**:
```css
.form-card {
    display: grid;
    grid-template-rows: auto 1fr auto;
    /* Creates three rows: header → expanding content → navigation */
}
```

**Three-Row Grid**:
1. **Card Header** (`auto` height - fits content, top-aligned)
2. **Card Content** (`1fr` - expands to fill available space)
3. **Card Navigation** (`auto` height - fits content, bottom-aligned)

**Philosophy**: Minimal spacing (6px gaps), content aligned at top, no overlap between sections.

---

### 3.2 Card Header Spacing - MINIMAL

```css
.card-header {
    /* Separator */
    border-bottom: 1px solid var(--border-light);

    /* Internal spacing - MINIMAL */
    padding-bottom: 8px; /* Fixed, no clamp */
    margin-bottom: 0; /* Grid gap controls spacing */
}

.card-title {
    font-size: clamp(1rem, 1.5vw + 0.5vh, 1.75rem);
    font-weight: 300;
    letter-spacing: var(--letter-spacing-widest);
    text-transform: uppercase;
    text-align: center;
    margin: 0;
}
```

**Total vertical space consumed**:
```
Card Title Height (~24-35px responsive)
+ padding-bottom: 8px
+ border: 1px
= ~33-44px total header space
```

---

### 3.3 Card Content Spacing - MINIMAL GRID

**Content Area Layout**:
```css
.card-content {
    display: grid;
    grid-template-columns: 1fr; /* Mobile: single column */
    gap: 6px; /* MINIMAL gap - mobile */
    align-content: start; /* Align content to top */
    padding-top: 10px; /* Small breathing room after header */
}
```

**Desktop Layout (Two Columns)**:
```css
@media (min-width: 769px) {
    .card-content {
        grid-template-columns: 1fr 1fr; /* Two equal columns */
        gap: 6px 12px; /* row-gap: 6px, column-gap: 12px */
    }

    /* Full-width elements span both columns */
    .card-content .form-info,
    .card-content .form-group.full-width {
        grid-column: 1 / -1;
    }
}
```

**Mobile Layout (Single Column)**:
```css
@media (max-width: 768px) {
    .card-content {
        grid-template-columns: 1fr; /* Single column */
        gap: 6px; /* MINIMAL vertical gap */
    }
}
```

**Spacing Strategy - MINIMAL**:
- **Desktop**: Small row gap (6px), moderate column gap (12px)
- **Mobile**: Minimal single gap (6px) for tight vertical spacing
- **Philosophy**: Content aligned at top, minimal spacing between elements
- **No scrolling**: Internal sizing optimization ensures content fits without overflow

---

### 3.4 Card Navigation Spacing - MINIMAL GRID

**Navigation Container**:
```css
.card-navigation {
    display: grid;
    grid-template-columns: 1fr 1fr; /* Always 2 columns */
    gap: 10px; /* Small gap between buttons */
    padding-top: 10px; /* Small breathing room above buttons */
}
```

**Button Alignment Logic**:
```css
/* Single button in first card: align right */
.card-navigation button[data-direction="next"]:only-child {
    grid-column: 2; /* Right column */
}

/* When prev is hidden (first card), align next to right */
.card-navigation button[data-direction="prev"][style*="display: none"]
  ~ button[data-direction="next"] {
    grid-column: 2;
}

/* When next is hidden (last card), align prev to left */
.card-navigation button[data-direction="next"][style*="display: none"]
  ~ button[data-direction="prev"] {
    grid-column: 1;
}
```

**Buttons**:
```css
.card-nav-button {
    width: 100%; /* Fill grid cell */
    padding: clamp(10px, 1.5vh, 14px) clamp(16px, 2.5vw, 28px);
}
```

---

### 3.5 Form Group Spacing - MINIMAL

**Form Group Container**:
```css
.form-group {
    margin-bottom: 0; /* Grid gap controls spacing */
    position: relative; /* For validation indicators */
    width: 100%; /* Fill column */
}
```

**Input/Select/Textarea Padding**:
```css
.form-group input,
.form-group select,
.form-group textarea {
    padding: clamp(12px, 1.5vh, 16px) clamp(14px, 2vw, 18px);
    /* Vertical: 12-16px | Horizontal: 14-18px */
}
```

**Textarea Heights**:
```css
.form-group textarea {
    min-height: clamp(60px, 8vh, 80px);
    max-height: clamp(120px, 18vh, 200px);
}

.form-group textarea.tall {
    min-height: clamp(80px, 12vh, 120px);
    max-height: clamp(150px, 22vh, 250px);
}
```

**Form Info Box**:
```css
.form-info {
    padding: clamp(10px, 1.5vh, 14px) clamp(12px, 2vw, 16px);
    margin: clamp(10px, 1.5vh, 14px) 0;
}
```

---

### 3.5 Card Navigation Spacing

```css
.card-navigation {
    /* Flex layout */
    display: flex;
    justify-content: space-between;
    gap: 12px; /* Space between prev/next buttons */

    /* Separator */
    border-top: 1px solid var(--border-light);

    /* Spacing from content */
    padding-top: clamp(12px, 2vh, 18px);
    margin-top: clamp(12px, 2vh, 18px);

    /* Does not grow/shrink */
    flex-shrink: 0;
}
```

**Navigation Button Padding**:
```css
.card-nav-button {
    flex: 1; /* Equal width buttons */
    padding: clamp(10px, 1.5vh, 14px) clamp(16px, 2.5vw, 28px);
    /* Vertical: 10-14px | Horizontal: 16-28px */
}
```

**Total vertical space consumed**:
```
margin-top: 12-18px
+ border: 1px
+ padding-top: 12-18px
+ button height: ~40-50px
= ~65-87px total navigation space
```

---

## 4. CARD APPEARANCE & STYLING

### 4.1 Visual Design System

**Background & Depth**:
```css
.form-card {
    /* Semi-transparent dark background */
    background: rgba(0, 0, 0, 0.4);

    /* Subtle border */
    border: 1px solid rgba(255, 255, 255, 0.18);
    border-radius: 2px;

    /* Multi-layer shadow for depth */
    box-shadow:
        0 12px 40px rgba(0, 0, 0, 0.6),      /* Deep shadow */
        0 4px 16px rgba(0, 0, 0, 0.4),        /* Mid shadow */
        inset 0 1px 0 rgba(255, 255, 255, 0.1); /* Inner highlight */
}
```

**Design Rationale**:
- **40% opacity black**: Allows video background to subtly show through
- **18% white border**: Gentle outline without harsh contrast
- **2px radius**: Minimal rounding, keeps modern/clean aesthetic
- **Inset highlight**: Adds subtle depth, simulates glass/acrylic effect

---

### 4.2 Typography Styling

**Card Title**:
```css
.card-title {
    font-size: clamp(1rem, 1.5vw + 0.5vh, 1.75rem);
    /* Range: 16px - 28px */

    font-weight: 300;
    letter-spacing: var(--letter-spacing-widest);
    /* clamp(0.1em, 0.08em + 0.1vw, 0.3em) */

    text-transform: uppercase;
    text-align: center;
    color: var(--text-primary); /* rgba(255, 255, 255, 0.95) */
}
```

**Section Title** (`.candidati-title`):
```css
.candidati-title {
    font-size: clamp(1.5rem, 3vw + 1vh, 2.5rem);
    /* Range: 24px - 40px */

    font-weight: 300;
    letter-spacing: var(--letter-spacing-widest);
    text-transform: uppercase;
    text-align: center;
}
```

---

### 4.3 Form Field Styling

**Base Input Style**:
```css
.form-group input,
.form-group select,
.form-group textarea {
    /* Background */
    background: var(--bg-strong); /* rgba(0, 0, 0, 0.7) */

    /* Border */
    border: 1px solid var(--border-default); /* rgba(255, 255, 255, 0.2) */

    /* Text */
    color: var(--text-secondary); /* rgba(255, 255, 255, 0.8) */
    font-family: inherit;
    font-size: clamp(10px, 1vw + 0.2vh, 13px);
    text-transform: uppercase;
    letter-spacing: var(--letter-spacing-wide);

    /* Interaction */
    transition: all 0.3s;
}
```

**Hover State**:
```css
.form-group input:hover,
.form-group select:hover,
.form-group textarea:hover {
    color: var(--text-primary); /* rgba(255, 255, 255, 0.95) */
    border-color: var(--border-hover); /* rgba(255, 255, 255, 0.3) */
}
```

**Focus State**:
```css
.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
    outline: none;
    color: var(--text-primary);
    border-color: var(--border-hover);
}
```

**Placeholder**:
```css
.form-group input::placeholder,
.form-group select::placeholder,
.form-group textarea::placeholder {
    color: var(--text-secondary);
}
```

---

### 4.4 Required Field Indicator

**Asterisk Positioning**:
```css
/* For input and select */
.form-group:has(input.required)::after,
.form-group:has(select.required)::after {
    content: '*';
    position: absolute;
    right: clamp(14px, 2vw, 18px);
    top: 50%;
    transform: translateY(-50%);
    color: var(--accent); /* #96795c */
    font-size: clamp(11px, 1.1vw + 0.3vh, 14px);
    pointer-events: none;
    z-index: 1;
}

/* For select - avoid dropdown arrow */
.form-group:has(select.required)::after {
    right: clamp(40px, 4vw, 50px);
}

/* For textarea - top right corner */
.form-group:has(textarea.required)::after {
    right: clamp(14px, 2vw, 18px);
    top: clamp(16px, 2vh, 22px);
    transform: none;
}
```

---

### 4.5 Special Elements

**Select Dropdown Arrow**:
```css
.form-group select {
    appearance: none;
    background-image: url("data:image/svg+xml...");
    /* Custom SVG arrow */
    background-repeat: no-repeat;
    background-position: right 15px center;
    background-size: 20px;
    padding-right: 45px;
}
```

**Form Info Box**:
```css
.form-info {
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid var(--border-default);
    font-size: clamp(9px, 0.9vw + 0.2vh, 11px);
    letter-spacing: var(--letter-spacing-wide);
    color: var(--text-secondary);
    line-height: 1.4;
}
```

**Custom Scrollbar** (card-content):
```css
.card-content::-webkit-scrollbar {
    width: 4px;
}

.card-content::-webkit-scrollbar-track {
    background: transparent;
}

.card-content::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
}

.card-content::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
}
```

---

### 4.6 Button Styling

**Card Navigation Buttons**:
```css
.card-nav-button {
    /* Background & border */
    background: var(--bg-medium); /* rgba(0, 0, 0, 0.5) */
    border: 1px solid var(--border-default);

    /* Text */
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: var(--letter-spacing-wider);
    font-size: clamp(9px, 1vw + 0.3vh, 12px);

    /* Interaction */
    cursor: pointer;
    transition: all 0.3s;
}

.card-nav-button:hover {
    color: var(--text-primary);
    border-color: var(--border-hover);
    transform: translateY(-1px);
}

/* Symbol styling */
.card-nav-button .btn-symbol {
    opacity: 0.5;
    font-weight: 200;
}
```

**Submit Button**:
```css
.submit-button {
    /* Background & border */
    background: var(--bg-medium);
    border: 1px solid var(--border-default);

    /* Text */
    color: var(--text-secondary);
    padding: clamp(12px, 1.8vh, 18px) clamp(25px, 3.5vw, 45px);
    text-transform: uppercase;
    letter-spacing: var(--letter-spacing-widest);
    font-size: clamp(11px, 1.2vw + 0.3vh, 15px);

    /* Interaction */
    cursor: pointer;
    transition: all 0.3s;
}

.submit-button:hover {
    color: var(--text-primary);
    border-color: var(--border-hover);
    transform: translateY(-1px);
}
```

---

## 5. RESPONSIVE BEHAVIOR SUMMARY

### 5.1 Breakpoint: 768px

**Mobile (≤768px)**:
- Single-column form layout
- Narrower cards (88vw vs 70vw)
- Card height: dynamically calculated (fills available space)
- Smaller padding (18-25px vs 20-40px)
- Reduced gaps (10-14px vs 12-30px)

**Desktop (>768px)**:
- Two-column grid layout
- Wider cards with more horizontal space
- Card height: dynamically calculated (fills available space)
- Larger column gaps for visual separation
- More generous padding
- Full-width elements span both columns

**Note**: Both mobile and desktop now use the same dynamic height calculation system. The width is the primary responsive difference.

---

### 5.2 Viewport-Dependent Values

**All clamp() functions adapt to**:
- Viewport width (vw)
- Viewport height (vh)
- Fixed minimum/maximum bounds

**Strategy**:
- Prevents layouts from breaking at extreme sizes
- Maintains readability across devices
- Ensures touch targets remain accessible on mobile

---

## 6. KEY SPACING RATIOS

### 6.1 Card Proportions (UPDATED)

**Desktop**:
```
Width: 70% of viewport (550-900px)
Height: Dynamically calculated to fill available vertical space
        (viewport - block top - padding - title - button - gaps)
        Minimum: 400px
```

**Mobile**:
```
Width: 88% of viewport (300-400px)
Height: Dynamically calculated to fill available vertical space
        (viewport - block top - padding - title - button - gaps)
        Minimum: 400px
```

**Dynamic Height Formula**:
```javascript
containerHeight = viewportHeight - blockTopPosition -
                  submitButtonHeight - submitButtonBottomMargin -
                  containerToButtonGap - blockPaddingTop -
                  titleHeight - titleMarginBottom;

cardHeight = containerHeight - containerPaddingBottom;
finalCardHeight = Math.max(400, cardHeight);
```

**Reasoning**:
- Desktop: Wider format for two-column grid, height fills available space
- Mobile: Narrower format for single-column stack, height fills available space
- Both: Dynamically adapt to any viewport size while maintaining 400px minimum
- Eliminates fixed aspect ratios in favor of responsive space-filling

---

### 6.2 Internal Spacing Ratios

**Vertical Rhythm** (desktop):
```
Header padding-bottom: 10-15px
Header margin-bottom: 15-20px
Form row gap: 12-18px
Navigation margin-top: 12-18px
Navigation padding-top: 12-18px
→ Consistent ~12-18px vertical rhythm
```

**Horizontal Spacing** (desktop grid):
```
Column gap: 20-30px (1.67× to 2× row gap)
→ Stronger horizontal separation for two-column layout
```

---

### 6.3 Padding-to-Content Ratios

**Card Internal Padding**:
```
Desktop: 20-32px vertical, 25-40px horizontal
Mobile: 18-25px (equal vertical/horizontal)

Content area: ~85-90% of card dimensions
Padding: ~10-15% of card dimensions
→ Balanced whitespace without wasted space
```

**Input Field Padding**:
```
Padding: 12-16px vertical, 14-18px horizontal
Touch target height: ~40-50px total
→ Exceeds 44px iOS minimum for accessibility
```

---

## 7. SPACING MODIFICATION GUIDE

### 7.1 Changing Card Dimensions (UPDATED)

**To make cards wider**:
```css
/* Increase max values in clamp() */
.form-card {
    width: clamp(550px, 70vw, 1100px);  /* was 900px */
}
```

**To make cards narrower**:
```css
/* Decrease min values in clamp() */
.form-card {
    width: clamp(450px, 70vw, 900px);   /* was 550px */
}
```

**To change card height** (NEW - modify JavaScript):

**Adjust minimum height**:
```css
.form-card {
    min-height: 500px; /* was 400px - affects Math.max() in JS */
}
```

**Adjust gap before submit button**:
```javascript
// In calculateAndSetCardHeight() function
const containerToButtonGap = Math.max(titleMarginBottom, viewportHeight * 0.04);
// Increased from 0.02 (2vh) to 0.04 (4vh) for more space
```

**Adjust container padding-bottom**:
```javascript
// To use a different value than titleMarginBottom
const containerPaddingBottom = viewportHeight * 0.03; // 3vh instead of title margin
cardDeckContainer.style.paddingBottom = containerPaddingBottom + 'px';
```

**Note**: Card height is now dynamically calculated. To change it, modify the calculation parameters (gaps, margins, minimum height) rather than setting fixed height values.

---

### 7.2 Changing Internal Spacing

**Increase vertical spacing between form fields**:
```css
@media (min-width: 769px) {
    .card-content {
        gap: clamp(18px, 2vh, 24px) clamp(20px, 2.5vw, 30px);
        /* Row gap increased from 12-18px to 18-24px */
    }
}
```

**Increase card padding**:
```css
@media (min-width: 769px) {
    .form-card {
        padding: clamp(25px, 3vh, 40px) clamp(30px, 4vw, 50px);
        /* Vertical: 25-40px | Horizontal: 30-50px */
    }
}
```

---

### 7.3 Changing Section-Level Spacing

**Adjust title-to-cards spacing**:
```css
.candidati-title {
    margin-bottom: clamp(20px, 3vh, 40px);
    /* Increased from 12-24px to 20-40px */
}
```

**Adjust section padding**:
```css
.candidati-block {
    padding: clamp(30px, 6vh, 60px) clamp(30px, 6vw, 60px);
    /* Increased all padding for more breathing room */
}
```

---

## 8. SPACING DEPENDENCIES & CONSTRAINTS

### 8.1 Critical Relationships (UPDATED)

**Card Height ↔ Viewport Height** (NEW - Dynamic System):
```
finalCardHeight = Math.max(400, containerHeight - containerPaddingBottom)

Where containerHeight accounts for:
  - candidati-block top position: 60px
  - Block padding-top: clamp(20px, 4vh, 40px)
  - Title height: measured dynamically
  - Title margin-bottom: clamp(12px, 1.8vh, 24px)
  - Submit button height: measured dynamically
  - Submit button bottom: 5vh
  - Container-to-button gap: max(titleMarginBottom, 2vh)
  - Container padding-bottom: titleMarginBottom

→ Cards dynamically fill ALL available space
→ 400px minimum enforced for usability
→ Recalculates on viewport resize
```

**Container Extension ↔ Submit Button Position** (NEW):
```
Container extends from:
  START: blockPaddingTop + titleHeight + titleMarginBottom
  END: viewportHeight - blockTop - buttonHeight - buttonBottom - gap

Container padding-bottom = titleMarginBottom (visual symmetry)
Card height = containerHeight - containerPaddingBottom
```

**Form Content ↔ Card Height**:
```
Card content uses flex: 1 (grows to fill)
→ Must account for:
  - Card header: ~56-76px
  - Card navigation: ~65-87px
  - Card padding: ~40-64px (vertical total)
→ Available content height: DYNAMIC (adapts to card height)
→ Content scrolls if exceeds available space
```

**Grid Columns ↔ Card Width**:
```
Desktop: Two columns with gap
→ Minimum card width must accommodate:
  - Two input fields side by side
  - Column gap: 20-30px
  - Card padding: 50-80px (horizontal total)
→ Minimum comfortable width: ~500px
```

---

### 8.2 Breakpoint Constraints

**Why 768px breakpoint?**:
- Below 768px: Single input field needs ~280-350px width
- Above 768px: Two input fields need ~500px+ width
- 768px is standard tablet/desktop threshold
- Aligns with other responsive design conventions

**Critical widths**:
- 320px: Minimum supported viewport
- 768px: Mobile/desktop breakpoint
- 1024px: Typical tablet landscape
- 1920px: Common desktop resolution

---

## 9. PERFORMANCE CONSIDERATIONS

### 9.1 Clamp() Usage

**Benefits**:
- Single declaration handles all viewport sizes
- No JavaScript calculations needed
- Smooth scaling without breakpoint jumps
- Browser-native optimization

**Limitations**:
- Not supported in IE11 (fallback to min value)
- Can create unexpected mid-range values
- Harder to debug than explicit breakpoints

---

### 9.2 Animation Impact

**Cards are absolutely positioned**:
- ✅ Do not trigger layout reflow when animating
- ✅ Transform-only animations are GPU-accelerated
- ✅ Opacity changes are performant

**Fixed container**:
- ✅ Decoupled from page scroll (no layout thrashing)
- ✅ Single scroll handler controls all animations
- ✅ Predictable performance across devices

### 9.3 Dynamic Sizing Performance (NEW)

**Resize Handler**:
- ✅ Debounced to 150ms (prevents excessive recalculations)
- ✅ Only measures and sets dimensions (no layout thrashing)
- ✅ Uses cached DOM references (no repeated queries)
- ✅ Single calculation updates all cards simultaneously

**Measurement Performance**:
- Uses `offsetHeight` for direct measurements (fast)
- Uses `getComputedStyle` for dynamic clamp() values (necessary)
- Calculations done once per resize event (not per frame)
- No forced synchronous layouts

---

## 10. COMMON SPACING ISSUES & SOLUTIONS

### Issue 1: Cards overlap with title
**Symptom**: Title and first card visually collide
**Solution**: Increase `.candidati-title` margin-bottom
```css
margin-bottom: clamp(20px, 3vh, 40px);
```

### Issue 2: Submit button overlaps cards (UPDATED)
**Symptom**: Button appears on top of card content
**Solution**: Increase container-to-button gap in JavaScript
```javascript
// In calculateAndSetCardHeight()
const containerToButtonGap = Math.max(titleMarginBottom, viewportHeight * 0.04);
// Increased from 0.02 (2vh) to 0.04 (4vh)
```

### Issue 3: Form fields too cramped
**Symptom**: Fields feel squished, hard to click/tap
**Solution**: Increase grid gap on desktop
```css
gap: clamp(18px, 2vh, 24px) clamp(25px, 3vw, 35px);
```

### Issue 4: Card content scrolls unnecessarily (UPDATED)
**Symptom**: Scrollbar appears when it shouldn't
**Solution**: Cards now dynamically size to available space. If still scrolling:
1. Reduce card internal padding
2. Reduce form field gaps
3. Check if card content is exceeding calculated height
```css
/* Reduce padding */
.form-card {
    padding: clamp(15px, 2vh, 25px) clamp(20px, 2.5vw, 35px);
}
```

### Issue 5: Buttons too small on mobile
**Symptom**: Hard to tap on small screens
**Solution**: Increase button padding
```css
padding: clamp(14px, 2vh, 18px) clamp(20px, 4vw, 30px);
```

### Issue 6: Cards too short on small viewports (NEW)
**Symptom**: Cards hit 400px minimum and don't fill space
**Solution**: Reduce minimum height or adjust calculation parameters
```css
.form-card {
    min-height: 350px; /* was 400px */
}
```
Or increase available space by reducing gaps/margins.

---

## 11. TESTING CHECKLIST

When modifying spacing, test these scenarios:

**Viewport Sizes**:
- [ ] 320px width (iPhone SE)
- [ ] 375px width (iPhone standard)
- [ ] 768px width (iPad portrait)
- [ ] 1024px width (iPad landscape)
- [ ] 1920px width (Desktop)
- [ ] 2560px width (Large desktop)

**Viewport Heights**:
- [ ] 568px height (iPhone SE)
- [ ] 812px height (iPhone X)
- [ ] 1024px height (iPad)
- [ ] 1080px height (Desktop)

**Content Scenarios**:
- [ ] All cards with minimum content
- [ ] All cards with maximum content
- [ ] Cards with very long text (word wrapping)
- [ ] Cards with very short text

**Interactions**:
- [ ] Scrolling within card content
- [ ] Clicking form fields (no overlap with other elements)
- [ ] Clicking navigation buttons
- [ ] Clicking submit button
- [ ] Tab navigation through form

---

## 12. SPACING VALUES QUICK REFERENCE

### Section Level
```
candidati-block padding:    20-40px (top/sides), 10-20px (bottom)
candidati-title margin:     12-24px (bottom)
submit-button bottom:       5vh
```

### Card Level (Desktop)
```
Card width:                 550-900px (70vw)
Card height:                450-650px (60vh)
Card padding:               20-32px (vertical), 25-40px (horizontal)
Header padding-bottom:      10-15px
Header margin-bottom:       15-20px
Content row gap:            12-18px
Content column gap:         20-30px
Navigation margin-top:      12-18px
Navigation padding-top:     12-18px
Navigation button gap:      12px
```

### Card Level (Mobile)
```
Card width:                 300-400px (88vw)
Card height:                420-600px (65vh)
Card padding:               18-25px (both)
Content gap:                10-14px (vertical)
```

### Field Level
```
Input padding:              12-16px (vertical), 14-18px (horizontal)
Textarea min-height:        60-80px (normal), 80-120px (tall)
Form info padding:          10-14px (vertical), 12-16px (horizontal)
Form info margin:           10-14px (vertical)
```

### Button Level
```
Nav button padding:         10-14px (vertical), 16-28px (horizontal)
Submit button padding:      12-18px (vertical), 25-45px (horizontal)
```

---

## Document Version
- **Created**: 2025-10-10
- **Last Updated**: 2025-10-10
- **Section**: Candidati
- **Purpose**: Spacing & sizing system reference
- **Status**: Updated with dynamic height calculation system

---

## Change Log

### 2025-10-10 - Dynamic Height System Implementation
**Major Changes**:
- Removed fixed CSS height values (`clamp(450px, 60vh, 650px)`)
- Implemented JavaScript-based dynamic height calculation
- Card-deck-container now extends from title to near submit button
- Container padding-bottom equals title margin-bottom (visual symmetry)
- Cards fill container minus padding with 400px minimum enforced
- Added viewport-responsive gap before submit button
- Implemented 150ms debounced resize handler for recalculation

**Benefits**:
- Cards now fill all available vertical space
- No overlaps with title or submit button (mathematically guaranteed)
- Adapts to any viewport size automatically
- Maintains minimum 400px for usability
- Visual symmetry between top (title margin) and bottom (container padding)

**Files Modified**:
- `index.html`: Removed fixed height CSS, added dynamic comments
- `dance-academy.js`: Added `calculateAndSetCardHeight()` function and resize handler
- `CANDIDATI_SPACING_SYSTEM.md`: Updated documentation with new system
