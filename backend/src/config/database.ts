import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async (): Promise<void> => {
    try {
        const mongoURI = process.env.MONGODB_URI;

        /*
         * Validar que exista la variable de entorno requerida.
         * Evita iniciar el servidor con configuración inválida.
         */
        if (!mongoURI) {
            throw new Error('MONGODB_URI no está configurada');
        }

        await mongoose.connect(mongoURI);

        console.log('MongoDB connected successfully');
        console.log(`Database: ${mongoose.connection.name}`);
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

/*
 * Manejar eventos de conexión de Mongoose.
 * Ayuda a diagnosticar desconexiones o fallos de la DB.
 */
mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
    console.error('MongoDB error:', err);
});

export default connectDB;
