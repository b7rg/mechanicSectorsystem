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

import RoleGuard from "@/components/auth/RoleGuard";
import { addActivity } from "@/lib/activity";
import {
  ADMINISTRATION_ROLES,
  getAdministrationRoleByTitle,
  type AdministrationTitle,
} from "@/lib/administration";
import {
  formatEmployeeCode,
  getCodesForLevel,
  getLevelsForEmployeeType,
  getPrefixForEmployeeType,
  parseEmployeeCode,
  type EmployeeType,
  type LevelNumber,
} from "@/lib/employeeCodes";
import { db } from "@/lib/firebase";

const DEFAULT_ADMINISTRATION_TITLE: AdministrationTitle =
  "دعم ومساعدة";

function isCertifiedEmployeeType(
  employeeType: EmployeeType
) {
  return (
    employeeType === "certified" ||
    employeeType === "certified_leader"
  );
}

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
  const [
    administrationTitle,
    setAdministrationTitle,
  ] =
    useState<AdministrationTitle>(
      DEFAULT_ADMINISTRATION_TITLE
    );
  const [level, setLevel] =
    useState<LevelNumber>(1);
  const [fullCode, setFullCode] =
    useState("");
  const [mainSector, setMainSector] =
    useState("");
  const [usedCodes, setUsedCodes] =
    useState<string[]>([]);

  const administrationRole = useMemo(
    () =>
      getAdministrationRoleByTitle(
        administrationTitle
      ),
    [administrationTitle]
  );

  const availableLevels = useMemo(
    () =>
      getLevelsForEmployeeType(
        employeeType
      ),
    [employeeType]
  );

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

  useEffect(() => {
    if (
      employeeType === "administration"
    ) {
      setLevel(
        administrationRole.level
      );
      setMainSector("");
      return;
    }

    const levels =
      getLevelsForEmployeeType(
        employeeType
      );

    setLevel((currentLevel) =>
      levels.includes(currentLevel)
        ? currentLevel
        : levels[0]
    );

    if (
      !isCertifiedEmployeeType(
        employeeType
      )
    ) {
      setMainSector("");
    }
  }, [
    administrationRole.level,
    employeeType,
  ]);

  const availableCodes = useMemo(() => {
    const levelCodes =
      getCodesForLevel(
        employeeType,
        level,
        employeeType === "administration"
          ? administrationTitle
          : undefined
      );

    const unusedCodes =
      levelCodes.filter(
        (code) =>
          !usedCodes.includes(
            code.toUpperCase()
          )
      );

    if (
      employeeType !==
      "administration"
    ) {
      return unusedCodes;
    }

    /*
      أكواد الإدارة تبدأ من 001 وتصعد.
      رموز M مشتركة بين مشرف متدرب ومشرف ومشرف+.
    */
    return [...unusedCodes].sort(
      (firstCode, secondCode) =>
        parseEmployeeCode(
          firstCode
        ).codeNumber -
        parseEmployeeCode(
          secondCode
        ).codeNumber
    );
  }, [
    administrationTitle,
    employeeType,
    level,
    usedCodes,
  ]);

  useEffect(() => {
    setFullCode(
      availableCodes[0] ?? ""
    );
  }, [availableCodes]);

  function changeEmployeeType(
    nextType: EmployeeType
  ) {
    setEmployeeType(nextType);

    if (
      nextType === "administration"
    ) {
      setAdministrationTitle(
        DEFAULT_ADMINISTRATION_TITLE
      );
      setLevel(2);
      setMainSector("");
      return;
    }

    const nextLevels =
      getLevelsForEmployeeType(
        nextType
      );

    setLevel(nextLevels[0]);

    if (
      !isCertifiedEmployeeType(
        nextType
      )
    ) {
      setMainSector("");
    }
  }

  async function saveEmployee() {
    const cleanName = name.trim();
    const cleanDiscordId =
      discordId.trim();
    const cleanMainSector =
      mainSector.trim();

    if (!cleanName) {
      alert("اكتب اسم الموظف.");
      return;
    }

    if (!cleanDiscordId) {
      alert("اكتب Discord ID.");
      return;
    }

    if (
      isCertifiedEmployeeType(
        employeeType
      ) &&
      !cleanMainSector
    ) {
      alert(
        "اكتب القطاع الأساسي للاعب المعتمد."
      );
      return;
    }

    if (!fullCode) {
      alert(
        "لا يوجد كود متاح لهذا المستوى."
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
      const finalLevel =
        employeeType ===
        "administration"
          ? administrationRole.level
          : level;

      const prefix =
        getPrefixForEmployeeType(
          employeeType,
          employeeType ===
            "administration"
            ? administrationTitle
            : undefined
        );

      const parsedCode =
        parseEmployeeCode(fullCode);

      const normalizedCode =
        formatEmployeeCode(
          prefix,
          parsedCode.codeNumber
        );

      const isCertified =
        isCertifiedEmployeeType(
          employeeType
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
          level: finalLevel,
          mainSector: isCertified
            ? cleanMainSector
            : "",
          certified: isCertified,
          certifiedLeader:
            employeeType ===
            "certified_leader",
          isLeader:
            employeeType ===
            "leader",
          status: "active",

          ...(employeeType ===
          "administration"
            ? {
                administrationTitle,
              }
            : {}),

          reports:
            employeeType ===
            "administration"
              ? {}
              : {
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
        className="mx-auto max-w-2xl p-4 md:p-8"
      >
        <h1 className="mb-8 text-4xl font-black text-yellow-400">
          إضافة موظف
        </h1>

        <div className="space-y-5 rounded-3xl border border-white/10 bg-[#141414] p-5 md:p-8">
          <label className="block">
            <span className="mb-2 block font-bold text-zinc-300">
              اسم الموظف
            </span>

            <input
              className="w-full rounded-xl border border-white/10 bg-zinc-900 p-4 text-white outline-none focus:border-yellow-500"
              placeholder="اكتب اسم الموظف"
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
              placeholder="اكتب Discord ID"
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
                changeEmployeeType(
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
                مسؤولو المعتمد — CA
              </option>

              <option value="administration">
                الإدارة والإدارة العليا — S / M / F / A / A+
              </option>
            </select>
          </label>

          {employeeType ===
            "administration" && (
            <>
              <label className="block">
                <span className="mb-2 block font-bold text-zinc-300">
                  المسمى الإداري
                </span>

                <select
                  value={
                    administrationTitle
                  }
                  onChange={(event) =>
                    setAdministrationTitle(
                      event.target
                        .value as AdministrationTitle
                    )
                  }
                  className="w-full cursor-pointer rounded-xl border border-white/10 bg-zinc-900 p-4 text-white outline-none focus:border-yellow-500"
                >
                  {ADMINISTRATION_ROLES.map(
                    (role) => (
                      <option
                        key={role.title}
                        value={role.title}
                      >
                        {role.title} — المستوى{" "}
                        {role.level} —{" "}
                        {role.prefix}
                      </option>
                    )
                  )}
                </select>
              </label>

              <div className="grid gap-3 rounded-2xl border border-yellow-500/15 bg-yellow-500/[0.06] p-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-bold text-zinc-500">
                    المستوى المعتمد
                  </p>

                  <p className="mt-1 font-black text-yellow-400">
                    المستوى{" "}
                    {
                      administrationRole.level
                    }
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold text-zinc-500">
                    بادئة الكود
                  </p>

                  <p
                    dir="ltr"
                    className="mt-1 text-right font-mono font-black text-yellow-400"
                  >
                    {
                      administrationRole.prefix
                    }
                  </p>
                </div>
              </div>
            </>
          )}

          {employeeType !==
            "administration" && (
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
                {availableLevels.map(
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
          )}

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
                  لا يوجد كود متاح
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

          {isCertifiedEmployeeType(
            employeeType
          ) && (
            <label className="block">
              <span className="mb-2 block font-bold text-zinc-300">
                القطاع الأساسي
              </span>

              <input
                className="w-full rounded-xl border border-white/10 bg-zinc-900 p-4 text-white outline-none focus:border-yellow-500"
                placeholder="مثال: الأمن العام أو الهلال الأحمر"
                value={mainSector}
                onChange={(event) =>
                  setMainSector(
                    event.target.value
                  )
                }
              />
            </label>
          )}

          {employeeType ===
            "administration" && (
            <p className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-7 text-zinc-400">
              موظف الإدارة يُعيّن مباشرة
              حسب المسمى، ولا يحتاج إلى
              تقارير أو دورات أو شروط
              ترقية.
            </p>
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
