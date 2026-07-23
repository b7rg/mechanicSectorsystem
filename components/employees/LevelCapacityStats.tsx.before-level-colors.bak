"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import {
  BadgeCheck,
  Crown,
  Loader2,
  ShieldCheck,
  Users,
} from "lucide-react";

import { db } from "@/lib/firebase";
import {
  EMPLOYEE_TYPE_LABELS,
  getLevelCapacity,
  getLevelsForEmployeeType,
  getTotalCapacity,
  normalizeEmployeeDocument,
  type EmployeeRecord,
  type EmployeeType,
  type LevelNumber,
} from "@/lib/employeeCodes";

type LevelCapacityStatsProps = {
  employees?: EmployeeRecord[];
  title?: string;
};

/*
  موظفو الإدارة لا يدخلون ضمن إحصائيات إشغال
  المستويات الخاصة بنظام الترقيات والسعات.
*/
type CapacityType = Exclude<EmployeeType, "administration">;

const CAPACITY_TYPES: CapacityType[] = [
  "main",
  "leader",
  "certified",
  "certified_leader",
];

const typeIcons = {
  main: Users,
  leader: Crown,
  certified: BadgeCheck,
  certified_leader: Crown,
} satisfies Record<CapacityType, typeof Users>;

const typeDescriptions: Record<CapacityType, string> = {
  main: "أكواد G الخاصة بالموظفين الأساسيين من المستوى 1 إلى 8.",
  leader: "أكواد القيادة G-010 إلى G-001 للمستويين 9 و10.",
  certified: "أكواد C الخاصة باللاعبين المعتمدين.",
  certified_leader: "أكواد CA الخاصة بالقيادات المعتمدة.",
};

function isCapacityType(
  employeeType: EmployeeType
): employeeType is CapacityType {
  return employeeType !== "administration";
}

function getCapacityLevels(
  employeeType: CapacityType
): LevelNumber[] {
  return getLevelsForEmployeeType(employeeType);
}

function getOccupancyStyle(
  percentage: number,
  full: boolean
) {
  if (full) {
    return {
      border: "border-red-500/25",
      background: "bg-red-500/[0.06]",
      text: "text-red-400",
      progress: "bg-red-500",
      label: "مكتمل",
    };
  }

  if (percentage >= 75) {
    return {
      border: "border-orange-500/25",
      background: "bg-orange-500/[0.06]",
      text: "text-orange-400",
      progress: "bg-orange-500",
      label: "قريب من الاكتمال",
    };
  }

  return {
    border: "border-green-500/20",
    background: "bg-green-500/[0.04]",
    text: "text-green-400",
    progress: "bg-green-500",
    label: "متاح",
  };
}

