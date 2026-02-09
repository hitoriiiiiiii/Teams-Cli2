import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  clearMocks: true,
  coverageDirectory: 'coverage',
  testMatch: ['**/__test__/**/*.ts', '**/?(*.)+(test).ts'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.test.json',
      },
    ],
  },
  moduleNameMapper: {
    '^uuid$': '<rootDir>/__mocks__/uuid.js',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  // Setup for temporary SQLite databases during tests
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  // Use in-memory database for tests
  testEnvironmentOptions: {
    // Custom environment variables for tests
    DATABASE_URL: ':memory:',
  },
};

process.env.NODE_ENV = 'test';
process.env.TEAMS_CLI_MODE = 'true';

export default config;
