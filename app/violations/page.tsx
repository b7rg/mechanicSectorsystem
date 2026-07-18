"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import {
  AlertOctagon,
  ArrowRight,
  Banknote,
  Search,
  ShieldAlert,
} from "lucide-react";

import { db } from "@/lib/firebase";

type ViolationLevel = "بسيطة" | "متوسطة" | "مشددة";

type SectorViolation = {
  id: string;
  title: string;
  description: string;
  penalty: string;
  amount?: string;
  category: string;
  level: ViolationLevel;
  active?: boolean;
  createdAt?: {
    toDate?: () => Date;
  };
};

const categoryOrder = [
  "السلوك الوظيفي",
  "التهرب الوظيفي",
  "الحضور والتفاعل",
  "مخالفات الراديو",
  "مخالفات المركبات",
  "مخالفات الميدان",
  "الدورات والترقيات",
  "مخالفات إدارية",
  "أخرى",
];

function getLevelClasses(level: ViolationLevel) {
  switch (level) {
    case "مشددة":
      return {
        badge:
          "border-red-500/25 bg-red-500/10 text-red-400",
        line: "bg-red-500",
        glow: "bg-red-500/10",
      };

    case "متوسطة":
      return {
        badge:
          "border-orange-500/25 bg-orange-500/10 text-orange-400",
        line: "bg-orange-500",
        glow: "bg-orange-500/10",
      };

    default:
      return {
        badge:
          "border-yellow-500/25 bg-yellow-500/10 text-yellow-400",
        line: "bg-yellow-500",
        glow: "bg-yellow-500/10",
      };
  }
}

function getLevelOrder(level: ViolationLevel) {
  switch (level) {
    case "مشددة":
      return 3;

    case "متوسطة":
      return 2;

    default:
      return 1;
  }
}

