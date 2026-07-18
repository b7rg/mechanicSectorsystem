"use client";

import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { History } from "lucide-react";

type Activity = {
  id: string;
  action: string;
  email: string;
  createdAt?: any;
};

export default function ActivityCard() {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, "activity"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Activity[] = [];

      snapshot.forEach((doc) => {
        list.push({
  ...(doc.data() as Omit<Activity, "id">),
  id: doc.id,
});
      });

      setActivities(list.slice(0, 10));
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="rounded-3xl border border-white/10 bg-[#141414] p-6">

      <div className="mb-6 flex items-center gap-3">

        <div className="rounded-xl bg-yellow-500/20 p-3">
          <History className="text-yellow-400" size={22} />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-yellow-400">
            آخر النشاطات
          </h2>

          <p className="text-sm text-zinc-500">
            آخر العمليات التي تمت داخل النظام
          </p>
        </div>

      </div>

      <div className="space-y-4">

        {activities.length === 0 ? (
          <div className="rounded-2xl bg-[#1b1b1b] p-5 text-center text-zinc-500">
            لا يوجد نشاط حتى الآن.
          </div>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="rounded-2xl border border-white/5 bg-[#1a1a1a] p-4 transition hover:border-yellow-500/30"
            >
              <p className="font-semibold text-white">
                {activity.action}
              </p>

              <p className="mt-2 text-sm text-zinc-400">
                {activity.email}
              </p>

              <p className="mt-1 text-xs text-zinc-600">
                {activity.createdAt?.toDate
                  ? activity.createdAt
                      .toDate()
                      .toLocaleString("ar-SA")
                  : ""}
              </p>
            </div>
          ))
        )}

      </div>

    </div>
  );
}