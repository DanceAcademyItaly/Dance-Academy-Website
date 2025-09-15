// Dance Academy - Pergamena Unica
let siteContent = null;
let hasEpisodes = false;

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
    
    populateContent();
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
            logoVideoPath: "logo.mp4",
            logoInlinePath: "logo_inline.png",
            videoBackgroundPath: "video.mp4",
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
        introLogo.querySelector('source').src = siteContent.site?.logoVideoPath || 'logo.mp4';
        introLogo.load();
    }
    
    // Video background
    const videoBg = document.getElementById('videoBg');
    if (videoBg) {
        videoBg.querySelector('source').src = siteContent.site?.videoBackgroundPath || 'video.mp4';
        videoBg.load();
    }
    
    // Hero
    const heroLogo = document.getElementById('heroLogo');
    if (heroLogo) heroLogo.src = siteContent.site?.logoInlinePath || 'logo_inline.png';
    
    const heroSubtitle = document.getElementById('heroSubtitle');
    if (heroSubtitle) heroSubtitle.textContent = siteContent.hero?.subtitle || '';
    
    // Episodes
    if (hasEpisodes) {
        document.querySelector('.episodi-block').style.display = 'flex';
        populateEpisodes();
        
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
                ${block.title ? `<h3>${block.title}</h3>` : ''}
                ${block.text ? `<p>${block.text}</p>` : ''}
            `;
            missioneContainer.appendChild(div);
        });
        
        if (siteContent.missione.ctaText) {
            const ctaDiv = document.createElement('div');
            ctaDiv.className = 'cta-container';
            const link = document.createElement('a');
            link.href = '#candidati';
            link.className = 'cta-primary';
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
    
    const defaultEpisodeId = siteContent.episodes.defaultActiveEpisode || 1;
    let activeSeasonId = null;
    
    // Find active season
    siteContent.episodes.seasons.forEach(season => {
        if (season.episodes.some(ep => ep.id === defaultEpisodeId)) {
            activeSeasonId = season.id;
        }
    });
    
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
    
    // Start intro video
    const introLogo = document.getElementById('introLogo');
    if (introLogo) {
        introLogo.play().catch(e => console.log('Autoplay prevented'));
    }
    
    // Start background video after intro
    setTimeout(() => {
        const videoBg = document.getElementById('videoBg');
        if (videoBg) {
            videoBg.play().catch(e => console.log('Autoplay prevented'));
        }
    }, 5000);
    
    // Enable scrolling when video is fully visible (after 5.5s)
    setTimeout(() => {
        scrollEnabled = true;
        document.body.style.overflow = 'auto';
        window.removeEventListener('scroll', preventScroll);
        window.removeEventListener('wheel', preventScroll);
        window.removeEventListener('touchmove', preventScroll);
    }, 5500);
    
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
    
    // Main scroll handler
    window.addEventListener('scroll', () => {
        // Update progress bar
        const scrollTop = window.scrollY;
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercentage = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
        progressBar.style.width = Math.min(100, Math.max(0, scrollPercentage)) + '%';
        
        // Update active header
        const currentSection = getCurrentSection();
        if (currentSection) {
            updateActiveHeader(currentSection);
        }
    });
    
    // Initial update
    const currentSection = getCurrentSection();
    if (currentSection) {
        updateActiveHeader(currentSection);
    }
    
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

// Start
document.addEventListener('DOMContentLoaded', loadContent);