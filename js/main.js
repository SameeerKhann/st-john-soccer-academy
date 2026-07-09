/* St. John Soccer Academy — interactions */
(function () {
  'use strict';

  /* Navbar: solid on scroll (home only — inner pages are always solid) */
  const nav = document.querySelector('.nav');
  if (nav && !nav.classList.contains('nav--inner')) {
    const onScroll = () => nav.classList.toggle('nav--solid', window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* Mobile menu */
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      toggle.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    links.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => {
        links.classList.remove('open');
        toggle.classList.remove('open');
        document.body.style.overflow = '';
      })
    );
  }

  /* Scroll reveal */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
      }),
      { threshold: 0.12 }
    );
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('visible'));
  }

  /* Animated counters */
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    const animate = el => {
      const target = parseInt(el.dataset.count, 10);
      const suffix = el.dataset.suffix || '';
      const dur = 1800;
      const start = performance.now();
      const tick = now => {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const cio = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) { animate(e.target); cio.unobserve(e.target); }
      }),
      { threshold: 0.4 }
    );
    counters.forEach(el => cio.observe(el));
  }

  /* Testimonial slider */
  const slides = document.querySelectorAll('.tslide');
  const dotsWrap = document.querySelector('.tdots');
  if (slides.length && dotsWrap) {
    let idx = 0;
    let timer;
    slides.forEach((_, i) => {
      const b = document.createElement('button');
      b.setAttribute('aria-label', 'Testimonial ' + (i + 1));
      b.addEventListener('click', () => { show(i); restart(); });
      dotsWrap.appendChild(b);
    });
    const dots = dotsWrap.querySelectorAll('button');
    function show(i) {
      idx = i;
      slides.forEach((s, k) => s.classList.toggle('active', k === i));
      dots.forEach((d, k) => d.classList.toggle('active', k === i));
    }
    function restart() {
      clearInterval(timer);
      timer = setInterval(() => show((idx + 1) % slides.length), 6500);
    }
    show(0);
    restart();
  }

  /* FAQ accordion */
  document.querySelectorAll('.faq-item').forEach(item => {
    const q = item.querySelector('.faq-q');
    const a = item.querySelector('.faq-a');
    if (!q || !a) return;
    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(o => {
        o.classList.remove('open');
        o.querySelector('.faq-a').style.maxHeight = null;
      });
      if (!isOpen) {
        item.classList.add('open');
        a.style.maxHeight = a.scrollHeight + 'px';
      }
    });
  });

  /* Registration / contact form → opens email draft (no backend needed) */
  const form = document.querySelector('#register-form');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const d = new FormData(form);
      const get = k => (d.get(k) || '').toString().trim();
      const subject = 'New Registration — ' + get('player-name') + ' (' + get('program') + ')';
      const body = [
        'PLAYER INFORMATION',
        'Player name: ' + get('player-name'),
        'Date of birth: ' + get('dob'),
        'Program: ' + get('program'),
        'Experience level: ' + get('experience'),
        '',
        'PARENT / GUARDIAN',
        'Name: ' + get('parent-name'),
        'Phone: ' + get('phone'),
        'Email: ' + get('email'),
        '',
        'NOTES',
        get('message'),
        '',
        'I have read and agree to the Parent Agreement & Code of Conduct: ' + (d.get('conduct') ? 'YES' : 'NO')
      ].join('\n');
      window.location.href =
        'mailto:soccer.stjohnacademy@gmail.com?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(body);
      const ok = document.querySelector('#form-success');
      if (ok) ok.style.display = 'block';
    });
  }

  /* Footer year */
  const yr = document.querySelector('#year');
  if (yr) yr.textContent = new Date().getFullYear();
})();
