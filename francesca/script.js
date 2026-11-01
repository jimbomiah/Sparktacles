/* Sparktacles — interactions
   1. Mobile navigation (accessible toggle)
   2. Gallery filters
   3. Custom order form -> compose a DM, copy it, open Instagram
   4. Footer year
*/

(function () {
  'use strict';

  /* 1. Navigation ------------------------------------------------------- */

  var navList = document.getElementById('site-nav');
  var navToggle = document.querySelector('.nav-toggle');

  if (navList && navToggle) {
    var setNav = function (open) {
      navList.classList.toggle('open', open);
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      navToggle.textContent = open ? 'Close' : 'Menu';
    };

    navToggle.addEventListener('click', function () {
      setNav(!navList.classList.contains('open'));
    });

    navList.addEventListener('click', function (e) {
      if (e.target.closest('a')) setNav(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navList.classList.contains('open')) {
        setNav(false);
        navToggle.focus();
      }
    });

    document.addEventListener('click', function (e) {
      if (navList.classList.contains('open') &&
          !e.target.closest('.nav') &&
          !e.target.closest('.nav-toggle')) {
        setNav(false);
      }
    });
  }

  /* 2. Gallery filters --------------------------------------------------- */

  var chips = document.querySelectorAll('.chip[data-filter]');
  var pieces = document.querySelectorAll('.piece-card[data-category]');
  var countEl = document.getElementById('gallery-count');
  var emptyEl = document.getElementById('gallery-empty');

  if (chips.length && pieces.length) {
    var applyFilter = function (filter) {
      var shown = 0;
      pieces.forEach(function (card) {
        var match = filter === 'all' || card.getAttribute('data-category') === filter;
        card.hidden = !match;
        if (match) shown++;
      });
      chips.forEach(function (chip) {
        chip.setAttribute('aria-pressed', chip.getAttribute('data-filter') === filter ? 'true' : 'false');
      });
      if (countEl) {
        countEl.textContent = 'Showing ' + shown + ' of ' + pieces.length + ' pairs';
      }
      if (emptyEl) emptyEl.hidden = shown !== 0;
    };

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        applyFilter(chip.getAttribute('data-filter'));
      });
    });

    applyFilter('all');
  }

  /* 3. Custom order form -------------------------------------------------- */
  /* No backend here, and a form that pretends to send is a lie. Instead the
     form composes the inquiry, hands it to the clipboard, and sends the
     visitor to Instagram DMs — where the business actually lives. */

  var form = document.getElementById('inquiry-form');
  var success = document.getElementById('form-success');
  var preview = document.getElementById('dm-preview');
  var copyBtn = document.getElementById('copy-dm');

  if (form && success && preview && copyBtn) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var name = document.getElementById('f-name');
      var contact = document.getElementById('f-contact');
      var type = document.getElementById('f-type');
      var vision = document.getElementById('f-vision');

      var message =
        'Hi Liza! I would like to commission a custom pair of Sparktacles.\n\n' +
        'Name: ' + name.value.trim() + '\n' +
        'Reach me at: ' + contact.value.trim() + '\n' +
        'Frames: ' + type.options[type.selectedIndex].text + '\n' +
        'My idea: ' + vision.value.trim();

      var submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.classList.add('is-loading');

      /* brief pause so the button visibly works before the swap */
      window.setTimeout(function () {
        if (submitBtn) submitBtn.classList.remove('is-loading');
        preview.textContent = message;
        form.hidden = true;
        success.hidden = false;
        var heading = success.querySelector('h2');
        if (heading) heading.focus();
      }, 900);
    });

    copyBtn.addEventListener('click', function () {
      var text = preview.textContent || '';
      var done = function () {
        copyBtn.textContent = 'Copied to clipboard';
        setTimeout(function () { copyBtn.textContent = 'Copy my message'; }, 2400);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text, done); });
      } else {
        fallbackCopy(text, done);
      }
    });
  }

  function fallbackCopy(text, done) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'absolute';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      done();
    } catch (err) {
      window.prompt('Copy your message:', text);
    }
    document.body.removeChild(ta);
  }

  /* 4. Footer year --------------------------------------------------------- */

  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
