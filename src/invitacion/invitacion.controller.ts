import { Request, Response } from 'express';
import crypto from 'crypto';
import { Invitacion, InvitacionEstado } from './invitacion.entity.js';
import { Equipo } from '../equipo/equipo.entity.js';
import { Usuario } from '../usuario/usuario.entity.js';
import { Evento } from '../evento/evento.entity.js';
import { orm } from '../shared/db/orm.js';
import { sendInvitationEmail } from './invitacion.service.js';

const em = orm.em;

const INVITATION_EXPIRY_DAYS = 7;

/**
 * Send an invitation email to join a team
 * Endpoint: POST /api/invitaciones/enviar
 * Body: { equipoId, emailInvitado }
 */
async function sendInvitation(req: Request, res: Response) {
  try {
    const { equipoId, emailInvitado } = req.body;
    const requester = (req as any).user;

    // Validate input
    if (!equipoId || !emailInvitado) {
      res
        .status(400)
        .json({ message: 'equipoId y emailInvitado son requeridos' });
      return;
    }

    if (!requester?.id) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const requesterId = Number(requester.id);

    // Get the team
    const equipo = await em.findOne(
      Equipo,
      { id: Number(equipoId) },
      { populate: ['capitan', 'evento', 'miembros'] },
    );

    if (!equipo) {
      res.status(404).json({ message: 'Equipo no encontrado' });
      return;
    }

    // Check if requester is the captain
    const captainId = (equipo.capitan as any)?.id;
    if (captainId !== requesterId) {
      res
        .status(403)
        .json({ message: 'Solo el capitán puede enviar invitaciones' });
      return;
    }

    // Check if the invited user is already a member
    const miembrosArray = equipo.miembros.getItems();
    const isAlreadyMember = miembrosArray.some(
      (member: any) => member.email === emailInvitado,
    );

    if (isAlreadyMember) {
      res.status(400).json({ message: 'El usuario ya es miembro del equipo' });
      return;
    }

    // Check if there's already a pending invitation for this email
    const existingInvitation = await em.findOne(Invitacion, {
      emailInvitado: emailInvitado.toLowerCase(),
      equipo: equipoId,
      estado: InvitacionEstado.PENDIENTE,
    });

    if (existingInvitation) {
      const now = new Date();
      if (new Date(existingInvitation.fechaExpiracion) > now) {
        res.status(400).json({
          message: 'Ya existe una invitación pendiente para este correo',
        });
        return;
      }
      // Expire the old invitation
      existingInvitation.estado = InvitacionEstado.EXPIRADA;
      await em.flush();
    }

    // Generate token
    const token = crypto.randomBytes(32).toString('hex');
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + INVITATION_EXPIRY_DAYS);

    // Get captain and event info
    const capitan = equipo.capitan as any;
    const evento = equipo.evento as any;
    const captainFullName = `${capitan.nombre} ${capitan.apellido}`;
    const eventName = evento?.nombre || 'Evento';

    // Create invitation record
    const invitacion = em.create(Invitacion, {
      emailInvitado: emailInvitado.toLowerCase(),
      token: token,
      estado: InvitacionEstado.PENDIENTE,
      fechaExpiracion: expiresAt,
      equipo: equipo,
      capitan: capitan,
    });

    await em.flush();

    // Send email
    const emailResult = await sendInvitationEmail({
      to: emailInvitado,
      teamName: equipo.nombre,
      eventName: eventName,
      captainName: captainFullName,
      invitationToken: token,
    });

    if (!emailResult.success) {
      res.status(500).json({
        message: 'Error al enviar el correo de invitación',
        error: emailResult.error,
      });
      return;
    }

    res.status(200).json({
      message: 'Invitación enviada correctamente',
      data: {
        invitacionId: invitacion.id,
        email: emailInvitado,
        equipo: equipo.nombre,
      },
    });
  } catch (error: any) {
    console.error('Error sending invitation:', error);
    res
      .status(500)
      .json({ message: 'Error al enviar invitación', error: error.message });
  }
}

/**
 * Accept an invitation and join the team
 * Endpoint: POST /api/invitaciones/aceptar
 * Body: { token }
 */
