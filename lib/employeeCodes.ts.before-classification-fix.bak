"use client";

import {
  getAdministrationRoleByLevel,
  getAdministrationRoleByTitle,
  isAdministrationTitle,
  type AdministrationTitle,
} from "@/lib/administration";

export type EmployeeType =
  | "main"
  | "leader"
  | "certified"
  | "certified_leader"
  | "administration";

export type EmployeeStatus =
  | "active"
  | "leave"
  | "suspended";

export type LevelNumber =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10;

export type CodePrefix =
  | "G"
  | "C"
  | "CA"
  | "S"
  | "M"
  | "F"
  | "A";

export type EmployeeRecord = {
  id: string;
  name: string;
  discordId: string;
  employeeType: EmployeeType;
  codePrefix: CodePrefix;
  codeNumber: number;
  fullCode: string;
  rank: string;
  level: LevelNumber;
  mainSector: string;
  administrationTitle?: AdministrationTitle;
  status: EmployeeStatus;
  certified: boolean;
  certifiedLeader: boolean;
  isLeader: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type LevelRange = {
  level: LevelNumber;
  from: number;
  to: number;
  label: string;
};

/*
  الموظف الأساسي G
*/
export const MAIN_LEVEL_RANGES: LevelRange[] = [
  { level: 1, from: 310, to: 271, label: "المستوى الأول" },
  { level: 2, from: 260, to: 221, label: "المستوى الثاني" },
  { level: 3, from: 205, to: 166, label: "المستوى الثالث" },
  { level: 4, from: 165, to: 126, label: "المستوى الرابع" },
  { level: 5, from: 125, to: 96, label: "المستوى الخامس" },
  { level: 6, from: 99, to: 70, label: "المستوى السادس" },
  { level: 7, from: 80, to: 51, label: "المستوى السابع" },
  { level: 8, from: 45, to: 26, label: "المستوى الثامن" },
];

/*
  القيادة الأساسية G
*/
export const LEADER_LEVEL_RANGES: LevelRange[] = [
  { level: 9, from: 10, to: 6, label: "المستوى التاسع" },
  { level: 10, from: 5, to: 1, label: "المستوى العاشر" },
];

/*
  اللاعب المعتمد C
*/
export const CERTIFIED_LEVEL_RANGES: LevelRange[] = [
  { level: 1, from: 290, to: 251, label: "المستوى الأول" },
  { level: 2, from: 250, to: 211, label: "المستوى الثاني" },
  { level: 3, from: 210, to: 171, label: "المستوى الثالث" },
  { level: 4, from: 170, to: 131, label: "المستوى الرابع" },
  { level: 5, from: 130, to: 101, label: "المستوى الخامس" },
  { level: 6, from: 100, to: 71, label: "المستوى السادس" },
  { level: 7, from: 70, to: 41, label: "المستوى السابع" },
  { level: 8, from: 40, to: 21, label: "المستوى الثامن" },
  { level: 9, from: 20, to: 11, label: "المستوى التاسع" },
  { level: 10, from: 10, to: 1, label: "المستوى العاشر" },
];

/*
  قيادة المعتمد CA
*/
export const CERTIFIED_LEADER_LEVEL_RANGES: LevelRange[] = [
  { level: 1, from: 205, to: 205, label: "المستوى الأول" },
  { level: 2, from: 204, to: 204, label: "المستوى الثاني" },
  { level: 3, from: 203, to: 203, label: "المستوى الثالث" },
  { level: 4, from: 202, to: 202, label: "المستوى الرابع" },
  { level: 5, from: 201, to: 201, label: "المستوى الخامس" },
  { level: 6, from: 200, to: 141, label: "المستوى السادس" },
  { level: 7, from: 140, to: 91, label: "المستوى السابع" },
  { level: 8, from: 90, to: 51, label: "المستوى الثامن" },
  { level: 9, from: 50, to: 21, label: "المستوى التاسع" },
  { level: 10, from: 20, to: 1, label: "المستوى العاشر" },
];

/*
  الإدارة:
  دعم ومساعدة = S = المستوى 2
  مشرف متدرب / مشرف / مشرف+ = M = المستويات 3-5
  مشرف عام = F = المستوى 6
  أدمن = A = المستوى 7

  رموز M تستخدم تسلسلاً واحدًا مشتركًا بين مستويات 3 و4 و5.
*/
export const ADMINISTRATION_LEVEL_RANGES: LevelRange[] = [
  { level: 2, from: 999, to: 1, label: "المستوى الثاني" },
  { level: 3, from: 999, to: 1, label: "المستوى الثالث" },
  { level: 4, from: 999, to: 1, label: "المستوى الرابع" },
  { level: 5, from: 999, to: 1, label: "المستوى الخامس" },
  { level: 6, from: 999, to: 1, label: "المستوى السادس" },
  { level: 7, from: 999, to: 1, label: "المستوى السابع" },
];

/* للتوافق مع الملفات القديمة */
export const LEVEL_RANGES: LevelRange[] = [
  ...MAIN_LEVEL_RANGES,
  ...LEADER_LEVEL_RANGES,
];

export const LEVEL_NUMBERS: LevelNumber[] = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
];

