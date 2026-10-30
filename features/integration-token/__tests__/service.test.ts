import crypto from "crypto";
import {
  createIntegrationToken,
  getIntegrationToken,
  getIntegrationTokens,
  revokeIntegrationToken,
  verifyIntegrationToken,
} from "../integration-token.service";
import { integrationTokenDetailSelect } from "../integration-token.select";
import { TOKEN_PREFIX_STORED_LENGTH } from "../integration-token.helper";

type TokenClient = Parameters<typeof verifyIntegrationToken>[0];

const TEST_IDS = {
  tokenId: "tz4a98xxat96iws9zmbrgj3a",
  connectionId: "cx1a2b3c4d5e6f7g8h9i0jk",
  laboratoryId: "clx1a2b3c4d5e6f7g8h9i0jk",
  userId: "uz4a98xxat96iws9zmbrgj3a",
} as const;

/**
 * Builds the narrow Prisma surface these functions accept, so the assertions
 * can talk about the query we send instead of about a live database.
 */
function tokenClient() {
  const methods = {
    create: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn().mockResolvedValue([]),
    update: jest.fn().mockResolvedValue({}),
    count: jest.fn().mockResolvedValue(0),
  };

  return {
    methods,
    db: { integrationToken: methods } as unknown as TokenClient,
  };
}

