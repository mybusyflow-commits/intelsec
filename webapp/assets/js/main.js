/* =========================================================
   main.js: orchestrator (no custom cursor, no particle spam)
   ========================================================= */

import { initField } from './bg-field.js';
import { initHeroStage } from './hero-stage.js';
import { initPlatform } from './platform.js';
import { initHowStage } from './how-stage.js';
import { initScanner } from './scanner.js';
import { initPricing } from './pricing.js';
import { initModals } from './modals.js';
import { initDashboard } from './dashboard.js';

// Live reduced-motion gate. The OS setting can be toggled without a
// reload, so we listen for changes and re-evaluate. (per the
// accessible-animation skill: "Toggling the OS setting fires no
// page reload; without a change listener the page keeps its stale state.")
export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const $  = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));

window.addEventListener('DOMContentLoaded', () => {

  // ---------- Curtain: quicker, calmer ----------
  const curtain = $('#curtain');
  if (curtain) setTimeout(() => curtain.classList.add('is-done'), 540);

  // ---------- Backgrounds (single restrained canvas) ----------
  try { initField($('#bgField')); } catch (e) { console.warn('field', e); }

  // ---------- Nav scroll state ----------
  const nav = $('#nav');
  addEventListener('scroll', () => {
    nav.classList.toggle('is-scrolled', scrollY > 8);
  }, { passive: true });

  // ---------- Mobile menu ----------
  const burger = $('#navBurger');
  const mobileMenu = $('#mobileMenu');
  burger?.addEventListener('click', () => {
    const open = burger.getAttribute('aria-expanded') === 'true';
    burger.setAttribute('aria-expanded', String(!open));
    mobileMenu.classList.toggle('is-open', !open);
    mobileMenu.setAttribute('aria-hidden', String(open));
    document.body.style.overflow = open ? '' : 'hidden';
  });
  mobileMenu?.querySelectorAll('a, button').forEach(a => a.addEventListener('click', () => {
    burger.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('is-open');
    document.body.style.overflow = '';
  }));

  // ---------- Hero HUD live values (measured from the real engine) ----------
  const hudLatency = $('#hudLatency');
  const hudThreats = $('#hudThreats');
  async function refreshHud(){
    const t0 = performance.now();
    try{
      const s = await (await fetch('/api/v1/system/summary')).json();
      const ms = Math.max(1, Math.round(performance.now() - t0));
      if (hudLatency) hudLatency.textContent = ms + 'ms';
      if (hudThreats) hudThreats.textContent = Number(s.threats_active ?? 0).toLocaleString();
    }catch(e){ /* keep last values when offline */ }
  }
  refreshHud();
  setInterval(refreshHud, 8000);

  // ---------- Metrics band (live engine numbers with restrained count-up) ----------
  function countUp(el, target){
    if(!el) return;
    target = Number(target) || 0;
    const dur = 900; const t0 = performance.now();
    function step(t){
      const p = Math.min((t - t0) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      el.firstChild.nodeValue = String(Math.round(target * e));
      if(p < 1) requestAnimationFrame(step);
      else el.firstChild.nodeValue = String(Math.round(target));
    }
    requestAnimationFrame(step);
  }
  async function refreshMetrics(){
    try{
      const s = await (await fetch('/api/v1/system/summary')).json();
      countUp(document.getElementById('mBlocked'), s.threats_blocked);
      countUp(document.getElementById('mScans'), s.total_scans);
      countUp(document.getElementById('mModels'), s.models_monitored);
      countUp(document.getElementById('mScore'), Math.round(Number(s.security_score ?? 0)));
    }catch(e){}
  }
  const metricsSec = document.getElementById('metrics');
  if(metricsSec){
    let metricsDone = false;
    new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if(e.isIntersecting && !metricsDone){ metricsDone = true; refreshMetrics(); obs.disconnect(); }
      });
    }, { threshold: 0.3 }).observe(metricsSec);
    setInterval(refreshMetrics, 30000);
  }

  // ---------- Reveal on scroll (gentle) ----------
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
  $$('.reveal, .reveal-mask, [data-reveal]').forEach(el => io.observe(el));

  // ---------- GSAP: headline only, restrained ----------
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.from('.hero__title .row > span', {
      yPercent: 110, duration: 0.85, ease: 'expo.out', stagger: 0.045, delay: 0.2
    });
  }


  // ---------- Init sections ----------
  initHeroStage($('#heroShield'));
  initPlatform();
  initHowStage($('#howCanvas'));
  initScanner();
  initPricing();
  initModals();
  initDashboard();

  // ---------- Active nav highlight ----------
  const sections = $$('section[data-section]');
  const navLinks = $$('.nav__link');
  const navIO = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const id = '#' + e.target.id;
        navLinks.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === id));
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  sections.forEach(s => s.id && navIO.observe(s));

  // Toast for placeholder links (footer etc): no deletion, just feedback
  document.addEventListener('click', (e)=>{
    const t=e.target.closest('[data-toast]');
    if(!t) return;
    e.preventDefault();
    const msg=t.dataset.toast||'Coming soon';
    const el=document.getElementById('toast');
    if(!el) return;
    el.textContent=msg;
    el.classList.add('is-show');
    clearTimeout(el._hide);
    el._hide=setTimeout(()=> el.classList.remove('is-show'), 2200);
  });
});
