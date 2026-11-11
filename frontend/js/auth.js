// ----- Elementos que vamos a usar -----
const tabLogin = document.getElementById("tab-login");
const tabRegistro = document.getElementById("tab-registro");
const formLogin = document.getElementById("form-login");
const formRegistro = document.getElementById("form-registro");

// ----- Cambiar entre "Ingresar" y "Crear cuenta" -----
function mostrarFormulario(cual) {
  const esLogin = cual === "login";
  formLogin.classList.toggle("oculto", !esLogin);
  formRegistro.classList.toggle("oculto", esLogin);
  tabLogin.classList.toggle("activa", esLogin);
  tabRegistro.classList.toggle("activa", !esLogin);
}

tabLogin.addEventListener("click", function () {
  mostrarFormulario("login");
});
tabRegistro.addEventListener("click", function () {
  mostrarFormulario("registro");
});

// ----- Funciones de ayuda -----
function mostrarMensaje(elemento, texto, tipo) {
  elemento.textContent = texto;
  elemento.className = "mensaje " + tipo; // tipo: "error" u "ok"
}

function correoValido(correo) {
  // Texto + @ + texto + . + texto, sin espacios
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
}

// ----- Validación del ingreso -----
formLogin.addEventListener("submit", function (event) {
  event.preventDefault(); // evita que la página se recargue

  const correo = document.getElementById("login-correo").value.trim();
  const password = document.getElementById("login-password").value;
  const mensaje = document.getElementById("mensaje-login");

  if (correo === "" || password === "") {
    mostrarMensaje(mensaje, "Completa todos los campos.", "error");
    return;
  }
  if (!correoValido(correo)) {
    mostrarMensaje(mensaje, "Escribe un correo válido.", "error");
    return;
  }

  mostrarMensaje(mensaje, "Datos válidos. Falta conectar con el servidor.", "ok");
});

// ----- Validación del registro -----
formRegistro.addEventListener("submit", function (event) {
  event.preventDefault();

  const nombre = document.getElementById("reg-nombre").value.trim();
  const apellido = document.getElementById("reg-apellido").value.trim();
  const correo = document.getElementById("reg-correo").value.trim();
  const telefono = document.getElementById("reg-telefono").value.trim();
  const password = document.getElementById("reg-password").value;
  const password2 = document.getElementById("reg-password2").value;
  const mensaje = document.getElementById("mensaje-registro");

  if (nombre === "" || apellido === "" || correo === "" || telefono === "" || password === "" || password2 === "") {
    mostrarMensaje(mensaje, "Completa todos los campos.", "error");
    return;
  }
  if (!correoValido(correo)) {
    mostrarMensaje(mensaje, "Escribe un correo válido.", "error");
    return;
  }
  if (!/^[0-9]{8}$/.test(telefono)) {
    mostrarMensaje(mensaje, "El teléfono debe tener 8 dígitos, sin espacios ni letras.", "error");
    return;
  }
  if (password.length < 8) {
    mostrarMensaje(mensaje, "La contraseña debe tener al menos 8 caracteres.", "error");
    return;
  }
  if (password !== password2) {
    mostrarMensaje(mensaje, "Las contraseñas no coinciden.", "error");
    return;
  }

  mostrarMensaje(mensaje, "Datos válidos. Falta conectar con el servidor.", "ok");
});