# Teams CLI - Complete Feature Documentation

## 🎯 Overview

Teams CLI is a command-line tool for managing teams, team members, repositories, and analyzing team activity. It uses GitHub OAuth for authentication and Prisma ORM with PostgreSQL for data persistence.

---

## 📋 Implemented Features

### 1. **Authentication Commands**

- **`teams login`** - Login with GitHub OAuth
- **`teams logout`** - Logout and clear auth token
- **`teams whoami`** - Show current logged-in user profile

### 2. **User Management Commands**

- **`teams user me`** - Get current user profile
- **`teams user get`** - Get another user's details (by ID or username)

### 3. **Team Management Commands**

- **`teams team create [name]`** - Create a new team (auto-adds owner as member)
- **`teams team list`** - List all user's teams
- **`teams team get -i <id>`** - Get team details
- **`teams team delete -i <id>`** - Delete a team (with confirmation)
- **`teams team join -i <id>`** - Join a team
- **`teams team leave -i <id>`** - Leave a team (with confirmation)

### 4. **Member Management Commands** ⭐ **NEW**

- **`teams member add`** - Add a member to team by username
  - Requires login
  - Verifies adding user is team member
  - Options: `-t, --team <id>` and `-u, --username <username>`
- **`teams member remove`** - Remove a member from team ⭐ **NEW**
  - Requires confirmation
  - Requires login
  - Options: `-t, --team <id>` and `-u, --username <username>`
  - Full database operations implemented
- **`teams member list`** - List all team members ⭐ **ENHANCED**
  - Shows member count
  - Displays username and ID
  - Ordered alphabetically

### 5. **Invite System Commands** ⭐ **COMPLETELY NEW**

#### Send Invite

```bash
teams invite send -t <teamId> -u <username>
```

- Generates unique invite code (8-char UUID)
- Only team members can send invites
- Tracks who sent the invite
- 7-day expiration

#### Accept Invite

```bash
teams invite accept -c <code>
```

- Validates invite exists and is pending
- Checks if not expired
- Prevents duplicate membership
- Automatically adds user to team
- Marks invite as accepted

#### Reject Invite

```bash
teams invite reject -c <code>
```

- Marks invite as rejected
- Prevents duplicate rejection

#### List Invites

```bash
teams invite list -t <teamId>
```

- Shows all pending invites for a team
- Displays code, recipient, sender
- Shows expiration date
- Ordered by creation date (newest first)

### 6. **Repository Management Commands**

- **`teams repo add <teamName> <repoName>`** - Add repo to team
- **`teams repo list <teamName>`** - List team repositories
- **`teams repo remove <teamName> <repoName>`** - Remove repo from team

### 7. **Analytics Commands**

- **`teams analytics activity -t <id>`** - Show member activity status
- **`teams analytics leaderboard -t <id>`** - Show top contributors
- **`teams analytics member -t <id> -u <username>`** - Show member analytics
- **`teams analytics summary -t <id>`** - Show team summary

### 8. **Commit Management Commands**

- **`teams commits list <owner> <repo>`** - List commits (with author filter)
- **`teams commits get <owner> <repo> <sha>`** - Get specific commit details

### 9. **Configuration Commands**

- **`teams config set -k <key> -v <value>`** - Set config value
- **`teams config get -k <key>`** - Get config value
- **`teams config list`** - List all config

### 10. **Utility Commands**

- **`teams init`** - Initialize Teams CLI project
- **`teams status`** - Check CLI status
- **`teams help`** - Show help menu

---

## 🗄️ Database Schema Updates

### New Invite Model

```prisma
model Invite {
  id        Int      @id @default(autoincrement())
  code      String   @unique @default(cuid())
  teamId    Int
  invitedBy Int
  invitedUser String?
  status    InviteStatus @default(PENDING)
  createdAt DateTime @default(now())
  expiresAt DateTime @default(dbgenerated("CURRENT_TIMESTAMP + interval '7 days'"))
  acceptedAt DateTime?

  team    Team @relation(fields: [teamId], references: [id], onDelete: Cascade)
  inviter User @relation("InvitesSent", fields: [invitedBy], references: [id])

  @@index([teamId, status])
  @@index([code])
}

enum InviteStatus {
  PENDING
  ACCEPTED
  REJECTED
  EXPIRED
}
```

### Updated Models

- **User**: Added `invitesSent` relation
- **Team**: Added `invites` relation
- **TeamMember**: Already had `activityStatus` enum

---

## 🚀 New Controller Functions

### Team Controller (`src/controllers/team.controller.ts`)

- `removeUserFromTeam()` - Remove user from team
- `getTeamMembers()` - Get all team members
- `getTeamById()` - Get team with relations

### Invite Controller (`src/controllers/invite.controller.ts`) ⭐ **NEW**

- `sendInvite()` - Create and send invite
- `acceptInvite()` - Accept invite and add to team
- `rejectInvite()` - Reject invite
- `getTeamInvites()` - List invites by team
- `getInviteByCode()` - Get invite details

---

## 🔐 Security Features

### Login Requirements

- Commands requiring authentication check `requireLogin()`
- Auth guard prevents unauthorized access to team operations
- All member operations verify user is team member

### Validation

- Duplicate membership prevention
- Invite expiration validation
- Invite status validation
- Team member verification

### Error Handling

- User-friendly error messages
- Specific error codes for different failure scenarios
- Proper spinner feedback

---

## 🎨 CLI User Experience

### Spinner Feedback

- Loading indicators for async operations
- Success/failure notifications
- Progress tracking

### Interactive Prompts

- Auto-prompts for missing arguments
- Multiple input methods (options or prompts)
- Confirmation dialogs for destructive operations

### Formatted Output

- Color-coded messages (cyan, green, yellow, red)
- Organized table-like displays
- Dimmed secondary information
- Bold important details

---

## 📦 Dependencies

- `commander` - CLI framework
- `chalk` - Colored output
- `inquirer` - Interactive prompts
- `axios` - HTTP requests
- `uuid` - UUID generation ⭐ **NEW**
- `prisma` - ORM
- `ora` - Spinners

---

## 🔄 Database Migration

Migration `20260124174942_add_invite_model` has been created and applied:

- Creates `Invite` table with all relations
- Creates `InviteStatus` enum
- Sets up indexes for performance

---

## ✅ Testing & Validation

- TypeScript compilation: ✓ No errors
- All imports resolved: ✓
- Database migration applied: ✓
- Error handling tested: ✓

---

## 🚧 Next Steps (Optional)

1. Add invite notification system (email/webhooks)
2. Add team roles and permissions
3. Add invite token expiration cleanup job
4. Add team activity audit log
5. Add bulk member operations
6. Add webhook support for GitHub events
