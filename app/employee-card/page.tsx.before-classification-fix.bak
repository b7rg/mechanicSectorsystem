"use client";

import {
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  AlertTriangle,
  BadgeCheck,
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  Copy,
  FileText,
  Gauge,
  Loader2,
  Search,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";

import Navbar from "@/components/landing/Navbar";

type PublicEmployee = {
  name: string;
  discordId: string;
  fullCode: string;
  level: number;
  employeeType: string;
  employeeTypeLabel: string;
  mainSector: string;
  administrationTitle: string;
  status:
    | "active"
    | "leave"
    | "suspended";
  courses: string[];
  reports: {
    fieldGuide: number;
    fieldSupervisor: number;
    generalSupervisor: number;
    recruitment: number;
  };
  reportsTotal: number;
  warningsCount: number;
  hiredAt: string | null;
};

const LEVEL_THEMES: Record<
  number,
  {
    border: string;
    background: string;
    glow: string;
    text: string;
    soft: string;
    badge: string;
  }
> = {
  1: {
    border: "border-cyan-400/30",
    background:
      "from-cyan-500/20 via-slate-950/90 to-slate-950",
    glow: "bg-cyan-500/20",
    text: "text-cyan-300",
    soft: "bg-cyan-500/10",
    badge:
      "border-cyan-400/25 bg-cyan-500/10 text-cyan-300",
  },
  2: {
    border: "border-emerald-400/30",
    background:
      "from-emerald-500/20 via-slate-950/90 to-slate-950",
    glow: "bg-emerald-500/20",
    text: "text-emerald-300",
    soft: "bg-emerald-500/10",
    badge:
      "border-emerald-400/25 bg-emerald-500/10 text-emerald-300",
  },
  3: {
    border: "border-lime-400/30",
    background:
      "from-lime-500/20 via-slate-950/90 to-slate-950",
    glow: "bg-lime-500/20",
    text: "text-lime-300",
    soft: "bg-lime-500/10",
    badge:
      "border-lime-400/25 bg-lime-500/10 text-lime-300",
  },
  4: {
    border: "border-yellow-400/30",
    background:
      "from-yellow-500/20 via-slate-950/90 to-slate-950",
    glow: "bg-yellow-500/20",
    text: "text-yellow-300",
    soft: "bg-yellow-500/10",
    badge:
      "border-yellow-400/25 bg-yellow-500/10 text-yellow-300",
  },
  5: {
    border: "border-orange-400/30",
    background:
      "from-orange-500/20 via-slate-950/90 to-slate-950",
    glow: "bg-orange-500/20",
    text: "text-orange-300",
    soft: "bg-orange-500/10",
    badge:
      "border-orange-400/25 bg-orange-500/10 text-orange-300",
  },
  6: {
    border: "border-rose-400/30",
    background:
      "from-rose-500/20 via-slate-950/90 to-slate-950",
    glow: "bg-rose-500/20",
    text: "text-rose-300",
    soft: "bg-rose-500/10",
    badge:
      "border-rose-400/25 bg-rose-500/10 text-rose-300",
  },
  7: {
    border: "border-pink-400/30",
    background:
      "from-pink-500/20 via-slate-950/90 to-slate-950",
    glow: "bg-pink-500/20",
    text: "text-pink-300",
    soft: "bg-pink-500/10",
    badge:
      "border-pink-400/25 bg-pink-500/10 text-pink-300",
  },
  8: {
    border: "border-violet-400/30",
    background:
      "from-violet-500/20 via-slate-950/90 to-slate-950",
    glow: "bg-violet-500/20",
    text: "text-violet-300",
    soft: "bg-violet-500/10",
    badge:
      "border-violet-400/25 bg-violet-500/10 text-violet-300",
  },
  9: {
    border: "border-indigo-400/30",
    background:
      "from-indigo-500/20 via-slate-950/90 to-slate-950",
    glow: "bg-indigo-500/20",
    text: "text-indigo-300",
    soft: "bg-indigo-500/10",
    badge:
      "border-indigo-400/25 bg-indigo-500/10 text-indigo-300",
  },
  10: {
    border: "border-red-400/35",
    background:
      "from-red-500/25 via-slate-950/90 to-slate-950",
    glow: "bg-red-500/25",
    text: "text-red-300",
    soft: "bg-red-500/10",
    badge:
      "border-red-400/30 bg-red-500/10 text-red-300",
  },
};

function getLevelTheme(level: number) {
  return (
    LEVEL_THEMES[level] ??
    LEVEL_THEMES[1]
  );
}

function getStatusData(
  status: PublicEmployee["status"]
) {
  if (status === "leave") {
    return {
      label: "في إجازة",
      style:
        "border-orange-400/25 bg-orange-500/10 text-orange-300",
    };
  }

  if (status === "suspended") {
    return {
      label: "موقوف",
      style:
        "border-red-400/25 bg-red-500/10 text-red-300",
    };
  }

  return {
    label: "على رأس العمل",
    style:
      "border-emerald-400/25 bg-emerald-500/10 text-emerald-300",
  };
}

function getDisplayedCode(
  employee: PublicEmployee
) {
  const isCertified =
    employee.employeeType ===
      "certified" ||
    employee.employeeType ===
      "certified_leader";

  if (
    isCertified &&
    employee.mainSector
  ) {
    return `${employee.fullCode} | ${employee.mainSector}`;
  }

  return employee.fullCode;
}

function formatDate(value: string | null) {
  if (!value) {
    return "غير مسجل";
  }

  const date = new Date(value);

  if (
    Number.isNaN(date.getTime())
  ) {
    return "غير مسجل";
  }

  return new Intl.DateTimeFormat(
    "ar-SA",
    {
      dateStyle: "medium",
    }
  ).format(date);
}

function MetricCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: ReactNode;
}) {
  return (
    <article className="rounded-2xl border border-white/10 bg-black/25 p-4 backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-zinc-500">
            {title}
          </p>
          <p className="mt-2 text-2xl font-black text-white">
            {value}
          </p>
          <p className="mt-2 text-xs leading-5 text-zinc-500">
            {description}
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-zinc-300">
          {icon}
        </div>
      </div>
    </article>
  );
}

