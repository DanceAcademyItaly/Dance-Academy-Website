# Candidati Section - Reconstruction Task Breakdown

## Overview
Rebuild the candidati section with scroll-decoupled card animations. Focus on clean implementation, independent card manipulation, proper spacing, and zero overlaps.

---

## Core Requirements (Non-Negotiable)

### Animation System
✅ **Scroll-decoupled**: Direct scroll position → animation state (no velocity/momentum)
✅ **3 phases**: Title entrance → Card progressive reveal → Deadzone (interaction)
✅ **Easing**: `sidebarEasing(t) = 1 - (1-t)^2.5` and `contentEasing(t) = 1 - (1-t)^1.8`
✅ **Staggered cards**: Overlapping entrance windows (card 0: 0→20%, card 1: 20→40%, etc.)
✅ **Navigation system**: Prev/next buttons, auto-visibility, scroll-based card switching
✅ **Submit button**: Appears at 80% of card entrance phase

### Positioning & Spacing
✅ **Cards from right to center**: Off-screen right → centered horizontally
✅ **No overlaps**: Title, cards, and button must never overlap vertically
✅ **Responsive**: Works on mobile (≤768px) and desktop (>768px)
✅ **Independent card control**: Easy to manipulate individual cards via transform

### Scroll Ranges (Viewport-Relative)
✅ **Title entrance**: 50vh (0.5 × window.innerHeight)
✅ **Card entrance**: 150vh (1.5 × window.innerHeight)
✅ **Deadzone**: 200vh (2.0 × window.innerHeight)
✅ **Total**: 400vh

---

## Technical Design Decisions

### 1. Title Animation Strategy
**Decision**: Remove redundant `translateX(-50%)`
- Title is in natural flow, centered by parent flex container
- Only animate `translateY()` from `window.innerHeight + 100` to `0`
- Start: `opacity: 0`, `transform: translateY(100vh + 100px)`
- End: `opacity: 1`, `transform: translateY(0)`

**Rationale**: Simpler, no unnecessary horizontal translation

---

### 2. Card Positioning Strategy
**Decision**: CSS base position + JS animation transform

**CSS**:
```css
.form-card {
    position: absolute;
    left: 50%;
    top: 50%; /* OR calculate specific top value in JS */
    /* No transform in CSS - JS controls it entirely */
}
```

**JS Transform Structure**:
```javascript
// Separate base centering from animation offset
card.style.transform = `translate(-50%, -50%) translateX(${animationOffsetVW}vw)`;

// Where animationOffsetVW:
// - Start (hidden): 100vw (off-screen right)
// - End (visible): 0vw (centered)
```

**Stack offset for future fanning** (optional, currently 0):
```javascript
const cardOffsetX = index * offsetValue; // e.g., index * 10 for 10px stacking
card.style.transform = `translate(calc(-50% + ${cardOffsetX}px), -50%) translateX(${animationOffsetVW}vw)`;
```

**Rationale**:
- `left: 50%` + `translate(-50%, ...)` centers horizontally
- Separate `translateX(vw)` animation is independent, easy to control per card
- Stack offset via `calc(-50% + Xpx)` allows fanning without breaking centering

---

### 3. Vertical Height & Spacing Strategy
**Challenge**: Cards are absolutely positioned → don't contribute to container height

**Decision**: Calculate required container height during initialization

**Approach**:
```javascript
// 1. Calculate tallest card height (during init, before fixing position)
let maxCardHeight = 0;
cards.forEach(card => {
    const cardHeight = card.offsetHeight;
    if (cardHeight > maxCardHeight) maxCardHeight = cardHeight;
});

// 2. Calculate required spacing
const titleHeight = candidatiTitle.offsetHeight;
const submitButtonHeight = submitButtonContainer.offsetHeight;
const verticalSpacing = 40; // Gap between elements

// 3. Set container min-height to prevent overlaps
const requiredHeight = titleHeight + verticalSpacing + maxCardHeight + verticalSpacing + submitButtonHeight;
cardDeckContainer.style.minHeight = requiredHeight + 'px';

// 4. Position cards vertically
const cardTopPosition = titleHeight + verticalSpacing;
cards.forEach(card => {
    card.style.top = cardTopPosition + 'px';
});
```

