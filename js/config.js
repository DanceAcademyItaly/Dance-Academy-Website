/**
 * Configuration constants for Dance Academy Website
 * Centralized configuration for all magic numbers, timing values, and feature flags
 */

// ============================================
// ANIMATION TIMING
// ============================================

export const ANIMATION = {
    // Scroll animation duration (seconds)
    scrollDuration: 0.8,

    // Header navigation animation duration (seconds)
    headerNavDuration: 2.0,

    // Resize debounce delay (milliseconds)
    resizeDebounceMs: 150,

    // Carousel auto-play interval (milliseconds)
    carouselAutoPlayMs: 4000,

    // Carousel auto-play pause timeout after user interaction (milliseconds)
    carouselPauseMs: 6000,

    // Episode preload delay (milliseconds)
    episodePreloadDelayMs: 500,

    // Typography resize debounce (milliseconds)
    typographyResizeMs: 150,

    // Scroll update throttle (milliseconds) - ~60fps
    scrollUpdateThrottle: 16,
};

// ============================================
// BREAKPOINTS
// ============================================

export const BREAKPOINTS = {
    // Mobile breakpoint (matches CSS)
    mobile: 768,

    // Small mobile devices
    smallMobile: 480,

    // Minimum supported viewport width
    minViewport: 320,

    // Maximum supported viewport width
    maxViewport: 2560,

    // Design baseline viewport
    baseViewport: 1600,
};

// ============================================
// Z-INDEX HIERARCHY
// ============================================

export const Z_INDEX = {
    // Background elements
    background: -1,

    // Default content layer
    content: 1,

    // Episodi sidebar
    episodiSidebar: 100,

    // Episodi content
    episodiContent: 101,

    // Missione container
    missioneContainer: 1000,

    // Active element highlight
    activeElement: 1000,

    // Header navigation
    header: 110,

    // Progress bar
    progressBar: 111,

    // Error/notification dialogs
    errorDialog: 10000,
};

// ============================================
// SCROLL CONFIGURATION
// ============================================

export const SCROLL = {
    // Section buffer (5% of viewport height)
    sectionBufferVH: 0.05,

    // Default scroll config
    config: {
        duration: 0.8,
        easing: (t) => 1 - Math.pow(1 - t, 3), // easeOutCubic
        offset: 0
    },

    // Header navigation scroll config
    headerNavConfig: {
        duration: 2.0,
        // Custom easing: very slow start and end, faster in middle
        easing: (t) => (1 - Math.cos(t * Math.PI)) / 2,
        offset: 0
    },
};

// ============================================
// TYPOGRAPHY SYSTEM
// ============================================

export const TYPOGRAPHY = {
    enabled: true,
    fallbackForOldBrowsers: true,
    extremeViewportAdjustment: true,
    minViewport: 320,
    maxViewport: 2560,
    baseViewport: 1600,

    scaleFactors: {
        extraSmall: 0.95,  // < 1200px
        extraLarge: 1.05   // > 2200px
    }
};

// ============================================
// SECTION DEFINITIONS
// ============================================

export const SECTIONS = {
    hero: ['.hero-block'],
    episodi: ['.episodi-container-wrapper', '.episodi-mobile-selector'],
    missione: ['.missione-container'],
    candidati: [
        '.candidati-title-wrapper',
        '.candidati-card-wrapper',
        '.submit-button-container'
    ],
    contatti: ['.contatti-container']
};

// ============================================
// VIDEO BACKGROUND STATES
// ============================================

export const VIDEO_STATES = {
    hero: 'grayscale(25%) brightness(0.50) contrast(1.2) blur(0px)',
    episodi: 'grayscale(25%) brightness(0.50) contrast(1.2) blur(0px)',
    missione: 'grayscale(25%) brightness(0.50) contrast(1.2) blur(0px)',
    candidati: 'grayscale(25%) brightness(0.50) contrast(1.2) blur(0px)',
    candidatiExit: 'grayscale(25%) brightness(0.05) contrast(1.2) blur(50px)',
    contatti: 'grayscale(25%) brightness(0.05) contrast(1.2) blur(50px)'
};

// ============================================
// API ENDPOINTS
// ============================================

export const API = {
    // Content data endpoint
    contentUrl: './content.json',

    // YouTube API
    youtubeApiUrl: 'https://www.youtube.com/iframe_api',
};

// ============================================
// LAYOUT CONSTANTS
// ============================================

export const LAYOUT = {
    // Header fixed position from top (pixels)
    headerTop: 20,

    // Bottom padding for breathing room (pixels)
    bottomPadding: 80,

    // Episodi video gap (pixels)
    episodiVideoGap: 15,

    // Vertical overhead for episodi section (pixels)
    episodiVerticalOverhead: 65,

    // Minimum coreografie video width (pixels)
    minCoreografieWidth: 180,

    // Coreografie gaps between videos (pixels)
    coreografieGaps: 40,

    // Video aspect ratio (16:9)
    videoAspectRatio: 0.5625,
};

// ============================================
// FEATURE FLAGS
// ============================================

export const FEATURES = {
    // Enable video background
    enableVideoBackground: true,

    // Enable smooth scroll (Lenis)
    enableSmoothScroll: true,

    // Enable typography system
    enableTypographySystem: true,

    // Enable section isolation system
    enableSectionIsolation: true,

    // Enable carousel auto-play
    enableCarouselAutoPlay: true,
};

// ============================================
// ITALIAN PROVINCES
// ============================================

/**
 * Complete list of Italian provinces
 * Used to populate the province dropdown in the Candidati form
 */
export const ITALIAN_PROVINCES = [
    'Agrigento', 'Alessandria', 'Ancona', 'Arezzo', 'Ascoli Piceno',
    'Asti', 'Avellino', 'Bari', 'Barletta-Andria-Trani', 'Belluno',
    'Benevento', 'Bergamo', 'Biella', 'Bologna', 'Bolzano',
    'Brescia', 'Brindisi', 'Cagliari', 'Caltanissetta', 'Campobasso',
    'Caserta', 'Catania', 'Catanzaro', 'Chieti', 'Como',
    'Cosenza', 'Cremona', 'Crotone', 'Cuneo', 'Enna',
    'Fermo', 'Ferrara', 'Firenze', 'Foggia', 'Forlì-Cesena',
    'Frosinone', 'Genova', 'Gorizia', 'Grosseto', 'Imperia',
    'Isernia', 'L\'Aquila', 'La Spezia', 'Latina', 'Lecce',
    'Lecco', 'Livorno', 'Lodi', 'Lucca', 'Macerata',
    'Mantova', 'Massa-Carrara', 'Matera', 'Messina', 'Milano',
    'Modena', 'Monza e Brianza', 'Napoli', 'Novara', 'Nuoro',
    'Oristano', 'Padova', 'Palermo', 'Parma', 'Pavia',
    'Perugia', 'Pesaro e Urbino', 'Pescara', 'Piacenza', 'Pisa',
    'Pistoia', 'Pordenone', 'Potenza', 'Prato', 'Ragusa',
    'Ravenna', 'Reggio Calabria', 'Reggio Emilia', 'Rieti', 'Rimini',
    'Roma', 'Rovigo', 'Salerno', 'Sassari', 'Savona',
    'Siena', 'Siracusa', 'Sondrio', 'Sud Sardegna', 'Taranto',
    'Teramo', 'Terni', 'Torino', 'Trapani', 'Trento',
    'Treviso', 'Trieste', 'Udine', 'Varese', 'Venezia',
    'Verbano-Cusio-Ossola', 'Vercelli', 'Verona', 'Vibo Valentia', 'Vicenza',
    'Viterbo'
];
