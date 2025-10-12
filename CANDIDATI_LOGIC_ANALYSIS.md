# Candidati Section - Complete Implementation Logic

## Overview
The candidati section implements a **scroll-decoupled** 3-phase card stack animation system. All animations are **100% tied to scroll position** but **independent of scroll velocity** (no momentum/inertia). Exit animations were **NOT implemented** in the backup.

---

## HTML Structure (Required)

### Complete Element Hierarchy
```html
<div class="candidati-block block" data-block="candidati">
    <!-- Title (animated separately) -->
    <h2 class="candidati-title">Candidati</h2>

    <!-- Card container -->
    <div class="card-deck-container">
        <form id="candidatiForm">
            <!-- 5 cards (one per form section) -->
            <div class="form-card" data-card="0">
                <div class="card-header">
                    <h3 class="card-title">Scuola</h3>
                </div>
                <div class="card-content">
                    <!-- Form fields -->
                    <div class="form-group">
                        <input type="text" name="..." placeholder="..." class="required" required>
                    </div>
                    <!-- ... more form groups ... -->
                </div>
                <div class="card-navigation">
                    <button type="button" class="card-nav-button" data-direction="prev">
                        <span class="btn-symbol">&laquo;</span> INDIETRO
                    </button>
                    <button type="button" class="card-nav-button" data-direction="next">
                        AVANTI <span class="btn-symbol">&raquo;</span>
                    </button>
                </div>
            </div>

            <!-- Repeat for cards 1-4 -->
        </form>
    </div>

    <!-- Submit button (animated with last card) -->
    <div class="submit-button-container">
        <button type="submit" form="candidatiForm" class="submit-button">INVIA CANDIDATURA</button>
    </div>
</div>
```

### Card Data Attributes
Each card has `data-card="N"` where N = 0 to 4 (5 cards total)

### Card Sections (in order)
1. **Card 0**: "Scuola" - School information (6 fields)
2. **Card 1**: "Referente" - Contact person (5 fields)
3. **Card 2**: "Profilo Artistico" - Artistic profile (3 fields, uses `.full-width`)
4. **Card 3**: "Presenza Online" - Online presence (4 fields)
5. **Card 4**: "Il Vostro Interesse" - Interest explanation (4 fields including `.form-info` element)

---

## Required CSS (Initial States & Positioning)

### Candidati Block Container
```css
.candidati-block {
    min-height: 100vh;
    margin: 0; /* JavaScript sets position: fixed and manages positioning */
    padding: 0 clamp(20px, 5vw, 40px) clamp(15px, 2vh, 25px);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    overflow: hidden;
    /* JavaScript sets: position: fixed, top: 60px, left: 50%, transform: translateX(-50%), z-index: 1000 */
}
```

**Key positioning notes**:
- **Position**: JavaScript converts to `position: fixed` with `top: 60px` for scroll-decoupled animation
- **Z-index**: Set to 1000 by JavaScript, creating isolated stacking context (important for blur overlay)
- **Width**: JavaScript calculates and sets width explicitly to maintain layout
- **Padding**: Horizontal responsive, bottom minimal for tight spacing
- **Flexbox**: Column layout, center-aligned, content starts at top

### Title Positioning & Initial State
```css
.candidati-title {
    font-size: var(--text-4xl);
    font-weight: 300;
    letter-spacing: var(--letter-spacing-widest);
    text-transform: uppercase;
    margin-bottom: clamp(5px, 1vh, 10px);
    text-align: center;
    opacity: 0;
    /* NO position: absolute/fixed in CSS - title uses natural flow position */
    /* JS will override transform during animation */
    transform: translateX(-50%) translateY(50px);
    transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.6s ease;
}
```

**Critical**: Title does NOT have `position: absolute` or `left: 50%` in CSS. It uses natural document flow positioning within the flex container. The `translateX(-50%)` in JS is used ONLY for the animation transform, not for positioning.

### Card Deck Container
```css
.card-deck-container {
    position: relative;
    width: 100%;
    /* NO fixed height - let cards determine height */
    /* NO flexbox centering - cards are absolutely positioned */
}
```

**Important**: Container has `position: relative` for card absolute positioning, but no height constraints or flex centering.

### Card Initial State & Sizing
```css
.form-card {
    position: absolute;
    left: 50%;
    top: 0;
    background: transparent; /* Blur overlay provides glassmorphic background */
    border: 1px solid rgba(255, 255, 255, 0.25);
    border-radius: 2px;
    opacity: 0;
    overflow: hidden;
    /* 5-layer shadow system for dramatic depth */
    box-shadow:
        0 20px 60px rgba(0, 0, 0, 0.9),  /* Ultra-deep ambient shadow */
        0 12px 32px rgba(0, 0, 0, 0.7),  /* Deep shadow */
        0 6px 16px rgba(0, 0, 0, 0.5),   /* Mid shadow */
        0 2px 8px rgba(0, 0, 0, 0.4),    /* Edge shadow */
        inset 0 -1px 0 rgba(0, 0, 0, 0.6); /* Bottom inner shadow */
    /* CSS Grid layout: header | expanding content | navigation */
    display: grid;
    grid-template-rows: auto 1fr auto;
    /* Height set dynamically by JavaScript */
    min-height: 400px;
}

/* Desktop (>768px) */
@media (min-width: 769px) {
    .form-card {
        width: clamp(550px, 70vw, 900px);
        padding: clamp(20px, 2.5vh, 32px) clamp(25px, 3vw, 40px);
    }
}

/* Mobile (≤768px) */
@media (max-width: 768px) {
    .form-card {
        width: clamp(300px, 88vw, 400px);
        padding: clamp(18px, 2.5vh, 25px) clamp(18px, 4vw, 25px);
    }
}
```

