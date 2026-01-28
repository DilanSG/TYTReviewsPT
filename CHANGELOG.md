# Changelog - Reviewly

Todos los cambios notables del proyecto **Reviewly** serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

---

## [1.0.0] - 2026-01-28

### Lanzamiento Inicial - Reviewly

Primera versión completa de **Reviewly**, el sistema de gestión de reseñas y feedback en tiempo real, con todas las funcionalidades core implementadas.

### Agregado

#### Backend
- Sistema de autenticación JWT con bcrypt
- API RESTful con Express + TypeScript
- Modelos Mongoose para MongoDB Atlas
- Middleware de autorización por roles (owner, manager, admin)
- Sistema anti-spam basado en IP (bloqueo 24h)
- Extracción inteligente de IP real del cliente (X-Real-IP, X-Forwarded-For, CF-Connecting-IP)
- Controladores para admins, personal, reseñas y clientes
- Seed script con datos de ejemplo (8 personal + 145 reseñas)
- Validaciones robustas en todos los endpoints
- Cálculo automático de promedios en hook pre-save
- Índices MongoDB optimizados para performance

#### Frontend
- React 18 + TypeScript + Vite
- Tailwind CSS 3.4+ con tema luxury personalizado
- Flujo público de reseñas (QR → Lista → Formulario)
- Panel administrativo completo con autenticación
- Dashboard con métricas en tiempo real:
  - Tarjetas de resumen (Total reseñas, Personal, Calificación general)
  - Promedios por categoría (5 métricas)
  - Distribución de calificaciones (1-5 estrellas)
  - Reseñas recientes (últimas 5)
  - Modales con detalle completo por reseña
- Gestión de personal (CRUD completo):
  - Creación con foto (base64)
  - Estado activo/inactivo
  - Métricas individuales por personal
  - Distribución de calificaciones por personal
- Gestión de reseñas:
  - Listado paginado (20 por página)
  - Filtros por personal y calificación
  - Vista detallada con comentarios por categoría
  - Eliminación con confirmación
- Gestión de clientes:
  - CRUD de clientes regulares
  - Sistema de 12 semanas con 3 estados (gris, rojo, verde)
  - Campos: nombre, documento, teléfono, email
- Sistema de calificación por 5 categorías:
  - Atención
  - Limpieza de Mesa
  - Rapidez
  - Conocimiento de la Carta
  - Presentación Personal
- Comentarios opcionales por categoría (300 caracteres cada uno)
- Comentario general opcional (500 caracteres)
- Nombre de cliente opcional (100 caracteres)
- Componente RatingStars con relleno parcial SVG (precisión decimal)
- Responsive design (mobile-first)
- Animaciones y transiciones suaves
- Interceptores Axios para manejo de sesión

#### Documentación
- README.md profesional con badges y diagramas ASCII
- LICENSE.md (licencia propietaria restrictiva)
- TECHNICAL.md (1000+ líneas de documentación técnica)
- USER_GUIDE.md (800+ líneas de guía para usuarios)
- API.md (1000+ líneas de referencia completa de API)
- DATABASE.md (1300+ líneas de esquemas MongoDB)
- ADMIN_MANUAL.md (1200+ líneas de manual administrativo)
- CHANGELOG.md (este archivo)

### Seguridad

- Autenticación JWT con secreto configurable
- Passwords hasheados con bcrypt (10 salt rounds)
- Validación de tokens en middleware
- Autorización por roles en endpoints admin
- Límite de 50MB en payload para prevenir abusos
- Sistema anti-spam por IP (una reseña cada 24h)
- Normalización de IPs IPv6-mapped-IPv4
- Headers de seguridad en Express
- CORS configurado
- Validaciones estrictas en todos los inputs

### Rendimiento

- Índices MongoDB en campos críticos:
  - `admins.username`, `admins.email` (únicos)
  - `waitresses.employeeId` (único), `waitresses.active`, `waitresses.name`
  - `reviews.waitress + createdAt`, `reviews.rating`, `reviews.ipAddress + createdAt`
  - `customers.name`, `customers.document`
