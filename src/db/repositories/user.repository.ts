import { eq } from 'drizzle-orm';
import { db } from '../index.js';
import { users } from '../schema.js';

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

/**
 * Create a new user
 */
export async function createUser(
  githubId: string,
  username: string,
  email?: string,
): Promise<User> {
  const result = await db
    .insert(users)
    .values({
      githubId,
      username,
      email,
    })
    .returning();
  return result[0];
}

/**
 * Get user by GitHub ID
 */
export async function getUserByGithubId(
  githubId: string,
): Promise<User | null> {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.githubId, githubId))
    .limit(1);
  return result[0] || null;
}

/**
 * Get user by username
 */
export async function getUserByUsername(
  username: string,
): Promise<User | null> {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);
  return result[0] || null;
}

/**
 * Get user by ID
 */
export async function getUserById(id: number): Promise<User | null> {
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0] || null;
}

/**
 * Create or update (upsert) GitHub user
 */
export async function upsertGitHubUser(user: {
  githubId: string;
  username: string;
  email?: string;
}): Promise<User> {
  // First, try to find existing user
  const existingUser = await getUserByGithubId(user.githubId);

  if (existingUser) {
    // Update existing user
    const updateResult = await db
      .update(users)
      .set({
        username: user.username,
        email: user.email,
      })
      .where(eq(users.githubId, user.githubId))
      .returning();
    return updateResult[0];
  } else {
    // Create new user
    return await createUser(user.githubId, user.username, user.email);
  }
}

/**
 * Get all users
 */
export async function getAllUsers(): Promise<User[]> {
  return db.select().from(users);
}

/**
 * Update user
 */
export async function updateUser(
  id: number,
  updates: Partial<Omit<User, 'id' | 'createdAt'>>,
): Promise<User | null> {
  const result = await db
    .update(users)
    .set(updates)
    .where(eq(users.id, id))
    .returning();
  return result[0] || null;
}

/**
 * Delete user by ID
 */
export async function deleteUser(id: number): Promise<User | null> {
  const result = await db.delete(users).where(eq(users.id, id)).returning();
  return result[0] || null;
}

/**
 * Check if GitHub ID already exists
 */
export async function githubIdExists(githubId: string): Promise<boolean> {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.githubId, githubId))
    .limit(1);
  return result.length > 0;
}
