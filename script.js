(() => {
  const button = document.getElementById('envelope');
  if (!button) return;
  const letter = document.getElementById('letter');
  const audio = document.getElementById('bgm');
  const tilt = document.querySelector('#envelope .envelope-tilt');
  let hasBrokenSeal = false;

  const openEnvelope = () => {
    button.classList.add('open');
    button.setAttribute('aria-expanded', 'true');
    if (letter) letter.setAttribute('aria-hidden', 'false');
    if (audio) {
      audio.volume = 0.6;
      audio.play().catch(() => {});
    }
  };

  const closeEnvelope = () => {
    button.classList.remove('open');
    button.setAttribute('aria-expanded', 'false');
    if (letter) letter.setAttribute('aria-hidden', 'true');
    if (audio) audio.pause();
  };

  const toggleOpen = () => {
    // bounce on every interaction
    button.classList.remove('is-bouncing');
    // Force reflow to restart the animation
    // eslint-disable-next-line no-unused-expressions
    void button.offsetWidth;
    button.classList.add('is-bouncing');

    const currentlyOpen = button.classList.contains('open');
    const willOpen = !currentlyOpen;

    if (willOpen && !hasBrokenSeal) {
      // Play seal break, then open
      hasBrokenSeal = true;
      button.classList.add('seal-breaking');
      setTimeout(() => {
        button.classList.remove('seal-breaking');
        button.classList.add('seal-broken');
        openEnvelope();
      }, 560);
      return;
    }

    if (willOpen) {
      openEnvelope();
    } else {
      closeEnvelope();
    }
  };

  button.addEventListener('click', toggleOpen);
  button.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleOpen();
    }
  });

  // Floating pulsing hearts
  const root = document.documentElement;
  const spawnHeart = () => {
    const span = document.createElement('span');
    span.className = 'floating-heart';

    // Randomize starting position and movement vector
    const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    const vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    const startX = Math.random() * vw;
    const startY = Math.random() * vh;
    const dx = (Math.random() * 2 - 1) * (vw * 0.4);
    const dy = -Math.random() * (vh * 0.6) - (vh * 0.2); // drift upward generally

    const size = 18 + Math.random() * 28; // px
    const duration = 8 + Math.random() * 10; // seconds

    span.style.setProperty('--x', `${startX}px`);
    span.style.setProperty('--y', `${startY}px`);
    span.style.setProperty('--dx', `${dx}px`);
    span.style.setProperty('--dy', `${dy}px`);
    span.style.setProperty('--size', `${size}px`);
    span.style.setProperty('--duration', `${duration}s`);

    const inner = document.createElement('span');
    inner.className = 'fh-inner';
    inner.textContent = '❤';
    inner.style.color = getComputedStyle(root).getPropertyValue('--accent-dark') || '#6b50e0';
    span.appendChild(inner);

    document.body.appendChild(span);
    // Clean up after animation
    span.addEventListener('animationend', () => span.remove());
  };

  // Spawn some hearts periodically
  const startHeartStream = () => {
    // Initial burst
    for (let i = 0; i < 8; i++) setTimeout(spawnHeart, i * 150);
    // Continuous
    setInterval(() => {
      const batch = 1 + Math.floor(Math.random() * 3);
      for (let i = 0; i < batch; i++) spawnHeart();
    }, 1200);
  };

  startHeartStream();

  // Subtle 3D tilt effect
  if (tilt) {
    const maxTilt = 10; // degrees
    const damp = 0.12;  // smooth follow
    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;
    const rect = () => button.getBoundingClientRect();

    const onMove = (clientX, clientY) => {
      const r = rect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = (clientX - cx) / (r.width / 2);
      const dy = (clientY - cy) / (r.height / 2);
      targetY = Math.max(-1, Math.min(1, dx)) * maxTilt; // rotateY by X movement
      targetX = Math.max(-1, Math.min(1, -dy)) * maxTilt; // rotateX by Y movement
    };

    const animate = () => {
      currentX += (targetX - currentX) * damp;
      currentY += (targetY - currentY) * damp;
      tilt.style.transform = `rotateX(${currentX.toFixed(2)}deg) rotateY(${currentY.toFixed(2)}deg)`;
      requestAnimationFrame(animate);
    };
    animate();

    window.addEventListener('mousemove', (e) => onMove(e.clientX, e.clientY));
    window.addEventListener('touchmove', (e) => {
      const t = e.touches[0];
      if (t) onMove(t.clientX, t.clientY);
    }, { passive: true });
  }

  // Cursor heart trail
  let lastTrailTime = 0;
  const spawnTrailHeart = (x, y) => {
    const span = document.createElement('span');
    span.className = 'floating-heart';
    const size = 10 + Math.random() * 14;
    const duration = 2.2 + Math.random() * 1.3;
    const dx = (Math.random() * 2 - 1) * 60;
    const dy = -80 - Math.random() * 60;
    span.style.setProperty('--x', `${x}px`);
    span.style.setProperty('--y', `${y}px`);
    span.style.setProperty('--dx', `${dx}px`);
    span.style.setProperty('--dy', `${dy}px`);
    span.style.setProperty('--size', `${size}px`);
    span.style.setProperty('--duration', `${duration}s`);
    const inner = document.createElement('span');
    inner.className = 'fh-inner';
    inner.textContent = '❤';
    inner.style.color = getComputedStyle(document.documentElement).getPropertyValue('--accent');
    span.appendChild(inner);
    document.body.appendChild(span);
    span.addEventListener('animationend', () => span.remove());
  };

  const trailThrottleMs = 60;
  window.addEventListener('mousemove', (e) => {
    const now = Date.now();
    if (now - lastTrailTime > trailThrottleMs) {
      lastTrailTime = now;
      spawnTrailHeart(e.clientX, e.clientY);
    }
  });

  // Photo hearts: preload and spawn with same drift
  const photoSources = Array.from({ length: 11 }, (_, i) => `Photos/${i}.jpg`);
  const preloadedImages = [];
  photoSources.forEach((src) => {
    const img = new Image();
    img.src = src;
    preloadedImages.push(img);
  });

  const createPhotoHeartSVG = (imgHref, sizePx) => {
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('width', `${sizePx}`);
    svg.setAttribute('height', `${sizePx}`);
    svg.setAttribute('aria-hidden', 'true');

    const defs = document.createElementNS(svgNS, 'defs');
    const pattern = document.createElementNS(svgNS, 'pattern');
    const patternId = `ph-${Math.random().toString(36).slice(2)}`;
    pattern.setAttribute('id', patternId);
    pattern.setAttribute('patternUnits', 'objectBoundingBox');
    pattern.setAttribute('width', '1');
    pattern.setAttribute('height', '1');

    const image = document.createElementNS(svgNS, 'image');
    image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', imgHref);
    image.setAttribute('width', '100');
    image.setAttribute('height', '100');
    image.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    pattern.appendChild(image);
    defs.appendChild(pattern);
    svg.appendChild(defs);

    const path = document.createElementNS(svgNS, 'path');
    path.setAttribute('d', 'M50 15 C35 0, 0 10, 0 40 C0 70, 30 85, 50 100 C70 85, 100 70, 100 40 C100 10, 65 0, 50 15 Z');
    path.setAttribute('fill', `url(#${patternId})`);
    svg.appendChild(path);
    return svg;
  };

  const spawnPhotoHeart = () => {
    const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    const vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    const startX = Math.random() * vw;
    const startY = Math.random() * vh;
    const dx = (Math.random() * 2 - 1) * (vw * 0.35);
    const dy = -Math.random() * (vh * 0.5) - (vh * 0.25);
    const size = 60 + Math.random() * 80; // px
    const duration = 12 + Math.random() * 12; // s
    const src = photoSources[Math.floor(Math.random() * photoSources.length)];

    const wrapper = document.createElement('div');
    wrapper.className = 'photo-heart';
    wrapper.style.setProperty('--x', `${startX}px`);
    wrapper.style.setProperty('--y', `${startY}px`);
    wrapper.style.setProperty('--dx', `${dx}px`);
    wrapper.style.setProperty('--dy', `${dy}px`);
    wrapper.style.setProperty('--size', `${size}px`);
    wrapper.style.setProperty('--duration', `${duration}s`);

    const svg = createPhotoHeartSVG(src, size);
    wrapper.appendChild(svg);
    document.body.appendChild(wrapper);
    wrapper.addEventListener('animationend', () => wrapper.remove());
  };

  // Periodically spawn photo hearts (less frequent than emoji hearts)
  setInterval(() => {
    if (document.hidden) return;
    // 40% chance to spawn a photo heart this tick
    if (Math.random() < 0.4) spawnPhotoHeart();
  }, 2000);
})();


