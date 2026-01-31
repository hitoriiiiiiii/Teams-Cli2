import axios from 'axios';
import chalk from 'chalk';
import { getAuthToken, writeConfig } from '../config/auth.config';
import { upsertGitHubUser } from '../controllers/user.controller';

export async function getGithubUser() {
  const token = getAuthToken();

  if (!token) {
    console.log(chalk.red('❌ Not logged in.'));
    console.log(chalk.yellow('👉 Run `teams login` and paste a valid GitHub token.'));
    return;
  }

  try {
    // Fetch GitHub profile
    const res = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
      },
    });

    const githubUser = res.data;

    // Save / update user in DB
    const user = await upsertGitHubUser({
      githubId: githubUser.id.toString(),
      username: githubUser.login,
      email: githubUser.email ?? null,
    });

    // Update local config (DO NOT overwrite token)
    writeConfig({
      user: {
        id: user.id,
        githubId: user.githubId,
        username: user.username,
        email: user.email,
      },
    });

    // CLI output
    console.log(chalk.green('✅ GitHub Profile'));
    console.log(`Username : ${user.username}`);
    console.log(`Email    : ${user.email ?? 'Private'}`);

    return user;
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      const status = err.response?.status;

      if (status === 401 || status === 403) {
        console.log(chalk.red('❌ Invalid or expired GitHub token.'));
        console.log(chalk.yellow('👉 Run `teams login` again.'));
        return;
      }

      if (status === 404) {
        console.log(chalk.red('❌ GitHub user not found.'));
        return;
      }
    }

    console.log(chalk.red('❌ Failed to fetch GitHub profile.'));
    console.error(err.message);
  }
}