/* Vattenresan – applogik.
   Systemet är exponerat som window.__game/​M så att tester kan styra nivå och steg. */
(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const POS = (VATTEN.POSITIONER || VATTEN.PUNKTER);

  const S = {
    niva: 0,
    steg: 0,
    forsok: 0,
    stjarnor: 0,
    klar: false,
    ljud: true,
    hint: false
  };
  let ljudCtx = null;
  let fallbackStrak = null;

  /* ---------------- ljud ---------------- */
  function pigga(freq, tid, slag) {
    if (!S.ljud) return;
    try {
      if (!ljudCtx) ljudCtx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ljudCtx.createOscillator(), g = ljudCtx.createGain();
      o.type = slag || 'triangle';
      o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, ljudCtx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.16, ljudCtx.currentTime + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, ljudCtx.currentTime + (tid || 0.22));
      o.connect(g); g.connect(ljudCtx.destination);
      o.start(); o.stop(ljudCtx.currentTime + (tid || 0.22) + 0.02);
    } catch (e) { /* ljud är alltid valfritt */ }
  }
  function tal(text) {
    /* Färdiga mp3-filer ur ljud/ (se ljud/lines.js) – ingen talsyntes, så rösten
       låter likadant i alla webbläsare. Saknas filen blir det tyst. */
    if (!S.ljud) return;
    try { if (window.__rost && window.__rost(text, !0)) return; } catch (e) { /* ljud är alltid valfritt */ }
    try { if (window.console && window.__rostFinns && !window.__rostFinns(text)) console.warn('saknar mp3:', text); } catch (e) {}
  }
  window.addEventListener('pointerdown', function ettSensor() {
    try {
      if (!ljudCtx) ljudCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (ljudCtx.state === 'suspended') ljudCtx.resume();
    } catch (e) {}
    window.removeEventListener('pointerdown', ettSensor);
  }, { once: true });

  /* ---------------- ikoner ---------------- */
  const IKONER = {
    upp: '<path d="M12 4v13M12 3l-5 6M12 3l5 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>',
    ner: '<path d="M12 20V7M12 21l-5-6M12 21l5-6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>',
    moln: '<path d="M7 17h9a3.4 3.4 0 0 0 .3-6.8A5 5 0 0 0 6.7 11 3 3 0 0 0 7 17z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/>',
    regn: '<path d="M7 15h9a3.3 3.3 0 0 0 .3-6.6A5 5 0 0 0 6.5 8.6 3 3 0 0 0 7 15z" fill="none" stroke="currentColor" stroke-width="2.1"/><path d="M8 18v2M12 18v2.4M16 18v2" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"/>',
    sol: '<circle cx="12" cy="12" r="4.4" fill="none" stroke="currentColor" stroke-width="2.1"/><path d="M12 2.6v2.6M12 18.8v2.6M2.6 12h2.6M18.8 12h2.6M5.4 5.4l1.8 1.8M16.8 16.8l1.8 1.8M18.6 5.4l-1.8 1.8M7.2 16.8l-1.8 1.8" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"/>',
    is: '<path d="M12 3v18M4 7.5l16 9M20 7.5l-16 9" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"/>',
    salt: '<path d="M6 8h3v3H6zM15 8h3v3h-3zM10.5 14h3v3h-3zM5 15h3v3H5zM16 15.5h3v3h-3z" fill="currentColor"/>',
    sand: '<path d="M7 9h.01M12 6.5h.01M17 9.5h.01M9.5 13h.01M15 13h.01M12 18h.01" stroke="currentColor" stroke-width="3.4" stroke-linecap="round"/>',
    berg: '<path d="M3 19l6-10 4 6 3-4 5 8z" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linejoin="round"/>',
    hav: '<path d="M3 9c3-2 5 2 8 0s5-2 7 0M3 15c3-2 5 2 8 0s5-2 7 0" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>',
    stopp: '<circle cx="12" cy="12" r="8.4" fill="none" stroke="currentColor" stroke-width="2.1"/><path d="M6.6 17.4 17.4 6.6" stroke="currentColor" stroke-width="2.1"/>',
    bort: '<path d="M5 12h11M12 7.5 16.5 12 12 16.5M18 5.5v13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>',
    svamp: '<path d="M5 11a7 7 0 0 1 14 0z" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linejoin="round"/><path d="M10 11v7.5h4V11" fill="none" stroke="currentColor" stroke-width="2.1"/>',
    brunn: '<rect x="4.5" y="6.5" width="15" height="11" rx="2.5" fill="none" stroke="currentColor" stroke-width="2.1"/><path d="M8 9.5v5M12 9.5v5M16 9.5v5" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"/>',
    ror: '<path d="M4 8h16M4 16h16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>',
    yta: '<path d="M3 8h18" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M7 13v4M13 13v4M17 13v4" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"/>',
    trad: '<path d="M12 4l6 9H6z" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linejoin="round"/><path d="M12 13v6" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"/>',
    sno: '<path d="M12 3v18M4 7.5l16 9M20 7.5l-16 9M9 5 12 7l3-2M9 19l3-2 3 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    mane: '<circle cx="12" cy="12" r="7.5" fill="none" stroke="currentColor" stroke-width="2.1"/><path d="M15 5a7.5 7.5 0 0 0 0 14" fill="currentColor"/>',
    vind: '<path d="M3 8h11a3 3 0 1 0-3-3M3 13h15M3 17h9a2.6 2.6 0 1 1-2.6 2.6" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"/>'
  };
  function ikonSvg(k) {
    const k2 = k === 'is' && k ? k : k;
    const d = IKONER[k2] || IKONER.hav;
    return '<span class="alt-ikon" aria-hidden="true"><svg viewBox="0 0 24 24">' + d + '</svg></span>';
  }

  /* ---------------- scenen ---------------- */
  const bild = $('bild');
  const droppeP = $('droppe');
  const molnP = $('moln');

  function flyttaDroppeTill(punkt, direkt) {
    const p = POS[punkt] || POS.hav;
    droppeP.setAttribute('transform', 'translate(' + p.x + ' ' + p.y + ')');
    if (direkt) droppeP.style.opacity = '1';
  }

  // Enkel kvadratisk bezier med styrpunkt beroende på väg.
  function kontroll(from, to, vag) {
    const mx = (from.x + to.x) / 2, my = (from.y + to.y) / 2;
    if (vag === 'upp') return { x: mx + (to.x - from.x) * 0.15 + 30, y: my - 70 };
    if (vag === 'ned') return { x: mx + 40, y: my - 90 };
    if (vag === 'hav') return { x: mx - 40, y: Math.min(from.y, to.y) - 140 };
    if (vag === 'gata') return { x: mx, y: my - 60 };
    if (vag === 'still') return { x: mx, y: my - 40 };
    return { x: mx, y: my };
  }

  let animering = null;
  function stapla(fromS, toS, vag, varaktighet, klar) {
    const from = POS[fromS] || POS.hav, to = POS[toS] || POS.hav;
    const C = kontroll(from, to, vag);
    const reducerad = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducerad) { droppeP.setAttribute('transform', 'translate(' + to.x + ' ' + to.y + ')'); if (klar) klar(); return; }
    const start = performance.now();
    const tid = varaktighet || 1100;
    animering = function (nu) {
      let t = Math.min(1, (nu - start) / tid);
      const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const x = (1 - e) * (1 - e) * from.x + 2 * (1 - e) * e * C.x + e * e * to.x;
      const y = (1 - e) * (1 - e) * from.y + 2 * (1 - e) * e * C.y + e * e * to.y;
      droppeP.setAttribute('transform', 'translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ')');
      if (t < 1) return true;
      animering = null;
      if (klar) klar();
      return false;
    };
  }

  // rAF-loop med en setInterval-vakthund: en bakgrundsflik eller en dokument­preset
  // slutar ge ramfall utan att spelet ser ut att leva – då tar vakten över stegen.
  let sistaRam = performance.now();
  let sistaStyr = performance.now();
  function losen(now) {
    const nu = typeof now === 'number' ? now : performance.now();
    if (animering) {
      if (animering(nu)) sistaStyr = nu; else { animering = null; sistaStyr = nu; }
    }
    sistaRam = nu;
    if (animering) requestAnimationFrame(losen);
  }
  function styra() {
    if (!animering) return;
    const nu = performance.now();
    if (nu - sistaStyr <= 320) return;
    if (animering(nu)) sistaStyr = nu; else { animering = null; sistaStyr = nu; }
    requestAnimationFrame(losen);
  }
  requestAnimationFrame(losen);
  setInterval(function vakthund() { if (!document.hidden) styra(); }, 100);

  /* ---------------- render ---------------- */
  function niva() { return VATTEN.NIVÅER[S.niva]; }
  function steg() { return niva().steg[S.steg]; }

  function skrivUtFråga() {
    const s = steg();
    $('fraga').textContent = s.fraga;
    $('forklaring').hidden = true;
    $('forklaring').textContent = '';
    $('nasta').hidden = true;
    S.forsok = 0; S.hint = false;

    const rutan = $('alt');
    rutan.innerHTML = '';
    s.alt.forEach((text, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.dataset.i = i;
      b.innerHTML = ikonSvg(s.ikon[i]) + '<span>' + text + '</span>';
      b.addEventListener('click', () => prova(i, b));
      rutan.appendChild(b);
    });
    meddela('level', niva().nr);
    tal(s.fraga);
    breddKontroll();
  }

  function meddela(ev, v) { try { if (window.skolappar && window.skolappar.event) window.skolappar.event(ev, v); } catch (e) {} }

  function prova(i, knapp) {
    if (S.klar) return;
    const s = steg();
    if (i === s.rätt) {
      knapp.classList.add('ratt');
      [].forEach.call($('alt').children, (b) => { b.disabled = true; });
      if (S.forsok === 0) adderaStjärna();
      pigga(720, 0.16); setTimeout(() => pigga(970, 0.22), 120);
      const forkl = document.getElementById('forklaring');
      forkl.hidden = false;
      forkl.textContent = s.namn + ': ' + s.förklaring;   // texten finns även om rösten är avstängd
      tal(s.namn + '. ' + s.förklaring);
      setState('rätt');
      const C = kontroll(POS[s.från], POS[s.till], s.väg);
      molnP.classList.toggle('regnar', s.väg === 'ned');
      droppeP.classList.remove('stilla');
      stapla(s.från, s.till, s.väg, 1150, () => {
        molnP.classList.remove('regnar');
        $('nasta').hidden = false;
      });
      // om animationen inte kan starta behövs ändå vägen framåt
      if (!animering) $('nasta').hidden = false;
    } else {
      S.forsok++;
      knapp.classList.add('fel');
      knapp.disabled = true;
      pigga(240, 0.16, 'sine');
      if (S.forsok === 1) {
        const f = document.getElementById('forklaring');
        f.hidden = false; f.textContent = 'Titta på bilden igen och tänk på vad vattnet KAN göra. Något alternativ stämmer.';
        tal('Titta på bilden igen. Något alternativ stämmer.');
      } else {
        var ronga = $('alt').children[s.rätt];
        ronga.classList.add('puls');
        const f = document.getElementById('forklaring');
        f.hidden = false; f.textContent = 'Här är rätt svar. ' + s.namn + '.';
        tal('Här är rätt svar. Ännu en chans – välj den ökande rutan.');
        S.hint = true; meddela('hint');
      }
    }
  }

  function adderaStjärna() {
    S.stjarnor++;
    uppdateraStjärnor();
  }
  function uppdateraStjärnor() {
    const rutan = $('stjarnor');
    rutan.innerHTML = '';
    for (let i = 0; i < niva().steg.length; i++) {
      const el = document.createElement('i');
      if (i < S.stjarnor) el.className = 'fylld';
      rutan.appendChild(el);
    }
  }

  function setState(s) { S.yta = s; }

  function nästa() {
    S.steg++;
    if (S.steg >= niva().steg.length) { slut(); return; }
    setState('fråga');
    flyttaDroppeTill(steg().från, true);
    skrivUtFråga();
  }

  function slut() {
    S.klar = true;
    const snitt = Math.round(100 * S.stjarnor / niva().steg.length);
    const sista = S.niva === VATTEN.NIVÅER.length - 1;
    $('ov-titel').textContent = sista ? 'Alla nivåer klara!' : ('Nivå ' + niva().nr + ' klar');
    $('ov-text').textContent = S.stjarnor + ' av ' + niva().steg.length + ' stjärnor · ' + niva().namn +
      (sista ? ' Du har följt vattnet ett helt varv: sjö → luft → moln → mark → sjö.' : ' Nästa miljö: ' + VATTEN.NIVÅER[S.niva + 1].namn + '.');
    $('ov-stjarnor').innerHTML = '★'.repeat(S.stjarnor) + '<span style="opacity:.25">' + '★'.repeat(Math.max(0, niva().steg.length - S.stjarnor)) + '</span>';
    $('ov-nasta').hidden = sista;
    $('ov-om').hidden = false;
    $('ov-bild').src = 'icon-192.png';
    $('overlay').hidden = false;
    $('ov-titel').focus();
    pigga(660, 0.14); setTimeout(() => pigga(880, 0.3), 150);
    tal('Nivå klar!');
    meddela('round_done', snitt);
  }

  function startaNiva(nr) {
    S.niva = Math.max(0, Math.min(VATTEN.NIVÅER.length - 1, nr || 0));
    S.steg = 0; S.stjarnor = 0; S.klar = false;
    $('overlay').hidden = true;
    $('spel').hidden = false;
    $('startskarm').hidden = true;   // annars ligger startskärmen kvar ovanpå spelet
    setState('fråga');
    $('niva').textContent = 'Nivå ' + niva().nr + ' · ' + niva().namn;
    uppdateraStjärnor();
    flyttaDroppeTill(steg().från, true);
    skrivUtFråga();
    meddela('round_start');
  }

  /* ---------------- håll kontrollen synlig ---------------- */
  function breddKontroll() {}   // lämnas som sådant: frågorna är korta medvetet

  /* ---------------- händelser ---------------- */
  $('spela').addEventListener('click', () => { startaNiva(0); pigga(520, 0.14); });
  $('nasta').addEventListener('click', () => { pigga(600, 0.1); nästa(); });
  $('ov-nasta').addEventListener('click', () => { startaNiva(S.niva + 1); pigga(520, 0.14); });
  $('ov-om').addEventListener('click', () => {
    if (S.stjarnor >= 0 && $('ov-nasta').hidden) startaNiva(0);
    else startaNiva(S.niva);
    pigga(520, 0.14);
  });
  $('ljud').addEventListener('click', () => {
    S.ljud = !S.ljud;
    $('ljud').classList.toggle('av', !S.ljud);
    $('ljudikon').innerHTML = S.ljud
      ? '<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7" fill="none" stroke-width="1.8"/><path d="M18.8 6a8 8 0 0 1 0 12" fill="none" stroke-width="1.8"/>'
      : '<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M17 9.5l5 5M22 9.5l-5 5" fill="none" stroke-width="1.9"/>';
    if (!S.ljud) { try { if (window.__rostStopp) window.__rostStopp(); } catch (e) {} }
    meddela('sound_off');
  });
  $('ljudikon').innerHTML =
    '<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7" fill="none" stroke-width="1.8"/><path d="M18.8 6a8 8 0 0 1 0 12" fill="none" stroke-width="1.8"/>';

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !$('nasta').hidden) { if ($('overlay').hidden) { næstaTryck(); } }
  });
  function næstaTryck() { $('nasta').click(); }

  /* Ett testyta: låter verifiering köra en hel serie utan pekskärm. */
  window.__game = {
    S,
    state: () => ({ niva: S.niva, steg: S.steg, klar: S.klar, stjarnor: S.stjarnor, yta: S.yta }),
    startaNiva,
    drag: (knappIndex) => {
      const knapp = $('alt').children[knappIndex];
      if (knapp) { knapp.click(); return true; }
      return false;
    },
    nästa,
    rätt: () => (S.klar ? null : niva().steg[S.steg].rätt),
    fråga: () => (S.klar || S.steg >= niva().steg.length ? null : niva().steg[S.steg].fraga),
    total: () => (S.klar ? 0 : niva().steg.length),
    VATTEN
  };

  // första läget: göm spelskärmen tills "Spela" trycks, men placera droppen
  flyttaDroppeTill('hav', true);
  setState('start');
})();