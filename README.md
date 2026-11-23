# Joseff Studio

Sistema web de reservas y administración para una barbería.

Proyecto final de la materia **Desarrollo de Aplicaciones Web** de la carrera de Ingeniería de Sistemas — UTEPSA.

## Información del proyecto

- **Nombre:** Joseff Studio
- **Autor:** Nicolas Justiniano Saavedra
- **Institución:** UTEPSA

## Acceso al sistema

El sistema se encuentra desplegado y disponible en:

- **Sitio web:** https://joseffstudio.site.je
- **Panel de administración:** https://joseffstudio.site.je/admin/login.html
- **Repositorio GitHub:** https://github.com/NicolasJustinianoS/proyecto-desarrollo-de-app-web

## Tecnologías utilizadas

### Backend
- PHP
- Laravel 12
- MySQL
- Laravel Sanctum para autenticación mediante tokens.

### Frontend
- HTML
- CSS
- JavaScript

## Arquitectura del sistema

Joseff Studio utiliza una arquitectura cliente-servidor
con separación entre frontend, backend y base de datos.

- **Frontend:** presenta las interfaces y consume la API
  mediante peticiones HTTP utilizando fetch().
- **Backend:** Laravel 12 procesa las solicitudes,
  aplica las reglas de negocio y gestiona la autenticación.
- **Base de datos:** MySQL almacena la información
  mediante modelos y relaciones gestionadas con Eloquent ORM.

La comunicación entre frontend y backend se realiza
mediante una API REST que intercambia información
en formato JSON.

## Funcionalidades principales

- Registro e inicio de sesión de clientes.
- Autenticación y control de acceso de administradores.
- Consulta de servicios, productos y barberos.
- Reserva de citas con código de reserva.
- Validación de disponibilidad de horarios.
- Administración de citas y cambio de estados.
- Registro de citas presenciales y por WhatsApp.
- CRUD de servicios, productos y barberos.

## Cómo ejecutar el proyecto en local

**Requisitos:** PHP 8.2 o superior, Composer y MySQL (Laragon incluye los tres).

1. Clonar el repositorio e ingresar a la carpeta del backend:

   ```bash
   git clone https://github.com/NicolasJustinianoS/proyecto-desarrollo-de-app-web.git
   cd proyecto-desarrollo-de-app-web/backend
   ```

2. Instalar las dependencias y preparar la configuración:

   ```bash
   composer install
   copy .env.example .env        # en Linux o macOS: cp .env.example .env
   php artisan key:generate
   ```

3. Crear una base de datos MySQL vacía llamada `joseff_studio`.

4. Abrir el archivo `backend/.env` y revisar los datos de la base de datos (`DB_*`). Definir también
   `ADMIN_EMAIL` y `ADMIN_PASSWORD` (mínimo 8 caracteres): esa será la cuenta del administrador.

5. Crear las tablas y cargar los datos iniciales:

   ```bash
   php artisan migrate
   php artisan db:seed
   ```

6. Iniciar la API (dejar esta terminal abierta):

   ```bash
   php artisan serve
   ```

7. En **otra** terminal, desde la raíz del proyecto, iniciar el frontend:

   ```bash
   php -S 127.0.0.1:5500 -t frontend
   ```

   También se puede abrir `frontend/index.html` con la extensión Live Server de VS Code.

8. Abrir **http://127.0.0.1:5500** en el navegador (usar `127.0.0.1`, no `localhost`).

Panel de administración: http://127.0.0.1:5500/admin/login.html, con el correo y la contraseña definidos en `ADMIN_EMAIL` y `ADMIN_PASSWORD`.

## API principal

| Método | Ruta | Acceso |
|---|---|---|
| GET | `/api/servicios`, `/api/barberos`, `/api/productos` | Público |
| GET | `/api/citas/ocupadas?barbero_id=&fecha=` | Público |
| POST | `/api/registro`, `/api/login` | Público |
| POST | `/api/citas` | Cliente con sesión |
| GET | `/api/mis-citas` | Cliente con sesión |
| GET, POST | `/api/admin/citas` | Administrador |
| PATCH, DELETE | `/api/admin/citas/{id}` | Administrador |
| GET, POST, PUT, DELETE | `/api/admin/servicios`, `/productos`, `/barberos` | Administrador |

## Estructura del proyecto

El proyecto está organizado en dos componentes principales: `backend`, que contiene la API REST y la lógica del negocio desarrollada con Laravel, y `frontend`, que contiene las interfaces web para clientes y administradores.

```text
proyecto-desarrollo-de-app-web/
│
├── backend/                         # Aplicación Laravel 12
│   │
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   ├── Api/
│   │   │   │   │   └── Admin/        # Controladores administrativos
│   │   │   ├── Middleware/           # Control de acceso y roles
│   │   │   └── Resources/            # Respuestas estructuradas en JSON
│   │   │
│   │   ├── Models/                   # Modelos Eloquent
│   │   ├── Providers/                # Proveedores de servicios
│   │   └── Services/                 # Lógica del negocio (CitaService)
│   │
│   ├── bootstrap/                    # Inicialización de Laravel
│   ├── config/                       # Configuración de la aplicación
│   │
│   ├── database/
│   │   ├── factories/                # Fábricas de datos
│   │   ├── migrations/               # Estructura de las tablas
│   │   └── seeders/                  # Datos iniciales
│   │
│   ├── public/                       # Punto de entrada de Laravel
│   ├── resources/
│   │   ├── css/
│   │   ├── js/
│   │   └── views/
│   │
│   ├── routes/                       # Definición de rutas de la API
│   ├── storage/                      # Archivos, caché y registros
│   ├── tests/
│   │   ├── Feature/                  # Pruebas funcionales
│   │   └── Unit/                     # Pruebas unitarias
│   │
│   ├── .env.example                  # Plantilla de variables de entorno
│   ├── artisan                       # Consola de Laravel
│   └── composer.json                 # Dependencias PHP
│
├── frontend/                         # Aplicación web
│   ├── index.html                    # Inicio y catálogo
│   ├── login.html                    # Registro e ingreso de clientes
│   ├── reservar.html                 # Reserva de citas
│   ├── admin/                        # Panel de administración (login.html, panel.html)
│   ├── css/                          # Estilos visuales
│   └── js/                           # Lógica e interacción con la API
│
├── .gitattributes
├── .gitignore
└── README.md
```

### Descripción de los componentes

**Backend:** desarrollado en PHP con Laravel 12. Gestiona la autenticación, las reservas, las validaciones, las reglas del negocio y el acceso a MySQL mediante Eloquent ORM.

**Frontend:** desarrollado con HTML, CSS y JavaScript. Contiene el sitio público para clientes y el panel privado de administración. Se comunica con el backend mediante peticiones HTTP utilizando `fetch()`.

**Base de datos:** las migraciones de Laravel se encuentran en `backend/database/migrations` y definen la estructura de las tablas del sistema. Los datos iniciales (catálogo y administrador) los carga el seeder.

**Seguridad:** Laravel Sanctum gestiona la autenticación mediante tokens; el middleware `EsAdmin` protege las operaciones restringidas; las contraseñas se guardan cifradas y los datos se validan en el servidor. El archivo `.env` no se incluye en el repositorio: se usa la plantilla `.env.example`.
