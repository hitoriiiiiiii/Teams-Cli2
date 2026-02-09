/// <reference types="node" />
import { db } from './src/db/index';
import { users } from './src/db/schema';
import { eq } from 'drizzle-orm';
import { writeConfig } from './src/config/auth.config';

async function setupTestUser() {
  try {
    // Get or create test user
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.username, 'testuser'))
      .limit(1);
    let user = existing[0];

    if (!user) {
      const result = await db
        .insert(users)
        .values({
          githubId: 'test-user-001',
          username: 'testuser',
          email: 'test@example.com',
        })
        .returning();
      user = result[0];
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
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

setupTestUser();
