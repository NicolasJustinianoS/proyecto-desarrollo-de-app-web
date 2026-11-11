// ----- Definición de cada catálogo -----
// En vez de escribir tres formularios y tres tablas casi iguales, describimos
// qué campos tiene cada catálogo y el código se encarga del resto.

const NOMBRES_DIAS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const ORDEN_SEMANA = [1, 2, 3, 4, 5, 6, 0]; // la semana empieza el lunes

const CATALOGOS = {
  servicios: {
    singular: "servicio",
    columnas: 5,
    campos: [
      { nombre: "nombre", etiqueta: "Nombre", tipo: "text", defecto: "" },
      { nombre: "descripcion", etiqueta: "Descripción", tipo: "textarea", defecto: "" },
      { nombre: "precio", etiqueta: "Precio (Bs)", tipo: "number", min: 1, defecto: "" },
      { nombre: "duracion_min", etiqueta: "Duración (minutos)", tipo: "number", min: 5, defecto: "" }
    ]
  },
  productos: {
    singular: "producto",
    columnas: 4,
    campos: [
      { nombre: "nombre", etiqueta: "Nombre", tipo: "text", defecto: "" },
      { nombre: "descripcion", etiqueta: "Descripción", tipo: "textarea", defecto: "" },
      { nombre: "precio", etiqueta: "Precio (Bs)", tipo: "number", min: 1, defecto: "" }
    ]
  },
  barberos: {
    singular: "barbero",
    columnas: 5,
    campos: [
      { nombre: "nombre", etiqueta: "Nombre", tipo: "text", defecto: "" },
      { nombre: "apellido", etiqueta: "Apellido", tipo: "text", defecto: "" },
      { nombre: "rol", etiqueta: "Rol", tipo: "text", defecto: "Barbero" },
      { nombre: "hora_entrada", etiqueta: "Hora de entrada", tipo: "time", defecto: "09:00" },
      { nombre: "hora_salida", etiqueta: "Hora de salida", tipo: "time", defecto: "19:00" },
      { nombre: "dias_trabajo", etiqueta: "Días de trabajo", tipo: "dias", defecto: [1, 2, 3, 4, 5, 6] }
    ]
  }
};

// Cómo se ve cada fila de la tabla (sin la celda de acciones)
const FILAS = {
  servicios: s => `
    <td>${escapar(s.nombre)}</td>
    <td class="detalle">${escapar(s.descripcion)}</td>
    <td class="precio">Bs ${s.precio}</td>
    <td>${s.duracion_min} min</td>`,
  productos: p => `
    <td>${escapar(p.nombre)}</td>
    <td class="detalle">${escapar(p.descripcion)}</td>
    <td class="precio">Bs ${p.precio}</td>`,
  barberos: b => `
    <td>${escapar(b.nombre)} ${escapar(b.apellido)}</td>
    <td>${escapar(b.rol)}</td>
    <td>${b.hora_entrada} a ${b.hora_salida}</td>
    <td>${diasEnTexto(b.dias_trabajo)}</td>`
};

// ----- Estado del diálogo -----
const dialogo = document.getElementById("dialogo");
const formCatalogo = document.getElementById("form-catalogo");
let tipoActual = null;          // "servicios", "productos" o "barberos"
let elementoEditando = null;    // null = se está agregando uno nuevo

// ----- Utilidades -----
function obtenerLista(tipo) {
  if (tipo === "servicios") {
    return servicios;
  }
  if (tipo === "productos") {
    return productos;
  }
  return barberos;
}

function diasEnTexto(dias) {
  return ORDEN_SEMANA
    .filter(d => dias.includes(d))
    .map(d => NOMBRES_DIAS[d])
    .join(", ");
}

function mostrarErrorDialogo(texto) {
  const elemento = document.getElementById("mensaje-dialogo");
  elemento.textContent = texto;
  elemento.className = "mensaje error";
}

// ----- Tablas -----
function dibujarCatalogo(tipo) {
  const lista = obtenerLista(tipo);
  const definicion = CATALOGOS[tipo];
  const cuerpo = document.getElementById("tabla-" + tipo);

  if (lista.length === 0) {
    cuerpo.innerHTML = `<tr><td colspan="${definicion.columnas}" class="vacio">Todavía no hay elementos. Usa el botón «Agregar».</td></tr>`;
    return;
  }

  cuerpo.innerHTML = lista.map(elemento => `
    <tr>
      ${FILAS[tipo](elemento)}
      <td>
        <div class="acciones">
          <button type="button" class="enlace-accion" onclick="abrirDialogo('${tipo}', ${elemento.id})">Editar</button>
          <button type="button" class="enlace-accion peligro" onclick="eliminarElemento('${tipo}', ${elemento.id})">Eliminar</button>
        </div>
      </td>
    </tr>`).join("");
}

function dibujarCatalogos() {
  ["servicios", "productos", "barberos"].forEach(tipo => dibujarCatalogo(tipo));
}

