import mongoose, { Document, Schema } from 'mongoose';

export type EstadoSemana = 'gris' | 'rojo' | 'verde';

export interface ICustomer extends Document {
    name: string;
    document?: string;
    phone?: string;
    email?: string;
    weekStates: EstadoSemana[];
    createdAt: Date;
    updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomer>(
    {
        name: {
            type: String,
            required: [true, 'El nombre del cliente es requerido'],
            trim: true,
            minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
            maxlength: [120, 'El nombre no puede exceder 120 caracteres'],
        },
        document: {
            type: String,
            trim: true,
            maxlength: [50, 'El documento no puede exceder 50 caracteres'],
        },
        phone: {
            type: String,
            trim: true,
            maxlength: [30, 'El teléfono no puede exceder 30 caracteres'],
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            maxlength: [120, 'El correo no puede exceder 120 caracteres'],
            match: [/^\S+@\S+\.\S+$/, 'Por favor ingrese un correo válido'],
        },
        weekStates: {
            type: [String],
            enum: ['gris', 'rojo', 'verde'],
            default: Array.from({ length: 52 }, () => 'gris'),
            validate: {
                validator: (value: EstadoSemana[]) => value.length === 52,
                message: 'El estado semanal debe contener 52 semanas',
            },
        },
    },
    {
        timestamps: true,
    }
);

/*
 * Índices para consultas rápidas por nombre y fecha.
 * Útiles en listados y búsquedas administrativas.
 */
CustomerSchema.index({ name: 1 });
CustomerSchema.index({ createdAt: -1 });

export default mongoose.model<ICustomer>('Customer', CustomerSchema);