**Alternative (simpler)**: Set cards `top: 50%` and let them be vertically centered in viewport
- Requires setting `card-deck-container` min-height to something safe (e.g., `80vh`)
- Cards center themselves, title above, button below

**Rationale**: Guarantees no overlap, responsive, performant (calculates once during init)

---

### 4. Submit Button Positioning
**Decision**: Absolute positioning, bottom-anchored

**CSS**:
```css
.submit-button-container {
    position: absolute;
    bottom: 30px; /* Fixed distance from bottom */
    left: 50%;
    transform: translateX(-50%) translateY(100px); /* Initial hidden state */
}
```

**JS Animation**:
```javascript
// Y offset: 100px → 0px
submitButtonContainer.style.transform = `translateX(-50%) translateY(${offsetPx}px)`;
```

**Rationale**: Bottom-anchored ensures it never overlaps with cards, maintains fixed spacing

---

## Task Breakdown

### PHASE 1: HTML Structure Verification
**Goal**: Ensure all required elements exist with correct structure

#### Task 1.1: Verify Section Structure
- [ ] Check `.candidati-block` exists with correct classes
- [ ] Verify flex container properties (column, center-aligned)
- [ ] Check margin-top and padding values

#### Task 1.2: Verify Title Element
- [ ] `.candidati-title` exists as direct child of `.candidati-block`
- [ ] Contains text "Candidati"
- [ ] No position absolute/fixed in CSS
- [ ] Initial state: `opacity: 0`

#### Task 1.3: Verify Card Deck Container
- [ ] `.card-deck-container` exists
- [ ] Has `position: relative` for absolute children
- [ ] Contains form element with 5 cards

#### Task 1.4: Verify Card Structure (×5)
- [ ] Each `.form-card` has `data-card` attribute (0-4)
- [ ] Structure: `.card-header` → `.card-content` → `.card-navigation`
- [ ] Header contains `.card-title` (h3)
- [ ] Content contains form groups (check mobile/desktop grid)
- [ ] Navigation contains prev/next buttons with `data-direction="prev"` and `data-direction="next"`
- [ ] Verify special cases:
  - Card 2 (Profilo Artistico): Has `.full-width` form groups
  - Card 4 (Il Vostro Interesse): Has `.form-info` element

#### Task 1.5: Verify Submit Button
- [ ] `.submit-button-container` exists as direct child of `.candidati-block`
- [ ] Contains `<button type="submit" form="candidatiForm" class="submit-button">`
- [ ] Initial CSS state: `opacity: 0`, `transform: translateX(-50%) translateY(100px)`

**Output**: Document any missing/incorrect elements

---

### PHASE 2: CSS Setup & Refinement
**Goal**: Establish all base styling before JS takes over

#### Task 2.1: Section Container Styling
- [ ] Set `.candidati-block` properties:
  - `min-height: 100vh`
  - `margin-top: clamp(50px, 10vh, 100px)`
  - `padding: clamp(20px, 4vh, 40px) clamp(20px, 5vw, 40px) clamp(10px, 2vh, 20px)`
  - `display: flex; flex-direction: column; align-items: center; justify-content: flex-start`
  - `position: relative; overflow: hidden`

#### Task 2.2: Title Styling
- [ ] Set `.candidati-title` properties:
  - Font size, weight, letter-spacing, text-transform
  - `margin-bottom: clamp(5px, 1vh, 10px)`
  - `text-align: center`
  - Initial state: `opacity: 0` (no transform in CSS - JS handles)
  - `transition: opacity 0.6s ease` (transform transitions handled by direct manipulation)

#### Task 2.3: Card Deck Container
- [ ] Set `.card-deck-container`:
  - `position: relative`
  - `width: 100%`
  - NO fixed height (JS will calculate)

