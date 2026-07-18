"use client";

export type EmployeeType =
  | "main"
  | "certified"
  | "certified_leader";

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

export type CodePrefix = "G" | "C" | "CA";

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
  status: EmployeeStatus;
  certified: boolean;
  certifiedLeader: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type LevelRange = {
  level: LevelNumber;
  from: number;
  to: number;
  label: string;
};

export const LEVEL_RANGES: LevelRange[] = [
  { level: 1, from: 285, to: 271, label: "المستوى الأول" },
  { level: 2, from: 235, to: 221, label: "المستوى الثاني" },
  { level: 3, from: 180, to: 166, label: "المستوى الثالث" },
  { level: 4, from: 135, to: 126, label: "المستوى الرابع" },
  { level: 5, from: 107, to: 96, label: "المستوى الخامس" },
  { level: 6, from: 79, to: 70, label: "المستوى السادس" },
  { level: 7, from: 60, to: 51, label: "المستوى السابع" },
  { level: 8, from: 35, to: 26, label: "المستوى الثامن" },

  // القيادات G-10 إلى G-1:
  { level: 9, from: 10, to: 6, label: "المستوى التاسع" },
  { level: 10, from: 5, to: 1, label: "المستوى العاشر" },
];

export const LEVEL_NUMBERS: LevelNumber[] = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
];

export const EMPLOYEE_TYPE_LABELS: Record<EmployeeType, string> = {
  main: "موظف أساسي",
  certified: "لاعب معتمد",
  certified_leader: "قيادة معتمدة",
};

export const STATUS_LABELS: Record<EmployeeStatus, string> = {
  active: "على رأس العمل",
  leave: "إجازة",
  suspended: "موقوف",
};

export function getPrefixForEmployeeType(
  employeeType: EmployeeType
): CodePrefix {
  if (employeeType === "main") return "G";
  if (employeeType === "certified_leader") return "CA";
  return "C";
}

export function formatEmployeeCode(
  prefix: CodePrefix,
  codeNumber: number
): string {
  if (prefix === "CA") {
    return `CA-${codeNumber}`;
  }

  return `${prefix}-${String(codeNumber).padStart(3, "0")}`;
}

function createDescendingNumbers(from: number, to: number): number[] {
  const result: number[] = [];

  for (let current = from; current >= to; current -= 1) {
    result.push(current);
  }

  return result;
}

export function getLevelRange(level: LevelNumber): LevelRange {
  return (
    LEVEL_RANGES.find((item) => item.level === level) ??
    LEVEL_RANGES[0]
  );
}

export function getCodesForLevel(
  employeeType: EmployeeType,
  level: LevelNumber
): string[] {
  if (employeeType === "certified_leader") {
    // كل مستوى قيادي معتمد له كود CA مطابق له:
    // المستوى 1 = CA-1 ... المستوى 10 = CA-10
    return [formatEmployeeCode("CA", level)];
  }

  const prefix = getPrefixForEmployeeType(employeeType);
  const range = getLevelRange(level);

  return createDescendingNumbers(range.from, range.to).map(
    (number) => formatEmployeeCode(prefix, number)
  );
}

export function getLevelCapacity(
  employeeType: EmployeeType,
  level: LevelNumber
): number {
  if (employeeType === "certified_leader") {
    return 1;
  }

  const range = getLevelRange(level);
  return Math.abs(range.from - range.to) + 1;
}

export function getTotalCapacity(employeeType: EmployeeType): number {
  return LEVEL_NUMBERS.reduce(
    (total, level) => total + getLevelCapacity(employeeType, level),
    0
  );
}

export function parseEmployeeCode(value: string): {
  prefix: CodePrefix;
  codeNumber: number;
} {
  const cleanValue = value.trim().toUpperCase();
  const [rawPrefix, rawNumber] = cleanValue.split("-");
  const prefix: CodePrefix =
    rawPrefix === "CA" ? "CA" : rawPrefix === "C" ? "C" : "G";

  const codeNumber = Number.parseInt(rawNumber ?? "0", 10);

  return {
    prefix,
    codeNumber: Number.isFinite(codeNumber) ? codeNumber : 0,
  };
}

export function getLevelFromCode(
  prefix: CodePrefix,
  codeNumber: number
): LevelNumber {
  if (prefix === "CA") {
    const safeLevel = Math.min(10, Math.max(1, codeNumber));
    return safeLevel as LevelNumber;
  }

  const matchedRange = LEVEL_RANGES.find(
    (range) => codeNumber <= range.from && codeNumber >= range.to
  );

  return matchedRange?.level ?? 1;
}

export function normalizeEmployeeDocument(
  id: string,
  data: Record<string, unknown>
): EmployeeRecord {
  const rawCode = String(
    data.fullCode ?? data.rank ?? data.code ?? ""
  ).toUpperCase();

  const parsedCode = parseEmployeeCode(rawCode);

  let employeeType = data.employeeType as EmployeeType | undefined;

  if (
    employeeType !== "main" &&
    employeeType !== "certified" &&
    employeeType !== "certified_leader"
  ) {
    if (parsedCode.prefix === "CA" || data.certifiedLeader === true) {
      employeeType = "certified_leader";
    } else if (parsedCode.prefix === "C" || data.certified === true) {
      employeeType = "certified";
    } else {
      employeeType = "main";
    }
  }

  const prefix = getPrefixForEmployeeType(employeeType);

  const rawLevel = Number(data.level);
  const level =
    rawLevel >= 1 && rawLevel <= 10
      ? (rawLevel as LevelNumber)
      : getLevelFromCode(prefix, parsedCode.codeNumber);

  const codeNumber =
    parsedCode.codeNumber > 0
      ? parsedCode.codeNumber
      : employeeType === "certified_leader"
        ? level
        : getLevelRange(level).from;

  const fullCode = formatEmployeeCode(prefix, codeNumber);

  const rawStatus = String(data.status ?? "active");
  const status: EmployeeStatus =
    rawStatus === "leave" || rawStatus === "suspended"
      ? rawStatus
      : "active";

  return {
    id,
    name: String(data.name ?? ""),
    discordId: String(data.discordId ?? ""),
    employeeType,
    codePrefix: prefix,
    codeNumber,
    fullCode,
    rank: String(data.rank ?? fullCode),
    level,
    mainSector: String(data.mainSector ?? ""),
    status,
    certified: employeeType !== "main",
    certifiedLeader: employeeType === "certified_leader",
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}