/**
 * @jest-environment node
 */

import prisma from "@/lib/prisma";
import {
  assertTestDatabaseReady,
  assertTestDatabaseUrl,
  resetSetupHint,
  TEST_DATABASE_NAME,
} from "../test-database";

jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: { $queryRaw: jest.fn() },
}));

const queryRaw = prisma.$queryRaw as unknown as jest.Mock;

const TEST_DATABASE_URL = `postgresql://moncip_lis:moncip_lis@moncip-lis-db-test:5432/${TEST_DATABASE_NAME}?schema=public`;
const DEVELOPMENT_DATABASE_URL =
  "postgresql://moncip_lis:moncip_lis@moncip-lis-db:5432/moncip_lis?schema=public";
const PLACEHOLDER_DATABASE_URL =
  "postgresql://postgres_user:postgres_password@postgres_host:postgres_port/postgres_db?schema=postgres_schema";

const originalDatabaseUrl = process.env.DATABASE_URL;

function setDatabaseUrl(value: string | undefined) {
  if (value === undefined) delete process.env.DATABASE_URL;
  else process.env.DATABASE_URL = value;
}

beforeEach(() => {
  resetSetupHint();
});

describe("assertTestDatabaseUrl", () => {
  afterEach(() => {
    setDatabaseUrl(originalDatabaseUrl);
  });

  it("throws when DATABASE_URL is missing", () => {
    setDatabaseUrl(undefined);

    expect(() => assertTestDatabaseUrl()).toThrow(/DATABASE_URL is not set/);
  });

  it("throws on the placeholder template from .env without echoing its password", () => {
    setDatabaseUrl(PLACEHOLDER_DATABASE_URL);

    expect(() => assertTestDatabaseUrl()).toThrow(/is not a valid URL/);
    expect(() => assertTestDatabaseUrl()).not.toThrow(/postgres_password/);
  });

  it("throws when DATABASE_URL points at any database other than the test one", () => {
    setDatabaseUrl(DEVELOPMENT_DATABASE_URL);

    expect(() => assertTestDatabaseUrl()).toThrow(
      /Refusing to run the database integration tests against "moncip_lis" at moncip-lis-db:5432/,
    );
  });

  it("returns the parsed URL for the dedicated test database", () => {
    setDatabaseUrl(TEST_DATABASE_URL);

    const url = assertTestDatabaseUrl();

    expect(url.host).toBe("moncip-lis-db-test:5432");
    expect(url.pathname).toBe(`/${TEST_DATABASE_NAME}`);
  });
});

describe("assertTestDatabaseReady", () => {
  beforeEach(() => {
    setDatabaseUrl(TEST_DATABASE_URL);
  });

  afterEach(() => {
    setDatabaseUrl(originalDatabaseUrl);
  });

  it("resolves once the test database answers and has the migrated schema", async () => {
    queryRaw.mockResolvedValue([{ laboratory_table: "Laboratory" }]);

    await expect(assertTestDatabaseReady()).resolves.toBeUndefined();
    expect(queryRaw).toHaveBeenCalledTimes(1);
  });

  it("throws with setup instructions when the test database is unreachable", async () => {
    queryRaw.mockRejectedValue(
      new Error("Can't reach database server at `moncip-lis-db-test:5432`"),
    );

    const failure = await assertTestDatabaseReady().then(
      () => undefined,
      (error: unknown) => error as Error,
    );

    expect(failure).toBeInstanceOf(Error);
    expect((failure as Error).message).toMatch(
      /Cannot reach "moncip_lis_test" at moncip-lis-db-test:5432/,
    );
    expect((failure as Error).message).toMatch(/pnpm db:test:migrate/);
  });

  it("throws when the test database is reachable but not migrated", async () => {
    queryRaw.mockResolvedValue([{ laboratory_table: null }]);

    await expect(assertTestDatabaseReady()).rejects.toThrow(
      /is reachable but has no schema/,
    );
  });

  it("refuses to run against the development database without connecting", async () => {
    setDatabaseUrl(DEVELOPMENT_DATABASE_URL);

    await expect(assertTestDatabaseReady()).rejects.toThrow(/Refusing to run/);
    expect(queryRaw).not.toHaveBeenCalled();
  });
});