export const MAIN_LEVEL_NUMBERS: LevelNumber[] = [
  1, 2, 3, 4, 5, 6, 7, 8,
];

export const LEADER_LEVEL_NUMBERS: LevelNumber[] = [
  9, 10,
];

export const ADMINISTRATION_LEVEL_NUMBERS: LevelNumber[] = [
  2, 3, 4, 5, 6, 7,
];

/* اسم بديل للتوافق مع الاستيرادات القديمة */
export const LEADERSHIP_LEVEL_NUMBERS =
  LEADER_LEVEL_NUMBERS;

export const EMPLOYEE_TYPE_LABELS: Record<
  EmployeeType,
  string
> = {
  main: "موظف أساسي",
  leader: "قيادة",
  certified: "لاعب معتمد",
  certified_leader: "قيادة معتمدة",
  administration: "الإدارة",
};

export const STATUS_LABELS: Record<
  EmployeeStatus,
  string
> = {
  active: "على رأس العمل",
  leave: "إجازة",
  suspended: "موقوف",
};

export function getLevelsForEmployeeType(
  employeeType: EmployeeType
): LevelNumber[] {
  if (employeeType === "main") {
    return MAIN_LEVEL_NUMBERS;
  }

  if (employeeType === "leader") {
    return LEADER_LEVEL_NUMBERS;
  }

  if (employeeType === "administration") {
    return ADMINISTRATION_LEVEL_NUMBERS;
  }

  return LEVEL_NUMBERS;
}

export function getAdministrationPrefixForLevel(
  level: LevelNumber
): CodePrefix {
  if (level === 2) {
    return "S";
  }

  if (
    level === 3 ||
    level === 4 ||
    level === 5
  ) {
    return "M";
  }

  if (level === 6) {
    return "F";
  }

  return "A";
}

export function getPrefixForEmployeeType(
  employeeType: EmployeeType,
  administrationTitle?: AdministrationTitle
): CodePrefix {
  if (
    employeeType === "main" ||
    employeeType === "leader"
  ) {
    return "G";
  }

  if (employeeType === "certified_leader") {
    return "CA";
  }

  if (employeeType === "administration") {
    if (
      administrationTitle &&
      isAdministrationTitle(administrationTitle)
    ) {
      return getAdministrationRoleByTitle(
        administrationTitle
      ).prefix;
    }

    return "S";
  }

  return "C";
}

export function formatEmployeeCode(
  prefix: CodePrefix,
  codeNumber: number
): string {
  if (prefix === "CA") {
    return `CA-${codeNumber}`;
  }

  return `${prefix}-${String(codeNumber).padStart(
    3,
    "0"
  )}`;
}

function createDescendingNumbers(
  from: number,
  to: number
): number[] {
  const result: number[] = [];

  for (
    let current = from;
    current >= to;
    current -= 1
  ) {
    result.push(current);
  }

  return result;
}

export function getLevelRange(
  level: LevelNumber
): LevelRange {
  return (
    LEVEL_RANGES.find(
      (item) => item.level === level
    ) ?? LEVEL_RANGES[0]
  );
}

