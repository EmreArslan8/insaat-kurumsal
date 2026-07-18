/* [Firma Adı] İnşaat — vanilla JS interactions */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.addEventListener("DOMContentLoaded", function () {
    /* --- highlight current nav link (header markup is identical per page) --- */
    var here = location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".main-nav ul a").forEach(function (a) {
      var href = a.getAttribute("href");
      if (href === here || (here === "index.html" && href === "index.html")) {
        a.classList.add("active");
      }
    });

    /* --- mobile menu toggle --- */
    var toggle = document.getElementById("navToggle");
    var nav = document.getElementById("mainNav");
    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        var open = nav.classList.toggle("open");
        toggle.classList.toggle("open", open);
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
      nav.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", function () {
          nav.classList.remove("open");
          toggle.classList.remove("open");
          toggle.setAttribute("aria-expanded", "false");
        });
      });
    }

    /* --- transparent header: turns solid navy after scroll --- */
    var header = document.getElementById("siteHeader");
    if (header) {
      var onHeaderScroll = function () {
        header.classList.toggle("scrolled", window.scrollY > 40);
      };
      onHeaderScroll();
      window.addEventListener("scroll", onHeaderScroll, { passive: true });
    }

    /* --- FAQ accordion --- */
    document.querySelectorAll(".faq-item").forEach(function (item) {
      var q = item.querySelector(".faq-q");
      var a = item.querySelector(".faq-a");
      if (!q || !a) return;
      var setOpen = function (open) {
        item.classList.toggle("open", open);
        q.setAttribute("aria-expanded", open ? "true" : "false");
        a.style.maxHeight = open ? a.scrollHeight + "px" : "0px";
      };
      setOpen(item.classList.contains("open"));
      q.addEventListener("click", function () {
        setOpen(!item.classList.contains("open"));
      });
    });

    /* --- project filter tabs --- */
    var tabs = document.querySelectorAll(".filter-tabs .tab");
    var cards = document.querySelectorAll(".proj-grid [data-cat]");
    if (tabs.length && cards.length) {
      tabs.forEach(function (tab) {
        tab.addEventListener("click", function () {
          tabs.forEach(function (t) { t.classList.remove("active"); });
          tab.classList.add("active");
          var filter = tab.getAttribute("data-filter");
          cards.forEach(function (card) {
            var cats = (card.getAttribute("data-cat") || "").split(" ");
            var show = filter === "all" || cats.indexOf(filter) !== -1;
            card.style.display = show ? "" : "none";
          });
        });
      });
    }

    /* --- counter animation (stats) --- */
    function runCounter(el) {
      if (el.dataset.done) return;
      el.dataset.done = "1";
      var target = parseFloat(el.getAttribute("data-target"));
      var prefix = el.getAttribute("data-prefix") || "";
      var suffix = el.getAttribute("data-suffix") || "";
      if (reduceMotion) { el.textContent = prefix + target + suffix; return; }
      var dur = 1400, start = null;
      function step(ts) {
        if (start === null) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = prefix + Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = prefix + target + suffix;
      }
      requestAnimationFrame(step);
    }

    /* --- scroll reveal (reveal + stagger + img) + counters on view --- */
    var revealEls = document.querySelectorAll(".reveal, .stagger, .img-reveal");
    if (reduceMotion) {
      revealEls.forEach(function (el) { el.classList.add("visible"); });
      document.querySelectorAll(".num[data-target]").forEach(runCounter);
    } else if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          e.target.classList.add("visible");
          if (e.target.querySelectorAll) {
            e.target.querySelectorAll(".num[data-target]").forEach(runCounter);
          }
          io.unobserve(e.target);
        });
      }, { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });
      revealEls.forEach(function (el) { io.observe(el); });
    } else {
      revealEls.forEach(function (el) { el.classList.add("visible"); });
      document.querySelectorAll(".num[data-target]").forEach(runCounter);
    }

    /* --- hero / banner parallax (scroll-linked, rAF, transform only) --- */
    var parallaxHosts = document.querySelectorAll("[data-parallax], .pb-bg");
    if (!reduceMotion && parallaxHosts.length) {
      var ticking = false;
      var applyParallax = function () {
        parallaxHosts.forEach(function (host) {
          var img = host.querySelector("img");
          if (!img) return;
          var rate = parseFloat(host.getAttribute("data-parallax")) || 0.18;
          var rect = host.getBoundingClientRect();
          if (rect.bottom < 0 || rect.top > window.innerHeight) return;
          var offset = (rect.top) * -rate;
          img.style.transform = "translate3d(0," + offset + "px,0)";
        });
        ticking = false;
      };
      window.addEventListener("scroll", function () {
        if (!ticking) { requestAnimationFrame(applyParallax); ticking = true; }
      }, { passive: true });
      applyParallax();
    }

    /* --- rotating testimonial --- */
    var rot = document.getElementById("rotQuote");
    var dotsWrap = document.getElementById("rotDots");
    if (rot && dotsWrap) {
      var slides = rot.querySelectorAll(".rot-slide");
      var dots = dotsWrap.querySelectorAll("button");
      var idx = 0, timer = null;
      var show = function (n) {
        idx = (n + slides.length) % slides.length;
        slides.forEach(function (s, i) { s.classList.toggle("active", i === idx); });
        dots.forEach(function (d, i) { d.classList.toggle("active", i === idx); });
      };
      var stop = function () { if (timer) { clearInterval(timer); timer = null; } };
      var start = function () {
        if (reduceMotion) return;
        stop();
        timer = setInterval(function () { show(idx + 1); }, 6000);
      };
      dots.forEach(function (d, i) {
        d.addEventListener("click", function () { show(i); start(); });
      });
      show(0);
      start();
    }

    /* --- contact & newsletter forms: demo only --- */
    document.querySelectorAll("form[data-demo]").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var note = form.querySelector(".form-feedback");
        if (note) {
          note.textContent = "Teşekkürler! Bu bir demo formudur, mesajınız gönderilmedi.";
          note.style.display = "block";
        }
        form.reset();
      });
    });
  });
})();
