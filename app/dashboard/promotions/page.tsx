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
  AlertTriangle,
  CheckCircle2,
  Loader2,
  TrendingUp,
} from "lucide-react";

import { db } from "@/lib/firebase";

import {
  getPromotionEligibility,
  type EmployeeReports,
} from "@/lib/promotionRules";

import PromotionProgress from "@/components/promotions/PromotionProgress";
import PromoteButton from "@/components/promotions/PromoteButton";
import RoleGuard from "@/components/auth/RoleGuard";

type Employee = {
  id: string;
  name: string;

  rank?: string;
  fullCode?: string;

  level?: number | string;

  /*
    نوع الموظف:

    main = موظف ميكانيك أساسي G
    certified = لاعب معتمد C
    certified_leader = قيادة معتمدة CA
  */

  employeeType?: string;
  codePrefix?: string;

  certified?: boolean;
  certifiedLeader?: boolean;

  reports?: EmployeeReports;
  courses?: string[];

  status?: string;

  leave?: {
    active?: boolean;
  } | null;
};

function getNumber(
  value: unknown
) {
  const numberValue = Number(
    value ?? 0
  );

  return Number.isFinite(
    numberValue
  )
    ? numberValue
    : 0;
}

/*
  تحدد هل الشخص موظف ميكانيك أساسي G.

  تستبعد:
  C  = لاعب معتمد
  CA = قيادة معتمدة
*/

function isMainMechanic(
  employee: Employee
) {
  const employeeType = String(
    employee.employeeType ?? ""
  )
    .trim()
    .toLowerCase();

  const codePrefix = String(
    employee.codePrefix ?? ""
  )
    .trim()
    .toUpperCase();

  const fullCode = String(
    employee.fullCode ??
      employee.rank ??
      ""
  )
    .trim()
    .toUpperCase();

  /*
    نستبعد المعتمدين أولًا.
  */

  if (
    employeeType === "certified" ||
    employeeType ===
      "certified_leader" ||
    codePrefix === "C" ||
    codePrefix === "CA" ||
    fullCode.startsWith("C-") ||
    fullCode.startsWith("CA-")
  ) {
    return false;
  }

  /*
    ندخل موظفي G فقط.

    وندعم الموظفين القدامى الذين
    لم يكن عندهم employeeType.
  */

  return (
    employeeType === "main" ||
    codePrefix === "G" ||
    fullCode.startsWith("G-")
  );
}

function getEmployeeStatus(
  employee: Employee
) {
  const rawStatus = String(
    employee.status ?? "active"
  ).trim();

  const onLeave =
    employee.leave?.active === true ||
    rawStatus === "leave" ||
    rawStatus === "إجازة" ||
    rawStatus === "في إجازة";

  if (onLeave) {
    return {
      label: "في إجازة",

      style:
        "border-orange-500/20 bg-orange-500/10 text-orange-400",
    };
  }

  const suspended =
    rawStatus === "suspended" ||
    rawStatus === "موقوف";

  if (suspended) {
    return {
      label: "موقوف",

      style:
        "border-red-500/20 bg-red-500/10 text-red-400",
    };
  }

  return {
    label: "على رأس العمل",

    style:
      "border-green-500/20 bg-green-500/10 text-green-400",
  };
}

