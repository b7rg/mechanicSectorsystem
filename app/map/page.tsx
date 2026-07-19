"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import {
  ArrowRight,
  Loader2,
  MapPinned,
  ShieldCheck,
  Wrench,
} from "lucide-react";

const GtaMap = dynamic(
  () => import("@/components/map/GtaMap"),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[650px] items-center justify-center rounded-[32px] border border-white/10 bg-[#141414]">
        <div className="text-center">
          <Loader2
            size={42}
            className="mx-auto animate-spin text-yellow-400"
          />

          <p className="mt-4 font-bold text-zinc-400">
            جارٍ تحميل خريطة القطاع...
          </p>
        </div>
      </div>
    ),
  }
);

export default function PublicMapPage() {
  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#080808] text-white"
    >
      <header className="border-b border-white/10 bg-[#0d0d0d]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4 px-5 py-5 md:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-yellow-500/20 bg-yellow-500/10">
              <Wrench
                size={24}
                className="text-yellow-400"
              />
            </div>

            <div>
              <h1 className="font-black text-white">
                قطاع الميكانيك
              </h1>

              <p className="mt-1 text-xs font-bold text-yellow-400">
                MECHANIC SECTOR
              </p>
            </div>
          </div>

          <Link
            href="/"
            className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-bold text-zinc-300 transition hover:border-yellow-500/30 hover:text-yellow-400"
          >
            <ArrowRight size={18} />
            العودة للرئيسية
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-[1600px] space-y-8 px-4 py-8 md:px-8">
        <section className="relative overflow-hidden rounded-[32px] border border-yellow-500/20 bg-gradient-to-br from-yellow-500/[0.09] via-[#141414] to-[#0d0d0d] p-7 md:p-10">
          <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-yellow-500/10 blur-3xl" />

          <div className="relative flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-3xl">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-yellow-500/20 bg-yellow-500/10">
                <MapPinned
                  size={31}
                  className="text-yellow-400"
                />
              </div>

              <h2 className="text-3xl font-black text-yellow-400 md:text-5xl">
                خريطة المسميات الميدانية
              </h2>

              <p className="mt-5 max-w-3xl text-base leading-8 text-zinc-400 md:text-lg">
                اختر إحدى المناطق من الخريطة لمعرفة
                المسميات المعتمدة لكل مستوى والاعتمادات
                المطلوبة.
              </p>
            </div>

            <div className="rounded-2xl border border-green-500/20 bg-green-500/10 px-5 py-4">
              <p className="flex items-center gap-2 font-black text-green-400">
                <ShieldCheck size={20} />
                متاحة للجميع
              </p>

              <p className="mt-2 text-sm text-zinc-400">
                لا يتطلب تسجيل الدخول
              </p>
            </div>
          </div>
        </section>

        <GtaMap publicMode />
      </div>

      <footer className="mt-10 border-t border-white/10 py-7 text-center text-sm text-zinc-600">
        جميع المسميات المعروضة معتمدة من قيادة قطاع
        الميكانيك
      </footer>
    </main>
  );
}