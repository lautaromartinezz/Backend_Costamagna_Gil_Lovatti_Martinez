import {
  Entity,
  Property,
  Cascade,
  ManyToMany,
  Collection,
} from '@mikro-orm/core';
import {Usuario} from './usuario.entity';
import { Equipo } from '../equipo/equipo.entity.js';

@Entity()
export class Participante extends Usuario {
  @Property({ nullable: false })
  fechaNacimiento!: Date;

  @ManyToMany()
  equipos = new Collection<Equipo>(this);
}
