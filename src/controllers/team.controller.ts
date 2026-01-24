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
  return prisma.teamMember.create({
    data: {
      userId,
      teamId,
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
