/**
 * @file candidates.js
 * @description Candidati section - card stack animation system
 *
 * Handles:
 * - 4-phase animation (title entrance, card progressive reveal, deadzone, exit)
 * - 5-card stack with progressive reveal
 * - Dynamic card height calculations
 * - Form card navigation (AVANTI/INDIETRO buttons)
 * - Card fade-out system for progressive visibility
 * - Background overlay and video effects
 * - Responsive card sizing
 * - Integration with form-handler.js
 */

import { getState, updateState } from './state.js';
import { SCROLL, BREAKPOINTS } from './config.js';
import { registerSection, setActiveSection, applyVideoState } from './navigation.js';

// ============================================
// MODULE STATE
// ============================================

/**
 * Candidati card stack animation state
 * Contains all card state, scroll ranges, and helper functions
 */
let candidatiCardState = null;

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize candidati card stack system
 * Creates fixed-position cards with 4-phase scroll-driven animations
 * @returns {number} bufferEnd - Scroll position where candidati ends
 */
export function initCandidatiCardStack() {
    // NEW STRUCTURE: Select independent fixed elements (no parent container)
    const candidatiSpacer = document.querySelector('.candidati-spacer');
    const candidatiTitleWrapper = document.querySelector('.candidati-title-wrapper');
    const candidatiTitle = candidatiTitleWrapper?.querySelector('.candidati-title');
    const cardWrappers = Array.from(document.querySelectorAll('.candidati-card-wrapper'));
    const cards = Array.from(document.querySelectorAll('.candidati-card-wrapper .form-card'));
    const submitButtonContainer = document.querySelector('.submit-button-container');

    if (!candidatiSpacer || !candidatiTitleWrapper || !candidatiTitle || !cardWrappers || cardWrappers.length !== 5 || !cards || cards.length !== 5 || !submitButtonContainer) {
        return;
    }

    const totalCards = cards.length;

    const spacerRect = candidatiSpacer.getBoundingClientRect();
    const spacerTop = spacerRect.top + window.scrollY;

    // Elements are already fixed via CSS - no positioning setup needed
    const topPosition = 60; // Fixed top position defined in CSS

    let titleEntranceStartBase;

    const missioneAnimationState = getState('animations.missione');
    if (missioneAnimationState && missioneAnimationState.bufferEnd) {
        // Missione exists - start after its buffer zone
        titleEntranceStartBase = missioneAnimationState.bufferEnd;
    } else {
        titleEntranceStartBase = candidatiSpacer.offsetTop;
    }

    const titleEntranceStart = titleEntranceStartBase;
    const viewportHeight = window.innerHeight;

    const titleEntranceDuration = 0.5 * viewportHeight;
    const titleEntranceEnd = titleEntranceStart + titleEntranceDuration;

    const cardEntranceStart = titleEntranceEnd;
    const cardEntranceDuration = 3.5 * viewportHeight;
    const cardEntranceEnd = cardEntranceStart + cardEntranceDuration;

    const cardDeadzoneDuration = 0 * viewportHeight;
    const cardDeadzoneEnd = cardEntranceEnd + cardDeadzoneDuration;

    const exitAnimationDuration = 1.0 * viewportHeight;
    const exitAnimationStart = cardDeadzoneEnd;
    const exitAnimationEnd = exitAnimationStart + exitAnimationDuration;

    const bufferDuration = SCROLL.sectionBufferVH * viewportHeight;
    // CRITICAL: Round DOWN to ensure browser can actually scroll to this position
    const bufferEnd = Math.floor(exitAnimationEnd + bufferDuration);

    // CRITICAL: Use spacer's actual document position (offsetTop), not titleEntranceStart (scroll position)
    // to ensure contatti-block aligns with bufferEnd scroll position
    // TIMING FIX: Delay reading offsetTop to ensure previous sections have fully laid out
    let spacerDocumentTop = candidatiSpacer.offsetTop;
    let totalScrollRange = bufferEnd - spacerDocumentTop;

    function setSpacerHeight() {
        spacerDocumentTop = candidatiSpacer.offsetTop;
        // CRITICAL: Round DOWN to ensure clean pixel boundaries
        totalScrollRange = Math.floor(bufferEnd - spacerDocumentTop);
        candidatiSpacer.style.height = totalScrollRange + 'px';
    }

    // Call immediately for initial setup
    setSpacerHeight();

    // Also call after layout settles to fix any timing issues
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            setSpacerHeight();
        });
    });

    setTimeout(() => {
        setSpacerHeight();
    }, 100);

    let backgroundOverlay = document.querySelector('.candidati-background-overlay');
    if (!backgroundOverlay) {
        backgroundOverlay = document.createElement('div');
        backgroundOverlay.className = 'candidati-background-overlay';
        backgroundOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 1);
            opacity: 0;
            pointer-events: none;
            z-index: 99;
        `;
        document.body.appendChild(backgroundOverlay);
    }

    // Function to calculate and set card heights dynamically
    // NEW: Cards are independent fixed elements, no container
    function calculateAndSetCardHeight() {
        const viewportHeight = window.innerHeight;
        const fixedTopPosition = 60; // All elements fixed at top: 60px

        // Title dimensions
        const titleHeight = candidatiTitle.offsetHeight;
        const titleComputedStyle = window.getComputedStyle(candidatiTitle);
        const titleMarginBottom = parseFloat(titleComputedStyle.marginBottom) || 0;

        // Submit button dimensions
        let submitButtonHeight = 0;
        let submitButtonBottomMargin = 0;
        let submitButtonTopGap = 0;
        if (submitButtonContainer) {
            submitButtonHeight = submitButtonContainer.offsetHeight;
            submitButtonBottomMargin = viewportHeight * 0.05; // 5vh
            submitButtonTopGap = Math.max(10, viewportHeight * 0.015); // Min 10px, ~1.5vh gap above button
        }

        // From: title bottom to: submit button top (with gap)
        const cardAreaStartY = fixedTopPosition + titleHeight + titleMarginBottom;
        const cardAreaEndY = viewportHeight - submitButtonHeight - submitButtonBottomMargin - submitButtonTopGap;
        const availableHeight = cardAreaEndY - cardAreaStartY;

        // CSS min-height: 400px will apply when there IS space, but we prioritize fitting
        const finalCardHeight = Math.max(300, availableHeight); // Absolute minimum 300px for usability

        // Wrappers are the fixed positioned elements with glassmorphism
        cardWrappers.forEach(wrapper => {
            wrapper.style.top = cardAreaStartY + 'px';
            wrapper.style.height = finalCardHeight + 'px'; // Constrain wrapper height to available space
        });

        cards.forEach(card => {
            card.style.height = finalCardHeight + 'px';
        });

        return { cardHeight: finalCardHeight };
    }

    // Function to optimize card internal sizing to fit without scrolling
    function optimizeCardInternalSizing(cardHeight) {
        // Cards are always in layout (position: relative), no need to toggle visibility

        // Measure each card's natural content height
        const cardMeasurements = [];
        cards.forEach((card, index) => {
            const header = card.querySelector('.card-header');
            const content = card.querySelector('.card-content');
            const navigation = card.querySelector('.card-navigation');

            const headerHeight = header.offsetHeight;
            const navigationHeight = navigation.offsetHeight;
            const contentHeight = content.scrollHeight; // Natural content height

            const totalNaturalHeight = headerHeight + contentHeight + navigationHeight;

            cardMeasurements.push({
                index,
                card,
                content,
                headerHeight,
                navigationHeight,
                contentHeight,
                totalNaturalHeight,
                formGroups: content.querySelectorAll('.form-group').length,
                textareas: content.querySelectorAll('textarea').length,
                inputs: content.querySelectorAll('input, select').length
            });
        });

        // Find busiest card (tallest natural content height)
        const busiestCard = cardMeasurements.reduce((max, current) =>
            current.totalNaturalHeight > max.totalNaturalHeight ? current : max
        );

        const availableContentHeight = cardHeight - busiestCard.headerHeight - busiestCard.navigationHeight;

        if (busiestCard.contentHeight > availableContentHeight) {
            const excessHeight = busiestCard.contentHeight - availableContentHeight;
            const textareasInBusiestCard = busiestCard.content.querySelectorAll('textarea');

            if (textareasInBusiestCard.length > 0) {
                // Distribute height reduction across all textareas
                const reductionPerTextarea = excessHeight / textareasInBusiestCard.length;

                cards.forEach(card => {
                    card.querySelectorAll('textarea').forEach(textarea => {
                        const currentHeight = parseFloat(window.getComputedStyle(textarea).height) || 80;
                        const newHeight = Math.max(60, currentHeight - reductionPerTextarea); // Min 60px
                        textarea.style.height = newHeight + 'px';
                        textarea.style.minHeight = newHeight + 'px';
                        textarea.style.maxHeight = newHeight + 'px';
                        textarea.style.resize = 'none'; // Prevent manual resizing
                    });
                });
            }
        }
    }

    const { cardHeight } = calculateAndSetCardHeight();

    // Optimize card internal sizing to fit without scrolling
    optimizeCardInternalSizing(cardHeight);

    // Initialize card WRAPPER positions (hidden off-screen right)
    // Wrappers are position: fixed, cards inside are position: relative
    cardWrappers.forEach((wrapper, index) => {
        wrapper.style.transform = 'translate(-50%, 0) translateX(100vw)';
        wrapper.style.opacity = '0';
        wrapper.dataset.cardIndex = index;
    });

    // Initialize title wrapper (hidden below viewport)
    const titleHiddenY = window.innerHeight + 100;
    candidatiTitleWrapper.style.transform = `translate(-50%, ${titleHiddenY}px)`;
    candidatiTitleWrapper.style.opacity = '0';

    // Initialize submit button (fixed at bottom, just hidden)
    if (submitButtonContainer) {
        submitButtonContainer.style.transform = 'translateX(-50%)';
        submitButtonContainer.style.opacity = '0';
    }

    // Helper functions
    function calculateCardOffsets() {
        return { x: 0, y: 0 };
    }

    // Inverted episodi lateral motion curve (episodi exits with t^1.25, cards enter with 1-(1-t)^1.25)
    const sidebarEasing = t => 1 - Math.pow(1 - t, 1.25);
    const contentEasing = t => 1 - Math.pow(1 - t, 1.8);

    // Helper function to generate card shadow with opacity
    function generateCardShadow(opacity) {
        return `
            0 8px 24px rgba(0, 0, 0, ${0.4 * opacity}),
            0 5px 12px rgba(0, 0, 0, ${0.3 * opacity}),
            0 3px 6px rgba(0, 0, 0, ${0.25 * opacity}),
            0 1px 3px rgba(0, 0, 0, ${0.2 * opacity}),
            inset 0 -1px 0 rgba(0, 0, 0, ${0.4 * opacity})
        `;
    }

    // Card fade-out configuration - tunable system for progressive card disappearance
    // HOW IT WORKS: Card N fades out while card N+fadeOffset is entering
    // EXAMPLE: With fadeOffset=2, card 0 fades while card 2 enters, card 1 fades while card 3 enters, etc.
    const cardFadeOutConfig = {
        enabled: true,
        // How many cards ahead triggers the fade-out (2 = card N fades when card N+2 enters)
        fadeOffset: 2,
        // Progress range of trigger card during which the fade occurs
        fadeStartThreshold: 0.0,  // Fade starts when trigger card is at 0% of its entrance
        fadeEndThreshold: 1.0,    // Fade completes when trigger card is at 100% of its entrance
        // Easing function for the fade (t = 0 to 1, where 0 = full opacity, 1 = min opacity)
        fadeEasing: (t) => t,
        // Minimum opacity for faded cards (0 = fully transparent, 0.1 = slightly visible)
        minOpacity: 0,
        // Whether to also fade the card's shadow (true = shadow fades with card)
        fadeShadow: true
    };

    // Helper function to calculate fade-out multiplier for a card based on overall entrance progress
    // This multiplier persists across all phases (entrance, deadzone, exit)
    // Returns 1.0 (no fade) to minOpacity (fully faded)
    function calculateCardFadeOutMultiplier(cardIndex, totalProgress) {
        if (!cardFadeOutConfig.enabled) return 1.0;

        const triggerCardIndex = cardIndex + cardFadeOutConfig.fadeOffset;

        if (triggerCardIndex >= totalCards) return 1.0;

        const triggerCardEntranceFraction = triggerCardIndex / totalCards;
        const triggerCardCompleteFraction = (triggerCardIndex + 1) / totalCards;

        let triggerCardProgress = 0;
        if (totalProgress >= triggerCardEntranceFraction) {
            if (totalProgress <= triggerCardCompleteFraction) {
                const fractionRange = triggerCardCompleteFraction - triggerCardEntranceFraction;
                triggerCardProgress = fractionRange > 0 ? (totalProgress - triggerCardEntranceFraction) / fractionRange : 1;
            } else {
                triggerCardProgress = 1;
            }
        }

        if (triggerCardProgress >= cardFadeOutConfig.fadeStartThreshold &&
            triggerCardProgress <= cardFadeOutConfig.fadeEndThreshold) {

            const thresholdRange = cardFadeOutConfig.fadeEndThreshold - cardFadeOutConfig.fadeStartThreshold;
            const fadeProgress = thresholdRange > 0
                ? (triggerCardProgress - cardFadeOutConfig.fadeStartThreshold) / thresholdRange
                : 1;

            const easedFadeProgress = cardFadeOutConfig.fadeEasing(Math.max(0, Math.min(1, fadeProgress)));

            // Interpolate from 1.0 (full) to minOpacity (faded)
            return 1 - (easedFadeProgress * (1 - cardFadeOutConfig.minOpacity));

        } else if (triggerCardProgress > cardFadeOutConfig.fadeEndThreshold) {
            // Trigger card has passed fade range - return min opacity
            return cardFadeOutConfig.minOpacity;
        }

        // Trigger card hasn't reached fade start - no fade
        return 1.0;
    }

    let currentCardIndex = 0;

    // Helper function: Calculate scroll position for a specific card
    // Returns the Y position where the card is fully visible (end of deadzone)
    function calculateCardScrollPosition(cardIndex) {
        const cardCompleteFraction = (cardIndex + 1) / totalCards;
        const targetScroll = cardEntranceStart + (cardEntranceDuration * cardCompleteFraction);
        return targetScroll;
    }

    function navigateToCard(targetCardIndex) {
        if (targetCardIndex < 0 || targetCardIndex >= totalCards) {
            return;
        }

        const currentCardIndex = candidatiCardState.currentCardIndex;
        const isBackward = targetCardIndex < currentCardIndex;

        const targetScroll = calculateCardScrollPosition(targetCardIndex);

        const lenis = getState('lenis');
        const isScrollSystemInitialized = getState('flags.isScrollSystemInitialized');

        if (lenis && isScrollSystemInitialized) {
            if (isBackward) {
                // BACKWARD NAVIGATION: Two-step process to eliminate deadzone delay
                // Step 1: Instantly jump to SAFE POSITION of current card (past entrance, visible)
                // CRITICAL: Must jump to where card has COMPLETED its entrance animation (not where it starts)
                const currentCardStart = cardEntranceStart + (cardEntranceDuration * (currentCardIndex / totalCards));
                const currentCardEnd = cardEntranceStart + (cardEntranceDuration * ((currentCardIndex + 1) / totalCards));
                const entranceRatio = 0.286; // Must match per-card deadzone ratio
                // Jump to 30% through card's slot (safely past 28.6% entrance phase where card is fully visible)
                const currentCardSafePosition = currentCardStart + ((currentCardEnd - currentCardStart) * 0.30);

                lenis.scrollTo(currentCardSafePosition, {
                    duration: 0,
                    immediate: true, // Skip all animation frames to prevent RAF interference
                    onComplete: () => {
                        // Step 2: Smooth animation to target card (after instant scroll completes)
                        lenis.scrollTo(targetScroll, {
                            duration: 2.5,
                            easing: (t) => {
                                // cubic-bezier(0.4, 0, 0.2, 1) - Material Design "standard easing"
                                const p1x = 0.4, p1y = 0, p2x = 0.2, p2y = 1;
                                const cx = 3 * p1x;
                                const bx = 3 * (p2x - p1x) - cx;
                                const ax = 1 - cx - bx;
                                const cy = 3 * p1y;
                                const by = 3 * (p2y - p1y) - cy;
                                const ay = 1 - cy - by;

                                return ((ay * t + by) * t + cy) * t;
                            }
                        });
                    }
                });
            } else {
                // FORWARD NAVIGATION: Direct smooth animation
                lenis.scrollTo(targetScroll, {
                    duration: 2.5,
                    easing: (t) => {
                        // cubic-bezier(0.4, 0, 0.2, 1) - Material Design "standard easing"
                        const p1x = 0.4, p1y = 0, p2x = 0.2, p2y = 1;
                        const cx = 3 * p1x;
                        const bx = 3 * (p2x - p1x) - cx;
                        const ax = 1 - cx - bx;
                        const cy = 3 * p1y;
                        const by = 3 * (p2y - p1y) - cy;
                        const ay = 1 - cy - by;

                        return ((ay * t + by) * t + cy) * t;
                    }
                });
            }
        } else {
            // Fallback to native smooth scroll
            window.scrollTo({
                top: targetScroll,
                behavior: 'smooth'
            });
        }
    }

    // Simplified button visibility management (called by scroll animation system)
    function updateNavigationButtons(hideNonCurrent = false) {
        cardWrappers.forEach((wrapper, index) => {
            const card = cards[index];
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

    // Initialize button visibility
    updateNavigationButtons();

    const videoBg = document.getElementById('videoBg');

    candidatiCardState = {
        candidatiSpacer,
        candidatiTitleWrapper,
        candidatiTitle,
        submitButtonContainer,
        cardWrappers,
        cards,
        backgroundOverlay,
        videoBg,
        titleEntranceStart,
        titleEntranceEnd,
        cardEntranceStart,
        cardEntranceDuration,  // Duration of card entrance phase (needed for navigation)
        cardEntranceEnd,
        cardDeadzoneEnd,
        exitAnimationStart,
        exitAnimationEnd,
        bufferEnd, // For contatti section to reference
        totalCards,
        currentCardIndex,
        calculateCardOffsets,
        updateNavigationButtons,
        calculateCardScrollPosition,  // Calculate scroll position for card navigation
        navigateToCard,  // Navigate to specific card with smooth scroll
        calculateAndSetCardHeight,  // Store for resize recalculation
        optimizeCardInternalSizing, // Store for resize recalculation
        sidebarEasing,
        contentEasing,
        titleHiddenY,
        cardFadeOutConfig,  // Card fade-out configuration
        calculateCardFadeOutMultiplier,  // Helper function for persistent fade-out
        generateCardShadow  // Helper function to generate shadow with opacity
    };

    // Store in global state
    updateState('animations.candidati', candidatiCardState);

    // Attach navigation click listeners to AVANTI/INDIETRO buttons
    // IMPORTANT: Must be after candidatiCardState initialization to avoid circular dependency
    cards.forEach((card, index) => {
        const prevButton = card.querySelector('[data-direction="prev"]');
        const nextButton = card.querySelector('[data-direction="next"]');

        if (prevButton) {
            prevButton.addEventListener('click', () => {
                // Read current card from state (updated by scroll animation system)
                if (candidatiCardState.currentCardIndex > 0) {
                    navigateToCard(candidatiCardState.currentCardIndex - 1);
                }
            });
        }

        if (nextButton) {
            nextButton.addEventListener('click', () => {
                // Read current card from state (updated by scroll animation system)
                if (candidatiCardState.currentCardIndex < candidatiCardState.totalCards - 1) {
                    navigateToCard(candidatiCardState.currentCardIndex + 1);
                }
            });
        }
    });

    // Navigate to when first card (card 0) has fully arrived in position
    // First card completes at (0+1)/totalCards = 1/5 = 20% through card entrance phase
    const firstCardCompleteFraction = 1 / totalCards;
    const firstCardCompleteScroll = cardEntranceStart + (cardEntranceDuration * firstCardCompleteFraction);

    // NOTE: registerSection should be imported from navigation.js when it's created
    if (typeof registerSection === 'function') {
        registerSection('candidati', firstCardCompleteScroll);
    }

    let resizeTimeout;
    const handleResize = () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            // Recalculate card heights
            const { cardHeight: newCardHeight } = calculateAndSetCardHeight();
            optimizeCardInternalSizing(newCardHeight);

            // CRITICAL: Recalculate spacer height based on new layout
            // offsetTop changes when previous sections resize, must update spacer height
            const newViewportHeight = window.innerHeight;
            const newBufferEnd = exitAnimationEnd + (SCROLL.sectionBufferVH * newViewportHeight);
            const newSpacerDocumentTop = candidatiSpacer.offsetTop;
            const newTotalScrollRange = newBufferEnd - newSpacerDocumentTop;
            candidatiSpacer.style.height = newTotalScrollRange + 'px';
        }, 150); // Debounce 150ms
    };

    window.addEventListener('resize', handleResize);

    return bufferEnd;
}

// ============================================
// ANIMATION UPDATE
// ============================================

/**
 * Update candidati card stack animations based on scroll position
 * 4-phase system: title entrance, card progressive reveal, deadzone, exit
 * @param {number} scrollY - Current scroll position
 * @param {Object} cardState - Card animation state
 */
export function updateCandidatiCardStack(scrollY, cardState) {
    if (!cardState) return;

    // Destructure state
    const {
        candidatiTitleWrapper,
        candidatiTitle,
        submitButtonContainer,
        cardWrappers,
        cards,
        backgroundOverlay,
        videoBg,
        titleEntranceStart,
        titleEntranceEnd,
        cardEntranceStart,
        cardEntranceEnd,
        cardDeadzoneEnd,
        exitAnimationStart,
        exitAnimationEnd,
        bufferEnd,
        totalCards,
        calculateCardOffsets,
        sidebarEasing,
        contentEasing,
        titleHiddenY,
        cardFadeOutConfig,
        calculateCardFadeOutMultiplier
    } = cardState;

    // Section isolation: Activate candidati during TITLE entrance (not card entrance!)
    // CRITICAL: Must activate at titleEntranceStart to prevent .section-inactive CSS override
    if (scrollY >= titleEntranceStart && scrollY < bufferEnd) {
        if (typeof setActiveSection === 'function') setActiveSection('candidati');
        // Video state handled progressively during exit (see Phase 4 below)
        if (scrollY < exitAnimationStart) {
            if (typeof applyVideoState === 'function') applyVideoState('candidati');
        }
    } else if (scrollY >= bufferEnd) {
        if (typeof setActiveSection === 'function') setActiveSection('contatti');
        if (typeof applyVideoState === 'function') applyVideoState('contatti');

        // CRITICAL FIX: Explicitly hide ALL candidati elements when contatti activates
        // This ensures no candidati elements (overlay, title, cards, button) cover contatti
        if (backgroundOverlay) {
            backgroundOverlay.style.opacity = '0';
            backgroundOverlay.style.visibility = 'hidden';
        }

        candidatiTitleWrapper.style.opacity = '0';
        candidatiTitleWrapper.style.visibility = 'hidden';

        cardWrappers.forEach(wrapper => {
            wrapper.style.opacity = '0';
            wrapper.style.visibility = 'hidden';
        });

        if (submitButtonContainer) {
            submitButtonContainer.style.opacity = '0';
            submitButtonContainer.style.visibility = 'hidden';
        }
    }

    if (scrollY < titleEntranceStart) {
        return;
    }

    // PHASE 1: Title entrance animation (50vh)
    // Animate candidatiTitleWrapper (position: fixed)
    if (scrollY >= titleEntranceStart && scrollY <= titleEntranceEnd) {
        const progress = (scrollY - titleEntranceStart) / (titleEntranceEnd - titleEntranceStart);
        const easedProgress = sidebarEasing(progress);
        const translateY = titleHiddenY * (1 - easedProgress);
        const opacity = easedProgress;

        candidatiTitleWrapper.style.visibility = 'visible';
        candidatiTitleWrapper.style.transform = `translate(-50%, ${translateY}px)`;
        candidatiTitleWrapper.style.opacity = opacity;

        // Keep background overlay transparent during Phase 1
        if (backgroundOverlay) {
            backgroundOverlay.style.visibility = 'visible';
            backgroundOverlay.style.opacity = '0';
        }

        if (videoBg) {
            videoBg.style.filter = 'grayscale(25%) brightness(0.50) contrast(1.2) blur(0px)';
        }

    } else if (scrollY > titleEntranceEnd && scrollY < bufferEnd) {
        candidatiTitleWrapper.style.visibility = 'visible';
        candidatiTitleWrapper.style.transform = 'translate(-50%, 0px)';
        candidatiTitleWrapper.style.opacity = '1';
    }

    const offsets = calculateCardOffsets();
    const totalOffsetX = (totalCards - 1) * offsets.x;
    const centerOffsetX = -totalOffsetX / 2;

    // PHASE 2: Card progressive reveal (150vh) - OPTIMIZED BATCHED DOM UPDATES
    // Animate cardWrappers (position: fixed)
    if (scrollY >= cardEntranceStart && scrollY <= cardEntranceEnd) {
        const totalProgress = (scrollY - cardEntranceStart) / (cardEntranceEnd - cardEntranceStart);

        const cardUpdates = cardWrappers.map((wrapper, index) => {
            const cardEntranceFraction = index / totalCards;
            const cardCompleteFraction = (index + 1) / totalCards;

            let cardProgress = 0;
            if (totalProgress >= cardEntranceFraction) {
                if (totalProgress <= cardCompleteFraction) {
                    const fractionRange = cardCompleteFraction - cardEntranceFraction;
                    const progressWithinFraction = fractionRange > 0 ? (totalProgress - cardEntranceFraction) / fractionRange : 1;

                    // Per-card deadzone: entrance takes 28.6% of card's time slot, deadzone takes 71.4%
                    // (0.2vh entrance / 0.7vh total per card = 0.286)
                    const entranceRatio = 0.286;
                    if (progressWithinFraction <= entranceRatio) {
                        // During entrance phase
                        cardProgress = progressWithinFraction / entranceRatio;
                    } else {
                        // During deadzone phase - hold at final position
                        cardProgress = 1;
                    }
                } else {
                    cardProgress = 1;
                }
            }

            const easedCardProgress = sidebarEasing(cardProgress);
            const cardOffsetX = centerOffsetX + (index * offsets.x);
            const translateXVw = 100 * (1 - easedCardProgress);

            const entranceOpacity = easedCardProgress;

            const fadeOutMultiplier = calculateCardFadeOutMultiplier(index, totalProgress);

            // Final opacity = entrance * fade-out
            const finalOpacity = entranceOpacity * fadeOutMultiplier;

            return {
                wrapper,
                visibility: 'visible',
                transform: `translate(calc(-50% + ${cardOffsetX}px), 0) translateX(${translateXVw}vw)`,
                opacity: finalOpacity,
                cardProgress,
                index
            };
        });

        // Batch apply all card DOM updates
        cardUpdates.forEach(({ wrapper, visibility, transform, opacity }) => {
            wrapper.style.visibility = visibility;
            wrapper.style.transform = transform;
            wrapper.style.opacity = opacity;

            if (cardFadeOutConfig.enabled && cardFadeOutConfig.fadeShadow) {
                wrapper.style.boxShadow = cardState.generateCardShadow(opacity);
            }
        });

        // FIX: Bidirectional tracking - works for both forward and backward navigation
        let newCardIndex = 0;  // Reset to 0 instead of inheriting current (enables backward tracking)
        for (const { cardProgress, index } of cardUpdates) {
            if (cardProgress > 0.5) {
                newCardIndex = Math.max(newCardIndex, index);  // Find highest visible card
            }
        }
        if (newCardIndex !== cardState.currentCardIndex) {
            cardState.currentCardIndex = newCardIndex;
            cardState.updateNavigationButtons();
        }

        // Submit button animation (starts at 80% of phase)
        const submitStartFraction = Math.max(0.7, (totalCards - 1) / totalCards);
        let submitProgress = 0;
        if (totalProgress >= submitStartFraction) {
            submitProgress = (totalProgress - submitStartFraction) / (1 - submitStartFraction);
            submitProgress = Math.min(1, Math.max(0, submitProgress));
        }

        const easedSubmitProgress = contentEasing(submitProgress);

        if (submitButtonContainer) {
            submitButtonContainer.style.visibility = 'visible';
            submitButtonContainer.style.transform = 'translateX(-50%)';
            submitButtonContainer.style.opacity = easedSubmitProgress;
        }

        // Keep background overlay transparent during Phase 2
        if (backgroundOverlay) {
            backgroundOverlay.style.visibility = 'visible';
            backgroundOverlay.style.opacity = '0';
        }

        // Keep video at default state during Phase 2
        if (videoBg) {
            videoBg.style.filter = 'grayscale(25%) brightness(0.50) contrast(1.2) blur(0px)';
        }

    } else if (scrollY < cardEntranceStart) {
        // Before phase 2 - all card wrappers hidden off-screen (OPTIMIZED BATCHED)
        const cardUpdates = cardWrappers.map((wrapper, index) => {
            const cardOffsetX = centerOffsetX + (index * offsets.x);

            return {
                wrapper,
                visibility: 'visible',
                transform: `translate(calc(-50% + ${cardOffsetX}px), 0) translateX(100vw)`,
                opacity: 0  // Hidden (entrance hasn't started)
            };
        });

        cardUpdates.forEach(({ wrapper, visibility, transform, opacity }) => {
            wrapper.style.visibility = visibility;
            wrapper.style.transform = transform;
            wrapper.style.opacity = opacity;
        });

        if (submitButtonContainer) {
            submitButtonContainer.style.visibility = 'visible';
            submitButtonContainer.style.transform = 'translateX(-50%)';
            submitButtonContainer.style.opacity = '0';
        }

        // Keep background overlay transparent before Phase 2
        if (backgroundOverlay) {
            backgroundOverlay.style.visibility = 'visible';
            backgroundOverlay.style.opacity = '0';
        }

        // Keep video at default state before Phase 2
        if (videoBg) {
            videoBg.style.filter = 'grayscale(25%) brightness(0.50) contrast(1.2) blur(0px)';
        }
    }

    // PHASE 3: Deadzone (interaction phase, 200vh) - OPTIMIZED BATCHED DOM UPDATES
    else if (scrollY > cardEntranceEnd && scrollY <= cardDeadzoneEnd) {
        // All card wrappers at final position (OPTIMIZED BATCHED)
        // Maintain fade-out state from Phase 2 (totalProgress = 1.0 at end of entrance)
        const cardUpdates = cardWrappers.map((wrapper, index) => {
            const cardOffsetX = centerOffsetX + (index * offsets.x);

            const fadeOutMultiplier = calculateCardFadeOutMultiplier(index, 1.0);

            return {
                wrapper,
                visibility: 'visible',
                transform: `translate(calc(-50% + ${cardOffsetX}px), 0) translateX(0vw)`,
                opacity: fadeOutMultiplier  // Maintain fade-out state
            };
        });

        cardUpdates.forEach(({ wrapper, visibility, transform, opacity }) => {
            wrapper.style.visibility = visibility;
            wrapper.style.transform = transform;
            wrapper.style.opacity = opacity;

            if (cardFadeOutConfig.enabled && cardFadeOutConfig.fadeShadow) {
                wrapper.style.boxShadow = cardState.generateCardShadow(opacity);
            }
        });

        // Maintain the last card from Phase 2 (don't reset to card 0)
        const finalCardIndex = totalCards - 1;
        if (cardState.currentCardIndex !== finalCardIndex) {
            cardState.currentCardIndex = finalCardIndex;
            cardState.updateNavigationButtons(true); // Show only the last card
        }

        // Submit button at final position
        if (submitButtonContainer) {
            submitButtonContainer.style.visibility = 'visible';
            submitButtonContainer.style.transform = 'translateX(-50%)';
            submitButtonContainer.style.opacity = '1';
        }

        // Background overlay stays transparent during deadzone
        if (backgroundOverlay) {
            backgroundOverlay.style.visibility = 'visible';
            backgroundOverlay.style.opacity = '0';
        }

        // Keep video at default state during Phase 3
        if (videoBg) {
            videoBg.style.filter = 'grayscale(25%) brightness(0.50) contrast(1.2) blur(0px)';
        }
    }

    // PHASE 4: Exit animation (scale down, fade out, video blur to black) - OPTIMIZED BATCHED DOM UPDATES
    // Cards that already faded out (opacity = 0) stay at 0 (already "exited")
    // Cards still visible fade from their fade-out state to 0
    else if (scrollY > cardDeadzoneEnd && scrollY <= exitAnimationEnd) {
        const exitProgress = (scrollY - cardDeadzoneEnd) / (exitAnimationEnd - cardDeadzoneEnd);
        const easedExitProgress = contentEasing(exitProgress);

        // Scale for all elements (subtle scale)
        const scale = 1 - (easedExitProgress * 0.05); // Scale from 1.0 to 0.95 (subtle)

        // Exit fade multiplier: 1 (start of exit) to 0 (end of exit)
        const exitFadeMultiplier = 1 - easedExitProgress;

        candidatiTitleWrapper.style.visibility = 'visible';
        candidatiTitleWrapper.style.transform = `translate(-50%, 0px) scale(${scale})`;
        candidatiTitleWrapper.style.opacity = exitFadeMultiplier;

        // Cards fade from their fade-out state to 0
        const cardUpdates = cardWrappers.map((wrapper, index) => {
            const cardOffsetX = centerOffsetX + (index * offsets.x);

            const fadeOutMultiplier = calculateCardFadeOutMultiplier(index, 1.0);

            // Final opacity = fade-out state × exit fade
            const finalOpacity = fadeOutMultiplier * exitFadeMultiplier;

            return {
                wrapper,
                visibility: 'visible',
                transform: `translate(calc(-50% + ${cardOffsetX}px), 0) translateX(0vw) scale(${scale})`,
                opacity: finalOpacity
            };
        });

        cardUpdates.forEach(({ wrapper, visibility, transform, opacity }) => {
            wrapper.style.visibility = visibility;
            wrapper.style.transform = transform;
            wrapper.style.opacity = opacity;

            if (cardFadeOutConfig.enabled && cardFadeOutConfig.fadeShadow) {
                wrapper.style.boxShadow = cardState.generateCardShadow(opacity);
            }
        });

        if (submitButtonContainer) {
            submitButtonContainer.style.visibility = 'visible';
            submitButtonContainer.style.transform = `translateX(-50%) scale(${scale})`;
            submitButtonContainer.style.opacity = exitFadeMultiplier;
        }

        // Keep background overlay transparent during exit
        if (backgroundOverlay) {
            backgroundOverlay.style.visibility = 'visible';
            backgroundOverlay.style.opacity = '0';
        }
    }

    // AFTER Phase 4: Hide candidati elements and fade in contatti
    else if (scrollY > exitAnimationEnd && scrollY < bufferEnd) {
        candidatiTitleWrapper.style.opacity = '0';
        candidatiTitleWrapper.style.visibility = 'hidden';

        cardWrappers.forEach(wrapper => {
            wrapper.style.opacity = '0';
            wrapper.style.visibility = 'hidden';
        });

        if (submitButtonContainer) {
            submitButtonContainer.style.opacity = '0';
            submitButtonContainer.style.visibility = 'hidden';
        }

        // Keep video at normal state during buffer zone
        if (videoBg) {
            videoBg.style.filter = 'grayscale(25%) brightness(0.50) contrast(1.2) blur(0px)';
        }

        // Keep background overlay transparent and hidden
        if (backgroundOverlay) {
            backgroundOverlay.style.opacity = '0';
            backgroundOverlay.style.visibility = 'hidden';
        }
    }
}

// ============================================
// RESIZE HANDLING
// ============================================

/**
 * Recalculate candidati section boundaries on resize
 * Re-reads missione's updated bufferEnd and recalculates all scroll positions
 */
export function recalculateCandidatiBoundaries() {
    if (!candidatiCardState) return;

    const viewportHeight = window.innerHeight;

    // Re-read missione's UPDATED bufferEnd
    let titleEntranceStartBase;
    const missioneAnimationState = getState('animations.missione');
    const episodiAnimationState = getState('animations.episodi');

    if (missioneAnimationState && missioneAnimationState.bufferEnd) {
        titleEntranceStartBase = missioneAnimationState.bufferEnd;
    } else if (episodiAnimationState && episodiAnimationState.bufferEnd) {
        titleEntranceStartBase = episodiAnimationState.bufferEnd;
    } else {
        titleEntranceStartBase = document.querySelector('.candidati-spacer').offsetTop;
    }

    const titleEntranceStart = titleEntranceStartBase;
    const titleEntranceDuration = 0.5 * viewportHeight;
    const titleEntranceEnd = titleEntranceStart + titleEntranceDuration;

    const cardEntranceStart = titleEntranceEnd;
    const cardEntranceDuration = 3.5 * viewportHeight;
    const cardEntranceEnd = cardEntranceStart + cardEntranceDuration;

    const cardDeadzoneDuration = 0 * viewportHeight;
    const cardDeadzoneEnd = cardEntranceEnd + cardDeadzoneDuration;

    const exitAnimationDuration = 1.0 * viewportHeight;
    const exitAnimationStart = cardDeadzoneEnd;
    const exitAnimationEnd = exitAnimationStart + exitAnimationDuration;

    const bufferDuration = SCROLL.sectionBufferVH * viewportHeight;
    const bufferEnd = Math.floor(exitAnimationEnd + bufferDuration);

    candidatiCardState.titleEntranceStart = titleEntranceStart;
    candidatiCardState.titleEntranceEnd = titleEntranceEnd;
    candidatiCardState.cardEntranceStart = cardEntranceStart;
    candidatiCardState.cardEntranceDuration = cardEntranceDuration;
    candidatiCardState.cardEntranceEnd = cardEntranceEnd;
    candidatiCardState.cardDeadzoneEnd = cardDeadzoneEnd;
    candidatiCardState.exitAnimationStart = exitAnimationStart;
    candidatiCardState.exitAnimationEnd = exitAnimationEnd;
    candidatiCardState.bufferEnd = bufferEnd;

    // Update global state
    updateState('animations.candidati', candidatiCardState);

    // Recalculate spacer height with UPDATED boundaries
    const candidatiSpacer = candidatiCardState.candidatiSpacer;
    const spacerDocumentTop = candidatiSpacer.offsetTop;
    const totalScrollRange = Math.floor(bufferEnd - spacerDocumentTop);
    candidatiSpacer.style.height = totalScrollRange + 'px';

    // Re-register section with boundaries
    if (typeof registerSection === 'function') {
        registerSection('candidati', titleEntranceStart, {
            entranceStart: titleEntranceStart,
            entranceEnd: cardEntranceEnd,
            deadzoneEnd: cardDeadzoneEnd
        });
    }
}

// ============================================
// PUBLIC API
// ============================================

export {
    candidatiCardState
};
