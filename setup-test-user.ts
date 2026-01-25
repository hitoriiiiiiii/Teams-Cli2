/// <reference types="node" />
import prisma from './src/db/prisma';
import { writeConfig } from './src/config/auth.config';

async function setupTestUser() {
  try {
    // Get or create test user
    let user = await prisma.user.findFirst({
      where: { username: 'testuser' },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          githubId: 'test-user-001',
          username: 'testuser',
          email: 'test@example.com',
        },
      });
      console.log('✅ Test user created');
    } else {
      console.log('✅ Test user already exists');
    }

    // Save to config
    writeConfig({
      user: {
        id: user.id,
        githubId: user.githubId,
        username: user.username,
        email: user.email,
      },
    });

    console.log('✅ User config saved');
    console.log('User ID:', user.id);
    console.log('Username:', user.username);

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

setupTestUser();
