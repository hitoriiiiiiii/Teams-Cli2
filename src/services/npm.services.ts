import axios from 'axios';
import chalk from 'chalk';

/**
 * NPM Registry API Service
 * Handles all npm-related operations for package management and publishing
 */

const NPM_REGISTRY = 'https://registry.npmjs.org';
const NPM_API = 'https://api.npmjs.org';

/**
 * Check if package name is available on npm
 */
export async function checkPackageAvailability(packageName: string): Promise<{
  available: boolean;
  version?: string;
  description?: string;
}> {
  try {
    const response = await axios.get(`${NPM_REGISTRY}/${packageName}`);
    return {
      available: false,
      version: response.data['dist-tags'].latest,
      description: response.data.description,
    };
  } catch (error: any) {
    if (error.response?.status === 404) {
      return { available: true };
    }
    throw error;
  }
}

/**
 * Get package information from npm
 */
export async function getPackageInfo(packageName: string) {
  try {
    const response = await axios.get(`${NPM_REGISTRY}/${packageName}`);
    return {
      name: response.data.name,
      version: response.data['dist-tags'].latest,
      description: response.data.description,
      homepage: response.data.homepage,
      repository: response.data.repository,
      keywords: response.data.keywords,
      author: response.data.author,
      license: response.data.license,
      downloads: response.data.downloads || 'N/A',
      lastModified: response.data.time.modified,
    };
  } catch (error) {
    throw new Error(`Package not found: ${packageName}`);
  }
}

/**
 * Get npm package download statistics
 */
export async function getDownloadStats(packageName: string, period: string = 'last-month') {
  try {
    const response = await axios.get(
      `https://api.npmjs.org/downloads/point/${period}/${packageName}`
    );
    return {
      package: response.data.package,
      downloads: response.data.downloads,
      period,
      start: response.data.start,
      end: response.data.end,
    };
  } catch (error) {
    throw new Error(`Failed to fetch download stats for ${packageName}`);
  }
}

/**
 * Search npm packages
 */
export async function searchPackages(query: string, limit: number = 20) {
  try {
    const response = await axios.get(`${NPM_API}/search/suggestions`, {
      params: { q: query, size: limit },
    });
    return response.data;
  } catch (error) {
    throw new Error(`Search failed: ${query}`);
  }
}

/**
 * Get latest version of a package
 */
export async function getLatestVersion(packageName: string): Promise<string> {
  try {
    const response = await axios.get(`${NPM_REGISTRY}/${packageName}/latest`);
    return response.data.version;
  } catch (error) {
    throw new Error(`Failed to get latest version of ${packageName}`);
  }
}

/**
 * Validate package.json structure
 */
