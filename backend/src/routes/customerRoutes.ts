import express from 'express';
import {
    createCustomer,
    deleteCustomer,
    getCustomers,
    updateCustomerWeekState,
    updateCustomer,
} from '../controllers/customerController';
import { authMiddleware, authorize } from '../middleware/auth';

const router = express.Router();

/*
 * Rutas administrativas para clientes del bar.
 * Requieren autenticación y roles permitidos.
 */
router.get('/', authMiddleware, authorize('admin', 'manager'), getCustomers);
router.post('/', authMiddleware, authorize('admin', 'manager'), createCustomer);
router.put('/:id', authMiddleware, authorize('admin', 'manager'), updateCustomer);
router.delete('/:id', authMiddleware, authorize('admin', 'manager'), deleteCustomer);
router.patch(
    '/:id/weeks/:weekIndex',
    authMiddleware,
    authorize('admin', 'manager'),
    updateCustomerWeekState
);

export default router;
