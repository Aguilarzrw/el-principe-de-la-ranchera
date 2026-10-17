(function () {
  var WHATSAPP = "584243165711";

  // Año en el pie
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  // Menú móvil
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("menu");
  var label = toggle.querySelector(".sr-only");

  function setMenu(open) {
    toggle.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
    label.textContent = open ? "Cerrar menú" : "Abrir menú";
  }
  toggle.addEventListener("click", function () {
    setMenu(toggle.getAttribute("aria-expanded") !== "true");
  });
  nav.addEventListener("click", function (e) {
    if (e.target.closest("a")) setMenu(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && nav.classList.contains("is-open")) {
      setMenu(false);
      toggle.focus();
    }
  });

  // Formulario de reserva → WhatsApp
  var form = document.getElementById("reserva-form");
  var fecha = form.elements.fecha;
  fecha.min = new Date().toISOString().slice(0, 10);

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
    window.open(url, "_blank", "noopener");
  });

  ["nombre", "tipo"].forEach(function (name) {
    var el = form.elements[name];
    el.addEventListener("input", function () { if (el.value.trim()) showError(el, ""); });
    el.addEventListener("change", function () { if (el.value.trim()) showError(el, ""); });
  });
})();