export function getLevelRangeForEmployeeType(
  employeeType: EmployeeType,
  level: LevelNumber
): LevelRange | undefined {
  if (employeeType === "main") {
    return MAIN_LEVEL_RANGES.find(
      (item) => item.level === level
    );
  }

  if (employeeType === "leader") {
    return LEADER_LEVEL_RANGES.find(
      (item) => item.level === level
    );
  }

  if (employeeType === "certified") {
    return CERTIFIED_LEVEL_RANGES.find(
      (item) => item.level === level
    );
  }

  if (employeeType === "administration") {
    return ADMINISTRATION_LEVEL_RANGES.find(
      (item) => item.level === level
    );
  }

  return CERTIFIED_LEADER_LEVEL_RANGES.find(
    (item) => item.level === level
  );
}

export function getCodesForLevel(
  employeeType: EmployeeType,
  level: LevelNumber
): string[] {
  const range =
    getLevelRangeForEmployeeType(
      employeeType,
      level
    );

  if (!range) {
    return [];
  }

  const prefix =
    employeeType === "administration"
      ? getAdministrationPrefixForLevel(
          level
        )
      : getPrefixForEmployeeType(
          employeeType
        );

  return createDescendingNumbers(
    range.from,
    range.to
  ).map((number) =>
    formatEmployeeCode(prefix, number)
  );
}

export function getLevelCapacity(
  employeeType: EmployeeType,
  level: LevelNumber
): number {
  const range =
    getLevelRangeForEmployeeType(
      employeeType,
      level
    );

  if (!range) {
    return 0;
  }

  return Math.abs(
    range.from - range.to
  ) + 1;
}

export function getTotalCapacity(
  employeeType: EmployeeType
): number {
  return getLevelsForEmployeeType(
    employeeType
  ).reduce(
    (total, level) =>
      total +
      getLevelCapacity(
        employeeType,
        level
      ),
    0
  );
}

export function parseEmployeeCode(
  value: string
): {
  prefix: CodePrefix;
  codeNumber: number;
} {
  const cleanValue =
    value.trim().toUpperCase();

  const [rawPrefix, rawNumber] =
    cleanValue.split("-");

  const allowedPrefixes: CodePrefix[] = [
    "G",
    "C",
    "CA",
    "S",
    "M",
    "F",
    "A",
  ];

  const prefix: CodePrefix =
    allowedPrefixes.includes(
      rawPrefix as CodePrefix
    )
      ? (rawPrefix as CodePrefix)
      : "G";

  const codeNumber = Number.parseInt(
    rawNumber ?? "0",
    10
  );

  return {
    prefix,
    codeNumber:
      Number.isFinite(codeNumber)
        ? codeNumber
        : 0,
  };
}

function findLevelInRanges(
  ranges: LevelRange[],
  codeNumber: number
): LevelNumber | undefined {
  return ranges.find(
    (range) =>
      codeNumber <= range.from &&
      codeNumber >= range.to
  )?.level;
}

export function getLevelFromCode(
  prefix: CodePrefix,
  codeNumber: number
): LevelNumber {
  if (prefix === "S") {
    return 2;
  }

  /*
    رمز M مشترك بين المستويات 3 و4 و5.
    عند وجود level محفوظ في السجل سيُستخدم بدل هذه القيمة الاحتياطية.
  */
  if (prefix === "M") {
    return 3;
  }

  if (prefix === "F") {
    return 6;
  }

  if (prefix === "A") {
    return 7;
  }

  if (prefix === "CA") {
    return (
      findLevelInRanges(
        CERTIFIED_LEADER_LEVEL_RANGES,
        codeNumber
      ) ?? 10
    );
  }

  if (prefix === "C") {
    return (
      findLevelInRanges(
        CERTIFIED_LEVEL_RANGES,
        codeNumber
      ) ?? 1
    );
  }

  return (
    findLevelInRanges(
      LEVEL_RANGES,
      codeNumber
    ) ?? 1
  );
}

