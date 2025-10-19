import { Router } from 'express'
import { sanitizeUsuarioInput, findAll, findOne, add, update, remove, loginUsuario, logoutUsuario, restaurarUsuario, bajaUsuario, findSome, perfilUsuario } from './usuario.controller.js'
import { authMiddleware, requireAdmin } from '../shared/authMiddleware.js'

export const usuarioRouter = Router()

// Esto es para que funcione el restaurarUsuario, preguntar al profe por que no anda:
const asyncHandler = (fn: any) => (req: any, res: any, next: any) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Rutas públicas
usuarioRouter.post('/login', loginUsuario)
usuarioRouter.post('/', sanitizeUsuarioInput, add) // registro
usuarioRouter.post('/restaurar', asyncHandler(restaurarUsuario)) // restaurar usuario con cookie recuerdame
usuarioRouter.post('/logout', logoutUsuario) // logout: borra la cookie recuerdame

// Rutas protegidas con authMiddleware
usuarioRouter.get('/', authMiddleware, requireAdmin, findAll)
usuarioRouter.get('/filter', authMiddleware, requireAdmin, findSome)
usuarioRouter.post('/baja/:id', authMiddleware, requireAdmin, bajaUsuario)
usuarioRouter.get('/perfil/:id', authMiddleware, perfilUsuario)
usuarioRouter.get('/:id', authMiddleware, requireAdmin, findOne)
usuarioRouter.put('/:id', authMiddleware, requireAdmin, sanitizeUsuarioInput, update)
usuarioRouter.patch('/:id', authMiddleware, requireAdmin, sanitizeUsuarioInput, update)
usuarioRouter.delete('/:id', authMiddleware, requireAdmin, remove)