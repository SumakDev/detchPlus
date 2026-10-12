# 📘 DetchPlus — Manual de Arquitectura, Funcionamiento y Roadmap

> **Estado del Proyecto:** Operativo y estabilizado.  
> **Versión:** 1.0.0-dev  
> **Entorno:** Desarrollo / Staging (Railway MySQL + Node.js Express + Next.js 16)

---

## 1. 📌 Resumen Ejecutivo y Propósito

**DetchPlus** es una plataforma integral de gestión comercial y servicio técnico especializada en productos Apple y tecnología (iPhones, Apple Watch, consolas y accesorios). Combina:

1. **E-commerce & Portal de Clientes:** Catálogo de productos con imágenes, filtros, cotizaciones, carrito de compras y seguimiento de órdenes de servicio.
2. **Panel de Control Administrativo (Backoffice):** Gestión de inventario en tiempo real (stock disponible vs. reservado, alertas críticas), facturación física, trazabilidad de reparaciones técnicas con asignación de técnicos, y control de accesos basado en roles (RBAC).

---

## 2. 🏗️ Arquitectura de la Solución

El sistema sigue una arquitectura desacoplada **Cliente-Servidor (SPA/SSR + REST API)**:

```
┌─────────────────────────────────┐       HTTP / JSON        ┌─────────────────────────────────┐
│     Next.js 16 (React 19)       │  ◄────────────────────►  │     Express.js API (ESM)        │
│   detch-plus fronted (Port 3000)│    Bearer JWT / CORS     │   detch-plus-backend (Port 4000)│
└─────────────────────────────────┘                          └─────────────────────────────────┘
                                                                               │
                                                                       Sequelize 6 (ORM)
                                                                               ▼
                                                             ┌─────────────────────────────────┐
                                                             │   MySQL 8.0 (Railway Cloud DB)  │
                                                             │     Proxy SSL: 24845 / TCP      │
                                                             └─────────────────────────────────┘
```

### Stack Tecnológico

| Capa | Tecnología | Características Clave |
|---|---|---|
| **Frontend** | Next.js 16.2.6 (App Router) | React 19, Turbopack, Tailwind CSS v4, Lucide React, Radix UI |
| **Backend** | Node.js (ES Modules) + Express 4 | Rutas modulares, JWT stateless, Sequelize ORM, Multer (archivos) |
| **Base de Datos** | MySQL 8.0 en Railway | Esquema normalizado (3ª forma normal), Vistas SQL, Índices optimizados |
| **Autenticación** | JWT (JSON Web Tokens) | Algoritmo HS256, expiración 1 día, hashes con bcryptjs (10 rondas) |

---

## 3. 🔐 Matriz de Seguridad y Roles (RBAC)

El sistema cuenta con 5 roles predefinidos en la tabla `ROLES`:

| ID_ROL | Nombre | Tipo de Acceso | Alcance y Permisos |
|---|---|---|---|
| **1** | `SUPER_ADMIN` | Control Total | Acceso a todo el sistema, gestión de usuarios, roles, catálogo, stock, facturación y reportes. |
| **2** | `ADMIN` | Gestión de Tienda | Ventas, inventario, servicio técnico y lectura de usuarios. |
| **3** | `EMPLEADO` | Operativo Tienda | Registro de ventas, consulta de stock, registro de clientes y órdenes de servicio. |
| **4** | `CLIENTE_WEB` | Público / Cliente | Catálogo, portal personal (`/mi-cuenta`), compras online y consulta de sus reparaciones. |
| **5** | `CLIENTE_FISICO` | Consulta | Cliente de tienda física (historial de compras en mostrador). |

### Middlewares de Protección (`backend/middleware/auth.js`)
* `requireAuth()`: Valida que la cabecera `Authorization: Bearer <token>` sea válida y que el usuario esté en estado `ACTIVO`.
* `denyWebUser()`: Impide que usuarios con `ID_ROL = 4` (clientes web) accedan a endpoints administrativos.
* `requireRoles([1, 2])`: Restringe endpoints exclusivamente a roles específicos.

---

## 4. 🗄️ Modelo de Datos y Entidades Principales

El esquema relacional cuenta con 35 tablas y 5 vistas. Los dominios principales son:

