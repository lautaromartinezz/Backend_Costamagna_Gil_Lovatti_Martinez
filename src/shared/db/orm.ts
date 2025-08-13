import { MikroORM } from '@mikro-orm/core';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';
import { MySqlDriver } from '@mikro-orm/mysql';

export const orm = await MikroORM.init({
  entities: ['dist/**/*.entity.js'],
  entitiesTs: ['src/**/*.entity.ts'],
  driver: MySqlDriver,
  clientUrl: 'mysql://dsw:dsw@localhost:3307/gestortorneos',
  highlighter: new SqlHighlighter(),
  debug: true,
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
