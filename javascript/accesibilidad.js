// Controles de accesibilidad: tamaño de texto y alto contraste.
// Las preferencias se guardan en el navegador para la próxima visita.

(function () {
  const raiz = document.documentElement;
  const TAMANO_MIN = 80;
  const TAMANO_MAX = 160;
  const PASO = 10;

  function leer(clave) {
    try { return localStorage.getItem(clave); } catch (e) { return null; }
  }

  function guardar(clave, valor) {
    try { localStorage.setItem(clave, valor); } catch (e) { /* sin almacenamiento */ }
  }

  // --- Tamaño del texto ---
  let tamano = parseInt(leer("atlas-tamano"), 10) || 100;

  function aplicarTamano() {
    raiz.style.setProperty("--tamano-fuente-base", tamano + "%");
    guardar("atlas-tamano", tamano);
  }

  document.getElementById("btn-mas").addEventListener("click", function () {
    tamano = Math.min(TAMANO_MAX, tamano + PASO);
    aplicarTamano();
  });

  document.getElementById("btn-menos").addEventListener("click", function () {
    tamano = Math.max(TAMANO_MIN, tamano - PASO);
    aplicarTamano();
  });

  // --- Alto contraste ---
  const btnContraste = document.getElementById("btn-contraste");

  function aplicarContraste(activo) {
    raiz.classList.toggle("alto-contraste", activo);
    btnContraste.setAttribute("aria-pressed", String(activo));
    guardar("atlas-contraste", activo ? "1" : "0");
  }

  btnContraste.addEventListener("click", function () {
    aplicarContraste(!raiz.classList.contains("alto-contraste"));
  });

  // --- Saltar al contenido: mover el foco al <main> ---
  document.querySelector(".saltar-contenido").addEventListener("click", function (e) {
    e.preventDefault();
    document.getElementById("contenido-principal").focus();
  });

  // --- Año actual en el pie ---
  document.getElementById("anio").textContent = new Date().getFullYear();

  // Estado inicial
  aplicarTamano();
  aplicarContraste(leer("atlas-contraste") === "1");
})();
