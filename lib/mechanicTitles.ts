export type MechanicRegionKey =
  | "los"
  | "sandy"
  | "paleto"
  | "coast";

export type MechanicRegion = {
  key: MechanicRegionKey;
  name: string;
  shortName: string;
  description: string;
};

export type MainTitleGroup = {
  id: string;
  levels: number[];
  levelsLabel: string;

  withoutApproval?: {
    approvalName: string;
    title: string;
    description: string;
  };

  withApproval?: {
    approvalName: string;
    title: string;
    description: string;
  };

  defaultTitle?: {
    title: string;
    description: string;
  };
};

export type TemporaryTitle = {
  id: string;
  title: string;
  description: string;
};

export const mechanicRegions: Record<
  MechanicRegionKey,
  MechanicRegion
> = {
  los: {
    key: "los",
    name: "لوس سانتوس",
    shortName: "لوس",
    description:
      "تغطية مدينة لوس سانتوس والمناطق والطرق التابعة لها.",
  },

  sandy: {
    key: "sandy",
    name: "ساندي شورز",
    shortName: "ساندي",
    description:
      "تغطية منطقة ساندي شورز والطرق والمناطق المحيطة بها.",
  },

  paleto: {
    key: "paleto",
    name: "بوليتو",
    shortName: "بوليتو",
    description:
      "تغطية مدينة بوليتو والمناطق الشمالية من الخريطة.",
  },

  coast: {
    key: "coast",
    name: "الساحل",
    shortName: "الساحل",
    description:
      "تغطية الطريق الساحلي والمناطق والطرق القريبة منه.",
  },
};

export const mainTitleGroups: MainTitleGroup[] = [
  {
    id: "levels-1-3",
    levels: [1, 2, 3],
    levelsLabel: "المستويات 1 - 2 - 3",

    defaultTitle: {
      title: "فني ميكانيك",
      description:
        "المسمى الأساسي المعتمد لأفراد المستويات من الأول إلى الثالث.",
    },
  },

  {
    id: "levels-4-5",
    levels: [4, 5],
    levelsLabel: "المستويات 4 - 5",

    withoutApproval: {
      approvalName: "اعتماد المشرف الميداني",
      title: "فني مركبات",
      description:
        "يستخدم هذا المسمى في حال عدم حصول الفرد على اعتماد المشرف الميداني.",
    },

    withApproval: {
      approvalName: "اعتماد المشرف الميداني",
      title: "مشرف ميداني",
      description:
        "يستخدم هذا المسمى بعد اجتياز دورة واعتماد المشرف الميداني.",
    },
  },

  {
    id: "levels-6-8",
    levels: [6, 7, 8],
    levelsLabel: "المستويات 6 - 7 - 8",

    withoutApproval: {
      approvalName: "اعتماد المشرف العام",
      title: "أخصائي ميكانيكا",
      description:
        "يستخدم هذا المسمى في حال عدم حصول الفرد على اعتماد المشرف العام.",
    },

    withApproval: {
      approvalName: "اعتماد المشرف العام",
      title: "مشرف عام",
      description:
        "يستخدم هذا المسمى بعد اجتياز دورة واعتماد المشرف العام.",
    },
  },
];

export const temporaryTitles: TemporaryTitle[] = [
  {
    id: "field-dispatcher",
    title: "الموجّه الميداني",
    description:
      "يستخدم أثناء استلام مسؤولية الموجة الميدانية فقط.",
  },

  {
    id: "assistant-field-dispatcher",
    title: "نائب الموجّه الميداني",
    description:
      "يستخدم أثناء استلام مهمة نائب الموجّه الميداني فقط.",
  },

  {
    id: "recruitment-officer",
    title: "مسؤول التوظيف",
    description:
      "يستخدم أثناء استلام وتنفيذ مهام التوظيف فقط.",
  },

  {
    id: "tuning-technician",
    title: "فني التعديل والتزويد",
    description:
      "يستخدم أثناء استلام مهمة التعديل والتزويد فقط.",
  },

  {
    id: "garage-affairs",
    title: "مسؤول شؤون الكراج",
    description:
      "يستخدم أثناء استلام مسؤولية شؤون الكراج فقط.",
  },

  {
    id: "administrative-affairs",
    title: "مسؤول الشؤون الإدارية",
    description:
      "يستخدم أثناء استلام مسؤولية الشؤون الإدارية فقط.",
  },
];

export const titleInstructions = [
  "يمنع استخدام أي مسمى دون الحصول على المستوى أو الاعتماد المطلوب.",

  "اعتماد المشرف الميداني مخصص للمستويات 4 و5 بعد اجتياز الدورة.",

  "اعتماد المشرف العام مخصص للمستويات 6 و7 و8 بعد اجتياز الدورة.",

  "المسمى الميداني المؤقت يستخدم أثناء استلام المهمة فقط.",

  "يجب إضافة موقع التوجيه إلى المسمى الأساسي: لوس أو ساندي أو بوليتو أو الساحل.",

  "ارتفاع المستوى لا يمنح صلاحيات إشرافية دون الحصول على الاعتماد الخاص بها.",

  "يتحمل الفرد مسؤولية استخدام مسمى غير معتمد أو انتحال صلاحيات لا يمتلكها.",

  "بعد انتهاء المهمة المؤقتة يجب العودة مباشرة إلى المسمى الأساسي.",
];

export function buildFullTitle(
  title: string,
  regionKey: MechanicRegionKey,
  gCode = "G - 000"
) {
  const region = mechanicRegions[regionKey];

  return `${gCode} | ${title} ${region.shortName}`;
}

export function getTitlesForRegion(
  regionKey: MechanicRegionKey
) {
  return mainTitleGroups.map((group) => ({
    ...group,

    defaultTitle: group.defaultTitle
      ? {
          ...group.defaultTitle,
          fullTitle: buildFullTitle(
            group.defaultTitle.title,
            regionKey
          ),
        }
      : undefined,

    withoutApproval: group.withoutApproval
      ? {
          ...group.withoutApproval,
          fullTitle: buildFullTitle(
            group.withoutApproval.title,
            regionKey
          ),
        }
      : undefined,

    withApproval: group.withApproval
      ? {
          ...group.withApproval,
          fullTitle: buildFullTitle(
            group.withApproval.title,
            regionKey
          ),
        }
      : undefined,
  }));
}