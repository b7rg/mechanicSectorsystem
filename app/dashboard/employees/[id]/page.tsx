"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import {
  AlertTriangle,
  Loader2,
  UserRoundX,
} from "lucide-react";

import { auth, db } from "@/lib/firebase";
import { CORE_COURSES } from "@/lib/courseCatalog";

import ReportsCard from "@/components/employees/ReportsCard";
import DeleteEmployeeButton from "@/components/employees/DeleteEmployeeButton";
import WarningsCard from "@/components/employees/WarningsCard";
import LeaveCard from "@/components/employees/LeaveCard";
import EditEmployeeButton from "@/components/employees/EditEmployeeButton";
import PromotionCard from "@/components/employees/PromotionCard";
import Can from "@/components/auth/Can";

type Employee = {
  id: string;
  name?: string;
  discordId?: string;
  rank?: string;
  fullCode?: string;
  level?: string | number;
  employeeType?: string;
  isLeader?: boolean;

  courses?: string[];

  warnings?:
    | number
    | unknown[];

  reports?: {
    fieldGuide?: number;
    fieldSupervisor?: number;
    generalSupervisor?: number;
    recruitment?: number;
    [key: string]: unknown;
  };

  leave?: {
    active?: boolean;
    type?: string;
    reason?: string;
    startAt?: Timestamp | null;
    endAt?: Timestamp | null;
    [key: string]: unknown;
  } | null;

  certified?: boolean;
  hiredAt?: Timestamp | string | null;
  lastPromotion?: Timestamp | string | null;

  [key: string]: unknown;
};

function isLeadershipEmployee(
  employee: Employee
) {
  if (
    employee.isLeader === true ||
    employee.employeeType === "leader"
  ) {
    return true;
  }

  const code = String(
    employee.fullCode ??
      employee.rank ??
      ""
  )
    .trim()
    .toUpperCase();

  return /^G-?0*(10|[1-9])$/.test(
    code
  );
}

