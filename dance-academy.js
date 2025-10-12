// Dance Academy - Pergamena Unica
let siteContent = null;
let hasEpisodes = false;

// Lenis smooth scroll variables
let lenis = null;
let isScrollSystemInitialized = false;

// Reusable scroll configuration
const SCROLL_CONFIG = {
    duration: 0.8,
    easing: (t) => 1 - Math.pow(1 - t, 3),
    offset: 0
};

// Header navigation animation configuration - 2s with slow start/end, fast middle
const HEADER_NAV_CONFIG = {
    duration: 2.0,
    easing: (t) => {
        // Custom easing: very slow start and end, faster in middle
        // Using a modified sine wave for smooth acceleration/deceleration
        return (1 - Math.cos(t * Math.PI)) / 2;
    },
    offset: 0
};

// Fluid Typography Enhancement System
const TYPOGRAPHY_CONFIG = {
    enabled: true,
    fallbackForOldBrowsers: true,
    extremeViewportAdjustment: true,
    minViewport: 320,
    maxViewport: 2560,
    baseViewport: 1600, // Design baseline

    // Fine-tuning for extreme sizes
    scaleFactors: {
        extraSmall: 0.95,  // < 1200px
        extraLarge: 1.05   // > 2200px
    }
};

let typographyState = {
    isSupported: false,
    currentViewportWidth: 0,
    scaleFactor: 1,
    resizeTimeout: null
};

// Check CSS clamp() support
function supportsClamp() {
    if (typographyState.isSupported !== undefined) {
        return typographyState.isSupported;
    }

    try {
        const testElement = document.createElement('div');
        testElement.style.fontSize = 'clamp(1rem, 2vw, 3rem)';
        typographyState.isSupported = testElement.style.fontSize !== '';
        return typographyState.isSupported;
    } catch (e) {
        typographyState.isSupported = false;
        return false;
    }
}

// Calculate fluid font size for fallback
function calculateFluidSize(minSize, preferredSize, maxSize, currentViewport) {
    const { minViewport, maxViewport } = TYPOGRAPHY_CONFIG;

    if (currentViewport <= minViewport) return minSize;
    if (currentViewport >= maxViewport) return maxSize;

    const viewportRatio = (currentViewport - minViewport) / (maxViewport - minViewport);
    const sizeRange = maxSize - minSize;
    return minSize + (sizeRange * viewportRatio);
}

// Apply extreme viewport adjustments
function getViewportScaleFactor(viewportWidth) {
    if (viewportWidth < 1200) {
        return TYPOGRAPHY_CONFIG.scaleFactors.extraSmall;
    } else if (viewportWidth > 2200) {
        return TYPOGRAPHY_CONFIG.scaleFactors.extraLarge;
    }
    return 1;
}

// Throttled resize handler for typography
function handleTypographyResize() {
    if (!TYPOGRAPHY_CONFIG.enabled) return;

    if (typographyState.resizeTimeout) {
        clearTimeout(typographyState.resizeTimeout);
    }

    typographyState.resizeTimeout = setTimeout(() => {
        const newWidth = window.innerWidth;
        const scaleFactor = getViewportScaleFactor(newWidth);

        // Only update if significant change
        if (Math.abs(newWidth - typographyState.currentViewportWidth) > 50 ||
            scaleFactor !== typographyState.scaleFactor) {

            typographyState.currentViewportWidth = newWidth;
            typographyState.scaleFactor = scaleFactor;

            updateTypographySystem();
        }
    }, 150); // Match existing throttle pattern
}

// Update typography system
function updateTypographySystem() {
    if (!TYPOGRAPHY_CONFIG.enabled) return;

    const root = document.documentElement;
    const { scaleFactor } = typographyState;

    // Apply scale factor for extreme viewports
    if (TYPOGRAPHY_CONFIG.extremeViewportAdjustment && scaleFactor !== 1) {
        root.style.setProperty('--typography-scale-factor', scaleFactor.toString());

        // Apply scaling to CSS variables if needed for old browser fallback
        if (!supportsClamp() && TYPOGRAPHY_CONFIG.fallbackForOldBrowsers) {
            applyFallbackSizes();
        }
    }
}

// Fallback system for browsers without clamp() support
function applyFallbackSizes() {
    if (supportsClamp()) return;

    console.log('Applying typography fallback for older browsers');

    const root = document.documentElement;
    const viewport = typographyState.currentViewportWidth;
    const scale = typographyState.scaleFactor;

    // Define fallback sizes (in px, converted from our clamp values)
    const fallbackSizes = {
        '--text-2xs': calculateFluidSize(8, 10, 12, viewport) * scale,
        '--text-xs': calculateFluidSize(11, 12, 14, viewport) * scale,
        '--text-sm': calculateFluidSize(12, 14, 16, viewport) * scale,
        '--text-base': calculateFluidSize(14, 17, 20, viewport) * scale,
        '--text-lg': calculateFluidSize(16, 20, 24, viewport) * scale,
        '--text-xl': calculateFluidSize(18, 23, 28, viewport) * scale,
        '--text-2xl': calculateFluidSize(20, 26, 32, viewport) * scale,
        '--text-3xl': calculateFluidSize(24, 32, 40, viewport) * scale,
        '--text-4xl': calculateFluidSize(28, 38, 48, viewport) * scale,
    };

    // Apply fallback sizes
    Object.entries(fallbackSizes).forEach(([property, size]) => {
        root.style.setProperty(property, size + 'px');
    });
}

// Initialize typography system
function initTypographySystem() {
    if (!TYPOGRAPHY_CONFIG.enabled) {
        console.log('Typography system disabled');
        return;
    }

    console.log('Initializing fluid typography system');

    // Initial setup
    typographyState.currentViewportWidth = window.innerWidth;
    typographyState.scaleFactor = getViewportScaleFactor(window.innerWidth);

    // Check support and apply initial settings
    if (supportsClamp()) {
        console.log('CSS clamp() supported - using native fluid typography');
    } else if (TYPOGRAPHY_CONFIG.fallbackForOldBrowsers) {
        console.log('CSS clamp() not supported - using JavaScript fallback');
        applyFallbackSizes();
    }

    // Apply initial extreme viewport adjustments
    updateTypographySystem();

    // Add resize listener
    window.addEventListener('resize', handleTypographyResize);

    console.log('Fluid typography system initialized successfully');
}

// Feature detection for progressive enhancement
function supportsLenisFeatures() {
    return !!(
        window.requestAnimationFrame &&
        'addEventListener' in window &&
        'classList' in document.documentElement &&
        window.Lenis &&
        typeof window.Lenis === 'function'
    );
}

// Basic scroll functionality fallback
function initBasicScroll() {
    console.log('Lenis not available, using basic smooth scroll fallback');

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
}

// Reduced motion detection and override system
function checkReducedMotionPreference() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

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

    // Handle user choice
    document.getElementById('enable-smooth-scroll').addEventListener('click', () => {
        localStorage.setItem('override-reduced-motion', 'true');
        notice.remove();
        initEnhancedScrollSystem(); // Initialize Lenis
    });

    document.getElementById('keep-reduced-motion').addEventListener('click', () => {
        localStorage.setItem('override-reduced-motion', 'false');
        notice.remove();
        initBasicScroll(); // Use fallback
    });
}

function shouldOverrideReducedMotion() {
    const hasOverride = localStorage.getItem('override-reduced-motion') === 'true';
    const prefersReducedMotion = checkReducedMotionPreference();

    return prefersReducedMotion && hasOverride;
}

// Enhanced scroll system initialization
function initEnhancedScrollSystem() {
    if (!supportsLenisFeatures()) {
        console.warn('Lenis features not supported, falling back to basic scroll');
        initBasicScroll();
        return;
    }

    try {
        // Initialize Lenis with balanced smoothness and responsiveness
        lenis = new Lenis({
            lerp: 0.08,             // Reduced for more responsive feel
            duration: 0.8,          // Shorter duration for less latency
            easing: (t) => 1 - Math.pow(1 - t, 3), // Ease-out cubic for natural deceleration
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            mouseMultiplier: 1,     // Standard mouse sensitivity
            smoothTouch: false,     // Keep disabled for performance
            touchMultiplier: 1.5,   // Balanced touch scrolling
            wheelMultiplier: 1,     // Standard wheel sensitivity
            infinite: false,
            orientation: 'vertical',
            normalizeWheel: true
        });

        // Mark as initialized
        isScrollSystemInitialized = true;
        document.documentElement.classList.add('js-loaded', 'lenis-enabled');

        console.log('Lenis smooth scroll initialized successfully');

        // DOM cache already initialized in loadContent()

        // Initialize RAF loop (will be implemented in T006)
        initScrollRAF();

        // Setup enhanced anchor navigation
        setupEnhancedNavigation();

        // Preserve header navigation
        preserveHeaderNavigation();

        // Preserve episode navigation
        preserveEpisodeNavigation();

        // Initialize episodi parallax now that Lenis is ready
        if (hasEpisodes) {
            initEpisodiParallax();
        }

        // Initialize missione animations now that Lenis is ready
        initMissioneAnimations();

        // Initialize candidati card stack now that Lenis is ready
        initCandidatiCardStack();

    } catch (error) {
        console.error('Error initializing Lenis:', error);
        initBasicScroll(); // Fallback to basic scroll
    }
}

// Optimized RAF loop for smooth scroll updates
let rafId = null;

function initScrollRAF() {
    if (!lenis) {
        console.error('Cannot initialize RAF: Lenis not initialized');
        return;
    }

    function raf(time) {
        // Update Lenis - no throttling for smoothest possible scrolling
        lenis.raf(time);

        // Update viewport-dependent animations efficiently
        updateScrollElements(lenis.scroll);

        rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);
    console.log('RAF loop initialized for smooth scrolling');
}


// Scroll decoupling system
let scrollDecouplingConfig = {
    enabled: true,
    deadzones: [
        // { start: 0, end: 50 },      // Example: pause at top
        // { start: 500, end: 600 },   // Example: pause between sections
    ],
    globalMultiplier: 1.0,
    easing: {
        enabled: false,
        factor: 0.1
    }
};

let decoupledScrollState = {
    rawScroll: 0,
    processedScroll: 0,
    velocity: 0,
    inDeadzone: false,
    currentDeadzone: null
};

// Process raw scroll input into custom scroll values
function processScrollInput(rawScroll) {
    if (!scrollDecouplingConfig.enabled) {
        return rawScroll;
    }

    let processedScroll = rawScroll;

    // Apply deadzone logic
    for (let deadzone of scrollDecouplingConfig.deadzones) {
        if (rawScroll >= deadzone.start && rawScroll <= deadzone.end) {
            // In deadzone - freeze processed scroll at deadzone start
            processedScroll = deadzone.start;
            decoupledScrollState.inDeadzone = true;
            decoupledScrollState.currentDeadzone = deadzone;
            break;
        } else if (rawScroll > deadzone.end) {
            // Past deadzone - subtract deadzone duration from processed scroll
            const deadzoneLength = deadzone.end - deadzone.start;
            processedScroll -= deadzoneLength;
        }
    }

    // Apply global multiplier
    processedScroll *= scrollDecouplingConfig.globalMultiplier;

    // Apply easing if enabled
    if (scrollDecouplingConfig.easing.enabled) {
        const easingFactor = scrollDecouplingConfig.easing.factor;
        decoupledScrollState.processedScroll += (processedScroll - decoupledScrollState.processedScroll) * easingFactor;
        processedScroll = decoupledScrollState.processedScroll;
    }

    // Update state
    decoupledScrollState.rawScroll = rawScroll;
    if (!scrollDecouplingConfig.easing.enabled) {
        decoupledScrollState.processedScroll = processedScroll;
    }

    return processedScroll;
}

// Scroll-decoupled element behaviors
let decoupledElements = [];

