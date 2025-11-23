/**
 * Content loading and DOM population
 * Handles fetching content.json and populating HTML with content
 */

import { setState } from './state.js';
import { API } from './config.js';

// ============================================
// CONTENT LOADING
// ============================================

/**
 * Load content from content.json
 * @returns {Promise<Object>} Content object
 */
export async function loadContent() {
    try {
        const response = await fetch(API.contentUrl + '?t=' + Date.now());

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const content = await response.json();

        // Store in state
        setState({
            content,
            hasEpisodes: checkEpisodesExist(content)
        });

        return content;

    } catch (error) {
        console.error('Error loading content:', error);

        // Create fallback content
        const fallback = createFallbackContent();
        setState({
            content: fallback,
            hasEpisodes: false
        });

        return fallback;
    }
}

/**
 * Check if episodes exist in content
 * @param {Object} content - Content object
 * @returns {boolean} True if episodes exist
 */
function checkEpisodesExist(content) {
    const exists = content?.episodes?.seasons?.some(season =>
        season?.episodes?.length > 0
    ) || false;

    return exists;
}

/**
 * Create fallback content if loading fails
 * @returns {Object} Fallback content object
 */
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

// ============================================
// DOM POPULATION
// ============================================

/**
 * Populate DOM with content
 * @param {Object} content - Content object from content.json
 * @param {Object} dependencies - External dependencies (functions from other modules)
 *                                { initHeroAnimations, scrollToSection, initializeCarousels, updateVisibleBlocks }
 */
export function populateContent(content, dependencies = {}) {
    // Page title
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) {
        pageTitle.textContent = content.site?.title || 'Dance Academy';
    }

    // Intro
    const introText = document.getElementById('introText');
    if (introText) {
        introText.textContent = content.site?.introText || '';
    }

    const introLogo = document.getElementById('introLogo');
    if (introLogo) {
        const source = introLogo.querySelector('source');
        if (source) {
            source.src = content.site?.logoVideoPath || 'Assets/logo.mp4';
            introLogo.load();
        }
    }

    // Video background
    const videoBg = document.getElementById('videoBg');
    if (videoBg) {
        const source = videoBg.querySelector('source');
        if (source) {
            source.src = content.site?.videoBackgroundPath || 'Assets/video.mp4';
            videoBg.load();
        }
    }

    // Hero
    const heroLogo = document.getElementById('heroLogo');
    if (heroLogo) {
        heroLogo.src = content.site?.logoInlinePath || 'Assets/logo_inline.png';
    }

    const heroSubtitle = document.getElementById('heroSubtitle');
    if (heroSubtitle) {
        heroSubtitle.textContent = content.hero?.subtitle || '';
    }

    // Initialize hero animations (if dependency provided)
    if (dependencies.initHeroAnimations) {
        dependencies.initHeroAnimations();
    }

    // Episodes
    const hasEpisodes = checkEpisodesExist(content);
    if (hasEpisodes) {
        populateEpisodes(content, dependencies);

        // Update visible blocks (if dependency provided)
        if (dependencies.updateVisibleBlocks) {
            dependencies.updateVisibleBlocks();
        }

        // Show episodi in header
        const headerSpans = document.querySelectorAll('.header-fixed span');
        if (headerSpans[1]) {
            headerSpans[1].style.display = 'inline';
        }
    } else {
        // Hide episodi in header
        const headerSpans = document.querySelectorAll('.header-fixed span');
        if (headerSpans[1]) {
            headerSpans[1].style.display = 'none';
        }
    }

    // Missione
    populateMissione(content, dependencies);

    // Contatti
    populateContatti(content);
}

/**
 * Populate missione section
 * @param {Object} content - Content object
 * @param {Object} dependencies - { scrollToSection }
 */
function populateMissione(content, dependencies = {}) {
    const missioneContainer = document.getElementById('missioneContainer');
    if (!missioneContainer || !content.missione) return;

    missioneContainer.innerHTML = '';

    // Copy blocks
    content.missione.copyBlocks?.forEach(block => {
        const div = document.createElement('div');
        div.className = 'copy-block';
        div.innerHTML = `
            ${block.title ? `<h3 class="missione-title">${block.title}</h3>` : ''}
            ${block.text ? `<p class="missione-text">${block.text}</p>` : ''}
        `;
        missioneContainer.appendChild(div);
    });

    // CTA button
    if (content.missione.ctaText) {
        const ctaDiv = document.createElement('div');
        ctaDiv.className = 'cta-container';
        const link = document.createElement('a');
        link.href = '#candidati';
        link.className = 'missione-button';
        link.textContent = content.missione.ctaText;
        link.onclick = (e) => {
            e.preventDefault();
            if (dependencies.scrollToSection) {
                dependencies.scrollToSection('candidati');
            }
        };
        ctaDiv.appendChild(link);
        missioneContainer.appendChild(ctaDiv);
    }
}

