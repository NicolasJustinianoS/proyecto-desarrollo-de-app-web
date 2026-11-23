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

  // El servidor comprueba el correo y la contraseña y devuelve un token si son correctos
  peticion(API_URL + "/login", "POST", { email: correo, password: password })
    .then(datos => {
      if (datos.user.rol !== "admin") {
        // Es un cliente: no entra al panel. Se cierra la sesión que se acaba de abrir.
        guardarSesion(datos.token, datos.user);
        return peticion(API_URL + "/logout", "POST").finally(() => {
          limpiarSesion();
          mostrarError("Esta cuenta no tiene permiso de administrador.");
        });
      }
      guardarSesion(datos.token, datos.user);
      window.location.href = "panel.html";
    })
    .catch(error => mostrarError(textoError(error)));
});