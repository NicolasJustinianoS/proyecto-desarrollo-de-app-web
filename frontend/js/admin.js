// ----- Estado del panel -----
let citas = [];
let barberos = [];
let diaOffset = 0; // 0 = hoy, 1 = mañana, -1 = ayer
let servicios = [];
let productos = [];

const ESTADOS = ["pendiente", "confirmada", "completada", "cancelada"];

// ----- Utilidades -----

function textoDia(offset) {
  const hoy = new Date();
  const dia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + offset);
  const texto = dia.toLocaleDateString("es-BO", { weekday: "long", day: "numeric", month: "long" });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

// Si el servidor dice "sin sesión" o "sin permiso", se vuelve al login
function manejarSesion(error) {
  if (error.estado === 401 || error.estado === 403) {
    limpiarSesion();
    window.location.href = "login.html";
    return true;
  }
  return false;
}

function fechaDelDia() {
  const hoy = new Date();
  return fechaISO(new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + diaOffset));
}

// Pide al servidor las citas del día que se está viendo
function cargarCitas() {
  document.getElementById("fecha-actual").textContent = textoDia(diaOffset);
  return peticion(API_URL + "/admin/citas?fecha=" + fechaDelDia())
    .then(lista => {
      citas = lista;
      dibujarCitas();
    })
    .catch(error => {
      if (manejarSesion(error)) {
        return;
      }
      console.error(error);
      document.getElementById("tabla-citas").innerHTML =
        `<tr><td colspan="8" class="vacio">No se pudieron cargar las citas.</td></tr>`;
    });
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
      <td>${escapar(c.hora_inicio)}<br><span class="detalle">hasta ${escapar(c.hora_fin)}</span></td>
      <td>${escapar(c.cliente_nombre)}<br><span class="detalle">${escapar(c.cliente_telefono || "—")}</span></td>
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
  peticion(API_URL + "/admin/citas/" + id, "PATCH", { estado: nuevoEstado })
    .then(actualizada => {
      const cita = citas.find(c => c.id === id);
      cita.estado = actualizada.estado;
      dibujarCitas();
    })
    .catch(error => {
      if (!manejarSesion(error)) {
        alert(textoError(error));
        cargarCitas(); // vuelve a mostrar lo que realmente hay en el servidor
      }
    });
}

function eliminarCita(id) {
  if (!confirm("¿Eliminar esta cita? No se puede deshacer.")) {
    return;
  }
  peticion(API_URL + "/admin/citas/" + id, "DELETE")
    .then(() => {
      citas = citas.filter(c => c.id !== id);
      dibujarCitas();
    })
    .catch(error => {
      if (!manejarSesion(error)) {
        alert(textoError(error));
      }
    });
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
  cargarCitas();
});
document.getElementById("dia-siguiente").addEventListener("click", function () {
  diaOffset++;
  cargarCitas();
});
document.getElementById("dia-hoy").addEventListener("click", function () {
  diaOffset = 0;
  cargarCitas();
});
document.getElementById("filtro-estado").addEventListener("change", dibujarCitas);
document.getElementById("filtro-origen").addEventListener("change", dibujarCitas);

document.getElementById("btn-salir").addEventListener("click", function () {
  // Se le pide al servidor que invalide el token; pase lo que pase, se limpia la sesión local
  peticion(API_URL + "/logout", "POST")
    .catch(() => {})
    .finally(() => {
      limpiarSesion();
      window.location.href = "login.html";
    });
});

// ----- Carga inicial -----
// Promise.all espera a que terminen las TRES peticiones del catálogo antes de continuar
Promise.all([
  peticion(API_URL + "/admin/barberos"),
  peticion(API_URL + "/admin/servicios"),
  peticion(API_URL + "/admin/productos")
])
  .then(([listaBarberos, listaServicios, listaProductos]) => {
    barberos = listaBarberos;
    servicios = listaServicios;
    productos = listaProductos;
    dibujarCatalogos();
    return cargarCitas();
  })
  .catch(error => {
    if (manejarSesion(error)) {
      return;
    }
    console.error(error);
    document.getElementById("tabla-citas").innerHTML =
      `<tr><td colspan="8" class="vacio">No se pudieron cargar los datos.</td></tr>`;
  });
