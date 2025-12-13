/**
 * Dance Academy Website - Main Entry Point
 * Orchestrates all modules and manages initialization sequence
 */

import { getState, updateState } from './state.js';
import { loadContent, populateContent, createEpisodeContent } from './content.js';
import { initScroll, onScroll, getScrollY, getLenis } from './scroll.js';
import { initHero, updateHero, handleHeroResize } from './hero.js';
import {
    setActiveSection,
    applyVideoState,
    registerSection,
    enableSection,
    updateProgressBar,
    setupEnhancedNavigation,
    initNavigationCache,
    setMaxScroll
} from './navigation.js';
import {
    checkEpisodesExist,
    initEpisodiFixedSystem,
    updateEpisodiAnimations,
    preserveEpisodeNavigation,
    toggleSeason,
    switchEpisode,
    preloadRemainingEpisodes,
    handleEpisodiResize,
    handleMobileDesktopTransition,
    initializeCarousels
} from './episodes.js';
import {
    initMissioneAnimations,
    updateMissioneAnimations,
    recalculateMissioneBoundaries
} from './mission.js';
import {
    initCandidatiCardStack,
    updateCandidatiCardStack,
    recalculateCandidatiBoundaries
} from './candidates.js';
import {
    initContacts,
    updateContacts,
    handleContactsResize
} from './contacts.js';

// ============================================
// MODULE STATE
// ============================================

let hasEpisodes = false;
let scrollSystemInitialized = false;
let introComplete = false;

// Animation states (cached references)
let episodiAnimationState = null;
let missioneAnimationState = null;
let candidatiCardState = null;

// ============================================
// VIEWPORT HEIGHT MANAGEMENT
// ============================================

/**
 * Update CSS custom property for dynamic viewport height
 * Accounts for mobile browser address bar showing/hiding
 */
function updateViewportHeight() {
    const vh = window.innerHeight;
    document.documentElement.style.setProperty('--viewport-height', `${vh}px`);
    document.documentElement.style.setProperty('--viewport-height-px', `${vh}px`);
}

/**
 * Lock orientation to portrait on mobile devices
 */
function lockOrientationToPortrait() {
    // Check if on mobile and orientation API is available
    if (window.innerWidth <= 768) {
        if (screen.orientation && screen.orientation.lock) {
            screen.orientation.lock('portrait').catch((err) => {
                console.log('Orientation lock not supported:', err);
            });
        }
    }
}

// ============================================
// CONTENT LOADING & POPULATION
// ============================================

/**
 * Main content loading function
 * Called on DOMContentLoaded
 */
async function loadAndPopulateContent() {
    try {
        // Load content from content.json
        const content = await loadContent();

        // Check if episodes exist
        hasEpisodes = checkEpisodesExist(content);
        updateState('hasEpisodes', hasEpisodes);

        // Initialize navigation DOM cache early
        initNavigationCache();

        // Disable header spans until all sections register
        const headerSpans = document.querySelectorAll('.header-fixed span[data-section]');
        headerSpans.forEach(span => {
            span.style.pointerEvents = 'none';
            span.style.opacity = '0.3';
        });

        // Populate DOM with content
        // Pass dependencies that content population needs
        populateContent(content, {
            initHeroAnimations: initHero,
            scrollToSection: (sectionName) => {
                // Import scrollToSection dynamically
                import('./navigation.js').then(({ scrollToSection }) => {
                    scrollToSection(sectionName);
                });
            },
            toggleSeason,
            switchEpisode,
            initializeCarousels, // ✅ FIX: Actually call the imported function instead of empty stub
            updateVisibleBlocks: () => {
                // Update cached visible blocks (for section isolation)
                const blocks = document.querySelectorAll('.block');
                const visibleBlocks = Array.from(blocks).filter(block =>
                    getComputedStyle(block).display !== 'none'
                );
                updateState('dom.visibleBlocks', visibleBlocks);
            }
        });

        // Initialize section isolation system IMMEDIATELY
        // CRITICAL: Must be called after populateContent() but before intro sequence
        setActiveSection('hero');
        applyVideoState('hero');

        // Initialize scroll system with intro sequence
        initializeScrollSystem();

    } catch (error) {
        console.error('Error initializing website:', error);
        // Try to initialize with fallback content
        initializeScrollSystem();
    }

    // Initialize viewport dimensions in state
    updateState('viewport.width', window.innerWidth);
    updateState('viewport.height', window.innerHeight);
    updateState('cache.isMobile', window.innerWidth <= 768);
}

