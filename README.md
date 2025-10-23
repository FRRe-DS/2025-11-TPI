# 2025-11-TPI
Desarrollo de Software 2025 - Grupo 11 - TPI
---

##  Descripción:

Este proyecto forma parte del **Trabajo Práctico Integrador (TPI)** de la cátedra **Desarrollo de Software**.  
El objetivo general del sistema es implementar una plataforma de gestión empresarial compuesta por distintos subsistemas , comunicados entre sí mediante **APIs REST**.

Este repositorio corresponde al **subsistema de Stock**.  
Desde esta interfaz web, los usuarios pueden visualizar métricas, administrar productos, controlar entradas y salidas de stock, y consultar el historial de movimientos.

----

## 🖥️ Funcionalidades principales

- 🔐 **Login** con acceso al panel principal del sistema.  
- 📊 **Dashboard general** con indicadores visuales (gráficos y métricas del stock).  
- 📦 **Inventario**: listado, alta, baja y modificación de productos.  
- 📋 **Auditoría**: registro histórico de movimientos (entradas, salidas, ajustes, reservas).  
- 🧭 **Navegación fluida** entre secciones mediante rutas internas.

---
## Tecnologías principales utilizadas (Backend)

- **Next.js (API Routes, App Router)**: Framework React para SSR y API endpoints.
- **TypeScript**: Tipado estático para mayor robustez y mantenibilidad.
- **PostgreSQL**: Base de datos relacional, gestionada vía Docker y scripts SQL.
- **pg**: Cliente Node.js para PostgreSQL.
- **JWT / JOSE / jsonwebtoken**: Autenticación y validación de tokens JWT (Keycloak compatible).
- **Keycloak**: (Opcional/configurable) para gestión de usuarios y roles vía OAuth2/OpenID Connect.
- **TailwindCSS**: Utilidades CSS para estilos rápidos y modernos.
- **PostCSS**: Procesador CSS para Tailwind y otros plugins.
- **dotenv**: Manejo de variables de entorno.
- **OpenAPI 3.0**: Documentación y especificación de la API (`public/openapi.yaml`).
- **Docker Compose**: Orquestación de servicios (Postgres, Adminer) para desarrollo local.

##  Tecnologías principales utilizadas (Frontend)

- **React + TypeScript** → base del desarrollo del frontend.  
- **next.js** → entorno de construcción rápido y liviano.  
- **React Router DOM** → manejo de rutas y navegación.  
- **Chart.js + React-Chartjs-2** → visualización de datos estadísticos.  
- **React Icons** → iconografía moderna para interfaz.  
- **Docker + Docker Compose** → contenedor del entorno de desarrollo.

- Estado del proyecto

🟢 En desarrollo activo
El subsistema se encuentra en desarrollo continuo, funcionando correctamente en entorno local y Dockerizado.
