/**
 * Navigation & Header System
 * Handles section registration, active section tracking, header navigation,
 * progress bar updates, and multi-section scrolling
 */

import { getState, updateState } from './state.js';
import { getLenis, scrollTo as scrollToPosition, getScrollY } from './scroll.js';

// ============================================
// NAVIGATION CONFIGURATIONS
// ============================================

// Configuration for header navigation (when clicking header spans)
const HEADER_NAV_CONFIG = {
    duration: 2.0,
    easing: (t) => {
        // Custom easing: very slow start and end, faster in middle
        // Using a modified sine wave for smooth acceleration/deceleration
        return (1 - Math.cos(t * Math.PI)) / 2;
    },
    offset: 0
};

// Configuration for general smooth scrolling
const SCROLL_CONFIG = {
    duration: 0.8,
    easing: (t) => 1 - Math.pow(1 - t, 3),
    offset: 0
};

// ============================================
// MODULE STATE
// ============================================

// Current active section (for section isolation system)
let currentActiveSection = null;

// Flag to prevent progress bar updates during multi-section navigation
let isNavigatingMultiSection = false;

// Cached DOM references
let cachedHeaderSpans = null;
let cachedProgressBar = null;

// Video states for background video management
const VIDEO_STATES = {
    HERO: 'hero',
    EPISODI: 'episodi',
    MISSIONE: 'missione',
    CANDIDATI: 'candidati',
    CONTATTI: 'contatti'
};

// Main section registry - tracks all sections and their scroll positions
const HEADER_REGISTRY = {
    sections: [
        { name: 'hero', order: 0, enabled: true, targetScroll: 0, registered: false },
        { name: 'episodi', order: 1, enabled: false, targetScroll: null, registered: false },
        { name: 'missione', order: 2, enabled: true, targetScroll: null, registered: false },
        { name: 'candidati', order: 3, enabled: true, targetScroll: null, registered: false },
        { name: 'contatti', order: 4, enabled: true, targetScroll: null, registered: false }
    ],
    maxScroll: null,
    initialized: false,
    _enabledSectionsCache: null,
    _progressDivisionsCache: null
};

// ============================================
// SECTION ISOLATION SYSTEM
// ============================================

/**
 * Set active section (isolate sections by adding/removing .active class)
 * Only one section is active at a time for visibility control
 * @param {string} sectionName - Name of section to activate
 */
export function setActiveSection(sectionName) {
    // Skip if already active (performance optimization)
    if (currentActiveSection === sectionName) return;

    currentActiveSection = sectionName;

    // Update all section blocks
    const blocks = document.querySelectorAll('.block');
    blocks.forEach(block => {
        const blockSection = block.dataset.block;
        if (blockSection === sectionName) {
            block.classList.add('active');
        } else {
            block.classList.remove('active');
        }
    });

    // Manage pointer-events for fixed missione elements
    const missioneContainer = document.getElementById('missioneContainer');
    if (missioneContainer) {
        missioneContainer.style.pointerEvents = (sectionName === 'missione') ? 'auto' : 'none';
    }

    // Manage pointer-events for fixed candidati elements
    const candidatiTitleWrapper = document.querySelector('.candidati-title-wrapper');
    const candidatiCardWrappers = document.querySelectorAll('.candidati-card-wrapper');
    const submitButtonContainer = document.querySelector('.submit-button-container');

    if (candidatiTitleWrapper) {
        candidatiTitleWrapper.style.pointerEvents = (sectionName === 'candidati') ? 'auto' : 'none';
    }
    candidatiCardWrappers.forEach(wrapper => {
        wrapper.style.pointerEvents = (sectionName === 'candidati') ? 'auto' : 'none';
    });
    if (submitButtonContainer) {
        submitButtonContainer.style.pointerEvents = (sectionName === 'candidati') ? 'auto' : 'none';
    }

    // Update header highlight
    updateHeaderHighlight(sectionName);
}

/**
 * Apply video background state for a section
 * Controls which background video is visible/playing
 * @param {string} state - Video state to apply (from VIDEO_STATES)
 */
