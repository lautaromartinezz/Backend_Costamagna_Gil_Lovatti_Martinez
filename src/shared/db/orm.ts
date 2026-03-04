import { MikroORM } from '@mikro-orm/core';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';
import { MySqlDriver } from '@mikro-orm/mysql';
import { config } from '../config.js';

// Construir URL de conexión desde variables de entorno
// En Railway, usar DATABASE_URL si existe; sino, construir desde variables individuales
const clientUrl = process.env.DATABASE_URL || `mysql://${config.DB.USER}:${config.DB.PASSWORD}@${config.DB.HOST}:${config.DB.PORT}/${config.DB.NAME}`;

export const orm = await MikroORM.init({
  entities: ['dist/**/*.entity.js'],
  entitiesTs: ['src/**/*.entity.ts'],
  driver: MySqlDriver,
  clientUrl,
  highlighter: new SqlHighlighter(),
  debug: config.isDevelopment(),
  schemaGenerator: {
    //never in production
    disableForeignKeys: true,
    createForeignKeyConstraints: true,
    ignoreSchema: [],
  },
});

export const syncSchema = async () => {
  const generator = orm.getSchemaGenerator();
  /*Descomentar para borrar la base de datos cada vez q levanta la api*/
  //await generator.dropSchema()
  //await generator.createSchema()
  await generator.updateSchema();
};
