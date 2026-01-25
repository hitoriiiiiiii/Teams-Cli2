import 'dotenv/config';
import prisma from '../src/db/prisma';

async function seedTestData() {
  console.log('🌱 Starting to seed test data...\n');

  try {
    // Clean up existing test data
    console.log('🧹 Cleaning up existing test data...');
    await prisma.commit.deleteMany({});
    await prisma.repo.deleteMany({});
    await prisma.invite.deleteMany({});
    await prisma.teamMember.deleteMany({});
    await prisma.team.deleteMany({});
    await prisma.user.deleteMany({});
    console.log('✓ Cleaned up\n');

    // Create test users
    console.log('👤 Creating test users...');
    const user1 = await prisma.user.create({
      data: {
        username: 'john_dev',
        email: 'john@example.com',
        githubId: '1001',
      },
    });
    console.log(`✓ Created user: ${user1.username} (ID: ${user1.id})`);

    const user2 = await prisma.user.create({
      data: {
        username: 'sarah_designer',
        email: 'sarah@example.com',
        githubId: '1002',
      },
    });
    console.log(`✓ Created user: ${user2.username} (ID: ${user2.id})`);

    const user3 = await prisma.user.create({
      data: {
        username: 'mike_pm',
        email: 'mike@example.com',
        githubId: '1003',
      },
    });
    console.log(`✓ Created user: ${user3.username} (ID: ${user3.id})\n`);

    // Create test teams
    console.log('🏢 Creating test teams...');
    const team1 = await prisma.team.create({
      data: {
        name: 'Backend Development',
      },
    });
    console.log(`✓ Created team: ${team1.name} (ID: ${team1.id})`);

    const team2 = await prisma.team.create({
      data: {
        name: 'Frontend Team',
      },
    });
    console.log(`✓ Created team: ${team2.name} (ID: ${team2.id})\n`);

    // Add team members
    console.log('👥 Adding team members...');
    await prisma.teamMember.create({
      data: { userId: user1.id, teamId: team1.id },
    });
    console.log(`✓ Added ${user1.username} to ${team1.name}`);

    await prisma.teamMember.create({
      data: { userId: user2.id, teamId: team1.id },
    });
    console.log(`✓ Added ${user2.username} to ${team1.name}`);

    await prisma.teamMember.create({
      data: { userId: user2.id, teamId: team2.id },
    });
    console.log(`✓ Added ${user2.username} to ${team2.name}`);

    await prisma.teamMember.create({
      data: { userId: user3.id, teamId: team2.id },
    });
    console.log(`✓ Added ${user3.username} to ${team2.name}\n`);

    // Create test invites
    console.log('📧 Creating test invites...');
    const invite1 = await prisma.invite.create({
      data: {
        code: 'INVITE001',
        teamId: team1.id,
        invitedBy: user1.id,
        invitedUser: user3.username,
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });
    console.log(`✓ Created invite: ${invite1.code} for ${invite1.invitedUser}`);

    const invite2 = await prisma.invite.create({
      data: {
        code: 'INVITE002',
        teamId: team2.id,
        invitedBy: user2.id,
        invitedUser: 'alice_qa',
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
    console.log(`✓ Created invite: ${invite2.code} for ${invite2.invitedUser}\n`);

    // Print summary
    console.log('═══════════════════════════════════════════════════');
    console.log('✅ Test Data Seeded Successfully!');
    console.log('═══════════════════════════════════════════════════\n');

    console.log('📊 Test Data Summary:');
    console.log('─────────────────────────────────────────────────────');
    console.log('\n👤 Users:');
    console.log(`  • ${user1.username} (ID: ${user1.id})`);
    console.log(`  • ${user2.username} (ID: ${user2.id})`);
    console.log(`  • ${user3.username} (ID: ${user3.id})\n`);

    console.log('🏢 Teams:');
    console.log(`  • ${team1.name} (ID: ${team1.id})`);
    console.log(`    Members: ${user1.username}, ${user2.username}`);
    console.log(`  • ${team2.name} (ID: ${team2.id})`);
    console.log(`    Members: ${user2.username}, ${user3.username}\n`);

    console.log('📧 Pending Invites:');
    console.log(`  • ${invite1.code} → ${invite1.invitedUser} (to ${team1.name})`);
    console.log(`  • ${invite2.code} → ${invite2.invitedUser} (to ${team2.name})\n`);

    console.log('═══════════════════════════════════════════════════');
    console.log('🧪 Try These Commands:');
    console.log('─────────────────────────────────────────────────────');
    console.log('  # Login as john_dev');
    console.log('  teams login\n');
    console.log('  # List teams');
    console.log('  teams team list\n');
    console.log(`  # List team members (${team1.name})`);
    console.log(`  teams member list --team ${team1.id}\n`);
    console.log('  # View team analytics');
    console.log(`  teams analytics summary --team ${team1.id}\n`);
    console.log('  # List pending invites');
    console.log(`  teams invite list --team ${team1.id}\n`);
    console.log('═══════════════════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

seedTestData();
