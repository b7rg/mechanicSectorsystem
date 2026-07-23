export type AdministrationTitle =
  | "دعم ومساعدة"
  | "مشرف متدرب"
  | "مشرف"
  | "مشرف+"
  | "مشرف عام"
  | "أدمن"
  | "الإدارة العليا A+";

export type AdministrationCodePrefix =
  | "S"
  | "M"
  | "F"
  | "A"
  | "A+";

export type AdministrationRole = {
  title: AdministrationTitle;
  level: 2 | 3 | 4 | 5 | 6 | 7;
  prefix: AdministrationCodePrefix;
};

export const ADMINISTRATION_ROLES: AdministrationRole[] = [
  {
    title: "دعم ومساعدة",
    level: 2,
    prefix: "S",
  },
  {
    title: "مشرف متدرب",
    level: 3,
    prefix: "M",
  },
  {
    title: "مشرف",
    level: 4,
    prefix: "M",
  },
  {
    title: "مشرف+",
    level: 5,
    prefix: "M",
  },
  {
    title: "مشرف عام",
    level: 6,
    prefix: "F",
  },
  {
    title: "أدمن",
    level: 7,
    prefix: "A",
  },
  {
    title: "الإدارة العليا A+",
    level: 7,
    prefix: "A+",
  },
];

export function isAdministrationTitle(
  value: unknown
): value is AdministrationTitle {
  return ADMINISTRATION_ROLES.some(
    (role) => role.title === value
  );
}

export function getAdministrationRoleByTitle(
  title: AdministrationTitle
): AdministrationRole {
  return (
    ADMINISTRATION_ROLES.find(
      (role) => role.title === title
    ) ?? ADMINISTRATION_ROLES[0]
  );
}

export function getAdministrationRoleByLevel(
  level: number
): AdministrationRole | null {
  return (
    ADMINISTRATION_ROLES.find(
      (role) => role.level === level
    ) ?? null
  );
}
