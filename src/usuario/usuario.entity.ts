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
import { Partido } from '../evento/partido.entity.js';
import { Participacion } from '../participacion/participacion.entity.js';
import { Evento } from '../evento/evento.entity.js';
@Entity()
export class Usuario extends BaseEntity {
  @Property({ nullable: false })
  nombre!: string;

  @Property({ nullable: false })
  apellido!: string;

  @Property({ nullable: false, unique: true })
  usuario!: string;

  @Property({ nullable: false })
  contraseña!: string;

  @Property({ nullable: false, unique: true })
  email!: string;

  @Property({ nullable: false })
  role!: string;

  @Property({ nullable: true })
  fechaNacimiento!: Date;

  @Property({ nullable: false })
  estado!: boolean;

  @Property({ nullable: true })
  ultimoLogin?: Date;

  @ManyToMany(() => Equipo, (equipo) => equipo.miembros, { nullable: true })
  equipos = new Collection<Equipo>(this);

  @OneToMany(() => Partido, (partido) => partido.mvp, {
    nullable: true,
    cascade: [Cascade.ALL],
  })
  mvps? = new Collection<Partido>(this);

  @OneToMany(() => Equipo, (equipo) => equipo.capitan, {
    nullable: true,
    cascade: [Cascade.ALL],
  })
  equipocomocapitan? = new Collection<Equipo>(this);

  @OneToMany(() => Partido, (partido) => partido.maxAnotador, {
    nullable: true,
    cascade: [Cascade.ALL],
  })
  maxAnotador? = new Collection<Partido>(this);
  @OneToMany(() => Participacion, (participacion) => participacion.usuario, {
    cascade: [Cascade.ALL],
  })
  participations? = new Collection<Participacion>(this);

  @OneToMany(() => Evento, (evento) => evento.creador, {
    cascade: [Cascade.ALL],
  })
  eventos = new Collection<Evento>(this);

  getEquipoEvento(idEvento: number) {
    for (let equipo of this.equipos) {
      if ((equipo.evento.id = idEvento)) {
        return equipo;
      }
    }
  }
}
