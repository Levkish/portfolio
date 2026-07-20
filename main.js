const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const header = document.querySelector('[data-header]');
const menuButton = document.querySelector('[data-menu-button]');
const mobileMenu = document.querySelector('[data-mobile-menu]');
const glow = document.querySelector('.cursor-glow');
const hero = document.querySelector('[data-hero]');
const heroCopy = document.querySelector('.hero-copy');
const heroHalo = document.querySelector('.hero-halo');
const scrollProgressBar = document.querySelector('[data-scroll-progress]');
const projectVisuals = [...document.querySelectorAll('.project-visual')];

window.addEventListener('scroll', () => {
  header?.classList.toggle('scrolled', window.scrollY > 24);
}, { passive: true });

let frameRequested = false;
const updateScrollMotion = () => {
  frameRequested = false;
  const pageRange = Math.max(1, document.documentElement.scrollHeight - innerHeight);
  scrollProgressBar?.style.setProperty('transform', `scaleX(${window.scrollY / pageRange})`);

  if (hero && heroCopy && heroHalo && !reducedMotion) {
    const progress = Math.min(1, Math.max(0, window.scrollY / Math.max(1, innerHeight * .86)));
    const eased = progress * progress * (3 - 2 * progress);
    heroCopy.style.transform = `translate3d(0, ${-eased * 105}px, 0) scale(${1 - eased * .08})`;
    heroCopy.style.opacity = String(1 - eased * .78);
    heroHalo.style.transform = `translate(-50%, -50%) rotate(${eased * 28}deg) scale(${1 + eased * .3})`;
    heroHalo.style.opacity = String(1 - eased * .72);
  }

  if (!reducedMotion) {
    projectVisuals.forEach((visual) => {
      const rect = visual.getBoundingClientRect();
      if (rect.bottom < -100 || rect.top > innerHeight + 100) return;
      const offset = (rect.top + rect.height / 2 - innerHeight / 2) / innerHeight;
      visual.style.setProperty('--parallax', `${offset * -26}px`);
    });
  }
};

const requestScrollMotion = () => {
  if (frameRequested) return;
  frameRequested = true;
  requestAnimationFrame(updateScrollMotion);
};
window.addEventListener('scroll', requestScrollMotion, { passive: true });
window.addEventListener('resize', requestScrollMotion);
requestScrollMotion();

menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.classList.toggle('active', open);
  mobileMenu?.classList.toggle('open', open);
  document.body.style.overflow = open ? 'hidden' : '';
});

mobileMenu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  menuButton?.setAttribute('aria-expanded', 'false');
  menuButton?.classList.remove('active');
  mobileMenu.classList.remove('open');
  document.body.style.overflow = '';
}));

if (glow && !reducedMotion) {
  let gx = innerWidth / 2;
  let gy = innerHeight / 2;
  let tx = gx;
  let ty = gy;
  window.addEventListener('pointermove', (event) => {
    tx = event.clientX;
    ty = event.clientY;
  }, { passive: true });
  const moveGlow = () => {
    gx += (tx - gx) * 0.08;
    gy += (ty - gy) * 0.08;
    glow.style.left = `${gx}px`;
    glow.style.top = `${gy}px`;
    requestAnimationFrame(moveGlow);
  };
  moveGlow();
}

const customCursor = document.querySelector('.cursor-sonar');
const cursorReadout = customCursor?.querySelector('.cursor-readout');

if (customCursor && !reducedMotion && matchMedia('(pointer:fine)').matches) {
  let cursorX = innerWidth / 2;
  let cursorY = innerHeight / 2;
  let cursorTargetX = cursorX;
  let cursorTargetY = cursorY;

  window.addEventListener('pointermove', (event) => {
    cursorTargetX = event.clientX;
    cursorTargetY = event.clientY;
    customCursor.classList.add('visible');
    customCursor.classList.toggle('is-active', Boolean(event.target.closest('a, button, [data-tilt]')));
    if (cursorReadout) {
      cursorReadout.textContent = `X ${String(Math.round(cursorTargetX)).padStart(4, '0')} / Y ${String(Math.round(cursorTargetY)).padStart(4, '0')}`;
    }
  }, { passive: true });

  window.addEventListener('pointerleave', () => customCursor.classList.remove('visible'));
  window.addEventListener('pointerdown', () => {
    customCursor.classList.remove('is-clicking');
    void customCursor.offsetWidth;
    customCursor.classList.add('is-clicking');
  });
  window.addEventListener('pointerup', () => customCursor.classList.remove('is-clicking'));

  const animateCursor = () => {
    cursorX += (cursorTargetX - cursorX) * .3;
    cursorY += (cursorTargetY - cursorY) * .3;
    customCursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
    requestAnimationFrame(animateCursor);
  };
  animateCursor();
}

const portraitOrb = document.querySelector('.portrait-orb');

