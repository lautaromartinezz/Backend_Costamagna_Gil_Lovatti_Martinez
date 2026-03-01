import { Resend } from 'resend';
import crypto from 'crypto';
import { config } from '../shared/config.js';

const resendApiKey = config.EMAIL.API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

const FRONTEND_URL = config.FRONTEND_URL;

interface InvitationEmailParams {
  to: string;
  teamName: string;
  eventName: string;
  captainName: string;
  invitationToken: string;
}

export async function sendInvitationEmail({
  to,
  teamName,
  eventName,
  captainName,
  invitationToken,
}: InvitationEmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    if (!resend) {
      return {
        success: false,
        error:
          'Falta configurar RESEND_API_KEY en el backend (.env). No se puede enviar el email.',
      };
    }

    const invitationLink = `${FRONTEND_URL}/unirse-equipo?token=${invitationToken}`;

    const { data, error } = await resend.emails.send({
      from: 'Gestor Torneos <onboarding@resend.dev>',
      to: [to],
      subject: `Invitación para unirte al equipo "${teamName}"`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4a90d9; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .button { 
              display: inline-block; 
              padding: 12px 24px; 
              background: #4a90d9; 
              color: white; 
              text-decoration: none; 
              border-radius: 5px; 
              margin: 20px 0;
            }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>¡Estás invitado!</h1>
            </div>
            <div class="content">
              <p>Hola,</p>
              <p>El capitán <strong>${captainName}</strong> te ha invitado a unirte al equipo <strong>${teamName}</strong> para el evento <strong>${eventName}</strong>.</p>
              <p>Haz clic en el siguiente botón para unirte al equipo:</p>
              <p style="text-align: center;">
                <a href="${invitationLink}" class="button">Unirse al Equipo</a>
              </p>
              <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
              <p style="word-break: break-all; font-size: 12px; color: #666;">${invitationLink}</p>
              <p><strong>Nota:</strong> Esta invitación expirará en 7 días.</p>
            </div>
            <div class="footer">
              <p>Este correo fue enviado por Gestor Torneos</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error: error.message };
    }

    console.log('Email sent successfully:', data);
    return { success: true };
  } catch (error: any) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
}

export function generateInvitationToken(
  equipoId: number,
  emailInvitado: string,
  captainId: number,
): string {
  const token = crypto.randomBytes(32).toString('hex');
  return token;
}
