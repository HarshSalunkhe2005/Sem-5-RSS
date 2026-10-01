/* Sem-5-RSS motion.js — ~1.5KB, zero deps, respects prefers-reduced-motion */
(function(){
  "use strict";
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return;

  // --- spotlight tilt cards: write CSS vars on pointer move, no re-render ---
  function trackCard(e){
    var el = e.currentTarget;
    var r = el.getBoundingClientRect();
    var x = e.clientX - r.left, y = e.clientY - r.top;
    el.style.setProperty('--x', x + 'px');
    el.style.setProperty('--y', y + 'px');
    el.style.setProperty('--rx', (((y / r.height) - 0.5) * -6) + 'deg');
    el.style.setProperty('--ry', (((x / r.width) - 0.5) * 6) + 'deg');
  }
  function resetCard(e){
    e.currentTarget.style.setProperty('--rx', '0deg');
    e.currentTarget.style.setProperty('--ry', '0deg');
  }
  document.querySelectorAll('.card2, .topic2').forEach(function(el){
    el.addEventListener('pointermove', trackCard);
    el.addEventListener('pointerleave', resetCard);
  });

  // --- flip cards: click/Enter toggles for keyboard & touch users ---
  document.querySelectorAll('.flip-wrap').forEach(function(el){
    el.setAttribute('tabindex', '0');
    el.setAttribute('role', 'button');
    el.addEventListener('click', function(){ el.classList.toggle('flipped'); });
    el.addEventListener('keydown', function(e){
      if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); el.classList.toggle('flipped'); }
    });
  });

  // --- count-up stats on first intersection ---
  var stats = document.querySelectorAll('.stat2[data-count]');
  if (stats.length && 'IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (!entry.isIntersecting) return;
        var el = entry.target;
        io.unobserve(el);
        var target = parseInt(el.getAttribute('data-count'), 10) || 0;
        var dur = 900, start = null;
        function step(ts){
          if (!start) start = ts;
          var p = Math.min((ts - start) / dur, 1);
          el.textContent = Math.round(p * target) + (el.getAttribute('data-suffix') || '');
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.4 });
    stats.forEach(function(el){ io.observe(el); });
  }
})();
