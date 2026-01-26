#!/usr/bin/env node
/**
 * Comprehensive test script to validate all Teams CLI commands
 * Tests against the real database
 */

import 'dotenv/config';
import prisma from './src/db/prisma';
import chalk from 'chalk';

interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL';
  message?: string;
  error?: string;
}

const results: TestResult[] = [];

async function logTest(name: string, status: 'PASS' | 'FAIL', message?: string, error?: string) {
  const result: TestResult = { name, status, message, error };
  results.push(result);
  
  const icon = status === 'PASS' ? chalk.green('✓') : chalk.red('✗');
  const statusText = status === 'PASS' ? chalk.green(status) : chalk.red(status);
  
  console.log(`${icon} ${statusText} - ${name}`);
  if (message) console.log(`  ${chalk.cyan(message)}`);
  if (error) console.log(`  ${chalk.red('Error:')} ${error}`);
}

async function testDatabaseConnection() {
  try {
    console.log(chalk.cyan.bold('\n📡 Testing Database Connection...\n'));
    
    await prisma.$queryRaw`SELECT 1`;
    await logTest('Database Connection', 'PASS', 'Successfully connected to PostgreSQL');
  } catch (error: any) {
    await logTest('Database Connection', 'FAIL', undefined, error.message);
  }
}

async function testUserOperations() {
  try {
    console.log(chalk.cyan.bold('\n👤 Testing User Operations...\n'));
    
    // Test: Create a test user
    const testUser = await prisma.user.create({
      data: {
        username: `testuser_${Date.now()}`,
        email: `test_${Date.now()}@github.local`,
        githubId: `gh_${Date.now()}`,
      },
    });
    await logTest('Create User', 'PASS', `Created user: ${testUser.username}`);
    
    // Test: Find user by ID
    const foundUser = await prisma.user.findUnique({
      where: { id: testUser.id },
    });
    if (foundUser) {
      await logTest('Find User by ID', 'PASS', `Found user: ${foundUser.username}`);
    } else {
      await logTest('Find User by ID', 'FAIL', 'User not found after creation');
    }
    
    // Test: Find user by username
    const foundByUsername = await prisma.user.findFirst({
      where: { username: testUser.username },
    });
    if (foundByUsername) {
      await logTest('Find User by Username', 'PASS', `Found user: ${foundByUsername.username}`);
    } else {
      await logTest('Find User by Username', 'FAIL', 'User not found by username');
    }
    
    // Cleanup
    await prisma.user.delete({ where: { id: testUser.id } });
    await logTest('Delete User', 'PASS', 'Successfully deleted test user');
  } catch (error: any) {
    await logTest('User Operations', 'FAIL', undefined, error.message);
  }
}

async function testTeamOperations() {
  try {
    console.log(chalk.cyan.bold('\n🏢 Testing Team Operations...\n'));
    
    // Create a test user
    const testUser = await prisma.user.create({
      data: {
        username: `teamtest_${Date.now()}`,
        email: `teamtest_${Date.now()}@github.local`,
        githubId: `gh_team_${Date.now()}`,
      },
    });
    
    // Test: Create a team
    const testTeam = await prisma.team.create({
      data: {
        name: `TestTeam_${Date.now()}`,
      },
    });
    await logTest('Create Team', 'PASS', `Created team: ${testTeam.name}`);
    
    // Test: Find team by ID
    const foundTeam = await prisma.team.findUnique({
      where: { id: testTeam.id },
      include: { members: { include: { user: true } } },
    });
    if (foundTeam) {
      await logTest('Find Team by ID', 'PASS', `Found team: ${foundTeam.name}`);
    } else {
      await logTest('Find Team by ID', 'FAIL', 'Team not found after creation');
    }
    
    // Test: Add member to team
    const memberRecord = await prisma.teamMember.create({
      data: {
        userId: testUser.id,
        teamId: testTeam.id,
      },
    });
    await logTest('Add Team Member', 'PASS', `Added member to team with status: ${memberRecord.activityStatus}`);
    
    // Test: List team members
    const members = await prisma.teamMember.findMany({
      where: { teamId: testTeam.id },
      include: { user: true },
    });
    if (members.length > 0) {
      await logTest('List Team Members', 'PASS', `Found ${members.length} member(s)`);
    } else {
      await logTest('List Team Members', 'FAIL', 'No members found');
    }
    
    // Cleanup
    await prisma.teamMember.deleteMany({ where: { teamId: testTeam.id } });
    await prisma.team.delete({ where: { id: testTeam.id } });
    await prisma.user.delete({ where: { id: testUser.id } });
    await logTest('Cleanup Team & Members', 'PASS', 'Successfully cleaned up test data');
  } catch (error: any) {
    await logTest('Team Operations', 'FAIL', undefined, error.message);
  }
}

