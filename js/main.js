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
  const nav = $("#nav");
  const hero = $(".hero");
  const actionBar = $("#actionBar");
  const quoteSec = $("#quote");

  const onScroll = () => {
    const y = window.scrollY;
    nav.dataset.state = y > 40 ? "scrolled" : "top";
    // Mobile action bar: show after the hero, hide while the quote form is on screen
    const pastHero = y > hero.offsetHeight * 0.6;
    const qr = quoteSec.getBoundingClientRect();
    const inQuote = qr.top < window.innerHeight * 0.7 && qr.bottom > 0;
    actionBar.classList.toggle("is-visible", pastHero && !inQuote);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
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

  const setMenu = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.classList.toggle("menu-open", open);
    document.body.style.overflow = open ? "hidden" : "";
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
  window.matchMedia("(min-width: 961px)").addEventListener("change", (m) => m.matches && setMenu(false));

  /* --------------------------------------------------------- HERO VIDEO */
  // The poster image paints first. The video is attached only after the page
  // has loaded, and skipped entirely for reduced-motion or data-saver users.
  const video = $("#heroVideo");
  const pauseBtn = $("#heroPause");
  const saveData = navigator.connection && navigator.connection.saveData;

  // Portrait screens (phones) get the vertical 9:16 cut; everything else the 16:9 cut.
  const portrait = window.matchMedia("(max-aspect-ratio: 4/5)").matches;
  if (portrait && video.dataset.posterMobile) video.poster = video.dataset.posterMobile;

  // Scene captions, timed to the edited reels (start second → label).
  const SCENES = portrait
    ? [[0, "Modern glass-front home"], [3.5, "Sliding glass doors"], [7, "Sliding door to the deck"], [10.5, "Casement window"], [14.5, "Sunlit glass doors"]]
    : [[0, "Modern glass-front home"], [3.5, "Floor-to-ceiling windows"], [7, "Casement window"], [11, "Sliding patio doors"], [14.5, "Full-height glazing"], [18, "Wood-tone frames"]];
  const sceneN = $("#sceneN");
  const sceneT = $("#sceneT");
  let sceneIdx = -1;
  const updateScene = () => {
    const t = video.currentTime + 0.5; // switch mid-crossfade
    let i = 0;
    SCENES.forEach(([s], k) => { if (t >= s) i = k; });
    if (i === sceneIdx) return;
    sceneIdx = i;
    sceneT.classList.remove("is-in");
    setTimeout(() => {
      sceneN.textContent = String(i + 1).padStart(2, "0") + " / " + String(SCENES.length).padStart(2, "0");
      sceneT.textContent = SCENES[i][1];
      sceneT.classList.add("is-in");
    }, 200);
  };

  const startVideo = () => {
    if (reduceMotion || saveData || !video) return;
    video.src = portrait && video.dataset.srcMobile ? video.dataset.srcMobile : video.dataset.src;
    video.addEventListener("error", () => video.removeAttribute("src"), { once: true });
    video.addEventListener("timeupdate", updateScene);
    video.addEventListener("playing", () => { pauseBtn.hidden = false; hero.classList.add("is-playing"); }, { once: true });
    const p = video.play();
    if (p && p.catch) p.catch(() => { /* autoplay blocked: the poster image simply stays */ });
  };
  if (document.readyState === "complete") startVideo();
  else window.addEventListener("load", startVideo, { once: true });

  pauseBtn.addEventListener("click", () => {
    const paused = video.paused;
    paused ? video.play() : video.pause();
    pauseBtn.dataset.paused = String(!paused);
    pauseBtn.setAttribute("aria-label", paused ? "Pause background video" : "Play background video");
  });
  // Don't burn battery decoding a video nobody can see
  new IntersectionObserver(([en]) => {
    if (!video.src || pauseBtn.dataset.paused === "true") return;
    en.isIntersecting ? video.play().catch(() => {}) : video.pause();
  }).observe(hero);

  /* ------------------------------------------------------------- REVEAL */
  const revealObs = new IntersectionObserver(
    (entries) => entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-in"); revealObs.unobserve(en.target); } }),
    { threshold: 0.12 }
  );
  $$(".reveal").forEach((el) => revealObs.observe(el));
  // Hero text is above the fold: reveal it right away instead of waiting on the observer.
  setTimeout(() => $$(".hero .reveal").forEach((el) => el.classList.add("is-in")), 50);

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

  const renderProducts = (cat) => {
    const list = D.products.filter((p) => p.cat === cat);
    grid.setAttribute("aria-labelledby", "tab-" + cat);
    grid.innerHTML = list
      .map(
        (p, i) => `
      <article class="product is-entering" style="animation-delay:${i * 60}ms">
        <button class="product__btn" data-id="${p.id}" aria-haspopup="dialog">
          <div class="product__img">
            <img src="${imgUrl(p.img, 800)}" srcset="${srcset(p.img)}" sizes="(max-width:600px) 100vw, (max-width:960px) 50vw, 40vw"
              alt="${esc(p.name)} (illustrative photo)" loading="lazy" decoding="async" />
            <span class="product__more">View details</span>
          </div>
          <div class="product__meta">
            <h3 class="product__name">${esc(p.name)}</h3>
            ${p.op ? `<span class="op-icon" title="${esc(OPS[p.op][0])}">${opSvg(p.op)}</span>` : `<span class="product__idx">${String(i + 1).padStart(2, "0")}</span>`}
          </div>
          <p class="product__tag">${esc(p.tagline)}</p>
        </button>
      </article>`
      )
      .join("");
    $$("img", grid).forEach((img) => {
      if (img.complete) img.classList.add("is-loaded");
      else img.addEventListener("load", () => img.classList.add("is-loaded"), { once: true });
      img.addEventListener("error", () => img.classList.add("is-loaded"), { once: true });
    });
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
  grid.addEventListener("click", (e) => { const b = e.target.closest(".product__btn"); if (b) openSheet(b.dataset.id, b); });
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
            <img src="${imgUrl(g.img, 800)}" srcset="${srcset(g.img)}" sizes="(max-width:600px) 100vw, (max-width:960px) 50vw, 33vw" alt="${esc(g.title)} (illustrative)" loading="lazy" decoding="async" />
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