export function applyVideoState(state) {
    const validStates = Object.values(VIDEO_STATES);
    if (!validStates.includes(state)) {
        console.warn(`Invalid video state: ${state}`);
        return;
    }

    const videoElements = document.querySelectorAll('[data-video-state]');

    videoElements.forEach(element => {
        const elementState = element.dataset.videoState;

        if (elementState === state) {
            element.classList.add('active');
            const video = element.querySelector('video');
            if (video && video.paused) {
                video.play().catch(e => console.warn('Video play failed:', e));
            }
        } else {
            element.classList.remove('active');
            const video = element.querySelector('video');
            if (video && !video.paused) {
                video.pause();
            }
        }
    });
}

// ============================================
// HEADER REGISTRY & SECTION REGISTRATION
// ============================================

/**
 * Enable a section in the header registry
 * Should be called before registering a dynamic section (like episodi)
 * @param {string} name - Section name
 * @returns {boolean} True if section was enabled successfully
 */
export function enableSection(name) {
    const section = HEADER_REGISTRY.sections.find(s => s.name === name);

    if (!section) {
        console.warn(`Section "${name}" not found in HEADER_REGISTRY`);
        return false;
    }

    section.enabled = true;

    // Invalidate caches
    HEADER_REGISTRY._enabledSectionsCache = null;
    HEADER_REGISTRY._progressDivisionsCache = null;

    return true;
}

/**
 * Register a section with the header navigation system
 * Sections must register themselves with their scroll positions
 * @param {string} name - Section name
 * @param {number} targetScroll - Scroll position where section is active
 * @param {Object} boundaries - Optional section boundaries
 */
export function registerSection(name, targetScroll, boundaries = null) {
    const section = HEADER_REGISTRY.sections.find(s => s.name === name);

    if (!section) {
        console.warn(`Section "${name}" not found in HEADER_REGISTRY`);
        return;
    }

    section.targetScroll = targetScroll;
    section.registered = true;

    // Store boundaries in state if provided
    if (boundaries) {
        updateState(`sectionBoundaries.${name}`, boundaries);
    }

    // Invalidate caches
    HEADER_REGISTRY._enabledSectionsCache = null;
    HEADER_REGISTRY._progressDivisionsCache = null;

    checkAndEnableHeader();
}

/**
 * Get sorted list of enabled sections (cached for performance)
 * @returns {Array} Sorted array of enabled section objects
 */
function getSortedEnabledSections() {
    if (HEADER_REGISTRY._enabledSectionsCache) {
        return HEADER_REGISTRY._enabledSectionsCache;
    }

    HEADER_REGISTRY._enabledSectionsCache = HEADER_REGISTRY.sections
        .filter(s => s.enabled && s.registered)
        .sort((a, b) => a.order - b.order);

    return HEADER_REGISTRY._enabledSectionsCache;
}

/**
 * Recalculate progress bar divisions based on enabled sections
 * Progress bar is divided equally among all enabled sections
 */
function recalculateProgressDivisions() {
    const enabledSections = getSortedEnabledSections();

    if (enabledSections.length === 0) {
        HEADER_REGISTRY._progressDivisionsCache = null;
        return;
    }

    // Each section gets equal portion of progress bar
    const divisionSize = 100 / enabledSections.length;

    HEADER_REGISTRY._progressDivisionsCache = enabledSections.map((section, index) => ({
        name: section.name,
        startPercent: index * divisionSize,
        endPercent: (index + 1) * divisionSize,
        targetScroll: section.targetScroll
    }));
}

/**
 * Get section at a given scroll position using binary search
 * O(log n) complexity for efficient lookup
 * @param {number} scrollY - Scroll position to check
 * @returns {Object|null} Section object at that scroll position
 */
function getSectionAtScroll(scrollY) {
    const enabledSections = getSortedEnabledSections();
    if (enabledSections.length === 0) return null;

    // Binary search for section
    let left = 0;
    let right = enabledSections.length - 1;
    let result = enabledSections[0];

    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        const section = enabledSections[mid];

        if (scrollY >= section.targetScroll) {
            result = section;
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }

    return result;
}