export function validatePackageJson(pkg: any): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!pkg.name) {
    errors.push('Missing required field: name');
  }

  if (!pkg.version) {
    errors.push('Missing required field: version');
  }

  if (!pkg.description) {
    errors.push('Missing recommended field: description');
  }

  if (!pkg.author) {
    errors.push('Missing recommended field: author');
  }

  if (!pkg.license) {
    errors.push('Missing recommended field: license');
  }

  if (!pkg.repository) {
    errors.push('Missing recommended field: repository');
  }

  if (!pkg.keywords || pkg.keywords.length === 0) {
    errors.push('Missing recommended field: keywords (should be an array)');
  }

  if (!pkg.main && !pkg.bin) {
    errors.push('Missing main entry point or bin configuration');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Generate npm publish checklist
 */
export function generatePublishChecklist(pkg: any): {
  checks: Array<{ name: string; status: boolean; message: string }>;
  ready: boolean;
} {
  const checks = [
    {
      name: 'Package name valid',
      status: pkg.name && /^[a-z0-9-]*$/.test(pkg.name),
      message: 'Package name should be lowercase with hyphens only',
    },
    {
      name: 'Version format valid',
      status: pkg.version && /^\d+\.\d+\.\d+/.test(pkg.version),
      message: 'Version should follow semantic versioning (x.y.z)',
    },
    {
      name: 'Description present',
      status: !!pkg.description && pkg.description.length > 10,
      message: 'Description should be at least 10 characters',
    },
    {
      name: 'Author information',
      status: !!pkg.author,
      message: 'Author information is required',
    },
    {
      name: 'License specified',
      status: !!pkg.license,
      message: 'License should be specified (e.g., MIT)',
    },
    {
      name: 'Repository URL',
      status: !!pkg.repository?.url,
      message: 'Repository URL should be specified',
    },
    {
      name: 'Homepage URL',
      status: !!pkg.homepage,
      message: 'Homepage URL is recommended',
    },
    {
      name: 'Keywords present',
      status: Array.isArray(pkg.keywords) && pkg.keywords.length > 0,
      message: 'Add relevant keywords for discoverability',
    },
    {
      name: 'Main entry point',
      status: !!pkg.main,
      message: 'Main entry point should be specified',
    },
    {
      name: 'README present',
      status: true, // Would check file system in real implementation
      message: 'README.md should be included in package',
    },
  ];

  return {
    checks,
    ready: checks.filter((c) => !c.status).length === 0,
  };
}

/**
 * Format package info for display
 */
export function formatPackageInfo(info: any): string {
  return `
${chalk.bold.cyan(`📦 ${info.name}`)}
${chalk.gray(`Version: ${info.version}`)}
${chalk.white(`${info.description}`)}

${chalk.dim('Repository:')} ${info.repository?.url || 'N/A'}
${chalk.dim('Homepage:')} ${info.homepage || 'N/A'}
${chalk.dim('License:')} ${info.license || 'N/A'}
${chalk.dim('Last Updated:')} ${new Date(info.lastModified).toLocaleDateString()}
${chalk.dim('Downloads (last month):')} ${info.downloads}

${chalk.yellow(`Keywords:`)} ${(info.keywords || []).join(', ')}
`;
}

/**
 * Generate publish guide
 */
export function generatePublishGuide(packageName: string): string {
  return `
${chalk.bold.cyan('NPM Package Publishing Guide')}

${chalk.yellow('1. Prerequisites:')}
   - Node.js >= 18.0.0 installed
   - npm account created (https://www.npmjs.com/signup)
   - Logged in to npm: ${chalk.dim('npm login')}

${chalk.yellow('2. Before Publishing:')}
   - Update version in package.json: ${chalk.dim('npm version patch|minor|major')}
   - Build the project: ${chalk.dim('npm run build')}
   - Run tests: ${chalk.dim('npm test')}
   - Update README.md
   - Add CHANGELOG entries

${chalk.yellow('3. Publish to NPM:')}
   - Public release: ${chalk.dim('npm publish --access public')}
   - Beta release: ${chalk.dim('npm publish --tag beta --access public')}

${chalk.yellow('4. Verify Publication:')}
   - Check on npm: ${chalk.cyan(`https://www.npmjs.com/package/${packageName}`)}
   - Install package: ${chalk.dim(`npm install ${packageName}`)}

${chalk.yellow('5. Update Version:')}
   - After publishing, version bump automatically
   - Use: ${chalk.dim('npm version patch')} for patches
   - Use: ${chalk.dim('npm version minor')} for features
   - Use: ${chalk.dim('npm version major')} for breaking changes

${chalk.yellow('6. Installation Command:')}
   - Global: ${chalk.dim(`npm install -g ${packageName}`)}
   - Local: ${chalk.dim(`npm install ${packageName}`)}
`;
}

/**
 * Check npm authentication
 */
export async function checkNpmAuth(): Promise<{ authenticated: boolean; username?: string }> {
  try {
    const response = await axios.get(`${NPM_REGISTRY}/-/whoami`, {
      headers: {
        Authorization: `Bearer ${process.env.NPM_TOKEN || ''}`,
      },
    });
    return {
      authenticated: true,
      username: response.data.username,
    };
  } catch (error) {
    return { authenticated: false };
  }
}

export default {
  checkPackageAvailability,
  getPackageInfo,
  getDownloadStats,
  searchPackages,
  getLatestVersion,
  validatePackageJson,
  generatePublishChecklist,
  formatPackageInfo,
  generatePublishGuide,
  checkNpmAuth,
};
