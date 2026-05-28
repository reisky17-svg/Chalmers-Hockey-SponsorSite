/* ============================================================
   DATA — paket, priser, räckviddsestimat
   TWEAK: justera reach-värden här
   ============================================================ */
const PACKAGES = {
  pos_A: { id:'pos_A', cat:'troja', letter:'A', name:'Byxor fram', desc:'Tydlig placering framsidan av låren. Stark visuell närvaro vid spel och i media.', price:15000, status:'taken', takenBy:'Löfbergs', until:'2027', reach:550000 },
  pos_B: { id:'pos_B', cat:'troja', letter:'B', name:'Byxor bak', desc:'Baksidan av låren. Fångar blickar vid rörelse och spelvändningar.', price:10000, status:'free', reach:480000 },
  pos_C: { id:'pos_C', cat:'troja', letter:'C', name:'Mage', desc:'Mitt på magen, längs hemmen. Mycket synlig i närbilder och intervjuer.', price:10000, status:'free', reach:500000 },
  pos_D: { id:'pos_D', cat:'troja', letter:'D', name:'Rygg', desc:'Mellan skulderbladen, ovanför nummer. Premium-läge bakifrån vid målfiranden.', price:15000, status:'taken', takenBy:'Sano Marin', until:'2027', reach:600000 },
  pos_E: { id:'pos_E', cat:'troja', letter:'E', name:'Axlar fram', desc:'Tydligt synlig på båda axlar framifrån. Ger bra exponering i närbilder och intervjuer.', price:10000, status:'taken', takenBy:'Joluca', until:'2027', reach:450000 },
  pos_F: { id:'pos_F', cat:'troja', letter:'F', name:'Bröst', desc:'Den mest synliga ytan på tröjan — högt upp på bröstet, över klubbloggan.', price:15000, status:'free', reach:600000 },
  pos_X: { id:'pos_X', cat:'troja', letter:'X', name:'Axlar', desc:'Båda axlar framifrån. Lågpris-alternativ med god exponering.', price:8000, status:'free', reach:350000 },
  pos_H: { id:'pos_H', cat:'troja', letter:'H', name:'Armar', desc:'Högt på ärmen. Synlig i rörelse, sekundär plats till låg kostnad.', price:8000, status:'free', reach:280000 },
  pos_Panna: { id:'pos_Panna', cat:'hjalm', letter:'I', name:'Hjälm panna', desc:'Placering mitt på hjälmens panna. Mycket synlig i närbilder, lagfoton och videointervjuer.', price:10000, status:'free', reach:400000 },
  pos_Sida: { id:'pos_Sida', cat:'hjalm', letter:'J', name:'Hjälm sida', desc:'Placering på hjälmens sida. Syns bra från profilen vid spel och i rinken.', price:8000, status:'free', reach:300000 },
  bas: { id:'bas', cat:'annat', name:'Baspaket', desc:'Match-posters + digital närvaro. Grunden i alla samarbeten.', price:5000, status:'free', reach:400000 },
  traning: { id:'traning', cat:'annat', name:'Träningströja', desc:'Logga stort på magen, garanterad 3-årsexponering. 45+ spelare bär den året runt.', price:20000, status:'free', reach:1200000 },
  fysisk: { id:'fysisk', cat:'annat', name:'Fysisk på match', desc:'Eget område på hemmamatch. Pris per match — direkt face-to-face med 400–650 åskådare.', price:3000, status:'free', reach:525, reachUnit:'face-to-face kontakter/match' },
  digital: { id:'digital', cat:'annat', name:'Digitalt inlägg', desc:'TikTok + Instagram. Cross-postat = dubbel räckvidd. Median TT-video säsong 25/26: 18 622 views; snitt: 45 399.', price:2500, status:'free', reach:55000, reachTT:45000, reachIG:10000 },
};

/* Marknads-CPM (Sverige, 2025-2026). Källor:
   - Instagram Ads Sverige: ~85 kr/CPM (AdAmigo.ai 2026)
   - TikTok Ads Västeuropa: ~90 kr/CPM (Megadigital 2025, snitt $10-50)
   - Meta Ads Sverige: ~102 kr/CPM (Superads.ai 2025, baserat på $3B annonsdata)
*/
const CPM_BENCH = { instagram_ads: 85, tiktok_ads: 90, meta_ads: 102 };

const state = {
  budget: 15000,
  audience: 'rekrytera',
  exposure: new Set(['matchtroja','social']),
  forcedPosition: null
};

/* ============================================================
   CALCULATOR LOGIC
   ============================================================ */
