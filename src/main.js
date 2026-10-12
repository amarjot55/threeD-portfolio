import './style.css';
import { initScene } from './scene.js';
import { initAssistant } from './assistant.js';

const scene = initScene(document.getElementById('bg'));
window.__orb = scene;

// Nav state
const nav = document.getElementById('nav');
const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Count-up for proof numbers
function countUp(el) {
  const target = parseFloat(el.dataset.count);
  const prefix = el.dataset.prefix || '';
  const suffix = el.dataset.suffix || '';
  const decimals = String(el.dataset.count).includes('.') ? 1 : 0;
  const start = performance.now();
  const dur = 1400;
  const step = (now) => {
    const p = Math.min((now - start) / dur, 1);
    const eased = 1 - Math.pow(1 - p, 4);
    el.textContent = `${prefix}${(target * eased).toFixed(decimals)}${suffix}`;
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// Staggered reveal on scroll
const io = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const siblings = [...el.parentElement.querySelectorAll(':scope > .reveal')];
    el.style.transitionDelay = `${Math.max(0, siblings.indexOf(el)) * 80}ms`;
    el.classList.add('in');
    el.querySelectorAll('[data-count]').forEach(countUp);
    io.unobserve(el);
  });
}, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

// Spotlight + gentle tilt on cards (pointer devices only)
if (window.matchMedia('(hover: hover)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.querySelectorAll('.tilt').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      card.style.setProperty('--mx', `${x * 100}%`);
      card.style.setProperty('--my', `${y * 100}%`);
      card.style.transform = `perspective(1100px) rotateX(${(0.5 - y) * 3}deg) rotateY(${(x - 0.5) * 4}deg)`;
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });
}

initAssistant({ onEnergy: (v) => scene.setEnergy(v) });
