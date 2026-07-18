import type {
  MechanicRegionKey,
} from "@/lib/mechanicTitles";

export type MapLocationType =
  | "center"
  | "impound"
  | "highway"
  | "coast"
  | "fleet"
  | "field";

export type MapLocation = {
  id: string;
  name: string;
  type: MapLocationType;

  region: string;
  regionKey?: MechanicRegionKey;

  unitName: string;
  description: string;

  /*
    موقع العلامة كنسبة من حجم الصورة:

    x:
    0 = أقصى اليسار
    100 = أقصى اليمين

    y:
    0 = أعلى الصورة
    100 = أسفل الصورة
  */
  x: number;
  y: number;

  public: boolean;
  active: boolean;
  showTitles?: boolean;
};

export const mapLocationTypes: Record<
  MapLocationType,
  {
    label: string;
    emoji: string;
  }
> = {
  center: {
    label: "موقع توجيه",
    emoji: "🔧",
  },

  impound: {
    label: "منطقة حجز",
    emoji: "🚛",
  },

  highway: {
    label: "الطرق السريعة",
    emoji: "🛣️",
  },

  coast: {
    label: "موقع توجيه الساحل",
    emoji: "⚓",
  },

  fleet: {
    label: "الأسطول",
    emoji: "🚗",
  },

  field: {
    label: "موقع ميداني",
    emoji: "📍",
  },
};

export const mapLocations: MapLocation[] = [
  {
    id: "los-region",
    name: "توجيه لوس",
    type: "center",

    region: "لوس سانتوس",
    regionKey: "los",

    unitName: "مسميات لوس",
    description:
      "موقع التوجيه المعتمد لمنطقة لوس سانتوس. اضغط على العلامة لعرض المسميات الأساسية حسب المستوى والاعتمادات.",

    x: 44,
    y: 77,

    public: true,
    active: true,
    showTitles: true,
  },

  {
    id: "sandy-region",
    name: "توجيه ساندي",
    type: "center",

    region: "ساندي شورز",
    regionKey: "sandy",

    unitName: "مسميات ساندي",
    description:
      "موقع التوجيه المعتمد لمنطقة ساندي شورز. اضغط على العلامة لعرض المسميات الأساسية حسب المستوى والاعتمادات.",

    x: 59,
    y: 36,

    public: true,
    active: true,
    showTitles: true,
  },

  {
    id: "paleto-region",
    name: "توجيه بوليتو",
    type: "center",

    region: "بوليتو",
    regionKey: "paleto",

    unitName: "مسميات بوليتو",
    description:
      "موقع التوجيه المعتمد لمنطقة بوليتو. اضغط على العلامة لعرض المسميات الأساسية حسب المستوى والاعتمادات.",

    x: 54,
    y: 16,

    public: true,
    active: true,
    showTitles: true,
  },

  {
    id: "coast-region",
    name: "توجيه الساحل",
    type: "coast",

    region: "الساحل",
    regionKey: "coast",

    unitName: "مسميات الساحل",
    description:
      "موقع التوجيه المعتمد للساحل والطريق الساحلي. اضغط على العلامة لعرض المسميات الأساسية حسب المستوى والاعتمادات.",

    x: 24,
    y: 49,

    public: true,
    active: true,
    showTitles: true,
  },
];