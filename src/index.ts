#!/usr/bin/env node
import 'dotenv/config';
import './cli/command';

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
  process.exit(1);
});
