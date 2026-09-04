/* =========================================================
   modals.js — open/close + form submit + auth
   ========================================================= */
import { openApp } from './dashboard.js';

export function initModals() {
  const modals = document.querySelectorAll('.modal');

  function open(name) {
    const m = document.getElementById('modal-' + name);
    if (!m) return;
    m.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function close(m) {
    m.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    const panel = m.querySelector('.modal__panel');
    if (panel) panel.dataset.state = 'signin';
  }

  document.addEventListener('click', (e) => {
    const opener = e.target.closest('[data-open]');
    if (opener) {
      e.preventDefault();
      const name = opener.dataset.open;
      open(name);
      return;
    }
    const appOpener = e.target.closest('[data-open-app]');
    if (appOpener) {
      e.preventDefault();
      const page = appOpener.dataset.page || 'overview';
      openApp(page);
      return;
    }
    const closer = e.target.closest('[data-close]');
    if (closer) {
      const m = closer.closest('.modal');
      if (m) close(m);
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      modals.forEach(m => { if (m.getAttribute('aria-hidden') === 'false') close(m); });
    }
  });

  // Cross-component: platform card "open module" or any other surface
  // that doesn't carry [data-open-app] can dispatch this event to open
  // the dashboard at a specific page.
  window.addEventListener('intellirity:open-app', (e) => {
    const page = (e.detail && e.detail.page) || 'overview';
    openApp(page);
  });

  // Trial
  document.getElementById('trialForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    e.target.closest('.modal__panel').dataset.state = 'success';
  });
  // Contact
  document.getElementById('contactForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    e.target.closest('.modal__panel').dataset.state = 'success';
  });

  // Auth tab switcher
  const switcher = document.getElementById('authSwitch');
  if (switcher) {
    switcher.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.authTab;
        switcher.querySelectorAll('button').forEach(b => b.classList.toggle('is-active', b === btn));
        const panel = document.getElementById('modal-auth').querySelector('.modal__panel');
        panel.dataset.state = tab;
        document.querySelectorAll('[data-auth-pane]').forEach(p => {
          p.hidden = p.dataset.authPane !== tab;
        });
      });
    });
    document.querySelectorAll('[data-auth-tab]').forEach(b => {
      b.addEventListener('click', () => {
        const t = b.dataset.authTab;
        switcher.querySelector(`[data-auth-tab="${t}"]`)?.click();
      });
    });
  }

  // Auth submit -> open app
  document.querySelectorAll('.auth__form').forEach(f => {
    f.addEventListener('submit', (e) => {
      e.preventDefault();
      document.querySelectorAll('.modal').forEach(m => close(m));
      openApp();
    });
  });
}