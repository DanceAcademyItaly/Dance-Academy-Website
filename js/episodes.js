/**
 * @file episodes.js
 * @description Episodi section - handles episodes display, navigation, and animations
 *
 * Handles:
 * - Desktop sidebar with season accordions and episode buttons
 * - Mobile dropdown selector
 * - Episode content lazy loading and preloading
 * - Choreography carousels with YouTube player integration
 * - Scroll-driven entrance/exit animations with parallax effects
 * - Responsive video sizing calculations
 * - Episode switching and season toggling
 */

import { getState, setState, updateState } from './state.js';
import { debounce } from './utils.js';
import { SCROLL, ANIMATION, BREAKPOINTS } from './config.js';
import { registerSection, enableSection, setActiveSection, applyVideoState } from './navigation.js';

// ============================================
// MODULE STATE
// ============================================

/**
 * Episode section animation state
 * Contains all scroll ranges, DOM references, and cached values for performance
 */
let episodiAnimationState = null;

/**
 * Last viewport width (for detecting mobile/desktop transitions)
 */
let lastViewportWidth = window.innerWidth;

/**
 * Flag indicating if episodes exist in content
 */
let hasEpisodes = false;

// ============================================
// CONTENT CHECKING
// ============================================

/**
 * Check if episodes exist in loaded content
 * @param {Object} content - Site content object
 * @returns {boolean} True if episodes exist
 */
export function checkEpisodesExist(content) {
    const exists = content?.episodes?.seasons?.some(season =>
        season?.episodes?.length > 0
    ) || false;

    hasEpisodes = exists;
    return exists;
}

// ============================================
// EPISODE NAVIGATION PRESERVATION
// ============================================

/**
 * Preserve episode navigation when DOM changes (mutation observer)
 * Ensures episode links maintain correct behavior even when dynamically added
 */
function preserveEpisodeNavigation() {
    // Monitor for dynamically added episode navigation
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const episodeLinks = node.querySelectorAll ?
                            node.querySelectorAll('.episodio-link[data-episode]') : [];

                        episodeLinks.forEach(link => {
                            enhanceEpisodeLink(link);
                        });

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
}

/**
 * Enhance episode link with scroll-to-top behavior
 * @param {HTMLElement} link - Episode link element
 */
function enhanceEpisodeLink(link) {
    // Preserve the original click handler by calling it first
    const originalHandler = link.onclick;

    link.addEventListener('click', function(e) {
        // Call original functionality first
        if (originalHandler) {
            originalHandler.call(this, e);
        }

        // Scroll to top after episode switch
        const lenis = getState('lenis');
        const isScrollSystemInitialized = getState('flags.isScrollSystemInitialized');

        if (lenis && isScrollSystemInitialized) {
            setTimeout(() => {
                lenis.scrollTo(0, { ...SCROLL.config, duration: 0.5 });
            }, 100);
        }
    });
}

// ============================================
// EPISODE CONTENT POPULATION
// ============================================

/**
 * Populate episodes section with content from site data
 * Creates sidebar, mobile selector, and initial episode content
 */
export function populateEpisodes() {
    const sidebar = document.getElementById('sidebar');
    const contentArea = document.getElementById('contentArea');
    const siteContent = getState('content');

    if (!siteContent?.episodes || !sidebar || !contentArea) return;

    // Find last episode of last season automatically
    let defaultEpisodeId = 1; // fallback
    let activeSeasonId = null;

    if (siteContent.episodes.seasons && siteContent.episodes.seasons.length > 0) {
        const lastSeason = siteContent.episodes.seasons[siteContent.episodes.seasons.length - 1];
        activeSeasonId = lastSeason.id;

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

        mobileSelector.onchange = (e) => {
            const episodeId = parseInt(e.target.value);
            switchEpisode(episodeId);
        };
    }

    // Build content - LAZY LOADING: Only create the active episode initially
    contentArea.innerHTML = '';

    // Find the default episode data
    let defaultEpisodeData = null;
    siteContent.episodes.seasons.forEach(season => {
        season.episodes.forEach(episode => {
            if (episode.id === defaultEpisodeId) {
                defaultEpisodeData = episode;
            }
        });
    });

    if (defaultEpisodeData) {
        createEpisodeContent(defaultEpisodeData, defaultEpisodeId, true);
    }

    // Initialize carousel navigation after content is rendered
    initializeCarousels();
}

