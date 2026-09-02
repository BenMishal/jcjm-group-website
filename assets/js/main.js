/**
 * JCJM Group — Coming Soon
 * main.js — Minimal vanilla JS
 * Handles: particle canvas, scroll reveal, reduced-motion guard
 */

'use strict';

/* ── Reduced-motion guard ───────────────────────────────── */
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ══════════════════════════════════════════════════════════
   PARTICLE SYSTEM
   Subtle ambient floating particles — infrastructure theme
   ══════════════════════════════════════════════════════════ */
(function initParticles() {
  if (prefersReducedMotion) return;

  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W = 0, H = 0;
  let animFrame = null;

  /* Config */
  const CONFIG = {
    count:       38,
    minRadius:   0.8,
    maxRadius:   2.2,
    minSpeed:    0.06,
    maxSpeed:    0.18,
    minOpacity:  0.04,
    maxOpacity:  0.14,
    connectDist: 130,    /* max distance to draw connecting line */
    connectOpacity: 0.04,
  };

  let particles = [];

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';
    ctx.scale(dpr, dpr);
    buildParticles();
  }

  function buildParticles() {
    particles = [];
    for (let i = 0; i < CONFIG.count; i++) {
      particles.push({
        x:       rand(0, W),
        y:       rand(0, H),
        r:       rand(CONFIG.minRadius, CONFIG.maxRadius),
        vx:      rand(-1, 1) * rand(CONFIG.minSpeed, CONFIG.maxSpeed),
        vy:      rand(-1, 1) * rand(CONFIG.minSpeed, CONFIG.maxSpeed),
        opacity: rand(CONFIG.minOpacity, CONFIG.maxOpacity),
      });
    }
  }

  function tick() {
    ctx.clearRect(0, 0, W, H);

    /* Move & draw each particle */
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      p.x += p.vx;
      p.y += p.vy;

      /* Wrap edges */
      if (p.x < -10)  p.x = W + 10;
      if (p.x > W+10) p.x = -10;
      if (p.y < -10)  p.y = H + 10;
      if (p.y > H+10) p.y = -10;

      /* Draw dot */
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(180, 210, 220, ${p.opacity})`;
      ctx.fill();

      /* Draw thin connection lines between nearby particles */
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x;
        const dy = p.y - q.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONFIG.connectDist) {
          const alpha = CONFIG.connectOpacity * (1 - dist / CONFIG.connectDist);
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(74, 144, 164, ${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    animFrame = requestAnimationFrame(tick);
  }

  /* Start */
  resize();
  tick();

  /* Handle resize (debounced) */
  let resizeTimer;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(animFrame);
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resize();
      tick();
    }, 200);
  }, { passive: true });
})();

/* ══════════════════════════════════════════════════════════
   SCROLL / ENTRANCE REVEAL
   Triggers .reveal-up elements with IntersectionObserver
   ══════════════════════════════════════════════════════════ */
(function initReveal() {
  const elements = document.querySelectorAll('.reveal-up');
  if (!elements.length) return;

  if (prefersReducedMotion) {
    elements.forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px',
  });

  elements.forEach(el => observer.observe(el));
})();

/* ══════════════════════════════════════════════════════════
   SMOOTH BUTTON INTERACTION
   ══════════════════════════════════════════════════════════ */
(function initButtons() {
  const btns = document.querySelectorAll('.btn-primary');
  btns.forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      btn.style.willChange = 'transform, box-shadow';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.willChange = 'auto';
    });
  });
})();
