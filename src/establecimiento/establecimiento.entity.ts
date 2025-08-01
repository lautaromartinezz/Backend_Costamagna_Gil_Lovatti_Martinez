import {
  Entity,
  Property,
  Cascade,
  OneToMany,
  Collection,
} from '@mikro-orm/core';
import { BaseEntity } from '../shared/db/baseEntity.entity.js';
import { Partido } from '../evento/partido.entity.js';

@Entity()
export class Establecimiento extends BaseEntity {
  @Property({ nullable: false })
  nombre!: string;

  @Property({ nullable: false })
  direccion!: string;

  @Property({ nullable: false })
  localidad!: string;

  @OneToMany(() => Partido, (partido) => partido.establecimiento, {
    nullable: true,
    cascade: [Cascade.ALL],
  })
  partidos = new Collection<Partido>(this);
}