#### Task 2.4: Card Base Styling
- [ ] Set `.form-card`:
  - `position: absolute`
  - `left: 50%` (centering base)
  - `top: 50%` (vertical centering - OR calculated value)
  - Initial: `opacity: 0` (no transform in CSS)
  - Background, border, border-radius, box-shadow
  - `display: flex; flex-direction: column`
  - `overflow: hidden`
  - Mobile: `width: clamp(280px, 85vw, 350px)`, `padding: clamp(15px, 4vw, 25px)`
  - Desktop: `width: clamp(500px, 80vw, 1000px)`, `padding: clamp(25px, 3vw, 40px)`

#### Task 2.5: Card Inner Layout
- [ ] `.card-header`:
  - Border-bottom, padding-bottom, margin-bottom
- [ ] `.card-title`:
  - Font size, weight, letter-spacing, text-transform
  - `text-align: center; margin: 0`
- [ ] `.card-content`:
  - `flex: 1` (grows to fill space)
  - `overflow-y: auto; padding-right: 5px`
  - Mobile: `display: flex; flex-direction: column; gap: 15px`
  - Desktop: `display: grid; grid-template-columns: 1fr 1fr; gap: 25px 30px`
  - Desktop full-width: `.form-group.full-width, .form-info { grid-column: 1 / -1 }`
- [ ] `.card-navigation`:
  - Flex layout, border-top, padding-top, margin-top, gap

#### Task 2.6: Form Field Styling
- [ ] Input, select, textarea base styles (padding, background, border, font)
- [ ] Textarea heights (80px normal, 160px .tall)
- [ ] `.form-info` styling

#### Task 2.7: Submit Button Styling
- [ ] `.submit-button-container`:
  - `position: absolute; bottom: 30px; left: 50%`
  - Initial: `opacity: 0` (no transform in CSS)
- [ ] `.submit-button`:
  - Padding, background, border, font styles

**Output**: All CSS finalized before JS initialization

---

### PHASE 3: JavaScript - Initialization Function
**Goal**: Set up state object, calculate positioning, attach event listeners

#### Task 3.1: DOM Element Queries
```javascript
function initCandidatiCardStack() {
    // Query elements
    const candidatiSection = document.querySelector('.candidati-block');
    const candidatiTitle = candidatiSection?.querySelector('.candidati-title');
    const cards = candidatiSection?.querySelectorAll('.form-card');
    const submitButtonContainer = candidatiSection?.querySelector('.submit-button-container');
    const cardDeckContainer = candidatiSection?.querySelector('.card-deck-container');

    // Validate
    if (!candidatiSection || !candidatiTitle || !cards || cards.length !== 5 || !submitButtonContainer || !cardDeckContainer) {
        console.error('Candidati elements not found or incorrect count');
        return;
    }
```

#### Task 3.2: Calculate Vertical Spacing & Heights
```javascript
    // Measure elements BEFORE positioning (while in natural flow)
    const titleHeight = candidatiTitle.offsetHeight;
    const submitButtonHeight = submitButtonContainer.offsetHeight;

    // Find tallest card
    let maxCardHeight = 0;
    cards.forEach(card => {
        const height = card.offsetHeight;
        if (height > maxCardHeight) maxCardHeight = height;
    });

    // Define spacing
    const verticalSpacing = 40; // px between elements

    // Calculate card top position
    const cardTopPosition = titleHeight + verticalSpacing;

    // Set container min-height to prevent overlaps
    const requiredContainerHeight = titleHeight + verticalSpacing + maxCardHeight + verticalSpacing + submitButtonHeight + 60; // Extra bottom space
    cardDeckContainer.style.minHeight = requiredContainerHeight + 'px';

    console.log('Candidati vertical spacing:', {
        titleHeight,
        maxCardHeight,
        submitButtonHeight,
        cardTopPosition,
        requiredContainerHeight
    });
```

#### Task 3.3: Initialize Card Positions
```javascript
    // Set initial card positions (hidden off-screen right)
    cards.forEach((card, index) => {
        // Base positioning
        card.style.left = '50%';
        card.style.top = cardTopPosition + 'px';

        // Initial state: hidden off-screen right
        card.style.transform = 'translate(-50%, 0) translateX(100vw)';
        card.style.opacity = '0';

        // Store index for navigation
        card.dataset.cardIndex = index;
    });
```

