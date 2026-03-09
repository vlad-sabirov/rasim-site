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
  function viewW() { return document.documentElement.clientWidth; }

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
        + '</svg>';
    },
    function(color) {
      return '<svg width="28" height="20" viewBox="0 0 28 20" fill="none" xmlns="http://www.w3.org/2000/svg">'
        + '<path d="M6,10 Q8,3 14,2 Q20,2 24,6 Q26,9 24,14 Q20,18 14,18 Q8,17 6,10 Z" fill="' + color + '" opacity="0.55"/>'
        + '<path d="M2,10 Q5,6 7,10 Q5,14 2,10 Z" fill="' + color + '" opacity="0.45"/>'
        + '<circle cx="21" cy="9" r="1.3" fill="rgba(0,0,0,0.35)"/>'
        + '</svg>';
    }
  ];

  // ===== Whale SVG — realistic humpback =====
  function whaleSVG(color) {
    return '<svg width="220" height="80" viewBox="0 0 220 80" fill="none" xmlns="http://www.w3.org/2000/svg">'
      + '<path d="M25,42 Q15,36 12,28 Q10,20 18,14 Q35,4 70,6 Q105,3 140,8 Q170,14 190,24 Q205,34 200,44 Q192,54 170,58 Q135,64 95,62 Q55,60 35,52 Z" fill="' + color + '" opacity="0.4"/>'
      + '<path d="M190,24 Q198,20 206,22 Q214,28 210,36 Q204,42 200,44 Q196,38 190,24 Z" fill="' + color + '" opacity="0.38"/>'
      + '<path d="M200,44 Q208,40 212,34" stroke="rgba(0,0,0,0.08)" stroke-width="0.8" fill="none"/>'
      + '<ellipse cx="198" cy="28" rx="2.5" ry="2" fill="rgba(0,0,0,0.3)"/>'
      + '<ellipse cx="198.5" cy="27.5" rx="1" ry="0.8" fill="rgba(255,255,255,0.15)"/>'
      + '<path d="M50,52 Q85,58 130,56 Q165,50 190,38 Q185,48 165,55 Q130,62 95,60 Q60,58 50,52 Z" fill="rgba(255,255,255,0.07)"/>'
      + '<path d="M140,42 Q155,40 170,36" stroke="rgba(255,255,255,0.04)" stroke-width="0.6" fill="none"/>'
      + '<path d="M130,46 Q150,44 168,40" stroke="rgba(255,255,255,0.03)" stroke-width="0.5" fill="none"/>'
      + '<path d="M25,42 Q18,36 8,26 Q3,20 2,16 Q4,14 8,16 Q14,22 20,30 Z" fill="' + color + '" opacity="0.35"/>'
      + '<path d="M25,42 Q18,48 8,56 Q3,62 2,66 Q4,68 8,64 Q14,56 20,48 Z" fill="' + color + '" opacity="0.35"/>'
      + '<path d="M85,8 Q90,3 96,6 Q98,10 95,12" fill="' + color + '" opacity="0.3"/>'
      + '<path d="M148,48 Q140,60 128,68 Q122,72 118,70 Q120,64 128,56 Q136,48 145,46 Z" fill="' + color + '" opacity="0.3"/>'
      + '<circle cx="80" cy="15" r="1.5" fill="rgba(255,255,255,0.04)"/>'
      + '<circle cx="160" cy="20" r="1.2" fill="rgba(255,255,255,0.03)"/>'
      + '<path d="M55,10 Q90,6 130,10" stroke="rgba(255,255,255,0.04)" stroke-width="0.8" fill="none"/>'
      + '</svg>';
  }

  var fishColors = [
    'rgba(100,180,220,0.7)', 'rgba(80,160,200,0.6)',
    'rgba(60,140,180,0.5)', 'rgba(90,200,190,0.5)',
    'rgba(120,170,210,0.6)', 'rgba(70,130,160,0.5)',
  ];

  var whaleColors = [
    'rgba(60,100,130,0.5)', 'rgba(50,90,120,0.45)', 'rgba(70,110,140,0.4)',
  ];

  // ===== Spawn =====
  // All creatures use left:0 and are moved purely via GSAP translateX
  // so they never expand the page width

  function spawnFish() {
    if (scrollProgress < THRESHOLD || fishCount >= MAX_FISH) return;

    var el = document.createElement('div');
    el.className = 'sealife sealife--fish';

    var template = fishSVGs[Math.floor(Math.random() * fishSVGs.length)];
    var color = fishColors[Math.floor(Math.random() * fishColors.length)];
    var scale = 0.7 + Math.random() * 1.3;
    el.innerHTML = template(color);

    var w = viewW();
    var goingRight = Math.random() > 0.5;
    // Start just inside the edge, GSAP handles the full travel
    var startTX = goingRight ? -80 : w + 80;
    var endTX = goingRight ? w + 80 : -80;

    // Fish: anywhere in underwater zone (20%-95% of page)
    var total = pageH();
    var pageY = total * 0.2 + Math.random() * (total * 0.75);

    var flipX = goingRight ? 1 : -1;

    // left:0, top:pageY — positioned on page, only translateX moves horizontally
    el.style.cssText = 'left:0;top:' + pageY + 'px;'
      + 'transform:translateX(' + startTX + 'px) scaleX(' + flipX + ') scale(' + scale + ');'
      + 'opacity:0;';

    var swimDur = 0.8 + Math.random() * 0.8;
    el.querySelector('svg').style.animationDuration = swimDur + 's';

    container.appendChild(el);
    fishCount++;

    // Fade in
    gsap.to(el, { opacity: 1, duration: 2, ease: 'none' });

    var duration = 20 + Math.random() * 25;
    var yDrift = (Math.random() - 0.5) * 120;

    gsap.to(el, {
      x: endTX,
      y: yDrift,
      duration: duration,
      ease: 'none',
      overwrite: false,
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

    var w = viewW();
    var scale = 0.8 + Math.random() * 0.6;
    var goingRight = Math.random() > 0.5;
    var startTX = goingRight ? -300 : w + 300;
    var endTX = goingRight ? w + 300 : -300;

    // Whales: middle to bottom (50%-90% of page)
    var total = pageH();
    var pageY = total * 0.5 + Math.random() * (total * 0.4);

    var flipX = goingRight ? 1 : -1;

    el.style.cssText = 'left:0;top:' + pageY + 'px;'
      + 'transform:translateX(' + startTX + 'px) scaleX(' + flipX + ') scale(' + scale + ');'
      + 'opacity:0;';

    container.appendChild(el);
    whaleCount++;

    gsap.to(el, { opacity: 1, duration: 3, ease: 'none' });

    var duration = 40 + Math.random() * 30;
    var yDrift = (Math.random() - 0.5) * 60;

    gsap.to(el, {
      x: endTX,
      y: yDrift,
      duration: duration,
      ease: 'none',
      overwrite: false,
      onComplete: function() {
        if (el.parentNode) el.parentNode.removeChild(el);
        whaleCount--;
      }
    });
  }

  // ===== Spawn loops =====
  function fishTick() {
    if (scrollProgress >= THRESHOLD && !document.hidden) spawnFish();
    setTimeout(fishTick, 3000 + Math.random() * 3000);
  }

  function whaleTick() {
    if (scrollProgress >= THRESHOLD && !document.hidden) spawnWhale();
    setTimeout(whaleTick, 15000 + Math.random() * 15000);
  }

  setTimeout(fishTick, 2000);
  setTimeout(whaleTick, 8000 + Math.random() * 7000);
})();
