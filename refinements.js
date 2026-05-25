/* =========================================================
   REFINEMENTS — Chalmers Hockey Sponsor Site
   Handles: 4-way mockup toggle, hotspot bindings,
            Tweaks panel (jersey style / hero layout / calc style)
   ========================================================= */

(function () {
  'use strict';

  /* ---------- Tweakable defaults (host-persistable) ---------- */
  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
    "jerseyStyle": "photo",
    "heroLayout": "editorial",
    "heroMedia": "subtle",
    "heroPlayer": "default",
    "videoFont": "display",
    "meriterLayout": "split",
    "calcStyle": "default",
    "pulseHotspots": true
  }/*EDITMODE-END*/;

  let tweaks = { ...TWEAK_DEFAULTS };

  /* ---------- 4-way mockup toggle ---------- */

  function setupMockupToggle() {
    const stage = document.querySelector('.jersey-stage');
    if (!stage) return;

    const toggle = stage.querySelector('.jersey-toggle');
    const strip  = stage.querySelector('.mockup-strip');
    const mockups = stage.querySelectorAll('.jersey-photo-mockup');

    function selectView(view) {
      // toggle buttons
      toggle && toggle.querySelectorAll('button').forEach(b => {
        const isActive = b.dataset.view === view;
        b.classList.toggle('active', isActive);
        b.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });
      // strip thumbnails
      strip && strip.querySelectorAll('.strip-thumb').forEach(t => {
        t.classList.toggle('active', t.dataset.view === view);
      });
      // mockups
      mockups.forEach(m => {
        const match = m.dataset.mockup === view;
        m.classList.toggle('active', match);
        if (match) m.removeAttribute('hidden');
        else m.setAttribute('hidden', '');
      });
    }

    toggle && toggle.addEventListener('click', e => {
      const btn = e.target.closest('button[data-view]');
      if (!btn) return;
      selectView(btn.dataset.view);
    });
    strip && strip.addEventListener('click', e => {
      const t = e.target.closest('.strip-thumb[data-view]');
      if (!t) return;
      selectView(t.dataset.view);
    });
  }

  /* ---------- Hotspot bindings ---------- */
  /* main.js already wires .hotspot via querySelectorAll('.hotspot, .zone')
     at the bottom of its script. Since our hotspots are in HTML at load time,
     they get bound automatically. No re-binding needed here. */
  function rebindHotspots() { /* intentionally empty — kept for API stability */ }

  /* Patch: main.js binds only on first DOMContentLoaded, but it uses inline `function showTooltip()`
     declarations which DO leak to global scope, so we can just rely on them. */

  /* ---------- Apply tweak values to DOM ---------- */

  function applyTweaks() {
    const hero = document.querySelector('.hero');
    const stage = document.querySelector('.jersey-stage');
    const calc = document.querySelector('.calc-section');
    const videos = document.querySelector('.videos-section');
    const support = document.querySelector('.support-section');

    if (hero) {
      hero.setAttribute('data-hero-layout', tweaks.heroLayout);
      hero.setAttribute('data-hero-media', tweaks.heroMedia);
      hero.setAttribute('data-hero-player', tweaks.heroPlayer);
    }
    if (stage) {
      stage.setAttribute('data-jersey-style', tweaks.jerseyStyle);
    }
    if (calc) {
      calc.setAttribute('data-calc-style', tweaks.calcStyle);
    }
    if (videos) {
      videos.setAttribute('data-video-font', tweaks.videoFont);
    }
    if (support) {
      support.setAttribute('data-meriter-layout', tweaks.meriterLayout);
    }
    document.documentElement.style.setProperty(
      '--hotspot-pulse-state',
      tweaks.pulseHotspots ? 'running' : 'paused'
    );
    document.querySelectorAll('.hotspot.free').forEach(h => {
      h.style.animationPlayState = tweaks.pulseHotspots ? 'running' : 'paused';
    });
  }

  /* ---------- Persist tweaks via host ---------- */

  function persistTweaks(patch) {
    Object.assign(tweaks, patch);
    applyTweaks();
    try {
      window.parent.postMessage(
        { type: '__edit_mode_set_keys', edits: patch },
        '*'
      );
    } catch (_) {}
  }

  /* ---------- Tweaks panel ---------- */

  function buildTweaksPanel() {
    if (document.getElementById('tweaks-panel')) return;

    const panel = document.createElement('div');
    panel.id = 'tweaks-panel';
    panel.className = 'tweaks-panel tweaks-panel--hidden';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Tweaks');
    panel.innerHTML = `
      <div class="tweaks-head">
        <div class="tweaks-title"><span class="dot"></span>Tweaks</div>
        <button class="tweaks-close" type="button" aria-label="Stäng">✕</button>
      </div>
      <div class="tweaks-body">

        <div class="tweak-group">
          <div class="tweak-section-label">Matchställe-mockup</div>
          <div class="tweak-segmented" data-key="jerseyStyle">
            <button data-val="photo">Foto</button>
            <button data-val="schematic">Schema</button>
            <button data-val="minimal">Minimal</button>
          </div>
          <div class="tweak-hint">Foto = real-photo mockup. Schema = dämpat raster. Minimal = bara hotspot-konturer.</div>
        </div>

        <div class="tweak-group">
          <div class="tweak-section-label">Hero-layout</div>
          <div class="tweak-segmented" data-key="heroLayout">
            <button data-val="editorial">Editorial</button>
            <button data-val="centered">Centrerad</button>
            <button data-val="stadium">Stadion</button>
          </div>
          <div class="tweak-hint">Editorial = nuvarande (text vänster, spelare höger). Stadion = full-bleed bakgrund.</div>
        </div>

        <div class="tweak-group">
          <div class="tweak-section-label">Spelar-placering</div>
          <div class="tweak-segmented" data-key="heroPlayer">
            <button data-val="default">Standard</button>
            <button data-val="up-right">Upp/höger</button>
            <button data-val="big">Stor</button>
            <button data-val="left">Vänster</button>
          </div>
        </div>

        <div class="tweak-group">
          <div class="tweak-section-label">Hero-bakgrund</div>
          <div class="tweak-segmented" data-key="heroMedia">
            <button data-val="subtle">Subtilt</button>
            <button data-val="pyro">Pyro</button>
            <button data-val="clean">Inget</button>
          </div>
        </div>

        <div class="tweak-group">
          <div class="tweak-section-label">Video-typsnitt</div>
          <div class="tweak-segmented" data-key="videoFont">
            <button data-val="display">Display</button>
            <button data-val="serif">Italic</button>
            <button data-val="mono">Mono</button>
          </div>
        </div>

        <div class="tweak-group">
          <div class="tweak-section-label">Meriter-layout</div>
          <div class="tweak-segmented" data-key="meriterLayout">
            <button data-val="split">Split</button>
            <button data-val="stacked">Stacked</button>
            <button data-val="stats-first">Stats</button>
          </div>
        </div>

        <div class="tweak-group">
          <div class="tweak-section-label">Kalkylator-stil</div>
          <div class="tweak-segmented" data-key="calcStyle">
            <button data-val="default">Standard</button>
            <button data-val="card">Kort</button>
            <button data-val="compact">Kompakt</button>
          </div>
        </div>

        <div class="tweak-group">
          <div class="tweak-toggle">
            <span class="tweak-toggle-label">Pulserande hotspots</span>
            <div class="tweak-switch" role="switch" tabindex="0" data-key="pulseHotspots" aria-checked="true"></div>
          </div>
        </div>

      </div>
    `;
    document.body.appendChild(panel);

    // Wire close
    panel.querySelector('.tweaks-close').addEventListener('click', () => {
      hidePanel();
      try {
        window.parent.postMessage({ type: '__edit_mode_dismissed' }, '*');
      } catch (_) {}
    });

    // Wire segmented controls
    panel.querySelectorAll('.tweak-segmented').forEach(grp => {
      const key = grp.dataset.key;
      grp.addEventListener('click', e => {
        const b = e.target.closest('button[data-val]');
        if (!b) return;
        const val = b.dataset.val;
        grp.querySelectorAll('button').forEach(bb =>
          bb.classList.toggle('active', bb === b)
        );
        persistTweaks({ [key]: val });
      });
    });

    // Wire toggle switches
    panel.querySelectorAll('.tweak-switch').forEach(sw => {
      const key = sw.dataset.key;
      function toggle() {
        const next = sw.getAttribute('aria-checked') !== 'true';
        sw.setAttribute('aria-checked', next ? 'true' : 'false');
        persistTweaks({ [key]: next });
      }
      sw.addEventListener('click', toggle);
      sw.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggle();
        }
      });
    });

    syncPanelToTweaks(panel);
  }

  function syncPanelToTweaks(panel) {
    panel = panel || document.getElementById('tweaks-panel');
    if (!panel) return;
    panel.querySelectorAll('.tweak-segmented').forEach(grp => {
      const key = grp.dataset.key;
      grp.querySelectorAll('button').forEach(b => {
        b.classList.toggle('active', b.dataset.val === tweaks[key]);
      });
    });
    panel.querySelectorAll('.tweak-switch').forEach(sw => {
      const key = sw.dataset.key;
      sw.setAttribute('aria-checked', tweaks[key] ? 'true' : 'false');
    });
  }

  function showPanel() {
    buildTweaksPanel();
    document.getElementById('tweaks-panel').classList.remove('tweaks-panel--hidden');
  }
  function hidePanel() {
    const p = document.getElementById('tweaks-panel');
    if (p) p.classList.add('tweaks-panel--hidden');
  }

  /* ---------- Host edit-mode protocol ---------- */

  window.addEventListener('message', e => {
    const d = e.data || {};
    if (d.type === '__activate_edit_mode') showPanel();
    else if (d.type === '__deactivate_edit_mode') hidePanel();
  });

  /* ---------- Init ---------- */

  /* ---------- Zone photo injection into modal ---------- */
  // The Zon D position is removed from visible mockups (already booked) and
  // doesn't have a context photo — fall back to a styled banner if anyone
  // somehow opens it. Everything else gets a real-world photo from /assets/zones/.
  const ZONE_PHOTOS = {
    pos_A: 'assets/zones/A.png',
    pos_B: 'assets/zones/B.png',
    pos_C: 'assets/zones/C.png',
    pos_D: 'assets/zones/D.png',
    pos_E: 'assets/zones/E.png',
    pos_F: 'assets/zones/F.png',
    pos_H: 'assets/zones/H.png',
    pos_X: 'assets/zones/X.png',
  };

  function injectZonePhoto(posId) {
    const modalContent = document.getElementById('modal-content');
    if (!modalContent) return;
    const src = ZONE_PHOTOS[posId];
    // Build a hero strip at top
    const wrap = document.createElement('div');
    wrap.className = 'zone-photo-hero';
    if (src) {
      wrap.innerHTML = `
        <img src="${src}" alt="Verklig placering av zon" loading="eager">
      `;
    } else {
      wrap.classList.add('zone-photo-hero--fallback');
      wrap.innerHTML = `
        <div class="zone-fallback-icon">📸</div>
        <div class="zone-fallback-text">Foto från bakvy<br><small>kontakta oss för referensbild</small></div>
      `;
    }
    // Prepend
    modalContent.insertBefore(wrap, modalContent.firstChild);
  }

  function wrapOpenModal() {
    const orig = window.openModalForPosition;
    if (typeof orig !== 'function') {
      // not yet defined — retry shortly
      setTimeout(wrapOpenModal, 100);
      return;
    }
    if (orig.__refWrapped) return;
    window.openModalForPosition = function (posId) {
      orig.call(this, posId);
      injectZonePhoto(posId);
    };
    window.openModalForPosition.__refWrapped = true;
  }

  function init() {
    setupMockupToggle();
    rebindHotspots();
    applyTweaks();
    wrapOpenModal();
    // Announce edit-mode availability so the toolbar exposes Tweaks toggle
    try {
      window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    } catch (_) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
