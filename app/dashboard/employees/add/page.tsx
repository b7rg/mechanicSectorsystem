"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  addDoc,
  collection,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import { addActivity } from "@/lib/activity";
import RoleGuard from "@/components/auth/RoleGuard";

import {
  LEVEL_NUMBERS,
  formatEmployeeCode,
  getCodesForLevel,
  getPrefixForEmployeeType,
  parseEmployeeCode,
  type EmployeeType,
  type LevelNumber,
} from "@/lib/employeeCodes";

export default function AddEmployeePage() {
  const router = useRouter();

  const [loading, setLoading] =
    useState(false);

  const [name, setName] =
    useState("");

  const [discordId, setDiscordId] =
    useState("");

  const [employeeType, setEmployeeType] =
    useState<EmployeeType>("main");

  const [level, setLevel] =
    useState<LevelNumber>(1);

  const [fullCode, setFullCode] =
    useState("");

  const [mainSector, setMainSector] =
    useState("");

  const [usedCodes, setUsedCodes] =
    useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "employees"),
      (snapshot) => {
        const codes = snapshot.docs
          .map((employeeDocument) => {
            const data =
              employeeDocument.data();

            return String(
              data.fullCode ??
                data.rank ??
                ""
            ).toUpperCase();
          })
          .filter(Boolean);

        setUsedCodes(codes);
      },
      (error) => {
        console.error(
          "تعذر تحميل الأكواد المستخدمة:",
          error
        );
      }
    );

    return () => unsubscribe();
  }, []);

  const availableCodes = useMemo(() => {
    const levelCodes =
      getCodesForLevel(
        employeeType,
        level
      );

    return levelCodes.filter(
      (code) =>
        !usedCodes.includes(
          code.toUpperCase()
        )
    );
  }, [
    employeeType,
    level,
    usedCodes,
  ]);

  useEffect(() => {
    setFullCode(
      availableCodes[0] ?? ""
    );
  }, [availableCodes]);

  async function saveEmployee() {
    const cleanName = name.trim();

    const cleanDiscordId =
      discordId.trim();

    const cleanMainSector =
      mainSector.trim();

    if (!cleanName) {
      alert("اكتبي اسم الموظف.");
      return;
    }

    if (!cleanDiscordId) {
      alert("اكتبي Discord ID.");
      return;
    }

    if (
      employeeType !== "main" &&
      !cleanMainSector
    ) {
      alert(
        "اكتبي القطاع الأساسي للاعب المعتمد."
      );

      return;
    }

    if (!fullCode) {
      alert(
        "هذا المستوى مكتمل ولا يوجد كود متاح."
      );

      return;
    }

    if (
      usedCodes.includes(
        fullCode.toUpperCase()
      )
    ) {
      alert(
        "هذا الكود مستخدم بالفعل."
      );

      return;
    }

    setLoading(true);

    try {
      const prefix =
        getPrefixForEmployeeType(
          employeeType
        );

      const parsedCode =
        parseEmployeeCode(fullCode);

      const normalizedCode =
        formatEmployeeCode(
          prefix,
          parsedCode.codeNumber
        );

      await addDoc(
        collection(db, "employees"),
        {
          name: cleanName,

          discordId:
            cleanDiscordId,

          employeeType,

          codePrefix: prefix,

          codeNumber:
            parsedCode.codeNumber,

          fullCode:
            normalizedCode,

          rank: normalizedCode,

          level,

          mainSector:
            employeeType === "main"
              ? ""
              : cleanMainSector,

          certified:
            employeeType !== "main",

          certifiedLeader:
            employeeType ===
            "certified_leader",

          status: "active",

          reports: {
            fieldGuide: 0,
            fieldSupervisor: 0,
            generalSupervisor: 0,
            recruitment: 0,
          },

          courses: [],

          warnings: 0,

          notes: "",

          hiredAt:
            serverTimestamp(),

          createdAt:
            serverTimestamp(),

          updatedAt:
            serverTimestamp(),
        }
      );

      try {
        await addActivity(
          `أضاف الموظف ${cleanName} بالكود ${normalizedCode}`
        );
      } catch (activityError) {
        console.error(
          "تعذر تسجيل النشاط:",
          activityError
        );
      }

      router.push(
        "/dashboard/employees"
      );
    } catch (error) {
      console.error(error);

      alert(
        "حدث خطأ أثناء حفظ الموظف."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <RoleGuard
      allow={["owner", "leader"]}
    >
      <main
        dir="rtl"
        className="mx-auto max-w-2xl p-8"
      >
        <h1 className="mb-8 text-4xl font-black text-yellow-400">
          إضافة موظف
        </h1>

        <div className="space-y-5 rounded-3xl border border-white/10 bg-[#141414] p-8">
          <label className="block">
            <span className="mb-2 block font-bold text-zinc-300">
              اسم الموظف
            </span>

            <input
              className="w-full rounded-xl border border-white/10 bg-zinc-900 p-4 text-white outline-none focus:border-yellow-500"
              placeholder="اسم الموظف"
              value={name}
              onChange={(event) =>
                setName(
                  event.target.value
                )
              }
            />
          </label>

          <label className="block">
            <span className="mb-2 block font-bold text-zinc-300">
              Discord ID
            </span>

            <input
              className="w-full rounded-xl border border-white/10 bg-zinc-900 p-4 text-white outline-none focus:border-yellow-500"
              placeholder="Discord ID"
              value={discordId}
              onChange={(event) =>
                setDiscordId(
                  event.target.value
                )
              }
              dir="ltr"
            />
          </label>

          <label className="block">
            <span className="mb-2 block font-bold text-zinc-300">
              نوع الموظف
            </span>

            <select
              value={employeeType}
              onChange={(event) =>
                setEmployeeType(
                  event.target
                    .value as EmployeeType
                )
              }
              className="w-full cursor-pointer rounded-xl border border-white/10 bg-zinc-900 p-4 text-white outline-none focus:border-yellow-500"
            >
              <option value="main">
                موظف أساسي — G
              </option>

              <option value="certified">
                لاعب معتمد — C
              </option>

              <option value="certified_leader">
                قيادة معتمدة — CA
              </option>
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block font-bold text-zinc-300">
              المستوى
            </span>

            <select
              value={level}
              onChange={(event) =>
                setLevel(
                  Number(
                    event.target.value
                  ) as LevelNumber
                )
              }
              className="w-full cursor-pointer rounded-xl border border-white/10 bg-zinc-900 p-4 text-white outline-none focus:border-yellow-500"
            >
              {LEVEL_NUMBERS.map(
                (levelNumber) => (
                  <option
                    key={levelNumber}
                    value={levelNumber}
                  >
                    المستوى{" "}
                    {levelNumber}
                  </option>
                )
              )}
            </select>
          </label>

          <label className="block">
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="font-bold text-zinc-300">
                الكود
              </span>

              <span
                className={`text-sm font-bold ${
                  availableCodes.length >
                  0
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                المتبقي:{" "}
                {
                  availableCodes.length
                }
              </span>
            </div>

            <select
              value={fullCode}
              disabled={
                availableCodes.length ===
                0
              }
              onChange={(event) =>
                setFullCode(
                  event.target.value
                )
              }
              dir="ltr"
              className="w-full cursor-pointer rounded-xl border border-white/10 bg-zinc-900 p-4 text-left font-mono font-black text-yellow-400 outline-none focus:border-yellow-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {availableCodes.length ===
              0 ? (
                <option value="">
                  المستوى مكتمل
                </option>
              ) : (
                availableCodes.map(
                  (code) => (
                    <option
                      key={code}
                      value={code}
                    >
                      {code}
                    </option>
                  )
                )
              )}
            </select>
          </label>

          {employeeType !== "main" && (
            <label className="block">
              <span className="mb-2 block font-bold text-zinc-300">
                القطاع الأساسي
              </span>

              <input
                className="w-full rounded-xl border border-white/10 bg-zinc-900 p-4 text-white outline-none focus:border-yellow-500"
                placeholder="مثال: الشرطة أو الهلال الأحمر"
                value={mainSector}
                onChange={(event) =>
                  setMainSector(
                    event.target.value
                  )
                }
              />
            </label>
          )}

          <button
            type="button"
            onClick={saveEmployee}
            disabled={
              loading ||
              availableCodes.length ===
                0
            }
            className="w-full rounded-xl bg-yellow-500 p-4 font-black text-black transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "جارٍ الحفظ..."
              : "حفظ الموظف"}
          </button>
        </div>
      </main>
    </RoleGuard>
  );
}