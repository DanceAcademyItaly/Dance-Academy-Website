/**
 * Hero section animations and logic
 * Handles logo and subtitle fade/slide animations on scroll
 */

import { getState } from './state.js';
import { setStyles, getElementRect, getViewportHeight, clamp, easeOutCubic } from './utils.js';

// ============================================
// MODULE STATE
// ============================================

let heroElements = {};
let heroRanges = {};
let originalPositions = {};

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize hero section
 * Captures original positions and sets up fixed positioning for scroll animations
 */
export function initHero() {
    // Cache hero elements
    heroElements = {
        section: document.querySelector('#hero'),
        logo: document.getElementById('heroLogo'),
        subtitle: document.getElementById('heroSubtitle'),
    };

    if (!heroElements.logo && !heroElements.subtitle) {
        return;
    }

    // Capture original positions before any modifications
    captureOriginalPositions();

    // Setup fixed positioning for scroll-independent animation
    if (heroElements.logo) {
        setupHeroElementPositioning(heroElements.logo, originalPositions.logo);
    }

    if (heroElements.subtitle) {
        setupHeroElementPositioning(heroElements.subtitle, originalPositions.subtitle);
    }

    // Calculate scroll ranges
    calculateRanges();

    // Register with navigation (hero is always at scroll position 0)
    // This will be done by main.js via registerSection('hero', 0)
}

/**
 * Capture original hero element positions
 * Stores positions before converting to fixed positioning
 */
function captureOriginalPositions() {
    originalPositions = {};

    if (heroElements.logo) {
        const logoRect = heroElements.logo.getBoundingClientRect();
        originalPositions.logo = {
            top: logoRect.top,
            left: logoRect.left,
            bottom: logoRect.bottom,
            width: logoRect.width,
            height: logoRect.height
        };
    }

    if (heroElements.subtitle) {
        const subtitleRect = heroElements.subtitle.getBoundingClientRect();
        originalPositions.subtitle = {
            top: subtitleRect.top,
            left: subtitleRect.left,
            bottom: subtitleRect.bottom,
            width: subtitleRect.width,
            height: subtitleRect.height
        };
    }

    // Calculate spacing between elements
    if (originalPositions.logo && originalPositions.subtitle) {
        originalPositions.verticalSpacing = Math.abs(
            originalPositions.subtitle.top - originalPositions.logo.bottom
        );
    }
}

/**
 * Setup hero element for fixed positioning
 * Converts element to fixed position for independent scroll animation
 * @param {HTMLElement} element - Hero element (logo or subtitle)
 * @param {Object} originalPosition - Original position data
 */
function setupHeroElementPositioning(element, originalPosition = null) {
    if (!element) return;

    const computedStyle = window.getComputedStyle(element);
    const rect = originalPosition || element.getBoundingClientRect();

    // Calculate position as percentage of viewport
    const topPercent = (rect.top / getViewportHeight()) * 100;
    const leftPercent = 50; // Always center horizontally

    // Apply fixed positioning
    setStyles(element, {
        position: 'fixed',
        top: `${topPercent}%`,
        left: `${leftPercent}%`,
        transform: 'translateX(-50%)', // Center using transform
        zIndex: '1000',
        margin: '0',
        width: computedStyle.width,
        height: computedStyle.height
    });

    // Store original data
    element.dataset.originalMargin = computedStyle.margin;
    element.dataset.topPercent = topPercent;
    element.dataset.leftPercent = leftPercent;
    element.dataset.isPositioned = 'true';
}

/**
 * Calculate scroll ranges for hero animations
 */
function calculateRanges() {
    const viewportHeight = getViewportHeight();

    heroRanges = {
        start: 0,
        end: viewportHeight,
        height: viewportHeight,
        calculated: true,
    };
}

// ============================================
// SCROLL UPDATES
// ============================================

/**
 * Update hero animations based on scroll position
 * @param {number} scrollY - Current scroll position in pixels
 */
export function updateHero(scrollY) {
    if (!heroRanges.calculated) return;

    const viewportHeight = getViewportHeight();
    const progress = clamp(scrollY / viewportHeight, 0, 1);
    const easedProgress = easeOutCubic(progress);

    // Animate logo (slide left and fade out)
    if (heroElements.logo) {
        const opacity = 1 - easedProgress;

        // Determine distance based on viewport size
        const isMobile = window.innerWidth <= 768;
        const translateX = isMobile ? easedProgress * 150 : easedProgress * 100;

        setStyles(heroElements.logo, {
            opacity: opacity.toString(),
            transform: `translateX(calc(-50% - ${translateX}px))`
        });
    }

    // Animate subtitle (slide right and fade out)
    if (heroElements.subtitle) {
        const opacity = 1 - easedProgress;

        // Determine distance based on viewport size
        const isMobile = window.innerWidth <= 768;
        const translateX = isMobile ? easedProgress * 150 : easedProgress * 100;

        setStyles(heroElements.subtitle, {
            opacity: opacity.toString(),
            transform: `translateX(calc(-50% + ${translateX}px))`
        });
    }
}

/**
 * Recalculate ranges on resize
 * Should be called when viewport changes
 */
export function handleHeroResize() {
    calculateRanges();

    // Recapture positions if needed
    if (heroElements.logo || heroElements.subtitle) {
        // Elements are already fixed, just update ranges
        calculateRanges();
    }
}

/**
 * Get hero animation state for debugging
 * @returns {Object} Hero state information
 */
export function getHeroState() {
    return {
        elements: heroElements,
        ranges: heroRanges,
        originalPositions
    };
}
