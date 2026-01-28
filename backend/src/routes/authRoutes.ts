import express from 'express';
import { 
    login, 
    register,
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deactivateUser,
    activateUser,
    deleteUser
} from '../controllers/authController';
import { authMiddleware, authorize } from '../middleware/auth';

const router = express.Router();

/*
 * POST /api/auth/login para inicio de sesión.
 * Devuelve token JWT y datos básicos del usuario.
 */
router.post('/login', login);

/*
 * POST /api/auth/register para registro interno.
 * Se usa en setup inicial o creación por owner.
 */
router.post('/register', register);

/*
 * Rutas de gestión de usuarios - solo para admin.
 * Manager no tiene acceso a estas rutas.
 */

// GET /api/auth/users - obtener todos los usuarios
router.get('/users', authMiddleware, authorize('admin'), getAllUsers);

// GET /api/auth/users/:id - obtener usuario por ID
router.get('/users/:id', authMiddleware, authorize('admin'), getUserById);

// POST /api/auth/users - crear nuevo usuario
router.post('/users', authMiddleware, authorize('admin'), createUser);

// PUT /api/auth/users/:id - actualizar usuario
router.put('/users/:id', authMiddleware, authorize('admin'), updateUser);

// PATCH /api/auth/users/:id/deactivate - desactivar usuario (soft delete)
router.patch('/users/:id/deactivate', authMiddleware, authorize('admin'), deactivateUser);

// PATCH /api/auth/users/:id/activate - reactivar usuario
router.patch('/users/:id/activate', authMiddleware, authorize('admin'), activateUser);

// DELETE /api/auth/users/:id - eliminar usuario permanentemente (hard delete)
router.delete('/users/:id', authMiddleware, authorize('admin'), deleteUser);

export default router;