/**
 * Create episode content DOM (helper for lazy loading)
 * @param {Object} episode - Episode data object
 * @param {number} episodeId - Episode ID
 * @param {boolean} isActive - If true, adds 'active' class to make episode visible immediately
 */
function createEpisodeContent(episode, episodeId, isActive = false) {
    const contentArea = document.getElementById('contentArea');
    if (!contentArea) return;

    const existing = contentArea.querySelector(`[data-content="${episodeId}"]`);
    if (existing) {
        return;
    }

    const div = document.createElement('div');
    div.className = isActive ? 'episodio-content active' : 'episodio-content';
    div.dataset.content = episodeId;

    const videoDiv = document.createElement('div');
    videoDiv.className = 'video-principale';

    videoDiv.innerHTML = `
        <div class="episode-skeleton">
            <div class="episode-skeleton-spinner"></div>
        </div>
        <iframe src="${episode.mainVideo}" allowfullscreen style="opacity: 0;"></iframe>
    `;
    div.appendChild(videoDiv);

    const iframe = videoDiv.querySelector('iframe');
    iframe.onload = () => {
        const skeleton = videoDiv.querySelector('.episode-skeleton');
        if (skeleton) skeleton.remove();
        iframe.style.opacity = '1';
        iframe.style.transition = 'opacity 0.3s ease';
    };

    if (episode.choreographies?.length) {
        const choreoSection = document.createElement('div');
        choreoSection.className = 'coreografie-section';

        const header = document.createElement('h3');
        header.className = 'coreografie-header';
        header.textContent = 'Coreografie';
        choreoSection.appendChild(header);

        const carouselContainer = document.createElement('div');
        carouselContainer.className = 'carousel-container';
        carouselContainer.dataset.episodeId = episode.id;
        carouselContainer.setAttribute('data-lenis-prevent', '');

        const carouselTrack = document.createElement('div');
        carouselTrack.className = 'carousel-track';

        episode.choreographies.forEach((choreo, index) => {
            const card = document.createElement('div');
            card.className = 'coreo-card';
            card.dataset.index = index;

            const iframeId = `coreo-player-${episode.id}-${index}`;
            const videoUrl = choreo.video.includes('?')
                ? `${choreo.video}&enablejsapi=1`
                : `${choreo.video}?enablejsapi=1`;

            card.innerHTML = `
                <div class="coreo-video">
                    <iframe id="${iframeId}" src="${videoUrl}" allowfullscreen></iframe>
                </div>
                <div class="coreo-title">${choreo.title}</div>
            `;
            carouselTrack.appendChild(card);
        });

        carouselContainer.appendChild(carouselTrack);

        if (episode.choreographies.length > 1) {
            const leftArrow = document.createElement('button');
            leftArrow.className = 'carousel-arrow left';
            leftArrow.setAttribute('aria-label', 'Previous choreography');
            leftArrow.innerHTML = `
                <svg viewBox="0 0 24 24">
                    <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
            `;
            carouselContainer.appendChild(leftArrow);

            const rightArrow = document.createElement('button');
            rightArrow.className = 'carousel-arrow right';
            rightArrow.setAttribute('aria-label', 'Next choreography');
            rightArrow.innerHTML = `
                <svg viewBox="0 0 24 24">
                    <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
            `;
            carouselContainer.appendChild(rightArrow);

            const dotsContainer = document.createElement('div');
            dotsContainer.className = 'carousel-dots';

            episode.choreographies.forEach((_, index) => {
                const dot = document.createElement('button');
                dot.className = `carousel-dot${index === 0 ? ' active' : ''}`;
                dot.dataset.index = index;
                dot.setAttribute('aria-label', `Go to choreography ${index + 1}`);
                dotsContainer.appendChild(dot);
            });

            choreoSection.appendChild(carouselContainer);
            choreoSection.appendChild(dotsContainer);
        } else {
            choreoSection.appendChild(carouselContainer);
        }

        div.appendChild(choreoSection);
    }

    contentArea.appendChild(div);

    // Reinitialize carousels for this episode
    initializeCarousels();
}