/**
 * Calculate progress percentage (0-100) based on scroll position
 * Progress is divided equally among enabled sections
 * @param {number} scrollY - Current scroll position
 * @returns {number} Progress percentage (0-100)
 */
function getProgressPercentage(scrollY) {
    if (!HEADER_REGISTRY._progressDivisionsCache) {
        recalculateProgressDivisions();
    }

    const divisions = HEADER_REGISTRY._progressDivisionsCache;
    if (!divisions || divisions.length === 0) return 0;

    const maxScroll = HEADER_REGISTRY.maxScroll;
    if (!maxScroll) return 0;

    // Find current division
    const currentSection = getSectionAtScroll(scrollY);
    if (!currentSection) return 0;

    const division = divisions.find(d => d.name === currentSection.name);
    if (!division) return 0;

    // Calculate progress within current division
    const nextDivision = divisions.find(d => d.startPercent > division.startPercent);
    const divisionStart = division.targetScroll;
    const divisionEnd = nextDivision ? nextDivision.targetScroll : maxScroll;
    const divisionRange = divisionEnd - divisionStart;

    if (divisionRange <= 0) return division.endPercent;

    const progressInDivision = (scrollY - divisionStart) / divisionRange;
    const clampedProgress = Math.max(0, Math.min(1, progressInDivision));

    const divisionSize = division.endPercent - division.startPercent;
    const percentage = division.startPercent + (divisionSize * clampedProgress);

    return Math.min(100, Math.max(0, percentage));
}

/**
 * Check if all enabled sections have registered, and enable header if so
 */
function checkAndEnableHeader() {
    const allEnabled = HEADER_REGISTRY.sections.filter(s => s.enabled);
    const allRegistered = allEnabled.every(s => s.registered);

    if (allRegistered && !HEADER_REGISTRY.initialized) {
        HEADER_REGISTRY.initialized = true;

        // Recalculate progress divisions
        recalculateProgressDivisions();

        // Setup header navigation
        setupHeaderNavigation();

        // Show header with animation
        const header = document.querySelector('.header-fixed');
        if (header) {
            header.classList.add('initialized');
        }
    }
}

// ============================================
// HEADER NAVIGATION SETUP
// ============================================

/**
 * Setup header navigation (enable interaction and click handlers)
 * Called automatically when all sections register
 */
function setupHeaderNavigation() {
    const headerSpans = document.querySelectorAll('.header-fixed span[data-section]');

    headerSpans.forEach(span => {
        const sectionName = span.dataset.section;
        const section = HEADER_REGISTRY.sections.find(s => s.name === sectionName);

        if (!section || !section.enabled || !section.registered) {
            span.style.display = 'none';
            return;
        }

        span.style.pointerEvents = 'all';
        span.style.opacity = ''; // Remove disabled opacity

        span.addEventListener('click', () => scrollToSection(sectionName));
    });
}

// ============================================
// SECTION BOUNDARIES HELPERS
// ============================================

/**
 * Get animation state boundaries for any section
 * Returns normalized object with consistent property names for all sections
 * @param {string} sectionName - Name of section
 * @returns {Object|null} Boundaries object with entranceStart, entranceEnd, deadzoneEnd, exitEnd, bufferEnd
 */