// Add element to decoupled scroll system
function addDecoupledElement(element, behavior, config = {}) {
    const decoupledElement = {
        element,
        behavior,
        config: {
            startTrigger: 0,
            endTrigger: 1000,
            ...config
        },
        state: {
            progress: 0,
            active: false
        },
        update(processedScroll) {
            // Calculate progress within trigger range
            const { startTrigger, endTrigger } = this.config;
            const range = endTrigger - startTrigger;

            if (processedScroll < startTrigger) {
                this.state.progress = 0;
                this.state.active = false;
            } else if (processedScroll > endTrigger) {
                this.state.progress = 1;
                this.state.active = true;
            } else {
                this.state.progress = (processedScroll - startTrigger) / range;
                this.state.active = true;
            }

            // Apply behavior based on type
            this.applyBehavior();
        },

        applyBehavior() {
            if (!this.element || !this.state.active) return;

            switch (this.behavior) {
                case 'heroExit':
                    this.applyHeroExit();
                    break;
                case 'parallax':
                    this.applyParallax();
                    break;
                case 'fadeMove':
                    this.applyFadeMove();
                    break;
                // Add more behaviors as needed
            }
        },

        applyHeroExit() {
            const direction = this.config.direction || 'left';
            // Use custom curve that reaches high speed quickly
            const easing = this.easeInFast(this.state.progress);

            // Calculate fade opacity - starts fading at 33% progress, fully faded at 80%
            let opacity = 1;
            if (this.state.progress >= 0.33) {
                if (this.state.progress >= 0.8) {
                    // Fully faded at 80% and beyond
                    opacity = 0;
                } else {
                    // Map progress from 0.33-0.8 to 0.0-1.0 for fade calculation
                    const fadeProgress = (this.state.progress - 0.33) / 0.47;
                    // Steeper fade: quadratic curve for faster initial fade
                    opacity = 1 - Math.pow(fadeProgress, 0.5);
                }
            }

            // For positioned hero elements, use transform for exit animation
            if (this.element.dataset.isPositioned === 'true') {
                // Start from centered position (translateX(-50%))
                // Add horizontal movement for exit
                let horizontalOffset = 0;

                // Responsive distance: 150vw on mobile, 100vw on desktop
                const isMobile = window.innerWidth <= 768;
                const totalDistance = isMobile ? 150 : (this.config.totalDistance || 100);

                if (direction === 'left') {
                    // Exit to the left - using configurable viewport-based distance
                    horizontalOffset = -totalDistance * easing;
                } else if (direction === 'right') {
                    // Exit to the right - using configurable viewport-based distance
                    horizontalOffset = totalDistance * easing;
                }

                // Combine centering transform with exit movement
                // Apply both movement and fade
                this.element.style.transform = `translateX(calc(-50% + ${horizontalOffset}vw))`;
                this.element.style.opacity = opacity;
            } else {
                // Fallback to transform for non-positioned elements
                const distance = this.config.distance || 400;
                let translateX = 0;
                if (direction === 'left') {
                    translateX = -distance * easing;
                } else if (direction === 'right') {
                    translateX = distance * easing;
                }
                this.element.style.transform = `translateX(${translateX}px)`;
                this.element.style.opacity = opacity;
            }
        },

        applyParallax() {
            const speed = this.config.speed || 0.5;
            const offset = this.state.progress * this.config.distance * speed;
            this.element.style.transform = `translateY(${offset}px)`;
        },

        applyFadeMove() {
            const distance = this.config.distance || 50;
            const direction = this.config.direction || 'up';
            const easing = this.easeOutCubic(this.state.progress);

            let translateY = 0;
            if (direction === 'up') {
                translateY = distance * (1 - easing);
            } else if (direction === 'down') {
                translateY = -distance * (1 - easing);
            }

            this.element.style.transform = `translateY(${translateY}px)`;
            this.element.style.opacity = easing;
        },

        easeOutCubic(t) {
            return 1 - Math.pow(1 - t, 3);
        },

        easeInCubic(t) {
            return Math.pow(t, 3);
        },

        easeInQuart(t) {
            return Math.pow(t, 4);
        },

        easeInCustom(t) {
            // Custom curve between cubic and quartic (power of 3.5)
            return Math.pow(t, 3.5);
        },

        easeInQuad(t) {
            return Math.pow(t, 2);
        },

        easeInOneFive(t) {
            return Math.pow(t, 1.5);
        },

        easeInFast(t) {
            // Simple power curve that accelerates quickly without slowing down
            return Math.pow(t, 1.25);
        }
    };

    decoupledElements.push(decoupledElement);
    return decoupledElement;
}

// Update all decoupled elements
function updateDecoupledElements(processedScroll) {
    for (let element of decoupledElements) {
        element.update(processedScroll);
    }
}

// Responsive distance management
let isCurrentlyMobile = window.innerWidth <= 768;
let resizeTimeout = null;

// Throttled resize handler for responsive distance
function handleResponsiveResize() {
    if (resizeTimeout) return; // Already scheduled

    resizeTimeout = setTimeout(() => {
        const wasMobile = isCurrentlyMobile;
        isCurrentlyMobile = window.innerWidth <= 768;

        // Only trigger updates if mobile state actually changed
        if (wasMobile !== isCurrentlyMobile) {
            // Force immediate update of all hero elements
            decoupledElements.forEach(element => {
                if (element.behavior === 'heroExit') {
                    element.update(decoupledScrollState.processedScroll);
                }
            });
        }

        resizeTimeout = null;
    }, 150); // 150ms throttle for good responsiveness without performance impact
}

// Initialize hero section animations - RESTORED ORIGINAL APPROACH
function initHeroAnimations() {
    const heroLogo = document.getElementById('heroLogo');
    const heroSubtitle = document.getElementById('heroSubtitle');

    if (!heroLogo && !heroSubtitle) return;

    // Capture original positions before any modifications
    const originalPositions = captureOriginalHeroPositions(heroLogo, heroSubtitle);

    // Setup positioned elements for independent scrolling
    if (heroLogo) {
        setupHeroElementPositioning(heroLogo, originalPositions.logo);
    }

    if (heroSubtitle) {
        setupHeroElementPositioning(heroSubtitle, originalPositions.subtitle);
    }

    // Add hero elements to decoupled scroll system
    if (heroLogo) {
        addDecoupledElement(heroLogo, 'heroExit', {
            startTrigger: 0,
            endTrigger: window.innerHeight,
            direction: 'left',
            totalDistance: 100
        });
    }

    if (heroSubtitle) {
        addDecoupledElement(heroSubtitle, 'heroExit', {
            startTrigger: 0,
            endTrigger: window.innerHeight,
            direction: 'right',
            totalDistance: 100
        });
    }

    // Add responsive distance handler
    window.addEventListener('resize', handleResponsiveResize);

    console.log('Hero animations initialized with decoupled scroll system');
}

// Hero resize handler removed - using original decoupled scroll approach

// Capture original hero positions to preserve relative spacing
function captureOriginalHeroPositions(heroLogo, heroSubtitle) {
    const positions = {};

    if (heroLogo) {
        const logoRect = heroLogo.getBoundingClientRect();
        positions.logo = {
            top: logoRect.top,
            left: logoRect.left,
            bottom: logoRect.bottom
        };
    }

    if (heroSubtitle) {
        const subtitleRect = heroSubtitle.getBoundingClientRect();
        positions.subtitle = {
            top: subtitleRect.top,
            left: subtitleRect.left,
            bottom: subtitleRect.bottom
        };
    }

    // Calculate original spacing
    if (positions.logo && positions.subtitle) {
        positions.verticalSpacing = Math.abs(positions.subtitle.top - positions.logo.bottom);
        console.log(`Original vertical spacing: ${positions.verticalSpacing}px`);
    }

    return positions;
}

// Setup hero element to be positioned independently of page scroll
function setupHeroElementPositioning(element, originalPosition = null) {
    const computedStyle = window.getComputedStyle(element);

    // Use original position if provided, otherwise use current position
    const rect = originalPosition || element.getBoundingClientRect();

    // Calculate percentage-based position relative to viewport
    const topPercent = (rect.top / window.innerHeight) * 100;

    // Center element horizontally by using 50% left and transform
    const leftPercent = 50; // Always center horizontally

    // Make element fixed position to prevent vertical scrolling
    element.style.position = 'fixed';
    element.style.top = topPercent + '%';
    element.style.left = leftPercent + '%';
    element.style.transform = 'translateX(-50%)'; // Center using transform
    element.style.zIndex = '1000';

    // Preserve original styling but remove margins that might affect positioning
    const originalMargin = computedStyle.margin;
    element.style.margin = '0';

    // Preserve dimensions to maintain layout
    if (!element.style.width) element.style.width = computedStyle.width;
    if (!element.style.height) element.style.height = computedStyle.height;

    // Store positioning data for animations
    element.dataset.originalMargin = originalMargin;
    element.dataset.topPercent = topPercent;
    element.dataset.leftPercent = leftPercent;
    element.dataset.isPositioned = 'true';

    console.log(`Hero element centered at ${topPercent.toFixed(1)}% top, 50% left`);
}

// Optimized scroll updates with decoupling
function updateScrollElements(scrollY) {
    // Process raw scroll into custom scroll values
    const processedScroll = processScrollInput(scrollY);

    // Update decoupled elements (hero animations)
    updateDecoupledElements(processedScroll);

    // Update progress bar with raw scroll (keep original behavior)
    updateProgressBar(scrollY);

    // Update hero animations (now handled by decoupled system)
    updateHeroAnimations(scrollY);

    // Update episodi parallax if initialized
    if (episodiParallaxState) {
        updateEpisodiParallax(scrollY, episodiParallaxState);
    }

    // Update missione animations if initialized
    if (missioneAnimationState) {
        updateMissioneAnimations(scrollY, missioneAnimationState);
    }

    // Update candidati card stack if initialized
    if (candidatiCardState) {
        updateCandidatiCardStack(scrollY, candidatiCardState);
    }
}

// Cache viewport height and common DOM elements for performance
let cachedViewportHeight = window.innerHeight;
let cachedHeaderSpans = null;
let cachedBlocks = null;
let cachedVisibleBlocks = null;
let cachedProgressBar = null;
let cachedDocumentHeight = 0;
let lastHeaderUpdate = 0;
const HEADER_UPDATE_THROTTLE = 100; // Update header every 100ms max

// Section-based progress bar data
let sectionProgressData = null;

// Initialize DOM cache after page load
function initDOMCache() {
    cachedHeaderSpans = document.querySelectorAll('.header-fixed span[data-section]');
    cachedBlocks = document.querySelectorAll('.block');
    cachedProgressBar = document.getElementById('progressBar');
    updateVisibleBlocks();
    updateCachedDocumentHeight();
}

// Update cached visible blocks (only when layout changes)
function updateVisibleBlocks() {
    if (!cachedBlocks) return; // Safety check
    cachedVisibleBlocks = Array.from(cachedBlocks).filter(block =>
        getComputedStyle(block).display !== 'none'
    );
    // Recalculate section progress data when visible blocks change
    calculateSectionProgressData();
}

// Update cached document height
function updateCachedDocumentHeight() {
    cachedDocumentHeight = document.documentElement.scrollHeight - window.innerHeight;
}

// Calculate section-based progress data for equal progress bar divisions
function calculateSectionProgressData() {
    if (!cachedVisibleBlocks || cachedVisibleBlocks.length === 0) {
        sectionProgressData = null;
        return;
    }

    const sections = [];
    const totalSections = cachedVisibleBlocks.length;
    const progressPerSection = 100 / totalSections; // Equal divisions

    cachedVisibleBlocks.forEach((block, index) => {
        const sectionId = block.dataset.block;
        const sectionTop = block.offsetTop;
        const sectionHeight = block.offsetHeight;
        const sectionBottom = sectionTop + sectionHeight;

        sections.push({
            id: sectionId,
            element: block,
            top: sectionTop,
            bottom: sectionBottom,
            height: sectionHeight,
            progressStart: index * progressPerSection,
            progressEnd: (index + 1) * progressPerSection,
            progressRange: progressPerSection
        });
    });

    sectionProgressData = {
        sections: sections,
        totalSections: totalSections,
        progressPerSection: progressPerSection
    };

    console.log(`Section progress data calculated: ${totalSections} sections`);
}

