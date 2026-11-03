(function(){
  "use strict";

  /* -----------------------------------------------------------------
     Weekly offer countdown. Counts down to Sunday 11:59 PM Pacific time,
     then rolls straight into the next week.
  ----------------------------------------------------------------- */
  function msUntilWeeklyDeadline(){
    var now = new Date();
    var pt = new Date(now.toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
    var end = new Date(pt.getTime());
    end.setDate(pt.getDate() + ((7 - pt.getDay()) % 7));
    end.setHours(23, 59, 59, 999);
    if (end.getTime() <= pt.getTime()) end.setDate(end.getDate() + 7);
    return end.getTime() - pt.getTime();
  }
  function pad(n){ return (n < 10 ? "0" : "") + n; }
  var countdowns = document.querySelectorAll("[data-lp-countdown]");
  function tick(){
    var ms = msUntilWeeklyDeadline();
    var d = Math.floor(ms / 86400000);
    var h = Math.floor(ms % 86400000 / 3600000);
    var m = Math.floor(ms % 3600000 / 60000);
    var s = Math.floor(ms % 60000 / 1000);
    countdowns.forEach(function(box){
      box.querySelector('[data-cd="d"]').textContent = pad(d);
      box.querySelector('[data-cd="h"]').textContent = pad(h);
      box.querySelector('[data-cd="m"]').textContent = pad(m);
      box.querySelector('[data-cd="s"]').textContent = pad(s);
    });
  }
  if (countdowns.length){ tick(); setInterval(tick, 1000); }

  /* Dismissible sale bar (stays dismissed for the rest of the visit). */
  var saleClose = document.getElementById("saleBarClose");
  try { if (sessionStorage.getItem("lpSaleBarOff") === "1") document.body.classList.add("lp-bar-off"); } catch (e) {}
  if (saleClose){
    saleClose.addEventListener("click", function(){
      document.body.classList.add("lp-bar-off");
      try { sessionStorage.setItem("lpSaleBarOff", "1"); } catch (e) {}
    });
  }

  /* -----------------------------------------------------------------
     Sample-site marquee: repeat each row's tiles until the group is wider
     than the screen, then duplicate the group so the -50% loop is seamless.
  ----------------------------------------------------------------- */
  document.querySelectorAll(".lp-marquee-track").forEach(function(track){
    var group = track.querySelector(".lp-marquee-group");
    if (!group) return;
    var originals = Array.prototype.slice.call(group.children);
    var tileW = originals[0].getBoundingClientRect().width + 18;
    var needed = Math.ceil((Math.max(window.innerWidth, window.screen.width) * 1.15) / tileW);
    var i = 0;
    while (group.children.length < needed){
      group.appendChild(originals[i % originals.length].cloneNode(true));
      i++;
    }
    var copy = group.cloneNode(true);
    copy.setAttribute("aria-hidden", "true");
    copy.querySelectorAll("a").forEach(function(a){ a.setAttribute("tabindex", "-1"); });
    track.appendChild(copy);
  });

  /* -----------------------------------------------------------------
     One-question-at-a-time form
  ----------------------------------------------------------------- */
  var form = document.getElementById("contactForm");
  if (!form || !form.classList.contains("lp-stepper")) return;

  var steps = Array.prototype.slice.call(form.querySelectorAll(".lp-step"));
  var backBtn = form.querySelector(".lp-back");
  var nextBtn = form.querySelector(".lp-next");
  var submitBtn = form.querySelector(".contact-submit");
  var countEl = document.getElementById("lpStepCount");
  var fillEl = document.getElementById("lpProgressFill");
  var current = 0;

  function show(index, focus){
    current = index;
    steps.forEach(function(step, i){
      var active = i === index;
      step.hidden = !active;
      step.classList.toggle("is-active", active);
    });
    var last = index === steps.length - 1;
    backBtn.hidden = index === 0;
    nextBtn.hidden = last;
    submitBtn.hidden = !last;
    countEl.textContent = "Question " + (index + 1) + " of " + steps.length;
    fillEl.style.width = ((index + 1) / steps.length * 100) + "%";
    if (focus){
      var field = steps[index].querySelector("input, textarea");
      if (field) field.focus({ preventScroll: true });
    }
  }

  function currentValid(){
    var fields = steps[current].querySelectorAll("input, textarea, select");
    for (var i = 0; i < fields.length; i++){
      if (!fields[i].checkValidity()){ fields[i].reportValidity(); return false; }
    }
    return true;
  }

  // Business type: tapping a popular choice moves on; "Other" reveals a text box.
  var otherWrap = form.querySelector(".lp-other");
  var otherInput = document.getElementById("cf-biz-other");
  form.querySelectorAll('input[name="business_type"]').forEach(function(radio){
    radio.addEventListener("change", function(){
      var isOther = radio.value === "Other";
      otherWrap.hidden = !isOther;
      otherInput.required = isOther;
      if (isOther){ otherInput.focus({ preventScroll: true }); }
      else { otherInput.value = ""; setTimeout(function(){ nextBtn.click(); }, 220); }
    });
  });

  nextBtn.addEventListener("click", function(){
    if (currentValid() && current < steps.length - 1) show(current + 1, true);
  });
  backBtn.addEventListener("click", function(){
    if (current > 0) show(current - 1, true);
  });

  // Enter moves to the next question instead of submitting early.
  form.addEventListener("keydown", function(e){
    if (e.key !== "Enter") return;
    var t = e.target;
    if (t.tagName === "TEXTAREA" || t.type === "checkbox" || t.type === "submit" || t.type === "button") return;
    if (current < steps.length - 1){
      e.preventDefault();
      nextBtn.click();
    }
  });

  form.addEventListener("contact:success", function(){
    form.classList.add("is-done");
    fillEl.style.width = "100%";
    var done = form.querySelector(".lp-done");
    if (done) done.hidden = false;
  });

  show(0, false);
})();
