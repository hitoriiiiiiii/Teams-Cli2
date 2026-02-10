#!/usr/bin/env node

/**
 * Pre-publish Checklist
 * Validates the package before publishing to npm
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageJsonPath = path.join(__dirname, '..', 'package.json');

interface CheckResult {
  name: string;
  passed: boolean;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

const checks: CheckResult[] = [];

function addCheck(
  name: string,
  passed: boolean,
  message: string,
  severity: 'error' | 'warning' | 'info' = 'info',
) {
  checks.push({ name, passed, message, severity });
}

function printResults() {
  console.log(
    '\n' + chalk.bold.cyan('═══════════════════════════════════════'),
  );
  console.log(chalk.bold.cyan('   NPM Pre-Publish Checklist'));
  console.log(chalk.bold.cyan('═══════════════════════════════════════\n'));

  const errors = checks.filter((c) => c.severity === 'error' && !c.passed);
  const warnings = checks.filter((c) => c.severity === 'warning' && !c.passed);
  const infos = checks.filter((c) => c.severity === 'info');

  // Print errors
  if (errors.length > 0) {
    console.log(chalk.red.bold(`❌ Errors (${errors.length}):`));
    errors.forEach((check) => {
      console.log(`   ${chalk.red('✗')} ${check.name}: ${check.message}`);
    });
    console.log();
  }

  // Print warnings
  if (warnings.length > 0) {
    console.log(chalk.yellow.bold(`⚠️  Warnings (${warnings.length}):`));
    warnings.forEach((check) => {
      console.log(`   ${chalk.yellow('⚠')} ${check.name}: ${check.message}`);
    });
    console.log();
  }

  // Print passed checks
  const passed = checks.filter((c) => c.passed);
  console.log(chalk.green.bold(`✅ Passed (${passed.length}):`));
  passed.forEach((check) => {
    console.log(`   ${chalk.green('✓')} ${check.name}`);
  });

  console.log(
    '\n' + chalk.bold.cyan('═══════════════════════════════════════\n'),
  );

  if (errors.length > 0) {
    console.log(chalk.red.bold('❌ FAILED: Cannot publish with errors\n'));
    process.exit(1);
  } else if (warnings.length > 0) {
    console.log(
      chalk.yellow.bold('⚠️  WARNING: Review warnings before publishing\n'),
    );
  } else {
    console.log(chalk.green.bold('✅ Ready to publish!\n'));
    console.log(chalk.cyan('Next steps:'));
    console.log('  1. npm version patch|minor|major');
    console.log('  2. npm publish --access public\n');
  }
}

async function runChecks() {
  console.log(chalk.cyan('Running pre-publish checks...\n'));

  // Check if package.json exists
  if (!fs.existsSync(packageJsonPath)) {
    console.error(chalk.red('Error: package.json not found!'));
    process.exit(1);
  }

  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

  // Required fields
  addCheck(
    'Package name',
    !!pkg.name,
    'name: ' + (pkg.name || 'missing'),
    'error',
  );
  addCheck(
    'Package version',
    !!pkg.version,
    'version: ' + (pkg.version || 'missing'),
    'error',
  );
  addCheck('Description', !!pkg.description, 'description present', 'warning');
  addCheck(
    'License',
    !!pkg.license,
    'license: ' + (pkg.license || 'not specified'),
    'warning',
  );
  addCheck('Author', !!pkg.author, 'author specified', 'warning');

  // Repo and homepage
  addCheck(
    'Repository URL',
    !!pkg.repository?.url,
    'repository: ' + (pkg.repository?.url || 'not specified'),
    'warning',
  );
  addCheck(
    'Homepage URL',
    !!pkg.homepage,
    'homepage: ' + (pkg.homepage || 'not specified'),
    'warning',
  );

  // Keywords
  addCheck(
    'Keywords present',
    Array.isArray(pkg.keywords) && pkg.keywords.length > 0,
    `${pkg.keywords?.length || 0} keywords`,
    'warning',
  );

  // Entry points
  addCheck(
    'Main entry point',
    !!pkg.main,
    'main: ' + (pkg.main || 'not specified'),
    'error',
  );

  if (pkg.bin) {
    addCheck('Bin entry point', !!pkg.bin, `bin configured`, 'info');
  }

  // Version format
  const versionRegex = /^\d+\.\d+\.\d+/;
  addCheck(
    'Version format',
    versionRegex.test(pkg.version),
    'follows semantic versioning',
    'error',
  );

  // Package name format
  const nameRegex = /^(@[a-z0-9-]+\/)?[a-z0-9-]+$/;
  addCheck(
    'Package name format',
    nameRegex.test(pkg.name),
    'lowercase with hyphens only',
    'error',
  );

  // Files check
  const distExists = fs.existsSync(path.join(__dirname, 'dist'));
  addCheck(
    'dist/ directory exists',
    distExists,
    'compiled code present',
    'error',
  );

  // README check
  const readmeExists = fs.existsSync(path.join(__dirname, 'README.md'));
  addCheck(
    'README.md exists',
    readmeExists,
    'documentation present',
    'warning',
  );

  // LICENSE check
  const licenseExists = fs.existsSync(path.join(__dirname, 'LICENSE'));
  addCheck(
    'LICENSE file exists',
    licenseExists,
    'license file present',
    'warning',
  );

  // .npmignore check
  const npmignoreExists = fs.existsSync(path.join(__dirname, '.npmignore'));
  addCheck('.npmignore exists', npmignoreExists, 'configured properly', 'info');

  // package-lock.json check
  const lockExists = fs.existsSync(path.join(__dirname, 'package-lock.json'));
  addCheck(
    'package-lock.json exists',
    lockExists,
    'dependencies locked',
    'info',
  );

  // Scripts check
  addCheck(
    'Build script configured',
    !!pkg.scripts?.build,
    'npm run build available',
    'info',
  );

  if (pkg.scripts?.test) {
    addCheck('Test script configured', true, 'npm test available', 'info');
  }

  // Dependencies check
  const depCount = Object.keys(pkg.dependencies || {}).length;
  const devDepCount = Object.keys(pkg.devDependencies || {}).length;
  addCheck(
    'Dependencies',
    depCount > 0,
    `${depCount} production, ${devDepCount} dev dependencies`,
    'info',
  );

  // publishConfig check
  addCheck(
    'Publish config set',
    !!pkg.publishConfig?.access,
    `access: ${pkg.publishConfig?.access || 'not set'}`,
    'warning',
  );

  // Print results
  printResults();
}

runChecks().catch((error) => {
  console.error(chalk.red('Error running checks:'), error.message);
  process.exit(1);
});
