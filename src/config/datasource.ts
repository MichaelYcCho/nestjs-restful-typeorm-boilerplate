import * as dotenv from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/users/entities/user.entity';

dotenv.config({ path: `./env/.env.${process.env.NODE_ENV || 'dev'}` });

export function config(): DataSourceOptions {
  const configService = new ConfigService();

  return {
    type: 'postgres',
    host: configService.get<string>('DB_HOST'),
    port: configService.get<number>('DB_PORT'),
    database: configService.get<string>('DB_NAME'),
    username: configService.get<string>('DB_USERNAME'),
    password: configService.get<string>('DB_PASSWORD'),
    entities: [User],
    migrations: ['./src/database/migrations/**/*{.ts,.js}'],
    migrationsTableName: 'migration_type_orm',
    logging: true,
    extra: {
      max: 100,
    },
  };
}

const dataSourceConfig = config();
export const dataSource = new DataSource(dataSourceConfig);