export function getSectionBoundaries(sectionName) {
    // Try to get from state first
    const stateBoundaries = getState(`sectionBoundaries.${sectionName}`);
    if (stateBoundaries) return stateBoundaries;

    // Fallback: try to get from global animation states
    switch(sectionName) {
        case 'episodi':
            const episodiState = getState('animations.episodi');
            if (!episodiState) return null;
            return {
                entranceStart: episodiState.entranceStart,
                entranceEnd: episodiState.entranceEnd,
                deadzoneEnd: episodiState.deadzoneEnd,
                exitEnd: episodiState.exitEnd,
                bufferEnd: episodiState.bufferEnd
            };
        case 'missione':
            const missioneState = getState('animations.missione');
            if (!missioneState) return null;
            return {
                entranceStart: missioneState.entranceStart,
                entranceEnd: missioneState.entranceEnd,
                deadzoneEnd: missioneState.deadzoneEnd,
                exitEnd: missioneState.exitEnd,
                bufferEnd: missioneState.bufferEnd
            };
        case 'candidati':
            const candidatiState = getState('animations.candidati');
            if (!candidatiState) return null;
            // Map candidati-specific property names to normalized names
            return {
                entranceStart: candidatiState.titleEntranceStart,
                entranceEnd: candidatiState.cardEntranceEnd,
                deadzoneEnd: candidatiState.cardDeadzoneEnd,
                exitEnd: candidatiState.exitAnimationEnd,
                bufferEnd: candidatiState.bufferEnd
            };
        case 'contatti':
            const contattiState = getState('animations.contatti');
            if (!contattiState) return null;
            // Contatti is last section, has no exit - use deadzoneEnd as exitEnd
            return {
                entranceStart: contattiState.entranceStart,
                entranceEnd: contattiState.entranceEnd,
                deadzoneEnd: contattiState.deadzoneEnd,
                exitEnd: contattiState.deadzoneEnd, // No real exit, use deadzone
                bufferEnd: contattiState.maxScroll
            };
        case 'hero':
            // Hero occupies scroll range from 0 to where next section starts
            let heroExitEnd = 0;
            const episodiAnimationState = getState('animations.episodi');
            const missioneAnimationState = getState('animations.missione');
            const candidatiCardState = getState('animations.candidati');

            if (episodiAnimationState && episodiAnimationState.entranceStart) {
                heroExitEnd = episodiAnimationState.entranceStart;
            } else if (missioneAnimationState && missioneAnimationState.entranceStart) {
                heroExitEnd = missioneAnimationState.entranceStart;
            } else if (candidatiCardState && candidatiCardState.titleEntranceStart) {
                heroExitEnd = candidatiCardState.titleEntranceStart;
            }

            return {
                entranceStart: 0,
                entranceEnd: 0,
                deadzoneEnd: 0,
                exitEnd: heroExitEnd,
                bufferEnd: heroExitEnd
            };
        default:
            return null;
    }
}

/**
 * Get current section based on scroll position
 * @returns {Object|null} Current section object
 */
export function getCurrentSection() {
    const scrollY = getScrollY();
    return getSectionAtScroll(scrollY);
}

/**
 * Calculate user's progress (0-1) through a section based on boundaries
 * @param {number} scrollY - Current scroll position
 * @param {Object} boundaries - Section boundaries {entranceStart, entranceEnd, deadzoneEnd, exitEnd}
 * @returns {number} Progress through section (0-1)
 */
export function calculateSectionProgress(scrollY, boundaries) {
    if (!boundaries) return 0.5;

    const { entranceStart, exitEnd } = boundaries;
    const totalRange = exitEnd - entranceStart;

    if (totalRange <= 0) return 0.5;

    const progressInRange = scrollY - entranceStart;
    return Math.max(0, Math.min(1, progressInRange / totalRange));
}

/**
 * Calculate scroll position for a given progress through a section
 * @param {Object} boundaries - Section boundaries {entranceStart, exitEnd}
 * @param {number} progress - Desired progress (0-1)
 * @returns {number} Scroll Y position
 */
export function calculateScrollForProgress(boundaries, progress) {
    if (!boundaries) return 0;

    const { entranceStart, exitEnd } = boundaries;
    const totalRange = exitEnd - entranceStart;

    return entranceStart + (totalRange * progress);
}

// ============================================
// SECTION SCROLLING
// ============================================

/**
 * Get distance between two sections (in section count)
 * @param {Object} fromSection - Source section
 * @param {Object} toSection - Target section
 * @returns {number} Number of sections between them
 */
function getSectionDistance(fromSection, toSection) {
    if (!fromSection || !toSection) return 0;
    return Math.abs(toSection.order - fromSection.order);
}

/**
 * Scroll to a registered section with intelligent multi-section skip
 * Handles adjacent sections (standard scroll) and multi-section jumps (3-phase)
 * @param {string} sectionName - Name of section to scroll to
 */
