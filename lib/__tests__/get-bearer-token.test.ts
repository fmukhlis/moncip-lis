/**
 * @jest-environment node
 */

import getBearerToken from "../get-bearer-token";

/**
 * `getBearerToken` is the only thing between an anonymous HTTP caller and the
 * HIS ingestion route, so its parsing rules are pinned exactly: a token that is
 * parsed out of a malformed header must never reach token verification.
 */
function requestWithAuthorization(authorization?: string) {
  return new Request("http://localhost/api/integration/his/lab-order", {
    headers: authorization === undefined ? undefined : { authorization },
  });
}

describe("getBearerToken", () => {
  it("returns null when the header is missing", () => {
    expect(getBearerToken(requestWithAuthorization())).toBeNull();
  });

  it.each([
    ["Basic dXNlcjpwYXNz"],
    ["Token abc123"],
    ["bearer abc123"],
    ["BEARER abc123"],
    ["Bearer"],
  ])("rejects the header %p", (authorization) => {
    expect(getBearerToken(requestWithAuthorization(authorization))).toBeNull();
  });

  it("returns the token that follows the Bearer scheme", () => {
    expect(getBearerToken(requestWithAuthorization("Bearer abc123"))).toBe(
      "abc123",
    );
  });

  it("accepts a real integration token", () => {
    const token = `moncip_his_${"a".repeat(64)}`;

    expect(getBearerToken(requestWithAuthorization(`Bearer ${token}`))).toBe(
      token,
    );
  });

  it("trims the whitespace a client added around the token", () => {
    expect(getBearerToken(requestWithAuthorization("Bearer   abc123  "))).toBe(
      "abc123",
    );
  });

  it("returns null when the scheme carries no token", () => {
    // `Headers` strips the trailing spaces, so "Bearer   " reaches us as
    // "Bearer" and is rejected as the wrong scheme rather than as an empty
    // token. Either way the route sees a falsy value and answers 401.
    expect(getBearerToken(requestWithAuthorization("Bearer   "))).toBeNull();
  });
});