/**
 * Background preloading system - loads remaining episodes after initial page load
 * Priority order: Active season first (latest), then previous seasons (newest to oldest)
 */
export function preloadRemainingEpisodes() {
    const siteContent = getState('content');

    if (!siteContent?.episodes?.seasons) {
        return;
    }

    const seasons = [...siteContent.episodes.seasons].reverse(); // Reverse to get latest first

    // Find active season (last season)
    const activeSeason = seasons[0];

    const loadedEpisodes = new Set();
    document.querySelectorAll('.episodio-content').forEach(el => {
        loadedEpisodes.add(parseInt(el.dataset.content));
    });

    // Build preload queue: active season first, then others
    const preloadQueue = [];

    // Priority 1: Remaining episodes from active season
    if (activeSeason?.episodes) {
        activeSeason.episodes.forEach(episode => {
            if (!loadedEpisodes.has(episode.id)) {
                preloadQueue.push(episode);
            }
        });
    }

    // Priority 2: Episodes from previous seasons (newest to oldest)
    for (let i = 1; i < seasons.length; i++) {
        const season = seasons[i];
        if (season?.episodes) {
            season.episodes.forEach(episode => {
                if (!loadedEpisodes.has(episode.id)) {
                    preloadQueue.push(episode);
                }
            });
        }
    }

    // Preload episodes one at a time with delays to avoid blocking
    let currentIndex = 0;

    function preloadNext() {
        if (currentIndex >= preloadQueue.length) {
            return;
        }

        const episode = preloadQueue[currentIndex];

        createEpisodeContent(episode, episode.id, false);

        currentIndex++;

        if (typeof requestIdleCallback !== 'undefined') {
            requestIdleCallback(() => preloadNext(), { timeout: 2000 });
        } else {
            setTimeout(preloadNext, ANIMATION.episodePreloadDelayMs);
        }
    }

    setTimeout(() => {
        preloadNext();
    }, 2000); // Wait 2 seconds after intro completes
}

// ============================================
// MOBILE CAROUSEL
// ============================================

/**
 * Initialize coreografie carousels (MOBILE ONLY - desktop shows all videos)
 * Handles carousel navigation, auto-play, and YouTube player integration
 */
