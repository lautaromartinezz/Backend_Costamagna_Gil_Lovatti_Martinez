import {
  Entity,
  Property,
  ManyToMany,
  Cascade,
  ManyToOne,
  Rel,
} from '@mikro-orm/core';
import { BaseEntity } from '../shared/db/baseEntity.entity.js';

@Entity()
export class Deporte extends BaseEntity {
  @Property({ nullable: false })
  nombre!: string;

  @Property({ nullable: false })
  cantMinJugadores!: number;

  @Property({ nullable: false })
  cantMaxJugadores!: number;

  @Property({ nullable: false })
  duracion!: number;

  @Property({ nullable: false })
  id!: number;
}