export default function PromotionsPage() {
  const [
    employees,
    setEmployees,
  ] = useState<Employee[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(
        db,
        "employees"
      ),

      (snapshot) => {
        const nextEmployees =
          snapshot.docs.map(
            (employeeDocument) => ({
              id:
                employeeDocument.id,

              ...(employeeDocument.data() as Omit<
                Employee,
                "id"
              >),
            })
          );

        setEmployees(
          nextEmployees
        );

        setLoading(false);
        setErrorMessage("");
      },

      (error) => {
        console.error(
          "تعذر تحميل الترقيات:",
          error
        );

        setLoading(false);

        setErrorMessage(
          "تعذر تحميل بيانات الترقيات."
        );
      }
    );

    return () => unsubscribe();
  }, []);

  const mainMechanics =
    useMemo(() => {
      return employees.filter(
        isMainMechanic
      );
    }, [employees]);

  const promotionEmployees =
    useMemo(() => {
      return mainMechanics
        .map((employee) => {
          const eligibility =
            getPromotionEligibility(
              employee
            );

          return {
            employee,
            eligibility,
          };
        })

        /*
          أي مستوى لا توجد له شروط
          ترقية لن يظهر في الصفحة.

          المستوى العاشر لا يظهر لأنه
          لا توجد بعده ترقية.
        */

        .filter(
          ({ eligibility }) =>
            eligibility.rule !== null
        )

        /*
          الجاهزون يظهرون أولًا.

          الموظف لا يختفي عند وصوله
          إلى 100%، بل يبقى حتى تتم
          ترقيته يدويًا.
        */

        .sort(
          (
            first,
            second
          ) => {
            if (
              first.eligibility
                .eligible !==
              second.eligibility
                .eligible
            ) {
              return first
                .eligibility
                .eligible
                ? -1
                : 1;
            }

            if (
              first.eligibility
                .level !==
              second.eligibility
                .level
            ) {
              return (
                second.eligibility
                  .level -
                first.eligibility
                  .level
              );
            }

            return String(
              first.employee.name ??
                ""
            ).localeCompare(
              String(
                second.employee.name ??
                  ""
              ),
              "ar"
            );
          }
        );
    }, [mainMechanics]);

  const eligibleCount =
    promotionEmployees.filter(
      ({ eligibility }) =>
        eligibility.eligible
    ).length;

  if (loading) {
    return (
      <main className="flex min-h-[500px] items-center justify-center">
        <div className="text-center">
          <Loader2
            size={45}
            className="mx-auto animate-spin text-yellow-400"
          />

          <p className="mt-4 font-bold text-zinc-400">
            جارٍ تحميل ترقيات
            الميكانيكيين...
          </p>
        </div>
      </main>
    );
  }

  return (
    <RoleGuard
      allow={[
        "owner",
        "leader",
        "supervisor",
      ]}
    >
      <main
        dir="rtl"
        className="space-y-8"
      >
        <header className="flex flex-wrap items-center justify-between gap-5">
          <div>
            <h1 className="text-4xl font-black text-yellow-400">
              ترقيات موظفي الميكانيك
            </h1>

            <p className="mt-2 text-zinc-500">
              هذا القسم مخصص لموظفي
              الميكانيك الأساسيين أصحاب
              أكواد G فقط.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-green-500/20 bg-green-500/10 px-5 py-3 font-black text-green-400">
            <TrendingUp
              size={21}
            />

            الجاهزون للترقية:{" "}
            {eligibleCount}
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2">
          <article className="rounded-3xl border border-yellow-500/20 bg-yellow-500/5 p-5">
            <p className="text-sm font-bold text-yellow-300">
              موظفو الميكانيك داخل
              نظام الترقيات
            </p>

            <p className="mt-3 text-4xl font-black text-yellow-400">
              {
                mainMechanics.length
              }
            </p>
          </article>

          <article className="rounded-3xl border border-green-500/20 bg-green-500/5 p-5">
            <p className="text-sm font-bold text-green-300">
              المستحقون حاليًا
            </p>

            <p className="mt-3 text-4xl font-black text-green-400">
              {eligibleCount}
            </p>
          </article>
        </section>

        {errorMessage && (
          <div className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-5 font-bold text-red-400">
            <AlertTriangle
              size={21}
            />

            {errorMessage}
          </div>
        )}

        {promotionEmployees.length ===
        0 ? (
          <div className="rounded-3xl border border-dashed border-white/10 bg-[#141414] p-12 text-center">
            <TrendingUp
              size={42}
              className="mx-auto text-zinc-700"
            />

            <h2 className="mt-5 text-2xl font-black text-zinc-300">
              لا يوجد موظفون في
              نظام الترقيات
            </h2>

            <p className="mt-3 text-zinc-500">
              لا يوجد موظفو G لديهم
              شروط ترقية مسجلة حاليًا.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {promotionEmployees.map(
              ({
                employee,
                eligibility,
              }) => {
                const rule =
                  eligibility.rule;

                if (!rule) {
                  return null;
                }

                const reports =
                  employee.reports ??
                  {};

                const status =
                  getEmployeeStatus(
                    employee
                  );

                const reportRequirements =
                  (
                    Object.entries(
                      rule.reports
                    ) as Array<
                      [
                        keyof EmployeeReports,
                        number | undefined,
                      ]
                    >
                  ).filter(
                    ([, required]) =>
                      getNumber(
                        required
                      ) > 0
                  );

                return (
                  <article
                    key={employee.id}
                    className={`rounded-3xl border bg-[#141414] p-6 transition ${
                      eligibility.eligible
                        ? "border-green-500/40 shadow-[0_0_35px_rgba(34,197,94,0.08)]"
                        : "border-yellow-500/10"
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-5">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-xs font-black text-yellow-400">
                            موظف ميكانيك G
                          </span>

                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-bold ${status.style}`}
                          >
                            {
                              status.label
                            }
                          </span>
                        </div>

                        <h2 className="mt-4 text-2xl font-black text-white">
                          {employee.name ||
                            "موظف دون اسم"}
                        </h2>

                        <p className="mt-2 font-mono text-lg font-black text-yellow-400">
                          {employee.fullCode ||
                            employee.rank ||
                            "بدون كود"}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-zinc-300">
                            المستوى{" "}
                            {
                              eligibility.level
                            }
                          </span>

                          <span className="rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-xs font-black text-yellow-400">
                            التقدم{" "}
                            {
                              eligibility.progress
                            }
                            ٪
                          </span>
                        </div>
                      </div>

                      <div
                        className={`flex items-center gap-2 rounded-xl px-4 py-2 font-black ${
                          eligibility.eligible
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {eligibility.eligible ? (
                          <CheckCircle2
                            size={19}
                          />
                        ) : (
                          <AlertTriangle
                            size={19}
                          />
                        )}

                        {eligibility.eligible
                          ? "جاهز للترقية"
                          : "غير مستحق"}
                      </div>
                    </div>

                    {reportRequirements.length >
                    0 ? (
                      <div className="mt-6">
                        <h3 className="mb-4 font-black text-white">
                          التقارير المطلوبة
                        </h3>

                        <div className="grid gap-4 md:grid-cols-2">
                          {reportRequirements.map(
                            ([
                              reportKey,
                              requiredValue,
                            ]) => (
                              <PromotionProgress
                                key={
                                  reportKey
                                }
                                title={
                                  reportKey ===
                                  "fieldGuide"
                                    ? "التوجيه الميداني"
                                    : reportKey ===
                                        "fieldSupervisor"
                                      ? "الإشراف الميداني"
                                      : reportKey ===
                                          "recruitment"
                                        ? "تقارير التوظيف"
                                        : "الإشراف العام"
                                }
                                current={getNumber(
                                  reports[
                                    reportKey
                                  ]
                                )}
                                required={getNumber(
                                  requiredValue
                                )}
                              />
                            )
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-zinc-500">
                        لا توجد تقارير مطلوبة
                        لهذا المستوى.
                      </div>
                    )}

                    <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-5">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="font-black text-white">
                          الدورات المطلوبة
                        </h3>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-black ${
                            eligibility
                              .missingCourses
                              .length === 0
                              ? "bg-green-500/10 text-green-400"
                              : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          {eligibility
                            .missingCourses
                            .length === 0
                            ? "مكتملة"
                            : `الناقص ${eligibility.missingCourses.length}`}
                        </span>
                      </div>

                      {eligibility
                        .missingCourses
                        .length > 0 ? (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {eligibility.missingCourses.map(
                            (course) => (
                              <span
                                key={
                                  course
                                }
                                className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm font-bold text-red-400"
                              >
                                {course}
                              </span>
                            )
                          )}
                        </div>
                      ) : (
                        <p className="mt-4 font-bold text-green-400">
                          تم استكمال جميع
                          الدورات المطلوبة.
                        </p>
                      )}
                    </div>

                    {eligibility.eligible && (
                      <div className="mt-6 rounded-2xl border border-green-500/20 bg-green-500/5 p-5">
                        <p className="mb-4 font-bold text-green-400">
                          الموظف أكمل جميع
                          المتطلبات وسيبقى في
                          هذه الصفحة حتى تتم
                          ترقيته يدويًا.
                        </p>

                        <PromoteButton
                          id={employee.id}
                          currentLevel={
                            eligibility.level
                          }
                          currentRank={
                            employee.fullCode ||
                            employee.rank ||
                            ""
                          }
                          employeeName={
                            employee.name
                          }
                        />
                      </div>
                    )}
                  </article>
                );
              }
            )}
          </div>
        )}
      </main>
    </RoleGuard>
  );
}