(() => {
  'use strict';
  // Hero demo: the 01.5 welcome screen, then the conversation with Lucas, then back to the welcome screen.
  const thread = document.querySelector('#hero-thread');
  const typing = document.querySelector('#hero-typing');
  const button = document.querySelector('#hero-motion-toggle');
  const welcome = document.querySelector('#w-screen');
  const cta = document.querySelector('#w-cta');
  if (!thread || !typing || !button) return;
  const msgs = [...thread.querySelectorAll('[data-step]')];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const WELCOME_MS = 10000;
  let paused = reduced.matches, timer = null, i = 0, stage = 'welcome';

  const later = (fn, ms) => { clearTimeout(timer); timer = setTimeout(fn, ms); };
  const showAll = () => { msgs.forEach(m => m.classList.remove('is-hidden', 'is-gone')); typing.hidden = true; };
  const resetChat = () => { msgs.forEach(m => m.classList.add('is-hidden', 'is-gone')); typing.hidden = true; i = 0; };

  const showWelcome = () => {
    stage = 'welcome';
    resetChat();
    if (!welcome) return startChat();
    welcome.classList.add('is-on');
    welcome.classList.remove('is-counting'); void welcome.offsetWidth;
    if (!paused) { welcome.classList.add('is-counting'); later(startChat, WELCOME_MS); }
  };
  const startChat = () => {
    stage = 'chat';
    if (welcome) welcome.classList.remove('is-on', 'is-counting');
    resetChat();
    if (paused) { showAll(); return; }
    later(next, 700);
  };
  const next = () => {
    if (paused) return;
    if (i >= msgs.length) { later(showWelcome, 5000); return; }
    const m = msgs[i];
    const reveal = () => { typing.hidden = true; m.classList.remove('is-gone'); requestAnimationFrame(() => m.classList.remove('is-hidden')); i++; later(next, m.classList.contains('ai') ? 1700 : 1300); };
    if (m.classList.contains('ai')) { typing.hidden = false; thread.append(typing); later(reveal, 1300); }
    else reveal();
  };

  const render = () => {
    button.setAttribute('aria-pressed', String(paused));
    button.setAttribute('aria-label', paused ? 'Reproducir animación de la APP' : 'Pausar animación de la APP');
    button.querySelector('.motion-text').textContent = paused ? 'Reproducir' : 'Pausar';
    button.querySelector('.motion-glyph').textContent = paused ? '▷' : 'Ⅱ';
  };
  button.addEventListener('click', () => {
    paused = !paused; clearTimeout(timer);
    if (paused) { if (welcome) welcome.classList.remove('is-counting'); if (stage === 'chat') showAll(); }
    else if (stage === 'chat') startChat(); else showWelcome();
    render();
  });
  if (cta) cta.addEventListener('click', () => { clearTimeout(timer); startChat(); });

  render();
  showWelcome();
})();

// Key points strip: clone the list once so the marquee loops seamlessly.
(() => {
  const track = document.querySelector('#k-track');
  if (!track) return;
  [...track.children].forEach(li => { const c = li.cloneNode(true); c.setAttribute('aria-hidden', 'true'); track.append(c); });
})();

// Hero phone: built at real size (415 × 874) and scaled to its slot, like a real device mockup.
document.querySelectorAll('.rp-slot').forEach(slot => {
  const phone = slot.querySelector('.rp-phone');
  if (!phone) return;
  const fit = () => phone.style.setProperty('--k', (slot.clientWidth / 415).toFixed(4));
  fit();
  if ('ResizeObserver' in window) new ResizeObserver(fit).observe(slot); else addEventListener('resize', fit);
});

