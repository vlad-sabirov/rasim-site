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
  let cursorVisible = true;
  let rafId = null;

  document.addEventListener('mousemove', function(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    inner.style.left = mouseX + 'px';
    inner.style.top = mouseY + 'px';
  });

  function animateOuter() {
    outerX += (mouseX - outerX) * lerp;
    outerY += (mouseY - outerY) * lerp;
    outer.style.left = outerX + 'px';
    outer.style.top = outerY + 'px';
    if (cursorVisible) rafId = requestAnimationFrame(animateOuter);
  }
  rafId = requestAnimationFrame(animateOuter);

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

  // Pause rAF when cursor leaves window
  document.addEventListener('mouseleave', function() {
    cursorVisible = false;
    inner.style.opacity = '0';
    outer.style.opacity = '0';
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
  });
  document.addEventListener('mouseenter', function() {
    cursorVisible = true;
    inner.style.opacity = '1';
    outer.style.opacity = '0.5';
    if (!rafId) rafId = requestAnimationFrame(animateOuter);
  });
})();
