/* ESE learning layer: zero dependencies, progressive enhancement.
   Everything degrades to the plain readable page if this script never runs. */
(function () {
  "use strict";
  var d = document, root = d.documentElement;
  var cs = d.currentScript;
  var BASE = cs ? cs.src.replace(/assets\/ese\.js.*$/, "") : "/";
  var path = decodeURIComponent(location.pathname);
  var rel = decodeURIComponent(location.href.replace(BASE, "").replace(/[?#].*$/, "")) || "index.html";
  if (/\/$/.test(rel)) rel += "index.html";
  var sm = rel.match(/^(CC|NLP|CN|DL)\//);
  var SUBJ = sm ? sm[1] : null;
  if (SUBJ) root.setAttribute("data-subject", SUBJ);

  // subjects whose flashcards + cheat sheet pages exist (extend as each subject ships)
  var READY = ["DL", "NLP", "CN", "CC"];
  var HAS_QB2 = { "DL/Unit 3": 1 };

  /* ---------- store ---------- */
  var KEY = "sem5-ese-v1", S;
  try { S = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { S = {}; }
  S.prog = S.prog || {}; S.qa = S.qa || {}; S.fc = S.fc || {};
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
  window.ESE = { store: S, save: save, base: BASE };

  function el(tag, cls, html) { var n = d.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; }
  function btn(txt, cls, fn) { var b = el("button", "ese-btn " + (cls || "")); b.type = "button"; b.textContent = txt; if (fn) b.addEventListener("click", fn); return b; }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  /* ---------- tables scroll sideways on phones instead of widening the page ---------- */
  [].slice.call(d.querySelectorAll("main table")).forEach(function (t) {
    if (t.closest(".tw,.table-wrap")) return;
    var w = el("div", "tw auto"); t.parentNode.insertBefore(w, t); w.appendChild(t);
  });

  /* ---------- site-wide navigation: top bar, prev/next units, "Go to" menu ---------- */
  (function sitenav() {
    var UNITS = {
      CC:  { 1: ["question-bank"], 2: ["question-bank"], 3: ["question-bank"], 4: ["question-bank"], 5: ["question-bank"] },
      CN:  { 1: ["question-bank", "numericals"], 2: ["question-bank"], 3: ["question-bank", "numericals"], 4: ["question-bank", "numericals"], 5: ["question-bank", "numericals"] },
      DL:  { 1: ["question-bank", "numericals"], 2: ["question-bank", "numericals"], 3: ["question-bank", "question-bank-2", "numericals"], 4: ["question-bank"], 5: ["question-bank"] },
      NLP: { 1: ["question-bank"], 2: ["question-bank", "numericals"], 3: ["question-bank", "numericals"], 4: ["question-bank"], 5: ["question-bank"] }
    };
    var EXTRA = {
      CC:  [["PYQ answers", "pyq.html"], ["Mock paper", "mock.html"], ["Cheat sheet", "cheatsheet.html"], ["Flashcards", "flashcards.html"]],
      CN:  [["PYQ answers", "pyq.html"], ["PYQ topics", "pyq-topics.html"], ["Past papers", "PYQs/index.html"], ["Extra topics", "extra-topics.html"], ["Mock paper", "mock.html"], ["Cheat sheet", "cheatsheet.html"], ["Flashcards", "flashcards.html"]],
      DL:  [["PYQ answers", "pyq.html"], ["Past papers", "PYQs/index.html"], ["Mock paper", "mock.html"], ["Cheat sheet", "cheatsheet.html"], ["Flashcards", "flashcards.html"]],
      NLP: [["PYQ answers", "pyq.html"], ["Mock paper", "mock.html"], ["Cheat sheet", "cheatsheet.html"], ["Flashcards", "flashcards.html"]]
    };
    // original lecture decks, as PDFs so they open in the browser
    var SLIDES = { CC: {
      1: [["Original slides", "CC-Unit-1.pdf"]], 2: [["Original slides", "CC-Unit-2.pdf"]], 3: [["Original slides", "CC-Unit-3.pdf"]],
      4: [["Original slides", "CC-Unit-4.pdf"]], 5: [["Original slides", "CC-Unit-5.pdf"], ["Load balancing slides", "CC-Unit-5-Load-Balancing.pdf"]]
    } };
    var NAMES = { CC: "Cloud", CN: "Networks", DL: "Deep Learning", NLP: "NLP" };
    var PAGE = { "question-bank": "Question bank", "question-bank-2": "Question bank 2", "numericals": "Numericals" };
    var um = rel.match(/^(CC|CN|DL|NLP)\/Unit (\d)\/([^/]+)\.html$/);
    var UNIT = um ? +um[2] : null;
    function href(p) { return BASE + p.split("/").map(encodeURIComponent).join("/"); }
    function link(txt, p, cur) {
      var a = el("a", cur ? "sn-cur" : "", null); a.textContent = txt; a.href = href(p);
      if (cur) a.setAttribute("aria-current", "page"); return a;
    }

    var css = el("style");
    css.textContent =
      ".sn-bar{font:600 13px/1.3 system-ui,'Segoe UI',sans-serif;background:#f4f6fb;color:#16233f;border-bottom:1px solid rgba(0,0,0,.12);position:relative;z-index:60}" +
      ".sn-row{display:flex;flex-wrap:wrap;align-items:center;gap:4px 6px;max-width:1150px;margin:0 auto;padding:7px 14px}" +
      ".sn-row+.sn-row{border-top:1px solid rgba(0,0,0,.07);padding-top:6px}" +
      ".sn-bar a,.sn-menu a{color:inherit;text-decoration:none;padding:5px 10px;border-radius:999px;white-space:nowrap}" +
      ".sn-bar a:hover,.sn-menu a:hover{background:rgba(0,0,0,.08)}" +
      ".sn-bar a.sn-cur,.sn-menu a.sn-cur{background:#2f7de1;color:#fff}" +
      ".sn-lbl{opacity:.55;font-weight:700;font-size:11px;letter-spacing:.8px;text-transform:uppercase;margin-right:2px}" +
      ".sn-sep{width:1px;height:16px;background:rgba(0,0,0,.18);margin:0 4px}" +
      ".sn-bar a:focus-visible,.sn-menu a:focus-visible,.sn-fab:focus-visible,.sn-pn a:focus-visible{outline:3px solid #ffb547;outline-offset:2px}" +
      ".sn-skip{position:absolute;left:8px;top:-60px;background:#ffb547;color:#000;padding:8px 14px;border-radius:8px;z-index:1000;font-weight:700}.sn-skip:focus{top:8px}" +
      ".sn-pn{display:flex;justify-content:space-between;gap:12px;max-width:1100px;margin:30px auto 10px;padding:0 20px;font:600 15px system-ui,'Segoe UI',sans-serif}" +
      ".sn-pn a{flex:1;border:1px solid rgba(128,128,128,.35);border-radius:12px;padding:14px 18px;text-decoration:none;color:inherit}" +
      ".sn-pn a:hover{border-color:#2f7de1}.sn-pn .nx{text-align:right}.sn-pn small{display:block;opacity:.6;font-weight:500;font-size:12px}" +
      ".sn-fab{position:fixed;left:18px;bottom:18px;z-index:999;border:0;border-radius:999px;padding:11px 16px;background:#2f7de1;color:#fff;font:700 14px system-ui,'Segoe UI',sans-serif;box-shadow:0 3px 14px rgba(0,0,0,.3);cursor:pointer}" +
      ".sn-menu{position:fixed;left:18px;bottom:68px;z-index:999;width:min(560px,calc(100vw - 36px));max-height:70vh;overflow:auto;background:#fff;color:#16233f;border:1px solid rgba(0,0,0,.15);border-radius:14px;padding:12px;box-shadow:0 10px 40px rgba(0,0,0,.45);font:600 13px system-ui,'Segoe UI',sans-serif}" +
      ".sn-menu h4{margin:10px 6px 4px;font-size:12px;letter-spacing:.8px;text-transform:uppercase;opacity:.6}.sn-menu h4:first-child{margin-top:2px}" +
      ".sn-menu .sn-g{display:flex;flex-wrap:wrap;gap:2px}" +
      "@media print{.sn-bar,.sn-fab,.sn-menu,.sn-pn{display:none}}";
    d.head.appendChild(css);

    // skip link
    var main = d.querySelector("main");
    if (main) { if (!main.id) main.id = "main"; var sk = el("a", "sn-skip"); sk.textContent = "Skip to content"; sk.href = "#" + main.id; d.body.insertBefore(sk, d.body.firstChild); }

    // top bar
    var bar = el("nav", "sn-bar"); bar.setAttribute("aria-label", "Site");
    var r1 = el("div", "sn-row");
    r1.appendChild(link("⌂ Home", "index.html", rel === "index.html"));
    r1.appendChild(el("span", "sn-sep"));
    Object.keys(UNITS).forEach(function (s) { r1.appendChild(link(NAMES[s], s + "/Unit 1/index.html", s === SUBJ)); });
    bar.appendChild(r1);
    if (SUBJ) {
      var r2 = el("div", "sn-row");
      var lb = el("span", "sn-lbl"); lb.textContent = SUBJ; r2.appendChild(lb);
      Object.keys(UNITS[SUBJ]).forEach(function (u) { r2.appendChild(link("Unit " + u, SUBJ + "/Unit " + u + "/index.html", +u === UNIT && um[3] === "index")); });
      if (UNIT) {
        r2.appendChild(el("span", "sn-sep"));
        UNITS[SUBJ][UNIT].forEach(function (p) { r2.appendChild(link(PAGE[p], SUBJ + "/Unit " + UNIT + "/" + p + ".html", um[3] === p)); });
        (SLIDES[SUBJ] && SLIDES[SUBJ][UNIT] || []).forEach(function (x) {
          var a = link("📄 " + x[0], SUBJ + "/slides/" + x[1]); a.target = "_blank"; a.rel = "noopener"; r2.appendChild(a);
        });
      }
      r2.appendChild(el("span", "sn-sep"));
      EXTRA[SUBJ].forEach(function (x) { r2.appendChild(link(x[0], SUBJ + "/" + x[1], rel === SUBJ + "/" + x[1])); });
      bar.appendChild(r2);
    }
    d.body.insertBefore(bar, d.body.firstChild.nextSibling || d.body.firstChild);

    // previous / next unit at the bottom of unit pages
    if (UNIT && um[3] === "index") {
      var pn = el("nav", "sn-pn"); pn.setAttribute("aria-label", "Previous and next unit");
      var n = Object.keys(UNITS[SUBJ]).length;
      if (UNIT > 1) { var pa = link("", SUBJ + "/Unit " + (UNIT - 1) + "/index.html"); pa.innerHTML = "<small>Previous</small>← Unit " + (UNIT - 1); pn.appendChild(pa); } else pn.appendChild(el("span"));
      var qa = link("", SUBJ + "/Unit " + UNIT + "/question-bank.html"); qa.innerHTML = "<small>Practise</small>Unit " + UNIT + " questions"; qa.style.textAlign = "center"; pn.appendChild(qa);
      if (UNIT < n) { var na = link("", SUBJ + "/Unit " + (UNIT + 1) + "/index.html"); na.className = "nx"; na.innerHTML = "<small>Next</small>Unit " + (UNIT + 1) + " →"; pn.appendChild(na); } else pn.appendChild(el("span"));
      var foot = d.querySelector("body > footer");
      if (foot) foot.parentNode.insertBefore(pn, foot); else d.body.appendChild(pn);
    }

    // floating "Go to" menu, reachable from anywhere on the page
    var fab = el("button", "sn-fab"); fab.type = "button"; fab.textContent = "☰ Go to";
    fab.setAttribute("aria-expanded", "false"); fab.setAttribute("aria-controls", "sn-menu");
    var menu = el("div", "sn-menu"); menu.id = "sn-menu"; menu.hidden = true; menu.setAttribute("role", "dialog"); menu.setAttribute("aria-label", "Go to page");
    var g0 = el("div", "sn-g"); g0.appendChild(link("⌂ Home", "index.html", rel === "index.html")); menu.appendChild(g0);
    (SUBJ ? [SUBJ].concat(Object.keys(UNITS).filter(function (s) { return s !== SUBJ; })) : Object.keys(UNITS)).forEach(function (s) {
      var h = el("h4"); h.textContent = NAMES[s] + " (" + s + ")"; menu.appendChild(h);
      var g = el("div", "sn-g");
      Object.keys(UNITS[s]).forEach(function (u) { g.appendChild(link("Unit " + u, s + "/Unit " + u + "/index.html", rel === s + "/Unit " + u + "/index.html")); });
      EXTRA[s].forEach(function (x) { g.appendChild(link(x[0], s + "/" + x[1], rel === s + "/" + x[1])); });
      menu.appendChild(g);
    });
    function toggle(open) {
      menu.hidden = !open; fab.setAttribute("aria-expanded", String(open));
      if (open) { var c = menu.querySelector("a.sn-cur") || menu.querySelector("a"); c && c.focus(); }
    }
    fab.addEventListener("click", function () { toggle(menu.hidden); });
    d.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !menu.hidden) { toggle(false); fab.focus(); }
      var t = e.target.tagName;
      if (t === "INPUT" || t === "TEXTAREA" || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === "g") { e.preventDefault(); toggle(menu.hidden); }
    });
    d.addEventListener("click", function (e) { if (!menu.hidden && !menu.contains(e.target) && e.target !== fab) toggle(false); });
    d.body.appendChild(menu); d.body.appendChild(fab);
  })();

  /* ---------- nav extras ---------- */
  var navInner = d.querySelector("nav.toc .inner");
  if (navInner && SUBJ && READY.indexOf(SUBJ) > -1) {
    var PYQ_FILE = { CC: "pyq.html", NLP: "pyq.html", DL: "pyq.html", CN: "pyq.html" };
    var extras = [["Flashcards", "flashcards.html"], ["Cheat sheet", "cheatsheet.html"]];
    if (PYQ_FILE[SUBJ]) { extras.push(["PYQ answers", PYQ_FILE[SUBJ]]); extras.push(["Mock paper", "mock.html"]); }
    extras.forEach(function (x) {
      if (rel.indexOf(x[1]) > -1) return;
      if ([].some.call(navInner.querySelectorAll("a"), function (l) { return (l.getAttribute("href") || "").indexOf(x[1]) === 0; })) return;
      var a = el("a", "", x[0]); a.href = BASE + SUBJ + "/" + x[1]; a.style.color = "var(--accent)"; navInner.appendChild(a);
    });
  }

  /* ---------- "mark revised" chip ---------- */
  var hero = d.querySelector("header.hero");
  if (hero && SUBJ && !/flashcards|cheatsheet/.test(rel)) {
    var chip = el("div", "done-chip");
    var cb = btn("", "", function () {
      if (S.prog[rel]) delete S.prog[rel]; else S.prog[rel] = Date.now();
      save(); paint();
    });
    function paint() { var on = !!S.prog[rel]; cb.textContent = on ? "✓ Revised (tap to undo)" : "Mark as revised"; cb.setAttribute("aria-pressed", on); }
    paint(); chip.appendChild(cb); hero.appendChild(chip);
  }

  /* ---------- question banks: reveal + got-it ---------- */
  var qas = [].slice.call(d.querySelectorAll(".qa"));
  if (qas.length) {
    var main = d.querySelector("main");
    var meterFill, meterTxt, hideDone = false;
    function qid(i) { return rel + "#" + i; }
    function refresh() {
      var n = 0; qas.forEach(function (q, i) { var on = !!S.qa[qid(i)]; q.classList.toggle("done", on); if (on) n++; q.style.display = (hideDone && on) ? "none" : ""; });
      meterFill.style.transform = "scaleX(" + (n / qas.length) + ")"; meterTxt.textContent = n + " / " + qas.length + " got it";
    }
    qas.forEach(function (q) {
      var qh = q.querySelector(".q"); if (!qh || qh.querySelector(".qtext")) return;
      var kids = [].slice.call(qh.childNodes).filter(function (n) { return !(n.nodeType === 1 && (n.classList.contains("num") || n.classList.contains("marks"))); });
      if (!kids.length) return;
      var span = d.createElement("span"); span.className = "qtext";
      qh.insertBefore(span, kids[0]); kids.forEach(function (n) { span.appendChild(n); });
    });
    qas.forEach(function (q, i) {
      var a = q.querySelector(".a"); if (!a) return;
      q.classList.add("has-reveal");
      var tools = el("div", "qtools");
      var show = btn("Show answer", "primary", function () { q.classList.toggle("open"); show.textContent = q.classList.contains("open") ? "Hide answer" : "Show answer"; });
      var got = btn("Got it", "", function () { if (S.qa[qid(i)]) delete S.qa[qid(i)]; else S.qa[qid(i)] = 1; save(); refresh(); });
      tools.appendChild(show); tools.appendChild(got); q.appendChild(tools);
    });
    var bar = el("div", "ese-bar");
    var m = el("div", "ese-meter grow"); meterFill = el("i"); m.appendChild(meterFill);
    meterTxt = el("span"); bar.appendChild(meterTxt); bar.appendChild(m);
    bar.appendChild(btn("Reveal all", "", function () { qas.forEach(function (q) { q.classList.add("open"); }); }));
    bar.appendChild(btn("Hide all", "", function () { qas.forEach(function (q) { q.classList.remove("open"); }); }));
    var hd = btn("Hide ones I got", "", function () { hideDone = !hideDone; hd.setAttribute("aria-pressed", hideDone); refresh(); });
    bar.appendChild(hd);
    var firstSec = main && main.querySelector("section");
    if (main && firstSec) main.insertBefore(bar, firstSec);
    refresh();
  }

  /* ---------- numericals: step reveal ---------- */
  if (/numericals/.test(rel)) {
    [].slice.call(d.querySelectorAll("ol.steps")).forEach(function (ol) {
      var lis = [].slice.call(ol.children), shown = 0;
      if (lis.length < 2) return;
      var ans = ol.parentNode.querySelector(".answer");
      ol.classList.add("reveal-steps"); if (ans) ans.classList.add("hold");
      var ctl = el("div", "step-ctl"), info = el("span");
      var next = btn("", "primary", function () { step(); });
      var all = btn("Show all", "", function () { while (shown < lis.length) step(true); });
      function step() {
        if (shown >= lis.length) return;
        lis[shown].classList.add("shown"); shown++; upd();
      }
      function upd() {
        var done = shown >= lis.length;
        next.textContent = done ? "Done ✓" : "Reveal step " + (shown + 1);
        next.disabled = done; all.style.display = done ? "none" : "";
        info.textContent = shown + " / " + lis.length;
        if (done && ans) ans.classList.remove("hold");
      }
      ctl.appendChild(next); ctl.appendChild(all); ctl.appendChild(info);
      ol.parentNode.insertBefore(ctl, ol.nextSibling); upd();
    });
  }

  /* ---------- Test yourself (unit index pages) ---------- */
  if (SUBJ && /^(CC|NLP|CN|DL)\/Unit [0-9]+\/index\.html$/.test(rel)) {
    var qb = BASE + rel.replace(/index\.html$/, "question-bank.html");
    Promise.all([qb].concat(HAS_QB2[rel.replace(/\/index\.html$/, "")] ? [qb.replace("question-bank.html", "question-bank-2.html")] : []).map(function (u) { return fetch(u).then(function (r) { return r.ok ? r.text() : ""; }).catch(function () { return ""; }); })).then(function (htmls) {
      if (!htmls[0]) return Promise.reject();
      var doc = new DOMParser().parseFromString(htmls.join(" "), "text/html");
      var items = [].slice.call(doc.querySelectorAll(".qa")).map(function (q, i) {
        var qe = q.querySelector(".q"), ae = q.querySelector(".a"); if (!qe || !ae) return null;
        var qq = qe.cloneNode(true); [].forEach.call(qq.querySelectorAll(".num,.marks"), function (x) { x.remove(); });
        return { id: rel.replace(/index\.html$/, "question-bank.html") + "#" + i, q: qq.textContent.trim(), a: ae.innerHTML };
      }).filter(Boolean);
      if (items.length < 3) return;
      var panel = el("details", "test-panel"), sum = el("summary", "", "Test yourself · 5 random questions from this unit");
      var body = el("div", "test-body"); panel.appendChild(sum); panel.appendChild(body);
      function deal() {
        body.innerHTML = "";
        var pool = items.filter(function (x) { return !S.qa[x.id]; }); if (pool.length < 5) pool = items.slice();
        shuffle(pool).slice(0, 5).forEach(function (x, i) {
          var t = el("div", "tq"), q = el("div", "q"); q.textContent = (i + 1) + ". " + x.q;
          var a = el("div", "a", x.a);
          var r = btn("Show answer", "primary", function () { t.classList.toggle("open"); r.textContent = t.classList.contains("open") ? "Hide answer" : "Show answer"; });
          t.appendChild(q); t.appendChild(a); t.appendChild(r); body.appendChild(t);
        });
        var again = btn("New set of 5", "", deal); body.appendChild(again);
      }
      deal();
      var mn = d.querySelector("main"); if (mn) mn.appendChild(panel);
    }).catch(function () {});
  }

  /* ---------- step-through diagrams ---------- */
  [].slice.call(d.querySelectorAll("figure.fig[data-caps]")).forEach(function (fg) {
    var caps; try { caps = JSON.parse(fg.getAttribute("data-caps")); } catch (e) { return; }
    var n = caps.length, cur = 0, timer = null;
    var items = [].slice.call(fg.querySelectorAll("[data-s],[data-only]"));
    var cap = fg.querySelector("figcaption"); if (!cap) { cap = el("figcaption"); fg.appendChild(cap); }
    cap.setAttribute("aria-live", "polite");
    fg.classList.add("js");
    var ctl = el("div", "fig-ctl"), count = el("span", "count");
    var prev = btn("◀ Back", "", function () { go(cur - 1); }), nxt = btn("Next ▶", "primary", function () { go(cur + 1); });
    var play = btn("▶ Play", "", function () {
      if (timer) { stop(); return; }
      if (cur >= n) go(0);
      play.textContent = "❚❚ Pause";
      timer = setInterval(function () { if (cur >= n) { stop(); return; } go(cur + 1); }, 2200);
    });
    var rst = btn("Reset", "", function () { stop(); go(0); });
    function stop() { if (timer) { clearInterval(timer); timer = null; } play.textContent = "▶ Play"; }
    ctl.appendChild(prev); ctl.appendChild(nxt); ctl.appendChild(play); ctl.appendChild(rst); ctl.appendChild(count);
    fg.insertBefore(ctl, cap);
    function go(i) {
      cur = Math.max(0, Math.min(n, i));
      items.forEach(function (x) { var o = x.getAttribute("data-only"); if (o !== null) { x.classList.toggle("on", +o === cur); x.classList.toggle("now", +o === cur); return; } var s = +x.getAttribute("data-s"); x.classList.toggle("on", s <= cur); x.classList.toggle("now", s === cur); });
      cap.textContent = cur === 0 ? (fg.getAttribute("data-intro") || "Press Next to build the diagram step by step.") : caps[cur - 1];
      count.textContent = "step " + cur + " / " + n;
      prev.disabled = cur === 0; nxt.disabled = cur >= n;
    }
    fg.addEventListener("keydown", function (e) { if (e.key === "ArrowRight") go(cur + 1); else if (e.key === "ArrowLeft") go(cur - 1); });
    go(0);
  });

  /* ---------- mock paper page ---------- */
  var ma = d.getElementById("mock-app");
  if (ma) {
    var msubj = ma.getAttribute("data-subject");
    ma.innerHTML = "<p class=\"flash-meta\">Loading questions…</p>";
    fetch(encodeURI(BASE + msubj + "/pyq.html")).then(function (r) { return r.ok ? r.text() : ""; }).then(function (h) {
      var doc = new DOMParser().parseFromString(h, "text/html");
      var all = [].slice.call(doc.querySelectorAll(".qa")).map(function (q) {
        var qe = q.querySelector(".q"), ae = q.querySelector(".a"); if (!qe || !ae) return null;
        var mk = qe.querySelector(".marks"), m = mk ? parseInt(mk.textContent, 10) || 5 : 5;
        var qq = qe.cloneNode(true); [].forEach.call(qq.querySelectorAll(".num,.marks"), function (x) { x.remove(); });
        return { q: qq.textContent.trim(), a: ae.innerHTML, m: m };
      }).filter(Boolean);
      var short = all.filter(function (x) { return x.m <= 4; }), long = all.filter(function (x) { return x.m >= 5; });
      if (short.length < 5) { short = all.slice(); long = all.slice(); }
      var left = 90 * 60, timer = null, paper = [];
      var clock = el("div", "mock-clock", "90:00"), bar = el("div", "ese-bar");
      function fmt(t) { var m = Math.floor(t / 60), s = t % 60; return (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s; }
      var start = btn("Start 90-minute timer", "primary", function () {
        if (timer) { clearInterval(timer); timer = null; start.textContent = "Resume timer"; return; }
        start.textContent = "Pause timer";
        timer = setInterval(function () { left--; clock.textContent = fmt(Math.max(left, 0)); if (left <= 0) { clearInterval(timer); timer = null; start.textContent = "Time is up"; start.disabled = true; } }, 1000);
      });
      var neu = btn("New paper", "", function () { build(); });
      var reveal = btn("Show all answers", "", function () { paper.forEach(function (n) { n.classList.add("open"); }); });
      bar.appendChild(clock); bar.appendChild(start); bar.appendChild(neu); bar.appendChild(reveal);
      var out = el("div", "mock-paper");
      function build() {
        if (timer) { clearInterval(timer); timer = null; } left = 90 * 60; clock.textContent = "90:00"; start.disabled = false; start.textContent = "Start 90-minute timer";
        out.innerHTML = ""; paper = [];
        function add(items, title, perMarks) {
          out.appendChild(el("h2", "", title));
          items.forEach(function (x, i) {
            var t = el("div", "tq"), q = el("div", "q"); q.textContent = (i + 1) + ". " + x.q + " (" + x.m + " marks)";
            var a = el("div", "a", x.a);
            var r = btn("Show answer", "primary", function () { t.classList.toggle("open"); r.textContent = t.classList.contains("open") ? "Hide answer" : "Show answer"; });
            t.appendChild(q); t.appendChild(a); t.appendChild(r); out.appendChild(t); paper.push(t);
          });
        }
        add(shuffle(short.slice()).slice(0, 5), "Part A: answer all (about 2 to 4 marks each)");
        add(shuffle(long.slice()).slice(0, 5), "Part B: answer all (about 5 to 7 marks each)");
      }
      ma.innerHTML = ""; ma.appendChild(bar); ma.appendChild(out); build();
    }).catch(function () { ma.innerHTML = "<p>Couldn't load the questions.</p>"; });
  }

  /* ---------- flashcards page ---------- */
  var fa = d.getElementById("flash-app");
  if (fa) {
    var subj = fa.getAttribute("data-subject"), nUnits = +fa.getAttribute("data-units") || 3;
    var cards = [], view = [], idx = 0, onlyNew = false, unitSel = "all";
    fa.innerHTML = '<p class="flash-meta">Loading cards…</p>';
    var loads = [], sources = [];
    for (var u = 1; u <= nUnits; u++) sources.push({ unit: u, file: "Unit " + u + "/question-bank.html" });
    (fa.getAttribute("data-extra") || "").split(",").forEach(function (x) { x = x.trim(); if (!x) return; var m = x.match(/Unit (d+)/); sources.push({ unit: m ? +m[1] : 0, file: x }); });
    sources.forEach(function (s) {
      var url = BASE + subj + "/" + s.file;
      loads.push(fetch(encodeURI(url)).then(function (r) { return r.ok ? r.text() : ""; }).then(function (h) {
        if (!h) return;
        var doc = new DOMParser().parseFromString(h, "text/html");
        [].forEach.call(doc.querySelectorAll(".qa"), function (q, i) {
          var qe = q.querySelector(".q"), ae = q.querySelector(".a"); if (!qe || !ae) return;
          var qq = qe.cloneNode(true); [].forEach.call(qq.querySelectorAll(".marks"), function (x) { x.remove(); });
          var num = qq.querySelector(".num"); var numTxt = num ? num.textContent.trim() : ""; if (num) num.remove();
          cards.push({ id: subj + "/" + s.file + "#" + i, unit: s.unit, tag: (s.unit ? "Unit " + s.unit : "Extra") + (numTxt ? " · " + numTxt : ""), q: qq.textContent.trim(), a: ae.innerHTML });
        });
      }).catch(function () {}));
    });
    Promise.all(loads).then(function () { if (!cards.length) { fa.innerHTML = "<p>Couldn't load the cards. Open a question bank page instead.</p>"; return; } build(); });
    function build() {
      fa.innerHTML = "";
      var top = el("div", "ese-bar");
      var sel = el("select", "ese-btn"); sel.setAttribute("aria-label", "Unit filter");
      sel.innerHTML = '<option value="all">All units</option>'; for (var k = 1; k <= nUnits; k++) sel.innerHTML += '<option value="' + k + '">Unit ' + k + "</option>";
      sel.addEventListener("change", function () { unitSel = sel.value; rebuild(true); });
      var only = btn("Only ones I don't know", "", function () { onlyNew = !onlyNew; only.setAttribute("aria-pressed", onlyNew); rebuild(true); });
      var shf = btn("Shuffle", "", function () { rebuild(true, true); });
      var meter = el("div", "ese-meter grow"), fill = el("i"); meter.appendChild(fill);
      top.appendChild(sel); top.appendChild(only); top.appendChild(shf); top.appendChild(meter); fa.appendChild(top);
      var meta = el("div", "flash-meta"); fa.appendChild(meta);
      var wrap = el("div", "flash"); wrap.tabIndex = 0;
      var card = el("div", "flash-card"), fr = el("div", "flash-face"), bk = el("div", "flash-face back");
      card.appendChild(fr); card.appendChild(bk); wrap.appendChild(card); fa.appendChild(wrap);
      var ctl = el("div", "flash-ctl");
      var bPrev = btn("◀ Prev", "", function () { go(idx - 1); });
      var bFlip = btn("Flip", "primary", flip);
      var bAgain = btn("Again", "", function () { mark(false); });
      var bKnow = btn("Know it ✓", "primary", function () { mark(true); });
      var bNext = btn("Next ▶", "", function () { go(idx + 1); });
      [bPrev, bFlip, bAgain, bKnow, bNext].forEach(function (b) { ctl.appendChild(b); }); fa.appendChild(ctl);
      fa.appendChild(el("p", "flash-meta", "Keys: Space = flip · ← → = move · K = know it · A = again"));
      function flip() { wrap.classList.toggle("flipped"); }
      function known() { return cards.filter(function (c) { return S.fc[c.id]; }).length; }
      function rebuild(reset, shuf) {
        view = cards.filter(function (c) { return (unitSel === "all" || c.unit === +unitSel) && (!onlyNew || !S.fc[c.id]); });
        if (shuf) shuffle(view); if (reset) idx = 0; draw();
      }
      function draw() {
        fill.style.transform = "scaleX(" + (known() / cards.length) + ")";
        wrap.classList.remove("flipped");
        if (!view.length) { fr.innerHTML = '<div class="txt">Nothing left here. Switch the filter or shuffle everything.</div>'; bk.innerHTML = ""; meta.textContent = known() + " / " + cards.length + " known"; return; }
        idx = (idx + view.length) % view.length; var c = view[idx];
        fr.innerHTML = '<div class="tag"></div><div class="txt"></div>'; fr.firstChild.textContent = c.tag; fr.lastChild.textContent = c.q;
        bk.innerHTML = '<div class="tag">Answer</div><div class="txt">' + c.a + "</div>";
        meta.innerHTML = "<span>Card " + (idx + 1) + " / " + view.length + "</span><span>" + known() + " / " + cards.length + " known</span>";
      }
      function go(i) { idx = i; draw(); }
      function mark(ok) { if (!view.length) return; var c = view[idx]; if (ok) S.fc[c.id] = 1; else delete S.fc[c.id]; save(); if (onlyNew && ok) { view.splice(idx, 1); draw(); } else go(idx + 1); }
      wrap.addEventListener("click", flip);
      d.addEventListener("keydown", function (e) {
        if (/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return;
        if (e.key === " " || e.key === "Enter") { e.preventDefault(); flip(); }
        else if (e.key === "ArrowRight") go(idx + 1); else if (e.key === "ArrowLeft") go(idx - 1);
        else if (e.key === "k" || e.key === "K") mark(true); else if (e.key === "a" || e.key === "A") mark(false);
      });
      rebuild(true, true);
    }
  }

  /* ---------- homepage progress ---------- */
  var pr = d.getElementById("progress-root");
  if (pr && window.ESE_MANIFEST) {
    var man = window.ESE_MANIFEST;
    Object.keys(man).forEach(function (s) {
      var pages = man[s], done = pages.filter(function (p) { return S.prog[p]; }).length;
      var a = el("a", "prog-card"); a.href = BASE + s + "/" + (man[s].flash ? "flashcards.html" : "Unit 1/index.html"); a.href = encodeURI(a.href);
      var fcAll = Object.keys(S.fc).filter(function (k) { return k.indexOf(s + "/") === 0; }).length;
      a.innerHTML = "<h3></h3><div class=\"ese-meter\"><i></i></div><div class=\"n\"></div>";
      a.querySelector("h3").textContent = s; a.querySelector("i").style.transform = "scaleX(" + (done / pages.length) + ")";
      a.querySelector(".n").textContent = done + " / " + pages.length + " pages revised · " + fcAll + " flashcards known";
      pr.appendChild(a);
    });
  }
})();
