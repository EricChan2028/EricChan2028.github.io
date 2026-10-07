/* Changyuan Chen — site interactions (no dependencies). */
(function () {
  "use strict";

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var root = document.documentElement;
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var PAPERS = window.PAPERS || [];
  var byId = {};
  PAPERS.forEach(function (p) { byId[p.id] = p; });
  var ESC = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return ESC[c]; }); };

  /* ------------------------------------------------------------------ icons */
  var I = function (d) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + d + "</svg>"; };
  var ico = {
    doc: I('<path d="M7 3.5h7l4 4V20a.5.5 0 0 1-.5.5h-10A.5.5 0 0 1 7 20z"/><path d="M14 3.5V8h4M9.5 12h6M9.5 15.5h6"/>'),
    chart: I('<path d="M4 20h16M7 16v-5M12 16V7M17 16v-8"/>'),
    pdf: I('<path d="M7 3.5h7l4 4V20a.5.5 0 0 1-.5.5h-10A.5.5 0 0 1 7 20z"/><path d="M14 3.5V8h4M12 11.5v6M9.5 15l2.5 2.5 2.5-2.5"/>'),
    lock: I('<rect x="5.5" y="10.5" width="13" height="9.5" rx="2"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>'),
    quote: I('<path d="M10 7.5H6.5v5H10zM10 12.5c0 2.6-1.3 4.1-3.6 4.6M18 7.5h-3.5v5H18zM18 12.5c0 2.6-1.3 4.1-3.6 4.6"/>'),
    link: I('<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>'),
    copy: I('<rect x="8.5" y="8.5" width="11" height="11" rx="2"/><path d="M15.5 8.5V6A1.5 1.5 0 0 0 14 4.5H6A1.5 1.5 0 0 0 4.5 6v8A1.5 1.5 0 0 0 6 15.5h2.5"/>'),
    check: I('<path d="m5 12.5 4.5 4.5L19 7.5"/>'),
    poster: I('<rect x="4" y="4.5" width="16" height="12" rx="1.5"/><path d="M8 20.5l4-4 4 4M7.5 8.5h5M7.5 11.5h9"/>'),
    mail: I('<rect x="3" y="5.5" width="18" height="13" rx="2.2"/><path d="m3.8 7 8.2 6.2L20.2 7"/>'),
    zoom: I('<circle cx="10.5" cy="10.5" r="6"/><path d="m15 15 5 5M10.5 8v5M8 10.5h5"/>')
  };

  /* ------------------------------------------------------------- theme */
  var toggle = $("#themeToggle");
  if (toggle) toggle.addEventListener("click", function () {
    var next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try { localStorage.setItem("cc-theme", next); } catch (e) { /* storage blocked */ }
  });

  /* --------------------------------------------------------------- nav */
  var nav = $("#nav"), hero = $(".hero"), ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var hh = hero ? hero.offsetHeight : 0;
      nav.classList.toggle("is-solid", window.scrollY > hh - 90 || nav.classList.contains("is-open"));
      if (window.scrollY < hh * 0.6) navLinks.forEach(function (a) { a.classList.remove("is-active"); });
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  var navLinks = $$(".nav__links a");
  if ("IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        navLinks.forEach(function (a) { a.classList.toggle("is-active", a.getAttribute("href") === "#" + e.target.id); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    $$("main section[id]").forEach(function (s) { spy.observe(s); });
  }


  /* ------------------------------------------------------- mobile menu */
  var menuBtn = $("#menuToggle");
  function setMenu(open) {
    nav.classList.toggle("is-open", open);
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    onScroll();
  }
  if (menuBtn) {
    menuBtn.addEventListener("click", function () { setMenu(!nav.classList.contains("is-open")); });
    navLinks.forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && nav.classList.contains("is-open")) { setMenu(false); menuBtn.focus(); } });
    window.addEventListener("resize", function () { if (window.innerWidth > 960 && nav.classList.contains("is-open")) setMenu(false); });
  }

  /* ------------------------------------------------------------ reveal */
  var revealer = null;
  function observeReveals(scope) {
    var els = $$(".reveal:not(.in)", scope);
    if (reduceMotion || !("IntersectionObserver" in window)) { els.forEach(function (el) { el.classList.add("in"); }); return; }
    if (!revealer) revealer = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); revealer.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.06 });
    els.forEach(function (el, i) { el.style.transitionDelay = (i % 4) * 70 + "ms"; revealer.observe(el); });
  }

  /* -------------------------------------------------- paper thumbnails */
  var MONO = 'font-family="JetBrains Mono, Consolas, monospace"';
  var SERIF = 'font-family="Fraunces, Georgia, serif"';
  function wrapSvg(s) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' + s + "</svg>";
  }
  function defs(u) {
    return '<defs>' +
      '<linearGradient id="' + u + '-bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#34185A"/><stop offset="1" stop-color="#12081F"/></linearGradient>' +
      '<linearGradient id="' + u + '-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F3E2A6"/><stop offset=".55" stop-color="#C9A227"/><stop offset="1" stop-color="#9C7714"/></linearGradient>' +
      '<radialGradient id="' + u + '-glow" cx=".85" cy=".05" r=".95"><stop offset="0" stop-color="#7444B5" stop-opacity=".6"/><stop offset="1" stop-color="#7444B5" stop-opacity="0"/></radialGradient>' +
      '</defs><rect width="320" height="200" fill="url(#' + u + '-bg)"/><rect width="320" height="200" fill="url(#' + u + '-glow)"/>';
  }
  function lbl(x, y, t, op, anchor) {
    return '<text x="' + x + '" y="' + y + '" ' + MONO + ' font-size="8.5" letter-spacing="1.1" fill="#E9D18A" fill-opacity="' + (op == null ? 0.75 : op) + '" text-anchor="' + (anchor || "start") + '">' + t + "</text>";
  }
  function rng(seed) { return function () { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }; }

  var thumbs = {
    gcd: function (u) {
      var s = defs(u) + lbl(24, 28, "KV CACHE · REUSED ACROSS UPDATES");
      var flag = { "0-5": 1, "1-3": 1, "2-6": 1 };
      for (var r = 0; r < 3; r++) for (var c = 0; c < 12; c++) {
        var x = 24 + c * 22, y = 42 + r * 22, k = r + "-" + c, isNew = c >= 8;
        s += '<rect x="' + x + '" y="' + y + '" width="17" height="17" rx="4" fill="' + (isNew ? "url(#" + u + "-gold)" : "#7444B5") +
          '" fill-opacity="' + (isNew ? 1 : Math.min(1, 0.32 + 0.08 * c).toFixed(2)) + '"' + (flag[k] ? ' stroke="#F3E2A6" stroke-width="1.6"' : "") + "/>";
        if (flag[k]) s += '<circle cx="' + (x + 17) + '" cy="' + y + '" r="3.2" fill="#F3E2A6"/>';
      }
      s += lbl(24, 122, "OLD WEIGHTS", 0.55) + lbl(200, 122, "NEW WEIGHTS", 0.55);
      s += "<text x=\"24\" y=\"176\" " + SERIF + ' font-style="italic" font-size="21" fill="#fff">π<tspan font-size="12" dy="5">hyb</tspan><tspan dy="-5" fill="#E9D18A"> ≠ </tspan>π<tspan font-size="12" dy="5">old</tspan></text>';
      s += '<path d="M190 182 C 216 180, 236 175, 252 166 S 282 150, 296 144" fill="none" stroke="url(#' + u + '-gold)" stroke-width="2.2" stroke-linecap="round"/>';
      s += '<circle cx="252" cy="166" r="3" fill="#F3E2A6"/><circle cx="296" cy="144" r="3.4" fill="#F3E2A6"/>' + lbl(296, 136, "BIAS ↑ WITH STALENESS", 0.65, "end");
      return wrapSvg(s);
    },
    prosper: function (u) {
      var s = defs(u) + lbl(24, 28, "PROGRESS-SHAPLEY CREDIT");
      var N = [["P", 160, 54, 17], ["S", 250, 106, 24], ["V", 160, 160, 12], ["R", 70, 106, 20]];
      for (var i = 0; i < 4; i++) for (var j = i + 1; j < 4; j++) {
        s += '<line x1="' + N[i][1] + '" y1="' + N[i][2] + '" x2="' + N[j][1] + '" y2="' + N[j][2] + '" stroke="#C9A227" stroke-opacity="' +
          (0.16 + 0.07 * (i + j)).toFixed(2) + '" stroke-width="' + (0.8 + 0.45 * (i + j)).toFixed(1) + '"/>';
      }
      s += '<circle cx="160" cy="106" r="22" fill="#12081F" stroke="#E9D18A" stroke-opacity=".45" stroke-dasharray="3 4"/>';
      s += '<text x="160" y="113" ' + SERIF + ' font-style="italic" font-size="20" fill="#E9D18A" text-anchor="middle">φ</text>';
      N.forEach(function (n) {
        s += '<circle cx="' + n[1] + '" cy="' + n[2] + '" r="' + (n[3] + 7) + '" fill="#7444B5" fill-opacity=".2"/>';
        s += '<circle cx="' + n[1] + '" cy="' + n[2] + '" r="' + n[3] + '" fill="#43206F" stroke="url(#' + u + '-gold)" stroke-width="2"/>';
        s += '<text x="' + n[1] + '" y="' + (n[2] + 5) + '" ' + SERIF + ' font-size="' + (11 + n[3] * 0.38).toFixed(1) + '" fill="#fff" text-anchor="middle">' + n[0] + "</text>";
      });
      s += lbl(296, 188, "Σ φᵢ = v(N)", 0.7, "end") + lbl(24, 188, "SIZE = SHAPLEY SHARE", 0.5);
      return wrapSvg(s);
    },
    selfplay: function (u) {
      var s = defs(u) + lbl(24, 28, "ILL-POSED SHARE OF ADMITTED PROBLEMS");
      s += '<rect x="40" y="70" width="256" height="64" fill="#7444B5" fill-opacity=".16"/>' + lbl(44, 64, "AGREEMENT BAND", 0.45);
      var rnd = rng(7);
      for (var i = 0; i < 4; i++) for (var k = 0; k < 14; k++) {
        var x = 46 + i * 76 + rnd() * 40, y = 74 + rnd() * 56, ill = rnd() < 0.28 + i * 0.13;
        s += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="2.4" fill="' + (ill ? "#E9D18A" : "#B9A0E0") + '" fill-opacity="' + (ill ? 0.9 : 0.42) + '"/>';
      }
      var pts = [[60, 132], [136, 108], [212, 93], [288, 84]];
      s += '<line x1="40" y1="160" x2="296" y2="160" stroke="#B9A0E0" stroke-opacity=".35"/>';
      ["ROUND 0", "1", "2", "3"].forEach(function (t, i) { s += lbl(60 + i * 76, 178, t, 0.55, "middle"); });
      s += '<polyline points="' + pts.map(function (p) { return p.join(","); }).join(" ") + '" fill="none" stroke="url(#' + u + '-gold)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>';
      pts.forEach(function (p) { s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="3.6" fill="#12081F" stroke="#F3E2A6" stroke-width="2"/>'; });
      s += '<text x="296" y="54" ' + SERIF + ' font-size="17" fill="#fff" text-anchor="end" font-style="italic">drift ↑</text>';
      return wrapSvg(s);
    },
    qd: function (u) {
      var s = defs(u) + lbl(24, 28, "QUALITY-DIVERSITY ARCHIVE");
      var rnd = rng(11), x0 = 90, y0 = 38, c = 24, g = 5;
      for (var r = 0; r < 5; r++) for (var k = 0; k < 5; k++) {
        var x = x0 + k * (c + g), y = y0 + r * (c + g), q = rnd();
        if (q < 0.14) { s += '<rect x="' + x + '" y="' + y + '" width="' + c + '" height="' + c + '" rx="5" fill="none" stroke="#B9A0E0" stroke-opacity=".3" stroke-dasharray="3 3"/>'; continue; }
        var gold = q > 0.74;
        s += '<rect x="' + x + '" y="' + y + '" width="' + c + '" height="' + c + '" rx="5" fill="' + (gold ? "url(#" + u + "-gold)" : "#7444B5") + '" fill-opacity="' + (gold ? 1 : (0.3 + q * 0.6).toFixed(2)) + '"/>';
      }
      [[52, 150], [60, 162], [44, 166]].forEach(function (d) {
        s += '<path d="M' + d[0] + " " + (d[1] - 5) + " l5 5 -5 5 -5 -5z\" fill=\"none\" stroke=\"#fff\" stroke-opacity=\".7\" stroke-width=\"1.3\"/>";
      });
      s += lbl(24, 192, "◇ HANDCRAFTED", 0.55) + lbl(296, 192, "COVERAGE 0.78–0.84 vs 0.12", 0.7, "end");
      s += lbl(244, 58, "TOPOLOGY →", 0.45) + lbl(244, 74, "AGENTS ↓", 0.45);
      return wrapSvg(s);
    },
    admet: function (u) {
      var s = defs(u) + lbl(24, 28, "EVERY ENDPOINT · NO REGRESSION");
      var cx = 92, cy = 110, R = 34, hex = [];
      for (var i = 0; i < 6; i++) { var a = Math.PI / 3 * i - Math.PI / 2; hex.push([cx + R * Math.cos(a), cy + R * Math.sin(a)]); }
      s += '<polygon points="' + hex.map(function (p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" ") + '" fill="none" stroke="url(#' + u + '-gold)" stroke-width="2.4" stroke-linejoin="round"/>';
      s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (R * 0.55).toFixed(1) + '" fill="none" stroke="#E9D18A" stroke-opacity=".55" stroke-width="1.5"/>';
      [[0, 24], [2, 22], [4, 24]].forEach(function (t) {
        var p = hex[t[0]], a2 = Math.PI / 3 * t[0] - Math.PI / 2, x2 = p[0] + t[1] * Math.cos(a2), y2 = p[1] + t[1] * Math.sin(a2);
        s += '<line x1="' + p[0].toFixed(1) + '" y1="' + p[1].toFixed(1) + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '" stroke="#B9A0E0" stroke-width="2"/>' +
          '<circle cx="' + x2.toFixed(1) + '" cy="' + y2.toFixed(1) + '" r="5" fill="#7444B5" stroke="#E9D18A" stroke-width="1.4"/>';
      });
      var bx = 178, base = 132, vals = [26, 15, 34, 7, 21, 2];
      s += '<line x1="' + (bx - 6) + '" y1="' + base + '" x2="' + (bx + 124) + '" y2="' + base + '" stroke="#F3E2A6" stroke-opacity=".85" stroke-width="1.2"/>';
      s += '<line x1="' + (bx - 6) + '" y1="' + (base + 7) + '" x2="' + (bx + 124) + '" y2="' + (base + 7) + '" stroke="#F3E2A6" stroke-opacity=".5" stroke-dasharray="3 3"/>';
      vals.forEach(function (v, i) {
        var x = bx + i * 20;
        s += '<rect x="' + x + '" y="' + (base - v) + '" width="12" height="' + Math.max(v, 1.5) + '" rx="2" fill="' + (v > 10 ? "url(#" + u + "-gold)" : "#B9A0E0") + '" fill-opacity="' + (v > 10 ? 1 : 0.85) + '"/>';
      });
      s += lbl(176, 158, "ANCHOR — BUDGET ε ┄", 0.6) + '<text x="176" y="76" ' + SERIF + ' font-style="italic" font-size="18" fill="#fff">TV ≤ ε</text>';
      return wrapSvg(s);
    },
    clip: function (u) {
      var s = defs(u) + lbl(24, 28, "OVERLAPPING CLIPS · SHARED FEATURES");
      for (var i = 0; i <= 26; i++) {
        var x = 24 + i * 10.4;
        s += '<line x1="' + x.toFixed(1) + '" y1="42" x2="' + x.toFixed(1) + '" y2="' + (i % 5 ? 46 : 50) + '" stroke="#B9A0E0" stroke-opacity=".45"/>';
      }
      [[24, 150], [56, 150], [92, 150], [124, 150], [160, 136]].forEach(function (cl, k) {
        var y = 62 + k * 22, sx = cl[0] + 24, sw = Math.max(0, Math.min(cl[0] + cl[1], 290) - sx - 6);
        s += '<rect x="' + cl[0] + '" y="' + y + '" width="' + cl[1] + '" height="14" rx="7" fill="#7444B5" fill-opacity=".55"/>';
        s += '<rect x="' + sx + '" y="' + (y + 3) + '" width="' + sw + '" height="8" rx="4" fill="url(#' + u + '-gold)" fill-opacity=".92"/>';
      });
      s += lbl(24, 188, "REPAIR PREFIX → REUSE", 0.5) + '<text x="296" y="190" ' + SERIF + ' font-style="italic" font-size="15" fill="#fff" text-anchor="end">bitwise-identical</text>';
      return wrapSvg(s);
    }
  };
  function thumb(kind, uid) { return (thumbs[kind] || thumbs.gcd)(uid); }

  /* ------------------------------------------------------- publications */
  function authorsHTML(p) {
    var parts = p.authors.map(function (a) {
      var n = esc(a.name) + (a.eq ? "*" : "") + (a.corr ? "†" : "");
      return a.me ? '<span class="me">' + n + "</span>" : n;
    });
    var s = parts.join(", ");
    if (p.authors.length === 1) s += ' <span class="anon">· full author list after review</span>';
    return s;
  }
  function shortRole(r) { return String(r).split(" ·")[0].split(" (")[0]; }

  /* The card's result chart: bars start at 0 and are drawn to scale against b.max. */
  function barsHTML(b) {
    if (!b) return "";
    var clamp = function (v) { return Math.max(0, Math.min(1, v / b.max)); };
    var rows = b.items.map(function (it) {
      var w = clamp(it.value), hi = it.hi != null ? clamp(it.hi) : null;
      var cls = "bar" + (it.ours ? " is-ours" : "") + (it.soft ? " is-soft" : "") + (it.warn ? " is-warn" : "");
      return '<li class="' + cls + '"><span class="bar__label">' + esc(it.label) + '</span><span class="bar__value">' +
        esc(it.text != null ? it.text : it.value) + "</span>" +
        '<span class="bar__track" aria-hidden="true"><span class="bar__fill" style="--w:' + w.toFixed(4) + '"></span>' +
        (hi != null ? '<span class="bar__range" style="--l:' + w.toFixed(4) + ";--w:" + (hi - w).toFixed(4) + '"></span>' : "") +
        "</span></li>";
    }).join("");
    return '<figure class="bars"><figcaption class="bars__title">' + esc(b.title) +
      (b.lower ? ' <span class="bars__tag">lower is better</span>' : "") + "</figcaption>" +
      '<ul class="bars__list">' + rows + "</ul>" + (b.note ? '<p class="bars__note">' + esc(b.note) + "</p>" : "") + "</figure>";
  }

  function cardHTML(p) {
    var acc = p.status === "accepted";
    var pdfBtn;
    if (p.pdf) pdfBtn = '<a class="plink" href="' + esc(p.pdf) + '" target="_blank" rel="noopener">' + ico.pdf + " PDF</a>";
    else if (p.poster) pdfBtn = '<a class="plink" href="#paper=' + p.id + '&amp;tab=pdf">' + ico.poster + " Poster</a>";
    else pdfBtn = '<a class="plink plink--muted" href="#paper=' + p.id + '&amp;tab=pdf">' + ico.lock + " PDF after review</a>";
    var cite = p.bibtex ? '<a class="plink" href="#paper=' + p.id + '&amp;tab=cite">' + ico.quote + " BibTeX</a>" : "";
    return '<article class="pub reveal' + (p.featured ? " is-featured" : "") + '" data-id="' + p.id + '" data-status="' + p.status + '" data-topics="' + esc(p.topics.join("|")) + '">' +
      '<div class="pub__thumb">' + thumb(p.thumb, "c-" + p.id) + "</div>" +
      '<div class="pub__result">' + barsHTML(p.bars) + "</div>" +
      '<div class="pub__body">' +
        '<div class="pub__top"><span class="venue' + (acc ? " venue--accepted" : "") + '">' + esc(p.venue) + "</span>" +
        (p.statusLabel ? '<span class="status' + (acc ? " status--accepted" : "") + '">' + esc(p.statusLabel) + "</span>" : "") +
        '<span class="role">' + esc(shortRole(p.role)) + "</span></div>" +
        '<h3 class="pub__title"><a href="#paper=' + p.id + '">' + esc(p.title) + "</a></h3>" +
        '<p class="pub__authors">' + authorsHTML(p) + "</p>" +
        '<dl class="pub__qa"><div><dt>Question</dt><dd>' + esc(p.question) + "</dd></div>" +
        "<div><dt>Approach</dt><dd>" + esc(p.approach) + "</dd></div></dl>" +
        (p.stats ? '<ul class="pub__stats">' + p.stats.map(function (st) { return "<li><strong>" + esc(st[0]) + "</strong><span>" + esc(st[1]) + "</span></li>"; }).join("") + "</ul>" : "") +
      "</div>" +
      '<div class="pub__links"><a class="plink plink--main" href="#paper=' + p.id + '">' + ico.doc + " Details</a>" +
        '<a class="plink" href="#paper=' + p.id + '&amp;tab=results">' + ico.chart + " Key results</a>" + pdfBtn + cite + "</div>" +
      "</article>";
  }

  var list = $("#pubList");
  if (list) {
    list.innerHTML = PAPERS.map(cardHTML).join("");
    observeReveals(list);
  }
  var count = $("#pubCount");
  if (count) {
    var nAcc = PAPERS.filter(function (p) { return p.status === "accepted"; }).length;
    count.textContent = PAPERS.length + " papers · " + nAcc + " accepted · " + (PAPERS.length - nAcc) + " under review";
  }
  observeReveals(document);

  var chips = $$(".chip");
  chips.forEach(function (ch) {
    ch.setAttribute("aria-pressed", ch.classList.contains("is-on") ? "true" : "false");
    ch.addEventListener("click", function () {
      chips.forEach(function (c) { var on = c === ch; c.classList.toggle("is-on", on); c.setAttribute("aria-pressed", on ? "true" : "false"); });
      var f = ch.dataset.f;
      $$(".pub", list).forEach(function (el) {
        var show = f === "all" || el.dataset.status === f || el.dataset.topics.split("|").indexOf(f) !== -1;
        el.classList.toggle("is-hidden", !show);
        if (show) el.classList.add("in");
      });
    });
  });

  /* ------------------------------------------------------- paper sheet */
  var sheet = $("#sheet"), body = $("#sheetBody"), current = null, lastFocus = null;

  function pdfPanel(p) {
    var s = "";
    if (p.pdf) {
      s += '<iframe class="pdf-frame" data-src="' + esc(p.pdf) + '#view=FitH" title="PDF: ' + esc(p.short) + '"></iframe>' +
        '<p class="setup"><a href="' + esc(p.pdf) + '" target="_blank" rel="noopener">Open the PDF in a new tab ↗</a></p>';
    }
    if (p.poster && p.poster.image) {
      s += "<h3>" + esc(p.poster.caption || "Poster") + "</h3>" +
        '<a href="' + esc(p.poster.image) + '" target="_blank" rel="noopener"><img class="poster-img" src="' + esc(p.poster.image) + '" alt="' + esc(p.poster.caption || "Poster") + '" loading="lazy"></a>';
      if (p.poster.pdf) s += '<p class="setup"><a href="' + esc(p.poster.pdf) + '" target="_blank" rel="noopener">Open the full poster (PDF) ↗</a></p>';
    }
    if (!p.pdf) {
      var accepted = p.status === "accepted";
      s += '<div class="pending"><div class="pending__icon">' + ico.lock + "</div>" +
        "<h4>" + (accepted ? "Paper PDF coming soon" : "PDF available after the review period") + "</h4>" +
        "<p>" + esc(p.pdfNote) + "</p>" +
        (accepted
          ? '<a class="btn btn--purple btn--sm" href="mailto:cchen22@emich.edu?subject=' + encodeURIComponent(p.short + " (NeurIPS 2026)") + '">Email me about this paper</a>'
          : '<a class="btn btn--purple btn--sm" href="mailto:cchen22@emich.edu?subject=' + encodeURIComponent("Question about " + p.short) + '">Questions? Email me</a>') +
        "</div>";
    }
    return s;
  }

  function figHTML(f) {
    return '<figure class="fig' + (f.narrow ? " fig--narrow" : "") + '">' +
      '<button class="fig__zoom" type="button" data-zoom="' + esc(f.src) + '" data-cap="' + esc(f.caption) + '" aria-label="Enlarge figure">' +
      '<img src="' + esc(f.src) + '" width="' + f.w + '" height="' + f.h + '" alt="' + esc(f.alt) + '" loading="lazy" decoding="async">' +
      '<span class="fig__hint" aria-hidden="true">' + ico.zoom + "</span></button>" +
      "<figcaption>" + esc(f.caption) + "</figcaption></figure>";
  }
  function figsHTML(p, tab) {
    return (p.figures || []).filter(function (f) { return f.tab === tab; }).map(figHTML).join("");
  }

  function sheetHTML(p) {
    var acc = p.status === "accepted";
    var resultFigs = figsHTML(p, "results");
    var tabs = [["overview", "Overview"], ["results", "Key results"]];
    if (p.bibtex) tabs.push(["cite", "Cite"]);
    tabs.push(["pdf", p.pdf ? "PDF" : p.poster ? "Poster & PDF" : "PDF"]);
    var actions = [];
    if (p.pdf) actions.push('<a class="plink plink--main" href="' + esc(p.pdf) + '" target="_blank" rel="noopener">' + ico.pdf + " Open PDF</a>");
    else actions.push('<button class="plink plink--main" type="button" data-go="pdf">' + (p.poster ? ico.poster + " Poster &amp; PDF" : ico.lock + " PDF status") + "</button>");
    if (p.bibtex) actions.push('<button class="plink" type="button" data-copy="bibtex">' + ico.quote + " Copy BibTeX</button>");
    actions.push('<button class="plink" type="button" data-copy="link">' + ico.link + " Copy link</button>");

    var html =
      '<header class="sheet__hero">' +
        '<div class="pub__top"><span class="venue' + (acc ? " venue--accepted" : "") + '">' + esc(p.venue) + "</span>" +
        (p.statusLabel ? '<span class="status' + (acc ? " status--accepted" : "") + '">' + esc(p.statusLabel) + "</span>" : "") + "</div>" +
        '<h2 class="sheet__title" id="sheetTitle">' + esc(p.title) + "</h2>" +
        '<p class="sheet__authors">' + authorsHTML(p) + "</p>" +
        (p.authorNote ? '<p class="sheet__note">' + esc(p.authorNote) + "</p>" : "") +
        '<p class="sheet__venue">' + esc(p.venueLong) + "</p>" +
        '<div class="sheet__actions">' + actions.join("") + "</div>" +
      "</header>" +
      '<div class="tabs" role="tablist" aria-label="Paper sections">' +
        tabs.map(function (t) {
          return '<button class="tab" role="tab" id="t-' + t[0] + '" aria-controls="p-' + t[0] + '" aria-selected="false" tabindex="-1" data-tab="' + t[0] + '" type="button">' + t[1] + "</button>";
        }).join("") +
      "</div>" +
      '<section class="tabpanel" role="tabpanel" id="p-overview" aria-labelledby="t-overview">' +
        '<p class="tldr-box">' + esc(p.tldr) + "</p>" +
        figsHTML(p, "overview") +
        "<h3>The problem</h3><p>" + esc(p.problem) + "</p>" +
        '<h3>Approach</h3><ol class="steps">' + p.method.map(function (m) { return "<li>" + esc(m) + "</li>"; }).join("") + "</ol>" +
        (p.setup ? '<p class="setup">Setup — ' + esc(p.setup) + "</p>" : "") +
      "</section>" +
      '<section class="tabpanel" role="tabpanel" id="p-results" aria-labelledby="t-results" hidden>' +
        '<div class="kpis">' + p.highlights.map(function (h) { return '<div class="kpi"><strong>' + esc(h[0]) + "</strong><span>" + esc(h[1]) + "</span></div>"; }).join("") + "</div>" +
        (resultFigs ? "<h3>Figures</h3>" + resultFigs : p.figureNote ? '<p class="setup">' + esc(p.figureNote) + "</p>" : "") +
        "<h3>All results</h3>" +
        '<table class="rtable"><tbody>' + p.results.map(function (r) { return '<tr><th scope="row">' + esc(r[0]) + "</th><td>" + esc(r[1]) + "</td></tr>"; }).join("") + "</tbody></table>" +
      "</section>";
    if (p.bibtex) {
      html += '<section class="tabpanel" role="tabpanel" id="p-cite" aria-labelledby="t-cite" hidden>' +
        '<h3>BibTeX</h3><div class="cite"><pre><code>' + esc(p.bibtex) + '</code></pre><button class="plink copy-btn" type="button" data-copy="bibtex">' + ico.copy + " Copy</button></div></section>";
    }
    html += '<section class="tabpanel" role="tabpanel" id="p-pdf" aria-labelledby="t-pdf" hidden>' + pdfPanel(p) + "</section>";
    return html;
  }

  function selectTab(k) {
    var tabEls = $$(".tab", body);
    if (!tabEls.some(function (t) { return t.dataset.tab === k; })) k = "overview";
    tabEls.forEach(function (t) {
      var on = t.dataset.tab === k;
      t.setAttribute("aria-selected", on ? "true" : "false");
      t.tabIndex = on ? 0 : -1;
    });
    $$(".tabpanel", body).forEach(function (pn) { pn.hidden = pn.id !== "p-" + k; });
    var fr = $("#p-" + k + " iframe[data-src]", body);
    if (fr && !fr.getAttribute("src")) fr.setAttribute("src", fr.dataset.src);
    if (current && history.replaceState) history.replaceState(null, "", "#paper=" + current + (k !== "overview" ? "&tab=" + k : ""));
  }

  function copyText(txt, btn) {
    var done = function () {
      var old = btn.innerHTML;
      btn.innerHTML = ico.check + " Copied";
      btn.classList.add("is-done");
      setTimeout(function () { btn.innerHTML = old; btn.classList.remove("is-done"); }, 1600);
    };
    var fallback = function () {
      var ta = document.createElement("textarea");
      ta.value = txt; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
      (sheet && sheet.open ? sheet : document.body).appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); } catch (e) { /* ignore */ }
      ta.remove(); done();
    };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(txt).then(done, fallback);
    else fallback();
  }

  function bindSheet(p) {
    var tablist = $(".tabs", body);
    $$(".tab", body).forEach(function (t) { t.addEventListener("click", function () { selectTab(t.dataset.tab); }); });
    tablist.addEventListener("keydown", function (e) {
      var tabEls = $$(".tab", body), i = tabEls.indexOf(document.activeElement);
      if (i < 0) return;
      var n = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : e.key === "Home" ? 0 : e.key === "End" ? tabEls.length - 1 : null;
      if (n === null) return;
      e.preventDefault();
      n = (n + tabEls.length) % tabEls.length;
      tabEls[n].focus();
      selectTab(tabEls[n].dataset.tab);
    });
    $$("[data-go]", body).forEach(function (b) {
      b.addEventListener("click", function () {
        selectTab(b.dataset.go);
        var tabs = $(".tabs", body);
        if (tabs) tabs.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      });
    });
    $$("[data-copy]", body).forEach(function (b) {
      b.addEventListener("click", function () {
        var txt = b.dataset.copy === "bibtex" ? p.bibtex : location.origin + location.pathname + "#paper=" + p.id;
        copyText(txt, b);
      });
    });
    $$("[data-zoom]", body).forEach(function (b) { b.addEventListener("click", function () { openFigure(b); }); });
  }

  /* --------------------------------------------------- figure lightbox */
  var lb = $("#lightbox"), lbImg = $("#lightboxImg"), lbCap = $("#lightboxCap"), lbBack = null;
  function openFigure(btn) {
    if (!lb) return;
    var img = $("img", btn);
    lbImg.src = btn.dataset.zoom;
    lbImg.alt = img ? img.alt : "";
    lbCap.textContent = btn.dataset.cap || "";
    lbBack = btn;
    if (typeof lb.showModal === "function") lb.showModal(); else lb.setAttribute("open", "");
  }
  function closeFigure() { if (lb && lb.open) { if (typeof lb.close === "function") lb.close(); else lb.removeAttribute("open"); } }
  if (lb) {
    lb.addEventListener("click", function (e) { if (e.target === lb || e.target.closest("[data-lb-close]")) closeFigure(); });
    lb.addEventListener("close", function () { if (lbBack && document.contains(lbBack)) lbBack.focus({ preventScroll: true }); });
  }

  function openPaper(id, tab) {
    var p = byId[id];
    if (!p || !sheet) return;
    var fresh = current !== id;
    if (fresh) { body.innerHTML = sheetHTML(p); current = id; bindSheet(p); }
    var wasOpen = sheet.open;
    if (!wasOpen) {
      lastFocus = document.activeElement;
      if (typeof sheet.showModal === "function") sheet.showModal(); else sheet.setAttribute("open", "");
      root.classList.add("is-locked");
    }
    selectTab(tab || "overview");
    if (!wasOpen || fresh) $(".sheet__panel", sheet).scrollTop = 0;
  }

  function closeSheet() { if (sheet && sheet.open) { if (typeof sheet.close === "function") sheet.close(); else { sheet.removeAttribute("open"); onClosed(); } } }
  function onClosed() {
    closeFigure();
    root.classList.remove("is-locked");
    if (/^#paper=/.test(location.hash) && history.replaceState) history.replaceState(null, "", location.pathname + location.search);
    var card = current && $('.pub[data-id="' + current + '"] .pub__title a');
    var back = (lastFocus && document.contains(lastFocus) && lastFocus !== document.body) ? lastFocus : card;
    if (back && back.focus) back.focus({ preventScroll: true });
  }
  if (sheet) {
    sheet.addEventListener("close", onClosed);
    sheet.addEventListener("click", function (e) { if (e.target === sheet) closeSheet(); });
    $$("[data-close]", sheet).forEach(function (b) { b.addEventListener("click", closeSheet); });
  }

  function route() {
    var m = location.hash.match(/^#paper=([\w-]+)(?:&tab=(\w+))?/);
    if (m && byId[m[1]]) openPaper(m[1], m[2] || "overview");
    else if (sheet && sheet.open && !/^#paper=/.test(location.hash)) closeSheet();
  }
  window.addEventListener("hashchange", route);
  route();

  /* ---------------------------------------------------- hero: token lattice
     Tokens stream in from the right like a growing KV cache. Filler tokens fade quickly with age,
     important ones (gold) persist; a query point (your cursor) attends to earlier tokens. */
  (function lattice() {
    var canvas = $("#lattice");
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext("2d");
    var host = canvas.parentElement;
    var W = 0, H = 0, dpr = 1, rows = [], arcs = [], raf = 0, visible = true, last = 0, pickAt = 0;
    var ptr = { x: 0, y: 0, on: false }, q = { x: 0, y: 0 };
    var ROW = 28, TH = 14, GAP = 6;
    var R = function (a, b) { return a + Math.random() * (b - a); };
    var hasRound = typeof ctx.roundRect === "function";

    function tok(x) {
      var r = Math.random();
      return { x: x, w: R(8, 42), imp: r < 0.05 ? 1 : r < 0.18 ? R(0.45, 0.7) : R(0.05, 0.3), glow: 0 };
    }
    function build() {
      var rect = host.getBoundingClientRect();
      W = rect.width; H = rect.height;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      rows = [];
      var n = Math.ceil(H / ROW) + 1;
      for (var i = 0; i < n; i++) {
        var toks = [], x = R(-60, 0);
        while (x < W + 80) { var t = tok(x); toks.push(t); x += t.w + GAP + (Math.random() < 0.1 ? R(10, 36) : 0); }
        rows.push({ y: i * ROW + 4, v: R(5, 14), toks: toks });
      }
      q.x = W * 0.74; q.y = H * 0.42;
      arcs = [];
    }
    function rr(x, y, w, h, r) {
      ctx.beginPath();
      if (hasRound) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h);
    }
    function drawTokens() {
      for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        var vy = Math.abs((row.y + TH / 2) / H - 0.5) * 2;
        var vfade = 1 - 0.6 * vy * vy;                             // soft vertical vignette
        for (var j = 0; j < row.toks.length; j++) {
          var t = row.toks[j];
          if (t.x > W || t.x + t.w < 0) continue;
          var rec = Math.max(0, Math.min(1, (t.x + t.w) / W));
          var keep = Math.pow(rec, 2.4 - 2.1 * t.imp);           // geometric retention: filler fades, key tokens persist
          var a = (0.025 + 0.42 * keep * (0.28 + 0.72 * t.imp)) * vfade + t.glow * 0.6;
          ctx.fillStyle = t.imp === 1 ? "rgba(219,185,79," + a.toFixed(3) + ")" : "rgba(150,110,215," + a.toFixed(3) + ")";
          rr(t.x, row.y, t.w, TH, 4);
          ctx.fill();
          if (t.glow > 0.03) {
            ctx.strokeStyle = "rgba(243,226,166," + Math.min(1, t.glow).toFixed(3) + ")";
            ctx.lineWidth = 1.2;
            rr(t.x, row.y, t.w, TH, 4);
            ctx.stroke();
          }
        }
      }
    }
    function step(dt, now) {
      for (var i = 0; i < rows.length; i++) {
        var row = rows[i], dx = row.v * dt;
        for (var j = 0; j < row.toks.length; j++) { row.toks[j].x -= dx; row.toks[j].glow *= 0.93; }
        while (row.toks.length && row.toks[0].x + row.toks[0].w < -80) row.toks.shift();
        var lt = row.toks[row.toks.length - 1];
        while (!lt || lt.x + lt.w < W + 80) {
          var nx = lt ? lt.x + lt.w + GAP + (Math.random() < 0.1 ? R(10, 36) : 0) : W;
          lt = tok(nx); row.toks.push(lt);
        }
      }
      var time = now / 1000;
      var tx = ptr.on ? ptr.x : W * (0.72 + 0.11 * Math.sin(time * 0.23));
      var ty = ptr.on ? ptr.y : H * (0.42 + 0.2 * Math.sin(time * 0.31 + 1.3));
      var k = Math.min(1, dt * 3.2);
      q.x += (tx - q.x) * k; q.y += (ty - q.y) * k;
    }
    function pick() {
      var cand = [];
      for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        for (var j = 0; j < row.toks.length; j++) {
          var t = row.toks[j], cx = t.x + t.w / 2, cy = row.y + TH / 2;
          if (cx > q.x - 8 || cx < 0) continue;                    // causal: attend only to earlier tokens
          var d = Math.sqrt((cx - q.x) * (cx - q.x) + (cy - q.y) * (cy - q.y));
          cand.push({ t: t, row: row, s: 2.6 * t.imp - d / 260 + R(-0.25, 0.25) });
        }
      }
      cand.sort(function (a, b) { return b.s - a.s; });
      var top = cand.slice(0, 7);
      if (!top.length) return;
      var m = top[0].s, z = 0;
      top.forEach(function (c) { z += Math.exp(c.s - m); });
      arcs.forEach(function (a) { a.target = 0; });
      top.forEach(function (c) { arcs.push({ t: c.t, row: c.row, w: 0, target: Math.exp(c.s - m) / z }); });
    }
    function drawArcs(dt) {
      var k = Math.min(1, dt * 4);
      ctx.save();
      ctx.shadowColor = "rgba(233,209,138,.75)";
      ctx.shadowBlur = 10;
      ctx.lineCap = "round";
      for (var i = 0; i < arcs.length; i++) {
        var a = arcs[i];
        a.w += (a.target - a.w) * k;
        if (a.w < 0.004) continue;
        var cx = a.t.x + a.t.w / 2, cy = a.row.y + TH / 2;
        var mx = (cx + q.x) / 2, my = Math.min(cy, q.y) - 46 - Math.abs(cx - q.x) * 0.2;
        var g = ctx.createLinearGradient(q.x, q.y, cx, cy);
        g.addColorStop(0, "rgba(255,241,200," + Math.min(1, 0.95 * a.w + 0.18).toFixed(3) + ")");
        g.addColorStop(1, "rgba(219,185,79," + Math.min(1, 0.7 * a.w + 0.08).toFixed(3) + ")");
        ctx.strokeStyle = g;
        ctx.lineWidth = 0.9 + 3.6 * a.w;
        ctx.beginPath(); ctx.moveTo(q.x, q.y); ctx.quadraticCurveTo(mx, my, cx, cy); ctx.stroke();
        ctx.fillStyle = "rgba(255,241,200," + Math.min(1, 0.4 + a.w).toFixed(3) + ")";
        ctx.beginPath(); ctx.arc(cx, cy, 1.6 + 2 * a.w, 0, Math.PI * 2); ctx.fill();
        a.t.glow = Math.max(a.t.glow, Math.min(1, a.w * 2.4));
      }
      ctx.restore();
      arcs = arcs.filter(function (a) { return a.target > 0 || a.w > 0.004; });
    }
    function drawQuery() {
      var g = ctx.createRadialGradient(q.x, q.y, 0, q.x, q.y, 48);
      g.addColorStop(0, "rgba(255,244,214,.95)");
      g.addColorStop(0.18, "rgba(233,209,138,.5)");
      g.addColorStop(1, "rgba(233,209,138,0)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(q.x, q.y, 48, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#FFF6D8";
      ctx.beginPath(); ctx.arc(q.x, q.y, 3.2, 0, Math.PI * 2); ctx.fill();
    }
    function paint(dt) {
      ctx.clearRect(0, 0, W, H);
      drawTokens(); drawArcs(dt); drawQuery();
    }
    function frame(now) {
      raf = 0;
      var dt = Math.min(0.05, (now - last) / 1000 || 0.016);
      last = now;
      step(dt, now);
      if (now > pickAt) { pick(); pickAt = now + (ptr.on ? 650 : 1150); }
      paint(dt);
      if (visible && !document.hidden) raf = requestAnimationFrame(frame);
    }
    function start() {
      if (reduceMotion || raf) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
    function still() {
      pick();
      arcs.forEach(function (a) { a.w = a.target; });
      paint(0);
    }

    build();
    if (reduceMotion) still(); else start();

    host.addEventListener("pointermove", function (e) {
      var r = host.getBoundingClientRect();
      ptr.x = e.clientX - r.left; ptr.y = e.clientY - r.top; ptr.on = true;
    });
    host.addEventListener("pointerleave", function () { ptr.on = false; });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) start(); }).observe(host);
    }
    document.addEventListener("visibilitychange", function () { if (!document.hidden) start(); });
    var rt = 0;
    var onResize = function () {
      clearTimeout(rt);
      rt = setTimeout(function () {
        var r = host.getBoundingClientRect();
        if (Math.abs(r.width - W) < 2 && Math.abs(r.height - H) < 2) return;   // ignore no-op notifications
        build();
        if (reduceMotion) still();
      }, 150);
    };
    if ("ResizeObserver" in window) new ResizeObserver(onResize).observe(host);
    else window.addEventListener("resize", onResize);
  })();
})();
