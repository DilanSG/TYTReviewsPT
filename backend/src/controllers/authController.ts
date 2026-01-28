import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin';
import { AuthRequest } from '../middleware/auth';

/*
 * Inicio de sesión administrativo.
 * Devuelve token JWT y datos básicos del usuario.
 */
export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, password } = req.body;

        /*
         * Validación de credenciales mínimas antes de consultar la base.
         * Evita consultas innecesarias cuando faltan campos.
         */
        if (!username || !password) {
            res.status(400).json({ message: 'Por favor ingrese usuario y contraseña' });
            return;
        }

        /*
         * Buscar admin e incluir contraseña para validación.
         * El campo password no se selecciona por defecto.
         */
        const admin = await Admin.findOne({ username }).select('+password');

        if (!admin) {
            res.status(401).json({ message: 'Credenciales inválidas' });
            return;
        }

        /*
         * Validar que el usuario esté activo.
         * Si está inactivo se devuelve 401 para bloquear acceso.
         */
        if (!admin.active) {
            res.status(401).json({ message: 'Usuario inactivo' });
            return;
        }

        /*
         * Verificar contraseña con bcrypt.
         * Se rechaza si el hash no coincide.
         */
        const isMatch = await admin.comparePassword(password);

        if (!isMatch) {
            res.status(401).json({ message: 'Credenciales inválidas' });
            return;
        }

        /*
         * Generar JWT con rol y expiración.
         * El rol se usa en middleware de autorización.
         */
        const jwtSecret = process.env.JWT_SECRET || 'fallback-secret';
        const token = jwt.sign(
            {
                id: admin._id,
                username: admin.username,
                role: admin.role,
            },
            jwtSecret,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: admin._id,
                username: admin.username,
                email: admin.email,
                role: admin.role,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

/*
 * Registro interno (setup inicial o creación por owner).
 * No es un registro público; requiere control administrativo.
 */
export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, email, password, role } = req.body;

        /*
         * Validaciones básicas de entrada para el registro.
         * Se asegura presencia de username, email y password.
         */
        if (!username || !email || !password) {
            res.status(400).json({
                message: 'Por favor complete todos los campos requeridos'
            });
            return;
        }

        /*
         * Verificar si ya existe un usuario con el mismo username o email.
         * Evita duplicados y mantiene la integridad de credenciales.
         */
        const existingAdmin = await Admin.findOne({
            $or: [{ username }, { email }]
        });

        if (existingAdmin) {
            res.status(400).json({
                message: 'El usuario o email ya existe'
            });
            return;
        }

        /*
         * Crear nuevo administrador con rol por defecto.
         * La contraseña se hashea en el middleware del modelo.
         */
        const admin = new Admin({
            username,
            email,
            password,
            role: role || 'admin',
        });

        await admin.save();

        res.status(201).json({
            message: 'Administrador creado exitosamente',
            user: {
                id: admin._id,
                username: admin.username,
                email: admin.email,
                role: admin.role,
            },
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

/*
 * Obtener todos los usuarios (solo admin).
 * Devuelve lista completa incluyendo activos e inactivos.
 */
export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const users = await Admin.find({}).select('-password').sort({ createdAt: -1 });

        res.json({
            users,
            total: users.length,
        });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({ message: 'Error al obtener usuarios' });
    }
};

/*
 * Obtener un usuario por ID (solo admin).
 * Para edición o visualización de detalles.
 */
export const getUserById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const user = await Admin.findById(id).select('-password');

        if (!user) {
            res.status(404).json({ message: 'Usuario no encontrado' });
            return;
        }

        res.json({ user });
    } catch (error) {
        console.error('Get user by id error:', error);
        res.status(500).json({ message: 'Error al obtener usuario' });
    }
};

/*
 * Crear nuevo usuario (solo admin).
 * Permite crear admins, managers y usuarios.
 */
