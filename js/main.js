// ===== Main Logic =====
(function() {

  // ----- Set page height & waterline position for background gradient -----
  function updateGradient() {
    var main = document.querySelector('main');
    if (!main) return;

    var pageH = main.scrollHeight;
    document.documentElement.style.setProperty('--page-height', pageH + 'px');

    // Calculate waterline position as % of total page height
    // Use hero section bottom as anchor — water starts where hero ends
    var hero = document.getElementById('hero');
    if (hero && pageH > 0) {
      var heroBottom = hero.offsetTop + hero.offsetHeight - main.offsetTop;
      // Shift waterline up so gradient meets the waves earlier
      var wlPercent = ((heroBottom + 120) / pageH) * 100;
      main.style.setProperty('--wl', wlPercent + '%');
    }
  }
  updateGradient();
  window.addEventListener('resize', updateGradient);
  window.addEventListener('load', updateGradient);

  // ----- Scroll to Top Button -----
  var scrollTopBtn = document.getElementById('scrollTopBtn');
  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ----- Side Panel: adapt color to dark/light sections -----
  var sidePanel = document.querySelector('.side-panel');
  var sections = document.querySelectorAll('.section');
  var darkSections = ['section-portfolio', 'section-contact'];

  function updateSidePanelColor() {
    var scrollY = window.scrollY + window.innerHeight / 2;

    for (var i = sections.length - 1; i >= 0; i--) {
      var section = sections[i];
      if (scrollY >= section.offsetTop) {
        var isDark = darkSections.some(function(cls) {
          return section.classList.contains(cls);
        });
        if (isDark) {
          sidePanel.classList.add('is-dark');
        } else {
          sidePanel.classList.remove('is-dark');
        }
        break;
      }
    }
  }

  window.addEventListener('scroll', updateSidePanelColor, { passive: true });
  updateSidePanelColor();

  // ----- Contact Form: email button handler -----
  var contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();

      var name = contactForm.querySelector('[name="name"]').value;
      var contact = contactForm.querySelector('[name="contact"]').value;
      var message = contactForm.querySelector('[name="message"]').value;

      // Build mailto link
      var subject = encodeURIComponent('Заявка с сайта от ' + name);
      var body = encodeURIComponent(
        'Имя: ' + name + '\n' +
        'Контакт: ' + contact + '\n' +
        'Сообщение: ' + message
      );

      window.location.href = 'mailto:sabirov.vlad0@gmail.com?subject=' + subject + '&body=' + body;
    });
  }

  // ----- Smooth scroll for all anchor links -----
  document.querySelectorAll('a[href^="#"]').forEach(function(link) {
    link.addEventListener('click', function(e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#') return;

      var target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

})();
