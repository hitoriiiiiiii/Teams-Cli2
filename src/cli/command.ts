import { Command } from "commander";
import { showHelp } from "./help";


const program = new Command();

program
  .name("teams")
  .description("Teams CLI - find, create and manage teams")
  .version("1.0.0");

//Auth commands

program
  .command("login")
  .description("Login to Teams CLI")
  .action(() => {
    console.log("🔐 Logging in with github wait...");
  });

program
  .command("logout")
  .description("Logout from Teams CLI")
  .action(() => {
    console.log("Logged out successfully.");
  });

program
  .command("whoami")
  .description("Show current logged-in user")
  .action(() => {
    console.log("👤 You are logged in as Github user");
  });

//User commands'

const user = program.command("user").description("User related commands");

user
  .command("me")
  .description("Get current user profile")
  .action(() => {
    console.log("👤 Fetching your GitHub profile...");
  });

user
  .command("get")
  .description("Get another user's details")
  .option("-i, --id <id>", "User ID")
  .option("-u, --username <username>", "GitHub username")
  .action((opts) => {
    if (!opts.id && !opts.username) {
      console.error("❌ Provide --id or --username");
      process.exit(1);
    }

    if (opts.id) {
      console.log(`Fetching user with ID ${opts.id}`);
    } else {
      console.log(`Fetching Github user ${opts.username}`);
    }
  });

//Team commands

const team = program.command("team").description("Team Management");

team
  .command("create")
  .description("Create a new team")
  .option("-n, --name <name>", "Team name")
  .action((opts) => {
    if (!opts.name) {
      console.error("❌ Team name is required");
      process.exit(1);
    }
    console.log(`✅ Team "${opts.name}" created`);
  });

team
  .command("list")
  .description("List all teams")
  .action(() => {
    console.log("Listing teams ...");
  });

team
  .command("get")
  .description("Get team details")
  .option("-i, --id <id>", "Team ID")
  .action((opts) => {
    if (!opts.id) {
      console.error("❌ Team ID required");
      process.exit(1);
    }
    console.log(`Fetching team ${opts.id}`);
  });

team
  .command("delete")
  .description("Delete a team")
  .option("-i, --id <id>", "Team ID")
  .action((opts) => {
    if (!opts.id) {
      console.error("❌ Team ID required");
      process.exit(1);
    }
    console.log(`🗑️ Team ${opts.id} deleted`);
  });

team
  .command("join")
  .description("Join a team")
  .option("-i, --id <id>", "Team ID")
  .action((opts) => {
    console.log(`🤝 Joined team ${opts.id}`);
  });

team
  .command("leave")
  .description("Leave a team")
  .option("-i, --id <id>", "Team ID")
  .action((opts) => {
    if (!opts.id) {
      console.error("❌ Team ID required");
      process.exit(1);
    }
    console.log(`👋 Left team ${opts.id}`);
  });

//Member commands

const member = program.command("member").description("Team members");

member
  .command("add")
  .description("Add a member to team")
  .option("-t, --team <id>", "Team ID")
  .option("-u, --username <username>", "GitHub username")
  .action((opts) => {
    console.log(`➕ Added ${opts.username} to team ${opts.team}`);
  });

member
  .command("remove")
  .description("Remove a member from team")
  .option("-t, --team <id>", "Team ID")
  .option("-u, --username <username>", "GitHub username")
  .action((opts) => {
    console.log(`➖ Removed ${opts.username} from team ${opts.team}`);
  });

member
  .command("list")
  .description("List team members")
  .option("-t, --team <id>", "Team ID")
  .action((opts) => {
    console.log(`👥 Listing members of team ${opts.team}`);
  });

//Invite commands

const invite = program.command("invite").description("Invitation");

invite
  .command("send")
  .description("Send team invite")
  .option("-t, --team <id>", "Team ID")
  .option("-u, --username <username>", "GitHub username")
  .action((opts) => {
    console.log(`📨 Invite sent to ${opts.username}`);
  });

invite
  .command("accept")
  .description("Accept an invite")
  .option("-c, --code <code>", "Invite code")
  .action((opts) => {
    console.log(`✅ Invite ${opts.code} accepted`);
  });

invite
  .command("list")
  .description("List invites")
  .action(() => {
    console.log("📨 Listing invites...");
  });

//Config commands

const config = program.command("config").description("CLI configration");

config
  .command("set")
  .description("Set config value")
  .option("-k, --key <key>", "Config key")
  .option("-v, --value <value>", "Config value")
  .action((opts) => {
    console.log(`⚙️ Set ${opts.key}=${opts.value}`);
  });

config
  .command("get")
  .description("Get config value")
  .option("-k, --key <key>", "Config key")
  .action((opts) => {
    console.log(`⚙️ ${opts.key}=value`);
  });

config
  .command("list")
  .description("List all config")
  .action(() => {
    console.log("⚙️ Listing config...");
  });

//Utility commands

program
  .command("init")
  .description("Initialize Teams CLI project")
  .action(() => {
    console.log("🚀 Teams project initialized");
  });

program
  .command("status")
  .description("Check CLI status")
  .action(() => {
    console.log("🟢 CLI is working fine");
  });

  //Help commands
  program
  .command("help")
  .description("Show help menu")
  .action(() => {
    showHelp();
  });


program.parse(process.argv);
