"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  collection,
  onSnapshot,
} from "firebase/firestore";
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

type CapacityType = Exclude<
  EmployeeType,
  "administration"
>;

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
} satisfies Record<
  CapacityType,
  typeof Users
>;

const typeDescriptions: Record<
  CapacityType,
  string
> = {
  main: "أكواد G الخاصة بالموظفين الأساسيين من المستوى 1 إلى 8.",
  leader: "أكواد القيادة G-010 إلى G-001 للمستويين 9 و10.",
  certified: "أكواد C الخاصة باللاعبين المعتمدين.",
  certified_leader: "أكواد CA الخاصة بالقيادات المعتمدة.",
};

const LEVEL_THEMES: Record<
  LevelNumber,
  {
    border: string;
    background: string;
    text: string;
    progress: string;
    glow: string;
    badge: string;
  }
> = {
  1: {
    border: "border-cyan-400/30",
    background:
      "bg-gradient-to-br from-cyan-500/15 via-[#141414] to-[#101010]",
    text: "text-cyan-300",
    progress: "bg-cyan-400",
    glow: "bg-cyan-500/15",
    badge:
      "border-cyan-400/25 bg-cyan-500/10 text-cyan-300",
  },
  2: {
    border: "border-emerald-400/30",
    background:
      "bg-gradient-to-br from-emerald-500/15 via-[#141414] to-[#101010]",
    text: "text-emerald-300",
    progress: "bg-emerald-400",
    glow: "bg-emerald-500/15",
    badge:
      "border-emerald-400/25 bg-emerald-500/10 text-emerald-300",
  },
  3: {
    border: "border-lime-400/30",
    background:
      "bg-gradient-to-br from-lime-500/15 via-[#141414] to-[#101010]",
    text: "text-lime-300",
    progress: "bg-lime-400",
    glow: "bg-lime-500/15",
    badge:
      "border-lime-400/25 bg-lime-500/10 text-lime-300",
  },
  4: {
    border: "border-yellow-400/30",
    background:
      "bg-gradient-to-br from-yellow-500/15 via-[#141414] to-[#101010]",
    text: "text-yellow-300",
    progress: "bg-yellow-400",
    glow: "bg-yellow-500/15",
    badge:
      "border-yellow-400/25 bg-yellow-500/10 text-yellow-300",
  },
  5: {
    border: "border-orange-400/30",
    background:
      "bg-gradient-to-br from-orange-500/15 via-[#141414] to-[#101010]",
    text: "text-orange-300",
    progress: "bg-orange-400",
    glow: "bg-orange-500/15",
    badge:
      "border-orange-400/25 bg-orange-500/10 text-orange-300",
  },
  6: {
    border: "border-rose-400/30",
    background:
      "bg-gradient-to-br from-rose-500/15 via-[#141414] to-[#101010]",
    text: "text-rose-300",
    progress: "bg-rose-400",
    glow: "bg-rose-500/15",
    badge:
      "border-rose-400/25 bg-rose-500/10 text-rose-300",
  },
  7: {
    border: "border-pink-400/30",
    background:
      "bg-gradient-to-br from-pink-500/15 via-[#141414] to-[#101010]",
    text: "text-pink-300",
    progress: "bg-pink-400",
    glow: "bg-pink-500/15",
    badge:
      "border-pink-400/25 bg-pink-500/10 text-pink-300",
  },
  8: {
    border: "border-violet-400/30",
    background:
      "bg-gradient-to-br from-violet-500/15 via-[#141414] to-[#101010]",
    text: "text-violet-300",
    progress: "bg-violet-400",
    glow: "bg-violet-500/15",
    badge:
      "border-violet-400/25 bg-violet-500/10 text-violet-300",
  },
  9: {
    border: "border-indigo-400/30",
    background:
      "bg-gradient-to-br from-indigo-500/15 via-[#141414] to-[#101010]",
    text: "text-indigo-300",
    progress: "bg-indigo-400",
    glow: "bg-indigo-500/15",
    badge:
      "border-indigo-400/25 bg-indigo-500/10 text-indigo-300",
  },
  10: {
    border: "border-red-400/35",
    background:
      "bg-gradient-to-br from-red-500/20 via-[#141414] to-[#101010]",
    text: "text-red-300",
    progress: "bg-red-400",
    glow: "bg-red-500/20",
    badge:
      "border-red-400/30 bg-red-500/10 text-red-300",
  },
};

function isCapacityType(
  employeeType: EmployeeType
): employeeType is CapacityType {
  return employeeType !==
    "administration";
}

function getCapacityLevels(
  employeeType: CapacityType
): LevelNumber[] {
  return getLevelsForEmployeeType(
    employeeType
  );
}

