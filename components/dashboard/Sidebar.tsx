"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import {
  AlertOctagon,
  BadgeCheck,
  BarChart3,
  BookOpenCheck,
  CalendarDays,
  GraduationCap,
  LayoutDashboard,
  KeyRound,
  LogOut,
  Megaphone,
  Menu,
  Settings,
  TrendingUp,
  Users,
  Wrench,
  X,
  MapPinned,
  type LucideIcon,
} from "lucide-react";

import { auth, db } from "@/lib/firebase";
import { hasPermission } from "@/lib/permissions";

type NavigationItem = {
  label: string;
  href: string;
  permission: string;
  icon: LucideIcon;
  ownerOnly?: boolean;
};

const navigationItems: NavigationItem[] = [
  {
    label: "الرئيسية",
    href: "/dashboard",
    permission: "dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "الموظفون",
    href: "/dashboard/employees",
    permission: "employees",
    icon: Users,
  },
  {
    label: "الترقيات",
    href: "/dashboard/promotions",
    permission: "promotions",
    icon: TrendingUp,
  },
  {
    label: "الدورات",
    href: "/dashboard/courses",
    permission: "courses",
    icon: GraduationCap,
  },
  {
    label: "اللاعب المعتمد",
    href: "/dashboard/certified",
    permission: "certified",
    icon: BadgeCheck,
  },
  {
    label: "الإعلانات",
    href: "/dashboard/announcements",
    permission: "announcements",
    icon: Megaphone,
  },
  {
    label: "القوانين",
    href: "/dashboard/rules",
    permission: "rules",
    icon: BookOpenCheck,
  },
  {
    label: "المخالفات والغرامات",
    href: "/dashboard/violations",
    permission: "violations",
    icon: AlertOctagon,
  },
  {
    label: "تقويم القطاع",
    href: "/dashboard/calendar",
    permission: "calendar",
    icon: CalendarDays,
  },
  {
    label: "الإحصائيات",
    href: "/dashboard/statistics",
    permission: "statistics",
    icon: BarChart3,
  },
  {
    label: "الإعدادات",
    href: "/dashboard/settings",
    permission: "settings",
    icon: Settings,
  },
{
  label: "إدارة الماب",
  href: "/dashboard/map",
  permission: "map",
  icon: MapPinned,
},
  {
    label: "كلمات المرور",
    href: "/dashboard/account-passwords",
    permission: "settings",
    icon: KeyRound,
    ownerOnly: true,
  },
];

const roleLabels: Record<string, string> = {
  owner: "المالك",
  leader: "القيادة",
  supervisor: "المشرف",
  visitor: "زائر",
};

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [userName, setUserName] = useState("");
  const [loadingRole, setLoadingRole] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let unsubscribeUserDocument: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      unsubscribeUserDocument?.();

      if (!user) {
        setRole(null);
        setUserName("");
        setLoadingRole(false);
        return;
      }

      setUserName(
        user.displayName ||
          user.email?.split("@")[0] ||
          "مستخدم النظام"
      );

      unsubscribeUserDocument = onSnapshot(
        doc(db, "users", user.uid),
        (snapshot) => {
          const userData = snapshot.data();

          setRole(
            typeof userData?.role === "string"
              ? userData.role
              : "visitor"
          );

          setUserName(
            typeof userData?.name === "string" &&
              userData.name.trim()
              ? userData.name
              : user.displayName ||
                  user.email?.split("@")[0] ||
                  "مستخدم النظام"
          );

          setLoadingRole(false);
        },
        (error) => {
          console.error("تعذر تحميل صلاحية المستخدم:", error);
          setRole("visitor");
          setLoadingRole(false);
        }
      );
    });

    return () => {
      unsubscribeUserDocument?.();
      unsubscribeAuth();
    };
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const visibleNavigationItems = useMemo(() => {
    if (!role) {
      return [];
    }

    return navigationItems.filter(
      (item) =>
        hasPermission(role, item.permission) &&
        (!item.ownerOnly || role === "owner")
    );
  }, [role]);

  function isActive(href: string) {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  }

  async function handleLogout() {
    try {
      setLoggingOut(true);
      await signOut(auth);
      router.replace("/");
      router.refresh();
    } catch (error) {
      console.error("تعذر تسجيل الخروج:", error);
      alert("حدث خطأ أثناء تسجيل الخروج.");
      setLoggingOut(false);
    }
  }

  function SidebarContent() {
    return (
      <>
        <div className="border-b border-white/10 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-yellow-500/20 bg-yellow-500/10">
              <Wrench
                size={28}
                className="text-yellow-400"
              />
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-lg font-black text-white">
                قطاع الميكانيك
              </h2>

              <p className="mt-1 text-xs font-bold text-yellow-400">
                MECHANIC SECTOR SYSTEM
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="truncate font-black text-white">
              {loadingRole ? "جارٍ التحميل..." : userName}
            </p>

            <div className="mt-2 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-400" />

              <span className="text-sm text-zinc-400">
                {loadingRole
                  ? "جارٍ قراءة الصلاحية"
                  : roleLabels[role ?? "visitor"] ?? role}
              </span>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <p className="mb-3 px-3 text-xs font-black text-zinc-600">
            لوحة الإدارة
          </p>

          {loadingRole ? (
            <div className="space-y-3">
              {Array.from({ length: 7 }).map((_, index) => (
                <div
                  key={index}
                  className="h-14 animate-pulse rounded-2xl bg-white/5"
                />
              ))}
            </div>
          ) : visibleNavigationItems.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 p-5 text-center text-sm leading-6 text-zinc-500">
              لا توجد صفحات متاحة لهذه الصلاحية.
            </div>
          ) : (
            <div className="space-y-2">
              {visibleNavigationItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center gap-3 rounded-2xl px-4 py-3.5 font-bold transition ${
                      active
                        ? "bg-yellow-500 text-black shadow-lg shadow-yellow-500/10"
                        : "text-zinc-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon
                      size={21}
                      className={
                        active
                          ? "text-black"
                          : "text-zinc-500 transition group-hover:text-yellow-400"
                      }
                    />

                    <span className="flex-1">
                      {item.label}
                    </span>

                    {active && (
                      <span className="h-2 w-2 rounded-full bg-black" />
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </nav>

        <div className="border-t border-white/10 p-4">
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-red-500/15 bg-red-500/5 px-4 py-3.5 font-black text-red-400 transition hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <LogOut size={20} />

            {loggingOut ? "جارٍ تسجيل الخروج..." : "تسجيل الخروج"}
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed right-4 top-4 z-40 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-[#141414]/95 text-white shadow-xl backdrop-blur-xl lg:hidden"
        aria-label="فتح القائمة"
      >
        <Menu size={24} />
      </button>

      {mobileOpen && (
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          aria-label="إغلاق القائمة"
        />
      )}

      <aside
        className={`fixed right-0 top-0 z-50 flex h-screen w-72 flex-col border-l border-white/10 bg-[#0d0d0d]/98 shadow-2xl backdrop-blur-2xl transition-transform duration-300 lg:hidden ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-400 transition hover:text-white"
          aria-label="إغلاق القائمة"
        >
          <X size={20} />
        </button>

        <SidebarContent />
      </aside>

      <aside className="fixed right-0 top-0 z-30 hidden h-screen w-72 flex-col border-l border-white/10 bg-[#0d0d0d]/95 shadow-2xl backdrop-blur-2xl lg:flex">
        <SidebarContent />
      </aside>
    </>
  );
}