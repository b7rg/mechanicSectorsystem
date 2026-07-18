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
  AlertTriangle,
  ArrowRight,
  BookOpenCheck,
  Search,
  ShieldCheck,
} from "lucide-react";

import { db } from "@/lib/firebase";

type SectorRule = {
  id: string;
  title: string;
  description: string;
  penalty?: string;
  category: string;
  active?: boolean;
  createdAt?: {
    toDate?: () => Date;
  };
};

const categoryOrder = [
  "القوانين العامة",
  "قوانين الميدان",
  "قوانين الراديو",
  "قوانين المركبات",
  "قوانين التوظيف",
  "قوانين الدورات",
  "قوانين الترقيات",
  "قوانين الإجازات",
  "مخالفات إدارية",
];

export default function PublicRulesPage() {
  const [rules, setRules] = useState<SectorRule[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("الكل");

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const rulesQuery = query(
      collection(db, "sectorRules"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      rulesQuery,
      (snapshot) => {
        const data = snapshot.docs
          .map((ruleDoc) => ({
            id: ruleDoc.id,
            ...(ruleDoc.data() as Omit<SectorRule, "id">),
          }))
          .filter((rule) => rule.active !== false);

        setRules(data);
        setLoading(false);
        setLoadError("");
      },
      (error) => {
        console.error("تعذر تحميل القوانين:", error);

        setLoadError(
          "تعذر تحميل القوانين حاليًا، يرجى المحاولة مرة أخرى."
        );

        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const availableCategories = useMemo(() => {
    const categories = Array.from(
      new Set(
        rules
          .map((rule) => rule.category)
          .filter(Boolean)
      )
    );

    return categories.sort((firstCategory, secondCategory) => {
      const firstIndex = categoryOrder.indexOf(firstCategory);
      const secondIndex = categoryOrder.indexOf(secondCategory);

      const safeFirstIndex =
        firstIndex === -1 ? categoryOrder.length : firstIndex;

      const safeSecondIndex =
        secondIndex === -1 ? categoryOrder.length : secondIndex;

      return safeFirstIndex - safeSecondIndex;
    });
  }, [rules]);

  const filteredRules = useMemo(() => {
    const cleanSearch = search.trim().toLowerCase();

    return rules.filter((rule) => {
      const matchesCategory =
        selectedCategory === "الكل" ||
        rule.category === selectedCategory;

      const matchesSearch =
        !cleanSearch ||
        rule.title?.toLowerCase().includes(cleanSearch) ||
        rule.description?.toLowerCase().includes(cleanSearch) ||
        rule.penalty?.toLowerCase().includes(cleanSearch) ||
        rule.category?.toLowerCase().includes(cleanSearch);

      return matchesCategory && matchesSearch;
    });
  }, [rules, search, selectedCategory]);

  const groupedRules = useMemo(() => {
    const groups = new Map<string, SectorRule[]>();

    filteredRules.forEach((rule) => {
      const category = rule.category || "القوانين العامة";
      const currentRules = groups.get(category) ?? [];

      groups.set(category, [...currentRules, rule]);
    });

    return Array.from(groups.entries()).sort(
      ([firstCategory], [secondCategory]) => {
        const firstIndex = categoryOrder.indexOf(firstCategory);
        const secondIndex = categoryOrder.indexOf(secondCategory);

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
  }, [filteredRules]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#080808] px-5 py-12 text-white md:px-8">
      <div className="pointer-events-none fixed right-[-180px] top-[-180px] h-[500px] w-[500px] rounded-full bg-yellow-500/10 blur-[170px]" />

      <div className="pointer-events-none fixed bottom-[-220px] left-[-180px] h-[520px] w-[520px] rounded-full bg-red-500/5 blur-[180px]" />

      <div className="relative mx-auto max-w-7xl space-y-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-bold text-zinc-300 backdrop-blur-xl transition hover:border-yellow-500/30 hover:text-yellow-400"
        >
          <ArrowRight size={19} />
          الرجوع للرئيسية
        </Link>

        <header className="relative overflow-hidden rounded-[36px] border border-yellow-500/20 bg-white/5 p-8 backdrop-blur-2xl md:p-12">
          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-yellow-500/10 blur-[110px]" />

          <div className="relative flex flex-col gap-6 md:flex-row md:items-center">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl border border-yellow-500/25 bg-yellow-500/10">
              <BookOpenCheck
                size={40}
                className="text-yellow-400"
              />
            </div>

            <div>
              <p className="font-bold tracking-wide text-yellow-400">
                MECHANIC SECTOR SYSTEM
              </p>

              <h1 className="mt-2 text-4xl font-black md:text-6xl">
                قوانين قطاع الميكانيك
              </h1>

              <p className="mt-4 max-w-3xl leading-8 text-zinc-400">
                القوانين والتعليمات الرسمية المعتمدة داخل القطاع.
                يجب الاطلاع عليها والالتزام بها لتجنب المخالفات
                والإجراءات الإدارية.
              </p>
            </div>
          </div>
        </header>

        <section className="rounded-[30px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl md:p-6">
          <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
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
                placeholder="ابحث في القوانين أو العقوبات..."
                className="w-full rounded-2xl border border-white/10 bg-black/20 py-4 pl-4 pr-12 text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-500"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(event) =>
                setSelectedCategory(event.target.value)
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
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5">
            <div>
              <p className="text-sm text-zinc-500">
                عدد القوانين الظاهرة
              </p>

              <p className="mt-1 text-2xl font-black text-yellow-400">
                {filteredRules.length}
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-2xl border border-green-500/15 bg-green-500/5 px-4 py-3 text-sm font-bold text-green-400">
              <ShieldCheck size={18} />
              قوانين معتمدة من إدارة القطاع
            </div>
          </div>
        </section>

        {loading ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-14 text-center text-zinc-400 backdrop-blur-xl">
            جارٍ تحميل قوانين القطاع...
          </div>
        ) : loadError ? (
          <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-14 text-center">
            <AlertTriangle
              size={45}
              className="mx-auto text-red-400"
            />

            <h2 className="mt-5 text-2xl font-black text-red-400">
              تعذر تحميل القوانين
            </h2>

            <p className="mt-3 text-zinc-400">
              {loadError}
            </p>
          </div>
        ) : groupedRules.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.02] p-14 text-center">
            <BookOpenCheck
              size={45}
              className="mx-auto text-zinc-600"
            />

            <h2 className="mt-5 text-2xl font-black text-zinc-300">
              لا توجد قوانين مطابقة
            </h2>

            <p className="mt-3 text-zinc-500">
              غير كلمة البحث أو اختر قسمًا آخر.
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {groupedRules.map(
              ([category, categoryRules]) => (
                <section
                  key={category}
                  className="space-y-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-yellow-500">
                        قسم القوانين
                      </p>

                      <h2 className="mt-1 text-3xl font-black text-white">
                        {category}
                      </h2>
                    </div>

                    <span className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 px-5 py-3 font-black text-yellow-400">
                      {categoryRules.length}
                    </span>
                  </div>

                  <div className="grid gap-5">
                    {categoryRules.map((rule, index) => (
                      <article
                        key={rule.id}
                        className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition duration-300 hover:border-yellow-500/25 hover:bg-white/[0.07] md:p-7"
                      >
                        <div className="absolute right-0 top-0 h-full w-1 bg-yellow-500" />

                        <div className="flex flex-col gap-5 md:flex-row md:items-start">
                          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-yellow-500 text-lg font-black text-black">
                            {index + 1}
                          </span>

                          <div className="min-w-0 flex-1">
                            <h3 className="text-2xl font-black text-white">
                              {rule.title}
                            </h3>

                            <p className="mt-4 whitespace-pre-wrap leading-8 text-zinc-300">
                              {rule.description}
                            </p>

                            {rule.penalty && (
                              <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-500/15 bg-red-500/5 p-5">
                                <AlertTriangle
                                  size={21}
                                  className="mt-1 shrink-0 text-red-400"
                                />

                                <div>
                                  <p className="font-black text-red-400">
                                    العقوبة أو الإجراء
                                  </p>

                                  <p className="mt-2 whitespace-pre-wrap leading-7 text-zinc-300">
                                    {rule.penalty}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              )
            )}
          </div>
        )}

        <footer className="border-t border-white/10 pt-8 text-center text-sm leading-7 text-zinc-600">
          يحق لإدارة قطاع الميكانيك تعديل القوانين أو إضافة إجراءات
          جديدة عند الحاجة، ويعتبر استمرار الفرد في القطاع موافقة
          على الالتزام بها.
        </footer>
      </div>
    </main>
  );
}