export default function PublicViolationsPage() {
  const [violations, setViolations] = useState<SectorViolation[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("الكل");
  const [levelFilter, setLevelFilter] = useState("الكل");

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const violationsQuery = query(
      collection(db, "sectorViolations"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      violationsQuery,
      (snapshot) => {
        const data = snapshot.docs
          .map((violationDoc) => ({
            id: violationDoc.id,
            ...(violationDoc.data() as Omit<
              SectorViolation,
              "id"
            >),
          }))
          .filter(
            (violation) => violation.active !== false
          );

        setViolations(data);
        setLoading(false);
        setLoadError("");
      },
      (error) => {
        console.error("تعذر تحميل المخالفات:", error);

        setLoadError(
          "تعذر تحميل المخالفات حاليًا، يرجى المحاولة مرة أخرى."
        );

        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const availableCategories = useMemo(() => {
    const categories = Array.from(
      new Set(
        violations
          .map((violation) => violation.category)
          .filter(Boolean)
      )
    );

    return categories.sort(
      (firstCategory, secondCategory) => {
        const firstIndex =
          categoryOrder.indexOf(firstCategory);

        const secondIndex =
          categoryOrder.indexOf(secondCategory);

        const safeFirstIndex =
          firstIndex === -1
            ? categoryOrder.length
            : firstIndex;

        const safeSecondIndex =
          secondIndex === -1
            ? categoryOrder.length
            : secondIndex;

        return safeFirstIndex - safeSecondIndex;
      }
    );
  }, [violations]);

  const filteredViolations = useMemo(() => {
    const cleanSearch = search.trim().toLowerCase();

    return violations
      .filter((violation) => {
        const matchesSearch =
          !cleanSearch ||
          violation.title
            ?.toLowerCase()
            .includes(cleanSearch) ||
          violation.description
            ?.toLowerCase()
            .includes(cleanSearch) ||
          violation.penalty
            ?.toLowerCase()
            .includes(cleanSearch) ||
          violation.amount
            ?.toLowerCase()
            .includes(cleanSearch) ||
          violation.category
            ?.toLowerCase()
            .includes(cleanSearch);

        const matchesCategory =
          categoryFilter === "الكل" ||
          violation.category === categoryFilter;

        const matchesLevel =
          levelFilter === "الكل" ||
          violation.level === levelFilter;

        return (
          matchesSearch &&
          matchesCategory &&
          matchesLevel
        );
      })
      .sort(
        (firstViolation, secondViolation) =>
          getLevelOrder(secondViolation.level) -
          getLevelOrder(firstViolation.level)
      );
  }, [
    violations,
    search,
    categoryFilter,
    levelFilter,
  ]);

  const severeCount = violations.filter(
    (violation) => violation.level === "مشددة"
  ).length;

  const mediumCount = violations.filter(
    (violation) => violation.level === "متوسطة"
  ).length;

  const simpleCount = violations.filter(
    (violation) => violation.level === "بسيطة"
  ).length;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#080808] px-5 py-12 text-white md:px-8">
      <div className="pointer-events-none fixed right-[-180px] top-[-180px] h-[500px] w-[500px] rounded-full bg-red-500/10 blur-[170px]" />

      <div className="pointer-events-none fixed bottom-[-220px] left-[-180px] h-[520px] w-[520px] rounded-full bg-yellow-500/5 blur-[180px]" />

      <div className="relative mx-auto max-w-7xl space-y-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-bold text-zinc-300 backdrop-blur-xl transition hover:border-yellow-500/30 hover:text-yellow-400"
        >
          <ArrowRight size={19} />
          الرجوع للرئيسية
        </Link>

        <header className="relative overflow-hidden rounded-[36px] border border-red-500/20 bg-white/5 p-8 backdrop-blur-2xl md:p-12">
          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-red-500/10 blur-[110px]" />

          <div className="relative flex flex-col gap-6 md:flex-row md:items-center">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl border border-red-500/25 bg-red-500/10">
              <AlertOctagon
                size={40}
                className="text-red-400"
              />
            </div>

            <div>
              <p className="font-bold tracking-wide text-yellow-400">
                MECHANIC SECTOR SYSTEM
              </p>

              <h1 className="mt-2 text-4xl font-black md:text-6xl">
                المخالفات والغرامات
              </h1>

              <p className="mt-4 max-w-3xl leading-8 text-zinc-400">
                المخالفات والإجراءات والغرامات المعتمدة
                داخل قطاع الميكانيك. يجب الاطلاع عليها
                والالتزام بأنظمة القطاع.
              </p>
            </div>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <p className="text-sm text-zinc-500">
              جميع المخالفات
            </p>

            <p className="mt-3 text-4xl font-black text-white">
              {violations.length}
            </p>
          </div>

          <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-6 backdrop-blur-xl">
            <p className="text-sm text-red-300">
              مخالفات مشددة
            </p>

            <p className="mt-3 text-4xl font-black text-red-400">
              {severeCount}
            </p>
          </div>

          <div className="rounded-3xl border border-orange-500/20 bg-orange-500/5 p-6 backdrop-blur-xl">
            <p className="text-sm text-orange-300">
              مخالفات متوسطة
            </p>

            <p className="mt-3 text-4xl font-black text-orange-400">
              {mediumCount}
            </p>
          </div>

          <div className="rounded-3xl border border-yellow-500/20 bg-yellow-500/5 p-6 backdrop-blur-xl">
            <p className="text-sm text-yellow-300">
              مخالفات بسيطة
            </p>

            <p className="mt-3 text-4xl font-black text-yellow-400">
              {simpleCount}
            </p>
          </div>
        </section>

        <section className="rounded-[30px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl md:p-6">
          <div className="grid gap-4 xl:grid-cols-[1fr_270px_230px]">
            <div className="relative">
              <Search
                size={20}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="ابحث في المخالفات أو العقوبات أو الغرامات..."
                className="w-full rounded-2xl border border-white/10 bg-black/20 py-4 pl-4 pr-12 text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-500"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(event.target.value)
              }
              className="rounded-2xl border border-white/10 bg-[#141414] p-4 text-white outline-none transition focus:border-yellow-500"
            >
              <option value="الكل">
                جميع الأقسام
              </option>

              {availableCategories.map((category) => (
                <option
                  key={category}
                  value={category}
                >
                  {category}
                </option>
              ))}
            </select>

            <select
              value={levelFilter}
              onChange={(event) =>
                setLevelFilter(event.target.value)
              }
              className="rounded-2xl border border-white/10 bg-[#141414] p-4 text-white outline-none transition focus:border-yellow-500"
            >
              <option value="الكل">
                جميع المستويات
              </option>

              <option value="بسيطة">
                بسيطة
              </option>

              <option value="متوسطة">
                متوسطة
              </option>

              <option value="مشددة">
                مشددة
              </option>
            </select>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5">
            <div>
              <p className="text-sm text-zinc-500">
                النتائج الظاهرة
              </p>

              <p className="mt-1 text-2xl font-black text-yellow-400">
                {filteredViolations.length}
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-2xl border border-red-500/15 bg-red-500/5 px-4 py-3 text-sm font-bold text-red-400">
              <ShieldAlert size={18} />
              مخالفات معتمدة من إدارة القطاع
            </div>
          </div>
        </section>

        {loading ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-14 text-center text-zinc-400 backdrop-blur-xl">
            جارٍ تحميل المخالفات...
          </div>
        ) : loadError ? (
          <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-14 text-center">
            <AlertOctagon
              size={45}
              className="mx-auto text-red-400"
            />

            <h2 className="mt-5 text-2xl font-black text-red-400">
              تعذر تحميل المخالفات
            </h2>

            <p className="mt-3 text-zinc-400">
              {loadError}
            </p>
          </div>
        ) : filteredViolations.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.02] p-14 text-center">
            <AlertOctagon
              size={45}
              className="mx-auto text-zinc-600"
            />

            <h2 className="mt-5 text-2xl font-black text-zinc-300">
              لا توجد مخالفات مطابقة
            </h2>

            <p className="mt-3 text-zinc-500">
              غير البحث أو الفلاتر لعرض نتائج أخرى.
            </p>
          </div>
        ) : (
          <section className="grid gap-6 lg:grid-cols-2">
            {filteredViolations.map(
              (violation, index) => {
                const levelClasses =
                  getLevelClasses(violation.level);

                return (
                  <article
                    key={violation.id}
                    className="group relative overflow-hidden rounded-[30px] border border-white/10 bg-white/5 p-7 backdrop-blur-2xl transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.07]"
                  >
                    <div
                      className={`absolute right-0 top-0 h-full w-1.5 ${levelClasses.line}`}
                    />

                    <div
                      className={`pointer-events-none absolute -left-20 -top-20 h-56 w-56 rounded-full blur-[100px] ${levelClasses.glow}`}
                    />

                    <div className="relative">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 font-black text-white">
                            {index + 1}
                          </span>

                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-zinc-300">
                            {violation.category}
                          </span>
                        </div>

                        <span
                          className={`rounded-full border px-4 py-2 text-sm font-black ${levelClasses.badge}`}
                        >
                          {violation.level}
                        </span>
                      </div>

                      <h2 className="mt-6 text-3xl font-black text-white">
                        {violation.title}
                      </h2>

                      <p className="mt-4 whitespace-pre-wrap leading-8 text-zinc-300">
                        {violation.description}
                      </p>

                      <div className="mt-6 space-y-4">
                        {violation.amount && (
                          <div className="flex items-start gap-4 rounded-2xl border border-yellow-500/15 bg-yellow-500/5 p-5">
                            <div className="rounded-xl bg-yellow-500/10 p-3">
                              <Banknote
                                size={23}
                                className="text-yellow-400"
                              />
                            </div>

                            <div>
                              <p className="text-sm font-black text-yellow-400">
                                قيمة الغرامة
                              </p>

                              <p className="mt-2 text-xl font-black text-white">
                                {violation.amount}
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="flex items-start gap-4 rounded-2xl border border-red-500/15 bg-red-500/5 p-5">
                          <div className="rounded-xl bg-red-500/10 p-3">
                            <ShieldAlert
                              size={23}
                              className="text-red-400"
                            />
                          </div>

                          <div>
                            <p className="text-sm font-black text-red-400">
                              العقوبة أو الإجراء
                            </p>

                            <p className="mt-2 whitespace-pre-wrap leading-8 text-zinc-300">
                              {violation.penalty}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              }
            )}
          </section>
        )}

        <footer className="border-t border-white/10 pt-8 text-center text-sm leading-7 text-zinc-600">
          يحق لإدارة قطاع الميكانيك تعديل المخالفات
          والغرامات والإجراءات حسب ما تراه مناسبًا لمصلحة
          القطاع.
        </footer>
      </div>
    </main>
  );
}