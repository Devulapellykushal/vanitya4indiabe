"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt = require("bcryptjs");
const crypto_1 = require("crypto");
const dotenv_1 = require("dotenv");
const path = require("path");
const pg_1 = require("pg");
(0, dotenv_1.config)({
    path: [
        path.resolve(__dirname, '../../config/environments/development.env'),
        path.resolve(__dirname, '../../.env')
    ]
});
async function seedAdmin(client) {
    const checkResult = await client.query('SELECT id FROM users WHERE email = $1', ['admin@vanitya.com']);
    if (checkResult.rows.length > 0) {
        console.log('✅ Admin user already exists: admin@vanitya.com');
        return;
    }
    const hashedPassword = await bcrypt.hash('admin123', 12);
    const userId = (0, crypto_1.randomUUID)();
    await client.query(`INSERT INTO users (
      id, email, name, password, provider, 
      current_language, target_language, level,
      hearts, max_hearts, streak, is_admin, is_active,
      created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())`, [
        userId,
        'admin@vanitya.com',
        'Admin User',
        hashedPassword,
        'email',
        'hi',
        'te',
        'advanced',
        5,
        5,
        10,
        true,
        true
    ]);
    console.log('✅ Admin user created successfully: admin@vanitya.com');
    console.log('   Default password: admin123 (please change in production!)');
}
async function runSeeders() {
    const client = new pg_1.Client({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        user: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'vanitya',
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
    });
    try {
        console.log('🌱 Starting database seeding...');
        await client.connect();
        console.log('✅ Database connection established');
        await seedAdmin(client);
        console.log('✅ All seeders completed successfully');
        await client.end();
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Error running seeders:', error);
        await client.end();
        process.exit(1);
    }
}
runSeeders();
//# sourceMappingURL=seed.js.map