**Card structure**:
- **Layout**: CSS Grid with 3 rows (header | expanding content | navigation)
- **Background**: Transparent - separate blur overlay element provides glassmorphic effect
- **Height**: Dynamically calculated by JavaScript based on viewport and element positions
- **Transform**: Applied by JavaScript for entrance animations

### Submit Button Initial State
```css
.submit-button-container {
    position: absolute;
    bottom: clamp(20px, 2vh, 30px);
    left: 50%;
    transform: translateX(-50%) translateY(100px); /* Hidden below */
    opacity: 0;
    transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.6s ease;
}

.submit-button {
    display: inline-block;
    background: var(--bg-medium);
    border: 1px solid var(--border-default);
    color: var(--text-secondary);
    padding: clamp(12px, 2vh, 20px) clamp(25px, 4vw, 50px);
    text-transform: uppercase;
    letter-spacing: var(--letter-spacing-widest);
    font-size: var(--text-base);
    cursor: pointer;
    transition: all 0.3s;
    font-family: inherit;
    font-weight: 300;
}
```

### Card Inner Layout & Spacing

**Card flexbox structure** (top to bottom):
1. `.card-header` - Fixed height section at top
2. `.card-content` - Flex-grow section (scrollable if needed)
3. `.card-navigation` - Fixed height section at bottom

```css
/* Card header with bottom border */
.card-header {
    border-bottom: 1px solid var(--border-light);
    padding-bottom: clamp(15px, 2vh, 20px);
    margin-bottom: clamp(20px, 3vh, 30px);
}

.card-title {
    font-size: var(--text-2xl);
    font-weight: 300;
    letter-spacing: var(--letter-spacing-widest);
    text-transform: uppercase;
    text-align: center;
    margin: 0;
    color: var(--text-primary);
}

/* Card content area - grows to fill available space */
.card-content {
    flex: 1;
    overflow-y: auto;
    padding-right: 5px; /* Space for scrollbar */
}

/* Mobile: Single column layout */
@media (max-width: 768px) {
    .card-content {
        display: flex;
        flex-direction: column;
        gap: 15px;
    }

    .form-group {
        width: 100%;
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
        width: 100%;
        max-width: 100%;
    }
}

/* Desktop: Two-column grid */
@media (min-width: 769px) {
    .card-content {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 25px 30px; /* row-gap: 25px, column-gap: 30px */
        align-items: start;
    }

    /* Full width elements in two-column grid */
    .card-content .form-info,
    .card-content .form-group.full-width {
        grid-column: 1 / -1; /* Span both columns */
    }
}

/* Navigation buttons at bottom */
.card-navigation {
    display: flex;
    justify-content: space-between;
    gap: 15px;
    padding-top: clamp(20px, 3vh, 30px);
    margin-top: clamp(15px, 2vh, 25px);
    border-top: 1px solid var(--border-light);
}

.card-nav-button {
    flex: 1;
    padding: clamp(12px, 2vh, 18px) clamp(20px, 3vw, 35px);
    background: var(--bg-medium);
    border: 1px solid var(--border-default);
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: var(--letter-spacing-wider);
    font-size: var(--text-xs);
    cursor: pointer;
    transition: all 0.3s;
    font-family: inherit;
    font-weight: 300;
}

.card-nav-button:hover {
    color: var(--text-primary);
    border-color: var(--border-hover);
    transform: translateY(-1px);
}

.card-nav-button .btn-symbol {
    opacity: 0.5;
    font-weight: 200;
}

/* Form groups and inputs */
.form-group {
    margin-bottom: 15px;
    position: relative;
}

.form-group input,
.form-group select,
.form-group textarea {
    width: 100%;
    padding: 20px;
    background: var(--bg-strong);
    border: 1px solid var(--border-default);
    color: var(--text-secondary);
    font-family: inherit;
    font-size: var(--text-sm);
    text-transform: uppercase;
    letter-spacing: var(--letter-spacing-wider);
    transition: all 0.3s;
}

.form-group textarea {
    min-height: 80px;
    resize: vertical;
    text-transform: none;
}

.form-group textarea.tall {
    min-height: 160px;
}

.form-info {
    padding: 16px 20px;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid var(--border-default);
    font-size: var(--text-xs);
    letter-spacing: var(--letter-spacing-wide);
    color: var(--text-secondary);
    margin: 15px 0;
}
```

**Key spacing relationships**:
- **Mobile**: Single column, 15px gap between fields
- **Desktop**: Two-column grid, 25px row gap, 30px column gap
- **Full-width elements**: `.form-group.full-width` and `.form-info` span both columns on desktop
- **Card content**: Scrollable with `overflow-y: auto` and `padding-right: 5px` for scrollbar space

---

## JavaScript Implementation

### 1. Element Selectors (Initialization)

```javascript
const candidatiSection = document.querySelector('.candidati-block');
const candidatiTitle = candidatiSection?.querySelector('.candidati-title');
const cards = candidatiSection?.querySelectorAll('.form-card');
const submitButtonContainer = candidatiSection?.querySelector('.submit-button-container');
```

**Validation**:
```javascript
if (!candidatiSection || !candidatiTitle || !cards || cards.length === 0 || !submitButtonContainer) {
    console.log('Candidati elements not found');
    return;
}
```

**Expected**: 5 cards (cards.length === 5)

---

### 2. Helper Functions

