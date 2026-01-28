import { Response } from 'express';
import Waitress from '../models/Waitress';
import Review from '../models/Review';
import { AuthRequest } from '../middleware/auth';
import { Request } from 'express';

/*
 * Obtiene únicamente personal activo para el flujo público.
 * Esta lista alimenta el QR y evita exponer registros inactivos.
 */
export const getAllWaitresses = async (req: Request, res: Response): Promise<void> => {
    try {
        const waitresses = await Waitress.find({ active: true }).select('-__v');

        /*
         * Enriquecer cada registro con promedio y conteo de reseñas.
         * Se consulta Review por persona para devolver métricas agregadas.
         */
        const waitressesWithRatings = await Promise.all(
            waitresses.map(async (waitress) => {
                const reviews = await Review.find({ waitress: waitress._id });
                const avgRating = reviews.length > 0
                    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
                    : 0;

                return {
                    ...waitress.toObject(),
                    averageRating: Math.round(avgRating * 10) / 10,
                    reviewCount: reviews.length,
                };
            })
        );

        res.json(waitressesWithRatings);
    } catch (error) {
        console.error('Get waitresses error:', error);
        res.status(500).json({ message: 'Error al obtener personal' });
    }
};

/*
 * Obtiene todo el personal (incluye inactivos) para uso administrativo.
 * Permite gestión completa desde el panel sin filtrar por estado.
 */
export const getAllWaitressesAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const waitresses = await Waitress.find({}).select('-__v');

        /*
         * Calcular métricas para el panel (promedio y total de reseñas).
         * Se agregan al payload para evitar cálculos en el cliente.
         */
        const waitressesWithRatings = await Promise.all(
            waitresses.map(async (waitress) => {
                const reviews = await Review.find({ waitress: waitress._id });
                const avgRating = reviews.length > 0
                    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
                    : 0;

                return {
                    ...waitress.toObject(),
                    averageRating: Math.round(avgRating * 10) / 10,
                    reviewCount: reviews.length,
                };
            })
        );

        res.json(waitressesWithRatings);
    } catch (error) {
        console.error('Get all waitresses admin error:', error);
        res.status(500).json({ message: 'Error al obtener personal' });
    }
};

/*
 * Obtiene un miembro del personal por ID y agrega métricas públicas.
 * Se usa en el detalle previo a la reseña para contexto del cliente.
 */
export const getWaitressById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const waitress = await Waitress.findById(id);

        if (!waitress) {
            res.status(404).json({ message: 'Personal no encontrado' });
            return;
        }

        /*
         * Consultar reseñas para calcular promedio y total.
         * La agregación se hace aquí para devolver datos listos al cliente.
         */
        const reviews = await Review.find({ waitress: id });
        const avgRating = reviews.length > 0
            ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
            : 0;

        res.json({
            ...waitress.toObject(),
            averageRating: Math.round(avgRating * 10) / 10,
            reviewCount: reviews.length,
        });
    } catch (error) {
        console.error('Get waitress error:', error);
        res.status(500).json({ message: 'Error al obtener personal' });
    }
};

/*
 * Crea nuevo personal con validaciones mínimas de entrada.
 * Este endpoint es de administración y controla valores por defecto.
 */
export const createWaitress = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name, photoUrl, gender, active } = req.body;

        if (!name) {
            res.status(400).json({ message: 'El nombre es requerido' });
            return;
        }

        const waitress = new Waitress({
            name,
            photoUrl,
            gender: gender || 'mesera',
            active: active !== undefined ? active : true,
        });

        await waitress.save();

        res.status(201).json({
            message: 'Personal creado exitosamente',
            waitress,
        });
    } catch (error: any) {
        console.error('Create waitress error:', error);
        res.status(500).json({ message: 'Error al crear personal' });
    }
};

/*
 * Actualiza datos del personal con cambios parciales.
 * Solo administración, respetando validaciones del modelo.
 */
export const updateWaitress = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { name, photoUrl, gender, active } = req.body;

        /*
         * Solo se envían campos presentes para evitar sobreescrituras.
         * Se construye un updateData parcial en función del body.
         */
        const updateData: any = {};
        if (name) updateData.name = name;
        if (photoUrl !== undefined) updateData.photoUrl = photoUrl;
        if (gender) updateData.gender = gender;
        if (active !== undefined) updateData.active = active;

        const waitress = await Waitress.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!waitress) {
            res.status(404).json({ message: 'Personal no encontrado' });
            return;
        }

        res.json({
            message: 'Personal actualizado exitosamente',
            waitress,
        });
    } catch (error: any) {
        console.error('Update waitress error:', error);
        res.status(500).json({ message: 'Error al actualizar personal' });
    }
};

/*
 * Elimina personal y sus reseñas asociadas.
 * Se hace limpieza de reviews para mantener consistencia.
 */
export const deleteWaitress = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const waitress = await Waitress.findByIdAndDelete(id);

        if (!waitress) {
            res.status(404).json({ message: 'Personal no encontrado' });
            return;
        }

        /*
         * Eliminar también reseñas vinculadas para mantener consistencia.
         * Evita estadísticas infladas y referencias huérfanas.
         */
        await Review.deleteMany({ waitress: id });

        res.json({ message: 'Personal eliminado exitosamente' });
    } catch (error) {
        console.error('Delete waitress error:', error);
        res.status(500).json({ message: 'Error al eliminar personal' });
    }
};

/*
 * Obtiene estadísticas agregadas de reseñas para el panel.
 * Devuelve conteo total, promedio y distribución por estrellas.
 */
export const getWaitressStats = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const reviews = await Review.find({ waitress: id });

        if (reviews.length === 0) {
            res.json({
                totalReviews: 0,
                averageRating: 0,
                categoryAverages: {
                    atencion: 0,
                    limpieza: 0,
                    rapidez: 0,
                    conocimientoMenu: 0,
                    presentacion: 0,
                },
                ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
            });
            return;
        }

        /*
         * Promedio general y distribución por estrellas.
         * La distribución facilita el render de gráficos en el dashboard.
         */
        const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

        const categoryAverages = {
            atencion: reviews.reduce((sum, r) => sum + (r.ratings?.atencion || 0), 0) / reviews.length,
            limpieza: reviews.reduce((sum, r) => sum + (r.ratings?.limpieza || 0), 0) / reviews.length,
            rapidez: reviews.reduce((sum, r) => sum + (r.ratings?.rapidez || 0), 0) / reviews.length,
            conocimientoMenu: reviews.reduce((sum, r) => sum + (r.ratings?.conocimientoMenu || 0), 0) / reviews.length,
            presentacion: reviews.reduce((sum, r) => sum + (r.ratings?.presentacion || 0), 0) / reviews.length,
        };

        const ratingDistribution = reviews.reduce((acc, review) => {
            const roundedRating = Math.round(review.rating);
            acc[roundedRating] = (acc[roundedRating] || 0) + 1;
            return acc;
        }, {} as Record<number, number>);

        res.json({
            totalReviews: reviews.length,
            averageRating: Math.round(avgRating * 10) / 10,
            categoryAverages: {
                atencion: Math.round(categoryAverages.atencion * 10) / 10,
                limpieza: Math.round(categoryAverages.limpieza * 10) / 10,
                rapidez: Math.round(categoryAverages.rapidez * 10) / 10,
                conocimientoMenu: Math.round(categoryAverages.conocimientoMenu * 10) / 10,
                presentacion: Math.round(categoryAverages.presentacion * 10) / 10,
            },
            ratingDistribution,
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ message: 'Error al obtener estadísticas' });
    }
};
