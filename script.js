'use strict';

document.addEventListener('DOMContentLoaded', () => {

  // ── Elements ────────────────────────────────────────────
  const menuToggle  = document.getElementById('menuToggle');
  const nav         = document.getElementById('nav');
  const themeToggle = document.getElementById('themeToggle');
  const yearEl      = document.getElementById('year');
  const contactForm = document.getElementById('contactForm');
  const formStatus  = document.getElementById('formStatus');
  const miniCharts  = document.getElementById('miniCharts');
  const cursorDot   = document.getElementById('cursorDot');
  const cursorRing  = document.getElementById('cursorRing');

  // ── Year ────────────────────────────────────────────────
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ── Custom cursor (only on true mouse/trackpad devices) ──
  if (cursorDot && cursorRing && window.matchMedia('(pointer: fine) and (hover: hover)').matches) {
    let ringX = 0, ringY = 0;
    let dotX  = 0, dotY  = 0;

    document.addEventListener('mousemove', e => {
      dotX = e.clientX;
      dotY = e.clientY;
    });

    const tickCursor = () => {
      cursorDot.style.transform = `translate(calc(-50% + ${dotX}px), calc(-50% + ${dotY}px))`;
      ringX += (dotX - ringX) * 0.12;
      ringY += (dotY - ringY) * 0.12;
      cursorRing.style.transform = `translate(calc(-50% + ${ringX}px), calc(-50% + ${ringY}px))`;
      requestAnimationFrame(tickCursor);
    };
    tickCursor();

    document.addEventListener('mouseleave', () => {
      cursorDot.style.opacity  = '0';
      cursorRing.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
      cursorDot.style.opacity  = '1';
      cursorRing.style.opacity = '1';
    });
  } else {
    // Not a mouse device — hide cursor elements and restore default cursor
    if (cursorDot)  cursorDot.style.display  = 'none';
    if (cursorRing) cursorRing.style.display = 'none';
    document.body.style.cursor = 'auto';
  }

  // ── Mobile menu ──────────────────────────────────────────
  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      menuToggle.classList.toggle('open', open);
      menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // ── Smooth scroll ────────────────────────────────────────
  document.querySelectorAll('.nav-link, a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (!href || !href.startsWith('#') || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (nav && nav.classList.contains('open')) {
        nav.classList.remove('open');
        menuToggle && menuToggle.classList.remove('open');
        menuToggle && menuToggle.setAttribute('aria-expanded', 'false');
      }
    });
  });

  // ── Theme toggle ─────────────────────────────────────────
  const STORAGE_KEY = 'aurora-theme';
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  let mode = localStorage.getItem(STORAGE_KEY) || (prefersDark ? 'dark' : 'dark');
  applyTheme(mode, false);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      mode = mode === 'dark' ? 'light' : 'dark';
      localStorage.setItem(STORAGE_KEY, mode);
      applyTheme(mode, true);
    });
  }

  function applyTheme(m, animate) {
    if (animate) document.body.style.transition = 'background .4s, color .4s';
    if (m === 'light') {
      document.body.classList.add('light');
      if (themeToggle) themeToggle.innerHTML = '☾ Dark';
    } else {
      document.body.classList.remove('light');
      if (themeToggle) themeToggle.innerHTML = '☀ Light';
    }
    setTimeout(() => { if (animate) document.body.style.transition = '' }, 400);
  }

  // ── Scroll-reveal (IntersectionObserver) ─────────────────
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  // ── Animated chart bars ──────────────────────────────────
  if (miniCharts) {
    const barObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('bars-loaded');
          barObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    barObserver.observe(miniCharts);
  }

  // ── Sticky header shrink on scroll ───────────────────────
  const siteHeader = document.querySelector('.site-header');
  const headerInner = document.querySelector('.header-inner');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (siteHeader) {
      siteHeader.style.background = y > 40
        ? 'rgba(8,12,20,0.92)'
        : '';
    }
    if (headerInner) {
      headerInner.style.padding = y > 40 ? '12px 0' : '';
    }
    lastScroll = y;
  }, { passive: true });

  // ── Contact form ─────────────────────────────────────────
  if (contactForm && formStatus) {
    contactForm.addEventListener('submit', async e => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(contactForm));
      const name    = data.name?.trim();
      const email   = data.email?.trim();
      const message = data.message?.trim();

      if (!name || !email || !message) {
        showStatus('Please complete all required fields.', 'error');
        shakeForm();
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showStatus('Please enter a valid email address.', 'error');
        return;
      }

      showStatus('Sending…', 'loading');
      const submitBtn = contactForm.querySelector('[type="submit"]');
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending…'; }

      try {
        await delay(1100);
        contactForm.reset();
        showStatus('Message sent — we\'ll reply within 24h.', 'success');
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Send Message'; }
      } catch {
        showStatus('Something went wrong. Please try again.', 'error');
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Send Message'; }
      }
    });
  }

  function showStatus(msg, type) {
    if (!formStatus) return;
    formStatus.textContent = msg;
    const colors = { error: '#e8637a', success: '#37d9c4', loading: '#7b65f4' };
    formStatus.style.color = colors[type] || 'var(--muted)';
  }

  function shakeForm() {
    if (!contactForm) return;
    contactForm.animate([
      { transform: 'translateX(0)' },
      { transform: 'translateX(-8px)' },
      { transform: 'translateX(8px)' },
      { transform: 'translateX(-6px)' },
      { transform: 'translateX(0)' },
    ], { duration: 380, easing: 'ease-in-out' });
  }

  function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

  // ── Keyboard accessibility ───────────────────────────────
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (nav?.classList.contains('open')) {
        nav.classList.remove('open');
        menuToggle?.classList.remove('open');
        menuToggle?.setAttribute('aria-expanded', 'false');
        menuToggle?.focus();
      }
    }
  });

  // ── Parallax on hero glow layers (mouse only) ────────────
  if (window.matchMedia('(pointer: fine) and (hover: hover)').matches) {
    const glows = document.querySelectorAll('.glow-layer');
    window.addEventListener('mousemove', e => {
      const cx = e.clientX / window.innerWidth  - 0.5;
      const cy = e.clientY / window.innerHeight - 0.5;
      glows.forEach((g, i) => {
        const depth = (i + 1) * 18;
        g.style.transform = `translate(${cx * depth}px, ${cy * depth}px)`;
      });
    }, { passive: true });
  }

  // ── Number counter animation for stats ───────────────────
  const statsObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('strong').forEach(el => {
          animateCount(el);
        });
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.8 });

  const statsEl = document.querySelector('.stats');
  if (statsEl) statsObserver.observe(statsEl);

  function animateCount(el) {
    const raw = el.textContent;
    const num = parseFloat(raw.replace(/[^\d.]/g, ''));
    if (isNaN(num) || num > 9999) return;
    const prefix = raw.match(/^[^\d]*/)?.[0] || '';
    const suffix = raw.match(/[^\d.]+$/)?.[0] || '';
    const start = performance.now();
    const dur   = 1200;
    const tick  = now => {
      const t = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const val = num < 10 ? (num * eased).toFixed(1) : Math.round(num * eased);
      el.textContent = prefix + val + suffix;
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

});
