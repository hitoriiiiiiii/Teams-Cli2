#!/bin/bash
# Teams CLI - NPM Publishing Quick Start Guide

echo "════════════════════════════════════════════════════════"
echo "   Teams CLI - NPM Publishing Quick Start"
echo "════════════════════════════════════════════════════════"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print steps
print_step() {
    echo -e "${BLUE}Step $1:${NC} $2"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

echo ""
print_step "1" "Update Your Information"
echo "Edit package.json with:"
echo "  - author: Your name and email"
echo "  - repository: Your GitHub repository URL"
echo "  - homepage: Your project homepage"
echo ""

echo "Edit these lines in package.json:"
echo -e "${YELLOW}\"author\": \"Your Name <your.email@example.com>\",${NC}"
echo -e "${YELLOW}\"repository\": { \"url\": \"https://github.com/yourusername/teams-cli.git\" },${NC}"
echo -e "${YELLOW}\"homepage\": \"https://github.com/yourusername/teams-cli\"${NC}"
echo ""

print_step "2" "Create NPM Account"
echo "Visit: https://www.npmjs.com/signup"
echo "Complete email verification"
echo ""

print_step "3" "Login to NPM"
echo "Run this command:"
echo -e "${BLUE}npm login${NC}"
echo ""
echo "Enter your credentials:"
echo "  - Username: your npm username"
echo "  - Password: your npm password"
echo "  - Email: your npm email"
echo ""

print_step "4" "Run Pre-Publish Checks"
echo "Verify everything is ready:"
echo -e "${BLUE}npm run precheck${NC}"
echo ""
echo "This checks:"
echo "  ✓ Package name format"
echo "  ✓ Version format (semantic versioning)"
echo "  ✓ Required fields present"
echo "  ✓ dist/ directory exists"
echo "  ✓ README and LICENSE files"
echo ""

print_step "5" "Update Version"
echo "Choose one:"
echo -e "${BLUE}npm run version:patch${NC}   # 1.0.0 → 1.0.1"
echo -e "${BLUE}npm run version:minor${NC}   # 1.0.0 → 1.1.0"
echo -e "${BLUE}npm run version:major${NC}   # 1.0.0 → 2.0.0"
echo ""

print_step "6" "Publish to NPM"
echo "Production release:"
echo -e "${BLUE}npm run pub${NC}"
echo ""
echo "OR"
echo ""
echo "Beta release:"
echo -e "${BLUE}npm run pub:beta${NC}"
echo ""

print_step "7" "Verify Publication"
echo "Check your package:"
echo -e "${BLUE}https://www.npmjs.com/package/teams-cli${NC}"
echo ""
echo "Install and test:"
echo -e "${BLUE}npm install -g teams-cli${NC}"
echo -e "${BLUE}teams --version${NC}"
echo ""

echo ""
echo "════════════════════════════════════════════════════════"
echo "              Publishing Complete! 🎉"
echo "════════════════════════════════════════════════════════"
echo ""
echo "Users can now install with:"
echo -e "${GREEN}npm install -g teams-cli${NC}"
echo ""
echo "For more info, see:"
echo "  - NPM_PUBLISHING_GUIDE.md"
echo "  - NPM_SETUP_SUMMARY.md"
echo ""