// How it works: the phone follows the step on screen; step 1 plays Play Store → install → welcome → login.
(() => {
  const sec = document.querySelector('.s-how');
  if (!sec) return;
  const steps = [...sec.querySelectorAll('.s-step')];
  const scenes = [...sec.querySelectorAll('.s-scene')];
  const list = sec.querySelector('.s-list');
  const names = ['Descarga la APP', 'Cuéntale cómo estás', 'Selecciona tu Cuorami', 'Habla de lo que te preocupa', 'Algo empieza a moverse'];
  const mobile = window.matchMedia('(max-width: 900px)');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let active = -1;

  // ---- step 1 sequence ----
  const scene = scenes[0];
  const ps = scene.querySelector('.ps');
  const welcome = scene.querySelector('[data-sub="welcome"]');
  const login = scene.querySelector('[data-sub="login"]');
  const launch = scene.querySelector('.s-launch');
  const tap = scene.querySelector('.s-tap');
  const install = scene.querySelector('.ps-install');
  const pct = install.querySelector('em');
  const email = login.querySelector('.lg-email'), pass = login.querySelector('.lg-pass');
  let timers = [], ticker = null;
  const at = (ms, fn) => timers.push(setTimeout(fn, ms));
  const stop = () => { timers.forEach(clearTimeout); timers = []; clearInterval(ticker); };
  const show = sub => [ps, welcome, login].forEach(s => s.classList.toggle('is-on', s === sub));
  const tapOn = el => {
    const b = scene.getBoundingClientRect(), r = el.getBoundingClientRect(), k = b.width / 393 || 1;
    tap.style.left = ((r.left - b.left + r.width / 2) / k) + 'px';
    tap.style.top = ((r.top - b.top + r.height / 2) / k) + 'px';
    tap.classList.add('is-on'); tap.classList.remove('is-press'); void tap.offsetWidth;
    setTimeout(() => tap.classList.add('is-press'), 450);
  };
  const type = (el, text, speed, done) => { let n = 0; el.textContent = ''; ticker = setInterval(() => { el.textContent = text.slice(0, ++n); if (n >= text.length) { clearInterval(ticker); done && done(); } }, speed); };
  const reset = () => {
    stop(); show(ps); ps.dataset.state = 'idle'; ps.style.setProperty('--p', 0); pct.textContent = '0';
    launch.classList.remove('is-on'); tap.classList.remove('is-on', 'is-press');
    email.textContent = ''; pass.textContent = ''; login.classList.remove('is-typing', 'is-sending');
  };
  const play = () => {
    reset();
    if (reduced.matches) { show(welcome); return; }
    at(1400, () => tapOn(install));
    at(1900, () => { ps.dataset.state = 'pending'; tap.classList.remove('is-on'); });
    at(3000, () => {
      ps.dataset.state = 'installing'; const t0 = performance.now();
      ticker = setInterval(() => { const p = Math.min(1, (performance.now() - t0) / 2600); ps.style.setProperty('--p', p.toFixed(3)); pct.textContent = Math.round(p * 100); if (p >= 1) clearInterval(ticker); }, 50);
    });
    at(5800, () => { ps.dataset.state = 'done'; });
    at(6700, () => tapOn(install));
    at(7250, () => { tap.classList.remove('is-on'); launch.classList.remove('is-on'); void launch.offsetWidth; launch.classList.add('is-on'); });
    at(7900, () => show(welcome));
    at(11200, () => tapOn(welcome.querySelector('.s-login-link')));
    at(11800, () => { tap.classList.remove('is-on'); show(login); });
    at(12600, () => { login.classList.add('is-typing'); type(email, email.dataset.text, 75, () => setTimeout(() => type(pass, pass.dataset.text, 90), 250)); });
    at(15300, () => { login.classList.remove('is-typing'); tapOn(login.querySelector('.lg-btn')); });
    at(15800, () => { login.classList.add('is-sending'); tap.classList.remove('is-on'); });
    at(17800, () => { if (active === 0) go(1); });
  };

  const set = i => {
    if (i === active) return run();
    active = i;
    steps.forEach((s, k) => s.classList.toggle('is-active', k === i));
    scenes.forEach((s, k) => s.classList.toggle('is-on', k === i));
    sec.querySelector('#s-indicator').textContent = `${String(i + 1).padStart(2, '0')} / ${String(steps.length).padStart(2, '0')}`;
    sec.querySelector('#s-name').textContent = names[i];
    sec.querySelector('#s-status').textContent = `Paso ${i + 1}: ${names[i]}`;
    const num = steps[i].querySelector('.s-num');
    list.style.setProperty('--s-progress', (num.offsetTop + steps[i].offsetTop + 22) + 'px');
    dots.forEach((d, k) => { d.classList.toggle('is-on', k === i); d.classList.toggle('is-done', k < i); });
    run();
  };
  // each step plays its animation, then the panel moves on to the next one
  const DUR = [17800, 0, 0, 0, 9000];
  let hold = null, visible = true;
  const run = () => {
    stop(); clearTimeout(hold); if (window.cuoOb) window.cuoOb.stop(); if (window.cuoPick) window.cuoPick.stop(); if (window.cuoLucas) window.cuoLucas.stop();
    const d = dots[active]; if (d) { d.style.setProperty('--d', DUR[active] + 'ms'); d.classList.remove('is-run'); d.querySelector('i').style.transform = ''; void d.offsetWidth; }
    if (!visible) return;
    if (active === 3 && window.cuoLucas) {
      window.cuoLucas.start(() => { hold = setTimeout(() => go(4), 2500); }, p => { if (d) d.querySelector('i').style.transform = `scaleX(${p})`; });
      return;
    }
    if (active === 2 && window.cuoPick) {
      window.cuoPick.start(() => { hold = setTimeout(() => go(3), 1500); }, p => { if (d) d.querySelector('i').style.transform = `scaleX(${p})`; });
      return;
    }
    if (active === 1 && window.cuoOb) {
      window.cuoOb.start(() => { hold = setTimeout(() => go(2), 3500); }, p => { if (d) d.querySelector('i').style.transform = `scaleX(${p})`; });
      return;
    }
    if (reduced.matches) return;
    if (d) d.classList.add('is-run');
    if (active === 0) play(); else hold = setTimeout(() => go(active + 1), DUR[active]);
  };
  const go = i => set((i + steps.length) % steps.length);

  steps.forEach((s, k) => {
    s.addEventListener('click', () => set(k));
    s.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); set(k); } });
  });
  const dots = [...sec.querySelectorAll('.s-dot')];
  dots.forEach((d, k) => d.addEventListener('click', () => set(k)));

  // swipe / drag / horizontal wheel over the phone panel
  const panel = sec.querySelector('.s-panel');
  let sx = null, sy = 0, lastWheel = 0;
  panel.addEventListener('pointerdown', e => { sx = e.clientX; sy = e.clientY; });
  panel.addEventListener('pointerup', e => {
    if (sx === null) return;
    const dx = e.clientX - sx, dy = e.clientY - sy; sx = null;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) go(active + (dx < 0 ? 1 : -1));
  });
  panel.addEventListener('pointercancel', () => { sx = null; });
  panel.addEventListener('wheel', e => {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY) || Math.abs(e.deltaX) < 25) return;
    e.preventDefault();
    const now = Date.now(); if (now - lastWheel < 700) return; lastWheel = now;
    go(active + (e.deltaX > 0 ? 1 : -1));
  }, { passive: false });

  // only animate while the section is on screen
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => { const was = visible; visible = e.isIntersecting; if (visible !== was) run(); }, { threshold: .25 }).observe(sec);
  }
  set(0);
})();

