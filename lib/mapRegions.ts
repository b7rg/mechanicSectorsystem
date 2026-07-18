import type { MechanicRegionKey } from "@/lib/mechanicTitles";

export type MapRegionZone = {
  id: string;

  // يربط المنطقة بالمسميات الموجودة في mechanicTitles
  regionKey: MechanicRegionKey;

  // الاسم الظاهر فوق الخريطة
  name: string;

  // وصف مختصر
  description: string;

  // إحداثيات المنطقة كنسبة من الصورة
  x: number;
  y: number;

  // حجم المنطقة كنسبة من الصورة
  width: number;
  height: number;

  // اللون بصيغة HEX
  color: string;

  // شفافية اللون قبل مرور الماوس
  opacity: number;

  // شفافية اللون عند مرور الماوس
  hoverOpacity: number;

  // تدوير المنطقة
  rotate?: number;

  // شكل الزوايا
  borderRadius?: string;

  // إظهار اسم المنطقة فوقها
  showLabel?: boolean;

  // تفعيل أو إخفاء المنطقة
  active?: boolean;
};

export const mapRegions: MapRegionZone[] = [
  {
    id: "los",
    regionKey: "los",

    name: "لوس",
    description:
      "المسميات المعتمدة للوحدات الموجهة داخل لوس سانتوس.",

    x: 25,
    y: 64,

    width: 34,
    height: 25,

    color: "#3b82f6",

    opacity: 0.2,
    hoverOpacity: 0.5,

    rotate: 0,
    borderRadius: "35% 30% 25% 35%",

    showLabel: true,
    active: true,
  },

  {
    id: "sandy",
    regionKey: "sandy",

    name: "ساندي",
    description:
      "المسميات المعتمدة للوحدات الموجهة داخل ساندي شورز.",

    x: 44,
    y: 25,

    width: 26,
    height: 23,

    color: "#f97316",

    opacity: 0.2,
    hoverOpacity: 0.5,

    rotate: 4,
    borderRadius: "45% 35% 40% 45%",

    showLabel: true,
    active: true,
  },

  {
    id: "paleto",
    regionKey: "paleto",

    name: "بوليتو",
    description:
      "المسميات المعتمدة للوحدات الموجهة داخل بوليتو.",

    x: 39,
    y: 6,

    width: 28,
    height: 18,

    color: "#a855f7",

    opacity: 0.2,
    hoverOpacity: 0.5,

    rotate: 0,
    borderRadius: "45%",

    showLabel: true,
    active: true,
  },

  {
    id: "coast",
    regionKey: "coast",

    name: "الساحل",
    description:
      "المسميات المعتمدة للوحدات الموجهة على الطريق الساحلي.",

    x: 14,
    y: 25,

    width: 20,
    height: 42,

    color: "#06b6d4",

    opacity: 0.2,
    hoverOpacity: 0.5,

    rotate: -8,
    borderRadius: "55% 25% 35% 50%",

    showLabel: true,
    active: true,
  },
];