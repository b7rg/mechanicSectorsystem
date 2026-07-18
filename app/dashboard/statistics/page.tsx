"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  collection,
  onSnapshot,
  type Timestamp,
} from "firebase/firestore";
import {
  AlertTriangle,
  BadgeCheck,
  BarChart3,
  BookOpenCheck,
  CheckCircle2,
  Clock3,
  Crown,
  FileText,
  GraduationCap,
  Layers3,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
  type LucideIcon,
} from "lucide-react";

import { db } from "@/lib/firebase";
import PermissionGuard from "@/components/auth/PermissionGuard";
import LevelCapacityStats from "@/components/employees/LevelCapacityStats";

type EmployeeType =
  | "main"
  | "certified"
  | "certified_leader";

type EmployeeReports = {
  fieldGuide?: number;
  fieldSupervisor?: number;
  generalSupervisor?: number;
  recruitment?: number;
};

type Employee = {
  id: string;
  name?: string;
  discordId?: string;
  rank?: string;
  fullCode?: string;
  level?: number | string;
  warnings?: number | unknown[];
  courses?: string[];
  reports?: EmployeeReports;
  employeeType?: EmployeeType;
  certified?: boolean;
  certifiedLeader?: boolean;
  status?: string;
  leave?: {
    active?: boolean;
  } | null;
};

type CourseStatus =
  | "open"
  | "closed"
  | "completed";

type CourseSession = {
  id: string;
  courseName?: string;
  status?: CourseStatus;
  registrationOpen?: boolean;
  startsAt?: Timestamp | null;
  createdAt?: Timestamp | null;
};

type MetricCardProps = {
  title: string;
  value: number;
  description: string;
  icon: LucideIcon;
  accent: string;
  iconStyle: string;
};

type MiniTypeCardProps = {
  label: string;
  code: string;
  value: number;
  icon: LucideIcon;
  style: string;
};