#### Calculate Card Offsets (for stacking/fanning)
```javascript
function calculateCardOffsets() {
    // CURRENT: All cards perfectly centered (no offset)
    return { x: 0, y: 0 };
}
```
**Future**: Can return `{x: 10, y: 5}` for stacking effect

#### Calculate Submit Button Height (unused but kept)
```javascript
function calculateSubmitButtonTotalHeight() {
    const submitButton = submitButtonContainer.querySelector('.submit-button');
    if (!submitButton) return 150;

    const buttonHeight = submitButton.offsetHeight;
    const buttonMargin = parseInt(window.getComputedStyle(submitButton).marginTop) || 0;
    return buttonHeight + buttonMargin + 50;
}
```

---

### 3. Scroll Range Calculation

```javascript
const totalCards = cards.length; // 5

// Section top position
const candidatiBlockTop = candidatiSection.getBoundingClientRect().top + window.scrollY;

// Phase 1: Title entrance (50vh)
const titleEntranceStart = candidatiBlockTop;
const titleEntranceEnd = titleEntranceStart + window.innerHeight * 0.5;

// Phase 2: Card entrance (150vh - starts after title)
const cardEntranceStart = titleEntranceEnd;
const cardEntranceDuration = window.innerHeight * 1.5;
const cardEntranceEnd = cardEntranceStart + cardEntranceDuration;

// Phase 3: Deadzone (200vh - all cards visible/interactive)
const cardDeadzoneDuration = window.innerHeight * 2;
const cardDeadzoneEnd = cardEntranceEnd + cardDeadzoneDuration;

// NO EXIT PHASE in backup (exit animations not implemented)
```

**Total scroll range**: 400vh (title + cards + deadzone)

**Logging**:
```javascript
console.log('Candidati scroll ranges:', {
    titleEntranceStart,
    titleEntranceEnd,
    cardEntranceStart,
    cardEntranceEnd,
    cardDeadzoneEnd,
    totalScrollRange: cardDeadzoneEnd - titleEntranceStart
});
```

---

### 4. Easing Functions

```javascript
// For cards and title (episodi sidebar style)
const sidebarEasing = t => 1 - Math.pow(1 - t, 2.5);
// Ease-out with power 2.5 - gentle, gradual deceleration

// For submit button
const contentEasing = t => 1 - Math.pow(1 - t, 1.8);
// Ease-out with power 1.8 - smoother than sidebar
```

**Characteristic**: Ease-out curves (fast start, slow end)

---

### 5. Dynamic Height Calculation System

The card height is dynamically calculated to fill the available vertical space between the title and submit button, adapting to viewport size.

```javascript
function calculateAndSetCardHeight() {
    const viewportHeight = window.innerHeight;
    const blockTopPosition = 60; // Fixed top position of candidati-block

    // Get dimensions
    const blockComputedStyle = window.getComputedStyle(candidatiSection);
    const blockPaddingTop = parseFloat(blockComputedStyle.paddingTop) || 0;
    const titleHeight = candidatiTitle.offsetHeight;
    const titleComputedStyle = window.getComputedStyle(candidatiTitle);
    const titleMarginBottom = parseFloat(titleComputedStyle.marginBottom) || 0;
    const submitButtonHeight = submitButtonContainer.offsetHeight;
    const submitButtonBottomMargin = viewportHeight * 0.05; // 5vh

    // Calculate gap between container and submit button
    const containerToButtonGap = Math.max(titleMarginBottom, viewportHeight * 0.02);

    // Calculate container boundaries
    const containerStartY = blockPaddingTop + titleHeight + titleMarginBottom;
    const containerEndY = viewportHeight - blockTopPosition - submitButtonHeight -
                          submitButtonBottomMargin - containerToButtonGap;
    const containerHeight = containerEndY - containerStartY;

    // Set container height and padding
    cardDeckContainer.style.paddingBottom = titleMarginBottom + 'px';
    cardDeckContainer.style.height = containerHeight + 'px';

    // Calculate and apply card height (container height minus padding)
    const cardHeight = containerHeight - titleMarginBottom;
    const finalCardHeight = Math.max(400, cardHeight); // 400px minimum

    cards.forEach(card => {
        card.style.height = finalCardHeight + 'px';
    });

    return { containerHeight, cardHeight: finalCardHeight };
}
```

**Key features**:
- Cards extend to fill space from title bottom to near submit button
- Maintains viewport-based gap to submit button
- Container padding-bottom matches title margin-bottom for symmetry
- 400px minimum height failsafe
- Returns calculated heights for use in internal sizing optimization

---

### 6. Internal Card Content Optimization

After calculating card heights, content within cards is optimized to fit without scrolling by measuring the "busiest" card.

