import inquirer from 'inquirer';

/**
 * Ask for GitHub repository details
 */
export async function askRepoDetails() {
  return inquirer.prompt([
    {
      type: 'input',
      name: 'owner',
      message: 'GitHub owner (username or org):',
      validate: (input: string) =>
        input.trim() !== '' || 'Owner cannot be empty',
    },
    {
      type: 'input',
      name: 'repo',
      message: 'Repository name:',
      validate: (input: string) =>
        input.trim() !== '' || 'Repository name cannot be empty',
    },
    {
      type: 'confirm',
      name: 'isPrivate',
      message: 'Is this a private repository?',
      default: false,
    },
  ]);
}

/**
 * Ask user to select a repository from a list
 */
export async function selectRepo(repos: string[]) {
  return inquirer.prompt([
    {
      type: 'list',
      name: 'repo',
      message: 'Select a repository:',
      choices: repos,
    },
  ]);
}

/**
 * Confirm dangerous actions (delete, disconnect, leave team)
 */
export async function confirmAction(message: string) {
  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message,
      default: false,
    },
  ]);

  return confirm;
}

/**
 * Ask for team name
 */
export async function askTeamName() {
  return inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Enter team name:',
      validate: (input: string) =>
        input.trim() !== '' || 'Team name cannot be empty',
    },
  ]);
}

/**
 * Ask for GitHub username
 */
export async function askGithubUsername() {
  return inquirer.prompt([
    {
      type: 'input',
      name: 'username',
      message: 'GitHub username:',
      validate: (input: string) =>
        input.trim() !== '' || 'Username cannot be empty',
    },
  ]);
}

/**
 * Ask for Team ID
 */
export async function askTeamId() {
  return inquirer.prompt([
    {
      type: 'input',
      name: 'id',
      message: 'Enter Team ID:',
      validate: (input: string) => {
        if (!input.trim()) return 'Team ID cannot be empty';
        if (isNaN(Number(input))) return 'Team ID must be a number';
        return true;
      },
    },
  ]);
}

/**
 * Ask for User ID
 */
export async function askUserId() {
  return inquirer.prompt([
    {
      type: 'input',
      name: 'id',
      message: 'Enter User ID:',
      validate: (input: string) => {
        if (!input.trim()) return 'User ID cannot be empty';
        if (isNaN(Number(input))) return 'User ID must be a number';
        return true;
      },
    },
  ]);
}

/**
 * Ask for repository name
 */
export async function askRepoName() {
  return inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Enter repository name:',
      validate: (input: string) =>
        input.trim() !== '' || 'Repository name cannot be empty',
    },
  ]);
}

/**
 * Ask for invite code
 */
export async function askInviteCode() {
  return inquirer.prompt([
    {
      type: 'input',
      name: 'code',
      message: 'Enter invite code:',
      validate: (input: string) =>
        input.trim() !== '' || 'Invite code cannot be empty',
    },
  ]);
}

/**
 * Ask for config key and value
 */
export async function askConfigKeyValue() {
  return inquirer.prompt([
    {
      type: 'input',
      name: 'key',
      message: 'Config key:',
      validate: (input: string) =>
        input.trim() !== '' || 'Config key cannot be empty',
    },
    {
      type: 'input',
      name: 'value',
      message: 'Config value:',
      validate: (input: string) =>
        input.trim() !== '' || 'Config value cannot be empty',
    },
  ]);
}

/**
 * Select a user from list
 */
export async function selectUser(users: { id: number; username: string }[]) {
  return inquirer.prompt([
    {
      type: 'list',
      name: 'userId',
      message: 'Select a user:',
      choices: users.map((u) => ({
        name: `${u.username} (ID: ${u.id})`,
        value: u.id,
      })),
    },
  ]);
}

/**
 * Select a team from list
 */
export async function selectTeam(teams: { id: number; name: string }[]) {
  return inquirer.prompt([
    {
      type: 'list',
      name: 'teamId',
      message: 'Select a team:',
      choices: teams.map((t) => ({
        name: t.name,
        value: t.id,
      })),
    },
  ]);
}
