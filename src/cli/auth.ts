import axios from 'axios';
import ora from 'ora';
import chalk from 'chalk';
import open from 'open';
import {
  writeConfig,
  getAuthToken,
  clearAuthToken,
} from '../config/auth.config';

const CLIENT_ID = process.env.GITHUB_CLIENT_ID!;

export async function loginWithGithub() {
  const spinner = ora('Starting GitHub login...').start();

  try {
    const deviceRes = await axios.post(
      'https://github.com/login/device/code',
      {
        client_id: CLIENT_ID,
        scope: 'read:user user:email',
      },
      { headers: { Accept: 'application/json' } },
    );

    spinner.stop();

    const { device_code, user_code, verification_uri, interval } =
      deviceRes.data;

    console.log(chalk.yellow('\nGitHub Authentication'));
    console.log(`Open: ${chalk.cyan(verification_uri)}`);
    console.log(`Code: ${chalk.green(user_code)}\n`);

    await open(verification_uri);

    const wait = ora('Waiting for authorization...').start();

    while (true) {
      await new Promise((r) => setTimeout(r, interval * 1000));

      const tokenRes = await axios.post(
        'https://github.com/login/oauth/access_token',
        {
          client_id: CLIENT_ID,
          device_code,
          grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
        },
        { headers: { Accept: 'application/json' } },
      );

      if (tokenRes.data.access_token) {
        // ✅ Save token in unified config
        writeConfig({ token: tokenRes.data.access_token });
        wait.succeed('Logged in successfully 🎉');
        break;
      }
    }
  } catch (err: any) {
    spinner.fail('GitHub login failed');
    console.error(err.message);
  }
}

// Logout user
export function logoutUser() {
  clearAuthToken();
  console.log(chalk.red('Logged out successfully'));
}

// Auth status
export function authStatus() {
  const token = getAuthToken();
  if (!token) {
    console.log(chalk.red('Not logged in'));
  } else {
    console.log(chalk.green('Logged in'));
  }
}
