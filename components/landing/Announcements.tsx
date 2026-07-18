"use client";

import {
  useEffect,
  useState,
} from "react";
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  type Timestamp,
} from "firebase/firestore";
import {
  Bell,
  CalendarDays,
  Clock3,
  Crown,
  Megaphone,
} from "lucide-react";
import { motion } from "framer-motion";

import { db } from "@/lib/firebase";

type Announcement = {
  id: string;
  title: string;
  content: string;
  createdAt?: Timestamp | null;
};

function formatRelativeTime(
  date: Date
) {
  const differenceInMinutes =
    Math.round(
      (date.getTime() - Date.now()) /
        60_000
    );

  const formatter =
    new Intl.RelativeTimeFormat(
      "ar-SA",
      {
        numeric: "auto",
      }
    );

  if (
    Math.abs(differenceInMinutes) <
    60
  ) {
    return formatter.format(
      differenceInMinutes,
      "minute"
    );
  }

  const differenceInHours =
    Math.round(
      differenceInMinutes / 60
    );

  if (
    Math.abs(differenceInHours) < 24
  ) {
    return formatter.format(
      differenceInHours,
      "hour"
    );
  }

  const differenceInDays =
    Math.round(
      differenceInHours / 24
    );

  return formatter.format(
    differenceInDays,
    "day"
  );
}

function formatFullDate(
  value?: Timestamp | null
) {
  if (!value?.toDate) {
    return "جارٍ تحديث وقت النشر...";
  }

  return new Intl.DateTimeFormat(
    "ar-SA",
    {
      dateStyle: "long",
      timeStyle: "short",
    }
  ).format(value.toDate());
}

