import { Request, Response } from 'express';
import Review from '../models/Review';
import Waitress from '../models/Waitress';
import { AuthRequest } from '../middleware/auth';
import { getClientIP } from '../utils/getClientIP';

/*
 * Verifica si una IP ya envió alguna reseña en esta visita.
 * Se usa antes de abrir el formulario para evitar frustración del usuario.
 * Bloqueo global: una sola reseña por visita, sin importar el mesero.
 */
export const checkDuplicate = async (req: Request, res: Response): Promise<void> => {
    try {
        const { waitressId } = req.params;

        const clientIP = getClientIP(req);
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        
        /*
         * Buscar cualquier reseña de esta IP en las últimas 24h.
         * No importa a qué mesero calificó: solo una reseña por visita.
         */
        const existingReview = await Review.findOne({
            ipAddress: clientIP,
            createdAt: { $gte: twentyFourHoursAgo }
        });

        if (existingReview) {
            res.status(429).json({
                duplicate: true,
                message: 'Ya has calificado a nuestro personal en esta visita'
            });
            return;
        }

        res.json({ duplicate: false });
    } catch (error) {
        console.error('Check duplicate error:', error);
        res.status(500).json({ message: 'Error al verificar reseña' });
    }
};

/*
 * Envía una reseña pública sin autenticación.
 * Valida categorías y asocia la reseña al personal indicado.
 */
export const submitReview = async (req: Request, res: Response): Promise<void> => {
    try {
        const { waitressId, ratings, categoryComments, comment, customerName } = req.body;

        /*
         * Validaciones mínimas de entrada para evitar payloads incompletos.
         * Se responde 400 cuando faltan datos esenciales.
         */
        if (!waitressId || !ratings) {
            res.status(400).json({
                message: 'ID de mesera y calificaciones son requeridas'
            });
            return;
        }

        /*
         * Validar todas las categorías con rango 1-5.
         * Mantiene consistencia con los límites del esquema.
         */
        const requiredCategories = ['atencion', 'limpieza', 'rapidez', 'conocimientoMenu', 'presentacion'];
        for (const category of requiredCategories) {
            if (!ratings[category] || ratings[category] < 1 || ratings[category] > 5) {
                res.status(400).json({
                    message: `Calificación de ${category} inválida (debe estar entre 1 y 5)`
                });
                return;
            }
        }

        /*
         * Verificar que el personal exista antes de crear la reseña.
         * Evita referencias inválidas y respuestas ambiguas.
         */
        const waitress = await Waitress.findById(waitressId);
        if (!waitress) {
            res.status(404).json({ message: 'Personal no encontrado' });
            return;
        }

        /*
         * Extraer IP del cliente para prevenir reseñas duplicadas.
         * Se considera la IP real del usuario final, no del proxy.
         */
        const clientIP = getClientIP(req);

        /*
         * Validar que no exista ninguna reseña del mismo cliente en 24h.
         * Bloqueo global: solo una reseña por visita, sin importar el mesero.
         */
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const existingReview = await Review.findOne({
            ipAddress: clientIP,
            createdAt: { $gte: twentyFourHoursAgo }
        });

        if (existingReview) {
            res.status(429).json({
                message: 'Ya has calificado a nuestro personal en esta visita'
            });
            return;
        }

        /*
         * Crear reseña con todas las categorías e IP del cliente.
         * El promedio se calcula en el hook del modelo Review.
         */
        const review = new Review({
            waitress: waitressId,
            ratings: {
                atencion: ratings.atencion,
                limpieza: ratings.limpieza,
                rapidez: ratings.rapidez,
                conocimientoMenu: ratings.conocimientoMenu,
                presentacion: ratings.presentacion,
            },
            categoryComments: categoryComments || {},
            comment,
            customerName,
            ipAddress: clientIP,
        });

        await review.save();

        res.status(201).json({
            message: '¡Gracias por tu reseña!',
            review,
        });
    } catch (error) {
        console.error('Submit review error:', error);
        res.status(500).json({ message: 'Error al enviar reseña' });
    }
};

/*
 * Lista reseñas de una persona con paginación pública.
 * Ordena por fecha descendente para mostrar lo más reciente primero.
 */
