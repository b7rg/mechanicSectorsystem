import {
  promotionRules,
} from "@/lib/promotionRules";

import type {
  EmployeeType,
} from "@/lib/employeeCodes";

export type CertifiedPromotionEmployee = {
  employeeType?: EmployeeType | string;

  level?: number | string;

  attendanceDays?: number;

  courses?: string[];
};

export const CERTIFIED_ATTENDANCE_REQUIREMENTS: Record<
  number,
  number
> = {
  1: 10,
  2: 15,
  3: 18,
  4: 20,
  5: 25,
  6: 30,
  7: 35,
  8: 50,
  9: 55,
};

function getSafeNumber(
  value: unknown
): number {
  const numberValue = Number(
    value ?? 0
  );

  return Number.isFinite(
    numberValue
  )
    ? numberValue
    : 0;
}

function getRequiredCourses(
  level: number
): string[] {
  /*
    المستويات من 1 إلى 7 تستخدم
    دورات قطاع الميكانيك نفسها.

    المستوى 8 و9 لا توجد لهما
    دورات إضافية مسجلة حاليًا،
    لذلك يستمران على كامل دورات
    المستوى السابع.
  */

  const directCourses =
    promotionRules[level]?.courses;

  if (
    Array.isArray(directCourses)
  ) {
    return directCourses;
  }

  return (
    promotionRules[7]?.courses ??
    []
  );
}

export function isCertifiedEmployee(
  employeeType: unknown
): boolean {
  return (
    employeeType === "certified" ||
    employeeType ===
      "certified_leader"
  );
}

export function getCertifiedPromotionEligibility(
  employee: CertifiedPromotionEmployee
) {
  const rawLevel = getSafeNumber(
    employee.level
  );

  const level = Math.min(
    10,
    Math.max(
      1,
      Math.trunc(rawLevel || 1)
    )
  );

  const certified =
    isCertifiedEmployee(
      employee.employeeType
    );

  const attendanceDays =
    Math.max(
      0,
      Math.trunc(
        getSafeNumber(
          employee.attendanceDays
        )
      )
    );

  const employeeCourses =
    Array.isArray(
      employee.courses
    )
      ? employee.courses.filter(
          (
            course
          ): course is string =>
            typeof course ===
            "string"
        )
      : [];

  if (!certified) {
    return {
      status:
        "not_certified" as const,

      level,

      eligible: false,

      progress: 0,

      attendanceDays,

      requiredDays: 0,

      remainingDays: 0,

      daysProgress: 0,

      requiredCourses:
        [] as string[],

      missingCourses:
        [] as string[],

      completedCourses: 0,

      coursesProgress: 0,
    };
  }

  if (level >= 10) {
    return {
      status:
        "max_level" as const,

      level: 10,

      eligible: false,

      progress: 100,

      attendanceDays,

      requiredDays: 0,

      remainingDays: 0,

      daysProgress: 100,

      requiredCourses:
        [] as string[],

      missingCourses:
        [] as string[],

      completedCourses: 0,

      coursesProgress: 100,
    };
  }

  const requiredDays =
    CERTIFIED_ATTENDANCE_REQUIREMENTS[
      level
    ] ?? 0;

  const requiredCourses =
    getRequiredCourses(level);

  const missingCourses =
    requiredCourses.filter(
      (course) =>
        !employeeCourses.includes(
          course
        )
    );

  const completedCourses =
    requiredCourses.length -
    missingCourses.length;

  const daysProgress =
    requiredDays === 0
      ? 100
      : Math.min(
          100,
          Math.round(
            (attendanceDays /
              requiredDays) *
              100
          )
        );

  const coursesProgress =
    requiredCourses.length === 0
      ? 100
      : Math.min(
          100,
          Math.round(
            (completedCourses /
              requiredCourses.length) *
              100
          )
        );

  /*
    نصف النسبة لأيام الحضور
    ونصفها للدورات.
  */

  const progress = Math.round(
    (daysProgress +
      coursesProgress) /
      2
  );

  const attendanceComplete =
    attendanceDays >=
    requiredDays;

  const coursesComplete =
    missingCourses.length === 0;

  const eligible =
    attendanceComplete &&
    coursesComplete;

  return {
    status: eligible
      ? ("eligible" as const)
      : ("not_eligible" as const),

    level,

    eligible,

    progress: eligible
      ? 100
      : progress,

    attendanceDays,

    requiredDays,

    remainingDays: Math.max(
      0,
      requiredDays -
        attendanceDays
    ),

    daysProgress,

    attendanceComplete,

    requiredCourses,

    missingCourses,

    completedCourses,

    coursesProgress,

    coursesComplete,
  };
}