export function normalizeEmployeeDocument(
  id: string,
  data: Record<string, unknown>
): EmployeeRecord {
  const rawCode = String(
    data.fullCode ??
      data.rank ??
      data.code ??
      ""
  ).toUpperCase();

  const parsedCode =
    parseEmployeeCode(rawCode);

  const rawAdministrationTitle =
    data.administrationTitle;

  const administrationTitle =
    isAdministrationTitle(
      rawAdministrationTitle
    )
      ? rawAdministrationTitle
      : undefined;

  const administrationRole =
    administrationTitle
      ? getAdministrationRoleByTitle(
          administrationTitle
        )
      : null;

  const rawLevel = Number(data.level);

  const detectedLevel =
    rawLevel >= 1 && rawLevel <= 10
      ? (rawLevel as LevelNumber)
      : getLevelFromCode(
          parsedCode.prefix,
          parsedCode.codeNumber
        );

  let employeeType =
    data.employeeType as
      | EmployeeType
      | undefined;

  const isAdministrationCode =
    parsedCode.prefix === "S" ||
    parsedCode.prefix === "M" ||
    parsedCode.prefix === "F" ||
    parsedCode.prefix === "A";

  const isLeadershipG =
    parsedCode.prefix === "G" &&
    (
      data.isLeader === true ||
      detectedLevel === 9 ||
      detectedLevel === 10 ||
      (
        parsedCode.codeNumber >= 1 &&
        parsedCode.codeNumber <= 10
      )
    );

  if (
    employeeType !== "main" &&
    employeeType !== "leader" &&
    employeeType !== "certified" &&
    employeeType !==
      "certified_leader" &&
    employeeType !==
      "administration"
  ) {
    if (
      isAdministrationCode ||
      administrationTitle
    ) {
      employeeType =
        "administration";
    } else if (
      parsedCode.prefix === "CA" ||
      data.certifiedLeader === true
    ) {
      employeeType =
        "certified_leader";
    } else if (
      parsedCode.prefix === "C" ||
      data.certified === true
    ) {
      employeeType = "certified";
    } else if (isLeadershipG) {
      employeeType = "leader";
    } else {
      employeeType = "main";
    }
  }

  /*
    لو كان السجل مصنفًا بنوع قديم لكن يحمل رمز إدارة
    أو مسمى إدارة، تُعتمد الإدارة.
  */
  if (
    (
      isAdministrationCode ||
      administrationTitle
    ) &&
    employeeType !==
      "administration"
  ) {
    employeeType =
      "administration";
  }

  /* تحويل سجلات القيادة القديمة من main إلى leader */
  if (
    employeeType === "main" &&
    isLeadershipG
  ) {
    employeeType = "leader";
  }

  const allowedLevels =
    getLevelsForEmployeeType(
      employeeType
    );

  const preferredLevel =
    employeeType === "administration" &&
    administrationRole
      ? administrationRole.level
      : detectedLevel;

  const level =
    allowedLevels.includes(
      preferredLevel
    )
      ? preferredLevel
      : allowedLevels[0];

  const resolvedAdministrationRole =
    employeeType === "administration"
      ? administrationRole ??
        getAdministrationRoleByLevel(
          level
        )
      : null;

  const prefix =
    employeeType === "administration"
      ? resolvedAdministrationRole
          ?.prefix ??
        getAdministrationPrefixForLevel(
          level
        )
      : getPrefixForEmployeeType(
          employeeType
        );

  const selectedRange =
    getLevelRangeForEmployeeType(
      employeeType,
      level
    );

  const codeMatchesSelectedRange =
    selectedRange &&
    parsedCode.prefix === prefix &&
    parsedCode.codeNumber >=
      selectedRange.to &&
    parsedCode.codeNumber <=
      selectedRange.from;

  const codeNumber =
    parsedCode.codeNumber > 0 &&
    codeMatchesSelectedRange
      ? parsedCode.codeNumber
      : selectedRange?.from ?? 1;

  const fullCode =
    formatEmployeeCode(
      prefix,
      codeNumber
    );

  const rawStatus = String(
    data.status ?? "active"
  );

  const status: EmployeeStatus =
    rawStatus === "leave" ||
    rawStatus === "suspended"
      ? rawStatus
      : "active";

  const certified =
    employeeType === "certified" ||
    employeeType ===
      "certified_leader";

  return {
    id,
    name: String(
      data.name ?? ""
    ),
    discordId: String(
      data.discordId ?? ""
    ),
    employeeType,
    codePrefix: prefix,
    codeNumber,
    fullCode,
    rank: fullCode,
    level,
    mainSector: String(
      data.mainSector ?? ""
    ),
    administrationTitle:
      resolvedAdministrationRole?.title,
    status,
    certified,
    certifiedLeader:
      employeeType ===
      "certified_leader",
    isLeader:
      employeeType === "leader",
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}