async function testRepositoryOperations() {
  try {
    console.log(chalk.cyan.bold('\n📦 Testing Repository Operations...\n'));
    
    // Create test user and team
    const testUser = await prisma.user.create({
      data: {
        username: `repotest_${Date.now()}`,
        email: `repotest_${Date.now()}@github.local`,
        githubId: `gh_repo_${Date.now()}`,
      },
    });
    
    const testTeam = await prisma.team.create({
      data: {
        name: `RepoTeam_${Date.now()}`,
      },
    });
    
    // Test: Create repository
    const testRepo = await prisma.repo.create({
      data: {
        githubId: Math.floor(Math.random() * 1000000),
        name: `testrepo_${Date.now()}`,
        fullName: `owner/testrepo_${Date.now()}`,
        teamId: testTeam.id,
        stars: 0,
        forks: 0,
        private: false,
      },
    });
    await logTest('Create Repository', 'PASS', `Created repo: ${testRepo.name}`);
    
    // Test: Find repository
    const foundRepo = await prisma.repo.findUnique({
      where: { id: testRepo.id },
    });
    if (foundRepo) {
      await logTest('Find Repository', 'PASS', `Found repo: ${foundRepo.name}`);
    } else {
      await logTest('Find Repository', 'FAIL', 'Repository not found');
    }
    
    // Test: List repositories by team
    const repos = await prisma.repo.findMany({
      where: { teamId: testTeam.id },
    });
    if (repos.length > 0) {
      await logTest('List Repositories', 'PASS', `Found ${repos.length} repository(ies)`);
    } else {
      await logTest('List Repositories', 'FAIL', 'No repositories found');
    }
    
    // Cleanup
    await prisma.repo.delete({ where: { id: testRepo.id } });
    await prisma.team.delete({ where: { id: testTeam.id } });
    await prisma.user.delete({ where: { id: testUser.id } });
    await logTest('Cleanup Repositories', 'PASS', 'Successfully cleaned up test data');
  } catch (error: any) {
    await logTest('Repository Operations', 'FAIL', undefined, error.message);
  }
}

async function testInviteOperations() {
  try {
    console.log(chalk.cyan.bold('\n💌 Testing Invite Operations...\n'));
    
    // Create test user and team
    const testUser = await prisma.user.create({
      data: {
        username: `invitetest_${Date.now()}`,
        email: `invitetest_${Date.now()}@github.local`,
        githubId: `gh_invite_${Date.now()}`,
      },
    });
    
    const testTeam = await prisma.team.create({
      data: {
        name: `InviteTeam_${Date.now()}`,
      },
    });
    
    // Test: Create invite
    const testInvite = await prisma.invite.create({
      data: {
        teamId: testTeam.id,
        invitedBy: testUser.id,
        invitedUser: 'testuser@github.com',
      },
    });
    await logTest('Create Invite', 'PASS', `Created invite with code: ${testInvite.code}`);
    
    // Test: Find invite by code
    const foundInvite = await prisma.invite.findUnique({
      where: { code: testInvite.code },
    });
    if (foundInvite) {
      await logTest('Find Invite by Code', 'PASS', `Found invite: ${foundInvite.code}`);
    } else {
      await logTest('Find Invite by Code', 'FAIL', 'Invite not found');
    }
    
    // Test: List pending invites
    const invites = await prisma.invite.findMany({
      where: { teamId: testTeam.id, status: 'PENDING' },
    });
    if (invites.length > 0) {
      await logTest('List Pending Invites', 'PASS', `Found ${invites.length} pending invite(s)`);
    } else {
      await logTest('List Pending Invites', 'FAIL', 'No pending invites found');
    }
    
    // Cleanup
    await prisma.invite.delete({ where: { code: testInvite.code } });
    await prisma.team.delete({ where: { id: testTeam.id } });
    await prisma.user.delete({ where: { id: testUser.id } });
    await logTest('Cleanup Invites', 'PASS', 'Successfully cleaned up test data');
  } catch (error: any) {
    await logTest('Invite Operations', 'FAIL', undefined, error.message);
  }
}

