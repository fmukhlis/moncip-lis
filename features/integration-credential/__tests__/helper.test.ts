import {
  CREDENTIAL_PREFIX_STORED_LENGTH,
  buildCredentialStatusFilter,
  decrypt,
  encrypt,
} from "../integration-credential.helper";

const KEY = "0123456789abcdef".repeat(4); // 64 hex chars = 32 bytes

/**
 * Integration credentials are API keys for third-party systems. They are
 * encrypted at rest with AES-256-GCM, so the tests pin both halves of that
 * promise: a secret survives a round trip, and a tampered secret does not.
 */
describe("encrypt / decrypt", () => {
  beforeEach(() => {
    process.env.ENCRYPTION_KEY = KEY;
  });

  afterAll(() => {
    delete process.env.ENCRYPTION_KEY;
  });

  it("round-trips a secret", () => {
    const secret = "sk_live_51H8xQ2eZvKYlo2C";

    const { encryptedSecret } = encrypt(secret);

    expect(encryptedSecret).not.toContain(secret);
    expect(decrypt(encryptedSecret)).toBe(secret);
  });

  it("round-trips a secret containing unicode", () => {
    const secret = "clé-🧪-密钥";

    expect(decrypt(encrypt(secret).encryptedSecret)).toBe(secret);
  });

  /**
   * TODO(credential-helper): an empty secret encrypts to `iv:tag:` and `decrypt`
   * treats the empty payload as malformed, so the round trip does not hold.
   * Harmless today (an empty API key is not usable), but `encrypt` should either
   * reject empty input or `decrypt` should accept an empty payload.
   */
  it("cannot round-trip an empty secret", () => {
    expect(() => decrypt(encrypt("").encryptedSecret)).toThrow(
      "Invalid ciphertext format",
    );
  });

  it("stores the iv, auth tag and ciphertext as hex", () => {
    const { encryptedSecret } = encrypt("secret");
    const [iv, tag, ciphertext] = encryptedSecret.split(":");

    expect(encryptedSecret.split(":")).toHaveLength(3);
    expect(iv).toMatch(/^[0-9a-f]{24}$/); // 12-byte iv
    expect(tag).toMatch(/^[0-9a-f]{32}$/); // 16-byte GCM tag
    expect(ciphertext).toMatch(/^[0-9a-f]+$/);
  });

  it("uses a fresh iv for every encryption", () => {
    const first = encrypt("secret");
    const second = encrypt("secret");

    expect(first.encryptedSecret).not.toBe(second.encryptedSecret);
    expect(decrypt(first.encryptedSecret)).toBe("secret");
    expect(decrypt(second.encryptedSecret)).toBe("secret");
  });

  it("keeps the first characters of the secret as a display prefix", () => {
    const secret = "sk_live_51H8xQ2eZvKYlo2C";

    expect(encrypt(secret).secretPrefix).toBe(
      secret.slice(0, CREDENTIAL_PREFIX_STORED_LENGTH),
    );
    expect(encrypt(secret).secretPrefix).toBe("sk_live_");
    // Short secrets are stored whole, but they are only ever shown as a prefix.
    expect(encrypt("abc").secretPrefix).toBe("abc");
  });

  it("rejects a secret whose ciphertext was tampered with", () => {
    const { encryptedSecret } = encrypt("secret");
    const [iv, tag, ciphertext] = encryptedSecret.split(":");
    const tampered = [iv, tag, `${ciphertext.slice(0, -2)}00`].join(":");

    expect(() => decrypt(tampered)).toThrow();
  });

  it("rejects a secret whose auth tag was tampered with", () => {
    const { encryptedSecret } = encrypt("secret");
    const [iv, tag, ciphertext] = encryptedSecret.split(":");
    const tampered = [iv, `${"0".repeat(32)}`, ciphertext].join(":");
    // The original tag is what the ciphertext is authenticated with, so a
    // replaced tag must not match it.
    expect(tampered.split(":")[1]).not.toBe(tag);

    expect(() => decrypt(tampered)).toThrow();
  });

  it.each([
    ["a single part", "deadbeef"],
    ["empty parts", "::"],
    ["two parts", "deadbeef:cafebabe"],
  ])("rejects a ciphertext made of %s", (_label, ciphertext) => {
    expect(() => decrypt(ciphertext)).toThrow("Invalid ciphertext format");
  });

  it("refuses to work without a key", () => {
    delete process.env.ENCRYPTION_KEY;

    expect(() => encrypt("secret")).toThrow("ENCRYPTION_KEY is not set");
  });

  it("refuses a key that is not 32 bytes", () => {
    process.env.ENCRYPTION_KEY = "abcd";

    expect(() => encrypt("secret")).toThrow(
      "ENCRYPTION_KEY must be 32 bytes (64 hex chars)",
    );
  });
});

describe("buildCredentialStatusFilter", () => {
  it("selects credentials that are neither revoked nor expired", () => {
    expect(buildCredentialStatusFilter("ACTIVE")).toEqual({
      revokedAt: null,
      OR: [{ expiresAt: null }, { expiresAt: { gt: expect.any(Date) } }],
    });
  });

  it("selects revoked credentials", () => {
    expect(buildCredentialStatusFilter("REVOKED")).toEqual({
      revokedAt: { not: null },
    });
  });

  it("selects unrevoked credentials whose expiry has passed", () => {
    expect(buildCredentialStatusFilter("EXPIRED")).toEqual({
      revokedAt: null,
      expiresAt: { lte: expect.any(Date) },
    });
  });

  it("selects every credential when the filter is ALL", () => {
    expect(buildCredentialStatusFilter("ALL")).toEqual({});
  });
});
