import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
    user?: {
        id: string;
        username: string;
        role: string;
    };
}

export const authMiddleware = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        /*
         * Extraer el token del encabezado Authorization.
         * Se espera el formato "Bearer <token>".
         */
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            res.status(401).json({ message: 'No hay token, autorización denegada' });
            return;
        }

        /*
         * Validar el token con el secreto configurado.
         * Si es válido, se obtiene el payload con id y rol.
         */
        const jwtSecret = process.env.JWT_SECRET || 'fallback-secret';
        const decoded = jwt.verify(token, jwtSecret) as {
            id: string;
            username: string;
            role: string;
        };

        /*
         * Inyectar datos del usuario autenticado en la request.
         * Permite autorización posterior por roles.
         */
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token inválido' });
    }
};

/*
 * Autenticación opcional: continúa aunque no exista token.
 * Se usa en endpoints donde el acceso no es obligatorio.
 */
export const optionalAuthMiddleware = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (token) {
            const jwtSecret = process.env.JWT_SECRET || 'fallback-secret';
            const decoded = jwt.verify(token, jwtSecret) as {
                id: string;
                username: string;
                role: string;
            };
            req.user = decoded;
        }
        next();
    } catch (error) {
        /*
         * Continuar sin usuario si el token es inválido.
         * Evita bloquear endpoints de acceso público.
         */
        next();
    }
};

/*
 * Autorización por roles para endpoints protegidos.
 * Se verifica que el rol del usuario esté permitido.
 * Ahora soporta los roles: admin, manager, usuario.
 */
export const authorize = (...roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({ message: 'No autorizado' });
            return;
        }

        if (!roles.includes(req.user.role)) {
            res.status(403).json({
                message: 'No tienes permisos para realizar esta acción'
            });
            return;
        }

        next();
    };
};
