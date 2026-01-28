import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database';
import authRoutes from './routes/authRoutes';
import waitressRoutes from './routes/waitressRoutes';
import reviewRoutes from './routes/reviewRoutes';
import customerRoutes from './routes/customerRoutes';

/*
 * Cargar variables de entorno desde .env.
 * Permite configurar DB, puerto y secreto JWT.
 */
dotenv.config();

/*
 * Crear instancia de Express para la API.
 * Configura middlewares globales y rutas.
 */
const app: Application = express();

/*
 * Middleware global para CORS y parseo de JSON.
 * Se limita tamaño de payload para evitar abusos.
 */
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
        ? process.env.FRONTEND_URL 
        : 'http://localhost:5173',
    credentials: true
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

/*
 * Rutas de la API con prefijo /api.
 * Se separan por dominios: auth, waitresses, reviews y customers.
 */
app.use('/api/auth', authRoutes);
app.use('/api/waitresses', waitressRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/customers', customerRoutes);

/*
 * Ruta health para verificar disponibilidad.
 * Útil para monitoreo y despliegue.
 */
app.get('/api/health', (req: Request, res: Response) => {
    res.json({ 
        status: 'OK', 
        message: 'Reviewly API is running',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

/*
 * Respuesta 404 para rutas no encontradas.
 * Evita respuestas en blanco para clientes.
 */
app.use((req: Request, res: Response) => {
    res.status(404).json({ message: 'Ruta no encontrada' });
});

/*
 * Inicio del servidor con puerto configurable.
 * Conecta la base antes de escuchar peticiones.
 */
const PORT = Number(process.env.PORT) || 5000;

/**
 * Inicia el servidor de la aplicación.
 *
 * Conecta a la base de datos y, si la conexión es exitosa, comienza a escuchar
 * en el puerto configurado. En caso de error, registra el problema y finaliza
 * el proceso para evitar un estado inválido.
 *
 * @returns Una promesa que se resuelve cuando el servidor inicia o se rechaza si ocurre un error.
 */
const startServer = async () => {
    try {
        /*
         * Conectar a la base de datos.
         * Si falla, se detiene el proceso para evitar estado inválido.
         */
        await connectDB();

        /*
         * Iniciar escucha del servidor.
         * Loguea puerto y entorno para diagnóstico rápido.
         */
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Servidor iniciado en el puerto ${PORT}`);
            console.log(`Entorno: ${process.env.NODE_ENV || 'development'}`);
        });
    } catch (error) {
        console.error('Fallo iniciando el servidor:', error);
        process.exit(1);
    }
};

startServer();

export default app;
