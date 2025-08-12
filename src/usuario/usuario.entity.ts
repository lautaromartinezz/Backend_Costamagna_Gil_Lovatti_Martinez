import {
  Entity,
  Property,
  Cascade,
  OneToMany,
  Collection,
  ManyToMany,
} from '@mikro-orm/core';
import { BaseEntity } from '../shared/db/baseEntity.entity.js';
import { Equipo } from '../equipo/equipo.entity.js';
@Entity()
export class Usuario extends BaseEntity {
  @Property({ nullable: false })
  nombre!: string;

  @Property({ nullable: false })
  apellido!: string;

  @Property({ nullable: false })
  usuario!: string;

  @Property({ nullable: false })
  contraseña!: string;

  @Property({ nullable: false })
  email!: string;

  @Property({ nullable: true })
  esAdmin!: boolean;

  @Property({ nullable: true })
  fechaNacimiento!: Date;

  @ManyToMany(() => Equipo, (equipo) => equipo.miembros)
  equipos = new Collection<Equipo>(this);
}