if (portraitOrb && !reducedMotion && matchMedia('(pointer:fine)').matches) {
  portraitOrb.addEventListener('pointerenter', () => portraitOrb.classList.add('is-awake'));
  portraitOrb.addEventListener('pointermove', (event) => {
    portraitOrb.classList.add('is-awake');
    const bounds = portraitOrb.getBoundingClientRect();
    const normalizedX = Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / bounds.width - .5) * 2));
    const normalizedY = Math.max(-1, Math.min(1, ((event.clientY - bounds.top) / bounds.height - .5) * 2));
    portraitOrb.style.setProperty('--core-x', `${normalizedX * 15}px`);
    portraitOrb.style.setProperty('--core-y', `${normalizedY * 15}px`);
    portraitOrb.style.setProperty('--light-x', `${35 + normalizedX * 18}%`);
    portraitOrb.style.setProperty('--light-y', `${30 + normalizedY * 18}%`);
  }, { passive: true });
  portraitOrb.addEventListener('pointerleave', () => {
    portraitOrb.classList.remove('is-awake');
    portraitOrb.style.setProperty('--core-x', '0px');
    portraitOrb.style.setProperty('--core-y', '0px');
    portraitOrb.style.setProperty('--light-x', '35%');
    portraitOrb.style.setProperty('--light-y', '30%');
  });
}

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('in-view');
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.12, rootMargin: '0px 0px -8%' });

document.querySelectorAll('.reveal').forEach((element) => {
  if (reducedMotion) element.classList.add('in-view');
  else revealObserver.observe(element);
});

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const element = entry.target;
    const end = Number(element.dataset.counter || 0);
    const start = performance.now();
    const duration = 1300;
    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = String(Math.round(end * eased)).padStart(end >= 100 ? 3 : 2, '0');
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    counterObserver.unobserve(element);
  });
}, { threshold: 0.7 });
document.querySelectorAll('[data-counter]').forEach((counter) => counterObserver.observe(counter));

if (!reducedMotion && matchMedia('(pointer:fine)').matches) {
  document.querySelectorAll('[data-tilt]').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(1200px) rotateX(${-y * 2.2}deg) rotateY(${x * 2.2}deg)`;
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });
}

const canvas = document.getElementById('orb-canvas');
if (canvas) {
  const context = canvas.getContext('2d', { alpha: true });
  let width = 0;
  let height = 0;
  let ratio = 1;
  let mouseX = 0;
  let mouseY = 0;
  let smoothMouseX = 0;
  let smoothMouseY = 0;
  const particleCount = innerWidth < 700 ? 950 : 1750;
  const particles = [];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < particleCount; i += 1) {
    const y = 1 - (i / (particleCount - 1)) * 2;
    const radius = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = goldenAngle * i;
    particles.push({
      x: Math.cos(theta) * radius,
      y,
      z: Math.sin(theta) * radius,
      seed: Math.random(),
      color: Math.random() > .88 ? '#fde9ff' : Math.random() > .6 ? '#cbfffc' : '#63d7d0'
    });
  }

  const resizeCanvas = () => {
    width = innerWidth;
    height = innerHeight;
    ratio = Math.min(devicePixelRatio || 1, 1.7);
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  };
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  window.addEventListener('pointermove', (event) => {
    mouseX = event.clientX / width - .5;
    mouseY = event.clientY / height - .5;
  }, { passive: true });

  const rotateY = (point, angle) => ({
    x: point.x * Math.cos(angle) - point.z * Math.sin(angle),
    y: point.y,
    z: point.x * Math.sin(angle) + point.z * Math.cos(angle)
  });
  const rotateX = (point, angle) => ({
    x: point.x,
    y: point.y * Math.cos(angle) - point.z * Math.sin(angle),
    z: point.y * Math.sin(angle) + point.z * Math.cos(angle)
  });

  let startedAt = performance.now();
  const drawOrb = (now) => {
    const time = (now - startedAt) / 1000;
    const heroProgress = Math.min(1, window.scrollY / Math.max(1, height));
    smoothMouseX += (mouseX - smoothMouseX) * .035;
    smoothMouseY += (mouseY - smoothMouseY) * .035;
    context.clearRect(0, 0, width, height);

    const orbRadius = Math.min(width, height) * (width < 700 ? .31 : .4);
    const centerX = width * .5 + smoothMouseX * 30;
    const centerY = height * (.45 - heroProgress * .06) + smoothMouseY * 22;
    const rotationY = time * .075 + smoothMouseX * .45 + heroProgress * 1.15;
    const rotationX = -.18 + smoothMouseY * .25;

    const projected = particles.map((particle) => {
      const wave = 1 + Math.sin(time * .8 + particle.seed * 18) * .012;
      let rotated = rotateY({ x: particle.x * wave, y: particle.y * wave, z: particle.z * wave }, rotationY);
      rotated = rotateX(rotated, rotationX);
      return { ...particle, ...rotated };
    }).sort((a, b) => a.z - b.z);

    projected.forEach((particle) => {
      const depth = (particle.z + 1) / 2;
      const perspective = 1 / (1.25 - particle.z * .23);
      const x = centerX + particle.x * orbRadius * perspective;
      const y = centerY + particle.y * orbRadius * perspective;
      const size = (.45 + particle.seed * 1.25) * (0.5 + depth * .95);
      const alpha = (.1 + depth * .48) * (1 - heroProgress * .7);
      context.beginPath();
      context.fillStyle = particle.color;
      context.globalAlpha = alpha;
      context.arc(x, y, size, 0, Math.PI * 2);
      context.fill();
    });

    context.globalAlpha = 1;
    if (!reducedMotion || heroProgress < 1) requestAnimationFrame(drawOrb);
  };
  requestAnimationFrame(drawOrb);
}

const molecule = document.querySelector('[data-molecule]');
if (molecule && !reducedMotion) {
  window.addEventListener('scroll', () => {
    const rect = molecule.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > innerHeight) return;
    molecule.style.transform = `rotate(${(innerHeight / 2 - rect.top) * .012}deg)`;
  }, { passive: true });
}
