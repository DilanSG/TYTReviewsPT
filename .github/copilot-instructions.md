# Instrucciones de Codificación para T&TReviews

## Propósito y alcance
T&TReviews es un sistema de reseñas para personal de bar con dos flujos principales: público (QR) y panel administrativo. El flujo público permite calificar en 5 categorías; el panel administra personal y métricas con autenticación por roles.

## Arquitectura general
- **Frontend**: Vite + React + TypeScript con UI dark mobile-first. Los flujos públicos y administrativos comparten estilos y componentes.
- **Backend**: Express + TypeScript + MongoDB/Mongoose. La API expone rutas bajo /api y aplica autenticación JWT en endpoints privados.
- **Datos**: Mongoose valida reglas de negocio; el promedio de reseñas se calcula en el modelo para evitar duplicidad de lógica.

## Flujo público (QR)
1. El usuario ingresa al listado público en [frontend/src/pages/PublicReview.tsx](../frontend/src/pages/PublicReview.tsx).
2. Al tocar una card, se verifica si la IP ya envió alguna reseña en las últimas 24h (bloqueo global).
3. Si ya existe reseña de esa IP: se muestra modal de "Ya calificaste, próxima visita".
4. Si no existe reseña: navega al formulario en [frontend/src/pages/ReviewForm.tsx](../frontend/src/pages/ReviewForm.tsx).
5. Se envía un payload con 5 calificaciones y campos opcionales al backend.
6. El backend extrae la IP real del cliente y valida que no exista ninguna reseña de esa IP en las últimas 24h.
7. Si hay reseña reciente del mismo cliente (IP), se rechaza con error 429.
8. El promedio se calcula en el hook de [backend/src/models/Review.ts](../backend/src/models/Review.ts).

## Flujo administrativo
1. Inicio de sesión en [frontend/src/pages/Login.tsx](../frontend/src/pages/Login.tsx).
2. Token se guarda en localStorage desde [frontend/src/hooks/useAuth.tsx](../frontend/src/hooks/useAuth.tsx).
3. Rutas protegidas con `ProtectedRoute` y con middleware de JWT en [backend/src/middleware/auth.ts](../backend/src/middleware/auth.ts).
4. Panel principal: métricas y accesos en [frontend/src/pages/Dashboard.tsx](../frontend/src/pages/Dashboard.tsx).
5. Gestión de personal en [frontend/src/pages/WaitressManagement.tsx](../frontend/src/pages/WaitressManagement.tsx).
6. Gestión de reseñas y filtros en [frontend/src/pages/ReviewManagement.tsx](../frontend/src/pages/ReviewManagement.tsx).

## Backend: estructura y responsabilidades
- **Entrypoint y rutas**: [backend/src/index.ts](../backend/src/index.ts).
- **Controladores**: lógica de negocio y validaciones en [backend/src/controllers](../backend/src/controllers).
- **Modelos**: validaciones, hooks y virtuals en [backend/src/models](../backend/src/models).
- **Autenticación**: JWT + roles en [backend/src/middleware/auth.ts](../backend/src/middleware/auth.ts).

## Frontend: estructura y responsabilidades
- **Servicios**: API centralizada en [frontend/src/services/api.ts](../frontend/src/services/api.ts).
- **Tipos**: contratos compartidos en [frontend/src/types/index.ts](../frontend/src/types/index.ts).
- **UI**: páginas en [frontend/src/pages](../frontend/src/pages) y componentes reutilizables en [frontend/src/components](../frontend/src/components).

## Convenciones del dominio (obligatorio)
- **Idioma**: toda la UI, mensajes de error y respuestas deben estar en español.
- **Categorías exactas**: `atencion`, `limpieza`, `rapidez`, `conocimientoMenu`, `presentacion`.
- **Fotos**: solo URLs externas, sin upload en backend.
- **Género**: `mesero` | `mesera` en modelo y formularios.
- **IDs de personal**: `EMP-XXXXXXXX` generado con nanoid.
- **Anti-spam**: bloqueo global por IP durante 24h (una sola reseña por visita, sin importar el mesero). Mensaje: "próxima visita".

## Reglas de comentarios inline (obligatorio)
Al crear o modificar código, comenta con el mismo estilo ya aplicado en el proyecto:
- Solo comentar lógica no trivial, flujos clave, validaciones importantes y cruces entre módulos.
- Evitar comentar líneas obvias o UI declarativa.
- Comentarios en español técnico, concisos y didácticos.
- Formato preferido: bloque `/* ... */` de 2 a 8 líneas, sin listas largas.
- Si agregas un método nuevo, explica propósito y relación con el flujo general.

## Patrones clave de datos
- **Promedios**: el promedio de reseñas se calcula en el modelo Review, no en controladores.
- **Paginación**: endpoints de reseñas usan `page` y `limit` y responden `pagination`.
- **Enriquecimiento**: listados de personal agregan `averageRating` y `reviewCount`.

## Integración y seguridad
- **JWT**: token en `Authorization: Bearer <token>`.
- **Roles**: `owner`, `manager`, `admin`. Ver `authorize()` en middleware.
- **Logout automático**: interceptores de Axios limpian token en 401.

## Workflows de desarrollo
- **Backend**: npm run dev, npm run build, npm run seed (crea admin admin/admin123 y personal de ejemplo).
- **Frontend**: npm run dev, npm run build; requiere VITE_API_URL en .env.

## Variables de entorno
- Backend: `MONGODB_URI`, `JWT_SECRET`, `PORT`.
- Frontend: `VITE_API_URL`.

## Archivos de referencia (para contexto rápido)
- [backend/src/controllers/reviewController.ts](../backend/src/controllers/reviewController.ts) (validaciones y estadísticas).
- [backend/src/controllers/waitressController.ts](../backend/src/controllers/waitressController.ts) (CRUD y métricas de personal).
- [backend/src/models/Review.ts](../backend/src/models/Review.ts) (hook de promedio, campo ipAddress).
- [backend/src/utils/getClientIP.ts](../backend/src/utils/getClientIP.ts) (extracción de IP real desde headers).
- [frontend/src/services/api.ts](../frontend/src/services/api.ts) (interceptores y endpoints).
- [frontend/src/pages/ReviewForm.tsx](../frontend/src/pages/ReviewForm.tsx) (formulario público, manejo error 429).
- [frontend/src/pages/ReviewManagement.tsx](../frontend/src/pages/ReviewManagement.tsx) (paginación y filtros).
