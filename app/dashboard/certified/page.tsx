"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { onAuthStateChanged } from "firebase/auth";

import {
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import {
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Crown,
  GraduationCap,
  Loader2,
  Minus,
  Plus,
  Search,
  Sparkles,
  Trophy,
  UserCheck,
  Users,
} from "lucide-react";

import { auth, db } from "@/lib/firebase";
import { addActivity } from "@/lib/activity";

import PermissionGuard from "@/components/auth/PermissionGuard";

import {
  getCertifiedPromotionEligibility,
} from "@/lib/certifiedPromotionRules";

import {
  getCodesForLevel,
  parseEmployeeCode,
  type EmployeeType,
  type LevelNumber,
} from "@/lib/employeeCodes";

type CertifiedEmployeeType =
  | "certified"
  | "certified_leader";

type Employee = {
  id: string;

  name?: string;
  discordId?: string;

  employeeType?:
    | EmployeeType
    | string;

  codePrefix?: string;
  codeNumber?: number;

  fullCode?: string;
  rank?: string;

  level?: number | string;

  mainSector?: string;

  attendanceDays?: number;

  courses?: string[];

  certified?: boolean;
  certifiedLeader?: boolean;

  status?: string;

  leave?: {
    active?: boolean;
  } | null;
};

type CertifiedEmployee =
  Omit<Employee, "employeeType"> & {
    employeeType: CertifiedEmployeeType;
  };

type TypeFilter =
  | "all"
  | CertifiedEmployeeType;

const levels = [
  "all",
  "10",
  "9",
  "8",
  "7",
  "6",
  "5",
  "4",
  "3",
  "2",
  "1",
];

function getCertifiedType(
  employee: Employee
): CertifiedEmployeeType | null {
  const code = String(
    employee.fullCode ??
      employee.rank ??
      ""
  )
    .trim()
    .toUpperCase();

  const prefix = String(
    employee.codePrefix ?? ""
  )
    .trim()
    .toUpperCase();

  if (
    employee.employeeType ===
      "certified_leader" ||
    employee.certifiedLeader === true ||
    prefix === "CA" ||
    code.startsWith("CA-")
  ) {
    return "certified_leader";
  }

  if (
    employee.employeeType ===
      "certified" ||
    prefix === "C" ||
    (
      code.startsWith("C-") &&
      !code.startsWith("CA-")
    )
  ) {
    return "certified";
  }

  return null;
}

function getSafeNumber(
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

function getEmployeeStatus(
  employee: Employee
) {
  const rawStatus = String(
    employee.status ?? "active"
  ).trim();

  if (
    employee.leave?.active === true ||
    rawStatus === "leave" ||
    rawStatus === "إجازة" ||
    rawStatus === "في إجازة"
  ) {
    return {
      label: "في إجازة",
      style:
        "border-orange-500/20 bg-orange-500/10 text-orange-400",
    };
  }

  if (
    rawStatus === "suspended" ||
    rawStatus === "موقوف"
  ) {
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

export default function CertifiedPlayersPage() {
  const [
    employees,
    setEmployees,
  ] = useState<Employee[]>([]);

  const [search, setSearch] =
    useState("");

  const [
    typeFilter,
    setTypeFilter,
  ] = useState<TypeFilter>("all");

  const [
    levelFilter,
    setLevelFilter,
  ] = useState("all");

  const [role, setRole] =
    useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    loadingRole,
    setLoadingRole,
  ] = useState(true);

  const [
    processingId,
    setProcessingId,
  ] = useState<string | null>(
    null
  );

  const [
    loadError,
    setLoadError,
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
        setLoadError("");
      },

      (error) => {
        console.error(
          "تعذر تحميل المعتمدين:",
          error
        );

        setLoading(false);

        setLoadError(
          "تعذر تحميل بيانات اللاعبين المعتمدين."
        );
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let unsubscribeUser:
      | (() => void)
      | undefined;

    const unsubscribeAuth =
      onAuthStateChanged(
        auth,
        (user) => {
          unsubscribeUser?.();

          if (!user) {
            setRole("");
            setLoadingRole(false);
            return;
          }

          unsubscribeUser =
            onSnapshot(
              doc(
                db,
                "users",
                user.uid
              ),

              (snapshot) => {
                setRole(
                  String(
                    snapshot.data()
                      ?.role ?? ""
                  )
                );

                setLoadingRole(false);
              },

              (error) => {
                console.error(
                  "تعذر تحميل الصلاحية:",
                  error
                );

                setRole("");
                setLoadingRole(false);
              }
            );
        }
      );

    return () => {
      unsubscribeUser?.();
      unsubscribeAuth();
    };
  }, []);

  const canManage =
    role === "owner" ||
    role === "leader";

  /*
    هنا نستبعد موظفي G بالكامل.

    لا يدخل الصفحة إلا:
    C  = لاعب معتمد
    CA = قيادة معتمدة
  */

  const certifiedEmployees =
    useMemo(() => {
      return employees.flatMap(
        (employee) => {
          const employeeType =
            getCertifiedType(
              employee
            );

          if (!employeeType) {
            return [];
          }

          return [
            {
              ...employee,
              employeeType,
            } satisfies CertifiedEmployee,
          ];
        }
      );
    }, [employees]);

  const regularCertified =
    useMemo(() => {
      return certifiedEmployees.filter(
        (employee) =>
          employee.employeeType ===
          "certified"
      );
    }, [certifiedEmployees]);

  const certifiedLeaders =
    useMemo(() => {
      return certifiedEmployees.filter(
        (employee) =>
          employee.employeeType ===
          "certified_leader"
      );
    }, [certifiedEmployees]);

  const eligibleCount =
    useMemo(() => {
      return certifiedEmployees.filter(
        (employee) =>
          getCertifiedPromotionEligibility(
            employee
          ).eligible
      ).length;
    }, [certifiedEmployees]);

  const filteredEmployees =
    useMemo(() => {
      const cleanSearch = search
        .trim()
        .toLowerCase();

      return certifiedEmployees
        .filter((employee) => {
          const matchesType =
            typeFilter === "all" ||
            employee.employeeType ===
              typeFilter;

          const matchesLevel =
            levelFilter === "all" ||
            String(
              employee.level ?? ""
            ) === levelFilter;

          const matchesSearch =
            !cleanSearch ||
            String(
              employee.name ?? ""
            )
              .toLowerCase()
              .includes(cleanSearch) ||
            String(
              employee.discordId ?? ""
            )
              .toLowerCase()
              .includes(cleanSearch) ||
            String(
              employee.fullCode ??
                employee.rank ??
                ""
            )
              .toLowerCase()
              .includes(cleanSearch) ||
            String(
              employee.mainSector ?? ""
            )
              .toLowerCase()
              .includes(cleanSearch);

          return (
            matchesType &&
            matchesLevel &&
            matchesSearch
          );
        })
        .sort(
          (
            firstEmployee,
            secondEmployee
          ) => {
            const firstLevel =
              getSafeNumber(
                firstEmployee.level
              );

            const secondLevel =
              getSafeNumber(
                secondEmployee.level
              );

            if (
              firstLevel !==
              secondLevel
            ) {
              return (
                secondLevel -
                firstLevel
              );
            }

            return String(
              firstEmployee.name ?? ""
            ).localeCompare(
              String(
                secondEmployee.name ??
                  ""
              ),
              "ar"
            );
          }
        );
    }, [
      certifiedEmployees,
      levelFilter,
      search,
      typeFilter,
    ]);

  const filteredRegular =
    filteredEmployees.filter(
      (employee) =>
        employee.employeeType ===
        "certified"
    );

  const filteredLeaders =
    filteredEmployees.filter(
      (employee) =>
        employee.employeeType ===
        "certified_leader"
    );

  async function changeAttendanceDays(
    employee: CertifiedEmployee,
    amount: number
  ) {
    if (!canManage) {
      alert(
        "تعديل أيام الحضور متاح للمالك والقيادة فقط."
      );

      return;
    }

    const processKey =
      `attendance-${employee.id}`;

    if (processingId) {
      return;
    }

    const currentDays =
      Math.max(
        0,
        Math.trunc(
          getSafeNumber(
            employee.attendanceDays
          )
        )
      );

    const nextDays =
      Math.max(
        0,
        currentDays + amount
      );

    try {
      setProcessingId(
        processKey
      );

      await updateDoc(
        doc(
          db,
          "employees",
          employee.id
        ),
        {
          attendanceDays:
            nextDays,

          updatedAt:
            serverTimestamp(),
        }
      );

      try {
        await addActivity(
          `تعديل أيام حضور المعتمد ${
            employee.name ||
            "دون اسم"
          } إلى ${nextDays} يوم`
        );
      } catch (
        activityError
      ) {
        console.error(
          "تعذر تسجيل النشاط:",
          activityError
        );
      }
    } catch (error) {
      console.error(
        "تعذر تعديل أيام الحضور:",
        error
      );

      alert(
        "حدث خطأ أثناء تعديل أيام الحضور."
      );
    } finally {
      setProcessingId(null);
    }
  }

  async function promoteCertifiedEmployee(
    employee: CertifiedEmployee
  ) {
    if (!canManage) {
      alert(
        "ترقية اللاعبين المعتمدين متاحة للمالك والقيادة فقط."
      );

      return;
    }

    const eligibility =
      getCertifiedPromotionEligibility(
        employee
      );

    if (
      !eligibility.eligible
    ) {
      alert(
        "اللاعب لم يكمل أيام الحضور أو الدورات المطلوبة."
      );

      return;
    }

    if (
      eligibility.level >= 10
    ) {
      alert(
        "اللاعب في أعلى مستوى."
      );

      return;
    }

    const nextLevel =
      (
        eligibility.level + 1
      ) as LevelNumber;

    const confirmed =
      window.confirm(
        `هل أنتِ متأكدة من ترقية "${
          employee.name ||
          "دون اسم"
        }" إلى المستوى ${nextLevel}؟`
      );

    if (!confirmed) {
      return;
    }

    const processKey =
      `promotion-${employee.id}`;

    try {
      setProcessingId(
        processKey
      );

      const usedCodes =
        new Set(
          employees
            .filter(
              (otherEmployee) =>
                otherEmployee.id !==
                employee.id
            )
            .map(
              (otherEmployee) =>
                String(
                  otherEmployee.fullCode ??
                    otherEmployee.rank ??
                    ""
                )
                  .trim()
                  .toUpperCase()
            )
            .filter(Boolean)
        );

      const availableCodes =
        getCodesForLevel(
          employee.employeeType,
          nextLevel
        ).filter(
          (code) =>
            !usedCodes.has(
              code.toUpperCase()
            )
        );

      const nextCode =
        availableCodes[0];

      if (!nextCode) {
        alert(
          "لا يوجد كود متاح في المستوى التالي."
        );

        return;
      }

      const parsedCode =
        parseEmployeeCode(
          nextCode
        );

      await updateDoc(
        doc(
          db,
          "employees",
          employee.id
        ),
        {
          employeeType:
            employee.employeeType,

          certified: true,

          certifiedLeader:
            employee.employeeType ===
            "certified_leader",

          codePrefix:
            parsedCode.prefix,

          codeNumber:
            parsedCode.codeNumber,

          fullCode:
            nextCode,

          rank:
            nextCode,

          level:
            nextLevel,

          /*
            بعد الترقية يبدأ عد أيام
            المستوى الجديد من الصفر.
          */

          attendanceDays: 0,

          lastPromotion:
            serverTimestamp(),

          updatedAt:
            serverTimestamp(),
        }
      );

      try {
        await addActivity(
          `ترقية المعتمد ${
            employee.name ||
            "دون اسم"
          } من المستوى ${
            eligibility.level
          } إلى المستوى ${nextLevel} بالكود ${nextCode}`
        );
      } catch (
        activityError
      ) {
        console.error(
          "تمت الترقية لكن تعذر تسجيل النشاط:",
          activityError
        );
      }

      alert(
        `تمت الترقية بنجاح إلى ${nextCode}.`
      );
    } catch (error) {
      console.error(
        "تعذر ترقية المعتمد:",
        error
      );

      alert(
        "حدث خطأ أثناء ترقية اللاعب المعتمد."
      );
    } finally {
      setProcessingId(null);
    }
  }

  function renderEmployeeCard(
    employee: CertifiedEmployee
  ) {
    const eligibility =
      getCertifiedPromotionEligibility(
        employee
      );

    const status =
      getEmployeeStatus(
        employee
      );

    const isLeader =
      employee.employeeType ===
      "certified_leader";

    const attendanceProcessing =
      processingId ===
      `attendance-${employee.id}`;

    const promotionProcessing =
      processingId ===
      `promotion-${employee.id}`;

    const attendanceComplete =
      eligibility.requiredDays ===
        0 ||
      eligibility.attendanceDays >=
        eligibility.requiredDays;

    const coursesComplete =
      eligibility.missingCourses
        .length === 0;

    return (
      <article
        key={employee.id}
        className={`relative overflow-hidden rounded-3xl border p-6 transition ${
          isLeader
            ? "border-purple-500/25 bg-purple-500/[0.05]"
            : "border-sky-500/25 bg-sky-500/[0.05]"
        }`}
      >
        <div
          className={`absolute right-0 top-0 h-full w-1 ${
            isLeader
              ? "bg-purple-500"
              : "bg-sky-500"
          }`}
        />

        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-black ${
                  isLeader
                    ? "bg-purple-500/15 text-purple-400"
                    : "bg-sky-500/15 text-sky-400"
                }`}
              >
                {isLeader ? (
                  <Crown size={14} />
                ) : (
                  <BadgeCheck
                    size={14}
                  />
                )}

                {isLeader
                  ? "قيادة معتمدة — CA"
                  : "لاعب معتمد — C"}
              </span>

              <span
                className={`rounded-full border px-3 py-1 text-xs font-bold ${status.style}`}
              >
                {status.label}
              </span>
            </div>

            <h2 className="mt-5 text-2xl font-black text-white">
              {employee.name ||
                "لاعب دون اسم"}
            </h2>

            <p
              className={`mt-2 font-mono text-lg font-black ${
                isLeader
                  ? "text-purple-400"
                  : "text-sky-400"
              }`}
            >
              {employee.fullCode ||
                employee.rank ||
                "بدون كود"}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-zinc-300">
                المستوى{" "}
                {eligibility.level}
              </span>

              {employee.mainSector && (
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-zinc-400">
                  القطاع الأساسي:{" "}
                  {
                    employee.mainSector
                  }
                </span>
              )}
            </div>
          </div>

          <div
            className={`rounded-2xl border px-5 py-3 text-center ${
              eligibility.status ===
              "max_level"
                ? "border-yellow-500/20 bg-yellow-500/10 text-yellow-400"
                : eligibility.eligible
                  ? "border-green-500/20 bg-green-500/10 text-green-400"
                  : "border-white/10 bg-white/5 text-zinc-400"
            }`}
          >
            {eligibility.status ===
            "max_level" ? (
              <>
                <Trophy
                  size={22}
                  className="mx-auto"
                />

                <p className="mt-2 font-black">
                  أعلى مستوى
                </p>
              </>
            ) : eligibility.eligible ? (
              <>
                <CheckCircle2
                  size={22}
                  className="mx-auto"
                />

                <p className="mt-2 font-black">
                  جاهز للترقية
                </p>
              </>
            ) : (
              <>
                <Sparkles
                  size={22}
                  className="mx-auto"
                />

                <p className="mt-2 font-black">
                  التقدم{" "}
                  {
                    eligibility.progress
                  }
                  ٪
                </p>
              </>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <CalendarDays
                  size={20}
                  className={
                    attendanceComplete
                      ? "text-green-400"
                      : isLeader
                        ? "text-purple-400"
                        : "text-sky-400"
                  }
                />

                <p className="font-black text-white">
                  أيام حضور المستوى
                </p>
              </div>

              {eligibility.status !==
                "max_level" && (
                <span
                  className={`font-black ${
                    attendanceComplete
                      ? "text-green-400"
                      : "text-white"
                  }`}
                >
                  {
                    eligibility.attendanceDays
                  }
                  /
                  {
                    eligibility.requiredDays
                  }
                </span>
              )}
            </div>

            {eligibility.status ===
            "max_level" ? (
              <p className="mt-4 text-sm text-zinc-500">
                لا توجد ترقية بعد
                المستوى العاشر.
              </p>
            ) : (
              <>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className={
                      attendanceComplete
                        ? "h-full rounded-full bg-green-500"
                        : isLeader
                          ? "h-full rounded-full bg-purple-500"
                          : "h-full rounded-full bg-sky-500"
                    }
                    style={{
                      width: `${eligibility.daysProgress}%`,
                    }}
                  />
                </div>

                <p className="mt-3 text-xs text-zinc-500">
                  المتبقي:{" "}
                  {
                    eligibility.remainingDays
                  }{" "}
                  يوم
                </p>

                {canManage && (
                  <div className="mt-4 flex items-center gap-3">
                    <button
                      type="button"
                      disabled={
                        attendanceProcessing ||
                        Boolean(
                          processingId
                        )
                      }
                      onClick={() =>
                        changeAttendanceDays(
                          employee,
                          -1
                        )
                      }
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 transition hover:bg-red-500 hover:text-white disabled:opacity-40"
                    >
                      <Minus
                        size={18}
                      />
                    </button>

                    <div className="min-w-20 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-center font-black text-white">
                      {attendanceProcessing ? (
                        <Loader2
                          size={18}
                          className="mx-auto animate-spin"
                        />
                      ) : (
                        <>
                          {
                            eligibility.attendanceDays
                          }{" "}
                          يوم
                        </>
                      )}
                    </div>

                    <button
                      type="button"
                      disabled={
                        attendanceProcessing ||
                        Boolean(
                          processingId
                        )
                      }
                      onClick={() =>
                        changeAttendanceDays(
                          employee,
                          1
                        )
                      }
                      className={`flex h-10 w-10 items-center justify-center rounded-xl text-black transition disabled:opacity-40 ${
                        isLeader
                          ? "bg-purple-500 hover:bg-purple-400"
                          : "bg-sky-500 hover:bg-sky-400"
                      }`}
                    >
                      <Plus
                        size={18}
                      />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <GraduationCap
                  size={20}
                  className={
                    coursesComplete
                      ? "text-green-400"
                      : isLeader
                        ? "text-purple-400"
                        : "text-sky-400"
                  }
                />

                <p className="font-black text-white">
                  الدورات المطلوبة
                </p>
              </div>

              <span
                className={`font-black ${
                  coursesComplete
                    ? "text-green-400"
                    : "text-white"
                }`}
              >
                {
                  eligibility.completedCourses
                }
                /
                {
                  eligibility.requiredCourses
                    .length
                }
              </span>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-800">
              <div
                className={
                  coursesComplete
                    ? "h-full rounded-full bg-green-500"
                    : isLeader
                      ? "h-full rounded-full bg-purple-500"
                      : "h-full rounded-full bg-sky-500"
                }
                style={{
                  width: `${eligibility.coursesProgress}%`,
                }}
              />
            </div>

            {eligibility.missingCourses
              .length > 0 ? (
              <div className="mt-4">
                <p className="mb-2 text-xs font-bold text-red-400">
                  الدورات الناقصة:
                </p>

                <div className="flex flex-wrap gap-2">
                  {eligibility.missingCourses.map(
                    (course) => (
                      <span
                        key={
                          course
                        }
                        className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs text-red-400"
                      >
                        {course}
                      </span>
                    )
                  )}
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm font-bold text-green-400">
                تم استكمال جميع
                الدورات المطلوبة.
              </p>
            )}
          </div>
        </div>

        {eligibility.eligible &&
          canManage && (
            <button
              type="button"
              disabled={
                promotionProcessing ||
                Boolean(processingId)
              }
              onClick={() =>
                promoteCertifiedEmployee(
                  employee
                )
              }
              className={`mt-6 flex w-full items-center justify-center gap-2 rounded-2xl p-4 font-black text-black transition disabled:cursor-not-allowed disabled:opacity-50 ${
                isLeader
                  ? "bg-purple-500 hover:bg-purple-400"
                  : "bg-sky-500 hover:bg-sky-400"
              }`}
            >
              {promotionProcessing ? (
                <Loader2
                  size={20}
                  className="animate-spin"
                />
              ) : isLeader ? (
                <Crown size={20} />
              ) : (
                <Sparkles
                  size={20}
                />
              )}

              {promotionProcessing
                ? "جارٍ تنفيذ الترقية..."
                : `ترقية إلى المستوى ${
                    eligibility.level +
                    1
                  }`}
            </button>
          )}
      </article>
    );
  }

  if (
    loading ||
    loadingRole
  ) {
    return (
      <main className="flex min-h-[500px] items-center justify-center">
        <div className="text-center">
          <Loader2
            size={45}
            className="mx-auto animate-spin text-sky-400"
          />

          <p className="mt-4 font-bold text-zinc-400">
            جارٍ تحميل اللاعبين
            المعتمدين...
          </p>
        </div>
      </main>
    );
  }

  return (
    <PermissionGuard permission="certified">
      <main
        dir="rtl"
        className="space-y-8"
      >
        <header className="flex flex-wrap items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl border border-sky-500/20 bg-sky-500/10 p-4">
              <BadgeCheck
                size={32}
                className="text-sky-400"
              />
            </div>

            <div>
              <h1 className="text-4xl font-black text-sky-400">
                اللاعبون المعتمدون
              </h1>

              <p className="mt-2 text-zinc-400">
                نظام مستقل للاعبي C
                والقيادات المعتمدة CA.
              </p>
            </div>
          </div>

          {!canManage && (
            <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 px-5 py-3 text-sm font-bold text-blue-400">
              وضع العرض فقط
            </div>
          )}
        </header>

        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-3xl border border-white/10 bg-[#141414] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">
                  إجمالي المعتمدين
                </p>

                <p className="mt-3 text-4xl font-black text-white">
                  {
                    certifiedEmployees.length
                  }
                </p>
              </div>

              <Users
                size={30}
                className="text-zinc-400"
              />
            </div>
          </article>

          <article className="rounded-3xl border border-sky-500/20 bg-sky-500/5 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-sky-300">
                  اللاعبون C
                </p>

                <p className="mt-3 text-4xl font-black text-sky-400">
                  {
                    regularCertified.length
                  }
                </p>
              </div>

              <UserCheck
                size={30}
                className="text-sky-400"
              />
            </div>
          </article>

          <article className="rounded-3xl border border-purple-500/20 bg-purple-500/5 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-300">
                  القيادات CA
                </p>

                <p className="mt-3 text-4xl font-black text-purple-400">
                  {
                    certifiedLeaders.length
                  }
                </p>
              </div>

              <Crown
                size={30}
                className="text-purple-400"
              />
            </div>
          </article>

          <article className="rounded-3xl border border-green-500/20 bg-green-500/5 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-300">
                  الجاهزون للترقية
                </p>

                <p className="mt-3 text-4xl font-black text-green-400">
                  {eligibleCount}
                </p>
              </div>

              <Sparkles
                size={30}
                className="text-green-400"
              />
            </div>
          </article>
        </section>

        <section className="rounded-3xl border border-white/10 bg-[#141414] p-5 md:p-6">
          <div className="grid gap-4 xl:grid-cols-[1fr_220px]">
            <div className="relative">
              <Search
                size={20}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="ابحث بالاسم أو Discord ID أو الكود أو القطاع..."
                className="w-full rounded-2xl border border-white/10 bg-[#1b1b1b] py-4 pl-4 pr-12 text-white outline-none transition placeholder:text-zinc-600 focus:border-sky-500"
              />
            </div>

            <select
              value={levelFilter}
              onChange={(event) =>
                setLevelFilter(
                  event.target.value
                )
              }
              className="rounded-2xl border border-white/10 bg-[#1b1b1b] p-4 text-white outline-none focus:border-sky-500"
            >
              {levels.map(
                (level) => (
                  <option
                    key={level}
                    value={level}
                  >
                    {level === "all"
                      ? "جميع المستويات"
                      : `المستوى ${level}`}
                  </option>
                )
              )}
            </select>
          </div>

          <div className="mt-5 flex flex-wrap gap-3 border-t border-white/10 pt-5">
            <button
              type="button"
              onClick={() =>
                setTypeFilter("all")
              }
              className={`rounded-2xl px-5 py-3 font-bold transition ${
                typeFilter === "all"
                  ? "bg-white text-black"
                  : "border border-white/10 bg-white/5 text-zinc-400"
              }`}
            >
              الكل (
              {
                certifiedEmployees.length
              }
              )
            </button>

            <button
              type="button"
              onClick={() =>
                setTypeFilter(
                  "certified"
                )
              }
              className={`rounded-2xl px-5 py-3 font-bold transition ${
                typeFilter ===
                "certified"
                  ? "bg-sky-500 text-black"
                  : "border border-sky-500/20 bg-sky-500/5 text-sky-400"
              }`}
            >
              اللاعبون C (
              {
                regularCertified.length
              }
              )
            </button>

            <button
              type="button"
              onClick={() =>
                setTypeFilter(
                  "certified_leader"
                )
              }
              className={`rounded-2xl px-5 py-3 font-bold transition ${
                typeFilter ===
                "certified_leader"
                  ? "bg-purple-500 text-black"
                  : "border border-purple-500/20 bg-purple-500/5 text-purple-400"
              }`}
            >
              القيادات CA (
              {
                certifiedLeaders.length
              }
              )
            </button>
          </div>
        </section>

        {loadError ? (
          <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-14 text-center text-red-400">
            {loadError}
          </div>
        ) : filteredEmployees.length ===
          0 ? (
          <div className="rounded-3xl border border-dashed border-white/10 p-14 text-center text-zinc-500">
            لا يوجد لاعبون معتمدون
            مطابقون للبحث.
          </div>
        ) : (
          <>
            {filteredRegular.length >
              0 && (
              <section className="space-y-5">
                <div className="flex items-center gap-3">
                  <BadgeCheck
                    size={27}
                    className="text-sky-400"
                  />

                  <div>
                    <h2 className="text-2xl font-black text-sky-400">
                      اللاعبون المعتمدون
                      C
                    </h2>

                    <p className="mt-1 text-sm text-zinc-500">
                      ترقياتهم تعتمد على
                      أيام الحضور والدورات
                      فقط.
                    </p>
                  </div>
                </div>

                <div className="grid gap-5 xl:grid-cols-2">
                  {filteredRegular.map(
                    renderEmployeeCard
                  )}
                </div>
              </section>
            )}

            {filteredLeaders.length >
              0 && (
              <section className="space-y-5">
                <div className="flex items-center gap-3">
                  <Crown
                    size={27}
                    className="text-purple-400"
                  />

                  <div>
                    <h2 className="text-2xl font-black text-purple-400">
                      القيادات المعتمدة
                      CA
                    </h2>

                    <p className="mt-1 text-sm text-zinc-500">
                      قسم مستقل للقيادات
                      المعتمدة من المستوى
                      الأول إلى العاشر.
                    </p>
                  </div>
                </div>

                <div className="grid gap-5 xl:grid-cols-2">
                  {filteredLeaders.map(
                    renderEmployeeCard
                  )}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </PermissionGuard>
  );
}