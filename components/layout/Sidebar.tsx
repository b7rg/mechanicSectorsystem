"use client";

import Link from "next/link";
import {
  Home,
  Users,
  GraduationCap,
  Trophy,
  UserCheck,
  Settings,
} from "lucide-react";

const menu = [
  {
    name: "الرئيسية",
    href: "/dashboard",
    icon: Home,
  },
  {
    name: "الموظفون",
    href: "/dashboard/employees",
    icon: Users,
  },
  {
    name: "الترقيات",
    href: "/dashboard/promotions",
    icon: Trophy,
  },
  {
    name: "الدورات",
    href: "/dashboard/courses",
    icon: GraduationCap,
  },
  {
    name: "اللاعب المعتمد",
    href: "/dashboard/certified",
    icon: UserCheck,
  },
  {
    name: "الإعدادات",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  return (
    <aside className="h-screen w-72 border-r border-[#2A2A2A] bg-[#121212] p-6">
      <h1 className="mb-8 text-3xl font-bold text-[#D4AF37]">
        MSS
      </h1>

      <nav className="space-y-2">
        {menu.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 rounded-xl p-3 text-gray-300 transition hover:bg-[#1D1D1D] hover:text-[#D4AF37]"
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}