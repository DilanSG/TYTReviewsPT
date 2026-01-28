import mongoose, { Document, Schema } from 'mongoose';

export interface IRatings {
    atencion: number;
    limpieza: number;
    rapidez: number;
    conocimientoMenu: number;
    presentacion: number;
}

export interface ICategoryComments {
    atencion?: string;
    limpieza?: string;
    rapidez?: string;
    conocimientoMenu?: string;
    presentacion?: string;
}

export interface IReview extends Document {
    waitress: mongoose.Types.ObjectId;
    ratings: IRatings;
    /*
     * Promedio calculado en servidor con base en las 5 categorías.
     * Se usa para métricas y ordenamientos en el panel.
     */
    rating: number;
    /*
     * Comentarios específicos por cada categoría de calificación.
     * Permite al cliente detallar su experiencia en cada aspecto.
     */
    categoryComments?: ICategoryComments;
    comment?: string;
    customerName?: string;
    /*
     * IP del cliente que envió la reseña.
     * Se usa para prevenir reseñas duplicadas del mismo cliente en 24h.
     */
    ipAddress?: string;
    createdAt: Date;
    updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
    {
        waitress: {
            type: Schema.Types.ObjectId,
            ref: 'Waitress',
            required: [true, 'La mesera es requerida'],
            index: true,
        },
        ratings: {
            atencion: {
                type: Number,
                required: [true, 'La calificación de atención es requerida'],
                min: [1, 'La calificación mínima es 1'],
                max: [5, 'La calificación máxima es 5'],
            },
            limpieza: {
                type: Number,
                required: [true, 'La calificación de limpieza es requerida'],
                min: [1, 'La calificación mínima es 1'],
                max: [5, 'La calificación máxima es 5'],
            },
            rapidez: {
                type: Number,
                required: [true, 'La calificación de rapidez es requerida'],
                min: [1, 'La calificación mínima es 1'],
                max: [5, 'La calificación máxima es 5'],
            },
            conocimientoMenu: {
                type: Number,
                required: [true, 'La calificación de conocimiento del menú es requerida'],
                min: [1, 'La calificación mínima es 1'],
                max: [5, 'La calificación máxima es 5'],
            },
            presentacion: {
                type: Number,
                required: [true, 'La calificación de presentación es requerida'],
                min: [1, 'La calificación mínima es 1'],
                max: [5, 'La calificación máxima es 5'],
            },
        },
        rating: {
            type: Number,
            min: 1,
            max: 5,
        },
        categoryComments: {
            atencion: {
                type: String,
                trim: true,
                maxlength: [300, 'El comentario no puede exceder 300 caracteres'],
            },
            limpieza: {
                type: String,
                trim: true,
                maxlength: [300, 'El comentario no puede exceder 300 caracteres'],
            },
            rapidez: {
                type: String,
                trim: true,
                maxlength: [300, 'El comentario no puede exceder 300 caracteres'],
            },
            conocimientoMenu: {
                type: String,
                trim: true,
                maxlength: [300, 'El comentario no puede exceder 300 caracteres'],
            },
            presentacion: {
                type: String,
                trim: true,
                maxlength: [300, 'El comentario no puede exceder 300 caracteres'],
            },
        },
        comment: {
            type: String,
            trim: true,
            maxlength: [500, 'El comentario no puede exceder 500 caracteres'],
        },
        customerName: {
            type: String,
            trim: true,
            maxlength: [100, 'El nombre no puede exceder 100 caracteres'],
        },
        ipAddress: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

/*
 * Hook pre-save para calcular el promedio.
 * Centraliza el cálculo y evita duplicarlo en controladores.
 */
ReviewSchema.pre('save', function () {
    if (this.ratings) {
        const { atencion, limpieza, rapidez, conocimientoMenu, presentacion } = this.ratings;
        this.rating = (atencion + limpieza + rapidez + conocimientoMenu + presentacion) / 5;
        /*
         * Redondear a 1 decimal para presentación consistente.
         * Se mantiene precisión suficiente para estadísticas.
         */
        this.rating = Math.round(this.rating * 10) / 10;
    }
});

/*
 * Índices para consultas eficientes por personal y calificación.
 * Optimizan listados y filtros en el panel administrativo.
 */
ReviewSchema.index({ waitress: 1, createdAt: -1 });
ReviewSchema.index({ rating: 1 });
/*
 * Índice compuesto para validación de duplicados por IP.
 * Permite búsqueda rápida de reseñas del mismo cliente en ventana de 24h.
 */
ReviewSchema.index({ ipAddress: 1, createdAt: -1 });

export default mongoose.model<IReview>('Review', ReviewSchema);
