/* hero.js — count-up, scheme_view observer, delegated analytics tracker.
   Все аналитики стреляют только если ym/gtag уже инициализированы.
   TODO(prod): обернуть весь init() в cookie-consent gate (152-ФЗ). */

(function () {
  'use strict';

  // TODO(prod): заменить на реальный Метрика counter ID (8 цифр)
  var YM_COUNTER_ID = 0;

  var prefersReducedMotion = !!(window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  /* ===== count-up: 0 → data-count-to за 800 ms (ease-out cubic) ========== */
  function animateCount(el) {
    var target = parseInt(el.dataset.countTo || '0', 10);
    var suffix = el.dataset.countSuffix || '';

    if (prefersReducedMotion || !(target > 0)) {
      el.textContent = target + suffix;
      return;
    }

    var duration = 800;
    var startTime = null;

    function step(ts) {
      if (startTime === null) startTime = ts;
      var t = Math.min((ts - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      el.textContent = Math.round(target * eased) + suffix;
      if (t < 1) requestAnimationFrame(step);
      else el.textContent = target + suffix;
    }
    requestAnimationFrame(step);
  }

  function initStatStrip() {
    var values = document.querySelectorAll('.stat-strip__value');
    if (!values.length) return;

    if (!('IntersectionObserver' in window)) {
      values.forEach(function (el) {
        el.textContent = (el.dataset.countTo || '0') + (el.dataset.countSuffix || '');
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        animateCount(entry.target);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.3 });

    values.forEach(function (el) { observer.observe(el); });
  }

  /* ===== scheme_view: one-shot IntersectionObserver на .scheme =========== */
  function initSchemeView() {
    var scheme = document.querySelector('.scheme');
    if (!scheme || !('IntersectionObserver' in window)) return;

    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        sendGoal('scheme_view');
        obs.disconnect();
      });
    }, { threshold: 0.5 });

    observer.observe(scheme);
  }

  /* ===== делегированный click-tracker для [data-event] =================== */
  function initTracker() {
    document.addEventListener('click', function (e) {
      var node = e.target.closest && e.target.closest('[data-event]');
      if (!node) return;
      var name = node.dataset.event;
      if (name) sendGoal(name);
    });
  }

  /* ===== единая точка отправки в Метрику + GA4 =========================== */
  function sendGoal(name) {
    if (typeof ym === 'function' && YM_COUNTER_ID) {
      ym(YM_COUNTER_ID, 'reachGoal', name);
    }
    if (typeof gtag === 'function') {
      gtag('event', name); // без deprecated transport_type:'beacon'
    }
  }

  /* ===== bootstrap ======================================================= */
  function init() {
    initStatStrip();
    initSchemeView();
    initTracker();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
