"use client";

import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  Globe2,
  Loader2,
  LockKeyhole,
  Megaphone,
  Save,
  Settings,
  ShieldCheck,
  Users,
  Wrench,
} from "lucide-react";

import { auth, db } from "@/lib/firebase";
import { addActivity } from "@/lib/activity";
import PermissionGuard from "@/components/auth/PermissionGuard";

type RecruitmentStatus = "open" | "closed" | "paused";

type SiteSettings = {
  sectorName: string;
  englishName: string;
  description: string;
  discordUrl: string;
  supportContact: string;
  footerText: string;

  recruitmentStatus: RecruitmentStatus;

  showAnnouncements: boolean;
  showCourses: boolean;
  showCalendar: boolean;
  maintenanceMode: boolean;

  updatedBy?: string;
  updatedByUid?: string;
  updatedAt?:
    | Timestamp
    | {
        toDate?: () => Date;
      }
    | null;
};

const defaultSettings: SiteSettings = {
  sectorName: "قطاع الميكانيك",
  englishName: "Mechanic Sector",
  description:
    "النظام الرسمي لإدارة قطاع الميكانيك في Thrones.",
  discordUrl: "",
  supportContact: "",
  footerText: "جميع الحقوق محفوظة لقطاع الميكانيك.",

  recruitmentStatus: "closed",

  showAnnouncements: true,
  showCourses: true,
  showCalendar: true,
  maintenanceMode: false,
};

