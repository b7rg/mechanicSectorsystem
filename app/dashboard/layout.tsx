import type { ReactNode } from "react";

import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import AdminGuard from "@/components/auth/AdminGuard";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return (
    <AdminGuard>
      <div
        dir="rtl"
        className="relative min-h-screen overflow-x-hidden bg-black text-white"
      >
        {/* فيديو الخلفية */}
<video
  autoPlay
  muted
  loop
  playsInline
  preload="auto"
  className="pointer-events-none fixed inset-0 -z-30 h-screen w-screen object-cover opacity-60"
>
  <source src="/videos/hero-new.mp4" type="video/mp4" />
</video>

{/* طبقة داكنة فوق الفيديو */}
<div className="pointer-events-none fixed inset-0 -z-20 bg-black/50" />
{/* تدرج يحافظ على وضوح المحتوى */}
<div className="pointer-events-none fixed inset-0 -z-30 h-full w-full object-cover opacity-80" />

        {/* الإضاءة الذهبية */}
        <div className="pointer-events-none fixed left-1/2 top-0 -z-10 h-[700px] w-[700px] -translate-x-1/2 rounded-full bg-yellow-500/10 blur-[180px]" />

        <Sidebar />

        {/* نفس عرض القائمة: lg:mr-80 مقابل w-80 */}
        <div className="min-h-screen transition-[margin] duration-300 lg:mr-80">
          <Topbar />

          <main className="min-w-0 px-4 pb-10 pt-20 sm:px-6 lg:px-8 lg:pt-8">
            {children}
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}