/* ==========================================================================
   SPARKTACLES — dawn edition · main.js
   Small, dependency-free. Handles: header state, mobile menu, scroll reveal,
   collection filters, and the DM composer that drafts your Instagram message.
   ========================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- year ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- header scroll state + floating DM pill ---------- */
  var header = document.getElementById('siteHeader');
  var dmPill = document.getElementById('dmPill');

  function onScroll() {
    var y = window.scrollY;
    if (header) header.classList.toggle('is-scrolled', y > 24);
    if (dmPill) dmPill.classList.toggle('show', y > window.innerHeight * 0.7);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- mobile menu ---------- */
  var navToggle = document.getElementById('navToggle');
  var mobileMenu = document.getElementById('mobileMenu');

  function setMenu(open) {
    if (!navToggle || !mobileMenu) return;
    navToggle.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    mobileMenu.classList.toggle('is-open', open);
    mobileMenu.setAttribute('aria-hidden', open ? 'false' : 'true');
    document.body.style.overflow = open ? 'hidden' : '';
  }

  if (navToggle) {
    navToggle.addEventListener('click', function () {
      setMenu(!navToggle.classList.contains('is-open'));
    });
  }
  if (mobileMenu) {
    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { setMenu(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobileMenu.classList.contains('is-open')) setMenu(false);
    });
  }

  /* ---------- scroll reveal ---------- */
  var revealEls = document.querySelectorAll('[data-reveal]');

  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- collection filters ---------- */
  var filterButtons = document.querySelectorAll('.filter');
  var caseCards = Array.prototype.slice.call(document.querySelectorAll('.case[data-cat]'));
  var filterCount = document.getElementById('filterCount');

  function applyFilter(f) {
    var visible = 0;
    caseCards.forEach(function (card) {
      var show = f === 'all' || card.getAttribute('data-cat') === f;
      card.classList.toggle('hide', !show);
      if (show) visible += 1;
    });
    if (filterCount) {
      filterCount.textContent = f === 'all'
        ? 'Showing all ' + visible + ' exhibits'
        : 'Showing ' + visible + ' of ' + caseCards.length + ' exhibits';
    }
  }

  filterButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterButtons.forEach(function (b) { b.classList.remove('is-active'); b.setAttribute('aria-pressed', 'false'); });
      btn.classList.add('is-active');
      btn.setAttribute('aria-pressed', 'true');
      applyFilter(btn.getAttribute('data-filter'));
    });
  });

  /* ---------- DM composer ---------- */
  var DRAFT_TEXTS = {
    occasion: {
      festival: "It's festival season and I need eyewear that can keep up. 🎪",
      wedding: "I'm dressing up for a wedding and I want eyewear with opinions. 💒",
      everyday: "I'm after everyday frames that refuse to be boring. ☀️",
      slopes: "I'm heading to the mountain and I need goggles that get noticed. ⛷️",
      because: "I've decided I simply deserve more sparkle. ✨"
    },
    origin: {
      frames: "I've got frames to send in — can we talk customization?",
      ready: "I'm eyeing a ready-made pair — who do I have to DM to claim it?",
      surprise: "I have zero ideas and full trust — surprise me with a design."
    },
    mood: {
      rainbow: "Gem mood: rainbow riot — all the colors, no apologies. 🌈",
      gold: "Gem mood: gold rush. Shiny, warm, unstoppable. 💛",
      pink: "Gem mood: pink parade. 🩷",
      blue: "Gem mood: midnight blue. 💙",
      crystal: "Gem mood: crystal clear and classy. 💎"
    },
    budget: {
      chill: "Keeping the budget chill — under $90 if we can.",
      sweet: "Sweet spot budget — $90 to $140.",
      allout: "Going all out on this one — no ceiling on sparkle."
    }
  };

  var picks = document.querySelectorAll('.pick');
  var story = document.getElementById('dmStory');
  var draftEl = document.getElementById('dmDraft');
  var copyBtn = document.getElementById('dmCopy');
  var copiedEl = document.getElementById('dmCopied');

  var state = {
    occasion: 'festival',
    origin: 'frames',
    mood: 'rainbow',
    budget: 'chill'
  };

  function selectedValue(group) {
    return state[group] || null;
  }

  function buildDraft() {
    var lines = [];
    lines.push('hi @sparktacles! ✨');

    var occasion = selectedValue('occasion');
    var origin = selectedValue('origin');
    var mood = selectedValue('mood');
    var budget = selectedValue('budget');

    if (DRAFT_TEXTS.occasion[occasion]) lines.push(DRAFT_TEXTS.occasion[occasion]);
    if (DRAFT_TEXTS.origin[origin]) lines.push(DRAFT_TEXTS.origin[origin]);
    if (DRAFT_TEXTS.mood[mood]) lines.push(DRAFT_TEXTS.mood[mood]);
    if (DRAFT_TEXTS.budget[budget]) lines.push(DRAFT_TEXTS.budget[budget]);

    var storyText = story ? story.value.trim() : '';
    if (storyText) lines.push('One more thing: ' + storyText);

    lines.push('Can\u2019t wait — thanks! 💖');
    return lines.join('\n');
  }

  function renderDraft() {
    if (draftEl) draftEl.textContent = buildDraft();
  }

  picks.forEach(function (pick) {
    pick.addEventListener('click', function () {
      var group = pick.parentElement.getAttribute('data-group');
      if (!group) return;
      state[group] = pick.getAttribute('data-value');

      pick.parentElement.querySelectorAll('.pick').forEach(function (p) {
        var on = p === pick;
        p.classList.toggle('is-selected', on);
        p.setAttribute('aria-pressed', on ? 'true' : 'false');
      });

      renderDraft();
    });
  });

  if (story) story.addEventListener('input', renderDraft);
  renderDraft();

  /* ---------- copy the draft ---------- */
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var text = buildDraft();
      var done = function () {
        if (copiedEl) {
          copiedEl.hidden = false;
          setTimeout(function () { if (copiedEl) copiedEl.hidden = true; }, 4000);
        }
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text, done); });
      } else {
        fallbackCopy(text, done);
      }
    });
  }

  function fallbackCopy(text, cb) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) { /* noop */ }
    document.body.removeChild(ta);
    if (cb) cb();
  }
})();
