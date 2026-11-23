// Dirección de la API: en tu computadora usa Laravel local; publicado, usa el mismo sitio.
const EN_LOCAL = location.hostname === "127.0.0.1" || location.hostname === "localhost";
const API_URL = EN_LOCAL ? "http://127.0.0.1:8000/api" : "/api";
// ----- Sesión: el token de Sanctum se guarda en sessionStorage (se borra al cerrar la pestaña) -----
const CLAVE_TOKEN = "jsf_token";
const CLAVE_USUARIO = "jsf_usuario";

function guardarSesion(token, usuario) {
  sessionStorage.setItem(CLAVE_TOKEN, token);
  sessionStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuario));
}
function limpiarSesion() {
  sessionStorage.removeItem(CLAVE_TOKEN);
  sessionStorage.removeItem(CLAVE_USUARIO);
}
function haySesion() {
  return sessionStorage.getItem(CLAVE_TOKEN) !== null;
}
function usuarioActual() {
  try {
    return JSON.parse(sessionStorage.getItem(CLAVE_USUARIO));
  } catch (e) {
    return null;
  }
}

// Convierte caracteres especiales de HTML en texto inofensivo (defensa contra XSS).
// Se usa siempre que un dato del servidor se arma dentro de innerHTML.
function escapar(texto) {
  return String(texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Todas las peticiones a la API pasan por esta función.
// Agrega el token si hay sesión y convierte los errores del servidor en un Error con
// .estado (código HTTP) y .errores (los mensajes de validación de Laravel).
function peticion(ruta, metodo, cuerpo) {
  const cabeceras = { "Accept": "application/json" };
  const token = sessionStorage.getItem(CLAVE_TOKEN);
  if (token) {
    cabeceras["Authorization"] = "Bearer " + token;
  }
  const opciones = { method: metodo || "GET", headers: cabeceras };
  if (cuerpo !== undefined) {
    cabeceras["Content-Type"] = "application/json";
    opciones.body = JSON.stringify(cuerpo);
  }
  return fetch(ruta, opciones).then(respuesta => {
    return respuesta.json().catch(() => ({})).then(datos => {
      if (!respuesta.ok) {
        const error = new Error(datos.message || "Error " + respuesta.status);
        error.estado = respuesta.status;
        error.errores = datos.errors || {};
        throw error;
      }
      return datos;
    });
  });
}

// Peticiones públicas de lectura (catálogo)
function obtenerDatos(ruta) {
  return peticion(ruta);
}

// Primer mensaje de validación que mande Laravel, o el mensaje general del error
function textoError(error) {
  const campos = Object.values(error.errores || {});
  if (campos.length > 0 && campos[0].length > 0) {
    return campos[0][0];
  }
  return error.message || "Ocurrió un error. Intenta de nuevo.";
}
// Convierte "2026-11-10" en "cuántos días faltan desde hoy"
function diasDesdeHoy(fechaISO) {
  const partes = fechaISO.split("-").map(Number);
  const fecha = new Date(partes[0], partes[1] - 1, partes[2]);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return Math.round((fecha - hoy) / 86400000);
}

// Devuelve las citas ya ocupadas de un barbero en una fecha.
// Pide a Laravel las horas ocupadas (solo horas, sin datos personales de otros clientes).
function obtenerOcupadas(barberoId, fecha) {
  return obtenerDatos(API_URL + "/citas/ocupadas?barbero_id=" + barberoId + "&fecha=" + fecha);
}


// "10:30" -> 630 (minutos desde la medianoche). Con números es fácil comparar y sumar.
function aMinutos(hora) {
  const partes = hora.split(":");
  return Number(partes[0]) * 60 + Number(partes[1]);
}

// 630 -> "10:30"
function aHora(minutos) {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0");
}

// Fecha -> "2026-11-10" usando la fecha LOCAL.
// (toISOString() usa hora UTC y, a ciertas horas, daría el día equivocado.)
function fechaISO(fecha) {
  const a = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, "0");
  const d = String(fecha.getDate()).padStart(2, "0");
  return a + "-" + m + "-" + d;
}