"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore";
import {
  Bell,
  BellOff,
  CalendarDays,
  Check,
  CheckCheck,
  Clock3,
  Search,
  X,
} from "lucide-react";

import { auth, db } from "@/lib/firebase";

type Activity = {
  id: string;
  action?: string;
  employee?: string | null;
  name?: string;
  email?: string;
  role?: string;
  createdAt?: Timestamp | {
    toDate?: () => Date;
  };
};

function getActivityDate(activity: Activity) {
  if (
    activity.createdAt &&
    typeof activity.createdAt.toDate === "function"
  ) {
    return activity.createdAt.toDate();
  }

  return null;
}

function formatActivityDate(activity: Activity) {
  const date = getActivityDate(activity);

  if (!date) {
    return "الآن";
  }

  return date.toLocaleString("ar-SA", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getNotificationText(activity: Activity) {
  const action =
    activity.action?.trim() || "تم تنفيذ عملية جديدة";

  if (
    activity.employee &&
    !action.includes(activity.employee)
  ) {
    return `${action} — ${activity.employee}`;
  }

  return action;
}

export default function Topbar() {
  const router = useRouter();
  const notificationsRef = useRef<HTMLDivElement>(null);

  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [search, setSearch] = useState("");

  const [userId, setUserId] = useState("");
  const [activities, setActivities] = useState<Activity[]>([]);
  const [readIds, setReadIds] = useState<string[]>([]);

  const [notificationsOpen, setNotificationsOpen] =
    useState(false);

  const [loadingNotifications, setLoadingNotifications] =
    useState(true);

  const [notificationsError, setNotificationsError] =
    useState("");

  useEffect(() => {
    function updateDateAndTime() {
      const now = new Date();

      setTime(
        now.toLocaleTimeString("ar-SA", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );

      setDate(
        now.toLocaleDateString("ar-SA", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      );
    }

    updateDateAndTime();

    const interval = window.setInterval(
      updateDateAndTime,
      1000
    );

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        if (!user) {
          setUserId("");
          setReadIds([]);
          return;
        }

        setUserId(user.uid);

        const storageKey =
          `mss-notifications-read-${user.uid}`;

        try {
          const storedValue =
            window.localStorage.getItem(storageKey);

          const parsedValue = storedValue
            ? JSON.parse(storedValue)
            : [];

          setReadIds(
            Array.isArray(parsedValue)
              ? parsedValue.filter(
                  (item): item is string =>
                    typeof item === "string"
                )
              : []
          );
        } catch {
          setReadIds([]);
        }
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const activitiesQuery = query(
      collection(db, "activities"),
      orderBy("createdAt", "desc"),
      limit(20)
    );

    const unsubscribe = onSnapshot(
      activitiesQuery,
      (snapshot) => {
        const data = snapshot.docs.map(
          (activityDocument) => ({
            id: activityDocument.id,
            ...(activityDocument.data() as Omit<
              Activity,
              "id"
            >),
          })
        );

        setActivities(data);
        setLoadingNotifications(false);
        setNotificationsError("");
      },
      (error) => {
        console.error(
          "تعذر تحميل الإشعارات:",
          error
        );

        setActivities([]);
        setLoadingNotifications(false);
        setNotificationsError(
          "تعذر تحميل الإشعارات حاليًا."
        );
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    function closeNotifications(event: MouseEvent) {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(
          event.target as Node
        )
      ) {
        setNotificationsOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      closeNotifications
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        closeNotifications
      );
    };
  }, []);

  const unreadCount = useMemo(() => {
    return activities.filter(
      (activity) => !readIds.includes(activity.id)
    ).length;
  }, [activities, readIds]);

  function saveReadIds(nextReadIds: string[]) {
    const uniqueIds = Array.from(
      new Set(nextReadIds)
    );

    setReadIds(uniqueIds);

    if (!userId) {
      return;
    }

    window.localStorage.setItem(
      `mss-notifications-read-${userId}`,
      JSON.stringify(uniqueIds)
    );
  }

  function markNotificationAsRead(
    notificationId: string
  ) {
    if (readIds.includes(notificationId)) {
      return;
    }

    saveReadIds([...readIds, notificationId]);
  }

  function markAllAsRead() {
    saveReadIds(
      activities.map((activity) => activity.id)
    );
  }

  function clearReadStatus() {
    saveReadIds([]);
  }

  function handleSearch() {
    const cleanSearch = search.trim();

    if (!cleanSearch) {
      router.push("/dashboard/employees");
      return;
    }

    router.push(
      `/dashboard/employees?search=${encodeURIComponent(
        cleanSearch
      )}`
    );
  }

  return (
    <header
      dir="rtl"
      className="relative z-40 mb-8 flex flex-col gap-5 rounded-3xl border border-yellow-500/10 bg-[#141414]/90 px-5 py-5 shadow-2xl shadow-black/20 backdrop-blur-xl xl:flex-row xl:items-center xl:justify-between xl:px-8"
    >
      <div className="relative w-full xl:max-w-[480px]">
        <Search
          className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500"
          size={20}
        />

        <input
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              handleSearch();
            }
          }}
          placeholder="ابحث عن موظف، رتبة، أو Discord ID..."
          className="w-full rounded-2xl border border-white/10 bg-[#1b1b1b] py-3.5 pl-4 pr-12 text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-500"
        />

        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 transition hover:text-white"
            aria-label="مسح البحث"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-2xl border border-white/5 bg-[#1b1b1b] px-4 py-3 text-sm text-zinc-300">
          <CalendarDays
            className="text-yellow-400"
            size={18}
          />

          <span>{date}</span>
        </div>

        <div className="flex items-center gap-2 rounded-2xl border border-white/5 bg-[#1b1b1b] px-4 py-3 text-sm text-zinc-300">
          <Clock3
            className="text-yellow-400"
            size={18}
          />

          <span className="min-w-[92px] text-center">
            {time}
          </span>
        </div>

        <div
          ref={notificationsRef}
          className="relative"
        >
          <button
            type="button"
            onClick={() =>
              setNotificationsOpen(
                (current) => !current
              )
            }
            className={`relative flex h-12 w-12 items-center justify-center rounded-2xl border transition ${
              notificationsOpen
                ? "border-yellow-500/40 bg-yellow-500/10"
                : "border-white/5 bg-[#1b1b1b] hover:border-yellow-500/30 hover:bg-[#252525]"
            }`}
            aria-label="الإشعارات"
          >
            <Bell
              className="text-yellow-400"
              size={22}
            />

            {unreadCount > 0 && (
              <span className="absolute -left-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-[#141414] bg-red-500 px-1 text-xs font-black text-white">
                {unreadCount > 99
                  ? "+99"
                  : unreadCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute left-0 top-[calc(100%+14px)] z-[100] w-[min(92vw,430px)] overflow-hidden rounded-3xl border border-white/10 bg-[#101010]/98 shadow-2xl shadow-black/60 backdrop-blur-2xl">
              <div className="flex items-center justify-between gap-4 border-b border-white/10 p-5">
                <div>
                  <h2 className="text-xl font-black text-white">
                    الإشعارات
                  </h2>

                  <p className="mt-1 text-sm text-zinc-500">
                    {unreadCount > 0
                      ? `${unreadCount.toLocaleString(
                          "ar-SA"
                        )} إشعار غير مقروء`
                      : "لا توجد إشعارات جديدة"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {activities.length > 0 &&
                    unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={markAllAsRead}
                        className="flex items-center gap-2 rounded-xl border border-green-500/15 bg-green-500/10 px-3 py-2 text-xs font-bold text-green-400 transition hover:bg-green-500 hover:text-black"
                      >
                        <CheckCheck size={16} />
                        قراءة الكل
                      </button>
                    )}

                  {activities.length > 0 &&
                    unreadCount === 0 && (
                      <button
                        type="button"
                        onClick={clearReadStatus}
                        className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-zinc-400 transition hover:text-white"
                      >
                        إعادة الضبط
                      </button>
                    )}
                </div>
              </div>

              <div className="max-h-[470px] overflow-y-auto">
                {loadingNotifications ? (
                  <div className="space-y-3 p-5">
                    {Array.from({ length: 4 }).map(
                      (_, index) => (
                        <div
                          key={index}
                          className="h-24 animate-pulse rounded-2xl bg-white/5"
                        />
                      )
                    )}
                  </div>
                ) : notificationsError ? (
                  <div className="p-10 text-center">
                    <BellOff
                      size={38}
                      className="mx-auto text-red-400"
                    />

                    <p className="mt-4 font-bold text-red-400">
                      {notificationsError}
                    </p>
                  </div>
                ) : activities.length === 0 ? (
                  <div className="p-10 text-center">
                    <BellOff
                      size={40}
                      className="mx-auto text-zinc-600"
                    />

                    <h3 className="mt-4 font-black text-zinc-300">
                      لا توجد إشعارات
                    </h3>

                    <p className="mt-2 text-sm text-zinc-500">
                      ستظهر العمليات الجديدة هنا تلقائيًا.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {activities.map((activity) => {
                      const isRead =
                        readIds.includes(activity.id);

                      return (
                        <button
                          key={activity.id}
                          type="button"
                          onClick={() =>
                            markNotificationAsRead(
                              activity.id
                            )
                          }
                          className={`relative flex w-full items-start gap-4 p-5 text-right transition hover:bg-white/5 ${
                            isRead
                              ? "bg-transparent"
                              : "bg-yellow-500/[0.04]"
                          }`}
                        >
                          <div
                            className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                              isRead
                                ? "bg-white/5 text-zinc-500"
                                : "bg-yellow-500/10 text-yellow-400"
                            }`}
                          >
                            {isRead ? (
                              <Check size={18} />
                            ) : (
                              <Bell size={18} />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p
                              className={`leading-7 ${
                                isRead
                                  ? "font-medium text-zinc-400"
                                  : "font-bold text-white"
                              }`}
                            >
                              {getNotificationText(
                                activity
                              )}
                            </p>

                            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-zinc-600">
                              <span>
                                بواسطة{" "}
                                {activity.name ||
                                  activity.email ||
                                  "مستخدم النظام"}
                              </span>

                              <span>•</span>

                              <span>
                                {formatActivityDate(
                                  activity
                                )}
                              </span>
                            </div>
                          </div>

                          {!isRead && (
                            <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-red-500" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="border-t border-white/10 p-4 text-center text-xs text-zinc-600">
                يتم عرض آخر 20 عملية مسجلة في النظام.
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}