// Step 2: interactive onboarding chat (03.3 · 03.4 · 03.5). Visitors answer for real; if nobody touches it, it demos itself.
window.cuoOb = (() => {
  const ob = document.querySelector('#ob');
  if (!ob) return null;
  const thread = ob.querySelector('#ob-thread'), opts = ob.querySelector('#ob-opts'), label = ob.querySelector('#ob-label');
  const send = ob.querySelector('#ob-send'), skip = ob.querySelector('#ob-skip'), count = ob.querySelector('#ob-count'), bar = ob.querySelector('#ob-bar'), tap = ob.querySelector('#ob-tap');
  const MASCOT = 'img/a-4c79bab2.webp', ALEX = 'img/alex.webp';
  const CHECK = '<svg viewBox="0 0 24 24"><path d="m5 12 5 5L20 7"/></svg>';
  const Q = [
    { n: 3, ask: ['Gracias. Ahora, sin prisa: ¿cómo describirías tu situación sentimental?'], multi: false, demo: [1],
      opts: [['Tengo pareja', 'Estamos juntos y quiero cuidar la relación'], ['Es complicado', 'Hay algo que no termina de encajar'], ['Acabo de pasar una ruptura', 'Estoy intentando pasar página'], ['Estoy conociendo a alguien', 'Algo empieza y tengo dudas'], ['Estoy sin pareja', 'Quiero entenderme mejor en el amor']] },
    { n: 4, ask: ['Gracias por contármelo, Alex. Esas situaciones pesan mucho y está bien no tenerlo todo claro 💛', '¿Qué es lo que más te preocupa ahora mismo?'], multi: true, demo: [0, 1, 2],
      opts: [['Celos'], ['Inseguridades'], ['Comunicación en pareja'], ['Dependencia emocional'], ['Ruptura o duelo'], ['Soledad']] },
    { n: 5, ask: ['Tiene sentido: muchas veces van de la mano.', '¿Qué te gustaría conseguir hablando conmigo?'], multi: true, demo: [0, 1],
      opts: [['Mejorar mi autoestima'], ['Entender mis emociones'], ['Aprender a comunicarme'], ['Sanar una ruptura'], ['Superar la soledad'], ['Construir relaciones sanas']] }
  ];
  let gen = 0, q = 0, picked = new Set(), timers = [], idle = null, onDone = null, onProgress = null, busy = false, minute = 38;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const at = (ms, fn) => { const g = gen; timers.push(setTimeout(() => { if (g === gen) fn(); }, ms)); };
  const clock = () => `22:${String(minute++).padStart(2, '0')}`;
  const esc = t => t.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  const trim = () => { while (thread.children.length > 6) thread.firstElementChild.remove(); };
  const msg = (who, text) => {
    const el = document.createElement('div');
    el.className = 'ob-msg ' + who;
    el.innerHTML = `<img src="${who === 'ai' ? MASCOT : ALEX}" alt=""><div><b>${who === 'ai' ? 'Cuorami' : 'Alex'}</b><p>${esc(text)}<time>${clock()}${who === 'me' ? ' ✓✓' : ''}</time></p></div>`;
    thread.append(el); trim();
  };
  const typing = on => {
    let t = thread.querySelector('.ob-typing');
    if (on && !t) { t = document.createElement('div'); t.className = 'ob-msg ai ob-typing'; t.innerHTML = `<img src="${MASCOT}" alt=""><span><i></i><i></i><i></i></span>`; thread.append(t); trim(); }
    if (!on && t) t.remove();
  };
  const sheet = ob.querySelector('.ob-sheet');
  const pad = open => thread.style.setProperty('--ob-pad', open ? (sheet.offsetHeight + 14) + 'px' : '40px');
  const setLabel = () => {
    label.textContent = Q[q].multi ? `Puedes elegir varias · ${picked.size} elegida${picked.size === 1 ? '' : 's'}` : 'Elige una opción';
    send.disabled = !(Q[q].multi && picked.size);
  };
  const renderOpts = () => {
    const d = Q[q];
    opts.className = 'ob-opts' + (d.multi ? ' ob-multi' : '');
    opts.innerHTML = d.opts.map((o, i) => `<button type="button" class="ob-opt" data-i="${i}" style="animation-delay:${i * 45}ms"><span class="ob-mark">${d.multi ? CHECK : i + 1}</span><span><strong>${o[0]}</strong>${o[1] ? `<small>${o[1]}</small>` : ''}</span></button>`).join('');
    setLabel();
  };
  const armIdle = () => { clearTimeout(idle); if (reduced.matches) return; const g = gen; idle = setTimeout(() => { if (g === gen) autopilot(); }, 6500); };
  const tapOn = (el, then) => {
    const b = ob.getBoundingClientRect(), r = el.getBoundingClientRect(), k = b.width / 393 || 1;
    tap.style.left = ((r.left - b.left + r.width / 2) / k) + 'px';
    tap.style.top = ((r.top - b.top + r.height / 2) / k) + 'px';
    tap.classList.add('is-on'); tap.classList.remove('is-press');
    at(420, () => { void tap.offsetWidth; tap.classList.add('is-press'); then(); });
  };
  let pilot = 0;
  const human = () => { pilot++; tap.classList.remove('is-on'); armIdle(); };
  const autopilot = () => {
    const d = Q[q], p = ++pilot; let t = 0;
    const step = (ms, fn) => at(ms, () => { if (p === pilot) fn(); });
    d.demo.forEach(i => {
      step(t, () => { const el = opts.querySelector(`[data-i="${i}"]`); if (el && !el.classList.contains('is-on')) tapOn(el, () => { if (p === pilot) choose(i, true); }); });
      t += 900;
    });
    if (d.multi) step(t, () => tapOn(send, () => { if (p === pilot) submit(true); }));
    step(t + 700, () => tap.classList.remove('is-on'));
  };
  const ask = i => {
    q = i; picked = new Set(); busy = true;
    ob.classList.add('is-closed'); pad(false);
    count.textContent = `${Q[i].n} de 7`; bar.style.width = (Q[i].n / 7 * 100) + '%';
    let t = 500;
    Q[i].ask.forEach(text => { at(t, () => typing(true)); t += 900; at(t, () => { typing(false); msg('ai', text); }); t += 500; });
    at(t, () => { renderOpts(); ob.classList.remove('is-closed'); pad(true); busy = false; armIdle(); });
  };
  const choose = (i, auto) => {
    if (busy) return;
    const d = Q[q], el = opts.querySelector(`[data-i="${i}"]`);
    if (!auto) human();
    if (!d.multi) {
      opts.querySelectorAll('.ob-opt').forEach(o => o.classList.toggle('is-on', o === el));
      picked = new Set([i]); busy = true;
      at(380, () => { busy = false; submit(auto); });
      return;
    }
    if (picked.has(i)) picked.delete(i); else picked.add(i);
    el.classList.toggle('is-on', picked.has(i)); setLabel();
  };
  const submit = (auto, skipped) => {
    if (busy) return;
    const d = Q[q];
    if (!skipped && !picked.size) return;
    clearTimeout(idle); pilot++; busy = true; ob.classList.add('is-closed'); pad(false);
    const text = skipped ? 'Prefiero saltarme esta' : [...picked].sort((a, b) => a - b).map(i => d.opts[i][0]).join(', ');
    at(350, () => msg('me', text));
    if (onProgress) onProgress((q + 1) / Q.length);
    if (q + 1 < Q.length) { at(700, () => ask(q + 1)); return; }
    at(1000, () => typing(true));
    at(1900, () => { typing(false); count.textContent = '6 de 7'; bar.style.width = (6 / 7 * 100) + '%'; msg('ai', '¡Perfecto, Alex! Ya tengo lo que necesito para acompañarte a tu manera 🌱'); });
    at(2500, () => { const c = document.createElement('span'); c.className = 'ob-done'; c.textContent = 'Tu espacio está casi listo'; thread.append(c); trim(); });
    at(2600, () => { if (onDone) onDone(); });
  };
  opts.addEventListener('click', e => { const b = e.target.closest('.ob-opt'); if (b) choose(+b.dataset.i, false); });
  send.addEventListener('click', () => { human(); submit(false); });
  skip.addEventListener('click', () => { if (busy) return; human(); picked = new Set(); submit(false, true); });
  const stop = () => { gen++; timers.forEach(clearTimeout); timers = []; clearTimeout(idle); tap.classList.remove('is-on'); busy = false; };
  const start = (done, progress) => {
    stop(); onDone = done; onProgress = progress; minute = 38;
    thread.innerHTML = ''; opts.innerHTML = '';
    msg('me', '14 de marzo de 1997');
    ask(0);
  };
  return { start, stop };
})();

