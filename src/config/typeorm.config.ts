import { config } from 'dotenv';
import * as path from 'path';
import 'reflect-metadata';
import { DataSource } from 'typeorm';

// Load environment variables
config({
  path: [
    path.resolve(process.cwd(), 'config/environments/development.env'),
    path.resolve(process.cwd(), '.env')
  ]
});

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'vanitya',
  entities: [path.join(__dirname, '../**/*.entity{.ts,.js}')],
  migrations: [path.join(__dirname, '../database/migrations/*.ts')],
  migrationsTableName: 'typeorm_migrations',
  synchronize: false, // Always false - use migrations
  logging: process.env.NODE_ENV === 'development',
  ssl: process.env.DB_SSL === 'true'
});

export default dataSource;

