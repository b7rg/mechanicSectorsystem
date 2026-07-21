export const CORE_COURSES = [
  "الموجة الميداني",
  "التعديل والتزويد",
  "الأسطول",
  "شؤون الكراج",
  "شؤون التوظيف",
  "الشؤون الإدارية",
  "مشرف ميداني",
  "إشراف عام",
  "مدرب معتمد",
] as const;

export type CoreCourseName =
  (typeof CORE_COURSES)[number];

const COURSE_NAME_ALIASES: Record<
  string,
  CoreCourseName
> = {
  "المشرف الميداني": "مشرف ميداني",

  "الإشراف العام": "إشراف عام",
  "الاشراف العام": "إشراف عام",
  "اشراف عام": "إشراف عام",

  "الموجه الميداني": "الموجة الميداني",
  "الموجّه الميداني": "الموجة الميداني",

  "الشؤون الادارية": "الشؤون الإدارية",

  "تعديل وتزويد": "التعديل والتزويد",
  "دورة التعديل والتزويد":
    "التعديل والتزويد",

  "اسطول": "الأسطول",
  "الاسطول": "الأسطول",
  "دورة الأسطول": "الأسطول",
  "دورة الاسطول": "الأسطول",
};

export function normalizeCourseName(
  value: string
): string {
  const cleanedValue = value
    .trim()
    .replace(/\s+/g, " ");

  return (
    COURSE_NAME_ALIASES[
      cleanedValue
    ] ?? cleanedValue
  );
}

export function isCoreCourseName(
  value: string
): value is CoreCourseName {
  return CORE_COURSES.includes(
    value as CoreCourseName
  );
}

export function getCoreCourseName(
  value: string
): CoreCourseName | null {
  const normalizedValue =
    normalizeCourseName(value);

  return isCoreCourseName(
    normalizedValue
  )
    ? normalizedValue
    : null;
}