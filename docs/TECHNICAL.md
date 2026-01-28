# Documentación Técnica - T&TReviews

## Tabla de Contenidos

1. [Arquitectura del Sistema](#arquitectura-del-sistema)
2. [Base de Datos MongoDB Atlas](#base-de-datos-mongodb-atlas)
3. [Backend - API REST](#backend---api-rest)
4. [Frontend - React SPA](#frontend---react-spa)
5. [Autenticación y Seguridad](#autenticación-y-seguridad)
6. [Flujos de Datos](#flujos-de-datos)
7. [Modelos de Datos](#modelos-de-datos)
8. [APIs Endpoints](#apis-endpoints)
9. [Deployment](#deployment)
10. [Optimización y Performance](#optimización-y-performance)

---

## Arquitectura del Sistema

### Visión General

T&TReviews implementa una arquitectura **cliente-servidor** desacoplada con las siguientes características:

- **Frontend**: Single Page Application (SPA) construida con React 18 + TypeScript
- **Backend**: API REST construida con Express + TypeScript + Node.js
- **Base de Datos**: MongoDB Atlas (DBaaS NoSQL)
- **Autenticación**: JSON Web Tokens (JWT)
- **Comunicación**: HTTP/HTTPS con formato JSON

### Diagrama de Arquitectura

```
┌──────────────────────────────────────────────────────────────┐
│                       CAPA DE PRESENTACIÓN                   │
│                                                              │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │              React Frontend (SPA)                        │ │
│ │                                                          │ │
│ │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │ │
│ │  │   Public    │  │  Protected  │  │    Auth     │       │ │
│ │  │   Routes    │  │   Routes    │  │   Context   │       │ │
│ │  │             │  │             │  │             │       │ │
│ │  │ - /         │  │ - /admin/*  │  │ - JWT       │       │ │
│ │  │ - /review/* │  │             │  │ - LocalSt   │       │ │
│ │  └─────────────┘  └─────────────┘  └─────────────┘       │ │
│ │                                                          │ │
│ │  ┌────────────────────────────────────────────────────┐  │ │
│ │  │           Axios HTTP Client                        │  │ │
│ │  │  - Interceptores de Request (JWT injection)        │  │ │
│ │  │  - Interceptores de Response (401 auto-logout)     │  │ │
│ │  └────────────────────────────────────────────────────┘  │ │
│ └──────────────────────────────────────────────────────────┘ │
└──────────────────────────┬───────────────────────────────────┘
                           │
                     HTTPS / JSON
                           │
┌──────────────────────────▼─────────────────────────────────────┐
│                      CAPA DE APLICACIÓN                        │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │            Express.js Backend (API REST)                 │  │
│  │                                                          │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │                  API Routes                        │  │  │
│  │  │                                                    │  │  │
│  │  │  /api/auth           - Autenticación               │  │  │
│  │  │  /api/waitresses     - Gestión de personal         │  │  │
│  │  │  /api/reviews        - Gestión de reseñas          │  │  │
│  │  │  /api/customers      - Gestión de clientes         │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │                                                          │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │                  Middleware Chain                  │  │  │
│  │  │                                                    │  │  │
│  │  │  1. CORS            → Orígenes permitidos          │  │  │
│  │  │  2. Body Parser     → JSON parsing                 │  │  │
│  │  │  3. Auth JWT        → Validación de tokens         │  │  │
│  │  │  4. IP Extractor    → Cliente real IP              │  │  │
│  │  │  5. Error Handler   → Manejo centralizado          │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │                                                          │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │                    Controllers                     │  │  │
│  │  │                                                    │  │  │
│  │  │  - authController        - reviewController        │  │  │
│  │  │  - waitressController    - customerController      │  │  │
│  │  │                                                    │  │  │
│  │  │    Contienen lógica de negocio y validaciones      │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │                                                          │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │              Mongoose Models (ODM)                 │  │  │
│  │  │                                                    │  │  │
│  │  │  - Admin Model       - Review Model                │  │  │
│  │  │  - Waitress Model    - Customer Model              │  │  │
│  │  │                                                    │  │  │
│  │  │      Definen schemas, validaciones y hooks         │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
└──────────────────────────┬─────────────────────────────────────┘
                           │
                    MongoDB Wire Protocol
                           │
┌──────────────────────────▼─────────────────────────────────────┐
│                      CAPA DE PERSISTENCIA                      │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              MongoDB Atlas (Cloud Database)              │  │
│  │                                                          │  │
│  │  Database: treviews                                      │  │
│  │                                                          │  │
│  │  Collections:                                            │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │  │
│  │  │  admins  │  │ reviews  │  │waitresses│  │customers │  │  │
│  │  │          │  │          │  │          │  │          │  │  │
│  │  │ Usuarios │  │ Reseñas  │  │ Personal │  │ Clientes │  │  │
│  │  │ admin    │  │ públicas │  │ del bar  │  │ del bar  │  │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │  │
│  │                                                          │  │
│  │  Índices:                                                │  │
│  │  - waitresses: { active: 1 }                             │  │
│  │  - reviews: { waitress: 1, createdAt: -1 }               │  │
│  │  - reviews: { ipAddress: 1, createdAt: -1 }              │  │
│  │  - admins: { username: 1 }                               │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
│  Features:                                                     │
│  - Replica Set (M0: 3 nodes)                                   │
│  - Automatic Backups (M2+)                                     │
│  - SSL/TLS Encryption                                          │
│  - Role-Based Access Control                                   │
└────────────────────────────────────────────────────────────────┘
```

### Principios de Diseño

1. **Separación de Responsabilidades**: Frontend y backend completamente independientes
2. **RESTful API**: Endpoints siguiendo convenciones REST estándar
3. **Stateless Backend**: Servidor sin estado, autenticación por JWT
4. **Reactive Frontend**: UI reactiva con actualizaciones en tiempo real
5. **Type Safety**: TypeScript en ambos lados para prevenir errores
6. **Modular Architecture**: Componentes y módulos reutilizables

---

## Base de Datos MongoDB Atlas

MongoDB Atlas **servicio (DBaaS)** que proporciona:

- **Gestión Automatizada**: Backups, actualizaciones, parches automáticos
- **Alta Disponibilidad**: Replica sets con failover automático
- **Escalabilidad**: Vertical y horizontal según demanda
- **Seguridad**: Encriptación en tránsito y reposo, control de acceso
- **Monitoreo**: Dashboard con métricas en tiempo real

### Configuración del Cluster

**Plan Utilizado**: M0 (Free Tier)
- **Almacenamiento**: 512 MB
- **RAM**: Compartida
- **Conexiones simultáneas**: 500
- **Replica Set**: 3 nodos (1 primary, 2 secondary)
- **Región**: Seleccionable (recomendado: más cercana a usuarios)

**Connection String**:
```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/treviews?retryWrites=true&w=majority
```

### Collections (Colecciones)

#### 1. `admins` - Usuarios Administrativos

**Propósito**: Almacenar credenciales y roles de administradores

**Estructura**:
```javascript
{
  _id: ObjectId,
  username: String (único, indexado),
  email: String,
  password: String (hash bcrypt),
  role: String (enum: 'owner' | 'manager' | 'admin'),
  active: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

**Índices**:
- `{ username: 1 }` - Único, para login rápido

**Ejemplo**:
```json
{
  "_id": "65a1b2c3d4e5f6789abcdef0",
  "username": "admin",
  "email": "admin@petra.com",
  "password": "$2a$10$rZ3K9...",
  "role": "owner",
  "active": true,
  "createdAt": "2026-01-15T10:30:00Z",
  "updatedAt": "2026-01-15T10:30:00Z"
}
```

#### 2. `waitresses` - Personal del Establecimiento

**Propósito**: Gestionar información del personal que recibe calificaciones

**Estructura**:
```javascript
{
  _id: ObjectId,
  name: String (requerido),
  employeeId: String (único, generado automáticamente),
  gender: String (enum: 'mesero' | 'mesera'),
  photoUrl: String (URL externa),
  active: Boolean,
  createdAt: Date,
  updatedAt: Date,
  // Campos virtuales (no almacenados):
  averageRating: Number (calculado),
  reviewCount: Number (calculado)
}
```

**Índices**:
- `{ active: 1 }` - Para listar solo personal activo
- `{ employeeId: 1 }` - Único

**Ejemplo**:
```json
{
  "_id": "65a1b2c3d4e5f6789abcdef1",
  "name": "María López",
  "employeeId": "EMP-A7B3C9D1",
  "gender": "mesera",
  "photoUrl": "https://images.unsplash.com/photo-xyz",
  "active": true,
  "createdAt": "2026-01-15T10:30:00Z",
  "updatedAt": "2026-01-15T10:30:00Z"
}
```

#### 3. `reviews` - Reseñas de Clientes

**Propósito**: Almacenar calificaciones y comentarios de clientes

**Estructura**:
```javascript
{
  _id: ObjectId,
  waitress: ObjectId (ref: 'Waitress'),
  ratings: {
    atencion: Number (1-5, requerido),
    limpieza: Number (1-5, requerido),
    rapidez: Number (1-5, requerido),
    conocimientoMenu: Number (1-5, requerido),
    presentacion: Number (1-5, requerido)
  },
  rating: Number (promedio calculado, 1-5),
  categoryComments: {
    atencion: String (max 300 chars),
    limpieza: String (max 300 chars),
    rapidez: String (max 300 chars),
    conocimientoMenu: String (max 300 chars),
    presentacion: String (max 300 chars)
  },
  comment: String (max 500 chars),
  customerName: String (max 100 chars),
  ipAddress: String (para anti-spam),
  createdAt: Date,
  updatedAt: Date
}
```

**Índices**:
- `{ waitress: 1, createdAt: -1 }` - Para listar reseñas por personal
- `{ ipAddress: 1, createdAt: -1 }` - Para validación anti-spam
- `{ rating: 1 }` - Para filtros por calificación

**Ejemplo**:
```json
{
  "_id": "65a1b2c3d4e5f6789abcdef2",
  "waitress": "65a1b2c3d4e5f6789abcdef1",
  "ratings": {
    "atencion": 5,
    "limpieza": 4,
    "rapidez": 5,
    "conocimientoMenu": 4,
    "presentacion": 5
  },
  "rating": 4.6,
  "categoryComments": {
    "atencion": "Muy amable y atenta",
    "limpieza": "Mesa impecable"
  },
  "comment": "Excelente servicio en general",
  "customerName": "Juan Pérez",
  "ipAddress": "192.168.1.100",
  "createdAt": "2026-01-26T18:45:00Z",
  "updatedAt": "2026-01-26T18:45:00Z"
}
```

#### 4. `customers` - Clientes del Establecimiento

**Propósito**: Seguimiento de clientes regulares con sistema de semanas

**Estructura**:
```javascript
{
  _id: ObjectId,
  name: String (requerido),
  document: String,
  phone: String,
  email: String,
  weekStates: [String] (12 elementos, enum: 'gris' | 'rojo' | 'verde'),
  createdAt: Date,
  updatedAt: Date
}
```

**Índices**:
- `{ name: 1 }` - Para búsqueda por nombre

**Ejemplo**:
```json
{
  "_id": "65a1b2c3d4e5f6789abcdef3",
  "name": "Carlos Ramírez",
  "document": "1234567890",
  "phone": "+57 300 1234567",
  "email": "carlos@example.com",
  "weekStates": ["verde", "verde", "rojo", "gris", "gris", "gris", "gris", "gris", "gris", "gris", "gris", "gris"],
  "createdAt": "2026-01-15T10:30:00Z",
  "updatedAt": "2026-01-26T15:20:00Z"
}
```

### Estrategia de Backups

**Plan M0** (Free):
- No backups automáticos (considerar exportaciones manuales periódicas)

**Plan M2+** (Pagado):
- Snapshots automáticos cada 6 horas
- Retención de 2 días (configurable hasta 35 días)
- Point-in-time recovery

**Recomendación para Producción**:
```bash
# Backup manual con mongodump
mongodump --uri="mongodb+srv://..." --out=./backup-$(date +%Y%m%d)

# Restauración
mongorestore --uri="mongodb+srv://..." ./backup-directory
```

### Optimizaciones de Base de Datos

1. **Índices Compuestos**: Ya implementados para consultas frecuentes
2. **Proyecciones**: Seleccionar solo campos necesarios en queries
3. **Paginación**: Implementada en todos los listados para evitar sobrecarga
4. **Aggregation Pipeline**: Para cálculos complejos (estadísticas)

**Ejemplo de Query Optimizada**:
```javascript
// ❌ Malo: Traer todo y filtrar en código
const reviews = await Review.find({});
const filtered = reviews.filter(r => r.rating >= 4);

// ✅ Bueno: Filtrar en DB con índice
const reviews = await Review.find({ rating: { $gte: 4 } })
  .select('waitress rating comment createdAt')
  .limit(20)
  .sort({ createdAt: -1 });
```

---

## Backend - API REST

### Tecnologías

- **Runtime**: Node.js 18+
- **Framework**: Express 4.18+
- **Lenguaje**: TypeScript 5.0+
- **ODM**: Mongoose 8.0+
- **Autenticación**: jsonwebtoken 9.0+
- **Seguridad**: bcryptjs 2.4+, cors

### Estructura de Directorios

```
backend/
├── src/
│   ├── index.ts                 # Entry point del servidor
│   ├── config/
│   │   └── database.ts         # Configuración de MongoDB
│   ├── controllers/            # Lógica de negocio
│   │   ├── authController.ts
│   │   ├── reviewController.ts
│   │   ├── waitressController.ts
│   │   └── customerController.ts
│   ├── middleware/             # Middlewares de Express
│   │   └── auth.ts            # JWT validation & authorization
│   ├── models/                # Mongoose models
│   │   ├── Admin.ts
│   │   ├── Review.ts
│   │   ├── Waitress.ts
│   │   └── Customer.ts
│   ├── routes/                # Definición de rutas
│   │   ├── authRoutes.ts
│   │   ├── reviewRoutes.ts
│   │   ├── waitressRoutes.ts
│   │   └── customerRoutes.ts
│   ├── utils/                 # Utilidades
│   │   └── getClientIP.ts    # Extracción de IP real
│   ├── seed.ts               # Datos iniciales
│   └── seedCustomers.ts      # Seed de clientes
├── .env                      # Variables de entorno
├── .env.example              # Template de .env
├── package.json
└── tsconfig.json
```

### Flujo de Requests

```
1. Cliente HTTP Request
        ↓
2. Express recibe petición
        ↓
3. CORS Middleware (permite origen)
        ↓
4. Body Parser (parsea JSON)
        ↓
5. Router decide endpoint
        ↓
6. Auth Middleware (si aplica)
        │
        ├─→ Token válido → Continúa
        └─→ Token inválido → 401 Unauthorized
        ↓
7. Controller (lógica de negocio)
        │
        ├─→ Validaciones
        ├─→ Operaciones DB (Mongoose)
        └─→ Respuesta JSON
        ↓
8. Cliente recibe respuesta
```

### Middlewares Clave

#### 1. `authMiddleware` - Autenticación JWT

**Ubicación**: `backend/src/middleware/auth.ts`

**Propósito**: Validar JWT y extraer datos del usuario

**Funcionamiento**:
```typescript
// 1. Extrae token del header Authorization
const token = req.header('Authorization')?.replace('Bearer ', '');

// 2. Verifica token con secreto
const decoded = jwt.verify(token, process.env.JWT_SECRET);

// 3. Inyecta usuario en request
req.user = decoded; // { id, username, role }

// 4. Continúa al siguiente middleware/controller
next();
```

**Uso**:
```typescript
router.get('/protected', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});
```

#### 2. `authorize` - Autorización por Rol

**Funcionamiento**:
```typescript
export const authorize = (...roles: string[]) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'No autorizado' });
    }
    next();
  };
};
```

**Uso**:
```typescript
router.delete('/waitresses/:id', 
  authMiddleware, 
  authorize('owner', 'manager'), 
  deleteWaitress
);
```

#### 3. `getClientIP` - Extracción de IP Real

**Propósito**: Obtener la IP real del cliente considerando proxies

**Orden de Prioridad**:
1. `X-Real-IP` (Nginx, Apache)
2. `X-Forwarded-For` (primera IP de la lista)
3. `CF-Connecting-IP` (Cloudflare)
4. `req.ip` (directo)

**Código**:
```typescript
export const getClientIP = (req: Request): string => {
  return req.headers['x-real-ip'] 
    || req.headers['x-forwarded-for']?.split(',')[0]
    || req.headers['cf-connecting-ip']
    || req.ip
    || 'unknown';
};
```

### Controladores

#### `reviewController.ts`

**Funciones Principales**:

1. **`checkDuplicate`**: Valida si IP ya envió reseña en 24h
   ```typescript
   const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
   const existingReview = await Review.findOne({
     ipAddress: clientIP,
     createdAt: { $gte: twentyFourHoursAgo }
   });
   ```

2. **`submitReview`**: Crea nueva reseña con validaciones
   - Valida que todas las categorías tengan valor 1-5
   - Verifica que el personal exista
   - Comprueba anti-spam por IP
   - Calcula promedio automático (hook de Mongoose)

3. **`getAllReviews`**: Lista con filtros y paginación
   ```typescript
   const filter: any = {};
   if (rating) filter.rating = parseInt(rating);
   if (waitressId) filter.waitress = waitressId;

   const reviews = await Review.find(filter)
     .populate('waitress', 'name employeeId')
     .sort({ createdAt: -1 })
     .limit(limitNum)
     .skip(skip);
   ```

4. **`getOverallStats`**: Estadísticas generales del dashboard
   - Total de reseñas y personal
   - Promedio general y por categoría
   - Distribución de calificaciones (1-5 estrellas)
   - Reseñas recientes

#### `waitressController.ts`

**Funciones Principales**:

1. **`getAllWaitresses`**: Lista personal activo (público)
   - Solo personal con `active: true`
   - Enriquece con `averageRating` y `reviewCount`

2. **`createWaitress`**: Crea nuevo personal
   - Genera `employeeId` único con nanoid
   - Permite subir foto (URL externa)

3. **`getWaitressStats`**: Estadísticas individuales
   - Promedio de todas sus reseñas
   - Promedios por categoría
   - Distribución de calificaciones recibidas

### Validaciones

**Nivel 1: Mongoose Schema**
```typescript
atencion: {
  type: Number,
  required: [true, 'La calificación de atención es requerida'],
  min: [1, 'La calificación mínima es 1'],
  max: [5, 'La calificación máxima es 5'],
}
```

**Nivel 2: Controller**
```typescript
if (!ratings[category] || ratings[category] < 1 || ratings[category] > 5) {
  res.status(400).json({
    message: `Calificación de ${category} inválida (debe estar entre 1 y 5)`
  });
  return;
}
```

---

## Frontend - React SPA

### Tecnologías

- **Framework**: React 18.3+
- **Build Tool**: Vite 5.0+
- **Lenguaje**: TypeScript 5.0+
- **Estilos**: Tailwind CSS 3.4+
- **Routing**: React Router 6.0+
- **HTTP**: Axios 1.6+

### Estructura de Directorios

```
frontend/
├── src/
│   ├── main.tsx                # Entry point
│   ├── App.tsx                 # Router principal
│   ├── components/            # Componentes reutilizables
│   │   ├── ConfirmModal.tsx
│   │   ├── ProtectedRoute.tsx
│   │   ├── RatingStars.tsx
│   │   └── WaitressCard.tsx
│   ├── hooks/                 # Custom hooks
│   │   └── useAuth.tsx       # Context de autenticación
│   ├── pages/                # Páginas/vistas
│   │   ├── PublicReview.tsx   # Lista pública de personal
│   │   ├── ReviewForm.tsx     # Formulario de reseña
│   │   ├── Login.tsx          # Login admin
│   │   ├── Dashboard.tsx      # Dashboard admin
│   │   ├── WaitressManagement.tsx
│   │   ├── ReviewManagement.tsx
│   │   └── CustomerManagement.tsx
│   ├── services/             # Servicios API
│   │   └── api.ts           # Cliente Axios configurado
│   ├── types/               # TypeScript types
│   │   └── index.ts        # Interfaces y types
│   ├── assets/             # Recursos estáticos
│   ├── index.css          # Estilos globales + Tailwind
│   └── App.css            # Estilos del componente App
├── public/               # Archivos públicos
├── .env                 # Variables de entorno
├── index.html          # HTML entry
├── tailwind.config.js # Configuración Tailwind
├── vite.config.ts    # Configuración Vite
└── tsconfig.json    # Configuración TypeScript
```

### Sistema de Rutas

```typescript
// App.tsx
<Routes>
  {/* Rutas públicas */}
  <Route path="/" element={<PublicReview />} />
  <Route path="/review/:id" element={<ReviewForm />} />
  <Route path="/admin/login" element={<Login />} />

  {/* Rutas protegidas (requieren JWT) */}
  <Route element={<ProtectedRoute />}>
    <Route path="/admin/dashboard" element={<Dashboard />} />
    <Route path="/admin/waitresses" element={<WaitressManagement />} />
    <Route path="/admin/reviews" element={<ReviewManagement />} />
    <Route path="/admin/clientes" element={<CustomerManagement />} />
  </Route>
</Routes>
```

### Context de Autenticación

**Archivo**: `frontend/src/hooks/useAuth.tsx`

**Funcionalidad**:
- Gestiona estado global de autenticación
- Persiste JWT en `localStorage`
- Proporciona métodos `login` y `logout`

**Uso**:
```typescript
const { user, isAuthenticated, login, logout } = useAuth();

// Login
await login({ username: 'admin', password: 'admin123' });

// Verificar autenticación
if (isAuthenticated) {
  // Usuario logueado
}

// Logout
logout(); // Limpia localStorage y navega a /admin/login
```

### Cliente HTTP (Axios)

**Configuración**: `frontend/src/services/api.ts`

**Interceptores**:

1. **Request Interceptor** (inyecta JWT):
```typescript
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

2. **Response Interceptor** (maneja 401):
```typescript
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);
```

### Componentes Clave

#### `RatingStars.tsx` - Estrellas Interactivas

**Props**:
- `rating: number` - Calificación actual (0-5)
- `onRatingChange?: (rating: number) => void` - Callback al cambiar
- `readonly?: boolean` - Si es solo lectura
- `size?: 'sm' | 'md' | 'lg'` - Tamaño visual

**Features**:
- Renderizado con SVG para precisión decimal (3.7 = 3 llenas + 1 al 70%)
- Hover states en modo editable
- Gradientes para mostrar parciales

**Uso**:
```tsx
<RatingStars 
  rating={4.3} 
  onRatingChange={(value) => setRating(value)}
  size="md"
/>
```

#### `ProtectedRoute.tsx` - Protección de Rutas

**Funcionalidad**:
- Verifica si usuario está autenticado
- Redirige a login si no hay JWT
- Usa `<Outlet />` para renderizar hijos

```typescript
const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  
  return isAuthenticated ? <Outlet /> : <Navigate to="/admin/login" />;
};
```

### Estilos y Tema

**Paleta de Colores** (Tailwind Config):
```javascript
colors: {
  night: {
    900: '#0a0a0a', // Fondo principal
    800: '#121212', // Fondo secundario
    700: '#1a1a1a', // Cards
    600: '#2a2a2a', // Bordes
  },
  gold: {
    400: '#D4AF37', // Oro principal
    500: '#C5A028', // Oro hover
    600: '#B69121', // Oro pressed
  },
  neon: {
    red: '#FF3B3B',      // Alertas/errores
    redGlow: 'rgba(255, 59, 59, 0.2)',
  }
}
```

**Clases Custom**:
- `.luxury-card`: Cards con glassmorphism
- `.btn-primary`: Botones principales con gradiente dorado
- `.btn-secondary`: Botones secundarios
- `.input-luxury`: Inputs con estilo premium
- `.text-gradient-gold`: Texto con gradiente dorado

---

## Autenticación y Seguridad

### Flujo de Autenticación JWT

```
1. Usuario ingresa credenciales
        ↓
2. Frontend → POST /api/auth/login
        ↓
3. Backend valida username/password
        │
        ├─→ Válido: Genera JWT
        │   └─→ return { token, user }
        │
        └─→ Inválido: 401 Unauthorized
        ↓
4. Frontend guarda token en localStorage
        ↓
5. Requests subsecuentes incluyen header:
   Authorization: Bearer <token>
        ↓
6. Backend valida JWT en cada request protegida
        │
        ├─→ Token válido: Continúa
        └─→ Token inválido/expirado: 401
        ↓
7. Frontend intercepta 401 → Auto-logout
```

### Estructura del JWT

**Payload**:
```json
{
  "id": "65a1b2c3d4e5f6789abcdef0",
  "username": "admin",
  "role": "owner",
  "iat": 1706200800,
  "exp": 1706805600
}
```

**Expiración**: 7 días (configurable en `backend/src/controllers/authController.ts`)

### Sistema Anti-Spam por IP

**Objetivo**: Prevenir múltiples reseñas del mismo cliente

**Mecanismo**:
1. Al enviar reseña, se extrae IP real del cliente
2. Se guarda en campo `ipAddress` de la reseña
3. Antes de permitir nueva reseña, se verifica:
   ```typescript
   const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
   const existingReview = await Review.findOne({
     ipAddress: clientIP,
     createdAt: { $gte: twentyFourHoursAgo }
   });
   ```
4. Si existe reseña reciente, se rechaza con 429 (Too Many Requests)

**Consideraciones**:
- Bloqueoincluso si cambió el personal a calificar (bloqueo global)
- No afecta a usuarios con IPs dinámicas después de 24h
- En redes compartidas (ej: WiFi pública), todos los usuarios comparten IP

### Roles y Permisos

| Rol | Permisos |
|-----|----------|
| **owner** | Acceso total: CRUD personal, reseñas, clientes, admins |
| **manager** | CRUD personal y reseñas, solo lectura de clientes |
| **admin** | Solo lectura de personal y reseñas |

**Implementación**:
```typescript
// En rutas protegidas
router.delete('/waitresses/:id', 
  authMiddleware, 
  authorize('owner', 'manager'), 
  deleteWaitress
);
```

### Seguridad de Contraseñas

**Hashing con bcrypt**:
```typescript
// Al crear admin
const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash(password, salt);

// Al validar login
const isMatch = await bcrypt.compare(password, hashedPassword);
```

**Parámetros**:
- **Salt Rounds**: 10 (balance entre seguridad y performance)
- **No se almacenan** contraseñas en texto plano
- **Hash único** por cada contraseña (gracias al salt)

---

## Flujos de Datos

### Flujo 1: Cliente Envía Reseña

```
1. Cliente escanea QR → /review/:id
        ↓
2. Frontend carga datos del personal
   GET /api/waitresses/:id
        ↓
3. Usuario completa formulario (5 categorías)
        ↓
4. Frontend valida: todas las categorías completas
        ↓
5. POST /api/reviews
   Body: {
     waitressId, 
     ratings: { atencion, limpieza, rapidez, conocimientoMenu, presentacion },
     categoryComments: { ... },
     comment, 
     customerName
   }
        ↓
6. Backend extrae IP real (getClientIP)
        ↓
7. Backend valida no reseña duplicada (24h)
        │
        ├─→ Duplicada: 429 Too Many Requests
        └─→ No duplicada: Continúa
        ↓
8. Backend valida existencia del personal
        │
        ├─→ No existe: 404 Not Found
        └─→ Existe: Continúa
        ↓
9. Backend crea documento Review en MongoDB
   - Hook pre-save calcula promedio automático
        ↓
10. Response 201 Created
        ↓
11. Frontend muestra mensaje de éxito
        ↓
12. Redirect a / después de 2.5 segundos
```

### Flujo 2: Admin Ve Estadísticas

```
1. Admin navega a /admin/dashboard
        ↓
2. Frontend valida JWT (ProtectedRoute)
        │
        ├─→ JWT inválido: Redirect /admin/login
        └─→ JWT válido: Continúa
        ↓
3. GET /api/reviews/stats/overall
   Headers: { Authorization: Bearer <token> }
        ↓
4. Backend valida JWT (authMiddleware)
        │
        ├─→ Inválido: 401 Unauthorized
        └─→ Válido: Continúa
        ↓
5. Backend ejecuta aggregations en MongoDB:
   - Count de reseñas y personal
   - Promedio general
   - Promedios por categoría
   - Distribución por estrellas (1-5)
   - Últimas 5 reseñas con populate de personal
        ↓
6. Response 200 OK con JSON stats
        ↓
7. Frontend renderiza:
   - Cards de métricas generales
   - Gráficos de barras (distribución)
   - Lista de reseñas recientes
```

### Flujo 3: Admin Gestiona Personal

```
1. Admin navega a /admin/waitresses
        ↓
2. GET /api/waitresses/admin/all
   (con JWT en headers)
        ↓
3. Backend retorna TODO el personal (activos + inactivos)
   + enriquecimiento con averageRating y reviewCount
        ↓
4. Frontend renderiza tabla/cards
        ↓
5. Admin clickea en "Crear Personal"
        ↓
6. Frontend muestra modal con formulario
        ↓
7. Admin completa datos + sube foto (opcional)
        ↓
8. POST /api/waitresses
   Body: { name, gender, photoUrl, active }
        ↓
9. Backend genera employeeId único (nanoid)
        ↓
10. Backend crea documento Waitress en MongoDB
        ↓
11. Response 201 Created
        ↓
12. Frontend actualiza lista (refetch)
```

---

## APIs Endpoints

### Autenticación

#### `POST /api/auth/login`
**Descripción**: Autenticar usuario administrativo

**Body**:
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response 200**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "65a1b2c3d4e5f6789abcdef0",
    "username": "admin",
    "email": "admin@petra.com",
    "role": "owner",
    "active": true
  }
}
```

**Errores**:
- `400`: Campos faltantes
- `401`: Credenciales inválidas
- `403`: Usuario inactivo

---

### Reseñas (Público)

#### `GET /api/reviews/check-duplicate/:waitressId`
**Descripción**: Verifica si IP ya envió reseña en 24h

**Response 200** (no duplicado):
```json
{
  "duplicate": false
}
```

**Response 429** (duplicado):
```json
{
  "duplicate": true,
  "message": "Ya has calificado a nuestro personal en esta visita"
}
```

#### `POST /api/reviews`
**Descripción**: Enviar nueva reseña (público)

**Body**:
```json
{
  "waitressId": "65a1b2c3d4e5f6789abcdef1",
  "ratings": {
    "atencion": 5,
    "limpieza": 4,
    "rapidez": 5,
    "conocimientoMenu": 4,
    "presentacion": 5
  },
  "categoryComments": {
    "atencion": "Muy amable",
    "limpieza": "Mesa impecable"
  },
  "comment": "Excelente servicio",
  "customerName": "Juan Pérez"
}
```

**Response 201**:
```json
{
  "message": "¡Gracias por tu reseña!",
  "review": {
    "_id": "65a1b2c3d4e5f6789abcdef2",
    "waitress": "65a1b2c3d4e5f6789abcdef1",
    "ratings": { ... },
    "rating": 4.6,
    "createdAt": "2026-01-26T18:45:00Z"
  }
}
```

**Errores**:
- `400`: Validación fallida (categorías faltantes o fuera de rango)
- `404`: Personal no encontrado
- `429`: Reseña duplicada (IP ya calificó en 24h)

---

### Personal (Público)

#### `GET /api/waitresses`
**Descripción**: Listar personal activo (para clientes)

**Response 200**:
```json
[
  {
    "_id": "65a1b2c3d4e5f6789abcdef1",
    "name": "María López",
    "employeeId": "EMP-A7B3C9D1",
    "gender": "mesera",
    "photoUrl": "https://...",
    "active": true,
    "averageRating": 4.6,
    "reviewCount": 23,
    "createdAt": "2026-01-15T10:30:00Z"
  }
]
```

#### `GET /api/waitresses/:id`
**Descripción**: Obtener un miembro del personal específico

**Response 200**:
```json
{
  "_id": "65a1b2c3d4e5f6789abcdef1",
  "name": "María López",
  "employeeId": "EMP-A7B3C9D1",
  "gender": "mesera",
  "photoUrl": "https://...",
  "active": true,
  "averageRating": 4.6,
  "reviewCount": 23
}
```

**Errores**:
- `404`: Personal no encontrado

---

### Personal (Admin) 

Requiere `Authorization: Bearer <token>`

#### `GET /api/waitresses/admin/all`
**Descripción**: Listar TODO el personal (activos + inactivos)

**Headers**: `Authorization: Bearer <token>`

**Response 200**: Igual a GET /api/waitresses pero incluye inactivos

#### `POST /api/waitresses`
**Descripción**: Crear nuevo personal

**Headers**: `Authorization: Bearer <token>`

**Body**:
```json
{
  "name": "Carlos Ramírez",
  "gender": "mesero",
  "photoUrl": "https://...",
  "active": true
}
```

**Response 201**:
```json
{
  "message": "Personal creado exitosamente",
  "waitress": {
    "_id": "...",
    "name": "Carlos Ramírez",
    "employeeId": "EMP-X9Y2Z1A3",
    "gender": "mesero",
    "active": true,
    "createdAt": "2026-01-26T20:00:00Z"
  }
}
```

**Errores**:
- `400`: Nombre faltante
- `401`: Token inválido
- `500`: Error al generar employeeId o guardar

#### `PUT /api/waitresses/:id`
**Descripción**: Actualizar personal

**Headers**: `Authorization: Bearer <token>`

**Body** (parcial):
```json
{
  "name": "Carlos Ramírez Jr.",
  "active": false
}
```

**Response 200**:
```json
{
  "message": "Personal actualizado exitosamente",
  "waitress": { ... }
}
```

**Errores**:
- `404`: Personal no encontrado
- `401`: Token inválido

#### `DELETE /api/waitresses/:id`
**Descripción**: Eliminar personal y todas sus reseñas

**Headers**: `Authorization: Bearer <token>`

**Response 200**:
```json
{
  "message": "Personal eliminado exitosamente"
}
```

**Errores**:
- `404`: Personal no encontrado
- `401`: Token inválido
- `403`: Sin permisos (requiere role owner/manager)

#### `GET /api/waitresses/:id/stats`
**Descripción**: Estadísticas individuales de un personal

**Headers**: `Authorization: Bearer <token>`

**Response 200**:
```json
{
  "totalReviews": 23,
  "averageRating": 4.6,
  "categoryAverages": {
    "atencion": 4.8,
    "limpieza": 4.5,
    "rapidez": 4.7,
    "conocimientoMenu": 4.3,
    "presentacion": 4.7
  },
  "ratingDistribution": {
    "1": 0,
    "2": 1,
    "3": 2,
    "4": 8,
    "5": 12
  }
}
```

---

### Reseñas (Admin) 

#### `GET /api/reviews`
**Descripción**: Listar todas las reseñas con filtros y paginación

**Headers**: `Authorization: Bearer <token>`

**Query Params**:
- `page` (default: 1)
- `limit` (default: 20)
- `rating` (opcional): filtrar por calificación (1-5)
- `waitressId` (opcional): filtrar por personal

**Ejemplo**: `GET /api/reviews?page=2&limit=10&rating=5&waitressId=65a1...`

**Response 200**:
```json
{
  "reviews": [
    {
      "_id": "...",
      "waitress": {
        "_id": "...",
        "name": "María López",
        "employeeId": "EMP-..."
      },
      "ratings": { ... },
      "rating": 4.6,
      "categoryComments": { ... },
      "comment": "Excelente",
      "customerName": "Juan Pérez",
      "createdAt": "2026-01-26T18:45:00Z"
    }
  ],
  "pagination": {
    "total": 145,
    "page": 2,
    "pages": 15
  }
}
```

#### `DELETE /api/reviews/:id`
**Descripción**: Eliminar una reseña específica

**Headers**: `Authorization: Bearer <token>`

**Response 200**:
```json
{
  "message": "Reseña eliminada exitosamente"
}
```

**Errores**:
- `404`: Reseña no encontrada
- `401`: Token inválido

#### `GET /api/reviews/stats/overall`
**Descripción**: Estadísticas generales del dashboard

**Headers**: `Authorization: Bearer <token>`

**Response 200**:
```json
{
  "totalReviews": 145,
  "totalWaitresses": 8,
  "averageRating": 4.5,
  "categoryAverages": {
    "atencion": 4.7,
    "limpieza": 4.4,
    "rapidez": 4.6,
    "conocimientoMenu": 4.2,
    "presentacion": 4.6
  },
  "ratingDistribution": {
    "1": 2,
    "2": 5,
    "3": 18,
    "4": 54,
    "5": 66
  },
  "recentReviews": [
    { ... },
    { ... },
    { ... },
    { ... },
    { ... }
  ]
}
```

---

### Clientes (Admin) 

#### `GET /api/customers`
**Descripción**: Listar todos los clientes

**Headers**: `Authorization: Bearer <token>`

**Response 200**:
```json
[
  {
    "_id": "...",
    "name": "Carlos Ramírez",
    "document": "1234567890",
    "phone": "+57 300 1234567",
    "email": "carlos@example.com",
    "weekStates": ["verde", "verde", "rojo", "gris", ...],
    "createdAt": "2026-01-15T10:30:00Z"
  }
]
```

#### `POST /api/customers`
**Descripción**: Crear nuevo cliente

**Headers**: `Authorization: Bearer <token>`

**Body**:
```json
{
  "name": "Carlos Ramírez",
  "document": "1234567890",
  "phone": "+57 300 1234567",
  "email": "carlos@example.com"
}
```

**Response 201**:
```json
{
  "customer": {
    "_id": "...",
    "name": "Carlos Ramírez",
    "weekStates": ["gris", "gris", "gris", ...],
    "createdAt": "2026-01-26T20:30:00Z"
  }
}
```

#### `PUT /api/customers/:id`
**Descripción**: Actualizar datos de cliente

**Headers**: `Authorization: Bearer <token>`

**Body**:
```json
{
  "name": "Carlos Ramírez Jr.",
  "phone": "+57 300 7654321"
}
```

**Response 200**:
```json
{
  "customer": { ... }
}
```

#### `DELETE /api/customers/:id`
**Descripción**: Eliminar cliente

**Headers**: `Authorization: Bearer <token>`

**Response 200**:
```json
{
  "message": "Cliente eliminado exitosamente"
}
```

#### `PATCH /api/customers/:id/weeks/:weekIndex`
**Descripción**: Actualizar estado de una semana específica

**Headers**: `Authorization: Bearer <token>`

**Params**:
- `id`: ID del cliente
- `weekIndex`: Índice de la semana (0-11)

**Body**:
```json
{
  "state": "verde"
}
```

**Response 200**:
```json
{
  "customer": {
    "_id": "...",
    "name": "Carlos Ramírez",
    "weekStates": ["verde", "verde", "rojo", ...],
    ...
  }
}
```

**Errores**:
- `400`: weekIndex inválido (debe ser 0-11)
- `400`: state inválido (debe ser 'gris', 'rojo' o 'verde')
- `404`: Cliente no encontrado


## Optimización y Performance

### Frontend

#### 1. Code Splitting

**Lazy Loading de Rutas**:
```typescript
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const WaitressManagement = lazy(() => import('./pages/WaitressManagement'));

<Suspense fallback={<div>Loading...</div>}>
  <Route path="/admin/dashboard" element={<Dashboard />} />
</Suspense>
```

#### 2. Memoización

**React.memo para Componentes Pesados**:
```typescript
export default React.memo(WaitressCard, (prevProps, nextProps) => {
  return prevProps.waitress._id === nextProps.waitress._id
    && prevProps.waitress.averageRating === nextProps.waitress.averageRating;
});
```

#### 3. Debouncing en Búsquedas

```typescript
import { useDebounce } from 'use-debounce';

const [searchTerm, setSearchTerm] = useState('');
const [debouncedSearch] = useDebounce(searchTerm, 500);

useEffect(() => {
  if (debouncedSearch) {
    searchWaitresses(debouncedSearch);
  }
}, [debouncedSearch]);
```

#### 4. Caché de Imágenes

```typescript
<img 
  src={waitress.photoUrl} 
  alt={waitress.name}
  loading="lazy"
  decoding="async"
/>
```

### Backend

#### 1. Índices de MongoDB

Ya implementados en modelos:
```typescript
// Mejorar queries de reseñas por personal
ReviewSchema.index({ waitress: 1, createdAt: -1 });

// Mejorar validación anti-spam
ReviewSchema.index({ ipAddress: 1, createdAt: -1 });

// Login rápido
AdminSchema.index({ username: 1 }, { unique: true });
```

#### 2. Proyecciones en Queries

```typescript
//  Traer todo
const reviews = await Review.find({});

// Traer solo campos necesarios
const reviews = await Review.find({})
  .select('waitress rating comment createdAt')
  .limit(20);
```

#### 3. Paginación

```typescript
const limit = parseInt(req.query.limit) || 20;
const page = parseInt(req.query.page) || 1;
const skip = (page - 1) * limit;

const reviews = await Review.find(filter)
  .limit(limit)
  .skip(skip)
  .sort({ createdAt: -1 });
```

#### 4. Aggregation Pipeline para Stats

```typescript
// En lugar de múltiples queries
const avgRating = reviews.reduce(...) / reviews.length;
const categoryAvg = reviews.reduce(...) / reviews.length;

// Usar aggregation
const stats = await Review.aggregate([
  { $group: {
      _id: null,
      avgRating: { $avg: '$rating' },
      avgAtencion: { $avg: '$ratings.atencion' },
      count: { $sum: 1 }
    }
  }
]);
```


### Base de Datos

#### 1. Monitoreo de Performance

**MongoDB Atlas Dashboard**:
- Query Performance → Identificar queries lentas
- Index Suggestions → Crear índices recomendados

#### 2. Estrategia de Escalamiento

**Vertical** (más recursos):
- M0 → M2 ($9/mes): 2GB storage, 2 vCPU shared
- M2 → M5 ($25/mes): 5GB storage, 2 vCPU dedicated

**Horizontal** (sharding):
- A partir de M30+ ($200/mes)
- Para más de 1M documentos o >1GB/día de escrituras

---

## Troubleshooting

### Errores Comunes

#### 1. CORS Error en Frontend

**Síntoma**: `Access to XMLHttpRequest has been blocked by CORS policy`

**Solución**:
```typescript
// backend/src/index.ts
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
```

#### 2. JWT Token Inválido

**Síntoma**: 401 Unauthorized en requests protegidas

**Verificar**:
1. Token existe en localStorage: `localStorage.getItem('token')`
2. Token no expirado: Decodificar en [jwt.io](https://jwt.io)
3. `JWT_SECRET` igual en backend que cuando se generó el token

#### 3. MongoDB Connection Failed

**Síntoma**: `MongoNetworkError: failed to connect`

**Verificar**:
1. Connection string correcto en `.env`
2. Whitelist de IPs en Atlas incluye tu IP actual
3. Usuario de DB tiene permisos correctos

#### 4. Reseñas Duplicadas Permitidas

**Síntoma**: Se pueden enviar múltiples reseñas desde mismo dispositivo

**Verificar**:
1. `getClientIP` devuelve IP correcta (no `::1` en localhost)
2. Índice `{ ipAddress: 1, createdAt: -1 }` existe en collection `reviews`
3. Lógica de validación en `submitReview` activa

#### 5. Imágenes No Cargan

**Síntoma**: Fotos de personal no se muestran

**Verificar**:
1. URLs de fotos son accesibles públicamente
2. CORS de servidor de imágenes permite tu dominio
3. URLs son HTTPS en producción

### Logs y Debugging

**Backend**:
```bash
# Ver logs en Render
Dashboard → Logs → Recent Logs

# Logs locales con niveles
npm install winston
# Implementar logger centralizado
```

**Frontend**:
```typescript
// Habilitar logs de Axios
axios.interceptors.request.use(req => {
  console.log('Request:', req.method, req.url);
  return req;
});
```

---

## Seguridad en Producción

### Checklist de Seguridad

- [ ] `JWT_SECRET` es cadena aleatoria de 32+ caracteres
- [ ] Variables de entorno no committeadas en Git
- [ ] HTTPS habilitado (automático con Vercel/Render)
- [ ] CORS configurado con dominios específicos
- [ ] MongoDB usuario con permisos mínimos (readWrite, no admin)
- [ ] Network Access en Atlas restringido a IPs de Render
- [ ] Contraseña de admin cambiada desde seed default
- [ ] Rate limiting implementado (futuro: express-rate-limit)
- [ ] Headers de seguridad (futuro: helmet.js)
- [ ] Auditoría de dependencias: `npm audit` limpio

### Headers de Seguridad Recomendados

```typescript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
      fontSrc: ["'self'", "fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
```

---

## Mantenimiento

### Actualizaciones de Dependencias

**Mensual**:
```bash
# Verificar actualizaciones
npm outdated

# Actualizar patch y minor
npm update

# Auditoría de seguridad
npm audit
npm audit fix
```

**Trimestral**:
```bash
# Major versions (revisar breaking changes)
npm install react@latest
npm install express@latest
# ... etc
```