- Paginación en listados (previene cargas masivas)
- Lazy loading de componentes React (Code splitting)
- Optimización de bundle con Vite
- Consultas MongoDB con `populate` selectivo

### Dependencias

#### Backend
- express: ^4.18.2
- mongoose: ^8.0.3
- jsonwebtoken: ^9.0.2
- bcryptjs: ^2.4.3
- cors: ^2.8.5
- dotenv: ^16.3.1
- nanoid: ^5.0.4
- typescript: ^5.3.3

#### Frontend
- react: ^18.2.0
- react-dom: ^18.2.0
- react-router-dom: ^6.21.1
- axios: ^1.6.5
- tailwindcss: ^3.4.1
- vite: ^5.0.8
- typescript: ^5.2.2

### Despliegue

- Frontend: Vercel (SPA estático)
- Backend: Render (Web Service)
- Base de datos: MongoDB Atlas M0 (Free Tier, 512MB)
- Configuración de variables de entorno documentada
- Scripts de build y desarrollo listos

---

## [Sin lanzar] - En desarrollo

### Funcionalidades Futuras

Estas funcionalidades están planificadas pero aún no implementadas:

#### Próxima versión menor (v1.1.0)

- [ ] Exportación de datos (CSV, Excel, PDF)
- [ ] Cambio de contraseña desde el panel
- [ ] Notificaciones por email de reseñas bajas
- [ ] Modo oscuro/claro (toggle)
- [ ] Gráficos avanzados (Chart.js o Recharts)
- [ ] Comparación de periodos (semana actual vs anterior)

#### Próxima versión mayor (v2.0.0)

- [ ] Sistema de roles y permisos granulares
- [ ] Multi-establecimiento (varios locales en un sistema)
- [ ] Respuestas a reseñas desde el admin
- [ ] Panel de cliente (ver sus propias reseñas)
- [ ] Integración con redes sociales
- [ ] PWA (Progressive Web App) para instalación
- [ ] Notificaciones push
- [ ] Analytics avanzado (Google Analytics, Mixpanel)
- [ ] Soporte multiidioma (i18n)
- [ ] Sistema de reportes automáticos (PDF por email)

### Bugs Conocidos

Ninguno reportado en esta versión.

---

## Tipos de Cambios

- **Agregado**: Para nuevas funcionalidades
- **Cambiado**: Para cambios en funcionalidades existentes
- **Obsoleto**: Para funcionalidades que serán removidas pronto
- **Removido**: Para funcionalidades removidas
- **Corregido**: Para corrección de bugs
- **Seguridad**: En caso de vulnerabilidades

---

## Versionado

Este proyecto usa [Semantic Versioning](https://semver.org/lang/es/):

- **MAJOR** (X.0.0): Cambios incompatibles en la API
- **MINOR** (x.X.0): Nuevas funcionalidades compatibles
- **PATCH** (x.x.X): Corrección de bugs compatibles

Ejemplo:
- `1.0.0` → Primera versión estable
- `1.1.0` → Agregar exportación de datos (nueva funcionalidad)
- `1.1.1` → Corregir bug en exportación (patch)
- `2.0.0` → Cambio en estructura de API (breaking change)

---

## Cómo Reportar Bugs

Si encuentras un bug, por favor:

1. Verifica que no esté ya reportado en este changelog
2. Incluye detalles:
   - Pasos para reproducir
   - Comportamiento esperado vs real
   - Navegador y versión
   - Screenshots (si aplica)
3. Contacta a: [Configura email de soporte]

---

## Cómo Solicitar Funcionalidades

Para solicitar nuevas funcionalidades:

1. Describe el problema que resuelve
2. Propón una solución (opcional)
3. Explica el impacto/beneficio
4. Contacta a: [Configura email de soporte]

---

**Última actualización**: 26 de Enero de 2026  
**Mantenedor**: [Tu nombre/empresa]  
**Licencia**: Propietaria (ver LICENSE.md)
