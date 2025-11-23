/**
 * @file mission.js
 * @description Missione section - handles mission statement animations
 *
 * Handles:
 * - Fixed positioning with viewport centering
 * - Automatic font size adjustment based on content
 * - Height-based scaling to fit viewport
 * - Reverse stagger entrance/exit animations
 * - Mobile-aware positioning (aligned with episodi selector)
 * - Responsive layout calculations
 * - Section isolation and video state management
 */

import { getState, updateState } from './state.js';
import { SCROLL, BREAKPOINTS } from './config.js';
import { registerSection, setActiveSection, applyVideoState } from './navigation.js';

// ============================================
// MODULE STATE
// ============================================

/**
 * Missione section animation state
 * Contains scroll ranges, element data, and DOM references
 */
let missioneAnimationState = null;

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize missione animations system
 * Creates fixed positioning, font sizing, and scroll-driven animations
 */
export function initMissioneAnimations() {
    const missioneContainer = document.getElementById('missioneContainer');
    const missioneBlock = document.querySelector('.missione-block');

    if (!missioneContainer || !missioneBlock) {
        return;
    }

    function attemptInitialization(attempts = 0) {
        const copyBlocks = missioneContainer.querySelectorAll('.copy-block');
        const ctaContainer = missioneContainer.querySelector('.cta-container');

        if ((copyBlocks.length === 0 && !ctaContainer) && attempts < 10) {
            setTimeout(() => attemptInitialization(attempts + 1), 200);
            return;
        }

        if (copyBlocks.length === 0 && !ctaContainer) {
            return;
        }

        const elements = [];

        // Collect all animatable elements - granular level (title, text, button)
        copyBlocks.forEach(block => {
            const title = block.querySelector('.missione-title');
            const text = block.querySelector('.missione-text');

            if (title) elements.push(title);
            if (text) elements.push(text);
        });

        if (ctaContainer) {
            const button = ctaContainer.querySelector('.missione-button');
            if (button) {
                elements.push(button);
            } else {
                // Fallback to container if button not found
                elements.push(ctaContainer);
            }
        }

        const originalContainerRect = missioneContainer.getBoundingClientRect();
        const originalContainerTop = originalContainerRect.top + window.scrollY;

        const originalElementPositions = elements.map((element, index) => {
            const rect = element.getBoundingClientRect();
            return {
                element,
                index,
                top: rect.top + window.scrollY,
                left: rect.left,
                width: rect.width,
                height: rect.height
            };
        });

        // IMMEDIATELY detach from document scroll - position in center of viewport
        const viewportCenterY = window.innerHeight / 2;
        const containerCenterY = viewportCenterY - (originalContainerRect.height / 2);

        // Mobile-aware positioning - align first copy block with episodi selector
        const isMobile = window.innerWidth <= BREAKPOINTS.mobile;
        const minTopOffset = isMobile ? 10 : 20;

        let calculatedTop;
        if (isMobile) {
            // Calculate same top position as episodi selector
            const header = document.querySelector('.header-fixed');
            const headerTop = 20; // Fixed in CSS
            let headerVerticalCenter = headerTop;
            if (header) {
                const headerSpan = header.querySelector('span');
                if (headerSpan) {
                    const computedStyle = window.getComputedStyle(headerSpan);
                    const fontSize = parseFloat(computedStyle.fontSize);
                    const lineHeight = parseFloat(computedStyle.lineHeight) || fontSize * 1.6;
                    headerVerticalCenter = headerTop + (lineHeight / 2);
                }
            }
            const deadzoneTop = headerVerticalCenter * 2; // Matches episodi selector position

            // Account for first copy block's top margin: clamp(15px, 3vh, 40px)
            const copyBlockTopMargin = Math.max(15, Math.min(window.innerHeight * 0.03, 40));

            // Position container so first copy block aligns with episodi selector
            calculatedTop = deadzoneTop - copyBlockTopMargin;
        } else {
            calculatedTop = containerCenterY;
        }

        missioneContainer.style.position = 'fixed';
        missioneContainer.style.top = Math.max(calculatedTop, minTopOffset) + 'px';
        missioneContainer.style.left = '50%';
        missioneContainer.style.transform = 'translateX(-50%)'; // Center horizontally
        missioneContainer.style.width = 'clamp(320px, 95vw, 1400px)'; // RESPONSIVE width (wider max for desktop)
        missioneContainer.style.height = 'auto'; // Let content determine height (scales to fit via height-based scaling)
        missioneContainer.style.zIndex = '1000';

        // Initially hide container - will be shown when animation sequence starts
        missioneContainer.style.visibility = 'hidden';
        missioneContainer.style.opacity = '0';

        const missioneOriginalHeight = missioneBlock.offsetHeight;
        const spacer = document.createElement('div');
        spacer.style.height = missioneOriginalHeight + 'px';
        spacer.className = 'missione-spacer';
        missioneBlock.parentNode.insertBefore(spacer, missioneBlock.nextSibling);

        const elementData = originalElementPositions.map((elementPos, index) => {
            const { element } = elementPos;

            // REVERSE STAGGER: last elements animate first (bottom to top)
            const totalElements = elements.length;
            const reverseIndex = totalElements - 1 - index;

            const relativeTop = elementPos.top - originalContainerTop;
            const relativeLeft = elementPos.left - originalContainerRect.left;

            // Determine element type for specific styling
            const isButton = element.classList.contains('missione-button');

            element.style.position = 'relative';
            element.style.top = '';
            element.style.left = '';
            // Button width: fit-content (based on text), Text elements: 100%
            element.style.width = isButton ? 'fit-content' : '100%';
            element.style.height = 'auto';
            element.style.textAlign = 'center';
            // Spacing is handled by CSS rules

            element.style.transform = 'translateY(30px)';
            element.style.opacity = '0';
            element.style.visibility = 'visible';

            element.classList.add('missione-animated');
            element.dataset.animationIndex = index;
            element.dataset.reverseIndex = reverseIndex;

            return {
                element,
                relativeTop,
                relativeLeft,
                index,
                reverseIndex
            };
        });

        let entranceStartBase;

        const episodiAnimationState = getState('animations.episodi');
        if (episodiAnimationState && episodiAnimationState.bufferEnd) {
            // Episodi exists - start after its buffer zone
            entranceStartBase = episodiAnimationState.bufferEnd;
        } else {
            const heroBlock = document.querySelector('.hero-block');
            if (heroBlock) {
                const heroBottom = heroBlock.offsetTop + heroBlock.offsetHeight;
                const bufferAfterHero = SCROLL.sectionBufferVH * window.innerHeight;
                entranceStartBase = heroBottom + bufferAfterHero;
            } else {
                // Fallback to missione block's own position
                entranceStartBase = missioneBlock.offsetTop;
            }
        }

        const viewportHeight = window.innerHeight;

        const elementAnimationDuration = 500; // Same as updateMissioneAnimations
        const staggerOffset = 50; // Same as updateMissioneAnimations

        const entranceStart = entranceStartBase;
        const entranceDuration = 0.5 * viewportHeight; // 0.5vh entrance duration (faster)
        const entranceEnd = entranceStart + entranceDuration;
        const deadzoneDuration = 0.5 * viewportHeight; // 0.5vh deadzone (matching episodi)
        const deadzoneEnd = entranceEnd + deadzoneDuration;

        // Last element (highest reverseIndex) finishes at: deadzoneEnd + (reverseIndex * staggerOffset) + elementAnimationDuration
        const totalElements = elementData.length;
        const lastElementReverseIndex = totalElements - 1;
        const lastElementExitEnd = deadzoneEnd + (lastElementReverseIndex * staggerOffset) + elementAnimationDuration;
        const exitEnd = lastElementExitEnd + 50; // Add 50px buffer for safety

        const bufferDuration = SCROLL.sectionBufferVH * viewportHeight;
        const bufferEnd = exitEnd + bufferDuration;

        // Font size auto-adjustment system - calculates based on longest text of each type
        function setupAutoFontSizing() {
            if (!elementData || elementData.length === 0) return;

            const isMobile = window.innerWidth <= BREAKPOINTS.mobile;

            const containerWidth = missioneContainer.offsetWidth;
            const horizontalPadding = 60; // 30px on each side
            const h3MaxWidth = containerWidth - horizontalPadding;
            const pMaxWidth = containerWidth - horizontalPadding;

            // PHASE 1: Width-based font sizing
            // Collect all text elements by type
            const h3Elements = [];
            const pElements = [];

            elementData.forEach(({ element }) => {
                if (element.classList.contains('missione-title')) {
                    h3Elements.push(element);
                } else if (element.classList.contains('missione-text')) {
                    pElements.push(element);
                }
            });

            let h3FontSize, pFontSize;

            if (h3Elements.length > 0 && pElements.length > 0) {
                h3FontSize = calculateOptimalFontSize(h3Elements, h3MaxWidth, 'h3');
                pFontSize = calculateOptimalFontSize(pElements, pMaxWidth, 'p');

                // ENFORCE HIERARCHY: h3 must be larger than p
                if (pFontSize >= h3FontSize) {
                    pFontSize = Math.floor(h3FontSize * 0.85); // p is 85% of h3
                }

                applyFontSizeToElements(h3Elements, h3FontSize, 'h3');
                applyFontSizeToElements(pElements, pFontSize, 'p');
            } else if (h3Elements.length > 0) {
                h3FontSize = calculateOptimalFontSize(h3Elements, h3MaxWidth, 'h3');
                applyFontSizeToElements(h3Elements, h3FontSize, 'h3');
            } else if (pElements.length > 0) {
                pFontSize = calculateOptimalFontSize(pElements, pMaxWidth, 'p');
                applyFontSizeToElements(pElements, pFontSize, 'p');
            }

            // PHASE 2: Height-based scaling to fit viewport
            // Scale down content if it exceeds available vertical space
            applyHeightBasedScaling();
        }

        function calculateOptimalFontSize(elements, maxWidth, elementType) {
            const isMobile = window.innerWidth <= BREAKPOINTS.mobile;

            // Find the longest text
            let longestText = '';
            elements.forEach(element => {
                const text = element.textContent.trim();
                if (text.length > longestText.length) {
                    longestText = text;
                }
            });

            // Font size ranges
            const minSize = isMobile ? 12 : 12;
            const maxSize = isMobile ? 24 : (elementType === 'h3' ? 48 : 36);

            // maxWidth = containerWidth - horizontalPadding (accounts for actual container dimensions)
            const singleLineWidth = isMobile
                ? (elementType === 'h3' ? maxWidth : Math.floor(maxWidth * 0.95))
                : maxWidth;

            // Mobile can use 2 lines, desktop uses 1 line
            const maxAllowedWidth = isMobile ? (singleLineWidth * 2) : singleLineWidth;

            let optimalSize = minSize;

            // Find largest font size where longest text fits in allowed space
            for (let fontSize = minSize; fontSize <= maxSize; fontSize += 1) {
                const textWidth = measureTextWidth(longestText, fontSize, elementType === 'h3' ? '600' : '400');

                // Account for letter-spacing: h3 has 0.08em letter spacing
                const letterSpacingWidth = elementType === 'h3' ? (longestText.length * fontSize * 0.08) : 0;
                const totalWidth = textWidth + letterSpacingWidth;

                if (totalWidth <= maxAllowedWidth) {
                    optimalSize = fontSize;
                } else {
                    break; // This size is too big, use previous size
                }
            }

            return optimalSize;
        }

        // Measure text width using canvas
        function measureTextWidth(text, fontSize, fontWeight = '400') {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            context.font = `${fontWeight} ${fontSize}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
            return context.measureText(text).width;
        }

        function applyFontSizeToElements(elements, fontSize, elementType) {
            const isMobile = window.innerWidth <= BREAKPOINTS.mobile;

            elements.forEach(element => {
                element.style.fontSize = fontSize + 'px';
                element.style.lineHeight = '1.3';
                element.style.textAlign = 'center';
                element.style.letterSpacing = elementType === 'h3' ? '0.08em' : 'normal';

                if (isMobile) {
                    // Mobile: Allow wrapping to max 2 lines
                    // h3: 100% of container, p: 95% of container (different widths for visual distinction)
                    // NO ELLIPSIS - font size ensures ALL text fits
                    element.style.whiteSpace = 'normal';
                    element.style.width = elementType === 'h3' ? '100%' : '95%';
                    element.style.maxWidth = elementType === 'h3' ? '100%' : '95%';
                    element.style.display = 'block';
                    element.style.overflow = 'visible';
                    element.style.wordWrap = 'break-word';
                    element.style.overflowWrap = 'break-word';
                    element.style.webkitLineClamp = '';
                    element.style.webkitBoxOrient = '';
                    element.style.textOverflow = '';
                } else {
                    // Desktop: Single line, no wrap
                    element.style.whiteSpace = 'nowrap';
                    element.style.width = '100%';
                    element.style.maxWidth = '100%';
                    element.style.display = 'block';
                    element.style.overflow = 'visible';
                    element.style.wordWrap = 'normal';
                    element.style.overflowWrap = 'normal';
                    element.style.webkitLineClamp = '';
                    element.style.webkitBoxOrient = '';
                    element.style.textOverflow = '';
                }
            });
        }

        // Measure natural content height (sum of all element heights + margins)
        function measureNaturalContentHeight() {
            if (!missioneContainer) return 0;

            let totalHeight = 0;

            // Measure actual rendered height of all child elements
            Array.from(missioneContainer.children).forEach(child => {
                const style = window.getComputedStyle(child);
                const marginTop = parseFloat(style.marginTop) || 0;
                const marginBottom = parseFloat(style.marginBottom) || 0;
                totalHeight += child.offsetHeight + marginTop + marginBottom;
            });

            return totalHeight;
        }

        // Apply height-based scaling to fit content within available viewport space
        function applyHeightBasedScaling() {
            if (!elementData || elementData.length === 0) return 1.0;

            const isMobile = window.innerWidth <= BREAKPOINTS.mobile;

            // Calculate available height
            const containerTop = parseFloat(missioneContainer.style.top || '0');
            const bottomMargin = isMobile ? 20 : 40;
            const availableHeight = window.innerHeight - containerTop - bottomMargin;

            // Measure natural content height after width-based font sizing
            const naturalHeight = measureNaturalContentHeight();

            // Calculate scale factor (never scale UP, only DOWN)
            let scaleFactor = 1.0;
            if (naturalHeight > availableHeight) {
                scaleFactor = availableHeight / naturalHeight;
                // Prevent extreme scaling - minimum 50%
                scaleFactor = Math.max(scaleFactor, 0.5);
            }

            // If no scaling needed, return early
            if (scaleFactor >= 1.0) return 1.0;

            // Apply scale factor to all text elements
            elementData.forEach(({ element }) => {
                const currentFontSize = parseFloat(element.style.fontSize || window.getComputedStyle(element).fontSize);
                const scaledFontSize = currentFontSize * scaleFactor;
                element.style.fontSize = scaledFontSize + 'px';

                // Scale margins
                if (element.classList.contains('missione-title')) {
                    const baseMargin = parseFloat(window.getComputedStyle(element).marginBottom) || 0;
                    element.style.marginBottom = (baseMargin * scaleFactor) + 'px';
                } else if (element.classList.contains('missione-text')) {
                    const baseMargin = parseFloat(window.getComputedStyle(element).marginBottom) || 0;
                    element.style.marginBottom = (baseMargin * scaleFactor) + 'px';
                } else if (element.classList.contains('missione-button')) {
                    // Scale button padding (vertical only, keep horizontal)
                    const style = window.getComputedStyle(element);
                    const paddingTop = parseFloat(style.paddingTop) || 0;
                    const paddingBottom = parseFloat(style.paddingBottom) || 0;
                    const paddingLeft = parseFloat(style.paddingLeft) || 0;
                    const paddingRight = parseFloat(style.paddingRight) || 0;
                    element.style.padding = `${paddingTop * scaleFactor}px ${paddingRight}px ${paddingBottom * scaleFactor}px ${paddingLeft}px`;
                }
            });

            // Scale copy-block margins
            const copyBlocks = missioneContainer.querySelectorAll('.copy-block');
            copyBlocks.forEach(block => {
                const style = window.getComputedStyle(block);
                const marginTop = parseFloat(style.marginTop) || 0;
                const marginBottom = parseFloat(style.marginBottom) || 0;
                block.style.margin = `${marginTop * scaleFactor}px 0 ${marginBottom * scaleFactor}px 0`;
            });

            // Scale cta-container margin
            const ctaContainer = missioneContainer.querySelector('.cta-container');
            if (ctaContainer) {
                const style = window.getComputedStyle(ctaContainer);
                const marginTop = parseFloat(style.marginTop) || 0;
                ctaContainer.style.marginTop = (marginTop * scaleFactor) + 'px';
            }

            return scaleFactor;
        }

        setupAutoFontSizing();

        // Recalculate position after font sizing (content height has changed)
        const newContainerRect = missioneContainer.getBoundingClientRect();
        const newViewportCenterY = window.innerHeight / 2;
        const newContainerCenterY = newViewportCenterY - (newContainerRect.height / 2);

        let newCalculatedTop;
        if (isMobile) {
            // Recalculate same top position as episodi selector
            const header = document.querySelector('.header-fixed');
            const headerTop = 20;
            let headerVerticalCenter = headerTop;
            if (header) {
                const headerSpan = header.querySelector('span');
                if (headerSpan) {
                    const computedStyle = window.getComputedStyle(headerSpan);
                    const fontSize = parseFloat(computedStyle.fontSize);
                    const lineHeight = parseFloat(computedStyle.lineHeight) || fontSize * 1.6;
                    headerVerticalCenter = headerTop + (lineHeight / 2);
                }
            }
            const deadzoneTop = headerVerticalCenter * 2;
            const copyBlockTopMargin = Math.max(15, Math.min(window.innerHeight * 0.03, 40));
            newCalculatedTop = deadzoneTop - copyBlockTopMargin;
        } else {
            newCalculatedTop = newContainerCenterY;
        }
        missioneContainer.style.top = Math.max(newCalculatedTop, minTopOffset) + 'px';

        // Resize handler for positioning and font size updates
        function recalculateMissioneLayout() {
            if (!missioneAnimationState) return;

            // 1. Recalculate font sizes for new container widths
            setupAutoFontSizing();

            // 2. Recalculate container center position vertically (mobile-aware)
            const isMobileResize = window.innerWidth <= BREAKPOINTS.mobile;
            const minTopOffsetResize = isMobileResize ? 10 : 20;
            const newViewportCenterY = window.innerHeight / 2;
            const newContainerCenterY = newViewportCenterY - (missioneContainer.offsetHeight / 2);

            let calculatedTopResize;
            if (isMobileResize) {
                // Recalculate same top position as episodi selector
                const header = document.querySelector('.header-fixed');
                const headerTop = 20;
                let headerVerticalCenter = headerTop;
                if (header) {
                    const headerSpan = header.querySelector('span');
                    if (headerSpan) {
                        const computedStyle = window.getComputedStyle(headerSpan);
                        const fontSize = parseFloat(computedStyle.fontSize);
                        const lineHeight = parseFloat(computedStyle.lineHeight) || fontSize * 1.6;
                        headerVerticalCenter = headerTop + (lineHeight / 2);
                    }
                }
                const deadzoneTop = headerVerticalCenter * 2;
                const copyBlockTopMargin = Math.max(15, Math.min(window.innerHeight * 0.03, 40));
                calculatedTopResize = deadzoneTop - copyBlockTopMargin;
            } else {
                calculatedTopResize = newContainerCenterY;
            }

            missioneContainer.style.top = Math.max(calculatedTopResize, minTopOffsetResize) + 'px';
        }

        // Debounced resize handler for performance
        let resizeTimeout;
        function debouncedResizeHandler() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(recalculateMissioneLayout, 150); // 150ms debounce
        }

        // Clean up previous resize handler
        if (window.missioneResizeHandler) {
            window.removeEventListener('resize', window.missioneResizeHandler);
        }

        window.missioneResizeHandler = debouncedResizeHandler;
        window.addEventListener('resize', debouncedResizeHandler);

        missioneAnimationState = {
            elements: elementData,
            missioneBlock,
            missioneContainer,
            entranceStart,
            entranceEnd,
            deadzoneEnd,
            exitEnd,
            bufferEnd, // For next section to reference
            originalContainerTop
        };

        // Store in global state
        updateState('animations.missione', missioneAnimationState);

        // Navigate to when last element has fully finished its entrance stagger animation
        // Last element (highest reverseIndex) finishes at: entranceStart + (reverseIndex * stagger) + animDuration
        const lastElementEntranceEnd = entranceStart + (lastElementReverseIndex * staggerOffset) + elementAnimationDuration;

        // NOTE: registerSection should be imported from navigation.js when it's created
        if (typeof registerSection === 'function') {
            registerSection('missione', lastElementEntranceEnd);
        }
    }

    attemptInitialization();
}

// ============================================
// ANIMATION UPDATE
// ============================================

/**
 * Update missione animations based on scroll position
 * @param {number} scrollY - Current scroll position
 * @param {Object} animationState - Animation state object
 */
export function updateMissioneAnimations(scrollY, animationState) {
    if (!animationState) return;

    const { elements, entranceStart, entranceEnd, deadzoneEnd, exitEnd, bufferEnd, missioneContainer } = animationState;

    if (!elements || elements.length === 0) return;

    // Section isolation: Activate missione during entrance, candidati at buffer end
    const candidatiCardState = getState('animations.candidati');

    if (scrollY >= entranceStart && scrollY < bufferEnd) {
        if (typeof setActiveSection === 'function') setActiveSection('missione');
        if (typeof applyVideoState === 'function') applyVideoState('missione');
    } else if (scrollY >= bufferEnd && candidatiCardState && scrollY < candidatiCardState.bufferEnd) {
        // FIX: Added upper bound to prevent interfering with contatti section
        if (typeof setActiveSection === 'function') setActiveSection('candidati');
        if (typeof applyVideoState === 'function') applyVideoState('candidati');
    }

    const elementAnimationDuration = 500; // Each element animates over 500px (2.5x longer)
    const staggerOffsetMax = 90; // Maximum stagger offset (first element)
    const staggerOffsetMin = 10; // Minimum stagger offset (last element)
    const moveDistance = 8; // 8px movement (subtle peek-through effect)

    // OPTIMIZED CONTAINER VISIBILITY - track state to avoid redundant DOM reads/writes
    if (!animationState.containerVisibilityState) {
        animationState.containerVisibilityState = null;
    }

    let targetVisibility = null;
    if (scrollY < entranceStart) {
        targetVisibility = 'hidden';
    } else if (scrollY > exitEnd) {
        targetVisibility = 'hidden';
    } else {
        targetVisibility = 'visible';
    }

    // Only update DOM if visibility state actually changed
    if (animationState.containerVisibilityState !== targetVisibility) {
        animationState.containerVisibilityState = targetVisibility;
        missioneContainer.style.visibility = targetVisibility;
        missioneContainer.style.opacity = targetVisibility === 'visible' ? '1' : '0';
    }

    // PHASE 1: Calculate all element states (NO DOM reads - pure calculations)
    const elementUpdates = elements.map((elementData) => {
        const { element, reverseIndex, index } = elementData;

        // reverseIndex 0 (button) gets max offset, last element gets min offset
        const totalElements = elements.length;
        const progressiveStagger = totalElements > 1
            ? staggerOffsetMax - ((staggerOffsetMax - staggerOffsetMin) * (reverseIndex / (totalElements - 1)))
            : staggerOffsetMax;

        // Accumulate stagger offsets to get actual timing
        let cumulativeEntranceOffset = 0;
        let cumulativeExitOffset = 0;
        for (let i = 0; i < reverseIndex; i++) {
            const prevProgressiveStagger = totalElements > 1
                ? staggerOffsetMax - ((staggerOffsetMax - staggerOffsetMin) * (i / (totalElements - 1)))
                : staggerOffsetMax;
            cumulativeEntranceOffset += prevProgressiveStagger;
            cumulativeExitOffset += prevProgressiveStagger;
        }

        const elementEntranceStart = entranceStart + cumulativeEntranceOffset;
        const elementEntranceEnd = elementEntranceStart + elementAnimationDuration;
        const elementExitStart = deadzoneEnd + cumulativeExitOffset;
        const elementExitEnd = elementExitStart + elementAnimationDuration;

        let transform, opacity, phase;

        if (scrollY < elementEntranceStart) {
            phase = 'before';
            transform = 'translateY(8px)';
            opacity = 0;

        } else if (scrollY >= elementEntranceStart && scrollY <= elementEntranceEnd) {
            phase = 'entrance';
            const progress = (scrollY - elementEntranceStart) / elementAnimationDuration;
            const easedProgress = 1 - Math.pow(1 - progress, 1.15); // Ease-out with exponent 1.15
            const translateY = moveDistance * (1 - easedProgress); // 8px → 0px
            transform = `translateY(${translateY}px)`;
            opacity = easedProgress;

        } else if (scrollY > elementEntranceEnd && scrollY <= elementExitStart) {
            phase = 'deadzone';
            transform = 'translateY(0px)';
            opacity = 1;

        } else if (scrollY > elementExitStart && scrollY <= elementExitEnd) {
            phase = 'exit';
            const progress = (scrollY - elementExitStart) / elementAnimationDuration;
            const easedProgress = Math.pow(progress, 1.15); // Ease-in with exponent 1.15
            const translateY = -moveDistance * easedProgress; // 0px → -8px
            transform = `translateY(${translateY}px)`;
            opacity = 1 - easedProgress;

        } else {
            phase = 'after';
            transform = 'translateY(-8px)';
            opacity = 0;
        }

        return { element, transform, opacity, phase, index, reverseIndex };
    });

    // PHASE 2: Batch apply all DOM updates (styles + classList together for cache efficiency)
    elementUpdates.forEach(({ element, transform, opacity, phase, index, reverseIndex }) => {
        element.style.transform = transform;
        element.style.opacity = String(opacity);

        const classList = element.classList;
        switch (phase) {
            case 'before':
                classList.remove('animated', 'exiting');
                break;

            case 'entrance':
                if (!classList.contains('animated')) {
                    classList.add('animated');
                }
                break;

            case 'deadzone':
                classList.add('animated');
                classList.remove('exiting');
                break;

            case 'exit':
                if (!classList.contains('exiting')) {
                    classList.add('exiting');
                }
                break;

            case 'after':
                classList.remove('animated');
                classList.add('exiting');
                break;
        }
    });
}

// ============================================
// RESIZE HANDLING
// ============================================

/**
 * Recalculate missione boundaries on resize
 * Re-reads episodi's updated bufferEnd and recalculates all scroll positions
 */
export function recalculateMissioneBoundaries() {
    if (!missioneAnimationState) return;

    const viewportHeight = window.innerHeight;

    // Re-read episodi's UPDATED bufferEnd
    let entranceStartBase;
    const episodiAnimationState = getState('animations.episodi');
    if (episodiAnimationState && episodiAnimationState.bufferEnd) {
        entranceStartBase = episodiAnimationState.bufferEnd;
    } else {
        const heroBlock = document.querySelector('.hero-block');
        if (heroBlock) {
            entranceStartBase = heroBlock.offsetTop + heroBlock.offsetHeight + (SCROLL.sectionBufferVH * viewportHeight);
        } else {
            entranceStartBase = document.querySelector('.missione-block').offsetTop;
        }
    }

    const entranceStart = entranceStartBase;
    const entranceDuration = 0.5 * viewportHeight;
    const entranceEnd = entranceStart + entranceDuration;
    const deadzoneDuration = 0.5 * viewportHeight;
    const deadzoneEnd = entranceEnd + deadzoneDuration;

    const elementData = missioneAnimationState.elements;
    const lastElementReverseIndex = elementData.length - 1;
    const staggerOffset = 50;
    const elementAnimationDuration = 500;
    const lastElementExitEnd = deadzoneEnd + (lastElementReverseIndex * staggerOffset) + elementAnimationDuration;
    const exitEnd = lastElementExitEnd + 50;

    const bufferDuration = SCROLL.sectionBufferVH * viewportHeight;
    const bufferEnd = exitEnd + bufferDuration;

    missioneAnimationState.entranceStart = entranceStart;
    missioneAnimationState.entranceEnd = entranceEnd;
    missioneAnimationState.deadzoneEnd = deadzoneEnd;
    missioneAnimationState.exitEnd = exitEnd;
    missioneAnimationState.bufferEnd = bufferEnd;

    // Update global state
    updateState('animations.missione', missioneAnimationState);

    // Re-register section
    const lastElementEntranceEnd = entranceStart + (lastElementReverseIndex * staggerOffset) + elementAnimationDuration;
    if (typeof registerSection === 'function') {
        registerSection('missione', lastElementEntranceEnd);
    }
}

// ============================================
// PUBLIC API
// ============================================

export {
    missioneAnimationState
};
