import express from 'express';
import {
    submitReview,    checkDuplicate,    getWaitressReviews,
    getAllReviews,
    deleteReview,
    getOverallStats,
} from '../controllers/reviewController';
import { authMiddleware, authorize } from '../middleware/auth';

const router = express.Router();

/*
 * Rutas públicas para envío y consulta de reseñas.
 * No requieren autenticación.
 */
router.post('/', submitReview);
router.get('/check-duplicate/:waitressId', checkDuplicate);
router.get('/waitress/:waitressId', getWaitressReviews);

/*
 * Rutas protegidas para administración de reseñas.
 * Requieren autenticación y roles permitidos.
 */
router.get('/', authMiddleware, getAllReviews);
router.delete('/:id', authMiddleware, authorize('admin', 'manager'), deleteReview);
router.get('/stats/overall', authMiddleware, getOverallStats);

export default router;
