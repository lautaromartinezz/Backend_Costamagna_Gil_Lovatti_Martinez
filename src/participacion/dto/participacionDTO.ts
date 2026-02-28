import { Usuario } from '../../usuario/usuario.entity.js';
import { Participacion } from '../participacion.entity.js';

export interface ParticipacionTotalDTO {
  usuario: {
    id: number;
    nombre: string;
    apellido: string;
    equipos: {
      id: number;
      nombre: string;
    }[];
  };
  puntos: number;
  faltas: number;
  minutosjugados: number;
}