export function initializeCarousels() {
    // Only run on mobile
    if (window.innerWidth > BREAKPOINTS.mobile) {
        return;
    }

    const carousels = document.querySelectorAll('.carousel-container');

    // If no carousels found, exit early
    if (carousels.length === 0) {
        return;
    }

    carousels.forEach((carousel, carouselIndex) => {
        // Skip if already initialized (prevent memory leaks)
        if (carousel.dataset.carouselInitialized === 'true') {
            return;
        }

        const cards = Array.from(carousel.querySelectorAll('.coreo-card'));
        const leftArrow = carousel.querySelector('.carousel-arrow.left');
        const rightArrow = carousel.querySelector('.carousel-arrow.right');
        const section = carousel.closest('.coreografie-section');
        const dots = section ? Array.from(section.querySelectorAll('.carousel-dot')) : [];

        // Handle single card (no carousel navigation needed, but must make visible)
        if (cards.length === 0) {
            return;
        }

        if (cards.length === 1) {
            const card = cards[0];
            card.classList.add('active');
            card.style.cssText = 'opacity: 1 !important; transform: translateX(0) !important; pointer-events: auto !important; position: relative !important;';
            carousel.dataset.carouselInitialized = 'true';
            return;
        }

        let currentIndex = 0;
        let autoPlayInterval = null;
        let autoPlayPauseTimeout = null;
        let players = [];
        let isAnyVideoPlaying = false;

        // Initialize - start at index 0, set first card as active
        cards.forEach((card, index) => {
            if (index === 0) {
                card.classList.add('active');
                // CRITICAL: Use !important via cssText to override any conflicting styles
                card.style.cssText = 'opacity: 1 !important; transform: translateX(0) !important; pointer-events: auto !important;';
            } else {
                card.classList.remove('active');
                card.style.cssText = 'opacity: 0 !important; transform: translateX(100%) !important; pointer-events: none !important;';
            }
        });

        function updateDots() {
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentIndex);
            });
        }

        // Navigate with directional slide+fade animation
        function navigateTo(newIndex, direction) {
            if (newIndex === currentIndex) return;

            const currentCard = cards[currentIndex];
            const newCard = cards[newIndex];

            // Determine animation direction
            const exitDirection = direction === 'next' ? '-100%' : '100%';
            const enterFrom = direction === 'next' ? '100%' : '-100%';

            pauseCurrentVideo();

            // Exit animation for current card
            currentCard.style.transition = 'opacity 1s ease, transform 1s ease';
            currentCard.style.opacity = '0';
            currentCard.style.transform = `translateX(${exitDirection})`;
            currentCard.style.pointerEvents = 'none';  // Disable clicks on exiting card

            // Prepare new card (positioned off-screen)
            newCard.style.transition = 'none';
            newCard.style.opacity = '0';
            newCard.style.transform = `translateX(${enterFrom})`;
            newCard.classList.add('active');
            newCard.style.pointerEvents = 'auto';  // Enable clicks on new card immediately

            // Enter animation for new card (small delay for visual clarity)
            setTimeout(() => {
                newCard.style.transition = 'opacity 1s ease, transform 1s ease';
                newCard.style.opacity = '1';
                newCard.style.transform = 'translateX(0)';
            }, 50);

            // Cleanup after animation
            setTimeout(() => {
                currentCard.classList.remove('active');
                currentIndex = newIndex;
                updateDots();
                checkVideoPlayback();
            }, 1050);
        }

        // Navigate to next
        function goNext() {
            const newIndex = (currentIndex + 1) % cards.length;
            navigateTo(newIndex, 'next');
        }

        // Navigate to previous
        function goPrev() {
            const newIndex = (currentIndex - 1 + cards.length) % cards.length;
            navigateTo(newIndex, 'prev');
        }

        // Navigate to specific index (from dot click)
        function goToIndex(index) {
            if (index === currentIndex) return;
            const direction = index > currentIndex ? 'next' : 'prev';
            navigateTo(index, direction);
        }

        // YouTube API integration
        function getCurrentPlayer() {
            return players[currentIndex];
        }

        function pauseCurrentVideo() {
            const player = getCurrentPlayer();
            if (player && player.pauseVideo) {
                try {
                    player.pauseVideo();
                } catch (e) {
                    // Video pause failed silently
                }
            }
        }

        function checkVideoPlayback() {
            const player = getCurrentPlayer();
            if (player && player.getPlayerState) {
                try {
                    const state = player.getPlayerState();
                    const nowPlaying = (state === 1); // YT.PlayerState.PLAYING === 1

                    if (nowPlaying !== isAnyVideoPlaying) {
                        isAnyVideoPlaying = nowPlaying;
                        if (isAnyVideoPlaying) {
                            stopAutoPlay();
                        } else {
                            resetAutoPlay();
                        }
                    }
                } catch (e) {
                    // Ignore if player not ready
                }
            }
        }

        // Auto-play logic
        function advanceSlide() {
            if (!isAnyVideoPlaying) {
                goNext();
            }
        }

        function startAutoPlay() {
            stopAutoPlay();
            autoPlayInterval = setInterval(advanceSlide, ANIMATION.carouselAutoPlayMs);
        }

        function stopAutoPlay() {
            if (autoPlayInterval) {
                clearInterval(autoPlayInterval);
                autoPlayInterval = null;
            }
        }

        function resetAutoPlay() {
            stopAutoPlay();
            clearTimeout(autoPlayPauseTimeout);
            autoPlayPauseTimeout = setTimeout(startAutoPlay, ANIMATION.carouselPauseMs);
        }

        // Arrow click handlers
        if (leftArrow) {
            leftArrow.addEventListener('click', () => {
                goPrev();
                resetAutoPlay();
            });
        }

        if (rightArrow) {
            rightArrow.addEventListener('click', () => {
                goNext();
                resetAutoPlay();
            });
        }

        // Dot click handlers
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                goToIndex(index);
                resetAutoPlay();
            });
        });

        // Initialize YouTube players
        function initYouTubePlayers() {
            cards.forEach((card, index) => {
                const iframe = card.querySelector('iframe');
                if (iframe && iframe.id) {
                    try {
                        const player = new YT.Player(iframe.id, {
                            events: {
                                'onStateChange': (event) => {
                                    if (index === currentIndex) {
                                        checkVideoPlayback();
                                    }
                                }
                            }
                        });
                        players[index] = player;
                    } catch (e) {
                        players[index] = null;
                    }
                }
            });
        }

        if (window.YT && window.YT.Player) {
            initYouTubePlayers();
        } else {
            window.onYouTubeIframeAPIReady = window.onYouTubeIframeAPIReady || (() => {});
            const oldCallback = window.onYouTubeIframeAPIReady;
            window.onYouTubeIframeAPIReady = function() {
                oldCallback();
                initYouTubePlayers();
            };
        }

        // Initialize dots
        updateDots();

        startAutoPlay();

        // Mark as initialized to prevent re-initialization
        carousel.dataset.carouselInitialized = 'true';
    });
}

