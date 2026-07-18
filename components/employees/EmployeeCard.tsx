"use client";

import Link from "next/link";

import {
  User,
  Crown,
  FileText,
  GraduationCap,
  TriangleAlert,
  MessageCircle,
  ArrowLeft,
  BadgeCheck,
} from "lucide-react";

type Employee = {
  id: string;
  name: string;
  discordId: string;
  rank: string;
  level: number | string;

  reports?: {
    fieldGuide?: number;
    fieldSupervisor?: number;
    generalSupervisor?: number;
    recruitment?: number;
  };

  warnings?: number | unknown[];

  courses?: string[];

  status?: string;

  leave?: {
    active?: boolean;
    type?: string;
    reason?: string;
  } | null;

  certified?: boolean;
  certifiedLeader?: boolean;
};

export default function EmployeeCard({
  employee,
}: {
  employee: Employee;
}) {
  const reports =
    Number(employee.reports?.fieldGuide ?? 0) +
    Number(employee.reports?.fieldSupervisor ?? 0) +
    Number(employee.reports?.generalSupervisor ?? 0) +
    Number(employee.reports?.recruitment ?? 0);

  const warnings = Array.isArray(employee.warnings)
    ? employee.warnings.length
    : Number(employee.warnings ?? 0);

  const completed = Array.isArray(employee.courses)
    ? employee.courses.length
    : 0;

  const total = 8;

  /*
    الحالة الجديدة تُحفظ بهذه القيم:
    active
    leave
    suspended

    وندعم القيم العربية القديمة أيضًا.
  */

  const rawStatus = String(
    employee.status ?? "active"
  ).trim();

  const isOnLeave =
    employee.leave?.active === true ||
    rawStatus === "leave" ||
    rawStatus === "إجازة" ||
    rawStatus === "في إجازة";

  const isSuspended =
    rawStatus === "suspended" ||
    rawStatus === "موقوف";

  const statusText = isOnLeave
    ? "في إجازة"
    : isSuspended
      ? "موقوف"
      : "على رأس العمل";

  const statusStyle = isOnLeave
    ? "border border-orange-500/20 bg-orange-500/15 text-orange-400"
    : isSuspended
      ? "border border-red-500/20 bg-red-500/15 text-red-400"
      : "border border-green-500/20 bg-green-500/15 text-green-400";

  const statusIcon = isOnLeave
    ? "🏖️"
    : isSuspended
      ? "⏸️"
      : "🟢";

  return (
    <Link href={`/dashboard/employees/${employee.id}`}>
      <article className="group relative overflow-hidden rounded-3xl border border-white/10 bg-[#141414] transition-all duration-300 hover:-translate-y-1 hover:border-yellow-500/40">
        <div className="absolute -left-16 -top-16 h-44 w-44 rounded-full bg-yellow-500/10 blur-3xl transition-all duration-500 group-hover:bg-yellow-500/20" />

        <div className="relative p-7">
          <div className="flex items-start justify-between gap-5">
            <div className="flex min-w-0 gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-yellow-500/20 bg-yellow-500/10">
                <User
                  size={30}
                  className="text-yellow-400"
                />
              </div>

              <div className="min-w-0">
                <h2 className="break-words text-2xl font-black text-white">
                  {employee.name || "موظف دون اسم"}
                </h2>

                <div className="mt-2 flex items-center gap-2 break-all text-zinc-400">
                  <MessageCircle
                    size={16}
                    className="shrink-0"
                  />

                  {employee.discordId || "غير محدد"}
                </div>
              </div>
            </div>

            <div className="shrink-0 text-left">
              <div className="rounded-xl bg-yellow-500/10 px-4 py-2 font-bold text-yellow-400">
                {employee.level === "قيادة" ? (
                  <div className="flex items-center gap-2">
                    <Crown size={18} />
                    قيادة
                  </div>
                ) : (
                  <>⭐ المستوى {employee.level}</>
                )}
              </div>

              <div className="mt-3 flex flex-col items-end gap-2">
                <p className="font-bold text-white">
                  {employee.rank || "بدون كود"}
                </p>

                {employee.certifiedLeader ? (
                  <div className="flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs font-bold text-purple-400">
                    <Crown size={14} />
                    قيادة معتمدة
                  </div>
                ) : employee.certified ? (
                  <div className="flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-xs font-bold text-green-400">
                    <BadgeCheck size={14} />
                    لاعب معتمد
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="rounded-2xl border border-white/10 bg-[#1b1b1b] p-4 text-center">
              <FileText
                className="mx-auto mb-2 text-yellow-400"
                size={22}
              />

              <p className="text-2xl font-black text-white">
                {reports.toLocaleString("ar-SA")}
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                التقارير
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#1b1b1b] p-4 text-center">
              <GraduationCap
                className="mx-auto mb-2 text-yellow-400"
                size={22}
              />

              <p className="text-2xl font-black text-white">
                {completed}/{total}
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                الدورات
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#1b1b1b] p-4 text-center">
              <TriangleAlert
                className="mx-auto mb-2 text-yellow-400"
                size={22}
              />

              <p className="text-2xl font-black text-white">
                {warnings.toLocaleString("ar-SA")}
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                الإنذارات
              </p>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between gap-4">
            <div
              className={`rounded-full px-4 py-2 text-sm font-bold ${statusStyle}`}
            >
              {statusIcon} {statusText}
            </div>

            <div className="flex items-center gap-2 font-bold text-yellow-400 transition-all duration-300 group-hover:gap-4">
              فتح الملف
              <ArrowLeft size={18} />
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}