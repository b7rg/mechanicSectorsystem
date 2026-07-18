"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import {
  Loader2,
  Save,
} from "lucide-react";

import { db } from "@/lib/firebase";
import { courses } from "@/lib/courses";
import { addActivity } from "@/lib/activity";

import RoleGuard from "@/components/auth/RoleGuard";

import {
  LEADER_LEVEL_NUMBERS,
  LEVEL_NUMBERS,
  MAIN_LEVEL_NUMBERS,
  formatEmployeeCode,
  getCodesForLevel,
  getPrefixForEmployeeType,
  normalizeEmployeeDocument,
  parseEmployeeCode,
  type EmployeeType,
  type LevelNumber,
} from "@/lib/employeeCodes";

type UsedEmployeeCode = {
  id: string;
  fullCode: string;
};

type EmployeeCategory = EmployeeType;

type EditEmployeeForm = {
  name: string;
  discordId: string;
  employeeType: EmployeeCategory;
  level: LevelNumber;
  fullCode: string;
  mainSector: string;
  employeeCourses: string[];
};

const emptyForm: EditEmployeeForm = {
  name: "",
  discordId: "",
  employeeType: "main",
  level: 1,
  fullCode: "",
  mainSector: "",
  employeeCourses: [],
};

function getStoredEmployeeType(
  employeeType: EmployeeCategory
): EmployeeType {
  return employeeType;
}

function getAllowedLevels(
  employeeType: EmployeeCategory
): LevelNumber[] {
  if (employeeType === "main") {
    return MAIN_LEVEL_NUMBERS;
  }

  if (employeeType === "leader") {
    return LEADER_LEVEL_NUMBERS;
  }

  return LEVEL_NUMBERS;
}

