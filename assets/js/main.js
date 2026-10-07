(function () {
  document.documentElement.classList.remove("no-js");

  // Header state on scroll
  var header = document.querySelector(".site-header");
  function onScroll() {
    if (header) header.classList.toggle("scrolled", window.scrollY > 40);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Mobile menu
  var toggle = document.querySelector(".menu-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var open = document.body.classList.toggle("menu-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.querySelectorAll(".nav a").forEach(function (a) {
      a.addEventListener("click", function () {
        document.body.classList.remove("menu-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Reveal on scroll
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  // Animated counters
  var counters = document.querySelectorAll("[data-count]");
  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var suffix = el.getAttribute("data-suffix") || "";
    var useIndian = el.hasAttribute("data-indian");
    var start = null;
    var dur = 2200;
    function fmt(n) {
      n = Math.round(n);
      return useIndian ? n.toLocaleString("en-IN") : n.toLocaleString("en-US");
    }
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 4);
      el.textContent = fmt(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          animateCount(e.target);
          cio.unobserve(e.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  // Testimonial slider
  var slider = document.querySelector(".t-slider");
  if (slider) {
    var slides = slider.querySelectorAll(".t-slide");
    var dotsWrap = document.querySelector(".t-dots");
    var current = 0;
    var timer;
    slides.forEach(function (_, i) {
      var b = document.createElement("button");
      b.setAttribute("aria-label", "Show testimonial " + (i + 1));
      b.addEventListener("click", function () { go(i); restart(); });
      dotsWrap.appendChild(b);
    });
    var dots = dotsWrap.querySelectorAll("button");
    function go(i) {
      slides[current].classList.remove("active");
      dots[current].classList.remove("active");
      current = i;
      slides[current].classList.add("active");
      dots[current].classList.add("active");
    }
    function restart() {
      clearInterval(timer);
      timer = setInterval(function () { go((current + 1) % slides.length); }, 6500);
    }
    go(0);
    restart();
  }

  // YouTube facades: load the player only when clicked
  document.querySelectorAll(".video[data-yt]").forEach(function (v) {
    function play() {
      var f = document.createElement("iframe");
      f.src = "https://www.youtube-nocookie.com/embed/" + v.getAttribute("data-yt") + "?autoplay=1&rel=0";
      f.allow = "autoplay; encrypted-media; picture-in-picture";
      f.allowFullscreen = true;
      f.title = v.getAttribute("aria-label") || "Video";
      v.innerHTML = "";
      v.appendChild(f);
    }
    v.addEventListener("click", play);
    v.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); play(); }
    });
  });

  // Rotating hero: cross-fades slides, video plays through, captions follow
  var heroSlider = document.querySelector(".hero-slider");
  if (heroSlider) {
    var hSlides = heroSlider.querySelectorAll(".hero-slide");
    var hButtons = heroSlider.querySelectorAll(".hero-nav button");
    var hCaption = heroSlider.querySelector(".hero-caption");
    var hIndex = 0;
    var hTimer;
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    function showSlide(i) {
      hSlides[hIndex].classList.remove("active");
      if (hButtons[hIndex]) hButtons[hIndex].classList.remove("active");
      var oldVideo = hSlides[hIndex].querySelector("video");
      if (oldVideo) oldVideo.pause();
      hIndex = i;
      var slide = hSlides[hIndex];
      slide.classList.add("active");
      var video = slide.querySelector("video");
      var dur = 6500;
      if (video) {
        try { video.currentTime = 0; } catch (e) {}
        var p = video.play();
        if (p && p.catch) p.catch(function () {});
        dur = 8000;
      }
      if (slide.hasAttribute("data-dur")) {
        dur = parseInt(slide.getAttribute("data-dur"), 10) || dur;
      }
      if (hButtons[hIndex]) {
        hButtons[hIndex].style.setProperty("--dur", dur + "ms");
        // restart the progress animation
        void hButtons[hIndex].offsetWidth;
        hButtons[hIndex].classList.add("active");
      }
      if (hCaption) hCaption.innerHTML = "<span>" + slide.getAttribute("data-caption") + "</span>";
      clearTimeout(hTimer);
      if (!reduce) hTimer = setTimeout(function () { showSlide((hIndex + 1) % hSlides.length); }, dur);
    }
    hButtons.forEach(function (b, i) { b.addEventListener("click", function () { showSlide(i); }); });
    var prevBtn = heroSlider.querySelector(".hero-arrow.prev"), nextBtn = heroSlider.querySelector(".hero-arrow.next");
    if (prevBtn) prevBtn.addEventListener("click", function () { showSlide((hIndex - 1 + hSlides.length) % hSlides.length); });
    if (nextBtn) nextBtn.addEventListener("click", function () { showSlide((hIndex + 1) % hSlides.length); });
    // swipe on touch screens
    var touchX = null;
    heroSlider.addEventListener("touchstart", function (e) { touchX = e.touches[0].clientX; }, { passive: true });
    heroSlider.addEventListener("touchend", function (e) {
      if (touchX === null) return;
      var dx = e.changedTouches[0].clientX - touchX; touchX = null;
      if (Math.abs(dx) > 50) showSlide((hIndex + (dx < 0 ? 1 : -1) + hSlides.length) % hSlides.length);
    }, { passive: true });
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) clearTimeout(hTimer); else showSlide(hIndex);
    });
    showSlide(0);
  }

  // Program finder
  var finderBtns = document.querySelectorAll(".finder-tabs button");
  finderBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var f = btn.getAttribute("data-aud");
      finderBtns.forEach(function (b) { b.classList.toggle("active", b === btn); });
      document.querySelectorAll(".finder-grid .pcard").forEach(function (card) {
        var show = f === "all" || (" " + card.getAttribute("data-aud") + " ").indexOf(" " + f + " ") > -1;
        card.classList.toggle("hidden", !show);
        if (show) card.classList.add("in");
      });
    });
  });

  // Lightbox for galleries
  var lbLinks = Array.prototype.slice.call(document.querySelectorAll("[data-lightbox]"));
  if (lbLinks.length) {
    var lb = document.createElement("div");
    lb.className = "lightbox";
    lb.innerHTML = '<img alt=""><button class="lb-close" aria-label="Close">✕</button><button class="lb-prev" aria-label="Previous">←</button><button class="lb-next" aria-label="Next">→</button><div class="lb-cap"></div>';
    document.body.appendChild(lb);
    var lbImg = lb.querySelector("img"), lbCap = lb.querySelector(".lb-cap"), lbI = 0;
    function lbShow(i) {
      lbI = (i + lbLinks.length) % lbLinks.length;
      lbImg.src = lbLinks[lbI].getAttribute("href");
      lbImg.alt = lbLinks[lbI].querySelector("img") ? lbLinks[lbI].querySelector("img").alt : "";
      lbCap.textContent = (lbI + 1) + " / " + lbLinks.length;
    }
    lbLinks.forEach(function (a, i) {
      a.addEventListener("click", function (e) { e.preventDefault(); lbShow(i); lb.classList.add("open"); });
    });
    lb.querySelector(".lb-close").addEventListener("click", function () { lb.classList.remove("open"); });
    lb.querySelector(".lb-prev").addEventListener("click", function () { lbShow(lbI - 1); });
    lb.querySelector(".lb-next").addEventListener("click", function () { lbShow(lbI + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) lb.classList.remove("open"); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") lb.classList.remove("open");
      if (e.key === "ArrowLeft") lbShow(lbI - 1);
      if (e.key === "ArrowRight") lbShow(lbI + 1);
    });
  }

  // Scroll progress line
  var bar = document.createElement("div");
  bar.className = "scroll-progress";
  document.body.appendChild(bar);
  window.addEventListener("scroll", function () {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = "scaleX(" + (h > 0 ? window.scrollY / h : 0) + ")";
  }, { passive: true });

  // Blog filters
  var filterBtns = document.querySelectorAll(".filters button");
  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var f = btn.getAttribute("data-filter");
      filterBtns.forEach(function (b) { b.classList.toggle("active", b === btn); });
      document.querySelectorAll(".blog-grid .post-card").forEach(function (card) {
        var show = f === "all" || card.getAttribute("data-cat") === f;
        card.style.display = show ? "" : "none";
      });
    });
  });

  // Forms: open WhatsApp with the message pre-filled (no backend needed)
  // Forms: a real link to WhatsApp, kept up to date with the form's contents.
  // (A real link opens reliably everywhere; script-opened windows can be blocked.)
  document.querySelectorAll("form[data-whatsapp]").forEach(function (form) {
    var number = form.getAttribute("data-whatsapp");
    var link = form.querySelector(".wa-send");
    function buildHref() {
      var lines = [];
      form.querySelectorAll("input, select, textarea").forEach(function (f) {
        if (f.name && f.value && !f.closest("[hidden]")) lines.push(f.name + ": " + f.value);
      });
      return "https://wa.me/" + number + "?text=" + encodeURIComponent("Hello Jitu Bhaiya,\n\n" + lines.join("\n"));
    }
    function refresh() { if (link) link.href = buildHref(); }
    form.addEventListener("input", refresh);
    form.addEventListener("change", refresh);
    if (link) {
      link.addEventListener("click", function (e) {
        refresh();
        if (!form.checkValidity()) { e.preventDefault(); form.reportValidity(); }
      });
    }
    // Pressing Enter in a field behaves like clicking the link
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (link && form.reportValidity()) link.click();
    });
    refresh();
  });

  // Preselect the program from ?program= links
  var programSelect = document.getElementById("f-program");
  var wanted = new URLSearchParams(window.location.search).get("program");
  if (programSelect && wanted) {
    Array.prototype.forEach.call(programSelect.options, function (o) {
      if (o.value === wanted) programSelect.value = wanted;
    });
  }

  // Contact form: show date/time fields only for personal appointments
  if (programSelect) {
    var apptFields = document.querySelectorAll(".appt-field");
    var syncAppt = function () {
      var isAppt = /appointment/i.test(programSelect.value);
      apptFields.forEach(function (f) {
        f.hidden = !isAppt;
        if (!isAppt) f.querySelectorAll("input, select").forEach(function (el) { el.value = ""; });
      });
    };
    programSelect.addEventListener("change", syncAppt);
    syncAppt();
  }

  // Newsletter (placeholder until connected to an email provider)
  document.querySelectorAll(".newsletter").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var btn = form.querySelector(".btn");
      btn.textContent = "Thank you ✦";
      form.querySelector("input").value = "";
    });
  });

  // Year
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
