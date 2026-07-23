"use client";

import {
  useState,
  type FormEvent,
} from "react";
import Link from "next/link";
import {
  AlertTriangle,
  BadgeCheck,
  BookOpenCheck,
  CalendarDays,
  Copy,
  FileText,
  Loader2,
  Search,
  ShieldCheck,
  Wrench,
} from "lucide-react";

type Employee = {
  name: string;
  discordId: string;
  fullCode: string;
  level: number;
  employeeType: string;
  classification: string;
  mainSector: string;
  administrationTitle: string;
  status:
    | "active"
    | "leave"
    | "suspended";
  reports: {
    fieldGuide: number;
    fieldSupervisor: number;
    generalSupervisor: number;
    recruitment: number;
  };
  reportsTotal: number;
  courses: string[];
  warningsCount: number;
  hiredAt: string | null;
};

const LEVEL_COLORS: Record<
  number,
  string
> = {
  1: "border-cyan-400/30 from-cyan-500/20",
  2: "border-emerald-400/30 from-emerald-500/20",
  3: "border-lime-400/30 from-lime-500/20",
  4: "border-yellow-400/30 from-yellow-500/20",
  5: "border-orange-400/30 from-orange-500/20",
  6: "border-rose-400/30 from-rose-500/20",
  7: "border-pink-400/30 from-pink-500/20",
  8: "border-violet-400/30 from-violet-500/20",
  9: "border-indigo-400/30 from-indigo-500/20",
  10: "border-red-400/30 from-red-500/20",
};

function dateText(value: string | null) {
  if (!value) {
    return "غير مسجل";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "غير مسجل";
  }

  return new Intl.DateTimeFormat(
    "ar-SA",
    { dateStyle: "medium" }
  ).format(date);
}

function statusText(
  status: Employee["status"]
) {
  if (status === "leave") {
    return "في إجازة";
  }

  if (status === "suspended") {
    return "موقوف";
  }

  return "على رأس العمل";
}

function displayCode(employee: Employee) {
  const certified =
    employee.employeeType ===
      "certified" ||
    employee.employeeType ===
      "certified_leader";

  return certified &&
    employee.mainSector
    ? `${employee.fullCode} | ${employee.mainSector}`
    : employee.fullCode;
}

