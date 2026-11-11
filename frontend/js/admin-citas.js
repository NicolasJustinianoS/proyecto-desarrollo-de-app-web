// ----- Agregar cita (WhatsApp o presencial) -----
const dialogoCita = document.getElementById("dialogo-cita");
const formCita = document.getElementById("form-cita");

function mostrarErrorCita(texto) {
  const elemento = document.getElementById("mensaje-cita");
  elemento.textContent = texto;
  elemento.className = "mensaje error";
}

// Devuelve los servicios que están marcados en el formulario
function serviciosElegidosCita() {
  const ids = Array.from(document.querySelectorAll("#cita-servicios input:checked"))
    .map(caja => Number(caja.value));
  return servicios.filter(s => ids.includes(s.id));
}

function actualizarResumenCita() {
  const elegidos = serviciosElegidosCita();
  const minutos = elegidos.reduce((suma, s) => suma + s.duracion_min, 0);
  const total = elegidos.reduce((suma, s) => suma + s.precio, 0);
  const hora = document.getElementById("cita-hora").value;

  let texto = "Total: Bs " + total + " · " + minutos + " min";
  if (hora !== "" && minutos > 0) {
    texto += " · termina a las " + aHora(aMinutos(hora) + minutos);
  }
  document.getElementById("resumen-cita").textContent = texto;
}

function abrirDialogoCita() {
  // Las listas se arman con los datos actuales de barberos y servicios
  document.getElementById("cita-barbero").innerHTML = barberos
    .map(b => `<option value="${b.id}">${escapar(b.nombre)} ${escapar(b.apellido)}</option>`)
    .join("");

  document.getElementById("cita-servicios").innerHTML = servicios
    .map(s => `
      <label class="check">
        <input type="checkbox" name="cita-servicio" value="${s.id}">
        ${escapar(s.nombre)} — Bs ${s.precio} (${s.duracion_min} min)
      </label>`)
    .join("");

  formCita.reset(); // borra lo que quedó escrito la vez anterior

  // Por defecto propone el día que se está viendo en la tabla (nunca uno pasado)
  const hoy = new Date();
  const dia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + Math.max(diaOffset, 0));
  document.getElementById("cita-fecha").min = fechaISO(hoy);
  document.getElementById("cita-fecha").value = fechaISO(dia);
  document.getElementById("cita-hora").value = "09:00";
  document.getElementById("cita-estado").value = "confirmada";

  mostrarErrorCita("");
  actualizarResumenCita();
  dialogoCita.showModal();
}

// Devuelve el texto del primer error que encuentre, o "" si todo está bien
function validarCita(d) {
  if (d.origen === "whatsapp" && d.nombre === "") {
    return "Escribe el nombre del cliente.";
  }
  if (d.origen === "whatsapp" && d.telefono === "") {
    return "Para citas de WhatsApp el teléfono es obligatorio.";
  }
  if (d.telefono !== "" && !/^[0-9]{8}$/.test(d.telefono)) {
    return "El teléfono debe tener 8 dígitos, sin espacios ni letras.";
  }
  if (d.elegidos.length === 0) {
    return "Elige al menos un servicio.";
  }
  if (!d.barbero) {
    return "Primero agrega un barbero en la pestaña Barberos.";
  }
  if (d.fecha === "") {
    return "Elige la fecha.";
  }
  if (d.fecha < fechaISO(new Date())) {
    return "No se puede agendar en una fecha pasada.";
  }
  if (d.hora === "") {
    return "Elige la hora.";
  }

  // ¿Ese barbero trabaja ese día de la semana?
  const partes = d.fecha.split("-").map(Number);
  const diaSemana = new Date(partes[0], partes[1] - 1, partes[2]).getDay();
  if (!d.barbero.dias_trabajo.includes(diaSemana)) {
    return d.barbero.nombre + " no trabaja ese día de la semana.";
  }

  // ¿La cita cabe dentro de su horario?
  const inicio = aMinutos(d.hora);
  const fin = inicio + d.elegidos.reduce((suma, s) => suma + s.duracion_min, 0);
  if (inicio < aMinutos(d.barbero.hora_entrada) || fin > aMinutos(d.barbero.hora_salida)) {
    return "Fuera del horario de " + d.barbero.nombre + " (de " + d.barbero.hora_entrada +
      " a " + d.barbero.hora_salida + "). Esta cita terminaría a las " + aHora(fin) + ".";
  }

  // ¿Choca con otra cita? Misma regla que en la reserva de clientes.
  const offset = diasDesdeHoy(d.fecha);
  const choque = citas.find(c =>
    c.barbero_id === d.barbero.id &&
    c.dia_offset === offset &&
    c.estado !== "cancelada" &&
    inicio < aMinutos(c.hora_fin) &&
    fin > aMinutos(c.hora_inicio)
  );
  if (choque) {
    return d.barbero.nombre + " ya tiene una cita de " + choque.hora_inicio + " a " + choque.hora_fin + ".";
  }

  return "";
}

// Con solo 9.000 códigos posibles se pueden repetir: por eso se comprueba.
// En la base de datos real, el campo "codigo" será único.
function codigoNuevo() {
  let codigo;
  do {
    codigo = "JSF-" + Math.floor(1000 + Math.random() * 9000);
  } while (citas.some(c => c.codigo === codigo));
  return codigo;
}

formCita.addEventListener("submit", function (event) {
  event.preventDefault();

  const datos = {
    origen: document.getElementById("cita-origen").value,
    nombre: document.getElementById("cita-nombre").value.trim(),
    telefono: document.getElementById("cita-telefono").value.trim(),
    barbero: barberos.find(b => b.id === Number(document.getElementById("cita-barbero").value)),
    fecha: document.getElementById("cita-fecha").value,
    hora: document.getElementById("cita-hora").value,
    elegidos: serviciosElegidosCita()
  };

  const error = validarCita(datos);
  if (error !== "") {
    mostrarErrorCita(error);
    return;
  }

  const minutos = datos.elegidos.reduce((suma, s) => suma + s.duracion_min, 0);
  const offset = diasDesdeHoy(datos.fecha);

  citas.push({
    id: citas.reduce((mayor, c) => Math.max(mayor, c.id), 0) + 1,
    codigo: codigoNuevo(),
    cliente_nombre: datos.nombre === "" ? "Sin registro" : datos.nombre,
    cliente_telefono: datos.telefono,
    barbero_id: datos.barbero.id,
    dia_offset: offset,
    hora_inicio: datos.hora,
    hora_fin: aHora(aMinutos(datos.hora) + minutos),
    servicios: datos.elegidos.map(s => s.nombre),
    estado: document.getElementById("cita-estado").value,
    origen: datos.origen,
    total: datos.elegidos.reduce((suma, s) => suma + s.precio, 0)
  });

  diaOffset = offset; // la tabla salta al día de la cita nueva
  dibujarCitas();
  dialogoCita.close();
});

formCita.addEventListener("change", actualizarResumenCita);
formCita.addEventListener("input", actualizarResumenCita);

document.getElementById("cita-cancelar").addEventListener("click", function () {
  dialogoCita.close();
});

document.getElementById("btn-nueva-cita").addEventListener("click", abrirDialogoCita);