// Step 3: friend carousel. Switches every 5 s on its own; dots, thumbnails and side cards switch it by hand.
window.cuoPick = (() => {
  const pk = document.querySelector('#pk');
  if (!pk) return null;
  const track = pk.querySelector('#pk-track'), cards = [...track.children];
  const dots = [...pk.querySelectorAll('#pk-dots button')], thumbs = [...pk.querySelectorAll('#pk-thumbs button')];
  const line = pk.querySelector('#pk-line'), desc = pk.querySelector('#pk-desc'), cta = pk.querySelector('#pk-cta'), note = pk.querySelector('#pk-note');
  const ARROW = ' <svg viewBox="0 0 24 24"><path d="m9 6 6 6-6 6"/></svg>';
  const F = [
    { line: 'Lucas · Directo y sincero', desc: 'Te dice las cosas claras, con cariño pero sin rodeos. Ideal para tomar decisiones.', cta: 'Hablar con Lucas', note: '' },
    { line: 'Cristina · Cercana y cariñosa', desc: 'Te escucha sin prisa y te ayuda a entender lo que sientes, sin juzgarte.', cta: 'Hablar con Cristina', note: '' },
    { line: 'Tu amigo, a tu manera', desc: 'Elige su nombre, su imagen y su forma de ser. Lo creamos juntos en 2 minutos.', cta: 'Crear mi amigo', note: 'Incluido en Premium · 12,99 €/mes' }
  ];
  const STEP = 5000, CARD = 244, GAP = 18, W = 393;
  let cur = 0, timer = null, onDone = null, onProgress = null, seen = new Set();
  const show = i => {
    cur = i; seen.add(i);
    track.style.transform = `translateX(${(W - CARD) / 2 - i * (CARD + GAP)}px)`;
    cards.forEach((c, k) => c.classList.toggle('is-on', k === i));
    dots.forEach((d, k) => d.classList.toggle('is-on', k === i));
    thumbs.forEach((t, k) => t.classList.toggle('is-on', k === i));
    pk.dataset.tone = i;
    line.textContent = F[i].line; desc.textContent = F[i].desc; cta.innerHTML = F[i].cta + ARROW; note.innerHTML = F[i].note || '&nbsp;';
    if (onProgress) onProgress(seen.size / F.length);
  };
  const tick = () => {
    clearTimeout(timer);
    timer = setTimeout(() => { if (cur + 1 < F.length) { show(cur + 1); tick(); } else if (onDone) onDone(); }, STEP);
  };
  const pick = i => { show(i); tick(); };
  [...cards, ...dots, ...thumbs].forEach(el => el.addEventListener('click', () => pick(+el.dataset.i)));
  const stop = () => clearTimeout(timer);
  const start = (done, progress) => { stop(); onDone = done; onProgress = progress; seen = new Set(); show(0); tick(); };
  show(0);
  return { start, stop };
})();

