/* St. John Soccer Academy — cinematic hero (GSAP scroll experience)
   Vanilla port of the React "CinematicHero" component. */
(function () {
  'use strict';

  var hero = document.querySelector('.cine-hero');
  if (!hero) return;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!window.gsap || !window.ScrollTrigger || reduced) {
    // Static fallback: show the taglines, hide the scroll-driven layers.
    hero.classList.add('cine-static');
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  var card = document.querySelector('.cine-card');
  var programs = document.querySelector('.cine-programs');
  var isMobile = window.innerWidth < 768;
  var rafId = 0;

  /* --- Mouse: card sheen + subtle programs-grid 3D tilt --- */
  window.addEventListener('mousemove', function (e) {
    if (window.scrollY > window.innerHeight * 2) return;
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(function () {
      if (!card || !programs) return;
      var rect = card.getBoundingClientRect();
      card.style.setProperty('--mouse-x', (e.clientX - rect.left) + 'px');
      card.style.setProperty('--mouse-y', (e.clientY - rect.top) + 'px');
      var xVal = (e.clientX / window.innerWidth - 0.5) * 2;
      var yVal = (e.clientY / window.innerHeight - 0.5) * 2;
      gsap.to(programs, { rotationY: xVal * 5, rotationX: -yVal * 4, ease: 'power3.out', duration: 1.2 });
    });
  });

  /* --- Initial states --- */
  gsap.set('.cine-line1', { autoAlpha: 0, y: 60, scale: 0.85, filter: 'blur(20px)', rotationX: -20 });
  gsap.set('.cine-kicker, .cine-scroll', { autoAlpha: 0, y: 30 });
  gsap.set('.cine-line2', { autoAlpha: 1, clipPath: 'inset(0 100% 0 0)' });
  gsap.set('.cine-card', { y: window.innerHeight + 200, autoAlpha: 1 });
  gsap.set(['.cine-prog-head', '.cine-prog', '.cine-prog-cta'], { autoAlpha: 0 });
  gsap.set('.cine-cta-wrapper', { autoAlpha: 0, scale: 0.8, filter: 'blur(30px)' });

  /* --- Intro reveal (waits for the arc preloader when present) --- */
  function playIntro() {
    var introTl = gsap.timeline({ delay: 0.15 });
    introTl
      .to('.cine-kicker', { duration: 1, autoAlpha: 1, y: 0, ease: 'power3.out' })
      .to('.cine-line1', { duration: 1.8, autoAlpha: 1, y: 0, scale: 1, filter: 'blur(0px)', rotationX: 0, ease: 'expo.out' }, '-=0.7')
      .to('.cine-line2', { duration: 1.4, clipPath: 'inset(0 0% 0 0)', ease: 'power4.inOut' }, '-=1.0')
      .to('.cine-scroll', { duration: 0.9, autoAlpha: 1, y: 0, ease: 'power3.out' }, '-=0.6');
  }
  if (document.documentElement.classList.contains('sj-preloading')) {
    window.addEventListener('sj:introDone', playIntro, { once: true });
  } else {
    playIntro();
  }

  /* --- Cinematic scroll timeline --- */
  var scrollTl = gsap.timeline({
    scrollTrigger: {
      trigger: hero,
      start: 'top top',
      end: '+=4500',
      pin: true,
      scrub: 1,
      anticipatePin: 1
    }
  });

  scrollTl
    // Background recedes
    .to(['.cine-text-wrapper', '.cine-grid', '.cine-video'], { scale: 1.15, filter: 'blur(20px)', opacity: 0.15, ease: 'power2.inOut', duration: 2 }, 0)
    // Card rises and expands to fullscreen
    .to('.cine-card', { y: 0, ease: 'power3.inOut', duration: 2 }, 0)
    .to('.cine-card', { width: '100%', height: '100%', borderRadius: '0px', ease: 'power3.inOut', duration: 1.5 })
    // Programs panel assembles
    .fromTo('.cine-prog-head',
      { y: 50, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, ease: 'power3.out', duration: 1.2 }, '-=0.6')
    .fromTo('.cine-prog',
      { y: 140, z: -300, rotationX: 35, autoAlpha: 0, scale: 0.85 },
      { y: 0, z: 0, rotationX: 0, autoAlpha: 1, scale: 1, stagger: 0.25, ease: 'expo.out', duration: 2 }, '-=0.7')
    .fromTo('.cine-prog-cta',
      { y: 40, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, ease: 'power3.out', duration: 1.2 }, '-=1.0')
    // Hold, then swap background layers
    .to({}, { duration: 2.5 })
    .set('.cine-text-wrapper', { autoAlpha: 0 })
    .set('.cine-cta-wrapper', { autoAlpha: 1 })
    .to({}, { duration: 1.5 })
    // Card contents exit
    .to(['.cine-prog-head', '.cine-programs', '.cine-prog-cta'], {
      scale: 0.92, y: -40, z: -200, autoAlpha: 0, ease: 'power3.in', duration: 1.2, stagger: 0.05
    })
    // Card pulls back to reveal CTA
    .to('.cine-card', {
      width: isMobile ? '92vw' : '85vw',
      height: isMobile ? '92vh' : '85vh',
      borderRadius: isMobile ? '32px' : '40px',
      ease: 'expo.inOut',
      duration: 1.8
    }, 'pullback')
    .to('.cine-cta-wrapper', { scale: 1, filter: 'blur(0px)', ease: 'expo.inOut', duration: 1.8 }, 'pullback')
    // Card flies away
    .to('.cine-card', { y: -window.innerHeight - 300, ease: 'power3.in', duration: 1.5 });
})();
