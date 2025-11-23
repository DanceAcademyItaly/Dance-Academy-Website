/**
 * Centralized application state management
 * Single source of truth for all global state
 */

// ============================================
// GLOBAL STATE OBJECT
// ============================================

export const state = {
    // ============================================
    // CONTENT
    // ============================================
    content: null,              // Loaded from content.json
    hasEpisodes: false,         // Whether episodes exist in content

    // ============================================
    // SCROLL STATE
    // ============================================
    scroll: {
        y: 0,                   // Current scroll position
        lastY: 0,               // Previous scroll position
        direction: 'down',      // Scroll direction: 'up' or 'down'
        isScrolling: false,     // Whether actively scrolling
        isSystemInitialized: false,  // Whether Lenis is initialized
    },

    // ============================================
    // SECTION STATE
    // ============================================
    activeSection: null,        // Current active section ('hero', 'episodi', etc.)

    // ============================================
    // VIDEO BACKGROUND STATE
    // ============================================
    video: {
        currentState: null,     // Current video filter state key
    },

    // ============================================
    // HEADER REGISTRY (Complex nested object)
    // ============================================
    // Manages header navigation and progress bar
    header: {
        sections: [
            { name: 'hero', order: 0, enabled: true, targetScroll: 0, registered: false },
            { name: 'episodi', order: 1, enabled: false, targetScroll: null, registered: false },
            { name: 'missione', order: 2, enabled: true, targetScroll: null, registered: false },
            { name: 'candidati', order: 3, enabled: true, targetScroll: null, registered: false },
            { name: 'contatti', order: 4, enabled: true, targetScroll: null, registered: false }
        ],
        maxScroll: null,        // Maximum scroll value (document height - viewport height)
        initialized: false,     // Whether header is fully initialized
        _enabledSectionsCache: null,    // Cache for performance
        _progressDivisionsCache: null,  // Cache for performance
    },

    // ============================================
    // TYPOGRAPHY STATE
    // ============================================
    typography: {
        isSupported: false,     // Whether CSS clamp() is supported
        currentViewportWidth: 0,  // Cached viewport width
        scaleFactor: 1,         // Current scale factor for typography
        resizeTimeout: null,    // Debounce timeout ID
    },

    // ============================================
    // VIEWPORT & PERFORMANCE CACHE
    // ============================================
    cache: {
        viewportHeight: 0,      // Cached window.innerHeight
        viewportWidth: 0,       // Cached window.innerWidth
        documentHeight: 0,      // Cached document height
        isMobile: false,        // Whether in mobile viewport (<=768px)
        lastViewportWidth: 0,   // Previous viewport width (for resize detection)
    },

    // ============================================
    // VIEWPORT STATE (for main.js resize handling)
    // ============================================
    viewport: {
        height: 0,              // Current viewport height
        width: 0,               // Current viewport width
    },

    // ============================================
    // DOM CACHE (for section management)
    // ============================================
    dom: {
        visibleBlocks: [],      // Cached visible section blocks
        documentHeight: 0,      // Document height cache
    },

    // ============================================
    // ANIMATION STATES (for all section modules)
    // ============================================
    animations: {
        hero: null,             // Hero animation state
        episodi: null,          // Episodi animation state
        missione: null,         // Missione animation state
        candidati: null,        // Candidati animation state
        contatti: null,         // Contatti animation state
    },

    // ============================================
    // SECTION BOUNDARIES (for navigation)
    // ============================================
    sectionBoundaries: {
        hero: null,
        episodi: null,
        missione: null,
        candidati: null,
        contatti: null,
    },
};

// ============================================
// STATE MANAGEMENT FUNCTIONS
// ============================================

/**
 * Update state (shallow merge)
 * For simple top-level updates
 * @param {Object} updates - Object with properties to update
 * @example setState({ activeSection: 'hero' })
 */
export function setState(updates) {
    Object.assign(state, updates);
}

/**
 * Get state value
 * Supports dot notation for nested properties
 * @param {string} key - Property path (e.g., 'scroll.y' or 'header.maxScroll')
 * @returns {*} State value, or entire state if no key provided
 * @example
 * getState('scroll.y')           // Returns scroll.y value
 * getState('activeSection')      // Returns activeSection value
 * getState()                     // Returns entire state object
 */
export function getState(key) {
    if (!key) return state;

    const keys = key.split('.');
    let value = state;

    for (const k of keys) {
        value = value[k];
        if (value === undefined) break;
    }

    return value;
}

/**
 * Update nested state property
 * For deep updates using dot notation
 * Creates missing parent objects if needed
 * @param {string} path - Dot-notation path to property
 * @param {*} value - New value
 * @example
 * updateState('scroll.y', 100)
 * updateState('header.initialized', true)
 */
export function updateState(path, value) {
    const keys = path.split('.');
    let current = state;

    // Navigate to parent, creating missing objects
    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!current[key] || typeof current[key] !== 'object') {
            current[key] = {};
        }
        current = current[key];
    }

    // Set final value
    current[keys[keys.length - 1]] = value;
}

/**
 * Deep merge for complex nested updates
 * @param {string} path - Dot-notation path to object to merge
 * @param {Object} updates - Object to merge
 * @example
 * mergeState('scroll', { y: 100, direction: 'down' })
 */
export function mergeState(path, updates) {
    const keys = path.split('.');
    let current = state;

    // Navigate to target
    for (const k of keys) {
        current = current[k];
    }

    // Merge updates
    Object.assign(current, updates);
}

/**
 * Reset state to initial values
 * Useful for testing or cleanup
 */
export function resetState() {
    state.content = null;
    state.hasEpisodes = false;
    state.scroll = {
        y: 0,
        lastY: 0,
        direction: 'down',
        isScrolling: false,
        isSystemInitialized: false,
    };
    state.activeSection = null;
    state.video.currentState = null;
    state.header.initialized = false;
    state.header.maxScroll = null;
    state.header._enabledSectionsCache = null;
    state.header._progressDivisionsCache = null;
    state.typography = {
        isSupported: false,
        currentViewportWidth: 0,
        scaleFactor: 1,
        resizeTimeout: null,
    };
    state.cache = {
        viewportHeight: 0,
        viewportWidth: 0,
        documentHeight: 0,
        isMobile: false,
        lastViewportWidth: 0,
    };
}

/**
 * Initialize cache with current viewport values
 * Should be called on page load and resize
 */
export function initializeCache() {
    state.cache.viewportHeight = window.innerHeight;
    state.cache.viewportWidth = window.innerWidth;
    state.cache.documentHeight = document.documentElement.scrollHeight;
    state.cache.isMobile = window.innerWidth <= 768;
    state.cache.lastViewportWidth = window.innerWidth;
}