#### Task 3.4: Initialize Title Position
```javascript
    // Set title initial state (hidden below viewport)
    const titleHiddenY = window.innerHeight + 100;
    candidatiTitle.style.transform = `translateY(${titleHiddenY}px)`;
    candidatiTitle.style.opacity = '0';
```

#### Task 3.5: Initialize Submit Button Position
```javascript
    // Set submit button initial state (hidden below)
    submitButtonContainer.style.transform = 'translateX(-50%) translateY(100px)';
    submitButtonContainer.style.opacity = '0';
```

#### Task 3.6: Calculate Scroll Ranges
```javascript
    const totalCards = cards.length; // 5

    // Get section start position
    const candidatiBlockTop = candidatiSection.getBoundingClientRect().top + window.scrollY;

    // Phase 1: Title entrance (50vh)
    const titleEntranceStart = candidatiBlockTop;
    const titleEntranceEnd = titleEntranceStart + window.innerHeight * 0.5;

    // Phase 2: Card entrance (150vh - starts after title)
    const cardEntranceStart = titleEntranceEnd;
    const cardEntranceDuration = window.innerHeight * 1.5;
    const cardEntranceEnd = cardEntranceStart + cardEntranceDuration;

    // Phase 3: Deadzone (200vh)
    const cardDeadzoneDuration = window.innerHeight * 2;
    const cardDeadzoneEnd = cardEntranceEnd + cardDeadzoneDuration;

    console.log('Candidati scroll ranges:', {
        titleEntranceStart,
        titleEntranceEnd,
        cardEntranceStart,
        cardEntranceEnd,
        cardDeadzoneEnd,
        totalScrollRange: cardDeadzoneEnd - titleEntranceStart
    });
```

#### Task 3.7: Define Helper Functions
```javascript
    // Calculate card offsets for stacking/fanning (currently disabled)
    function calculateCardOffsets() {
        return { x: 0, y: 0 }; // No offset = perfect stack
        // Future: return { x: 10, y: 5 }; for fanning effect
    }

    // Easing functions
    const sidebarEasing = t => 1 - Math.pow(1 - t, 2.5);
    const contentEasing = t => 1 - Math.pow(1 - t, 1.8);
```

#### Task 3.8: Navigation Button Setup
```javascript
    // Navigation state
    let currentCardIndex = 0;

    // Update button visibility based on current card
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

    // Attach click listeners
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

    // Initialize button visibility
    updateNavigationButtons();
```

#### Task 3.9: Create State Object
```javascript
    // Store state globally for update function
    candidatiCardState = {
        candidatiTitle,
        submitButtonContainer,
        cards,
        cardDeckContainer,
        titleEntranceStart,
        titleEntranceEnd,
        cardEntranceStart,
        cardEntranceEnd,
        cardDeadzoneEnd,
        totalCards,
        currentCardIndex,
        calculateCardOffsets,
        updateNavigationButtons,
        sidebarEasing,
        contentEasing,
        titleHiddenY,
        cardTopPosition
    };

    console.log('Candidati card stack initialized');
}
```

**Output**: Complete `initCandidatiCardStack()` function

---

### PHASE 4: JavaScript - Update/Animation Function
**Goal**: Handle scroll-driven animations for all 3 phases

#### Task 4.1: Function Structure & State Extraction
```javascript
function updateCandidatiCardStack(scrollY, cardState) {
    // Conditional logging (only in active range)
    if (scrollY >= cardState.titleEntranceStart && scrollY <= cardState.cardDeadzoneEnd) {
        console.log(`Candidati update: scroll=${scrollY.toFixed(0)}px`);
    }

    // Destructure state
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
        calculateCardOffsets,
        sidebarEasing,
        contentEasing,
        titleHiddenY,
        cardTopPosition
    } = cardState;
```