type SectionCardProps = {
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

function getNumber(value: unknown) {
  const converted = Number(value);
  return Number.isFinite(converted)
    ? converted
    : 0;
}

function getWarningsCount(
  employee: Employee
) {
  if (
    Array.isArray(employee.warnings)
  ) {
    return employee.warnings.length;
  }

  return getNumber(employee.warnings);
}

function getReportsTotal(
  employee: Employee
) {
  return (
    getNumber(
      employee.reports?.fieldGuide
    ) +
    getNumber(
      employee.reports
        ?.fieldSupervisor
    ) +
    getNumber(
      employee.reports
        ?.generalSupervisor
    ) +
    getNumber(
      employee.reports?.recruitment
    )
  );
}

function getEmployeeType(
  employee: Employee
): EmployeeType {
  if (
    employee.employeeType === "main" ||
    employee.employeeType ===
      "certified" ||
    employee.employeeType ===
      "certified_leader"
  ) {
    return employee.employeeType;
  }

  const code = String(
    employee.fullCode ??
      employee.rank ??
      ""
  )
    .trim()
    .toUpperCase();

  if (
    code.startsWith("CA-") ||
    employee.certifiedLeader === true
  ) {
    return "certified_leader";
  }

  if (
    code.startsWith("C-") ||
    employee.certified === true
  ) {
    return "certified";
  }

  return "main";
}

function isLeadership(
  employee: Employee
) {
  const level = String(
    employee.level ?? ""
  ).trim();

  const rank = String(
    employee.fullCode ??
      employee.rank ??
      ""
  )
    .trim()
    .toUpperCase();

  return (
    level === "قيادة" ||
    /^G-?(10|[1-9])$/.test(rank) ||
    getEmployeeType(employee) ===
      "certified_leader"
  );
}

function isOnLeave(
  employee: Employee
) {
  const status = String(
    employee.status ?? ""
  ).trim();

  return (
    employee.leave?.active === true ||
    status === "leave" ||
    status === "إجازة" ||
    status === "في إجازة"
  );
}

function isSuspended(
  employee: Employee
) {
  const status = String(
    employee.status ?? ""
  )
    .trim()
    .toLowerCase();

  return (
    status === "suspended" ||
    status === "موقوف"
  );
}

function getLevelNumber(
  employee: Employee
) {
  const level = Number(employee.level);

  if (
    !Number.isInteger(level) ||
    level < 1 ||
    level > 10
  ) {
    return 0;
  }

  return level;
}

function timestampToMillis(
  value?: Timestamp | null
) {
  return value?.toMillis?.() ?? 0;
}

function formatDate(
  value?: Timestamp | null
) {
  if (!value) {
    return "غير محدد";
  }

  return new Intl.DateTimeFormat(
    "ar-SA",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  ).format(value.toDate());
}

function getCourseStatusData(
  course: CourseSession
) {
  if (
    course.status === "completed"
  ) {
    return {
      label: "مكتملة",
      className:
        "border-blue-500/20 bg-blue-500/10 text-blue-400",
    };
  }

  if (
    course.status === "open" ||
    course.registrationOpen === true
  ) {
    return {
      label: "التسجيل مفتوح",
      className:
        "border-green-500/20 bg-green-500/10 text-green-400",
    };
  }

  return {
    label: "مغلقة",
    className:
      "border-zinc-500/20 bg-zinc-500/10 text-zinc-400",
  };
}

function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  accent,
  iconStyle,
}: MetricCardProps) {
  return (
    <article
      className={`group relative overflow-hidden rounded-[26px] border bg-[#131313]/90 p-5 transition duration-300 hover:-translate-y-1 hover:border-white/15 ${accent}`}
    >
      <div className="pointer-events-none absolute -left-14 -top-14 h-36 w-36 rounded-full bg-white/[0.025] blur-2xl transition group-hover:bg-white/[0.05]" />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-zinc-500">
            {title}
          </p>

          <p className="mt-3 text-3xl font-black tracking-tight text-white">
            {value.toLocaleString(
              "ar-SA"
            )}
          </p>
        </div>

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${iconStyle}`}
        >
          <Icon size={23} />
        </div>
      </div>

      <p className="relative mt-4 text-xs leading-6 text-zinc-600">
        {description}
      </p>
    </article>
  );
}

function MiniTypeCard({
  label,
  code,
  value,
  icon: Icon,
  style,
}: MiniTypeCardProps) {
  return (
    <article className="rounded-2xl border border-white/[0.07] bg-black/25 p-4 transition hover:border-white/15">
      <div className="flex items-center justify-between gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl border ${style}`}
        >
          <Icon size={19} />
        </div>

        <span className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 text-[11px] font-black tracking-[0.18em] text-zinc-600">
          {code}
        </span>
      </div>

      <p className="mt-5 text-3xl font-black text-white">
        {value.toLocaleString(
          "ar-SA"
        )}
      </p>

      <p className="mt-1 text-sm font-bold text-zinc-500">
        {label}
      </p>
    </article>
  );
}

function SectionCard({
  eyebrow,
  title,
  description,
  children,
  className = "",
}: SectionCardProps) {
  return (
    <section
      className={`rounded-[30px] border border-white/[0.08] bg-[#121212]/90 p-5 shadow-2xl shadow-black/10 backdrop-blur-xl md:p-7 ${className}`}
    >
      <div>
        <p className="text-xs font-black tracking-[0.18em] text-yellow-500">
          {eyebrow}
        </p>

        <h2 className="mt-2 text-2xl font-black text-white">
          {title}
        </h2>

        {description && (
          <p className="mt-2 text-sm leading-7 text-zinc-500">
            {description}
          </p>
        )}
      </div>

      {children}
    </section>
  );
}

