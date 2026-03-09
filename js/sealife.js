// ===== Sea Life: fish & whales swimming in background =====
(function() {
  var container = document.getElementById('sealifeContainer');
  if (!container) return;

  var scrollProgress = 0;
  var THRESHOLD = 0.15;
  var MAX_FISH = 6;
  var MAX_WHALES = 1;
  var fishCount = 0;
  var whaleCount = 0;

  window.addEventListener('scroll', function() {
    var docH = document.documentElement.scrollHeight - window.innerHeight;
    scrollProgress = docH > 0 ? Math.min((window.scrollY || window.pageYOffset) / docH, 1) : 0;
  }, { passive: true });

  function pageH() { return document.documentElement.scrollHeight; }

  // ===== Fish SVGs =====
  var fishSVGs = [
    function(color) {
      return '<svg width="40" height="20" viewBox="0 0 40 20" fill="none" xmlns="http://www.w3.org/2000/svg">'
        + '<path d="M4,10 Q8,3 16,4 Q22,2 28,5 Q34,8 36,10 Q34,12 28,15 Q22,18 16,16 Q8,17 4,10 Z" fill="' + color + '" opacity="0.6"/>'
        + '<path d="M1,10 Q4,6 6,10 Q4,14 1,10 Z" fill="' + color + '" opacity="0.5"/>'
        + '<circle cx="30" cy="9" r="1.2" fill="rgba(0,0,0,0.4)"/>'
        + '<path d="M16,7 Q20,5 24,7" stroke="' + color + '" stroke-width="0.5" fill="none" opacity="0.3"/>'
        + '</svg>';
    },
    function(color) {
      return '<svg width="50" height="16" viewBox="0 0 50 16" fill="none" xmlns="http://www.w3.org/2000/svg">'
        + '<path d="M3,8 Q6,2 18,3 Q30,2 40,5 Q46,7 48,8 Q46,9 40,11 Q30,14 18,13 Q6,14 3,8 Z" fill="' + color + '" opacity="0.55"/>'
        + '<path d="M0,8 Q3,5 5,8 Q3,11 0,8 Z" fill="' + color + '" opacity="0.45"/>'
        + '<circle cx="43" cy="7.5" r="1" fill="rgba(0,0,0,0.35)"/>'
        + '<line x1="10" y1="5" x2="10" y2="11" stroke="' + color + '" stroke-width="0.3" opacity="0.2"/>'
        + '<line x1="15" y1="4.5" x2="15" y2="11.5" stroke="' + color + '" stroke-width="0.3" opacity="0.15"/>'
        + '</svg>';
    },
    function(color) {
      return '<svg width="28" height="20" viewBox="0 0 28 20" fill="none" xmlns="http://www.w3.org/2000/svg">'
        + '<path d="M6,10 Q8,3 14,2 Q20,2 24,6 Q26,9 24,14 Q20,18 14,18 Q8,17 6,10 Z" fill="' + color + '" opacity="0.55"/>'
        + '<path d="M2,10 Q5,6 7,10 Q5,14 2,10 Z" fill="' + color + '" opacity="0.45"/>'
        + '<path d="M14,5 Q16,3 18,5 L16,7 Z" fill="' + color + '" opacity="0.35"/>'
        + '<circle cx="21" cy="9" r="1.3" fill="rgba(0,0,0,0.35)"/>'
        + '</svg>';
    }
  ];

  // ===== Whale SVG — realistic humpback =====
  function whaleSVG(color) {
    return '<svg width="220" height="80" viewBox="0 0 220 80" fill="none" xmlns="http://www.w3.org/2000/svg">'
      // Main body — smooth organic shape
      + '<path d="M25,42 Q15,36 12,28 Q10,20 18,14 Q35,4 70,6 Q105,3 140,8 Q170,14 190,24 Q205,34 200,44 Q192,54 170,58 Q135,64 95,62 Q55,60 35,52 Z" fill="' + color + '" opacity="0.4"/>'
      // Head — rounded, bulbous
      + '<path d="M190,24 Q198,20 206,22 Q214,28 210,36 Q204,42 200,44 Q196,38 190,24 Z" fill="' + color + '" opacity="0.38"/>'
      // Jaw line
      + '<path d="M200,44 Q208,40 212,34" stroke="rgba(0,0,0,0.08)" stroke-width="0.8" fill="none"/>'
      // Eye
      + '<ellipse cx="198" cy="28" rx="2.5" ry="2" fill="rgba(0,0,0,0.3)"/>'
      + '<ellipse cx="198.5" cy="27.5" rx="1" ry="0.8" fill="rgba(255,255,255,0.15)"/>'
      // Belly — lighter, with throat grooves
      + '<path d="M50,52 Q85,58 130,56 Q165,50 190,38 Q185,48 165,55 Q130,62 95,60 Q60,58 50,52 Z" fill="rgba(255,255,255,0.07)"/>'
      // Throat grooves
      + '<path d="M140,42 Q155,40 170,36" stroke="rgba(255,255,255,0.04)" stroke-width="0.6" fill="none"/>'
      + '<path d="M130,46 Q150,44 168,40" stroke="rgba(255,255,255,0.03)" stroke-width="0.5" fill="none"/>'
      + '<path d="M120,50 Q145,48 165,44" stroke="rgba(255,255,255,0.03)" stroke-width="0.5" fill="none"/>'
      // Fluke (tail) — wide, realistic
      + '<path d="M25,42 Q18,36 8,26 Q3,20 2,16 Q4,14 8,16 Q14,22 20,30 Z" fill="' + color + '" opacity="0.35"/>'
      + '<path d="M25,42 Q18,48 8,56 Q3,62 2,66 Q4,68 8,64 Q14,56 20,48 Z" fill="' + color + '" opacity="0.35"/>'
      // Fluke notch
      + '<path d="M6,16 Q5,20 3,24" stroke="rgba(0,0,0,0.06)" stroke-width="0.5" fill="none"/>'
      // Dorsal hump (small, humpback style)
      + '<path d="M85,8 Q90,3 96,6 Q98,10 95,12" fill="' + color + '" opacity="0.3"/>'
      // Pectoral fin — long, characteristic for humpback
      + '<path d="M148,48 Q140,60 128,68 Q122,72 118,70 Q120,64 128,56 Q136,48 145,46 Z" fill="' + color + '" opacity="0.3"/>'
      + '<path d="M128,56 Q132,54 136,50" stroke="rgba(255,255,255,0.04)" stroke-width="0.5" fill="none"/>'
      // Body texture — barnacle spots
      + '<circle cx="80" cy="15" r="1.5" fill="rgba(255,255,255,0.04)"/>'
      + '<circle cx="110" cy="12" r="1" fill="rgba(255,255,255,0.03)"/>'
      + '<circle cx="160" cy="20" r="1.2" fill="rgba(255,255,255,0.03)"/>'
      + '<circle cx="185" cy="26" r="1.8" fill="rgba(255,255,255,0.04)"/>'
      // Body contour highlights
      + '<path d="M55,10 Q90,6 130,10" stroke="rgba(255,255,255,0.04)" stroke-width="0.8" fill="none"/>'
      + '<path d="M65,18 Q100,14 140,18" stroke="rgba(255,255,255,0.03)" stroke-width="0.6" fill="none"/>'
      + '</svg>';
  }

  var fishColors = [
    'rgba(100,180,220,0.7)',
    'rgba(80,160,200,0.6)',
    'rgba(60,140,180,0.5)',
    'rgba(90,200,190,0.5)',
    'rgba(120,170,210,0.6)',
    'rgba(70,130,160,0.5)',
    'rgba(140,190,220,0.5)',
  ];

  var whaleColors = [
    'rgba(60,100,130,0.5)',
    'rgba(50,90,120,0.45)',
    'rgba(70,110,140,0.4)',
  ];

  // ===== Spawn =====
  function spawnFish() {
    if (scrollProgress < THRESHOLD || fishCount >= MAX_FISH) return;

    var el = document.createElement('div');
    el.className = 'sealife sealife--fish';

    var template = fishSVGs[Math.floor(Math.random() * fishSVGs.length)];
    var color = fishColors[Math.floor(Math.random() * fishColors.length)];
    var scale = 0.7 + Math.random() * 1.3;
    el.innerHTML = template(color);

    var goingRight = Math.random() > 0.5;
    var startX = goingRight ? -80 : window.innerWidth + 80;
    var endX = goingRight ? window.innerWidth + 80 : -80;

    // Fish: anywhere in underwater zone (20%-95% of page height)
    var total = pageH();
    var minY = total * 0.2;
    var maxY = total * 0.95;
    var pageY = minY + Math.random() * (maxY - minY);

    var flipX = goingRight ? 1 : -1;
    el.style.cssText = 'left:' + startX + 'px;top:' + pageY + 'px;'
      + 'transform:scaleX(' + flipX + ') scale(' + scale + ');'
      + 'opacity:0;transition:opacity 2s;';

    var swimDur = 0.8 + Math.random() * 0.8;
    el.querySelector('svg').style.animationDuration = swimDur + 's';

    container.appendChild(el);
    fishCount++;

    requestAnimationFrame(function() { el.style.opacity = '1'; });

    var duration = 20 + Math.random() * 25;
    var yDrift = (Math.random() - 0.5) * 120;

    gsap.to(el, {
      x: endX - startX,
      y: yDrift,
      duration: duration,
      ease: 'none',
      onComplete: function() {
        if (el.parentNode) el.parentNode.removeChild(el);
        fishCount--;
      }
    });
  }

  function spawnWhale() {
    if (scrollProgress < THRESHOLD || whaleCount >= MAX_WHALES) return;

    var el = document.createElement('div');
    el.className = 'sealife sealife--whale';

    var color = whaleColors[Math.floor(Math.random() * whaleColors.length)];
    el.innerHTML = whaleSVG(color);

    var scale = 0.8 + Math.random() * 0.6;
    var goingRight = Math.random() > 0.5;
    var startX = goingRight ? -300 : window.innerWidth + 300;
    var endX = goingRight ? window.innerWidth + 300 : -300;

    // Whales: from middle to bottom (50%-90% of page height)
    var total = pageH();
    var minY = total * 0.5;
    var maxY = total * 0.9;
    var pageY = minY + Math.random() * (maxY - minY);

    var flipX = goingRight ? 1 : -1;
    el.style.cssText = 'left:' + startX + 'px;top:' + pageY + 'px;'
      + 'transform:scaleX(' + flipX + ') scale(' + scale + ');'
      + 'opacity:0;transition:opacity 3s;';

    container.appendChild(el);
    whaleCount++;

    requestAnimationFrame(function() { el.style.opacity = '1'; });

    var duration = 40 + Math.random() * 30;
    var yDrift = (Math.random() - 0.5) * 60;

    gsap.to(el, {
      x: endX - startX,
      y: yDrift,
      duration: duration,
      ease: 'none',
      onComplete: function() {
        if (el.parentNode) el.parentNode.removeChild(el);
        whaleCount--;
      }
    });
  }

  // ===== Spawn loops =====
  function fishTick() {
    if (scrollProgress >= THRESHOLD) spawnFish();
    setTimeout(fishTick, 3000 + Math.random() * 3000);
  }

  function whaleTick() {
    if (scrollProgress >= THRESHOLD) spawnWhale();
    setTimeout(whaleTick, 15000 + Math.random() * 15000);
  }

  setTimeout(fishTick, 2000);
  setTimeout(whaleTick, 8000 + Math.random() * 7000);
})();
