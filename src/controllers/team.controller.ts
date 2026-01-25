import prisma from '../db/prisma';

//Create a team and add owner as member

export async function createTeam(teamName: string, ownerUserId: number) {
  // First, ensure the user exists in the database
  const user = await prisma.user.findUnique({
    where: { id: ownerUserId },
  });

  if (!user) {
    throw new Error(`User with ID ${ownerUserId} does not exist`);
  }

  // Create the team
  const team = await prisma.team.create({
    data: {
      name: teamName,
    },
  });

  // Add owner as a member
  await prisma.teamMember.create({
    data: {
      userId: ownerUserId,
      teamId: team.id,
    },
  });

  return team;
}

//add users to team

export async function addUsertoTeam(userId: number, teamId: number) {
  // Check if user already exists in team
  const existingMember = await prisma.teamMember.findFirst({
    where: { userId, teamId },
  });

  if (existingMember) {
    throw new Error('User is already a member of this team');
  }

  return prisma.teamMember.create({
    data: {
      userId,
      teamId,
    },
  });
}

/**
 * Remove a user from a team
 */
export async function removeUserFromTeam(userId: number, teamId: number) {
  const member = await prisma.teamMember.findFirst({
    where: { userId, teamId },
  });

  if (!member) {
    throw new Error('User is not a member of this team');
  }

  return prisma.teamMember.delete({
    where: {
      id: member.id,
    },
  });
}

/**
 * Get team members
 */
export async function getTeamMembers(teamId: number) {
  return prisma.teamMember.findMany({
    where: { teamId },
    include: {
      user: true,
    },
    orderBy: { user: { username: 'asc' } },
  });
}

/**
 * Get team by ID
 */
export async function getTeamById(teamId: number) {
  return prisma.team.findUnique({
    where: { id: teamId },
    include: {
      members: {
        include: { user: true },
      },
      repos: true,
    },
  });
}

//Get team of a user

export async function getTeamByUser(userId: number) {
  return prisma.teamMember.findMany({
    where: { userId },
    include: {
      team: true,
    },
  });
}

export async function getTeamByName(name: string) {
  return prisma.team.findMany({
    where: { name },
  });
}

export async function listTeams(userId: number) {
  return prisma.teamMember.findMany({
    where: {
      userId: userId,
    },
    include: {
      team: true,
    },
  });
}