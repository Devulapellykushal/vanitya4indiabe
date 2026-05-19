import { DataSource } from 'typeorm';
import { User } from '../../modules/user/entities/user.entity';
import * as bcrypt from 'bcryptjs';

export async function seedAdmin(dataSource: DataSource): Promise<void> {
  const userRepository = dataSource.getRepository(User);

  // Check if admin already exists
  const existingAdmin = await userRepository.findOne({
    where: { email: 'admin@vanitya.com' }
  });

  if (existingAdmin) {
    console.log('✅ Admin user already exists: admin@vanitya.com');
    return;
  }

  // Create admin user
  const adminUser = userRepository.create({
    email: 'admin@vanitya.com',
    name: 'Admin User',
    password: await bcrypt.hash('admin123', 12), // Default password - change in production!
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

