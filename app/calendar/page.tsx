"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { collection, onSnapshot } from "firebase/firestore";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  MapPin,
  Search,
  Sparkles,
} from "lucide-react";

import { db } from "@/lib/firebase";

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

const eventTypes: EventType[] = [
  "دورة",
  "توظيف",
  "ترقية",
  "اجتماع",
  "فعالية",
  "أخرى",
];

function getEventDate(event: SectorEvent) {
  if (!event.date) {
    return null;
  }

  const time = event.time || "00:00";
  const date = new Date(`${event.date}T${time}:00`);

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
  if (!timeValue) {
    return "غير محدد";
  }

  const date = new Date(`2000-01-01T${timeValue}:00`);

  if (Number.isNaN(date.getTime())) {
    return timeValue;
  }

  return date.toLocaleTimeString("ar-SA", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function getTypeClasses(type: EventType) {
  switch (type) {
    case "توظيف":
      return {
        badge: "border-blue-500/25 bg-blue-500/10 text-blue-400",
        line: "bg-blue-500",
        glow: "bg-blue-500/10",
      };

    case "ترقية":
      return {
        badge: "border-green-500/25 bg-green-500/10 text-green-400",
        line: "bg-green-500",
        glow: "bg-green-500/10",
      };

    case "اجتماع":
      return {
        badge: "border-purple-500/25 bg-purple-500/10 text-purple-400",
        line: "bg-purple-500",
        glow: "bg-purple-500/10",
      };

    case "فعالية":
      return {
        badge: "border-orange-500/25 bg-orange-500/10 text-orange-400",
        line: "bg-orange-500",
        glow: "bg-orange-500/10",
      };

    case "أخرى":
      return {
        badge: "border-zinc-500/25 bg-zinc-500/10 text-zinc-300",
        line: "bg-zinc-500",
        glow: "bg-zinc-500/10",
      };

    default:
      return {
        badge: "border-yellow-500/25 bg-yellow-500/10 text-yellow-400",
        line: "bg-yellow-500",
        glow: "bg-yellow-500/10",
      };
  }
}

export default function PublicCalendarPage() {
  const [events, setEvents] = useState<SectorEvent[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("الكل");
  const [statusFilter, setStatusFilter] = useState("القادمة");

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "sectorEvents"),
      (snapshot) => {
        const data = snapshot.docs
          .map((eventDoc) => ({
            id: eventDoc.id,
            ...(eventDoc.data() as Omit<SectorEvent, "id">),
          }))
          .filter((event) => event.active !== false);

        setEvents(data);
        setLoading(false);
        setLoadError("");
      },
      (error) => {
        console.error("تعذر تحميل تقويم القطاع:", error);

        setLoadError(
          "تعذر تحميل مواعيد القطاع حاليًا، يرجى المحاولة مرة أخرى."
        );

        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const sortedEvents = useMemo(() => {
    return [...events].sort((firstEvent, secondEvent) => {
      const firstDate = getEventDate(firstEvent)?.getTime() ?? 0;
      const secondDate = getEventDate(secondEvent)?.getTime() ?? 0;

      return firstDate - secondDate;
    });
  }, [events]);

  const filteredEvents = useMemo(() => {
    const cleanSearch = search.trim().toLowerCase();
    const now = new Date();

    return sortedEvents.filter((event) => {
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
        (statusFilter === "القادمة" && isUpcoming) ||
        (statusFilter === "المنتهية" && !isUpcoming);

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [sortedEvents, search, typeFilter, statusFilter]);

  const upcomingCount = events.filter((event) => {
    const eventDate = getEventDate(event);

    return eventDate !== null && eventDate >= new Date();
  }).length;

  const finishedCount = events.filter((event) => {
    const eventDate = getEventDate(event);

    return eventDate !== null && eventDate < new Date();
  }).length;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#080808] px-5 py-12 text-white md:px-8">
      <div className="pointer-events-none fixed right-[-180px] top-[-180px] h-[520px] w-[520px] rounded-full bg-yellow-500/10 blur-[170px]" />

      <div className="pointer-events-none fixed bottom-[-220px] left-[-180px] h-[520px] w-[520px] rounded-full bg-purple-500/5 blur-[180px]" />

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
              <CalendarDays
                size={40}
                className="text-yellow-400"
              />
            </div>

            <div>
              <p className="font-bold tracking-wide text-yellow-400">
                MECHANIC SECTOR SYSTEM
              </p>

              <h1 className="mt-2 text-4xl font-black md:text-6xl">
                تقويم قطاع الميكانيك
              </h1>

              <p className="mt-4 max-w-3xl leading-8 text-zinc-400">
                جميع مواعيد الدورات والتوظيف والترقيات والاجتماعات
                والفعاليات المعتمدة داخل القطاع.
              </p>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <p className="text-sm text-zinc-500">
              جميع المواعيد
            </p>

            <p className="mt-3 text-4xl font-black text-white">
              {events.length}
            </p>
          </div>

          <div className="rounded-3xl border border-green-500/20 bg-green-500/5 p-6 backdrop-blur-xl">
            <p className="text-sm text-green-300">
              المواعيد القادمة
            </p>

            <p className="mt-3 text-4xl font-black text-green-400">
              {upcomingCount}
            </p>
          </div>

          <div className="rounded-3xl border border-zinc-500/20 bg-zinc-500/5 p-6 backdrop-blur-xl">
            <p className="text-sm text-zinc-400">
              المواعيد المنتهية
            </p>

            <p className="mt-3 text-4xl font-black text-zinc-300">
              {finishedCount}
            </p>
          </div>
        </section>

        <section className="rounded-[30px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl md:p-6">
          <div className="grid gap-4 xl:grid-cols-[1fr_250px_230px]">
            <div className="relative">
              <Search
                size={20}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500"
              />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="ابحث عن موعد أو مكان أو فعالية..."
                className="w-full rounded-2xl border border-white/10 bg-black/20 py-4 pl-4 pr-12 text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-500"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
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
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-2xl border border-white/10 bg-[#141414] p-4 text-white outline-none transition focus:border-yellow-500"
            >
              <option value="الكل">
                جميع المواعيد
              </option>

              <option value="القادمة">
                المواعيد القادمة
              </option>

              <option value="المنتهية">
                المواعيد المنتهية
              </option>
            </select>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5">
            <div>
              <p className="text-sm text-zinc-500">
                النتائج الظاهرة
              </p>

              <p className="mt-1 text-2xl font-black text-yellow-400">
                {filteredEvents.length}
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-2xl border border-yellow-500/15 bg-yellow-500/5 px-4 py-3 text-sm font-bold text-yellow-400">
              <Sparkles size={18} />
              مواعيد معتمدة من إدارة القطاع
            </div>
          </div>
        </section>

        {loading ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-14 text-center text-zinc-400 backdrop-blur-xl">
            جارٍ تحميل تقويم القطاع...
          </div>
        ) : loadError ? (
          <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-14 text-center">
            <CalendarDays
              size={45}
              className="mx-auto text-red-400"
            />

            <h2 className="mt-5 text-2xl font-black text-red-400">
              تعذر تحميل التقويم
            </h2>

            <p className="mt-3 text-zinc-400">
              {loadError}
            </p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.02] p-14 text-center">
            <CalendarDays
              size={45}
              className="mx-auto text-zinc-600"
            />

            <h2 className="mt-5 text-2xl font-black text-zinc-300">
              لا توجد مواعيد مطابقة
            </h2>

            <p className="mt-3 text-zinc-500">
              لا توجد مواعيد ضمن الفلاتر المختارة حاليًا.
            </p>
          </div>
        ) : (
          <section className="grid gap-6 lg:grid-cols-2">
            {filteredEvents.map((event) => {
              const eventDate = getEventDate(event);
              const isUpcoming =
                eventDate !== null && eventDate >= new Date();

              const typeClasses = getTypeClasses(event.type);

              return (
                <article
                  key={event.id}
                  className="group relative overflow-hidden rounded-[30px] border border-white/10 bg-white/5 p-7 backdrop-blur-2xl transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.07]"
                >
                  <div
                    className={`absolute right-0 top-0 h-full w-1.5 ${typeClasses.line}`}
                  />

                  <div
                    className={`pointer-events-none absolute -left-20 -top-20 h-56 w-56 rounded-full blur-[100px] ${typeClasses.glow}`}
                  />

                  <div className="relative">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <span
                        className={`rounded-full border px-4 py-2 text-sm font-black ${typeClasses.badge}`}
                      >
                        {event.type}
                      </span>

                      <span
                        className={`rounded-full px-4 py-2 text-sm font-black ${
                          isUpcoming
                            ? "bg-green-500/10 text-green-400"
                            : "bg-zinc-500/10 text-zinc-400"
                        }`}
                      >
                        {isUpcoming ? "قادم" : "منتهي"}
                      </span>
                    </div>

                    <h2 className="mt-6 text-3xl font-black text-white">
                      {event.title}
                    </h2>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                      <div className="flex items-center gap-4 rounded-2xl border border-white/5 bg-black/20 p-4">
                        <div className="rounded-xl bg-yellow-500/10 p-3">
                          <CalendarDays
                            size={22}
                            className="text-yellow-400"
                          />
                        </div>

                        <div>
                          <p className="text-xs text-zinc-500">
                            التاريخ
                          </p>

                          <p className="mt-1 font-bold leading-7 text-zinc-200">
                            {formatDate(event.date)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 rounded-2xl border border-white/5 bg-black/20 p-4">
                        <div className="rounded-xl bg-yellow-500/10 p-3">
                          <Clock3
                            size={22}
                            className="text-yellow-400"
                          />
                        </div>

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
                      <div className="mt-4 flex items-center gap-4 rounded-2xl border border-white/5 bg-black/20 p-4">
                        <div className="rounded-xl bg-yellow-500/10 p-3">
                          <MapPin
                            size={22}
                            className="text-yellow-400"
                          />
                        </div>

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
                      <p className="mt-5 whitespace-pre-wrap rounded-2xl border border-white/5 bg-black/20 p-5 leading-8 text-zinc-400">
                        {event.description}
                      </p>
                    )}
                  </div>
                </article>
              );
            })}
          </section>
        )}

        <footer className="border-t border-white/10 pt-8 text-center text-sm leading-7 text-zinc-600">
          يتم تحديث المواعيد وفق قرارات إدارة قطاع الميكانيك،
          وقد يتم تعديلها أو إلغاؤها عند الحاجة.
        </footer>
      </div>
    </main>
  );
}