#### Task 4.2: Phase 1 - Title Entrance Animation
```javascript
    // PHASE 1: Title entrance (50vh)
    if (scrollY >= titleEntranceStart && scrollY <= titleEntranceEnd) {
        // Linear progress (0 to 1)
        const progress = (scrollY - titleEntranceStart) / (titleEntranceEnd - titleEntranceStart);

        // Apply easing
        const easedProgress = sidebarEasing(progress);

        // Calculate Y position (viewport height + 100 → 0)
        const translateY = titleHiddenY * (1 - easedProgress);

        // Opacity follows same curve
        const opacity = easedProgress;

        // Apply to element (NO translateX)
        candidatiTitle.style.transform = `translateY(${translateY}px)`;
        candidatiTitle.style.opacity = opacity;

    } else if (scrollY < titleEntranceStart) {
        // Before entrance - hidden below
        candidatiTitle.style.transform = `translateY(${titleHiddenY}px)`;
        candidatiTitle.style.opacity = '0';

    } else if (scrollY > titleEntranceEnd) {
        // After entrance - locked at final position
        candidatiTitle.style.transform = 'translateY(0px)';
        candidatiTitle.style.opacity = '1';
    }
```

#### Task 4.3: Phase 2 - Card Progressive Reveal
```javascript
    // Calculate stack offsets for all cards
    const offsets = calculateCardOffsets(); // Currently {x: 0, y: 0}
    const totalOffsetX = (totalCards - 1) * offsets.x;
    const centerOffsetX = -totalOffsetX / 2;

    // PHASE 2: Card entrance (150vh)
    if (scrollY >= cardEntranceStart && scrollY <= cardEntranceEnd) {
        // Total progress through phase (0 to 1)
        const totalProgress = (scrollY - cardEntranceStart) / (cardEntranceEnd - cardEntranceStart);

        // Animate each card with staggered timing
        cards.forEach((card, index) => {
            // Calculate this card's entrance window
            const cardEntranceFraction = index / totalCards;
            const cardCompleteFraction = (index + 1) / totalCards;

            // Calculate individual card progress (0 to 1 within its window)
            let cardProgress = 0;
            if (totalProgress >= cardEntranceFraction) {
                if (totalProgress <= cardCompleteFraction) {
                    const fractionRange = cardCompleteFraction - cardEntranceFraction;
                    cardProgress = fractionRange > 0
                        ? (totalProgress - cardEntranceFraction) / fractionRange
                        : 1;
                } else {
                    cardProgress = 1; // Fully entered
                }
            }

            // Apply easing
            const easedCardProgress = sidebarEasing(cardProgress);

            // Calculate stack offset for this card
            const cardOffsetX = centerOffsetX + (index * offsets.x);

            // Calculate animation offset (100vw → 0vw)
            const translateXVw = 100 * (1 - easedCardProgress);
            const opacity = easedCardProgress;

            // Apply transform: base centering + stack offset + animation
            card.style.transform = `translate(calc(-50% + ${cardOffsetX}px), 0) translateX(${translateXVw}vw)`;
            card.style.opacity = opacity;

            // Update current card index when card is >50% visible
            if (cardProgress > 0.5 && index > cardState.currentCardIndex) {
                cardState.currentCardIndex = index;
                cardState.updateNavigationButtons();
            }
        });

        // Submit button animation (starts at 80% of phase)
        const submitStartFraction = Math.max(0.7, (totalCards - 1) / totalCards); // 0.8 for 5 cards

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
        // Before phase 2 - all cards hidden off-screen right
        cards.forEach((card, index) => {
            const cardOffsetX = centerOffsetX + (index * offsets.x);
            card.style.transform = `translate(calc(-50% + ${cardOffsetX}px), 0) translateX(100vw)`;
            card.style.opacity = '0';
        });

        submitButtonContainer.style.transform = 'translateX(-50%) translateY(100px)';
        submitButtonContainer.style.opacity = '0';
    }
```