function recommend(){
  const { budget, audience, exposure, forcedPosition } = state;
  let items = [], remaining = budget, warnings = [], excluded = [];

  // 1. Baspaket — alltid med (om budget räcker)
  if (remaining >= PACKAGES.bas.price) { items.push(PACKAGES.bas); remaining -= PACKAGES.bas.price; }

  // 2. Forced position (användaren klickade en specifik zon i modalen)
  if (forcedPosition && PACKAGES[forcedPosition] && PACKAGES[forcedPosition].status === 'free') {
    const fp = PACKAGES[forcedPosition];
    if (remaining >= fp.price) { items.push(fp); remaining -= fp.price; }
    else excluded.push({ item: fp, shortfall: fp.price - remaining, kind: 'troja' });
  }

  // 3. Bygg önskelista över alla valda exponeringar, sorterad efter prioritet.
  //    Prioritet: matchtröja > träningströja > byxor > fysisk/social (multi)
  const wishlist = [];

  if (exposure.has('matchtroja') && !items.some(i => i.cat === 'troja')) {
    const free = [PACKAGES.pos_F, PACKAGES.pos_C, PACKAGES.pos_X, PACKAGES.pos_H].filter(p => p.status === 'free');
    const ranked = free.map(p => ({...p, ratio: p.reach/p.price})).sort((a,b)=>b.ratio-a.ratio);
    let pick = ((audience === 'b2b' || budget >= 15000) ? PACKAGES.pos_F : ranked[0]) || ranked[0];
    if (pick) wishlist.push({ key:'matchtroja', label:'Matchtröja', item: pick, priority: 1 });
  }

  if (exposure.has('traningstroja') && !items.some(i => i.id === 'traning')) {
    wishlist.push({ key:'traningstroja', label:'Träningströja', item: PACKAGES.traning, priority: 2 });
  }

  if (exposure.has('byxor') && !items.some(i => i.id === 'pos_B' || i.id === 'pos_A')) {
    if (PACKAGES.pos_B.status === 'free') {
      wishlist.push({ key:'byxor', label:'Byxöverdrag (Zon B)', item: PACKAGES.pos_B, priority: 3 });
    } else {
      warnings.push('Båda byxzonerna är bokade just nu — vi kan sätta er på väntelista.');
    }
  }

  if (exposure.has('hjalm') && !items.some(i => i.cat === 'hjalm')) {
    const free = [PACKAGES.pos_Panna, PACKAGES.pos_Sida].filter(p => p.status === 'free');
    if (free.length > 0) {
      wishlist.push({ key:'hjalm', label:'Hjälm', item: free[0], priority: 3.5 });
    } else {
      warnings.push('Alla hjälmplatser är bokade just nu — vi kan sätta er på väntelista.');
    }
  }

  if (exposure.has('fysisk')) {
    wishlist.push({ key:'fysisk', label:'Fysisk match-närvaro', item: PACKAGES.fysisk, priority: 4, multi: true, maxQty: 5 });
  }

  if (exposure.has('social')) {
    wishlist.push({ key:'social', label:'Digitala inlägg', item: PACKAGES.digital, priority: 5, multi: true, maxQty: 4 });
  }

  wishlist.sort((a,b) => a.priority - b.priority);

  // 4. Plocka in items i prioordning, exkludera de som inte ryms
  for (const w of wishlist) {
    if (w.multi) {
      let qty = 0;
      while (remaining >= w.item.price && qty < w.maxQty) {
        remaining -= w.item.price;
        qty++;
      }
      if (qty > 0) {
        items.push({ ...w.item, qty,
          displayName: qty === 1 ? w.item.name : `${qty}× ${w.item.name}`,
          displayPrice: w.item.price * qty });
      } else {
        excluded.push({ item: w.item, shortfall: w.item.price - remaining, kind: w.key, label: w.label, perUnit: true });
      }
    } else {
      if (remaining >= w.item.price) {
        items.push(w.item);
        remaining -= w.item.price;
      } else {
        excluded.push({ item: w.item, shortfall: w.item.price - remaining, kind: w.key, label: w.label });
      }
    }
  }

  if (items.length === 0) items.push(PACKAGES.digital);

  let totalReach = 0, totalSpend = 0;
  items.forEach(it => {
    const qty = it.qty || 1;
    totalReach += (it.reach || 0) * qty;
    totalSpend += (it.displayPrice || it.price) || 0;
  });
  const remainingBudget = Math.max(0, budget - totalSpend);

  const cpm = totalReach > 0 ? Math.round((totalSpend / totalReach) * 1000) : 0;
  let cpmClass = 'roi-good', cpmText = 'Mycket starkt';
  if (cpm > 50) { cpmClass = 'roi-good'; cpmText = 'Under marknadssnittet'; }
  if (cpm > CPM_BENCH.instagram_ads) { cpmClass = 'roi-mid'; cpmText = 'I nivå med marknaden'; }
  if (cpm > CPM_BENCH.meta_ads) { cpmClass = 'roi-poor'; cpmText = 'Över marknads-CPM'; }
  if (cpm <= 30) { cpmClass = 'roi-good'; cpmText = 'Långt under marknaden'; }

  const mult = (bench) => cpm > 0 ? (bench / cpm).toFixed(1).replace('.0','') + '×' : '—';
  const cpmCompare = {
    instagram: { label: 'Instagram Ads Sverige', value: CPM_BENCH.instagram_ads, mult: mult(CPM_BENCH.instagram_ads) },
    tiktok:    { label: 'TikTok Ads Västeuropa', value: CPM_BENCH.tiktok_ads,    mult: mult(CPM_BENCH.tiktok_ads) },
    meta:      { label: 'Meta Ads Sverige 2025', value: CPM_BENCH.meta_ads,      mult: mult(CPM_BENCH.meta_ads) },
  };

  const motivation = generateMotivation(items, audience, cpm, totalReach);
  return { items, excluded, remainingBudget, totalSpend, totalReach, cpm, cpmClass, cpmText, cpmCompare, warnings, motivation };
}