// ============================================
// SCROLL SYSTEM INITIALIZATION
// ============================================

/**
 * Initialize scroll system with intro sequence
 * Handles intro video, resource loading, and Lenis initialization
 */
function initializeScrollSystem() {
    let scrollEnabled = false;

    // Prevent scroll until intro completes
    document.body.style.overflow = 'hidden';

    function preventScroll(e) {
        if (!scrollEnabled) {
            e.preventDefault();
            return false;
        }
    }

    window.addEventListener('scroll', preventScroll, { passive: false });
    window.addEventListener('wheel', preventScroll, { passive: false });
    window.addEventListener('touchmove', preventScroll, { passive: false });
    window.addEventListener('keydown', (e) => {
        if (!scrollEnabled && [32, 33, 34, 35, 36, 37, 38, 39, 40].includes(e.keyCode)) {
            e.preventDefault();
            return false;
        }
    });

    // Check if critical resources are ready
    function checkCriticalResourcesReady() {
        return new Promise((resolve) => {
            const resources = {
                heroLogo: false,
                activeEpisode: false,
                backgroundVideo: false
            };

            // Hero logo
            const heroLogo = document.getElementById('heroLogo');
            if (heroLogo) {
                if (heroLogo.complete) {
                    resources.heroLogo = true;
                } else {
                    heroLogo.onload = () => {
                        resources.heroLogo = true;
                        checkAllReady();
                    };
                    heroLogo.onerror = () => {
                        resources.heroLogo = true;
                        checkAllReady();
                    };
                }
            } else {
                resources.heroLogo = true;
            }

            // Active episode (if exists)
            const activeEpisode = document.querySelector('.episodio-content.active iframe');
            if (activeEpisode) {
                setTimeout(() => {
                    resources.activeEpisode = true;
                    checkAllReady();
                }, 1000);
            } else {
                resources.activeEpisode = true;
            }

            // Background video
            const videoBg = document.getElementById('videoBg');
            if (videoBg) {
                if (videoBg.readyState >= 3) {
                    resources.backgroundVideo = true;
                } else {
                    videoBg.addEventListener('canplay', () => {
                        resources.backgroundVideo = true;
                        checkAllReady();
                    }, { once: true });
                }
            } else {
                resources.backgroundVideo = true;
            }

            function checkAllReady() {
                if (resources.heroLogo && resources.activeEpisode && resources.backgroundVideo) {
                    resolve();
                }
            }

            checkAllReady();

            // Timeout: resolve after 5 seconds max
            setTimeout(() => resolve(), 5000);
        });
    }

    // Intro sequence
    const introLogo = document.getElementById('introLogo');
    if (introLogo) {
        function startIntroSequence() {
            introLogo.play().then(() => {
                const introOverlay = document.querySelector('.intro-overlay');
                const introText = document.getElementById('introText');
                const videoBg = document.getElementById('videoBg');
                const introLoader = document.getElementById('introLoader');

                introLogo.classList.add('animate');
                if (introOverlay) introOverlay.classList.add('animate');
                if (introText) introText.classList.add('animate');

                // Start background video fade-in
                setTimeout(() => {
                    if (videoBg) videoBg.classList.add('animate');
                }, 5000);

                // Wait for intro video to end (5.5s), then check resources
                setTimeout(async () => {
                    await checkCriticalResourcesReady();

                    if (introLoader) {
                        introLoader.classList.remove('visible');
                    }

                    // Enable scrolling
                    scrollEnabled = true;
                    introComplete = true;
                    document.body.style.overflow = 'auto';
                    window.removeEventListener('scroll', preventScroll);
                    window.removeEventListener('wheel', preventScroll);
                    window.removeEventListener('touchmove', preventScroll);

                    // Initialize enhanced scroll system after intro
                    initializeEnhancedScrollAfterIntro();
                }, 5500);

                // Show loader if resources not ready 100ms before intro ends
                setTimeout(() => {
                    checkCriticalResourcesReady().then(() => {
                        // Resources ready
                    }).catch(() => {
                        // Resources not ready, show loader
                        if (introLoader && !scrollEnabled) {
                            introLoader.classList.add('visible');
                            introLogo.pause();
                        }
                    });
                }, 5400);

            }).catch(() => {
                // Video playback failed - skip intro
                const introOverlay = document.querySelector('.intro-overlay');
                const introText = document.getElementById('introText');
                const videoBg = document.getElementById('videoBg');

                introLogo.classList.add('animate');
                if (introOverlay) introOverlay.classList.add('animate');
                if (introText) introText.classList.add('animate');
                if (videoBg) videoBg.classList.add('animate');

                setTimeout(() => {
                    scrollEnabled = true;
                    introComplete = true;
                    document.body.style.overflow = 'auto';
                    window.removeEventListener('scroll', preventScroll);
                    window.removeEventListener('wheel', preventScroll);
                    window.removeEventListener('touchmove', preventScroll);

                    initializeEnhancedScrollAfterIntro();
                }, 1000);
            });
        }

        // Start intro when video is ready
        if (introLogo.readyState >= 3) {
            startIntroSequence();
        } else {
            introLogo.addEventListener('canplay', startIntroSequence, { once: true });

            // Fallback: start after 10 seconds max
            setTimeout(() => {
                if (!scrollEnabled) {
                    startIntroSequence();
                }
            }, 10000);
        }
    } else {
        // No intro video - start immediately
        setTimeout(() => {
            scrollEnabled = true;
            introComplete = true;
            document.body.style.overflow = 'auto';
            window.removeEventListener('scroll', preventScroll);
            window.removeEventListener('wheel', preventScroll);
            window.removeEventListener('touchmove', preventScroll);

            initializeEnhancedScrollAfterIntro();
        }, 1000);
    }

    // Style required field asterisks
    styleRequiredFields();

    // Initialize form handler (if exists)
    if (window.initFormHandler) {
        window.initFormHandler();
    }
}