export default function LevelCapacityStats({
  employees: employeesProp,
  title = "إشغال المستويات",
}: LevelCapacityStatsProps) {
  const [remoteEmployees, setRemoteEmployees] =
    useState<EmployeeRecord[]>([]);
  const [loading, setLoading] =
    useState(!employeesProp);
  const [selectedType, setSelectedType] =
    useState<CapacityType>("main");

  useEffect(() => {
    if (employeesProp) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      collection(db, "employees"),
      (snapshot) => {
        setRemoteEmployees(
          snapshot.docs.map((employeeDocument) =>
            normalizeEmployeeDocument(
              employeeDocument.id,
              employeeDocument.data()
            )
          )
        );
        setLoading(false);
      },
      (error) => {
        console.error(
          "تعذر تحميل إحصائيات الموظفين:",
          error
        );
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [employeesProp]);

  const employees =
    employeesProp ?? remoteEmployees;

  const totals = useMemo(() => {
    const result: Record<
      CapacityType,
      {
        used: number;
        capacity: number;
        remaining: number;
      }
    > = {
      main: {
        used: 0,
        capacity: getTotalCapacity("main"),
        remaining: 0,
      },
      leader: {
        used: 0,
        capacity: getTotalCapacity("leader"),
        remaining: 0,
      },
      certified: {
        used: 0,
        capacity: getTotalCapacity("certified"),
        remaining: 0,
      },
      certified_leader: {
        used: 0,
        capacity: getTotalCapacity(
          "certified_leader"
        ),
        remaining: 0,
      },
    };

    for (const employee of employees) {
      if (!isCapacityType(employee.employeeType)) {
        continue;
      }

      result[employee.employeeType].used += 1;
    }

    for (const employeeType of CAPACITY_TYPES) {
      result[employeeType].remaining = Math.max(
        0,
        result[employeeType].capacity -
          result[employeeType].used
      );
    }

    return result;
  }, [employees]);

  if (loading) {
    return (
      <div className="flex min-h-52 items-center justify-center rounded-[28px] border border-white/10 bg-[#141414]">
        <Loader2
          className="animate-spin text-yellow-400"
          size={36}
        />
      </div>
    );
  }

  const selectedTotal = totals[selectedType];
  const selectedLevels =
    getCapacityLevels(selectedType);

  return (
    <section
      dir="rtl"
      className="space-y-5"
    >
      <div>
        <h2 className="text-2xl font-black text-white">
          {title}
        </h2>

        <p className="mt-2 text-sm leading-7 text-zinc-500">
          يوضح عدد الأكواد المستخدمة والمتبقية
          وهل اكتمل المستوى.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {CAPACITY_TYPES.map((employeeType) => {
          const Icon = typeIcons[employeeType];
          const data = totals[employeeType];
          const selected =
            selectedType === employeeType;

          return (
            <button
              key={employeeType}
              type="button"
              onClick={() =>
                setSelectedType(employeeType)
              }
              className={`rounded-2xl border p-5 text-right transition ${
                selected
                  ? "border-yellow-500/40 bg-yellow-500/10"
                  : "border-white/10 bg-[#141414] hover:border-white/20"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <Icon
                  size={25}
                  className={
                    selected
                      ? "text-yellow-400"
                      : "text-zinc-500"
                  }
                />

                <span
                  className={`rounded-full px-3 py-1 text-xs font-black ${
                    selected
                      ? "bg-yellow-500/15 text-yellow-400"
                      : "bg-white/5 text-zinc-500"
                  }`}
                >
                  المتبقي {data.remaining}
                </span>
              </div>

              <h3 className="mt-4 font-black text-white">
                {
                  EMPLOYEE_TYPE_LABELS[
                    employeeType
                  ]
                }
              </h3>

              <p className="mt-2 text-xs leading-6 text-zinc-500">
                {typeDescriptions[employeeType]}
              </p>

              <div className="mt-4 flex items-end gap-2">
                <strong className="text-3xl font-black text-yellow-400">
                  {data.used}
                </strong>

                <span className="pb-1 text-sm text-zinc-500">
                  من {data.capacity}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="rounded-[28px] border border-white/10 bg-[#141414] p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-black text-white">
              {
                EMPLOYEE_TYPE_LABELS[
                  selectedType
                ]
              }
            </h3>

            <p className="mt-1 text-sm text-zinc-500">
              المستخدم {selectedTotal.used} —
              المتبقي{" "}
              {selectedTotal.remaining}
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-4 py-2 text-sm font-black text-yellow-400">
            <ShieldCheck size={17} />
            السعة الكلية{" "}
            {selectedTotal.capacity}
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {selectedLevels.map((level) => {
            const capacity = getLevelCapacity(
              selectedType,
              level
            );

            const used = employees.filter(
              (employee) =>
                employee.employeeType ===
                  selectedType &&
                employee.level === level
            ).length;

            const remaining = Math.max(
              0,
              capacity - used
            );

            const percentage =
              capacity === 0
                ? 0
                : Math.min(
                    100,
                    Math.round(
                      (used / capacity) * 100
                    )
                  );

            const full =
              capacity > 0 && used >= capacity;

            const style = getOccupancyStyle(
              percentage,
              full
            );

            return (
              <article
                key={`${selectedType}-${level}`}
                className={`rounded-2xl border p-4 ${style.border} ${style.background}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-black text-white">
                    المستوى {level}
                  </h4>

                  <span
                    className={`rounded-full bg-black/25 px-2 py-1 text-[11px] font-black ${style.text}`}
                  >
                    {style.label}
                  </span>
                </div>

                <div className="mt-4 flex items-end gap-2">
                  <strong
                    className={`text-2xl font-black ${style.text}`}
                  >
                    {used}
                  </strong>

                  <span className="pb-0.5 text-xs text-zinc-500">
                    من {capacity}
                  </span>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/40">
                  <div
                    className={`h-full rounded-full transition-all ${style.progress}`}
                    style={{
                      width: `${percentage}%`,
                    }}
                  />
                </div>

                <p className="mt-3 text-xs text-zinc-500">
                  المتبقي:{" "}
                  <span
                    className={`font-black ${style.text}`}
                  >
                    {remaining}
                  </span>
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}