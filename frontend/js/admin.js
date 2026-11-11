// ----- Estado del panel -----
let citas = [];
let barberos = [];
let diaOffset = 0; // 0 = hoy, 1 = mañana, -1 = ayer
let servicios = [];
let productos = [];

const ESTADOS = ["pendiente", "confirmada", "completada", "cancelada"];

// ----- Utilidades -----

// Convierte caracteres especiales de HTML en texto inofensivo.
// Si un cliente se registrara con el nombre <script>...</script>,
// sin esto el navegador lo ejecutaría al hacer innerHTML.
function escapar(texto) {
  return String(texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function textoDia(offset) {
  const hoy = new Date();
  const dia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + offset);
  const texto = dia.toLocaleDateString("es-BO", { weekday: "long", day: "numeric", month: "long" });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function nombreBarbero(id) {
  const barbero = barberos.find(b => b.id === id);
  return barbero ? barbero.nombre + " " + barbero.apellido : "—";
}

// ----- Sección: Citas -----
function filaCita(c) {
  const opciones = ESTADOS
    .map(e => `<option value="${e}" ${e === c.estado ? "selected" : ""}>${e}</option>`)
    .join("");

  // Solo hay botón de WhatsApp si el cliente dejó teléfono
  let botonWhatsapp = "";
  if (c.cliente_telefono !== "") {
    const mensaje = encodeURIComponent(
      "Hola " + c.cliente_nombre + ", te escribimos de Joseff Studio por tu cita de las " + c.hora_inicio + "."
    );
    const enlace = "https://wa.me/591" + c.cliente_telefono + "?text=" + mensaje;
    botonWhatsapp = `<a class="enlace-accion" href="${enlace}" target="_blank" rel="noopener">WhatsApp</a>`;
  }

  return `
    <tr>
      <td>${c.hora_inicio}<br><span class="detalle">hasta ${c.hora_fin}</span></td>
      <td>${escapar(c.cliente_nombre)}<br><span class="detalle">${c.cliente_telefono || "—"}</span></td>
      <td>${escapar(c.servicios.join(" + "))}</td>
      <td>${escapar(nombreBarbero(c.barbero_id))}</td>
      <td><span class="insignia">${c.origen}</span></td>
      <td>
        <select class="estado estado-${c.estado}" onchange="cambiarEstado(${c.id}, this.value)">
          ${opciones}
        </select>
      </td>
      <td class="precio">Bs ${c.total}</td>
      <td>
        <div class="acciones">
          ${botonWhatsapp}
          <button type="button" class="enlace-accion peligro" onclick="eliminarCita(${c.id})">Eliminar</button>
        </div>
      </td>
    </tr>`;
}

function dibujarCitas() {
  const estado = document.getElementById("filtro-estado").value;
  const origen = document.getElementById("filtro-origen").value;

  document.getElementById("fecha-actual").textContent = textoDia(diaOffset);

  // Cada filter deja pasar solo las citas que cumplen una condición
  const lista = citas
    .filter(c => c.dia_offset === diaOffset)
    .filter(c => estado === "todos" || c.estado === estado)
    .filter(c => origen === "todos" || c.origen === origen)
    .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));

  const cuerpo = document.getElementById("tabla-citas");
  if (lista.length === 0) {
    cuerpo.innerHTML = `<tr><td colspan="8" class="vacio">No hay citas para este día con esos filtros.</td></tr>`;
  } else {
    cuerpo.innerHTML = lista.map(filaCita).join("");
  }

  const ingresos = lista
    .filter(c => c.estado !== "cancelada")
    .reduce((suma, c) => suma + c.total, 0);
  document.getElementById("resumen-dia").textContent =
    lista.length + " cita(s) · Bs " + ingresos + " (sin contar canceladas)";
}

function cambiarEstado(id, nuevoEstado) {
  const cita = citas.find(c => c.id === id);
  cita.estado = nuevoEstado;
  dibujarCitas();
}

function eliminarCita(id) {
  if (!confirm("¿Eliminar esta cita? No se puede deshacer.")) {
    return;
  }
  citas = citas.filter(c => c.id !== id);
  dibujarCitas();
}

// ----- Pestañas del panel -----
function cambiarSeccion(nombre) {
  ["citas", "servicios", "productos", "barberos"].forEach(seccion => {
    document.getElementById("sec-" + seccion).classList.toggle("oculto", seccion !== nombre);
  });
  document.querySelectorAll("#pestanas-panel .pestana").forEach(boton => {
    boton.classList.toggle("activa", boton.dataset.seccion === nombre);
  });
}

document.querySelectorAll("#pestanas-panel .pestana").forEach(boton => {
  boton.addEventListener("click", function () {
    cambiarSeccion(boton.dataset.seccion);
  });
});

// ----- Controles de la sección de citas -----
document.getElementById("dia-anterior").addEventListener("click", function () {
  diaOffset--;
  dibujarCitas();
});
document.getElementById("dia-siguiente").addEventListener("click", function () {
  diaOffset++;
  dibujarCitas();
});
document.getElementById("dia-hoy").addEventListener("click", function () {
  diaOffset = 0;
  dibujarCitas();
});
document.getElementById("filtro-estado").addEventListener("change", dibujarCitas);
document.getElementById("filtro-origen").addEventListener("change", dibujarCitas);

document.getElementById("btn-salir").addEventListener("click", function () {
  sessionStorage.removeItem("adminDemo");
  window.location.href = "login.html";
});

// ----- Carga inicial -----
// Promise.all espera a que terminen las CUATRO peticiones antes de continuar
Promise.all([
  obtenerDatos("../data/barberos.json"),
  obtenerDatos("../data/citas.json"),
  obtenerDatos("../data/servicios.json"),
  obtenerDatos("../data/productos.json")
])
  .then(([listaBarberos, listaCitas, listaServicios, listaProductos]) => {
    barberos = listaBarberos;
    citas = listaCitas;
    servicios = listaServicios;
    productos = listaProductos;
    dibujarCitas();
    dibujarCatalogos();
  })
  .catch(error => {
    console.error(error);
    document.getElementById("tabla-citas").innerHTML =
      `<tr><td colspan="8" class="vacio">No se pudieron cargar los datos.</td></tr>`;
  });