/**
 * Style required form fields with asterisks
 */
function styleRequiredFields() {
    const requiredFields = document.querySelectorAll('.required');
    requiredFields.forEach(field => {
        const placeholder = field.getAttribute('placeholder');
        if (placeholder && placeholder.includes('*') && field.tagName !== 'SELECT') {
            const newPlaceholder = placeholder.replace(' *', '');
            field.setAttribute('placeholder', newPlaceholder);

            const asterisk = document.createElement('span');
            asterisk.textContent = '*';
            asterisk.className = 'required-label';
            field.parentNode.appendChild(asterisk);
        }
    });
}

/**
 * Initialize enhanced scroll system after intro completes
 * Sets up Lenis, navigation, and all animation systems
 */
function initializeEnhancedScrollAfterIntro() {
    // Initialize Lenis scroll system (handles reduced motion, feature detection)
    initScroll();

    scrollSystemInitialized = true;
    updateState('scroll.isSystemInitialized', true);

    // Setup enhanced anchor navigation
    setupEnhancedNavigation();

    // Preserve episode navigation (if episodes exist)
    if (hasEpisodes) {
        preserveEpisodeNavigation();
    }

    // Initialize all animation systems and register scroll targets
    initializeAllAnimationSystems();

    // Setup scroll RAF loop
    setupScrollRAF();

    // Preload remaining episodes after 2 seconds (if episodes exist)
    if (hasEpisodes) {
        setTimeout(() => {
            preloadRemainingEpisodes();
        }, 2000);
    }
}

// ============================================
// ANIMATION SYSTEMS INITIALIZATION
// ============================================

/**
 * Initialize all section animation systems in correct order
 * Each section registers itself with the navigation system
 */
function initializeAllAnimationSystems() {
    // 1. Hero (instant registration at scroll position 0)
    registerSection('hero', 0);

    // 2. Episodi (if content exists)
    if (hasEpisodes) {
        try {
            initEpisodiFixedSystem();
            // Cache animation state reference
            episodiAnimationState = getState('animations.episodi');
        } catch (error) {
            console.error('Error initializing episodi:', error);
        }
    }

    // 3. Missione
    initMissioneAnimations();
    missioneAnimationState = getState('animations.missione');

    // 4. Candidati
    const candidatiBufferEnd = initCandidatiCardStack();
    candidatiCardState = getState('animations.candidati');

    // 5. Contatti (last section - returns maxScroll for HEADER_REGISTRY)
    const maxScroll = initContacts(candidatiBufferEnd, registerSection);
    if (maxScroll !== null) {
        setMaxScroll(maxScroll);
    }
}