async function testCommitOperations() {
  try {
    console.log(chalk.cyan.bold('\n📝 Testing Commit Operations...\n'));
    
    // Create test user, team, and repo
    const testUser = await prisma.user.create({
      data: {
        username: `commituser_${Date.now()}`,
        email: `commituser_${Date.now()}@github.local`,
        githubId: `gh_commit_${Date.now()}`,
      },
    });
    
    const testTeam = await prisma.team.create({
      data: {
        name: `CommitTeam_${Date.now()}`,
      },
    });
    
    const testRepo = await prisma.repo.create({
      data: {
        githubId: Math.floor(Math.random() * 1000000),
        name: `commitrepo_${Date.now()}`,
        fullName: `owner/commitrepo_${Date.now()}`,
        teamId: testTeam.id,
        stars: 0,
        forks: 0,
        private: false,
      },
    });
    
    // Test: Create commit
    const testCommit = await prisma.commit.create({
      data: {
        sha: `sha_${Date.now()}`,
        message: 'Test commit message',
        authorId: testUser.id,
        repoId: testRepo.id,
      },
    });
    await logTest('Create Commit', 'PASS', `Created commit: ${testCommit.sha.substring(0, 7)}`);
    
    // Test: Find commit
    const foundCommit = await prisma.commit.findUnique({
      where: { id: testCommit.id },
    });
    if (foundCommit) {
      await logTest('Find Commit', 'PASS', `Found commit: ${foundCommit.sha.substring(0, 7)}`);
    } else {
      await logTest('Find Commit', 'FAIL', 'Commit not found');
    }
    
    // Test: List commits
    const commits = await prisma.commit.findMany({
      where: { repoId: testRepo.id },
    });
    if (commits.length > 0) {
      await logTest('List Commits', 'PASS', `Found ${commits.length} commit(s)`);
    } else {
      await logTest('List Commits', 'FAIL', 'No commits found');
    }
    
    // Cleanup
    await prisma.commit.delete({ where: { id: testCommit.id } });
    await prisma.repo.delete({ where: { id: testRepo.id } });
    await prisma.team.delete({ where: { id: testTeam.id } });
    await prisma.user.delete({ where: { id: testUser.id } });
    await logTest('Cleanup Commits', 'PASS', 'Successfully cleaned up test data');
  } catch (error: any) {
    await logTest('Commit Operations', 'FAIL', undefined, error.message);
  }
}

async function printSummary() {
  console.log(chalk.cyan.bold('\n\n════════════════════════════════════════════════════════'));
  console.log(chalk.cyan.bold('📊 TEST SUMMARY'));
  console.log(chalk.cyan.bold('════════════════════════════════════════════════════════\n'));
  
  const passed = results.filter((r) => r.status === 'PASS').length;
  const failed = results.filter((r) => r.status === 'FAIL').length;
  const total = results.length;
  
  results.forEach((r) => {
    const icon = r.status === 'PASS' ? chalk.green('✓') : chalk.red('✗');
    console.log(`${icon} ${r.name}`);
  });
  
  console.log(chalk.cyan.bold('\n════════════════════════════════════════════════════════'));
  console.log(`${chalk.green(`Passed: ${passed}`)} | ${chalk.red(`Failed: ${failed}`)} | ${chalk.cyan(`Total: ${total}`)}`);
  console.log(chalk.cyan.bold('════════════════════════════════════════════════════════\n'));
  
  if (failed === 0) {
    console.log(chalk.green.bold('✅ All tests passed! Ready to publish.\n'));
  } else {
    console.log(chalk.red.bold(`❌ ${failed} test(s) failed. Please fix before publishing.\n`));
  }
}

async function runAllTests() {
  try {
    console.log(chalk.magenta.bold('\n\n🚀 Teams CLI - Comprehensive Test Suite\n'));
    
    await testDatabaseConnection();
    await testUserOperations();
    await testTeamOperations();
    await testRepositoryOperations();
    await testInviteOperations();
    await testCommitOperations();
    
    await printSummary();
  } catch (error) {
    console.error(chalk.red('Fatal error during testing:'), error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runAllTests();
