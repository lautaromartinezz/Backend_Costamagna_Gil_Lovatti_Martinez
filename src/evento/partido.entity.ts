import {
  Cascade,
  Entity,
  ManyToOne,
  OneToMany,
  Property,
  Rel,
  Collection,
} from '@mikro-orm/core';
import { BaseEntity } from '../shared/db/baseEntity.entity.js';
import { Evento } from './evento.entity.js';
import { Establecimiento } from '../establecimiento/establecimiento.entity.js';
import { Equipo } from '../equipo/equipo.entity.js';
import { Usuario } from '../usuario/usuario.entity.js';
import { Participacion } from '../participacion/participacion.entity.js';

@Entity()
export class Partido extends BaseEntity {
  @Property({ nullable: false })
  fecha!: Date;
  @Property({ nullable: true })
  hora?: string;
  @Property({ nullable: true })
  juez?: string;
  @Property({ nullable: true })
  resultado?: string;

  //cambiar la relacion cuando se implemente la entidad Equipo y Participante
  @ManyToOne(() => Equipo, { nullable: false })
  equipoLocal!: Rel<Equipo>;
  @ManyToOne(() => Equipo, { nullable: false })
  equipoVisitante!: Rel<Equipo>;

  @ManyToOne(() => Usuario, { nullable: true })
  mvp?: Rel<Usuario>; // jugador más valioso

  @ManyToOne(() => Usuario, { nullable: true })
  maxAnotador?: Rel<Usuario>;

  @ManyToOne(() => Evento, { nullable: false })
  evento!: Rel<Evento>;
  eventos = new Collection<Evento>(this);

  @ManyToOne(() => Establecimiento, { nullable: true })
  establecimiento?: Rel<Establecimiento>;

  @OneToMany(() => Participacion, (participacion) => participacion.partido, {
    cascade: [Cascade.ALL],
  })
  participations? = new Collection<Participacion>(this);
}
