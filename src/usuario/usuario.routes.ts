import { Router } from 'express'
import { sanitizeUsuarioInput, findAll, findOne, add, update, remove, loginUsuario } from './usuario.controller.js'
import { authMiddleware, requireAdmin } from '../shared/authMiddleware.js'

export const usuarioRouter = Router()

// Rutas públicas
usuarioRouter.post('/login', loginUsuario)
usuarioRouter.post('/', sanitizeUsuarioInput, add) // registro

// Rutas protegidas
usuarioRouter.get('/', authMiddleware, findAll)
usuarioRouter.get('/:id', authMiddleware, findOne)
usuarioRouter.put('/:id', authMiddleware, sanitizeUsuarioInput, update)
usuarioRouter.patch('/:id', authMiddleware, sanitizeUsuarioInput, update)
usuarioRouter.delete('/:id', authMiddleware, requireAdmin, remove)