// Update cached viewport on resize
window.addEventListener('resize', () => {
    cachedViewportHeight = window.innerHeight;
    updateCachedDocumentHeight();
    // Recalculate section progress data on resize
    calculateSectionProgressData();
});

// Enhanced anchor navigation with smooth scroll
function setupEnhancedNavigation() {
    if (!lenis) {
        console.error('Cannot setup enhanced navigation: Lenis not initialized');
        return;
    }

    // Handle all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            const target = document.querySelector(href);

            if (target) {
                e.preventDefault();

                // Use Lenis smooth scroll to target with responsive settings
                lenis.scrollTo(target, SCROLL_CONFIG);
            }
        });
    });

    // Setup scroll-based navigation highlight
    setupNavigationHighlighting();

    console.log('Enhanced navigation setup completed');
}

// Navigation highlighting based on scroll position
function setupNavigationHighlighting() {
    if (!lenis) return;

    // Listen to scroll events from Lenis
    lenis.on('scroll', (e) => {
        updateNavigationHighlight(e.scroll);
    });
}

function updateNavigationHighlight(scrollY) {
    // This will be enhanced in functionality preservation phase
    // For now, just ensure existing navigation continues to work

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

// Initialize enhanced scroll system after intro sequence
function initializeEnhancedScrollAfterIntro() {
    const prefersReducedMotion = checkReducedMotionPreference();

    if (prefersReducedMotion) {
        const hasOverride = localStorage.getItem('override-reduced-motion');

        if (hasOverride === null) {
            // First time visitor with reduced motion - show choice
            showMotionPreferenceOverride();
        } else if (hasOverride === 'true') {
            // User has chosen to override - initialize Lenis
            initEnhancedScrollSystem();
        } else {
            // User has chosen to keep reduced motion - use basic scroll
            initBasicScroll();
        }
    } else {
        // No reduced motion preference - initialize Lenis directly
        if (supportsLenisFeatures()) {
            initEnhancedScrollSystem();
        } else {
            initBasicScroll();
        }
    }
}

// Update progress bar (smooth normalized 0-100% progression)
function updateProgressBar(scrollY) {
    if (!cachedProgressBar || !sectionProgressData) return;

    let progressPercentage = 0;

    // Find contatti section for special handling
    const contattiSection = sectionProgressData.sections.find(section => section.id === 'contatti');

    if (contattiSection) {
        // Calculate when contatti section starts appearing (top reaches bottom of viewport)
        const contattiStartsAppearing = contattiSection.top - window.innerHeight;
        // Calculate when contatti section is fully visible (bottom reaches bottom of viewport)
        const contattiFullyVisible = contattiSection.bottom - window.innerHeight;

        if (scrollY >= contattiFullyVisible) {
            // Contatti is fully visible - progress bar at 100%
            progressPercentage = 100;
        } else if (scrollY >= contattiStartsAppearing) {
            // Contatti is appearing - interpolate from previous progress to 100%
            const previousSectionIndex = sectionProgressData.sections.findIndex(s => s.id === 'contatti') - 1;
            const startProgress = previousSectionIndex >= 0 ? sectionProgressData.sections[previousSectionIndex].progressEnd : 80;

            const progressInContattiTransition = (scrollY - contattiStartsAppearing) / (contattiFullyVisible - contattiStartsAppearing);
            const clampedProgress = Math.min(1, Math.max(0, progressInContattiTransition));

            progressPercentage = startProgress + (clampedProgress * (100 - startProgress));
        } else {
            // Use normal section-based calculation for sections before contatti
            for (let i = 0; i < sectionProgressData.sections.length; i++) {
                const section = sectionProgressData.sections[i];

                // Skip contatti section in normal calculation
                if (section.id === 'contatti') continue;

                if (scrollY >= section.top && scrollY <= section.bottom) {
                    // We're in this section - calculate progress within it
                    const progressInSection = (scrollY - section.top) / section.height;
                    const clampedProgressInSection = Math.min(1, Math.max(0, progressInSection));

                    // Special handling for candidati section to ensure linear progression
                    if (section.id === 'candidati') {
                        // For candidati, use linear progression from its start to the point where contatti transition begins
                        const contattiSection = sectionProgressData.sections.find(s => s.id === 'contatti');
                        if (contattiSection) {
                            // Calculate the exact progress value where contatti transition would start
                            const contattiTransitionStart = contattiSection.top - window.innerHeight;
                            const candidatiEffectiveEnd = Math.min(section.bottom, contattiTransitionStart);
                            const candidatiEffectiveHeight = candidatiEffectiveEnd - section.top;

                            if (candidatiEffectiveHeight > 0 && scrollY <= candidatiEffectiveEnd) {
                                const effectiveProgressInSection = (scrollY - section.top) / candidatiEffectiveHeight;
                                const clampedEffectiveProgress = Math.min(1, Math.max(0, effectiveProgressInSection));
                                progressPercentage = section.progressStart + (clampedEffectiveProgress * section.progressRange);
                            } else {
                                // Fallback to normal calculation
                                progressPercentage = section.progressStart + (clampedProgressInSection * section.progressRange);
                            }
                        } else {
                            // No contatti section found, use normal calculation
                            progressPercentage = section.progressStart + (clampedProgressInSection * section.progressRange);
                        }
                    } else {
                        // Normal calculation for all other sections
                        progressPercentage = section.progressStart + (clampedProgressInSection * section.progressRange);
                    }
                    break;
                } else if (scrollY < section.top) {
                    // We're before this section - use previous section's end progress
                    progressPercentage = i > 0 ? sectionProgressData.sections[i - 1].progressEnd : 0;
                    break;
                } else if (i === sectionProgressData.sections.length - 2) {
                    // We're past the second-to-last section (before contatti)
                    progressPercentage = section.progressEnd;
                }
            }
        }
    } else {
        // Fallback to original section-based calculation if contatti not found
        for (let i = 0; i < sectionProgressData.sections.length; i++) {
            const section = sectionProgressData.sections[i];

            if (scrollY >= section.top && scrollY <= section.bottom) {
                // We're in this section - calculate progress within it
                const progressInSection = (scrollY - section.top) / section.height;
                const clampedProgressInSection = Math.min(1, Math.max(0, progressInSection));

                // Calculate total progress: completed sections + progress in current section
                progressPercentage = section.progressStart + (clampedProgressInSection * section.progressRange);
                break;
            } else if (scrollY < section.top) {
                // We're before this section - use previous section's end progress
                progressPercentage = i > 0 ? sectionProgressData.sections[i - 1].progressEnd : 0;
                break;
            } else if (i === sectionProgressData.sections.length - 1) {
                // We're past the last section
                progressPercentage = 100;
            }
        }
    }

    // Clamp to 0-100 range
    progressPercentage = Math.min(100, Math.max(0, progressPercentage));

    // Smooth progress bar update
    cachedProgressBar.style.width = progressPercentage + '%';

    // Throttle header updates for performance
    const now = performance.now();
    if (now - lastHeaderUpdate > HEADER_UPDATE_THROTTLE) {
        updateActiveHeaderSection(scrollY);
        lastHeaderUpdate = now;
    }
}

// Enhanced header section update for smooth scroll integration
function updateActiveHeaderSection(scrollY) {
    if (!cachedHeaderSpans || !cachedVisibleBlocks) return;

    let activeSection = null;

    // Find section with early switching (when current section is 3/4 through)
    for (let i = 0; i < cachedVisibleBlocks.length; i++) {
        const block = cachedVisibleBlocks[i];
        const blockTop = block.offsetTop;
        const blockHeight = block.offsetHeight;
        const blockBottom = blockTop + blockHeight;

        // Calculate 75% point through current section
        const switchPoint = blockTop + (blockHeight * 0.75);

        if (scrollY >= blockTop && scrollY < switchPoint) {
            // We're in the first 75% of this section
            activeSection = block.dataset.block || block.id;
            break;
        } else if (scrollY >= switchPoint && scrollY <= blockBottom) {
            // We're in the last 25% of this section - highlight next section
            if (i + 1 < cachedVisibleBlocks.length) {
                activeSection = cachedVisibleBlocks[i + 1].dataset.block || cachedVisibleBlocks[i + 1].id;
            } else {
                // Last section, keep current section highlighted
                activeSection = block.dataset.block || block.id;
            }
            break;
        }
    }

    // Update header active states
    if (activeSection) {
        cachedHeaderSpans.forEach(span => {
            if (span.getAttribute('data-section') === activeSection) {
                span.classList.add('active');
            } else {
                span.classList.remove('active');
            }
        });
    }
}

// Header navigation preservation
function preserveHeaderNavigation() {
    if (!cachedHeaderSpans) return;

    cachedHeaderSpans.forEach(span => {
        span.addEventListener('click', function(e) {
            e.preventDefault();

            const sectionId = this.getAttribute('data-section');
            const target = document.querySelector(`[data-block="${sectionId}"]`);

            if (target) {
                if (lenis && isScrollSystemInitialized) {
                    // Use Lenis for header navigation with 2-second slow-fast-slow animation
                    lenis.scrollTo(target, HEADER_NAV_CONFIG);
                } else {
                    // Enhanced fallback with custom scroll behavior
                    smoothScrollToTarget(target, HEADER_NAV_CONFIG);
                }

                // Update active state
                cachedHeaderSpans.forEach(s => s.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });

    console.log('Header navigation preserved and enhanced');
}

// Custom smooth scroll fallback with configurable easing
function smoothScrollToTarget(target, config) {
    const startY = window.scrollY;
    const targetY = target.offsetTop;
    const distance = targetY - startY;
    const duration = config.duration * 1000; // Convert to milliseconds
    let startTime = null;

    function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);

        // Apply custom easing function
        const easedProgress = config.easing(progress);
        const currentY = startY + (distance * easedProgress);

        window.scrollTo(0, currentY);

        if (progress < 1) {
            requestAnimationFrame(animation);
        }
    }

    requestAnimationFrame(animation);
}

// Episode navigation sidebar preservation
function preserveEpisodeNavigation() {
    // Monitor for dynamically added episode navigation
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Check for episode links
                        const episodeLinks = node.querySelectorAll ?
                            node.querySelectorAll('.episodio-link[data-episode]') : [];

                        episodeLinks.forEach(link => {
                            enhanceEpisodeLink(link);
                        });

                        // If the added node itself is an episode link
                        if (node.classList && node.classList.contains('episodio-link')) {
                            enhanceEpisodeLink(node);
                        }
                    }
                });
            }
        });
    });

    // Observe sidebar for changes
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        observer.observe(sidebar, {
            childList: true,
            subtree: true
        });

        // Also enhance existing episode links
        const existingLinks = sidebar.querySelectorAll('.episodio-link[data-episode]');
        existingLinks.forEach(link => enhanceEpisodeLink(link));
    }

    console.log('Episode navigation sidebar preservation enabled');
}


function enhanceEpisodeLink(link) {
    // Preserve the original click handler by calling it first
    const originalHandler = link.onclick;

    link.addEventListener('click', function(e) {
        // Call original functionality first
        if (originalHandler) {
            originalHandler.call(this, e);
        }

        // Add smooth scroll to top if needed
        if (lenis && isScrollSystemInitialized) {
            setTimeout(() => {
                lenis.scrollTo(0, { ...SCROLL_CONFIG, duration: 0.5 });
            }, 100);
        }
    });
}

// Load content
async function loadContent() {
    try {
        const response = await fetch('content.json?t=' + Date.now());
        siteContent = await response.json();
        hasEpisodes = checkEpisodesExist(siteContent);
    } catch (error) {
        console.error('Error loading content:', error);
        siteContent = createFallbackContent();
        hasEpisodes = false;
    }

    // Initialize DOM cache early
    initDOMCache();

    populateContent();

    // Initialize typography system before scroll system
    initTypographySystem();

    initializeScrollSystem();
}