function formatUpdatedAt(
  value: SiteSettings["updatedAt"]
) {
  if (
    value &&
    typeof value.toDate === "function"
  ) {
    return value.toDate().toLocaleString("ar-SA", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  return "لم يتم الحفظ بعد";
}

function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-8 w-14 shrink-0 rounded-full transition disabled:cursor-not-allowed disabled:opacity-50 ${
        checked
          ? "bg-yellow-500"
          : "bg-zinc-700"
      }`}
      aria-pressed={checked}
    >
      <span
        className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-lg transition ${
          checked ? "right-7" : "right-1"
        }`}
      />
    </button>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] =
    useState<SiteSettings>(defaultSettings);

  const [savedSettings, setSavedSettings] =
    useState<SiteSettings>(defaultSettings);

  const [role, setRole] = useState("");
  const [currentUserName, setCurrentUserName] =
    useState("مستخدم النظام");

  const [loading, setLoading] = useState(true);
  const [loadingRole, setLoadingRole] =
    useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    const settingsReference = doc(
      db,
      "settings",
      "site"
    );

    const unsubscribe = onSnapshot(
      settingsReference,
      (snapshot) => {
        if (snapshot.exists()) {
          const data =
            snapshot.data() as Partial<SiteSettings>;

          const nextSettings: SiteSettings = {
            ...defaultSettings,
            ...data,
          };

          setSettings(nextSettings);
          setSavedSettings(nextSettings);
        } else {
          setSettings(defaultSettings);
          setSavedSettings(defaultSettings);
        }

        setLoading(false);
        setErrorMessage("");
      },
      (error) => {
        console.error(
          "تعذر تحميل إعدادات الموقع:",
          error
        );

        setLoading(false);
        setErrorMessage(
          "تعذر تحميل إعدادات الموقع."
        );
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let unsubscribeUser:
      | (() => void)
      | undefined;

    const unsubscribeAuth = onAuthStateChanged(
      auth,
      (user) => {
        unsubscribeUser?.();

        if (!user) {
          setRole("");
          setCurrentUserName("مستخدم النظام");
          setLoadingRole(false);
          return;
        }

        setCurrentUserName(
          user.displayName ||
            user.email?.split("@")[0] ||
            "مستخدم النظام"
        );

        unsubscribeUser = onSnapshot(
          doc(db, "users", user.uid),
          (snapshot) => {
            const userData = snapshot.data();

            setRole(
              typeof userData?.role === "string"
                ? userData.role
                : ""
            );

            setCurrentUserName(
              typeof userData?.name === "string" &&
                userData.name.trim()
                ? userData.name
                : user.displayName ||
                    user.email?.split("@")[0] ||
                    "مستخدم النظام"
            );

            setLoadingRole(false);
          },
          (error) => {
            console.error(
              "تعذر قراءة صلاحية المستخدم:",
              error
            );

            setRole("");
            setLoadingRole(false);
          }
        );
      }
    );

    return () => {
      unsubscribeUser?.();
      unsubscribeAuth();
    };
  }, []);

  const canManage =
    role === "owner" || role === "leader";

  const hasChanges = useMemo(() => {
    const currentComparable = {
      sectorName: settings.sectorName,
      englishName: settings.englishName,
      description: settings.description,
      discordUrl: settings.discordUrl,
      supportContact: settings.supportContact,
      footerText: settings.footerText,
      recruitmentStatus:
        settings.recruitmentStatus,
      showAnnouncements:
        settings.showAnnouncements,
      showCourses: settings.showCourses,
      showCalendar: settings.showCalendar,
      maintenanceMode: settings.maintenanceMode,
    };

    const savedComparable = {
      sectorName: savedSettings.sectorName,
      englishName: savedSettings.englishName,
      description: savedSettings.description,
      discordUrl: savedSettings.discordUrl,
      supportContact:
        savedSettings.supportContact,
      footerText: savedSettings.footerText,
      recruitmentStatus:
        savedSettings.recruitmentStatus,
      showAnnouncements:
        savedSettings.showAnnouncements,
      showCourses: savedSettings.showCourses,
      showCalendar: savedSettings.showCalendar,
      maintenanceMode:
        savedSettings.maintenanceMode,
    };

    return (
      JSON.stringify(currentComparable) !==
      JSON.stringify(savedComparable)
    );
  }, [settings, savedSettings]);

  function updateSetting<
    Key extends keyof SiteSettings,
  >(key: Key, value: SiteSettings[Key]) {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));

    setMessage("");
    setErrorMessage("");
  }

  function resetChanges() {
    setSettings(savedSettings);
    setMessage("");
    setErrorMessage("");
  }

  async function saveSettings() {
    if (!canManage) {
      setErrorMessage(
        "تعديل الإعدادات متاح للمالك والقيادة فقط."
      );
      return;
    }

    const sectorName =
      settings.sectorName.trim();
    const englishName =
      settings.englishName.trim();
    const discordUrl =
      settings.discordUrl.trim();

    if (!sectorName) {
      setErrorMessage(
        "اكتبي اسم القطاع قبل الحفظ."
      );
      return;
    }

    if (!englishName) {
      setErrorMessage(
        "اكتبي الاسم الإنجليزي قبل الحفظ."
      );
      return;
    }

    if (
      discordUrl &&
      !discordUrl.startsWith("https://") &&
      !discordUrl.startsWith("http://")
    ) {
      setErrorMessage(
        "رابط الديسكورد لازم يبدأ بـ https://"
      );
      return;
    }

    try {
      setSaving(true);
      setMessage("");
      setErrorMessage("");

      const settingsReference = doc(
        db,
        "settings",
        "site"
      );

      await setDoc(
        settingsReference,
        {
          sectorName,
          englishName,
          description:
            settings.description.trim(),
          discordUrl,
          supportContact:
            settings.supportContact.trim(),
          footerText:
            settings.footerText.trim(),

          recruitmentStatus:
            settings.recruitmentStatus,

          showAnnouncements:
            settings.showAnnouncements,
          showCourses: settings.showCourses,
          showCalendar: settings.showCalendar,
          maintenanceMode:
            settings.maintenanceMode,

          updatedBy: currentUserName,
          updatedByUid:
            auth.currentUser?.uid ?? null,
          updatedAt: serverTimestamp(),
        },
        {
          merge: true,
        }
      );

      await addActivity(
        "تحديث إعدادات الموقع",
        currentUserName
      );

      setMessage(
        "تم حفظ إعدادات الموقع بنجاح."
      );
    } catch (error) {
      console.error(
        "تعذر حفظ إعدادات الموقع:",
        error
      );

      setErrorMessage(
        "حدث خطأ أثناء حفظ الإعدادات."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <PermissionGuard permission="settings">
      <main className="space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-yellow-500/20 bg-yellow-500/10">
              <Settings
                size={32}
                className="text-yellow-400"
              />
            </div>

            <div>
              <h1 className="text-4xl font-black text-yellow-400">
                إعدادات النظام
              </h1>

              <p className="mt-2 text-zinc-400">
                التحكم بالمعلومات العامة وحالة
                أقسام الموقع.
              </p>
            </div>
          </div>

          {!loadingRole && !canManage && (
            <div className="flex items-center gap-2 rounded-2xl border border-blue-500/20 bg-blue-500/10 px-5 py-3 text-sm font-bold text-blue-400">
              <LockKeyhole size={18} />
              وضع العرض فقط
            </div>
          )}
        </header>

        {loading ? (
          <div className="flex min-h-[420px] items-center justify-center rounded-3xl border border-white/10 bg-[#141414]/90">
            <div className="text-center">
              <Loader2
                size={40}
                className="mx-auto animate-spin text-yellow-400"
              />

              <p className="mt-4 text-zinc-400">
                جارٍ تحميل الإعدادات...
              </p>
            </div>
          </div>
        ) : (
          <>
            {message && (
              <div className="flex items-center gap-3 rounded-2xl border border-green-500/20 bg-green-500/10 px-5 py-4 font-bold text-green-400">
                <CheckCircle2 size={21} />
                {message}
              </div>
            )}

            {errorMessage && (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 font-bold text-red-400">
                {errorMessage}
              </div>
            )}

            <section className="grid gap-8 xl:grid-cols-2">
              <div className="space-y-8">
                <article className="rounded-3xl border border-white/10 bg-[#141414]/90 p-6 backdrop-blur-xl md:p-8">
                  <div className="mb-6 flex items-center gap-3">
                    <Globe2
                      className="text-yellow-400"
                      size={24}
                    />

                    <div>
                      <h2 className="text-xl font-black text-white">
                        معلومات الموقع
                      </h2>

                      <p className="mt-1 text-sm text-zinc-500">
                        الأسماء والوصف الظاهر للزوار.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <label className="block">
                      <span className="mb-2 block text-sm font-bold text-zinc-300">
                        اسم القطاع
                      </span>

                      <input
                        value={settings.sectorName}
                        onChange={(event) =>
                          updateSetting(
                            "sectorName",
                            event.target.value
                          )
                        }
                        disabled={!canManage}
                        className="w-full rounded-2xl border border-white/10 bg-[#1b1b1b] px-4 py-4 text-white outline-none transition focus:border-yellow-500 disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-bold text-zinc-300">
                        الاسم الإنجليزي
                      </span>

                      <input
                        value={settings.englishName}
                        onChange={(event) =>
                          updateSetting(
                            "englishName",
                            event.target.value
                          )
                        }
                        disabled={!canManage}
                        className="w-full rounded-2xl border border-white/10 bg-[#1b1b1b] px-4 py-4 text-white outline-none transition focus:border-yellow-500 disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-bold text-zinc-300">
                        وصف الموقع
                      </span>

                      <textarea
                        value={settings.description}
                        onChange={(event) =>
                          updateSetting(
                            "description",
                            event.target.value
                          )
                        }
                        disabled={!canManage}
                        rows={4}
                        className="w-full resize-none rounded-2xl border border-white/10 bg-[#1b1b1b] px-4 py-4 leading-8 text-white outline-none transition focus:border-yellow-500 disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </label>
                  </div>
                </article>

                <article className="rounded-3xl border border-white/10 bg-[#141414]/90 p-6 backdrop-blur-xl md:p-8">
                  <div className="mb-6 flex items-center gap-3">
                    <ExternalLink
                      className="text-yellow-400"
                      size={24}
                    />

                    <div>
                      <h2 className="text-xl font-black text-white">
                        الروابط والتواصل
                      </h2>

                      <p className="mt-1 text-sm text-zinc-500">
                        معلومات التواصل الخاصة بالقطاع.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <label className="block">
                      <span className="mb-2 block text-sm font-bold text-zinc-300">
                        رابط الديسكورد
                      </span>

                      <input
                        value={settings.discordUrl}
                        onChange={(event) =>
                          updateSetting(
                            "discordUrl",
                            event.target.value
                          )
                        }
                        disabled={!canManage}
                        placeholder="https://discord.gg/..."
                        dir="ltr"
                        className="w-full rounded-2xl border border-white/10 bg-[#1b1b1b] px-4 py-4 text-left text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-500 disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-bold text-zinc-300">
                        جهة التواصل
                      </span>

                      <input
                        value={
                          settings.supportContact
                        }
                        onChange={(event) =>
                          updateSetting(
                            "supportContact",
                            event.target.value
                          )
                        }
                        disabled={!canManage}
                        placeholder="مثال: تكت القيادة"
                        className="w-full rounded-2xl border border-white/10 bg-[#1b1b1b] px-4 py-4 text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-500 disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-bold text-zinc-300">
                        نص أسفل الموقع
                      </span>

                      <input
                        value={settings.footerText}
                        onChange={(event) =>
                          updateSetting(
                            "footerText",
                            event.target.value
                          )
                        }
                        disabled={!canManage}
                        className="w-full rounded-2xl border border-white/10 bg-[#1b1b1b] px-4 py-4 text-white outline-none transition focus:border-yellow-500 disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </label>
                  </div>
                </article>
              </div>

              <div className="space-y-8">
                <article className="rounded-3xl border border-white/10 bg-[#141414]/90 p-6 backdrop-blur-xl md:p-8">
                  <div className="mb-6 flex items-center gap-3">
                    <Users
                      className="text-yellow-400"
                      size={24}
                    />

                    <div>
                      <h2 className="text-xl font-black text-white">
                        حالة التوظيف
                      </h2>

                      <p className="mt-1 text-sm text-zinc-500">
                        الحالة التي تظهر للمتقدمين.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    {(
                      [
                        {
                          value: "open",
                          label: "متاح",
                          description:
                            "استقبال طلبات التوظيف",
                          className:
                            "border-green-500/30 bg-green-500/10 text-green-400",
                        },
                        {
                          value: "paused",
                          label: "متوقف مؤقتًا",
                          description:
                            "إيقاف مؤقت للطلبات",
                          className:
                            "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
                        },
                        {
                          value: "closed",
                          label: "مغلق",
                          description:
                            "عدم استقبال الطلبات",
                          className:
                            "border-red-500/30 bg-red-500/10 text-red-400",
                        },
                      ] as const
                    ).map((status) => {
                      const selected =
                        settings.recruitmentStatus ===
                        status.value;

                      return (
                        <button
                          key={status.value}
                          type="button"
                          disabled={!canManage}
                          onClick={() =>
                            updateSetting(
                              "recruitmentStatus",
                              status.value
                            )
                          }
                          className={`rounded-2xl border p-4 text-right transition disabled:cursor-not-allowed disabled:opacity-60 ${
                            selected
                              ? status.className
                              : "border-white/10 bg-white/5 text-zinc-400 hover:border-white/20"
                          }`}
                        >
                          <p className="font-black">
                            {status.label}
                          </p>

                          <p className="mt-2 text-xs leading-6 opacity-70">
                            {status.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </article>

                <article className="rounded-3xl border border-white/10 bg-[#141414]/90 p-6 backdrop-blur-xl md:p-8">
                  <div className="mb-6 flex items-center gap-3">
                    <ShieldCheck
                      className="text-yellow-400"
                      size={24}
                    />

                    <div>
                      <h2 className="text-xl font-black text-white">
                        أقسام الموقع
                      </h2>

                      <p className="mt-1 text-sm text-zinc-500">
                        تفعيل أو إخفاء أقسام الواجهة.
                      </p>
                    </div>
                  </div>

                  <div className="divide-y divide-white/10">
                    <div className="flex items-center justify-between gap-5 py-5">
                      <div className="flex items-center gap-4">
                        <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">
                          <Megaphone size={21} />
                        </div>

                        <div>
                          <p className="font-black text-white">
                            الإعلانات
                          </p>

                          <p className="mt-1 text-sm text-zinc-500">
                            إظهار صفحة الإعلانات للزوار.
                          </p>
                        </div>
                      </div>

                      <Toggle
                        checked={
                          settings.showAnnouncements
                        }
                        disabled={!canManage}
                        onChange={(value) =>
                          updateSetting(
                            "showAnnouncements",
                            value
                          )
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between gap-5 py-5">
                      <div className="flex items-center gap-4">
                        <div className="rounded-xl bg-purple-500/10 p-3 text-purple-400">
                          <Wrench size={21} />
                        </div>

                        <div>
                          <p className="font-black text-white">
                            الدورات
                          </p>

                          <p className="mt-1 text-sm text-zinc-500">
                            إظهار جدول دورات القطاع.
                          </p>
                        </div>
                      </div>

                      <Toggle
                        checked={
                          settings.showCourses
                        }
                        disabled={!canManage}
                        onChange={(value) =>
                          updateSetting(
                            "showCourses",
                            value
                          )
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between gap-5 py-5">
                      <div className="flex items-center gap-4">
                        <div className="rounded-xl bg-green-500/10 p-3 text-green-400">
                          <CalendarDays size={21} />
                        </div>

                        <div>
                          <p className="font-black text-white">
                            تقويم القطاع
                          </p>

                          <p className="mt-1 text-sm text-zinc-500">
                            إظهار فعاليات ومواعيد القطاع.
                          </p>
                        </div>
                      </div>

                      <Toggle
                        checked={
                          settings.showCalendar
                        }
                        disabled={!canManage}
                        onChange={(value) =>
                          updateSetting(
                            "showCalendar",
                            value
                          )
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between gap-5 py-5">
                      <div className="flex items-center gap-4">
                        <div className="rounded-xl bg-red-500/10 p-3 text-red-400">
                          <Bell size={21} />
                        </div>

                        <div>
                          <p className="font-black text-white">
                            وضع الصيانة
                          </p>

                          <p className="mt-1 text-sm text-zinc-500">
                            إخفاء الموقع العام مؤقتًا.
                          </p>
                        </div>
                      </div>

                      <Toggle
                        checked={
                          settings.maintenanceMode
                        }
                        disabled={!canManage}
                        onChange={(value) =>
                          updateSetting(
                            "maintenanceMode",
                            value
                          )
                        }
                      />
                    </div>
                  </div>
                </article>

                <article className="rounded-3xl border border-yellow-500/10 bg-yellow-500/[0.03] p-6">
                  <p className="text-sm font-bold text-zinc-300">
                    آخر تحديث
                  </p>

                  <p className="mt-2 text-sm text-zinc-500">
                    {formatUpdatedAt(
                      savedSettings.updatedAt
                    )}
                  </p>

                  {savedSettings.updatedBy && (
                    <p className="mt-2 text-sm text-zinc-500">
                      بواسطة:{" "}
                      <span className="font-bold text-zinc-300">
                        {savedSettings.updatedBy}
                      </span>
                    </p>
                  )}
                </article>
              </div>
            </section>

            {canManage && (
              <div className="sticky bottom-5 z-20 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/10 bg-[#101010]/95 p-5 shadow-2xl backdrop-blur-2xl">
                <p className="text-sm text-zinc-500">
                  {hasChanges
                    ? "توجد تغييرات لم يتم حفظها."
                    : "جميع التغييرات محفوظة."}
                </p>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={resetChanges}
                    disabled={
                      !hasChanges || saving
                    }
                    className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-bold text-zinc-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    تراجع
                  </button>

                  <button
                    type="button"
                    onClick={saveSettings}
                    disabled={
                      !hasChanges || saving
                    }
                    className="flex items-center gap-2 rounded-2xl bg-yellow-500 px-6 py-3 font-black text-black transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {saving ? (
                      <Loader2
                        size={20}
                        className="animate-spin"
                      />
                    ) : (
                      <Save size={20} />
                    )}

                    {saving
                      ? "جارٍ الحفظ..."
                      : "حفظ الإعدادات"}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </PermissionGuard>
  );
}