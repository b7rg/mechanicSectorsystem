"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { auth } from "@/lib/firebase";
import RoleGuard from "@/components/auth/RoleGuard";

type AccountRole =
  | "owner"
  | "leader"
  | "supervisor"
  | "visitor";

type Account = {
  uid: string;
  email: string;
  displayName: string;
  role: AccountRole;
  roleLabel: string;
  disabled: boolean;
  lastSignInAt: string | null;
  createdAt: string | null;
};

function getRoleStyle(
  role: AccountRole
) {
  if (role === "owner") {
    return "border-yellow-500/25 bg-yellow-500/10 text-yellow-400";
  }

  if (role === "leader") {
    return "border-purple-500/25 bg-purple-500/10 text-purple-400";
  }

  if (role === "supervisor") {
    return "border-blue-500/25 bg-blue-500/10 text-blue-400";
  }

  return "border-zinc-500/25 bg-zinc-500/10 text-zinc-400";
}

function formatDate(
  value: string | null
) {
  if (!value) {
    return "غير محدد";
  }

  const date = new Date(value);

  if (
    Number.isNaN(date.getTime())
  ) {
    return "غير محدد";
  }

  return new Intl.DateTimeFormat(
    "ar-SA",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  ).format(date);
}

export default function AccountPasswordsPage() {
  const [
    currentUser,
    setCurrentUser,
  ] = useState<User | null>(null);

  const [
    accounts,
    setAccounts,
  ] = useState<Account[]>([]);

  const [
    selectedUid,
    setSelectedUid,
  ] = useState("");

  const [search, setSearch] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        (user) => {
          setCurrentUser(user);

          if (!user) {
            setLoading(false);
            setErrorMessage(
              "يجب تسجيل الدخول."
            );
            return;
          }

          void loadAccounts(user);
        }
      );

    return () => unsubscribe();
  }, []);

  async function getToken(
    user = currentUser
  ) {
    if (!user) {
      throw new Error(
        "يجب تسجيل الدخول."
      );
    }

    return user.getIdToken();
  }

  async function loadAccounts(
    user = currentUser
  ) {
    try {
      setLoading(true);
      setErrorMessage("");
      setMessage("");

      const token =
        await getToken(user);

      const response = await fetch(
        "/api/admin/accounts",
        {
          method: "GET",
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ??
            "تعذر تحميل الحسابات."
        );
      }

      const nextAccounts =
        Array.isArray(data.accounts)
          ? data.accounts
          : [];

      setAccounts(nextAccounts);

      setSelectedUid(
        (current) =>
          current &&
          nextAccounts.some(
            (account: Account) =>
              account.uid === current
          )
            ? current
            : nextAccounts[0]?.uid ??
              ""
      );
    } catch (error) {
      console.error(
        "تعذر تحميل الحسابات:",
        error
      );

      setAccounts([]);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "تعذر تحميل الحسابات."
      );
    } finally {
      setLoading(false);
    }
  }

  const filteredAccounts =
    useMemo(() => {
      const cleanSearch =
        search
          .trim()
          .toLowerCase();

      if (!cleanSearch) {
        return accounts;
      }

      return accounts.filter(
        (account) =>
          account.displayName
            .toLowerCase()
            .includes(cleanSearch) ||
          account.email
            .toLowerCase()
            .includes(cleanSearch) ||
          account.roleLabel
            .toLowerCase()
            .includes(cleanSearch)
      );
    }, [accounts, search]);

  const selectedAccount =
    accounts.find(
      (account) =>
        account.uid === selectedUid
    ) ?? null;

  async function changePassword() {
    setMessage("");
    setErrorMessage("");

    if (!selectedAccount) {
      setErrorMessage(
        "اختر الحساب المطلوب."
      );
      return;
    }

    if (password.length < 8) {
      setErrorMessage(
        "كلمة المرور يجب ألا تقل عن 8 خانات."
      );
      return;
    }

    if (
      !/[A-Za-z]/.test(password) ||
      !/\d/.test(password)
    ) {
      setErrorMessage(
        "كلمة المرور يجب أن تحتوي على حرف ورقم على الأقل."
      );
      return;
    }

    if (
      password !== confirmPassword
    ) {
      setErrorMessage(
        "تأكيد كلمة المرور غير مطابق."
      );
      return;
    }

    const confirmed =
      window.confirm(
        `سيتم تغيير كلمة مرور حساب "${selectedAccount.email}". هل تريد المتابعة؟`
      );

    if (!confirmed) {
      return;
    }

    try {
      setSaving(true);

      const token =
        await getToken();

      const response = await fetch(
        "/api/admin/accounts",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Authorization:
              `Bearer ${token}`,
          },
          body: JSON.stringify({
            uid:
              selectedAccount.uid,
            password,
          }),
        }
      );

      const data = await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ??
            "تعذر تغيير كلمة المرور."
        );
      }

      setPassword("");
      setConfirmPassword("");
      setShowPassword(false);
      setMessage(
        data.message ??
          "تم تغيير كلمة المرور."
      );
    } catch (error) {
      console.error(
        "تعذر تغيير كلمة المرور:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "تعذر تغيير كلمة المرور."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <RoleGuard allow={["owner"]}>
      <main
        dir="rtl"
        className="space-y-8"
      >
        <header className="flex flex-wrap items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-yellow-500/20 bg-yellow-500/10">
              <KeyRound
                size={31}
                className="text-yellow-400"
              />
            </div>

            <div>
              <h1 className="text-3xl font-black text-yellow-400 md:text-4xl">
                إدارة كلمات المرور
              </h1>

              <p className="mt-2 text-zinc-400">
                تغيير كلمة مرور حسابات
                الدخول الوهمية. لا يمكن
                عرض كلمة المرور القديمة.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              void loadAccounts()
            }
            disabled={
              loading || !currentUser
            }
            className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-black text-zinc-300 transition hover:border-yellow-500/30 hover:text-yellow-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={19}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />
            تحديث الحسابات
          </button>
        </header>

        <div className="flex items-start gap-3 rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-5 text-sm leading-7 text-zinc-300">
          <ShieldCheck
            size={22}
            className="mt-1 shrink-0 text-yellow-400"
          />

          <p>
            هذه الصفحة متاحة للمالك فقط.
            بعد تغيير كلمة المرور تُلغى
            صلاحية الجلسات القديمة عند
            تحديثها، ويجب تسجيل الدخول
            بكلمة المرور الجديدة.
          </p>
        </div>

        {message && (
          <div className="flex items-center gap-3 rounded-2xl border border-green-500/20 bg-green-500/10 px-5 py-4 font-bold text-green-400">
            <CheckCircle2 size={21} />
            {message}
          </div>
        )}

        {errorMessage && (
          <div className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 font-bold text-red-400">
            <AlertTriangle size={21} />
            {errorMessage}
          </div>
        )}

        <section className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_430px]">
          <div className="rounded-[30px] border border-white/10 bg-[#141414] p-5 md:p-7">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-white">
                  حسابات الدخول
                </h2>

                <p className="mt-2 text-sm text-zinc-500">
                  اختر الحساب المراد
                  تغيير كلمة مروره.
                </p>
              </div>

              <span className="rounded-full border border-yellow-500/20 bg-yellow-500/10 px-4 py-2 text-sm font-black text-yellow-400">
                {accounts.length} حساب
              </span>
            </div>

            <label className="relative mt-6 block">
              <Search
                size={19}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="ابحث بالاسم أو الإيميل أو الصلاحية"
                className="w-full rounded-2xl border border-white/10 bg-zinc-900 py-4 pl-4 pr-12 text-white outline-none transition focus:border-yellow-500"
              />
            </label>

            {loading ? (
              <div className="flex min-h-72 items-center justify-center gap-3 text-zinc-400">
                <Loader2
                  size={24}
                  className="animate-spin text-yellow-400"
                />
                جارٍ تحميل الحسابات...
              </div>
            ) : filteredAccounts.length ===
              0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-white/10 p-10 text-center text-zinc-500">
                لا توجد حسابات مطابقة.
              </div>
            ) : (
              <div className="mt-6 grid gap-3 md:grid-cols-2">
                {filteredAccounts.map(
                  (account) => {
                    const selected =
                      selectedUid ===
                      account.uid;

                    return (
                      <button
                        key={
                          account.uid
                        }
                        type="button"
                        onClick={() => {
                          setSelectedUid(
                            account.uid
                          );
                          setPassword("");
                          setConfirmPassword(
                            ""
                          );
                          setMessage("");
                          setErrorMessage(
                            ""
                          );
                        }}
                        className={`rounded-2xl border p-5 text-right transition ${
                          selected
                            ? "border-yellow-500/40 bg-yellow-500/[0.07]"
                            : "border-white/10 bg-black/20 hover:border-white/20"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/5 text-zinc-400">
                              <UserRound
                                size={
                                  21
                                }
                              />
                            </div>

                            <div className="min-w-0">
                              <h3 className="truncate font-black text-white">
                                {
                                  account.displayName
                                }
                              </h3>

                              <p className="mt-1 truncate text-sm text-zinc-500">
                                {account.email ||
                                  "دون إيميل"}
                              </p>
                            </div>
                          </div>

                          <span
                            className={`shrink-0 rounded-full border px-3 py-1 text-xs font-black ${getRoleStyle(
                              account.role
                            )}`}
                          >
                            {
                              account.roleLabel
                            }
                          </span>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2 text-xs text-zinc-500">
                          <span>
                            آخر دخول:{" "}
                            {formatDate(
                              account.lastSignInAt
                            )}
                          </span>

                          {account.disabled && (
                            <span className="rounded-full bg-red-500/10 px-2 py-1 font-bold text-red-400">
                              معطل
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  }
                )}
              </div>
            )}
          </div>

          <aside className="rounded-[30px] border border-yellow-500/20 bg-[#141414] p-5 md:p-7 xl:sticky xl:top-6">
            <h2 className="text-2xl font-black text-white">
              كلمة المرور الجديدة
            </h2>

            {selectedAccount ? (
              <>
                <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-sm text-zinc-500">
                    الحساب المحدد
                  </p>

                  <p className="mt-2 break-all font-black text-yellow-400">
                    {
                      selectedAccount.email
                    }
                  </p>

                  <p className="mt-1 text-sm text-zinc-400">
                    {
                      selectedAccount.displayName
                    }{" "}
                    —{" "}
                    {
                      selectedAccount.roleLabel
                    }
                  </p>
                </div>

                <label className="mt-6 block">
                  <span className="mb-2 block font-bold text-zinc-300">
                    كلمة المرور
                  </span>

                  <div className="relative">
                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={password}
                      onChange={(
                        event
                      ) =>
                        setPassword(
                          event.target
                            .value
                        )
                      }
                      autoComplete="new-password"
                      placeholder="8 خانات على الأقل"
                      className="w-full rounded-2xl border border-white/10 bg-zinc-900 p-4 pl-12 text-white outline-none transition focus:border-yellow-500"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (current) =>
                            !current
                        )
                      }
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 transition hover:text-yellow-400"
                      aria-label={
                        showPassword
                          ? "إخفاء كلمة المرور"
                          : "إظهار كلمة المرور"
                      }
                    >
                      {showPassword ? (
                        <EyeOff
                          size={20}
                        />
                      ) : (
                        <Eye
                          size={20}
                        />
                      )}
                    </button>
                  </div>
                </label>

                <label className="mt-5 block">
                  <span className="mb-2 block font-bold text-zinc-300">
                    تأكيد كلمة المرور
                  </span>

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={
                      confirmPassword
                    }
                    onChange={(event) =>
                      setConfirmPassword(
                        event.target.value
                      )
                    }
                    autoComplete="new-password"
                    placeholder="اكتب كلمة المرور مرة أخرى"
                    className="w-full rounded-2xl border border-white/10 bg-zinc-900 p-4 text-white outline-none transition focus:border-yellow-500"
                  />
                </label>

                <div className="mt-5 space-y-2 text-sm leading-6 text-zinc-500">
                  <p>
                    • 8 خانات على الأقل.
                  </p>
                  <p>
                    • تحتوي على حرف ورقم.
                  </p>
                  <p>
                    • لا تستخدم كلمة مرور
                    مشتركة بين الحسابات.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    changePassword
                  }
                  disabled={
                    saving ||
                    selectedAccount.disabled
                  }
                  className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-yellow-500 px-6 py-4 font-black text-black transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2
                      size={20}
                      className="animate-spin"
                    />
                  ) : (
                    <KeyRound
                      size={20}
                    />
                  )}

                  {saving
                    ? "جارٍ التغيير..."
                    : "تغيير كلمة المرور"}
                </button>
              </>
            ) : (
              <div className="mt-6 rounded-2xl border border-dashed border-white/10 p-8 text-center text-zinc-500">
                اختر حسابًا من القائمة.
              </div>
            )}
          </aside>
        </section>
      </main>
    </RoleGuard>
  );
}