/**
 * Handle mobile/desktop transition
 * Called by main.js resize handler when crossing 768px threshold
 */
export function handleMobileDesktopTransition() {
    const currentWidth = window.innerWidth;
    const wasMobile = lastViewportWidth <= BREAKPOINTS.mobile;
    const isMobile = currentWidth <= BREAKPOINTS.mobile;

    // Only handle transition if we crossed the mobile/desktop threshold
    if (wasMobile !== isMobile) {
        lastViewportWidth = currentWidth;

        if (isMobile) {
            // Switched TO mobile - initialize carousels
            // Don't cleanup first - mobile CSS defaults cards to hidden,
            // and initialization needs to run immediately to show first card
            initializeCarousels();
        } else {
            // Switched TO desktop - clean up carousel state
            // Reset inline styles so desktop CSS takes over
            cleanupCarousels();
        }
    }
}

/**
 * Clean up carousel state when switching to desktop
 * Removes mobile carousel styling and event listeners
 */
function cleanupCarousels() {
    const carousels = document.querySelectorAll('.carousel-container');

    carousels.forEach((carousel, index) => {
        const cards = Array.from(carousel.querySelectorAll('.coreo-card'));

        // Reset all cards to visible state (desktop shows all videos)
        cards.forEach(card => {
            card.classList.remove('active');
            card.style.opacity = '';
            card.style.transform = '';
            card.style.transition = '';
            card.style.pointerEvents = '';
        });

        // Remove carousel-specific event listeners by cloning nodes
        // (removes all event listeners without needing references)
        const leftArrow = carousel.querySelector('.carousel-arrow.left');
        const rightArrow = carousel.querySelector('.carousel-arrow.right');

        if (leftArrow) {
            const newLeftArrow = leftArrow.cloneNode(true);
            leftArrow.parentNode.replaceChild(newLeftArrow, leftArrow);
        }

        if (rightArrow) {
            const newRightArrow = rightArrow.cloneNode(true);
            rightArrow.parentNode.replaceChild(newRightArrow, rightArrow);
        }

        // Clear dots
        const section = carousel.closest('.coreografie-section');
        if (section) {
            const dots = Array.from(section.querySelectorAll('.carousel-dot'));
            dots.forEach(dot => {
                const newDot = dot.cloneNode(true);
                dot.parentNode.replaceChild(newDot, dot);
                newDot.classList.remove('active');
            });
        }

        // Remove initialized flag so it can be re-initialized if switching back to mobile
        delete carousel.dataset.carouselInitialized;
    });
}

