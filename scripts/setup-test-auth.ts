import fs from 'fs';
import path from 'path';
import os from 'os';
import 'dotenv/config';
import prisma from '../src/db/prisma';

const CONFIG_DIR = path.join(os.homedir(), '.mycli');
const CONFIG_FILE = path.join(CONFIG_DIR, 'auth.json');

async function setupTestAuth() {
  console.log('🔐 Setting up test authentication...\n');

  try {
    // Get the test user from database
    const testUser = await prisma.user.findFirst({
      where: {
        username: 'john_dev',
      },
    });

    if (!testUser) {
      console.error('❌ Test user "john_dev" not found in database');
      console.log('Run `npm run seed` first to create test data');
      process.exit(1);
    }

    // Create config directory if it doesn't exist
    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }

    // Write authentication config
    const authData = {
      token: 'test-token-for-development',
      user: {
        id: testUser.id,
        githubId: testUser.githubId,
        username: testUser.username,
        email: testUser.email,
      },
      activeTeamId: null,
    };

    fs.writeFileSync(CONFIG_FILE, JSON.stringify(authData, null, 2), 'utf-8');

    console.log('═════════════════════════════════════════════');
    console.log('✅ Test Authentication Configured');
    console.log('═════════════════════════════════════════════\n');
    console.log('Config Location:', CONFIG_FILE);
    console.log('\n👤 Logged in as:');
    console.log(`  Username: ${testUser.username}`);
    console.log(`  ID: ${testUser.id}`);
    console.log(`  Email: ${testUser.email}\n`);
    console.log('═════════════════════════════════════════════');
    console.log('🧪 You can now test the CLI commands:');
    console.log('─────────────────────────────────────────────');
    console.log('  teams whoami              # Show current user');
    console.log('  teams team list           # List all teams');
    console.log('  teams member list --team 70');
    console.log('  teams analytics summary --team 70\n');
    console.log('═════════════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up test auth:', error);
    process.exit(1);
  }
}

setupTestAuth();