// ============================================
// SCROLL RAF LOOP
// ============================================

/**
 * Setup scroll RAF loop
 * Registers callback with scroll system to update all animations
 */
function setupScrollRAF() {
    onScroll((scrollY) => {
        // Update progress bar
        updateProgressBar(scrollY);

        // Update hero animations
        updateHero(scrollY);

        // Update episodi animations (if exists)
        if (episodiAnimationState) {
            updateEpisodiAnimations(scrollY);
        }

        // Update missione animations
        if (missioneAnimationState) {
            updateMissioneAnimations(scrollY, missioneAnimationState);
        }

        // Update candidati animations
        if (candidatiCardState) {
            updateCandidatiCardStack(scrollY, candidatiCardState);
        }

        // Update contatti animations
        updateContacts(scrollY);
    });
}

// ============================================
// RESIZE HANDLING
// ============================================

/**
 * Handle window resize
 * Recalculates boundaries, updates cached values, and handles mobile/desktop transitions
 */
let resizeTimeout = null;
function handleResize() {
    if (resizeTimeout) {
        clearTimeout(resizeTimeout);
    }

    resizeTimeout = setTimeout(() => {
        const previousWidth = getState('viewport.width');
        const previousHeight = getState('viewport.height');
        const currentWidth = window.innerWidth;
        const currentHeight = window.innerHeight;

        // Detect mobile/desktop transition (crossing 768px threshold)
        const wasMobile = previousWidth <= 768;
        const isMobile = currentWidth <= 768;
        const crossedThreshold = wasMobile !== isMobile;

        // Detect significant height changes (address bar toggle)
        const heightChanged = Math.abs(currentHeight - previousHeight) > 20;

        // Update viewport height CSS custom property if height changed
        if (heightChanged) {
            updateViewportHeight();
        }

        // Update viewport dimensions in state
        updateState('viewport.height', currentHeight);
        updateState('viewport.width', currentWidth);
        updateState('cache.isMobile', isMobile);

        // Recalculate hero ranges
        handleHeroResize();

        // Recalculate section boundaries
        recalculateMissioneBoundaries();
        recalculateCandidatiBoundaries();

        // CRITICAL: Force animation updates with new boundaries
        // After recalculating boundaries, section elements are in stale state until next scroll
        // Force immediate update with current scroll position to prevent disappearance/misalignment
        const currentScrollY = getState('scroll.y') || window.scrollY || window.pageYOffset || 0;

        const missioneState = getState('animations.missione');
        if (missioneState) {
            updateMissioneAnimations(currentScrollY, missioneState);
        }

        const candidatiState = getState('animations.candidati');
        if (candidatiState) {
            updateCandidatiCardStack(currentScrollY, candidatiState);
        }

        // Recalculate episodi (if exists)
        if (hasEpisodes) {
            handleEpisodiResize();

            // Handle mobile/desktop transition (carousel reinit)
            if (crossedThreshold) {
                handleMobileDesktopTransition();
            }
        }

        // Recalculate contatti
        if (candidatiState && candidatiState.bufferEnd) {
            handleContactsResize(candidatiState.bufferEnd, registerSection);
        }

        // Update cached document height
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        updateState('dom.documentHeight', docHeight);

        // Update max scroll if height changed (for progress bar calculation)
        if (heightChanged) {
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            updateState('scroll.maxScroll', maxScroll);
        }
    }, 150); // Debounce 150ms
}

window.addEventListener('resize', handleResize);

// Add visualViewport listener for reliable mobile viewport tracking
// This fires when address bar collapses/expands, which window.resize misses
if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', handleResize);
}

// ============================================
// INITIALIZATION
// ============================================

// Set initial viewport height
updateViewportHeight();

// Lock orientation to portrait on mobile
lockOrientationToPortrait();

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', loadAndPopulateContent);

// Export for debugging
export {
    hasEpisodes,
    scrollSystemInitialized,
    introComplete
};
