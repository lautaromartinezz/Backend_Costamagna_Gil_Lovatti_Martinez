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
export class Noticia extends BaseEntity {
  @Property({ nullable: false })
  titulo!: string;

  @Property({ nullable: false })
  descripcion!: string;
}
