import {
  Entity,
  Property,
  Cascade,
  ManyToMany,
  Collection,
} from '@mikro-orm/core';
import { Usuario } from './usuario.entity.js';
import { Equipo } from '../equipo/equipo.entity.js';

@Entity()
export class Participante extends Usuario {
  @Property({ nullable: true })
  fechaNacimiento!: Date;

  @ManyToMany(() => Equipo, (equipo) => equipo.miembros)
  equipos = new Collection<Equipo>(this);
}
