"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import {
  Loader2,
  MapPinned,
  Settings2,
} from "lucide-react";

type MapTab = "view" | "manage";

function LoadingMap() {
  return (
    <div className="flex min-h-[650px] items-center justify-center rounded-[32px] border border-white/10 bg-[#141414]">
      <div className="text-center">
        <Loader2
          size={42}
          className="mx-auto animate-spin text-yellow-400"
        />

        <p className="mt-4 font-bold text-zinc-400">
          جارٍ تحميل الخريطة...
        </p>
      </div>
    </div>
  );
}

const GtaMap = dynamic(
  () => import("@/components/map/GtaMap"),
  {
    ssr: false,
    loading: LoadingMap,
  }
);

const ManageMapRegionsPage = dynamic(
  () =>
    import(
      "@/components/map/ManageMapRegionsPage"
    ),
  {
    ssr: false,
    loading: LoadingMap,
  }
);

export default function DashboardMapPage() {
  const [activeTab, setActiveTab] =
    useState<MapTab>("view");

  return (
    <div
      dir="rtl"
      className="space-y-8"
    >
      <header className="flex flex-wrap items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-yellow-500/20 bg-yellow-500/10">
            <MapPinned
              size={31}
              className="text-yellow-400"
            />
          </div>

          <div>
            <h1 className="text-3xl font-black text-yellow-400 md:text-4xl">
              الخريطة الميدانية
            </h1>

            <p className="mt-2 text-zinc-400">
              عرض الخريطة وإدارة المناطق
              والمسميات المعتمدة.
            </p>
          </div>
        </div>

        <div className="flex rounded-2xl border border-white/10 bg-[#141414] p-1.5">
          <button
            type="button"
            onClick={() =>
              setActiveTab("view")
            }
            className={`flex items-center gap-2 rounded-xl px-5 py-3 font-black transition ${
              activeTab === "view"
                ? "bg-yellow-500 text-black"
                : "text-zinc-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <MapPinned size={18} />
            عرض الخريطة
          </button>

          <button
            type="button"
            onClick={() =>
              setActiveTab("manage")
            }
            className={`flex items-center gap-2 rounded-xl px-5 py-3 font-black transition ${
              activeTab === "manage"
                ? "bg-yellow-500 text-black"
                : "text-zinc-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Settings2 size={18} />
            إدارة المناطق
          </button>
        </div>
      </header>

      {activeTab === "view" ? (
        <GtaMap />
      ) : (
        <ManageMapRegionsPage />
      )}
    </div>
  );
}