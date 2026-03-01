import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from './config.js';

const JWT_SECRET = config.JWT.SECRET;

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    res.status(401).json({ message: 'Token de sesión no proporcionado' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Puedes guardar los datos del usuario en req.user si lo deseas
    (req as any).user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token de sesión inválido o expirado' });
    return;
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;
  if (user && user.role === 'Administrador') {
    next();
  } else {
    res.status(403).json({ message: 'Acceso solo para administradores' });
    return;
  }
}
