/* ==========================================================================
   SPARKTACLES — backstage pass (Alex / Repo Ranger) — main.js
   Lenis smooth scroll, scroll-reveal, setlist filters, DM composer,
   a tiny WebAudio "sparkle" synth (ZzFX-school) and a canvas confetti burst.
   ========================================================================== */
(function () {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  /* ----------------------------------------------------------------
     01. Lenis smooth scroll (fallback to native if CDN unavailable)
     ---------------------------------------------------------------- */
  let lenis = null;
  if (window.Lenis && !prefersReduced) {
    lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  function scrollToTarget(target, offset = 0) {
    const el = typeof target === "string" ? document.querySelector(target) : target;
    if (!el) return;
    if (lenis) {
      lenis.scrollTo(el, { offset: -78, duration: 1.1 });
    } else {
      el.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth" });
    }
  }

  /* in-page anchor links respect the smooth scroll & sticky header */
  $$('a[href^="#"]').forEach((link) => {
    if (link.classList.contains("skip-link")) return;
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      if (href.length < 2) return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      closeMenu();
      scrollToTarget(target);
    });
  });

  /* ----------------------------------------------------------------
     02. Header & floating DM pill
     ---------------------------------------------------------------- */
  const header = $("#siteHeader");
  const dmPill = $("#dmPill");
  const heroEnd = $("#setlist");
  const dmBreakpoint = $("#backstage");

  function onScrollHeader() {
    header.classList.toggle("is-scrolled", window.scrollY > 40);
    // show pill only once the setlist is in view and before the composer
    const rect = dmBreakpoint ? dmBreakpoint.getBoundingClientRect() : null;
    const pastHero = heroEnd ? heroEnd.getBoundingClientRect().top < window.innerHeight * 0.9 : false;
    const beforeComposer = rect ? rect.top > 200 : true;
    dmPill.classList.toggle("show", pastHero && beforeComposer);
  }
  window.addEventListener("scroll", onScrollHeader, { passive: true });

  /* ----------------------------------------------------------------
     03. Mobile menu
     ---------------------------------------------------------------- */
  const navToggle = $("#navToggle");
  const mobileMenu = $("#mobileMenu");

  function closeMenu() {
    navToggle.classList.remove("is-open");
    mobileMenu.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    mobileMenu.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  navToggle.addEventListener("click", () => {
    const open = navToggle.classList.toggle("is-open");
    mobileMenu.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    mobileMenu.setAttribute("aria-hidden", String(!open));
    document.body.style.overflow = open ? "hidden" : "";
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  /* ----------------------------------------------------------------
     04. Scroll reveal
     ---------------------------------------------------------------- */
  const reveals = $$(".reveal");
  if (prefersReduced || !("IntersectionObserver" in window)) {
    reveals.forEach((el) => el.classList.add("in"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  }

  /* ----------------------------------------------------------------
     05. Setlist filters
     ---------------------------------------------------------------- */
  const chips = $$(".chip[data-filter]");
  const tickets = $$(".ticket");
  const filterCount = $("#filterCount");

  function applyFilter(filter) {
    let visible = 0;
    tickets.forEach((ticket) => {
      const show = filter === "all" || ticket.dataset.cat === filter;
      ticket.classList.toggle("hide", !show);
      if (show) visible++;
    });
    if (filterCount) {
      filterCount.textContent =
        filter === "all" ? "6 acts on the bill" : `${visible} act${visible === 1 ? "" : "s"} · ${filter}`;
    }
  }

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const filter = chip.dataset.filter;
      chips.forEach((c) => {
        const active = c === chip;
        c.classList.toggle("is-active", active);
        c.setAttribute("aria-pressed", String(active));
      });
      sparkle("chime");
      applyFilter(filter);
    });
  });

  /* ----------------------------------------------------------------
     06. The DM composer
     ---------------------------------------------------------------- */
  const pickGroups = $$(".picks[data-group]");
  const story = $("#story");
  const draft = $("#draft");
  const copyBtn = $("#copyDraft");
  const copied = $("#copied");

  const copyText = {
    occasion: {
      festival: "I'm gearing up for festival season",
      wedding: "I'm getting married and need eyewear to match",
      everyday: "I want everyday sparkle",
      slopes: "Ski season is calling",
      because: "Just because — that's a valid reason",
    },
    origin: {
      frames: "I have frames I'd love to send in",
      ready: "A ready-made pair has my name on it",
      surprise: "Surprise me entirely",
    },
    mood: {
      rainbow: "Rainbow riot vibes",
      gold: "Gold rush vibes",
      pink: "Pink parade vibes",
      blue: "Midnight blue vibes",
      crystal: "Crystal clear vibes",
    },
    budget: {
      chill: "keep it chill (under $90)",
      sweet: "the sweet spot ($90–140)",
      allout: "go all out — it's special",
    },
  };

  function currentPicks() {
    const out = {};
    pickGroups.forEach((group) => {
      const sel = group.querySelector(".pick.is-selected");
      out[group.dataset.group] = sel ? sel.dataset.value : "";
    });
    return out;
  }

  function renderDraft() {
    if (!draft) return;
    const p = currentPicks();
    const occ = copyText.occasion[p.occasion] || "eyewear with personality";
    const openers = [];
    if (p.origin) openers.push(copyText.origin[p.origin]);
    if (p.mood) openers.push(`${copyText.mood[p.mood]}`);
    if (p.budget) openers.push(`budget: ${copyText.budget[p.budget]}`);
    const storyText = (story && story.value.trim()) ? `\n\n${story.value.trim()}` : "";
    draft.textContent =
      `Hi Liza! ${occ}.` +
      `\n\n${openers.join(" · ")}.` +
      storyText +
      `\n\nWhat do you think? ✦`;
  }

  pickGroups.forEach((group) => {
    group.addEventListener("click", (e) => {
      const pick = e.target.closest(".pick");
      if (!pick) return;
      group.querySelectorAll(".pick").forEach((p) => {
        const active = p === pick;
        p.classList.toggle("is-selected", active);
        p.setAttribute("aria-pressed", String(active));
      });
      sparkle("tick");
      renderDraft();
    });
  });
  if (story) story.addEventListener("input", renderDraft);
  renderDraft();

  copyBtn.addEventListener("click", async () => {
    const text = draft ? draft.textContent : "";
    try {
      await navigator.clipboard.writeText(text);
    } catch (_) {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    copied.hidden = false;
    burstConfetti();
    sparkle("arpeggio");
    setTimeout(() => { copied.hidden = true; }, 3600);
  });

  /* ----------------------------------------------------------------
     07. Mic-drop: a tiny WebAudio sparkle synth (ZzFX-school)
     ---------------------------------------------------------------- */
  let audioCtx = null;
  let soundOn = true;
  const soundToggle = $("#soundToggle");

  function ensureAudio() {
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) audioCtx = new AC();
    }
    if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
    return audioCtx;
  }

  // blip(): one oscillator note with a fast exponential decay
  function blip(freq, when, dur, gainLevel, type) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type || "sine";
    osc.frequency.setValueAtTime(freq, when);
    gain.gain.setValueAtTime(0.0001, when);
    gain.gain.exponentialRampToValueAtTime(gainLevel, when + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(when);
    osc.stop(when + dur + 0.02);
  }

  function sparkle(kind) {
    if (!soundOn) return;
    const ctx = ensureAudio();
    if (!ctx) return;
    const t = ctx.currentTime;
    if (kind === "tick") {
      blip(1200 + Math.random() * 600, t, 0.08, 0.18, "triangle");
    } else if (kind === "chime") {
      blip(880, t, 0.14, 0.16, "sine");
      blip(1318, t + 0.06, 0.2, 0.14, "sine");
    } else if (kind === "arpeggio") {
      [660, 880, 1108, 1318, 1760].forEach((f, i) => blip(f, t + i * 0.06, 0.18, 0.14, "triangle"));
    }
  }

  if (soundToggle) {
    soundToggle.addEventListener("change", () => {
      soundOn = soundToggle.checked;
      if (soundOn) sparkle("chime");
    });
  }

  // every claim/CTA link earns a little mic-drop when clicked
  $$("a.claim, a.claim--alt, .hero__cta .btn, .composer__actions .btn, .dm-pill, .btn--gold").forEach((el) => {
    el.addEventListener("click", () => sparkle("tick"));
  });

  /* ----------------------------------------------------------------
     08. Confetti cannon
     ---------------------------------------------------------------- */
  const canvas = $("#confetti");
  let particles = [];
  let confettiRunning = false;

  const palette = ["#7b2ff7", "#ff5fa6", "#ffbe2e", "#2ecbff", "#46d9a4", "#ffffff"];

  function burstConfetti() {
    if (!canvas || prefersReduced) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const originX = canvas.width / 2;
    const originY = canvas.height * 0.62;

    for (let i = 0; i < 130; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.5;
      const speed = 6 + Math.random() * 9;
      particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 5 + Math.random() * 6,
        color: palette[(Math.random() * palette.length) | 0],
        rot: Math.random() * Math.PI * 2,
        vrot: (Math.random() - 0.5) * 0.4,
        life: 1,
        decay: 0.008 + Math.random() * 0.01,
        shape: Math.random() > 0.5 ? "rect" : "star",
      });
    }
    if (!confettiRunning) {
      confettiRunning = true;
      requestAnimationFrame(tickConfetti);
    }
  }

  function tickConfetti() {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles = particles.filter((p) => p.life > 0.02);
    particles.forEach((p) => {
      p.vy += 0.16; // gravity
      p.vx *= 0.99;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vrot;
      p.life -= p.decay;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = Math.max(p.life, 0);
      ctx.fillStyle = p.color;
      if (p.shape === "star") {
        // four-point sparkle
        ctx.beginPath();
        ctx.moveTo(0, -p.size);
        ctx.quadraticCurveTo(0, 0, p.size, 0);
        ctx.quadraticCurveTo(0, 0, 0, p.size);
        ctx.quadraticCurveTo(0, 0, -p.size, 0);
        ctx.quadraticCurveTo(0, 0, 0, -p.size);
        ctx.fill();
      } else {
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      }
      ctx.restore();
    });
    if (particles.length) {
      requestAnimationFrame(tickConfetti);
    } else {
      confettiRunning = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  window.addEventListener("resize", () => {
    if (canvas) canvas.width = window.innerWidth;
  });

  /* ----------------------------------------------------------------
     09. Kick-off
     ---------------------------------------------------------------- */
  // init once (font load timing safe, everything above is idempotent)
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", onScrollHeader);
  } else {
    onScrollHeader();
  }
})();