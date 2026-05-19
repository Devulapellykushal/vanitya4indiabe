"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedAdmin = seedAdmin;
const user_entity_1 = require("../../modules/user/entities/user.entity");
const bcrypt = require("bcryptjs");
async function seedAdmin(dataSource) {
    const userRepository = dataSource.getRepository(user_entity_1.User);
    const existingAdmin = await userRepository.findOne({
        where: { email: 'admin@vanitya.com' }
    });
    if (existingAdmin) {
        console.log('✅ Admin user already exists: admin@vanitya.com');
        return;
    }
    const adminUser = userRepository.create({
        email: 'admin@vanitya.com',
        name: 'Admin User',
        password: await bcrypt.hash('admin123', 12),
        provider: 'email',
        currentLanguage: 'hi',
        targetLanguage: 'te',
        level: 'advanced',
        hearts: 5,
        maxHearts: 5,
        streak: 10,
        isAdmin: true,
        isActive: true
    });
    await userRepository.save(adminUser);
    console.log('✅ Admin user created successfully: admin@vanitya.com');
    console.log('   Default password: admin123 (please change in production!)');
}
//# sourceMappingURL=admin.seeder.js.map