#### Task 4.4: Phase 3 - Deadzone (Interaction)
```javascript
    else if (scrollY > cardEntranceEnd && scrollY <= cardDeadzoneEnd) {
        // PHASE 3: Deadzone - all cards fully visible and interactive

        // Calculate progress within deadzone (0 to 1)
        const deadzoneProgress = (scrollY - cardEntranceEnd) / (cardDeadzoneEnd - cardEntranceEnd);

        // Map scroll position to card index (0-4)
        const targetCardIndex = Math.floor(deadzoneProgress * totalCards);

        // All cards at final position
        cards.forEach((card, index) => {
            const cardOffsetX = centerOffsetX + (index * offsets.x);
            card.style.transform = `translate(calc(-50% + ${cardOffsetX}px), 0) translateX(0vw)`;
            card.style.opacity = '1';
        });

        // Update current card based on scroll position in deadzone
        const newCardIndex = Math.min(Math.max(0, targetCardIndex), totalCards - 1);
        if (newCardIndex !== cardState.currentCardIndex) {
            cardState.currentCardIndex = newCardIndex;
            cardState.updateNavigationButtons();
        }

        // Submit button at final position
        submitButtonContainer.style.transform = 'translateX(-50%) translateY(0px)';
        submitButtonContainer.style.opacity = '1';
    }
}
```

**Output**: Complete `updateCandidatiCardStack(scrollY, cardState)` function

---

### PHASE 5: Integration & Initialization Call
**Goal**: Connect candidati system to main scroll handler

#### Task 5.1: Add Global State Variable
```javascript
// At top of file with other animation states
let candidatiCardState = null;
```

#### Task 5.2: Call Init Function
```javascript
// Inside loadContent() or similar, after Lenis is ready
// Place AFTER initMissioneAnimations() or similar
initCandidatiCardStack();
```

#### Task 5.3: Add Update Call to Scroll Handler
```javascript
// Inside Lenis scroll event or main scroll handler
lenis.on('scroll', ({ scroll }) => {
    const scrollY = scroll;

    // ... other scroll handlers (hero, missione, episodi, etc.) ...

    // Update candidati animations
    if (candidatiCardState) {
        updateCandidatiCardStack(scrollY, candidatiCardState);
    }
});
```

**Output**: Candidati system fully integrated into scroll system

---

### PHASE 6: Testing & Refinement
**Goal**: Verify all functionality, fix edge cases, optimize

#### Task 6.1: Basic Animation Testing
- [ ] Title slides up smoothly from below viewport (0 to 50vh scroll)
- [ ] Cards enter sequentially from right (50vh to 200vh scroll)
- [ ] Card 0 enters first, card 4 enters last
- [ ] Submit button appears with last card (at ~180vh scroll)
- [ ] All animations are smooth and eased
- [ ] No jank or visual glitches

#### Task 6.2: Deadzone Testing
- [ ] All cards fully visible and static (200vh to 400vh scroll)
- [ ] Form fields are interactive and usable
- [ ] Scrolling within deadzone changes current card index
- [ ] Navigation buttons update correctly

#### Task 6.3: Navigation Button Testing
- [ ] First card (card 0): "prev" hidden, "next" visible
- [ ] Middle cards: Both buttons visible
- [ ] Last card (card 4): "prev" visible, "next" hidden
- [ ] Clicking "prev" decrements currentCardIndex
- [ ] Clicking "next" increments currentCardIndex
- [ ] Buttons update when scrolling through deadzone

#### Task 6.4: Spacing & Overlap Testing
- [ ] Title never overlaps with cards
- [ ] Cards never overlap with submit button
- [ ] Vertical spacing looks balanced on desktop
- [ ] Vertical spacing looks balanced on mobile

#### Task 6.5: Responsive Testing
**Desktop (>768px)**:
- [ ] Cards width: 500-1000px (80vw clamped)
- [ ] Card content: Two-column grid (25px × 30px gap)
- [ ] Full-width elements span both columns
- [ ] All animations work correctly

**Mobile (≤768px)**:
- [ ] Cards width: 280-350px (85vw clamped)
- [ ] Card content: Single column (15px gap)
- [ ] All animations work correctly
- [ ] Text is readable, fields are usable

#### Task 6.6: Edge Case Testing
- [ ] Fast scrolling: Animations catch up correctly
- [ ] Scrolling backwards: Animations reverse correctly
- [ ] Window resize: Layout recalculates if needed
- [ ] Before section start: All elements hidden
- [ ] After deadzone: All elements remain visible (no exit animation)

