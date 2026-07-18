"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import {
  AlertTriangle,
  BookOpenCheck,
  Eye,
  EyeOff,
  Pencil,
  Plus,
  Save,
  Search,
  ShieldAlert,
  Trash2,
  X,
} from "lucide-react";

import { db } from "@/lib/firebase";
import { addActivity } from "@/lib/activity";
import PermissionGuard from "@/components/auth/PermissionGuard";

type SectorRule = {
  id: string;
  title: string;
  description: string;
  penalty?: string;
  category: string;
  active?: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
};

type RuleForm = {
  title: string;
  description: string;
  penalty: string;
  category: string;
  active: boolean;
};

const categories = [
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

const emptyForm: RuleForm = {
  title: "",
  description: "",
  penalty: "",
  category: "القوانين العامة",
  active: true,
};

export default function DashboardRulesPage() {
  const [rules, setRules] = useState<SectorRule[]>([]);
  const [form, setForm] = useState<RuleForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("الكل");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const rulesQuery = query(
      collection(db, "sectorRules"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      rulesQuery,
      (snapshot) => {
        const data = snapshot.docs.map((ruleDoc) => ({
          id: ruleDoc.id,
          ...(ruleDoc.data() as Omit<SectorRule, "id">),
        }));

        setRules(data);
        setLoading(false);
      },
      (error) => {
        console.error("تعذر تحميل القوانين:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const filteredRules = useMemo(() => {
    const cleanSearch = search.trim().toLowerCase();

    return rules.filter((rule) => {
      const matchesSearch =
        !cleanSearch ||
        rule.title?.toLowerCase().includes(cleanSearch) ||
        rule.description?.toLowerCase().includes(cleanSearch) ||
        rule.penalty?.toLowerCase().includes(cleanSearch) ||
        rule.category?.toLowerCase().includes(cleanSearch);

      const matchesCategory =
        categoryFilter === "الكل" ||
        rule.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [rules, search, categoryFilter]);

  const visibleRulesCount = rules.filter(
    (rule) => rule.active !== false
  ).length;

  const hiddenRulesCount = rules.filter(
    (rule) => rule.active === false
  ).length;

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function startEditing(rule: SectorRule) {
    setEditingId(rule.id);

    setForm({
      title: rule.title ?? "",
      description: rule.description ?? "",
      penalty: rule.penalty ?? "",
      category: rule.category ?? "القوانين العامة",
      active: rule.active ?? true,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function saveRule() {
    const title = form.title.trim();
    const description = form.description.trim();
    const penalty = form.penalty.trim();
    const category = form.category.trim();

    if (!title) {
      alert("اكتبي عنوان القانون.");
      return;
    }

    if (!description) {
      alert("اكتبي شرح القانون.");
      return;
    }

    if (!category) {
      alert("اختاري قسم القانون.");
      return;
    }

    try {
      setSaving(true);

      if (editingId) {
        await updateDoc(doc(db, "sectorRules", editingId), {
          title,
          description,
          penalty,
          category,
          active: form.active,
          updatedAt: serverTimestamp(),
        });

        await addActivity(`تعديل قانون: ${title}`);
      } else {
        await addDoc(collection(db, "sectorRules"), {
          title,
          description,
          penalty,
          category,
          active: form.active,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        await addActivity(`إضافة قانون جديد: ${title}`);
      }

      resetForm();
    } catch (error) {
      console.error("تعذر حفظ القانون:", error);
      alert("حدث خطأ أثناء حفظ القانون.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleRule(rule: SectorRule) {
    const nextStatus = !(rule.active ?? true);

    try {
      await updateDoc(doc(db, "sectorRules", rule.id), {
        active: nextStatus,
        updatedAt: serverTimestamp(),
      });

      await addActivity(
        `${nextStatus ? "إظهار" : "إخفاء"} قانون: ${rule.title}`
      );
    } catch (error) {
      console.error("تعذر تغيير حالة القانون:", error);
      alert("حدث خطأ أثناء تغيير حالة القانون.");
    }
  }

  async function removeRule(rule: SectorRule) {
    const confirmed = window.confirm(
      `هل أنت متأكدة من حذف قانون "${rule.title}"؟`
    );

    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, "sectorRules", rule.id));
      await addActivity(`حذف قانون: ${rule.title}`);

      if (editingId === rule.id) {
        resetForm();
      }
    } catch (error) {
      console.error("تعذر حذف القانون:", error);
      alert("حدث خطأ أثناء حذف القانون.");
    }
  }

  return (
    <PermissionGuard permission="rules">
      <main className="space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-4">
              <BookOpenCheck
                size={30}
                className="text-yellow-400"
              />
            </div>

            <div>
              <h1 className="text-4xl font-black text-yellow-400">
                إدارة قوانين القطاع
              </h1>

              <p className="mt-2 text-zinc-400">
                إضافة وتعديل وإخفاء القوانين التي تظهر لأفراد القطاع.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="rounded-2xl border border-white/10 bg-[#141414] px-5 py-3">
              <p className="text-xs text-zinc-500">
                جميع القوانين
              </p>

              <p className="mt-1 text-xl font-black text-white">
                {rules.length}
              </p>
            </div>

            <div className="rounded-2xl border border-green-500/20 bg-green-500/10 px-5 py-3">
              <p className="text-xs text-green-300">
                ظاهرة
              </p>

              <p className="mt-1 text-xl font-black text-green-400">
                {visibleRulesCount}
              </p>
            </div>

            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-3">
              <p className="text-xs text-red-300">
                مخفية
              </p>

              <p className="mt-1 text-xl font-black text-red-400">
                {hiddenRulesCount}
              </p>
            </div>
          </div>
        </header>

        <section className="rounded-3xl border border-white/10 bg-[#141414]/90 p-7 backdrop-blur-xl md:p-8">
          <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-white">
                {editingId
                  ? "تعديل القانون"
                  : "إضافة قانون جديد"}
              </h2>

              <p className="mt-2 text-sm text-zinc-500">
                اكتب القانون والعقوبة أو الإجراء المرتبط به.
              </p>
            </div>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 font-bold text-zinc-300 transition hover:bg-white/10"
              >
                <X size={18} />
                إلغاء التعديل
              </button>
            )}
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block font-bold text-zinc-300">
                عنوان القانون
              </label>

              <input
                value={form.title}
                onChange={(event) =>
                  setForm({
                    ...form,
                    title: event.target.value,
                  })
                }
                placeholder="مثال: منع المجادلة في رسائل الميكانيك"
                className="w-full rounded-2xl border border-white/10 bg-[#1b1b1b] p-4 text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-500"
              />
            </div>

            <div>
              <label className="mb-2 block font-bold text-zinc-300">
                قسم القانون
              </label>

              <select
                value={form.category}
                onChange={(event) =>
                  setForm({
                    ...form,
                    category: event.target.value,
                  })
                }
                className="w-full rounded-2xl border border-white/10 bg-[#1b1b1b] p-4 text-white outline-none transition focus:border-yellow-500"
              >
                {categories.map((category) => (
                  <option
                    key={category}
                    value={category}
                  >
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block font-bold text-zinc-300">
                شرح القانون
              </label>

              <textarea
                value={form.description}
                onChange={(event) =>
                  setForm({
                    ...form,
                    description: event.target.value,
                  })
                }
                rows={5}
                placeholder="اكتب تفاصيل القانون بشكل واضح..."
                className="w-full resize-none rounded-2xl border border-white/10 bg-[#1b1b1b] p-4 leading-8 text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block font-bold text-zinc-300">
                العقوبة أو الإجراء
              </label>

              <input
                value={form.penalty}
                onChange={(event) =>
                  setForm({
                    ...form,
                    penalty: event.target.value,
                  })
                }
                placeholder="مثال: غرامة 500 ألف، وفي حال التكرار يتم كسر الرتبة"
                className="w-full rounded-2xl border border-white/10 bg-[#1b1b1b] p-4 text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-500"
              />
            </div>
          </div>

          <label className="mt-6 flex w-fit cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-3">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(event) =>
                setForm({
                  ...form,
                  active: event.target.checked,
                })
              }
              className="h-5 w-5 accent-yellow-500"
            />

            <span className="font-bold text-white">
              إظهار القانون في الصفحة العامة
            </span>
          </label>

          <button
            type="button"
            onClick={saveRule}
            disabled={saving}
            className="mt-7 flex items-center gap-2 rounded-2xl bg-yellow-500 px-7 py-4 font-black text-black transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {editingId ? (
              <Save size={20} />
            ) : (
              <Plus size={20} />
            )}

            {saving
              ? "جارٍ الحفظ..."
              : editingId
                ? "حفظ التعديلات"
                : "إضافة القانون"}
          </button>
        </section>

        <section className="space-y-6">
          <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
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
                placeholder="ابحث في عنوان القانون أو الشرح أو العقوبة..."
                className="w-full rounded-2xl border border-white/10 bg-[#141414] py-4 pl-4 pr-12 text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-500"
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

              {categories.map((category) => (
                <option
                  key={category}
                  value={category}
                >
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-black text-white">
              القوانين المسجلة
            </h2>

            <span className="rounded-full border border-yellow-500/20 bg-yellow-500/10 px-4 py-2 text-sm font-bold text-yellow-400">
              {filteredRules.length} نتيجة
            </span>
          </div>

          {loading ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-12 text-center text-zinc-400">
              جارٍ تحميل القوانين...
            </div>
          ) : filteredRules.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 p-12 text-center">
              <ShieldAlert
                size={45}
                className="mx-auto text-zinc-600"
              />

              <h3 className="mt-5 text-xl font-black text-zinc-300">
                لا توجد قوانين مطابقة
              </h3>

              <p className="mt-2 text-zinc-500">
                غير البحث أو أضف قانونًا جديدًا.
              </p>
            </div>
          ) : (
            <div className="grid gap-5">
              {filteredRules.map((rule, index) => {
                const active = rule.active ?? true;

                return (
                  <article
                    key={rule.id}
                    className={`relative overflow-hidden rounded-3xl border p-6 backdrop-blur-xl transition ${
                      active
                        ? "border-white/10 bg-[#141414]/90"
                        : "border-red-500/20 bg-red-500/5 opacity-70"
                    }`}
                  >
                    <div className="absolute left-0 top-0 h-full w-1 bg-yellow-500" />

                    <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500 font-black text-black">
                            {index + 1}
                          </span>

                          <span className="rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-xs font-bold text-yellow-400">
                            {rule.category}
                          </span>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${
                              active
                                ? "bg-green-500/10 text-green-400"
                                : "bg-red-500/10 text-red-400"
                            }`}
                          >
                            {active ? "ظاهر" : "مخفي"}
                          </span>
                        </div>

                        <h3 className="mt-5 text-2xl font-black text-white">
                          {rule.title}
                        </h3>

                        <p className="mt-4 whitespace-pre-wrap leading-8 text-zinc-300">
                          {rule.description}
                        </p>

                        {rule.penalty && (
                          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-red-500/15 bg-red-500/5 p-4">
                            <AlertTriangle
                              size={21}
                              className="mt-1 shrink-0 text-red-400"
                            />

                            <div>
                              <p className="text-sm font-black text-red-400">
                                العقوبة أو الإجراء
                              </p>

                              <p className="mt-2 leading-7 text-zinc-300">
                                {rule.penalty}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex shrink-0 flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => startEditing(rule)}
                          className="flex items-center gap-2 rounded-xl bg-blue-600/15 px-4 py-2 font-bold text-blue-400 transition hover:bg-blue-600 hover:text-white"
                        >
                          <Pencil size={17} />
                          تعديل
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleRule(rule)}
                          className={`flex items-center gap-2 rounded-xl px-4 py-2 font-bold transition ${
                            active
                              ? "bg-orange-500/15 text-orange-400 hover:bg-orange-500 hover:text-black"
                              : "bg-green-500/15 text-green-400 hover:bg-green-500 hover:text-black"
                          }`}
                        >
                          {active ? (
                            <EyeOff size={17} />
                          ) : (
                            <Eye size={17} />
                          )}

                          {active ? "إخفاء" : "إظهار"}
                        </button>

                        <button
                          type="button"
                          onClick={() => removeRule(rule)}
                          className="flex items-center gap-2 rounded-xl bg-red-600/15 px-4 py-2 font-bold text-red-400 transition hover:bg-red-600 hover:text-white"
                        >
                          <Trash2 size={17} />
                          حذف
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </PermissionGuard>
  );
}