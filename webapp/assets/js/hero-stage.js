/* =========================================================
   hero-stage.js : control-plane hero v3 (final polish)
   Editorial restraint: graphite, hairlines, tabular mono.
   No solar-system, no neon: reads as infrastructure.
   ========================================================= */
export function initHeroStage(_canvas) {
  const stage = document.getElementById('heroStage');
  if (!stage) return;
  const c = stage.querySelector('canvas');
  if (c) c.style.display = 'none';
  stage.style.background = 'var(--bg-1)';

  // --- HUD typography: tighten to mono 500 ---
  const old = document.getElementById('hero-hud-polish');
  if (old) old.remove();
  const s = document.createElement('style');
  s.id = 'hero-hud-polish';
  s.textContent = `
    .hero__stage .hud{
      font-family: var(--f-mono);
      font-size: 10px;
      font-weight: 500;
      letter-spacing: 0.11em;
      text-transform: uppercase;
      color: var(--fg-3);
      padding: 6px 9px;
      gap: 7px;
      border-radius: 4px;
      line-height: 1;
      backdrop-filter: blur(10px);
    }
    .hero__stage .hud b{ color: var(--fg-0); font-weight:500; letter-spacing:0.04em; font-variant-numeric: tabular-nums; }
    .hero__stage .hud .dot{ width:5px; height:5px; flex:0 0 5px; }
    .hero__illust{ will-change: transform; }
  `;
  document.head.appendChild(s);

  // remove previous illustration if hot-reloaded
  const prev = stage.querySelector('.hero__illust');
  if (prev) prev.remove();

  const wrap = document.createElement('div');
  wrap.className = 'hero__illust';
  wrap.innerHTML = `
    <svg viewBox="0 0 560 560" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <defs>
        <pattern id="gDot" width="26" height="26" patternUnits="userSpaceOnUse">
          <circle cx="0.5" cy="0.5" r="0.7" fill="rgba(255,255,255,0.07)"/>
        </pattern>
        <radialGradient id="softGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0" stop-color="rgba(125,138,160,0.11)"/>
          <stop offset="1" stop-color="rgba(125,138,160,0)"/>
        </radialGradient>
        <style>
          .flow{ stroke-dasharray: 7 11; animation: dash 2.2s linear infinite; }
          .flow--slow{ animation-duration: 3s; }
          .incision{ stroke-dasharray: 5 9; animation: dash 1.1s linear infinite; }
          @keyframes dash{ to{ stroke-dashoffset:-32; } }
          .sweep{ animation: sweep 5.8s cubic-bezier(0.16,1,0.3,1) infinite; }
          @keyframes sweep{ 0%{ transform:translateX(-140px); opacity:0 } 10%{opacity:1} 82%{opacity:1} 100%{ transform:translateX(420px); opacity:0 } }
          .pkt{ animation: pkt 3.2s linear infinite; }
          .pkt--2{ animation-delay:1.05s } .pkt--3{ animation-delay:2.1s }
          @keyframes pkt{ 0%{ transform:translateX(0); opacity:0 } 12%{opacity:0.9} 88%{opacity:0.9} 100%{ transform:translateX(172px); opacity:0 } }
          @media(prefers-reduced-motion:reduce){ .flow,.incision,.sweep,.pkt{ animation:none !important } }
        </style>
      </defs>

      <!-- frame: 8px, hairline, no neo -->
      <rect x="0.5" y="0.5" width="559" height="559" rx="12" fill="var(--bg-1)" stroke="rgba(255,255,255,0.06)"/>
      <rect x="0" y="0" width="560" height="560" rx="12" fill="url(#gDot)" opacity="0.9"/>
      <rect x="13" y="13" width="534" height="534" rx="10" fill="none" stroke="rgba(255,255,255,0.045)" stroke-width="1"/>

      <!-- header: mono 8.5/500, tight -->
      <g font-family="var(--f-mono)">
        <text x="28" y="33.5" font-size="8.5" font-weight="500" letter-spacing="0.16em" fill="rgba(255,255,255,0.32)">CONTROL PLANE</text>
        <text x="132" y="33.5" font-size="8.5" font-weight="400" letter-spacing="0.03em" fill="rgba(255,255,255,0.20)">v4.2 · sha 9c1e · 4192 patterns</text>
        <g transform="translate(520 29.5)">
          <circle cx="0" cy="0" r="2.8" fill="#7d8aa0"><animate attributeName="opacity" values="1;0.45;1" dur="2.6s" repeatCount="indefinite"/></circle>
          <text x="-8" y="3.2" text-anchor="end" font-size="8.5" font-weight="500" letter-spacing="0.14em" fill="#7d8aa0">LIVE</text>
        </g>
      </g>

      <!-- backbone: single hairline, cool steel flows -->
      <line x1="56" y1="268" x2="504" y2="268" stroke="rgba(255,255,255,0.055)" stroke-width="1"/>
      <line x1="98" y1="268" x2="270" y2="268" stroke="#7d8aa0" stroke-width="1.1" stroke-linecap="round" class="flow" opacity="0.85"/>
      <line x1="290" y1="268" x2="462" y2="268" stroke="#7d8aa0" stroke-width="1.1" stroke-linecap="round" class="flow flow--slow" opacity="0.78"/>
      <!-- sweep: barely there -->
      <g class="sweep" opacity="0.75">
        <line x1="140" y1="176" x2="140" y2="360" stroke="rgba(125,138,160,0.28)" stroke-width="1"/>
        <rect x="138" y="176" width="4" height="184" fill="rgba(125,138,160,0.04)"/>
      </g>
      <g fill="#c2cfde">
        <rect x="103" y="265.5" width="5" height="5" rx="1" class="pkt"/>
        <rect x="103" y="265.5" width="5" height="5" rx="1" class="pkt pkt--2"/>
        <rect x="293" y="265.5" width="5" height="5" rx="1" class="pkt pkt--3"/>
      </g>

      <!-- INGRESS -->
      <g transform="translate(56 212)">
        <rect x="0" y="0" width="144" height="110" rx="8" fill="#0f1114" stroke="rgba(255,255,255,0.085)" stroke-width="1"/>
        <rect x="0" y="0" width="144" height="26" rx="8" fill="rgba(255,255,255,0.022)"/>
        <rect x="0" y="18" width="144" height="92" fill="#0f1114"/>
        <rect x="0" y="0" width="144" height="110" rx="8" fill="none" stroke="rgba(255,255,255,0.085)"/>
        <text x="12" y="17" font-family="var(--f-mono)" font-size="8" font-weight="500" letter-spacing="0.14em" fill="rgba(255,255,255,0.32)">01 · INGRESS</text>
        <text x="12" y="47" font-family="var(--f-display)" font-size="14.5" font-weight="500" letter-spacing="-0.025em" fill="#fafaf8">API gateway</text>
        <text x="12" y="65" font-family="var(--f-mono)" font-size="10.5" font-weight="400" fill="#a8a8a3">142 req · 12 ms</text>
        <g transform="translate(12 81)">
          <rect x="0" y="0" width="120" height="15" rx="4" fill="rgba(125,138,160,0.08)" stroke="rgba(125,138,160,0.14)"/>
          <text x="7" y="10.2" font-family="var(--f-mono)" font-size="8" font-weight="500" letter-spacing="0.08em" fill="#c2cfde">ALLOW</text>
          <text x="41" y="10.2" font-family="var(--f-mono)" font-size="8" font-weight="400" fill="rgba(255,255,255,0.44)">98.2%</text>
          <circle cx="110" cy="7.5" r="2.8" fill="#5fa37a"/>
        </g>
      </g>

      <!-- SHIELD: centered, 1px cool-steel, soft glow only -->
      <g transform="translate(208 196)">
        <circle cx="72" cy="72" r="78" fill="url(#softGlow)" opacity="0.9"/>
        <rect x="0" y="0" width="144" height="138" rx="10" fill="#121417" stroke="#7d8aa0" stroke-width="1.05"/>
        <rect x="1" y="1" width="142" height="29" rx="9" fill="rgba(125,138,160,0.075)"/>
        <rect x="1" y="22" width="142" height="7" fill="#121417"/>
        <g transform="translate(12 7)" stroke="#c2cfde" stroke-width="1.1" fill="none" stroke-linejoin="round">
          <path d="M10 2.6 L17.5 6.1 V11 C17.5 14.7 14.9 17.9 10 19.4 C5.1 17.9 2.5 14.7 2.5 11 V6.1 Z"/>
          <path d="M7.2 10.6 L9.6 13 L14 8.4" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
        <text x="36" y="17.8" font-family="var(--f-mono)" font-size="8.5" font-weight="500" letter-spacing="0.13em" fill="#c2cfde">SHIELD</text>
        <text x="12" y="53" font-family="var(--f-display)" font-size="14.5" font-weight="500" letter-spacing="-0.025em" fill="#fafaf8">Control plane</text>
        <text x="12" y="71" font-family="var(--f-mono)" font-size="10" font-weight="400" fill="#a8a8a3">policy v4.2 · enforced</text>
        <g transform="translate(12 88)">
          <rect x="0" y="0" width="120" height="20" rx="6" fill="rgba(125,138,160,0.105)" stroke="rgba(125,138,160,0.16)"/>
          <text x="8" y="13.2" font-family="var(--f-mono)" font-size="8.5" font-weight="500" letter-spacing="0.09em" fill="#fafaf8">BLOCK</text>
          <text x="46" y="13.2" font-family="var(--f-mono)" font-size="8" font-weight="400" fill="rgba(255,255,255,0.48)">injection · 0.04 ms</text>
          <circle cx="108.5" cy="10" r="2.8" fill="#c95a4f"/>
        </g>
        <text x="12" y="124" font-family="var(--f-mono)" font-size="7.5" font-weight="500" letter-spacing="0.12em" fill="rgba(255,255,255,0.24)">8 MODULES · 4192 PATTERNS</text>
      </g>

      <!-- blocked vector: thin, single -->
      <g opacity="0.92">
        <line x1="294" y1="101" x2="252" y2="196" stroke="#c95a4f" stroke-width="1" class="incision" stroke-linecap="round"/>
        <g transform="translate(294 88)">
          <rect x="-30" y="-8.5" width="60" height="15" rx="4" fill="#1a1011" stroke="rgba(201,90,79,0.30)"/>
          <text x="0" y="0.8" text-anchor="middle" font-family="var(--f-mono)" font-size="7.5" font-weight="500" letter-spacing="0.10em" fill="#e8a89e">BLOCKED</text>
        </g>
        <circle cx="252" cy="196" r="2.6" fill="#c95a4f" stroke="rgba(255,255,255,0.88)" stroke-width="0.9"/>
      </g>

      <!-- MODEL -->
      <g transform="translate(360 212)">
        <rect x="0" y="0" width="144" height="110" rx="8" fill="#0f1114" stroke="rgba(255,255,255,0.085)" stroke-width="1"/>
        <rect x="0" y="0" width="144" height="26" rx="8" fill="rgba(255,255,255,0.022)"/>
        <rect x="0" y="18" width="144" height="92" fill="#0f1114"/>
        <rect x="0" y="0" width="144" height="110" rx="8" fill="none" stroke="rgba(255,255,255,0.085)"/>
        <text x="12" y="17" font-family="var(--f-mono)" font-size="8" font-weight="500" letter-spacing="0.14em" fill="rgba(255,255,255,0.32)">02 · MODEL</text>
        <text x="12" y="47" font-family="var(--f-display)" font-size="14.5" font-weight="500" letter-spacing="-0.025em" fill="#fafaf8">gpt-prod-01</text>
        <text x="12" y="65" font-family="var(--f-mono)" font-size="10.5" font-weight="400" fill="#a8a8a3">guarded · p99 38 ms</text>
        <g transform="translate(12 81)">
          <rect x="0" y="0" width="120" height="15" rx="4" fill="rgba(95,163,122,0.09)" stroke="rgba(95,163,122,0.20)"/>
          <text x="7" y="10.2" font-family="var(--f-mono)" font-size="8" font-weight="500" letter-spacing="0.08em" fill="#a8d4b6">HEALTHY</text>
          <text x="53" y="10.2" font-family="var(--f-mono)" font-size="8" font-weight="400" fill="rgba(255,255,255,0.44)">99.99%</text>
          <circle cx="110" cy="7.5" r="2.8" fill="#5fa37a"/>
        </g>
      </g>

      <!-- ledger: dense mono, tabular -->
      <g transform="translate(56 360)">
        <rect x="0" y="0" width="448" height="32" rx="8" fill="rgba(255,255,255,0.018)" stroke="rgba(255,255,255,0.055)"/>
        <text x="12" y="12.5" font-family="var(--f-mono)" font-size="7.5" font-weight="500" letter-spacing="0.14em" fill="rgba(255,255,255,0.30)">LEDGER</text>
        <text x="12" y="23.5" font-family="var(--f-mono)" font-size="9.5" font-weight="500" fill="rgba(255,255,255,0.78)" letter-spacing="0.02em">a91f2c · approve_refund · sealed</text>
        <text x="436" y="12.5" text-anchor="end" font-family="var(--f-mono)" font-size="7.5" font-weight="500" letter-spacing="0.08em" fill="#7d8aa0">8/8</text>
        <text x="436" y="23.5" text-anchor="end" font-family="var(--f-mono)" font-size="8.5" font-weight="400" fill="rgba(255,255,255,0.38)">immutable</text>
      </g>

      <!-- footer -->
      <g font-family="var(--f-mono)">
        <text x="28" y="542" font-size="8" font-weight="400" letter-spacing="0.08em" fill="rgba(255,255,255,0.22)">v4.2 · sha 9c1e · 4192 patterns</text>
        <text x="532" y="542" text-anchor="end" font-size="8" font-weight="500" letter-spacing="0.08em" fill="#5fa37a">8/8 healthy</text>
      </g>
    </svg>
  `;
  const el = stage.querySelector('canvas');
  if (el) stage.insertBefore(wrap, el.nextSibling); else stage.appendChild(wrap);
  // Soft entrance: fade + tiny rise on first paint.
  wrap.style.opacity = '0';
  wrap.style.transform = 'translateY(6px)';
  requestAnimationFrame(() => {
    wrap.style.transition = 'opacity 700ms var(--ease), transform 700ms var(--ease)';
    wrap.style.opacity = '1';
    wrap.style.transform = 'translateY(0)';
  });

  let mx=0,my=0,tx=0,ty=0,raf=null;
  function tick(){ mx+=(tx-mx)*0.05; my+=(ty-my)*0.05; const base=wrap.dataset.base||''; wrap.style.transform=`translate(${mx*1.8}px, ${(parseFloat(wrap.dataset.y||'0'))+my*1.4}px)`; if(Math.abs(tx-mx)>0.004||Math.abs(ty-my)>0.004) raf=requestAnimationFrame(tick); else raf=null; }
  stage.addEventListener('pointermove', e=>{ const r=stage.getBoundingClientRect(); tx=((e.clientX-r.left)/r.width-0.5)*2; ty=((e.clientY-r.top)/r.height-0.5)*2; if(!raf) raf=requestAnimationFrame(tick); });
  stage.addEventListener('pointerleave', ()=>{ tx=0; ty=0; if(!raf) raf=requestAnimationFrame(tick); });
}