```
[CATEGORIAS] ──< [PRODUCTOS] >── [STOCK]
                       │            │
[MARCAS] ──────<       │            └──< [MOV_INV]
                       ▼
[MODELOS] ────<  [DET_FAC] >── [FACTURAS] >── [CLIENTES]
                       │                           ▲
[TECNICOS] ────< [SER_TEC] ────────────────────────┘
```

1. **Catálogo & Productos:**
   * `CATEGORIAS`: Tipos de producto (`TELEFONO`, `RELOJ`, `CONSOLA`, `ESTUCHE`, `ACCESORIO`).
   * `MARCAS` y `MODELOS`: Jerarquía de marcas y modelos (ej. Apple -> iPhone 15 Pro).
   * `PRODUCTOS`: Código de barras (`COD_BAR_PRO`), IMEI, origen (`ORG_PRO`), estado cosmético (`EST_PRO`) e imagen (`IMG_URL`).

2. **Inventario en Tiempo Real:**
   * `STOCK`: Control 1 a 1 por producto (`CAN_DIS_STO`: disponible, `CAN_RES_STO`: reservado, `STO_MIN`, `STO_MAX`).
   * `MOV_INV`: Kardex de auditoría (`ENTRADA`, `SALIDA`, `AJUSTE`).

3. **Ventas y Facturación:**
   * `FACTURAS`: Cabecera de venta con cliente, empleado, subtotal, IVA (15%) y total.
   * `DET_FAC`: Renglones individuales de productos facturados.
   * `EVA_PAR_PAG` & `PAR_PAG_APL`: Evaluación de celulares usados entregados como parte de pago.

4. **Servicio Técnico:**
   * `TECNICOS`: Registro de personal de soporte con estado activo/inactivo (`EST_TEC`).
   * `SER_TEC`: Órdenes de trabajo (`RECIBIDO`, `EN_PROCESO`, `TERMINADO`, `ENTREGADO`).
   * `DET_SER`: Detalle técnico (IMEI, diagnóstico, repuestos, solución aplicada).

---

## 5. 🛠️ Correcciones Implementadas en esta Sesión

Durante el análisis exhaustivo del código, se detectaron y corrigieron las siguientes anomalías:

1. **Liberación del Catálogo Público (`GET /api/productos`):**
   * *Problema:* El middleware `requireAuth()` estaba en `routes/index.js` sobre toda la ruta `/api/productos`. Esto causaba que visitantes no autenticados o clientes web recibieran `401 Unauthorized` / `403 Forbidden` al querer ver los productos.
   * *Solución:* Se dejó `GET /api/productos` público y se protegieron individualmente las mutaciones (`POST`, `PUT`, `DELETE`) en `routes/productos.routes.js`.

2. **Endpoint Faltante de Técnicos (`PATCH /api/tecnicos/:id/estado`):**
   * *Problema:* El frontend disparaba una petición PATCH al cambiar el estado del switch de un técnico, pero la ruta no existía en el backend (retornaba 404).
   * *Solución:* Se implementó `patchEstado` en `controllers/tecnicos.controller.js` y se registró la ruta en `routes/tecnicos.routes.js`. Además se añadió soporte de búsqueda por texto (`q`) y estado (`act`) en `getAll`.

3. **Seguridad y Carga de Relaciones en Usuarios:**
   * *Problema:* `USUARIOS.findAll()` exponía el hash de contraseñas (`PAS_HAS_USU`) y no incluía el modelo `ROLES`.
   * *Solución:* Se configuró exclusión de contraseñas y carga eager (`as: 'rol'`), resolviendo el nombre de rol en la tabla administrativa.

4. **CORS con Múltiples Orígenes:**
   * *Problema:* `middleware/cors.js` pasaba el string plano de `WEB_ORIGIN` en lugar del arreglo parseado.
   * *Solución:* Ahora soporta orígenes múltiples delimitados por coma.

5. **Independencia de Variables de Entorno en BD:**
   * *Problema:* `config/database.js` no importaba `dotenv/config`, provocando errores de conexión `ECONNREFUSED ::1:3306` si se invocaba fuera del contexto de `server.js`.
   * *Solución:* Se añadió `import "dotenv/config";` en la primera línea.

6. **Creación de Módulos Faltantes para Evitar Errores 404:**
   * Se crearon los controladores y rutas de **Ventas** (`/api/ventas` y `/api/ventas/resumen`) y **Reportes** (`/api/reportes` y `/api/reportes/resumen`).
   * Se crearon las páginas en el frontend:
     * `/ventas`: Listado de facturas y registro de ventas con actualización de inventario.
     * `/reportes`: Panel analítico con exportación a CSV.
     * `/mi-cuenta`: Portal del cliente para eliminar el 404 que sufrían los usuarios con rol 4.
     * `UserMenu`: Se agregó botón directo al Dashboard cuando el usuario es administrador o empleado.

