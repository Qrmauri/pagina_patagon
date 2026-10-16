# 🛒 Patagon Store — Full Stack E-Commerce

[![React](https://img.shields.io/badge/Frontend-React_18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Bundler-Vite_5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Django](https://img.shields.io/badge/Backend-Django_6.1-092E20?logo=django&logoColor=white)](https://www.djangoproject.com/)
[![DRF](https://img.shields.io/badge/API-Django_REST_Framework-red?logo=django)](https://www.django-rest-framework.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Una plataforma de comercio electrónico moderna, rápida y completamente funcional desarrollada desde cero con **React (Vite)** en el Frontend y **Django REST Framework** en el Backend.

Diseñada con una arquitectura desacoplada y modo híbrido resiliente (sincronización con API REST y persistencia local offline como respaldo).

---

## ✨ Características Principales

### 🛍️ Experiencia del Cliente
- **Catálogo Dinámico e Interactivo:** Búsqueda en tiempo real por texto, filtrado rápido por categorías (Juguetes, Electrónica, Libros) y ordenamiento por precio y nombre.
- **Vista Rápida (Quick View Modal):** Modal con detalle ampliado del producto, selector de cantidad y botón de compra rápida sin salir del catálogo.
- **Carrito Lateral (Cart Drawer):** Panel deslizable con control de cantidades, cálculo en vivo del subtotal y barra animada de progreso para envío gratis.
- **Checkout Integrado:** Formulario de despacho conectado al backend para registrar pedidos en la base de datos con validaciones completas.
- **Comunidad y Reseñas de Clientes:** Sistema interactivo donde los compradores pueden calificar la tienda de 1 a 5 estrellas, elegir su avatar y compartir su experiencia.
- **Notificaciones Toast:** Notificaciones flotantes elegantes que reemplazan las alertas nativas del navegador.
- **Diseño Responsivo:** Adaptado para teléfonos móviles, tablets y computadoras de escritorio.

### 🔐 Panel de Administración (Gestor de Tienda)
- **Acceso Protegido:** Autenticación de administrador con rutas protegidas (`/admin-productos`).
- **Gestión de Catálogo (CRUD):** Creación, edición y eliminación de productos con actualización instantánea en la tienda.
- **Subida de Fotografías:** Admite selección directa de archivos locales en formato **JPEG o PNG** (con vista previa en vivo) o enlaces web externos.
- **Gestión de Pedidos:** Visualización detallada de todos los pedidos realizados por los clientes con sus ítems, datos de despacho y totales.
- **Moderación de Reseñas:** Pestaña dedicada para revisar y moderar las opiniones enviadas por los usuarios.
- **Modo Resiliente:** Si el backend de Django no está iniciado, la tienda conmuta automáticamente a `localStorage` para no interrumpir la navegación.

---

## 🏗️ Arquitectura del Sistema

```text
Patagon Store
├── ⚛️ Frontend (React 18 + Vite) ─── Puerto :5173
│   ├── React Router DOM (Navegación SPA)
│   ├── Context API (Auth, Products, Cart, Toast)
│   └── API Client (Fetch con fallback offline)
│
├── 🐍 Backend (Django 6.1 + DRF) ─── Puerto :8000
│   ├── API REST (/api/products/, /api/orders/, /api/testimonials/)
│   ├── Media Engine (Manejo de archivos JPEG/PNG con Pillow)
│   └── CORS Headers (Comunicación cross-origin habilitada)
│
└── 🗄️ Base de Datos
    └── SQLite (Desarrollo local / Lista para migrar a PostgreSQL)
```

---

## 🛠️ Tecnologías Utilizadas

| Capa | Tecnologías |
|---|---|
| **Frontend** | React 18, Vite, React Router DOM v7, CSS Moderno (Variables, Flexbox, Grid), Context API |
| **Backend** | Python 3.11+, Django 6.1, Django REST Framework, Django Filter, Django CORS Headers, Pillow |
| **Base de Datos** | SQLite (Persistencia local) |
| **Herramientas** | ESLint, Git, PowerShell scripts para automatización |

---

## 🚀 Instalación y Ejecución Local

### Prerrequisitos
- [Node.js](https://nodejs.org/) (versión 18 o superior)
- [Python](https://www.python.org/) (versión 3.11 o superior)
- [Git](https://git-scm.com/)

---

### Opción 1: Un solo clic (Windows)
Ejecuta el archivo automatizado en la raíz del proyecto:
```cmd
iniciar-todo.bat
```
Este script iniciará tanto el servidor de Django como el de Vite en dos ventanas independientes.

---

### Opción 2: Paso a paso manual

#### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/patagon-store.git
cd patagon-store
```

#### 2. Configurar y levantar el Backend (Django)
```bash
cd patagon-backend

# Crear y activar entorno virtual
python -m venv .venv
# En Windows:
.\.venv\Scripts\Activate.ps1
# En Linux/Mac:
source .venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Comprobar dependencias:
python -m pip check

# Aplicar migraciones
# Desarrollo local (PowerShell):
$env:DJANGO_DEBUG = "true"
python manage.py migrate

# Iniciar servidor
python manage.py runserver 127.0.0.1:8000
```
> El backend quedará disponible en: `http://127.0.0.1:8000/api/`

#### 3. Configurar y levantar el Frontend (React)
En una segunda terminal, desde la raíz del proyecto:
```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```
> Abre tu navegador en: `http://localhost:5173/`

---

## 🔑 Acceso administrativo

- **Panel de Administración:** `http://localhost:5173/admin-login`
  - Crea tu cuenta con `python manage.py createsuperuser` desde `patagon-backend`.
  - Para creación automatizada, define `ADMIN_USER`, `ADMIN_EMAIL` y `ADMIN_PASSWORD` y ejecuta `python manage.py ensure_admin`.
  - `ensure_admin` conserva la contraseña de las cuentas existentes y no eleva los permisos de usuarios normales. Para cambiar una contraseña usa `python manage.py changepassword USUARIO`.

- **Django Admin Nativo:** `http://127.0.0.1:8000/admin/`
  *(Puedes crear tu propio superusuario con `python manage.py createsuperuser`)*

### Configuración del servidor

El backend lee variables del entorno del proceso; no carga archivos `.env` automáticamente.

Para desarrollo manual en PowerShell, establece `$env:DJANGO_DEBUG = "true"` antes de ejecutar Django. En Bash usa `export DJANGO_DEBUG=true`. El lanzador `start-backend.bat` activa este modo cuando la variable no está definida. En desarrollo se genera una clave aleatoria persistente en `patagon-backend/.django-secret-key`, excluida de Git.

Para producción configura:

- `DJANGO_DEBUG=false`.
- `DJANGO_SECRET_KEY`: clave aleatoria privada y persistente. Puedes generar una con `python -c "import secrets; print(secrets.token_urlsafe(64))"` y guardarla en el gestor de secretos del servidor.
- `DJANGO_ALLOWED_HOSTS`: dominios separados por comas, por ejemplo `api.tutienda.cl`.
- `DJANGO_CORS_ALLOWED_ORIGINS`: orígenes completos separados por comas, por ejemplo `https://tutienda.cl`.

Sin una clave explícita, el servidor rechaza el arranque en producción. Los valores predeterminados permiten únicamente hosts y orígenes locales. Configura HTTPS y los ajustes de seguridad correspondientes a tu hosting y ejecuta `python manage.py check --deploy` antes de publicar.

Los pedidos cancelados devuelven las existencias una sola vez y no pueden reabrirse; para repetir una compra crea un nuevo pedido. La API administrativa de pedidos permite modificar únicamente su estado para conservar los artículos y totales originales.

El entorno del backend se encuentra en `patagon-backend/.venv`. El lanzador usa ese entorno y detiene el inicio si fallan las comprobaciones o migraciones. El antiguo `venv` se conserva, pero ya no se utiliza.

El carrito limita las cantidades al stock del catálogo y actualiza precios y existencias antes de entrar al checkout. Si hay cambios, solicita revisar el carrito antes de continuar. En modo real, una caída de la API impide continuar hasta poder comprobar el catálogo; la demostración permite usar el catálogo local.

---

## 🔌 Endpoints de la API REST

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/products/` | Listar productos (soporta filtros `?category=`, `?search=`, `?ordering=`) |
| `POST` | `/api/products/` | Crear producto (soporta JSON o subida `multipart/form-data`) |
| `GET` / `PUT` / `DELETE` | `/api/products/{id}/` | Detalle, actualización o eliminación de un producto |
| `POST` | `/api/products/seed/` | Carga inicial de productos de muestra |
| `GET` | `/api/orders/` | Listar todos los pedidos de clientes |
| `POST` | `/api/orders/` | Crear nuevo pedido desde el checkout |
| `GET` | `/api/testimonials/` | Listar opiniones y testimonios de clientes |
| `POST` | `/api/testimonials/` | Enviar una nueva reseña con calificación en estrellas |
| `DELETE` | `/api/testimonials/{id}/` | Eliminar/moderar una reseña |

---

## 📁 Estructura del Proyecto

```text
pagina_8/
├── patagon-backend/               # Servidor Django REST
│   ├── catalog/                   # Aplicación de catálogo y pedidos
│   │   ├── models.py              # Modelos Product, Order, Testimonial
│   │   ├── serializers.py         # Serializadores DRF
│   │   ├── views.py               # ViewSets y endpoints
│   │   └── admin.py               # Configuración Django Admin
│   ├── productos/                 # Configuración principal de Django
│   │   ├── settings.py
│   │   └── urls.py
│   ├── media/                     # Archivos subidos (fotos de productos)
│   ├── requirements.txt           # Dependencias de Python
│   └── manage.py
├── src/                           # Aplicación Frontend React
│   ├── components/                # Componentes reutilizables (Navbar, Drawer, QuickView, etc.)
│   ├── context/                   # Contextos globales (Auth, Cart, Products, Toast)
│   ├── pages/                     # Vistas (Home, CategoryPage, CartPage, Admin, etc.)
│   ├── services/                  # Cliente API y utilidades de precios/datos
│   ├── App.css                    # Sistema de estilos y animaciones
│   └── main.jsx                   # Punto de entrada con ErrorBoundary
├── start-backend.bat              # Lanzador rápido de Django
├── start-frontend.bat             # Lanzador rápido de Vite
├── iniciar-todo.bat               # Lanzador conjunto con 1 solo clic
└── README.md
```

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Siéntete libre de utilizarlo, modificarlo y compartirlo como parte de tu portafolio.

