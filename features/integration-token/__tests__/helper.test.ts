import crypto from "crypto";
import {
  TOKEN_PREFIX_STORED_LENGTH,
  buildToken,
  buildTokenStatusFilter,
} from "../integration-token.helper";

/**
 * A bearer token is the whole of the HIS route's authentication: if the
 * plaintext, the stored hash or the stored prefix drift apart, every inbound
 * order is rejected (or, worse, a different token is accepted).
 */
describe("buildToken", () => {
  it("builds a namespaced token with a system slug and 256 bits of randomness", () => {
    expect(buildToken("HIS").plaintext).toMatch(/^moncip_his_[0-9a-f]{64}$/);
  });

  it("derives the slug from the source system", () => {
    expect(buildToken("his").plaintext).toMatch(/^moncip_his_/);
    // Non-alphanumeric characters are stripped, then the slug is cut to four.
    expect(buildToken("LIS Gateway").plaintext).toMatch(/^moncip_lisg_/);
    expect(buildToken("!!").plaintext).toMatch(/^moncip__/);
  });

  it("stores the sha-256 hash of the plaintext, never the plaintext", () => {
    const { plaintext, hash } = buildToken("HIS");

    expect(hash).toBe(
      crypto.createHash("sha256").update(plaintext).digest("hex"),
    );
    expect(hash).toHaveLength(64);
    expect(hash).not.toBe(plaintext);
  });

  it("stores the first characters of the plaintext as the lookup prefix", () => {
    const { plaintext, prefix } = buildToken("HIS");

    expect(prefix).toHaveLength(TOKEN_PREFIX_STORED_LENGTH);
    expect(prefix).toBe(plaintext.slice(0, TOKEN_PREFIX_STORED_LENGTH));
    // Wide enough to narrow the indexed lookup, narrow enough to leak little.
    expect(prefix).toBe(plaintext.slice(0, 16));
  });

  it("returns a different token every time it is called", () => {
    const first = buildToken("HIS");
    const second = buildToken("HIS");

    expect(first.plaintext).not.toBe(second.plaintext);
    expect(first.hash).not.toBe(second.hash);
    // The 16-character window covers `moncip_` + slug (11 chars here) plus the
    // first 5 random hex characters, so prefixes differ too — but each still
    // narrows the indexed lookup to a millionth of the token space.
    expect(first.prefix).not.toBe(second.prefix);
  });
});

describe("buildTokenStatusFilter", () => {
  it("selects tokens that are neither revoked nor expired", () => {
    const before = Date.now();
    const filter = buildTokenStatusFilter("ACTIVE") as {
      revokedAt: null;
      OR: [{ expiresAt: null }, { expiresAt: { gt: Date } }];
    };
    const after = Date.now();

    expect(filter.revokedAt).toBeNull();
    expect(filter.OR).toEqual([
      { expiresAt: null },
      { expiresAt: { gt: expect.any(Date) } },
    ]);

    const cutoff = filter.OR[1].expiresAt.gt;
    expect(cutoff.getTime()).toBeGreaterThanOrEqual(before);
    expect(cutoff.getTime()).toBeLessThanOrEqual(after);
  });

  it("selects revoked tokens", () => {
    expect(buildTokenStatusFilter("REVOKED")).toEqual({
      revokedAt: { not: null },
    });
  });

  it("selects unrevoked tokens whose expiry has passed", () => {
    const filter = buildTokenStatusFilter("EXPIRED");

    expect(filter.revokedAt).toBeNull();
    expect(filter).toEqual({
      revokedAt: null,
      expiresAt: { lte: expect.any(Date) },
    });
  });

  it("selects every token when the filter is ALL", () => {
    expect(buildTokenStatusFilter("ALL")).toEqual({});
  });
});
