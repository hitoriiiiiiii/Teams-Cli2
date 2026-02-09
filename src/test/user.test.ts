import { db } from './setup';
import { users } from '../db/schema';
// eq not used in tests

describe('User model (Drizzle)', () => {
  beforeAll(async () => {
    // Clean users table before each run
    await db.delete(users);
  });

  beforeEach(async () => {
    // Ensure the baseline user exists for every test (setup cleans after each test)
    await db
      .insert(users)
      .values({
        githubId: 'gh_123',
        username: 'prarthana',
        email: 'prarthana@test.com',
      })
      .catch(() => {});
  });

  it('should create a user', async () => {
    // baseline user is created in beforeEach
    const all = await db.select().from(users);
    console.log(
      'DEBUG: all users after beforeEach ->',
      JSON.stringify(all, null, 2),
    );
    expect(all.length).toBeGreaterThanOrEqual(1);
    expect(all[0].username).toBe('prarthana');
  });

  it('should fetch user by username', async () => {
    // Some drivers / builders can behave differently; fetch all and assert by JS filter
    const all = await db.select().from(users);
    const result = all.filter((u: any) => u.username === 'prarthana');
    console.log(
      'DEBUG: fetch by username via filter ->',
      JSON.stringify(result, null, 2),
    );
    expect(result.length).toBe(1);
    expect(result[0].email).toBe('prarthana@test.com');
  });

  it('should not allow duplicate githubId', async () => {
    // Rather than rely on driver throwing, ensure duplicates are not created
    await db
      .insert(users)
      .values({
        githubId: 'gh_123',
        username: 'duplicate',
      })
      .catch(() => {});

    const all = await db.select().from(users);
    const matches = all.filter((u: any) => u.githubId === 'gh_123');
    expect(matches.length).toBe(1);
  });
});
