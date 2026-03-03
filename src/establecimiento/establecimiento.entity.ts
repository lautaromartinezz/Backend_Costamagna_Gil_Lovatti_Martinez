import {
  Entity,
  Property,
  Cascade,
  OneToMany,
  Collection,
  ManyToMany,
  ManyToOne,
  Rel,
} from '@mikro-orm/core';
import { BaseEntity } from '../shared/db/baseEntity.entity.js';
import { Partido } from '../evento/partido.entity.js';
import { Evento } from '../evento/evento.entity.js';

@Entity()
export class Establecimiento extends BaseEntity {
  @Property({ nullable: false })
  nombre!: string;

  @Property({ nullable: false })
  direccion!: string;

  @ManyToOne(() => Evento, { nullable: true })
  evento!: Rel<Evento>;

  @OneToMany(() => Partido, (partido) => partido.establecimiento, {
    nullable: true,
    cascade: [Cascade.ALL],
  })
  partidos = new Collection<Partido>(this);
}
