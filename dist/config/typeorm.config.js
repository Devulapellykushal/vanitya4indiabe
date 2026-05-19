"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const path = require("path");
require("reflect-metadata");
const typeorm_1 = require("typeorm");
(0, dotenv_1.config)({
    path: [
        path.resolve(process.cwd(), 'config/environments/development.env'),
        path.resolve(process.cwd(), '.env')
    ]
});
const dataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'vanitya',
    entities: [path.join(__dirname, '../**/*.entity{.ts,.js}')],
    migrations: [path.join(__dirname, '../database/migrations/*.ts')],
    migrationsTableName: 'typeorm_migrations',
    synchronize: false,
    logging: process.env.NODE_ENV === 'development',
    ssl: process.env.DB_SSL === 'true'
});
exports.default = dataSource;
//# sourceMappingURL=typeorm.config.js.map