export default function EditEmployeePage() {
  const params = useParams<{
    id: string | string[];
  }>();

  const router = useRouter();

  const employeeId = Array.isArray(
    params.id
  )
    ? params.id[0]
    : params.id;

  const [form, setForm] =
    useState<EditEmployeeForm>(
      emptyForm
    );

  const [
    employeeCodes,
    setEmployeeCodes,
  ] = useState<UsedEmployeeCode[]>(
    []
  );

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "employees"),
      (snapshot) => {
        const nextCodes =
          snapshot.docs.map(
            (employeeDocument) => {
              const data =
                employeeDocument.data();

              return {
                id: employeeDocument.id,

                fullCode: String(
                  data.fullCode ??
                    data.rank ??
                    ""
                ).toUpperCase(),
              };
            }
          );

        setEmployeeCodes(nextCodes);
      },
      (error) => {
        console.error(
          "تعذر تحميل الأكواد:",
          error
        );
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    async function loadEmployee() {
      if (!employeeId) {
        setErrorMessage(
          "رابط الموظف غير صحيح."
        );

        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setErrorMessage("");

        const employeeReference =
          doc(
            db,
            "employees",
            employeeId
          );

        const snapshot =
          await getDoc(
            employeeReference
          );

        if (!snapshot.exists()) {
          setErrorMessage(
            "الموظف غير موجود."
          );

          setLoading(false);
          return;
        }

        const data = snapshot.data();

        const employee =
          normalizeEmployeeDocument(
            snapshot.id,
            data
          );

        const savedCourses =
          Array.isArray(data.courses)
            ? data.courses.filter(
                (
                  course
                ): course is string =>
                  typeof course ===
                  "string"
              )
            : [];

        setForm({
          name: employee.name,

          discordId:
            employee.discordId,

          employeeType:
            employee.employeeType,

          level: employee.level,

          fullCode:
            employee.fullCode,

          mainSector:
            employee.mainSector,

          employeeCourses:
            savedCourses,
        });
      } catch (error) {
        console.error(
          "تعذر تحميل بيانات الموظف:",
          error
        );

        setErrorMessage(
          "حدث خطأ أثناء تحميل بيانات الموظف."
        );
      } finally {
        setLoading(false);
      }
    }

    loadEmployee();
  }, [employeeId]);

  const usedCodes = useMemo(() => {
    return new Set(
      employeeCodes
        .filter(
          (employee) =>
            employee.id !== employeeId
        )
        .map((employee) =>
          employee.fullCode.toUpperCase()
        )
        .filter(Boolean)
    );
  }, [
    employeeCodes,
    employeeId,
  ]);

  const storedEmployeeType =
    getStoredEmployeeType(
      form.employeeType
    );

  const allowedLevels =
    getAllowedLevels(
      form.employeeType
    );

  const availableCodes =
    useMemo(() => {
      const levelCodes =
        getCodesForLevel(
          storedEmployeeType,
          form.level
        );

      return levelCodes.filter(
        (code) =>
          !usedCodes.has(
            code.toUpperCase()
          )
      );
    }, [
      storedEmployeeType,
      form.level,
      usedCodes,
    ]);

  useEffect(() => {
    if (loading) {
      return;
    }

    setForm((current) => {
      if (
        availableCodes.includes(
          current.fullCode
        )
      ) {
        return current;
      }

      return {
        ...current,
        fullCode:
          availableCodes[0] ?? "",
      };
    });
  }, [
    availableCodes,
    loading,
  ]);

  function updateForm<
    Key extends keyof EditEmployeeForm,
  >(
    key: Key,
    value: EditEmployeeForm[Key]
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));

    setErrorMessage("");
  }

  function updateEmployeeType(
    employeeType: EmployeeCategory
  ) {
    const nextLevels =
      getAllowedLevels(employeeType);

    setForm((current) => {
      const nextLevel =
        nextLevels.includes(current.level)
          ? current.level
          : nextLevels[0];

      return {
        ...current,
        employeeType,
        level: nextLevel,
        fullCode: "",
        mainSector:
          employeeType === "main" ||
          employeeType === "leader"
            ? ""
            : current.mainSector,
      };
    });

    setErrorMessage("");
  }

  function toggleCourse(
    courseName: string,
    checked: boolean
  ) {
    setForm((current) => {
      if (checked) {
        const alreadyExists =
          current.employeeCourses.includes(
            courseName
          );

        if (alreadyExists) {
          return current;
        }

        return {
          ...current,

          employeeCourses: [
            ...current.employeeCourses,
            courseName,
          ],
        };
      }

      return {
        ...current,

        employeeCourses:
          current.employeeCourses.filter(
            (course) =>
              course !== courseName
          ),
      };
    });
  }

  async function save() {
    if (
      !employeeId ||
      saving
    ) {
      return;
    }

    const cleanName =
      form.name.trim();

    const cleanDiscordId =
      form.discordId.trim();

    const cleanMainSector =
      form.mainSector.trim();

    if (!cleanName) {
      setErrorMessage(
        "اكتبي اسم الموظف."
      );

      return;
    }

    if (!cleanDiscordId) {
      setErrorMessage(
        "اكتبي Discord ID."
      );

      return;
    }

    const requiresMainSector =
      form.employeeType ===
        "certified" ||
      form.employeeType ===
        "certified_leader";

    if (
      requiresMainSector &&
      !cleanMainSector
    ) {
      setErrorMessage(
        "اكتبي القطاع الأساسي للاعب المعتمد."
      );

      return;
    }

    if (!form.fullCode) {
      setErrorMessage(
        "هذا المستوى مكتمل ولا يوجد كود متاح."
      );

      return;
    }

    const codeUsedByAnotherEmployee =
      usedCodes.has(
        form.fullCode.toUpperCase()
      );

    if (
      codeUsedByAnotherEmployee
    ) {
      setErrorMessage(
        "هذا الكود مستخدم من موظف آخر."
      );

      return;
    }

    try {
      setSaving(true);
      setErrorMessage("");

      const employeeType =
        getStoredEmployeeType(
          form.employeeType
        );

      const prefix =
        getPrefixForEmployeeType(
          employeeType
        );

      const parsedCode =
        parseEmployeeCode(
          form.fullCode
        );

      const normalizedCode =
        formatEmployeeCode(
          prefix,
          parsedCode.codeNumber
        );

      await updateDoc(
        doc(
          db,
          "employees",
          employeeId
        ),
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

          level: form.level,

          mainSector:
            employeeType === "main" ||
            employeeType === "leader"
              ? ""
              : cleanMainSector,

          certified:
            employeeType === "certified" ||
            employeeType === "certified_leader",

          certifiedLeader:
            employeeType ===
            "certified_leader",

          isLeader:
            employeeType === "leader",

          courses:
            form.employeeCourses,

          updatedAt:
            serverTimestamp(),
        }
      );

      try {
        await addActivity(
          `عدّل بيانات الموظف ${cleanName} إلى ${normalizedCode}`
        );
      } catch (activityError) {
        console.error(
          "تم التعديل لكن تعذر تسجيل النشاط:",
          activityError
        );
      }

      router.replace(
        `/dashboard/employees/${employeeId}`
      );

      router.refresh();
    } catch (error) {
      console.error(
        "تعذر حفظ تعديلات الموظف:",
        error
      );

      setErrorMessage(
        "حدث خطأ أثناء حفظ التعديلات."
      );

      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[450px] items-center justify-center">
        <div className="text-center">
          <Loader2
            size={40}
            className="mx-auto animate-spin text-yellow-400"
          />

          <p className="mt-4 text-zinc-400">
            جارٍ تحميل بيانات
            الموظف...
          </p>
        </div>
      </div>
    );
  }

  if (
    errorMessage &&
    !form.name &&
    !form.discordId
  ) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-red-500/20 bg-red-500/10 p-10 text-center text-red-400">
        {errorMessage}
      </div>
    );
  }

  return (
    <RoleGuard
      allow={[
        "owner",
        "leader",
        "supervisor",
      ]}
    >
      <main
        dir="rtl"
        className="mx-auto max-w-2xl space-y-6 p-4 md:p-8"
      >
        <div>
          <h1 className="text-4xl font-black text-yellow-400">
            تعديل الموظف
          </h1>

          <p className="mt-2 text-zinc-500">
            عدّلي النوع والمستوى
            والكود من القوائم.
          </p>
        </div>

        {errorMessage && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 font-bold text-red-400">
            {errorMessage}
          </div>
        )}

        <div className="space-y-5 rounded-3xl border border-white/10 bg-[#141414]/90 p-6 backdrop-blur-xl md:p-8">
          <label className="block">
            <span className="mb-2 block font-bold text-zinc-300">
              اسم الموظف
            </span>

            <input
              value={form.name}
              onChange={(event) =>
                updateForm(
                  "name",
                  event.target.value
                )
              }
              className="w-full rounded-xl border border-white/10 bg-zinc-900 p-4 text-white outline-none transition focus:border-yellow-500"
            />
          </label>

          <label className="block">
            <span className="mb-2 block font-bold text-zinc-300">
              Discord ID
            </span>

            <input
              value={
                form.discordId
              }
              onChange={(event) =>
                updateForm(
                  "discordId",
                  event.target.value
                )
              }
              dir="ltr"
              className="w-full rounded-xl border border-white/10 bg-zinc-900 p-4 text-left text-white outline-none transition focus:border-yellow-500"
            />
          </label>

          <label className="block">
            <span className="mb-2 block font-bold text-zinc-300">
              نوع الموظف
            </span>

            <select
              value={
                form.employeeType
              }
              onChange={(event) =>
                updateEmployeeType(
                  event.target
                    .value as EmployeeCategory
                )
              }
              className="w-full cursor-pointer rounded-xl border border-white/10 bg-zinc-900 p-4 text-white outline-none focus:border-yellow-500"
            >
              <option value="main">
                موظف أساسي — G
              </option>

              <option value="leader">
                قيادة — G
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
              value={form.level}
              onChange={(event) =>
                updateForm(
                  "level",
                  Number(
                    event.target.value
                  ) as LevelNumber
                )
              }
              className="w-full cursor-pointer rounded-xl border border-white/10 bg-zinc-900 p-4 text-white outline-none focus:border-yellow-500"
            >
              {allowedLevels.map(
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
              value={form.fullCode}
              disabled={
                availableCodes.length ===
                0
              }
              onChange={(event) =>
                updateForm(
                  "fullCode",
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

          {(form.employeeType ===
            "certified" ||
            form.employeeType ===
              "certified_leader") && (
            <label className="block">
              <span className="mb-2 block font-bold text-zinc-300">
                القطاع الأساسي
              </span>

              <input
                value={
                  form.mainSector
                }
                onChange={(event) =>
                  updateForm(
                    "mainSector",
                    event.target.value
                  )
                }
                placeholder="مثال: الشرطة أو الهلال الأحمر"
                className="w-full rounded-xl border border-white/10 bg-zinc-900 p-4 text-white outline-none transition focus:border-yellow-500"
              />
            </label>
          )}

          <div className="rounded-2xl border border-white/5 bg-zinc-900 p-5">
            <h2 className="mb-4 text-xl font-bold text-yellow-400">
              الدورات
            </h2>

            <div className="grid gap-3 sm:grid-cols-2">
              {courses.map(
                (course) => (
                  <label
                    key={course.id}
                    className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-3 transition hover:border-yellow-500/20"
                  >
                    <input
                      type="checkbox"
                      checked={form.employeeCourses.includes(
                        course.name
                      )}
                      onChange={(
                        event
                      ) =>
                        toggleCourse(
                          course.name,
                          event.target
                            .checked
                        )
                      }
                      className="h-5 w-5 accent-yellow-500"
                    />

                    <span className="text-zinc-300">
                      {course.name}
                    </span>
                  </label>
                )
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={save}
              disabled={
                saving ||
                !form.fullCode
              }
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-yellow-500 p-4 font-black text-black transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-50"
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
                ? "جارٍ حفظ التعديلات..."
                : "حفظ التعديلات"}
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={() =>
                router.push(
                  `/dashboard/employees/${employeeId}`
                )
              }
              className="rounded-xl border border-white/10 bg-white/5 px-7 py-4 font-bold text-zinc-300 transition hover:bg-white/10 disabled:opacity-50"
            >
              إلغاء
            </button>
          </div>
        </div>
      </main>
    </RoleGuard>
  );
}