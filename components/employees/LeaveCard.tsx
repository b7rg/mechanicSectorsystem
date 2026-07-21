"use client";

import {
  useEffect,
  useState,
} from "react";
import {
  deleteField,
  doc,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import {
  CalendarDays,
  Loader2,
  Save,
  Trash2,
} from "lucide-react";

import { addActivity } from "@/lib/activity";
import { db } from "@/lib/firebase";

type LeaveData = {
  active?: boolean;
  type?: string;
  reason?: string;
  startAt?: Timestamp | null;
  endAt?: Timestamp | null;
};

type LeaveCardProps = {
  id: string;
  leave?: LeaveData | null;
};

function toDateTimeInput(
  value?: Timestamp | null
) {
  if (!value?.toDate) {
    return "";
  }

  const date = value.toDate();
  const localDate = new Date(
    date.getTime() -
      date.getTimezoneOffset() *
        60_000
  );

  return localDate
    .toISOString()
    .slice(0, 16);
}

function toTimestamp(
  value: string
) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (
    Number.isNaN(date.getTime())
  ) {
    return null;
  }

  return Timestamp.fromDate(date);
}

export default function LeaveCard({
  id,
  leave,
}: LeaveCardProps) {
  const [leaveType, setLeaveType] =
    useState("");
  const [reason, setReason] =
    useState("");
  const [startAt, setStartAt] =
    useState("");
  const [endAt, setEndAt] =
    useState("");
  const [saving, setSaving] =
    useState(false);
  const [removing, setRemoving] =
    useState(false);
  const [message, setMessage] =
    useState("");
  const [errorMessage, setErrorMessage] =
    useState("");

  const leaveActive =
    leave?.active === true;

  useEffect(() => {
    setLeaveType(
      String(leave?.type ?? "")
    );
    setReason(
      String(leave?.reason ?? "")
    );
    setStartAt(
      toDateTimeInput(
        leave?.startAt
      )
    );
    setEndAt(
      toDateTimeInput(leave?.endAt)
    );
  }, [leave]);

  async function saveLeave() {
    const cleanType =
      leaveType.trim();
    const cleanReason =
      reason.trim();
    const startTimestamp =
      toTimestamp(startAt);
    const endTimestamp =
      toTimestamp(endAt);

    if (!cleanType) {
      setErrorMessage(
        "اكتب نوع الإجازة."
      );
      return;
    }

    if (!startTimestamp) {
      setErrorMessage(
        "حدد وقت بداية الإجازة."
      );
      return;
    }

    if (
      endTimestamp &&
      endTimestamp.toMillis() <=
        startTimestamp.toMillis()
    ) {
      setErrorMessage(
        "نهاية الإجازة يجب أن تكون بعد بدايتها."
      );
      return;
    }

    try {
      setSaving(true);
      setMessage("");
      setErrorMessage("");

      await updateDoc(
        doc(db, "employees", id),
        {
          leave: {
            active: true,
            type: cleanType,
            reason: cleanReason,
            startAt: startTimestamp,
            endAt:
              endTimestamp ?? null,
          },

          // مهم: القائمة تعتمد على status أيضًا.
          status: "leave",
          updatedAt:
            serverTimestamp(),
        }
      );

      try {
        await addActivity(
          `تم تسجيل إجازة للموظف ${id}`
        );
      } catch (activityError) {
        console.error(
          "تعذر تسجيل نشاط الإجازة:",
          activityError
        );
      }

      setMessage(
        "تم حفظ الإجازة بنجاح."
      );
    } catch (error) {
      console.error(
        "تعذر حفظ الإجازة:",
        error
      );

      setErrorMessage(
        "حدث خطأ أثناء حفظ الإجازة."
      );
    } finally {
      setSaving(false);
    }
  }

  async function removeLeave() {
    const confirmed =
      window.confirm(
        "هل تريد إنهاء الإجازة وإعادة الموظف إلى رأس العمل؟"
      );

    if (!confirmed) {
      return;
    }

    try {
      setRemoving(true);
      setMessage("");
      setErrorMessage("");

      await updateDoc(
        doc(db, "employees", id),
        {
          /*
            حذف بيانات الإجازة وحده لا يكفي،
            لأن بطاقة الموظف تقرأ status أيضًا.
          */
          leave: deleteField(),
          status: "active",
          updatedAt:
            serverTimestamp(),
        }
      );

      setLeaveType("");
      setReason("");
      setStartAt("");
      setEndAt("");

      try {
        await addActivity(
          `تم إنهاء إجازة الموظف ${id}`
        );
      } catch (activityError) {
        console.error(
          "تعذر تسجيل نشاط إنهاء الإجازة:",
          activityError
        );
      }

      setMessage(
        "تم إنهاء الإجازة وإعادة الموظف إلى رأس العمل."
      );
    } catch (error) {
      console.error(
        "تعذر إنهاء الإجازة:",
        error
      );

      setErrorMessage(
        "حدث خطأ أثناء إنهاء الإجازة."
      );
    } finally {
      setRemoving(false);
    }
  }

  return (
    <article
      dir="rtl"
      className="rounded-3xl border border-white/10 bg-[#141414]/90 p-6 backdrop-blur-xl"
    >
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white">
            الإجازة
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            تسجيل الإجازة أو إنهاؤها.
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-orange-500/20 bg-orange-500/10 text-orange-400">
          <CalendarDays size={22} />
        </div>
      </div>

      {message && (
        <div className="mb-4 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm font-bold text-green-400">
          {message}
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-400">
          {errorMessage}
        </div>
      )}

      <div className="space-y-4">
        <label className="block">
          <span className="mb-2 block text-sm font-bold text-zinc-400">
            نوع الإجازة
          </span>

          <input
            value={leaveType}
            onChange={(event) =>
              setLeaveType(
                event.target.value
              )
            }
            placeholder="مثال: إجازة داخلية"
            className="w-full rounded-xl border border-white/10 bg-zinc-900 p-3.5 text-white outline-none transition focus:border-yellow-500"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-bold text-zinc-400">
            السبب
          </span>

          <textarea
            value={reason}
            onChange={(event) =>
              setReason(
                event.target.value
              )
            }
            placeholder="اكتب سبب الإجازة"
            rows={3}
            className="w-full resize-none rounded-xl border border-white/10 bg-zinc-900 p-3.5 text-white outline-none transition focus:border-yellow-500"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-zinc-400">
              بداية الإجازة
            </span>

            <input
              type="datetime-local"
              value={startAt}
              onChange={(event) =>
                setStartAt(
                  event.target.value
                )
              }
              className="w-full rounded-xl border border-white/10 bg-zinc-900 p-3.5 text-white outline-none transition focus:border-yellow-500"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-zinc-400">
              نهاية الإجازة
            </span>

            <input
              type="datetime-local"
              value={endAt}
              onChange={(event) =>
                setEndAt(
                  event.target.value
                )
              }
              className="w-full rounded-xl border border-white/10 bg-zinc-900 p-3.5 text-white outline-none transition focus:border-yellow-500"
            />
          </label>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={saveLeave}
            disabled={
              saving || removing
            }
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-yellow-500 px-4 py-3.5 font-black text-black transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? (
              <Loader2
                size={19}
                className="animate-spin"
              />
            ) : (
              <Save size={19} />
            )}

            {saving
              ? "جارٍ الحفظ..."
              : leaveActive
                ? "تحديث الإجازة"
                : "تسجيل الإجازة"}
          </button>

          {leaveActive && (
            <button
              type="button"
              onClick={removeLeave}
              disabled={
                saving || removing
              }
              className="flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-3.5 font-black text-red-400 transition hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {removing ? (
                <Loader2
                  size={19}
                  className="animate-spin"
                />
              ) : (
                <Trash2 size={19} />
              )}

              {removing
                ? "جارٍ الإنهاء..."
                : "إنهاء الإجازة"}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}