// Step 4: Alex opens the chat with Lucas, picks who it is about and sends a voice note.
window.cuoLucas = (() => {
  const lc = document.querySelector('#lc');
  if (!lc) return null;
  const thread = lc.querySelector('#lc-thread'), sheet = lc.querySelector('#lc-sheet'), text = lc.querySelector('#lc-text');
  const time = lc.querySelector('#lc-time'), btn = lc.querySelector('#lc-btn'), tap = lc.querySelector('#lc-tap');
  const LUCAS = 'img/lucas.webp', ALEX = 'img/alex.webp';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let gen = 0, timers = [], ticks = [], onDone = null, onProgress = null, asking = false, pilot = 0, minute = 41;
  const at = (ms, fn) => { const g = gen; timers.push(setTimeout(() => { if (g === gen) fn(); }, ms)); };
  const clock = () => `22:${String(minute++).padStart(2, '0')}`;
  const trim = () => { while (thread.children.length > 7) thread.firstElementChild.remove(); };
  const add = html => { const w = document.createElement('div'); w.innerHTML = html.trim(); const el = w.firstElementChild; thread.append(el); trim(); return el; };
  const msg = (who, body, cls = '') => add(`<div class="lc-msg ${who}"><img src="${who === 'me' ? ALEX : LUCAS}" alt=""><div><b class="n">${who === 'me' ? 'Alex' : 'Lucas'}</b><p class="${cls}">${body}<time>${clock()}${who === 'me' ? ' ✓✓' : ''}</time></p></div></div>`);
  const typing = on => { let t = thread.querySelector('.lc-typing'); if (on && !t) add(`<div class="lc-typing"><img src="${LUCAS}" alt=""><span><i></i><i></i><i></i></span></div>`); if (!on && t) t.remove(); };
  const lucas = (ms, body, cls) => { at(ms, () => typing(true)); at(ms + 1100, () => { typing(false); msg('ai', body, cls); }); return ms + 1100; };
  const tapOn = (el, then) => {
    const b = lc.getBoundingClientRect(), r = el.getBoundingClientRect(), k = b.width / 393 || 1;
    tap.style.left = ((r.left - b.left + r.width / 2) / k) + 'px'; tap.style.top = ((r.top - b.top + r.height / 2) / k) + 'px';
    tap.classList.add('is-on'); tap.classList.remove('is-press');
    at(420, () => { void tap.offsetWidth; tap.classList.add('is-press'); then(); at(380, () => tap.classList.remove('is-on')); });
  };
  const typeIn = (str, then) => {
    lc.classList.add('is-typing'); let n = 0;
    const id = setInterval(() => { text.textContent = str.slice(0, ++n); if (n >= str.length) { clearInterval(id); then(); } }, 55);
    ticks.push(id);
  };
  const pad = open => thread.style.setProperty('--lc-pad', open ? (sheet.offsetHeight + 4) + 'px' : '12px');
  const open = () => { asking = true; lc.classList.add('is-asking'); pad(true); const p = ++pilot; at(5500, () => { if (p === pilot && asking) tapOn(sheet.querySelector('[data-p="Laura"]'), () => choose('Laura', true)); }); };
  const choose = (who, auto) => {
    if (!asking) return;
    asking = false; if (!auto) pilot++;
    sheet.querySelectorAll('[data-p]').forEach(b => b.classList.toggle('is-on', b.dataset.p === who));
    const say = who === 'new' ? 'Es sobre alguien nuevo' : who === 'none' ? 'No es sobre nadie en concreto' : `Es sobre ${who}`;
    if (onProgress) onProgress(.6);
    at(450, () => { lc.classList.remove('is-asking'); pad(false); msg('me', say); });
    voice(1400, who);
  };
  const voice = (t0, who) => {
    at(t0, () => { lc.classList.add('is-rec'); let s = 0; time.textContent = '0:00'; const id = setInterval(() => { s++; time.textContent = `0:0${Math.min(s, 9)}`; if (s >= 7) clearInterval(id); }, 520); ticks.push(id); });
    at(t0 + 4100, () => tapOn(btn, () => {}));
    at(t0 + 4550, () => {
      lc.classList.remove('is-rec');
      msg('me', '<span class="pl"></span><span class="wv">' + '<i></i>'.repeat(16) + '</span><em>0:07</em>', 'lc-voice');
    });
    at(t0 + 5300, () => add('<div class="lc-tr"><span>Transcripción</span>«No sé, es que cuando sale con sus amigos parece otra persona y yo me quedo esperando como una tonta.»</div>'));
    let t = lucas(t0 + 5900, 'No eres tonta por esperar un mensaje de alguien a quien quieres. Lo que describes es una necesidad muy normal: sentirte tenida en cuenta.');
    t = lucas(t + 900, '¿Se lo has dicho alguna vez así, tal cual?');
    at(t + 200, () => { if (onProgress) onProgress(1); });
    at(t + 2600, () => { if (onDone) onDone(); });
  };
  sheet.addEventListener('click', e => { const b = e.target.closest('[data-p]'); if (b) choose(b.dataset.p, false); });
  lc.querySelector('#lc-skip').addEventListener('click', () => choose('none', false));
  const stop = () => { gen++; timers.forEach(clearTimeout); ticks.forEach(clearInterval); timers = []; ticks = []; tap.classList.remove('is-on'); };
  const start = (done, progress) => {
    stop(); onDone = done; onProgress = progress; asking = false; minute = 41;
    thread.innerHTML = ''; text.textContent = ''; lc.classList.remove('is-asking', 'is-rec', 'is-typing'); pad(false);
    sheet.querySelectorAll('[data-p]').forEach(b => b.classList.remove('is-on'));
    add('<div class="lc-day">Hoy</div>');
    const first = 'Hola Lucas… hoy estoy un poco rayada 😕';
    if (reduced.matches) { msg('me', first); open(); return; }
    at(700, () => typeIn(first, () => at(500, () => tapOn(btn, () => { lc.classList.remove('is-typing'); text.textContent = ''; msg('me', first); if (onProgress) onProgress(.15); }))));
    let t = lucas(4600, '¡Hola, Alex! Justo me estoy haciendo un café ☕ Déjame que lo termine y nos sentamos a hablar, ¿vale?');
    t = lucas(t + 1200, '<img src="img/lucas-cafe.webp" alt=""><span>Listo, café en mano. Soy todo oídos 🙂</span>', 'lc-photo');
    at(t + 700, () => add('<div class="lc-mem"><svg viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/></svg>Recordando: la cena · hace 3 días</div>'));
    t = lucas(t + 1500, 'Vaya, siento que estés así. Estoy aquí 🤍 Cuéntame: ¿es sobre alguien de quien ya hemos hablado o es alguien nuevo?');
    at(t + 500, () => { if (onProgress) onProgress(.35); open(); });
  };
  return { start, stop };
})();

