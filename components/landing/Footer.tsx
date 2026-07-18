import Link from "next/link";
import { Wrench, ShieldCheck, Users } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#090909]">
      <div className="mx-auto flex w-[92%] max-w-7xl flex-col gap-10 py-16 lg:flex-row lg:justify-between">

        <div className="max-w-md">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-500 text-black">
              <Wrench size={22} />
            </div>

            <div>
              <h2 className="logo text-2xl text-yellow-400">
                MSS
              </h2>

              <p className="text-sm text-zinc-500">
                Mechanic Sector System
              </p>
            </div>
          </div>

          <p className="mt-6 leading-8 text-zinc-400">
            نظام إدارة احترافي لقطاع الميكانيك، صُمم لتسهيل إدارة
            الموظفين، الدورات، التقارير والإحصائيات.
          </p>
        </div>

        <div>
          <h3 className="mb-5 font-semibold text-white">
            روابط سريعة
          </h3>

          <div className="flex flex-col gap-3 text-zinc-400">

            <Link href="/">الرئيسية</Link>
            <Link href="#about">عن القطاع</Link>
            <Link href="#courses">الدورات</Link>
            <Link href="/login">دخول النظام</Link>

          </div>
        </div>

        <div>
          <h3 className="mb-5 font-semibold text-white">
            معلومات
          </h3>

          <div className="space-y-4 text-zinc-400">

            <div className="flex items-center gap-3">
              <ShieldCheck size={18} />
             قطاع ثرونزي
            </div>

            <div className="flex items-center gap-3">
              <Users size={18} />
              إدارة الموظفين
            </div>

          </div>
        </div>

      </div>

      <div className="border-t border-white/10 py-6 text-center text-sm text-zinc-500">
        © {new Date().getFullYear()} Mechanic Sector System - جميع الحقوق محفوظة
      </div>
    </footer>
  );
}
