/**
 * Global setup for every suite.
 *
 * Database cleanup is the responsibility of each suite: it deletes exactly the
 * rows it created. A global cleanup here made every suite (including fully
 * mocked ones) require a live database and wipe the tables CI shares with
 * staging.
 */
import "@testing-library/jest-dom";

// Integration suites run against a real database that may sit behind a slow
// link: the HIS ingestion transaction alone issues a dozen sequential queries,
// which does not fit in Prisma's five-second default. Read by `lib/prisma.ts`.
process.env.PRISMA_TRANSACTION_MAX_WAIT_MS ??= "30000";
process.env.PRISMA_TRANSACTION_TIMEOUT_MS ??= "60000";
