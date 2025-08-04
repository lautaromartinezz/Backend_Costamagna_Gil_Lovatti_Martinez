import {
  Entity,
  Property,
  Cascade,
  OneToMany,
  Collection,
} from '@mikro-orm/core';
import { Usuario } from './usuario.entity.js';

@Entity()
export class Administrador extends Usuario {
}
