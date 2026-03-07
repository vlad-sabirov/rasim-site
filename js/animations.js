// ===== GSAP Animations =====
document.addEventListener('DOMContentLoaded', function() {
  gsap.registerPlugin(ScrollTrigger);

  // ----- Hero Tagline -----
  gsap.from('.hero__tagline', { opacity: 0, y: -10, duration: 0.6, delay: 0.1 });
  gsap.to('.hero__tagline', { opacity: 1, duration: 0.6, delay: 0.1 });

  // ----- Hero Title: Split into words and animate -----
  var heroTitle = document.getElementById('heroTitle');
  if (heroTitle) {
    var text = heroTitle.innerHTML;
    var words = text.split(/(<br\s*\/?>|\s+)/).filter(Boolean);
    heroTitle.innerHTML = '';

    words.forEach(function(word) {
      if (word.match(/<br\s*\/?>/)) {
        heroTitle.appendChild(document.createElement('br'));
      } else if (word.trim()) {
        var span = document.createElement('span');
        span.className = 'word';
        span.textContent = word;
        heroTitle.appendChild(span);
        heroTitle.appendChild(document.createTextNode(' '));
      }
    });

    gsap.to('.hero__title .word', {
      opacity: 1, y: 0, duration: 0.8,
      stagger: 0.1, ease: 'power3.out', delay: 0.3
    });
  }

  // Hero subtitle + CTA
  gsap.from('.hero__subtitle', { opacity: 0, y: 20, duration: 0.8, delay: 1 });
  gsap.from('.section-hero .btn', { opacity: 0, y: 20, duration: 0.8, delay: 1.2 });

  // ----- Dust Particles -----
  function createDustBurst(x, y) {
    for (var i = 0; i < 12; i++) {
      var p = document.createElement('div');
      p.className = 'dust-particle';
      p.style.left = x + 'px';
      p.style.top = y + 'px';
      document.body.appendChild(p);

      var angle = (Math.PI * 2 / 12) * i + (Math.random() - 0.5);
      var dist = 30 + Math.random() * 60;
      var size = 4 + Math.random() * 6;

      gsap.set(p, { width: size, height: size, opacity: 0.8 });
      gsap.to(p, {
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        opacity: 0, scale: 0,
        duration: 0.6 + Math.random() * 0.4,
        ease: 'power2.out',
        onComplete: function() { if (p.parentNode) p.parentNode.removeChild(p); }
      });
    }
  }

  // ----- Header Sticky with Cartoon Hands -----
  var header = document.getElementById('header');
  var handsContainer = document.getElementById('headerHands');
  var handLeft = handsContainer.querySelector('.hand-left');
  var handRight = handsContainer.querySelector('.hand-right');
  var isFixed = false;
  var animating = false;
  var currentTl = null;

  var placeholder = document.createElement('div');
  placeholder.style.display = 'none';
  placeholder.style.background = '#FAFAFA';
  header.parentNode.insertBefore(placeholder, header.nextSibling);

  var headerH = header.offsetHeight;

  function resetHands() {
    gsap.killTweensOf([handLeft, handRight, handsContainer]);
    handsContainer.style.opacity = '0';
    handLeft.style.top = '-170px';
    handRight.style.top = '-170px';
    handLeft.style.transform = '';
    handRight.style.transform = '';
  }

  var isMobile = window.innerWidth <= 767;
  var safeAreaTop = isMobile ? 50 : 0;

  window.addEventListener('resize', function() {
    isMobile = window.innerWidth <= 767;
    safeAreaTop = isMobile ? 50 : 0;
  });

  function makeHeaderFixed() {
    header.classList.add('is-fixed');
    header.style.position = 'fixed';
    header.style.left = '0';
    header.style.width = '100%';
    if (safeAreaTop > 0) {
      header.style.paddingTop = safeAreaTop + 'px';
    }
  }

  function makeHeaderRelative() {
    header.classList.remove('is-fixed');
    header.style.position = '';
    header.style.top = '';
    header.style.left = '';
    header.style.width = '';
    header.style.transform = '';
    header.style.paddingTop = '';
  }

  function attachHeader() {
    if (isFixed) return;
    if (currentTl) { currentTl.kill(); }
    animating = true;

    placeholder.style.display = 'block';
    placeholder.style.height = headerH + 'px';

    makeHeaderFixed();
    header.style.top = -(headerH + 20) + 'px';

    resetHands();

    currentTl = gsap.timeline({
      onComplete: function() {
        isFixed = true;
        animating = false;
        currentTl = null;
        resetHands();
      }
    });

    currentTl.set(handsContainer, { opacity: 1 });
    currentTl.set([handLeft, handRight], { top: -170, scaleX: 1, rotation: 0 });
    currentTl.to(handLeft, { top: -60, rotation: 3, scaleX: 1.06, duration: 0.5, ease: 'power2.out' }, 0);
    currentTl.to(handRight, { top: -60, rotation: -3, scaleX: 1.06, duration: 0.5, ease: 'power2.out' }, 0);
    currentTl.to(header, { top: -safeAreaTop, duration: 0.5, ease: 'power2.out' }, 0);
    currentTl.to(handLeft, { top: -170, rotation: -5, scaleX: 1, duration: 0.3, ease: 'power2.in' }, 0.45);
    currentTl.to(handRight, { top: -170, rotation: 5, scaleX: 1, duration: 0.3, ease: 'power2.in' }, 0.45);
    currentTl.set(handsContainer, { opacity: 0 });
  }

  var headerInner = header.querySelector('.header__inner');

  function detachHeader() {
    if (!isFixed) return;
    if (currentTl) { currentTl.kill(); }
    animating = true;

    // Header stays fixed during entire animation — no jumps
    resetHands();

    currentTl = gsap.timeline({
      onComplete: function() {
        isFixed = false;
        animating = false;
        currentTl = null;
        makeHeaderRelative();
        placeholder.style.display = 'none';
        resetHands();
        gsap.set(headerInner, { clearProps: 'transform' });
        // Dust shadow fades out via CSS transition
        header.classList.remove('dust-shadow');
        ScrollTrigger.refresh();
      }
    });

    // 1. Hands come down
    currentTl.set(handsContainer, { opacity: 1 });
    currentTl.set([handLeft, handRight], { top: -170, scaleX: 1, rotation: 0 });
    currentTl.to(handLeft, { top: -55, rotation: 3, scaleX: 1.08, duration: 0.35, ease: 'power2.out' }, 0);
    currentTl.to(handRight, { top: -55, rotation: -3, scaleX: 1.08, duration: 0.35, ease: 'power2.out' }, 0);

    // 2. SLAM — hands press down hard, inner content squashes
    currentTl.to(handLeft, { top: -40, scaleX: 1.18, rotation: 5, duration: 0.1, ease: 'power3.in' }, 0.35);
    currentTl.to(handRight, { top: -40, scaleX: 1.18, rotation: -5, duration: 0.1, ease: 'power3.in' }, 0.35);
    currentTl.to(headerInner, { scaleY: 0.85, scaleX: 1.02, duration: 0.08, ease: 'power3.in' }, 0.38);

    // 3. Impact — dust + shadow (simultaneous with slam)
    currentTl.call(function() {
      var hRect = header.getBoundingClientRect();
      createDustBurst(hRect.left + hRect.width * 0.1, hRect.bottom);
      createDustBurst(hRect.left + hRect.width * 0.25, hRect.bottom);
      createDustBurst(hRect.left + hRect.width * 0.5, hRect.bottom);
      createDustBurst(hRect.left + hRect.width * 0.75, hRect.bottom);
      createDustBurst(hRect.left + hRect.width * 0.9, hRect.bottom);
      header.classList.add('dust-shadow');
    }, null, 0.45);

    // 4. Inner content bounces back
    currentTl.to(headerInner, { scaleY: 1, scaleX: 1, duration: 0.4, ease: 'elastic.out(1.2, 0.35)' }, 0.46);

    // 5. Hands release and go back up
    currentTl.to(handLeft, { top: -170, rotation: -5, scaleX: 1, duration: 0.3, ease: 'power2.in' }, 0.55);
    currentTl.to(handRight, { top: -170, rotation: 5, scaleX: 1, duration: 0.3, ease: 'power2.in' }, 0.55);
    currentTl.set(handsContainer, { opacity: 0 }, 0.85);
  }

  var triggerPoint = header.offsetTop + headerH;

  // Skip header sticky logic on mobile (header is hidden)
  function isHeaderHidden() {
    return window.getComputedStyle(header).display === 'none';
  }

  // ----- Counter Animation -----
  document.querySelectorAll('.counter__number').forEach(function(counter) {
    var target = parseInt(counter.getAttribute('data-target'));
    ScrollTrigger.create({
      trigger: counter, start: 'top 85%', once: true,
      onEnter: function() {
        gsap.to(counter, {
          duration: 2, ease: 'power1.out',
          onUpdate: function() {
            counter.textContent = Math.round(target * this.progress());
          }
        });
      }
    });
  });

  // ----- Service Cards -----
  gsap.set('.service-card', { opacity: 0, y: 40 });
  ScrollTrigger.create({
    trigger: '.services-grid',
    start: 'top 85%',
    once: true,
    onEnter: function() {
      gsap.to('.service-card', {
        opacity: 1, y: 0, duration: 0.7, stagger: 0.15, ease: 'power3.out'
      });
    }
  });

  // ----- Portfolio Cards -----
  gsap.set('.portfolio-card', { opacity: 0, scale: 0.9 });
  ScrollTrigger.create({
    trigger: '.portfolio-grid',
    start: 'top 85%',
    once: true,
    onEnter: function() {
      gsap.to('.portfolio-card', {
        opacity: 1, scale: 1, duration: 0.6, stagger: 0.1, ease: 'power3.out'
      });
    }
  });

  // ----- Contact Form -----
  gsap.from('.contact-form', {
    scrollTrigger: { trigger: '.section-contact', start: 'top 75%' },
    opacity: 0, y: 40, duration: 0.8, ease: 'power3.out'
  });

  // ----- Section Titles -----
  document.querySelectorAll('.section__title').forEach(function(title) {
    gsap.from(title, {
      scrollTrigger: { trigger: title, start: 'top 85%' },
      opacity: 0, y: 30, duration: 0.7, ease: 'power3.out'
    });
  });

  // ----- Section Text -----
  document.querySelectorAll('.section__text').forEach(function(text) {
    gsap.from(text, {
      scrollTrigger: { trigger: text, start: 'top 85%' },
      opacity: 0, y: 20, duration: 0.7, delay: 0.15, ease: 'power3.out'
    });
  });

  // ===== Cache DOM elements =====
  var scrollIndicator = document.getElementById('scrollIndicator');
  var scrollIndicatorText = document.getElementById('scrollIndicatorText');
  var sectionIds = ['hero', 'about', 'services', 'portfolio', 'contact'];
  var depthMeter = document.getElementById('depthMeter');
  var depthValueEl = document.getElementById('depthValue');
  var depthFillEl = document.getElementById('depthFill');
  var depthZoneEl = document.getElementById('depthZone');
  var bubblesContainer = document.getElementById('bubblesContainer');
  var contactSection = document.getElementById('contact');

  // ===== Scroll Indicator — show on load =====
  if (scrollIndicator) {
    gsap.to(scrollIndicator, { opacity: 1, duration: 0.8, delay: 1.5 });

    scrollIndicator.addEventListener('click', function(e) {
      e.preventDefault();
      // If at the bottom (last section), do nothing
      if (indicatorAtBottom) return;

      var scrollY = window.scrollY || window.pageYOffset;
      var viewMid = scrollY + window.innerHeight * 0.4;

      for (var i = 0; i < sectionIds.length - 1; i++) {
        var sec = document.getElementById(sectionIds[i]);
        var nextSec = document.getElementById(sectionIds[i + 1]);
        if (sec && nextSec) {
          var secTop = sec.getBoundingClientRect().top + scrollY;
          var secBottom = secTop + sec.offsetHeight;
          if (viewMid >= secTop && viewMid < secBottom) {
            nextSec.scrollIntoView({ behavior: 'smooth' });
            return;
          }
        }
      }
      // Fallback: scroll to about
      var about = document.getElementById('about');
      if (about) about.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // ===== Depth zones =====
  var depthZones = [
    { at: 0,    depth: 0,    label: 'Поверхность' },
    { at: 0.2,  depth: 100,  label: 'Под водой' },
    { at: 0.45, depth: 500,  label: 'Глубина' },
    { at: 0.7,  depth: 1000, label: 'Тёмные воды' },
    { at: 0.9,  depth: 2000, label: 'Дно океана' }
  ];

  var lastDepthDisplay = -1;
  var lastZoneLabel = '';
  var indicatorAtBottom = false;
  var indicatorHideTimer = null;
  var indicatorIsDark = false;
  var meterIsDark = false;
  var meterIsVisible = false;

  // ===== Bubble Particles =====
  var bubbles = [];
  var maxBubbles = 24;

  function createBubble() {
    if (bubbles.length >= maxBubbles) return;

    var bubble = document.createElement('div');
    bubble.className = 'bubble';

    var size = 4 + Math.random() * 10;
    var opacity = 0.25 + Math.random() * 0.35;

    bubble.style.cssText = 'width:' + size + 'px;height:' + size + 'px;left:' + (Math.random() * window.innerWidth) + 'px;bottom:-10px;opacity:' + opacity;

    bubblesContainer.appendChild(bubble);
    bubbles.push(bubble);

    var duration = 5 + Math.random() * 6;
    var drift = (Math.random() - 0.5) * 100;

    gsap.to(bubble, {
      y: -(window.innerHeight + 40),
      x: drift,
      duration: duration,
      ease: 'none',
      onComplete: function() {
        if (bubble.parentNode) bubble.parentNode.removeChild(bubble);
        var idx = bubbles.indexOf(bubble);
        if (idx > -1) bubbles.splice(idx, 1);
      }
    });
  }

  // Bubble spawn timer
  var bubbleRate = 600;
  var bubbleTimer = null;
  function scheduleBubble() {
    bubbleTimer = setTimeout(function() {
      if (!document.hidden) createBubble();
      scheduleBubble();
    }, bubbleRate);
  }
  scheduleBubble();

  // Stop bubbles when tab is hidden
  document.addEventListener('visibilitychange', function() {
    if (document.hidden && bubbleTimer) {
      clearTimeout(bubbleTimer);
      bubbleTimer = null;
    } else if (!document.hidden && !bubbleTimer) {
      scheduleBubble();
    }
  });

  // ===== Single unified scroll handler with rAF =====
  var ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;

    requestAnimationFrame(function() {
      var scrollY = window.scrollY || window.pageYOffset;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var progress = docHeight > 0 ? Math.min(scrollY / docHeight, 1) : 0;

      // --- Header (skip on mobile — header is hidden) ---
      if (!animating && !isHeaderHidden()) {
        if (scrollY > triggerPoint && !isFixed) {
          attachHeader();
        } else if (scrollY <= triggerPoint && isFixed) {
          detachHeader();
        }
      }

      // --- Depth Meter ---
      if (depthMeter) {
        var shouldBeVisible = scrollY > 50;
        if (shouldBeVisible !== meterIsVisible) {
          meterIsVisible = shouldBeVisible;
          if (shouldBeVisible) depthMeter.classList.add('is-visible');
          else depthMeter.classList.remove('is-visible');
        }

        var shouldBeDark = progress > 0.35;
        if (shouldBeDark !== meterIsDark) {
          meterIsDark = shouldBeDark;
          if (shouldBeDark) depthMeter.classList.add('is-dark');
          else depthMeter.classList.remove('is-dark');
        }

        // Interpolate depth
        var depth = 0;
        var zoneLabel = depthZones[0].label;
        for (var i = 0; i < depthZones.length - 1; i++) {
          if (progress >= depthZones[i].at && progress <= depthZones[i + 1].at) {
            var lp = (progress - depthZones[i].at) / (depthZones[i + 1].at - depthZones[i].at);
            depth = depthZones[i].depth + (depthZones[i + 1].depth - depthZones[i].depth) * lp;
            zoneLabel = depthZones[i + 1].label;
            break;
          }
        }
        if (progress >= depthZones[depthZones.length - 1].at) {
          depth = depthZones[depthZones.length - 1].depth;
          zoneLabel = depthZones[depthZones.length - 1].label;
        }
        if (progress <= depthZones[0].at) {
          zoneLabel = depthZones[0].label;
        }

        var depthRounded = Math.round(depth);
        if (depthRounded !== lastDepthDisplay) {
          depthValueEl.textContent = depthRounded;
          lastDepthDisplay = depthRounded;
        }
        if (zoneLabel !== lastZoneLabel) {
          depthZoneEl.textContent = zoneLabel;
          lastZoneLabel = zoneLabel;
        }

        depthFillEl.style.height = (progress * 100) + '%';
      }

      // --- Scroll Indicator ---
      if (scrollIndicator) {
        var shouldIndicatorBeDark = progress > 0.35;
        if (shouldIndicatorBeDark !== indicatorIsDark) {
          indicatorIsDark = shouldIndicatorBeDark;
          if (shouldIndicatorBeDark) scrollIndicator.classList.add('is-dark');
          else scrollIndicator.classList.remove('is-dark');
        }

        if (contactSection) {
          var contactTop = contactSection.getBoundingClientRect().top;
          if (contactTop < window.innerHeight * 0.5) {
            if (!indicatorAtBottom) {
              indicatorAtBottom = true;
              scrollIndicatorText.textContent = 'Пора погружаться!';
              clearTimeout(indicatorHideTimer);
              indicatorHideTimer = setTimeout(function() {
                scrollIndicator.classList.add('is-hidden');
              }, 2000);
            }
          } else {
            if (indicatorAtBottom) {
              indicatorAtBottom = false;
              clearTimeout(indicatorHideTimer);
              scrollIndicator.classList.remove('is-hidden');
              scrollIndicatorText.textContent = 'Погрузитесь глубже';
            }
          }
        }
      }

      // --- Bubble rate update ---
      bubbleRate = 600 - progress * 350;

      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
});
