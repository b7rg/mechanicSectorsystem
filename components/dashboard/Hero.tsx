"use client";

import Link from "next/link";
import { Users, Plus, BarChart3 } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden rounded-[32px] border border-yellow-500/20 bg-white/5 p-7 backdrop-blur-xl md:p-10">
      <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-yellow-500/10 blur-[120px]" />

      <div className="relative z-10">
        <p className="font-semibold text-yellow-400">
          Mechanic Sector System
        </p>

        <h1 className="mt-3 text-4xl font-black leading-tight md:text-5xl">
          مرحبًا بك في
          <span className="text-yellow-400"> Thrones</span>
        </h1>

        <p className="mt-5 max-w-2xl leading-8 text-zinc-300">
          لوحة التحكم الرئيسية لقطاع الميكانيك. جميع البيانات
          والإحصائيات يتم تحديثها مباشرة من Firebase.
        </p>

        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/dashboard/employees"
            className="flex items-center gap-2 rounded-2xl bg-yellow-500 px-6 py-4 font-bold text-black transition hover:scale-105 hover:bg-yellow-400"
          >
            <Users size={20} />
            الموظفون
          </Link>

          <Link
            href="/dashboard/employees/add"
            className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-4 font-bold text-white transition hover:border-yellow-500 hover:text-yellow-400"
          >
            <Plus size={20} />
            إضافة موظف
          </Link>

          <Link
            href="/dashboard/statistics"
            className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-4 font-bold text-white transition hover:border-yellow-500 hover:text-yellow-400"
          >
            <BarChart3 size={20} />
            الإحصائيات
          </Link>
        </div>
      </div>
    </section>
  );
}