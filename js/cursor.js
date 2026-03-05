// ===== Custom Cursor =====
(function() {
  const inner = document.querySelector('.cursor-inner');
  const outer = document.querySelector('.cursor-outer');

  if (!inner || !outer) return;

  // Hide on touch devices
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
    inner.style.display = 'none';
    outer.style.display = 'none';
    return;
  }

  let mouseX = 0, mouseY = 0;
  let outerX = 0, outerY = 0;
  const lerp = 0.15;

  document.addEventListener('mousemove', function(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    // Inner follows instantly
    inner.style.left = mouseX + 'px';
    inner.style.top = mouseY + 'px';
  });

  // Outer follows with delay (lerp)
  function animateOuter() {
    outerX += (mouseX - outerX) * lerp;
    outerY += (mouseY - outerY) * lerp;
    outer.style.left = outerX + 'px';
    outer.style.top = outerY + 'px';
    requestAnimationFrame(animateOuter);
  }
  animateOuter();

  // Hover effect on interactive elements
  const hoverElements = document.querySelectorAll('[data-cursor-hover], a, button, input, textarea');

  hoverElements.forEach(function(el) {
    el.addEventListener('mouseenter', function() {
      inner.classList.add('is-hover');
      outer.classList.add('is-hover');
    });
    el.addEventListener('mouseleave', function() {
      inner.classList.remove('is-hover');
      outer.classList.remove('is-hover');
    });
  });

  // Hide cursor when leaving window
  document.addEventListener('mouseleave', function() {
    inner.style.opacity = '0';
    outer.style.opacity = '0';
  });
  document.addEventListener('mouseenter', function() {
    inner.style.opacity = '1';
    outer.style.opacity = '0.5';
  });
})();
