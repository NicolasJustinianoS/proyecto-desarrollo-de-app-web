// ----- Estado de la reserva: lo que el cliente va eligiendo -----
const reserva = {
  servicios: [],   // servicios elegidos (objetos completos)
  barbero: null,   // barbero elegido
  fecha: null,     // por ejemplo "2026-11-10"
  hora: null       // por ejemplo "10:30"
};

const TOTAL_PASOS = 4;
const PASO_MINUTOS = 30;    // las horas se ofrecen de 30 en 30 minutos
const DIAS_A_MOSTRAR = 14;  // cuántos días hacia adelante se puede reservar

let pasoActual = 1;
let catalogoServicios = [];
let catalogoBarberos = [];
let ocupadasDelDia = [];

// ----- Utilidades -----
function mostrarMensaje(texto, tipo) {
  const elemento = document.getElementById("mensaje-reserva");
  elemento.textContent = texto;
  elemento.className = "mensaje " + tipo;
}

function totalPrecio() {
  return reserva.servicios.reduce((suma, servicio) => suma + servicio.precio, 0);
}

function totalMinutos() {
  return reserva.servicios.reduce((suma, servicio) => suma + servicio.duracion_min, 0);
}

function actualizarTotales() {
  document.getElementById("total-precio").textContent = "Total: Bs " + totalPrecio();
  document.getElementById("total-minutos").textContent = totalMinutos() + " min";
}

function fechaLarga(iso) {
  const partes = iso.split("-").map(Number);
  const fecha = new Date(partes[0], partes[1] - 1, partes[2]);
  return fecha.toLocaleDateString("es-BO", { weekday: "long", day: "numeric", month: "long" });
}

// ----- Paso 1: servicios (se pueden elegir varios) -----
function dibujarServicios() {
  const contenedor = document.getElementById("lista-servicios-reserva");
  contenedor.innerHTML = "";
  catalogoServicios.forEach(servicio => {
    const elegido = reserva.servicios.some(s => s.id === servicio.id);
    contenedor.innerHTML += `
      <article class="tarjeta seleccionable ${elegido ? "seleccionada" : ""}"
               onclick="alternarServicio(${servicio.id})">
        <h3>${servicio.nombre}</h3>
        <p>${servicio.descripcion}</p>
        <div class="tarjeta-pie">
          <span class="precio">Bs ${servicio.precio}</span>
          <span class="detalle">${servicio.duracion_min} min</span>
        </div>
      </article>`;
  });
}

function alternarServicio(id) {
  const yaElegido = reserva.servicios.some(s => s.id === id);
  if (yaElegido) {
    reserva.servicios = reserva.servicios.filter(s => s.id !== id);
  } else {
    const servicio = catalogoServicios.find(s => s.id === id);
    reserva.servicios.push(servicio);
  }
  // Si cambia la duración total, la hora elegida antes ya no sirve
  reserva.hora = null;
  dibujarServicios();
  actualizarTotales();
}

// ----- Paso 2: barbero (solo uno) -----
function dibujarBarberos() {
  const contenedor = document.getElementById("lista-barberos-reserva");
  contenedor.innerHTML = "";
  catalogoBarberos.forEach(barbero => {
    const elegido = reserva.barbero !== null && reserva.barbero.id === barbero.id;
    const iniciales = barbero.nombre.charAt(0) + barbero.apellido.charAt(0);
    contenedor.innerHTML += `
      <article class="tarjeta tarjeta-barbero seleccionable ${elegido ? "seleccionada" : ""}"
               onclick="elegirBarbero(${barbero.id})">
        <div class="avatar">${iniciales}</div>
        <h3>${barbero.nombre} ${barbero.apellido}</h3>
        <p>${barbero.rol}</p>
      </article>`;
  });
}

function elegirBarbero(id) {
  reserva.barbero = catalogoBarberos.find(b => b.id === id);
  // Cada barbero tiene su propia agenda: se pierde la fecha y hora elegidas
  reserva.fecha = null;
  reserva.hora = null;
  dibujarBarberos();
}

