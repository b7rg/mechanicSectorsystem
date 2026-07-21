import type {
  EmployeeType,
} from "@/lib/employeeCodes";

export type CertifiedPromotionEmployee = {
  employeeType?: EmployeeType | string;

  level?: number | string;

  attendanceDays?: number;

  courses?: string[];
};

/*
  عدد أيام الحضور الفعلي المطلوبة للترقية
  من المستوى الحالي إلى المستوى التالي.
*/
export const CERTIFIED_ATTENDANCE_REQUIREMENTS: Record<
  number,
  number
> = {
  1: 7,
  2: 10,
  3: 14,
  4: 18,
  5: 25,
  6: 30,
  7: 45,
  8: 60,
  9: 75,
};

const MODIFICATION_COURSE =
  "التعديل والتزويد";

const FLEET_COURSE =
  "الأسطول";

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

function normalizeCourseName(
  value: string
): string {
  const cleanedValue = value
    .trim()
    .replace(/\s+/g, " ");

  const aliases: Record<
    string,
    string
  > = {
    "تعديل وتزويد":
      MODIFICATION_COURSE,

    "دورة التعديل والتزويد":
      MODIFICATION_COURSE,

    "اسطول":
      FLEET_COURSE,

    "الاسطول":
      FLEET_COURSE,

    "دورة الأسطول":
      FLEET_COURSE,

    "دورة الاسطول":
      FLEET_COURSE,
  };

  return (
    aliases[cleanedValue] ??
    cleanedValue
  );
}

/*
  دورات اللاعب المعتمد فقط:

  المستوى 1 و2:
  لا توجد دورات مطلوبة.

  من المستوى 3:
  التعديل والتزويد مطلوبة.

  من المستوى 5:
  التعديل والتزويد + الأسطول مطلوبتان.

  لا تدخل دورات المسؤوليات أو الإشراف
  ضمن شروط ترقية اللاعب المعتمد.
*/
function getRequiredCourses(
  level: number
): string[] {
  if (level >= 5) {
    return [
      MODIFICATION_COURSE,
      FLEET_COURSE,
    ];
  }

  if (level >= 3) {
    return [
      MODIFICATION_COURSE,
    ];
  }

  return [];
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
      ? employee.courses
          .filter(
            (
              course
            ): course is string =>
              typeof course ===
              "string"
          )
          .map(
            normalizeCourseName
          )
      : [];

  const normalizedEmployeeCourses =
    new Set(employeeCourses);

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

      attendanceComplete: false,

      coursesComplete: false,
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

      attendanceComplete: true,

      coursesComplete: true,
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
        !normalizedEmployeeCourses.has(
          normalizeCourseName(course)
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
    في المستويات التي لا تتطلب دورات،
    تعتمد النسبة على الحضور فقط.

    عند وجود دورات مطلوبة:
    نصف النسبة للحضور ونصفها للدورات.
  */
  const progress =
    requiredCourses.length === 0
      ? daysProgress
      : Math.round(
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