// Benefit 01: a short, private conversation with Cuorami that plays when it scrolls into view.
(() => {
  const bx = document.querySelector('#bx');
  if (!bx) return;
  const thread = bx.querySelector('#bx-thread'), text = bx.querySelector('#bx-text');
  const MASCOT = 'img/a-4c79bab2.webp', ALEX = 'img/alex.webp';
  const LOCK = '<svg viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let gen = 0, timers = [], ticker = null, minute = 21, running = false;
  const at = (ms, fn) => { const g = gen; timers.push(setTimeout(() => { if (g === gen) fn(); }, ms)); };
  const clock = () => `21:${String(minute++).padStart(2, '0')}`;
  const add = html => { const w = document.createElement('div'); w.innerHTML = html.trim(); thread.append(w.firstElementChild); while (thread.children.length > 5) thread.firstElementChild.remove(); };
  const msg = (who, body, cls = '') => add(`<div class="bx-msg ${who}"><img src="${who === 'me' ? ALEX : MASCOT}" alt=""><div><b class="n">${who === 'me' ? 'Alex' : 'Cuorami'}</b><p class="${cls}">${body}<time>${clock()}${who === 'me' ? ' ✓✓' : ''}</time></p></div></div>`);
  const typing = on => { const t = thread.querySelector('.bx-typing'); if (on && !t) add(`<div class="bx-typing"><img src="${MASCOT}" alt=""><span><i></i><i></i><i></i></span></div>`); if (!on && t) t.remove(); };
  const FIRST = 'Me da un poco de vergüenza admitirlo, pero no sé cómo volver a empezar.';
  const REPLY = 'Puedes contarlo tal como te salga. ¿Qué es lo que más te cuesta ahora mismo?';
  const SAFE = `<span class="lk">${LOCK}</span><span>Y recuerda: aquí puedes hablar con total tranquilidad. Lo que me cuentes se queda entre nosotros dos.</span>`;
  const stop = () => { gen++; timers.forEach(clearTimeout); timers = []; clearInterval(ticker); };
  const play = () => {
    stop(); minute = 21; thread.innerHTML = ''; text.textContent = ''; bx.classList.remove('is-typing', 'is-sent');
    if (reduced.matches) { msg('me', FIRST); msg('ai', REPLY); msg('ai', SAFE, 'bx-safe'); return; }
    at(500, () => {
      bx.classList.add('is-typing'); let n = 0;
      ticker = setInterval(() => { ++n; text.textContent = FIRST.slice(Math.max(0, n - 30), n); if (n >= FIRST.length) clearInterval(ticker); }, 42);
    });
    const sent = 500 + FIRST.length * 42 + 500;
    at(sent, () => { bx.classList.add('is-sent'); });
    at(sent + 180, () => { bx.classList.remove('is-typing', 'is-sent'); text.textContent = ''; msg('me', FIRST); });
    at(sent + 900, () => typing(true));
    at(sent + 2200, () => { typing(false); msg('ai', REPLY); });
    at(sent + 3200, () => typing(true));
    at(sent + 4700, () => { typing(false); msg('ai', SAFE, 'bx-safe'); });
    at(sent + 11000, () => { if (running) play(); });
  };
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !running) { running = true; play(); }
      else if (!e.isIntersecting && running) { running = false; stop(); }
    }, { threshold: .35 }).observe(bx);
  } else { running = true; play(); }
})();

// Benefit 02: Cuorami's plan ideas arrive as app notifications, one after another.
(() => {
  const pl = document.querySelector('#pl');
  if (!pl) return;
  const notes = [...pl.querySelectorAll('.pl-note')];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let timers = [], running = false;
  const at = (ms, fn) => timers.push(setTimeout(fn, ms));
  const stop = () => { timers.forEach(clearTimeout); timers = []; };
  const place = order => notes.forEach(n => { const k = order.indexOf(+n.dataset.n); n.style.setProperty('--slot', k); n.style.zIndex = 10 - k; n.classList.toggle('is-in', k >= 0); });
  const play = () => {
    stop(); pl.classList.remove('is-pick', 'is-saved'); place([]);
    if (reduced.matches) { place([2, 1, 0]); pl.classList.add('is-pick', 'is-saved'); return; }
    // newest notification lands on top and pushes the others down
    at(400, () => place([0]));
    at(1700, () => place([1, 0]));
    at(3000, () => place([2, 1, 0]));
    at(4300, () => pl.classList.add('is-pick'));
    at(5200, () => pl.classList.add('is-saved'));
    at(9000, () => { place([]); pl.classList.remove('is-pick', 'is-saved'); });
    at(9800, () => { if (running) play(); });
  };
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !running) { running = true; play(); }
      else if (!e.isIntersecting && running) { running = false; stop(); }
    }, { threshold: .35 }).observe(pl);
  } else { running = true; play(); }
})();

// Benefit 03: the three small steps appear around Cuorami, one after another.
(() => {
  const cf = document.querySelector('#cf');
  if (!cf) return;
  const pills = [...cf.querySelectorAll('.cf-pill')];
  const mascot = cf.querySelector('.cf-mascot');
  const stage = cf.querySelector('.cf-stage');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let timers = [], running = false;
  const at = (ms, fn) => timers.push(setTimeout(fn, ms));
  const stop = () => { timers.forEach(clearTimeout); timers = []; };
  // the scene is drawn for 443px and scaled down on narrow cards
  const fit = () => { const w = cf.clientWidth, k = Math.min(1, w / 443); cf.style.setProperty('--cfk', k); stage.style.width = (w / k) + 'px'; };
  fit(); if ('ResizeObserver' in window) new ResizeObserver(fit).observe(cf);
  const hop = () => { mascot.classList.remove('is-hop'); void mascot.offsetWidth; mascot.classList.add('is-hop'); };
  const show = i => { pills[i].classList.add('is-in'); hop(); };
  const play = () => {
    stop(); cf.classList.remove('is-done'); pills.forEach(p => p.classList.remove('is-in'));
    if (reduced.matches) { pills.forEach(p => p.classList.add('is-in')); return; }
    at(500, () => show(0));
    at(1700, () => show(1));
    at(2900, () => show(2));
    at(3600, () => cf.classList.add('is-done'));
    at(8200, () => { pills.forEach(p => p.classList.remove('is-in')); cf.classList.remove('is-done'); });
    at(9100, () => { if (running) play(); });
  };
  mascot.addEventListener('animationend', () => mascot.classList.remove('is-hop'));
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !running) { running = true; play(); }
      else if (!e.isIntersecting && running) { running = false; stop(); }
    }, { threshold: .35 }).observe(cf);
  } else { running = true; play(); }
})();

