(function(){
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.getElementById("year").textContent = new Date().getFullYear();

  var hasGSAP = typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined";
  if (hasGSAP) gsap.registerPlugin(ScrollTrigger);

  /* -----------------------------------------------------------------
     Sticky nav: shrink + backdrop after scroll
  ----------------------------------------------------------------- */
  var nav = document.getElementById("siteNav");
  var progressFill = document.getElementById("progressFill");

  function onScroll(){
    var y = window.scrollY;
    nav.classList.toggle("scrolled", y > 40);

    var doc = document.documentElement;
    var max = doc.scrollHeight - doc.clientHeight;
    var pct = max > 0 ? (y / max) * 100 : 0;
    progressFill.style.width = pct + "%";
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* -----------------------------------------------------------------
     Mobile nav toggle
  ----------------------------------------------------------------- */
  var navToggle = document.getElementById("navToggle");
  var navMobile = document.getElementById("navMobile");
  navToggle.addEventListener("click", function(){
    var open = navMobile.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    navToggle.classList.toggle("open", open);
  });
  navMobile.querySelectorAll("a").forEach(function(a){
    a.addEventListener("click", function(){
      navMobile.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });

  /* -----------------------------------------------------------------
     Cursor glow (desktop only, respects reduced motion)
  ----------------------------------------------------------------- */
  var glow = document.querySelector(".cursor-glow");
  if (!reduceMotion && window.matchMedia("(hover: hover) and (pointer: fine)").matches){
    window.addEventListener("mousemove", function(e){
      glow.classList.add("active");
      if (hasGSAP){
        gsap.to(glow, { x: e.clientX, y: e.clientY, duration: 0.5, ease: "power3.out" });
      } else {
        glow.style.transform = "translate(" + e.clientX + "px," + e.clientY + "px) translate(-50%,-50%)";
      }
    }, { passive: true });
  }

  /* -----------------------------------------------------------------
     Scroll reveals
  ----------------------------------------------------------------- */
  var revealEls = document.querySelectorAll(".reveal-up:not(.hero .reveal-up), .reveal-word:not(.hero-title .reveal-word)");

  if (hasGSAP && !reduceMotion){
    // Hero word stagger on load
    var heroWords = document.querySelectorAll(".hero-title .reveal-word");
    heroWords.forEach(function(w, i){
      gsap.to(w, { opacity: 1, y: 0, duration: 0.9, delay: 0.15 + i * 0.12, ease: "expo.out" });
    });
    var heroExtras = document.querySelectorAll(".hero .reveal-up");
    if (heroExtras.length){
      gsap.to(heroExtras, { opacity: 1, y: 0, duration: 0.8, delay: 0.55, stagger: 0.1, ease: "power2.out" });
    }

    revealEls.forEach(function(el){
      ScrollTrigger.create({
        trigger: el,
        start: "top 88%",
        onEnter: function(){ el.classList.add("in"); },
        once: true
      });
    });

    // Hero parallax shapes (only present on pages with a hero)
    if (document.getElementById("hero")){
      gsap.utils.toArray(".shape").forEach(function(shape, i){
        var depth = (i + 1) * 10;
        gsap.to(shape, {
          yPercent: depth,
          rotate: i % 2 === 0 ? 12 : -10,
          ease: "none",
          scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: 0.6 }
        });
      });
      gsap.to(".shape-1", { y: -16, duration: 4, ease: "sine.inOut", yoyo: true, repeat: -1 });
      gsap.to(".shape-3", { y: 12, duration: 3.2, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 0.4 });
      gsap.to(".shape-5", { y: -14, x: 8, duration: 5, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 0.2 });
      gsap.to(".shape-6", { y: 10, duration: 3.6, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 0.6 });
      gsap.to(".shape-7", { y: -12, x: -6, duration: 4.4, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 0.3 });
    }

    // Process line fill scrub
    var fill = document.getElementById("processFill");
    if (fill && window.innerWidth > 960){
      gsap.to(fill, {
        width: "100%", ease: "none",
        scrollTrigger: { trigger: ".process-track", start: "top 70%", end: "bottom 70%", scrub: 0.6 }
      });
    }

    // Services / pricing / process cards stagger by section
    [".pricing-grid"].forEach(function(sel){
      var container = document.querySelector(sel);
      if (!container) return;
      var cards = container.children;
      gsap.set(cards, { opacity: 0, y: 30 });
      ScrollTrigger.create({
        trigger: container,
        start: "top 85%",
        once: true,
        onEnter: function(){
          gsap.to(cards, { opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: "power2.out" });
        }
      });
    });

    var processTrack = document.querySelector(".process-track");
    if (processTrack){
      var steps = document.querySelectorAll(".process-step");
      gsap.set(steps, { opacity: 0, y: 24 });
      ScrollTrigger.create({
        trigger: processTrack,
        start: "top 85%",
        once: true,
        onEnter: function(){
          gsap.to(steps, { opacity: 1, y: 0, duration: 0.7, stagger: 0.15, ease: "power2.out" });
        }
      });
    }

  } else {
    // Fallback covers: no GSAP, OR reduced-motion (still needs content revealed, just not animated)
    var allReveal = document.querySelectorAll(".reveal-up, .reveal-word");
    if (reduceMotion){
      // Show everything immediately; CSS forces transitions to ~0 duration already.
      allReveal.forEach(function(el){ el.classList.add("in"); });
      var fillEl = document.getElementById("processFill");
      if (fillEl) fillEl.style.width = "100%";
    } else if ("IntersectionObserver" in window){
      var io = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if (entry.isIntersecting){ entry.target.classList.add("in"); io.unobserve(entry.target); }
        });
      }, { threshold: 0.15 });
      allReveal.forEach(function(el){ io.observe(el); });
    } else {
      allReveal.forEach(function(el){ el.classList.add("in"); });
    }
  }

  /* -----------------------------------------------------------------
     Safety net: guarantee content never gets stuck invisible.
     GSAP's entrance tweens rely on requestAnimationFrame, which browsers
     pause for hidden/backgrounded tabs (e.g. a page opened in a background
     tab, or previewed inside an iframe by a host's dashboard). If that
     happens the tween never advances and content stays at opacity 0
     forever. Force it visible if it's still stuck after a couple seconds,
     and re-check whenever the tab actually becomes visible.
  ----------------------------------------------------------------- */
  function forceRevealStuck(){
    document.querySelectorAll(".reveal-up, .reveal-word").forEach(function(el){
      if (parseFloat(getComputedStyle(el).opacity) < 1){
        el.classList.add("in");
        el.style.opacity = "1";
        el.style.transform = "none";
      }
    });
  }
  function forceCountersStuck(){
    document.querySelectorAll(".stat-num").forEach(function(el){
      if (!el.getAttribute("data-done")){
        var target = parseFloat(el.getAttribute("data-count"));
        var prefix = el.getAttribute("data-prefix") || "";
        var suffix = el.getAttribute("data-suffix") || "";
        el.textContent = prefix + target + suffix;
      }
    });
  }
  setTimeout(function(){ forceRevealStuck(); forceCountersStuck(); }, 2000);
  document.addEventListener("visibilitychange", function(){
    if (!document.hidden){
      if (hasGSAP) ScrollTrigger.refresh();
      forceRevealStuck();
    }
  });

  /* -----------------------------------------------------------------
     Stat counters
  ----------------------------------------------------------------- */
  var counters = document.querySelectorAll(".stat-num");
  function animateCounter(el){
    var target = parseFloat(el.getAttribute("data-count"));
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduceMotion || !hasGSAP){
      el.textContent = prefix + target + suffix;
      el.setAttribute("data-done", "1");
      return;
    }
    var obj = { val: 0 };
    gsap.to(obj, {
      val: target, duration: 1.4, ease: "power2.out",
      onUpdate: function(){ el.textContent = prefix + Math.round(obj.val) + suffix; },
      onComplete: function(){ el.setAttribute("data-done", "1"); }
    });
  }
  if ("IntersectionObserver" in window){
    var counterIO = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting){ animateCounter(entry.target); counterIO.unobserve(entry.target); }
      });
    }, { threshold: 0.4 });
    counters.forEach(function(c){ counterIO.observe(c); });
  } else {
    counters.forEach(animateCounter);
  }

  /* -----------------------------------------------------------------
     FAQ accordion
  ----------------------------------------------------------------- */
  document.querySelectorAll(".faq-item").forEach(function(item){
    var btn = item.querySelector(".faq-q");
    btn.addEventListener("click", function(){
      var isOpen = item.classList.contains("open");
      document.querySelectorAll(".faq-item.open").forEach(function(other){
        if (other !== item){
          other.classList.remove("open");
          other.querySelector(".faq-q").setAttribute("aria-expanded", "false");
        }
      });
      item.classList.toggle("open", !isOpen);
      btn.setAttribute("aria-expanded", (!isOpen).toString());
    });
  });

})();
