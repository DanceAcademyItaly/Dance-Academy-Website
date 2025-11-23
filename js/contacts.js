/**
 * Contatti (Contacts) section animations and logic
 * Handles fade-in entrance animation and video background darkening
 */

import { getState } from './state.js';
import { setStyles, clamp, getViewportHeight } from './utils.js';

// ============================================
// MODULE STATE
// ============================================

let contattiAnimationState = null;

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize contatti section
 * Sets up scroll ranges and registers with navigation
 * @param {number} candidatiBufferEnd - End position of candidati section
 * @param {Function} registerSection - Function to register section with navigation
 * @returns {number} maxScroll - Maximum scroll value for HEADER_REGISTRY
 */
export function initContacts(candidatiBufferEnd, registerSection) {
    const contattiSpacer = document.querySelector('.contatti-spacer');
    const contattiContainer = document.getElementById('contattiContainer');

    if (!contattiSpacer || !contattiContainer) {
        console.warn('Contatti elements not found');
        return null;
    }

    const viewportHeight = getViewportHeight();

    // Animation durations (same as missione for consistency)
    const entranceDuration = 0.75 * viewportHeight; // 0.75vh entrance duration
    const deadzoneDuration = 1.25 * viewportHeight; // 1.25vh deadzone (visible at rest)

    // Calculate scroll ranges
    const entranceStart = candidatiBufferEnd; // Start right after candidati
    const entranceEnd = entranceStart + entranceDuration;
    const deadzoneEnd = entranceEnd + deadzoneDuration;

    // Set spacer height
    const totalScrollRange = entranceDuration + deadzoneDuration;
    const spacerHeight = Math.floor(totalScrollRange);
    contattiSpacer.style.height = spacerHeight + 'px';

    // Calculate max scroll
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

    // Store animation state
    contattiAnimationState = {
        contattiContainer,
        entranceStart,
        entranceEnd,
        deadzoneEnd,
        maxScroll
    };

    // Register section with navigation (if function provided)
    if (registerSection) {
        registerSection('contatti', maxScroll, {
            entranceStart,
            entranceEnd,
            deadzoneEnd
        });
    }

    return maxScroll;
}

// ============================================
// SCROLL UPDATES
// ============================================

/**
 * Update contatti animations based on scroll position
 * Handles fade-in entrance and video background darkening
 * @param {number} scrollY - Current scroll position in pixels
 */
export function updateContacts(scrollY) {
    if (!contattiAnimationState) return;

    const { contattiContainer, entranceStart, entranceEnd, deadzoneEnd } = contattiAnimationState;

    if (scrollY < entranceStart) {
        // Before entrance - hidden
        setStyles(contattiContainer, {
            visibility: 'hidden',
            opacity: '0',
            transform: 'translate(-50%, -50%) translateY(8px)'
        });

    } else if (scrollY >= entranceStart && scrollY <= entranceEnd) {
        // Entrance animation - fade in and move up
        setStyles(contattiContainer, {
            visibility: 'visible'
        });

        const progress = (scrollY - entranceStart) / (entranceEnd - entranceStart);

        // Ease-out with exponent 1.15 (same as missione for consistency)
        const easedProgress = 1 - Math.pow(1 - progress, 1.15);

        // Translate Y: 8px → 0px
        const translateY = 8 * (1 - easedProgress);

        setStyles(contattiContainer, {
            opacity: String(easedProgress),
            transform: `translate(-50%, -50%) translateY(${translateY}px)`
        });

        // Progressively blur and darken video background at START of entrance
        const videoBg = document.querySelector('.video-bg');
        if (videoBg) {
            // Fade happens at START: use steeper curve for faster fade
            // Completes in first 33% of entrance
            const fadeProgress = Math.min(1, progress * 3);

            // Blur: from 0px to 50px
            const blurAmount = 50 * fadeProgress;

            // Brightness: from 0.50 to 0.05 (fade to darkness)
            const brightness = 0.50 - (0.45 * fadeProgress);

            // Apply filter (grayscale and contrast remain constant)
            videoBg.style.filter = `grayscale(25%) brightness(${brightness}) contrast(1.2) blur(${blurAmount}px)`;
        }

    } else {
        // Deadzone - fully visible and in position (stays until end of page)
        setStyles(contattiContainer, {
            visibility: 'visible',
            opacity: '1',
            transform: 'translate(-50%, -50%) translateY(0px)'
        });
    }
}

/**
 * Recalculate ranges on resize
 * @param {number} candidatiBufferEnd - Updated buffer end from candidati section
 * @param {Function} registerSection - Function to register section with navigation
 * @returns {number} Updated maxScroll value
 */
export function handleContactsResize(candidatiBufferEnd, registerSection) {
    // Reinitialize with new viewport dimensions
    return initContacts(candidatiBufferEnd, registerSection);
}

/**
 * Get contatti animation state for debugging
 * @returns {Object|null} Animation state or null if not initialized
 */
export function getContactsState() {
    return contattiAnimationState;
}
