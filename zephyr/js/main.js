/* ==========================================================================
   Sparktacles — interaction layer
   bokeh canvas · custom cursor · magnetic buttons · filters · reveals
   ========================================================================== */
(function () {
  "use strict";

  document.documentElement.classList.add("has-js");

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;

  /* ---------- Preloader ---------- */
  const preloader = document.getElementById("preloader");
  let preloaderDone = false;
  function finishPreloader() {
    if (preloaderDone || !preloader) return;
    preloaderDone = true;
    preloader.classList.add("is-done");
    document.documentElement.classList.add("is-loaded");
  }
  if (document.readyState === "complete") {
    setTimeout(finishPreloader, 700);
  } else {
    window.addEventListener("load", () => setTimeout(finishPreloader, 500));
  }
  setTimeout(finishPreloader, 3500); // safety net

  /* ---------- Header scroll state ---------- */
  const header = document.querySelector(".header");
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 40);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Mobile menu ---------- */
  const burger = document.getElementById("burger");
  const mobileMenu = document.getElementById("mobilemenu");
  function setMenu(open) {
    burger.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    mobileMenu.classList.toggle("is-open", open);
    mobileMenu.setAttribute("aria-hidden", String(!open));
    document.body.style.overflow = open ? "hidden" : "";
  }
  burger.addEventListener("click", () => setMenu(!mobileMenu.classList.contains("is-open")));
  mobileMenu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && mobileMenu.classList.contains("is-open")) setMenu(false);
  });

  /* ---------- Active nav link ---------- */
  const sections = document.querySelectorAll("main section[id]");
  const navLinks = document.querySelectorAll(".nav__link");
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) =>
          link.classList.toggle("is-active", link.getAttribute("href") === "#" + entry.target.id)
        );
      });
    },
    { rootMargin: "-40% 0px -55% 0px" }
  );
  sections.forEach((s) => sectionObserver.observe(s));

  /* ---------- Reveal on scroll ---------- */
  const revealables = document.querySelectorAll("[data-reveal]");
  const pieceList = Array.from(document.querySelectorAll(".piece"));
  pieceList.forEach((piece, i) => piece.style.setProperty("--reveal-delay", (i % 3) * 90 + "ms"));
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealables.forEach((el) => revealObserver.observe(el));
  } else {
    revealables.forEach((el) => el.classList.add("is-in"));
  }

  /* ---------- Gallery filters ---------- */
  const filterButtons = document.querySelectorAll(".filter");
  const countEl = document.getElementById("filterCount");
  function setFilter(value) {
    filterButtons.forEach((btn) => {
      const active = btn.dataset.filter === value;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", String(active));
    });
    let visible = 0;
    pieceList.forEach((piece) => {
      const show = value === "all" || piece.dataset.category === value;
      if (show) {
        if (piece.classList.contains("is-hidden")) {
          piece.classList.remove("is-hidden");
          piece.classList.add("is-entering");
          requestAnimationFrame(() =>
            requestAnimationFrame(() => piece.classList.remove("is-entering"))
          );
        }
        visible++;
      } else {
        piece.classList.add("is-hidden");
      }
    });
    countEl.textContent =
      visible + (visible === 1 ? " piece of sparkle" : " pieces of sparkle");
  }
  filterButtons.forEach((btn) =>
    btn.addEventListener("click", () => setFilter(btn.dataset.filter))
  );

  /* ---------- Magnetic buttons ---------- */
  if (finePointer && !prefersReduced) {
    document.querySelectorAll(".magnetic").forEach((el) => {
      const inner = el.querySelector(".magnetic__inner");
      if (!inner) return;
      el.addEventListener("mousemove", (e) => {
        const rect = el.getBoundingClientRect();
        const dx = e.clientX - (rect.left + rect.width / 2);
        const dy = e.clientY - (rect.top + rect.height / 2);
        const pull = el.classList.contains("btn--big") ? 10 : 7;
        inner.style.transition = "transform .15s ease-out";
        inner.style.transform =
          "translate(" +
          (dx * pull * 0.012).toFixed(2) + "px," +
          (dy * pull * 0.012).toFixed(2) + "px)";
      });
      el.addEventListener("mouseleave", () => {
        inner.style.transition = "transform .6s cubic-bezier(.22,1,.36,1)";
        inner.style.transform = "translate(0,0)";
      });
    });
  }

  /* ---------- Custom cursor ---------- */
  if (finePointer && !prefersReduced) {
    document.documentElement.classList.add("has-cursor");
    const cursor = document.querySelector(".cursor");
    const dot = cursor.querySelector(".cursor__dot");
    const ring = cursor.querySelector(".cursor__ring");
    let mx = innerWidth / 2, my = innerHeight / 2;
    let rx = mx, ry = my;
    let lastTrail = 0;

    window.addEventListener("mousemove", (e) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.transform = "translate(" + mx + "px," + my + "px) translate(-50%,-50%)";
      // sparkle trail, throttled
      const now = performance.now();
      if (now - lastTrail > 90) {
        lastTrail = now;
        spawnTrail(mx, my);
      }
    });

    (function ringLoop() {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.transform = "translate(" + rx + "px," + ry + "px) translate(-50%,-50%)";
      requestAnimationFrame(ringLoop);
    })();

    document.querySelectorAll("[data-hover]").forEach((el) => {
      el.addEventListener("mouseenter", () => ring.classList.add("is-hover"));
      el.addEventListener("mouseleave", () => ring.classList.remove("is-hover"));
    });

    document.addEventListener("mouseleave", () => (cursor.style.opacity = 0));
    document.addEventListener("mouseenter", () => (cursor.style.opacity = 1));

    function spawnTrail(x, y) {
      const colors = ["#ffd166", "#ff6ec7", "#b388ff", "#4dc9ff"];
      const s = document.createElement("span");
      s.className = "spark";
      s.style.left = x + "px";
      s.style.top = y + "px";
      s.style.background = colors[(Math.random() * colors.length) | 0];
      document.body.appendChild(s);
      const drift = (Math.random() - 0.5) * 24;
      s.animate(
        [
          { transform: "translate(-50%,-50%) scale(1)", opacity: 0.9 },
          {
            transform:
              "translate(calc(-50% + " + drift + "px), calc(-50% - " +
              (18 + Math.random() * 14) + "px)) scale(0.2) rotate(90deg)",
            opacity: 0
          }
        ],
        { duration: 620, easing: "cubic-bezier(0,0.6,0.4,1)" }
      ).onfinish = () => s.remove();
    }
  }

  /* ---------- Hero bokeh canvas ---------- */
  const canvas = document.getElementById("bokeh");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    const COLORS = [
      [255, 110, 199], // pink
      [138, 92, 246],  // lavender
      [77, 201, 255],  // blue
      [255, 209, 102], // gold
      [179, 136, 255]  // lilac
    ];
    let w = 0, h = 0, dpr = 1;
    let running = true, visible = true;
    let tx = 0, ty = 0;

    function makeDots() {
      const area = w * h;
      const count = Math.min(30, Math.max(14, Math.round(area / 38000)));
      const dots = [];
      for (let i = 0; i < count; i++) {
        const c = COLORS[(Math.random() * COLORS.length) | 0];
        dots.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: 30 + Math.random() * 130,
          c: c,
          a: 0.05 + Math.random() * 0.1,
          vx: (Math.random() - 0.5) * 0.16,
          vy: (Math.random() - 0.5) * 0.12,
          depth: 0.35 + Math.random() * 0.65,
          ph: Math.random() * Math.PI * 2,
          pulse: 0.15 + Math.random() * 0.4
        });
      }
      return dots;
    }

    function makeStars() {
      const stars = [];
      const n = 9;
      for (let i = 0; i < n; i++) {
        const c = COLORS[(Math.random() * COLORS.length) | 0];
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: 3 + Math.random() * 7,
          c: c,
          speed: 0.6 + Math.random() * 1.4,
          ph: Math.random() * Math.PI * 2,
          depth: 0.3 + Math.random() * 0.7
        });
      }
      return stars;
    }

    let dots = [], stars = [];
    const starPath = function (x, y, r) {
      ctx.moveTo(x, y - r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.quadraticCurveTo(x, y, x, y + r);
      ctx.quadraticCurveTo(x, y, x - r, y);
      ctx.quadraticCurveTo(x, y, x, y - r);
    };

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      dots = makeDots();
      stars = makeStars();
      if (prefersReduced) drawStatic();
    }

    function drawFrame(t) {
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";

      // bokeh blobs
      for (const d of dots) {
        // slow drift with edge wrap
        d.x += d.vx;
        d.y += d.vy;
        if (d.x < -d.r) d.x = w + d.r; else if (d.x > w + d.r) d.x = -d.r;
        if (d.y < -d.r) d.y = h + d.r; else if (d.y > h + d.r) d.y = -d.r;
        const x = d.x + tx * 30 * d.depth;
        const y = d.y + ty * 30 * d.depth;
        const alpha = d.a * (0.75 + 0.25 * Math.sin(t * 0.0006 + d.ph));
        const g = ctx.createRadialGradient(x, y, 0, x, y, d.r);
        g.addColorStop(0, "rgba(" + d.c[0] + "," + d.c[1] + "," + d.c[2] + "," + alpha + ")");
        g.addColorStop(1, "rgba(" + d.c[0] + "," + d.c[1] + "," + d.c[2] + ",0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, d.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // twinkling stars
      for (const s of stars) {
        const tw = Math.max(0, Math.sin(t * 0.001 * s.speed + s.ph));
        if (tw < 0.05) continue;
        const x = s.x + tx * 60 * s.depth;
        const y = s.y + ty * 60 * s.depth;
        ctx.fillStyle =
          "rgba(255,255,255," + (0.25 + tw * 0.75).toFixed(3) + ")";
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(s.ph + t * 0.0002);
        ctx.beginPath();
        starPath(0, 0, s.r * (0.7 + tw * 0.5));
        ctx.fill();
        ctx.restore();
      }
      ctx.globalCompositeOperation = "source-over";
    }

    function drawStatic() {
      drawFrame(4000);
    }

    let txTarget = 0, tyTarget = 0;

    function loop(t) {
      if (!visible) return;
      tx += (txTarget - tx) * 0.04;
      ty += (tyTarget - ty) * 0.04;
      drawFrame(t);
      if (running) requestAnimationFrame(loop);
    }

    if (!prefersReduced) {
      const hero = document.querySelector(".hero");
      window.addEventListener("mousemove", (e) => {
        txTarget = (e.clientX / window.innerWidth - 0.5) * 2;
        tyTarget = (e.clientY / window.innerHeight - 0.5) * 2;
      }, { passive: true });

      new IntersectionObserver((entries) => {
        const wasVisible = visible;
        visible = entries[0].isIntersecting;
        if (visible && !wasVisible) requestAnimationFrame(loop);
      }, { threshold: 0 }).observe(hero);

      document.addEventListener("visibilitychange", () => {
        running = !document.hidden;
        if (running && visible) requestAnimationFrame(loop);
      });

      requestAnimationFrame(loop);
    } else {
      drawStatic();
    }

    window.addEventListener("resize", resize, { passive: true });
    resize();
  }
})();
