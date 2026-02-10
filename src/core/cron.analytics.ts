import cron from 'node-cron';
import { db } from '../db/index';
import { teams } from '../db/schema';
import { computeMemberActivity } from '../services/analytics.services';

export function startAnalyticsCron() {
    cron.schedule('0 0 * * *', async () => {
        const teamResults = await db.select().from(teams);
        const teamsData = teamResults;

        for (const team of teamsData) {
          await computeMemberActivity(team.id);
        }
    });
}