export default function Announcements() {
  const [
    announcement,
    setAnnouncement,
  ] =
    useState<Announcement | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [, setClockTick] =
    useState(Date.now());

  useEffect(() => {
    const announcementsQuery =
      query(
        collection(
          db,
          "announcements"
        ),
        orderBy(
          "createdAt",
          "desc"
        ),
        limit(1)
      );

    const unsubscribe =
      onSnapshot(
        announcementsQuery,
        (snapshot) => {
          if (snapshot.empty) {
            setAnnouncement(null);
          } else {
            const announcementDocument =
              snapshot.docs[0];

            setAnnouncement({
              id:
                announcementDocument.id,
              ...(announcementDocument.data() as Omit<
                Announcement,
                "id"
              >),
            });
          }

          setErrorMessage("");
          setLoading(false);
        },
        (error) => {
          console.error(
            "تعذر تحميل آخر إعلان:",
            error
          );

          setAnnouncement(null);
          setErrorMessage(
            "تعذر تحميل الإعلان حاليًا."
          );
          setLoading(false);
        }
      );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const timer =
      window.setInterval(() => {
        setClockTick(Date.now());
      }, 60_000);

    return () =>
      window.clearInterval(timer);
  }, []);

  const publishedAgo =
    announcement?.createdAt?.toDate
      ? formatRelativeTime(
          announcement.createdAt.toDate()
        )
      : "جارٍ تحديث الوقت...";

  return (
    <section
      dir="rtl"
      className="relative overflow-hidden py-24"
    >
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[440px] w-[440px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-500/[0.04] blur-[140px]" />

      <div className="relative mx-auto w-[92%] max-w-6xl">
        <header className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-yellow-500/15 bg-yellow-500/[0.06] px-4 py-2">
            <Megaphone
              size={16}
              className="text-yellow-400"
            />

            <span className="text-xs font-black tracking-[0.28em] text-yellow-400">
              ANNOUNCEMENTS
            </span>
          </div>

          <h2 className="mt-5 text-4xl font-black text-white md:text-5xl">
            آخر إعلان
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-zinc-500">
            أحدث إعلان صادر من قيادة
            قطاع الميكانيك.
          </p>
        </header>

        {loading ? (
          <div className="overflow-hidden rounded-[32px] border border-white/[0.08] bg-[#141414]/95 p-8">
            <div className="h-7 w-48 animate-pulse rounded-lg bg-white/[0.06]" />
            <div className="mt-6 h-4 w-full animate-pulse rounded bg-white/[0.05]" />
            <div className="mt-3 h-4 w-4/5 animate-pulse rounded bg-white/[0.05]" />
            <div className="mt-3 h-4 w-3/5 animate-pulse rounded bg-white/[0.05]" />
          </div>
        ) : errorMessage ? (
          <div className="rounded-[32px] border border-red-500/20 bg-red-500/[0.05] p-10 text-center text-red-400">
            {errorMessage}
          </div>
        ) : !announcement ? (
          <div className="rounded-[32px] border border-dashed border-white/10 bg-[#141414]/70 p-12 text-center">
            <Bell
              size={34}
              className="mx-auto text-zinc-700"
            />

            <h3 className="mt-5 text-xl font-black text-zinc-300">
              لا توجد إعلانات حاليًا
            </h3>

            <p className="mt-2 text-sm text-zinc-600">
              سيظهر هنا آخر إعلان يتم
              نشره من لوحة الإدارة.
            </p>
          </div>
        ) : (
          <motion.article
            key={announcement.id}
            initial={{
              opacity: 0,
              y: 22,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.45,
            }}
            className="group relative overflow-hidden rounded-[32px] border border-yellow-500/20 bg-[#141414]/95 shadow-[0_25px_80px_rgba(0,0,0,0.35)]"
          >
            <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-yellow-500/[0.06] blur-[100px]" />

            <div className="relative border-b border-white/[0.07] bg-gradient-to-l from-yellow-500/[0.10] via-yellow-500/[0.03] to-transparent p-6 md:p-8">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-yellow-500/25 bg-yellow-500/10 text-yellow-400">
                  <Bell size={27} />
                </div>

                <div className="min-w-0">
                  <span className="inline-flex rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-xs font-black text-yellow-400">
                    إعلان رسمي
                  </span>

                  <h3 className="mt-3 break-words text-2xl font-black text-white md:text-3xl">
                    {announcement.title}
                  </h3>
                </div>
              </div>
            </div>

            <div className="relative grid gap-7 p-6 md:p-8 lg:grid-cols-[1fr_280px]">
              <div>
                <p className="whitespace-pre-wrap break-words text-base leading-9 text-zinc-300 md:text-lg">
                  {announcement.content}
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 rounded-2xl border border-white/[0.07] bg-white/[0.03] px-4 py-3 text-sm text-zinc-400">
                    <CalendarDays
                      size={17}
                      className="text-yellow-400"
                    />

                    {formatFullDate(
                      announcement.createdAt
                    )}
                  </div>

                  <div className="flex items-center gap-2 rounded-2xl border border-yellow-500/15 bg-yellow-500/[0.06] px-4 py-3 text-sm font-black text-yellow-400">
                    <Clock3 size={17} />
                    {publishedAgo}
                  </div>
                </div>
              </div>

              <aside className="rounded-3xl border border-white/[0.07] bg-black/20 p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-yellow-500/20 bg-yellow-500/10 text-yellow-400">
                  <Crown size={21} />
                </div>

                <p className="mt-5 text-xs font-bold text-zinc-600">
                  صادر من
                </p>

                <p className="mt-2 font-black leading-7 text-white">
                  قيادة قطاع الميكانيك
                </p>

                <div className="mt-5 border-t border-white/[0.07] pt-4">
                  <p className="text-xs leading-6 text-zinc-600">
                    يتم تحديث هذا الإعلان
                    تلقائيًا عند نشر إعلان
                    أحدث.
                  </p>
                </div>
              </aside>
            </div>

            <div className="relative h-1 w-full bg-gradient-to-l from-transparent via-yellow-500 to-transparent opacity-60" />
          </motion.article>
        )}
      </div>
    </section>
  );
}