// ============================================
// EPISODE SWITCHING & SEASON TOGGLING
// ============================================

/**
 * Toggle season accordion
 * @param {number} seasonId - Season ID to toggle
 */
function toggleSeason(seasonId) {
    const siteContent = getState('content');
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

    setTimeout(() => {
        // Then open the new section
        targetList.classList.add('expanded');
        document.querySelector(`.accordion-header[data-season="${seasonId}"]`).classList.add('active');

        setTimeout(() => {
            selectLastEpisodeInSeason(seasonId);
        }, 300);
    }, 300);
}

/**
 * Switch episode - LAZY LOADING: Create episode on-demand if not already loaded
 * @param {number} episodeId - Episode ID to switch to
 */
function switchEpisode(episodeId) {
    const siteContent = getState('content');
    const contentArea = document.getElementById('contentArea');
    const episodeContent = contentArea?.querySelector(`[data-content="${episodeId}"]`);

    if (!episodeContent && siteContent?.episodes) {
        // Find episode data
        let episodeData = null;
        siteContent.episodes.seasons.forEach(season => {
            season.episodes.forEach(episode => {
                if (episode.id === episodeId) {
                    episodeData = episode;
                }
            });
        });

        if (episodeData) {
            createEpisodeContent(episodeData, episodeId);
        }
    }

    document.querySelectorAll('.episodio-item').forEach(item => {
        item.classList.toggle('active', item.dataset.episodio == episodeId);
    });

    document.querySelectorAll('.episodio-content').forEach(content => {
        content.classList.toggle('active', content.dataset.content == episodeId);
    });

    const mobileSelector = document.getElementById('episodiMobileSelector');
    if (mobileSelector && mobileSelector.value != episodeId) {
        mobileSelector.value = episodeId;
    }
}

// ============================================
// SCROLL-DRIVEN ANIMATION SYSTEM
// ============================================

/**
 * Initialize episodi fixed positioning system with scroll-driven animations
 * Sets up entrance/deadzone/exit scroll ranges and calculates initial sizing
 *
 * CRITICAL INITIALIZATION ORDER (DO NOT REORDER):
 * 1. Calculate deadzone and set container height FIRST
 * 2. Then calculateEpisodiSizing() can measure the correct container height
 * 3. Then updateEpisodiAnimations() applies transforms
 */
