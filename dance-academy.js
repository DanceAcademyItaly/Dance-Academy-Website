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
            normalizeWheel: true,
            // CRITICAL: Programmatically prevent Lenis from capturing events on horizontal scroll containers
            // This allows native horizontal scrolling to work on mobile devices
            prevent: (node) => {
                // Prevent Lenis on elements with data-lenis-prevent attribute
                if (node.hasAttribute && node.hasAttribute('data-lenis-prevent')) {
                    return true;
                }
                // Prevent Lenis on elements with data-lenis-prevent-touch attribute
                if (node.hasAttribute && node.hasAttribute('data-lenis-prevent-touch')) {
                    return true;
                }
                // Prevent Lenis on coreografie grids (horizontal scroll containers)
                if (node.classList && node.classList.contains('coreografie-grid')) {
                    return true;
                }
                // Prevent Lenis on any child of coreografie grid
                if (node.closest && node.closest('.coreografie-grid')) {
                    return true;
                }
                // Prevent Lenis on episodi container wrapper
                if (node.classList && node.classList.contains('episodi-container-wrapper')) {
                    return true;
                }
                // Prevent Lenis on any child of episodi container
                if (node.closest && node.closest('.episodi-container-wrapper')) {
                    return true;
                }
                return false;
            }
        });

        // Mark as initialized
        isScrollSystemInitialized = true;
        document.documentElement.classList.add('js-loaded', 'lenis-enabled', 'lenis', 'lenis-smooth');

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

        // Initialize episodi fixed system now that Lenis is ready
        if (hasEpisodes) {
            initEpisodiFixedSystem();
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

    // Episodi animations handled by updateEpisodiAnimations (called separately)

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
        populateEpisodes();

        // Initialize episodi fixed system (will be called when Lenis is ready)

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

    // Build mobile selector (hidden on desktop, shown on mobile)
    const mobileSelector = document.getElementById('episodiMobileSelector');
    if (mobileSelector) {
        mobileSelector.innerHTML = '';
        siteContent.episodes.seasons.forEach(season => {
            if (!season?.episodes?.length) return;

            season.episodes.forEach(episode => {
                const option = document.createElement('option');
                option.value = episode.id;
                option.textContent = `${season.name} - ${episode.title}`;
                if (episode.id === defaultEpisodeId) {
                    option.selected = true;
                }
                mobileSelector.appendChild(option);
            });
        });

        // Add change event listener for mobile selector
        mobileSelector.onchange = (e) => {
            const episodeId = parseInt(e.target.value);
            switchEpisode(episodeId);
        };
    }

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
                // CRITICAL: Prevent Lenis from capturing events on horizontal scroll container
                // data-lenis-prevent: Blocks both wheel and touch events
                // data-lenis-prevent-touch: Specifically blocks touch/gesture events for mobile scrolling
                grid.setAttribute('data-lenis-prevent', '');
                grid.setAttribute('data-lenis-prevent-touch', '');

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

    // Helper function to select last episode in a season
    const selectLastEpisodeInSeason = (seasonId) => {
        // Find the season in siteContent
        const season = siteContent.episodes.seasons.find(s => s.id == seasonId);
        if (season && season.episodes && season.episodes.length > 0) {
            const lastEpisode = season.episodes[season.episodes.length - 1];
            switchEpisode(lastEpisode.id);
        }
    };

    // If clicking the same season or no season is expanded, toggle immediately
    if (!currentlyExpanded || currentlyExpanded.dataset.season == seasonId) {
        headers.forEach(header => {
            if (header.dataset.season == seasonId) {
                header.classList.toggle('active');
            } else {
                header.classList.remove('active');
            }
        });

        const isExpanding = !targetList.classList.contains('expanded');

        lists.forEach(list => {
            if (list.dataset.season == seasonId) {
                list.classList.toggle('expanded');
            } else {
                list.classList.remove('expanded');
            }
        });

        // If we just expanded the season, select last episode after animation
        if (isExpanding) {
            setTimeout(() => {
                selectLastEpisodeInSeason(seasonId);
            }, 300);
        }
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

        // Wait for opening animation to finish, then select last episode
        setTimeout(() => {
            selectLastEpisodeInSeason(seasonId);
        }, 300);
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

    // Update mobile selector to match current episode
    const mobileSelector = document.getElementById('episodiMobileSelector');
    if (mobileSelector && mobileSelector.value != episodeId) {
        mobileSelector.value = episodeId;
    }
}

// Episodi animation state
let episodiAnimationState = null;

// Initialize episodi fixed positioning system with scroll-driven animations
function initEpisodiFixedSystem() {
    const episodiSpacer = document.querySelector('.episodi-spacer');
    const containerWrapper = document.querySelector('.episodi-container-wrapper');

    if (!episodiSpacer || !containerWrapper) {
        console.error('Episodi elements not found');
        return;
    }

    // CRITICAL INITIALIZATION ORDER - DO NOT REORDER THESE STEPS:
    // 1. Calculate deadzone and set container height FIRST
    // 2. Then calculateEpisodiSizing() can measure the correct container height
    // 3. Then updateEpisodiAnimations() applies transforms
    //
    // WHY: calculateEpisodiSizing() needs to measure containerWrapper.offsetHeight
    //      to calculate video sizes correctly. If container height isn't set yet,
    //      it will measure 'auto' height and get incorrect values.
    //
    // SAME SEQUENCE in handleEpisodiResizeImmediate() for consistency

    const viewportHeight = window.innerHeight;

    // Calculate deadzone based on header text vertical center
    // The episodi top should be positioned such that the header vertical center
    // is equidistant from viewport top (0) and episodi top
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

    // Episodi top = headerVerticalCenter * 2 (makes center equidistant from 0 and episodi)
    const deadzoneTop = headerVerticalCenter * 2;

    // Set container height dynamically based on available space
    // MUST be set BEFORE calculateEpisodiSizing() so it can measure correctly
    const bottomPadding = 80; // Bottom margin for breathing room
    const containerHeight = viewportHeight - deadzoneTop - bottomPadding;
    containerWrapper.style.height = containerHeight + 'px';

    // Now that container has correct height, calculate sizing
    // This will measure containerWrapper.offsetHeight and get the correct value
    calculateEpisodiSizing();

    // Calculate starting position (off-screen/bottom)
    const startTop = viewportHeight;

    // Calculate travel distance
    const travelDistance = startTop - deadzoneTop;

    // Animation phase durations (in viewport heights)
    const entranceDuration = 1.2 * viewportHeight; // 1.2vh for entrance
    const deadzoneDuration = 0.5 * viewportHeight; // 0.5vh deadzone
    const exitDuration = 1.0 * viewportHeight; // 1vh for exit

    // Set spacer height to cover all phases
    const totalScrollRange = entranceDuration + deadzoneDuration + exitDuration;
    episodiSpacer.style.height = totalScrollRange + 'px';

    // Calculate scroll positions for each phase
    const spacerTop = episodiSpacer.offsetTop;
    const entranceStart = spacerTop;
    const entranceEnd = entranceStart + entranceDuration;
    const deadzoneEnd = entranceEnd + deadzoneDuration;
    const exitEnd = deadzoneEnd + exitDuration;

    // Store animation state
    episodiAnimationState = {
        containerWrapper,
        deadzoneTop,
        startTop,
        travelDistance,
        entranceStart,
        entranceEnd,
        deadzoneEnd,
        exitEnd
    };

    // Update on scroll (through Lenis)
    if (lenis) {
        lenis.on('scroll', () => updateEpisodiAnimations(window.scrollY));
    }

    // Initial animation update
    updateEpisodiAnimations(window.scrollY);

    // Add resize handler
    window.addEventListener('resize', handleEpisodiResize);

    console.log('Episodi fixed system initialized with animations:', {
        headerVerticalCenter,
        deadzoneTop,
        containerHeight,
        entranceStart,
        entranceEnd,
        deadzoneEnd,
        exitEnd,
        totalScrollRange
    });
}

// Calculate optimal episodi sizing based on vertical constraints
function calculateEpisodiSizing() {
    const containerWrapper = document.querySelector('.episodi-container-wrapper');
    const sidebarWrapper = document.querySelector('.episodi-sidebar-wrapper');
    const contentWrapper = document.querySelector('.episodi-content-wrapper');

    if (!containerWrapper || !sidebarWrapper || !contentWrapper) return;

    // CRITICAL PROTECTION: Clear any animation transforms before measuring/manipulating DOM
    // WHY: Active transforms (translateY/translateX) interfere with:
    //      1. Accurate offsetWidth/offsetHeight measurements
    //      2. Layout calculations when setting width/height inline styles
    //      3. Browser reflow/repaint during DOM manipulation
    // SAFETY: Transforms are immediately reapplied by updateEpisodiAnimations()
    //         which MUST be called right after this function (see init & resize handlers)
    sidebarWrapper.style.transform = '';
    contentWrapper.style.transform = '';

    // Get actual sidebar width (from CSS clamp)
    const sidebarWidth = sidebarWrapper.offsetWidth;
    const gap = 15;

    // Calculate available space - container constrained by max-width: 95vw
    const viewportWidth = window.innerWidth;
    const maxContainerWidth = viewportWidth * 0.95;

    // Calculate maximum space for content
    // Account for: sidebar width + gap + content
    const maxAvailableForContent = maxContainerWidth - sidebarWidth - gap;

    // Vertical space calculations - use actual container height
    // Container height is ALWAYS set before this function is called (see init & resize handlers)
    // Fallback should never be needed, but prevents catastrophic failure if sequence breaks
    const actualContainerHeight = containerWrapper.offsetHeight || (window.innerHeight * 0.8);
    const verticalOverhead = 65; // Video margins, section spacing, headers
    const effectiveHeight = actualContainerHeight - verticalOverhead;

    // Minimum coreografie video width (per video) and gaps
    const minCoreografieWidth = 180;
    const coreografieGaps = 40; // 2 gaps of 20px between 3 videos

    // Scenario A: Try full-width video within available space
    let videoWidth = maxAvailableForContent;
    let videoHeight = videoWidth * 0.5625; // 16:9 aspect ratio
    let remainingHeight = effectiveHeight - videoHeight;

    // Calculate coreografie dimensions from remaining vertical space
    let coreografieVideoHeight = remainingHeight;
    let coreografieVideoWidth = coreografieVideoHeight / 0.5625; // 16:9 aspect ratio

    // Scenario B: If coreografie would be too small, adjust video width
    if (coreografieVideoWidth < minCoreografieWidth) {
        coreografieVideoWidth = minCoreografieWidth;
        coreografieVideoHeight = coreografieVideoWidth * 0.5625;

        // Recalculate video from remaining space
        videoHeight = effectiveHeight - coreografieVideoHeight;
        videoWidth = videoHeight / 0.5625;

        // Ensure video doesn't exceed available content space
        if (videoWidth > maxAvailableForContent) {
            videoWidth = maxAvailableForContent;
            videoHeight = videoWidth * 0.5625;
            // Recalculate coreografie from remaining space
            coreografieVideoHeight = effectiveHeight - videoHeight;
            coreografieVideoWidth = coreografieVideoHeight / 0.5625;
        }
    }

    // Calculate coreografie group width
    let coreografieGroupWidth = (3 * coreografieVideoWidth) + coreografieGaps;

    // Content wrapper wraps the wider of: video or coreografie group
    const contentWidth = Math.max(videoWidth, coreografieGroupWidth);

    // Ensure content doesn't exceed available space
    const finalContentWidth = Math.min(contentWidth, maxAvailableForContent);

    // CRITICAL: If coreografie group exceeds available space, recalculate individual card width
    if (coreografieGroupWidth > finalContentWidth) {
        // Recalculate card width to fit within available space
        coreografieVideoWidth = (finalContentWidth - coreografieGaps) / 3;
        coreografieVideoHeight = coreografieVideoWidth * 0.5625;
        coreografieGroupWidth = (3 * coreografieVideoWidth) + coreografieGaps;
    }

    contentWrapper.style.width = finalContentWidth + 'px';
    contentWrapper.style.flexShrink = '0';

    // Apply widths via CSS custom properties
    containerWrapper.style.setProperty('--video-width', videoWidth + 'px');
    containerWrapper.style.setProperty('--coreografie-width', coreografieVideoWidth + 'px');
    containerWrapper.style.setProperty('--coreografie-group-width', coreografieGroupWidth + 'px');

    // CRITICAL: Do NOT set explicit container width
    // Let container auto-size to children (sidebar CSS clamp + gap + content explicit width)
    // Container centering handled by CSS: left: 50%; transform: translateX(-50%)
    // Children centering within container handled by: justify-content: center
    containerWrapper.style.width = ''; // Clear any previous explicit width

    // Ensure CSS-based centering is active (in case JS cleared it during animations)
    containerWrapper.style.left = '50%';
    containerWrapper.style.transform = 'translateX(-50%)';

    console.log('Episodi sizing calculated:', {
        viewportWidth,
        maxContainerWidth,
        sidebarWidth,
        maxAvailableForContent,
        actualContainerHeight,
        effectiveHeight,
        videoWidth,
        videoHeight,
        coreografieVideoWidth,
        coreografieVideoHeight,
        coreografieGroupWidth,
        finalContentWidth,
        naturalContainerWidth: sidebarWidth + gap + finalContentWidth
    });
}

// Debounce utility for resize handler
function debounce(func, wait) {
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

// Handle episodi resize (immediate)
function handleEpisodiResizeImmediate() {
    if (!episodiAnimationState) return;

    const { containerWrapper } = episodiAnimationState;
    const viewportHeight = window.innerHeight;
    const episodiSpacer = document.querySelector('.episodi-spacer');

    // FOLLOWS SAME SEQUENCE AS INITIALIZATION (see initEpisodiFixedSystem):
    // 1. Calculate deadzone and set container height
    // 2. Call calculateEpisodiSizing() to measure correct height
    // 3. Call updateEpisodiAnimations() to apply transforms

    // Recalculate deadzone based on current header dimensions
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

    // Update container height
    const bottomPadding = 80;
    const containerHeight = viewportHeight - deadzoneTop - bottomPadding;
    containerWrapper.style.height = containerHeight + 'px';

    // Recalculate animation parameters
    const startTop = viewportHeight;
    const travelDistance = startTop - deadzoneTop;

    const entranceDuration = 1.2 * viewportHeight;
    const deadzoneDuration = 0.5 * viewportHeight;
    const exitDuration = 1.0 * viewportHeight;

    const totalScrollRange = entranceDuration + deadzoneDuration + exitDuration;
    if (episodiSpacer) {
        episodiSpacer.style.height = totalScrollRange + 'px';
    }

    const spacerTop = episodiSpacer ? episodiSpacer.offsetTop : 0;
    const entranceStart = spacerTop;
    const entranceEnd = entranceStart + entranceDuration;
    const deadzoneEnd = entranceEnd + deadzoneDuration;
    const exitEnd = deadzoneEnd + exitDuration;

    // Update animation state
    episodiAnimationState.deadzoneTop = deadzoneTop;
    episodiAnimationState.startTop = startTop;
    episodiAnimationState.travelDistance = travelDistance;
    episodiAnimationState.entranceStart = entranceStart;
    episodiAnimationState.entranceEnd = entranceEnd;
    episodiAnimationState.deadzoneEnd = deadzoneEnd;
    episodiAnimationState.exitEnd = exitEnd;

    // CRITICAL SEQUENCE: Sizing must clear transforms, then animations reapply them
    // 1. calculateEpisodiSizing() clears transforms for clean measurements
    // 2. updateEpisodiAnimations() immediately reapplies correct transforms
    // DO NOT separate these calls or add code between them
    calculateEpisodiSizing();
    updateEpisodiAnimations(window.scrollY);
}

// Debounced resize handler (150ms delay)
const handleEpisodiResize = debounce(handleEpisodiResizeImmediate, 150);

// Update episodi animations based on scroll position
function updateEpisodiAnimations(scrollY) {
    if (!episodiAnimationState) return;

    const {
        containerWrapper,
        deadzoneTop,
        startTop,
        travelDistance,
        entranceStart,
        entranceEnd,
        deadzoneEnd,
        exitEnd
    } = episodiAnimationState;

    // Get child wrappers for parallax transforms
    const sidebarWrapper = containerWrapper.querySelector('.episodi-sidebar-wrapper');
    const contentWrapper = containerWrapper.querySelector('.episodi-content-wrapper');

    // Detect mobile (same breakpoint as CSS: 768px)
    const isMobile = window.innerWidth <= 768;

    let containerTop, opacity, sidebarTransform, contentTransform;

    if (isMobile) {
        // ===== MOBILE: Simple fade in/deadzone/fade out (like missione) =====
        // Container stays at fixed position, only opacity changes
        containerTop = deadzoneTop;
        sidebarTransform = 'translateY(0)';
        contentTransform = 'translateY(0)';

        if (scrollY < entranceStart) {
            // Before entrance - hidden
            opacity = 0;

        } else if (scrollY <= entranceEnd) {
            // Phase 1: Entrance - fade in with missione curve
            const progress = (scrollY - entranceStart) / (entranceEnd - entranceStart);
            const easedProgress = 1 - Math.pow(1 - progress, 1.15); // Missione ease-out curve
            opacity = easedProgress;

        } else if (scrollY <= deadzoneEnd) {
            // Phase 2: Deadzone - fully visible
            opacity = 1;

        } else if (scrollY <= exitEnd) {
            // Phase 3: Exit - fade out with missione curve
            const exitProgress = (scrollY - deadzoneEnd) / (exitEnd - deadzoneEnd);
            const easedProgress = Math.pow(exitProgress, 1.15); // Missione ease-in curve
            opacity = 1 - easedProgress;

        } else {
            // After exit - hidden
            opacity = 0;
        }

    } else {
        // ===== DESKTOP: Complex entrance/exit with parallax =====
        if (scrollY < entranceStart) {
            // Before entrance - container off-screen
            containerTop = startTop;
            opacity = 0;
            sidebarTransform = 'translateY(0)';
            contentTransform = 'translateY(0)';

        } else if (scrollY <= entranceEnd) {
            // Phase 1: Entrance - container slides up, children have parallax transforms
            const progress = (scrollY - entranceStart) / (entranceEnd - entranceStart);
            const containerEasing = 1 - Math.pow(1 - progress, 3); // Ease-out-cubic
            const contentEasing = 1 - Math.pow(1 - progress, 2); // Ease-out-quadratic

            containerTop = startTop - (travelDistance * containerEasing);

            // Fade in during first 30% of entrance
            opacity = Math.min(1, progress / 0.3);

            // Parallax effect: sidebar lags 100px, content has ease-out-quad independent curve
            const sidebarParallaxAmount = 100; // pixels
            const contentParallaxAmount = 50; // pixels
            const sidebarLag = sidebarParallaxAmount * (1 - progress);
            const contentLead = -contentParallaxAmount * (1 - contentEasing);

            sidebarTransform = `translateY(${sidebarLag}px)`;
            contentTransform = `translateY(${contentLead}px)`;

        } else if (scrollY <= deadzoneEnd) {
            // Phase 2: Deadzone - container fixed at deadzone position
            containerTop = deadzoneTop;
            opacity = 1;
            sidebarTransform = 'translateY(0)';
            contentTransform = 'translateY(0)';

        } else if (scrollY <= exitEnd) {
            // Phase 3: Exit - horizontal slide out with fade
            const exitProgress = (scrollY - deadzoneEnd) / (exitEnd - deadzoneEnd);
            const exitEasing = Math.pow(exitProgress, 1.25); // Ease-in for exit

            // Fade out (starts at 20%, fully faded at 70%)
            if (exitProgress >= 0.2) {
                if (exitProgress >= 0.7) {
                    opacity = 0;
                } else {
                    const fadeProgress = (exitProgress - 0.2) / 0.5;
                    opacity = 1 - Math.pow(fadeProgress, 0.5);
                }
            } else {
                opacity = 1;
            }

            // Horizontal slide (sidebar left, content right)
            const moveDistance = 60; // vw
            const sidebarMoveX = -moveDistance * exitEasing;
            const contentMoveX = moveDistance * exitEasing;

            containerTop = deadzoneTop;
            sidebarTransform = `translateX(${sidebarMoveX}vw)`;
            contentTransform = `translateX(${contentMoveX}vw)`;

        } else {
            // After exit - fully hidden
            containerTop = deadzoneTop;
            opacity = 0;
            sidebarTransform = 'translateX(-60vw)';
            contentTransform = 'translateX(60vw)';
        }
    }

    // Apply animations to parent container
    containerWrapper.style.top = containerTop + 'px';
    containerWrapper.style.opacity = opacity;

    // Apply child transforms for parallax/exit effects
    if (sidebarWrapper) sidebarWrapper.style.transform = sidebarTransform;
    if (contentWrapper) contentWrapper.style.transform = contentTransform;

    // Update mobile selector position and opacity (sibling at body level)
    const mobileSelector = document.getElementById('episodiMobileSelector');
    if (mobileSelector) {
        if (isMobile) {
            // Position mobile selector at same position as container top
            // (matches desktop sidebar/content positioning - they start at container top)
            mobileSelector.style.top = containerTop + 'px';
            mobileSelector.style.opacity = opacity;
        } else {
            // Hide on desktop (CSS handles display, but ensure opacity is 0)
            mobileSelector.style.opacity = 0;
        }
    }
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
                const videoBg = document.getElementById('videoBg');

                // Start animations anyway
                introLogo.classList.add('animate');
                if (introOverlay) introOverlay.classList.add('animate');
                if (introText) introText.classList.add('animate');
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

// Hero animation state
let heroAnimationState = null;

// Missione animation state
let missioneAnimationState = null;

// Candidati card stack animation state
let candidatiCardState = null;

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

        // Animation timing constants
        const elementAnimationDuration = 500; // Same as updateMissioneAnimations
        const staggerOffset = 50; // Same as updateMissioneAnimations

        // Start at 75% through episodi EXIT animation (not entire episodi section)
        const entranceStart = episodiDeadzoneEnd + (episodiExitDuration * 0.75); // 1450 + 750 = 2200px
        const entranceEnd = entranceStart + 750; // 750px entrance duration (2.5x longer)
        const deadzoneEnd = entranceEnd + 250;   // 250px deadzone (same as episodi)

        // Calculate exitEnd based on actual number of elements to prevent premature container hiding
        // Last element (highest reverseIndex) finishes at: deadzoneEnd + (reverseIndex * staggerOffset) + elementAnimationDuration
        const totalElements = elementData.length;
        const lastElementReverseIndex = totalElements - 1;
        const lastElementExitEnd = deadzoneEnd + (lastElementReverseIndex * staggerOffset) + elementAnimationDuration;
        const exitEnd = lastElementExitEnd + 50; // Add 50px buffer for safety

        console.log('Missione scroll positions (Lenis-driven):', {
            entranceStart,
            entranceEnd,
            deadzoneEnd,
            exitEnd,
            totalElements,
            lastElementExitEnd,
            bufferAdded: 50,
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

// Initialize candidati card stack system - SCROLL-DECOUPLED 4-PHASE ANIMATION (with exit)
function initCandidatiCardStack() {
    console.log('🚀🚀🚀 CANDIDATI INIT START (4-PHASE WITH EXIT) 🚀🚀🚀');

    // Query DOM elements
    // NEW STRUCTURE: Select independent fixed elements (no parent container)
    const candidatiSpacer = document.querySelector('.candidati-spacer');
    const candidatiTitleWrapper = document.querySelector('.candidati-title-wrapper');
    const candidatiTitle = candidatiTitleWrapper?.querySelector('.candidati-title');
    const cardWrappers = Array.from(document.querySelectorAll('.candidati-card-wrapper'));
    const cards = Array.from(document.querySelectorAll('.candidati-card-wrapper .form-card'));
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

    // Phase 4: Exit animation (shorter, snappier - 100vh)
    const exitAnimationDuration = window.innerHeight * 1; // 100vh for exit
    const exitAnimationStart = cardDeadzoneEnd;
    const exitAnimationEnd = exitAnimationStart + exitAnimationDuration;

    // Phase 5: Contatti fade-in (50vh)
    const contattiFadeDuration = window.innerHeight * 0.5; // 50vh for contatti fade-in
    const contattiFadeEnd = exitAnimationEnd + contattiFadeDuration;

    // Set spacer height to cover all 5 phases (candidati + contatti fade-in)
    const totalScrollRange = contattiFadeEnd - titleEntranceStart;
    candidatiSpacer.style.height = totalScrollRange + 'px';

    console.log('Candidati scroll ranges (4-phase with exit + contatti fade-in):', {
        titleEntranceStart,
        titleEntranceEnd,
        cardEntranceStart,
        cardEntranceEnd,
        cardDeadzoneEnd,
        exitAnimationStart,
        exitAnimationEnd,
        contattiFadeEnd,
        totalScrollRange,
        totalVh: `${(totalScrollRange / window.innerHeight).toFixed(1)}vh`,
        spacerHeight: totalScrollRange + 'px',
        missioneExitStart: missioneAnimationState?.deadzoneEnd || 'N/A'
    });

    // Create background overlay for fade-to-black effect during exit
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

        // Calculate available vertical space for cards
        // From: title bottom to: submit button top (with gap)
        const cardAreaStartY = fixedTopPosition + titleHeight + titleMarginBottom;
        const cardAreaEndY = viewportHeight - submitButtonHeight - submitButtonBottomMargin - submitButtonTopGap;
        const availableHeight = cardAreaEndY - cardAreaStartY;

        // Use available height (don't force 400px minimum if there isn't space)
        // CSS min-height: 400px will apply when there IS space, but we prioritize fitting
        const finalCardHeight = Math.max(300, availableHeight); // Absolute minimum 300px for usability

        console.log('📐 Card height calculation (new structure):', {
            viewportHeight,
            fixedTopPosition,
            titleHeight,
            titleMarginBottom,
            submitButtonHeight,
            submitButtonBottomMargin,
            submitButtonTopGap,
            cardAreaStartY,
            cardAreaEndY,
            availableHeight,
            finalCardHeight
        });

        // Set position AND height on all card WRAPPERS
        // Wrappers are the fixed positioned elements with glassmorphism
        cardWrappers.forEach(wrapper => {
            wrapper.style.top = cardAreaStartY + 'px';
            wrapper.style.height = finalCardHeight + 'px'; // Constrain wrapper height to available space
        });

        // Set height on all cards (inside wrappers)
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
        // Examples: (t) => t (linear), (t) => Math.pow(t, 2) (ease-in), (t) => 1 - Math.pow(1 - t, 2) (ease-out)
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

        // If no trigger card exists (e.g., last cards), no fade-out
        if (triggerCardIndex >= totalCards) return 1.0;

        const triggerCardEntranceFraction = triggerCardIndex / totalCards;
        const triggerCardCompleteFraction = (triggerCardIndex + 1) / totalCards;

        // Calculate trigger card's entrance progress
        let triggerCardProgress = 0;
        if (totalProgress >= triggerCardEntranceFraction) {
            if (totalProgress <= triggerCardCompleteFraction) {
                const fractionRange = triggerCardCompleteFraction - triggerCardEntranceFraction;
                triggerCardProgress = fractionRange > 0 ? (totalProgress - triggerCardEntranceFraction) / fractionRange : 1;
            } else {
                triggerCardProgress = 1;
            }
        }

        // Apply fade-out if trigger card is within fade thresholds
        if (triggerCardProgress >= cardFadeOutConfig.fadeStartThreshold &&
            triggerCardProgress <= cardFadeOutConfig.fadeEndThreshold) {

            // Calculate fade progress within threshold range
            const thresholdRange = cardFadeOutConfig.fadeEndThreshold - cardFadeOutConfig.fadeStartThreshold;
            const fadeProgress = thresholdRange > 0
                ? (triggerCardProgress - cardFadeOutConfig.fadeStartThreshold) / thresholdRange
                : 1;

            // Apply easing to fade progress
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

    // Get video background element for transition effects
    const videoBg = document.getElementById('videoBg');

    // Store state globally
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
        cardEntranceEnd,
        cardDeadzoneEnd,
        exitAnimationStart,
        exitAnimationEnd,
        totalCards,
        currentCardIndex,
        calculateCardOffsets,
        updateNavigationButtons,
        calculateAndSetCardHeight,  // Store for resize recalculation
        optimizeCardInternalSizing, // Store for resize recalculation
        sidebarEasing,
        contentEasing,
        titleHiddenY,
        cardFadeOutConfig,  // Card fade-out configuration
        calculateCardFadeOutMultiplier,  // Helper function for persistent fade-out
        generateCardShadow  // Helper function to generate shadow with opacity
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

    console.log('✅ Candidati card stack initialized successfully (4-phase: entrance → deadzone → exit with fade-to-black, scroll-decoupled, responsive)');
}

// Update missione animations - OPTIMIZED BATCHED DOM UPDATES
function updateMissioneAnimations(scrollY, animationState) {
    if (!animationState) return;

    const { elements, entranceStart, entranceEnd, deadzoneEnd, exitEnd, missioneContainer } = animationState;

    if (!elements || elements.length === 0) return;

    // Animation parameters
    const elementAnimationDuration = 500; // Each element animates over 500px (2.5x longer)
    const staggerOffsetMax = 90; // Maximum stagger offset (first element)
    const staggerOffsetMin = 10; // Minimum stagger offset (last element)
    const moveDistance = 8; // 8px movement (subtle peek-through effect like reference)

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
        console.log(`Missione section ${targetVisibility} (visibility state changed)`);
    }

    // PHASE 1: Calculate all element states (NO DOM reads - pure calculations)
    const elementUpdates = elements.map((elementData) => {
        const { element, reverseIndex, index } = elementData;

        // Calculate progressive stagger offset for this element (90px → 30px)
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

        // Calculate staggered timing for this element (reverse order - button first)
        const elementEntranceStart = entranceStart + cumulativeEntranceOffset;
        const elementEntranceEnd = elementEntranceStart + elementAnimationDuration;
        const elementExitStart = deadzoneEnd + cumulativeExitOffset;
        const elementExitEnd = elementExitStart + elementAnimationDuration;

        let transform, opacity, phase;

        if (scrollY < elementEntranceStart) {
            // Phase 1: Before entrance - hidden below its own line
            phase = 'before';
            transform = 'translateY(8px)';
            opacity = 0;

        } else if (scrollY >= elementEntranceStart && scrollY <= elementEntranceEnd) {
            // Phase 2: Entrance animation - peek through its own line
            phase = 'entrance';
            const progress = (scrollY - elementEntranceStart) / elementAnimationDuration;
            const easedProgress = 1 - Math.pow(1 - progress, 1.15); // Ease-out with exponent 1.15
            const translateY = moveDistance * (1 - easedProgress); // 8px → 0px
            transform = `translateY(${translateY}px)`;
            opacity = easedProgress;

        } else if (scrollY > elementEntranceEnd && scrollY <= elementExitStart) {
            // Phase 3: Deadzone - fully visible at natural position
            phase = 'deadzone';
            transform = 'translateY(0px)';
            opacity = 1;

        } else if (scrollY > elementExitStart && scrollY <= elementExitEnd) {
            // Phase 4: Exit animation - disappear behind its own line
            phase = 'exit';
            const progress = (scrollY - elementExitStart) / elementAnimationDuration;
            const easedProgress = Math.pow(progress, 1.15); // Ease-in with exponent 1.15
            const translateY = -moveDistance * easedProgress; // 0px → -8px
            transform = `translateY(${translateY}px)`;
            opacity = 1 - easedProgress;

        } else {
            // Phase 5: After exit - hidden above its own line
            phase = 'after';
            transform = 'translateY(-8px)';
            opacity = 0;
        }

        return { element, transform, opacity, phase, index, reverseIndex };
    });

    // PHASE 2: Batch apply all DOM updates (styles + classList together for cache efficiency)
    elementUpdates.forEach(({ element, transform, opacity, phase, index, reverseIndex }) => {
        // Apply styles (ensure opacity is string for consistency)
        element.style.transform = transform;
        element.style.opacity = String(opacity);

        // Apply classList operations based on phase
        const classList = element.classList;
        switch (phase) {
            case 'before':
                classList.remove('animated', 'exiting');
                break;

            case 'entrance':
                if (!classList.contains('animated')) {
                    classList.add('animated');
                    console.log(`Element ${index} (reverse order ${reverseIndex}) peeking through line at scroll ${scrollY}`);
                }
                break;

            case 'deadzone':
                classList.add('animated');
                classList.remove('exiting');
                break;

            case 'exit':
                if (!classList.contains('exiting')) {
                    classList.add('exiting');
                    console.log(`Element ${index} (reverse order ${reverseIndex}) disappearing behind line at scroll ${scrollY}`);
                }
                break;

            case 'after':
                classList.remove('animated');
                classList.add('exiting');
                break;
        }
    });
}

// Update candidati card stack animations - SCROLL-DECOUPLED 4-PHASE SYSTEM (with exit)
function updateCandidatiCardStack(scrollY, cardState) {
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
        totalCards,
        calculateCardOffsets,
        sidebarEasing,
        contentEasing,
        titleHiddenY,
        cardFadeOutConfig,
        calculateCardFadeOutMultiplier
    } = cardState;

    // No visibility control needed - elements are independent and always in layout
    // Early return if before candidati section starts
    if (scrollY < titleEntranceStart) {
        return;
    }
    // REMOVED: early return after exitAnimationEnd - need to continue for contatti fade-in

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

        // Reset video to default state during Phase 1
        if (videoBg) {
            videoBg.style.filter = 'grayscale(25%) brightness(0.50) contrast(1.2) blur(0px)';
        }

    } else if (scrollY < titleEntranceStart) {
        candidatiTitleWrapper.style.visibility = 'visible';
        candidatiTitleWrapper.style.transform = `translate(-50%, ${titleHiddenY}px)`;
        candidatiTitleWrapper.style.opacity = '0';

        // Keep background overlay transparent before Phase 1
        if (backgroundOverlay) {
            backgroundOverlay.style.visibility = 'visible';
            backgroundOverlay.style.opacity = '0';
        }

        // Reset video to default state before Phase 1
        if (videoBg) {
            videoBg.style.filter = 'grayscale(25%) brightness(0.50) contrast(1.2) blur(0px)';
        }

    } else if (scrollY > titleEntranceEnd) {
        candidatiTitleWrapper.style.visibility = 'visible';
        candidatiTitleWrapper.style.transform = 'translate(-50%, 0px)';
        candidatiTitleWrapper.style.opacity = '1';
    }

    // Calculate stack offsets
    const offsets = calculateCardOffsets();
    const totalOffsetX = (totalCards - 1) * offsets.x;
    const centerOffsetX = -totalOffsetX / 2;

    // PHASE 2: Card progressive reveal (150vh) - OPTIMIZED BATCHED DOM UPDATES
    // Animate cardWrappers (position: fixed)
    if (scrollY >= cardEntranceStart && scrollY <= cardEntranceEnd) {
        const totalProgress = (scrollY - cardEntranceStart) / (cardEntranceEnd - cardEntranceStart);

        // Calculate all card states first (batched calculations)
        const cardUpdates = cardWrappers.map((wrapper, index) => {
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

            // Calculate entrance opacity
            const entranceOpacity = easedCardProgress;

            // Calculate persistent fade-out multiplier (based on trigger card's progress)
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

            // Apply shadow fade if enabled
            if (cardFadeOutConfig.enabled && cardFadeOutConfig.fadeShadow) {
                wrapper.style.boxShadow = cardState.generateCardShadow(opacity);
            }
        });

        // Update current card index (find highest card >50% visible)
        let newCardIndex = cardState.currentCardIndex;
        for (const { cardProgress, index } of cardUpdates) {
            if (cardProgress > 0.5 && index > newCardIndex) {
                newCardIndex = index;
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

            // Calculate persistent fade-out multiplier at end of entrance (totalProgress = 1.0)
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

            // Apply shadow fade if enabled
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

        // Apply exit animation to title (always visible, so fades from 1 to 0)
        candidatiTitleWrapper.style.visibility = 'visible';
        candidatiTitleWrapper.style.transform = `translate(-50%, 0px) scale(${scale})`;
        candidatiTitleWrapper.style.opacity = exitFadeMultiplier;

        // Apply exit animation to all card wrappers (OPTIMIZED BATCHED)
        // Cards fade from their fade-out state to 0
        const cardUpdates = cardWrappers.map((wrapper, index) => {
            const cardOffsetX = centerOffsetX + (index * offsets.x);

            // Get the card's fade-out state at end of entrance (totalProgress = 1.0)
            const fadeOutMultiplier = calculateCardFadeOutMultiplier(index, 1.0);

            // Final opacity = fade-out state × exit fade
            // If card already faded (fadeOutMultiplier = 0), it stays at 0 (no exit animation needed)
            // If card is visible (fadeOutMultiplier > 0), it fades proportionally to 0
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

            // Apply shadow fade proportional to card opacity
            if (cardFadeOutConfig.enabled && cardFadeOutConfig.fadeShadow) {
                wrapper.style.boxShadow = cardState.generateCardShadow(opacity);
            }
        });

        // Apply exit animation to submit button (fades from 1 to 0 like title)
        if (submitButtonContainer) {
            submitButtonContainer.style.visibility = 'visible';
            submitButtonContainer.style.transform = `translateX(-50%) scale(${scale})`;
            submitButtonContainer.style.opacity = exitFadeMultiplier;
        }

        // Progressively blur and darken video to black
        if (videoBg) {
            // Blur: from 0px to 50px
            const blurAmount = 50 * easedExitProgress;
            // Brightness: from 0.50 to 0.05 (near complete darkness, but not absolute zero for better visuals)
            const brightness = 0.50 - (0.45 * easedExitProgress);
            // Grayscale and contrast remain constant
            videoBg.style.filter = `grayscale(25%) brightness(${brightness}) contrast(1.2) blur(${blurAmount}px)`;
        }

        // Keep background overlay transparent during exit (video darkening is sufficient)
        if (backgroundOverlay) {
            backgroundOverlay.style.visibility = 'visible';
            backgroundOverlay.style.opacity = '0';
        }
    }

    // AFTER Phase 4: Hide candidati elements and fade in contatti
    else if (scrollY > exitAnimationEnd) {
        // Hide all candidati elements
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

        // Keep video fully blurred and dark for contatti section
        if (videoBg) {
            videoBg.style.filter = 'grayscale(25%) brightness(0.05) contrast(1.2) blur(50px)';
        }

        // Keep background overlay transparent and hidden (video darkness is sufficient)
        if (backgroundOverlay) {
            backgroundOverlay.style.opacity = '0';
            backgroundOverlay.style.visibility = 'hidden';
        }

        // CONTATTI FADE-IN ANIMATION
        // Fade in contatti using candidati title curve (ease-out with exponent 2.5)
        const contattiContainer = document.getElementById('contattiContainer');
        if (contattiContainer) {
            // Animation starts right after candidati exit ends
            const contattiFadeStart = exitAnimationEnd;
            const contattiFadeDuration = window.innerHeight * 0.5; // 50vh fade-in duration
            const contattiFadeEnd = contattiFadeStart + contattiFadeDuration;

            if (scrollY >= contattiFadeStart && scrollY <= contattiFadeEnd) {
                // Fade in with candidati title curve
                const progress = (scrollY - contattiFadeStart) / contattiFadeDuration;
                const easedProgress = sidebarEasing(progress); // Same curve as candidati title

                contattiContainer.style.visibility = 'visible';
                contattiContainer.style.opacity = easedProgress;
            } else if (scrollY > contattiFadeEnd) {
                // Fully visible
                contattiContainer.style.visibility = 'visible';
                contattiContainer.style.opacity = '1';
            }
        }
    }
}

// Start
document.addEventListener('DOMContentLoaded', loadContent);