// Metrics: cards and phone rise in once; numbers count up one by one (1%, 2%, 3%… / 1, 2, 3, 4) every time the section comes into view.
(() => {
  const mx = document.querySelector('.mx');
  if (!mx) return;
  const nums = [...mx.querySelectorAll('[data-n]')];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let timers = [];
  const stop = () => { timers.forEach(clearTimeout); timers = []; };
  const reset = () => { stop(); nums.forEach(b => { b.textContent = '0'; b.closest('.mx-card').classList.remove('is-counted'); }); };
  const count = () => nums.forEach((b, k) => {
    const to = +b.dataset.n;
    const step = Math.min(320, 1900 / to); // small numbers tick slowly, percentages run quickly
    let n = 0;
    const tick = () => { n++; b.textContent = n; if (n < to) timers.push(setTimeout(tick, step)); else b.closest('.mx-card').classList.add('is-counted'); };
    timers.push(setTimeout(tick, 550 + k * 120));
  });
  if (reduced) { mx.classList.add('is-in'); return; }
  reset();
  if (!('IntersectionObserver' in window)) { mx.classList.add('is-in'); count(); return; }
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { mx.classList.add('is-in'); reset(); count(); }
    else reset();
  }, { threshold: .3 }).observe(mx);
})();

// FAQ: one question open at a time; cards rise in when the list comes into view.
(() => {
  const fq = document.querySelector('.fq');
  if (!fq) return;
  const items = [...fq.querySelectorAll('.fq-item')];
  const set = (item, open) => { item.classList.toggle('is-open', open); item.querySelector('.fq-q').setAttribute('aria-expanded', open); };
  items.forEach(item => item.querySelector('.fq-q').addEventListener('click', () => {
    const open = !item.classList.contains('is-open');
    items.forEach(o => { if (o !== item) set(o, false); });
    set(item, open);
  }));
  if (!('IntersectionObserver' in window)) return fq.classList.add('is-in');
  const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { fq.classList.add('is-in'); io.disconnect(); } }, { threshold: .15 });
  io.observe(fq.querySelector('.fq-list'));
})();

// Benefit 04: the small locks close one by one, then Cuorami's shackle snaps shut.
(() => {
  const lk = document.querySelector('#lk');
  if (!lk) return;
  const minis = [...lk.querySelectorAll('.lk-mini')];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let timers = [], running = false;
  const at = (ms, fn) => timers.push(setTimeout(fn, ms));
  const stop = () => { timers.forEach(clearTimeout); timers = []; };
  const reset = () => { lk.classList.remove('is-locked'); minis.forEach(m => m.classList.remove('is-on')); };
  const play = () => {
    stop(); reset();
    if (reduced.matches) { lk.classList.add('is-locked'); minis.forEach(m => m.classList.add('is-on')); return; }
    minis.forEach((m, k) => at(500 + k * 260, () => m.classList.add('is-on')));
    at(500 + minis.length * 260 + 200, () => lk.classList.add('is-locked'));
    at(7600, reset);
    at(8600, () => { if (running) play(); });
  };
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !running) { running = true; play(); }
      else if (!e.isIntersecting && running) { running = false; stop(); }
    }, { threshold: .35 }).observe(lk);
  } else { running = true; play(); }
})();

// Comparison: the "Con Cuorami" benefits get ticked one by one while the card is on screen.
(() => {
  const card = document.querySelector('#cmp-with');
  if (!card) return;
  const items = [...card.querySelectorAll('li')];
  const num = card.querySelector('.cmp-count b');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let timers = [], running = false;
  const at = (ms, fn) => timers.push(setTimeout(fn, ms));
  const stop = () => { timers.forEach(clearTimeout); timers = []; };
  const reset = () => { items.forEach(li => li.classList.remove('is-on', 'is-done')); num.textContent = '0'; };
  const play = () => {
    stop(); reset();
    if (reduced.matches) { items.forEach(li => li.classList.add('is-on', 'is-done')); num.textContent = items.length; return; }
    items.forEach((li, k) => {
      at(400 + k * 650, () => { li.classList.add('is-on'); num.textContent = k + 1; });
      at(400 + k * 650 + 450, () => li.classList.add('is-done'));
    });
    at(400 + items.length * 650 + 4500, reset);
    at(400 + items.length * 650 + 5300, () => { if (running) play(); });
  };
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !running) { running = true; play(); }
      else if (!e.isIntersecting && running) { running = false; stop(); }
    }, { threshold: .4 }).observe(card);
  } else { running = true; play(); }
})();

// Steps panel: prev/next arrows (shown on mobile) step through the same dots.
(() => {
  const sec = document.querySelector('.s-how');
  if (!sec) return;
  const dots = [...sec.querySelectorAll('.s-dot')];
  const cur = () => Math.max(0, dots.findIndex(d => d.classList.contains('is-on')));
  sec.querySelectorAll('.s-arrow').forEach(b => b.addEventListener('click', e => {
    e.stopPropagation();
    const dir = b.classList.contains('next') ? 1 : -1;
    dots[(cur() + dir + dots.length) % dots.length].click();
  }));
})();

