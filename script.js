(function () {
  var WHATSAPP = "584243165711";
  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  root.classList.add("js");

  // Año en el pie
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  // ---------- Menú móvil ----------
  var header = document.querySelector(".site-header");
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("menu");
  var label = toggle.querySelector(".sr-only");

  function setMenu(open) {
    toggle.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
    document.body.classList.toggle("menu-open", open);
    label.textContent = open ? "Cerrar menú" : "Abrir menú";
  }
  toggle.addEventListener("click", function () {
    setMenu(toggle.getAttribute("aria-expanded") !== "true");
  });
  nav.addEventListener("click", function (e) {
    if (e.target.closest("a")) setMenu(false);
  });
  document.addEventListener("click", function (e) {
    if (nav.classList.contains("is-open") && !header.contains(e.target)) setMenu(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && nav.classList.contains("is-open")) {
      setMenu(false);
      toggle.focus();
    }
  });

  // ---------- Encabezado sólido al bajar ----------
  var hero = document.querySelector(".hero");
  function onScroll() {
    header.classList.toggle("is-scrolled", window.scrollY > 24);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // ---------- Sección activa en el menú ----------
  if ("IntersectionObserver" in window) {
    var links = {};
    nav.querySelectorAll('a[href^="#"]:not(.btn)').forEach(function (a) {
      links[a.getAttribute("href").slice(1)] = a;
    });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = links[entry.target.id];
        if (!link) return;
        if (entry.isIntersecting) {
          Object.keys(links).forEach(function (k) { links[k].removeAttribute("aria-current"); });
          link.setAttribute("aria-current", "true");
        } else if (link.getAttribute("aria-current")) {
          link.removeAttribute("aria-current");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(links).forEach(function (id) {
      var section = document.getElementById(id);
      if (section) spy.observe(section);
    });
  }

  // ---------- Botón fijo de reserva (móvil) ----------
  var sticky = document.getElementById("sticky-cta");
  var reserva = document.getElementById("reserva");
  var footer = document.querySelector(".site-footer");
  if (sticky && "IntersectionObserver" in window) {
    var state = { hero: true, reserva: false, footer: false };
    var updateSticky = function () {
      var show = !state.hero && !state.reserva && !state.footer;
      sticky.classList.toggle("is-visible", show);
      sticky.setAttribute("aria-hidden", String(!show));
      sticky.tabIndex = show ? 0 : -1;
    };
    var stickyObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.target === hero) state.hero = entry.isIntersecting;
        if (entry.target === reserva) state.reserva = entry.isIntersecting;
        if (entry.target === footer) state.footer = entry.isIntersecting;
      });
      updateSticky();
    }, { threshold: 0.05 });
    [hero, reserva, footer].forEach(function (el) { if (el) stickyObs.observe(el); });
  }

  // ---------- Luz del hero que sigue al cursor ----------
  var spot = document.querySelector(".spot");
  if (spot && window.matchMedia("(pointer: fine)").matches && !reduceMotion.matches) {
    var raf = 0;
    hero.addEventListener("pointermove", function (e) {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        var rect = hero.getBoundingClientRect();
        var offset = ((e.clientX - rect.left) / rect.width - 0.5) * 160;
        spot.style.setProperty("--spot-x", offset.toFixed(1) + "px");
        raf = 0;
      });
    });
    hero.addEventListener("pointerleave", function () {
      spot.style.setProperty("--spot-x", "0px");
    });
  }

  // ---------- Cartel de escenarios que se enciende ----------
  var cartel = document.querySelector(".cartel");
  if (cartel) {
    if ("IntersectionObserver" in window && !reduceMotion.matches) {
      var cartelObs = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) {
          cartel.classList.add("is-lit");
          cartelObs.disconnect();
        }
      }, { threshold: 0.3 });
      cartelObs.observe(cartel);
    } else {
      cartel.classList.add("is-lit");
    }
  }

  // ---------- Carrusel de reels ----------
  var reels = document.getElementById("reels");
  var now = document.getElementById("reel-now");
  var total = document.getElementById("reel-total");
  var btns = document.querySelectorAll(".reels-btn");
  if (reels && now) {
    var items = reels.children;
    total.textContent = items.length;
    var step = function () {
      return items.length > 1 ? items[1].offsetLeft - items[0].offsetLeft : reels.clientWidth;
    };
    var current = function () {
      return Math.round(reels.scrollLeft / step());
    };
    var updateCount = function () {
      var i = Math.min(items.length - 1, Math.max(0, current()));
      now.textContent = i + 1;
      btns[0].disabled = reels.scrollLeft <= 4;
      btns[1].disabled = reels.scrollLeft + reels.clientWidth >= reels.scrollWidth - 4;
    };
    btns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var dir = Number(btn.getAttribute("data-dir"));
        reels.scrollTo({
          left: (current() + dir) * step(),
          behavior: reduceMotion.matches ? "auto" : "smooth"
        });
      });
    });
    var scrollTimer;
    reels.addEventListener("scroll", function () {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(updateCount, 60);
    }, { passive: true });
    reels.addEventListener("scrollend", updateCount);
    window.addEventListener("resize", updateCount);
    updateCount();
  }

  // ---------- Formulario de reserva → WhatsApp ----------
  var form = document.getElementById("reserva-form");
  var status = document.getElementById("form-status");
  var fallback = document.getElementById("wa-fallback");
  var fecha = form.elements.fecha;
  var today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  fecha.min = today.toISOString().slice(0, 10);

  // Reservar desde un formato: elige el tipo y lleva al formulario
  document.querySelectorAll(".formato-link").forEach(function (link) {
    link.addEventListener("click", function () {
      var tipo = form.elements.tipo;
      tipo.value = link.getAttribute("data-tipo");
      showError(tipo, "");
      tipo.classList.remove("is-prefilled");
      void tipo.offsetWidth;
      tipo.classList.add("is-prefilled");
      setTimeout(function () {
        form.elements.nombre.focus({ preventScroll: true });
      }, reduceMotion.matches ? 0 : 500);
    });
  });
  form.elements.tipo.addEventListener("animationend", function () {
    this.classList.remove("is-prefilled");
  });

  function showError(field, msg) {
    var err = document.getElementById("e-" + field.name);
    field.setAttribute("aria-invalid", msg ? "true" : "false");
    if (err) err.textContent = msg;
  }

  function formatDate(value) {
    if (!value) return "";
    var p = value.split("-");
    return p[2] + "/" + p[1] + "/" + p[0];
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var f = form.elements;
    var nombre = f.nombre.value.trim();
    var tipo = f.tipo.value;
    var firstInvalid = null;

    showError(f.nombre, nombre ? "" : "Escribe tu nombre para que sepa quién lo contacta.");
    showError(f.tipo, tipo ? "" : "Elige el tipo de evento.");
    if (!nombre) firstInvalid = f.nombre;
    else if (!tipo) firstInvalid = f.tipo;
    if (firstInvalid) { firstInvalid.focus(); return; }

    var lines = [
      "Hola, Príncipe. Quiero reservar.",
      "",
      "Nombre: " + nombre,
      "Tipo de evento: " + tipo
    ];
    if (f.fecha.value) lines.push("Fecha: " + formatDate(f.fecha.value));
    if (f.ciudad.value.trim()) lines.push("Ciudad: " + f.ciudad.value.trim());
    if (f.mensaje.value.trim()) lines.push("", f.mensaje.value.trim());

    var url = "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(lines.join("\n"));
    fallback.href = url;
    status.hidden = false;
    window.open(url, "_blank", "noopener");
  });

  ["nombre", "tipo"].forEach(function (name) {
    var el = form.elements[name];
    var clear = function () { if (el.value.trim()) showError(el, ""); };
    el.addEventListener("input", clear);
    el.addEventListener("change", clear);
  });
})();
