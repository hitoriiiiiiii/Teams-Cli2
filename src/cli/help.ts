export function showHelp() {
  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 Teams CLI — Help
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

USAGE:
  teams <command> [options]

AUTH COMMANDS:
  teams login                 Login to Teams CLI with GitHub OAuth
  teams logout                Logout from Teams CLI
  teams whoami                Show current logged-in user

USER COMMANDS:
  teams user get [options]    Get another user's details

  Options:
    -i, --id <id>             User ID
    -u, --username <username> GitHub username

TEAM COMMANDS:
  teams team create [name]    Create a new team
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

REPO COMMANDS:
  teams repo add <teamName> <repoName>
                              Add a repo to a team
  teams repo list <teamName>  List all repos of a team
  teams repo remove <teamName> <repoName>
                              Remove a repo from a team

INVITE COMMANDS:
  teams invite send -t <id> -u <username>
                              Send team invite
  teams invite accept -c <code>
                              Accept an invite
  teams invite reject -c <code>
                              Reject an invite
  teams invite list -t <id>   List pending invites for a team

COMMITS COMMANDS:
  teams commits list <owner> <repo> [options]
                              List commits for a repository
  teams commits get <owner> <repo> <sha>
                              Get details of a specific commit

  Options:
    -a, --author <author>     Filter commits by author

ANALYTICS COMMANDS:
  teams analytics activity -t <id>
                              Show member activity (7/14/30 days)
  teams analytics leaderboard -t <id>
                              Show top contributors
  teams analytics member -t <id> -u <username>
                              Show analytics for a member
  teams analytics summary -t <id>
                              Show team analytics summary

CONFIG COMMANDS:
  teams config set -k <key> -v <value>
                              Set config value
  teams config get -k <key>   Get config value
  teams config list           List all config

UTILITY COMMANDS:
  teams init                  Initialize Teams CLI project
  teams status                Check CLI status
  teams help                  Show this help menu

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 Tip: Use --help with any command for detailed usage
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
}