// ----- Diálogo para agregar y editar -----
function htmlCampo(campo, valor) {
  const id = "campo-" + campo.nombre;

  if (campo.tipo === "textarea") {
    return `<label for="${id}">${campo.etiqueta}</label>
            <textarea id="${id}" rows="3">${escapar(valor)}</textarea>`;
  }

  if (campo.tipo === "dias") {
    const cajas = ORDEN_SEMANA.map(d => `
      <label class="check">
        <input type="checkbox" name="dias" value="${d}" ${valor.includes(d) ? "checked" : ""}>
        ${NOMBRES_DIAS[d]}
      </label>`).join("");
    return `<p class="etiqueta-grupo">${campo.etiqueta}</p><div class="dias">${cajas}</div>`;
  }

  const minimo = campo.tipo === "number" ? ` min="${campo.min}"` : "";
  return `<label for="${id}">${campo.etiqueta}</label>
          <input type="${campo.tipo}" id="${id}" value="${escapar(valor)}"${minimo}>`;
}

// Si se pasa un id se edita ese elemento; si no, se agrega uno nuevo
function abrirDialogo(tipo, id) {
  tipoActual = tipo;
  const definicion = CATALOGOS[tipo];
  elementoEditando = id === undefined ? null : obtenerLista(tipo).find(e => e.id === id);

  document.getElementById("dialogo-titulo").textContent =
    (elementoEditando === null ? "Agregar " : "Editar ") + definicion.singular;

  document.getElementById("dialogo-campos").innerHTML = definicion.campos
    .map(campo => {
      const valor = elementoEditando === null ? campo.defecto : elementoEditando[campo.nombre];
      return htmlCampo(campo, valor);
    })
    .join("");

  mostrarErrorDialogo("");
  dialogo.showModal();
}

// Lee un campo del formulario y lo valida.
// Devuelve { valor } si está bien o { error } si no.
function leerCampo(campo) {
  if (campo.tipo === "dias") {
    const marcados = Array.from(document.querySelectorAll("#dialogo-campos input[name='dias']:checked"))
      .map(caja => Number(caja.value))
      .sort((a, b) => ORDEN_SEMANA.indexOf(a) - ORDEN_SEMANA.indexOf(b));
    if (marcados.length === 0) {
      return { error: "Elige al menos un día de trabajo." };
    }
    return { valor: marcados };
  }

  const texto = document.getElementById("campo-" + campo.nombre).value.trim();
  if (texto === "") {
    return { error: "Completa el campo «" + campo.etiqueta + "»." };
  }

  if (campo.tipo === "number") {
    const numero = Number(texto);
    if (!Number.isFinite(numero) || numero < campo.min) {
      return { error: campo.etiqueta + " debe ser un número de " + campo.min + " o más." };
    }
    return { valor: numero };
  }

  return { valor: texto };
}

formCatalogo.addEventListener("submit", function (event) {
  event.preventDefault();

  const nuevo = {};
  for (const campo of CATALOGOS[tipoActual].campos) {
    const resultado = leerCampo(campo);
    if (resultado.error) {
      mostrarErrorDialogo(resultado.error);
      return;
    }
    nuevo[campo.nombre] = resultado.valor;
  }

  // Las horas "HH:MM" se pueden comparar como texto porque siempre tienen 5 caracteres
  if (tipoActual === "barberos" && nuevo.hora_entrada >= nuevo.hora_salida) {
    mostrarErrorDialogo("La hora de entrada debe ser anterior a la de salida.");
    return;
  }

  const lista = obtenerLista(tipoActual);
  if (elementoEditando === null) {
    // Simula el autoincremental de la base de datos: el id más alto + 1
    nuevo.id = lista.reduce((mayor, e) => Math.max(mayor, e.id), 0) + 1;
    lista.push(nuevo);
  } else {
    // Cambia el objeto existente en su lugar
    Object.assign(elementoEditando, nuevo);
  }

  dibujarCatalogo(tipoActual);
  if (tipoActual === "barberos") {
    dibujarCitas(); // la tabla de citas muestra el nombre del barbero
  }
  dialogo.close();
});

document.getElementById("dialogo-cancelar").addEventListener("click", function () {
  dialogo.close();
});

document.querySelectorAll("[data-nuevo]").forEach(boton => {
  boton.addEventListener("click", function () {
    abrirDialogo(boton.dataset.nuevo);
  });
});

// ----- Eliminar -----
function eliminarElemento(tipo, id) {
  const lista = obtenerLista(tipo);
  const indice = lista.findIndex(e => e.id === id);
  const elemento = lista[indice];

  if (!confirm("¿Eliminar «" + elemento.nombre + "»? No se puede deshacer.")) {
    return;
  }

  lista.splice(indice, 1);
  dibujarCatalogo(tipo);
  if (tipo === "barberos") {
    dibujarCitas();
  }
}