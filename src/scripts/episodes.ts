function initEpisodes() {
  const mainIframe = document.querySelector<HTMLIFrameElement>('.video-principale iframe');
  if (!mainIframe) return;

  const originalSrc = mainIframe.src;

  function buildEmbedSrc(videoId: string): string {
    return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  }

  document.querySelectorAll<HTMLElement>('.coreo-card').forEach(card => {
    const iframe = card.querySelector<HTMLIFrameElement>('iframe');
    if (!iframe) return;

    const videoId = iframe.src.split('/embed/')[1]?.split('?')[0];
    if (!videoId) return;

    const thumbnail = document.createElement('div');
    thumbnail.className = 'coreo-thumb';
    thumbnail.style.cssText = `
      position:absolute;inset:0;
      background:url(https://img.youtube.com/vi/${videoId}/mqdefault.jpg) center/cover no-repeat;
      cursor:pointer;
      display:flex;align-items:center;justify-content:center;
    `;
    const playIcon = document.createElement('div');
    playIcon.className = 'coreo-play-icon';
    thumbnail.appendChild(playIcon);

    const coreoVideo = card.querySelector<HTMLElement>('.coreo-video');
    if (coreoVideo) {
      iframe.style.display = 'none';
      coreoVideo.appendChild(thumbnail);
    }

    card.style.cursor = 'pointer';
    card.addEventListener('click', () => {
      mainIframe.src = buildEmbedSrc(videoId);
      mainIframe.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      document.querySelectorAll('.coreo-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
    });
  });
}

initEpisodes();