export function scrollToSection(sectionName) {
    const targetSection = HEADER_REGISTRY.sections.find(s => s.name === sectionName);

    if (!targetSection || !targetSection.registered) {
        console.warn(`Cannot navigate to unregistered section: ${sectionName}`);
        return;
    }

    const targetScroll = targetSection.targetScroll;
    let currentSection = getCurrentSection();

    // Standard easing function: cubic-bezier(0.4, 0, 0.2, 1) - Material Design "standard easing"
    const standardEasing = (t) => {
        const p1x = 0.4, p1y = 0, p2x = 0.2, p2y = 1;
        const cx = 3 * p1x;
        const bx = 3 * (p2x - p1x) - cx;
        const ax = 1 - cx - bx;
        const cy = 3 * p1y;
        const by = 3 * (p2y - p1y) - cy;
        const ay = 1 - cy - by;
        return ((ay * t + by) * t + cy) * t;
    };

    // Already on target section - don't scroll (user is already viewing this section)
    if (currentSection && currentSection.name === sectionName) {
        return;
    }

    // No current section detected - treat as navigating from hero
    if (!currentSection) {
        const heroSection = HEADER_REGISTRY.sections.find(s => s.name === 'hero');
        if (heroSection) {
            currentSection = heroSection;
        } else {
            // Fallback: simple navigation if hero not registered
            const lenis = getLenis();
            if (lenis) {
                lenis.scrollTo(targetScroll, {
                    duration: 2.5,
                    easing: standardEasing
                });
            } else {
                window.scrollTo({ top: targetScroll, behavior: 'smooth' });
            }
            return;
        }
    }

    const distance = getSectionDistance(currentSection, targetSection);

    // Adjacent sections (distance = 1): Standard navigation
    if (distance === 1) {
        const lenis = getLenis();
        if (lenis) {
            lenis.scrollTo(targetScroll, {
                duration: 2.5,
                easing: standardEasing
            });
        } else {
            window.scrollTo({ top: targetScroll, behavior: 'smooth' });
        }
        return;
    }

    // Multi-section jump (distance > 1): 3-phase navigation
    const lenis = getLenis();
    if (lenis) {
        const currentBoundaries = getSectionBoundaries(currentSection.name);
        const targetBoundaries = getSectionBoundaries(sectionName);

        if (!currentBoundaries || !targetBoundaries) {
            lenis.scrollTo(targetScroll, {
                duration: 2.5,
                easing: standardEasing
            });
            return;
        }

        // Determine navigation direction
        const isForward = targetSection.order > currentSection.order;

        const exitPoint = isForward ? currentBoundaries.exitEnd || currentBoundaries.deadzoneEnd : currentBoundaries.entranceStart;
        const entrancePoint = isForward ? targetBoundaries.entranceStart : targetBoundaries.exitEnd;

        if (exitPoint === undefined || entrancePoint === undefined || targetScroll === undefined) {
            lenis.scrollTo(targetScroll, {
                duration: 2.5,
                easing: standardEasing
            });
            return;
        }

        const phase3Distance = Math.abs(targetScroll - entrancePoint);

        isNavigatingMultiSection = true;

        // Animate progress bar independently using CSS transition
        if (cachedProgressBar) {
            const targetProgress = getProgressPercentage(targetScroll);

            cachedProgressBar.style.transition = 'width 2.4s cubic-bezier(0.4, 0, 0.2, 1)';

            // Trigger CSS animation by setting target width
            // This will smoothly animate from current width to target over 2.4s
            cachedProgressBar.style.width = targetProgress + '%';
        }

        // PHASE 1: Exit current section (0.8s)
        lenis.scrollTo(exitPoint, {
            duration: 0.8,
            easing: standardEasing,
            onComplete: () => {
                // PHASE 2: Instant skip to target section entrance (0s)
                lenis.scrollTo(entrancePoint, {
                    duration: 0,
                    immediate: true,
                    onComplete: () => {
                        // PHASE 3: Enter target section (1.7s)
                        // Skip if distance is negligible (< 5px)
                        if (phase3Distance >= 5) {
                            lenis.scrollTo(targetScroll, {
                                duration: 1.7,
                                easing: standardEasing,
                                onComplete: () => {
                                    // Restore default transition and re-enable automatic updates
                                    if (cachedProgressBar) {
                                        cachedProgressBar.style.transition = 'width 0.1s linear';
                                    }
                                    isNavigatingMultiSection = false;
                                }
                            });
                        } else {
                            // Restore default transition and re-enable automatic updates
                            if (cachedProgressBar) {
                                cachedProgressBar.style.transition = 'width 0.1s linear';
                            }
                            isNavigatingMultiSection = false;
                        }
                    }
                });
            }
        });
    } else {
        // Fallback for no Lenis
        window.scrollTo({ top: targetScroll, behavior: 'smooth' });
    }
}

