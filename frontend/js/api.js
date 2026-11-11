// Todas las peticiones al servidor pasan por esta función.
// Cuando exista la API de Laravel, solo cambiaremos las rutas que le pasamos.
function obtenerDatos(ruta) {
  return fetch(ruta)
    .then(response => {
      if (!response.ok) {
        throw new Error("Error " + response.status);
      }
      return response.json();
    });
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
// AHORA: lee un JSON de prueba.
// DESPUÉS: pedirá /api/citas/ocupadas?barbero_id=...&fecha=... a Laravel.
// El resto del código no se entera del cambio.
function obtenerOcupadas(barberoId, fecha) {
  return obtenerDatos("data/ocupadas.json").then(lista => {
    const offset = diasDesdeHoy(fecha);
    return lista.filter(o => o.barbero_id === barberoId && o.dia_offset === offset);
  });
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