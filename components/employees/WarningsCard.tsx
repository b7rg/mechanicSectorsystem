"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  collection,
  doc,
  onSnapshot,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import {
  AlertTriangle,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";

import { addActivity } from "@/lib/activity";
import { db } from "@/lib/firebase";

type ViolationCatalogItem = {
  id: string;
  title: string;
  category: string;
  fine: string;
  punishment: string;
};

type EmployeeViolation = {
  id: string;
  catalogId: string;
  title: string;
  category: string;
  fine: string;
  punishment: string;
  createdAt: string;
};

type WarningsCardProps = {
  id: string;
  warnings?: number;
};

function firstText(
  ...values: unknown[]
) {
  for (const value of values) {
    if (
      typeof value === "string" &&
      value.trim()
    ) {
      return value.trim();
    }

    if (
      typeof value === "number" &&
      Number.isFinite(value)
    ) {
      return String(value);
    }
  }

  return "";
}

function normalizeCatalogItem(
  id: string,
  data: Record<string, unknown>
): ViolationCatalogItem {
  return {
    id,
    title:
      firstText(
        data.title,
        data.name,
        data.violation,
        data.violationName,
        data.reason
      ) || "مخالفة دون اسم",

    category:
      firstText(
        data.category,
        data.section,
        data.type
      ) || "غير مصنفة",

    fine: firstText(
      data.fine,
      data.amount,
      data.value,
      data.fineAmount
    ),

    punishment: firstText(
      data.punishment,
      data.penalty,
      data.action,
      data.description
    ),
  };
}

function normalizeViolation(
  value: unknown,
  index: number
): EmployeeViolation | null {
  if (
    !value ||
    typeof value !== "object"
  ) {
    return null;
  }

  const data =
    value as Record<
      string,
      unknown
    >;

  const title =
    firstText(
      data.title,
      data.name,
      data.violation,
      data.violationName
    ) || "مخالفة دون اسم";

  return {
    id:
      firstText(data.id) ||
      `legacy-${index}`,
    catalogId: firstText(
      data.catalogId,
      data.violationId
    ),
    title,
    category:
      firstText(
        data.category,
        data.type
      ) || "غير مصنفة",
    fine: firstText(
      data.fine,
      data.amount
    ),
    punishment: firstText(
      data.punishment,
      data.penalty,
      data.action
    ),
    createdAt: firstText(
      data.createdAt,
      data.date
    ),
  };
}

function getViolationHistory(
  data: Record<string, unknown>
) {
  const source =
    Array.isArray(data.violations)
      ? data.violations
      : Array.isArray(data.warnings)
        ? data.warnings
        : [];

  return source
    .map(normalizeViolation)
    .filter(
      (
        item
      ): item is EmployeeViolation =>
        item !== null
    );
}

function getLegacyWarningCount(
  data: Record<string, unknown>,
  historyLength: number
) {
  const savedLegacy = Number(
    data.legacyWarningCount
  );

  if (
    Number.isFinite(savedLegacy) &&
    savedLegacy >= 0
  ) {
    return Math.trunc(savedLegacy);
  }

  const warningValue = Number(
    data.warnings
  );

  if (
    Number.isFinite(warningValue) &&
    warningValue > historyLength
  ) {
    return Math.trunc(
      warningValue -
        historyLength
    );
  }

  return 0;
}

function createRecordId() {
  if (
    typeof crypto !==
      "undefined" &&
    "randomUUID" in crypto
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

function formatFine(
  value: string
) {
  if (!value) {
    return "";
  }

  const numeric = Number(
    value.replace(/[^\d.]/g, "")
  );

  if (
    Number.isFinite(numeric) &&
    numeric > 0
  ) {
    return `${numeric.toLocaleString(
      "ar-SA"
    )} غرامة`;
  }

  return value;
}

export default function WarningsCard({
  id,
  warnings: initialWarnings = 0,
}: WarningsCardProps) {
  const [employeeName, setEmployeeName] =
    useState("");
  const [history, setHistory] =
    useState<EmployeeViolation[]>(
      []
    );
  const [
    legacyWarningCount,
    setLegacyWarningCount,
  ] = useState(
    Math.max(
      0,
      Number(initialWarnings) || 0
    )
  );

  const [catalog, setCatalog] =
    useState<
      ViolationCatalogItem[]
    >([]);
  const [
    selectedViolationId,
    setSelectedViolationId,
  ] = useState("");

  const [loading, setLoading] =
    useState(true);
  const [saving, setSaving] =
    useState(false);
  const [
    deletingViolationId,
    setDeletingViolationId,
  ] = useState<string | null>(
    null
  );
  const [message, setMessage] =
    useState("");
  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, "employees", id),
      (snapshot) => {
        if (!snapshot.exists()) {
          setLoading(false);
          return;
        }

        const data =
          snapshot.data();

        const nextHistory =
          getViolationHistory(data);

        setEmployeeName(
          String(data.name ?? "")
        );
        setHistory(nextHistory);
        setLegacyWarningCount(
          getLegacyWarningCount(
            data,
            nextHistory.length
          )
        );
        setLoading(false);
        setErrorMessage("");
      },
      (error) => {
        console.error(
          "تعذر تحميل مخالفات الموظف:",
          error
        );

        setLoading(false);
        setErrorMessage(
          "تعذر تحميل المخالفات."
        );
      }
    );

    return () => unsubscribe();
  }, [id]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(
        db,
        "sectorViolations"
      ),
      (snapshot) => {
        const nextCatalog =
          snapshot.docs
            .map((item) =>
              normalizeCatalogItem(
                item.id,
                item.data()
              )
            )
            .filter(
              (item) =>
                item.title.trim()
                  .length > 0
            )
            .sort((first, second) => {
              const categoryOrder =
                first.category.localeCompare(
                  second.category,
                  "ar"
                );

              return categoryOrder !== 0
                ? categoryOrder
                : first.title.localeCompare(
                    second.title,
                    "ar"
                  );
            });

        setCatalog(nextCatalog);
        setSelectedViolationId(
          (current) =>
            current &&
            nextCatalog.some(
              (item) =>
                item.id === current
            )
              ? current
              : nextCatalog[0]
                  ?.id ?? ""
        );
      },
      (error) => {
        console.error(
          "تعذر تحميل قائمة المخالفات:",
          error
        );

        setErrorMessage(
          "تعذر تحميل قائمة المخالفات."
        );
      }
    );

    return () => unsubscribe();
  }, []);

  const selectedViolation =
    useMemo(
      () =>
        catalog.find(
          (item) =>
            item.id ===
            selectedViolationId
        ) ?? null,
      [
        catalog,
        selectedViolationId,
      ]
    );

  const totalWarnings =
    legacyWarningCount +
    history.length;

  const mostRepeated =
    useMemo(() => {
      if (history.length === 0) {
        return null;
      }

      const counts = new Map<
        string,
        number
      >();

      history.forEach((violation) => {
        counts.set(
          violation.title,
          (counts.get(
            violation.title
          ) ?? 0) + 1
        );
      });

      return Array.from(
        counts.entries()
      ).sort(
        (
          first,
          second
        ) =>
          second[1] - first[1] ||
          first[0].localeCompare(
            second[0],
            "ar"
          )
      )[0];
    }, [history]);

  async function addViolation() {
    if (
      !selectedViolation ||
      saving
    ) {
      return;
    }

    try {
      setSaving(true);
      setMessage("");
      setErrorMessage("");

      const employeeReference =
        doc(
          db,
          "employees",
          id
        );

      const newViolation: EmployeeViolation =
        {
          id: createRecordId(),
          catalogId:
            selectedViolation.id,
          title:
            selectedViolation.title,
          category:
            selectedViolation.category,
          fine:
            selectedViolation.fine,
          punishment:
            selectedViolation.punishment,
          createdAt:
            new Date().toISOString(),
        };

      await runTransaction(
        db,
        async (transaction) => {
          const snapshot =
            await transaction.get(
              employeeReference
            );

          if (!snapshot.exists()) {
            throw new Error(
              "employee_not_found"
            );
          }

          const data =
            snapshot.data();

          const currentHistory =
            getViolationHistory(data);

          const currentLegacy =
            getLegacyWarningCount(
              data,
              currentHistory.length
            );

          const nextHistory = [
            ...currentHistory,
            newViolation,
          ];

          transaction.update(
            employeeReference,
            {
              violations:
                nextHistory,
              warnings:
                currentLegacy +
                nextHistory.length,
              legacyWarningCount:
                currentLegacy,
              updatedAt:
                serverTimestamp(),
            }
          );
        }
      );

      try {
        await addActivity(
          `إضافة مخالفة "${selectedViolation.title}" للموظف ${
            employeeName || id
          }`
        );
      } catch (activityError) {
        console.error(
          "تعذر تسجيل نشاط المخالفة:",
          activityError
        );
      }

      setMessage(
        "تمت إضافة المخالفة."
      );
    } catch (error) {
      console.error(
        "تعذر إضافة المخالفة:",
        error
      );

      setErrorMessage(
        "حدث خطأ أثناء إضافة المخالفة."
      );
    } finally {
      setSaving(false);
    }
  }

  async function removeViolation(
    violationId: string
  ) {
    const target = history.find(
      (violation) =>
        violation.id === violationId
    );

    if (!target) {
      return;
    }

    const confirmed =
      window.confirm(
        `هل تريد حذف مخالفة "${target.title}" من سجل الموظف؟`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingViolationId(
        violationId
      );
      setMessage("");
      setErrorMessage("");

      const employeeReference =
        doc(
          db,
          "employees",
          id
        );

      await runTransaction(
        db,
        async (transaction) => {
          const snapshot =
            await transaction.get(
              employeeReference
            );

          if (!snapshot.exists()) {
            throw new Error(
              "employee_not_found"
            );
          }

          const data =
            snapshot.data();

          const currentHistory =
            getViolationHistory(data);

          const currentLegacy =
            getLegacyWarningCount(
              data,
              currentHistory.length
            );

          const nextHistory =
            currentHistory.filter(
              (violation) =>
                violation.id !==
                violationId
            );

          transaction.update(
            employeeReference,
            {
              violations:
                nextHistory,
              warnings:
                currentLegacy +
                nextHistory.length,
              legacyWarningCount:
                currentLegacy,
              updatedAt:
                serverTimestamp(),
            }
          );
        }
      );

      try {
        await addActivity(
          `حذف مخالفة "${target.title}" من سجل الموظف ${
            employeeName || id
          }`
        );
      } catch (activityError) {
        console.error(
          "تعذر تسجيل نشاط حذف المخالفة:",
          activityError
        );
      }

      setMessage(
        "تم حذف المخالفة من السجل."
      );
    } catch (error) {
      console.error(
        "تعذر حذف المخالفة:",
        error
      );

      setErrorMessage(
        "حدث خطأ أثناء حذف المخالفة."
      );
    } finally {
      setDeletingViolationId(
        null
      );
    }
  }

  if (loading) {
    return (
      <article className="flex min-h-[300px] items-center justify-center rounded-3xl border border-white/10 bg-[#141414]/90 p-6">
        <Loader2 className="animate-spin text-orange-400" />
      </article>
    );
  }

  return (
    <article
      dir="rtl"
      className="rounded-3xl border border-white/10 bg-[#141414]/90 p-6 backdrop-blur-xl"
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-orange-400">
            المخالفات
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            اختيار المخالفة من القائمة
            المعتمدة.
          </p>
        </div>

        <div className="text-left">
          <p className="text-3xl font-black text-orange-400">
            {totalWarnings}
          </p>

          <p className="text-xs text-zinc-600">
            إجمالي السجل
          </p>
        </div>
      </div>

      {mostRepeated && (
        <div className="mb-4 rounded-2xl border border-orange-500/20 bg-orange-500/[0.06] p-4">
          <p className="text-xs font-bold text-zinc-500">
            أكثر مخالفة متكررة
          </p>

          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
            <p className="font-black text-orange-300">
              {mostRepeated[0]}
            </p>

            <span className="rounded-full bg-orange-500/15 px-3 py-1 text-xs font-black text-orange-300">
              {mostRepeated[1]} مرات
            </span>
          </div>
        </div>
      )}

      {legacyWarningCount > 0 && (
        <div className="mb-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-zinc-400">
          إنذارات قديمة غير مصنفة:{" "}
          <span className="font-black text-white">
            {legacyWarningCount}
          </span>
        </div>
      )}

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

      <div className="space-y-3">
        <select
          value={selectedViolationId}
          onChange={(event) =>
            setSelectedViolationId(
              event.target.value
            )
          }
          disabled={
            catalog.length === 0 ||
            saving
          }
          className="w-full rounded-xl border border-white/10 bg-zinc-900 p-3.5 text-white outline-none focus:border-orange-500 disabled:opacity-50"
        >
          {catalog.length === 0 ? (
            <option value="">
              لا توجد مخالفات في القائمة
            </option>
          ) : (
            catalog.map((item) => (
              <option
                key={item.id}
                value={item.id}
              >
                {item.category} —{" "}
                {item.title}
                {item.fine
                  ? ` — ${formatFine(
                      item.fine
                    )}`
                  : ""}
              </option>
            ))
          )}
        </select>

        {selectedViolation && (
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-7 text-zinc-400">
            <p>
              <span className="font-bold text-zinc-300">
                المخالفة:
              </span>{" "}
              {
                selectedViolation.title
              }
            </p>

            {selectedViolation.fine && (
              <p>
                <span className="font-bold text-zinc-300">
                  الغرامة:
                </span>{" "}
                {formatFine(
                  selectedViolation.fine
                )}
              </p>
            )}

            {selectedViolation.punishment && (
              <p>
                <span className="font-bold text-zinc-300">
                  الإجراء:
                </span>{" "}
                {
                  selectedViolation.punishment
                }
              </p>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={addViolation}
          disabled={
            saving ||
            !selectedViolation
          }
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3.5 font-black text-black transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? (
            <Loader2
              size={18}
              className="animate-spin"
            />
          ) : (
            <Plus size={18} />
          )}

          {saving
            ? "جارٍ الإضافة..."
            : "إضافة المخالفة"}
        </button>
      </div>

      <div className="mt-6">
        <h3 className="mb-3 font-black text-white">
          سجل المخالفات
        </h3>

        {history.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 p-5 text-center text-sm text-zinc-600">
            لا توجد مخالفات مصنفة حتى
            الآن.
          </div>
        ) : (
          <div className="max-h-[340px] space-y-3 overflow-y-auto pl-1">
            {[...history]
              .reverse()
              .map((violation) => (
                <div
                  key={violation.id}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-black text-white">
                        {
                          violation.title
                        }
                      </p>

                      <p className="mt-1 text-xs text-zinc-500">
                        {
                          violation.category
                        }
                        {violation.fine
                          ? ` • ${formatFine(
                              violation.fine
                            )}`
                          : ""}
                      </p>

                      {violation.createdAt && (
                        <p className="mt-2 text-xs text-zinc-600">
                          {new Date(
                            violation.createdAt
                          ).toLocaleString(
                            "ar-SA"
                          )}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        removeViolation(
                          violation.id
                        )
                      }
                      disabled={
                        deletingViolationId !==
                        null
                      }
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 transition hover:bg-red-500 hover:text-white disabled:opacity-50"
                      aria-label="حذف المخالفة"
                    >
                      {deletingViolationId ===
                      violation.id ? (
                        <Loader2
                          size={16}
                          className="animate-spin"
                        />
                      ) : (
                        <Trash2
                          size={16}
                        />
                      )}
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {catalog.length === 0 && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-sm leading-6 text-yellow-300">
          <AlertTriangle
            size={18}
            className="mt-0.5 shrink-0"
          />

          أضف المخالفات أولًا من صفحة
          المخالفات والغرامات.
        </div>
      )}
    </article>
  );
}