/* Motivation copy — fact-based with cited sources. */
function generateMotivation(items, audience, cpm, totalReach){
  const has = id => items.some(i=>i.id===id);
  let main = '';

  if (has('pos_F'))        main = '<strong>Bröstplatsen (Zon F)</strong> är den mest synliga ytan på tröjan — varje närbild, varje TikTok-clip, varje matchposter.';
  else if (has('pos_Panna')) main = '<strong>Hjälm panna (Zon I)</strong> ger fantastisk exponering i närbilder, lagfoton och i allt rörligt material vi skapar.';
  else if (has('traning')) main = '<strong>Träningströjan</strong> bärs av 45+ blivande ingenjörer året runt — garanterad 3-årsexponering till en av matchpaketets lägsta CPM.';
  else if (has('digital')) {
    const qty = items.find(i=>i.id==='digital').qty || 1;
    main = `<strong>${qty} digitalt inlägg</strong> cross-postas på TikTok och Instagram — samma klipp, dubbel räckvidd.`;
  }
  else if (has('fysisk'))  main = '<strong>Fysisk match-närvaro</strong> ger direkt face-to-face med 400–650 åskådare per match. Kvalitet, inte volym.';
  else                     main = '<strong>Baspaketet</strong> ger närvaro i samtliga digitala kanaler (Instagram och TikTok) och på matchposters på campus, med en räckvidd på ~400 000 impressions per säsong.';

  let cpmLine = '';
  if (cpm > 0 && cpm <= 30) {
    const ratio = Math.round(CPM_BENCH.meta_ads / cpm);
    cpmLine = `Er CPM landar på <strong>${cpm} kr</strong> — ungefär <strong>${ratio}×</strong> lägre än Meta Ads-snittet i Sverige (102 kr, källa: AdAmigo.ai 2026). Och då räknar vi inte med sponsorkontexten — ni associeras med ett studentlag, inte en skippbar annons.`;
  } else if (cpm > 0 && cpm < CPM_BENCH.instagram_ads) {
    cpmLine = `Er CPM <strong>${cpm} kr</strong> är under Instagram Ads-snittet på 85 kr (källa: AdAmigo.ai 2026) — plus att ni får sponsorkontext istället för en betald annons.`;
  } else if (cpm > 0) {
    cpmLine = `Ni betalar för sponsorkontext och association med ett studentlag — inte bara views. Räckvidden bygger på faktisk TikTok- och Instagram-data från säsongen 25/26.`;
  }

  return `${main} ${cpmLine}`;
}

/* ============================================================
   RENDER RESULT
   ============================================================ */
