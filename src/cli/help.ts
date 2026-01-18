export function showHelp() {
  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 Teams CLI — Help
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

USAGE:
  teams <command> [options]

AUTH COMMANDS:
  teams login                 Login using GitHub
  teams logout                Logout from Teams CLI
  teams whoami                Show current logged-in user

USER COMMANDS:
  teams user me               Show your GitHub profile
  teams user get [options]    Get another user's details

  Options:
    -i, --id <id>             User ID
    -u, --username <name>     GitHub username

TEAM COMMANDS:
  teams team create -n <name> Create a new team
  teams team list             List all teams
  teams team get -i <id>      Get team details
  teams team delete -i <id>   Delete a team
  teams team join -i <id>     Join a team
  teams team leave -i <id>    Leave a team

MEMBER COMMANDS:
  teams member add -t <id> -u <username>
                              Add member to team
  teams member remove -t <id> -u <username>
                              Remove member from team
  teams member list -t <id>   List team members

INVITE COMMANDS:
  teams invite send -t <id> -u <username>
                              Send team invite
  teams invite accept -c <code>
                              Accept invite
  teams invite list           List invites

CONFIG COMMANDS:
  teams config set -k <key> -v <value>
                              Set config value
  teams config get -k <key>   Get config value
  teams config list           List all config

UTILITY COMMANDS:
  teams init                  Initialize Teams project
  teams status                Check CLI status
  teams help                  Show this help menu

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 Tip: Use --help with any command
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
}
