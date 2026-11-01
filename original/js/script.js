document.addEventListener('DOMContentLoaded', function () {

  var header = document.getElementById('header');
  var navToggle = document.getElementById('navToggle');
  var navLinks = document.getElementById('navLinks');
  var contactForm = document.getElementById('contactForm');
  var formNote = document.getElementById('formNote');

  /* ===== Mobile Nav Toggle ===== */
  navToggle.addEventListener('click', function () {
    navToggle.classList.toggle('active');
    navLinks.classList.toggle('active');
  });

  navLinks.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      navToggle.classList.remove('active');
      navLinks.classList.remove('active');
    });
  });

  /* ===== Header Scroll Effect ===== */
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(function () {
        if (window.scrollY > 50) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
        ticking = false;
      });
      ticking = true;
    }
  });

  /* ===== Sparkle Particles ===== */
  var sparklesContainer = document.querySelector('.sparkles');
  if (sparklesContainer) {
    var colors = ['#f59e0b', '#a855f7', '#fbbf24', '#c084fc', '#f43f5e', '#ffffff'];
    for (var i = 0; i < 40; i++) {
      var dot = document.createElement('div');
      dot.className = 'sparkle-dot';
      dot.style.left = Math.random() * 100 + '%';
      dot.style.top = Math.random() * 100 + '%';
      dot.style.animationDelay = Math.random() * 4 + 's';
      dot.style.animationDuration = (2 + Math.random() * 4) + 's';
      dot.style.width = (2 + Math.random() * 5) + 'px';
      dot.style.height = dot.style.width;
      dot.style.background = colors[Math.floor(Math.random() * colors.length)];
      sparklesContainer.appendChild(dot);
    }
  }

  /* ===== Fade-in on Scroll ===== */
  var fadeElements = document.querySelectorAll(
    '.service-card, .gallery-card, .event-card, .about-grid, .contact-link, .about-stats'
  );
  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  fadeElements.forEach(function (el) {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });

  /* ===== Contact Form ===== */
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = document.getElementById('name').value.trim();
      if (!name) return;
      formNote.textContent = 'Thanks, ' + name + '! Message received. We\'ll be in touch soon. ✨';
      formNote.style.color = '#16a34a';
      contactForm.reset();
      setTimeout(function () {
        formNote.textContent = '';
      }, 5000);
    });
  }
});