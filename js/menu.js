// ===== Fullscreen Menu =====
(function() {
  const hamburger = document.getElementById('hamburgerBtn');
  const menu = document.getElementById('fullscreenMenu');
  const menuInner = menu.querySelector('.fullscreen-menu__inner');
  const links = menu.querySelectorAll('.fullscreen-menu__link');

  function closeMenu() {
    hamburger.classList.remove('is-active');
    menu.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  function openMenu() {
    hamburger.classList.add('is-active');
    menu.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function toggleMenu() {
    if (menu.classList.contains('is-open')) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  hamburger.addEventListener('click', toggleMenu);

  // Close on click outside menu links (on the overlay background)
  menu.addEventListener('click', function(e) {
    // If clicked on the overlay itself, not on the inner content
    if (e.target === menu || !menuInner.contains(e.target)) {
      closeMenu();
    }
  });

  // Close menu on link click + smooth scroll
  links.forEach(function(link) {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const target = document.querySelector(targetId);

      closeMenu();

      setTimeout(function() {
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
    });
  });

  // Close on Escape
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) {
      closeMenu();
    }
  });
})();
