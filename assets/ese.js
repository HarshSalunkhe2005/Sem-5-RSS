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
  var READY = ["DL"];

  /* ---------- store ---------- */
  var KEY = "sem5-ese-v1", S;
  try { S = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { S = {}; }
  S.prog = S.prog || {}; S.qa = S.qa || {}; S.fc = S.fc || {};
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
  window.ESE = { store: S, save: save, base: BASE };

  function el(tag, cls, html) { var n = d.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; }
  function btn(txt, cls, fn) { var b = el("button", "ese-btn " + (cls || "")); b.type = "button"; b.textContent = txt; if (fn) b.addEventListener("click", fn); return b; }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  /* ---------- nav extras ---------- */
  var navInner = d.querySelector("nav.toc .inner");
  if (navInner && SUBJ && READY.indexOf(SUBJ) > -1) {
    [["Flashcards", "flashcards.html"], ["Cheat sheet", "cheatsheet.html"]].forEach(function (x) {
      if (rel.indexOf(x[1]) > -1) return;
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
      meterFill.style.width = (100 * n / qas.length) + "%"; meterTxt.textContent = n + " / " + qas.length + " got it";
    }
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
    fetch(qb).then(function (r) { return r.ok ? r.text() : Promise.reject(); }).then(function (html) {
      var doc = new DOMParser().parseFromString(html, "text/html");
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
    var items = [].slice.call(fg.querySelectorAll("[data-s]"));
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
      items.forEach(function (x) { var s = +x.getAttribute("data-s"); x.classList.toggle("on", s <= cur); x.classList.toggle("now", s === cur); });
      cap.textContent = cur === 0 ? (fg.getAttribute("data-intro") || "Press Next to build the diagram step by step.") : caps[cur - 1];
      count.textContent = "step " + cur + " / " + n;
      prev.disabled = cur === 0; nxt.disabled = cur >= n;
    }
    fg.addEventListener("keydown", function (e) { if (e.key === "ArrowRight") go(cur + 1); else if (e.key === "ArrowLeft") go(cur - 1); });
    go(0);
  });

  /* ---------- flashcards page ---------- */
  var fa = d.getElementById("flash-app");
  if (fa) {
    var subj = fa.getAttribute("data-subject"), nUnits = +fa.getAttribute("data-units") || 3;
    var cards = [], view = [], idx = 0, onlyNew = false, unitSel = "all";
    fa.innerHTML = '<p class="flash-meta">Loading cards…</p>';
    var loads = [];
    for (var u = 1; u <= nUnits; u++) (function (u) {
      var url = BASE + subj + "/Unit " + u + "/question-bank.html";
      loads.push(fetch(encodeURI(url)).then(function (r) { return r.ok ? r.text() : ""; }).then(function (h) {
        if (!h) return;
        var doc = new DOMParser().parseFromString(h, "text/html");
        [].forEach.call(doc.querySelectorAll(".qa"), function (q, i) {
          var qe = q.querySelector(".q"), ae = q.querySelector(".a"); if (!qe || !ae) return;
          var qq = qe.cloneNode(true); [].forEach.call(qq.querySelectorAll(".marks"), function (x) { x.remove(); });
          var num = qq.querySelector(".num"); var numTxt = num ? num.textContent.trim() : ""; if (num) num.remove();
          cards.push({ id: subj + "/Unit " + u + "#" + i, unit: u, tag: "Unit " + u + (numTxt ? " · " + numTxt : ""), q: qq.textContent.trim(), a: ae.innerHTML });
        });
      }).catch(function () {}));
    })(u);
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
        fill.style.width = (100 * known() / cards.length) + "%";
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
      a.querySelector("h3").textContent = s; a.querySelector("i").style.width = (100 * done / pages.length) + "%";
      a.querySelector(".n").textContent = done + " / " + pages.length + " pages revised · " + fcAll + " flashcards known";
      pr.appendChild(a);
    });
  }
})();
