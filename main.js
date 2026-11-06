(function(){
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.getElementById("year").textContent = new Date().getFullYear();

  var hasGSAP = typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined";
  if (hasGSAP) gsap.registerPlugin(ScrollTrigger);

  /* -----------------------------------------------------------------
     Hero fluid glow (desktop only, respects reduced motion)
     Cursor-reactive WebGL dye simulation, tuned to the brand's
     maroon/orange/amber embers instead of the library's default rainbow.
  ----------------------------------------------------------------- */
  var fluidCanvas = document.getElementById("heroFluid");
  if (fluidCanvas && typeof WebGLFluid !== "undefined" && !reduceMotion && window.matchMedia("(hover: hover) and (pointer: fine)").matches){
    try {
      WebGLFluid(fluidCanvas, {
        TRIGGER: "hover",
        IMMEDIATE: true,
        COLORFUL: false,
        SPLAT_COLOR: { r: 1.5, g: 0.55, b: 0.12 },
        SPLAT_COUNT: 6,
        SPLAT_RADIUS: 0.22,
        SPLAT_FORCE: 5000,
        DENSITY_DISSIPATION: 2.2,
        VELOCITY_DISSIPATION: 1.4,
        CURL: 20,
        SIM_RESOLUTION: 128,
        DYE_RESOLUTION: 768,
        TRANSPARENT: true,
        BLOOM: true,
        BLOOM_INTENSITY: 0.7,
        SUNRAYS: false
      });
    } catch (err){
      fluidCanvas.style.display = "none";
    }
  } else if (fluidCanvas){
    fluidCanvas.style.display = "none";
  }

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
  if (navToggle && navMobile){
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
  }

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

  /* -----------------------------------------------------------------
     Ad attribution: remember which ad/campaign brought the visitor here
     (first touch wins), so every lead carries its source.
  ----------------------------------------------------------------- */
  var ATTR_KEYS = ["utm_source","utm_medium","utm_campaign","utm_content","utm_term","fbclid"];
  function captureAttribution(){
    var saved = {};
    try { saved = JSON.parse(localStorage.getItem("emannaAttr") || "{}") || {}; } catch (e) { saved = {}; }
    var params = new URLSearchParams(window.location.search);
    var found = false, fresh = {};
    ATTR_KEYS.forEach(function(k){ var v = params.get(k); if (v){ fresh[k] = v; found = true; } });
    if (found && !saved.utm_source && !saved.fbclid){
      saved = fresh;
      saved.landing_page = window.location.pathname;
      saved.first_seen = new Date().toISOString();
      try { localStorage.setItem("emannaAttr", JSON.stringify(saved)); } catch (e) {}
    }
    return saved;
  }
  var attribution = captureAttribution();

  /* -----------------------------------------------------------------
     Contact form (Web3Forms)
  ----------------------------------------------------------------- */
  var contactForm = document.getElementById("contactForm");
  if (contactForm){
    var contactStatus = document.getElementById("contactFormStatus");
    var contactSubmit = contactForm.querySelector(".contact-submit");
    var contactSubmitLabel = contactSubmit.querySelector(".btn-label");
    var contactSubmitDefault = contactSubmitLabel.textContent;

    contactForm.addEventListener("submit", function(e){
      e.preventDefault();

      // Honeypot: if this hidden field got filled in, silently drop it.
      if (contactForm.botcheck && contactForm.botcheck.checked) return;

      var formData = new FormData(contactForm);
      var payload = Object.fromEntries(formData);

      // Add where the lead came from (ad/campaign, page, time).
      ATTR_KEYS.forEach(function(k){ if (attribution[k]) payload[k] = attribution[k]; });
      payload.page_url = window.location.origin + window.location.pathname;
      payload.referrer = document.referrer || "";
      payload.submitted_at = new Date().toISOString();
      if (!payload.source) payload.source = "website-contact-form";

      // Send a copy to the automation (Make) if a webhook URL has been set.
      // Form-encoded + no-cors so the browser never blocks it; failures are ignored
      // because the email below still delivers the lead.
      var hook = window.EMANNA_LEAD_WEBHOOK;
      if (typeof hook === "string" && /^https:\/\/hook\.[a-z0-9.-]*make\.com\//i.test(hook)){
        var hookData = new URLSearchParams();
        Object.keys(payload).forEach(function(k){ if (k !== "access_key" && k !== "botcheck") hookData.append(k, payload[k]); });
        try { fetch(hook, { method: "POST", mode: "no-cors", keepalive: true, body: hookData }).catch(function(){}); } catch (err) {}
      }

      contactSubmit.setAttribute("disabled", "true");
      contactSubmitLabel.textContent = "Sending...";
      contactStatus.textContent = "";
      contactStatus.className = "contact-form-status";

      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(payload)
      })
        .then(function(response){ return response.json().then(function(data){ return { ok: response.ok, data: data }; }); })
        .then(function(result){
          if (result.ok && result.data.success){
            contactStatus.classList.add("is-success");
            contactStatus.textContent = "Thanks — your message is in! I'll get back to you within one business day.";
            contactForm.reset();
            try { if (typeof window.fbq === "function") window.fbq("track", "Lead"); } catch (err) {}
            contactForm.dispatchEvent(new Event("contact:success"));
          } else {
            contactStatus.classList.add("is-error");
            contactStatus.textContent = (result.data && result.data.message) || "Something went wrong. Please try again, or call/email directly.";
          }
        })
        .catch(function(){
          contactStatus.classList.add("is-error");
          contactStatus.textContent = "Network error — please try again, or reach out by phone/email directly.";
        })
        .finally(function(){
          contactSubmit.removeAttribute("disabled");
          contactSubmitLabel.textContent = contactSubmitDefault;
        });
    });
  }

  /* Reviews marquee: repeat the cards once so the loop is seamless. */
  document.querySelectorAll("[data-review-marquee]").forEach(function(box){
    var track = box.querySelector(".review-track");
    if (!track || box.classList.contains("is-ready")) return;
    Array.prototype.slice.call(track.children).forEach(function(card){
      var copy = card.cloneNode(true);
      copy.setAttribute("aria-hidden", "true");
      copy.querySelectorAll("a").forEach(function(a){ a.setAttribute("tabindex", "-1"); });
      track.appendChild(copy);
    });
    box.classList.add("is-ready");
  });

  /* Client video testimonial: tap to play with sound, pause when scrolled away. */
  document.querySelectorAll("[data-vt]").forEach(function(box){
    var video = box.querySelector("video");
    var play = box.querySelector(".vt-play");
    if (!video || !play) return;
    play.addEventListener("click", function(){
      video.controls = true;
      box.classList.add("is-playing");
      var p = video.play();
      if (p && p.catch) p.catch(function(){ box.classList.remove("is-playing"); video.controls = false; });
    });
    video.addEventListener("ended", function(){
      video.currentTime = 0; video.controls = false; box.classList.remove("is-playing");
    });
    if ("IntersectionObserver" in window){
      new IntersectionObserver(function(entries){
        entries.forEach(function(e){ if (!e.isIntersecting && !video.paused) video.pause(); });
      }, { threshold: 0.25 }).observe(box);
    }
  });

})();
