"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  doc,
  onSnapshot,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import {
  CheckCircle2,
  FileText,
  Loader2,
  Minus,
  Plus,
} from "lucide-react";

import { addActivity } from "@/lib/activity";
import { db } from "@/lib/firebase";
import {
  promotionRules,
  type EmployeeReports,
} from "@/lib/promotionRules";

type ReportKey =
  | "fieldGuide"
  | "fieldSupervisor"
  | "generalSupervisor"
  | "recruitment";

type ReportsCardProps = {
  id: string;
  reports?: EmployeeReports;
};

type EmployeeSnapshot = {
  name: string;
  level: number;
  employeeType: string;
  reports: EmployeeReports;
};

const REPORT_DEFINITIONS: Array<{
  key: ReportKey;
  label: string;
}> = [
  {
    key: "fieldGuide",
    label: "التوجيه الميداني",
  },
  {
    key: "fieldSupervisor",
    label: "الإشراف الميداني",
  },
  {
    key: "generalSupervisor",
    label: "الإشراف العام",
  },
  {
    key: "recruitment",
    label: "التوظيف",
  },
];

function toSafeNumber(
  value: unknown
) {
  const converted = Number(
    value ?? 0
  );

  return Number.isFinite(converted)
    ? Math.max(
        0,
        Math.trunc(converted)
      )
    : 0;
}

