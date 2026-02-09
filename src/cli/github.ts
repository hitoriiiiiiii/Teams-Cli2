import axios from 'axios';
import chalk from 'chalk';
import { getAuthToken, writeConfig } from '../config/auth.config';
import { upsertGitHubUser } from '../controllers/user.controller';

export async function getGithubUser() {
  const token = getAuthToken();

  if (!token) {
    console.log(chalk.red('❌ Not logged in. Run `teams login` first.'));
    return;
  }

  try {
    // Fetch GitHub profile using token
    const res = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
      },
    });

    const githubUser = res.data;

    // Upsert user into database
    const user = await upsertGitHubUser({
      githubId: githubUser.id.toString(),
      username: githubUser.login,
      email: githubUser.email, // might be null
    });

    // Save user info locally in config
    writeConfig({
      user: {
        id: user.id,
        githubId: user.githubId,
        username: user.username,
        email: user.email,
      },
    });

    // Show GitHub profile in CLI
    console.log(chalk.green('✅ GitHub Profile'));
    console.log(`Username : ${user.username}`);
    console.log(`Email    : ${user.email ?? 'Private'}`);
    console.log('User saved to DB:', user);

    return user;
  } catch (err: any) {
    console.log(chalk.red('❌ Failed to fetch GitHub profile'));
    console.error(err.message);
  }
}
