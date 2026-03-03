import { Router } from 'express'
import { sanitizeDeporteInput, findAll, findOne, add, update, remove, findSome } from './deporte.controller.js'
import { authMiddleware, requireAdmin } from '../shared/authMiddleware.js'

export const deporteRouter = Router()

deporteRouter.get('/', findAll)
deporteRouter.get('/filter', findSome)
deporteRouter.get('/:id', findOne)
deporteRouter.post('/', authMiddleware, requireAdmin, sanitizeDeporteInput, add)
deporteRouter.put('/:id', authMiddleware, requireAdmin, sanitizeDeporteInput, update)
deporteRouter.patch('/:id', authMiddleware, requireAdmin, sanitizeDeporteInput, update)
deporteRouter.delete('/:id', authMiddleware, requireAdmin, remove)