function renderResult(flash=true){
  const r = recommend();
  const el = document.getElementById('calc-result');

  const itemsHtml = r.items.map(it => {
    const name = it.displayName || it.name;
    const price = it.displayPrice || it.price;
    const qty = it.qty || 1;
    const reachTotal = (it.reach || 0) * qty;
    return `<li>
      <div class="name"><strong>${name}</strong><span>~${reachTotal.toLocaleString('sv-SE')} ${it.reachUnit || 'impressions'}</span></div>
      <div class="price">${price.toLocaleString('sv-SE')} kr</div>
    </li>`;
  }).join('');

  const warningHtml = r.warnings.length
    ? r.warnings.map(w=>`<div class="warning-flag"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>${w}</div>`).join('')
    : '';

  const reachDisplay = r.totalReach >= 1000000 ? (r.totalReach/1000000).toFixed(1) + ' M' : r.totalReach.toLocaleString('sv-SE');

  // Build excluded HTML
  const excludedHtml = r.excluded.length ? `
    <div class="excluded-block">
      <div class="excluded-eyebrow">Ej inkluderat (kräver högre budget)</div>
      <ul class="excluded-list">
        ${r.excluded.map(ex => {
          const lbl = ex.label || ex.item.name;
          const detail = ex.perUnit
            ? `+${ex.item.price.toLocaleString('sv-SE')} kr per ${ex.kind === 'social' ? 'inlägg' : 'match'} för att lägga till`
            : `+${ex.shortfall.toLocaleString('sv-SE')} kr för att lägga till`;
          return `<li><span class="ex-name">${lbl}</span><span class="ex-detail">${detail}</span></li>`;
        }).join('')}
      </ul>
      <a href="#custom-package" class="excluded-cta">Diskutera skräddarsytt paket →</a>
    </div>
  ` : '';

  // Remaining budget hint (only when something is left and nothing's excluded)
  const remainingHtml = (r.remainingBudget > 0 && r.excluded.length === 0)
    ? `<div class="budget-remaining">
        <span class="br-label">Kvar i budget:</span>
        <span class="br-value tnum">${r.remainingBudget.toLocaleString('sv-SE')} kr</span>
        <span class="br-hint">Lägg till fler digitala inlägg, eller hör av er för anpassat paket.</span>
      </div>`
    : '';

  el.innerHTML = `
    <div class="result-header">
      <h3>Rekommenderat paket</h3>
      <div class="result-price">
        <div class="amount tnum">${r.totalSpend.toLocaleString('sv-SE')}</div>
        <div class="per">kr / år</div>
      </div>
    </div>
    ${warningHtml}
    <ul class="result-items">${itemsHtml}</ul>
    ${excludedHtml}
    ${remainingHtml}
    <div class="kpi-row">
      <div class="kpi">
        <div class="label">Räckvidd</div>
        <div class="value tnum">${reachDisplay}</div>
        <div class="sub">impressions / säsong</div>
      </div>
      <div class="kpi ${r.cpmClass}" title="Uträkning: ${r.totalSpend.toLocaleString('sv-SE')} kr ÷ ${r.totalReach.toLocaleString('sv-SE')} impressions × 1 000 = ${r.cpm} kr CPM">
        <div class="label"><span class="dot ${r.cpmClass==='roi-good'?'green':r.cpmClass==='roi-mid'?'amber':'red'}"></span>CPM</div>
        <div class="value tnum">${r.cpm} kr</div>
        <div class="sub">${r.cpmText}</div>
      </div>
    </div>
    <div class="cpm-compare">
      <div class="cpm-compare-header">
        <div class="cpm-compare-eyebrow">Er CPM mot marknaden</div>
        <div class="cpm-compare-ours"><span class="tnum">${r.cpm}</span> kr</div>
      </div>
      <ul class="cpm-compare-rows">
        <li><span class="ccr-label">${r.cpmCompare.instagram.label}</span><span class="ccr-value tnum">${r.cpmCompare.instagram.value} kr</span><span class="ccr-mult">${r.cpmCompare.instagram.mult} dyrare</span></li>
        <li><span class="ccr-label">${r.cpmCompare.tiktok.label}</span><span class="ccr-value tnum">${r.cpmCompare.tiktok.value} kr</span><span class="ccr-mult">${r.cpmCompare.tiktok.mult} dyrare</span></li>
        <li><span class="ccr-label">${r.cpmCompare.meta.label}</span><span class="ccr-value tnum">${r.cpmCompare.meta.value} kr</span><span class="ccr-mult">${r.cpmCompare.meta.mult} dyrare</span></li>
      </ul>
      <div class="cpm-compare-foot">
        Ni betalar för sponsorkontext på ett studentlag — inte en skippbar annons.
      </div>
    </div>
    <div class="motivation">${r.motivation}</div>
    <div class="result-sources">
      Källor: <strong>räckvidd</strong> — TikTok Analytics + Instagram Insights, säsong 25/26 (1 jan 2025 – 20 maj 2026). <strong>Marknads-CPM</strong> — AdAmigo.ai (Meta Ads benchmarks Sverige 2026, ~85 kr Instagram), Superads.ai ($3B annonsdata, ~102 kr Meta), Megadigital (TikTok Västeuropa $10–50 CPM ≈ 90 kr).
    </div>
    <button class="btn-primary" style="width:100%;justify-content:center" onclick="openContactModal('calculator')">Hör av dig med detta paket →</button>
  `;

  if (flash) {
    el.classList.remove('flash');
    void el.offsetWidth;
    el.classList.add('flash');
  }
}

/* ============================================================
   FORM HANDLERS
   ============================================================ */
