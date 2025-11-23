/**
 * Smooth scroll system using Lenis
 * Handles initialization, RAF loop, and scroll callbacks
 */

import { setState, getState, updateState } from './state.js';
import { prefersReducedMotion, getLocalStorage, setLocalStorage, easeOutCubic } from './utils.js';

// ============================================
// MODULE STATE
// ============================================

let lenis = null;
let rafId = null;
const scrollCallbacks = [];

// ============================================
// FEATURE DETECTION
// ============================================

/**
 * Check if browser supports Lenis features
 * @returns {boolean} True if all required features are supported
 */
function supportsLenisFeatures() {
    return !!(
        window.requestAnimationFrame &&
        'addEventListener' in window &&
        'classList' in document.documentElement &&
        window.Lenis &&
        typeof window.Lenis === 'function'
    );
}

// ============================================
// REDUCED MOTION HANDLING
// ============================================

/**
 * Check user's reduced motion preference override
 * @returns {boolean} True if user wants to override reduced motion
 */
function shouldOverrideReducedMotion() {
    return getLocalStorage('override-reduced-motion', null) === 'true';
}

/**
 * Show dialog asking user if they want to enable smooth scrolling
 * despite reduced motion preference
 */
function showMotionPreferenceOverride() {
    const existingNotice = document.getElementById('motion-preference-notice');
    if (existingNotice) return; // Avoid duplicate notices

    const notice = document.createElement('div');
    notice.id = 'motion-preference-notice';
    notice.innerHTML = `
        <div style="position: fixed; top: 20px; left: 50%; transform: translateX(-50%); z-index: 10000; background: var(--bg-strong); border: 1px solid var(--border-default); border-radius: 8px; padding: 16px 20px; max-width: 500px; text-align: center; color: var(--text-primary); backdrop-filter: blur(10px);">
            <p style="margin: 0 0 12px 0; font-size: 14px; line-height: 1.4;">You have reduced motion enabled. Would you like to enable smooth scrolling for a premium experience?</p>
            <div style="display: flex; gap: 12px; justify-content: center;">
                <button id="enable-smooth-scroll" style="background: var(--accent); color: var(--black); border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-size: 14px; font-weight: 500;">Enable Smooth Scrolling</button>
                <button id="keep-reduced-motion" style="background: transparent; color: var(--text-secondary); border: 1px solid var(--border-default); padding: 8px 16px; border-radius: 4px; cursor: pointer; font-size: 14px;">Keep Current Setting</button>
            </div>
        </div>
    `;

    document.body.appendChild(notice);

    // Enable smooth scrolling
    document.getElementById('enable-smooth-scroll').addEventListener('click', () => {
        setLocalStorage('override-reduced-motion', 'true');
        notice.remove();
        initEnhancedScrollSystem();
    });

    // Keep reduced motion
    document.getElementById('keep-reduced-motion').addEventListener('click', () => {
        setLocalStorage('override-reduced-motion', 'false');
        notice.remove();
    });
}

// ============================================
// LENIS INITIALIZATION
// ============================================

/**
 * Initialize enhanced scroll system with Lenis
 */
function initEnhancedScrollSystem() {
    if (!supportsLenisFeatures()) {
        initBasicScroll();
        return;
    }

    try {
        // Initialize Lenis with balanced smoothness and responsiveness
        lenis = new window.Lenis({
            lerp: 0.08,             // Reduced for more responsive feel
            duration: 0.8,          // Shorter duration for less latency
            easing: (t) => easeOutCubic(t), // Ease-out cubic for natural deceleration
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            mouseMultiplier: 1,     // Standard mouse sensitivity
            smoothTouch: false,     // Keep disabled for performance
            touchMultiplier: 1.5,   // Balanced touch scrolling
            wheelMultiplier: 1,     // Standard wheel sensitivity
            infinite: false,
            orientation: 'vertical',
            normalizeWheel: true,
            // Prevent Lenis from capturing events on specific elements
            prevent: (node) => {
                // Prevent Lenis on elements with data-lenis-prevent attribute
                if (node.hasAttribute && node.hasAttribute('data-lenis-prevent')) {
                    return true;
                }
                // Prevent Lenis on elements with data-lenis-prevent-touch attribute
                if (node.hasAttribute && node.hasAttribute('data-lenis-prevent-touch')) {
                    return true;
                }
                // Prevent Lenis on elements with data-lenis-prevent-wheel attribute
                if (node.hasAttribute && node.hasAttribute('data-lenis-prevent-wheel')) {
                    return true;
                }

                return false;
            }
        });

        // Mark as initialized
        updateState('scroll.isSystemInitialized', true);
        document.documentElement.classList.add('js-loaded', 'lenis-enabled', 'lenis', 'lenis-smooth');

        // Initialize RAF loop
        startRAF();

    } catch (error) {
        console.error('Error initializing Lenis:', error);
        initBasicScroll(); // Fallback to basic scroll
    }
}

