(() => {
  const button = document.getElementById('envelope');
  if (!button) return;
  const letter = document.getElementById('letter');
  const tilt = button.querySelector('.envelope-tilt');
  const audio = document.getElementById('bgm');

  const openEnvelope = () => {
    button.classList.add('open');
    button.setAttribute('aria-expanded', 'true');
    if (letter) letter.setAttribute('aria-hidden', 'false');
    if (audio) { audio.volume = 0.6; audio.play().catch(() => {}); }
  };

  const closeEnvelope = () => {
    button.classList.remove('open');
    button.setAttribute('aria-expanded', 'false');
    if (letter) letter.setAttribute('aria-hidden', 'true');
    if (audio) { audio.pause(); }
  };

  const toggleOpen = () => {
    button.classList.remove('is-bouncing');
    void button.offsetWidth;
    button.classList.add('is-bouncing');
    const willOpen = !button.classList.contains('open');
    if (willOpen) openEnvelope(); else closeEnvelope();
  };

  button.addEventListener('click', toggleOpen);
  button.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleOpen();
    }
  });

  // Subtle 3D tilt
  if (tilt) {
    const maxTilt = 10;
    const damp = 0.12;
    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;
    const rect = () => button.getBoundingClientRect();
    const onMove = (clientX, clientY) => {
      const r = rect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = (clientX - cx) / (r.width / 2);
      const dy = (clientY - cy) / (r.height / 2);
      targetY = Math.max(-1, Math.min(1, dx)) * maxTilt;
      targetX = Math.max(-1, Math.min(1, -dy)) * maxTilt;
    };
    const animate = () => {
      currentX += (targetX - currentX) * damp;
      currentY += (targetY - currentY) * damp;
      tilt.style.transform = `rotateX(${currentX.toFixed(2)}deg) rotateY(${currentY.toFixed(2)}deg)`;
      requestAnimationFrame(animate);
    };
    animate();
    window.addEventListener('mousemove', (e) => onMove(e.clientX, e.clientY));
    window.addEventListener('touchmove', (e) => { const t = e.touches[0]; if (t) onMove(t.clientX, t.clientY); }, { passive: true });
  }

  // Sakura petals spawner
  const spawnPetal = () => {
    const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    const size = 12 + Math.random() * 26; // px (bigger variety)
    const duration = 8 + Math.random() * 10; // s (faster)
    const startX = Math.random() * vw;
    const driftX = (Math.random() * 2 - 1) * (vw * 0.25);
    const swayDuration = 1.4 + Math.random() * 1.8; // s (faster sway)
    const swayAngle = (8 + Math.random() * 16) + 'deg';
    const initialRot = (Math.random() * 60 - 30) + 'deg';
    const flipDuration = 1.2 + Math.random() * 1.6; // s

    // color variations
    const petalLight = '#ffe3ec';
    const petalMid = Math.random() < 0.5 ? '#ffb7cc' : '#ff9fbd';
    const petalDark = Math.random() < 0.5 ? '#ff8fb3' : '#ff7aa2';

    const petal = document.createElement('div');
    petal.className = 'petal';
    petal.style.setProperty('--size', size + 'px');
    petal.style.setProperty('--duration', duration + 's');
    petal.style.setProperty('--startX', startX + 'px');
    petal.style.setProperty('--driftX', driftX + 'px');
    petal.style.setProperty('--swayDuration', swayDuration + 's');
    petal.style.setProperty('--swayAngle', swayAngle);
    petal.style.setProperty('--initialRot', initialRot);
    petal.style.setProperty('--flipDuration', flipDuration + 's');
    petal.style.setProperty('--petalLight', petalLight);
    petal.style.setProperty('--petalMid', petalMid);
    petal.style.setProperty('--petalDark', petalDark);

    const shape = document.createElement('div');
    shape.className = 'shape';
    petal.appendChild(shape);
    document.body.appendChild(petal);
    petal.addEventListener('animationend', () => petal.remove());
  };

  // initial burst
  for (let i = 0; i < 16; i++) setTimeout(spawnPetal, i * 100);
  // continuous gentle fall
  setInterval(() => {
    if (document.hidden) return;
    for (let i = 0; i < 3; i++) spawnPetal();
  }, 1200);
})();


