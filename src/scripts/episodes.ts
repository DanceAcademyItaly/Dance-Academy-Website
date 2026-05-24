import { isYouTubeAllowed } from './consent';

const YT_NOCOOKIE = 'https://www.youtube-nocookie.com';
const YT_IMG = 'https://img.youtube.com';

function buildEmbedSrc(videoId: string): string {
  return `${YT_NOCOOKIE}/embed/${videoId}?autoplay=1`;
}

function loadIframe(placeholder: HTMLElement): HTMLIFrameElement {
  const embedUrl = placeholder.dataset.embedUrl ?? '';
  const videoId = placeholder.dataset.videoId ?? '';
  const iframe = document.createElement('iframe');
  iframe.src = embedUrl;
  iframe.title = placeholder.closest('.video-principale')
    ? (document.querySelector<HTMLElement>('.episode-player-title')?.textContent ?? videoId)
    : videoId;
  iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
  iframe.allowFullscreen = true;
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.style.border = 'none';
  placeholder.replaceWith(iframe);
  return iframe;
}

function loadMainVideo(): HTMLIFrameElement | null {
  let mainIframe: HTMLIFrameElement | null = null;
  document.querySelectorAll<HTMLElement>('.yt-placeholder').forEach(ph => {
    if (ph.closest('.video-principale')) {
      mainIframe = loadIframe(ph);
    }
  });
  return mainIframe;
}

function initChoreographyCards(mainIframe: HTMLIFrameElement | null): void {
  document.querySelectorAll<HTMLElement>('.yt-placeholder-coreo').forEach(ph => {
    const videoId = ph.dataset.videoId ?? '';
    const card = ph.closest<HTMLElement>('.coreo-card');
    if (!card) return;

    const thumb = document.createElement('div');
    thumb.className = 'coreo-thumb';
    thumb.style.cssText = [
      'position:absolute;inset:0;',
      `background:url(${YT_IMG}/vi/${videoId}/mqdefault.jpg) center/cover no-repeat;`,
      'cursor:pointer;',
      'display:flex;align-items:center;justify-content:center;',
    ].join('');

    const playIcon = document.createElement('div');
    playIcon.className = 'coreo-play-icon';
    thumb.appendChild(playIcon);

    const coreoVideo = card.querySelector<HTMLElement>('.coreo-video');
    if (coreoVideo) {
      ph.replaceWith(thumb);
      coreoVideo.style.position = 'relative';
      coreoVideo.style.paddingBottom = '56.25%'; // 16:9 aspect ratio
      coreoVideo.style.height = '0';
    }

    card.style.cursor = 'pointer';
    card.addEventListener('click', () => {
      if (!mainIframe) return;
      mainIframe.src = buildEmbedSrc(videoId);
      mainIframe.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      document.querySelectorAll('.coreo-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      document.querySelector<HTMLElement>('.episode-player-title')?.classList.add('episode-title-dirty');
    });
  });
}

function setupTitleToggle(mainIframe: HTMLIFrameElement | null): void {
  const title = document.querySelector<HTMLElement>('.episode-player-title');
  if (!title || !mainIframe) return;

  title.addEventListener('click', () => {
    if (!title.classList.contains('episode-title-dirty')) return;
    const mainPh = document.querySelector<HTMLElement>('.video-principale [data-video-id]');
    const originalVideoId = mainPh?.dataset.videoId;
    if (originalVideoId) {
      mainIframe.src = `${YT_NOCOOKIE}/embed/${originalVideoId}`;
    }
    document.querySelectorAll('.coreo-card').forEach(c => c.classList.remove('active'));
    title.classList.remove('episode-title-dirty');
  });
}

function activateAll(): void {
  const placeholders = document.querySelectorAll<HTMLElement>('.yt-placeholder');
  if (!placeholders.length) return;

  const mainIframe = loadMainVideo();
  initChoreographyCards(mainIframe);
  setupTitleToggle(mainIframe);
}

function initEpisodes(): void {
  if (isYouTubeAllowed()) {
    activateAll();
  } else {
    window.addEventListener('da:consent-change', (e: Event) => {
      const detail = (e as CustomEvent<{ value: string }>).detail;
      if (detail.value === 'accepted' || detail.value === 'custom:youtube=true') {
        activateAll();
      }
    }, { once: true });
  }
}

initEpisodes();
