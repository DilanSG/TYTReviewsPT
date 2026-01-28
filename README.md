<div align="center">

# 🌟 Reviewly

### Sistema Inteligente de Gestión de Reseñas y Feedback en Tiempo Real

[![License](https://img.shields.io/badge/License-Proprietary-red.svg)](LICENSE.md)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.0+-61DAFB.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.0+-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248.svg)](https://www.mongodb.com/cloud/atlas)
[![Version](https://img.shields.io/badge/Version-1.0.0-orange.svg)](CHANGELOG.md)

<p align="center">
  <strong>Plataforma profesional de reseñas con análisis avanzado y gestión integral para empresas de servicio</strong>
</p>

<p align="center">
  <em>Transforma el feedback de tus clientes en insights accionables</em>
</p>

[Características](#-características-principales) •
[Instalación](#-instalación-rápida) •
[Documentación](#-documentación) •
[Demo](#-demo) •
[Licencia](#-licencia)

</div>

---

## Tabla de Contenidos

- [Acerca del Proyecto](#acerca-del-proyecto)
- [Características Principales](#características-principales)
- [Stack Tecnológico](#stack-tecnológico)
- [Arquitectura](#arquitectura)
- [Instalación Rápida](#instalación-rápida)
- [Configuración](#configuración)
- [Uso](#uso)
- [Documentación](#documentación)
- [Deployment](#deployment)
- [Seguridad](#seguridad)
- [Licencia](#licencia)
- [Soporte](#soporte)

---

## Acerca de Reviewly

**Reviewly** es la plataforma líder en gestión inteligente de reseñas y evaluación de personal para la industria de hospitalidad y servicios. Diseñada desde cero para establecimientos que valoran la excelencia en el servicio, Reviewly transforma cada interacción con clientes en datos valiosos que impulsan la mejora continua.

### Problema que Resuelve

- **Para Clientes**: Experiencia de calificación instantánea y sin fricciones mediante QR, con opción de feedback detallado por categorías
- **Para Personal**: Reconocimiento objetivo del desempeño y áreas claras de mejora basadas en datos reales
- **Para Gerentes**: Visibilidad completa del rendimiento del equipo con métricas accionables y alertas automáticas
- **Para el Negocio**: ROI medible en calidad de servicio, retención de personal y satisfacción del cliente

### Casos de Uso

- **Restaurantes & Bares**: Evaluación inmediata del servicio de meseros y bartenders
- **Hoteles & Resorts**: Monitoreo de calidad por área (recepción, housekeeping, room service)
- **Cafeterías & Fast Food**: Métricas de rapidez y satisfacción en tiempo real
- **Spas & Centros de Bienestar**: Calificación de terapeutas y calidad de atención
- **Retail & Tiendas**: Evaluación del personal de ventas y experiencia de compra
- **Servicios Corporativos**: Feedback interno de calidad de atención entre departamentos

---

## Características Principales

### Experiencia del Cliente (Interfaz Pública QR)

- **Diseño Mobile-First**: Optimizado para dispositivos móviles con tema oscuro elegante
- **Calificación por Categorías**: 5 aspectos evaluables (Atención, Limpieza, Rapidez, Conocimiento de Carta, Presentación)
- **Comentarios Específicos**: Opción de agregar feedback textual por cada categoría
- **Anti-Spam Inteligente**: Sistema de bloqueo por IP con ventana de 24 horas
- **Experiencia sin Fricciones**: Acceso directo mediante QR sin registro previo
- **Validación en Tiempo Real**: Feedback visual inmediato al completar formularios

### Centro de Comando (Panel Administrativo)

- **Dashboard Interactivo**: Métricas en tiempo real con gráficos visuales
- **Gestión de Personal**: CRUD completo con estados activo/inactivo
- **Gestión de Clientes**: Sistema de seguimiento de clientes con estado por semanas
- **Gestión de Usuarios**: Control total de accesos y permisos (solo Admin)
- **Análisis de Reseñas**: Filtrado, búsqueda y visualización detallada
- **Estadísticas Avanzadas**: 
  - Promedios por categoría
  - Distribución de calificaciones
  - Reseñas recientes con detalles
  - Métricas individuales por empleado
- **Sistema de Roles Jerárquico**: 
  - **Admin**: Control total incluyendo gestión de usuarios
  - **Manager**: Gestión de personal, reseñas y clientes
  - **Usuario**: Reservado para implementaciones futuras
- **Autenticación JWT**: Seguridad de nivel empresarial
- **Ordenamiento Inteligente**: Usuarios listados por jerarquía (Admin → Manager → Usuario)

### Diseño y Experiencia de Usuario

- **Tema Dark Premium**: Paleta de colores oro y negro para ambientes nocturnos
- **Glassmorphism**: Efectos de cristal esmerilado para interfaz moderna
- **Animaciones Fluidas**: Transiciones suaves y feedback visual
- **Responsive Total**: Adaptación perfecta a cualquier dispositivo
- **Accesibilidad**: Diseño inclusivo con contraste optimizado

### Seguridad

- **Autenticación JWT**: Tokens seguros con expiración configurable
- **Hash de Contraseñas**: bcrypt con salting automático
- **Validación de Entrada**: Sanitización de datos en backend y frontend
- **Protección CSRF**: Headers de seguridad configurados
- **Rate Limiting**: Control de spam y ataques por fuerza bruta
- **IP Tracking**: Sistema de identificación de clientes anónimos

---

## Stack Tecnológico

### Frontend

|   Tecnología    | Versión |                 Propósito                 |
|-----------------|---------|-------------------------------------------|
| **React**       | 18.3+   | Framework UI con componentes funcionales  |
| **TypeScript**  | 5.0+    | Tipado estático y seguridad en desarrollo |
| **Vite**        | 5.0+    | Build tool ultrarrápido con HMR           |
| **Tailwind CSS**| 3.4+    | Framework CSS utility-first               |
| **React Router**| 6.0+    | Enrutamiento SPA con protección de rutas  |
| **Axios**       | 1.6+    | Cliente HTTP con interceptores            |

### Backend

| Tecnología    | Versión |          Propósito             |
|------------   |---------|--------------------------------|
| **Node.js**   | 18.0+   | Runtime de servidor            |
| **Express**   | 4.18+   | Framework web minimalista      |
| **TypeScript**| 5.0+    | Desarrollo type-safe           |
| **Mongoose**  | 8.0+    | ODM para MongoDB               |
| **JWT**       | 9.0+    | Autenticación basada en tokens |
| **bcryptjs**  | 2.4+    | Hashing de contraseñas         |

### Base de Datos

| Tecnología        |     Plan     |           Propósito            |
|------------|------|--------------|--------------------------------|
| **MongoDB Atlas** | M0 Free Tier | Base de datos NoSQL en la nube |
| **Mongoose**      |      -       | Modelado de datos y validación |

### DevOps & Deployment

|     Servicio     |               Uso               |
|------------------|---------------------------------|
| **Vercel**       | Hosting frontend con CI/CD      |
| **Render**       | Hosting backend con auto-deploy |
| **MongoDB Atlas**| Base de datos managed           |
| **Git**          | Control de versiones            |

---

## Arquitectura del Sistema

```
┌────────────────────────────────────────────────────────────┐
│                         CLIENTE                            │
│  ┌──────────────┐              ┌──────────────┐            │
│  │  QR Scanner  │              │   Admin      │            │
│  │  (Público)   │              │   Panel      │            │
│  └──────┬───────┘              └──────┬───────┘            │
└─────────┼──────────────────────────────┼───────────────────┘
          │                              │
          ▼                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                  │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐             │
│  │  Public    │  │  Protected │  │   Auth     │             │
│  │  Routes    │  │  Routes    │  │   Context  │             │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘             │
└────────┼───────────────┼───────────────┼────────────────────┘
         │               │               │
         └───────────────┴───────────────┘
                         │
                    HTTP/HTTPS
                         │
┌────────────────────────┼──────────────────────────────────┐
│              BACKEND (Express + TypeScript)               │
│  ┌──────────────────────────────────────────────────────┐ │
│  │                   API ROUTES                         │ │
│  │  /api/auth  │  /api/reviews  │  /api/waitresses      │ │
│  └──────┬────────────┬────────────┬─────────────────────┘ │
│         │            │            │                       │
│  ┌──────▼────────────▼────────────▼─────────────────────┐ │
│  │              MIDDLEWARE LAYER                        │ │
│  │  [Auth JWT] → [CORS] → [Body Parser] → [Validation]  │ │
│  └──────┬────────────┬────────────┬─────────────────────┘ │
│         │            │            │                       │
│  ┌──────▼────────────▼────────────▼─────────────────────┐ │
│  │                CONTROLLERS                           │ │
│  │  Business Logic & Request Handling                   │ │
│  └──────┬────────────┬────────────┬─────────────────────┘ │
│         │            │            │                       │
│  ┌──────▼────────────▼────────────▼─────────────────────┐ │
│  │                  MODELS                              │ │
│  │  [Admin] [Review] [Waitress] [Customer]              │ │
│  └──────┬────────────┬────────────┬─────────────────────┘ │
└─────────┼────────────┼────────────┼───────────────────────┘
          │            │            │
          └────────────┴────────────┘
                       │
                   Mongoose ODM
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                  MongoDB Atlas (Cloud)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │  admins  │  │  reviews │  │waitresses│  │customers │     │
│  │collection│  │collection│  │collection│  │collection│     │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### Flujo de Datos

1. **Cliente → Frontend**: Usuario escanea QR o accede a panel admin
2. **Frontend → Backend**: Peticiones HTTP con/sin JWT según ruta
3. **Backend → MongoDB**: Operaciones CRUD via Mongoose
4. **MongoDB → Backend**: Respuestas con datos validados
5. **Backend → Frontend**: JSON responses con código de estado
6. **Frontend → Cliente**: Renderizado reactivo de UI

## Guía de Uso

### Para Clientes (Experiencia Pública)

1. **Acceso**:
   - Escanea el código QR del personal

2. **Calificación**:
   - Selecciona el personal de la lista
   - Califica 5 aspectos del servicio (1-5 estrellas)
   - Opcionalmente agrega comentarios por categoría
   - Opcionalmente ingresa tu nombre
   - Opcionalmente agrega comentario general
   - Envía la reseña

3. **Restricciones**:
   - Una reseña cada 24 horas por dispositivo
   - Todas las categorías son obligatorias
   - Comentarios limitados a 300 caracteres por categoría

### Para Administradores y Gerentes

1. **Login**:
   - Ingresa credenciales
   - El sistema recuerda sesión con JWT

2. **Dashboard**:
   - **Métricas Generales**:
     - Total de reseñas recibidas
     - Total de personal activo
     - Calificación promedio general
   - **Promedios por Categoría**:
     - Visualización de 5 categorías con calificaciones
   - **Distribución de Calificaciones**:
     - Gráfico de barras 1-5 estrellas
   - **Reseñas Recientes**:
     - Últimas 5 reseñas con detalle

3. **Gestión de Personal**:
   - **Crear**: Agregar nuevo personal con foto, nombre, género
   - **Editar**: Modificar datos, activar/desactivar
   - **Ver Estadísticas**: Click en cualquier card/fila para ver métricas individuales
   - **Eliminar**: Borrar personal y sus reseñas (irreversible)

4. **Gestión de Clientes**:
   - **Crear**: Agregar clientes con datos opcionales
   - **Editar**: Actualizar información de clientes
   - **Seguimiento**: Sistema de 12 semanas con estados (gris/rojo/verde)
   - **Eliminar**: Borrar registros de clientes

5. **Gestión de Usuarios** (Solo Admin):
   - **Crear**: Agregar usuarios con roles específicos (admin/manager/usuario)
   - **Editar**: Modificar username, email, contraseña y rol
   - **Soft Delete**: Desactivar usuarios (reversible)
   - **Hard Delete**: Eliminar permanentemente usuarios
   - **Protección**: Los admins no pueden eliminarse a sí mismos
   - **Ordenamiento**: Lista automática por jerarquía (Admin → Manager → Usuario)

6. **Gestión de Reseñas**:
   - **Filtros**: Por personal, por calificación
   - **Búsqueda**: Buscar por palabras clave
   - **Detalles**: Click en reseña para ver modal completo
   - **Eliminar**: Borrar reseñas específicas

### Jerarquía de Roles

|    Rol      | Dashboard | Personal | Clientes | Reseñas | Usuarios |
|-------------|-----------|----------|----------|---------|----------|
| **Admin**   |     ✓     |    ✓     |    ✓     |    ✓    |     ✓    |
| **Manager** |     ✓     |    ✓     |    ✓     |    ✓    |     ✗    |
| **Usuario** |     ✗     |    ✗     |    ✗     |    ✗    |     ✗    |
|-------------|-----------|----------|----------|---------|----------|

*El rol "Usuario" está reservado para futuras implementaciones*

---


### Documentación Técnica

- **[TECHNICAL.md](docs/TECHNICAL.md)**: Arquitectura detallada, APIs, modelos de datos, flujos de autenticación

### Documentación de Desarrollo

- **[CHANGELOG.md](CHANGELOG.md)**: Historial de versiones y cambios

---

## Seguridad y Privacidad

### Medidas de Seguridad Implementadas

- **JWT con Expiración**: Tokens expiran en 7 días, renovables
- **Hashing de Contraseñas**: bcrypt con salt factor 10
- **Validación de Entrada**: Mongoose validators + sanitización en controladores
- **CORS Configurado**: Solo dominios permitidos en producción
- **Rate Limiting por IP**: Prevención de spam (1 reseña/24h por IP)
- **Sistema de Roles Jerárquico**: Control granular de permisos
- **Protección de Auto-eliminación**: Admins no pueden eliminarse a sí mismos
- **Soft Delete**: Desactivación reversible de usuarios sin perder datos
- **Headers de Seguridad**: Helmet.js (recomendado agregar)
- **Secrets en Variables de Entorno**: Sin credenciales hardcodeadas

### Mejores Prácticas

- Cambia `JWT_SECRET` en producción a valor aleatorio fuerte
- Usa HTTPS en producción (automático con Vercel/Render)
- Audita dependencias regularmente: `npm audit`
- Mantén Node.js y dependencias actualizadas
- Implementa logs de auditoría para acciones sensibles
- Considera implementar 2FA para administradores en futuro

### Reporte de Vulnerabilidades

Si encuentras una vulnerabilidad de seguridad, por favor NO la reportes públicamente. Contacta directamente.

---

## Licencia

Este proyecto está bajo **Licencia Propietaria Restrictiva**.

### Resumen de la Licencia

- **Permitido**: Ver, estudiar y aprender del código fuente
- **Permitido**: Usar el software para fines personales no comerciales
- **Permitido**: Modificar para uso propio
- **Prohibido**: Uso comercial sin autorización explícita
- **Prohibido**: Distribuir, vender o sublicenciar el software
- **Prohibido**: Uso en producción sin licencia comercial

Lee el archivo [LICENSE.md](LICENSE.md) para términos completos.

---

## Contribuciones

Actualmente este es un proyecto propietario y **no se aceptan contribuciones externas**. Sin embargo, puedes:

- Reportar bugs a través de issues (sin incluir código sensible)
- Sugerir mejoras
- Usar como referencia educativa

---

## Soporte

### FAQ

**P: ¿Puedo usar esto en mi negocio?**
R: Necesitas una licencia comercial para uso en producción.

**P: ¿Funciona en iOS y Android?**
R: Sí, es una aplicación web responsive que funciona en cualquier navegador moderno.

**P: ¿Cuántas reseñas soporta?**
R: En MongoDB Atlas M0 (gratis) puedes almacenar hasta 512MB (~100,000 reseñas).

**P: ¿Puedo personalizar el diseño?**
R: Sí, pero bajo tu propio riesgo. La licencia no cubre soporte para versiones modificadas.

**P: ¿Hay app móvil nativa?**
R: No, pero la PWA funciona como app instalable en dispositivos móviles.

---

## Desarrollado por

**Dilan Acuña**

---

##  Roadmap de Producto

### 🎯 v1.1.0 -
- [ ] Alertas automáticas por email cuando calificación < 3 estrellas
- [ ] Comparativas mes a mes en dashboard

###  v2.0.0
- [ ] Notificaciones push para administradores
- [ ] Exportación de reportes
- [ ] Multi-idioma (EN, ES, PT)

### v2.1.0
- [ ] Sistema de recompensas para personal destacado
- [ ] Integración con sistemas POS
- [ ] Dashboard personalizable con widgets
- [ ] API pública para integraciones
- [ ] App móvil nativa (React Native)

### v2.2.0
- [ ] Implementación de funcionalidades para rol "usuario"
- [ ] Sistema de autenticación de dos factores (2FA)
- [ ] Logs de auditoría completos
- [ ] Backup automático de base de datos

---

<div align="center">

---

### Reviewly

**¿Te interesa usar Reviewly en tu negocio?** Contacta para licencias comerciales

**¿Encontraste útil este proyecto?** Dale una estrella en GitHub

---

<sub>Hecho con ❤️</sub>

</div>