// ----- Paso 3: fecha y hora -----
function dibujarFechas() {
  const contenedor = document.getElementById("lista-fechas");
  contenedor.innerHTML = "";
  const hoy = new Date();

  for (let i = 0; i < DIAS_A_MOSTRAR; i++) {
    // new Date(año, mes, día + i) maneja solo el cambio de mes
    const dia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + i);

    // Si el barbero no trabaja ese día de la semana, no se ofrece
    if (!reserva.barbero.dias_trabajo.includes(dia.getDay())) {
      continue;
    }

    const iso = fechaISO(dia);
    const texto = dia.toLocaleDateString("es-BO", { weekday: "short", day: "numeric", month: "short" });
    const elegida = reserva.fecha === iso;
    contenedor.innerHTML += `
      <button type="button" class="chip ${elegida ? "seleccionada" : ""}"
              onclick="elegirFecha('${iso}')">${texto}</button>`;
  }
}

function elegirFecha(iso) {
  reserva.fecha = iso;
  reserva.hora = null;
  dibujarFechas();
  cargarHoras();
}

function cargarHoras() {
  const ayuda = document.getElementById("ayuda-horas");
  document.getElementById("lista-horas").innerHTML = "";

  if (reserva.fecha === null) {
    ayuda.textContent = "Primero elige una fecha.";
    return;
  }

  ayuda.textContent = "Cargando horarios...";
  obtenerOcupadas(reserva.barbero.id, reserva.fecha)
    .then(ocupadas => {
      ocupadasDelDia = ocupadas;
      dibujarHoras();
    })
    .catch(error => {
      console.error(error);
      ayuda.textContent = "No se pudieron cargar los horarios.";
    });
}

// ¿Puede empezar la cita a esta hora (en minutos) con esta duración?
function estaLibre(inicio, duracion) {
  const fin = inicio + duracion;

  // 1. No puede terminar después de que el barbero se va
  if (fin > aMinutos(reserva.barbero.hora_salida)) {
    return false;
  }

  // 2. Si es hoy, no se ofrecen horas que ya pasaron
  if (reserva.fecha === fechaISO(new Date())) {
    const ahora = new Date();
    if (inicio <= ahora.getHours() * 60 + ahora.getMinutes()) {
      return false;
    }
  }

  // 3. No puede chocar con una cita existente.
  // Dos intervalos chocan cuando: empieza_uno < termina_otro Y termina_uno > empieza_otro
  const choca = ocupadasDelDia.some(o =>
    inicio < aMinutos(o.hora_fin) && fin > aMinutos(o.hora_inicio)
  );
  return !choca;
}

function dibujarHoras() {
  const contenedor = document.getElementById("lista-horas");
  const ayuda = document.getElementById("ayuda-horas");
  contenedor.innerHTML = "";

  const duracion = totalMinutos();
  const entrada = aMinutos(reserva.barbero.hora_entrada);
  const salida = aMinutos(reserva.barbero.hora_salida);
  let hayLibres = false;

  for (let inicio = entrada; inicio < salida; inicio += PASO_MINUTOS) {
    const libre = estaLibre(inicio, duracion);
    if (libre) {
      hayLibres = true;
    }
    const hora = aHora(inicio);
    const elegida = reserva.hora === hora;
    contenedor.innerHTML += `
      <button type="button" class="chip ${elegida ? "seleccionada" : ""}"
              ${libre ? "" : "disabled"}
              onclick="elegirHora('${hora}')">${hora}</button>`;
  }

  ayuda.textContent = hayLibres
    ? "Tus servicios duran " + duracion + " min. Los horarios tachados no están disponibles."
    : "No hay horarios disponibles ese día. Prueba con otra fecha.";
}

function elegirHora(hora) {
  reserva.hora = hora;
  dibujarHoras();
}

function prepararPaso3() {
  dibujarFechas();
  cargarHoras();
}

