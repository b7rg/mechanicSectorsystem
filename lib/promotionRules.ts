export type EmployeeReports = {
  fieldGuide?: number;
  fieldSupervisor?: number;
  recruitment?: number;
  generalSupervisor?: number;
};

export type PromotionRule = {
  reports: EmployeeReports;
  courses: string[];
};

export type PromotionEmployeeData = {
  level?: number | string;
  reports?: EmployeeReports;
  courses?: string[];
};

export const promotionRules: Record<number, PromotionRule> = {
  1: {
    reports: {
      fieldGuide: 15,
    },
    courses: [
      "الموجة الميداني",
    ],
  },

  2: {
    reports: {
      fieldGuide: 25,
    },
    courses: [
      "الموجة الميداني",
    ],
  },

  3: {
    reports: {
      fieldGuide: 30,
    },
    courses: [
      "الموجة الميداني",
      "التعديل والتزويد",
      "شؤون الكراج",
    ],
  },

  4: {
    reports: {
      fieldGuide: 20,
      recruitment: 5,
    },
    courses: [
      "الموجة الميداني",
      "التعديل والتزويد",
      "شؤون الكراج",
      "شؤون التوظيف",
    ],
  },

  5: {
    reports: {
      fieldSupervisor: 25,
      recruitment: 15,
    },
    courses: [
      "الموجة الميداني",
      "التعديل والتزويد",
      "شؤون الكراج",
      "شؤون التوظيف",
      "مشرف ميداني",
    ],
  },

  6: {
    reports: {
      fieldSupervisor: 35,
      recruitment: 20,
    },
    courses: [
      "الموجة الميداني",
      "التعديل والتزويد",
      "شؤون الكراج",
      "شؤون التوظيف",
      "مشرف ميداني",
      "إشراف عام",
    ],
  },

  7: {
    reports: {
      fieldSupervisor: 55,
      recruitment: 25,
      generalSupervisor: 10,
    },
    courses: [
      "الموجة الميداني",
      "التعديل والتزويد",
      "شؤون الكراج",
      "شؤون التوظيف",
      "مشرف ميداني",
      "إشراف عام",
      "مدرب معتمد",
    ],
  },
};

function toNumber(value: unknown): number {
  const numberValue = Number(value ?? 0);

  return Number.isFinite(numberValue)
    ? numberValue
    : 0;
}

export function getPromotionEligibility(
  employee: PromotionEmployeeData
) {
  const level = toNumber(employee.level);
  const rule = promotionRules[level] ?? null;

  const reports = employee.reports ?? {};

  const employeeCourses = Array.isArray(
    employee.courses
  )
    ? employee.courses
    : [];

  if (level >= 10) {
    return {
      level,
      rule: null,
      eligible: false,
      progress: 100,
      status: "max_level" as const,
      missingCourses: [],
      completedCourses: 0,
      requiredCourses: 0,
      completedRequirements: 0,
      totalRequirements: 0,
    };
  }

  if (!rule) {
    return {
      level,
      rule: null,
      eligible: false,
      progress: 0,
      status: "no_rule" as const,
      missingCourses: [],
      completedCourses: 0,
      requiredCourses: 0,
      completedRequirements: 0,
      totalRequirements: 0,
    };
  }

  const missingCourses = rule.courses.filter(
    (course) => !employeeCourses.includes(course)
  );

  const reportRequirements = [
    {
      current: toNumber(reports.fieldGuide),
      required: toNumber(rule.reports.fieldGuide),
    },
    {
      current: toNumber(reports.fieldSupervisor),
      required: toNumber(
        rule.reports.fieldSupervisor
      ),
    },
    {
      current: toNumber(reports.recruitment),
      required: toNumber(rule.reports.recruitment),
    },
    {
      current: toNumber(
        reports.generalSupervisor
      ),
      required: toNumber(
        rule.reports.generalSupervisor
      ),
    },
  ].filter((item) => item.required > 0);

  const completedReports =
    reportRequirements.filter(
      (item) => item.current >= item.required
    ).length;

  const completedCourses =
    rule.courses.length - missingCourses.length;

  const completedRequirements =
    completedReports + completedCourses;

  const totalRequirements =
    reportRequirements.length + rule.courses.length;

  const progress =
    totalRequirements === 0
      ? 0
      : Math.min(
          100,
          Math.round(
            (completedRequirements /
              totalRequirements) *
              100
          )
        );

  const eligible =
    missingCourses.length === 0 &&
    reportRequirements.every(
      (item) => item.current >= item.required
    );

  return {
    level,
    rule,
    eligible,
    progress: eligible ? 100 : progress,
    status: eligible
      ? ("eligible" as const)
      : ("not_eligible" as const),
    missingCourses,
    completedCourses,
    requiredCourses: rule.courses.length,
    completedRequirements,
    totalRequirements,
  };
}