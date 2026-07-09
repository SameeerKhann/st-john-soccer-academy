/* St. John Soccer Academy — Arc Reveal Preloader
   Vanilla port of the React "ArcRevealHero" component:
   cycles brand words, then a curved gold curtain sweeps up
   and the overlay fades to reveal the hero. */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return;

  var WORDS = [
    'Discipline.',
    'Respect.',
    'Technique.',
    'Teamwork.',
    'Heart.',
    'Excellence.',
    'The Soaring <em>Eagles</em>.'
  ];
  var HOLD = 540;          // how long each word is held (ms)
  var SWAP = 240;          // word out-transition (ms)
  var REVEAL = 1400;       // curtain sweep duration (ms)

  // Flag the document so cinematic-hero.js holds its intro
  // until the curtain finishes.
  document.documentElement.classList.add('sj-preloading');

  var overlay = document.createElement('div');
  overlay.className = 'arc-preloader';
  overlay.setAttribute('aria-hidden', 'true');
  overlay.innerHTML =
    '<span class="arc-word"></span>' +
    '<svg viewBox="0 0 100 100" preserveAspectRatio="none">' +
    '<path d="M 0 110 Q 50 135 100 110 L 100 110 L 0 110 Z"></path>' +
    '</svg>';
  document.body.appendChild(overlay);
  document.documentElement.style.overflow = 'hidden';

  // The overlay hides the page anyway, so always reveal from the top —
  // otherwise a reload mid-page would uncover the middle of the
  // scroll-driven hero sequence.
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);

  var wordEl = overlay.querySelector('.arc-word');
  var path = overlay.querySelector('path');
  var i = 0;

  function showWord() {
    wordEl.innerHTML = WORDS[i];
    wordEl.classList.remove('out');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { wordEl.classList.add('in'); });
    });
    window.setTimeout(function () {
      if (i >= WORDS.length - 1) {
        window.setTimeout(reveal, 200);
        return;
      }
      wordEl.classList.remove('in');
      wordEl.classList.add('out');
      window.setTimeout(function () { i++; showWord(); }, SWAP);
    }, HOLD);
  }

  // easeInOutQuint ≈ the component's cubic-bezier(0.85, 0, 0.15, 1)
  function ease(p) {
    return p < 0.5 ? 16 * p * p * p * p * p : 1 - Math.pow(-2 * p + 2, 5) / 2;
  }

  function reveal() {
    wordEl.classList.remove('in');
    wordEl.classList.add('out');
    var t0 = performance.now();
    function frame(now) {
      var p = Math.min((now - t0) / REVEAL, 1);
      var e = ease(p);
      // Chord slides from y=110 (below view) to y=-30 (above view);
      // control point 25 units below keeps the arc's concave curve.
      var edge = 110 - e * 140;
      var control = edge + 25;
      path.setAttribute('d',
        'M 0 ' + edge + ' Q 50 ' + control + ' 100 ' + edge +
        ' L 100 110 L 0 110 Z');
      if (p < 1) { requestAnimationFrame(frame); } else { finish(); }
    }
    requestAnimationFrame(frame);
  }

  function finish() {
    overlay.classList.add('arc-done');
    document.documentElement.style.overflow = '';
    document.documentElement.classList.remove('sj-preloading');
    window.dispatchEvent(new Event('sj:introDone'));
    window.setTimeout(function () {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }, 420);
  }

  showWord();
})();
