/* Mind maps: turns <div class="mindmap"><ul>…</ul></div> into an SVG map.
   The first <li> is the centre topic, its children become branches.
   Branches are split left/right, each branch gets its own colour.
   Without JS the nested list still shows, so nothing is lost. */
(function () {
  var COLORS = ['#2f7de1', '#e0932a', '#17a2b8', '#7c4dff', '#d6455d', '#2e9e5b', '#c2559b', '#8a6d1f'];
  var ROW = 30, PADX = 12, GAPX = 46, FONT = 13.5, ROOTFONT = 17;
  var ctx = document.createElement('canvas').getContext('2d');
  function textW(t, size, bold) {
    ctx.font = (bold ? '700 ' : '400 ') + size + 'px Calibri, Arial, "Segoe UI", sans-serif';
    return ctx.measureText(t).width;
  }
  function parse(li) {
    var label = '';
    li.childNodes.forEach(function (n) {
      if (n.nodeType === 3) label += n.textContent;
      else if (n.nodeName !== 'UL') label += n.textContent;
    });
    var sub = li.querySelector(':scope > ul');
    return {
      label: label.replace(/\s+/g, ' ').trim(),
      children: sub ? Array.prototype.map.call(sub.querySelectorAll(':scope > li'), parse) : []
    };
  }
  function leaves(n) { return n.children.length ? n.children.reduce(function (s, c) { return s + leaves(c); }, 0) : 1; }
  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

  function render(box) {
    var rootLi = box.querySelector(':scope > ul > li');
    if (!rootLi) return;
    var root = parse(rootLi);

    // split branches into two sides with similar leaf counts, keeping order
    var total = leaves(root), acc = 0, right = [], left = [];
    root.children.forEach(function (b, i) {
      b.color = COLORS[i % COLORS.length];
      if (acc < total / 2 || root.children.length === 1) { right.push(b); acc += leaves(b); } else left.push(b);
    });

    // column widths per depth (shared by both sides)
    var colW = [];
    (function walk(n, d) {
      n.w = textW(n.label, d === 0 ? ROOTFONT : FONT, d <= 1) + PADX * 2;
      if (d > 0) colW[d] = Math.max(colW[d] || 0, n.w);
      n.children.forEach(function (c) { c.color = c.color || n.color; walk(c, d + 1); });
    })(root, 0);
    root.w = Math.max(root.w, 120);

    function layoutSide(branches, dir) {
      var y = 0;
      function place(n, d) {
        n.depth = d; n.dir = dir;
        var off = root.w / 2 + GAPX;
        for (var k = 1; k < d; k++) off += colW[k] + GAPX;
        n.x = dir * (off + n.w / 2);
        if (!n.children.length) { n.y = y; y += ROW; }
        else {
          n.children.forEach(function (c) { place(c, d + 1); });
          n.y = (n.children[0].y + n.children[n.children.length - 1].y) / 2;
        }
      }
      branches.forEach(function (b, i) { if (i) y += ROW * 0.45; place(b, 1); });
      return y;
    }
    var hR = layoutSide(right, 1), hL = layoutSide(left, -1);
    function shift(list, dy) { list.forEach(function s(n) { n.y += dy; n.children.forEach(s); }); }
    shift(right, -(hR - ROW) / 2); shift(left, -(hL - ROW) / 2);
    root.x = 0; root.y = 0;

    var all = [];
    (function c(n) { all.push(n); n.children.forEach(c); })(root);
    var minX = 0, maxX = 0, minY = 0, maxY = 0;
    all.forEach(function (n) {
      minX = Math.min(minX, n.x - n.w / 2); maxX = Math.max(maxX, n.x + n.w / 2);
      minY = Math.min(minY, n.y - 20); maxY = Math.max(maxY, n.y + 20);
    });
    var pad = 16, W = maxX - minX + pad * 2, H = maxY - minY + pad * 2;

    var links = '', nodes = '';
    (function draw(n) {
      n.children.forEach(function (c) {
        var x1 = n.x + c.dir * n.w / 2, x2 = c.x - c.dir * c.w / 2, mx = (x1 + x2) / 2;
        var sw = n.depth === undefined || n === root ? 3.2 : Math.max(1.4, 2.6 - n.depth * 0.5);
        links += '<path d="M' + x1 + ',' + n.y + ' C' + mx + ',' + n.y + ' ' + mx + ',' + c.y + ' ' + x2 + ',' + c.y +
          '" fill="none" stroke="' + c.color + '" stroke-width="' + sw + '" stroke-opacity="0.75"/>';
        draw(c);
      });
      var h = n === root ? 40 : 24, r = h / 2, fs = n === root ? ROOTFONT : FONT;
      var fill, stroke, ink, weight;
      if (n === root) { fill = '#0b1e3f'; stroke = '#0b1e3f'; ink = '#fff'; weight = 700; }
      else if (n.depth === 1) { fill = n.color; stroke = n.color; ink = '#fff'; weight = 700; }
      else { fill = '#fff'; stroke = n.color; ink = '#16233f'; weight = 400; }
      nodes += '<g><rect x="' + (n.x - n.w / 2) + '" y="' + (n.y - h / 2) + '" width="' + n.w + '" height="' + h +
        '" rx="' + r + '" fill="' + fill + '" stroke="' + stroke + '" stroke-width="1.6"/>' +
        '<text x="' + n.x + '" y="' + (n.y + fs * 0.35) + '" text-anchor="middle" font-size="' + fs +
        '" font-weight="' + weight + '" fill="' + ink + '">' + esc(n.label) + '</text></g>';
    })(root);
    root.depth = 0;

    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + (minX - pad) + ' ' + (minY - pad) + ' ' + W + ' ' + H +
      '" width="100%" style="max-width:' + Math.ceil(W) + 'px;min-width:' + Math.min(Math.ceil(W), 760) + 'px" role="img" aria-label="Mind map: ' + esc(root.label) +
      '" font-family="Calibri, Arial, Segoe UI, sans-serif">' + links + nodes + '</svg>';
    var list = box.querySelector(':scope > ul');
    list.hidden = true;
    var wrap = document.createElement('div');
    wrap.className = 'mindmap-canvas';
    wrap.innerHTML = svg;
    box.insertBefore(wrap, list);
  }

  var css = document.createElement('style');
  css.textContent =
    '.mindmap{background:#fff;border:1px solid #e1e8f5;border-radius:14px;padding:14px 10px 8px;margin:18px 0;box-shadow:0 2px 10px rgba(11,30,63,.05)}' +
    '.mindmap-label{font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#2f7de1;margin:0 6px 6px}' +
    '.mindmap-canvas{overflow-x:auto;text-align:center}.mindmap-canvas svg{display:inline-block;height:auto}';
  document.head.appendChild(css);

  function init() { document.querySelectorAll('.mindmap').forEach(render); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
