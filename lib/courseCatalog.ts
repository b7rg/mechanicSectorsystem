export const CORE_COURSES = [
  "الموجة الميداني",
  "التعديل والتزويد",
  "شؤون الكراج",
  "شؤون التوظيف",
  "الشؤون الإدارية",
  "مشرف ميداني",
  "إشراف عام",
  "مدرب معتمد",
] as const;

export type CoreCourseName =
  (typeof CORE_COURSES)[number];

export function isCoreCourseName(
  value: string
): value is CoreCourseName {
  return CORE_COURSES.some(
    (courseName) =>
      courseName === value
  );
}