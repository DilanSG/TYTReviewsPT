import express from 'express';
import {
    getAllWaitresses,
    getAllWaitressesAdmin,
    getWaitressById,
    createWaitress,
    updateWaitress,
    deleteWaitress,
    getWaitressStats,
} from '../controllers/waitressController';
import { authMiddleware, authorize } from '../middleware/auth';

const router = express.Router();

/*
 * Rutas públicas para mostrar solo personal activo.
 * Alimentan el flujo de reseñas del cliente.
 */
router.get('/', getAllWaitresses);
router.get('/:id', getWaitressById);

/*
 * Rutas administrativas protegidas por JWT y roles.
 * Permiten CRUD y consulta de métricas.
 */
router.get('/admin/all', authMiddleware, authorize('admin', 'manager'), getAllWaitressesAdmin);
router.post('/', authMiddleware, authorize('admin', 'manager'), createWaitress);
router.put('/:id', authMiddleware, authorize('admin', 'manager'), updateWaitress);
router.delete('/:id', authMiddleware, authorize('admin', 'manager'), deleteWaitress);
router.get('/:id/stats', authMiddleware, getWaitressStats);

export default router;
