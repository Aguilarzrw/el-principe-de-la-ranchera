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

  // ---------- Reflectores de tarima ----------
  // Apunta cada haz desde su esquina hasta el centro del logo.
  var lights = document.querySelector(".stage-lights");
  var target = document.querySelector(".hero-logo");
  var beamL = document.querySelector(".beam-l");
  var beamR = document.querySelector(".beam-r");

  function aimLights() {
    var h = hero.getBoundingClientRect();
    var t = target.getBoundingClientRect();
    var tx = t.left + t.width / 2 - h.left;
    var ty = t.top + t.height * 0.5 - h.top;
    [[beamL, "--a-l", -1], [beamR, "--a-r", 1]].forEach(function (b) {
      var ox = b[0].offsetLeft + b[0].offsetWidth / 2;   // foco del haz (centro superior)
      var oy = b[0].offsetTop;
      var dx = tx - ox, dy = ty - oy;
      var angle = Math.atan2(Math.abs(dx), dy) * 180 / Math.PI;
      lights.style.setProperty(b[1], (b[2] * angle).toFixed(2) + "deg");
      lights.style.setProperty("--len", Math.round(Math.hypot(dx, dy) * 1.35) + "px");
    });
    lights.style.setProperty("--tx", Math.round(tx) + "px");
    lights.style.setProperty("--ty", Math.round(ty) + "px");
  }

  if (lights && target) {
    var fontsReady = document.fonts && document.fonts.ready
      ? Promise.race([document.fonts.ready, new Promise(function (r) { setTimeout(r, 1200); })])
      : Promise.resolve();
    var logoReady = target.complete ? Promise.resolve() : new Promise(function (r) {
      target.addEventListener("load", r, { once: true });
      target.addEventListener("error", r, { once: true });
    });
    Promise.all([fontsReady, logoReady]).then(function () {
      aimLights();
      requestAnimationFrame(function () { hero.classList.add("lights-on"); });
    });
    beamR.addEventListener("animationend", function () { hero.classList.add("lights-done"); });
    if (reduceMotion.matches) hero.classList.add("lights-done");
    var resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(aimLights, 120);
    });

    // En escritorio, los reflectores siguen apenas al cursor
    if (window.matchMedia("(pointer: fine)").matches && !reduceMotion.matches) {
      var raf = 0;
      hero.addEventListener("pointermove", function (e) {
        if (raf || !hero.classList.contains("lights-done")) return;
        raf = requestAnimationFrame(function () {
          var rect = hero.getBoundingClientRect();
          var aim = -((e.clientX - rect.left) / rect.width - 0.5) * 7;
          lights.style.setProperty("--aim", aim.toFixed(2) + "deg");
          raf = 0;
        });
      });
      hero.addEventListener("pointerleave", function () {
        lights.style.setProperty("--aim", "0deg");
      });
    }
  }

  // ---------- Video de fondo del hero ----------
  // Solo corre si la persona no pidió menos movimiento ni ahorro de datos.
  var heroVideo = document.querySelector(".hero-video");
  var videoToggle = document.querySelector(".video-toggle");
  if (heroVideo && videoToggle) {
    var toggleLabel = videoToggle.querySelector(".sr-only");
    var saveData = navigator.connection && navigator.connection.saveData;
    var setPaused = function (paused) {
      videoToggle.setAttribute("aria-pressed", String(paused));
      toggleLabel.textContent = paused ? "Reproducir el video de fondo" : "Pausar el video de fondo";
    };
    var playHero = function () {
      var p = heroVideo.play();
      if (p && p.catch) p.catch(function () { setPaused(true); });
      setPaused(false);
    };
    if (reduceMotion.matches || saveData) {
      setPaused(true);
    } else {
      heroVideo.preload = "auto";
      playHero();
    }
    videoToggle.addEventListener("click", function () {
      if (heroVideo.paused) playHero();
      else { heroVideo.pause(); setPaused(true); }
    });
    // Pausar cuando el hero sale de pantalla, para no gastar batería
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        if (videoToggle.getAttribute("aria-pressed") === "true") return;
        if (entries[0].isIntersecting) heroVideo.play().catch(function () {});
        else heroVideo.pause();
      }, { threshold: 0.1 }).observe(hero);
    }
  }

  // ---------- Videos "En vivo": uno a la vez ----------
  var clips = document.querySelectorAll(".clip video");
  clips.forEach(function (clip) {
    clip.addEventListener("play", function () {
      clips.forEach(function (other) { if (other !== clip) other.pause(); });
      if (heroVideo && !heroVideo.paused) heroVideo.pause();
    });
  });

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

  // ---------- Reserva por pasos → WhatsApp ----------
  var form = document.getElementById("reserva-form");
  var steps = form.querySelectorAll(".step");
  var dots = form.querySelectorAll(".step-dot");
  var stepStatus = document.getElementById("step-status");
  var motivoBox = document.getElementById("motivo");
  var preview = document.getElementById("wa-preview");
  var prettyDate = document.getElementById("fecha-texto");
  var status = document.getElementById("form-status");
  var fallback = document.getElementById("wa-fallback");
  var STEP_NAMES = ["Servicio", "Fecha y lugar", "Tus datos"];
  var current = 1;

  function localISO(d) {
    var z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return z.toISOString().slice(0, 10);
  }
  form.elements.fecha.min = localISO(new Date());

  function radioValue(name) {
    var el = form.querySelector('input[name="' + name + '"]:checked');
    return el ? el.value : "";
  }

  function dateWords(value) {
    if (!value) return "";
    var p = value.split("-");
    var d = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
    var text = new Intl.DateTimeFormat("es-VE", { weekday: "long", day: "numeric", month: "long" }).format(d);
    var diff = Math.round((d - new Date(new Date().setHours(0, 0, 0, 0))) / 86400000);
    if (diff === 0) return "Hoy, " + text;
    if (diff === 1) return "Mañana, " + text;
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  // "19:30" -> "7:30 p. m. (noche)"
  function timeWords(value) {
    if (!value) return "";
    var p = value.split(":"), h = Number(p[0]), m = p[1];
    var franja = h < 12 ? (h < 5 ? "madrugada" : "mañana") : (h < 19 ? "tarde" : "noche");
    if (h === 0 && m === "00") return "12:00 a. m. (medianoche)";
    if (h === 12 && m === "00") return "12:00 m. (mediodía)";
    var h12 = h % 12 === 0 ? 12 : h % 12;
    return h12 + ":" + m + (h < 12 ? " a. m." : " p. m.") + " (" + franja + ")";
  }

  function buildMessage(forPreview) {
    var f = form.elements;
    var tipo = radioValue("tipo");
    var motivo = tipo === "Serenata" ? radioValue("motivo") : "";
    var nombre = f.nombre.value.trim();
    var lines = ["Hola, Príncipe. Quiero reservar.", ""];
    lines.push("Servicio: " + (tipo ? tipo + (motivo ? " (" + motivo + ")" : "") : "(por elegir)"));
    if (f.fecha.value) lines.push("Fecha tentativa: " + dateWords(f.fecha.value).replace(/^(Hoy|Mañana), /, ""));
    if (f.hora.value) lines.push("Hora tentativa: " + timeWords(f.hora.value));
    if (f.ciudad.value.trim()) lines.push("Ciudad: " + f.ciudad.value.trim());
    lines.push("Nombre: " + (nombre || (forPreview ? "(tu nombre y apellido)" : "")));
    var tel = f.telefono.value.trim();
    lines.push("Teléfono: " + (tel || (forPreview ? "(tu teléfono)" : "")));
    if (f.mensaje.value.trim()) lines.push("", f.mensaje.value.trim());
    return lines.join("\n");
  }

  function refresh() {
    motivoBox.hidden = radioValue("tipo") !== "Serenata";
    prettyDate.textContent = dateWords(form.elements.fecha.value);
    document.getElementById("hora-texto").textContent = timeWords(form.elements.hora.value);
    preview.textContent = buildMessage(true);
    var iso = form.elements.fecha.value;
    form.querySelectorAll("[data-quick]").forEach(function (b) {
      b.classList.toggle("is-on", b.getAttribute("data-iso") === iso);
    });
  }

  function setError(id, msg) {
    var err = document.getElementById(id);
    if (err) err.textContent = msg;
  }

  function goTo(n, focus) {
    current = n;
    steps.forEach(function (s) { s.classList.toggle("is-active", Number(s.getAttribute("data-step")) === n); });
    dots.forEach(function (d) {
      var k = Number(d.getAttribute("data-step"));
      d.classList.toggle("is-current", k === n);
      d.classList.toggle("is-done", k < n);
      if (k === n) d.setAttribute("aria-current", "step"); else d.removeAttribute("aria-current");
    });
    stepStatus.textContent = "Paso " + n + " de 3: " + STEP_NAMES[n - 1];
    if (focus) {
      var top = form.getBoundingClientRect().top;
      if (top < 64 || top > window.innerHeight * 0.6) {
        window.scrollTo({ top: window.scrollY + top - 80, behavior: reduceMotion.matches ? "auto" : "smooth" });
      }
      var title = steps[n - 1].querySelector(".step-title");
      if (title) title.focus({ preventScroll: true });
    }
  }

  function validate(n) {
    if (n === 1 && !radioValue("tipo")) {
      setError("e-tipo", "Elige qué quieres celebrar para continuar.");
      var first = form.querySelector('input[name="tipo"]');
      if (first) first.focus();
      return false;
    }
    if (n === 3) {
      var nombre = form.elements.nombre, tel = form.elements.telefono;
      var okNombre = nombre.value.trim().split(/\s+/).length >= 2;
      var digits = tel.value.replace(/\D/g, "");
      var okTel = digits.length >= 10 && digits.length <= 13;
      setError("e-nombre", okNombre ? "" : "Escribe tu nombre y apellido.");
      setError("e-telefono", okTel ? "" : "Escribe un teléfono con código de área, por ejemplo 0414-123 4567.");
      nombre.setAttribute("aria-invalid", String(!okNombre));
      tel.setAttribute("aria-invalid", String(!okTel));
      if (!okNombre) { nombre.focus(); return false; }
      if (!okTel) { tel.focus(); return false; }
    }
    return true;
  }

  form.addEventListener("click", function (e) {
    if (e.target.closest("[data-next]") && validate(current)) goTo(current + 1, true);
    if (e.target.closest("[data-back]")) goTo(current - 1, true);
    var quick = e.target.closest("[data-quick]");
    if (quick) {
      form.elements.fecha.value = quick.getAttribute("data-iso");
      refresh();
    }
  });
  // Fechas rápidas: Hoy, Mañana y el sábado que viene (si hoy es sábado, el siguiente)
  form.querySelectorAll("[data-quick]").forEach(function (b) {
    var d = new Date(), q = b.getAttribute("data-quick");
    if (q === "sab") {
      var add = (6 - d.getDay() + 7) % 7;
      if (add === 0) { add = 7; b.textContent = "El próximo sábado"; }
      d.setDate(d.getDate() + add);
    } else {
      d.setDate(d.getDate() + Number(q));
    }
    b.setAttribute("data-iso", localISO(d));
  });

  // Selector de hora: hora (1-12) + minutos + a. m./p. m. -> campo oculto "hora" en formato 24 h
  function syncTime() {
    var h = form.querySelector("#tp-h").value;
    var m = (form.querySelector('input[name="tp-m"]:checked') || {}).value || "00";
    var ap = (form.querySelector('input[name="tp-ap"]:checked') || {}).value || "pm";
    if (!h) { form.elements.hora.value = ""; return; }
    var h24 = Number(h) % 12 + (ap === "pm" ? 12 : 0);
    form.elements.hora.value = (h24 < 10 ? "0" : "") + h24 + ":" + m;
  }
  form.querySelector(".timepick").addEventListener("change", function () { syncTime(); refresh(); });

  form.addEventListener("input", function (e) {
    if (e.target.name === "tipo") setError("e-tipo", "");
    if ((e.target.name === "nombre" || e.target.name === "telefono") && e.target.getAttribute("aria-invalid") === "true") {
      setError("e-" + e.target.name, "");
      e.target.setAttribute("aria-invalid", "false");
    }
    refresh();
  });
  form.addEventListener("change", refresh);

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    // Enter en los pasos 1 y 2 avanza en lugar de enviar
    if (current < 3) { if (validate(current)) goTo(current + 1, true); return; }
    if (!validate(1)) { goTo(1, true); return; }
    if (!validate(3)) return;
    var url = "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(buildMessage(false));
    fallback.href = url;
    status.hidden = false;
    window.open(url, "_blank", "noopener");
  });

  // Elegir un servicio desde fuera del formulario (tarjetas de Formatos o enlace ?servicio=)
  var SERVICIOS = { serenata: "Serenata", mariachi: "Mariachi Show", banda: "Banda Show", evento: "Evento o tarima" };
  function pickService(value) {
    var radio = form.querySelector('input[name="tipo"][value="' + value + '"]');
    if (!radio) return;
    radio.checked = true;
    setError("e-tipo", "");
    goTo(1, false);
    refresh();
  }
  document.querySelectorAll(".formato-link").forEach(function (link) {
    link.addEventListener("click", function () { pickService(link.getAttribute("data-tipo")); });
  });
  var param = new URLSearchParams(location.search).get("servicio");
  if (param && SERVICIOS[param.toLowerCase()]) pickService(SERVICIOS[param.toLowerCase()]);

  goTo(1, false);
  refresh();
})();
