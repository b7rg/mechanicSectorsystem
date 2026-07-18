"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import {
  CalendarDays,
  Clock3,
  Eye,
  EyeOff,
  MapPin,
  Pencil,
  Plus,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";

import { db } from "@/lib/firebase";
import { addActivity } from "@/lib/activity";
import PermissionGuard from "@/components/auth/PermissionGuard";

type EventType =
  | "دورة"
  | "توظيف"
  | "ترقية"
  | "اجتماع"
  | "فعالية"
  | "أخرى";

type SectorEvent = {
  id: string;
  title: string;
  type: EventType;
  date: string;
  time: string;
  location?: string;
  description?: string;
  active?: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
};

type EventForm = {
  title: string;
  type: EventType;
  date: string;
  time: string;
  location: string;
  description: string;
  active: boolean;
};

const eventTypes: EventType[] = [
  "دورة",
  "توظيف",
  "ترقية",
  "اجتماع",
  "فعالية",
  "أخرى",
];

const emptyForm: EventForm = {
  title: "",
  type: "دورة",
  date: "",
  time: "",
  location: "",
  description: "",
  active: true,
};

function getTypeClasses(type: EventType) {
  switch (type) {
    case "توظيف":
      return "border-blue-500/20 bg-blue-500/10 text-blue-400";

    case "ترقية":
      return "border-green-500/20 bg-green-500/10 text-green-400";

    case "اجتماع":
      return "border-purple-500/20 bg-purple-500/10 text-purple-400";

    case "فعالية":
      return "border-orange-500/20 bg-orange-500/10 text-orange-400";

    case "أخرى":
      return "border-zinc-500/20 bg-zinc-500/10 text-zinc-300";

    default:
      return "border-yellow-500/20 bg-yellow-500/10 text-yellow-400";
  }
}

