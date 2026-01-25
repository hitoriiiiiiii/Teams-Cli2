# Teams CLI - Quick Command Reference

## 🔐 Authentication
```bash
# Login with GitHub
teams login

# Check who you are
teams whoami

# Logout
teams logout
```

## 👥 Team Management
```bash
# Create a new team
teams team create MyAwesomeTeam

# List your teams
teams team list

# Get team details
teams team get -i 1

# Join a team
teams team join -i 5

# Leave a team
teams team leave -i 5
```

## 👫 Member Management

### Add Members
```bash
# Add a member to your team
teams member add -t 1 -u octocat

# Interactive mode (will prompt for team ID and username)
teams member add
```

### Remove Members
```bash
# Remove a member from team
teams member remove -t 1 -u octocat

# Interactive mode
teams member remove
```

### List Members
```bash
# List all members of a team
teams member list -t 1

# Interactive mode
teams member list
```

## 📨 Invite System

### Send Invites
```bash
# Send invite to join team
teams invite send -t 1 -u newuser

# Get the invite code from response, e.g., "ABC12345"
```

### Accept Invites
```bash
# Accept an invite to join a team
teams invite accept -c ABC12345

# User will be added to the team automatically
```

### List Pending Invites
```bash
# See all pending invites for a team
teams invite list -t 1
```

### Reject Invites
```bash
# Reject an invite
teams invite reject -c ABC12345
```

## 📦 Repository Management
```bash
# Add a repository to team
teams repo add MyTeam my-awesome-repo

# List team repositories
teams repo list MyTeam

# Remove a repository from team
teams repo remove MyTeam my-awesome-repo
```

## 📊 Analytics

### Member Activity
```bash
# Show activity status for all team members
teams analytics activity -t 1

# Shows: Active (7d), Warm (14d), Cold (30d), or Inactive
```

### Leaderboard
```bash
# Show top contributors in team
teams analytics leaderboard -t 1
```

### Member Analytics
```bash
# Get analytics for specific member
teams analytics member -t 1 -u octocat
```

### Team Summary
```bash
# Get team statistics
teams analytics summary -t 1
```

## 📝 Commits

### List Commits
```bash
# List commits for a repository
teams commits list owner/repo

# Filter by author
teams commits list owner/repo -a john
```

### Get Commit Details
```bash
# Get specific commit details
teams commits get owner/repo abc1234def567
```

## ⚙️ Configuration

### Set Config
```bash
teams config set -k key_name -v "value"
```

### Get Config
```bash
teams config get -k key_name
```

### List All Config
```bash
teams config list
```

## 🛠️ Utilities
```bash
# Initialize project
teams init

# Check CLI status
teams status

# Show help
teams help
```

---

## 💡 Common Workflows

### Invite New Team Member
```bash
# 1. Get your team ID (e.g., 1)
teams team list

# 2. Send invite to user
teams invite send -t 1 -u newuser

# 3. Copy the invite code from output (e.g., ABC12345)

# 4. Send invite code to the user

# 5. User accepts invite
teams invite accept -c ABC12345

# 6. Verify member joined
teams member list -t 1
```

### Remove Inactive Member
```bash
# 1. Check activity
teams analytics activity -t 1

# 2. Remove the user
teams member remove -t 1 -u inactive_user

# 3. Confirm removal when prompted
```

### Team Analysis
```bash
# Get overall team stats
teams analytics summary -t 1

# See who's most active
teams analytics leaderboard -t 1

# Check specific member
teams analytics member -t 1 -u john
```

---

## ❓ Help & Support

### Get help for any command
```bash
teams --help
teams team --help
teams member --help
teams invite --help
teams commits --help
teams analytics --help
```

### Show general help
```bash
teams help
```

