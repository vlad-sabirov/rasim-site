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

  // ===== Whale SVG — realistic humpback from reference photo =====
  // Reference: massive body, blunt broad head, flat top, deep belly,
  // long mouth line, small dorsal hump, long white pectoral fin,
  // compact dark tail flukes
  function whaleSVG(color) {
    return '<svg width="300" height="105" viewBox="0 0 300 105" fill="none" xmlns="http://www.w3.org/2000/svg">'
      // Head at RIGHT (high X), tail at LEFT (low X). Code flips via scaleX.
      //
      // === MAIN BODY — one continuous silhouette ===
      // Key fixes: head extends forward with smooth taper, tail narrows gradually
      + '<path d="'
        + 'M18,50 '                              // tail stock (narrow)
        + 'C24,48 34,44 48,40 '                  // tail stock gradually widens
        + 'C62,36 78,30 95,24 '                  // body keeps expanding smoothly
        + 'C115,17 140,13 170,12 '               // back peak area
        + 'C200,12 225,16 245,24 '               // back slopes toward head
        + 'C260,30 272,36 280,42 '               // head top — gentle forward slope
        + 'C286,46 290,50 290,54 '               // snout tip — rounded, extended
        + 'C290,58 286,62 280,64 '               // snout curves under smoothly
        + 'C270,68 255,70 240,72 '               // lower jaw / mouth line starts
        + 'C215,76 190,78 165,78 '               // mouth line extends far back
        + 'C135,78 110,76 90,72 '                // deep belly
        + 'C70,66 55,60 44,56 '                  // belly rises toward tail
        + 'C34,53 26,52 18,52 Z'                 // smooth gradual taper to tail
        + '" fill="' + color + '" opacity="0.42"/>'
      // === DARKER DORSAL SHADING ===
      + '<path d="'
        + 'M65,32 C90,22 125,14 165,12 '
        + 'C200,12 230,16 255,26 '
        + 'C270,32 280,38 285,44 '
        + 'C278,38 265,28 250,22 '
        + 'C225,14 195,12 165,14 '
        + 'C130,16 90,26 65,32 Z'
        + '" fill="' + color + '" opacity="0.15"/>'
      // === LIGHTER BELLY ===
      + '<path d="'
        + 'M240,72 C215,76 190,78 165,78 '
        + 'C135,78 110,76 90,72 '
        + 'C70,66 55,60 44,56 '
        + 'C55,64 75,72 95,78 '
        + 'C120,82 150,84 175,82 '
        + 'C205,80 228,74 248,68 Z'
        + '" fill="rgba(200,220,240,0.12)"/>'
      // === EYE ===
      + '<ellipse cx="272" cy="48" rx="2.2" ry="1.8" fill="rgba(0,0,0,0.25)"/>'
      + '<ellipse cx="272.5" cy="47.5" rx="0.8" ry="0.6" fill="rgba(255,255,255,0.1)"/>'
      // === MOUTH LINE ===
      + '<path d="M286,60 C276,66 260,70 235,74" stroke="rgba(0,0,0,0.08)" stroke-width="0.8" fill="none"/>'
      // === VENTRAL PLEATS ===
      + '<path d="M255,70 C240,72 220,74 200,76" stroke="rgba(200,220,240,0.07)" stroke-width="0.8" fill="none"/>'
      + '<path d="M262,68 C246,70 228,72 210,74" stroke="rgba(200,220,240,0.06)" stroke-width="0.7" fill="none"/>'
      + '<path d="M268,66 C252,68 234,70 216,72" stroke="rgba(200,220,240,0.05)" stroke-width="0.6" fill="none"/>'
      + '<path d="M274,64 C258,66 240,68 222,70" stroke="rgba(200,220,240,0.04)" stroke-width="0.5" fill="none"/>'
      // === TAIL FLUKES — compact, dark, swept crescent ===
      // Upper fluke
      + '<path d="M18,49 C14,46 8,39 4,32 C2.5,28 2.5,26 4.5,27 C7,29 12,36 16,44 C17,46 18,48 18,49 Z" fill="' + color + '" opacity="0.44"/>'
      // Lower fluke
      + '<path d="M18,53 C14,56 8,63 4,70 C2.5,74 2.5,76 4.5,75 C7,73 12,66 16,58 C17,56 18,54 18,53 Z" fill="' + color + '" opacity="0.44"/>'
      // Fluke notch
      + '<path d="M18,48.5 L15.5,51 L18,53.5" stroke="rgba(0,0,0,0.07)" stroke-width="0.6" fill="none"/>'
      // === DORSAL FIN — tiny hump ===
      + '<path d="M145,13 C148,8 152,7 154,10 C155,13 153,16 150,17 C148,15 146,14 145,13 Z" fill="' + color + '" opacity="0.35"/>'
      // === PECTORAL FIN — long, light, sweeps down ===
      + '<path d="'
        + 'M210,74 C204,82 192,90 180,96 '
        + 'C176,98 173,97 174,94 '
        + 'C176,90 186,80 198,72 '
        + 'C204,68 208,70 210,74 Z'
        + '" fill="rgba(190,215,235,0.22)"/>'
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
