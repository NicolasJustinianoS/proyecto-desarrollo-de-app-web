const formAdmin = document.getElementById("form-admin");
const mensajeAdmin = document.getElementById("mensaje-admin");

function correoValido(correo) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
}

function mostrarError(texto) {
  mensajeAdmin.textContent = texto;
  mensajeAdmin.className = "mensaje error";
}

formAdmin.addEventListener("submit", function (event) {
  event.preventDefault();

  const correo = document.getElementById("admin-correo").value.trim();
  const password = document.getElementById("admin-password").value;

  if (correo === "" || password === "") {
    mostrarError("Completa todos los campos.");
    return;
  }
  if (!correoValido(correo)) {
    mostrarError("Escribe un correo válido.");
    return;
  }
  if (password.length < 8) {
    mostrarError("La contraseña debe tener al menos 8 caracteres.");
    return;
  }

  // SOLO PARA EL PROTOTIPO: aquí no se verifica nada de verdad.
  // Con Laravel, el servidor comprobará el correo y la contraseña
  // y devolverá un token si son correctos.
  sessionStorage.setItem("adminDemo", "si");
  window.location.href = "panel.html";
});