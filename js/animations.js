/**
 * Animation Initializers — GSAP & AOS
 */

import { CONFIG } from '../config.js';

export async function initAnimations() {
  await initAOS();
  initHeroAnimations();
}

async function initAOS() {
  if (typeof AOS === 'undefined') return;

  AOS.init({
    duration: CONFIG.animations.aosDuration,
    once: CONFIG.animations.aosOnce,
    easing: 'ease-out-cubic',
    offset: 60,
    disable: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  });
}

function initHeroAnimations() {
  if (typeof gsap === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const hero = document.querySelector('.hero__content');
  if (!hero) return;

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  tl.from('.hero__badge', { opacity: 0, y: 20, duration: 0.6 })
    .from('.hero__title', { opacity: 0, y: 30, duration: 0.8 }, '-=0.3')
    .from('.hero__subtitle', { opacity: 0, y: 20, duration: 0.6 }, '-=0.4')
    .from('.hero__actions .btn', { opacity: 0, y: 20, duration: 0.5, stagger: 0.15 }, '-=0.3');
}

export function refreshAOS() {
  if (typeof AOS !== 'undefined') AOS.refresh();
}