function sha256(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

describe("createIntegrationToken", () => {
  it("persists the hash and prefix and returns the plaintext once", async () => {
    const { db, methods } = tokenClient();
    methods.create.mockResolvedValue({ id: TEST_IDS.tokenId });

    const { integrationToken, plaintext } = await createIntegrationToken(db, {
      name: "HIS nightly",
      connectionId: TEST_IDS.connectionId,
      laboratoryId: TEST_IDS.laboratoryId,
      sourceSystem: "HIS",
    });

    const [{ data, select }] = methods.create.mock.calls[0];

    expect(data.tokenHash).toBe(sha256(plaintext));
    expect(data.tokenPrefix).toBe(
      plaintext.slice(0, TOKEN_PREFIX_STORED_LENGTH),
    );
    expect(data.name).toBe("HIS nightly");
    expect(data.connectionId).toBe(TEST_IDS.connectionId);
    expect(data.laboratoryId).toBe(TEST_IDS.laboratoryId);
    // Omitted optional fields must be stored explicitly as null.
    expect(data.expiresAt).toBeNull();
    expect(data.createdByUserId).toBeNull();
    expect(select).toBe(integrationTokenDetailSelect);

    // The plaintext is the caller's only copy: nothing that reaches the
    // database may contain it.
    expect(JSON.stringify(data)).not.toContain(plaintext);
    expect(integrationToken).toEqual({ id: TEST_IDS.tokenId });
  });

  it("keeps an explicit expiry and creator", async () => {
    const { db, methods } = tokenClient();
    methods.create.mockResolvedValue({ id: TEST_IDS.tokenId });
    const expiresAt = new Date("2027-01-01T00:00:00.000Z");

    await createIntegrationToken(db, {
      name: "HIS nightly",
      expiresAt,
      connectionId: TEST_IDS.connectionId,
      laboratoryId: TEST_IDS.laboratoryId,
      sourceSystem: "HIS",
      createdByUserId: TEST_IDS.userId,
    });

    const [{ data }] = methods.create.mock.calls[0];

    expect(data.expiresAt).toBe(expiresAt);
    expect(data.createdByUserId).toBe(TEST_IDS.userId);
  });
});

describe("verifyIntegrationToken", () => {
  const plaintext = `moncip_his_${"b".repeat(64)}`;

  function verifiedToken(overrides: Record<string, unknown> = {}) {
    return {
      id: TEST_IDS.tokenId,
      laboratoryId: TEST_IDS.laboratoryId,
      connection: { id: TEST_IDS.connectionId, isActive: true },
      ...overrides,
    };
  }

  it("looks the token up by prefix, hash, revocation and expiry", async () => {
    const { db, methods } = tokenClient();
    methods.findFirst.mockResolvedValue(null);

    await verifyIntegrationToken(db, { plaintext });

    const [{ where, select }] = methods.findFirst.mock.calls[0];

    expect(where.tokenPrefix).toBe(
      plaintext.slice(0, TOKEN_PREFIX_STORED_LENGTH),
    );
    expect(where.tokenHash).toBe(sha256(plaintext));
    expect(where.revokedAt).toBeNull();
    expect(where.OR).toEqual([
      { expiresAt: null },
      { expiresAt: { gt: expect.any(Date) } },
    ]);
    expect(select).toBe(integrationTokenDetailSelect);
  });

  it("returns null for an unknown, revoked or expired token", async () => {
    const { db, methods } = tokenClient();
    methods.findFirst.mockResolvedValue(null);

    await expect(verifyIntegrationToken(db, { plaintext })).resolves.toBeNull();
    // Nothing to stamp when the token did not resolve.
    expect(methods.update).not.toHaveBeenCalled();
  });

  it("returns null when the token's connection is deactivated", async () => {
    const { db, methods } = tokenClient();
    methods.findFirst.mockResolvedValue(
      verifiedToken({
        connection: { id: TEST_IDS.connectionId, isActive: false },
      }),
    );

    await expect(verifyIntegrationToken(db, { plaintext })).resolves.toBeNull();
    expect(methods.update).not.toHaveBeenCalled();
  });

  it("returns the token and stamps lastUsedAt", async () => {
    const { db, methods } = tokenClient();
    const token = verifiedToken();
    methods.findFirst.mockResolvedValue(token);

    await expect(verifyIntegrationToken(db, { plaintext })).resolves.toBe(
      token,
    );
    expect(methods.update).toHaveBeenCalledWith({
      where: { id: TEST_IDS.tokenId },
      data: { lastUsedAt: expect.any(Date) },
    });
  });
});

describe("getIntegrationTokens", () => {
  it("returns no pagination when the caller did not ask for a page", async () => {
    const { db, methods } = tokenClient();
    methods.findMany.mockResolvedValue([{ id: TEST_IDS.tokenId }]);

    const [tokens, meta] = await getIntegrationTokens(db, {
      laboratoryId: TEST_IDS.laboratoryId,
      connectionId: TEST_IDS.connectionId,
      status: "ALL",
    });

    const [{ where, orderBy, skip, take }] = methods.findMany.mock.calls[0];

    expect(tokens).toEqual([{ id: TEST_IDS.tokenId }]);
    expect(meta).toBeNull();
    expect(where).toEqual({
      laboratoryId: TEST_IDS.laboratoryId,
      connectionId: TEST_IDS.connectionId,
    });
    expect(orderBy).toEqual({ createdAt: "desc" });
    expect(skip).toBeUndefined();
    expect(take).toBeUndefined();
    expect(methods.count).not.toHaveBeenCalled();
  });

  it("pages and counts when the caller asked for a page", async () => {
    const { db, methods } = tokenClient();
    methods.findMany.mockResolvedValue([{ id: TEST_IDS.tokenId }]);
    methods.count.mockResolvedValue(21);

    const [, meta] = await getIntegrationTokens(db, {
      laboratoryId: TEST_IDS.laboratoryId,
      connectionId: TEST_IDS.connectionId,
      status: "ALL",
      page: 2,
      pageSize: 20,
    });

    const [{ skip, take, where }] = methods.findMany.mock.calls[0];

    expect(skip).toBe(20);
    expect(take).toBe(20);
    expect(methods.count).toHaveBeenCalledWith({ where });
    expect(meta).toEqual({
      page: 2,
      pageSize: 20,
      total: 21,
      totalPages: 2,
      hasNextPage: false,
      hasPreviousPage: true,
    });
  });

  it("filters by a case-insensitive name search and by status", async () => {
    const { db, methods } = tokenClient();

    await getIntegrationTokens(db, {
      laboratoryId: TEST_IDS.laboratoryId,
      connectionId: TEST_IDS.connectionId,
      search: "nightly",
      status: "ACTIVE",
    });

    const [{ where }] = methods.findMany.mock.calls[0];

    expect(where.name).toEqual({ contains: "nightly", mode: "insensitive" });
    expect(where.revokedAt).toBeNull();
    expect(where.OR).toEqual([
      { expiresAt: null },
      { expiresAt: { gt: expect.any(Date) } },
    ]);
  });
});

describe("getIntegrationToken", () => {
  it("scopes the lookup to the caller's laboratory", async () => {
    const { db, methods } = tokenClient();
    methods.findFirst.mockResolvedValue({ id: TEST_IDS.tokenId });

    await getIntegrationToken(db, {
      id: TEST_IDS.tokenId,
      laboratoryId: TEST_IDS.laboratoryId,
    });

    expect(methods.findFirst).toHaveBeenCalledWith({
      where: { id: TEST_IDS.tokenId, laboratoryId: TEST_IDS.laboratoryId },
      select: integrationTokenDetailSelect,
    });
  });
});

describe("revokeIntegrationToken", () => {
  it("records who revoked the token and when", async () => {
    const { db, methods } = tokenClient();
    methods.update.mockResolvedValue({ id: TEST_IDS.tokenId });

    await revokeIntegrationToken(db, {
      id: TEST_IDS.tokenId,
      laboratoryId: TEST_IDS.laboratoryId,
      revokedByUserId: TEST_IDS.userId,
    });

    const [{ where, data, select }] = methods.update.mock.calls[0];

    expect(where).toEqual({
      id: TEST_IDS.tokenId,
      laboratoryId: TEST_IDS.laboratoryId,
    });
    expect(data.revokedAt).toEqual(expect.any(Date));
    expect(data.revokedByUserId).toBe(TEST_IDS.userId);
    expect(select).toBe(integrationTokenDetailSelect);
  });

  it("stores a null revoker when the actor is unknown", async () => {
    const { db, methods } = tokenClient();

    await revokeIntegrationToken(db, {
      id: TEST_IDS.tokenId,
      laboratoryId: TEST_IDS.laboratoryId,
    });

    const [{ data }] = methods.update.mock.calls[0];

    expect(data.revokedByUserId).toBeNull();
  });
});