export const createUser = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { username, email, password, role } = req.body;

        /*
         * Validaciones básicas de entrada.
         * Todos los campos son requeridos para crear usuario.
         */
        if (!username || !email || !password || !role) {
            res.status(400).json({
                message: 'Todos los campos son requeridos'
            });
            return;
        }

        /*
         * Validar que el rol sea válido.
         * Solo se permiten los roles definidos en el modelo.
         */
        if (!['admin', 'manager', 'usuario'].includes(role)) {
            res.status(400).json({
                message: 'Rol inválido'
            });
            return;
        }

        /*
         * Verificar si ya existe un usuario con el mismo username o email.
         * Evita duplicados y mantiene la integridad.
         */
        const existingUser = await Admin.findOne({
            $or: [{ username }, { email }]
        });

        if (existingUser) {
            res.status(400).json({
                message: 'El usuario o email ya existe'
            });
            return;
        }

        /*
         * Crear nuevo usuario con los datos proporcionados.
         * La contraseña se hashea automáticamente en el hook del modelo.
         */
        const user = new Admin({
            username,
            email,
            password,
            role,
            active: true,
        });

        await user.save();

        res.status(201).json({
            message: 'Usuario creado exitosamente',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                active: user.active,
            },
        });
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ message: 'Error al crear usuario' });
    }
};

/*
 * Actualizar usuario existente (solo admin).
 * Permite cambiar username, email, rol y estado.
 */
export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { username, email, role, active, password } = req.body;

        const user = await Admin.findById(id);

        if (!user) {
            res.status(404).json({ message: 'Usuario no encontrado' });
            return;
        }

        /*
         * Validar que el rol sea válido si se está actualizando.
         * Solo se permiten los roles definidos en el modelo.
         */
        if (role && !['admin', 'manager', 'usuario'].includes(role)) {
            res.status(400).json({
                message: 'Rol inválido'
            });
            return;
        }

        /*
         * Verificar duplicados de username o email si se están actualizando.
         * Excluye el usuario actual de la búsqueda.
         */
        if (username || email) {
            const existingUser = await Admin.findOne({
                _id: { $ne: user._id },
                $or: [
                    ...(username ? [{ username }] : []),
                    ...(email ? [{ email }] : [])
                ]
            });

            if (existingUser) {
                res.status(400).json({
                    message: 'El usuario o email ya existe'
                });
                return;
            }
        }

        /*
         * Actualizar solo los campos proporcionados.
         * Se mantienen valores anteriores para campos no incluidos.
         */
        if (username) user.username = username;
        if (email) user.email = email;
        if (role) user.role = role;
        if (active !== undefined) user.active = active;
        if (password) user.password = password;

        await user.save();

        res.json({
            message: 'Usuario actualizado exitosamente',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                active: user.active,
            },
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ message: 'Error al actualizar usuario' });
    }
};

/*
 * Soft delete: desactivar usuario (solo admin).
 * El usuario no puede acceder pero sus datos se mantienen.
 */
export const deactivateUser = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        /*
         * Verificar que el admin no se desactive a sí mismo.
         * Se previene el auto-bloqueo accidental.
         */
        if (req.user?.id === id) {
            res.status(400).json({
                message: 'No puedes desactivarte a ti mismo'
            });
            return;
        }

        const user = await Admin.findById(id);

        if (!user) {
            res.status(404).json({ message: 'Usuario no encontrado' });
            return;
        }

        user.active = false;
        await user.save();

        res.json({
            message: 'Usuario desactivado exitosamente',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                active: user.active,
            },
        });
    } catch (error) {
        console.error('Deactivate user error:', error);
        res.status(500).json({ message: 'Error al desactivar usuario' });
    }
};

/*
 * Reactivar usuario previamente desactivado (solo admin).
 * Restaura el acceso completo al usuario.
 */
export const activateUser = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const user = await Admin.findById(id);

        if (!user) {
            res.status(404).json({ message: 'Usuario no encontrado' });
            return;
        }

        user.active = true;
        await user.save();

        res.json({
            message: 'Usuario activado exitosamente',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                active: user.active,
            },
        });
    } catch (error) {
        console.error('Activate user error:', error);
        res.status(500).json({ message: 'Error al activar usuario' });
    }
};

/*
 * Hard delete: eliminar usuario permanentemente (solo admin).
 * Elimina completamente el registro de la base de datos.
 */
export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        /*
         * Verificar que el admin no se elimine a sí mismo.
         * Se previene el auto-eliminación accidental.
         */
        if (req.user?.id === id) {
            res.status(400).json({
                message: 'No puedes eliminarte a ti mismo'
            });
            return;
        }

        const user = await Admin.findByIdAndDelete(id);

        if (!user) {
            res.status(404).json({ message: 'Usuario no encontrado' });
            return;
        }

        res.json({
            message: 'Usuario eliminado permanentemente'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ message: 'Error al eliminar usuario' });
    }
};