// Check if episodes exist
function checkEpisodesExist(content) {
    return content?.episodes?.seasons?.some(season => 
        season?.episodes?.length > 0
    ) || false;
}

// Fallback content
function createFallbackContent() {
    return {
        site: {
            title: "Dance Academy",
            logoVideoPath: "Assets/logo.mp4",
            logoInlinePath: "Assets/logo_inline.png",
            videoBackgroundPath: "Assets/video.mp4",
            introText: "Il viaggio che racconta la danza italiana"
        },
        hero: {
            subtitle: "La tua scuola ha una storia che merita di essere raccontata."
        },
        missione: {
            copyBlocks: [
                {
                    title: "Ogni episodio una scuola da scoprire",
                    text: "Non solo un video: la tua storia che raggiunge migliaia di famiglie"
                },
                {
                    title: "Il palcoscenico digitale delle scuole d'Italia",
                    text: "Il format che trasforma l'eccellenza in riconoscimento"
                }
            ],
            ctaText: "CANDIDATI",
            ctaHref: "#candidati"
        },
        contatti: {
            title: "Contatti",
            contacts: [
                {"type": "Email", "value": "info@danceacademy.it"},
                {"type": "Telefono", "value": "+39 123 456 7890"}
            ]
        }
    };
}

// Populate content
function populateContent() {
    // Page title
    document.getElementById('pageTitle').textContent = siteContent.site?.title || 'Dance Academy';
    
    // Intro
    const introText = document.getElementById('introText');
    if (introText) introText.textContent = siteContent.site?.introText || '';
    
    const introLogo = document.getElementById('introLogo');
    if (introLogo) {
        introLogo.querySelector('source').src = siteContent.site?.logoVideoPath || 'Assets/logo.mp4';
        introLogo.load();
    }
    
    // Video background
    const videoBg = document.getElementById('videoBg');
    if (videoBg) {
        videoBg.querySelector('source').src = siteContent.site?.videoBackgroundPath || 'Assets/video.mp4';
        videoBg.load();
    }
    
    // Hero
    const heroLogo = document.getElementById('heroLogo');
    if (heroLogo) heroLogo.src = siteContent.site?.logoInlinePath || 'Assets/logo_inline.png';

    const heroSubtitle = document.getElementById('heroSubtitle');
    if (heroSubtitle) heroSubtitle.textContent = siteContent.hero?.subtitle || '';

    // Initialize hero animations with direct approach
    initHeroAnimations();
    
    // Episodes
    if (hasEpisodes) {
        document.querySelector('.episodi-block').style.display = 'flex';
        populateEpisodes();

        // Initialize episodi parallax after content is populated (will be called when Lenis is ready)

        // Update visible blocks after showing episodes
        updateVisibleBlocks();

        // Update header to show episodes
        const headerSpans = document.querySelectorAll('.header-fixed span');
        headerSpans[1].style.display = 'inline';
    } else {
        // Hide episodes from header
        const headerSpans = document.querySelectorAll('.header-fixed span');
        headerSpans[1].style.display = 'none';
    }
    
    // Missione
    const missioneContainer = document.getElementById('missioneContainer');
    if (missioneContainer && siteContent.missione) {
        missioneContainer.innerHTML = '';
        
        siteContent.missione.copyBlocks?.forEach(block => {
            const div = document.createElement('div');
            div.className = 'copy-block';
            div.innerHTML = `
                ${block.title ? `<h3 class="missione-title">${block.title}</h3>` : ''}
                ${block.text ? `<p class="missione-text">${block.text}</p>` : ''}
            `;
            missioneContainer.appendChild(div);
        });

        if (siteContent.missione.ctaText) {
            const ctaDiv = document.createElement('div');
            ctaDiv.className = 'cta-container';
            const link = document.createElement('a');
            link.href = '#candidati';
            link.className = 'missione-button';
            link.textContent = siteContent.missione.ctaText;
            link.onclick = (e) => {
                e.preventDefault();
                document.querySelector('.candidati-block').scrollIntoView({ behavior: 'smooth' });
            };
            ctaDiv.appendChild(link);
            missioneContainer.appendChild(ctaDiv);
        }
    }
    
    // Contatti
    const contattiContainer = document.getElementById('contattiContainer');
    if (contattiContainer && siteContent.contatti) {
        contattiContainer.innerHTML = `
            <h2>${siteContent.contatti.title || 'Contatti'}</h2>
            <div class="contatti-info">
                ${siteContent.contatti.contacts?.map(contact => `
                    <div class="contatto-item">
                        <h3>${contact.type}</h3>
                        <p>${contact.value}</p>
                    </div>
                `).join('') || ''}
            </div>
        `;
    }
}

// Populate episodes
function populateEpisodes() {
    const sidebar = document.getElementById('sidebar');
    const contentArea = document.getElementById('contentArea');

    if (!siteContent?.episodes || !sidebar || !contentArea) return;

    // Find last episode of last season automatically
    let defaultEpisodeId = 1; // fallback
    let activeSeasonId = null;

    if (siteContent.episodes.seasons && siteContent.episodes.seasons.length > 0) {
        // Get the last season
        const lastSeason = siteContent.episodes.seasons[siteContent.episodes.seasons.length - 1];
        activeSeasonId = lastSeason.id;

        // Get the last episode of the last season
        if (lastSeason.episodes && lastSeason.episodes.length > 0) {
            const lastEpisode = lastSeason.episodes[lastSeason.episodes.length - 1];
            defaultEpisodeId = lastEpisode.id;
        }

    }
    
    // Build sidebar
    sidebar.innerHTML = '';
    siteContent.episodes.seasons.forEach(season => {
        if (!season?.episodes?.length) return;
        
        const seasonDiv = document.createElement('div');
        seasonDiv.className = 'stagione-accordion';
        
        const header = document.createElement('div');
        header.className = `accordion-header${season.id === activeSeasonId ? ' active' : ''}`;
        header.dataset.season = season.id;
        header.textContent = season.name;
        header.onclick = () => toggleSeason(season.id);
        
        const list = document.createElement('ul');
        list.className = `episodi-list${season.id === activeSeasonId ? ' expanded' : ''}`;
        list.dataset.season = season.id;
        
        season.episodes.forEach(episode => {
            const li = document.createElement('li');
            li.className = `episodio-item${episode.id === defaultEpisodeId ? ' active' : ''}`;
            li.dataset.episodio = episode.id;
            li.textContent = episode.title;
            li.onclick = () => switchEpisode(episode.id);
            list.appendChild(li);
        });
        
        seasonDiv.appendChild(header);
        seasonDiv.appendChild(list);
        sidebar.appendChild(seasonDiv);
    });
    
    // Build content
    contentArea.innerHTML = '';
    siteContent.episodes.seasons.forEach(season => {
        season.episodes.forEach(episode => {
            const div = document.createElement('div');
            div.className = `episodio-content${episode.id === defaultEpisodeId ? ' active' : ''}`;
            div.dataset.content = episode.id;
            
            const videoDiv = document.createElement('div');
            videoDiv.className = 'video-principale';
            videoDiv.innerHTML = `<iframe src="${episode.mainVideo}" allowfullscreen></iframe>`;
            div.appendChild(videoDiv);
            
            if (episode.choreographies?.length) {
                const choreoSection = document.createElement('div');
                choreoSection.className = 'coreografie-section';
                
                const header = document.createElement('h3');
                header.className = 'coreografie-header';
                header.textContent = 'Coreografie';
                choreoSection.appendChild(header);
                
                const grid = document.createElement('div');
                grid.className = 'coreografie-grid';
                
                episode.choreographies.forEach(choreo => {
                    const card = document.createElement('div');
                    card.className = 'coreo-card';
                    card.innerHTML = `
                        <div class="coreo-video">
                            <iframe src="${choreo.video}" allowfullscreen></iframe>
                        </div>
                        <div class="coreo-title">${choreo.title}</div>
                    `;
                    grid.appendChild(card);
                });
                
                choreoSection.appendChild(grid);
                div.appendChild(choreoSection);
            }
            
            contentArea.appendChild(div);
        });
    });
}

// Toggle season
function toggleSeason(seasonId) {
    const headers = document.querySelectorAll('.accordion-header');
    const lists = document.querySelectorAll('.episodi-list');
    
    // Find currently expanded list
    const currentlyExpanded = document.querySelector('.episodi-list.expanded');
    const targetList = document.querySelector(`.episodi-list[data-season="${seasonId}"]`);
    
    // If clicking the same season or no season is expanded, toggle immediately
    if (!currentlyExpanded || currentlyExpanded.dataset.season == seasonId) {
        headers.forEach(header => {
            if (header.dataset.season == seasonId) {
                header.classList.toggle('active');
            } else {
                header.classList.remove('active');
            }
        });
        
        lists.forEach(list => {
            if (list.dataset.season == seasonId) {
                list.classList.toggle('expanded');
            } else {
                list.classList.remove('expanded');
            }
        });
        return;
    }
    
    // First, close the currently expanded section
    currentlyExpanded.classList.remove('expanded');
    document.querySelector(`.accordion-header[data-season="${currentlyExpanded.dataset.season}"]`).classList.remove('active');
    
    // Wait for closing animation to finish (300ms based on CSS transition)
    setTimeout(() => {
        // Then open the new section
        targetList.classList.add('expanded');
        document.querySelector(`.accordion-header[data-season="${seasonId}"]`).classList.add('active');
    }, 300);
}

// Switch episode
function switchEpisode(episodeId) {
    document.querySelectorAll('.episodio-item').forEach(item => {
        item.classList.toggle('active', item.dataset.episodio == episodeId);
    });
    
    document.querySelectorAll('.episodio-content').forEach(content => {
        content.classList.toggle('active', content.dataset.content == episodeId);
    });
}