```javascript
function optimizeCardInternalSizing(cardHeight) {
    // Temporarily make all cards visible for measurement
    const originalStyles = [];
    cards.forEach((card, index) => {
        originalStyles[index] = {
            transform: card.style.transform,
            opacity: card.style.opacity
        };
        card.style.transform = 'translate(-50%, 0)';
        card.style.opacity = '1';
    });

    // Measure natural content height of each card
    const cardMeasurements = [];
    cards.forEach((card, index) => {
        const header = card.querySelector('.card-header');
        const content = card.querySelector('.card-content');
        const navigation = card.querySelector('.card-navigation');

        const headerHeight = header.offsetHeight;
        const navigationHeight = navigation.offsetHeight;
        const contentHeight = content.scrollHeight;
        const totalNaturalHeight = headerHeight + contentHeight + navigationHeight;

        cardMeasurements.push({
            index, card, content,
            headerHeight, navigationHeight, contentHeight, totalNaturalHeight
        });
    });

    // Find busiest card (tallest total natural height)
    const busiestCard = cardMeasurements.reduce((max, current) =>
        current.totalNaturalHeight > max.totalNaturalHeight ? current : max
    );

    const availableContentHeight = cardHeight - busiestCard.headerHeight -
                                   busiestCard.navigationHeight;

    // If content doesn't fit, reduce textarea heights proportionally
    if (busiestCard.contentHeight > availableContentHeight) {
        const excessHeight = busiestCard.contentHeight - availableContentHeight;
        const textareasInBusiestCard = busiestCard.content.querySelectorAll('textarea');

        if (textareasInBusiestCard.length > 0) {
            const reductionPerTextarea = excessHeight / textareasInBusiestCard.length;

            // Apply reduction to ALL cards uniformly
            cards.forEach(card => {
                card.querySelectorAll('textarea').forEach(textarea => {
                    const currentHeight = parseFloat(window.getComputedStyle(textarea).height) || 80;
                    const newHeight = Math.max(60, currentHeight - reductionPerTextarea);
                    textarea.style.height = newHeight + 'px';
                    textarea.style.minHeight = newHeight + 'px';
                    textarea.style.maxHeight = newHeight + 'px';
                    textarea.style.resize = 'none';
                });
            });
        }
    }

    // Restore original card visibility states
    cards.forEach((card, index) => {
        card.style.transform = originalStyles[index].transform;
        card.style.opacity = originalStyles[index].opacity;
    });
}
```

**Key features**:
- Identifies "busiest" card by measuring actual vertical height (accounts for 2-column desktop layout)
- All cards sized uniformly based on busiest card
- Textareas shrink proportionally if content doesn't fit
- 60px minimum textarea height
- Prevents scrolling within cards

---

### 7. Blur Overlay System

A separate blur overlay element is created outside the candidati-block stacking context to provide glassmorphic background effect.

```javascript
// Create blur overlay (outside stacking context)
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

// Sync overlay with most visible card
function syncBlurOverlay() {
    let mostVisibleCard = null;
    let maxOpacity = 0;

    cards.forEach(card => {
        const opacity = parseFloat(card.style.opacity) || 0;
        if (opacity > maxOpacity) {
            maxOpacity = opacity;
            mostVisibleCard = card;
        }
    });

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

**Why this approach**:
- candidati-block has `z-index: 1000`, creating isolated stacking context
- Cards inside this context cannot use `backdrop-filter` to blur video background (`z-index: -1`)
- Solution: Create overlay element at body level with `z-index: 999`
- Overlay positioned between video and cards, can access both layers
- Synchronized to match most visible card's position/size/opacity

**Call locations**:
- During card entrance animation (Phase 2)
- During card interaction phase/deadzone (Phase 3)
- On window resize

---

### 8. Navigation System

#### State Variable
```javascript
let currentCardIndex = 0; // Tracks visible card (0-4)
```

#### Update Button Visibility
```javascript
function updateNavigationButtons() {
    cards.forEach((card, index) => {
        const prevButton = card.querySelector('[data-direction="prev"]');
        const nextButton = card.querySelector('[data-direction="next"]');

        if (prevButton) {
            prevButton.style.display = (index === 0) ? 'none' : 'block';
        }
        if (nextButton) {
            nextButton.style.display = (index === totalCards - 1) ? 'none' : 'block';
        }
    });
}
```
**Logic**: Hide "prev" on first card, hide "next" on last card

#### Click Event Listeners
```javascript
cards.forEach((card, index) => {
    const prevButton = card.querySelector('[data-direction="prev"]');
    const nextButton = card.querySelector('[data-direction="next"]');

    if (prevButton) {
        prevButton.addEventListener('click', () => {
            if (currentCardIndex > 0) {
                currentCardIndex--;
                updateNavigationButtons();
            }
        });
    }

    if (nextButton) {
        nextButton.addEventListener('click', () => {
            if (currentCardIndex < totalCards - 1) {
                currentCardIndex++;
                updateNavigationButtons();
            }
        });
    }
});

// Initial button state
updateNavigationButtons();
```

---

### 6. State Object (Global)

```javascript
let candidatiCardState = null; // Initialized in init function