export default function EmployeeCardPage() {
  const [discordId, setDiscordId] =
    useState("");
  const [employee, setEmployee] =
    useState<Employee | null>(null);
  const [loading, setLoading] =
    useState(false);
  const [error, setError] =
    useState("");

  async function submit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const cleanId = discordId
      .replace(/\D/g, "")
      .trim();

    setDiscordId(cleanId);
    setEmployee(null);
    setError("");

    if (!/^\d{15,25}$/.test(cleanId)) {
      setError(
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

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ??
            "تعذر عرض البطاقة."
        );
      }

      setEmployee(result.employee);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "تعذر عرض البطاقة."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#050607] text-white"
    >
      <header className="border-b border-white/10 bg-black/70 backdrop-blur-xl">
        <div className="mx-auto flex w-[94%] max-w-6xl items-center justify-between py-5">
          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-yellow-500 text-black">
              <Wrench size={21} />
            </span>
            <span>
              <strong className="block text-yellow-400">
                MSS
              </strong>
              <small className="text-zinc-500">
                Mechanic Sector System
              </small>
            </span>
          </Link>

          <Link
            href="/"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-zinc-300"
          >
            الرئيسية
          </Link>
        </div>
      </header>

      <section className="mx-auto w-[94%] max-w-5xl py-14">
        <div className="text-center">
          <BadgeCheck
            size={44}
            className="mx-auto text-yellow-400"
          />
          <h1 className="mt-5 text-4xl font-black">
            بطاقتي في القطاع
          </h1>
          <p className="mt-3 text-zinc-500">
            ألصق كوبي آيدي الديسكورد
            لعرض البطاقة فقط.
          </p>
        </div>

        <form
          onSubmit={submit}
          className="mx-auto mt-8 flex max-w-3xl flex-col gap-3 rounded-3xl border border-white/10 bg-white/[0.04] p-4 sm:flex-row"
        >
          <input
            value={discordId}
            onChange={(event) =>
              setDiscordId(
                event.target.value
              )
            }
            inputMode="numeric"
            placeholder="كوبي آيدي الديسكورد"
            className="h-14 flex-1 rounded-2xl border border-white/10 bg-black/40 px-5 font-mono outline-none focus:border-yellow-400/50"
          />

          <button
            type="submit"
            disabled={loading}
            className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-yellow-500 px-7 font-black text-black disabled:opacity-60"
          >
            {loading ? (
              <Loader2
                size={20}
                className="animate-spin"
              />
            ) : (
              <Search size={20} />
            )}
            عرض بطاقتي
          </button>
        </form>

        {error && (
          <div className="mx-auto mt-5 flex max-w-3xl items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-300">
            <AlertTriangle size={20} />
            <strong>{error}</strong>
          </div>
        )}

        {employee && (
          <article
            className={`mt-9 overflow-hidden rounded-[32px] border bg-gradient-to-br via-[#0b0d11] to-[#050607] p-6 shadow-2xl shadow-black/60 md:p-8 ${
              LEVEL_COLORS[
                employee.level
              ] ??
              LEVEL_COLORS[1]
            }`}
          >
            <div className="flex flex-col gap-5 border-b border-white/10 pb-6 md:flex-row md:items-start md:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-white/15 bg-black/35 text-3xl font-black text-yellow-300">
                  {employee.level}
                </div>

                <div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border border-yellow-400/20 bg-yellow-500/10 px-3 py-1 text-xs font-black text-yellow-300">
                      المستوى{" "}
                      {employee.level}
                    </span>
                    <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-black text-emerald-300">
                      {statusText(
                        employee.status
                      )}
                    </span>
                  </div>

                  <h2 className="mt-3 text-3xl font-black">
                    {employee.name}
                  </h2>

                  <p className="mt-2 font-bold text-zinc-400">
                    {
                      employee.classification
                    }
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  navigator.clipboard.writeText(
                    displayCode(employee)
                  )
                }
                className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/35 px-5 py-4 font-mono font-black"
              >
                <Copy size={18} />
                {displayCode(employee)}
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  title:
                    "إجمالي التقارير",
                  value:
                    employee.reportsTotal,
                  icon: (
                    <FileText size={21} />
                  ),
                },
                {
                  title: "الدورات",
                  value:
                    employee.courses.length,
                  icon: (
                    <BookOpenCheck
                      size={21}
                    />
                  ),
                },
                {
                  title: "الإنذارات",
                  value:
                    employee.warningsCount,
                  icon: (
                    <ShieldCheck size={21} />
                  ),
                },
                {
                  title: "تاريخ التعيين",
                  value: dateText(
                    employee.hiredAt
                  ),
                  icon: (
                    <CalendarDays
                      size={21}
                    />
                  ),
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-white/10 bg-black/25 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-zinc-500">
                        {item.title}
                      </p>
                      <p className="mt-2 text-2xl font-black">
                        {item.value}
                      </p>
                    </div>
                    <span className="rounded-xl border border-white/10 bg-white/5 p-3 text-zinc-400">
                      {item.icon}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <section className="mt-6 rounded-3xl border border-white/10 bg-black/25 p-5">
              <h3 className="text-xl font-black">
                رصد التقارير
              </h3>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
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
                      className="flex items-center justify-between rounded-2xl bg-white/[0.04] p-4"
                    >
                      <span className="text-sm font-bold text-zinc-400">
                        {label}
                      </span>
                      <strong className="text-xl text-yellow-300">
                        {value}
                      </strong>
                    </div>
                  )
                )}
              </div>
            </section>

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center text-sm text-zinc-500">
              بطاقة عرض فقط — لا توجد
              صلاحية تعديل
            </div>
          </article>
        )}
      </section>
    </main>
  );
}
