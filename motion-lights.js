// Entrada del hero animada con Motion (https://motion.dev), solo en index-motion.html.
// script.js mide el nombre y fija los ángulos finales (--a-l / --a-r); aquí se anima
// el barrido de cada haz con un resorte, se encienden los botones y aparece el texto.
import { animate, motionValue, stagger } from "https://cdn.jsdelivr.net/npm/motion@13.5.1/+esm";

window.__motionReady = true;

var root = document.documentElement;
var hero = document.querySelector(".hero");
var lights = document.querySelector(".stage-lights");
var beams = document.querySelectorAll(".beam");
var buttons = document.querySelectorAll(".botonadura li");
var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (root.getAttribute("data-anim") === "motion" && hero && lights && !reduceMotion) {
  // Cada haz arranca 40° hacia afuera y llega a su ángulo final con un resorte.
  var sweepL = motionValue(40);
  var sweepR = motionValue(-40);
  var aim = motionValue(0);
  sweepL.on("change", function (v) { lights.style.setProperty("--sweep-l", v + "deg"); });
  sweepR.on("change", function (v) { lights.style.setProperty("--sweep-r", v + "deg"); });
  aim.on("change", function (v) { lights.style.setProperty("--aim", v + "deg"); });

  // Estado inicial antes de que se pinte la tarima encendida
  lights.style.setProperty("--sweep-l", "40deg");
  lights.style.setProperty("--sweep-r", "-40deg");
  for (var i = 0; i < beams.length; i++) beams[i].style.opacity = "0";

  var started = false;
  var start = function () {
    if (started) return;
    started = true;

    animate(beams, { opacity: [0, 1] }, { duration: 0.4, delay: stagger(0.2, { startDelay: 0.1 }) });
    animate(sweepL, 0, { type: "spring", visualDuration: 1.1, bounce: 0.35, delay: 0.1 });
    animate(sweepR, 0, { type: "spring", visualDuration: 1.1, bounce: 0.35, delay: 0.3 })
      .then(function () { hero.classList.add("lights-done"); });

    // La botonadura se enciende botón por botón, con un pequeño rebote
    animate(buttons, { scale: [0.4, 1] }, {
      type: "spring", visualDuration: 0.45, bounce: 0.55,
      delay: stagger(0.08, { startDelay: 1.35 })
    });
    animate(buttons, {
      opacity: [0.15, 1],
      boxShadow: ["0 0 0px rgba(230,203,134,0)", "0 0 10px rgba(230,203,134,.45)"]
    }, { duration: 0.35, delay: stagger(0.08, { startDelay: 1.35 }) });

    animate(document.querySelectorAll(".hero-lead, .hero-ctas"), { opacity: [0, 1], y: [12, 0] }, {
      type: "spring", visualDuration: 0.6, bounce: 0,
      delay: stagger(0.15, { startDelay: 1.75 })
    });
  };

  // Arranca cuando el hero recibe .lights-on (de script.js o del respaldo del <head>)
  if (hero.classList.contains("lights-on")) start();
  else {
    var watch = new MutationObserver(function () {
      if (hero.classList.contains("lights-on")) { watch.disconnect(); start(); }
    });
    watch.observe(hero, { attributes: true, attributeFilter: ["class"] });
  }

  // En escritorio, los reflectores siguen al cursor con un resorte suave
  if (window.matchMedia("(pointer: fine)").matches) {
    hero.addEventListener("pointermove", function (e) {
      if (!hero.classList.contains("lights-done")) return;
      var rect = hero.getBoundingClientRect();
      var target = -((e.clientX - rect.left) / rect.width - 0.5) * 7;
      animate(aim, target, { type: "spring", stiffness: 70, damping: 16 });
    });
    hero.addEventListener("pointerleave", function () {
      animate(aim, 0, { type: "spring", stiffness: 70, damping: 16 });
    });
  }
}
