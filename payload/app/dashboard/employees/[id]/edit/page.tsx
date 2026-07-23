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
  deleteField,
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

import RoleGuard from "@/components/auth/RoleGuard";
import { addActivity } from "@/lib/activity";
import {
  ADMINISTRATION_ROLES,
  getAdministrationRoleByLevel,
  getAdministrationRoleByTitle,
  type AdministrationTitle,
} from "@/lib/administration";
import { courses } from "@/lib/courses";
import {
  formatEmployeeCode,
  getCodesForLevel,
  getLevelsForEmployeeType,
  getPrefixForEmployeeType,
  normalizeEmployeeDocument,
  parseEmployeeCode,
  type EmployeeType,
  type LevelNumber,
} from "@/lib/employeeCodes";
import { db } from "@/lib/firebase";

type UsedEmployeeCode = {
  id: string;
  fullCode: string;
};

type EditEmployeeForm = {
  name: string;
  discordId: string;
  employeeType: EmployeeType;
  administrationTitle: AdministrationTitle;
  level: LevelNumber;
  fullCode: string;
  mainSector: string;
  employeeCourses: string[];
};

const DEFAULT_ADMINISTRATION_TITLE: AdministrationTitle =
  "دعم ومساعدة";

const emptyForm: EditEmployeeForm = {
  name: "",
  discordId: "",
  employeeType: "main",
  administrationTitle:
    DEFAULT_ADMINISTRATION_TITLE,
  level: 1,
  fullCode: "",
  mainSector: "",
  employeeCourses: [],
};