export default function EmployeeDetails() {
  const params = useParams<{
    id: string | string[];
  }>();

  const employeeId = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  const [employee, setEmployee] =
    useState<Employee | null>(null);

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    if (!employeeId) {
      setErrorMessage("رابط الموظف غير صحيح.");
      setLoading(false);
      return;
    }

    let unsubscribeEmployee:
      | (() => void)
      | undefined;

    const unsubscribeAuth = onAuthStateChanged(
      auth,
      (user) => {
        unsubscribeEmployee?.();

        if (!user) {
          setEmployee(null);
          setNotFound(false);
          setLoading(false);

          setErrorMessage(
            "يجب تسجيل الدخول لعرض ملف الموظف."
          );

          return;
        }

        setLoading(true);
        setErrorMessage("");
        setNotFound(false);

        const employeeReference = doc(
          db,
          "employees",
          employeeId
        );

        unsubscribeEmployee = onSnapshot(
          employeeReference,
          (snapshot) => {
            if (!snapshot.exists()) {
              setEmployee(null);
              setNotFound(true);
              setLoading(false);
              return;
            }

            setEmployee({
              id: snapshot.id,
              ...(snapshot.data() as Omit<
                Employee,
                "id"
              >),
            });

            setNotFound(false);
            setErrorMessage("");
            setLoading(false);
          },
          (error) => {
            console.error(
              "تعذر تحميل ملف الموظف:",
              error
            );

            setEmployee(null);
            setNotFound(false);
            setLoading(false);

            if (error.code === "permission-denied") {
              setErrorMessage(
                "لا توجد صلاحية لعرض ملف هذا الموظف."
              );
            } else {
              setErrorMessage(
                "حدث خطأ أثناء تحميل ملف الموظف."
              );
            }
          }
        );
      }
    );

    return () => {
      unsubscribeEmployee?.();
      unsubscribeAuth();
    };
  }, [employeeId]);

  const employeeCourses = useMemo(() => {
    const savedCourses = Array.isArray(employee?.courses)
      ? employee.courses
          .filter(
            (course): course is string =>
              typeof course === "string"
          )
          .map((course) => course.trim())
      : [];

    return CORE_COURSES.filter((course) =>
      savedCourses.includes(course)
    );
  }, [employee]);

  const completedCourses = employeeCourses.length;

  const coursesProgress =
    CORE_COURSES.length > 0
      ? Math.round(
          (completedCourses / CORE_COURSES.length) *
            100
        )
      : 0;

  const warningsCount = useMemo(() => {
    if (Array.isArray(employee?.warnings)) {
      return employee.warnings.length;
    }

    const count = Number(employee?.warnings ?? 0);

    return Number.isFinite(count) ? count : 0;
  }, [employee]);

  const isLeader =
    employee
      ? isLeadershipEmployee(
          employee
        )
      : false;

  if (loading) {
    return (
      <main className="flex min-h-[520px] items-center justify-center">
        <div className="text-center">
          <Loader2
            size={45}
            className="mx-auto animate-spin text-yellow-400"
          />

          <p className="mt-5 font-bold text-zinc-400">
            جارٍ تحميل ملف الموظف...
          </p>
        </div>
      </main>
    );
  }

  if (notFound) {
    return (
      <main className="flex min-h-[520px] items-center justify-center">
        <section className="w-full max-w-xl rounded-3xl border border-red-500/20 bg-red-500/5 p-10 text-center">
          <UserRoundX
            size={52}
            className="mx-auto text-red-400"
          />

          <h1 className="mt-5 text-3xl font-black text-white">
            الموظف غير موجود
          </h1>

          <p className="mt-3 text-zinc-500">
            ربما تم حذف الموظف أو أن الرابط غير
            صحيح.
          </p>

          <Link
            href="/dashboard/employees"
            className="mt-7 inline-flex rounded-2xl bg-yellow-500 px-6 py-3 font-black text-black transition hover:bg-yellow-400"
          >
            الرجوع إلى الموظفين
          </Link>
        </section>
      </main>
    );
  }

  if (errorMessage || !employee) {
    return (
      <main className="flex min-h-[520px] items-center justify-center">
        <section className="w-full max-w-xl rounded-3xl border border-red-500/20 bg-red-500/5 p-10 text-center">
          <AlertTriangle
            size={50}
            className="mx-auto text-red-400"
          />

          <h1 className="mt-5 text-2xl font-black text-red-400">
            تعذر فتح ملف الموظف
          </h1>

          <p className="mt-4 leading-8 text-zinc-400">
            {errorMessage}
          </p>

          <Link
            href="/dashboard/employees"
            className="mt-7 inline-flex rounded-2xl border border-yellow-500/20 bg-yellow-500/10 px-6 py-3 font-black text-yellow-400 transition hover:bg-yellow-500 hover:text-black"
          >
            الرجوع إلى الموظفين
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="space-y-8">
      <Link
        href="/dashboard/employees"
        className="inline-flex items-center gap-2 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 px-5 py-3 font-bold text-yellow-400 transition hover:bg-yellow-500 hover:text-black"
      >
        ← الرجوع إلى الموظفين
      </Link>

      <section className="relative overflow-hidden rounded-[32px] border border-yellow-500/20 bg-[#141414]/90 p-6 backdrop-blur-xl md:p-10">
        <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-yellow-500/10 blur-[140px]" />

        <div className="relative flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:gap-8">
            <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full border-4 border-yellow-500 bg-gradient-to-br from-yellow-500/20 to-transparent text-5xl md:h-32 md:w-32 md:text-6xl">
              👑
            </div>

            <div>
              <h1 className="break-words text-4xl font-black text-yellow-400 md:text-5xl">
                {employee.name || "موظف دون اسم"}
              </h1>

              <p className="mt-3 text-xl text-zinc-400">
                {employee.rank || "بدون رتبة"}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <span className="rounded-full bg-zinc-900 px-5 py-2">
                  💬 {employee.discordId || "غير محدد"}
                </span>

                {isLeader && (
                  <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-5 py-2 font-black text-yellow-400">
                    👑 قيادة
                  </span>
                )}

                <span className="rounded-full bg-yellow-500 px-5 py-2 font-bold text-black">
                  ⭐ المستوى{" "}
                  {employee.level ??
                    "غير محدد"}
                </span>

                {employee.certified === true && (
                  <span className="rounded-full border border-green-500/20 bg-green-500/10 px-5 py-2 font-bold text-green-400">
                    ✅ لاعب معتمد
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid w-full gap-5 sm:grid-cols-3 lg:w-auto lg:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-[#1a1a1a] p-6 text-center">
              <p className="text-zinc-500">
                الإنذارات
              </p>

              <h2 className="mt-3 text-5xl font-black text-red-400">
                {warningsCount.toLocaleString(
                  "ar-SA"
                )}
              </h2>
            </div>

            <PromotionCard
              employee={employee as any}
            />

            <div className="rounded-2xl border border-white/10 bg-[#1a1a1a] p-6 text-center">
              <p className="text-zinc-500">
                الدورات
              </p>

              <h2 className="mt-3 text-5xl font-black text-green-400">
                {employeeCourses.length.toLocaleString(
                  "ar-SA"
                )}
              </h2>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#1a1a1a] p-6 text-center">
              <p className="text-zinc-500">
                اكتمال الدورات
              </p>

              <h2 className="mt-3 text-4xl font-black text-yellow-400">
                {coursesProgress.toLocaleString(
                  "ar-SA"
                )}
                ٪
              </h2>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <ReportsCard
          id={employeeId}
          reports={employee.reports as any}
        />

        <WarningsCard
          id={employeeId}
          warnings={warningsCount}
        />

        <LeaveCard
          id={employeeId}
          leave={employee.leave as any}
        />
      </section>

      <section className="rounded-3xl border border-white/10 bg-[#141414]/90 p-6 backdrop-blur-xl md:p-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-yellow-400">
              الدورات
            </h2>

            <p className="mt-2 text-sm text-zinc-500">
              مكتمل {completedCourses} من{" "}
              {CORE_COURSES.length} دورات معتمدة
            </p>
          </div>

          <span className="rounded-full border border-yellow-500/20 bg-yellow-500/10 px-4 py-2 font-black text-yellow-400">
            {coursesProgress.toLocaleString(
              "ar-SA"
            )}
            ٪
          </span>
        </div>

        <div className="mb-7 h-3 overflow-hidden rounded-full bg-zinc-900">
          <div
            className="h-full rounded-full bg-yellow-500 transition-all duration-500"
            style={{
              width: `${coursesProgress}%`,
            }}
          />
        </div>

        {employeeCourses.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {employeeCourses.map((course) => (
              <div
                key={course}
                className="rounded-2xl border border-green-500/20 bg-green-500/10 p-5 font-bold text-green-400"
              >
                ✅ {course}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-zinc-700 p-8 text-center text-zinc-500">
            لا توجد دورات مسجلة لهذا الموظف.
          </div>
        )}
      </section>

      <div className="mt-8 flex flex-wrap gap-4">
        <Can permission="edit_employee">
          <EditEmployeeButton id={employeeId} />
        </Can>

        <Can permission="delete_employee">
          <DeleteEmployeeButton
            id={employeeId}
          />
        </Can>
      </div>
    </main>
  );
}