// ----- Funciones que dibujan cada lista -----

function mostrarServicios(servicios) {
  const contenedor = document.getElementById("lista-servicios");
  contenedor.innerHTML = "";
  servicios.forEach(servicio => {
    contenedor.innerHTML += `
      <article class="tarjeta">
        <h3>${escapar(servicio.nombre)}</h3>
        <p>${escapar(servicio.descripcion)}</p>
        <div class="tarjeta-pie">
          <span class="precio">Bs ${servicio.precio}</span>
          <span class="detalle">${servicio.duracion_min} min</span>
        </div>
      </article>`;
  });
}

function mostrarProductos(productos) {
  const contenedor = document.getElementById("lista-productos");
  contenedor.innerHTML = "";
  productos.forEach(producto => {
    contenedor.innerHTML += `
      <article class="tarjeta">
        <h3>${escapar(producto.nombre)}</h3>
        <p>${escapar(producto.descripcion)}</p>
        <div class="tarjeta-pie">
          <span class="precio">Bs ${producto.precio}</span>
        </div>
      </article>`;
  });
}

function mostrarBarberos(barberos) {
  const contenedor = document.getElementById("lista-barberos");
  contenedor.innerHTML = "";
  barberos.forEach(barbero => {
    const iniciales = barbero.nombre.charAt(0) + barbero.apellido.charAt(0);
    contenedor.innerHTML += `
      <article class="tarjeta tarjeta-barbero">
        <div class="avatar">${escapar(iniciales)}</div>
        <h3>${escapar(barbero.nombre)} ${escapar(barbero.apellido)}</h3>
        <p>${escapar(barbero.rol)}</p>
      </article>`;
  });
}

// ----- Carga de datos -----

// Pide los datos y, si todo sale bien, ejecuta la función que los dibuja.
// "mostrar" es una función que se recibe como argumento.
function cargarLista(ruta, idContenedor, mostrar) {
  obtenerDatos(ruta)
    .then(mostrar)
    .catch(error => {
      console.error(error);
      document.getElementById(idContenedor).textContent =
        "No se pudo cargar la información. Intenta de nuevo más tarde.";
    });
}

cargarLista(API_URL + "/servicios", "lista-servicios", mostrarServicios);
cargarLista(API_URL + "/productos", "lista-productos", mostrarProductos);
cargarLista(API_URL + "/barberos", "lista-barberos", mostrarBarberos);