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
  // Color update is handled in the unified scroll handler in animations.js
  // via progress-based dark mode detection

  // ----- Contact Form: send via Cloudflare Worker -----
  var contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();

      var name = contactForm.querySelector('[name="name"]').value.trim();
      var contact = contactForm.querySelector('[name="contact"]').value.trim();
      var niche = contactForm.querySelector('[name="niche"]').value.trim();
      var adsEl = contactForm.querySelector('[name="ads"]:checked');
      var message = contactForm.querySelector('[name="message"]').value.trim();

      if (!name) { alert('Пожалуйста, заполните поле "Ваше имя"'); return; }
      if (!contact) { alert('Пожалуйста, заполните поле "Телефон"'); return; }
      if (!niche) { alert('Пожалуйста, заполните поле "Какая ваша ниша?"'); return; }
      if (!adsEl) { alert('Пожалуйста, выберите "Запускали ранее рекламу?"'); return; }
      if (!message) { alert('Пожалуйста, заполните поле "Сообщение"'); return; }

      var ads = adsEl.value === 'yes' ? 'Да' : 'Нет';

      var submitBtn = contactForm.querySelector('button[type="submit"]');
      var originalText = submitBtn.textContent;
      submitBtn.textContent = 'Отправка...';
      submitBtn.disabled = true;

      fetch('https://rasim-contact.vlad-sabirov.workers.dev', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name, contact: contact, niche: niche, ads: ads, message: message })
      })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        if (data.ok) {
          contactForm.reset();
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
          var successOverlay = document.getElementById('formSuccess');
          if (successOverlay) {
            successOverlay.classList.add('is-visible');
            setTimeout(function() { successOverlay.classList.remove('is-visible'); }, 5000);
          }
        } else {
          submitBtn.textContent = 'Ошибка, попробуйте ещё';
          setTimeout(function() { submitBtn.textContent = originalText; submitBtn.disabled = false; }, 3000);
        }
      })
      .catch(function() {
        submitBtn.textContent = 'Ошибка, попробуйте ещё';
        setTimeout(function() { submitBtn.textContent = originalText; submitBtn.disabled = false; }, 3000);
      });
    });
  }

  // ----- Tooltip toggle on tap (mobile) -----
  document.querySelectorAll('.contact-form__hint').forEach(function(hint) {
    hint.addEventListener('click', function(e) {
      e.stopPropagation();
      hint.classList.toggle('is-active');
    });
  });
  document.addEventListener('click', function() {
    document.querySelectorAll('.contact-form__hint.is-active').forEach(function(h) {
      h.classList.remove('is-active');
    });
  });

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