// Initialize scroll system
function initializeScrollSystem() {
    let scrollEnabled = false;
    
    // Disable scrolling initially with CSS
    document.body.style.overflow = 'hidden';
    
    // Disable scrolling initially with events (backup)
    function preventScroll(e) {
        if (!scrollEnabled) {
            e.preventDefault();
            return false;
        }
    }
    
    // Add scroll prevention
    window.addEventListener('scroll', preventScroll, { passive: false });
    window.addEventListener('wheel', preventScroll, { passive: false });
    window.addEventListener('touchmove', preventScroll, { passive: false });
    window.addEventListener('keydown', (e) => {
        if (!scrollEnabled && [32, 33, 34, 35, 36, 37, 38, 39, 40].includes(e.keyCode)) {
            e.preventDefault();
            return false;
        }
    });
    
    // Wait for intro video to load and start intro sequence
    const introLogo = document.getElementById('introLogo');
    if (introLogo) {
        // Function to start the intro sequence
        function startIntroSequence() {
            // Start intro video
            introLogo.play().then(() => {
                console.log('Intro video started playing');
                
                // Start animations immediately when video starts
                const introOverlay = document.querySelector('.intro-overlay');
                const introText = document.getElementById('introText');
                const scrollContainer = document.querySelector('.scroll-container');
                const videoBg = document.getElementById('videoBg');
                
                // Start intro animations
                introLogo.classList.add('animate');
                introOverlay.classList.add('animate');
                if (introText) introText.classList.add('animate');
                
                // Start background video and its animation after intro (5s from video start)
                setTimeout(() => {
                    if (videoBg) {
                        videoBg.classList.add('animate');
                        videoBg.play().catch(e => console.log('Background video autoplay prevented'));
                    }
                }, 5000);
                
                // Show scroll container (4.5s from video start)
                setTimeout(() => {
                    if (scrollContainer) {
                        scrollContainer.classList.add('animate');
                    }
                }, 4500);
                
                // Enable scrolling when intro is complete (5.5s from video start)
                setTimeout(() => {
                    scrollEnabled = true;
                    document.body.style.overflow = 'auto';
                    window.removeEventListener('scroll', preventScroll);
                    window.removeEventListener('wheel', preventScroll);
                    window.removeEventListener('touchmove', preventScroll);
                    console.log('Scrolling enabled');

                    // Initialize enhanced scroll system after intro
                    // T010: Intro sequence timing preserved - scroll system initializes AFTER intro completion
                    initializeEnhancedScrollAfterIntro();
                }, 5500);
                
            }).catch(e => {
                console.log('Intro video autoplay prevented, starting sequence anyway');
                // If autoplay fails, still start animations and enable scrolling
                const introOverlay = document.querySelector('.intro-overlay');
                const introText = document.getElementById('introText');
                const scrollContainer = document.querySelector('.scroll-container');
                const videoBg = document.getElementById('videoBg');
                
                // Start animations anyway
                introLogo.classList.add('animate');
                if (introOverlay) introOverlay.classList.add('animate');
                if (introText) introText.classList.add('animate');
                if (scrollContainer) scrollContainer.classList.add('animate');
                if (videoBg) videoBg.classList.add('animate');
                
                setTimeout(() => {
                    scrollEnabled = true;
                    document.body.style.overflow = 'auto';
                    window.removeEventListener('scroll', preventScroll);
                    window.removeEventListener('wheel', preventScroll);
                    window.removeEventListener('touchmove', preventScroll);

                    // Initialize enhanced scroll system
                    initializeEnhancedScrollAfterIntro();
                }, 1000);
            });
        }
        
        // Check if video is already loaded
        if (introLogo.readyState >= 3) { // HAVE_FUTURE_DATA or greater
            startIntroSequence();
        } else {
            // Wait for video to load enough data to play
            introLogo.addEventListener('canplay', startIntroSequence, { once: true });
            
            // Fallback: if video doesn't load within 10 seconds, start anyway
            setTimeout(() => {
                if (!scrollEnabled) {
                    console.log('Video loading timeout, starting sequence anyway');
                    startIntroSequence();
                }
            }, 10000);
        }
    } else {
        // If no intro video, enable scrolling immediately
        setTimeout(() => {
            scrollEnabled = true;
            document.body.style.overflow = 'auto';
            window.removeEventListener('scroll', preventScroll);
            window.removeEventListener('wheel', preventScroll);
            window.removeEventListener('touchmove', preventScroll);

            // Initialize enhanced scroll system
            initializeEnhancedScrollAfterIntro();
        }, 1000);
    }
    
    // Simple Progress Bar System
    const progressBar = document.getElementById('progressBar');
    const headerSpans = document.querySelectorAll('.header-fixed span');
    const blocks = document.querySelectorAll('.block');
    
    // Get current section based on viewport
    function getCurrentSection() {
        const viewportCenter = window.innerHeight / 2;
        
        for (let block of blocks) {
            if (getComputedStyle(block).display === 'none') continue;
            
            const rect = block.getBoundingClientRect();
            const blockTop = rect.top;
            const blockBottom = rect.bottom;
            
            // Se il centro del viewport è dentro questa sezione
            if (blockTop <= viewportCenter && blockBottom >= viewportCenter) {
                return block.dataset.block;
            }
        }
        
        // Se nessuna sezione è al centro, trova la più vicina
        let closestSection = null;
        let closestDistance = Infinity;
        
        for (let block of blocks) {
            if (getComputedStyle(block).display === 'none') continue;
            
            const rect = block.getBoundingClientRect();
            const blockCenter = rect.top + (rect.height / 2);
            const distance = Math.abs(blockCenter - viewportCenter);
            
            if (distance < closestDistance) {
                closestDistance = distance;
                closestSection = block.dataset.block;
            }
        }
        
        return closestSection;
    }
    
    // Update active header
    function updateActiveHeader(currentSection) {
        headerSpans.forEach(span => {
            if (span.dataset.section === currentSection) {
                span.classList.add('active');
            } else {
                span.classList.remove('active');
            }
        });
    }
    
    // Main scroll handler - let Lenis handle this through updateProgressBar
    if (!lenis || !isScrollSystemInitialized) {
        window.addEventListener('scroll', () => {
            const scrollTop = window.scrollY;
            updateProgressBar(scrollTop);
        });
    }
    
    // Initial update
    const currentSection = getCurrentSection();
    if (currentSection) {
        updateActiveHeader(currentSection);
    }
    
    // Add click handlers for header navigation
    headerSpans.forEach(span => {
        span.style.cursor = 'pointer';
        span.style.pointerEvents = 'all';
        span.addEventListener('click', () => {
            const targetSection = span.dataset.section;
            const targetBlock = document.querySelector(`[data-block="${targetSection}"]`);
            
            if (targetBlock && getComputedStyle(targetBlock).display !== 'none') {
                targetBlock.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
    
    // Style required field asterisks
    const requiredFields = document.querySelectorAll('.required');
    requiredFields.forEach(field => {
        const placeholder = field.getAttribute('placeholder');
        if (placeholder && placeholder.includes('*') && field.tagName !== 'SELECT') {
            // Remove asterisk from placeholder
            const newPlaceholder = placeholder.replace(' *', '');
            field.setAttribute('placeholder', newPlaceholder);
            
            // Add asterisk element
            const asterisk = document.createElement('span');
            asterisk.textContent = '*';
            asterisk.className = 'required-label';
            field.parentNode.appendChild(asterisk);
        }
    });

    // Initialize form handler (from form-handler.js)
    initFormHandler();
}

// Episodi deadzone positioning calculation
function calculateEpisodiDeadzonePosition() {
    const header = document.querySelector('.header-fixed');
    const headerSpan = header.querySelector('span');

    // Get header measurements
    const headerTop = 20; // Fixed CSS value
    const headerRect = headerSpan.getBoundingClientRect();
    const headerTextHeight = headerRect.height;

    // Calculate symmetric position: distance from top to header = distance from header to content
    const targetContentTop = headerTop + headerTextHeight + headerTop;

    return targetContentTop;
}

// Episodi parallax configuration - desktop only
const episodiParallaxConfig = {
    enabled: true,
    // Original curves that maintain proper speed hierarchy
    sidebarEasing: t => 1 - Math.pow(1 - t, 4), // Stronger ease-out (slower)
    contentEasing: t => 1 - Math.pow(1 - t, 1.5), // Pure ease-out with moderate speed
};

// Episodi parallax state
let episodiParallaxState = null;

// Hero animation state
let heroAnimationState = null;

// Missione animation state
let missioneAnimationState = null;

// Candidati card stack animation state
let candidatiCardState = null;

// Initialize episodi parallax system - RESTORED ORIGINAL APPROACH
function initEpisodiParallax() {
    // Only enable on desktop
    if (window.innerWidth <= 768) return;

    const sidebar = document.querySelector('.sidebar');
    const contentArea = document.querySelector('.content-area');

    if (!sidebar || !contentArea) return;

    const deadzonePosition = calculateEpisodiDeadzonePosition();

    // Get original element positions
    const sidebarRect = sidebar.getBoundingClientRect();
    const contentRect = contentArea.getBoundingClientRect();

    const sidebarOriginalTop = sidebarRect.top + window.scrollY;
    const contentOriginalTop = contentRect.top + window.scrollY;

    // Apply viewport-locked positioning to actual elements
    sidebar.style.position = 'fixed';
    sidebar.style.top = sidebarRect.top + 'px';
    sidebar.style.left = sidebarRect.left + 'px';
    sidebar.style.width = sidebarRect.width + 'px';
    sidebar.style.height = sidebarRect.height + 'px';
    sidebar.style.zIndex = '1000';

    contentArea.style.position = 'fixed';
    contentArea.style.top = contentRect.top + 'px';
    contentArea.style.left = contentRect.left + 'px';
    contentArea.style.width = contentRect.width + 'px';
    contentArea.style.height = contentRect.height + 'px';
    contentArea.style.zIndex = '1000';

    // Calculate how far each element needs to move to reach deadzone
    const sidebarTravelDistance = sidebarOriginalTop - deadzonePosition;
    const contentTravelDistance = contentOriginalTop - deadzonePosition;

    // Add spacer to maintain document flow height
    const episodiBlock = document.querySelector('.episodi-block');
    const episodiOriginalHeight = episodiBlock.offsetHeight;

    const spacer = document.createElement('div');
    spacer.style.height = episodiOriginalHeight + 'px';
    spacer.className = 'episodi-spacer';
    episodiBlock.parentNode.insertBefore(spacer, episodiBlock.nextSibling);

    // Store state for use in updateScrollElements
    episodiParallaxState = {
        sidebar,
        contentArea,
        sidebarTravelDistance,
        contentTravelDistance,
        deadzonePosition,
        sidebarOriginalTop,
        contentOriginalTop
    };

    // Add resize handler for responsive updates
    window.addEventListener('resize', handleEpisodiResize);

    console.log('Episodi parallax initialized for desktop', {
        deadzonePosition,
        sidebarTravelDistance,
        contentTravelDistance,
        sidebarOriginalTop,
        contentOriginalTop
    });
}

// Optimized episodi resize handler with performance improvements
let episodiResizeTimeout = null;

function handleEpisodiResize() {
    if (!episodiParallaxState || window.innerWidth <= 768) return;

    // Throttle resize handling to avoid excessive recalculations
    if (episodiResizeTimeout) {
        clearTimeout(episodiResizeTimeout);
    }

    episodiResizeTimeout = setTimeout(() => {
        performEpisodiResize();
        episodiResizeTimeout = null;
    }, 150); // 150ms throttle
}

function performEpisodiResize() {
    const { sidebar, contentArea } = episodiParallaxState;

    // Cache scroll position for later use
    const scrollY = window.scrollY;

    // Temporarily restore natural flow for accurate measurements
    sidebar.style.position = '';
    sidebar.style.top = '';
    sidebar.style.left = '';
    sidebar.style.width = '';
    sidebar.style.height = '';

    contentArea.style.position = '';
    contentArea.style.top = '';
    contentArea.style.left = '';
    contentArea.style.width = '';
    contentArea.style.height = '';

    // Use requestAnimationFrame to ensure layout is complete before measuring
    requestAnimationFrame(() => {
        // Batch all DOM reads
        const newDeadzonePosition = calculateEpisodiDeadzonePosition();
        const newSidebarRect = sidebar.getBoundingClientRect();
        const newContentRect = contentArea.getBoundingClientRect();

        // Calculate all values before any DOM writes
        const newSidebarOriginalTop = newSidebarRect.top + scrollY;
        const newContentOriginalTop = newContentRect.top + scrollY;
        const newSidebarTravelDistance = newSidebarOriginalTop - newDeadzonePosition;
        const newContentTravelDistance = newContentOriginalTop - newDeadzonePosition;

        // Reapply fixed positioning with direct property assignments
        sidebar.style.position = 'fixed';
        sidebar.style.top = newSidebarRect.top + 'px';
        sidebar.style.left = newSidebarRect.left + 'px';
        sidebar.style.width = newSidebarRect.width + 'px';
        sidebar.style.height = newSidebarRect.height + 'px';
        sidebar.style.zIndex = '1000';

        contentArea.style.position = 'fixed';
        contentArea.style.top = newContentRect.top + 'px';
        contentArea.style.left = newContentRect.left + 'px';
        contentArea.style.width = newContentRect.width + 'px';
        contentArea.style.height = newContentRect.height + 'px';
        contentArea.style.zIndex = '1000';

        // Update state in single operation
        Object.assign(episodiParallaxState, {
            deadzonePosition: newDeadzonePosition,
            sidebarTravelDistance: newSidebarTravelDistance,
            contentTravelDistance: newContentTravelDistance,
            sidebarOriginalTop: newSidebarOriginalTop,
            contentOriginalTop: newContentOriginalTop
        });

        // Defer scroll update to next frame to avoid blocking
        requestAnimationFrame(() => {
            if (lenis) {
                updateEpisodiParallax(lenis.scroll, episodiParallaxState);
            }
        });

        console.log('Episodi parallax repositioned (optimized)', {
            newDeadzonePosition,
            newSidebarTravelDistance,
            newContentTravelDistance
        });
    });
}

// Initialize missione animations system - LENIS-BASED WITH IMMEDIATE DETACHMENT
function initMissioneAnimations() {
    console.log('Initializing missione animations with Lenis integration');

    const missioneContainer = document.getElementById('missioneContainer');
    const missioneBlock = document.querySelector('.missione-block');

    if (!missioneContainer || !missioneBlock) {
        console.log('Missione elements not found');
        return;
    }

    // Wait for content to be populated
    function attemptInitialization(attempts = 0) {
        const copyBlocks = missioneContainer.querySelectorAll('.copy-block');
        const ctaContainer = missioneContainer.querySelector('.cta-container');

        console.log(`Missione init attempt ${attempts + 1}: found ${copyBlocks.length} copy blocks, cta: ${!!ctaContainer}`);

        if ((copyBlocks.length === 0 && !ctaContainer) && attempts < 10) {
            setTimeout(() => attemptInitialization(attempts + 1), 200);
            return;
        }

        if (copyBlocks.length === 0 && !ctaContainer) {
            console.log('No missione content found after multiple attempts');
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

        // Add button element (more precise selector)
        if (ctaContainer) {
            const button = ctaContainer.querySelector('.missione-button');
            if (button) {
                elements.push(button);
            } else {
                // Fallback to container if button not found
                elements.push(ctaContainer);
            }
        }

        // Get original positions BEFORE making anything fixed (same as episodi approach)
        const originalContainerRect = missioneContainer.getBoundingClientRect();
        const originalContainerTop = originalContainerRect.top + window.scrollY;

        // Store original element positions BEFORE fixing the container
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
        // Calculate viewport-centered position for missione section
        const viewportCenterY = window.innerHeight / 2;
        const containerCenterY = viewportCenterY - (originalContainerRect.height / 2);

        missioneContainer.style.position = 'fixed';
        missioneContainer.style.top = Math.max(containerCenterY, 20) + 'px'; // Ensure minimum 20px from top
        missioneContainer.style.left = '50%';
        missioneContainer.style.transform = 'translateX(-50%)'; // Center horizontally
        missioneContainer.style.width = 'clamp(320px, 95vw, 1400px)'; // RESPONSIVE width (wider max for desktop)
        missioneContainer.style.height = 'auto'; // Let content determine height
        missioneContainer.style.zIndex = '1000';

        // Initially hide container - will be shown when animation sequence starts
        missioneContainer.style.visibility = 'hidden';
        missioneContainer.style.opacity = '0';

        console.log('Container positioning debug:', {
            originalContainerRect,
            viewportCenterY,
            containerCenterY,
            finalTop: Math.max(containerCenterY, 20),
            containerStyle: {
                position: missioneContainer.style.position,
                top: missioneContainer.style.top,
                left: missioneContainer.style.left,
                transform: missioneContainer.style.transform,
                width: missioneContainer.style.width,
                height: missioneContainer.style.height,
                zIndex: missioneContainer.style.zIndex
            },
            centeredHorizontally: true
        });

        // Add spacer to maintain document flow height (same as episodi approach)
        const missioneOriginalHeight = missioneBlock.offsetHeight;
        const spacer = document.createElement('div');
        spacer.style.height = missioneOriginalHeight + 'px';
        spacer.className = 'missione-spacer';
        missioneBlock.parentNode.insertBefore(spacer, missioneBlock.nextSibling);

        console.log('Container immediately fixed positioned (like episodi):', {
            top: originalContainerRect.top,
            left: originalContainerRect.left,
            width: originalContainerRect.width,
            height: originalContainerRect.height,
            spacerHeight: missioneOriginalHeight
        });

        const elementData = originalElementPositions.map((elementPos, index) => {
            const { element } = elementPos;

            // REVERSE STAGGER: last elements animate first (bottom to top)
            const totalElements = elements.length;
            const reverseIndex = totalElements - 1 - index;

            // Calculate position relative to the ORIGINAL container position (before it was fixed)
            const relativeTop = elementPos.top - originalContainerTop;
            const relativeLeft = elementPos.left - originalContainerRect.left;

            // Determine element type for specific styling
            const isButton = element.classList.contains('missione-button');

            // Use relative positioning within responsive container
            element.style.position = 'relative';
            element.style.top = '';
            element.style.left = '';
            // Button width: fit-content (based on text), Text elements: 100%
            element.style.width = isButton ? 'fit-content' : '100%';
            element.style.height = 'auto';
            element.style.textAlign = 'center';
            // Spacing is handled by CSS rules

            // Start elements hidden below their own line (reduced movement)
            element.style.transform = 'translateY(30px)';
            element.style.opacity = '0';
            element.style.visibility = 'visible';

            // Add classes for tracking
            element.classList.add('missione-animated');
            element.dataset.animationIndex = index;
            element.dataset.reverseIndex = reverseIndex;

            console.log(`Element ${index} (reverse order ${reverseIndex}): positioned at top:${relativeTop}px, left:${relativeLeft}px, original was top:${elementPos.top}px`);

            return {
                element,
                relativeTop,
                relativeLeft,
                index,
                reverseIndex
            };
        });

        // Calculate scroll trigger positions - 75% through episodi EXIT animation
        const episodiDeadzoneEnd = 1450; // From episodi configuration
        const episodiExitEnd = 2450;
        const episodiExitDuration = episodiExitEnd - episodiDeadzoneEnd; // 1000px

        // Start at 75% through episodi EXIT animation (not entire episodi section)
        const entranceStart = episodiDeadzoneEnd + (episodiExitDuration * 0.75); // 1450 + 750 = 2200px
        const entranceEnd = entranceStart + 750; // 750px entrance duration (2.5x longer)
        const deadzoneEnd = entranceEnd + 250;   // 250px deadzone (same as episodi)
        const exitEnd = deadzoneEnd + 750;       // 750px exit duration (2.5x longer)

        console.log('Missione scroll positions (Lenis-driven):', {
            entranceStart,
            entranceEnd,
            deadzoneEnd,
            exitEnd,
            episodiExitStart: episodiDeadzoneEnd,
            episodiExitEnd: episodiExitEnd,
            startsAt75PercentOfEpisodiExit: true
        });

        // Font size auto-adjustment system - calculates based on longest text of each type
        function setupAutoFontSizing() {
            if (!elementData || elementData.length === 0) return;

            const isMobile = window.innerWidth <= 768;
            console.log(`Setting up font sizing (${isMobile ? 'mobile' : 'desktop'} - auto-calculated based on longest text)`);

            // Calculate max widths based on container's actual width
            // Use fixed padding approach for more generous sizing on larger screens
            const containerWidth = missioneContainer.offsetWidth;
            const horizontalPadding = 60; // 30px on each side
            const h3MaxWidth = containerWidth - horizontalPadding;
            const pMaxWidth = containerWidth - horizontalPadding;

            console.log('Container widths for font calculation:', {
                containerWidth,
                horizontalPadding,
                h3MaxWidth,
                pMaxWidth,
                isMobile
            });

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

            // Calculate optimal font sizes for each type
            let h3FontSize, pFontSize;

            if (h3Elements.length > 0 && pElements.length > 0) {
                // Calculate both sizes
                h3FontSize = calculateOptimalFontSize(h3Elements, h3MaxWidth, 'h3');
                pFontSize = calculateOptimalFontSize(pElements, pMaxWidth, 'p');

                // ENFORCE HIERARCHY: h3 must be larger than p
                if (pFontSize >= h3FontSize) {
                    pFontSize = Math.floor(h3FontSize * 0.85); // p is 85% of h3
                    console.log(`Hierarchy enforced: p reduced to ${pFontSize}px (85% of h3 ${h3FontSize}px)`);
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
        }

        // Calculate optimal font size based on longest text in the group
        function calculateOptimalFontSize(elements, maxWidth, elementType) {
            const isMobile = window.innerWidth <= 768;

            // Find the longest text
            let longestText = '';
            elements.forEach(element => {
                const text = element.textContent.trim();
                if (text.length > longestText.length) {
                    longestText = text;
                }
            });

            console.log(`Calculating font size for ${elementType} based on longest text: "${longestText.substring(0, 30)}..." (${longestText.length} chars)`);

            // Font size ranges
            const minSize = isMobile ? 12 : 12;
            const maxSize = isMobile ? 24 : (elementType === 'h3' ? 48 : 36);

            // Use maxWidth for BOTH mobile and desktop - it's already calculated correctly
            // maxWidth = containerWidth - horizontalPadding (accounts for actual container dimensions)
            // For mobile: h3 uses full width, p uses 95% of available width
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
                // Each character adds 0.08em, so total added width ≈ (text.length * fontSize * 0.08)
                const letterSpacingWidth = elementType === 'h3' ? (longestText.length * fontSize * 0.08) : 0;
                const totalWidth = textWidth + letterSpacingWidth;

                if (totalWidth <= maxAllowedWidth) {
                    optimalSize = fontSize;
                } else {
                    break; // This size is too big, use previous size
                }
            }

            const finalTextWidth = measureTextWidth(longestText, optimalSize, elementType === 'h3' ? '600' : '400');
            const linesUsed = finalTextWidth / singleLineWidth;

            console.log(`Optimal ${elementType} font size: ${optimalSize}px (${isMobile ? `mobile, uses ${linesUsed.toFixed(2)} lines` : `desktop, fits in ${finalTextWidth}px / ${maxWidth}px`})`);

            return optimalSize;
        }

        // Measure text width using canvas
        function measureTextWidth(text, fontSize, fontWeight = '400') {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            context.font = `${fontWeight} ${fontSize}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
            return context.measureText(text).width;
        }

        // Apply calculated font size to all elements of this type
        function applyFontSizeToElements(elements, fontSize, elementType) {
            const isMobile = window.innerWidth <= 768;

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
                    // Clear any webkit line clamp properties
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

            console.log(`Applied ${fontSize}px font size to ${elements.length} ${elementType} elements (${isMobile ? `mobile: ${elementType === 'h3' ? '100%' : '95%'} of container, natural wrap to max ~2 lines, NO ellipsis` : 'desktop: single line nowrap'})`);
        }

        // Initial font sizing setup
        setupAutoFontSizing();

        // Resize handler for positioning and font size updates
        function recalculateMissioneLayout() {
            if (!missioneAnimationState) return;

            console.log('Recalculating missione layout for viewport resize');

            // 1. Recalculate font sizes for new container widths
            setupAutoFontSizing();

            // 2. Recalculate container center position vertically
            const newViewportCenterY = window.innerHeight / 2;
            const newContainerCenterY = newViewportCenterY - (missioneContainer.offsetHeight / 2);

            // Update container position (keep it centered)
            missioneContainer.style.top = Math.max(newContainerCenterY, 20) + 'px';

            console.log('Layout recalculated:', {
                newTop: missioneContainer.style.top,
                viewportSize: `${window.innerWidth}x${window.innerHeight}`,
                fontSizesUpdated: true
            });
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

        // Add new debounced resize handler
        window.missioneResizeHandler = debouncedResizeHandler;
        window.addEventListener('resize', debouncedResizeHandler);

        // Store state for use in updateScrollElements (called by Lenis RAF loop)
        missioneAnimationState = {
            elements: elementData,
            missioneBlock,
            missioneContainer,
            entranceStart,
            entranceEnd,
            deadzoneEnd,
            exitEnd,
            originalContainerTop
        };

        console.log('Missione Lenis-based animations initialized successfully', {
            elementCount: elements.length,
            reverseStaggerOrder: 'button → middle → top',
            detachedFromScroll: true,
            lenisIntegrated: true,
            responsiveContainer: true,
            fontSizing: 'auto-calculated with 60px padding',
            containerWidth: 'clamp(320px, 95vw, 1400px)',
            positioning: 'fixed container, relative elements',
            animations: '30px peek-through entrance/exit'
        });
    }

    // Start initialization attempts
    attemptInitialization();
}

// Initialize candidati card stack system - SCROLL-DECOUPLED 3-PHASE ANIMATION
function initCandidatiCardStack() {
    console.log('🚀🚀🚀 CANDIDATI INIT START - CHECKING IF THIS RUNS 🚀🚀🚀');

    // Query DOM elements
    // NEW STRUCTURE: Select independent fixed elements (no parent container)
    const candidatiSpacer = document.querySelector('.candidati-spacer');
    const candidatiTitleWrapper = document.querySelector('.candidati-title-wrapper');
    const candidatiTitle = candidatiTitleWrapper?.querySelector('.candidati-title');
    const cardWrappers = document.querySelectorAll('.candidati-card-wrapper');
    const cards = document.querySelectorAll('.candidati-card-wrapper .form-card');
    const submitButtonContainer = document.querySelector('.submit-button-container');

    console.log('🔍 Element check (new structure):', {
        candidatiSpacer: !!candidatiSpacer,
        candidatiTitleWrapper: !!candidatiTitleWrapper,
        candidatiTitle: !!candidatiTitle,
        cardWrappersCount: cardWrappers?.length,
        cardsCount: cards?.length,
        submitButtonContainer: !!submitButtonContainer
    });

    // Validate elements
    if (!candidatiSpacer || !candidatiTitleWrapper || !candidatiTitle || !cardWrappers || cardWrappers.length !== 5 || !cards || cards.length !== 5 || !submitButtonContainer) {
        console.error('❌❌❌ VALIDATION FAILED - EARLY RETURN', {
            candidatiSpacer: !!candidatiSpacer,
            candidatiTitleWrapper: !!candidatiTitleWrapper,
            candidatiTitle: !!candidatiTitle,
            cardWrappers: cardWrappers?.length,
            cards: cards?.length,
            submitButtonContainer: !!submitButtonContainer
        });
        return;
    }

    console.log('✅ Validation passed, continuing with new structure...');

    const totalCards = cards.length;

    // Get spacer position for scroll range calculation
    const spacerRect = candidatiSpacer.getBoundingClientRect();
    const spacerTop = spacerRect.top + window.scrollY;

    // Elements are already fixed via CSS - no positioning setup needed
    const topPosition = 60; // Fixed top position defined in CSS

    // Set spacer height to maintain document scroll range
    const totalScrollRange = window.innerHeight * 6; // 600vh
    candidatiSpacer.style.height = totalScrollRange + 'px';

    console.log('Candidati spacer configured:', {
        height: totalScrollRange,
        inVH: '600vh',
        spacerPosition: spacerTop
    });

    // Calculate scroll ranges - based on spacer position
    const titleEntranceStart = spacerTop;

    console.log('Candidati timing:', {
        missioneExitEnd: missioneAnimationState?.exitEnd || 'N/A',
        candidatiStart: titleEntranceStart,
        spacerTop: spacerTop
    });

    // Phase 1: Title entrance (50vh)
    const titleEntranceEnd = titleEntranceStart + window.innerHeight * 0.5;

    // Phase 2: Card entrance (150vh)
    const cardEntranceStart = titleEntranceEnd;
    const cardEntranceDuration = window.innerHeight * 1.5;
    const cardEntranceEnd = cardEntranceStart + cardEntranceDuration;

    // Phase 3: Deadzone (200vh)
    const cardDeadzoneDuration = window.innerHeight * 2;
    const cardDeadzoneEnd = cardEntranceEnd + cardDeadzoneDuration;

    console.log('Candidati scroll ranges (decoupled):', {
        titleEntranceStart,
        titleEntranceEnd,
        cardEntranceStart,
        cardEntranceEnd,
        cardDeadzoneEnd,
        totalScrollRange: cardDeadzoneEnd - titleEntranceStart,
        missioneExitStart: missioneAnimationState?.deadzoneEnd || 'N/A'
    });

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
        if (submitButtonContainer) {
            submitButtonHeight = submitButtonContainer.offsetHeight;
            submitButtonBottomMargin = viewportHeight * 0.05; // 5vh
        }

        // Calculate available vertical space for cards
        // From: title bottom to: submit button top (with gap)
        const cardAreaStartY = fixedTopPosition + titleHeight + titleMarginBottom;
        const cardAreaEndY = viewportHeight - submitButtonHeight - submitButtonBottomMargin;
        const availableHeight = cardAreaEndY - cardAreaStartY;

        // Ensure minimum usable height (400px as defined in CSS)
        const finalCardHeight = Math.max(400, availableHeight);

        console.log('📐 Card height calculation (new structure):', {
            viewportHeight,
            fixedTopPosition,
            titleHeight,
            titleMarginBottom,
            submitButtonHeight,
            submitButtonBottomMargin,
            cardAreaStartY,
            cardAreaEndY,
            availableHeight,
            finalCardHeight
        });

        // Set height on all cards
        cards.forEach(card => {
            card.style.height = finalCardHeight + 'px';
        });

        return { cardHeight: finalCardHeight };
    }

    // Function to optimize card internal sizing to fit without scrolling
    function optimizeCardInternalSizing(cardHeight) {
        console.log('🎯 Starting card internal sizing optimization');

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

            console.log(`Card ${index} natural height: ${totalNaturalHeight}px (header: ${headerHeight}, content: ${contentHeight}, nav: ${navigationHeight})`);
        });

        // Find busiest card (tallest natural content height)
        const busiestCard = cardMeasurements.reduce((max, current) =>
            current.totalNaturalHeight > max.totalNaturalHeight ? current : max
        );

        console.log(`🏆 Busiest card: ${busiestCard.index} with ${busiestCard.totalNaturalHeight}px natural height`);

        // Calculate available space for content in actual card height
        const availableContentHeight = cardHeight - busiestCard.headerHeight - busiestCard.navigationHeight;

        console.log(`📏 Available content height: ${availableContentHeight}px (from card height ${cardHeight}px)`);

        // Calculate how much we need to shrink textareas if busiest card doesn't fit
        if (busiestCard.contentHeight > availableContentHeight) {
            const excessHeight = busiestCard.contentHeight - availableContentHeight;
            const textareasInBusiestCard = busiestCard.content.querySelectorAll('textarea');

            if (textareasInBusiestCard.length > 0) {
                // Distribute height reduction across all textareas
                const reductionPerTextarea = excessHeight / textareasInBusiestCard.length;

                // Apply textarea height reduction to ALL cards
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

                console.log(`✂️ Reduced textarea heights by ${reductionPerTextarea.toFixed(1)}px each`);
            }
        } else {
            console.log(`✅ Content fits naturally - no size adjustments needed`);
        }

        console.log('🎯 Card internal sizing optimization complete');
    }

    // Calculate initial heights
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

    const sidebarEasing = t => 1 - Math.pow(1 - t, 2.5);
    const contentEasing = t => 1 - Math.pow(1 - t, 1.8);

    let currentCardIndex = 0;

    function updateNavigationButtons(hideNonCurrent = false) {
        // Show/hide card wrappers and update button visibility
        cardWrappers.forEach((wrapper, index) => {
            const card = cards[index];
            const prevButton = card.querySelector('[data-direction="prev"]');
            const nextButton = card.querySelector('[data-direction="next"]');

            // During deadzone/manual navigation, hide non-current cards
            // During scroll animations, keep all visible
            if (hideNonCurrent) {
                if (index === currentCardIndex) {
                    wrapper.style.visibility = 'visible';
                    wrapper.style.pointerEvents = 'auto';
                } else {
                    wrapper.style.visibility = 'hidden';
                    wrapper.style.pointerEvents = 'none';
                }
            } else {
                // During scroll animations, keep all visible
                wrapper.style.visibility = 'visible';
                wrapper.style.pointerEvents = 'auto';
            }

            // Update button visibility
            if (prevButton) {
                prevButton.style.display = (index === 0) ? 'none' : 'block';
            }
            if (nextButton) {
                nextButton.style.display = (index === totalCards - 1) ? 'none' : 'block';
            }
        });
    }

    // Attach navigation click listeners
    cards.forEach((card, index) => {
        const prevButton = card.querySelector('[data-direction="prev"]');
        const nextButton = card.querySelector('[data-direction="next"]');

        if (prevButton) {
            prevButton.addEventListener('click', () => {
                if (currentCardIndex > 0) {
                    currentCardIndex--;
                    updateNavigationButtons(true); // Hide non-current cards during manual navigation
                }
            });
        }

        if (nextButton) {
            nextButton.addEventListener('click', () => {
                if (currentCardIndex < totalCards - 1) {
                    currentCardIndex++;
                    updateNavigationButtons(true); // Hide non-current cards during manual navigation
                }
            });
        }
    });

    updateNavigationButtons();

    // Store state globally
    candidatiCardState = {
        candidatiSpacer,
        candidatiTitleWrapper,
        candidatiTitle,
        submitButtonContainer,
        cardWrappers,
        cards,
        titleEntranceStart,
        titleEntranceEnd,
        cardEntranceStart,
        cardEntranceEnd,
        cardDeadzoneEnd,
        totalCards,
        currentCardIndex,
        calculateCardOffsets,
        updateNavigationButtons,
        calculateAndSetCardHeight,  // Store for resize recalculation
        optimizeCardInternalSizing, // Store for resize recalculation
        sidebarEasing,
        contentEasing,
        titleHiddenY
    };

    // Add resize handler for responsive container and card height recalculation
    let resizeTimeout;
    const handleResize = () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            console.log('🔄 Viewport resized - recalculating everything');
            const { cardHeight: newCardHeight } = calculateAndSetCardHeight();
            optimizeCardInternalSizing(newCardHeight);
        }, 150); // Debounce 150ms
    };

    window.addEventListener('resize', handleResize);

    console.log('Candidati card stack initialized successfully (scroll-decoupled, synced with missione exit, responsive height)');
}

// Optimized episodi parallax with batched DOM updates
function updateEpisodiParallax(scrollY, elements) {
    if (!episodiParallaxConfig.enabled || window.innerWidth <= 768) return;

    const {
        sidebar,
        contentArea,
        sidebarTravelDistance,
        contentTravelDistance,
        deadzonePosition,
        sidebarOriginalTop,
        contentOriginalTop
    } = elements;

    // Phase definitions
    const entranceStart = 200;
    const entranceEnd = 1200;    // Elements reach deadzone
    const deadzoneEnd = 1450;    // 250px deadzone duration
    const exitEnd = 2450;        // 1000px exit animation

    // Calculate all values first, then batch DOM updates
    let sidebarTop, contentTop, sidebarOpacity, contentOpacity, sidebarTransform, contentTransform;

    if (scrollY < entranceStart) {
        // Before entrance - elements at original positions
        sidebarTop = sidebarOriginalTop;
        contentTop = contentOriginalTop;
        sidebarOpacity = contentOpacity = 1;
        sidebarTransform = contentTransform = 'translateX(0)';

    } else if (scrollY <= entranceEnd) {
        // Phase 1: Entrance - current parallax behavior
        const scrollProgress = (scrollY - entranceStart) / (entranceEnd - entranceStart);
        const sidebarEasedProgress = episodiParallaxConfig.sidebarEasing(scrollProgress);
        const contentEasedProgress = episodiParallaxConfig.contentEasing(scrollProgress);

        const sidebarMovement = sidebarTravelDistance * sidebarEasedProgress;
        const contentMovement = contentTravelDistance * contentEasedProgress;

        sidebarTop = sidebarOriginalTop - sidebarMovement;
        contentTop = contentOriginalTop - contentMovement;
        sidebarOpacity = contentOpacity = 1;
        sidebarTransform = contentTransform = 'translateX(0)';

    } else if (scrollY <= deadzoneEnd) {
        // Phase 2: Deadzone - elements stay fixed at deadzone positions
        sidebarTop = sidebarOriginalTop - sidebarTravelDistance;
        contentTop = contentOriginalTop - contentTravelDistance;
        sidebarOpacity = contentOpacity = 1;
        sidebarTransform = contentTransform = 'translateX(0)';

    } else {
        // Phase 3: Exit - horizontal slide out with fade (hero-style)
        const exitProgress = Math.min(1, (scrollY - deadzoneEnd) / (exitEnd - deadzoneEnd));
        const exitEasing = Math.pow(exitProgress, 1.25); // Same as hero easeInFast

        // Calculate fade (same as hero: starts at 33%, fully faded at 80%)
        let opacity = 1;
        if (exitProgress >= 0.33) {
            if (exitProgress >= 0.8) {
                opacity = 0;
            } else {
                const fadeProgress = (exitProgress - 0.33) / 0.47;
                opacity = 1 - Math.pow(fadeProgress, 0.5);
            }
        }

        // Horizontal movement (less range than hero since elements are positioned differently)
        const moveDistance = 60; // 60vw instead of 100vw for hero
        const sidebarMoveX = -moveDistance * exitEasing; // Left
        const contentMoveX = moveDistance * exitEasing;   // Right

        sidebarTop = sidebarOriginalTop - sidebarTravelDistance;
        contentTop = contentOriginalTop - contentTravelDistance;
        sidebarOpacity = contentOpacity = opacity;
        sidebarTransform = `translateX(${sidebarMoveX}vw)`;
        contentTransform = `translateX(${contentMoveX}vw)`;
    }

    // Efficient direct property updates (faster than cssText manipulation)
    sidebar.style.top = sidebarTop + 'px';
    sidebar.style.opacity = sidebarOpacity;
    sidebar.style.transform = sidebarTransform;

    contentArea.style.top = contentTop + 'px';
    contentArea.style.opacity = contentOpacity;
    contentArea.style.transform = contentTransform;
}

// Update missione animations - LENIS-DRIVEN 3-PHASE SYSTEM
function updateMissioneAnimations(scrollY, animationState) {
    if (!animationState) return;

    const { elements, entranceStart, entranceEnd, deadzoneEnd, exitEnd, missioneContainer } = animationState;

    if (!elements || elements.length === 0) return;

    // Animation parameters
    const elementAnimationDuration = 500; // Each element animates over 500px (2.5x longer)
    const staggerOffset = 50; // 50px stagger between elements
    const moveDistance = 30; // 30px movement (subtle peek-through effect like reference)

    // CONTAINER VISIBILITY CONTROL - hide section before entry and after exit
    const currentVisibility = missioneContainer.style.visibility;

    if (scrollY < entranceStart) {
        // Before animation sequence - hide entire section
        if (currentVisibility !== 'hidden') {
            missioneContainer.style.visibility = 'hidden';
            missioneContainer.style.opacity = '0';
            console.log('Missione section hidden (before entry trigger)');
        }
    } else if (scrollY > exitEnd) {
        // After animation sequence - hide entire section
        if (currentVisibility !== 'hidden') {
            missioneContainer.style.visibility = 'hidden';
            missioneContainer.style.opacity = '0';
            console.log('Missione section hidden (after exit sequence)');
        }
    } else {
        // During animation sequence - show section at entranceStart (elements still hidden, ready for gradual emergence)
        if (currentVisibility !== 'visible') {
            missioneContainer.style.visibility = 'visible';
            missioneContainer.style.opacity = '1';
            console.log('Missione section visible (animation sequence active)');
        }
    }

    elements.forEach((elementData) => {
        const { element, reverseIndex } = elementData;

        // Calculate staggered timing for this element (reverse order - button first)
        const elementEntranceStart = entranceStart + (reverseIndex * staggerOffset);
        const elementEntranceEnd = elementEntranceStart + elementAnimationDuration;

        const elementExitStart = deadzoneEnd + (reverseIndex * staggerOffset);
        const elementExitEnd = elementExitStart + elementAnimationDuration;

        if (scrollY < elementEntranceStart) {
            // Phase 1: Before entrance - hidden below its own line
            element.style.transform = 'translateY(30px)';
            element.style.opacity = '0';
            element.classList.remove('animated', 'exiting');

        } else if (scrollY >= elementEntranceStart && scrollY <= elementEntranceEnd) {
            // Phase 2: Entrance animation - peek through its own line
            const progress = (scrollY - elementEntranceStart) / elementAnimationDuration;
            const easedProgress = 1 - Math.pow(1 - progress, 1.3); // Ease-out with exponent 1.3

            const translateY = moveDistance * (1 - easedProgress); // 30px → 0px
            const opacity = easedProgress; // 0 → 1

            element.style.transform = `translateY(${translateY}px)`;
            element.style.opacity = opacity;

            if (!element.classList.contains('animated')) {
                element.classList.add('animated');
                console.log(`Element ${elementData.index} (reverse order ${reverseIndex}) peeking through line at scroll ${scrollY}`);
            }

        } else if (scrollY > elementEntranceEnd && scrollY <= elementExitStart) {
            // Phase 3: Deadzone - fully visible at natural position
            element.style.transform = 'translateY(0px)';
            element.style.opacity = '1';
            element.classList.add('animated');
            element.classList.remove('exiting');

        } else if (scrollY > elementExitStart && scrollY <= elementExitEnd) {
            // Phase 4: Exit animation - disappear behind its own line
            const progress = (scrollY - elementExitStart) / elementAnimationDuration;
            const easedProgress = Math.pow(progress, 1.25); // Ease-in (same as hero easeInFast)

            const translateY = -moveDistance * easedProgress; // 0px → -30px
            const opacity = 1 - easedProgress; // 1 → 0

            element.style.transform = `translateY(${translateY}px)`;
            element.style.opacity = opacity;

            if (!element.classList.contains('exiting')) {
                element.classList.add('exiting');
                console.log(`Element ${elementData.index} (reverse order ${reverseIndex}) disappearing behind line at scroll ${scrollY}`);
            }

        } else if (scrollY > elementExitEnd) {
            // Phase 5: After exit - hidden above its own line
            element.style.transform = 'translateY(-30px)';
            element.style.opacity = '0';
            element.classList.remove('animated');
            element.classList.add('exiting');
        }
    });
}

// Update candidati card stack animations - SCROLL-DECOUPLED 3-PHASE SYSTEM
function updateCandidatiCardStack(scrollY, cardState) {
    if (!cardState) return;

    // Destructure state
    const {
        candidatiTitleWrapper,
        candidatiTitle,
        submitButtonContainer,
        cardWrappers,
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
        titleHiddenY
    } = cardState;

    // No visibility control needed - elements are independent and always in layout
    // Early return if before candidati section starts
    if (scrollY < titleEntranceStart) {
        return;
    } else if (scrollY > cardDeadzoneEnd) {
        return;
    }

    // PHASE 1: Title entrance animation (50vh)
    // Animate candidatiTitleWrapper (position: fixed)
    if (scrollY >= titleEntranceStart && scrollY <= titleEntranceEnd) {
        const progress = (scrollY - titleEntranceStart) / (titleEntranceEnd - titleEntranceStart);
        const easedProgress = sidebarEasing(progress);
        const translateY = titleHiddenY * (1 - easedProgress);
        const opacity = easedProgress;

        candidatiTitleWrapper.style.transform = `translate(-50%, ${translateY}px)`;
        candidatiTitleWrapper.style.opacity = opacity;

    } else if (scrollY < titleEntranceStart) {
        candidatiTitleWrapper.style.transform = `translate(-50%, ${titleHiddenY}px)`;
        candidatiTitleWrapper.style.opacity = '0';

    } else if (scrollY > titleEntranceEnd) {
        candidatiTitleWrapper.style.transform = 'translate(-50%, 0px)';
        candidatiTitleWrapper.style.opacity = '1';
    }

    // Calculate stack offsets
    const offsets = calculateCardOffsets();
    const totalOffsetX = (totalCards - 1) * offsets.x;
    const centerOffsetX = -totalOffsetX / 2;

    // PHASE 2: Card progressive reveal (150vh)
    // Animate cardWrappers (position: fixed)
    if (scrollY >= cardEntranceStart && scrollY <= cardEntranceEnd) {
        const totalProgress = (scrollY - cardEntranceStart) / (cardEntranceEnd - cardEntranceStart);

        // Animate each card wrapper with staggered timing
        cardWrappers.forEach((wrapper, index) => {
            const cardEntranceFraction = index / totalCards;
            const cardCompleteFraction = (index + 1) / totalCards;

            let cardProgress = 0;
            if (totalProgress >= cardEntranceFraction) {
                if (totalProgress <= cardCompleteFraction) {
                    const fractionRange = cardCompleteFraction - cardEntranceFraction;
                    cardProgress = fractionRange > 0 ? (totalProgress - cardEntranceFraction) / fractionRange : 1;
                } else {
                    cardProgress = 1;
                }
            }

            const easedCardProgress = sidebarEasing(cardProgress);
            const cardOffsetX = centerOffsetX + (index * offsets.x);
            const translateXVw = 100 * (1 - easedCardProgress);
            const opacity = easedCardProgress;

            wrapper.style.transform = `translate(calc(-50% + ${cardOffsetX}px), 0) translateX(${translateXVw}vw)`;
            wrapper.style.opacity = opacity;

            // Update current card index when card is >50% visible
            if (cardProgress > 0.5 && index > cardState.currentCardIndex) {
                cardState.currentCardIndex = index;
                cardState.updateNavigationButtons();
            }
        });

        // Submit button animation (starts at 80% of phase)
        const submitStartFraction = Math.max(0.7, (totalCards - 1) / totalCards);
        let submitProgress = 0;
        if (totalProgress >= submitStartFraction) {
            submitProgress = (totalProgress - submitStartFraction) / (1 - submitStartFraction);
            submitProgress = Math.min(1, Math.max(0, submitProgress));
        }

        const easedSubmitProgress = contentEasing(submitProgress);
        const submitOpacity = easedSubmitProgress;

        if (submitButtonContainer) {
            submitButtonContainer.style.transform = 'translateX(-50%)';
            submitButtonContainer.style.opacity = submitOpacity;
        }

    } else if (scrollY < cardEntranceStart) {
        // Before phase 2 - all card wrappers hidden
        cardWrappers.forEach((wrapper, index) => {
            const cardOffsetX = centerOffsetX + (index * offsets.x);
            wrapper.style.transform = `translate(calc(-50% + ${cardOffsetX}px), 0) translateX(100vw)`;
            wrapper.style.opacity = '0';
        });

        if (submitButtonContainer) {
            submitButtonContainer.style.transform = 'translateX(-50%)';
            submitButtonContainer.style.opacity = '0';
        }
    }

    // PHASE 3: Deadzone (interaction phase, 200vh)
    else if (scrollY > cardEntranceEnd && scrollY <= cardDeadzoneEnd) {
        const deadzoneProgress = (scrollY - cardEntranceEnd) / (cardDeadzoneEnd - cardEntranceEnd);
        const targetCardIndex = Math.floor(deadzoneProgress * totalCards);

        // All card wrappers at final position
        cardWrappers.forEach((wrapper, index) => {
            const cardOffsetX = centerOffsetX + (index * offsets.x);
            wrapper.style.transform = `translate(calc(-50% + ${cardOffsetX}px), 0) translateX(0vw)`;
            wrapper.style.opacity = '1';
        });

        // Update current card based on deadzone scroll
        const newCardIndex = Math.min(Math.max(0, targetCardIndex), totalCards - 1);
        if (newCardIndex !== cardState.currentCardIndex) {
            cardState.currentCardIndex = newCardIndex;
            cardState.updateNavigationButtons(true); // Hide non-current cards during deadzone
        }

        // Submit button at final position
        if (submitButtonContainer) {
            submitButtonContainer.style.transform = 'translateX(-50%)';
            submitButtonContainer.style.opacity = '1';
        }
    }
}

// Update hero animations - RESTORED TO USE DECOUPLED SCROLL SYSTEM
function updateHeroAnimations(scrollY) {
    // Hero animations are now handled by the decoupled scroll system
    // This function is kept for compatibility but functionality moved to decoupled elements
    // updateDecoupledElements() handles hero animations automatically
}

// Start
document.addEventListener('DOMContentLoaded', loadContent);