export default function ReportsCard({
  id,
  reports: initialReports = {},
}: ReportsCardProps) {
  const [employee, setEmployee] =
    useState<EmployeeSnapshot>({
      name: "",
      level: 0,
      employeeType: "main",
      reports: initialReports,
    });

  const [loading, setLoading] =
    useState(true);
  const [updatingKey, setUpdatingKey] =
    useState<ReportKey | null>(null);
  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, "employees", id),
      (snapshot) => {
        if (!snapshot.exists()) {
          setLoading(false);
          return;
        }

        const data = snapshot.data();

        setEmployee({
          name: String(
            data.name ?? ""
          ),
          level: toSafeNumber(
            data.level
          ),
          employeeType: String(
            data.employeeType ??
              "main"
          ),
          reports:
            data.reports &&
            typeof data.reports ===
              "object"
              ? (data.reports as EmployeeReports)
              : {},
        });

        setLoading(false);
        setErrorMessage("");
      },
      (error) => {
        console.error(
          "تعذر تحميل تقارير الموظف:",
          error
        );

        setLoading(false);
        setErrorMessage(
          "تعذر تحميل التقارير."
        );
      }
    );

    return () => unsubscribe();
  }, [id]);

  const rule = useMemo(
    () =>
      promotionRules[
        employee.level
      ] ?? null,
    [employee.level]
  );

  const requiredReports =
    useMemo(() => {
      if (
        employee.employeeType ===
          "administration" ||
        employee.employeeType ===
          "certified" ||
        employee.employeeType ===
          "certified_leader" ||
        !rule
      ) {
        return [];
      }

      return REPORT_DEFINITIONS.map(
        (definition) => ({
          ...definition,
          current: toSafeNumber(
            employee.reports[
              definition.key
            ]
          ),
          required: toSafeNumber(
            rule.reports[
              definition.key
            ]
          ),
        })
      ).filter(
        (report) =>
          report.required > 0
      );
    }, [
      employee.employeeType,
      employee.reports,
      rule,
    ]);

  async function changeReport(
    key: ReportKey,
    amount: 1 | -1
  ) {
    if (updatingKey) {
      return;
    }

    try {
      setUpdatingKey(key);
      setErrorMessage("");

      const employeeReference =
        doc(
          db,
          "employees",
          id
        );

      let nextValue = 0;

      await runTransaction(
        db,
        async (transaction) => {
          const snapshot =
            await transaction.get(
              employeeReference
            );

          if (!snapshot.exists()) {
            throw new Error(
              "employee_not_found"
            );
          }

          const data =
            snapshot.data();

          const currentReports =
            data.reports &&
            typeof data.reports ===
              "object"
              ? (data.reports as Record<
                  string,
                  unknown
                >)
              : {};

          const currentValue =
            toSafeNumber(
              currentReports[key]
            );

          nextValue = Math.max(
            0,
            currentValue + amount
          );

          transaction.update(
            employeeReference,
            {
              [`reports.${key}`]:
                nextValue,
              updatedAt:
                serverTimestamp(),
            }
          );
        }
      );

      try {
        const reportLabel =
          REPORT_DEFINITIONS.find(
            (item) =>
              item.key === key
          )?.label ?? key;

        await addActivity(
          `${amount > 0 ? "زيادة" : "خفض"} ${reportLabel} للموظف ${
            employee.name || id
          } إلى ${nextValue}`
        );
      } catch (activityError) {
        console.error(
          "تعذر تسجيل نشاط التقرير:",
          activityError
        );
      }
    } catch (error) {
      console.error(
        "تعذر تحديث التقرير:",
        error
      );

      setErrorMessage(
        "حدث خطأ أثناء تحديث التقرير."
      );
    } finally {
      setUpdatingKey(null);
    }
  }

  if (loading) {
    return (
      <article className="flex min-h-[300px] items-center justify-center rounded-3xl border border-white/10 bg-[#141414]/90 p-6">
        <Loader2 className="animate-spin text-yellow-400" />
      </article>
    );
  }

  const specialMessage =
    employee.employeeType ===
    "administration"
      ? "موظف الإدارة لا يخضع للتقارير أو شروط الترقية."
      : employee.employeeType ===
            "certified" ||
          employee.employeeType ===
            "certified_leader"
        ? "ترقية اللاعب المعتمد تعتمد على أيام الحضور والدورات المعتمدة، ولا تعتمد على التقارير."
        : !rule
          ? "لا توجد متطلبات تقارير مسجلة لهذا المستوى."
          : requiredReports.length ===
              0
            ? "لا توجد تقارير مطلوبة للترقية من هذا المستوى."
            : "";

  return (
    <article
      dir="rtl"
      className="rounded-3xl border border-white/10 bg-[#141414]/90 p-6 backdrop-blur-xl"
    >
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-yellow-400">
            التقارير
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            المتطلبات الفعلية للترقية
            من المستوى{" "}
            {employee.level || "—"}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-yellow-500/20 bg-yellow-500/10 text-yellow-400">
          <FileText size={22} />
        </div>
      </div>

      {errorMessage && (
        <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-400">
          {errorMessage}
        </div>
      )}

      {specialMessage ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm leading-7 text-zinc-400">
          {specialMessage}
        </div>
      ) : (
        <div className="space-y-4">
          {requiredReports.map(
            ({
              key,
              label,
              current,
              required,
            }) => {
              const complete =
                current >= required;

              const percentage =
                required > 0
                  ? Math.min(
                      100,
                      Math.round(
                        (current /
                          required) *
                          100
                      )
                    )
                  : 100;

              const remaining =
                Math.max(
                  0,
                  required - current
                );

              return (
                <section
                  key={key}
                  className={`rounded-2xl border p-4 ${
                    complete
                      ? "border-green-500/20 bg-green-500/[0.05]"
                      : "border-white/10 bg-white/[0.03]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-white">
                          {label}
                        </h3>

                        {complete && (
                          <CheckCircle2
                            size={17}
                            className="text-green-400"
                          />
                        )}
                      </div>

                      <p className="mt-1 text-xs text-zinc-500">
                        {complete
                          ? "مكتمل"
                          : `المتبقي ${remaining}`}
                      </p>
                    </div>

                    <div
                      dir="ltr"
                      className="font-mono text-lg font-black text-yellow-400"
                    >
                      {current} /{" "}
                      {required}
                    </div>
                  </div>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-black/40">
                    <div
                      className={`h-full rounded-full transition-all ${
                        complete
                          ? "bg-green-500"
                          : "bg-yellow-500"
                      }`}
                      style={{
                        width: `${percentage}%`,
                      }}
                    />
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        changeReport(
                          key,
                          1
                        )
                      }
                      disabled={
                        updatingKey !==
                        null
                      }
                      className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 font-black text-white transition hover:bg-green-500 disabled:opacity-50"
                    >
                      {updatingKey ===
                      key ? (
                        <Loader2
                          size={17}
                          className="animate-spin"
                        />
                      ) : (
                        <Plus size={17} />
                      )}

                      إضافة
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        changeReport(
                          key,
                          -1
                        )
                      }
                      disabled={
                        updatingKey !==
                          null ||
                        current <= 0
                      }
                      className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 font-black text-white transition hover:bg-red-500 disabled:opacity-50"
                    >
                      <Minus size={17} />
                      خصم
                    </button>
                  </div>
                </section>
              );
            }
          )}
        </div>
      )}
    </article>
  );
}