export const getWaitressReviews = async (req: Request, res: Response): Promise<void> => {
    try {
        const { waitressId } = req.params;
        const { limit = '10', page = '1' } = req.query;

        const limitNum = parseInt(limit as string);
        const pageNum = parseInt(page as string);
        const skip = (pageNum - 1) * limitNum;

        const reviews = await Review.find({ waitress: waitressId })
            .sort({ createdAt: -1 })
            .limit(limitNum)
            .skip(skip)
            .select('-__v');

        const total = await Review.countDocuments({ waitress: waitressId });

        res.json({
            reviews,
            pagination: {
                total,
                page: pageNum,
                pages: Math.ceil(total / limitNum),
            },
        });
    } catch (error) {
        console.error('Get reviews error:', error);
        res.status(500).json({ message: 'Error al obtener reseñas' });
    }
};

/*
 * Lista todas las reseñas con filtros opcionales (admin).
 * Permite filtrar por calificación o por persona.
 */
export const getAllReviews = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { limit = '20', page = '1', rating, waitressId } = req.query;

        const limitNum = parseInt(limit as string);
        const pageNum = parseInt(page as string);
        const skip = (pageNum - 1) * limitNum;

        /*
         * Construir filtros dinámicos según query.
         * Se aplican únicamente los parámetros presentes.
         */
        const filter: any = {};
        if (rating) filter.rating = parseInt(rating as string);
        if (waitressId) filter.waitress = waitressId;

        const reviews = await Review.find(filter)
            .populate('waitress', 'name employeeId')
            .sort({ createdAt: -1 })
            .limit(limitNum)
            .skip(skip);

        const total = await Review.countDocuments(filter);

        res.json({
            reviews,
            pagination: {
                total,
                page: pageNum,
                pages: Math.ceil(total / limitNum),
            },
        });
    } catch (error) {
        console.error('Get all reviews error:', error);
        res.status(500).json({ message: 'Error al obtener reseñas' });
    }
};

/*
 * Elimina una reseña específica (admin).
 * Se valida existencia para responder 404 de forma clara.
 */
export const deleteReview = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const review = await Review.findByIdAndDelete(id);

        if (!review) {
            res.status(404).json({ message: 'Reseña no encontrada' });
            return;
        }

        res.json({ message: 'Reseña eliminada exitosamente' });
    } catch (error) {
        console.error('Delete review error:', error);
        res.status(500).json({ message: 'Error al eliminar reseña' });
    }
};

/*
 * Obtiene estadísticas generales para el dashboard (admin).
 * Centraliza promedios, distribución y reseñas recientes.
 */
export const getOverallStats = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const totalReviews = await Review.countDocuments();
        const totalWaitresses = await Waitress.countDocuments({ active: true });

        const reviews = await Review.find();
        const avgRating = reviews.length > 0
            ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
            : 0;

        /*
         * Calcular promedios por categoría a partir de todas las reseñas.
         * Se redondea después para la presentación en el cliente.
         */
        const categoryAverages = reviews.length > 0 ? {
            atencion: reviews.reduce((sum, r) => sum + (r.ratings?.atencion || 0), 0) / reviews.length,
            limpieza: reviews.reduce((sum, r) => sum + (r.ratings?.limpieza || 0), 0) / reviews.length,
            rapidez: reviews.reduce((sum, r) => sum + (r.ratings?.rapidez || 0), 0) / reviews.length,
            conocimientoMenu: reviews.reduce((sum, r) => sum + (r.ratings?.conocimientoMenu || 0), 0) / reviews.length,
            presentacion: reviews.reduce((sum, r) => sum + (r.ratings?.presentacion || 0), 0) / reviews.length,
        } : {
            atencion: 0,
            limpieza: 0,
            rapidez: 0,
            conocimientoMenu: 0,
            presentacion: 0,
        };

        const ratingDistribution = reviews.reduce((acc, review) => {
            const roundedRating = Math.round(review.rating);
            acc[roundedRating] = (acc[roundedRating] || 0) + 1;
            return acc;
        }, {} as Record<number, number>);

        /*
         * Obtener reseñas recientes para el panel.
         * Se limita a 5 y se incluye el nombre del personal.
         */
        const recentReviews = await Review.find()
            .populate('waitress', 'name')
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({
            totalReviews,
            totalWaitresses,
            averageRating: Math.round(avgRating * 10) / 10,
            categoryAverages: {
                atencion: Math.round(categoryAverages.atencion * 10) / 10,
                limpieza: Math.round(categoryAverages.limpieza * 10) / 10,
                rapidez: Math.round(categoryAverages.rapidez * 10) / 10,
                conocimientoMenu: Math.round(categoryAverages.conocimientoMenu * 10) / 10,
                presentacion: Math.round(categoryAverages.presentacion * 10) / 10,
            },
            ratingDistribution,
            recentReviews,
        });
    } catch (error) {
        console.error('Get overall stats error:', error);
        res.status(500).json({ message: 'Error al obtener estadísticas' });
    }
};