candidatiCardState = {
    candidatiTitle,              // DOM element
    submitButtonContainer,       // DOM element
    cards,                       // NodeList of 5 cards
    titleEntranceStart,          // Number (px)
    titleEntranceEnd,            // Number (px)
    cardEntranceStart,           // Number (px)
    cardEntranceEnd,             // Number (px)
    cardDeadzoneEnd,             // Number (px)
    totalCards,                  // Number (5)
    currentCardIndex,            // Number (0-4)
    calculateCardOffsets,        // Function reference
    updateNavigationButtons: () => updateNavigationButtons() // Function wrapper
};
```

---

### 7. Animation Update Function

#### Function Signature
```javascript
function updateCandidatiCardStack(scrollY, cardState) {
    // Called every scroll tick with current scroll position
}
```

#### Conditional Logging
```javascript
// Only log when in active range (reduce console spam)
if (scrollY >= cardState.titleEntranceStart && scrollY <= cardState.cardDeadzoneEnd) {
    console.log(`Candidati update called - DIRECT SCROLL CONTROL: scroll=${scrollY.toFixed(0)}px (range: ${cardState.titleEntranceStart}-${cardState.cardDeadzoneEnd})`);
}
```

#### Destructure State
```javascript
const {
    candidatiTitle,
    submitButtonContainer,
    cards,
    titleEntranceStart,
    titleEntranceEnd,
    cardEntranceStart,
    cardEntranceEnd,
    cardDeadzoneEnd,
    totalCards,
    calculateCardOffsets
} = cardState;
```

---

## Animation Phases (Detailed)

### PHASE 1: Title Entrance Animation

**Duration**: 50vh
**Range**: `titleEntranceStart` to `titleEntranceEnd`

#### Animation Spec
- **Direction**: Slides UP (from below viewport)
- **Start position**: `window.innerHeight + 100` px below viewport
- **End position**: `0` (translateY)
- **Opacity**: 0 → 1 (synchronized with movement)
- **Easing**: `sidebarEasing` (power 2.5 ease-out)

#### Implementation Code
```javascript
// Phase 1: Title entrance
if (scrollY >= titleEntranceStart && scrollY <= titleEntranceEnd) {
    // Calculate linear progress (0 to 1)
    const progress = (scrollY - titleEntranceStart) / (titleEntranceEnd - titleEntranceStart);

    // Apply easing
    const easedProgress = sidebarEasing(progress); // 1 - Math.pow(1 - progress, 2.5)

    // Calculate travel distance
    const titleTravelDistance = window.innerHeight + 100;

    // Calculate current position (distance * inverted progress)
    const translateY = titleTravelDistance * (1 - easedProgress);

    // Opacity follows same curve
    const opacity = easedProgress;

    // Apply to element
    candidatiTitle.style.transform = `translateX(-50%) translateY(${translateY}px)`;
    candidatiTitle.style.opacity = opacity;

    // Debug logging
    console.log(`SCROLL-CONTROLLED Title: scroll=${scrollY.toFixed(0)}px, progress=${(progress * 100).toFixed(1)}%, translateY=${translateY.toFixed(1)}px, opacity=${opacity.toFixed(2)}`);

} else if (scrollY < titleEntranceStart) {
    // Before entrance - hidden below viewport
    const hiddenPosition = window.innerHeight + 100;
    candidatiTitle.style.transform = `translateX(-50%) translateY(${hiddenPosition}px)`;
    candidatiTitle.style.opacity = '0';

} else if (scrollY > titleEntranceEnd) {
    // After entrance - locked at final position
    candidatiTitle.style.transform = 'translateX(-50%) translateY(0px)';
    candidatiTitle.style.opacity = '1';
}
```

**CRITICAL NOTE**: The `translateX(-50%)` in the transform is **NOT for centering the title**. The title is already centered via the parent flex container's `align-items: center`. The `translateX(-50%)` appears in the animation code but may be vestigial from an earlier implementation. **Verify actual positioning behavior** - the title likely doesn't need the `-50%` X translation at all since it's in natural flow.

---

### PHASE 2: Card Progressive Reveal

**Duration**: 150vh
**Range**: `cardEntranceStart` to `cardEntranceEnd`

#### Card Stack Positioning Setup
```javascript
const offsets = calculateCardOffsets(); // Currently {x: 0, y: 0}
const totalOffsetX = (totalCards - 1) * offsets.x; // 4 * 0 = 0
const totalOffsetY = (totalCards - 1) * offsets.y; // 4 * 0 = 0
const centerOffsetX = -totalOffsetX / 2; // 0
const centerOffsetY = -totalOffsetY / 2; // 0
```

**Purpose**: Centers the stack even when offsets are non-zero

#### Animation Spec (Per Card)
- **Direction**: Slides LEFT (from off-screen right)
- **Start position**: `translateX(100vw)` (off-screen right)
- **End position**: `translateX(0vw)` (centered)
- **Opacity**: 0 → 1 (synchronized)
- **Easing**: `sidebarEasing` (same as title)
- **Stagger**: Each card has overlapping entrance window

#### Stagger Timing
Each card has unique entrance window within 150vh:
- Card starts at: `index / totalCards` of total progress
- Card completes at: `(index + 1) / totalCards` of total progress

**Example** (5 cards):
- Card 0: 0% → 20% (0.0 → 0.2)
- Card 1: 20% → 40% (0.2 → 0.4)
- Card 2: 40% → 60% (0.4 → 0.6)
- Card 3: 60% → 80% (0.6 → 0.8)
- Card 4: 80% → 100% (0.8 → 1.0)

#### Implementation Code
```javascript
if (scrollY >= cardEntranceStart && scrollY <= cardEntranceEnd) {
    // Total progress through Phase 2 (0 to 1)
    const totalProgress = (scrollY - cardEntranceStart) / (cardEntranceEnd - cardEntranceStart);

    // Animate each card individually
    cards.forEach((card, index) => {
        // Calculate this card's entrance window
        const cardEntranceFraction = index / totalCards;
        const cardCompleteFraction = (index + 1) / totalCards;

        // Calculate individual card progress (0 to 1 within its window)
        let cardProgress = 0;
        if (totalProgress >= cardEntranceFraction) {
            if (totalProgress <= cardCompleteFraction) {
                const fractionRange = cardCompleteFraction - cardEntranceFraction;
                // Prevent division by zero (shouldn't happen with 5 cards)
                cardProgress = fractionRange > 0
                    ? (totalProgress - cardEntranceFraction) / fractionRange
                    : 1;
            } else {
                cardProgress = 1; // Card fully entered
            }
        }
        // else: cardProgress = 0 (card hasn't started)

        // Apply easing to card progress
        const easedCardProgress = sidebarEasing(cardProgress);

        // Calculate stack position for this card
        const cardOffsetX = centerOffsetX + (index * offsets.x); // Currently: 0 + 0 = 0
        const cardOffsetY = centerOffsetY + (index * offsets.y); // Currently: 0 + 0 = 0

        // Calculate animation offset (100vw → 0vw)
        const translateX = 100 * (1 - easedCardProgress);
        const opacity = easedCardProgress;

        // Apply transform: base position + stack offset + animation offset
        card.style.transform = `translate(calc(-50% + ${cardOffsetX}px), 0px) translateX(${translateX}vw)`;
        card.style.opacity = opacity;

        // Debug logging (only first card to reduce spam)
        if (index === 0) {
            console.log(`SCROLL-CONTROLLED Card[${index}]: scroll=${scrollY.toFixed(0)}px, progress=${(cardProgress * 100).toFixed(1)}%, translateX=${translateX.toFixed(1)}vw`);
        }

        // Update current card index when card is >50% visible
        if (cardProgress > 0.5 && index > cardState.currentCardIndex) {
            cardState.currentCardIndex = index;
            cardState.updateNavigationButtons();
        }
    });

    // Submit button appears with last card
    const submitStartFraction = Math.max(0.7, (totalCards - 1) / totalCards);
    // For 5 cards: Math.max(0.7, 4/5) = Math.max(0.7, 0.8) = 0.8

    let submitProgress = 0;
    if (totalProgress >= submitStartFraction) {
        submitProgress = (totalProgress - submitStartFraction) / (1 - submitStartFraction);
        submitProgress = Math.min(1, Math.max(0, submitProgress)); // Clamp 0-1
    }

    const easedSubmitProgress = contentEasing(submitProgress);
    const submitTranslateY = 100 * (1 - easedSubmitProgress); // 100px → 0px
    const submitOpacity = easedSubmitProgress;

    submitButtonContainer.style.transform = `translateX(-50%) translateY(${submitTranslateY}px)`;
    submitButtonContainer.style.opacity = submitOpacity;

} else if (scrollY < cardEntranceStart) {
    // Before Phase 2 - all cards hidden off-screen right
    cards.forEach((card, index) => {
        const cardOffsetX = centerOffsetX + (index * offsets.x);
        const cardOffsetY = centerOffsetY + (index * offsets.y);
        card.style.transform = `translate(calc(-50% + ${cardOffsetX}px), 0px) translateX(100vw)`;
        card.style.opacity = '0';
    });

    submitButtonContainer.style.transform = 'translateX(-50%) translateY(100px)';
    submitButtonContainer.style.opacity = '0';
}
```

#### Transform Breakdown
```javascript
card.style.transform = `translate(calc(-50% + ${cardOffsetX}px), 0px) translateX(${translateX}vw)`;
```

**Components**:
1. `translate(calc(-50% + ${cardOffsetX}px), 0px)`:
   - `-50%`: Horizontal centering (with `left: 50%` on card)
   - `+ ${cardOffsetX}px`: Stack offset for fanning (currently 0)
   - `, 0px`: Vertical position (no offset)

2. `translateX(${translateX}vw)`:
   - Animation offset for entrance (100vw → 0vw)
   - Separate transform for clean animation

---

### PHASE 3: Deadzone (Interaction Phase)

**Duration**: 200vh
**Range**: `cardEntranceEnd` to `cardDeadzoneEnd`

#### Purpose
- All cards fully visible and static
- User can interact with form fields
- Scroll position can optionally control current card index

#### Implementation Code
```javascript
else if (scrollY > cardEntranceEnd && scrollY <= cardDeadzoneEnd) {
    // Calculate progress within deadzone (0 to 1)
    const deadzoneProgress = (scrollY - cardEntranceEnd) / (cardDeadzoneEnd - cardEntranceEnd);

    // Map deadzone progress to card index (0-4)
    const targetCardIndex = Math.floor(deadzoneProgress * totalCards);

    // All cards at final position
    cards.forEach((card, index) => {
        const cardOffsetX = centerOffsetX + (index * offsets.x);
        const cardOffsetY = centerOffsetY + (index * offsets.y);
        card.style.transform = `translate(calc(-50% + ${cardOffsetX}px), 0px) translateX(0vw)`;
        card.style.opacity = '1';
    });

    // Update current card based on deadzone scroll position
    const newCardIndex = Math.min(Math.max(0, targetCardIndex), totalCards - 1);
    if (newCardIndex !== cardState.currentCardIndex) {
        cardState.currentCardIndex = newCardIndex;
        cardState.updateNavigationButtons();
    }

    // Submit button at final position
    submitButtonContainer.style.transform = 'translateX(-50%) translateY(0px)';
    submitButtonContainer.style.opacity = '1';
}
```

**Deadzone Card Navigation**:
- Scroll position maps to card index: `floor(progress * 5)` → 0, 1, 2, 3, or 4
- Updates navigation button visibility automatically
- Provides scroll-based card switching during interaction phase

---

## Integration Points

### 1. Initialization Call

**When**: After Lenis is initialized and ready
**Where**: Inside `loadContent()` function, Lenis ready callback

```javascript
// Inside loadContent() or similar
lenis.on('scroll', ({ scroll }) => {
    // ... other scroll handlers ...

    // Update candidati animations
    if (candidatiCardState) {
        updateCandidatiCardStack(scroll, candidatiCardState);
    }
});