---

## 6. 🚀 Guía de Puesta en Marcha Local

### Prerrequisitos
* Node.js v18+ (recomendado Node 20 o 22)
* Acceso a internet (para conectar con la base de datos de Railway)

### 1. Backend (`detch-plus-backend`)
```bash
cd detch-plus-backend
npm install
npm run dev   # Ejecuta: node --watch server.js en puerto 4000
```
*Variables de entorno requeridas (`.env`):*
```env
PORT=4000
WEB_ORIGIN=http://localhost:3000
JWT_SECRET=tu_secreto_muy_largo
JWT_EXPIRES_IN=1d

DB_HOST=viaduct.proxy.rlwy.net
DB_PORT=24845
DB_DATABASE=detchPlus
DB_USERNAME=root
DB_PASSWORD=...

# Servicio de Correo (Opcional en dev: usa Ethereal automáticamente)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_correo@gmail.com
SMTP_PASS=tu_password_de_aplicacion
SMTP_FROM="DetchPlus Soporte" <no-reply@detchplus.com>
```

### 2. Frontend (`detch-plus fronted`)
```bash
cd "detch-plus fronted"
npm install
npm run dev   # Ejecuta: next dev --turbopack en puerto 3000
```
*Variables de entorno requeridas (`.env.local`):*
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

---

## 7. 🎯 Estado del Roadmap y Funcionalidades Completadas

### Fase 1: Tienda Online, Carrito y Checkout (✅ COMPLETADA)
- [x] **Conexión Dinámica de Productos:** Conectado `src/app/page.tsx` a `GET /api/productos` con mapeo de stock y precios reales, búsqueda en vivo y filtros por categoría.
- [x] **Sistema de Carrito de Compras (`CartContext`):** Persistencia en `localStorage`, cálculo de IVA (15%), subtotales y total.
- [x] **Cajón Deslizable (`CartDrawer.tsx`):** Panel lateral interactivo con controles de cantidad (+/-), eliminación y navegación directa al pago.
- [x] **Pantalla de Checkout (`/checkout`):** Formulario de contacto, dirección de entrega con persistencia en `DIR_USU`, selector de método de pago (Efectivo, Transferencia, Tarjeta) y confirmación con código de rastreo.
- [x] **Endpoint Transaccional de Pedidos (`POST /api/ped_onl`):** Registro atómico de `PED_ONL`, `DET_PED_ONL` y `DIR_USU`.

### Fase 2: Autenticación Avanzada, Seguridad y Emails (✅ COMPLETADA)
- [x] **Servicio de Correos Automatizados (`email.service.js`):** Integración de `nodemailer` con templates HTML estilo Apple y fallback automático a Ethereal en desarrollo.
- [x] **Recuperación de Contraseña:** Modal `ForgotPasswordModal.tsx` integrado en `LoginModal.tsx` ("¿Olvidaste tu contraseña?"), generación de tokens `TOK_RES_USU` y página dedicada `src/app/reset-password/page.tsx`.
- [x] **Verificación de Correo de Cuenta:** Envío de correo de bienvenida con token `TOK_VER_USU` tras el registro y página de validación `src/app/verificar-correo/page.tsx`.

### Fase 3: Portal de Seguimiento de Servicio Técnico (✅ COMPLETADA)
- [x] **Búsqueda Pública de Reparaciones:** Endpoint público `GET /api/servicios-tecnicos/seguimiento/:query` que permite buscar por número de orden o número de cédula.
- [x] **Modal de Seguimiento para Clientes (`ServiceTrackingModal.tsx`):** Accesible desde el Navbar y la sección de Soporte, mostrando estado en tiempo real (`RECIBIDO`, `EN_PROCESO`, `TERMINADO`, `ENTREGADO`), dispositivo, falla, solución y técnico asignado.

### Fase 4: Despliegue a Producción (Siguiente Paso)
- [ ] **Despliegue Backend:** Desplegar el backend en Railway o Render usando el archivo `render.yaml` existente.
- [ ] **Despliegue Frontend:** Desplegar en Vercel conectando el repositorio de GitHub.