export function initEpisodiFixedSystem() {
    const episodiSpacer = document.querySelector('.episodi-spacer');
    const containerWrapper = document.querySelector('.episodi-container-wrapper');

    if (!episodiSpacer || !containerWrapper) {
        return;
    }

    const viewportHeight = window.innerHeight;

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

    // MUST be set BEFORE calculateEpisodiSizing() so it can measure correctly
    const bottomPadding = 80; // Bottom margin for breathing room
    const containerHeight = viewportHeight - deadzoneTop - bottomPadding;
    containerWrapper.style.height = containerHeight + 'px';

    // Now that container has correct height, calculate sizing
    // This will measure containerWrapper.offsetHeight and get the correct value
    calculateEpisodiSizing();

    const startTop = viewportHeight;
    const travelDistance = startTop - deadzoneTop;

    const entranceDuration = 1.2 * viewportHeight; // 1.2vh for entrance
    const deadzoneDuration = 0.5 * viewportHeight; // 0.5vh deadzone
    const exitDuration = 1.0 * viewportHeight; // 1vh for exit
    const bufferDuration = SCROLL.sectionBufferVH * viewportHeight; // Buffer before next section

    const totalScrollRange = entranceDuration + deadzoneDuration + exitDuration + bufferDuration;
    episodiSpacer.style.height = totalScrollRange + 'px';

    const spacerTop = episodiSpacer.offsetTop;
    const entranceStart = spacerTop;
    const entranceEnd = entranceStart + entranceDuration;
    const deadzoneEnd = entranceEnd + deadzoneDuration;
    const exitEnd = deadzoneEnd + exitDuration;
    const bufferEnd = exitEnd + bufferDuration; // Next section starts here

    episodiAnimationState = {
        containerWrapper,
        deadzoneTop,
        startTop,
        travelDistance,
        entranceStart,
        entranceEnd,
        deadzoneEnd,
        exitEnd,
        bufferEnd, // For next section to reference
        // Cache child wrappers to avoid repeated DOM queries (performance optimization)
        sidebarWrapper: containerWrapper.querySelector('.episodi-sidebar-wrapper'),
        contentWrapper: containerWrapper.querySelector('.episodi-content-wrapper'),
        // Cache mobile breakpoint to avoid repeated window.innerWidth checks every frame
        isMobile: window.innerWidth <= BREAKPOINTS.mobile
    };

    // Store in global state for main.js to access
    updateState('animations.episodi', episodiAnimationState);

    // Update animations immediately
    updateEpisodiAnimations(getState('scroll.y'));

    // CRITICAL: Enable episodi in header registry BEFORE registering
    // This ensures header navigation waits for episodi to fully initialize
    enableSection('episodi');

    // Register section with navigation system
    const targetScroll = episodiAnimationState.isMobile ? entranceEnd : entranceEnd; // Both use entranceEnd (deadzone start)
    registerSection('episodi', targetScroll);

    // Resize handling is now centralized in main.js
}

/**
 * Calculate episodi container and video sizing
 * CRITICAL: Must be called AFTER container height is set
 * Clears transforms before measuring, which are then reapplied by updateEpisodiAnimations()
 */
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

    const sidebarWidth = sidebarWrapper.offsetWidth;
    const gap = 15;

    const viewportWidth = window.innerWidth;
    const maxContainerWidth = viewportWidth * 0.95;

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
}

/**
 * Handle episodi resize (immediate)
 * Recalculates all animation ranges and sizing
 * FOLLOWS SAME SEQUENCE AS INITIALIZATION
 */
function handleEpisodiResizeImmediate() {
    if (!episodiAnimationState) return;

    const { containerWrapper } = episodiAnimationState;
    const viewportHeight = window.innerHeight;
    const episodiSpacer = document.querySelector('.episodi-spacer');

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

    episodiAnimationState.deadzoneTop = deadzoneTop;
    episodiAnimationState.startTop = startTop;
    episodiAnimationState.travelDistance = travelDistance;
    episodiAnimationState.entranceStart = entranceStart;
    episodiAnimationState.entranceEnd = entranceEnd;
    episodiAnimationState.deadzoneEnd = deadzoneEnd;
    episodiAnimationState.exitEnd = exitEnd;
    // Refresh cached values (DOM references and mobile breakpoint)
    episodiAnimationState.sidebarWrapper = containerWrapper.querySelector('.episodi-sidebar-wrapper');
    episodiAnimationState.contentWrapper = containerWrapper.querySelector('.episodi-content-wrapper');
    episodiAnimationState.isMobile = window.innerWidth <= BREAKPOINTS.mobile;

    // CRITICAL SEQUENCE: Sizing must clear transforms, then animations reapply them
    // 1. calculateEpisodiSizing() clears transforms for clean measurements
    // 2. updateEpisodiAnimations() immediately reapplies correct transforms
    // DO NOT separate these calls or add code between them
    calculateEpisodiSizing();
    updateEpisodiAnimations(getState('scroll.y'));

    // Re-register section with updated scroll target
    const targetScroll = episodiAnimationState.isMobile ? entranceEnd : entranceEnd;
    registerSection('episodi', targetScroll);
}