// ----- Paso 4: resumen y confirmación -----
function dibujarResumen() {
  const fin = aHora(aMinutos(reserva.hora) + totalMinutos());
  // map transforma cada servicio en un texto; join los une en uno solo
  const lista = reserva.servicios
    .map(s => `<li>${s.nombre} — Bs ${s.precio} (${s.duracion_min} min)</li>`)
    .join("");

  document.getElementById("resumen-final").innerHTML = `
    <p class="etiqueta">Servicios</p>
    <ul>${lista}</ul>
    <p class="etiqueta">Barbero</p>
    <p>${reserva.barbero.nombre} ${reserva.barbero.apellido}</p>
    <p class="etiqueta">Fecha y hora</p>
    <p>${fechaLarga(reserva.fecha)}, de ${reserva.hora} a ${fin}</p>
    <p class="etiqueta">Total</p>
    <p class="precio">Bs ${totalPrecio()} · ${totalMinutos()} min</p>`;
}

function generarCodigo() {
  return "JSF-" + Math.floor(1000 + Math.random() * 9000);
}

function confirmarReserva() {
  // AHORA: solo simula. DESPUÉS: aquí irá el fetch POST /api/citas a Laravel,
  // y el código lo generará el servidor.
  const codigo = generarCodigo();

  document.getElementById("paso-4").innerHTML = `
    <div class="exito">
      <h2>¡Reserva confirmada!</h2>
      <p>Tu código de reserva es</p>
      <p class="codigo">${codigo}</p>
      <p class="ayuda">Guárdalo. Esto es una simulación: todavía no se envía a ningún servidor.</p>
      <a href="index.html" class="btn">Volver al inicio</a>
    </div>`;

  document.querySelector(".barra-reserva").classList.add("oculto");
  document.querySelectorAll("#indicador-pasos li").forEach(li => {
    li.classList.remove("activo");
    li.classList.add("hecho");
  });
  mostrarMensaje("", "");
}

// ----- Navegación entre pasos -----
function mostrarPaso(numero) {
  pasoActual = numero;

  for (let i = 1; i <= TOTAL_PASOS; i++) {
    document.getElementById("paso-" + i).classList.toggle("oculto", i !== numero);
  }

  const indicadores = document.querySelectorAll("#indicador-pasos li");
  indicadores.forEach((li, indice) => {
    li.classList.toggle("activo", indice + 1 === numero);
    li.classList.toggle("hecho", indice + 1 < numero);
  });

  document.getElementById("btn-atras").classList.toggle("oculto", numero === 1);
  document.getElementById("btn-siguiente").textContent =
    numero === TOTAL_PASOS ? "Confirmar reserva" : "Siguiente";

  if (numero === 3) {
    prepararPaso3();
  }
  if (numero === 4) {
    dibujarResumen();
  }

  mostrarMensaje("", "");
  window.scrollTo(0, 0);
}

function validarPaso(numero) {
  if (numero === 1 && reserva.servicios.length === 0) {
    mostrarMensaje("Elige al menos un servicio.", "error");
    return false;
  }
  if (numero === 2 && reserva.barbero === null) {
    mostrarMensaje("Elige un barbero.", "error");
    return false;
  }
  if (numero === 3 && reserva.fecha === null) {
    mostrarMensaje("Elige una fecha.", "error");
    return false;
  }
  if (numero === 3 && reserva.hora === null) {
    mostrarMensaje("Elige una hora.", "error");
    return false;
  }
  return true;
}

function siguiente() {
  if (!validarPaso(pasoActual)) {
    return;
  }
  if (pasoActual < TOTAL_PASOS) {
    mostrarPaso(pasoActual + 1);
  } else {
    confirmarReserva();
  }
}

function atras() {
  if (pasoActual > 1) {
    mostrarPaso(pasoActual - 1);
  }
}

document.getElementById("btn-siguiente").addEventListener("click", siguiente);
document.getElementById("btn-atras").addEventListener("click", atras);

// ----- Carga inicial de datos -----
obtenerDatos("data/servicios.json")
  .then(datos => {
    catalogoServicios = datos;
    dibujarServicios();
  })
  .catch(error => {
    console.error(error);
    mostrarMensaje("No se pudieron cargar los servicios.", "error");
  });

obtenerDatos("data/barberos.json")
  .then(datos => {
    catalogoBarberos = datos;
    dibujarBarberos();
  })
  .catch(error => {
    console.error(error);
    mostrarMensaje("No se pudieron cargar los barberos.", "error");
  });