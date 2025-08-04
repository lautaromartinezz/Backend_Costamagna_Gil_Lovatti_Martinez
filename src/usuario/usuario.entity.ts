import {
  Entity,
  Property,
  Cascade,
  OneToMany,
  Collection,
} from '@mikro-orm/core';
import { BaseEntity } from '../shared/db/baseEntity.entity.js';

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
}
