/**
 * Utility functions for Dance Academy Website
 * Reusable helper functions for easing, math, DOM manipulation, and performance
 */

// ============================================
// EASING FUNCTIONS
// ============================================

/**
 * Ease-out cubic easing function
 * Starts fast and slows down at the end
 * @param {number} t - Progress value between 0 and 1
 * @returns {number} Eased value between 0 and 1
 */
export function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

/**
 * Ease-in cubic easing function
 * Starts slow and speeds up at the end
 * @param {number} t - Progress value between 0 and 1
 * @returns {number} Eased value between 0 and 1
 */
export function easeInCubic(t) {
    return Math.pow(t, 3);
}

/**
 * Ease-in-out cubic easing function
 * Starts slow, speeds up in middle, slows down at end
 * @param {number} t - Progress value between 0 and 1
 * @returns {number} Eased value between 0 and 1
 */
export function easeInOutCubic(t) {
    return t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Ease-in quartic (power of 4)
 * @param {number} t - Progress value between 0 and 1
 * @returns {number} Eased value between 0 and 1
 */
export function easeInQuart(t) {
    return Math.pow(t, 4);
}

/**
 * Ease-in quadratic (power of 2)
 * @param {number} t - Progress value between 0 and 1
 * @returns {number} Eased value between 0 and 1
 */
export function easeInQuad(t) {
    return Math.pow(t, 2);
}

/**
 * Custom ease-in (power of 3.5) - between cubic and quartic
 * @param {number} t - Progress value between 0 and 1
 * @returns {number} Eased value between 0 and 1
 */
export function easeInCustom(t) {
    return Math.pow(t, 3.5);
}

/**
 * Ease-in with power of 1.5
 * @param {number} t - Progress value between 0 and 1
 * @returns {number} Eased value between 0 and 1
 */
export function easeInOneFive(t) {
    return Math.pow(t, 1.5);
}

/**
 * Fast ease-in (power of 1.25) - accelerates quickly
 * @param {number} t - Progress value between 0 and 1
 * @returns {number} Eased value between 0 and 1
 */
export function easeInFast(t) {
    return Math.pow(t, 1.25);
}

// ============================================
// MATH UTILITIES
// ============================================

/**
 * Clamp a value between min and max
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation between two values
 * @param {number} start - Start value
 * @param {number} end - End value
 * @param {number} t - Progress value between 0 and 1
 * @returns {number} Interpolated value
 */
export function lerp(start, end, t) {
    return start + (end - start) * t;
}

/**
 * Map a value from one range to another
 * @param {number} value - Input value
 * @param {number} inMin - Input range minimum
 * @param {number} inMax - Input range maximum
 * @param {number} outMin - Output range minimum
 * @param {number} outMax - Output range maximum
 * @returns {number} Mapped value
 */
export function mapRange(value, inMin, inMax, outMin, outMax) {
    return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
}

/**
 * Normalize a value to 0-1 range
 * @param {number} value - Value to normalize
 * @param {number} min - Range minimum
 * @param {number} max - Range maximum
 * @returns {number} Normalized value between 0 and 1
 */
export function normalize(value, min, max) {
    return (value - min) / (max - min);
}

// ============================================
// DOM UTILITIES
// ============================================

/**
 * Apply multiple styles to an element
 * @param {HTMLElement} element - Target element
 * @param {Object} styles - Object with CSS properties
 */
export function setStyles(element, styles) {
    if (!element) return;
    Object.assign(element.style, styles);
}

/**
 * Get current viewport height
 * @returns {number} Viewport height in pixels
 */
export function getViewportHeight() {
    return window.innerHeight;
}

/**
 * Get current viewport width
 * @returns {number} Viewport width in pixels
 */
export function getViewportWidth() {
    return window.innerWidth;
}

/**
 * Get current scroll position
 * Uses Lenis smooth scroll value if available, falls back to window.scrollY
 * @param {Object} lenis - Optional Lenis instance
 * @returns {number} Current scroll position in pixels
 */
export function getScrollY(lenis = null) {
    return (lenis && lenis.scroll !== undefined) ? lenis.scroll : window.scrollY;
}

/**
 * Check if current viewport is mobile (<=768px)
 * @returns {boolean} True if mobile viewport
 */
export function isMobile() {
    return window.innerWidth <= 768;
}

/**
 * Check if current viewport is tablet (<=1024px)
 * @returns {boolean} True if tablet viewport or smaller
 */
export function isTablet() {
    return window.innerWidth <= 1024;
}

/**
 * Check if user prefers reduced motion
 * @returns {boolean} True if reduced motion is preferred
 */
export function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get document height
 * @returns {number} Total document height in pixels
 */
export function getDocumentHeight() {
    return document.documentElement.scrollHeight;
}

/**
 * Get element's bounding rect
 * @param {HTMLElement} element - Target element
 * @returns {DOMRect} Element's bounding rectangle
 */
export function getElementRect(element) {
    return element ? element.getBoundingClientRect() : null;
}

// ============================================
// PERFORMANCE UTILITIES
// ============================================

/**
 * Debounce function - delays execution until after wait period of inactivity
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function - limits execution to once per wait period
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Request animation frame with fallback
 * @param {Function} callback - Function to execute on next frame
 * @returns {number} Request ID
 */
export function raf(callback) {
    return window.requestAnimationFrame(callback);
}

/**
 * Cancel animation frame
 * @param {number} id - Request ID to cancel
 */
export function cancelRaf(id) {
    window.cancelAnimationFrame(id);
}

// ============================================
// STORAGE UTILITIES
// ============================================

/**
 * Get item from localStorage with fallback
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if key doesn't exist
 * @returns {*} Stored value or default
 */
export function getLocalStorage(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item !== null ? item : defaultValue;
    } catch (error) {
        return defaultValue;
    }
}

/**
 * Set item in localStorage with error handling
 * @param {string} key - Storage key
 * @param {*} value - Value to store
 * @returns {boolean} Success status
 */
export function setLocalStorage(key, value) {
    try {
        localStorage.setItem(key, value);
        return true;
    } catch (error) {
        console.error('localStorage error:', error);
        return false;
    }
}