// ============================================
// PROGRESS BAR & HEADER UPDATES
// ============================================

/**
 * Update progress bar width based on scroll position
 * Called from scroll RAF loop
 * @param {number} scrollY - Current scroll position
 */
export function updateProgressBar(scrollY) {
    if (!cachedProgressBar) return;

    // Skip automatic updates during multi-section navigation
    // Progress bar is animated independently via CSS transition
    if (isNavigatingMultiSection) return;

    const percentage = getProgressPercentage(scrollY);
    cachedProgressBar.style.width = percentage + '%';
}

/**
 * Update header span highlighting based on active section
 * Called automatically by setActiveSection()
 * @param {string} sectionName - Name of active section
 */
function updateHeaderHighlight(sectionName) {
    if (!cachedHeaderSpans) return;

    cachedHeaderSpans.forEach(span => {
        if (span.dataset.section === sectionName) {
            span.classList.add('active');
        } else {
            span.classList.remove('active');
        }
    });
}

// ============================================
// ENHANCED NAVIGATION SETUP
// ============================================

/**
 * Setup enhanced anchor navigation with smooth scroll
 * Called after scroll system initialization
 * Works with or without Lenis
 */
export function setupEnhancedNavigation() {
    const lenis = getLenis();

    // Handle all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            const target = document.querySelector(href);

            if (target) {
                e.preventDefault();
                if (lenis) {
                    lenis.scrollTo(target, SCROLL_CONFIG);
                } else {
                    // Fallback for basic scroll
                    smoothScrollToTarget(target, SCROLL_CONFIG);
                }
            }
        });
    });

    // Setup scroll-based navigation highlight
    setupNavigationHighlighting();
}

/**
 * Setup navigation highlighting based on scroll position
 * Works with or without Lenis
 */
function setupNavigationHighlighting() {
    const lenis = getLenis();

    if (lenis) {
        // Listen to scroll events from Lenis
        lenis.on('scroll', (e) => {
            updateNavigationHighlight(e.scroll);
        });
    } else {
        // Fallback: listen to window scroll events
        window.addEventListener('scroll', () => {
            updateNavigationHighlight(window.scrollY);
        });
    }
}

/**
 * Update navigation links highlighting based on scroll
 * @param {number} scrollY - Current scroll position
 */
function updateNavigationHighlight(scrollY) {
    const navItems = document.querySelectorAll('nav a[href^="#"]');
    navItems.forEach(item => {
        const href = item.getAttribute('href');
        const target = document.querySelector(href);

        if (target) {
            const rect = target.getBoundingClientRect();
            const isActive = rect.top <= 100 && rect.bottom >= 100;

            if (isActive) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        }
    });
}

// ============================================
// DOM CACHE INITIALIZATION
// ============================================

/**
 * Initialize DOM cache for navigation elements
 * Called after DOM ready
 */
export function initNavigationCache() {
    cachedHeaderSpans = document.querySelectorAll('.header-fixed span[data-section]');
    cachedProgressBar = document.getElementById('progressBar');
}

// ============================================
// REGISTRY ACCESS & MANAGEMENT
// ============================================

/**
 * Set maximum scroll value for progress calculations
 * Called by last section (contatti) after initialization
 * @param {number} maxScroll - Maximum scroll position
 */
export function setMaxScroll(maxScroll) {
    HEADER_REGISTRY.maxScroll = maxScroll;
    // Recalculate progress divisions with new max scroll
    recalculateProgressDivisions();
}

/**
 * Get header registry (for debugging/inspection)
 * @returns {Object} HEADER_REGISTRY object
 */
export function getHeaderRegistry() {
    return HEADER_REGISTRY;
}
