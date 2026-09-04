/* =========================================================
   pricing.js — monthly/annual toggle + enterprise builder
   ========================================================= */

const ADDONS = [
  { id: 'extra-models', title: '25 Extra Models', desc: 'Add 25 more protected models.', price: 1500 },
  { id: 'behavioral',   title: 'Behavioral Analytics', desc: 'Drift & anomaly detection suite.', price: 800 },
  { id: 'alerts',       title: 'Webhook + Slack Alerts', desc: 'Route alerts to your tools.', price: 400 },
  { id: 'retention',    title: '90-Day Retention', desc: 'Extended event history.', price: 600 },
  { id: 'audit',        title: 'Audit Log Export', desc: 'Export events for compliance.', price: 500 },
  { id: 'support',      title: 'Priority Support', desc: 'Faster response SLA.', price: 700 }
];

export function initPricing() {
  // Toggle
  const toggle = document.getElementById('billingToggle');
  if (toggle) {
    toggle.querySelectorAll('.billing-toggle__opt').forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.billing;
        toggle.dataset.billing = mode;
        toggle.querySelectorAll('.billing-toggle__opt').forEach(b => b.classList.toggle('is-active', b === btn));
        document.querySelectorAll('.plan__amount').forEach(amt => {
          const monthly = amt.dataset.monthly;
          const annual  = amt.dataset.annual;
          if (monthly && annual) {
            amt.textContent = '₹' + (mode === 'annual' ? annual : monthly);
          }
        });
      });
    });
  }

  // Build addons
  const wrap = document.getElementById('builderAddons');
  if (!wrap) return;
  wrap.innerHTML = ADDONS.map(a => `
    <label class="addon">
      <input type="checkbox" data-price="${a.price}" data-label="${a.title}" />
      <span class="addon__check"></span>
      <div class="addon__body">
        <div class="addon__title">${a.title}</div>
        <div class="addon__desc">${a.desc}</div>
      </div>
      <div class="addon__price">+₹${a.price.toLocaleString('en-IN')}/mo</div>
    </label>
  `).join('');

  const base = 999;
  const lines = document.getElementById('builderLines');
  const totalEl = document.getElementById('builderTotal');
  if (!lines || !totalEl) return;

  const inputs = wrap.querySelectorAll('input[type=checkbox]');
  function recalc() {
    let total = base;
    const items = [{ label: 'Starter base', price: base }];
    inputs.forEach(i => {
      if (i.checked) {
        total += Number(i.dataset.price);
        items.push({ label: i.dataset.label, price: Number(i.dataset.price) });
      }
    });
    lines.innerHTML = items.map(it => `<li><span>${it.label}</span><em>+₹${it.price.toLocaleString('en-IN')}</em></li>`).join('');
    totalEl.style.opacity = '0.5';
    totalEl.textContent = '₹' + total.toLocaleString('en-IN');
    requestAnimationFrame(() => { totalEl.style.opacity = '1'; });
  }
  inputs.forEach(i => i.addEventListener('change', recalc));
  recalc();

  // Toggle the builder visibility when "Configure plan" is clicked.
  // The builder is hidden by default (hidden attribute in HTML) and
  // expands inline below the pricing grid.
  const builder = document.getElementById('builder');
  const builderBtn = document.getElementById('builderToggle');
  if (builderBtn && builder) {
    builderBtn.addEventListener('click', () => {
      const opening = builder.hasAttribute('hidden');
      if (opening) {
        builder.removeAttribute('hidden');
        builderBtn.textContent = 'Hide builder';
        // Smooth-scroll the builder into view
        requestAnimationFrame(() => {
          builder.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      } else {
        builder.setAttribute('hidden', '');
        builderBtn.textContent = 'Configure plan';
      }
    });
  }
}