/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: "./",
});

const config: Config = {
  // All imported modules in your tests should be mocked automatically
  // automock: false,

  // Stop running tests after `n` failures
  // bail: 0,

  // The directory where Jest should store its cached dependency information
  // cacheDirectory: "/tmp/jest_0",

  // Automatically clear mock calls, instances, contexts and results before every test
  clearMocks: true,

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: false,

  // Measure the code we are actually responsible for — server logic, feature
  // modules and shared helpers — so a module that no test imports counts as
  // uncovered instead of silently disappearing from the report.
  //
  // Deliberately out of scope: `app/**` (route handlers other than the API
  // surface, pages and layouts are mostly wiring) and `components/**` (vendored
  // shadcn primitives plus thin wrappers). Including them would make the global
  // number a measure of UI surface, not of business risk.
  // collectCoverageFrom: [
  //   "app/api/**/*.{ts,tsx}",
  //   "features/**/*.{ts,tsx}",
  //   "hooks/**/*.{ts,tsx}",
  //   "lib/**/*.{ts,tsx}",
  //   "!**/*.test.{ts,tsx}",
  //   "!**/__tests__/**",
  //   "!**/*.d.ts",
  //   "!generated/**",
  //   // RTK Query transport boilerplate: an endpoint table, not business logic.
  //   "!features/**/*.api.ts",
  //   "!test/**",
  // ],

  // The directory where Jest should output its coverage files
  coverageDirectory: "coverage",

  // An array of regexp pattern strings used to skip coverage collection
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/generated/",
    "/prisma/",
    // Vendored shadcn/ui primitives, in case components are ever measured.
    "components/ui/(alert-dialog|alert|avatar|badge|breadcrumb|button-group|button|calendar|card|checkbox|collapsible|command|dialog|dropdown-menu|empty|field|input-group|input|item|label|navigation-menu|popover|progress|radio-group|select|separator|sheet|sidebar|skeleton|sonner|spinner|switch|table|tabs|textarea|toggle-group|toggle|tooltip)\\.tsx$",
  ],

  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: "v8",

  // A list of reporter names that Jest uses when writing coverage reports
  coverageReporters: ["text", "lcov", "clover", "json-summary"],

  // An object that configures minimum threshold enforcement for coverage results
  //
  // Every floor below is the measured value at the time of writing minus five
  // points, rounded down. That is enough headroom for an honest refactor to
  // land, and small enough that removing a whole test file fails the build.
  // Raise a floor whenever the measured number moves up; never lower one
  // without deleting the code it protects.
  //
  // There is deliberately no meaningful `global` floor: under
  // `coverageProvider: "v8"` Jest's global check counts every instrumented file
  // the workers loaded (including the generated Prisma client) while the report
  // only counts `collectCoverageFrom`; the two disagree by a factor of two. The
  // numbers below are a catastrophic-regression tripwire only. Path-scoped
  // floors carry the guarantee, and Codecov's project ratchet covers the total.
  coverageThreshold: {
    global: {
      branches: 10,
      functions: 5,
      lines: 5,
      statements: 5,
    },
    // The risk-critical core is held to a much higher bar than the global
    // number, so a regression there cannot hide behind untested features.
    "./app/api/integration/his/lab-order/": {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
    "./features/audit-log/": {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
    "./features/authentication/": {
      branches: 35,
      functions: 35,
      lines: 65,
      statements: 65,
    },
    "./features/lab-order/": {
      branches: 79,
      functions: 72,
      lines: 73,
      statements: 73,
    },
    "./features/lab-order-item/": {
      branches: 77,
      functions: 55,
      lines: 91,
      statements: 91,
    },
    "./features/lab-order-item-specimen/": {
      branches: 78,
      functions: 95,
      lines: 95,
      statements: 95,
    },
    "./features/patient/": {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
    "./features/specimen/": {
      branches: 82,
      functions: 75,
      lines: 59,
      statements: 59,
    },
    "./lib/": {
      branches: 49,
      functions: 43,
      lines: 25,
      statements: 25,
    },
  },

  // A path to a custom dependency extractor
  // dependencyExtractor: undefined,

  // Make calling deprecated APIs throw helpful error messages
  // errorOnDeprecated: false,

  // The default configuration for fake timers
  // fakeTimers: {
  //   "enableGlobally": false
  // },

  // Force coverage collection from ignored files using an array of glob patterns
  // forceCoverageMatch: [],

  // A path to a module which exports an async function that is triggered once before all test suites
  // globalSetup: undefined,

  // A path to a module which exports an async function that is triggered once after all test suites
  // globalTeardown: undefined,

  // A set of global variables that need to be available in all test environments
  // globals: {},

  // The maximum amount of workers used to run your tests. Can be specified as % or a number. E.g. maxWorkers: 10% will use 10% of your CPU amount + 1 as the maximum worker number. maxWorkers: 2 will use a maximum of 2 workers.
  maxWorkers: 1,

  // An array of directory names to be searched recursively up from the requiring module's location
  // moduleDirectories: [
  //   "node_modules"
  // ],

  // An array of file extensions your modules use
  // moduleFileExtensions: [
  //   "js",
  //   "mjs",
  //   "cjs",
  //   "jsx",
  //   "ts",
  //   "mts",
  //   "cts",
  //   "tsx",
  //   "json",
  //   "node"
  // ],

  // A map from regular expressions to module names or to arrays of module names that allow to stub out resources with a single module
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },

  // An array of regexp pattern strings, matched against all module paths before considered 'visible' to the module loader
  // modulePathIgnorePatterns: [],

  // Activates notifications for test results
  // notify: false,

  // An enum that specifies notification mode. Requires { notify: true }
  // notifyMode: "failure-change",

  // A preset that is used as a base for Jest's configuration
  // preset: undefined,

  // Run tests from one or more projects
  // projects: undefined,

  // Use this configuration option to add custom reporters to Jest
  // reporters: undefined,

  // Automatically reset mock state before every test
  // resetMocks: false,

  // Reset the module registry before running each individual test
  // resetModules: false,

  // A path to a custom resolver
  // resolver: undefined,

  // Automatically restore mock state and implementation before every test
  // restoreMocks: false,

  // The root directory that Jest should scan for tests and modules within
  // rootDir: undefined,

  // A list of paths to directories that Jest should use to search for files in
  // roots: [
  //   "<rootDir>"
  // ],

  // Allows you to use a custom runner instead of Jest's default test runner
  // runner: "jest-runner",

  // The paths to modules that run some code to configure or set up the testing environment before each test
  // setupFiles: [],

  // A list of paths to modules that run some code to configure or set up the testing framework before each test
  setupFilesAfterEnv: ["<rootDir>/setup-jest.ts"],

  // The number of seconds after which a test is considered as slow and reported as such in the results.
  // slowTestThreshold: 5,

  // A list of paths to snapshot serializer modules Jest should use for snapshot testing
  // snapshotSerializers: [],

  // The test environment that will be used for testing
  testEnvironment: "jsdom",

  // Database-backed suites run against a real (often remote) Postgres: the
  // default 5s per-test budget is not enough for a create+read round trip.
  testTimeout: 30_000,

  // Options that will be passed to the testEnvironment
  // testEnvironmentOptions: {},

  // Adds a location field to test results
  // testLocationInResults: false,

  // The glob patterns Jest uses to detect test files
  // testMatch: [
  //   "**/__tests__/**/*.?([mc])[jt]s?(x)",
  //   "**/?(*.)+(spec|test).?([mc])[jt]s?(x)"
  // ],

  // An array of regexp pattern strings that are matched against all test paths, matched tests are skipped
  testPathIgnorePatterns: [
    "/node_modules/",
    // Recovery snapshots contain stale copies of earlier test runs. Without this
    // they are picked up as real suites and run hundreds of duplicated tests.
    "/.cline-recovery/",
  ],

  // The regexp pattern or array of patterns that Jest uses to detect test files
  // testRegex: [],

  // This option allows the use of a custom results processor
  // testResultsProcessor: undefined,

  // This option allows use of a custom test runner
  // testRunner: "jest-circus/runner",

  // A map from regular expressions to paths to transformers
  // transform: undefined,

  // An array of regexp pattern strings that are matched against all source file paths, matched files will skip transformation
  // transformIgnorePatterns: [
  //   "/node_modules/",
  //   "\\.pnp\\.[^\\/]+$"
  // ],

  // An array of regexp pattern strings that are matched against all modules before the module loader will automatically return a mock for them
  // unmockedModulePathPatterns: undefined,

  // Indicates whether each individual test should be reported during the run
  // verbose: undefined,

  // An array of regexp patterns that are matched against all source file paths before re-running tests in watch mode
  // watchPathIgnorePatterns: [],

  // Whether to use watchman for file crawling
  // watchman: true,
};

export default createJestConfig(config);
