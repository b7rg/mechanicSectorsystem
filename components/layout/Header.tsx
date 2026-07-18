"use client";

import { Bell, Search, UserCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { getSettings } from "@/lib/settings";

export default function Header() {
  const [sectorName, setSectorName] = useState("قطاع الميكانيك");

  useEffect(() => {
    async function load() {
      const settings = await getSettings();

      if (settings?.sectorName) {
        setSectorName(settings.sectorName);
      }
    }

    load();
  }, []);

  return (
    <header className="flex h-20 items-center justify-between border-b border-[#2A2A2A] bg-[#121212] px-8">
      <div>
        <h2 className="text-2xl font-bold text-white">
          Mechanic Sector System
        </h2>

        <p className="text-sm text-gray-400">
          {sectorName}
        </p>
      </div>

      <div className="flex items-center gap-5">
        <Search className="cursor-pointer text-gray-400" />

        <Bell className="cursor-pointer text-gray-400" />

        <UserCircle2
          size={34}
          className="text-[#D4AF37]"
        />
      </div>
    </header>
  );
}
