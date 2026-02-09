import { db } from './setup';
import { repos, teams } from '../db/schema';
import { eq } from 'drizzle-orm';

describe('Repo model (Drizzle)', () => {
  beforeAll(async () => {
    await db.delete(repos);
  });

  it('should create and list repos for a team', async () => {
    // make sure there's a team to attach to
    const t = await db.insert(teams).values({ name: 'RepoTeam' }).returning();
    const teamId = t[0].id;

    const created = await db.insert(repos).values({
      githubId: 'r_1',
      name: 'repo1',
      fullName: 'owner/repo1',
      teamId,
    }).returning();

    expect(created.length).toBe(1);

    // find by team using eq helper
    const found = await db.select().from(repos).where(eq(repos.teamId, teamId));
    expect(found.length).toBeGreaterThanOrEqual(1);

    // delete by fullName using eq helper
    const deleted = await db.delete(repos).where(eq(repos.fullName, 'owner/repo1')).returning();
    expect(deleted.length).toBe(1);
  });
});