document.getElementById('budget-grid').addEventListener('click', e=>{
  if (!e.target.matches('.budget-btn')) return;
  document.querySelectorAll('.budget-btn').forEach(b=>b.classList.remove('active'));
  e.target.classList.add('active');
  state.budget = +e.target.dataset.budget;
  state.forcedPosition = null;
  renderResult();
});
document.getElementById('audience-select').addEventListener('change', e=>{
  state.audience = e.target.value;
  const hint = document.getElementById('goal-custom-hint');
  if (hint) {
    if (state.audience === 'annat') {
      hint.hidden = false;
      // Subtle pulse highlight on the custom-package callout
      const cp = document.getElementById('custom-package');
      if (cp) {
        cp.classList.remove('highlight-pulse');
        void cp.offsetWidth;
        cp.classList.add('highlight-pulse');
      }
    } else {
      hint.hidden = true;
    }
  }
  renderResult();
});
document.getElementById('exposure-chips').addEventListener('click', e=>{
  const chip = e.target.closest('.chip');
  if (!chip) return;
  const exp = chip.dataset.exp;
  if (state.exposure.has(exp)) { state.exposure.delete(exp); chip.classList.remove('active'); }
  else { state.exposure.add(exp); chip.classList.add('active'); }
  renderResult();
});
// Defer initial calculator render until section scrolls into view
(function(){
  const calcEl = document.querySelector('#calc');
  if (!calcEl) { setTimeout(() => renderResult(false), 0); return; }
  const obs = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) { renderResult(false); obs.disconnect(); }
  }, { rootMargin: '200px' });
  obs.observe(calcEl);
})();

/* ============================================================
   HOTSPOTS + TOOLTIP + MODAL
   ============================================================ */
const tooltip = document.getElementById('zone-tooltip');
function showTooltip(e, pos){
  const p = PACKAGES[pos]; if (!p) return;
  const statusClass = p.status === 'free' ? 'free' : 'taken';
  const statusText = p.status === 'free' ? 'Ledig 26/27' : `Bokad av ${p.takenBy} t.o.m. ${p.until}`;
  tooltip.innerHTML = `
    <div class="tt-title">${p.letter} — ${p.name}</div>
    <div class="tt-price">${p.price.toLocaleString('sv-SE')} kr / år</div>
    <div class="tt-status ${statusClass}">${statusText}</div>
    ${p.status === 'free' ? '<div class="tt-hint">Klicka för detaljer</div>' : ''}
  `;
  tooltip.classList.add('show');
  positionTooltip(e);
}
function positionTooltip(e){
  const rect = tooltip.getBoundingClientRect();
  let x = e.clientX + 16, y = e.clientY + 16;
  if (x + rect.width > window.innerWidth - 10) x = e.clientX - rect.width - 16;
  if (y + rect.height > window.innerHeight - 10) y = e.clientY - rect.height - 16;
  tooltip.style.left = x + 'px';
  tooltip.style.top = y + 'px';
}
function hideTooltip(){ tooltip.classList.remove('show'); }

// Defer hotspot/zone binding until jersey section scrolls into view
(function(){
  function bindHotspots() {
    document.querySelectorAll('.hotspot, .zone').forEach(hot => {
      hot.addEventListener('mouseenter', e => showTooltip(e, hot.dataset.pos));
      hot.addEventListener('mousemove', positionTooltip);
      hot.addEventListener('mouseleave', hideTooltip);
      hot.addEventListener('click', () => openModalForPosition(hot.dataset.pos));
      hot.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openModalForPosition(hot.dataset.pos);
        }
      });
    });
  }
  const jerseyEl = document.querySelector('#paket');
  if (!jerseyEl) { bindHotspots(); return; }
  const obs = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) { bindHotspots(); obs.disconnect(); }
  }, { rootMargin: '200px' });
  obs.observe(jerseyEl);
})();

// Front/Back toggle för matchtröjan — neutered; refinements.js owns this now
const jerseyToggle = null;

const modalBackdrop = document.getElementById('modal-backdrop');
const modalContent = document.getElementById('modal-content');
function openModalForPosition(posId){
  const p = PACKAGES[posId]; if (!p) return;
  hideTooltip();
  if (p.status === 'free') {
    openContactModal('zone', posId);
    return;
  } else {
    modalContent.innerHTML = `
      <div class="modal-eyebrow">Bokad position</div>
      <h3>${p.letter} — ${p.name}</h3>
      <div class="modal-price">${p.price.toLocaleString('sv-SE')} kr / år</div>
      <div class="modal-taken-info">
        Bokad av <strong>${p.takenBy}</strong> med kontrakt t.o.m. <strong>${p.until}</strong>.
      </div>
      <p class="modal-desc">${p.desc}</p>
      <div class="modal-actions">
        <a href="mailto:chalmershockey@gmail.com?subject=Väntelista%20för%20${encodeURIComponent(p.name)}" class="btn-primary">Sätt mig på väntelista</a>
        <button class="btn-ghost" onclick="closeModal()">Stäng</button>
      </div>`;
  }
  modalBackdrop.classList.add('show');
  document.body.style.overflow = 'hidden';
}
function closeModal(){
  modalBackdrop.classList.remove('show');
  document.body.style.overflow = '';
}
document.getElementById('modal-close').addEventListener('click', closeModal);
modalBackdrop.addEventListener('click', e => { if (e.target === modalBackdrop) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && modalBackdrop.classList.contains('show')) closeModal(); });

