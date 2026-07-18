"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import {
  ArrowRight,
  CalendarDays,
  Megaphone,
} from "lucide-react";

import { db } from "@/lib/firebase";

type Announcement = {
  id: string;
  title: string;
  content: string;
  createdAt?: {
    toDate?: () => Date;
  };
};

export default function PublicAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const announcementsQuery = query(
      collection(db, "announcements"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      announcementsQuery,
      (snapshot) => {
        const data = snapshot.docs.map((announcementDoc) => ({
          id: announcementDoc.id,
          ...(announcementDoc.data() as Omit<Announcement, "id">),
        }));

        setAnnouncements(data);
        setLoading(false);
        setLoadError("");
      },
      (error) => {
        console.error("تعذر تحميل الإعلانات:", error);

        setLoadError(
          "تعذر تحميل الإعلانات حاليًا، يرجى المحاولة مرة أخرى."
        );

        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#080808] px-5 py-12 text-white md:px-8">
      <div className="pointer-events-none fixed right-[-180px] top-[-180px] h-[500px] w-[500px] rounded-full bg-yellow-500/10 blur-[170px]" />

      <div className="pointer-events-none fixed bottom-[-220px] left-[-180px] h-[520px] w-[520px] rounded-full bg-yellow-500/5 blur-[180px]" />

      <div className="relative mx-auto max-w-6xl space-y-10">
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
              <Megaphone
                size={40}
                className="text-yellow-400"
              />
            </div>

            <div>
              <p className="font-bold tracking-wide text-yellow-400">
                MECHANIC SECTOR SYSTEM
              </p>

              <h1 className="mt-2 text-4xl font-black md:text-6xl">
                إعلانات قطاع الميكانيك
              </h1>

              <p className="mt-4 max-w-3xl leading-8 text-zinc-400">
                آخر الإعلانات والتنويهات الرسمية الخاصة بقطاع
                الميكانيك.
              </p>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-14 text-center text-zinc-400 backdrop-blur-xl">
            جارٍ تحميل الإعلانات...
          </div>
        ) : loadError ? (
          <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-14 text-center">
            <Megaphone
              size={45}
              className="mx-auto text-red-400"
            />

            <h2 className="mt-5 text-2xl font-black text-red-400">
              تعذر تحميل الإعلانات
            </h2>

            <p className="mt-3 text-zinc-400">
              {loadError}
            </p>
          </div>
        ) : announcements.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.02] p-14 text-center">
            <Megaphone
              size={45}
              className="mx-auto text-zinc-600"
            />

            <h2 className="mt-5 text-2xl font-black text-zinc-300">
              لا توجد إعلانات منشورة حاليًا
            </h2>

            <p className="mt-3 text-zinc-500">
              ستظهر الإعلانات هنا فور نشرها من إدارة القطاع.
            </p>
          </div>
        ) : (
          <section className="grid gap-6">
            {announcements.map((announcement) => (
              <article
                key={announcement.id}
                className="group relative overflow-hidden rounded-[30px] border border-white/10 bg-white/5 p-7 backdrop-blur-2xl transition duration-300 hover:-translate-y-1 hover:border-yellow-500/30 hover:bg-white/[0.07] md:p-8"
              >
                <div className="absolute -left-20 -top-20 h-56 w-56 rounded-full bg-yellow-500/5 blur-[100px] transition group-hover:bg-yellow-500/10" />

                <div className="relative">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-yellow-500/20 bg-yellow-500/10">
                      <Megaphone
                        size={27}
                        className="text-yellow-400"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h2 className="text-3xl font-black text-white">
                        {announcement.title}
                      </h2>

                      <p className="mt-5 whitespace-pre-wrap text-lg leading-9 text-zinc-300">
                        {announcement.content}
                      </p>

                      <div className="mt-7 flex items-center gap-2 border-t border-white/10 pt-5 text-sm text-zinc-500">
                        <CalendarDays size={17} />

                        <span>
                          {announcement.createdAt?.toDate
                            ? announcement.createdAt
                                .toDate()
                                .toLocaleString("ar-SA")
                            : "إعلان حديث"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}

        <footer className="border-t border-white/10 pt-8 text-center text-sm text-zinc-600">
          جميع الإعلانات صادرة ومعتمدة من إدارة قطاع الميكانيك.
        </footer>
      </div>
    </main>
  );
}