function getEventDate(event: SectorEvent) {
  const time = event.time || "00:00";
  const date = new Date(`${event.date}T${time}`);

  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(dateValue: string) {
  const date = new Date(`${dateValue}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }

  return date.toLocaleDateString("ar-SA", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime(timeValue: string) {
  const date = new Date(`2000-01-01T${timeValue}`);

  if (Number.isNaN(date.getTime())) {
    return timeValue;
  }

  return date.toLocaleTimeString("ar-SA", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function DashboardCalendarPage() {
  const [events, setEvents] = useState<SectorEvent[]>([]);
  const [form, setForm] = useState<EventForm>({ ...emptyForm });
  const [editingId, setEditingId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("الكل");
  const [statusFilter, setStatusFilter] = useState("الكل");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "sectorEvents"),
      (snapshot) => {
        const data = snapshot.docs
          .map((eventDoc) => ({
            id: eventDoc.id,
            ...(eventDoc.data() as Omit<SectorEvent, "id">),
          }))
          .sort((firstEvent, secondEvent) => {
            const firstDate = getEventDate(firstEvent)?.getTime() ?? 0;
            const secondDate = getEventDate(secondEvent)?.getTime() ?? 0;

            return firstDate - secondDate;
          });

        setEvents(data);
        setLoading(false);
      },
      (error) => {
        console.error("تعذر تحميل التقويم:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const filteredEvents = useMemo(() => {
    const cleanSearch = search.trim().toLowerCase();
    const now = new Date();

    return events.filter((event) => {
      const eventDate = getEventDate(event);
      const isUpcoming = eventDate ? eventDate >= now : false;

      const matchesSearch =
        !cleanSearch ||
        event.title?.toLowerCase().includes(cleanSearch) ||
        event.description?.toLowerCase().includes(cleanSearch) ||
        event.location?.toLowerCase().includes(cleanSearch) ||
        event.type?.toLowerCase().includes(cleanSearch);

      const matchesType =
        typeFilter === "الكل" || event.type === typeFilter;

      const matchesStatus =
        statusFilter === "الكل" ||
        (statusFilter === "قادمة" && isUpcoming) ||
        (statusFilter === "منتهية" && !isUpcoming) ||
        (statusFilter === "ظاهرة" && event.active !== false) ||
        (statusFilter === "مخفية" && event.active === false);

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [events, search, typeFilter, statusFilter]);

  const upcomingCount = events.filter((event) => {
    const eventDate = getEventDate(event);

    return (
      event.active !== false &&
      eventDate !== null &&
      eventDate >= new Date()
    );
  }).length;

  const finishedCount = events.filter((event) => {
    const eventDate = getEventDate(event);

    return eventDate !== null && eventDate < new Date();
  }).length;

  const visibleCount = events.filter(
    (event) => event.active !== false
  ).length;

  function resetForm() {
    setForm({ ...emptyForm });
    setEditingId(null);
  }

  function startEditing(event: SectorEvent) {
    setEditingId(event.id);

    setForm({
      title: event.title ?? "",
      type: event.type ?? "دورة",
      date: event.date ?? "",
      time: event.time ?? "",
      location: event.location ?? "",
      description: event.description ?? "",
      active: event.active ?? true,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function saveEvent() {
    const title = form.title.trim();
    const date = form.date.trim();
    const time = form.time.trim();
    const location = form.location.trim();
    const description = form.description.trim();

    if (!title) {
      alert("اكتبي عنوان الموعد.");
      return;
    }

    if (!date) {
      alert("اختاري تاريخ الموعد.");
      return;
    }

    if (!time) {
      alert("اختاري وقت الموعد.");
      return;
    }

    try {
      setSaving(true);

      const eventData = {
        title,
        type: form.type,
        date,
        time,
        location,
        description,
        active: form.active,
        updatedAt: serverTimestamp(),
      };

      if (editingId) {
        await updateDoc(
          doc(db, "sectorEvents", editingId),
          eventData
        );

        await addActivity(`تعديل موعد في التقويم: ${title}`);
      } else {
        await addDoc(collection(db, "sectorEvents"), {
          ...eventData,
          createdAt: serverTimestamp(),
        });

        await addActivity(`إضافة موعد إلى التقويم: ${title}`);
      }

      resetForm();
    } catch (error) {
      console.error("تعذر حفظ الموعد:", error);
      alert("حدث خطأ أثناء حفظ الموعد.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleEvent(event: SectorEvent) {
    const nextStatus = !(event.active ?? true);

    try {
      await updateDoc(doc(db, "sectorEvents", event.id), {
        active: nextStatus,
        updatedAt: serverTimestamp(),
      });

      await addActivity(
        `${nextStatus ? "إظهار" : "إخفاء"} موعد: ${event.title}`
      );
    } catch (error) {
      console.error("تعذر تغيير حالة الموعد:", error);
      alert("حدث خطأ أثناء تغيير حالة الموعد.");
    }
  }

  async function removeEvent(event: SectorEvent) {
    const confirmed = window.confirm(
      `هل أنت متأكدة من حذف موعد "${event.title}"؟`
    );

    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, "sectorEvents", event.id));
      await addActivity(`حذف موعد من التقويم: ${event.title}`);

      if (editingId === event.id) {
        resetForm();
      }
    } catch (error) {
      console.error("تعذر حذف الموعد:", error);
      alert("حدث خطأ أثناء حذف الموعد.");
    }
  }

  return (
    <PermissionGuard permission="calendar">
      <main className="space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-4">
              <CalendarDays
                size={30}
                className="text-yellow-400"
              />
            </div>

            <div>
              <h1 className="text-4xl font-black text-yellow-400">
                إدارة تقويم القطاع
              </h1>

              <p className="mt-2 text-zinc-400">
                إضافة مواعيد الدورات والتوظيف والترقيات والفعاليات.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="rounded-2xl border border-white/10 bg-[#141414] px-5 py-3">
              <p className="text-xs text-zinc-500">
                جميع المواعيد
              </p>

              <p className="mt-1 text-xl font-black text-white">
                {events.length}
              </p>
            </div>

            <div className="rounded-2xl border border-green-500/20 bg-green-500/10 px-5 py-3">
              <p className="text-xs text-green-300">
                المواعيد القادمة
              </p>

              <p className="mt-1 text-xl font-black text-green-400">
                {upcomingCount}
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-500/20 bg-zinc-500/10 px-5 py-3">
              <p className="text-xs text-zinc-400">
                المواعيد المنتهية
              </p>

              <p className="mt-1 text-xl font-black text-zinc-300">
                {finishedCount}
              </p>
            </div>

            <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 px-5 py-3">
              <p className="text-xs text-blue-300">
                المواعيد الظاهرة
              </p>

              <p className="mt-1 text-xl font-black text-blue-400">
                {visibleCount}
              </p>
            </div>
          </div>
        </header>

        <section className="rounded-3xl border border-white/10 bg-[#141414]/90 p-7 backdrop-blur-xl md:p-8">
          <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-white">
                {editingId
                  ? "تعديل الموعد"
                  : "إضافة موعد جديد"}
              </h2>

              <p className="mt-2 text-sm text-zinc-500">
                حدد نوع الموعد وتاريخه ووقته ومكان انعقاده.
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
                عنوان الموعد
              </label>

              <input
                value={form.title}
                onChange={(event) =>
                  setForm({
                    ...form,
                    title: event.target.value,
                  })
                }
                placeholder="مثال: دورة الموجة الميداني"
                className="w-full rounded-2xl border border-white/10 bg-[#1b1b1b] p-4 text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-500"
              />
            </div>

            <div>
              <label className="mb-2 block font-bold text-zinc-300">
                نوع الموعد
              </label>

              <select
                value={form.type}
                onChange={(event) =>
                  setForm({
                    ...form,
                    type: event.target.value as EventType,
                  })
                }
                className="w-full rounded-2xl border border-white/10 bg-[#1b1b1b] p-4 text-white outline-none transition focus:border-yellow-500"
              >
                {eventTypes.map((eventType) => (
                  <option
                    key={eventType}
                    value={eventType}
                  >
                    {eventType}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block font-bold text-zinc-300">
                التاريخ
              </label>

              <input
                type="date"
                value={form.date}
                onChange={(event) =>
                  setForm({
                    ...form,
                    date: event.target.value,
                  })
                }
                className="w-full rounded-2xl border border-white/10 bg-[#1b1b1b] p-4 text-white outline-none transition focus:border-yellow-500"
              />
            </div>

            <div>
              <label className="mb-2 block font-bold text-zinc-300">
                الوقت
              </label>

              <input
                type="time"
                value={form.time}
                onChange={(event) =>
                  setForm({
                    ...form,
                    time: event.target.value,
                  })
                }
                className="w-full rounded-2xl border border-white/10 bg-[#1b1b1b] p-4 text-white outline-none transition focus:border-yellow-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block font-bold text-zinc-300">
                المكان
              </label>

              <input
                value={form.location}
                onChange={(event) =>
                  setForm({
                    ...form,
                    location: event.target.value,
                  })
                }
                placeholder="مثال: كراج الميكانيك أو مقر التدريب"
                className="w-full rounded-2xl border border-white/10 bg-[#1b1b1b] p-4 text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block font-bold text-zinc-300">
                التفاصيل
              </label>

              <textarea
                value={form.description}
                onChange={(event) =>
                  setForm({
                    ...form,
                    description: event.target.value,
                  })
                }
                rows={4}
                placeholder="اكتب تفاصيل الموعد والتعليمات المرتبطة به..."
                className="w-full resize-none rounded-2xl border border-white/10 bg-[#1b1b1b] p-4 leading-8 text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-500"
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
              إظهار الموعد في التقويم العام
            </span>
          </label>

          <button
            type="button"
            onClick={saveEvent}
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
                : "إضافة الموعد"}
          </button>
        </section>

        <section className="space-y-6">
          <div className="grid gap-4 xl:grid-cols-[1fr_230px_230px]">
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
                placeholder="ابحث عن موعد أو مكان..."
                className="w-full rounded-2xl border border-white/10 bg-[#141414] py-4 pl-4 pr-12 text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-500"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(event) =>
                setTypeFilter(event.target.value)
              }
              className="rounded-2xl border border-white/10 bg-[#141414] p-4 text-white outline-none transition focus:border-yellow-500"
            >
              <option value="الكل">
                جميع الأنواع
              </option>

              {eventTypes.map((eventType) => (
                <option
                  key={eventType}
                  value={eventType}
                >
                  {eventType}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              className="rounded-2xl border border-white/10 bg-[#141414] p-4 text-white outline-none transition focus:border-yellow-500"
            >
              <option value="الكل">
                جميع الحالات
              </option>
              <option value="قادمة">قادمة</option>
              <option value="منتهية">منتهية</option>
              <option value="ظاهرة">ظاهرة</option>
              <option value="مخفية">مخفية</option>
            </select>
          </div>

          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-black text-white">
              المواعيد المسجلة
            </h2>

            <span className="rounded-full border border-yellow-500/20 bg-yellow-500/10 px-4 py-2 text-sm font-bold text-yellow-400">
              {filteredEvents.length} نتيجة
            </span>
          </div>

          {loading ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-12 text-center text-zinc-400">
              جارٍ تحميل التقويم...
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 p-12 text-center">
              <CalendarDays
                size={45}
                className="mx-auto text-zinc-600"
              />

              <h3 className="mt-5 text-xl font-black text-zinc-300">
                لا توجد مواعيد مطابقة
              </h3>

              <p className="mt-2 text-zinc-500">
                غير البحث أو أضف موعدًا جديدًا.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-2">
              {filteredEvents.map((event) => {
                const eventDate = getEventDate(event);
                const isUpcoming =
                  eventDate !== null && eventDate >= new Date();

                const active = event.active ?? true;

                return (
                  <article
                    key={event.id}
                    className={`relative overflow-hidden rounded-3xl border p-6 backdrop-blur-xl transition ${
                      active
                        ? "border-white/10 bg-[#141414]/90"
                        : "border-zinc-500/20 bg-zinc-500/5 opacity-65"
                    }`}
                  >
                    <div className="absolute right-0 top-0 h-full w-1 bg-yellow-500" />

                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-bold ${getTypeClasses(
                            event.type
                          )}`}
                        >
                          {event.type}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            isUpcoming
                              ? "bg-green-500/10 text-green-400"
                              : "bg-zinc-500/10 text-zinc-400"
                          }`}
                        >
                          {isUpcoming ? "قادم" : "منتهي"}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            active
                              ? "bg-blue-500/10 text-blue-400"
                              : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          {active ? "ظاهر" : "مخفي"}
                        </span>
                      </div>
                    </div>

                    <h3 className="mt-5 text-2xl font-black text-white">
                      {event.title}
                    </h3>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <div className="flex items-center gap-3 rounded-2xl bg-white/5 p-4">
                        <CalendarDays
                          size={20}
                          className="shrink-0 text-yellow-400"
                        />

                        <div>
                          <p className="text-xs text-zinc-500">
                            التاريخ
                          </p>

                          <p className="mt-1 font-bold text-zinc-200">
                            {formatDate(event.date)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 rounded-2xl bg-white/5 p-4">
                        <Clock3
                          size={20}
                          className="shrink-0 text-yellow-400"
                        />

                        <div>
                          <p className="text-xs text-zinc-500">
                            الوقت
                          </p>

                          <p className="mt-1 font-bold text-zinc-200">
                            {formatTime(event.time)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {event.location && (
                      <div className="mt-3 flex items-center gap-3 rounded-2xl bg-white/5 p-4">
                        <MapPin
                          size={20}
                          className="shrink-0 text-yellow-400"
                        />

                        <div>
                          <p className="text-xs text-zinc-500">
                            المكان
                          </p>

                          <p className="mt-1 font-bold text-zinc-200">
                            {event.location}
                          </p>
                        </div>
                      </div>
                    )}

                    {event.description && (
                      <p className="mt-4 whitespace-pre-wrap rounded-2xl border border-white/5 bg-black/20 p-4 leading-7 text-zinc-400">
                        {event.description}
                      </p>
                    )}

                    <div className="mt-6 flex flex-wrap gap-3 border-t border-white/10 pt-5">
                      <button
                        type="button"
                        onClick={() => startEditing(event)}
                        className="flex items-center gap-2 rounded-xl bg-blue-600/15 px-4 py-2 font-bold text-blue-400 transition hover:bg-blue-600 hover:text-white"
                      >
                        <Pencil size={17} />
                        تعديل
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleEvent(event)}
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
                        onClick={() => removeEvent(event)}
                        className="flex items-center gap-2 rounded-xl bg-red-600/15 px-4 py-2 font-bold text-red-400 transition hover:bg-red-600 hover:text-white"
                      >
                        <Trash2 size={17} />
                        حذف
                      </button>
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