// Mobile steps: numbered track above the phone shows only the active step's title and text.
(() => {
  const sec = document.querySelector('.s-how');
  const box = sec && sec.querySelector('.s-mstep');
  if (!box) return;
  const dots = [...sec.querySelectorAll('.s-dot')];
  const steps = [...sec.querySelectorAll('.s-step')];
  const tks = [...box.querySelectorAll('.s-tk')], lines = [...box.querySelectorAll('.s-track i')];
  const title = box.querySelector('.s-m-title'), desc = box.querySelector('.s-m-desc');
  let shown = -1;
  const sync = () => {
    const i = Math.max(0, dots.findIndex(d => d.classList.contains('is-on')));
    if (i === shown) return;
    shown = i;
    tks.forEach((t, k) => { t.classList.toggle('is-on', k === i); t.classList.toggle('is-done', k < i); });
    lines.forEach((l, k) => l.classList.toggle('is-done', k < i));
    title.textContent = steps[i].querySelector('h3').textContent.trim();
    desc.textContent = steps[i].querySelector('p').textContent.trim();
    box.classList.remove('is-swap'); void box.offsetWidth; box.classList.add('is-swap');
  };
  tks.forEach((t, k) => t.addEventListener('click', e => { e.stopPropagation(); dots[k].click(); }));
  dots.forEach(d => new MutationObserver(sync).observe(d, { attributes: true, attributeFilter: ['class'] }));
  sync();
})();

// Quick chat: mobile floating button opens a short conversational contact pop-up (demo, nothing is sent).
(() => {
  const fab = document.querySelector('#qc-open'), qc = document.querySelector('#qc');
  if (!fab || !qc) return;
  const form = qc.querySelector('#qc-form'), done = qc.querySelector('#qc-done'), err = qc.querySelector('#qc-error');
  let lastFocus = null;
  const open = () => {
    lastFocus = document.activeElement;
    qc.hidden = false; document.body.classList.add('qc-lock');
    requestAnimationFrame(() => qc.classList.add('is-open'));
    setTimeout(() => form.hidden ? done.querySelector('button').focus() : form.querySelector('input').focus(), 350);
  };
  const close = () => {
    qc.classList.remove('is-open'); document.body.classList.remove('qc-lock');
    setTimeout(() => { qc.hidden = true; if (lastFocus) lastFocus.focus(); }, 420);
  };
  fab.addEventListener('click', open);
  qc.querySelectorAll('[data-qc-close]').forEach(b => b.addEventListener('click', close));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !qc.hidden) close(); });
  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = form.elements.name.value.trim(), email = form.elements.email.value.trim();
    const msg = !name ? 'Escribe tu nombre para poder saludarte.' : !/^\S+@\S+\.\S+$/.test(email) ? 'Revisa tu email, parece que falta algo.' : '';
    err.textContent = msg; err.hidden = !msg;
    if (msg) return;
    qc.querySelector('#qc-thanks').textContent = `¡Gracias, ${name}! Te escribiremos a ${email} para que empieces a chatear con Cuorami.`;
    form.hidden = true; done.hidden = false; done.querySelector('button').focus();
  });
  // keep the button out of the way where it would duplicate the real contact form
  const contact = document.querySelector('#contacto');
  if (contact && 'IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => fab.classList.toggle('is-hidden', e.isIntersecting), { threshold: .15 }).observe(contact);
  }
})();

// Text reveal: split headings into words that rise in when seen; lead paragraphs light up word by word with scroll.
(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  const wrapWords = (el, cls) => {
    let k = 0;
    const walk = node => [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
          const w = document.createElement('span'); w.className = cls; w.style.setProperty('--k', k++); w.textContent = part; frag.appendChild(w);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && n.tagName !== 'BR') {
        // styled inline pieces (gradient words, bold) move as one unit so their look stays intact
        if (cls === 'tx-w') { n.classList.add(cls); n.style.setProperty('--k', k++); } else walk(n);
      }
    });
    walk(el);
  };
  const once = (els, margin = '0px 0px -12% 0px') => {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('tx-in'); io.unobserve(e.target); } }), { rootMargin: margin });
    els.forEach(el => io.observe(el));
  };
  const heads = [...document.querySelectorAll('.n-hero h1, main h2, section h2, .benefit-copy h3, .compare-card h3')]
    .filter((h, i, a) => a.indexOf(h) === i && !h.closest('.rp-slot, .s-slot, .v2-phone, .mx-phone'));
  heads.forEach(h => wrapWords(h, 'tx-w'));
  once(heads);
  // the hero title plays right away on load
  const h1 = document.querySelector('.n-hero h1');
  if (h1) setTimeout(() => h1.classList.add('tx-in'), 150);
  // small labels, intro lines and buttons fade up
  const ups = [...document.querySelectorAll('.h-friends, .eyebrow, .benefit-index, .n-hero .hero-intro, .benefit-detail, .section-heading > p:not(.eyebrow), .mx-head .data-note, .fq-head .eyebrow, .comparison-cta, .compare-note')]
    .filter(el => !el.closest('.rp-slot, .s-slot'));
  ups.forEach(el => el.classList.add('tx-up'));
  once(ups);
  // lead paragraphs: words go from 20% to full opacity as the paragraph scrolls through the screen
  const paras = [...document.querySelectorAll('.benefit-copy > p:not(.review-note), .s-head > p:not(.eyebrow), .contact-copy > p')];
  paras.forEach(p => { p.classList.add('tx-p'); wrapWords(p, 'tx-pw'); });
  const items = paras.map(p => ({ p, ws: [...p.querySelectorAll('.tx-pw')] }));
  let ticking = false;
  const paint = () => {
    ticking = false;
    const vh = innerHeight;
    items.forEach(({ p, ws }) => {
      const r = p.getBoundingClientRect();
      if (r.bottom < -50 || r.top > vh + 50) return;
      const prog = Math.min(1, Math.max(0, (vh * .88 - r.top) / (vh * .45)));
      const lit = Math.round(prog * ws.length);
      ws.forEach((w, i) => w.classList.toggle('is-lit', i < lit));
    });
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(paint); } }, { passive: true });
  addEventListener('resize', paint);
  paint();
})();