function addToBudgetAndScroll(posId){
  const p = PACKAGES[posId];
  if (!p || p.status !== 'free') return;
  const target = p.price + 5000;
  const budgets = [5000, 10000, 15000, 20000, 30000];
  const matchedBudget = budgets.find(b => b >= target) || 30000;
  state.budget = matchedBudget;
  document.querySelectorAll('.budget-btn').forEach(b => b.classList.toggle('active', +b.dataset.budget === matchedBudget));
  state.forcedPosition = posId;
  
  if (p.cat === 'hjalm') {
    state.exposure.add('hjalm');
  } else if (p.id === 'pos_A' || p.id === 'pos_B') {
    state.exposure.add('byxor');
  } else if (p.cat === 'troja') {
    state.exposure.add('matchtroja');
  }
  
  document.querySelectorAll('.chip').forEach(c => c.classList.toggle('active', state.exposure.has(c.dataset.exp)));
  closeModal();
  document.getElementById('calc').scrollIntoView({ behavior: 'smooth', block: 'start' });
  setTimeout(() => {
    document.querySelector('.calc-section').classList.add('highlight-pulse');
    renderResult();
    setTimeout(() => document.querySelector('.calc-section').classList.remove('highlight-pulse'), 1700);
  }, 500);
}

/* ============================================================
   COUNTERS
   ============================================================ */
function animateCounter(el, target, formatSpec, suffix=''){
  const cssDuration = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--counter-duration')) || 2400;
  const start = performance.now();
  function tick(now){
    const t = Math.min((now-start)/cssDuration, 1);
    const eased = 1 - Math.pow(1-t, 3);
    const val = Math.round(target * eased);
    el.textContent = formatNumber(val, formatSpec) + suffix;
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
function formatNumber(val, spec){
  if (spec === 'abbrev') {
    if (val >= 1000000) return (val/1000000).toFixed(1).replace('.0','') + 'M';
    if (val >= 1000) return (val/1000).toFixed(0) + 'k';
    return val.toString();
  }
  return val.toLocaleString('sv-SE');
}
const counterObserver = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if (entry.isIntersecting) {
      const metric = entry.target;
      const target = +metric.dataset.target;
      const fmt = metric.dataset.format || 'number';
      const suffix = metric.dataset.suffix || '';
      const counterEl = metric.querySelector('[data-counter]');
      if (counterEl && !counterEl.dataset.done) {
        animateCounter(counterEl, target, fmt, suffix);
        counterEl.dataset.done = '1';
      }
    }
  });
}, { threshold: 0.4 });
document.querySelectorAll('.metric').forEach(m=>counterObserver.observe(m));

const revealObs = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      revealObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el=>revealObs.observe(el));

/* ============================================================
   CONTACT FORM MODAL (CFM) — Web3Forms
   ============================================================ */

const CFM_ACCESS_KEY = 'ce667656-033f-4fc3-a3dd-daf27ca0cf8c';