// Initialize after DOM is ready and Lenis is set up
initCandidatiCardStack();
```

**Note**: Must be called AFTER elements exist in DOM

### 2. Main Update Loop

**When**: Every scroll tick
**Where**: Lenis scroll event handler OR main scroll handler

```javascript
// Called from main scroll handler
if (candidatiCardState) {
    updateCandidatiCardStack(scrollY, candidatiCardState);
}
```

**Frequency**: Every frame during scroll (decoupled system ensures performance)

### 3. Section Progress System

**Special handling** for candidati section in section progress calculation:

```javascript
// Inside section progress calculation
if (section.id === 'candidati') {
    // Linear progression from section start to where contatti transition begins
    const contattiTransitionStart = /* calculate */;
    const candidatiEffectiveEnd = Math.min(section.bottom, contattiTransitionStart);
    const candidatiEffectiveHeight = candidatiEffectiveEnd - section.top;

    if (candidatiEffectiveHeight > 0 && scrollY <= candidatiEffectiveEnd) {
        const effectiveProgressInSection = (scrollY - section.top) / candidatiEffectiveHeight;
        // ... use progress ...
    }
}
```

**Purpose**: Prevents candidati animations from conflicting with contatti section entrance

---

## Relative Positioning & Spacing Summary

### Section-Level Spacing
- **candidati-block**:
  - Top margin: `clamp(50px, 10vh, 100px)` - space after missione
  - Padding: `clamp(20px, 4vh, 40px)` top/sides, `clamp(10px, 2vh, 20px)` bottom
  - Flex container: `flex-direction: column`, `align-items: center`, `justify-content: flex-start`

### Title → Cards → Button Vertical Spacing
1. **Title**: Natural flow position within flex container (centered horizontally by flex)
   - Margin-bottom: `clamp(5px, 1vh, 10px)` - minimal space to cards

2. **Cards**: Absolutely positioned within `.card-deck-container`
   - No CSS-defined top/left offset (controlled entirely by JS)
   - Positioned relative to container via JS transform

3. **Submit Button**: Absolutely positioned
   - Bottom: `clamp(20px, 2vh, 30px)` from bottom of container
   - Left: `50%` with `translateX(-50%)` for centering
   - Initial hidden state: `translateY(100px)` down

**Relationship**: Title uses natural flow, cards use absolute positioning (JS-controlled), button anchored to bottom.

## Responsive Considerations

### Viewport-Relative Calculations
All scroll ranges use `window.innerHeight` for consistency:
- Title: 0.5vh
- Cards: 1.5vh
- Deadzone: 2.0vh

**Total**: 4.0 viewport heights

### Card Sizing
Cards auto-size based on viewport:
- **Mobile** (≤768px):
  - Width: `clamp(280px, 85vw, 350px)`
  - Padding: `clamp(15px, 4vw, 25px)`
- **Desktop** (>768px):
  - Width: `clamp(500px, 80vw, 1000px)`
  - Padding: `clamp(25px, 3vw, 40px)`

### Form Content Layout
- **Mobile**:
  - Single column (`flex-direction: column`)
  - Gap: `15px` between form groups
  - All form groups: `width: 100%`

- **Desktop**:
  - Two-column grid (`grid-template-columns: 1fr 1fr`)
  - Gap: `25px` (rows) × `30px` (columns)
  - Full-width elements (`.full-width`, `.form-info`): `grid-column: 1 / -1`

### Card Inner Vertical Spacing
- **Header**:
  - Padding-bottom: `clamp(15px, 2vh, 20px)`
  - Margin-bottom: `clamp(20px, 3vh, 30px)`

- **Content**:
  - Flex: `1` (grows to fill space)
  - Overflow-y: `auto` (scrollable if content exceeds card height)
  - Padding-right: `5px` (scrollbar space)

- **Navigation**:
  - Padding-top: `clamp(20px, 3vh, 30px)`
  - Margin-top: `clamp(15px, 2vh, 25px)`
  - Border-top separator

---

## State Boundaries & Edge Cases

### Before Section Start (`scrollY < titleEntranceStart`)
- Title: Hidden below viewport (`translateY = vh + 100`, opacity 0)
- Cards: Off-screen right (`translateX(100vw)`, opacity 0)
- Submit button: Hidden below (`translateY(100px)`, opacity 0)

### After Deadzone (`scrollY > cardDeadzoneEnd`)
**NO EXIT ANIMATION IN BACKUP** - Elements remain at final positions:
- Title: `translateY(0)`, opacity 1
- Cards: `translateX(0)`, opacity 1
- Submit button: `translateY(0)`, opacity 1

### Division by Zero Protection
```javascript
const fractionRange = cardCompleteFraction - cardEntranceFraction;
cardProgress = fractionRange > 0
    ? (totalProgress - cardEntranceFraction) / fractionRange
    : 1;
