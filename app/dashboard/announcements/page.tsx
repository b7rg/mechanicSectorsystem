"use client";

import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { Megaphone, Plus, Trash2 } from "lucide-react";

import { db } from "@/lib/firebase";
import { addActivity } from "@/lib/activity";
import PermissionGuard from "@/components/auth/PermissionGuard";

type Announcement = {
  id: string;
  title: string;
  content: string;
  createdAt?: {
    toDate?: () => Date;
  };
};

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

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
      },
      (error) => {
        console.error("تعذر تحميل الإعلانات:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  async function addAnnouncement() {
    const cleanTitle = title.trim();
    const cleanContent = content.trim();

    if (!cleanTitle || !cleanContent) {
      alert("يرجى كتابة عنوان الإعلان ومحتواه.");
      return;
    }

    try {
      setSaving(true);

      await addDoc(collection(db, "announcements"), {
        title: cleanTitle,
        content: cleanContent,
        createdAt: serverTimestamp(),
      });

      await addActivity(`نشر إعلان: ${cleanTitle}`);

      setTitle("");
      setContent("");
    } catch (error) {
      console.error("تعذر نشر الإعلان:", error);
      alert("حدث خطأ أثناء نشر الإعلان.");
    } finally {
      setSaving(false);
    }
  }

  async function removeAnnouncement(
    id: string,
    announcementTitle: string
  ) {
    const confirmed = window.confirm(
      `هل أنت متأكد من حذف إعلان "${announcementTitle}"؟`
    );

    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, "announcements", id));

      await addActivity(`حذف إعلان: ${announcementTitle}`);
    } catch (error) {
      console.error("تعذر حذف الإعلان:", error);
      alert("حدث خطأ أثناء حذف الإعلان.");
    }
  }

  return (
    <PermissionGuard permission="announcements">
      <main className="space-y-8">
        <div className="flex items-center gap-4">
          <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-4">
            <Megaphone className="text-yellow-400" size={28} />
          </div>

          <div>
            <h1 className="text-4xl font-black text-yellow-400">
              إدارة الإعلانات
            </h1>

            <p className="mt-2 text-zinc-400">
              أضف الإعلانات التي ستظهر للزوار في الموقع العام.
            </p>
          </div>
        </div>

        <section className="rounded-3xl border border-white/10 bg-[#141414]/90 p-8 backdrop-blur-xl">
          <h2 className="mb-6 text-2xl font-bold text-white">
            إعلان جديد
          </h2>

          <div className="space-y-5">
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="عنوان الإعلان"
              className="w-full rounded-2xl border border-white/10 bg-[#1b1b1b] p-4 text-white outline-none transition focus:border-yellow-500"
            />

            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="محتوى الإعلان"
              rows={6}
              className="w-full resize-none rounded-2xl border border-white/10 bg-[#1b1b1b] p-4 text-white outline-none transition focus:border-yellow-500"
            />

            <button
              onClick={addAnnouncement}
              disabled={saving}
              className="flex items-center gap-2 rounded-2xl bg-yellow-500 px-6 py-3 font-bold text-black transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus size={20} />

              {saving ? "جارٍ النشر..." : "نشر الإعلان"}
            </button>
          </div>
        </section>

        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">
              الإعلانات المنشورة
            </h2>

            <span className="rounded-full border border-yellow-500/20 bg-yellow-500/10 px-4 py-2 text-sm font-bold text-yellow-400">
              {announcements.length} إعلان
            </span>
          </div>

          {announcements.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 p-10 text-center text-zinc-500">
              لا توجد إعلانات حتى الآن.
            </div>
          ) : (
            <div className="grid gap-5">
              {announcements.map((announcement) => (
                <article
                  key={announcement.id}
                  className="rounded-3xl border border-white/10 bg-[#141414]/90 p-6 backdrop-blur-xl"
                >
                  <div className="flex items-start justify-between gap-6">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-2xl font-bold text-yellow-400">
                        {announcement.title}
                      </h3>

                      <p className="mt-4 whitespace-pre-wrap leading-8 text-zinc-300">
                        {announcement.content}
                      </p>

                      <p className="mt-4 text-sm text-zinc-500">
                        {announcement.createdAt?.toDate
                          ? announcement.createdAt
                              .toDate()
                              .toLocaleString("ar-SA")
                          : "جارٍ تحديث الوقت..."}
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        removeAnnouncement(
                          announcement.id,
                          announcement.title
                        )
                      }
                      className="rounded-2xl bg-red-600/15 p-3 text-red-400 transition hover:bg-red-600 hover:text-white"
                      aria-label={`حذف إعلان ${announcement.title}`}
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </PermissionGuard>
  );
}