function openContactModal(context, posId) {
  const backdrop = document.getElementById('cfm-backdrop');
  const body = document.getElementById('cfm-body');
  if (!backdrop || !body) return;

  let subjectLine = 'Sponsringsförfrågan – Chalmers Hockey 26/27';
  let messagePre = '';
  let contextLabel = '';

  if (context === 'calculator') {
    const r = recommend();
    const pkgName = r.items.length
      ? r.items.map(it => it.displayName || it.name).join(', ')
      : 'Sponsorpaket';
    const budget = r.totalSpend.toLocaleString('sv-SE');
    subjectLine = `Intresseanmälan sponsring – ${budget} kr/år`;
    messagePre = `Hej! Vi är intresserade av följande paket:\n${pkgName}\n\nTotal budget: ${budget} kr/år.\n\n`;
    contextLabel = `Rekommenderat paket · ${budget} kr/år`;
  } else if (context === 'custom') {
    subjectLine = 'Skräddarsytt sponsringspaket – diskussion';
    messagePre = 'Hej! Vi är intresserade av att diskutera ett skräddarsytt sponsorupplägg utanför era standardpaket.\n\n';
    contextLabel = 'Skräddarsytt paket';
  } else if (context === 'zone' && posId) {
    const p = PACKAGES[posId];
    if (p) {
      subjectLine = `Förfrågan om ${p.name}`;
      messagePre = `Hej! Vi är intresserade av sponsorpositionen ${p.letter} — ${p.name} (${p.price.toLocaleString('sv-SE')} kr/år).\n\n`;
      contextLabel = `${p.letter} — ${p.name}`;
    }
  } else if (context === 'partner') {
    subjectLine = 'Partnerförfrågan – Chalmers Hockey 26/27';
    messagePre = 'Hej! Vi är intresserade av att bli partner med Chalmers Hockey inför säsongen 26/27.\n\n';
    contextLabel = 'Partnerskap';
  }

  const ZONE_IMAGES = { C: 'assets/zones/C.png', F: 'assets/zones/F.png', X: 'assets/zones/X.png', B: 'assets/zones/B.png', H: 'assets/zones/H.png' };
  const zoneLetter = (context === 'zone' && posId && PACKAGES[posId]) ? PACKAGES[posId].letter : null;
  const zoneImgSrc = zoneLetter && ZONE_IMAGES[zoneLetter] ? ZONE_IMAGES[zoneLetter] : null;
  const zoneImgHtml = zoneImgSrc ? `<img class="cfm-zone-image" src="${zoneImgSrc}" alt="Zon ${zoneLetter} på matchtröjan">` : '';

  body.innerHTML = `
    <div class="cfm-header">
      <div class="cfm-header-text">
        <div class="cfm-eyebrow">Kontakta oss</div>
        <h2 id="cfm-title" class="cfm-title">Kom igång med er sponsring</h2>
        ${contextLabel ? `<div class="cfm-context-badge">${contextLabel}</div>` : ''}
      </div>
      ${zoneImgHtml}
    </div>
    <form class="cfm-form" id="cfm-form" novalidate>
      <input type="hidden" name="access_key" value="${CFM_ACCESS_KEY}">
      <input type="hidden" name="subject" value="${subjectLine}">
      <input type="hidden" name="from_name" value="Chalmers Hockey Sponsorsite">
      <input type="checkbox" name="botcheck" style="display:none" tabindex="-1" autocomplete="off">

      <div class="cfm-field">
        <label class="cfm-label" for="cfm-company">Företag <span class="cfm-required">*</span></label>
        <input class="cfm-input" id="cfm-company" name="company" type="text" placeholder="Ert företagsnamn" autocomplete="organization" required minlength="2">
        <div class="cfm-error" id="cfm-company-err" aria-live="polite"></div>
      </div>

      <div class="cfm-field">
        <label class="cfm-label" for="cfm-contact">Kontaktperson <span class="cfm-required">*</span></label>
        <input class="cfm-input" id="cfm-contact" name="name" type="text" placeholder="Ert namn" autocomplete="name" required minlength="2">
        <div class="cfm-error" id="cfm-contact-err" aria-live="polite"></div>
      </div>

      <div class="cfm-row">
        <div class="cfm-field">
          <label class="cfm-label" for="cfm-email">E-post <span class="cfm-required">*</span></label>
          <input class="cfm-input" id="cfm-email" name="email" type="email" placeholder="ert@foretag.se" autocomplete="email" required>
          <div class="cfm-error" id="cfm-email-err" aria-live="polite"></div>
        </div>
        <div class="cfm-field">
          <label class="cfm-label" for="cfm-phone">Telefon</label>
          <input class="cfm-input" id="cfm-phone" name="phone" type="tel" placeholder="+46 70 000 00 00" autocomplete="tel">
        </div>
      </div>

      <div class="cfm-field">
        <label class="cfm-label" for="cfm-message">Vad vill ni diskutera? <span class="cfm-required">*</span></label>
        <textarea class="cfm-input cfm-textarea" id="cfm-message" name="message" placeholder="Berätta kort om er verksamhet och vad ni letar efter…" required minlength="10">${messagePre}</textarea>
        <div class="cfm-error" id="cfm-message-err" aria-live="polite"></div>
      </div>

      <button class="btn-primary cfm-submit" id="cfm-submit" type="submit" disabled>
        <span class="cfm-submit-text">Skicka förfrågan</span>
        <span class="cfm-submit-spinner" aria-hidden="true"></span>
      </button>
      <div class="cfm-privacy">Vi svarar inom 2 arbetsdagar. Er information delas aldrig med tredje part.</div>
    </form>
  `;

  const form = document.getElementById('cfm-form');
  const submit = document.getElementById('cfm-submit');
  const fields = {
    company: {
      el: document.getElementById('cfm-company'),
      err: document.getElementById('cfm-company-err'),
      validate: v => v.trim().length >= 2 ? '' : 'Minst 2 tecken krävs'
    },
    contact: {
      el: document.getElementById('cfm-contact'),
      err: document.getElementById('cfm-contact-err'),
      validate: v => v.trim().length >= 2 ? '' : 'Minst 2 tecken krävs'
    },
    email: {
      el: document.getElementById('cfm-email'),
      err: document.getElementById('cfm-email-err'),
      validate: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Ange en giltig e-postadress'
    },
    message: {
      el: document.getElementById('cfm-message'),
      err: document.getElementById('cfm-message-err'),
      validate: v => v.trim().length >= 10 ? '' : 'Minst 10 tecken krävs'
    }
  };

  function validateField(key) {
    const f = fields[key];
    const msg = f.validate(f.el.value);
    f.err.textContent = msg;
    f.el.classList.toggle('cfm-input--error', !!msg && f.el.dataset.touched === 'true');
    return !msg;
  }

  function checkSubmit() {
    const allValid = Object.keys(fields).every(k => !fields[k].validate(fields[k].el.value));
    submit.disabled = !allValid;
  }

  Object.keys(fields).forEach(key => {
    const f = fields[key];
    f.el.addEventListener('input', () => { checkSubmit(); if (f.el.dataset.touched === 'true') validateField(key); });
    f.el.addEventListener('blur', () => { f.el.dataset.touched = 'true'; validateField(key); checkSubmit(); });
  });

  // Initial check — pre-filled message text may satisfy min-length
  checkSubmit();

  form.addEventListener('submit', async e => {
    e.preventDefault();
    Object.keys(fields).forEach(key => { fields[key].el.dataset.touched = 'true'; validateField(key); });
    if (!Object.keys(fields).every(k => !fields[k].validate(fields[k].el.value))) return;

    submit.disabled = true;
    submit.classList.add('cfm-submit--loading');

    const payload = {};
    new FormData(form).forEach((v, k) => { payload[k] = v; });

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json.success) {
        showCfmSuccess();
      } else {
        showCfmError();
      }
    } catch (_) {
      showCfmError();
    }
  });

  backdrop.setAttribute('aria-hidden', 'false');
  backdrop.classList.add('cfm-backdrop--show');
  document.body.style.overflow = 'hidden';
  setTimeout(() => { const el = document.getElementById('cfm-company'); if (el) el.focus(); }, 60);
}