export default function PublicEmployeeCardPage() {
  const [discordId, setDiscordId] =
    useState("");
  const [employee, setEmployee] =
    useState<PublicEmployee | null>(
      null
    );
  const [loading, setLoading] =
    useState(false);
  const [errorMessage, setErrorMessage] =
    useState("");
  const [copied, setCopied] =
    useState(false);

  async function searchEmployee(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const cleanId = discordId
      .trim()
      .replace(/\D/g, "");

    setDiscordId(cleanId);
    setEmployee(null);
    setErrorMessage("");
    setCopied(false);

    if (!/^\d{15,25}$/.test(cleanId)) {
      setErrorMessage(
        "ألصق كوبي آيدي ديسكورد صحيح."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "/api/public-employee",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            discordId: cleanId,
          }),
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ??
            "تعذر عرض البطاقة."
        );
      }

      setEmployee(data.employee);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "تعذر عرض البطاقة."
      );
    } finally {
      setLoading(false);
    }
  }

  async function copyCode() {
    if (!employee) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        getDisplayedCode(employee)
      );
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      setCopied(false);
    }
  }

  const theme = employee
    ? getLevelTheme(employee.level)
    : getLevelTheme(4);

  const status = employee
    ? getStatusData(employee.status)
    : null;

  const displayedCode = employee
    ? getDisplayedCode(employee)
    : "";

  return (
    <main
      dir="rtl"
      className="min-h-screen overflow-hidden bg-[#050607] text-white"
    >
      <Navbar />

      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-[8%] top-32 h-72 w-72 rounded-full bg-yellow-500/10 blur-[110px]" />
        <div className="absolute bottom-0 right-[6%] h-80 w-80 rounded-full bg-cyan-500/10 blur-[130px]" />
      </div>

      <section className="relative mx-auto w-[94%] max-w-6xl pb-20 pt-36 md:pt-40">
        <header className="mx-auto max-w-3xl text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-yellow-400/25 bg-yellow-500/10 text-yellow-300">
            <BadgeCheck size={31} />
          </div>

          <p className="mt-5 text-xs font-black tracking-[0.28em] text-yellow-400">
            MSS EMPLOYEE CARD
          </p>

          <h1 className="mt-3 text-4xl font-black md:text-6xl">
            بطاقتي في القطاع
          </h1>

          <p className="mx-auto mt-4 max-w-2xl leading-8 text-zinc-400">
            ألصق كوبي آيدي الديسكورد
            وشاهد بطاقتك فقط. هذه الصفحة
            للعرض ولا تحتوي على أي صلاحية
            تعديل.
          </p>
        </header>

        <form
          onSubmit={searchEmployee}
          className="mx-auto mt-9 flex max-w-3xl flex-col gap-3 rounded-[28px] border border-white/10 bg-white/[0.04] p-4 shadow-2xl shadow-black/40 backdrop-blur-xl sm:flex-row"
        >
          <div className="relative flex-1">
            <Copy
              size={20}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500"
            />

            <input
              value={discordId}
              onChange={(event) =>
                setDiscordId(
                  event.target.value
                )
              }
              inputMode="numeric"
              autoComplete="off"
              placeholder="ألصق كوبي آيدي الديسكورد"
              className="h-14 w-full rounded-2xl border border-white/10 bg-black/35 pr-12 pl-4 font-mono text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-400/45 focus:bg-black/55"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-yellow-500 px-7 font-black text-black transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <Loader2
                size={20}
                className="animate-spin"
              />
            ) : (
              <Search size={20} />
            )}

            {loading
              ? "جارٍ البحث..."
              : "عرض بطاقتي"}
          </button>
        </form>

        {errorMessage && (
          <div className="mx-auto mt-5 flex max-w-3xl items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-300">
            <AlertTriangle
              size={21}
              className="shrink-0"
            />
            <p className="font-bold">
              {errorMessage}
            </p>
          </div>
        )}

        {!employee &&
          !errorMessage &&
          !loading && (
            <div className="mx-auto mt-10 max-w-3xl rounded-[30px] border border-dashed border-white/10 bg-white/[0.02] p-10 text-center">
              <UserRound
                size={42}
                className="mx-auto text-zinc-700"
              />
              <h2 className="mt-5 text-xl font-black text-zinc-300">
                البطاقة تظهر هنا
              </h2>
              <p className="mt-2 text-sm leading-7 text-zinc-600">
                استخدم كوبي آيدي من
                ديسكورد، وليس اسم الحساب.
              </p>
            </div>
          )}

        {employee && status && (
          <article
            className={`relative mx-auto mt-10 max-w-5xl overflow-hidden rounded-[34px] border bg-gradient-to-br p-5 shadow-2xl shadow-black/55 md:p-8 ${theme.border} ${theme.background}`}
          >
            <div
              className={`pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full blur-[90px] ${theme.glow}`}
            />

            <div className="relative">
              <div className="flex flex-col gap-6 border-b border-white/10 pb-7 md:flex-row md:items-start md:justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl border border-white/15 text-3xl font-black ${theme.soft} ${theme.text}`}
                  >
                    {employee.level}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-black ${theme.badge}`}
                      >
                        المستوى{" "}
                        {employee.level}
                      </span>

                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-black ${status.style}`}
                      >
                        {status.label}
                      </span>
                    </div>

                    <h2 className="mt-3 text-3xl font-black md:text-4xl">
                      {employee.name}
                    </h2>

                    <p className="mt-2 text-sm text-zinc-400">
                      {
                        employee.employeeTypeLabel
                      }
                      {employee.administrationTitle
                        ? ` — ${employee.administrationTitle}`
                        : ""}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={copyCode}
                  className="flex max-w-full flex-wrap items-center justify-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-5 py-4 font-mono text-base font-black text-white transition hover:border-white/20 hover:bg-black/45 sm:text-xl"
                >
                  <Copy size={19} />
                  {displayedCode}
                  <span className="font-sans text-xs text-zinc-500">
                    {copied
                      ? "تم النسخ"
                      : "نسخ الكود"}
                  </span>
                </button>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                  title="إجمالي التقارير"
                  value={
                    employee.reportsTotal
                  }
                  description="مجموع التقارير المسجلة في البطاقة"
                  icon={
                    <FileText size={22} />
                  }
                />

                <MetricCard
                  title="الدورات"
                  value={
                    employee.courses.length
                  }
                  description="عدد الدورات المعتمدة"
                  icon={
                    <BookOpenCheck
                      size={22}
                    />
                  }
                />

                <MetricCard
                  title="الإنذارات"
                  value={
                    employee.warningsCount
                  }
                  description="العدد المسجل دون عرض تفاصيل داخلية"
                  icon={
                    <ShieldCheck
                      size={22}
                    />
                  }
                />

                <MetricCard
                  title="تاريخ التعيين"
                  value={formatDate(
                    employee.hiredAt
                  )}
                  description="بحسب التاريخ المحفوظ في النظام"
                  icon={
                    <CalendarDays
                      size={22}
                    />
                  }
                />
              </div>

              <div className="mt-6 grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
                <section className="rounded-3xl border border-white/10 bg-black/25 p-5">
                  <div className="flex items-center gap-3">
                    <Gauge
                      size={22}
                      className={theme.text}
                    />
                    <h3 className="text-xl font-black">
                      رصد التقارير
                    </h3>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {[
                      [
                        "الموجة الميداني",
                        employee.reports
                          .fieldGuide,
                      ],
                      [
                        "المشرف الميداني",
                        employee.reports
                          .fieldSupervisor,
                      ],
                      [
                        "الإشراف العام",
                        employee.reports
                          .generalSupervisor,
                      ],
                      [
                        "شؤون التوظيف",
                        employee.reports
                          .recruitment,
                      ],
                    ].map(
                      ([label, value]) => (
                        <div
                          key={String(label)}
                          className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.035] p-4"
                        >
                          <span className="text-sm font-bold text-zinc-400">
                            {label}
                          </span>
                          <strong
                            className={`text-2xl font-black ${theme.text}`}
                          >
                            {value}
                          </strong>
                        </div>
                      )
                    )}
                  </div>
                </section>

                <section className="rounded-3xl border border-white/10 bg-black/25 p-5">
                  <div className="flex items-center gap-3">
                    <Sparkles
                      size={22}
                      className={theme.text}
                    />
                    <h3 className="text-xl font-black">
                      معلومات البطاقة
                    </h3>
                  </div>

                  <dl className="mt-5 space-y-3">
                    <div className="flex items-center justify-between gap-4 rounded-2xl bg-white/[0.035] p-4">
                      <dt className="text-sm text-zinc-500">
                        كوبي الآيدي
                      </dt>
                      <dd className="font-mono text-sm font-black text-zinc-200">
                        {employee.discordId}
                      </dd>
                    </div>

                    <div className="flex items-center justify-between gap-4 rounded-2xl bg-white/[0.035] p-4">
                      <dt className="text-sm text-zinc-500">
                        القطاع الأساسي
                      </dt>
                      <dd className="text-sm font-black text-zinc-200">
                        {employee.mainSector ||
                          "كراج الميكانيك"}
                      </dd>
                    </div>

                    <div className="flex items-center justify-between gap-4 rounded-2xl bg-white/[0.035] p-4">
                      <dt className="text-sm text-zinc-500">
                        التصنيف
                      </dt>
                      <dd className="text-sm font-black text-zinc-200">
                        {
                          employee.employeeTypeLabel
                        }
                      </dd>
                    </div>
                  </dl>
                </section>
              </div>

              <section className="mt-6 rounded-3xl border border-white/10 bg-black/25 p-5">
                <div className="flex items-center gap-3">
                  <CheckCircle2
                    size={22}
                    className={theme.text}
                  />
                  <h3 className="text-xl font-black">
                    الدورات المعتمدة
                  </h3>
                </div>

                {employee.courses.length >
                0 ? (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {employee.courses.map(
                      (course) => (
                        <span
                          key={course}
                          className={`rounded-full border px-4 py-2 text-sm font-bold ${theme.badge}`}
                        >
                          {course}
                        </span>
                      )
                    )}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-zinc-500">
                    لا توجد دورات مسجلة
                    حاليًا.
                  </p>
                )}
              </section>

              <div className="mt-6 flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-center text-sm text-zinc-500">
                <ShieldCheck size={18} />
                بطاقة عرض فقط — لا توجد
                صلاحية تعديل من صفحة العموم
              </div>
            </div>
          </article>
        )}
      </section>
    </main>
  );
}