/**
 * Initialize basic scroll fallback (no Lenis)
 */
function initBasicScroll() {
    // Enhanced smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    document.documentElement.classList.add('js-loaded', 'basic-scroll-enabled');

    // Start RAF for basic scroll callbacks
    startFallbackRAF();
}

// ============================================
// RAF LOOP
// ============================================

/**
 * Start RAF loop with Lenis
 */
function startRAF() {
    if (!lenis) {
        console.error('Cannot initialize RAF: Lenis not initialized');
        return;
    }

    function raf(time) {
        lenis.raf(time);

        // Get smooth scroll value from Lenis
        const scrollY = lenis.scroll;
        const lastY = getState('scroll.lastY');

        // Update state
        updateState('scroll.y', scrollY);
        updateState('scroll.lastY', scrollY);
        updateState('scroll.direction', scrollY > lastY ? 'down' : 'up');
        updateState('scroll.isScrolling', true);

        // Call all registered callbacks
        scrollCallbacks.forEach(cb => cb(scrollY));

        rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);
}

/**
 * Start RAF loop without Lenis (fallback)
 */
function startFallbackRAF() {
    function raf() {
        const scrollY = window.scrollY;
        const lastY = getState('scroll.lastY');

        // Update state
        updateState('scroll.y', scrollY);
        updateState('scroll.lastY', scrollY);
        updateState('scroll.direction', scrollY > lastY ? 'down' : 'up');
        updateState('scroll.isScrolling', true);

        // Call all registered callbacks
        scrollCallbacks.forEach(cb => cb(scrollY));

        rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);
}

// ============================================
// PUBLIC API
// ============================================

/**
 * Initialize scroll system
 * Checks for reduced motion, Lenis availability, and initializes appropriate system
 * MUST be called after DOM ready but before sections initialize
 */
export function initScroll() {
    // Check reduced motion preference
    const hasReducedMotion = prefersReducedMotion();
    const hasOverride = shouldOverrideReducedMotion();

    if (hasReducedMotion && !hasOverride) {
        // Initialize basic scroll FIRST so site works
        initBasicScroll();
        // Then show override dialog (user can enable Lenis later)
        showMotionPreferenceOverride();
        return;
    }

    // Initialize appropriate scroll system
    if (hasOverride || !hasReducedMotion) {
        initEnhancedScrollSystem();
    } else {
        initBasicScroll();
    }
}

/**
 * Register scroll callback
 * @param {Function} callback - Function to call on scroll (receives scrollY)
 * @returns {Function} Unsubscribe function
 */
export function onScroll(callback) {
    scrollCallbacks.push(callback);

    // Return unsubscribe function
    return () => {
        const index = scrollCallbacks.indexOf(callback);
        if (index > -1) scrollCallbacks.splice(index, 1);
    };
}

/**
 * Scroll to element or position
 * @param {string|HTMLElement|number} target - Selector, element, or scroll position
 * @param {Object} options - Scroll options (offset, duration, easing)
 */
export function scrollTo(target, options = {}) {
    if (lenis) {
        lenis.scrollTo(target, options);
    } else {
        // Fallback for basic scroll
        if (typeof target === 'number') {
            window.scrollTo({
                top: target,
                behavior: 'smooth'
            });
        } else {
            const element = typeof target === 'string' ? document.querySelector(target) : target;
            element?.scrollIntoView({ behavior: 'smooth' });
        }
    }
}

/**
 * Get current scroll position
 * @returns {number} Current scroll position in pixels
 */
export function getScrollY() {
    return getState('scroll.y') || (lenis ? lenis.scroll : window.scrollY);
}

/**
 * Get Lenis instance (if initialized)
 * @returns {Object|null} Lenis instance or null
 */
export function getLenis() {
    return lenis;
}

/**
 * Destroy scroll system and cleanup
 */
export function destroy() {
    if (lenis) {
        lenis.destroy();
        lenis = null;
    }
    if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
    }
    scrollCallbacks.length = 0;
    updateState('scroll.isSystemInitialized', false);
}