function showCfmSuccess() {
  const body = document.getElementById('cfm-body');
  if (!body) return;
  body.innerHTML = `
    <div class="cfm-result cfm-result--success">
      <div class="cfm-result-icon" aria-hidden="true">✓</div>
      <h2 class="cfm-result-title">Tack för er förfrågan!</h2>
      <p class="cfm-result-text">Vi återkommer inom 2 arbetsdagar. Kolla gärna in oss på sociala medier under tiden.</p>
      <div class="cfm-social-links">
        <a href="https://www.instagram.com/chalmershockey/" target="_blank" rel="noopener" class="cfm-social-link">Instagram</a>
        <a href="https://www.tiktok.com/@chalmershockey" target="_blank" rel="noopener" class="cfm-social-link">TikTok</a>
      </div>
      <button class="btn-ghost cfm-close-result" onclick="closeContactModal()">Stäng</button>
    </div>
  `;
}

function showCfmError() {
  const submit = document.getElementById('cfm-submit');
  if (submit) { submit.disabled = false; submit.classList.remove('cfm-submit--loading'); }
  const form = document.getElementById('cfm-form');
  if (!form) return;
  let banner = document.getElementById('cfm-error-banner');
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'cfm-error-banner';
    banner.className = 'cfm-error-banner';
    form.appendChild(banner);
  }
  banner.innerHTML = 'Något gick fel. Prova igen eller <a href="mailto:chalmershockey@gmail.com?subject=Sponsringsförfrågan%2026%2F27" class="cfm-fallback-link">maila direkt</a>.';
}

function closeContactModal() {
  const backdrop = document.getElementById('cfm-backdrop');
  if (!backdrop) return;
  backdrop.setAttribute('aria-hidden', 'true');
  backdrop.classList.remove('cfm-backdrop--show');
  document.body.style.overflow = '';
}

(function setupCfm() {
  function bind() {
    const backdrop = document.getElementById('cfm-backdrop');
    const closeBtn = document.getElementById('cfm-close');
    if (backdrop) backdrop.addEventListener('click', e => { if (e.target === backdrop) closeContactModal(); });
    if (closeBtn) closeBtn.addEventListener('click', closeContactModal);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind);
  } else {
    bind();
  }
})();

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    const bd = document.getElementById('cfm-backdrop');
    if (bd && bd.classList.contains('cfm-backdrop--show')) closeContactModal();
  }
});