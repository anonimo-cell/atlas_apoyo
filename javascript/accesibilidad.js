// Menú de accesibilidad (tamaño de texto y alto contraste) y modales.
// Las preferencias se guardan en el navegador para la próxima visita.

(function () {
  const raiz = document.documentElement;
  const TAMANO_MIN = 80;
  const TAMANO_MAX = 160;
  const PASO = 10;
  const anuncio = document.getElementById("anuncio-accesible");

  function leer(clave) {
    try { return localStorage.getItem(clave); } catch (e) { return null; }
  }

  function guardar(clave, valor) {
    try { localStorage.setItem(clave, valor); } catch (e) { /* sin almacenamiento */ }
  }

  // Aviso para lectores de pantalla
  function anunciar(texto) {
    anuncio.textContent = "";
    setTimeout(function () { anuncio.textContent = texto; }, 50);
  }

  // --- Modales: data-abrir="id" los abre, data-cerrar los cierra ---
  document.querySelectorAll("[data-abrir]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.getElementById(btn.dataset.abrir).showModal();
    });
  });

  document.querySelectorAll("dialog").forEach(function (modal) {
    modal.querySelectorAll("[data-cerrar]").forEach(function (btn) {
      btn.addEventListener("click", function () { modal.close(); });
    });
    // Cerrar al pulsar fuera del cuadro
    modal.addEventListener("click", function (e) {
      if (e.target === modal) modal.close();
    });
  });

  // --- Tamaño del texto ---
  let tamano = parseInt(leer("atlas-tamano"), 10) || 100;

  function aplicarTamano() {
    raiz.style.setProperty("--tamano-fuente-base", tamano + "%");
    guardar("atlas-tamano", tamano);
  }

  document.getElementById("btn-mas").addEventListener("click", function () {
    tamano = Math.min(TAMANO_MAX, tamano + PASO);
    aplicarTamano();
    anunciar("Tamaño del texto: " + tamano + " por ciento");
  });

  document.getElementById("btn-menos").addEventListener("click", function () {
    tamano = Math.max(TAMANO_MIN, tamano - PASO);
    aplicarTamano();
    anunciar("Tamaño del texto: " + tamano + " por ciento");
  });

  // --- Alto contraste ---
  const btnContraste = document.getElementById("btn-contraste");

  function aplicarContraste(activo) {
    raiz.classList.toggle("alto-contraste", activo);
    btnContraste.setAttribute("aria-pressed", String(activo));
    guardar("atlas-contraste", activo ? "1" : "0");
  }

  btnContraste.addEventListener("click", function () {
    const activo = !raiz.classList.contains("alto-contraste");
    aplicarContraste(activo);
    anunciar(activo ? "Alto contraste activado" : "Alto contraste desactivado");
  });

  // --- Restablecer ---
  document.getElementById("btn-restablecer").addEventListener("click", function () {
    tamano = 100;
    aplicarTamano();
    aplicarContraste(false);
    anunciar("Opciones de accesibilidad restablecidas");
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