```

**When**: Last card or edge cases
**Solution**: Default to 1 if division would be by zero

### Progress Clamping
```javascript
submitProgress = Math.min(1, Math.max(0, submitProgress));
```

**Ensures**: Progress values always between 0 and 1

---

## Debugging & Logging

### Initialization Log
```javascript
console.log('Initializing candidati card stack system');
console.log('Candidati scroll ranges:', { /* ranges */ });
console.log('Candidati card stack initialized');
```

### Runtime Logging (Conditional)
```javascript
// Only log when in active scroll range
if (scrollY >= cardState.titleEntranceStart && scrollY <= cardState.cardDeadzoneEnd) {
    console.log(`Candidati update called - DIRECT SCROLL CONTROL: scroll=${scrollY.toFixed(0)}px`);
}

// Phase 1: Title animation
console.log(`SCROLL-CONTROLLED Title: scroll=${scrollY.toFixed(0)}px, progress=${(progress * 100).toFixed(1)}%, translateY=${translateY.toFixed(1)}px, opacity=${opacity.toFixed(2)}`);

// Phase 2: Card animation (first card only)
if (index === 0) {
    console.log(`SCROLL-CONTROLLED Card[${index}]: scroll=${scrollY.toFixed(0)}px, progress=${(cardProgress * 100).toFixed(1)}%, translateX=${translateX.toFixed(1)}vw`);
}
```

**Purpose**: Track scroll-animation correlation without console spam

---

## Critical Implementation Rules

### 1. Scroll Decoupling
✅ **DO**: Map scroll position directly to animation state
❌ **DON'T**: Use velocity, momentum, or time-based animations

### 2. Easing Application
✅ **DO**: Apply easing to progress, then calculate position
❌ **DON'T**: Apply easing to final values

```javascript
// CORRECT
const easedProgress = sidebarEasing(progress);
const translateY = distance * (1 - easedProgress);