export default function DashboardStatisticsPage() {
  const [
    employees,
    setEmployees,
  ] = useState<Employee[]>([]);

  const [
    courses,
    setCourses,
  ] = useState<CourseSession[]>([]);

  const [
    loadingEmployees,
    setLoadingEmployees,
  ] = useState(true);

  const [
    loadingCourses,
    setLoadingCourses,
  ] = useState(true);

  const [
    employeeError,
    setEmployeeError,
  ] = useState("");

  const [
    courseError,
    setCourseError,
  ] = useState("");

  const [
    lastUpdated,
    setLastUpdated,
  ] = useState("");

  useEffect(() => {
    const unsubscribe =
      onSnapshot(
        collection(db, "employees"),
        (snapshot) => {
          const data =
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

          setEmployees(data);
          setLoadingEmployees(false);
          setEmployeeError("");

          setLastUpdated(
            new Date().toLocaleTimeString(
              "ar-SA",
              {
                hour: "numeric",
                minute: "2-digit",
              }
            )
          );
        },
        (error) => {
          console.error(
            "تعذر تحميل الموظفين:",
            error
          );

          setEmployeeError(
            "تعذر تحميل بيانات الموظفين."
          );

          setLoadingEmployees(false);
        }
      );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe =
      onSnapshot(
        collection(
          db,
          "courseSessions"
        ),
        (snapshot) => {
          const data =
            snapshot.docs.map(
              (courseDocument) => ({
                id:
                  courseDocument.id,
                ...(courseDocument.data() as Omit<
                  CourseSession,
                  "id"
                >),
              })
            );

          setCourses(data);
          setLoadingCourses(false);
          setCourseError("");
        },
        (error) => {
          console.error(
            "تعذر تحميل الدورات:",
            error
          );

          setCourseError(
            "تعذر تحميل إحصائيات الدورات."
          );

          setLoadingCourses(false);
        }
      );

    return () => unsubscribe();
  }, []);

  const statistics = useMemo(() => {
    const activeEmployees =
      employees.filter(
        (employee) =>
          !isOnLeave(employee) &&
          !isSuspended(employee)
      );

    const employeesOnLeave =
      employees.filter(isOnLeave);

    const suspendedEmployees =
      employees.filter(isSuspended);

    const employeesWithWarnings =
      employees.filter(
        (employee) =>
          getWarningsCount(employee) >
          0
      );

    const totalWarnings =
      employees.reduce(
        (total, employee) =>
          total +
          getWarningsCount(employee),
        0
      );

    const totalCourses =
      employees.reduce(
        (total, employee) =>
          total +
          (Array.isArray(
            employee.courses
          )
            ? employee.courses.length
            : 0),
        0
      );

    const totalReports =
      employees.reduce(
        (total, employee) =>
          total +
          getReportsTotal(employee),
        0
      );

    const mainEmployees =
      employees.filter(
        (employee) =>
          getEmployeeType(employee) ===
          "main"
      );

    const certifiedEmployees =
      employees.filter(
        (employee) =>
          getEmployeeType(employee) ===
          "certified"
      );

    const certifiedLeaders =
      employees.filter(
        (employee) =>
          getEmployeeType(employee) ===
          "certified_leader"
      );

    const leaders =
      employees.filter(isLeadership);

    const openCourses =
      courses.filter(
        (course) =>
          course.status === "open" ||
          course.registrationOpen === true
      );

    const completedCourses =
      courses.filter(
        (course) =>
          course.status === "completed"
      );

    const closedCourses =
      courses.filter(
        (course) =>
          course.status === "closed" &&
          course.registrationOpen !== true
      );

    const fieldGuideReports =
      employees.reduce(
        (total, employee) =>
          total +
          getNumber(
            employee.reports
              ?.fieldGuide
          ),
        0
      );

    const fieldSupervisorReports =
      employees.reduce(
        (total, employee) =>
          total +
          getNumber(
            employee.reports
              ?.fieldSupervisor
          ),
        0
      );

    const generalSupervisorReports =
      employees.reduce(
        (total, employee) =>
          total +
          getNumber(
            employee.reports
              ?.generalSupervisor
          ),
        0
      );

    const recruitmentReports =
      employees.reduce(
        (total, employee) =>
          total +
          getNumber(
            employee.reports
              ?.recruitment
          ),
        0
      );

    const averageReports =
      employees.length > 0
        ? totalReports /
          employees.length
        : 0;

    const averageCourses =
      employees.length > 0
        ? totalCourses /
          employees.length
        : 0;

    return {
      activeEmployees,
      employeesOnLeave,
      suspendedEmployees,
      employeesWithWarnings,
      totalWarnings,
      totalCourses,
      totalReports,
      mainEmployees,
      certifiedEmployees,
      certifiedLeaders,
      leaders,
      openCourses,
      completedCourses,
      closedCourses,
      fieldGuideReports,
      fieldSupervisorReports,
      generalSupervisorReports,
      recruitmentReports,
      averageReports,
      averageCourses,
    };
  }, [employees, courses]);

  const levelStatistics =
    useMemo(() => {
      return Array.from(
        { length: 10 },
        (_, index) => 10 - index
      ).map((level) => ({
        level,
        count: employees.filter(
          (employee) =>
            getLevelNumber(employee) ===
            level
        ).length,
      }));
    }, [employees]);

  const maximumLevelCount =
    useMemo(() => {
      return Math.max(
        1,
        ...levelStatistics.map(
          (item) => item.count
        )
      );
    }, [levelStatistics]);

  const mostActiveEmployees =
    useMemo(() => {
      return [...employees]
        .map((employee) => ({
          ...employee,
          reportsTotal:
            getReportsTotal(employee),
        }))
        .sort(
          (
            firstEmployee,
            secondEmployee
          ) =>
            secondEmployee.reportsTotal -
            firstEmployee.reportsTotal
        )
        .slice(0, 5);
    }, [employees]);

  const recentCourses =
    useMemo(() => {
      return [...courses]
        .sort(
          (
            firstCourse,
            secondCourse
          ) =>
            Math.max(
              timestampToMillis(
                secondCourse.startsAt
              ),
              timestampToMillis(
                secondCourse.createdAt
              )
            ) -
            Math.max(
              timestampToMillis(
                firstCourse.startsAt
              ),
              timestampToMillis(
                firstCourse.createdAt
              )
            )
        )
        .slice(0, 4);
    }, [courses]);

  const loading =
    loadingEmployees ||
    loadingCourses;

  return (
    <PermissionGuard permission="statistics">
      <main
        dir="rtl"
        className="space-y-6"
      >
        <header className="relative overflow-hidden rounded-[32px] border border-yellow-500/15 bg-[radial-gradient(circle_at_top_right,rgba(234,179,8,0.10),transparent_38%),linear-gradient(135deg,#151515,#0d0d0d)] p-6 md:p-8">
          <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-yellow-500/[0.06] blur-3xl" />

          <div className="relative flex flex-wrap items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-yellow-500/20 bg-yellow-500/10">
                <BarChart3
                  size={27}
                  className="text-yellow-400"
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black tracking-[0.28em] text-yellow-500">
                    SECTOR ANALYTICS
                  </span>

                  <Sparkles
                    size={13}
                    className="text-yellow-500"
                  />
                </div>

                <h1 className="mt-2 text-3xl font-black tracking-tight text-white md:text-4xl">
                  إحصائيات القطاع
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-7 text-zinc-500">
                  قراءة مباشرة ومختصرة
                  للموظفين والدورات
                  والتقارير ومستويات
                  القطاع.
                </p>
              </div>
            </div>

            {lastUpdated && (
              <div className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-black/25 px-4 py-3 text-sm text-zinc-500 backdrop-blur-xl">
                <Clock3
                  size={17}
                  className="text-yellow-400"
                />

                آخر تحديث:
                <span className="font-black text-zinc-300">
                  {lastUpdated}
                </span>
              </div>
            )}
          </div>
        </header>

        {loading ? (
          <div className="rounded-[30px] border border-white/[0.08] bg-[#121212] p-16 text-center text-zinc-500">
            جارٍ تحميل إحصائيات
            القطاع...
          </div>
        ) : employeeError ? (
          <div className="rounded-[30px] border border-red-500/20 bg-red-500/5 p-12 text-center">
            <AlertTriangle
              size={44}
              className="mx-auto text-red-400"
            />

            <h2 className="mt-5 text-2xl font-black text-red-400">
              تعذر تحميل الإحصائيات
            </h2>

            <p className="mt-3 text-zinc-400">
              {employeeError}
            </p>
          </div>
        ) : (
          <>
            <section className="grid gap-5 xl:grid-cols-[1.25fr_1fr]">
              <article className="relative overflow-hidden rounded-[32px] border border-yellow-500/15 bg-[linear-gradient(135deg,rgba(234,179,8,0.08),rgba(255,255,255,0.015)_55%,rgba(0,0,0,0.2))] p-6 md:p-8">
                <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-yellow-500/[0.08] blur-3xl" />

                <div className="relative flex h-full flex-col justify-between gap-10">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-black text-yellow-400">
                      <TrendingUp size={18} />
                      المشهد العام
                    </div>

                    <p className="mt-5 text-6xl font-black tracking-tight text-white md:text-7xl">
                      {employees.length.toLocaleString(
                        "ar-SA"
                      )}
                    </p>

                    <p className="mt-3 text-base font-bold text-zinc-400">
                      إجمالي الأفراد
                      المسجلين في النظام
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-green-500/15 bg-green-500/[0.06] p-4">
                      <p className="text-2xl font-black text-green-400">
                        {statistics.activeEmployees.length.toLocaleString(
                          "ar-SA"
                        )}
                      </p>
                      <p className="mt-1 text-xs font-bold text-zinc-500">
                        على رأس العمل
                      </p>
                    </div>

                    <div className="rounded-2xl border border-blue-500/15 bg-blue-500/[0.05] p-4">
                      <p className="text-2xl font-black text-blue-400">
                        {statistics.employeesOnLeave.length.toLocaleString(
                          "ar-SA"
                        )}
                      </p>
                      <p className="mt-1 text-xs font-bold text-zinc-500">
                        في إجازة
                      </p>
                    </div>

                    <div className="rounded-2xl border border-red-500/15 bg-red-500/[0.05] p-4">
                      <p className="text-2xl font-black text-red-400">
                        {statistics.suspendedEmployees.length.toLocaleString(
                          "ar-SA"
                        )}
                      </p>
                      <p className="mt-1 text-xs font-bold text-zinc-500">
                        موقوف
                      </p>
                    </div>
                  </div>
                </div>
              </article>

              <div className="grid gap-4 sm:grid-cols-2">
                <MiniTypeCard
                  label="الموظف الأساسي"
                  code="G"
                  value={
                    statistics.mainEmployees
                      .length
                  }
                  icon={Users}
                  style="border-yellow-500/20 bg-yellow-500/10 text-yellow-400"
                />

                <MiniTypeCard
                  label="اللاعب المعتمد"
                  code="C"
                  value={
                    statistics.certifiedEmployees
                      .length
                  }
                  icon={BadgeCheck}
                  style="border-blue-500/20 bg-blue-500/10 text-blue-400"
                />

                <MiniTypeCard
                  label="القيادة المعتمدة"
                  code="CA"
                  value={
                    statistics.certifiedLeaders
                      .length
                  }
                  icon={Crown}
                  style="border-purple-500/20 bg-purple-500/10 text-purple-400"
                />

                <MiniTypeCard
                  label="دورات مفتوحة"
                  code="LIVE"
                  value={
                    statistics.openCourses
                      .length
                  }
                  icon={GraduationCap}
                  style="border-green-500/20 bg-green-500/10 text-green-400"
                />
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                title="إجمالي التقارير"
                value={
                  statistics.totalReports
                }
                description={`بمتوسط ${statistics.averageReports.toFixed(
                  1
                )} تقرير لكل موظف.`}
                icon={FileText}
                accent="border-cyan-500/15"
                iconStyle="border-cyan-500/20 bg-cyan-500/10 text-cyan-400"
              />

              <MetricCard
                title="الدورات المنجزة"
                value={
                  statistics.totalCourses
                }
                description={`بمتوسط ${statistics.averageCourses.toFixed(
                  1
                )} دورة لكل موظف.`}
                icon={BookOpenCheck}
                accent="border-orange-500/15"
                iconStyle="border-orange-500/20 bg-orange-500/10 text-orange-400"
              />

              <MetricCard
                title="إجمالي الإنذارات"
                value={
                  statistics.totalWarnings
                }
                description={`${statistics.employeesWithWarnings.length.toLocaleString(
                  "ar-SA"
                )} موظف لديهم إنذار واحد أو أكثر.`}
                icon={ShieldAlert}
                accent="border-red-500/15"
                iconStyle="border-red-500/20 bg-red-500/10 text-red-400"
              />

              <MetricCard
                title="الدورات المكتملة"
                value={
                  statistics.completedCourses
                    .length
                }
                description={`${statistics.closedCourses.length.toLocaleString(
                  "ar-SA"
                )} دورة مغلقة حاليًا.`}
                icon={CheckCircle2}
                accent="border-green-500/15"
                iconStyle="border-green-500/20 bg-green-500/10 text-green-400"
              />
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
              <SectionCard
                eyebrow="LEVEL DISTRIBUTION"
                title="توزيع الموظفين حسب المستوى"
                description="مقارنة مباشرة بين أعداد المستويات من العاشر إلى الأول."
              >
                <div className="mt-7 grid gap-4 sm:grid-cols-2">
                  {levelStatistics.map(
                    (item) => {
                      const percentage =
                        (item.count /
                          maximumLevelCount) *
                        100;

                      return (
                        <div
                          key={
                            item.level
                          }
                          className="rounded-2xl border border-white/[0.06] bg-black/20 p-4"
                        >
                          <div className="flex items-center justify-between gap-4">
                            <p className="font-black text-zinc-300">
                              المستوى{" "}
                              {item.level}
                            </p>

                            <span className="rounded-lg bg-yellow-500/10 px-3 py-1 text-sm font-black text-yellow-400">
                              {item.count.toLocaleString(
                                "ar-SA"
                              )}
                            </span>
                          </div>

                          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.05]">
                            <div
                              className="h-full rounded-full bg-gradient-to-l from-yellow-500 to-amber-300 transition-all duration-700"
                              style={{
                                width:
                                  item.count ===
                                  0
                                    ? "0%"
                                    : `${Math.max(
                                        percentage,
                                        5
                                      )}%`,
                              }}
                            />
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </SectionCard>

              <SectionCard
                eyebrow="TOP PERFORMANCE"
                title="الأعلى في عدد التقارير"
                description="أكثر خمسة موظفين تسجيلًا للتقارير."
              >
                <div className="mt-7 space-y-3">
                  {mostActiveEmployees.length ===
                  0 ? (
                    <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-zinc-500">
                      لا توجد بيانات
                      تقارير.
                    </div>
                  ) : (
                    mostActiveEmployees.map(
                      (
                        employee,
                        index
                      ) => (
                        <div
                          key={
                            employee.id
                          }
                          className="flex items-center justify-between gap-4 rounded-2xl border border-white/[0.06] bg-black/20 p-4"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <span
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-black ${
                                index === 0
                                  ? "bg-yellow-500 text-black"
                                  : "bg-white/[0.05] text-zinc-400"
                              }`}
                            >
                              {index + 1}
                            </span>

                            <div className="min-w-0">
                              <p className="truncate font-black text-white">
                                {employee.name ||
                                  "موظف دون اسم"}
                              </p>

                              <p className="mt-1 truncate text-xs text-zinc-600">
                                {employee.fullCode ||
                                  employee.rank ||
                                  `المستوى ${
                                    employee.level ??
                                    "-"
                                  }`}
                              </p>
                            </div>
                          </div>

                          <span className="shrink-0 rounded-xl border border-yellow-500/15 bg-yellow-500/[0.07] px-3 py-2 font-black text-yellow-400">
                            {employee.reportsTotal.toLocaleString(
                              "ar-SA"
                            )}
                          </span>
                        </div>
                      )
                    )
                  )}
                </div>
              </SectionCard>
            </section>

            <section className="grid gap-6 xl:grid-cols-[1fr_1.15fr]">
              <SectionCard
                eyebrow="COURSE STATUS"
                title="آخر الدورات"
                description="آخر جلسات الدورات المضافة إلى النظام."
              >
                {courseError ? (
                  <div className="mt-6 rounded-2xl border border-red-500/15 bg-red-500/5 p-5 text-sm text-red-400">
                    {courseError}
                  </div>
                ) : recentCourses.length ===
                  0 ? (
                  <div className="mt-6 rounded-2xl border border-dashed border-white/10 p-8 text-center text-zinc-500">
                    لا توجد دورات
                    مسجلة.
                  </div>
                ) : (
                  <div className="mt-6 space-y-3">
                    {recentCourses.map(
                      (course) => {
                        const status =
                          getCourseStatusData(
                            course
                          );

                        return (
                          <div
                            key={
                              course.id
                            }
                            className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/[0.06] bg-black/20 p-4"
                          >
                            <div className="min-w-0">
                              <p className="truncate font-black text-white">
                                {course.courseName ||
                                  "دورة دون اسم"}
                              </p>

                              <p className="mt-1 text-xs text-zinc-600">
                                {formatDate(
                                  course.startsAt ??
                                    course.createdAt
                                )}
                              </p>
                            </div>

                            <span
                              className={`rounded-full border px-3 py-1 text-xs font-black ${status.className}`}
                            >
                              {
                                status.label
                              }
                            </span>
                          </div>
                        );
                      }
                    )}
                  </div>
                )}
              </SectionCard>

              <SectionCard
                eyebrow="REPORT BREAKDOWN"
                title="توزيع التقارير"
                description="إجمالي التقارير حسب القسم المسؤول."
              >
                <div className="mt-7 grid gap-4 sm:grid-cols-2">
                  {[
                    {
                      title:
                        "التوجيه الميداني",
                      value:
                        statistics.fieldGuideReports,
                      icon: UserCheck,
                    },
                    {
                      title:
                        "الإشراف الميداني",
                      value:
                        statistics.fieldSupervisorReports,
                      icon: Layers3,
                    },
                    {
                      title:
                        "الإشراف العام",
                      value:
                        statistics.generalSupervisorReports,
                      icon: Crown,
                    },
                    {
                      title:
                        "شؤون التوظيف",
                      value:
                        statistics.recruitmentReports,
                      icon: Users,
                    },
                  ].map((item) => {
                    const Icon =
                      item.icon;

                    return (
                      <article
                        key={item.title}
                        className="rounded-2xl border border-white/[0.06] bg-black/20 p-5"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-yellow-500/15 bg-yellow-500/[0.07] text-yellow-400">
                            <Icon size={19} />
                          </div>

                          <p className="text-2xl font-black text-white">
                            {item.value.toLocaleString(
                              "ar-SA"
                            )}
                          </p>
                        </div>

                        <p className="mt-4 text-sm font-black text-zinc-400">
                          {item.title}
                        </p>
                      </article>
                    );
                  })}
                </div>
              </SectionCard>
            </section>

            <section className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black tracking-[0.18em] text-yellow-500">
                    CAPACITY
                  </p>

                  <h2 className="mt-2 text-2xl font-black text-white">
                    إشغال المستويات
                  </h2>
                </div>

                <span className="rounded-full border border-yellow-500/15 bg-yellow-500/[0.07] px-4 py-2 text-xs font-black text-yellow-400">
                  القيادات{" "}
                  {statistics.leaders.length.toLocaleString(
                    "ar-SA"
                  )}
                </span>
              </div>

              <LevelCapacityStats />
            </section>
          </>
        )}
      </main>
    </PermissionGuard>
  );
}