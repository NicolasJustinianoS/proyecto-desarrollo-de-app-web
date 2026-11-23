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
- Laravel
- MySQL
- Laravel Sanctum para autenticación mediante tokens.

### Frontend
- HTML
- CSS
- JavaScript

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
│   ├── admin/                        # Panel de administración
│   ├── css/                          # Estilos visuales
│   └── js/                           # Lógica e interacción con la API
│
├── .gitattributes
├── .gitignore
└── README.md
```

### Descripción de los componentes

**Backend:** desarrollado con Laravel 12. Gestiona la autenticación, las reservas, las validaciones, las reglas del negocio y el acceso a MySQL mediante Eloquent ORM.

**Frontend:** desarrollado con HTML, CSS y JavaScript. Contiene el sitio público para clientes y el panel privado de administración. Se comunica con el backend mediante peticiones HTTP utilizando `fetch()`.

**Base de datos:** las migraciones de Laravel se encuentran en `backend/database/migrations` y definen la estructura de las tablas del sistema.

**Seguridad:** Laravel Sanctum gestiona la autenticación mediante tokens y el middleware administrativo protege las operaciones restringidas.

## Funcionalidades principales

- Registro e inicio de sesión de clientes.
- Autenticación y control de acceso de administradores.
- Consulta de servicios, productos y barberos.
- Reserva de citas.
- Validación de disponibilidad de horarios.
- Administración de citas y cambio de estados.
- Registro de citas presenciales y por WhatsApp.
- Gestión de servicios, productos y barberos.
