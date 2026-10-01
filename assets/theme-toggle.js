/* Sem-5-RSS dark/light toggle — zero deps, ~0.6KB. See theme-toggle.css for how. */
(function(){
  "use strict";
  var KEY = "sem5-theme";
  var root = document.documentElement;

  function apply(t){ root.setAttribute("data-theme", t); }
  function current(){ return root.getAttribute("data-theme") === "dark" ? "dark" : "light"; }

  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch(e){}
  if (saved === "dark" || saved === "light") {
    apply(saved);
  } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    apply("dark");
  }

  function makeButton(){
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "theme-toggle-btn";
    btn.setAttribute("aria-label", "Toggle dark/light theme");
    btn.textContent = current() === "dark" ? "☀" : "☾";
    btn.addEventListener("click", function(){
      var next = current() === "dark" ? "light" : "dark";
      apply(next);
      try { localStorage.setItem(KEY, next); } catch(e){}
      btn.textContent = next === "dark" ? "☀" : "☾";
    });
    document.body.appendChild(btn);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", makeButton);
  } else {
    makeButton();
  }
})();