/**
 * Debounced resize handler (150ms delay)
 * DEPRECATED: Now called from main.js centralized resize handler
 * Kept for backward compatibility, but not used internally
 */
const handleEpisodiResize = debounce(handleEpisodiResizeImmediate, ANIMATION.resizeDebounceMs);

/**
 * Export resize handler for main.js to call
 * Immediate (non-debounced) version - debouncing handled in main.js
 */
export { handleEpisodiResizeImmediate as handleEpisodiResize };

/**
 * Update episodi animations based on scroll position
 * @param {number} scrollY - Current scroll position in pixels
 */
export function updateEpisodiAnimations(scrollY) {
    if (!episodiAnimationState) return;

    const {
        containerWrapper,
        deadzoneTop,
        startTop,
        travelDistance,
        entranceStart,
        entranceEnd,
        deadzoneEnd,
        exitEnd,
        bufferEnd,
        sidebarWrapper,
        contentWrapper,
        isMobile
    } = episodiAnimationState;

    // Section isolation: hero → episodi → missione transitions
    // Section isolation: Switch active section based on scroll position
    const missioneAnimationState = getState('animations.missione');

    if (scrollY < entranceStart) {
        // Scrolled back up to hero section
        setActiveSection('hero');
        applyVideoState('hero');
    } else if (scrollY >= entranceStart && scrollY < bufferEnd && (!missioneAnimationState || scrollY < missioneAnimationState.entranceStart)) {
        // In episodi section (deactivate when missione entrance begins)
        setActiveSection('episodi');
        applyVideoState('episodi');
    } else if (scrollY >= bufferEnd && scrollY < missioneAnimationState.bufferEnd && missioneAnimationState) {
        // Transitioned to missione section (only within missione's range)
        setActiveSection('missione');
        applyVideoState('missione');
    }

    // PERFORMANCE: Use cached values instead of querying DOM every frame:
    // - sidebarWrapper, contentWrapper: Cached during initialization
    // - isMobile: Cached and updated on resize (same breakpoint as CSS: 768px)

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
            const progress = (scrollY - entranceStart) / (entranceEnd - entranceStart);
            const easedProgress = 1 - Math.pow(1 - progress, 1.15); // Missione ease-out curve
            opacity = easedProgress;

        } else if (scrollY <= deadzoneEnd) {
            opacity = 1;

        } else if (scrollY <= exitEnd) {
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
            containerTop = deadzoneTop;
            opacity = 1;
            sidebarTransform = 'translateY(0)';
            contentTransform = 'translateY(0)';

        } else if (scrollY <= exitEnd) {
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

    containerWrapper.style.top = containerTop + 'px';
    containerWrapper.style.opacity = opacity;

    if (sidebarWrapper) sidebarWrapper.style.transform = sidebarTransform;
    if (contentWrapper) contentWrapper.style.transform = contentTransform;

    const mobileSelector = document.getElementById('episodiMobileSelector');
    if (mobileSelector) {
        if (isMobile) {
            // Position mobile selector at same position as container top
            // (matches desktop sidebar/content positioning - they start at container top)
            mobileSelector.style.top = containerTop + 'px';
            mobileSelector.style.opacity = opacity;
            // CRITICAL: Enable pointer-events when visible, disable when hidden
            mobileSelector.style.pointerEvents = opacity > 0 ? 'auto' : 'none';
        } else {
            mobileSelector.style.opacity = 0;
            mobileSelector.style.pointerEvents = 'none';
        }
    }
}

// ============================================
// PUBLIC API
// ============================================

export {
    hasEpisodes,
    preserveEpisodeNavigation,
    toggleSeason,
    switchEpisode
};
