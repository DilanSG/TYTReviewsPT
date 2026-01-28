import mongoose, { Document, Schema } from 'mongoose';
import { nanoid } from 'nanoid';

export interface IWaitress extends Document {
    name: string;
    photoUrl?: string;
    employeeId: string;
    gender: 'mesero' | 'mesera';
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const WaitressSchema = new Schema<IWaitress>(
    {
        name: {
            type: String,
            required: [true, 'El nombre es requerido'],
            trim: true,
            minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
            maxlength: [100, 'El nombre no puede exceder 100 caracteres'],
        },
        photoUrl: {
            type: String,
            trim: true,
            default: null,
        },
        employeeId: {
            type: String,
            unique: true,
            trim: true,
            default: () => `EMP-${nanoid(8).toUpperCase()}`,
        },
        gender: {
            type: String,
            enum: ['mesero', 'mesera'],
            required: [true, 'El género es requerido'],
            default: 'mesera',
        },
        active: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

/*
 * Virtual para relacionar reseñas y calcular métricas.
 * Permite consultas con populate cuando se requiere detalle.
 */
WaitressSchema.virtual('averageRating', {
    ref: 'Review',
    localField: '_id',
    foreignField: 'waitress',
    justOne: false,
});

/*
 * Índice para consultas rápidas por estado.
 * El índice de employeeId lo genera unique automáticamente.
 */
WaitressSchema.index({ active: 1 });

export default mongoose.model<IWaitress>('Waitress', WaitressSchema);
