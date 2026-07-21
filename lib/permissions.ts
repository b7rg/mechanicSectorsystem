export const permissions = {
  owner: ["*"],

  leader: [
    "dashboard",
    "employees",
    "promotions",
    "courses",
    "certified",
    "agreement",
    "announcements",
    "rules",
    "violations",
    "calendar",
    "statistics",
    "map",
    "settings",
  ],

  supervisor: [
    "dashboard",
    "employees",
    "promotions",
    "courses",
    "certified",
    "agreement",
    "announcements",
    "violations",
    "calendar",
    "statistics",
    "map",
  ],

  visitor: [],
} as const;

export type UserRole =
  keyof typeof permissions;

export function hasPermission(
  role: string,
  permission: string
): boolean {
  const rolePermissions =
    permissions[
      role as UserRole
    ] as readonly string[] | undefined;

  if (!rolePermissions) {
    return false;
  }

  return (
    rolePermissions.includes("*") ||
    rolePermissions.includes(
      permission
    )
  );
}