async function acceptInvitation(req: Request, res: Response) {
  try {
    const { token } = req.body;
    const requester = (req as any).user;

    if (!token) {
      res.status(400).json({ message: 'Token de invitación requerido' });
      return;
    }

    if (!requester?.id) {
      res.status(401).json({
        message: 'Debes iniciar sesión para aceptar una invitación',
      });
      return;
    }

    const requesterId = Number(requester.id);

    // Find the invitation
    const invitacion = await em.findOne(
      Invitacion,
      { token: token },
      { populate: ['equipo', 'equipo.evento', 'equipo.miembros', 'capitan'] },
    );

    if (!invitacion) {
      res.status(404).json({ message: 'Invitación no encontrada' });
      return;
    }

    // Check if already accepted
    if (invitacion.estado === InvitacionEstado.ACEPTADA) {
      res.status(400).json({ message: 'Esta invitación ya fue utilizada' });
      return;
    }

    // Check if expired
    const now = new Date();
    if (new Date(invitacion.fechaExpiracion) < now) {
      invitacion.estado = InvitacionEstado.EXPIRADA;
      await em.flush();
      res.status(400).json({ message: 'La invitación ha expirado' });
      return;
    }

    // Get the user
    const usuario = await em.findOne(Usuario, { id: requesterId });
    if (!usuario) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }

    if (
      usuario.email.toLowerCase() !== invitacion.emailInvitado.toLowerCase()
    ) {
      res.status(403).json({
        message: 'El correo electrónico no coincide con la invitación',
      });
      return;
    }

    const equipo = invitacion.equipo as any;

    // Check if user is already a member
    const miembrosArray = equipo.miembros.getItems();
    const isAlreadyMember = miembrosArray.some(
      (member: any) => member.id === requesterId,
    );

    if (isAlreadyMember) {
      res.status(400).json({ message: 'Ya eres miembro de este equipo' });
      return;
    }

    // Check if user is the captain
    if (equipo.capitan?.id === requesterId) {
      res.status(400).json({ message: 'Ya eres el capitán de este equipo' });
      return;
    }

    // Check enrollment period
    const evento = equipo.evento;
    if (evento) {
      const fechaini = new Date(evento.fechaInicioInscripcion);
      const fechafin = new Date(evento.fechaFinInscripcion);
      if (now < fechaini || now > fechafin) {
        res.status(400).json({
          message:
            'No puedes unirte al equipo fuera del período de inscripción',
        });
        return;
      }

      // Check max members
      const deporte = evento.deporte as any;
      if (deporte?.cantMaxJugadores) {
        if (equipo.miembros.length >= deporte.cantMaxJugadores) {
          res.status(400).json({
            message: 'El equipo ha alcanzado el máximo de miembros',
          });
          return;
        }
      }
    }

    // Add user to team
    equipo.miembros.add(usuario);

    // Update invitation status
    invitacion.estado = InvitacionEstado.ACEPTADA;
    invitacion.fechaAceptacion = now;

    await em.flush();

    res.status(200).json({
      message: 'Te has unido al equipo correctamente',
      data: {
        equipo: {
          id: equipo.id,
          nombre: equipo.nombre,
        },
      },
    });
  } catch (error: any) {
    console.error('Error accepting invitation:', error);
    res
      .status(500)
      .json({ message: 'Error al aceptar invitación', error: error.message });
  }
}

/**
 * Get invitation details (for checking before accepting)
 * Endpoint: GET /api/invitaciones/:token
 */
async function getInvitationDetails(req: Request, res: Response) {
  try {
    const { token } = req.params;

    const invitacion = await em.findOne(
      Invitacion,
      { token: token },
      {
        populate: [
          'equipo',
          'capitan',
          'equipo.evento',
          'equipo.evento.deporte',
        ],
      },
    );

    if (!invitacion) {
      res.status(404).json({ message: 'Invitación no encontrada' });
      return;
    }

    const now = new Date();
    const isExpired = new Date(invitacion.fechaExpiracion) < now;
    const isAccepted = invitacion.estado === InvitacionEstado.ACEPTADA;

    const equipo = invitacion.equipo as any;
    const capitan = invitacion.capitan as any;

    res.status(200).json({
      message: 'Invitación encontrada',
      data: {
        emailInvitado: invitacion.emailInvitado,
        estado: invitacion.estado,
        expirada: isExpired,
        aceptada: isAccepted,
        equipo: {
          id: equipo.id,
          nombre: equipo.nombre,
          esPublico: equipo.esPublico,
        },
        evento: equipo.evento
          ? {
              id: equipo.evento.id,
              nombre: equipo.evento.nombre,
            }
          : null,
        capitan: {
          id: capitan.id,
          nombre: capitan.nombre,
          apellido: capitan.apellido,
        },
      },
    });
  } catch (error: any) {
    console.error('Error getting invitation:', error);
    res
      .status(500)
      .json({ message: 'Error al obtener invitación', error: error.message });
  }
}

export { sendInvitation, acceptInvitation, getInvitationDetails };
