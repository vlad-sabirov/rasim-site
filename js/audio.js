// ===== Ambient Underwater Audio =====
(function() {
  var ctx = null;
  var masterGain = null;
  var started = false;
  var muted = false;
  var MASTER_VOLUME = 0.10;
  var scrollProgress = 0;
  var targetVolume = 0;
  var THRESHOLD = 0.2;
  // Smooth zone: volume fades in from THRESHOLD to THRESHOLD + FADE_RANGE
  var FADE_RANGE = 0.15;

  function initAudio() {
    if (started) return;
    started = true;

    ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();

    masterGain = ctx.createGain();
    masterGain.gain.value = 0;
    masterGain.connect(ctx.destination);

    startUnderwaterAmbient();
    startBubbleLoop();
    startWhaleLoop();
  }

  // ===== Smooth volume control =====
  // Uses setTargetAtTime for exponential smoothing — no clicks, no jumps
  function smoothSetVolume(vol) {
    if (!masterGain || !ctx) return;
    // Cancel any previously scheduled ramps to avoid conflicts
    masterGain.gain.cancelScheduledValues(ctx.currentTime);
    // Set current value as starting point
    masterGain.gain.setValueAtTime(masterGain.gain.value, ctx.currentTime);
    // Exponential approach to target — time constant 0.8s for smooth fade
    masterGain.gain.setTargetAtTime(vol, ctx.currentTime, 0.8);
  }

  function calcVolume(progress) {
    if (progress < THRESHOLD) return 0;
    if (progress < THRESHOLD + FADE_RANGE) {
      return ((progress - THRESHOLD) / FADE_RANGE) * MASTER_VOLUME;
    }
    return MASTER_VOLUME;
  }

  // ===== Underwater ambient — layered =====
  function createNoiseBuffer(seconds) {
    var len = ctx.sampleRate * seconds;
    var buf = ctx.createBuffer(1, len, ctx.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }

  function startUnderwaterAmbient() {
    // Layer 1: Deep rumble
    var rumble = ctx.createBufferSource();
    rumble.buffer = createNoiseBuffer(3);
    rumble.loop = true;

    var rumbleLPF = ctx.createBiquadFilter();
    rumbleLPF.type = 'lowpass';
    rumbleLPF.frequency.value = 80;
    rumbleLPF.Q.value = 0.5;

    var rumbleGain = ctx.createGain();
    rumbleGain.gain.value = 0.6;

    rumble.connect(rumbleLPF);
    rumbleLPF.connect(rumbleGain);
    rumbleGain.connect(masterGain);
    rumble.start();

    // Layer 2: Mid water movement with LFO
    var water = ctx.createBufferSource();
    water.buffer = createNoiseBuffer(4);
    water.loop = true;

    var waterBPF = ctx.createBiquadFilter();
    waterBPF.type = 'bandpass';
    waterBPF.frequency.value = 180;
    waterBPF.Q.value = 1.5;

    var lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.15;
    var lfoGain = ctx.createGain();
    lfoGain.gain.value = 60;
    lfo.connect(lfoGain);
    lfoGain.connect(waterBPF.frequency);
    lfo.start();

    var waterGain = ctx.createGain();
    waterGain.gain.value = 0.35;

    water.connect(waterBPF);
    waterBPF.connect(waterGain);
    waterGain.connect(masterGain);
    water.start();

    // Layer 3: Muffled detail
    var detail = ctx.createBufferSource();
    detail.buffer = createNoiseBuffer(3);
    detail.loop = true;

    var detailBPF = ctx.createBiquadFilter();
    detailBPF.type = 'bandpass';
    detailBPF.frequency.value = 400;
    detailBPF.Q.value = 2.0;

    var detailLPF = ctx.createBiquadFilter();
    detailLPF.type = 'lowpass';
    detailLPF.frequency.value = 600;
    detailLPF.Q.value = 0.7;

    var lfo2 = ctx.createOscillator();
    lfo2.type = 'sine';
    lfo2.frequency.value = 0.08;
    var lfo2Gain = ctx.createGain();
    lfo2Gain.gain.value = 120;
    lfo2.connect(lfo2Gain);
    lfo2Gain.connect(detailBPF.frequency);
    lfo2.start();

    var detailGain = ctx.createGain();
    detailGain.gain.value = 0.12;

    detail.connect(detailBPF);
    detailBPF.connect(detailLPF);
    detailLPF.connect(detailGain);
    detailGain.connect(masterGain);
    detail.start();
  }

  // ===== Bubble sounds =====
  function playBubble() {
    if (!ctx || muted || scrollProgress < THRESHOLD) return;

    var t = ctx.currentTime;
    var size = Math.random();
    var baseFreq = 300 + (1 - size) * 800;
    var duration = 0.06 + size * 0.14;
    var vol = 0.06 + size * 0.14;

    var osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * (1.6 + size * 0.8), t + duration);

    var bpf = ctx.createBiquadFilter();
    bpf.type = 'bandpass';
    bpf.frequency.value = baseFreq * 1.2;
    bpf.Q.value = 4 + size * 6;

    var oscGain = ctx.createGain();
    oscGain.gain.setValueAtTime(0, t);
    oscGain.gain.linearRampToValueAtTime(vol, t + 0.005);
    oscGain.gain.setValueAtTime(vol, t + duration * 0.3);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.connect(bpf);
    bpf.connect(oscGain);
    oscGain.connect(masterGain);
    osc.start(t);
    osc.stop(t + duration + 0.01);

    var noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
    var nd = noiseBuf.getChannelData(0);
    for (var i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;

    var noise = ctx.createBufferSource();
    noise.buffer = noiseBuf;

    var noiseBPF = ctx.createBiquadFilter();
    noiseBPF.type = 'bandpass';
    noiseBPF.frequency.value = baseFreq * 2;
    noiseBPF.Q.value = 3;

    var noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0, t);
    noiseGain.gain.linearRampToValueAtTime(vol * 0.3, t + 0.003);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    noise.connect(noiseBPF);
    noiseBPF.connect(noiseGain);
    noiseGain.connect(masterGain);
    noise.start(t);
    noise.stop(t + 0.05);
  }

  function startBubbleLoop() {
    function tick() {
      if (!muted && started && scrollProgress >= THRESHOLD) {
        playBubble();
        if (Math.random() < 0.25) {
          var count = 2 + Math.floor(Math.random() * 4);
          for (var i = 0; i < count; i++) {
            setTimeout(playBubble, 30 + Math.random() * 150);
          }
        }
        if (Math.random() < 0.35) {
          setTimeout(playBubble, 60 + Math.random() * 120);
        }
      }
      var delay = 600 + Math.random() * 2000;
      setTimeout(tick, delay);
    }
    tick();
  }

  // ===== Whale song — blue/gray whale style =====
  // Long, deep, breathy moans with very slow pitch glides
  // + filtered noise layer for "breath" texture
  // + reverb-like delay for ocean depth feel

  function playWhaleMoan(startFreq, endFreq, dur, vol, delay) {
    if (!ctx) return;
    var t = ctx.currentTime + (delay || 0);

    // --- Core tone: low sine ---
    var osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(startFreq, t);
    // Very slow glide — the signature of blue whale moans
    osc.frequency.linearRampToValueAtTime(endFreq, t + dur);

    // Slow, subtle vibrato — 1-2 Hz, like breathing
    var vib = ctx.createOscillator();
    vib.type = 'sine';
    vib.frequency.value = 1.0 + Math.random() * 1.0;
    var vibAmt = ctx.createGain();
    vibAmt.gain.value = (startFreq + endFreq) * 0.015;
    vib.connect(vibAmt);
    vibAmt.connect(osc.frequency);
    vib.start(t);
    vib.stop(t + dur + 0.5);

    // --- Breath texture: filtered noise, same envelope ---
    var noiseBuf = createNoiseBuffer(Math.ceil(dur) + 1);
    var noise = ctx.createBufferSource();
    noise.buffer = noiseBuf;

    var noiseBPF = ctx.createBiquadFilter();
    noiseBPF.type = 'bandpass';
    noiseBPF.frequency.value = (startFreq + endFreq) / 2;
    noiseBPF.Q.value = 2.5;

    var noiseGain = ctx.createGain();
    noiseGain.gain.value = vol * 0.25; // breath is quieter than tone

    noise.connect(noiseBPF);
    noiseBPF.connect(noiseGain);

    // --- Soft octave undertone for depth ---
    var sub = ctx.createOscillator();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(startFreq * 0.5, t);
    sub.frequency.linearRampToValueAtTime(endFreq * 0.5, t + dur);

    var subGain = ctx.createGain();
    subGain.gain.value = vol * 0.4;

    // --- Envelope: very long fade in (2s), long sustain, long fade out (3s) ---
    var env = ctx.createGain();
    var fadeIn = Math.min(dur * 0.2, 2.0);
    var fadeOut = Math.min(dur * 0.3, 3.0);
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(vol, t + fadeIn);
    env.gain.setValueAtTime(vol * 0.9, t + dur - fadeOut);
    env.gain.linearRampToValueAtTime(0, t + dur);

    // --- Simple echo/reverb: delayed quiet copy ---
    var echoDelay = ctx.createDelay(2.0);
    echoDelay.delayTime.value = 0.8 + Math.random() * 0.6;
    var echoGain = ctx.createGain();
    echoGain.gain.value = 0.2;

    var echoFilter = ctx.createBiquadFilter();
    echoFilter.type = 'lowpass';
    echoFilter.frequency.value = 400;

    // Connect everything through envelope
    osc.connect(env);
    sub.connect(subGain);
    subGain.connect(env);
    noiseGain.connect(env);

    env.connect(masterGain);

    // Echo path
    env.connect(echoDelay);
    echoDelay.connect(echoFilter);
    echoFilter.connect(echoGain);
    echoGain.connect(masterGain);

    osc.start(t);
    osc.stop(t + dur + 0.5);
    sub.start(t);
    sub.stop(t + dur + 0.5);
    noise.start(t);
    noise.stop(t + dur + 0.5);
  }

  function playWhaleSong() {
    if (!ctx || muted || scrollProgress < THRESHOLD) return;

    var vol = 0.2 + Math.random() * 0.1;
    var phraseType = Math.floor(Math.random() * 5);
    var offset = 0;

    if (phraseType === 0) {
      // Single long descending moan — classic blue whale
      var f = 180 + Math.random() * 60;
      playWhaleMoan(f, f * 0.7, 8 + Math.random() * 4, vol, 0);
    } else if (phraseType === 1) {
      // Two moans: down, then slightly up
      var f1 = 200 + Math.random() * 50;
      playWhaleMoan(f1, f1 * 0.75, 6 + Math.random() * 3, vol, 0);
      offset += 7 + Math.random() * 2;
      playWhaleMoan(f1 * 0.8, f1 * 0.95, 5 + Math.random() * 3, vol * 0.8, offset);
    } else if (phraseType === 2) {
      // Very low, steady drone with tiny pitch drop
      var f2 = 120 + Math.random() * 40;
      playWhaleMoan(f2, f2 * 0.92, 10 + Math.random() * 5, vol, 0);
    } else if (phraseType === 3) {
      // Gray whale: two short moans
      var f3 = 160 + Math.random() * 80;
      playWhaleMoan(f3, f3 * 0.8, 4 + Math.random() * 2, vol, 0);
      offset += 5 + Math.random() * 2;
      playWhaleMoan(f3 * 0.85, f3 * 0.65, 4 + Math.random() * 2, vol * 0.85, offset);
    } else {
      // Slow rising then falling — like a sigh
      var f4 = 140 + Math.random() * 40;
      playWhaleMoan(f4, f4 * 1.15, 5 + Math.random() * 2, vol * 0.85, 0);
      offset += 5.5 + Math.random() * 2;
      playWhaleMoan(f4 * 1.1, f4 * 0.7, 7 + Math.random() * 3, vol, offset);
    }
  }

  function startWhaleLoop() {
    setTimeout(function whaleTick() {
      if (!muted && started && scrollProgress >= THRESHOLD) playWhaleSong();
      var next = 18000 + Math.random() * 22000;
      setTimeout(whaleTick, next);
    }, 6000 + Math.random() * 4000);
  }

  // ===== Scroll-driven volume (throttled, smooth) =====
  var scrollTicking = false;

  window.addEventListener('scroll', function() {
    if (scrollTicking) return;
    scrollTicking = true;

    requestAnimationFrame(function() {
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      scrollProgress = docHeight > 0 ? Math.min((window.scrollY || window.pageYOffset) / docHeight, 1) : 0;

      if (started && !muted) {
        var newVol = calcVolume(scrollProgress);
        // Only update if volume changed meaningfully (avoid spamming AudioParam)
        if (Math.abs(newVol - targetVolume) > 0.002) {
          targetVolume = newVol;
          smoothSetVolume(targetVolume);
        }
      }

      scrollTicking = false;
    });
  }, { passive: true });

  // ----- Mute/unmute -----
  function toggleMute() {
    if (!started) {
      initAudio();
      return;
    }
    muted = !muted;
    if (muted) {
      smoothSetVolume(0);
    } else {
      targetVolume = calcVolume(scrollProgress);
      smoothSetVolume(targetVolume);
    }
    updateBtn();
  }

  var btn = document.getElementById('soundToggle');
  if (btn) btn.addEventListener('click', toggleMute);

  function updateBtn() {
    if (!btn) return;
    btn.classList.toggle('is-muted', muted);
    btn.setAttribute('aria-label', muted ? 'Включить звук' : 'Выключить звук');
  }

  // Start on first interaction
  function onFirstInteraction() {
    initAudio();
    document.removeEventListener('click', onFirstInteraction);
    document.removeEventListener('scroll', onFirstInteraction);
    document.removeEventListener('touchstart', onFirstInteraction);
  }
  document.addEventListener('click', onFirstInteraction, { once: true });
  document.addEventListener('scroll', onFirstInteraction, { once: true, passive: true });
  document.addEventListener('touchstart', onFirstInteraction, { once: true, passive: true });

  // Pause when tab hidden
  document.addEventListener('visibilitychange', function() {
    if (!ctx) return;
    if (document.hidden) ctx.suspend();
    else ctx.resume();
  });
})();
