/* ==========================================================================
   ARTEM uPVC — Interactions
   Plain JavaScript, no build step. Content comes from js/data.js.
   ========================================================================== */
(function () {
  "use strict";

  document.documentElement.classList.remove("no-js");
  const D = window.ARTEM;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  /** Local images are stored as <name>-800.jpg and <name>-1600.jpg. Pass the name without the suffix.
      A full filename (ending in .jpg/.png/.webp) is used as-is. */
  const isFile = (src) => /\.(jpe?g|png|webp|avif)$/i.test(src);
  const imgUrl = (src, w) => (isFile(src) ? src : `${src}-${w > 800 ? 1600 : 800}.jpg`);
  const srcset = (src) => (isFile(src) ? "" : `${src}-800.jpg 800w, ${src}-1600.jpg 1600w`);

  /* ---------------------------------------------------------------- NAV */
  const root = document.documentElement;
  const nav = $("#nav");
  const hero = $(".hero");
  const actionBar = $("#actionBar");
  const quoteSec = $("#quote");
  const menuIsOpen = () => document.body.classList.contains("menu-open");

  /* ======================================================== LOGO FLIGHT
     Same approach as the VaelorCoat site: there is ONE visible logo — the
     navbar's. At the top of the page it is drawn (via transform) at the size
     and position of the invisible .hero__brand placeholder in the centre of
     the hero; as the visitor scrolls through the first ~45% of the hero it
     travels up and shrinks into its navbar slot. Everything is a pure
     function of scrollY, so scrolling back reverses it exactly — no fades
     between two logos, no jumps. It runs with Reduce Motion on too: it is
     driven directly by the visitor's own scrolling (no autonomous motion),
     and disabling it would leave two logos on screen.                       */
  const brand = $("#brand");
  const heroBrand = $("#heroBrand");
  const flight = (function () {
    if (!brand || !heroBrand) { root.classList.add("flight-ready"); return { measure() {}, update() { return undefined; } }; }
    root.classList.add("logo-flight");
    const clamp01 = (v) => Math.min(1, Math.max(0, v));
    const easeIO = (k) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);
    let nx = 0, ny = 0, nw = 1, bx = 0, by = 0, bw = 1, D = 300, lastT = "", lastH = 0;
    const measure = () => {
      brand.style.transform = "none";
      const r = brand.getBoundingClientRect();           // navbar slot (fixed → viewport coords)
      nx = r.left + r.width / 2; ny = r.top + r.height / 2; nw = r.width || 1;
      const b = heroBrand.getBoundingClientRect();       // hero placeholder (→ page coords)
      bx = b.left + b.width / 2; by = b.top + b.height / 2 + scrollY; bw = b.width || 1;
      D = Math.max(220, hero.offsetHeight * 0.45);       // scroll distance of the whole flight
      lastT = "none"; lastH = hero.offsetHeight;
    };
    const update = () => {
      if (hero.offsetHeight !== lastH) measure();
      const p = clamp01(scrollY / D), e = easeIO(p);
      let t = "";
      if (e < 1 && !menuIsOpen()) {
        const s0 = bw / nw, sc = s0 + (1 - s0) * e;
        const cx = bx + (nx - bx) * e;
        const cy = (by - scrollY) + (ny - (by - scrollY)) * e;   // current centre, viewport coords
        t = `translate3d(${(cx - nx).toFixed(2)}px,${(cy - ny).toFixed(2)}px,0) scale(${sc.toFixed(4)})`;
      }
      if (t !== lastT) { brand.style.transform = t; lastT = t; }
      return p;
    };
    const ready = () => { measure(); update(); root.classList.add("flight-ready"); };
    [brand.querySelector("img"), heroBrand].forEach((im) => { if (im && !im.complete) im.addEventListener("load", () => { measure(); update(); }, { once: true }); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { measure(); update(); });
    requestAnimationFrame(ready);
    return { measure, update };
  })();

  let ticking = false;
  const onScroll = () => {
    const y = window.scrollY;
    const p = flight.update();
    // The light bar appears once the logo has mostly arrived, so it never cuts across the flying logo.
    nav.dataset.state = (p === undefined ? y > 40 : p > 0.72) ? "scrolled" : "top";
    // Mobile action bar: show after the hero, hide while the quote form is on screen
    const pastHero = y > hero.offsetHeight * 0.6;
    const qr = quoteSec.getBoundingClientRect();
    const inQuote = qr.top < window.innerHeight * 0.7 && qr.bottom > 0;
    actionBar.classList.toggle("is-visible", pastHero && !inQuote);
    ticking = false;
  };
  window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener("resize", () => { flight.measure(); onScroll(); });
  flight.measure();
  onScroll();

  // Highlight current section in the nav
  const navLinks = $$(".nav__links a");
  const sectionObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        navLinks.forEach((a) => a.setAttribute("aria-current", a.getAttribute("href") === "#" + en.target.id ? "true" : "false"));
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  navLinks.forEach((a) => {
    const sec = $(a.getAttribute("href"));
    if (sec) sectionObs.observe(sec);
  });

  /* -------------------------------------------------------- MOBILE MENU */
  const toggle = $("#navToggle");
  const menu = $("#mobileMenu");

  // When the menu opens over the hero, the logo glides into the bar (and back out when it closes).
  const snapLogo = () => {
    brand.classList.add("is-snapping");
    onScroll();
    setTimeout(() => brand.classList.remove("is-snapping"), 460);
  };
  const setMenu = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.classList.toggle("menu-open", open);
    document.body.style.overflow = open ? "hidden" : "";
    snapLogo();
    if (open) {
      menu.hidden = false;
      requestAnimationFrame(() => menu.classList.add("is-open"));
      $("a", menu).focus({ preventScroll: true });
    } else {
      menu.classList.remove("is-open");
      setTimeout(() => { if (toggle.getAttribute("aria-expanded") === "false") menu.hidden = true; }, 350);
    }
  };
  toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
  $$("a", menu).forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") { setMenu(false); toggle.focus(); }
  });
  window.matchMedia("(min-width: 1025px)").addEventListener("change", (m) => m.matches && setMenu(false));

  /* --------------------------------------------------------- HERO VIDEO */
  // ONE film everywhere. Autoplays muted, loops, plays inline — no visible controls.
  //  · Landscape screens: the film fills the hero (hero-desktop.mp4; a lighter identical
  //    encode on screens ≤ 1024px wide).
  //  · Portrait screens: the complete 16:9 frame is shown uncropped below the logo
  //    (object-fit: contain, see CSS) on a plain dark background.
  const video = $("#heroVideo");
  const saveData = navigator.connection && navigator.connection.saveData;
  const portraitMQ = window.matchMedia("(max-aspect-ratio: 1/1)");   // same rule as the CSS layout
  const srcFor = () => (portraitMQ.matches || window.innerWidth <= 1024 ? video.dataset.srcLight : video.dataset.src);
  let currentSrc = srcFor();

  // Hero height = the real visible screen height. Set on load and when the width or
  // orientation changes — NOT when the mobile browser bar collapses mid-scroll, which
  // would otherwise make the hero (and the logo's start point) jump.
  let lastW = window.innerWidth;
  const setHeroHeight = () => root.style.setProperty("--hero-h", window.innerHeight + "px");
  setHeroHeight();

  // The main video stays invisible (opacity 0) until frames are actually playing, so the
  // visitor only ever sees the poster still or moving footage — never a black box, a
  // native play button or a frozen first frame.
  let wantPlay = false;
  let heroVisible = true;
  const showVideo = () => hero.classList.add("video-on");
  const giveUp = () => {
    wantPlay = false;
    hero.classList.remove("video-on");
    video.removeAttribute("src"); video.load();
  };
  const playMuted = (v) => {
    v.muted = true; v.defaultMuted = true; v.playsInline = true;   // iOS requires muted for autoplay
    const pr = v.play();
    if (pr && pr.catch) pr.catch(() => { /* refused (e.g. iOS Low Power Mode): stills stay; retried on next tap */ });
  };

  const tryPlay = () => { playMuted(video); };
  if (!saveData && video) {
    wantPlay = true;
    video.preload = "auto";
    video.src = currentSrc;
    video.addEventListener("playing", showVideo);
    video.addEventListener("error", giveUp, { once: true });
    // If nothing has played after 12 s (very slow network / decode failure) keep the still.
    setTimeout(() => { if (wantPlay && video.readyState < 2 && video.paused) giveUp(); }, 12000);
    tryPlay();
    // Browsers that refused autoplay usually allow it after a real tap/click — retry quietly then.
    const retry = () => { if (wantPlay && video.paused && heroVisible) tryPlay(); };
    ["touchend", "click", "keydown"].forEach((ev) => window.addEventListener(ev, retry, { passive: true }));
    document.addEventListener("visibilitychange", () => { if (!document.hidden) retry(); });
    window.addEventListener("pageshow", retry);   // returning via the back button (bfcache)
  }

  // Screen changed shape (rotation, split view, window resize): re-fit the hero height,
  // re-place the logo and switch file if needed (continuing from the same moment).
  let resizeTimer = 0;
  const onScreenChange = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (window.innerWidth !== lastW) { lastW = window.innerWidth; setHeroHeight(); }
      flight.measure(); onScroll();                  // logo start point follows the new layout
      if (!wantPlay) return;
      const next = srcFor();
      if (next === currentSrc) return;
      currentSrc = next;
      const t = video.currentTime || 0;
      hero.classList.remove("video-on");
      video.src = currentSrc;
      video.addEventListener("loadedmetadata", () => {
        try { video.currentTime = video.duration ? t % video.duration : 0; } catch (_) { /* ignore */ }
        if (heroVisible) tryPlay();
      }, { once: true });
    }, 180);
  };
  window.addEventListener("resize", onScreenChange);
  window.addEventListener("orientationchange", () => { lastW = -1; onScreenChange(); });

  // Don't burn battery decoding video nobody can see
  new IntersectionObserver(([en]) => {
    heroVisible = en.isIntersecting;
    if (!wantPlay) return;
    if (heroVisible) { tryPlay(); } else { video.pause(); }
  }).observe(hero);

  /* ------------------------------------------------------------- REVEAL */
  const revealObs = new IntersectionObserver(
    (entries) => entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-in"); revealObs.unobserve(en.target); } }),
    { threshold: 0.12 }
  );
  $$(".reveal").forEach((el) => revealObs.observe(el));

  /* ------------------------------------------- OPENING-TYPE DIAGRAMS */
  // Simple catalog-style line drawings showing how each type opens.
  const OPS = {
    slide: ["Panels slide sideways on a track", '<rect x="4" y="8" width="40" height="32"/><path d="M24 8v32"/><path d="M10 24h10M16 20l4 4-4 4M38 24H28M32 20l-4 4 4 4"/>'],
    casement: ["Side-hinged, swings outward", '<rect x="8" y="6" width="32" height="36"/><path d="M40 6 8 24l32 18" stroke-dasharray="3 3"/>'],
    awning: ["Top-hinged, pushes out from the bottom", '<rect x="6" y="8" width="36" height="32"/><path d="M6 40 24 8l18 32" stroke-dasharray="3 3"/>'],
    fixed: ["Fixed glass — does not open", '<rect x="6" y="6" width="36" height="36"/><path d="M14 20l8-8M14 30l18-18" opacity=".55"/>'],
    corner: ["Two runs of glass meeting at a corner", '<path d="M5 10l15 7v25L5 36z"/><path d="M20 17h23v25H20"/><path d="M12.5 13.5v25M31.5 17v25" opacity=".55"/>'],
    "slide-door": ["Large panels slide past each other", '<rect x="6" y="4" width="36" height="40"/><path d="M24 4v40"/><path d="M11 24h9M16 20l4 4-4 4M37 24h-9M32 20l-4 4 4 4"/>'],
    french: ["Pair of hinged doors opening from the middle", '<rect x="6" y="4" width="36" height="40"/><path d="M24 4v40"/><path d="M6 4l18 20L6 44M42 4 24 24l18 20" stroke-dasharray="3 3"/>'],
  };
  const opSvg = (op) => (OPS[op] ? `<svg viewBox="0 0 48 48" aria-hidden="true">${OPS[op][1]}</svg>` : "");

  /* ----------------------------------------------------------- PRODUCTS */
  const tabsEl = $("#productTabs");
  const grid = $("#productGrid");
  const catLabel = Object.fromEntries(D.categories.map((c) => [c.id, c.label]));

  tabsEl.innerHTML = D.categories
    .map((c, i) => `<button class="tab" role="tab" id="tab-${c.id}" data-cat="${c.id}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${esc(c.label)}</button>`)
    .join("");

  /* Endless 3D ring carousel ---------------------------------------------------
     The cards stand in a full circle (a cylinder), tilted so it is seen slightly from
     above: the front row is big and sharp, the back row smaller behind it. Only the
     ring's own transform changes while it spins, so it stays smooth on phones.
     `pos` = rotation in cards (1 = one card). Ways to turn it:
       · swipe / drag (follows the finger 1:1, then glides with the release speed)
       · scrolling the page past it (mouse / trackpad only — on phones, swipe)
       · horizontal trackpad / Shift + wheel, ← → keys, arrow buttons, click a card.
     When it comes to rest, the nearest card sits at the front; its name, short
     description and "View details" are shown under the ring. */
  const carousel = (() => {
    const wrap = $("#productCarousel");
    const stage = $("#productStage");
    const ring = grid;
    const nowEl = $("#pcarNow"), allEl = $("#pcarAll"), statusEl = $("#pcarStatus");
    const nameEl = $("#pcarName"), tagEl = $("#pcarTag"), textEl = $(".pcar__text", wrap);
    const MIN_SLIDES = 12;                   // a full ring needs at least this many cards
    const TILT = 0;                          // degrees: 0 = ring seen straight on (eye level)
    const SETTLE = 0.42;                     // spring settle time (s)
    const SCROLL_PX = 150;                   // page scroll (px) that turns the ring by one card
    let real = [], slides = [], N = 0, theta = 30;
    let pos = 0, target = 0, vel = 0, raf = 0, last = 0;
    let R = 400, spacing = 220, P = 1200, stageW = 400;
    let drag = null, moved = false, front = -1, activeK = -1;
    const pad = (n) => String(n).padStart(2, "0");
    const mod = (a, n) => ((a % n) + n) % n;

    // Scroll link: how far the section is from the middle of the screen, in cards
    let scrollOff = 0;
    const scrollLinked = !reduceMotion && !window.matchMedia("(pointer: coarse)").matches;
    const readScroll = () => {
      if (!scrollLinked) return 0;
      const r = stage.getBoundingClientRect();
      return (window.innerHeight / 2 - (r.top + r.height / 2)) / SCROLL_PX;
    };
    const shown = () => pos + scrollOff;               // the rotation actually on screen

    const cardHtml = (p, i) => `
      <article class="product" role="group" aria-roledescription="slide">
        <button class="product__btn" type="button" data-id="${p.id}" data-i="${i}" aria-haspopup="dialog" tabindex="-1"
          aria-label="${esc(p.name)} — view details">
          <div class="product__img">
            <img src="${imgUrl(p.img, 800)}" srcset="${srcset(p.img)}" sizes="(max-width:600px) 40vw, 260px"
              alt="" loading="lazy" decoding="async" draggable="false" />
          </div>
        </button>
      </article>`;

    const measure = () => {
      if (!N) return;
      const w = slides[0].offsetWidth, h = w * 1.25;
      spacing = w * 1.1;
      theta = 360 / N;
      R = spacing / (2 * Math.tan(Math.PI / N));
      P = Math.max(900, R * 2.8);                       // camera distance
      stageW = stage.clientWidth;
      const t = (TILT * Math.PI) / 180;
      const sBack = P / (P + 2 * R);
      const above = Math.max(R * Math.sin(t) * sBack + (h / 2) * sBack, h / 2 - R * Math.sin(t));   // back row or front row, whichever reaches higher
      const below = R * Math.sin(t) + h / 2;
      const top = 24, bottom = 46;
      ring.style.perspective = P.toFixed(0) + "px";
      stage.style.setProperty("--cy", (top + above).toFixed(0) + "px");
      stage.style.setProperty("--stage-h", (top + above + below + bottom).toFixed(0) + "px");
      stage.style.setProperty("--floor-w", (2 * R + w).toFixed(0) + "px");
      slides.forEach((el) => { el._t = el._o = el._z = el._back = undefined; });
      scrollOff = readScroll();
      render();
    };

    const render = () => {
      const p = shown();
      // iPhone-friendly 3D: there is NO shared 3D scene (no preserve-3d) for Safari to depth-sort
      // every frame. Each card gets its own simple transform; stacking order (z-index) is only
      // touched when two cards actually swap places; shading flips only when a card crosses to
      // the back half. Per frame = one composited transform (+ opacity at the edges) per card.
      stage._pos = p;                                   // read by the test scripts only
      const half = stageW / 2, order = [];
      for (let k = 0; k < N; k++) {
        const el = slides[k];
        const a = (mod(k - p + N / 2, N) - N / 2) * theta;            // degrees from the front
        const rad = (a * Math.PI) / 180, c = Math.cos(rad);
        const x = R * Math.sin(rad), z = R * (c - 1);                  // front card at z = 0
        const back = c < 0;
        const rot = back ? a + 180 : a;                                // back row shows the ring's inner side
        const tf = `translate3d(${x.toFixed(1)}px,0,${z.toFixed(1)}px) rotateY(${rot.toFixed(2)}deg)`;
        if (el._t !== tf) { el.style.transform = tf; el._t = tf; }
        const sx = Math.abs(x) * (P / (P - z));                        // on-screen distance from centre
        const o = Math.round(Math.max(0, Math.min(1, (half - sx) / (half * 0.2))) * 20) / 20;   // soft edge fade
        if (el._o !== o) { el.style.opacity = o; el._o = o; }
        if (el._back !== back) { el.classList.toggle("is-back", back); el._back = back; }
        order.push([z, k]);
      }
      order.sort((m, n) => m[0] - n[0]);
      for (let i = 0; i < N; i++) { const el = slides[order[i][1]]; if (el._z !== i) { el.style.zIndex = i; el._z = i; } }
      const f = mod(Math.round(p), N);
      if (f !== front) {
        front = f;
        const i = f % real.length;
        nowEl.textContent = pad(i + 1);
        nameEl.textContent = real[i].name;
        tagEl.textContent = real[i].tagline;
      }
    };

    // Only the front card is reachable with Tab / exposed to screen readers.
    const applyActive = (announce) => {
      const k = mod(Math.round(target + scrollOff), N);
      if (k === activeK && !announce) return;
      slides.forEach((el, j) => {
        el.setAttribute("aria-hidden", j === k ? "false" : "true");
        $(".product__btn", el).tabIndex = j === k ? 0 : -1;
      });
      const i = k % real.length;
      slides[k].setAttribute("aria-label", `${i + 1} of ${real.length}`);
      if (announce && k !== activeK) statusEl.textContent = `${real[i].name}, ${i + 1} of ${real.length}`;
      activeK = k;
    };

    const tick = (t) => {
      const dt = (last ? Math.min(64, t - last) : 16.7) / 1000;
      last = t;
      if (drag) {
        // Touch events arrive ~60×/s but iPhones draw up to 120×/s: glide toward the finger
        // every frame (≈30 ms lag, imperceptible) instead of jumping on each touch event.
        const prev = pos;
        // predict where the finger is *now* (between touch events) from its current speed,
        // so every frame takes an even step instead of pulsing after each touch event
        const ahead = drag.lt ? Math.min(0.034, Math.max(0, (t - drag.lt) / 1000)) : 0;
        const aim = target + (drag.v || 0) * ahead;
        pos += (aim - pos) * (reduceMotion ? 1 : 1 - Math.exp(-dt / 0.022));
        vel = dt ? (pos - prev) / dt : 0;
      } else {
        if (reduceMotion) { pos = target; vel = 0; }
        else {                                            // critically damped spring: smooth, no bounce
          const w = 2 / SETTLE, x = w * dt, e = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
          const ch = pos - target, tmp = (vel + w * ch) * dt;
          vel = (vel - w * tmp) * e;
          pos = target + (ch + tmp) * e;
          if (Math.abs(target - pos) < 0.0004 && Math.abs(vel) < 0.01) { pos = target; vel = 0; }
        }
      }
      render();
      if (drag || pos !== target) raf = requestAnimationFrame(tick);
      else { raf = 0; last = 0; }
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };
    const snapTarget = (extra) => Math.round(target + scrollOff + (extra || 0)) - scrollOff;

    const go = (n, focus) => {
      target = snapTarget() + n;
      applyActive(true); kick();
      if (focus) $(".product__btn", slides[mod(Math.round(target + scrollOff), N)]).focus({ preventScroll: true });
    };

    /* swipe / drag ------------------------------------------------------------
       Fingers use the phone's native touch events (most reliable on iPhone Safari);
       mouse and pen use pointer events. Both feed the same three steps. */
    const dragStart = (x, y) => {
      drag = { x, y, p: pos, on: false, hist: [] };
      moved = false;
    };
    // returns true while the ring is being dragged sideways (caller then blocks page scroll)
    const dragMove = (x, y, t) => {
      if (!drag) return false;
      const dx = x - drag.x, dy = y - drag.y;
      if (!drag.on) {
        if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return false;
        if (Math.abs(dy) > Math.abs(dx)) { drag = null; return false; }   // mostly vertical: let the page scroll
        drag.on = true; moved = true;
        drag.x = x; drag.p = target = pos;
        stage.classList.add("is-dragging");
      }
      const nt = drag.p - (x - drag.x) / spacing;        // the ring follows on every frame (see tick)
      if (drag.lt && t > drag.lt) drag.v = 0.6 * ((nt - target) / ((t - drag.lt) / 1000)) + 0.4 * (drag.v || 0);
      target = nt; drag.lt = t;
      drag.hist.push([t, target]);
      while (drag.hist.length > 2 && t - drag.hist[0][0] > 90) drag.hist.shift();
      kick();
      return true;
    };
    const dragEnd = (t) => {
      const d = drag;
      drag = null;
      stage.classList.remove("is-dragging");
      if (!d || !d.on) return;
      setTimeout(() => { moved = false; }, 0);           // the click (if any) fires before this
      const h = d.hist, a = h[0], b = h[h.length - 1];
      vel = a && b && b[0] > a[0] && t - b[0] < 80 ? ((b[1] - a[1]) / (b[0] - a[0])) * 1000 : 0;
      vel = Math.max(-16, Math.min(16, vel));
      target = Math.round(target + scrollOff + Math.max(-5, Math.min(5, vel * 0.26))) - scrollOff;
      applyActive(true); kick();
    };

    // touch (phones / tablets)
    let touchId = null;
    stage.addEventListener("touchstart", (e) => {
      if (e.touches.length !== 1) { if (drag) dragEnd(performance.now()); touchId = null; return; }
      const tch = e.changedTouches[0];
      touchId = tch.identifier;
      dragStart(tch.clientX, tch.clientY);
    }, { passive: true });
    stage.addEventListener("touchmove", (e) => {
      if (touchId === null) return;
      const tch = [...e.changedTouches].find((x) => x.identifier === touchId);
      if (!tch) return;
      if (dragMove(tch.clientX, tch.clientY, performance.now()) && e.cancelable) e.preventDefault();
    }, { passive: false });
    const touchEnd = (e) => {
      if (touchId === null || ![...e.changedTouches].some((x) => x.identifier === touchId)) return;
      touchId = null;
      dragEnd(performance.now());
    };
    stage.addEventListener("touchend", touchEnd);
    stage.addEventListener("touchcancel", touchEnd);

    // mouse / pen
    let mouseId = null;
    stage.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "touch" || (e.pointerType === "mouse" && e.button !== 0)) return;
      mouseId = e.pointerId;
      dragStart(e.clientX, e.clientY);
    });
    window.addEventListener("pointermove", (e) => {
      if (e.pointerId !== mouseId) return;
      if (dragMove(e.clientX, e.clientY, e.timeStamp)) e.preventDefault();
    });
    const mouseEnd = (e) => {
      if (e.pointerId !== mouseId) return;
      mouseId = null;
      dragEnd(e.timeStamp);
    };
    window.addEventListener("pointerup", mouseEnd);
    window.addEventListener("pointercancel", mouseEnd);
    stage.addEventListener("dragstart", (e) => e.preventDefault());   // never start a native image/link drag
    stage.addEventListener("click", (e) => { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; } }, true);

    /* page scroll turns the ring; it eases onto the nearest card once scrolling stops */
    let scrollT = 0;
    if (scrollLinked) window.addEventListener("scroll", () => {
      const r = stage.getBoundingClientRect();
      if (r.bottom < -200 || r.top > window.innerHeight + 200) return;
      scrollOff = readScroll();
      kick();                                            // draw on the next animation frame
      clearTimeout(scrollT);
      scrollT = setTimeout(() => { if (!drag) { target = snapTarget(); applyActive(true); kick(); } }, 160);
    }, { passive: true });

    /* horizontal trackpad / Shift + wheel */
    let wheelT = 0;
    stage.addEventListener("wheel", (e) => {
      const dx = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.shiftKey ? e.deltaY : 0;
      if (!dx || drag) return;
      e.preventDefault();
      const px = e.deltaMode === 1 ? dx * 32 : e.deltaMode === 2 ? dx * 600 : dx;
      target += Math.max(-1, Math.min(1, px / spacing));
      kick();
      clearTimeout(wheelT);
      wheelT = setTimeout(() => { target = snapTarget(); applyActive(true); kick(); }, 140);
    }, { passive: false });

    /* keys + buttons */
    wrap.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      e.preventDefault();
      go(e.key === "ArrowRight" ? 1 : -1, ring.contains(document.activeElement));
    });
    $("#pcarPrev").addEventListener("click", () => go(-1));
    $("#pcarNext").addEventListener("click", () => go(1));
    $("#pcarMore").addEventListener("click", (e) => {
      const k = mod(Math.round(shown()), N);
      openSheet($(".product__btn", slides[k]).dataset.id, e.currentTarget);
    });

    let resizeT = 0;
    window.addEventListener("resize", () => { clearTimeout(resizeT); resizeT = setTimeout(measure, 120); });

    return {
      set(list) {
        real = list;
        const copies = Math.max(1, Math.ceil(MIN_SLIDES / list.length));
        const all = [];
        for (let c = 0; c < copies; c++) list.forEach((p, i) => all.push(cardHtml(p, i)));
        ring.innerHTML = all.join("");
        slides = $$(".product", ring);
        N = slides.length;
        $$("img", ring).forEach((img) => {
          if (img.complete) img.classList.add("is-loaded");
          else img.addEventListener("load", () => img.classList.add("is-loaded"), { once: true });
          img.addEventListener("error", () => img.classList.add("is-loaded"), { once: true });
        });
        allEl.textContent = pad(list.length);
        front = -1; activeK = -1; vel = 0;
        scrollOff = readScroll();
        pos = target = Math.round(scrollOff) - scrollOff;  // start with a card exactly at the front
        wrap.classList.remove("is-entering"); void wrap.offsetWidth; wrap.classList.add("is-entering");
        measure();
        applyActive(false);
      },
      // Clicking a card that isn't at the front turns it to the front; the front one opens.
      bringToFront(btn) {
        const k = slides.indexOf(btn.closest(".product"));
        const d = Math.round(mod(k - shown() + N / 2, N) - N / 2);
        if (!d) return false;
        go(d);
        return true;
      },
    };
  })();

  const renderProducts = (cat) => {
    $("#productCarousel").setAttribute("aria-labelledby", "tab-" + cat);
    carousel.set(D.products.filter((p) => p.cat === cat));
  };

  const selectTab = (btn, focus) => {
    $$(".tab", tabsEl).forEach((t) => { t.setAttribute("aria-selected", "false"); t.tabIndex = -1; });
    btn.setAttribute("aria-selected", "true");
    btn.tabIndex = 0;
    if (focus) btn.focus();
    renderProducts(btn.dataset.cat);
  };
  tabsEl.addEventListener("click", (e) => { const b = e.target.closest(".tab"); if (b) selectTab(b); });
  tabsEl.addEventListener("keydown", (e) => {
    const tabs = $$(".tab", tabsEl);
    const i = tabs.indexOf(document.activeElement);
    if (e.key === "ArrowRight") selectTab(tabs[(i + 1) % tabs.length], true);
    if (e.key === "ArrowLeft") selectTab(tabs[(i - 1 + tabs.length) % tabs.length], true);
  });
  renderProducts(D.categories[0].id);

  /* ------------------------------------------------- PRODUCT DETAIL SHEET */
  const sheet = $("#productSheet");
  let lastTrigger = null;

  const openSheet = (id, trigger) => {
    const p = D.products.find((x) => x.id === id);
    if (!p) return;
    lastTrigger = trigger;
    const img = $("#sheetImg");
    img.src = imgUrl(p.img, 1200);
    img.alt = p.name + " (illustrative photo)";
    $("#sheetCat").textContent = catLabel[p.cat];
    $("#sheetTitle").textContent = p.name;
    $("#sheetBody").textContent = p.body;
    $("#sheetOpWrap").hidden = !p.op;
    if (p.op) { $("#sheetOp").innerHTML = opSvg(p.op); $("#sheetOpText").textContent = OPS[p.op][0]; }
    $("#sheetBest").innerHTML = p.bestFor.map((b) => `<li>${esc(b)}</li>`).join("");
    // White / black / wood finishes are uPVC profile colors — only show them for windows & doors.
    $("#sheetFinishes").hidden = !(p.cat === "windows" || p.cat === "doors");
    $("#sheetQuote").dataset.product = p.id;
    $("#sheetMsg").href = D.contact.messenger;
    sheet.showModal();
  };
  grid.addEventListener("click", (e) => { const b = e.target.closest(".product__btn"); if (b && !carousel.bringToFront(b)) openSheet(b.dataset.id, b); });
  sheet.addEventListener("click", (e) => {
    if (e.target === sheet || e.target.closest("[data-close]")) sheet.close();
  });
  sheet.addEventListener("close", () => lastTrigger && lastTrigger.focus({ preventScroll: true }));
  $("#sheetQuote").addEventListener("click", (e) => {
    // A link inside an open modal <dialog> doesn't scroll the page reliably,
    // so close the dialog first, then scroll to the form ourselves.
    e.preventDefault();
    const box = $(`#chip-${e.currentTarget.dataset.product}`);
    if (box) box.checked = true;
    lastTrigger = null;
    sheet.close();
    setTimeout(() => {
      quoteSec.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
      history.replaceState(null, "", "#quote");
      setTimeout(() => $("#f-name").focus({ preventScroll: true }), reduceMotion ? 0 : 700);
    }, 60); // runs after the dialog's own focus-restore, which would otherwise cancel the scroll
  });

  /* ----------------------------------------------------------- FINISHES */
  const preview = $("#finishPreview");
  const finishNames = { white: "White profile", black: "Black profile", wood: "Wood finish profile" };
  const finishBtns = $$(".finish-picker button");
  const pickFinish = (btn, focus) => {
    finishBtns.forEach((b) => { b.setAttribute("aria-checked", "false"); b.tabIndex = -1; });
    btn.setAttribute("aria-checked", "true");
    btn.tabIndex = 0;
    if (focus) btn.focus();
    preview.dataset.finish = btn.dataset.finish;
    $$("img", preview).forEach((im) => im.classList.toggle("is-active", im.dataset.finish === btn.dataset.finish));
    $("#finishLabel").textContent = finishNames[btn.dataset.finish];
  };
  finishBtns.forEach((b, i) => {
    b.tabIndex = i === 0 ? 0 : -1;
    b.addEventListener("click", () => pickFinish(b));
    b.addEventListener("keydown", (e) => {
      const d = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      pickFinish(finishBtns[(i + d + finishBtns.length) % finishBtns.length], true);
    });
  });

  /* ------------------------------------------- VERIFIED ARTEM PROJECTS */
  // Only shown once real ARTEM installation photos are added in data.js → projects.
  if (D.projects.length) {
    $("#verified").hidden = false;
    $("#projectGrid").innerHTML = D.projects
      .map(
        (p) => `<figure class="project"><img src="${esc(imgUrl(p.img, 800))}" alt="${esc(p.title)}" loading="lazy" decoding="async" />
          <figcaption><strong>${esc(p.title)}</strong>${p.place ? `<span>${esc(p.place)}</span>` : ""}</figcaption></figure>`
      )
      .join("");
  }

  /* ------------------------------------------------ INSPIRATION GALLERY */
  const gal = $("#gallery");
  const galTabs = $("#galleryTabs");
  let galItems = D.inspiration;
  const renderGallery = (filter) => {
    galItems = filter === "all" ? D.inspiration : D.inspiration.filter((g) => g.tags.includes(filter));
    gal.innerHTML = galItems
      .map(
        (g, i) => `<figure class="gal is-entering" style="animation-delay:${i * 50}ms">
          <button class="gal__btn" data-i="${i}" aria-label="View larger: ${esc(g.title)}">
            <img src="${imgUrl(g.img, 800)}" srcset="${srcset(g.img)}" sizes="(max-width:600px) 100vw, (max-width:1024px) 50vw, 33vw" alt="${esc(g.title)} (illustrative)" loading="lazy" decoding="async" />
          </button>
          <figcaption>${esc(g.title)}</figcaption>
        </figure>`
      )
      .join("");
  };
  galTabs.addEventListener("click", (e) => {
    const b = e.target.closest(".tab");
    if (!b) return;
    $$(".tab", galTabs).forEach((t) => { t.setAttribute("aria-selected", String(t === b)); t.tabIndex = t === b ? 0 : -1; });
    renderGallery(b.dataset.filter);
  });
  renderGallery("all");

  // Lightbox
  const lb = $("#lightbox");
  let lbIndex = 0;
  let lbTrigger = null;
  const showLb = (i) => {
    lbIndex = (i + galItems.length) % galItems.length;
    const g = galItems[lbIndex];
    $("#lbImg").src = imgUrl(g.img, 1600);
    $("#lbImg").alt = g.title + " (illustrative)";
    $("#lbCap").textContent = g.title;
    $("#lbSrc").textContent = g.src;
  };
  gal.addEventListener("click", (e) => {
    const b = e.target.closest(".gal__btn");
    if (!b) return;
    lbTrigger = b;
    showLb(Number(b.dataset.i));
    lb.showModal();
  });
  lb.addEventListener("click", (e) => {
    if (e.target === lb || e.target.closest("[data-close]")) { lb.close(); return; }
    const step = e.target.closest("[data-step]");
    if (step) showLb(lbIndex + Number(step.dataset.step));
  });
  lb.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") showLb(lbIndex + 1);
    if (e.key === "ArrowLeft") showLb(lbIndex - 1);
  });
  lb.addEventListener("close", () => lbTrigger && lbTrigger.focus({ preventScroll: true }));

  /* ------------------------------------------------------- QUOTE FORM */
  const form = $("#quoteForm");
  const status = $("#formStatus");
  const chips = $("#productChips");

  chips.innerHTML = D.products
    .map((p) => `<span class="chip"><input type="checkbox" id="chip-${p.id}" name="products" value="${esc(p.name)}" /><label for="chip-${p.id}">${esc(p.name)}</label></span>`)
    .join("");

  const rules = {
    name: (v) => (v.trim().length >= 2 ? "" : "Please enter your name."),
    phone: (v) => (v.replace(/[^\d]/g, "").length >= 10 ? "" : "Please enter a valid mobile or landline number."),
    email: (v) => (!v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "" : "That email doesn't look right."),
    location: (v) => (v.trim().length >= 2 ? "" : "Please tell us where the project is."),
  };

  const validate = () => {
    let first = null;
    Object.entries(rules).forEach(([name, fn]) => {
      const input = form.elements[name];
      const msg = fn(input.value);
      const err = $("#err-" + name);
      err.textContent = msg;
      input.setAttribute("aria-invalid", msg ? "true" : "false");
      if (msg) input.setAttribute("aria-describedby", err.id);
      else input.removeAttribute("aria-describedby");
      if (msg && !first) first = input;
    });
    return first;
  };
  // Clear an error as soon as the field is fixed
  Object.keys(rules).forEach((name) =>
    form.elements[name].addEventListener("input", (e) => {
      if (e.target.getAttribute("aria-invalid") === "true" && !rules[name](e.target.value)) {
        e.target.setAttribute("aria-invalid", "false");
        $("#err-" + name).textContent = "";
      }
    })
  );

  const buildMessage = () => {
    const f = form.elements;
    const products = $$("input[name=products]:checked", form).map((c) => c.value);
    const lines = [
      "Hi ARTEM! I'd like to request a free quotation.",
      "",
      `Name: ${f.name.value.trim()}`,
      `Contact no.: ${f.phone.value.trim()}`,
      f.email.value.trim() && `Email: ${f.email.value.trim()}`,
      `Location: ${f.location.value.trim()}`,
      products.length && `Products: ${products.join(", ")}`,
      f.type.value && `Project type: ${f.type.value}`,
      f.finish.value && `Preferred finish: ${f.finish.value}`,
      f.message.value.trim() && `\nDetails:\n${f.message.value.trim()}`,
    ];
    return lines.filter((l) => l !== false && l !== "" && l != null).join("\n").replace("quotation.\n", "quotation.\n\n");
  };

  const copy = (text) => {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text).then(() => true, () => false);
    // Fallback for non-https / older browsers
    const ta = document.createElement("textarea");
    ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch (_) { /* ignore */ }
    ta.remove();
    return Promise.resolve(ok);
  };

  const showStatus = (html, isError) => {
    status.innerHTML = html;
    status.classList.toggle("is-error", !!isError);
    status.focus({ preventScroll: true });
    status.scrollIntoView({ block: "nearest", behavior: reduceMotion ? "auto" : "smooth" });
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const bad = validate();
    if (bad) {
      showStatus("Please check the highlighted fields.", true);
      bad.focus();
      return;
    }
    const channel = (e.submitter && e.submitter.dataset.channel) || "messenger";
    const msg = buildMessage();
    const viberPhone = D.contact.phones.find((p) => p.viber) || D.contact.phones[0];

    if (channel === "email") {
      const subject = `Quotation request — ${form.elements.name.value.trim()}`;
      window.location.href = `mailto:${D.contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(msg)}`;
      showStatus(
        `Your email app should open with the message ready — just press send and attach any photos. ` +
        `If nothing opened, email us at <a href="mailto:${D.contact.email}">${D.contact.email}</a>.`
      );
      return;
    }

    // Messenger & Viber links can't carry a pre-filled message, so we copy it for the customer to paste.
    const url = channel === "viber" ? `viber://chat?number=${encodeURIComponent(viberPhone.tel)}` : D.contact.messenger;
    const copied = copy(msg);
    if (channel === "viber") window.location.href = url;
    else window.open(url, "_blank", "noopener");

    copied.then((ok) => {
      const app = channel === "viber" ? "Viber" : "Messenger";
      const fallback = channel === "viber"
        ? `If Viber didn't open, message <strong>${viberPhone.display}</strong> on Viber.`
        : `If Messenger didn't open, <a href="${D.contact.messenger}" target="_blank" rel="noopener">tap here</a>.`;
      showStatus(
        ok
          ? `<strong>Message copied.</strong> Paste it into the ${app} chat that just opened and attach any photos. ${fallback}`
          : `${app} is opening. Please copy your details below and send them in the chat. ${fallback}<pre style="white-space:pre-wrap;margin:12px 0 0;font:inherit">${esc(msg)}</pre>`
      );
    });
  });

  /* ---------------------------------------------------------------- FAQ */
  $("#faqList").innerHTML = D.faq
    .map((f) => `<details class="faq__item"><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`)
    .join("");

  /* ------------------------------------------------------------ CONTACT */
  $("#phoneList").innerHTML = D.contact.phones
    .map((p) => `<a class="phone-line" href="tel:${p.tel}">${esc(p.display)} <span>· ${esc(p.name)}${p.viber ? " (Viber)" : ""}</span></a>`)
    .join("");
  $("#year").textContent = new Date().getFullYear();
})();
