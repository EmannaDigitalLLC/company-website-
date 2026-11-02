(function(){
  "use strict";

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
