/**
 * Guard for the three suites that talk to a real Postgres.
 *
 * Unit suites mock `@/lib/prisma`, so they run anywhere. The integration suites
 * create and delete real rows, and before this guard existed they would do it
 * against whatever `DATABASE_URL` happened to resolve to — which, on a shell
 * that exports the development URL, is the development database.
 *
 * `jest.config.ts` loads env through `nextJest`, i.e. `@next/env`, which skips
 * `.env.local` when `NODE_ENV === "test"` and never overrides a variable that is
 * already exported. The resolved value therefore cannot be inferred from the
 * file layout alone, so it is checked at runtime instead: the integration suites
 * refuse to start unless that value is the dedicated test database.
 *
 * Nothing here skips. A missing, unparsable, misdirected or unreachable database
 * throws, so `pnpm test` fails instead of reporting a green run for integration
 * tests that never executed.
 */
import prisma from "@/lib/prisma";

export const TEST_DATABASE_NAME = "moncip_lis_test";

const SETUP_HINT = [
  "The database integration tests only run against the dedicated test database:",
  `  .env.test.local: DATABASE_URL="postgresql://moncip_lis:moncip_lis@moncip-lis-db:5432/${TEST_DATABASE_NAME}?schema=public"`,
  "  docker compose -f compose.dev.yaml exec moncip-lis-db createdb -U moncip_lis moncip_lis_test",
  "  pnpm db:test:migrate",
  'Then run them with `pnpm test:db` (see README, "Running the tests").',
].join("\n");

let setupHintPrinted = false;

/**
 * Jest reports a failing `beforeAll` once per test in the block, so the full
 * instructions are printed once per suite and the repeats stay one line.
 */
function setupHint(): string {
  if (setupHintPrinted) return "";

  setupHintPrinted = true;

  return SETUP_HINT;
}

/**
 * Forget that the setup hint was already printed. Only the guard's own test
 * needs this, so it can assert on the instructions in more than one case.
 */
export function resetSetupHint(): void {
  setupHintPrinted = false;
}

/** Keeps a password out of test output when a connection string is echoed. */
function maskCredentials(value: string): string {
  return value.replace(/\/\/[^@/]*@/, "//***@");
}

function describeDatabase(url: URL): string {
  const databaseName = url.pathname.replace(/^\//, "") || "(none)";

  return `"${databaseName}" at ${url.host}`;
}

/**
 * Throws unless `DATABASE_URL` parses and names the dedicated test database.
 * Returns the parsed URL so callers do not have to parse it again.
 */
export function assertTestDatabaseUrl(): URL {
  const raw = process.env.DATABASE_URL;

  if (!raw) {
    throw new Error(
      `[test-database] DATABASE_URL is not set, so the database integration tests cannot run.\n${setupHint()}`,
    );
  }

  let url: URL;

  try {
    url = new URL(raw);
  } catch {
    throw new Error(
      `[test-database] DATABASE_URL is not a valid URL (${maskCredentials(raw)}), so the database integration tests cannot run. The value in .env is a placeholder template.\n${setupHint()}`,
    );
  }

  if (url.pathname.replace(/^\//, "") !== TEST_DATABASE_NAME) {
    throw new Error(
      `[test-database] Refusing to run the database integration tests against ${describeDatabase(url)}: they create and delete rows, so they may only run against "${TEST_DATABASE_NAME}".\n${setupHint()}`,
    );
  }

  return url;
}

/**
 * Throws unless `DATABASE_URL` names the dedicated test database, that database
 * answers a query, and it has the migrated schema. Call this from the
 * `beforeAll` of every suite that touches Postgres.
 */
export async function assertTestDatabaseReady(): Promise<void> {
  const url = assertTestDatabaseUrl();

  let laboratoryTable: string | null;

  try {
    const [row] = await prisma.$queryRaw<{ laboratory_table: string | null }[]>`
      SELECT to_regclass('public."Laboratory"')::text AS laboratory_table
    `;

    laboratoryTable = row?.laboratory_table ?? null;
  } catch (cause) {
    const reason = cause instanceof Error ? cause.message : String(cause);

    throw new Error(
      `[test-database] Cannot reach ${describeDatabase(url)}: ${maskCredentials(reason)}\n${setupHint()}`,
    );
  }

  if (!laboratoryTable) {
    throw new Error(
      `[test-database] ${describeDatabase(url)} is reachable but has no schema: the "Laboratory" table does not exist, so the database integration tests cannot run.\n${setupHint()}`,
    );
  }
}
