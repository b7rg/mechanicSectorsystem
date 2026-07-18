"use client";

import { useEffect, useState } from "react";
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore";
import {
  Activity,
  Bell,
  Clock3,
  Loader2,
  UserRound,
} from "lucide-react";

import { db } from "@/lib/firebase";

type ActivityItem = {
  id: string;
  action?: string;
  employee?: string | null;
  name?: string;
  email?: string;
  role?: string;
  createdAt?:
    | Timestamp
    | {
        toDate?: () => Date;
      }
    | null;
};

function getActivityDate(
  createdAt: ActivityItem["createdAt"]
) {
  if (
    createdAt &&
    typeof createdAt.toDate === "function"
  ) {
    return createdAt.toDate();
  }

  return null;
}

function formatActivityDate(
  createdAt: ActivityItem["createdAt"]
) {
  const date = getActivityDate(createdAt);

  if (!date) {
    return "الآن";
  }

  const now = new Date();
  const difference = now.getTime() - date.getTime();

  const minutes = Math.floor(
    difference / (1000 * 60)
  );

  const hours = Math.floor(
    difference / (1000 * 60 * 60)
  );

  const days = Math.floor(
    difference / (1000 * 60 * 60 * 24)
  );

  if (minutes < 1) {
    return "الآن";
  }

  if (minutes < 60) {
    return `منذ ${minutes.toLocaleString(
      "ar-SA"
    )} دقيقة`;
  }

  if (hours < 24) {
    return `منذ ${hours.toLocaleString(
      "ar-SA"
    )} ساعة`;
  }

  if (days < 7) {
    return `منذ ${days.toLocaleString(
      "ar-SA"
    )} يوم`;
  }

  return date.toLocaleDateString("ar-SA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getActivityText(activity: ActivityItem) {
  const action =
    activity.action?.trim() ||
    "تم تنفيذ عملية جديدة";

  if (
    activity.employee &&
    !action.includes(activity.employee)
  ) {
    return `${action} — ${activity.employee}`;
  }

  return action;
}

function getActivityOwner(activity: ActivityItem) {
  return (
    activity.name ||
    activity.email ||
    "مستخدم النظام"
  );
}

export default function ActivityCard() {
  const [activities, setActivities] = useState<
    ActivityItem[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    const activitiesQuery = query(
      collection(db, "activities"),
      orderBy("createdAt", "desc"),
      limit(10)
    );

    const unsubscribe = onSnapshot(
      activitiesQuery,
      (snapshot) => {
        const data = snapshot.docs.map(
          (activityDocument) => ({
            id: activityDocument.id,
            ...(activityDocument.data() as Omit<
              ActivityItem,
              "id"
            >),
          })
        );

        setActivities(data);
        setLoading(false);
        setErrorMessage("");
      },
      (error) => {
        console.error(
          "تعذر تحميل سجل النشاط:",
          error
        );

        setActivities([]);
        setLoading(false);
        setErrorMessage(
          "تعذر تحميل سجل النشاطات."
        );
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <section className="flex min-h-[520px] flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#141414]/90 shadow-2xl shadow-black/20 backdrop-blur-xl">
      <header className="flex items-center justify-between gap-4 border-b border-white/10 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-yellow-500/20 bg-yellow-500/10">
            <Activity
              size={23}
              className="text-yellow-400"
            />
          </div>

          <div>
            <h2 className="text-xl font-black text-white">
              آخر النشاطات
            </h2>

            <p className="mt-1 text-xs text-zinc-500">
              آخر 10 عمليات في النظام
            </p>
          </div>
        </div>

        <span className="flex h-9 min-w-9 items-center justify-center rounded-xl bg-yellow-500/10 px-2 text-sm font-black text-yellow-400">
          {activities.length.toLocaleString(
            "ar-SA"
          )}
        </span>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex h-full min-h-[380px] flex-col items-center justify-center gap-4 text-zinc-500">
            <Loader2
              size={36}
              className="animate-spin text-yellow-400"
            />

            <p>جارٍ تحميل النشاطات...</p>
          </div>
        ) : errorMessage ? (
          <div className="flex h-full min-h-[380px] flex-col items-center justify-center px-6 text-center">
            <Bell
              size={40}
              className="text-red-400"
            />

            <p className="mt-4 font-bold text-red-400">
              {errorMessage}
            </p>
          </div>
        ) : activities.length === 0 ? (
          <div className="flex h-full min-h-[380px] flex-col items-center justify-center px-6 text-center">
            <Activity
              size={42}
              className="text-zinc-700"
            />

            <h3 className="mt-4 text-lg font-black text-zinc-300">
              لا توجد نشاطات حتى الآن
            </h3>

            <p className="mt-2 text-sm leading-7 text-zinc-600">
              العمليات الجديدة بتظهر هنا تلقائيًا.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {activities.map(
              (activity, index) => (
                <article
                  key={activity.id}
                  className="group relative flex gap-4 px-6 py-5 transition hover:bg-white/[0.03]"
                >
                  <div className="relative shrink-0">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-yellow-500/10 bg-yellow-500/[0.07] text-yellow-400 transition group-hover:border-yellow-500/30 group-hover:bg-yellow-500/10">
                      <Bell size={19} />
                    </div>

                    {index !==
                      activities.length - 1 && (
                      <span className="absolute right-1/2 top-11 h-[calc(100%+20px)] w-px translate-x-1/2 bg-white/5" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="break-words text-sm font-bold leading-7 text-zinc-200">
                      {getActivityText(activity)}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-zinc-600">
                      <span className="flex items-center gap-1.5">
                        <UserRound size={14} />

                        {getActivityOwner(activity)}
                      </span>

                      <span className="flex items-center gap-1.5">
                        <Clock3 size={14} />

                        {formatActivityDate(
                          activity.createdAt
                        )}
                      </span>
                    </div>
                  </div>

                  <span className="mt-1 text-xs font-black text-zinc-700">
                    {(index + 1).toLocaleString(
                      "ar-SA"
                    )}
                  </span>
                </article>
              )
            )}
          </div>
        )}
      </div>

      <footer className="border-t border-white/10 px-6 py-4 text-center text-xs text-zinc-600">
        يتم تحديث السجل مباشرة من Firebase
      </footer>
    </section>
  );
}