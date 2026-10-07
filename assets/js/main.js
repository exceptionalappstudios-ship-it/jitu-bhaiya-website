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
  document.querySelectorAll("form[data-whatsapp]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var number = form.getAttribute("data-whatsapp");
      var lines = [];
      form.querySelectorAll("input, select, textarea").forEach(function (f) {
        if (f.name && f.value) lines.push(f.name + ": " + f.value);
      });
      var text = encodeURIComponent("Hello Jitu Bhaiya,\n\n" + lines.join("\n"));
      window.open("https://wa.me/" + number + "?text=" + text, "_blank", "noopener");
    });
  });

  // Preselect the program from ?program= links
  var programSelect = document.getElementById("f-program");
  var wanted = new URLSearchParams(window.location.search).get("program");
  if (programSelect && wanted) {
    Array.prototype.forEach.call(programSelect.options, function (o) {
      if (o.value === wanted) programSelect.value = wanted;
    });
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