// WRONG
const translateY = sidebarEasing(distance * (1 - progress));
```

### 3. Transform Composition
✅ **DO**: Use multiple transform functions in one property
❌ **DON'T**: Set transform multiple times

```javascript
// CORRECT
card.style.transform = `translate(calc(-50% + ${x}px), 0px) translateX(${tx}vw)`;

// WRONG
card.style.transform = `translate(-50%, 0)`;
card.style.transform += `translateX(${tx}vw)`; // Overwrites!
```

### 4. State Synchronization
✅ **DO**: Update `currentCardIndex` in state object
❌ **DON'T**: Use separate/conflicting state variables

### 5. DOM Queries
✅ **DO**: Cache all DOM references in state object
❌ **DON'T**: Query DOM every scroll tick

---

## What MUST Stay Identical

1. ✅ **Scroll-decoupled system** - Direct position → state mapping
2. ✅ **3-phase structure** - Title → Cards → Deadzone
3. ✅ **Easing functions** - `sidebarEasing` (2.5) and `contentEasing` (1.8)
4. ✅ **Card positioning math** - Centered with offset calculation
5. ✅ **Navigation system** - Button visibility + click handlers + auto-update
6. ✅ **Viewport-relative ranges** - 50vh, 150vh, 200vh
7. ✅ **Staggered card animations** - Overlapping entrance windows
8. ✅ **Submit button tied to last card** - Starts at 80% of Phase 2
9. ✅ **Card inner layout** - Header/content/navigation structure
10. ✅ **Form field styling** - Input/select/textarea styles
11. ✅ **Responsive breakpoint** - 768px mobile/desktop split

## What CAN Be Changed

1. 🔧 **Card entrance animation** - Currently left slide, can be bottom/fade/scale/etc.
2. 🔧 **Card styling** - Background color, border, shadows, opacity values
3. 🔧 **Offset values** - Currently 0,0 (can add stacking: x=10, y=5, etc.)
4. 🔧 **Phase durations** - Can adjust 50vh, 150vh, 200vh values
5. 🔧 **Easing powers** - Can tweak 2.5 and 1.8 exponents
6. 🔧 **Title animation** - Currently from bottom, can change direction
7. 🔧 **Submit button animation** - Currently rises from below, can vary
8. 🔧 **Card widths/padding** - Adjust clamp values for sizing
9. 🔧 **EXIT ANIMATIONS** - Not implemented in backup, can be added

---

## Complete Code Reference

### Init Function Structure
```javascript
function initCandidatiCardStack() {
    // 1. Query DOM elements
    // 2. Validate elements exist
    // 3. Define helper functions (calculateCardOffsets, etc.)
    // 4. Calculate scroll ranges
    // 5. Set up navigation state and listeners
    // 6. Create and store state object
    // 7. Log initialization
}
```

### Update Function Structure
```javascript
function updateCandidatiCardStack(scrollY, cardState) {
    // 1. Conditional logging (only in active range)
    // 2. Destructure state
    // 3. Define easing functions
    // 4. Phase 1: Title entrance (with before/after states)
    // 5. Calculate card positioning constants
    // 6. Phase 2: Card reveal (with before state + submit button)
    // 7. Phase 3: Deadzone (static cards + scroll navigation)
    // NO PHASE 4 (exit not implemented)
}
```

---

## Next Steps for Reconstruction

### 1. HTML Structure
- ✅ Check if card structure exists in current index.html
- ✅ Verify 5 cards with correct data-card attributes
- ✅ Ensure navigation buttons have data-direction attributes
- ✅ Confirm submit-button-container exists

### 2. CSS Setup
- ✅ Verify initial states (opacity: 0, transform: off-screen)
- ✅ Check responsive card sizing (mobile/desktop)
- ✅ Confirm card inner layout (header/content/navigation)
- ✅ Apply any new styling decisions

### 3. JavaScript Implementation
- ✅ Create `initCandidatiCardStack()` function
- ✅ Create `updateCandidatiCardStack(scrollY, cardState)` function
- ✅ Add initialization call after Lenis setup
- ✅ Add update call in scroll handler
- ✅ Test all 3 phases independently

### 4. Testing Checklist
- ✅ Title slides up smoothly from below
- ✅ Cards enter sequentially from right
- ✅ Submit button appears with last card
- ✅ Navigation buttons show/hide correctly
- ✅ Click navigation updates currentCardIndex
- ✅ Deadzone scroll changes current card
- ✅ All animations are scroll-position driven (not velocity)
- ✅ Responsive behavior works on mobile and desktop
- ✅ No console errors
- ✅ Performance is smooth (60fps)

---

## Implementation Priority

**HIGH PRIORITY** (Must implement exactly):
1. Scroll decoupling system
2. 3-phase animation structure
3. Staggered card timing
4. Navigation system
5. Card positioning math
6. Easing functions

**MEDIUM PRIORITY** (Can adapt):
1. Animation directions
2. Card styling
3. Phase durations
4. Stack offsets

**LOW PRIORITY** (Future work):
1. Exit animations (add later)
2. Additional interactions
3. Mobile gesture controls
4. Advanced stacking effects
