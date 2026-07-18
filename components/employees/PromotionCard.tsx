import {
  CheckCircle2,
  FileText,
  GraduationCap,
  Trophy,
  XCircle,
} from "lucide-react";

import {
  getPromotionEligibility,
  type EmployeeReports,
} from "@/lib/promotionRules";

type Employee = {
  level?: number | string;
  reports?: EmployeeReports;
  courses?: string[];
};

type Props = {
  employee: Employee;
};

const reportLabels: Record<
  keyof EmployeeReports,
  string
> = {
  fieldGuide: "التوجيه الميداني",
  fieldSupervisor: "الإشراف الميداني",
  recruitment: "تقارير التوظيف",
  generalSupervisor: "الإشراف العام",
};

function getNumber(value: unknown) {
  const numberValue = Number(value ?? 0);

  return Number.isFinite(numberValue)
    ? numberValue
    : 0;
}

export default function PromotionCard({
  employee,
}: Props) {
  const result =
    getPromotionEligibility(employee);

  const employeeCourses = Array.isArray(
    employee.courses
  )
    ? employee.courses
    : [];

  const reports = employee.reports ?? {};

  const reportRequirements = result.rule
    ? (
        Object.entries(
          result.rule.reports
        ) as Array<
          [
            keyof EmployeeReports,
            number | undefined,
          ]
        >
      ).filter(
        ([, required]) =>
          getNumber(required) > 0
      )
    : [];

  const isMaxLevel =
    result.status === "max_level";

  const hasNoRule =
    result.status === "no_rule";

  const statusText = isMaxLevel
    ? "أعلى مستوى في القطاع 🏆"
    : hasNoRule
      ? "لا توجد شروط ترقية لهذا المستوى"
      : result.eligible
        ? "مؤهل للترقية ✅"
        : "غير مؤهل حاليًا ❌";

  const statusStyle = isMaxLevel
    ? "text-yellow-400"
    : hasNoRule
      ? "text-zinc-400"
      : result.eligible
        ? "text-green-400"
        : "text-red-400";

  return (
    <section
      dir="rtl"
      className="rounded-3xl border border-yellow-500/20 bg-[#141414] p-6 md:p-8"
    >
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div>
          <h2 className="text-3xl font-black text-yellow-400">
            التقدم للترقية
          </h2>

          <p className="mt-2 text-zinc-500">
            يتم احتساب الدورات والتقارير
            المطلوبة حسب مستوى الموظف.
          </p>
        </div>

        <div className="text-right md:text-left">
          <h2 className="text-5xl font-black text-white">
            {result.progress}%
          </h2>

          <p
            className={`mt-2 font-black ${statusStyle}`}
          >
            {statusText}
          </p>
        </div>
      </div>

      <div className="mt-8 h-4 overflow-hidden rounded-full bg-zinc-800">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            isMaxLevel
              ? "bg-yellow-500"
              : result.eligible
                ? "bg-green-500"
                : "bg-gradient-to-r from-yellow-500 to-yellow-300"
          }`}
          style={{
            width: `${result.progress}%`,
          }}
        />
      </div>

      {isMaxLevel ? (
        <div className="mt-8 flex items-center gap-4 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-6 text-yellow-400">
          <Trophy size={32} />

          <div>
            <h3 className="text-xl font-black">
              وصل إلى أعلى مستوى
            </h3>

            <p className="mt-1 text-sm text-yellow-200/70">
              لا توجد ترقية أعلى من المستوى
              العاشر.
            </p>
          </div>
        </div>
      ) : hasNoRule ? (
        <div className="mt-8 rounded-2xl border border-dashed border-white/10 p-6 text-center text-zinc-500">
          لم تتم إضافة شروط ترقية لهذا
          المستوى.
        </div>
      ) : (
        <>
          <div className="mt-8">
            <div className="mb-4 flex items-center gap-2">
              <GraduationCap
                size={22}
                className="text-yellow-400"
              />

              <h3 className="text-xl font-black text-white">
                الدورات المطلوبة
              </h3>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {result.rule?.courses.map(
                (course) => {
                  const done =
                    employeeCourses.includes(
                      course
                    );

                  return (
                    <div
                      key={course}
                      className={`rounded-2xl border p-5 transition ${
                        done
                          ? "border-green-500/20 bg-green-500/10"
                          : "border-red-500/20 bg-red-500/10"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {done ? (
                          <CheckCircle2
                            size={20}
                            className="shrink-0 text-green-400"
                          />
                        ) : (
                          <XCircle
                            size={20}
                            className="shrink-0 text-red-400"
                          />
                        )}

                        <p
                          className={`font-bold ${
                            done
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {course}
                        </p>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>

          <div className="mt-8">
            <div className="mb-4 flex items-center gap-2">
              <FileText
                size={22}
                className="text-yellow-400"
              />

              <h3 className="text-xl font-black text-white">
                التقارير المطلوبة
              </h3>
            </div>

            {reportRequirements.length ===
            0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-zinc-500">
                لا توجد تقارير مطلوبة لهذا
                المستوى.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {reportRequirements.map(
                  ([
                    reportKey,
                    requiredValue,
                  ]) => {
                    const current =
                      getNumber(
                        reports[reportKey]
                      );

                    const required =
                      getNumber(
                        requiredValue
                      );

                    const done =
                      current >= required;

                    const percentage =
                      required === 0
                        ? 100
                        : Math.min(
                            100,
                            Math.round(
                              (current /
                                required) *
                                100
                            )
                          );

                    return (
                      <div
                        key={reportKey}
                        className={`rounded-2xl border p-5 ${
                          done
                            ? "border-green-500/20 bg-green-500/5"
                            : "border-white/10 bg-white/[0.03]"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-black text-zinc-200">
                            {
                              reportLabels[
                                reportKey
                              ]
                            }
                          </p>

                          <span
                            className={`font-black ${
                              done
                                ? "text-green-400"
                                : "text-yellow-400"
                            }`}
                          >
                            {current}/
                            {required}
                          </span>
                        </div>

                        <div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-800">
                          <div
                            className={
                              done
                                ? "h-full rounded-full bg-green-500"
                                : "h-full rounded-full bg-yellow-500"
                            }
                            style={{
                              width: `${percentage}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </div>

          {result.eligible && (
            <div className="mt-8 flex items-center gap-3 rounded-2xl border border-green-500/20 bg-green-500/10 p-5 font-black text-green-400">
              <CheckCircle2 size={24} />
              أكمل الموظف جميع شروط
              الترقية.
            </div>
          )}
        </>
      )}
    </section>
  );
}