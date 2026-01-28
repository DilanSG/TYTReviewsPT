import { Response } from 'express';
import Customer from '../models/Customer';
import { AuthRequest } from '../middleware/auth';

/*
 * Lista clientes registrados con sus estados semanales.
 * Se usa en el panel para mostrar y seleccionar clientes.
 */
export const getCustomers = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const customers = await Customer.find().sort({ createdAt: -1 });
        res.json(customers);
    } catch (error) {
        console.error('Get customers error:', error);
        res.status(500).json({ message: 'Error al obtener clientes' });
    }
};

/*
 * Crea un cliente con estados de semanas por defecto en gris.
 * Permite registrar documento opcional.
 */
export const createCustomer = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name, document, phone, email } = req.body;

        if (!name || !name.trim()) {
            res.status(400).json({ message: 'El nombre del cliente es requerido' });
            return;
        }

        const customer = new Customer({
            name: name.trim(),
            document: document?.trim() || undefined,
            phone: phone?.trim() || undefined,
            email: email?.trim() || undefined,
        });

        await customer.save();

        res.status(201).json({
            message: 'Cliente creado exitosamente',
            customer,
        });
    } catch (error) {
        console.error('Create customer error:', error);
        res.status(500).json({ message: 'Error al crear cliente' });
    }
};

/*
 * Actualiza datos del cliente (nombre y documento).
 * Se permite modificación parcial sin tocar estados semanales.
 */
export const updateCustomer = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { name, document, phone, email } = req.body;

        const updateData: { name?: string; document?: string; phone?: string; email?: string } = {};
        if (name && String(name).trim()) {
            updateData.name = String(name).trim();
        }
        if (document !== undefined) {
            updateData.document = String(document).trim() || undefined;
        }
        if (phone !== undefined) {
            updateData.phone = String(phone).trim() || undefined;
        }
        if (email !== undefined) {
            updateData.email = String(email).trim() || undefined;
        }

        if (!Object.keys(updateData).length) {
            res.status(400).json({ message: 'No hay datos para actualizar' });
            return;
        }

        const customer = await Customer.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });

        if (!customer) {
            res.status(404).json({ message: 'Cliente no encontrado' });
            return;
        }

        res.json({
            message: 'Cliente actualizado',
            customer,
        });
    } catch (error) {
        console.error('Update customer error:', error);
        res.status(500).json({ message: 'Error al actualizar cliente' });
    }
};

/*
 * Elimina un cliente del sistema.
 * Se usa en el panel cuando un registro deja de ser relevante.
 */
export const deleteCustomer = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const customer = await Customer.findByIdAndDelete(id);
        if (!customer) {
            res.status(404).json({ message: 'Cliente no encontrado' });
            return;
        }

        res.json({ message: 'Cliente eliminado' });
    } catch (error) {
        console.error('Delete customer error:', error);
        res.status(500).json({ message: 'Error al eliminar cliente' });
    }
};

/*
 * Actualiza el estado de una semana específica.
 * Se valida el índice (0-51) y el color permitido.
 */
export const updateCustomerWeekState = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const { id, weekIndex } = req.params;
        const { state } = req.body as { state: 'gris' | 'rojo' | 'verde' };

        const week = Number(weekIndex);
        if (Number.isNaN(week) || week < 0 || week > 51) {
            res.status(400).json({ message: 'El índice de semana es inválido' });
            return;
        }

        if (!['gris', 'rojo', 'verde'].includes(state)) {
            res.status(400).json({ message: 'El estado de semana es inválido' });
            return;
        }

        const customer = await Customer.findById(id);
        if (!customer) {
            res.status(404).json({ message: 'Cliente no encontrado' });
            return;
        }

        customer.weekStates[week] = state;
        await customer.save();

        res.json({
            message: 'Semana actualizada',
            customer,
        });
    } catch (error) {
        console.error('Update customer week error:', error);
        res.status(500).json({ message: 'Error al actualizar semana' });
    }
};
