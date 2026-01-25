import cron from 'node-cron';
import prisma from '../db/prisma';
import { computeMemberActivity } from '../services/analytics.services';

export function startAnalyticsCron() {
  cron.schedule('0 * * * *', async () => {
    console.log('⏱ Running team analytics cron');

    const teams = await prisma.team.findMany();

    for (const team of teams) {
      await computeMemberActivity(team.id);
    }
  });
}
