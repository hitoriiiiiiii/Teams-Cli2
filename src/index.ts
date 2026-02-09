#!/usr/bin/env node
import 'dotenv/config';
import './cli/command';

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
  process.exit(1);
});

process.env.TEAMS_CLI_MODE = "true";