/**
 * Populate contatti section
 * @param {Object} content - Content object
 */
function populateContatti(content) {
    const contattiContainer = document.getElementById('contattiContainer');
    if (!contattiContainer || !content.contatti) return;

    contattiContainer.innerHTML = `
        <h2>${content.contatti.title || 'Contatti'}</h2>
        <div class="contatti-info">
            ${content.contatti.contacts?.map(contact => `
                <div class="contatto-item">
                    <h3>${contact.type}</h3>
                    <p>${contact.value}</p>
                </div>
            `).join('') || ''}
        </div>
    `;
}

// ============================================
// EPISODI POPULATION
// ============================================

/**
 * Populate episodes section (sidebar, mobile selector, content)
 * @param {Object} content - Content object
 * @param {Object} dependencies - { toggleSeason, switchEpisode, initializeCarousels }
 */
export function populateEpisodes(content, dependencies = {}) {
    const sidebar = document.getElementById('sidebar');
    const contentArea = document.getElementById('contentArea');

    if (!content?.episodes || !sidebar || !contentArea) return;

    // Find last episode of last season automatically
    let defaultEpisodeId = 1; // fallback
    let activeSeasonId = null;

    if (content.episodes.seasons && content.episodes.seasons.length > 0) {
        const lastSeason = content.episodes.seasons[content.episodes.seasons.length - 1];
        activeSeasonId = lastSeason.id;

        if (lastSeason.episodes && lastSeason.episodes.length > 0) {
            const lastEpisode = lastSeason.episodes[lastSeason.episodes.length - 1];
            defaultEpisodeId = lastEpisode.id;
        }
    }

    // Build sidebar
    sidebar.innerHTML = '';
    content.episodes.seasons.forEach(season => {
        if (!season?.episodes?.length) return;

        const seasonDiv = document.createElement('div');
        seasonDiv.className = 'stagione-accordion';

        const header = document.createElement('div');
        header.className = `accordion-header${season.id === activeSeasonId ? ' active' : ''}`;
        header.dataset.season = season.id;
        header.textContent = season.name;
        header.onclick = () => {
            if (dependencies.toggleSeason) {
                dependencies.toggleSeason(season.id);
            }
        };

        const list = document.createElement('ul');
        list.className = `episodi-list${season.id === activeSeasonId ? ' expanded' : ''}`;
        list.dataset.season = season.id;

        season.episodes.forEach(episode => {
            const li = document.createElement('li');
            li.className = `episodio-item${episode.id === defaultEpisodeId ? ' active' : ''}`;
            li.dataset.episodio = episode.id;
            li.textContent = episode.title;
            li.onclick = () => {
                if (dependencies.switchEpisode) {
                    dependencies.switchEpisode(episode.id);
                }
            };
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
        content.episodes.seasons.forEach(season => {
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
            if (dependencies.switchEpisode) {
                dependencies.switchEpisode(episodeId);
            }
        };
    }

    // Build content - LAZY LOADING: Only create the active episode initially
    contentArea.innerHTML = '';

    // Find the default episode data
    let defaultEpisodeData = null;
    content.episodes.seasons.forEach(season => {
        season.episodes.forEach(episode => {
            if (episode.id === defaultEpisodeId) {
                defaultEpisodeData = episode;
            }
        });
    });

    if (defaultEpisodeData) {
        createEpisodeContent(defaultEpisodeData, defaultEpisodeId, true, dependencies);
    }

    // Initialize carousel navigation after content is rendered
    if (dependencies.initializeCarousels) {
        dependencies.initializeCarousels();
    }
}

/**
 * Create episode content HTML
 * Helper function for lazy loading episodes
 * @param {Object} episode - Episode data
 * @param {number} episodeId - Episode ID
 * @param {boolean} isActive - Whether episode should be active
 * @param {Object} dependencies - { initializeCarousels }
 */
export function createEpisodeContent(episode, episodeId, isActive = false, dependencies = {}) {
    const contentArea = document.getElementById('contentArea');
    if (!contentArea) return;

    // Check if already exists
    const existing = contentArea.querySelector(`[data-content="${episodeId}"]`);
    if (existing) {
        return;
    }

    const div = document.createElement('div');
    div.className = isActive ? 'episodio-content active' : 'episodio-content';
    div.dataset.content = episodeId;

    // Main video
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

    // Choreographies carousel (if exists)
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

        // Add arrows and dots if multiple choreographies
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
    if (dependencies.initializeCarousels) {
        dependencies.initializeCarousels();
    }
}