function getOccupancyLabel(
  percentage: number,
  full: boolean
) {
  if (full) {
    return {
      label: "مكتمل",
      style:
        "border-red-400/25 bg-red-500/10 text-red-300",
    };
  }

  if (percentage >= 75) {
    return {
      label: "قريب من الاكتمال",
      style:
        "border-orange-400/25 bg-orange-500/10 text-orange-300",
    };
  }

  return {
    label: "متاح",
    style:
      "border-emerald-400/25 bg-emerald-500/10 text-emerald-300",
  };
}

export default function LevelCapacityStats({
  employees: employeesProp,
  title = "إشغال المستويات",
}: LevelCapacityStatsProps) {
  const [
    remoteEmployees,
    setRemoteEmployees,
  ] = useState<EmployeeRecord[]>([]);
  const [loading, setLoading] =
    useState(!employeesProp);
  const [
    selectedType,
    setSelectedType,
  ] =
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
          snapshot.docs.map(
            (employeeDocument) =>
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
        capacity:
          getTotalCapacity("main"),
        remaining: 0,
      },
      leader: {
        used: 0,
        capacity:
          getTotalCapacity("leader"),
        remaining: 0,
      },
      certified: {
        used: 0,
        capacity:
          getTotalCapacity(
            "certified"
          ),
        remaining: 0,
      },
      certified_leader: {
        used: 0,
        capacity:
          getTotalCapacity(
            "certified_leader"
          ),
        remaining: 0,
      },
    };

    for (const employee of employees) {
      if (
        !isCapacityType(
          employee.employeeType
        )
      ) {
        continue;
      }

      result[
        employee.employeeType
      ].used += 1;
    }

    for (const employeeType of
      CAPACITY_TYPES) {
      result[
        employeeType
      ].remaining = Math.max(
        0,
        result[employeeType]
          .capacity -
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

  const selectedTotal =
    totals[selectedType];

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
          كل مستوى صار له لون مستقل،
          مع بقاء حالة الإشغال واضحة.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {CAPACITY_TYPES.map(
          (employeeType) => {
            const Icon =
              typeIcons[employeeType];
            const data =
              totals[employeeType];
            const selected =
              selectedType ===
              employeeType;

            return (
              <button
                key={employeeType}
                type="button"
                onClick={() =>
                  setSelectedType(
                    employeeType
                  )
                }
                className={`rounded-2xl border p-5 text-right transition ${
                  selected
                    ? "border-yellow-500/40 bg-yellow-500/10 shadow-lg shadow-yellow-500/5"
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
                    المتبقي{" "}
                    {data.remaining}
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
                  {
                    typeDescriptions[
                      employeeType
                    ]
                  }
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
          }
        )}
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
              المستخدم{" "}
              {selectedTotal.used} —
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
          {selectedLevels.map(
            (level) => {
              const capacity =
                getLevelCapacity(
                  selectedType,
                  level
                );

              const used =
                employees.filter(
                  (employee) =>
                    employee.employeeType ===
                      selectedType &&
                    employee.level === level
                ).length;

              const remaining =
                Math.max(
                  0,
                  capacity - used
                );

              const percentage =
                capacity === 0
                  ? 0
                  : Math.min(
                      100,
                      Math.round(
                        (used /
                          capacity) *
                          100
                      )
                    );

              const full =
                capacity > 0 &&
                used >= capacity;

              const occupancy =
                getOccupancyLabel(
                  percentage,
                  full
                );

              const theme =
                LEVEL_THEMES[level];

              return (
                <article
                  key={`${selectedType}-${level}`}
                  className={`group relative overflow-hidden rounded-3xl border p-5 shadow-lg shadow-black/20 transition hover:-translate-y-1 ${theme.border} ${theme.background}`}
                >
                  <div
                    className={`pointer-events-none absolute -left-8 -top-8 h-24 w-24 rounded-full blur-3xl ${theme.glow}`}
                  />

                  <div className="relative">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`flex h-11 w-11 items-center justify-center rounded-2xl border text-xl font-black ${theme.badge}`}
                      >
                        {level}
                      </span>

                      <span
                        className={`rounded-full border px-2.5 py-1 text-[10px] font-black ${occupancy.style}`}
                      >
                        {
                          occupancy.label
                        }
                      </span>
                    </div>

                    <h4 className="mt-4 font-black text-white">
                      المستوى {level}
                    </h4>

                    <div className="mt-4 flex items-end gap-2">
                      <strong
                        className={`text-3xl font-black ${theme.text}`}
                      >
                        {used}
                      </strong>

                      <span className="pb-1 text-xs text-zinc-500">
                        من {capacity}
                      </span>
                    </div>

                    <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-black/45">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${theme.progress}`}
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>

                    <div className="mt-4 flex items-center justify-between text-xs">
                      <span className="text-zinc-500">
                        المتبقي
                      </span>

                      <strong
                        className={theme.text}
                      >
                        {remaining}
                      </strong>
                    </div>
                  </div>
                </article>
              );
            }
          )}
        </div>
      </div>
    </section>
  );
}
