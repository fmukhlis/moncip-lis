import { Role } from "@/generated/prisma";
import { PERMISSIONS, ROLE_PERMISSIONS } from "../authentication.constant";
import { authorize } from "../authentication.policy";

type User = Parameters<typeof authorize>[0];
type Permission = Parameters<typeof authorize>[1];

const ALL_PERMISSIONS = Object.values(PERMISSIONS) as Permission[];

function userWithRole(role: Role) {
  // `authorize` only reads `user.role`, so the rest of the session user is
  // irrelevant to the decision under test.
  return { role } as User;
}

describe("authorize", () => {
  it.each([
    [Role.STAFF, PERMISSIONS.SPECIMEN_CREATE],
    [Role.STAFF, PERMISSIONS.SPECIMEN_UPDATE],
    [Role.STAFF, PERMISSIONS.LAB_ORDER_UPDATE],
    [Role.LAB_ADMIN, PERMISSIONS.SPECIMEN_READ],
    [Role.LAB_ADMIN, PERMISSIONS.INBOUND_INTEGRATION_EVENT_READ],
    [Role.DOCTOR, PERMISSIONS.LAB_ORDER_CREATE],
    [Role.DOCTOR, PERMISSIONS.LAB_ORDER_UPDATE],
    [Role.SYS_ADMIN, PERMISSIONS.USER_DELETE],
    [Role.SYS_ADMIN, PERMISSIONS.INTEGRATION_TOKEN_ROTATE],
  ])("lets %s perform %s", (role, permission) => {
    expect(authorize(userWithRole(role), permission)).toBe(true);
  });

  it.each([
    [Role.STAFF, PERMISSIONS.LAB_ORDER_CREATE],
    [Role.STAFF, PERMISSIONS.USER_CREATE],
    [Role.STAFF, PERMISSIONS.INTEGRATION_TOKEN_CREATE],
    [Role.LAB_ADMIN, PERMISSIONS.SPECIMEN_CREATE],
    [Role.LAB_ADMIN, PERMISSIONS.SPECIMEN_UPDATE],
    [Role.LAB_ADMIN, PERMISSIONS.LAB_ORDER_UPDATE],
    [Role.DOCTOR, PERMISSIONS.SPECIMEN_CREATE],
    [Role.DOCTOR, PERMISSIONS.SPECIMEN_UPDATE],
    [Role.SYS_ADMIN, PERMISSIONS.SPECIMEN_CREATE],
    [Role.SYS_ADMIN, PERMISSIONS.SPECIMEN_UPDATE],
  ])("stops %s from %s", (role, permission) => {
    expect(authorize(userWithRole(role), permission)).toBe(false);
  });

  it("throws for a role that has no permission entry instead of denying", () => {
    // Known gap: `ROLE_PERMISSIONS[user.role]` is `undefined` for a role the
    // matrix does not know, so this raises a TypeError rather than returning
    // false. Pinned so the behaviour can only change deliberately.
    expect(() =>
      authorize(
        { role: "NURSE" } as unknown as User,
        PERMISSIONS.SPECIMEN_READ,
      ),
    ).toThrow(TypeError);
  });
});

describe("ROLE_PERMISSIONS", () => {
  it("has an entry for every role", () => {
    expect(Object.keys(ROLE_PERMISSIONS).sort()).toEqual(
      Object.values(Role).sort(),
    );
  });

  it("grants every declared permission to at least one role", () => {
    const ungranted = ALL_PERMISSIONS.filter(
      (permission) =>
        !Object.values(ROLE_PERMISSIONS).some((permissions) =>
          permissions.includes(permission),
        ),
    );

    expect(ungranted).toEqual([]);
  });

  it("contains no duplicate permission within a role", () => {
    for (const [role, permissions] of Object.entries(ROLE_PERMISSIONS)) {
      expect([role, permissions]).toEqual([role, [...new Set(permissions)]]);
    }
  });

  it("only grants permissions declared in PERMISSIONS", () => {
    const unknown = Object.values(ROLE_PERMISSIONS)
      .flat()
      .filter((permission) => !ALL_PERMISSIONS.includes(permission));

    expect(unknown).toEqual([]);
  });
});