#### Task 6.7: Performance Testing
- [ ] Smooth 60fps during scroll (check DevTools performance)
- [ ] No unnecessary reflows/repaints
- [ ] Console logs only appear in active scroll range
- [ ] No memory leaks on repeated scrolling

#### Task 6.8: Code Cleanup
- [ ] Remove any debug console.logs (keep only essential ones)
- [ ] Ensure consistent code style
- [ ] Add comments for complex calculations
- [ ] Verify no unused variables or functions

**Output**: Fully functional, tested, and optimized candidati section

---

## Implementation Order Summary

1. ✅ Verify HTML structure (Phase 1)
2. ✅ Set up CSS base styles (Phase 2)
3. ✅ Write `initCandidatiCardStack()` function (Phase 3)
4. ✅ Write `updateCandidatiCardStack()` function (Phase 4)
5. ✅ Integrate into main scroll system (Phase 5)
6. ✅ Test and refine (Phase 6)

---

## Key Files to Modify

- **index.html**: Verify/fix candidati section HTML structure
- **dance-academy.js**: Add init and update functions, integrate with scroll handler
- **(Optional) Create separate file**: `candidati-animations.js` for modularity

---

## Questions to Resolve During Implementation

### During Phase 3 (Init):
- [ ] Should cards have fixed `top` value or percentage-based?
  - **Proposal**: Fixed pixel value calculated from title height + spacing
  - Ensures consistent vertical position, easy to reason about

- [ ] Should we add resize handler to recalculate heights?
  - **Proposal**: Yes, debounced resize handler (only if viewport width changes significantly)
  - Ensures responsive behavior on device rotation

### During Phase 4 (Update):
- [ ] Should we throttle/debounce the update function?
  - **Proposal**: No throttling - direct scroll updates are core to decoupled system
  - Performance should be fine with direct style updates (no layout thrashing)

### During Phase 6 (Testing):
- [ ] Do we need to add special handling for section progress system?
  - **Proposal**: Check if candidati interferes with contatti section entrance
  - May need special handling like backup JS had

---

## Success Criteria

### Functional
✅ All 3 animation phases work correctly
✅ Cards animate from right to center
✅ Navigation buttons work (click and scroll-based)
✅ Submit button appears with last card
✅ Deadzone allows form interaction
✅ No overlaps between title/cards/button
✅ Responsive on mobile and desktop

### Technical
✅ Scroll-decoupled (position-based, not velocity-based)
✅ Smooth 60fps performance
✅ Clean, maintainable code
✅ Easy to manipulate individual cards
✅ Proper easing functions applied

### User Experience
✅ Animations feel smooth and intentional
✅ Form is fully usable during deadzone
✅ Visual hierarchy is clear (title → cards → button)
✅ No visual glitches or jank

---

## Notes for Implementation

### Performance Considerations
- Cache all DOM queries in state object (done in init)
- Use direct style manipulation (fastest)
- Avoid layout-triggering operations in update loop
- Only log to console when in active scroll range

### Debugging Tips
- Use `console.log` with scroll position and animation values
- Check transform values in DevTools during scroll
- Verify scroll ranges are calculated correctly (log them during init)
- Test with slow scroll and fast scroll
- Test scroll in both directions

### Common Pitfalls to Avoid
- ❌ Don't use `+=` on transform strings (overwrites, doesn't append)
- ❌ Don't query DOM in update function (use cached references)
- ❌ Don't apply easing to final values (apply to progress, then calculate values)
- ❌ Don't forget to clamp progress values (0-1 range)
- ❌ Don't use `position: fixed` on cards (breaks with container positioning)

### Future Enhancements (Post-Implementation)
- [ ] Add exit animations (Phase 4)
- [ ] Add card stacking/fanning effect (change offsets from 0,0)
- [ ] Add different entrance animations (scale, fade, rotate, etc.)
- [ ] Add mobile swipe gestures for card navigation
- [ ] Add keyboard navigation (arrow keys)
- [ ] Add form validation states
- [ ] Add progress indicator (e.g., "Card 1 of 5")
