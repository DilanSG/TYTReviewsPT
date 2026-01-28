import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IAdmin extends Document {
    username: string;
    email: string;
    password: string;
    role: 'admin' | 'manager' | 'usuario';
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const AdminSchema = new Schema<IAdmin>(
    {
        username: {
            type: String,
            required: [true, 'El nombre de usuario es requerido'],
            unique: true,
            trim: true,
            minlength: [3, 'El nombre de usuario debe tener al menos 3 caracteres'],
            maxlength: [50, 'El nombre de usuario no puede exceder 50 caracteres'],
        },
        email: {
            type: String,
            required: [true, 'El email es requerido'],
            unique: true,
            trim: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, 'Por favor ingrese un email válido'],
        },
        password: {
            type: String,
            required: [true, 'La contraseña es requerida'],
            minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
            /*
             * No devolver contraseña por defecto al consultar.
             * Se incluye explícitamente solo cuando es necesario.
             */
            select: false,
        },
        role: {
            type: String,
            enum: ['admin', 'manager', 'usuario'],
            default: 'manager',
        },
        active: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

/*
 * Hashear contraseña antes de guardar (Mongoose 9+ async/await).
 * Evita almacenar texto plano y asegura consistencia en el login.
 */
AdminSchema.pre('save', async function () {
    if (!this.isModified('password')) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

/*
 * Método para comparar contraseñas.
 * Usa bcrypt para validar el candidato contra el hash guardado.
 */
AdminSchema.methods.comparePassword = async function (
    candidatePassword: string
): Promise<boolean> {
    return await bcrypt.compare(candidatePassword, this.password);
};


export default mongoose.model<IAdmin>('Admin', AdminSchema);