function isCertifiedEmployeeType(
  employeeType: EmployeeType
) {
  return (
    employeeType === "certified" ||
    employeeType === "certified_leader"
  );
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

  const administrationRole = useMemo(
    () =>
      getAdministrationRoleByTitle(
        form.administrationTitle
      ),
    [form.administrationTitle]
  );

  const allowedLevels = useMemo(
    () =>
      getLevelsForEmployeeType(
        form.employeeType
      ),
    [form.employeeType]
  );

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

        const savedAdministrationTitle =
          employee.administrationTitle ??
          getAdministrationRoleByLevel(
            employee.level
          )?.title ??
          DEFAULT_ADMINISTRATION_TITLE;

        setForm({
          name: employee.name,
          discordId:
            employee.discordId,
          employeeType:
            employee.employeeType,
          administrationTitle:
            savedAdministrationTitle,
          level: employee.level,
          fullCode:
            employee.fullCode,
          mainSector:
            employee.mainSector,
          employeeCourses:
            employee.employeeType ===
            "administration"
              ? []
              : savedCourses,
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

  useEffect(() => {
    if (
      form.employeeType !==
      "administration"
    ) {
      return;
    }

    setForm((current) => {
      if (
        current.level ===
          administrationRole.level &&
        current.mainSector === "" &&
        current.employeeCourses.length ===
          0
      ) {
        return current;
      }

      return {
        ...current,
        level:
          administrationRole.level,
        mainSector: "",
        employeeCourses: [],
      };
    });
  }, [
    administrationRole.level,
    form.employeeType,
  ]);

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

  const effectiveLevel =
    form.employeeType ===
    "administration"
      ? administrationRole.level
      : form.level;

  const availableCodes =
    useMemo(() => {
      const levelCodes =
        getCodesForLevel(
          form.employeeType,
          effectiveLevel,
          form.employeeType === "administration"
            ? form.administrationTitle
            : undefined
        );

      const unusedCodes =
        levelCodes.filter(
          (code) =>
            !usedCodes.has(
              code.toUpperCase()
            )
        );

      if (
        form.employeeType !==
        "administration"
      ) {
        return unusedCodes;
      }

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
      effectiveLevel,
      form.employeeType,
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
    employeeType: EmployeeType
  ) {
    const nextLevels =
      getLevelsForEmployeeType(
        employeeType
      );

    setForm((current) => {
      if (
        employeeType ===
        "administration"
      ) {
        const nextRole =
          getAdministrationRoleByTitle(
            DEFAULT_ADMINISTRATION_TITLE
          );

        return {
          ...current,
          employeeType,
          administrationTitle:
            DEFAULT_ADMINISTRATION_TITLE,
          level: nextRole.level,
          fullCode: "",
          mainSector: "",
          employeeCourses: [],
        };
      }

      const nextLevel =
        nextLevels.includes(
          current.level
        )
          ? current.level
          : nextLevels[0];

      return {
        ...current,
        employeeType,
        level: nextLevel,
        fullCode: "",
        mainSector:
          isCertifiedEmployeeType(
            employeeType
          )
            ? current.mainSector
            : "",
      };
    });

    setErrorMessage("");
  }

  function updateAdministrationTitle(
    administrationTitle: AdministrationTitle
  ) {
    const nextRole =
      getAdministrationRoleByTitle(
        administrationTitle
      );

    setForm((current) => ({
      ...current,
      administrationTitle,
      level: nextRole.level,
      fullCode: "",
      mainSector: "",
      employeeCourses: [],
    }));

    setErrorMessage("");
  }

  function toggleCourse(
    courseName: string,
    checked: boolean
  ) {
    if (
      form.employeeType ===
      "administration"
    ) {
      return;
    }

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
        "اكتب اسم الموظف."
      );
      return;
    }

    if (!cleanDiscordId) {
      setErrorMessage(
        "اكتب Discord ID."
      );
      return;
    }

    const requiresMainSector =
      isCertifiedEmployeeType(
        form.employeeType
      );

    if (
      requiresMainSector &&
      !cleanMainSector
    ) {
      setErrorMessage(
        "اكتب القطاع الأساسي للاعب المعتمد."
      );
      return;
    }

    if (!form.fullCode) {
      setErrorMessage(
        "لا يوجد كود متاح لهذا المستوى."
      );
      return;
    }

    if (
      usedCodes.has(
        form.fullCode.toUpperCase()
      )
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
        form.employeeType;

      const finalLevel =
        employeeType ===
        "administration"
          ? administrationRole.level
          : form.level;

      const prefix =
        getPrefixForEmployeeType(
          employeeType,
          employeeType ===
            "administration"
            ? form.administrationTitle
            : undefined
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

      const isCertified =
        isCertifiedEmployeeType(
          employeeType
        );

      const updateData: Record<
        string,
        unknown
      > = {
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
        administrationTitle:
          employeeType ===
          "administration"
            ? form.administrationTitle
            : deleteField(),
        courses:
          employeeType ===
          "administration"
            ? []
            : form.employeeCourses,
        updatedAt:
          serverTimestamp(),
      };

      if (
        employeeType ===
        "administration"
      ) {
        updateData.reports = {};
      }

      await updateDoc(
        doc(
          db,
          "employees",
          employeeId
        ),
        updateData
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
            جارٍ تحميل بيانات الموظف...
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
            عدّل بيانات الموظف والنوع
            والمستوى والكود.
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
                    .value as EmployeeType
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
                مسؤولو المعتمد — CA
              </option>

              <option value="administration">
                الإدارة والإدارة العليا — S / M / F / A / A+
              </option>
            </select>
          </label>

          {form.employeeType ===
            "administration" && (
            <>
              <label className="block">
                <span className="mb-2 block font-bold text-zinc-300">
                  المسمى الإداري
                </span>

                <select
                  value={
                    form.administrationTitle
                  }
                  onChange={(event) =>
                    updateAdministrationTitle(
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

          {form.employeeType !==
            "administration" && (
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
            form.employeeType
          ) && (
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
                placeholder="مثال: الأمن العام أو الهلال الأحمر"
                className="w-full rounded-xl border border-white/10 bg-zinc-900 p-4 text-white outline-none transition focus:border-yellow-500"
              />
            </label>
          )}

          {form.employeeType !==
          "administration" ? (
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
          ) : (
            <p className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-7 text-zinc-400">
              موظف الإدارة يُعيّن حسب
              مسماه مباشرة، ولا تظهر له
              الدورات أو التقارير أو شروط
              الترقية.
            </p>
          )}

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
