"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
} from "react";
import {
  getTitlesForRegion,
  mechanicRegions,
  temporaryTitles,
  titleInstructions,
} from "@/lib/mechanicTitles";

import {
  AlertTriangle as TitlesAlertTriangle,
  BadgeCheck,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  UserRoundCog,
} from "lucide-react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  MapPinned,
  MousePointer2,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";

import { db } from "@/lib/firebase";
import { addActivity } from "@/lib/activity";
import RoleGuard from "@/components/auth/RoleGuard";

type MechanicRegionKey =
  | "los"
  | "sandy"
  | "paleto"
  | "coast";

type MapRegion = {
  id: string;

  name: string;
  description: string;
  regionKey: MechanicRegionKey;

  x: number;
  y: number;

  width: number;
  height: number;

  color: string;
  opacity: number;
  hoverOpacity: number;

  rotate: number;
  borderRadius: number;

  showLabel: boolean;
  active: boolean;
};

type RegionForm = Omit<MapRegion, "id">;

const mapImageUrl = "/maps/gta-map.png";

const emptyForm: RegionForm = {
  name: "منطقة جديدة",
  description: "",
  regionKey: "los",

  x: 45,
  y: 45,

  width: 20,
  height: 15,

  color: "#3b82f6",
  opacity: 0.2,
  hoverOpacity: 0.5,

  rotate: 0,
  borderRadius: 30,

  showLabel: true,
  active: true,
};

const regionOptions: Array<{
  value: MechanicRegionKey;
  label: string;
}> = [
  {
    value: "los",
    label: "لوس",
  },
  {
    value: "sandy",
    label: "ساندي",
  },
  {
    value: "paleto",
    label: "بوليتو",
  },
  {
    value: "coast",
    label: "الساحل",
  },
];

function clamp(
  value: number,
  min: number,
  max: number
) {
  return Math.max(min, Math.min(max, value));
}

function hexToRgba(
  hex: string,
  opacity: number
) {
  const cleaned = hex.replace("#", "");

  const full =
    cleaned.length === 3
      ? cleaned
          .split("")
          .map((item) => item + item)
          .join("")
      : cleaned;

  const red = Number.parseInt(
    full.slice(0, 2),
    16
  );

  const green = Number.parseInt(
    full.slice(2, 4),
    16
  );

  const blue = Number.parseInt(
    full.slice(4, 6),
    16
  );

  return `rgba(${red}, ${green}, ${blue}, ${opacity})`;
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative h-8 w-14 rounded-full transition ${
        checked
          ? "bg-yellow-500"
          : "bg-zinc-700"
      }`}
    >
      <span
        className={`absolute top-1 h-6 w-6 rounded-full bg-white transition ${
          checked ? "right-7" : "right-1"
        }`}
      />
    </button>
  );
}
function TitlePreviewBox({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-yellow-500/20 bg-black/40 px-4 py-3 font-mono text-sm font-black text-yellow-300">
      {children}
    </div>
  );
}

function RegionTitlesPreview({
  regionKey,
  regionName,
  regionColor,
  description,
}: {
  regionKey: MechanicRegionKey;
  regionName: string;
  regionColor: string;
  description: string;
}) {
  const [showTemporary, setShowTemporary] =
    useState(false);

  const [showInstructions, setShowInstructions] =
    useState(false);

  const mechanicRegion =
    mechanicRegions[regionKey];

  const titleGroups =
    getTitlesForRegion(regionKey);

  return (
    <aside
      dir="rtl"
      className="max-h-[900px] overflow-y-auto rounded-[30px] border border-yellow-500/20 bg-[#141414] p-5 shadow-2xl"
    >
      <div className="flex items-start gap-3">
        <span
          className="mt-1 h-4 w-4 shrink-0 rounded-full"
          style={{
            backgroundColor: regionColor,
            boxShadow: `0 0 16px ${regionColor}`,
          }}
        />

        <BadgeCheck
          size={25}
          className="shrink-0 text-yellow-400"
        />

        <div className="min-w-0">
          <h2 className="text-2xl font-black text-yellow-400">
            مسميات{" "}
            {regionName.trim() ||
              mechanicRegion.shortName}
          </h2>

          <p className="mt-2 text-sm leading-7 text-zinc-400">
            {description.trim() ||
              `المسميات المعتمدة لمنطقة ${mechanicRegion.name} حسب المستوى والاعتمادات.`}
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-5">
        {titleGroups.map((group) => (
          <article
            key={group.id}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
          >
            <h3 className="text-lg font-black text-white">
              {group.levelsLabel}
            </h3>

            {group.defaultTitle && (
              <div className="mt-4 space-y-3">
                <TitlePreviewBox>
                  {group.defaultTitle.fullTitle}
                </TitlePreviewBox>

                <p className="text-sm leading-7 text-zinc-500">
                  {
                    group.defaultTitle
                      .description
                  }
                </p>
              </div>
            )}

            {group.withoutApproval && (
              <div className="mt-4 rounded-2xl border border-orange-500/15 bg-orange-500/[0.04] p-4">
                <p className="mb-3 text-sm font-black text-orange-400">
                  في حال عدم الحصول على{" "}
                  {
                    group.withoutApproval
                      .approvalName
                  }
                </p>

                <TitlePreviewBox>
                  {
                    group.withoutApproval
                      .fullTitle
                  }
                </TitlePreviewBox>

                <p className="mt-3 text-sm leading-7 text-zinc-500">
                  {
                    group.withoutApproval
                      .description
                  }
                </p>
              </div>
            )}

            {group.withApproval && (
              <div className="mt-4 rounded-2xl border border-green-500/15 bg-green-500/[0.04] p-4">
                <p className="mb-3 flex items-center gap-2 text-sm font-black text-green-400">
                  <ShieldCheck size={17} />

                  بعد الحصول على{" "}
                  {
                    group.withApproval
                      .approvalName
                  }
                </p>

                <TitlePreviewBox>
                  {
                    group.withApproval
                      .fullTitle
                  }
                </TitlePreviewBox>

                <p className="mt-3 text-sm leading-7 text-zinc-500">
                  {
                    group.withApproval
                      .description
                  }
                </p>
              </div>
            )}
          </article>
        ))}
      </div>

      <div className="mt-5 rounded-2xl border border-blue-500/15 bg-blue-500/[0.03] p-4">
        <button
          type="button"
          onClick={() =>
            setShowTemporary(
              (current) => !current
            )
          }
          className="flex w-full items-center justify-between gap-4 text-right"
        >
          <div className="flex items-center gap-3">
            <UserRoundCog
              size={21}
              className="text-blue-400"
            />

            <div>
              <h3 className="font-black text-white">
                المسميات الميدانية المؤقتة
              </h3>

              <p className="mt-1 text-xs text-zinc-500">
                تستخدم أثناء استلام المهمة فقط.
              </p>
            </div>
          </div>

          {showTemporary ? (
            <ChevronUp
              size={20}
              className="text-blue-400"
            />
          ) : (
            <ChevronDown
              size={20}
              className="text-blue-400"
            />
          )}
        </button>

        {showTemporary && (
          <div className="mt-4 space-y-3">
            {temporaryTitles.map((title) => (
              <article
                key={title.id}
                className="rounded-xl border border-white/10 bg-black/20 p-3"
              >
                <TitlePreviewBox>
                  G - 000 | {title.title}
                </TitlePreviewBox>

                <p className="mt-2 text-xs leading-6 text-zinc-500">
                  {title.description}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>

      <div className="mt-5 rounded-2xl border border-red-500/15 bg-red-500/[0.03] p-4">
        <button
          type="button"
          onClick={() =>
            setShowInstructions(
              (current) => !current
            )
          }
          className="flex w-full items-center justify-between gap-4 text-right"
        >
          <div className="flex items-center gap-3">
            <TitlesAlertTriangle
              size={21}
              className="text-red-400"
            />

            <div>
              <h3 className="font-black text-white">
                تنبيهات استخدام المسميات
              </h3>

              <p className="mt-1 text-xs text-zinc-500">
                ضوابط إلزامية لجميع أفراد القطاع.
              </p>
            </div>
          </div>

          {showInstructions ? (
            <ChevronUp
              size={20}
              className="text-red-400"
            />
          ) : (
            <ChevronDown
              size={20}
              className="text-red-400"
            />
          )}
        </button>

        {showInstructions && (
          <div className="mt-4 space-y-2">
            {titleInstructions.map(
              (instruction, index) => (
                <div
                  key={instruction}
                  className="flex items-start gap-3 rounded-xl border border-white/10 bg-black/20 p-3"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-xs font-black text-red-400">
                    {index + 1}
                  </span>

                  <p className="text-sm leading-7 text-zinc-300">
                    {instruction}
                  </p>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </aside>
  );
}

export default function ManageMapRegionsPage() {
  const imageContainerRef =
    useRef<HTMLDivElement | null>(null);

  const [regions, setRegions] = useState<
    MapRegion[]
  >([]);

  const [form, setForm] =
    useState<RegionForm>(emptyForm);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [message, setMessage] =
    useState("");

  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    const regionsQuery = query(
      collection(db, "mapRegions")
    );

    const unsubscribe = onSnapshot(
      regionsQuery,
      (snapshot) => {
        const nextRegions = snapshot.docs.map(
          (regionDocument) => {
            const data = regionDocument.data();

            return {
              id: regionDocument.id,

              name:
                typeof data.name === "string"
                  ? data.name
                  : "منطقة",

              description:
                typeof data.description ===
                "string"
                  ? data.description
                  : "",

              regionKey:
                typeof data.regionKey ===
                "string"
                  ? (data.regionKey as MechanicRegionKey)
                  : "los",

              x: Number(data.x ?? 45),
              y: Number(data.y ?? 45),

              width: Number(
                data.width ?? 20
              ),

              height: Number(
                data.height ?? 15
              ),

              color:
                typeof data.color === "string"
                  ? data.color
                  : "#3b82f6",

              opacity: Number(
                data.opacity ?? 0.2
              ),

              hoverOpacity: Number(
                data.hoverOpacity ?? 0.5
              ),

              rotate: Number(
                data.rotate ?? 0
              ),

              borderRadius: Number(
                data.borderRadius ?? 30
              ),

              showLabel:
                data.showLabel !== false,

              active: data.active !== false,
            } satisfies MapRegion;
          }
        );

        setRegions(nextRegions);
        setLoading(false);
        setErrorMessage("");
      },
      (error) => {
        console.error(
          "تعذر تحميل مناطق الخريطة:",
          error
        );

        setErrorMessage(
          "تعذر تحميل مناطق الخريطة."
        );

        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const previewRegions = useMemo(() => {
    if (!editingId) {
      return regions;
    }

    return regions.map((region) =>
      region.id === editingId
        ? {
            ...region,
            ...form,
          }
        : region
    );
  }, [regions, editingId, form]);

  function updateForm<
    Key extends keyof RegionForm,
  >(
    key: Key,
    value: RegionForm[Key]
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));

    setMessage("");
    setErrorMessage("");
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setMessage("");
    setErrorMessage("");
  }

  function startNewRegion() {
    setEditingId(null);

    setForm({
      ...emptyForm,
      name: "منطقة جديدة",
    });

    setMessage(
      "اضغطي على الخريطة لتحديد مكان المنطقة."
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function startEditing(
    region: MapRegion
  ) {
    setEditingId(region.id);

    setForm({
      name: region.name,
      description: region.description,
      regionKey: region.regionKey,

      x: region.x,
      y: region.y,

      width: region.width,
      height: region.height,

      color: region.color,
      opacity: region.opacity,
      hoverOpacity:
        region.hoverOpacity,

      rotate: region.rotate,
      borderRadius:
        region.borderRadius,

      showLabel: region.showLabel,
      active: region.active,
    });

    setMessage(
      "عدلي الموقع أو الحجم ثم اضغطي حفظ."
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function handleMapClick(
    event: MouseEvent<HTMLDivElement>
  ) {
    const container =
      imageContainerRef.current;

    if (!container) {
      return;
    }

    const bounds =
      container.getBoundingClientRect();

    const clickX =
      event.clientX - bounds.left;

    const clickY =
      event.clientY - bounds.top;

    const x = clamp(
      (clickX / bounds.width) * 100 -
        form.width / 2,
      0,
      100 - form.width
    );

    const y = clamp(
      (clickY / bounds.height) * 100 -
        form.height / 2,
      0,
      100 - form.height
    );

    updateForm(
      "x",
      Number(x.toFixed(2))
    );

    updateForm(
      "y",
      Number(y.toFixed(2))
    );

    setMessage(
    "تم تحديد مكان المنطقة. عدلي الحجم ثم احفظي."
    );
  }

  async function saveRegion() {
    const cleanName =
      form.name.trim();

    if (!cleanName) {
      setErrorMessage(
        "اكتبي اسم المنطقة."
      );

      return;
    }

    if (
      form.width <= 0 ||
      form.width > 100
    ) {
      setErrorMessage(
        "عرض المنطقة لازم يكون بين 1 و100."
      );

      return;
    }

    if (
      form.height <= 0 ||
      form.height > 100
    ) {
      setErrorMessage(
        "ارتفاع المنطقة لازم يكون بين 1 و100."
      );

      return;
    }

    try {
      setSaving(true);
      setMessage("");
      setErrorMessage("");

      const payload = {
        name: cleanName,
        description:
          form.description.trim(),

        regionKey:
          form.regionKey,

        x: Number(form.x),
        y: Number(form.y),

        width: Number(form.width),
        height: Number(
          form.height
        ),

        color: form.color,
        opacity: Number(
          form.opacity
        ),

        hoverOpacity: Number(
          form.hoverOpacity
        ),

        rotate: Number(
          form.rotate
        ),

        borderRadius: Number(
          form.borderRadius
        ),

        showLabel:
          form.showLabel,

        active: form.active,

        updatedAt:
          serverTimestamp(),
      };

      if (editingId) {
        await updateDoc(
          doc(
            db,
            "mapRegions",
            editingId
          ),
          payload
        );

        try {
          await addActivity(
            `عدّل منطقة الخريطة: ${cleanName}`,
            cleanName
          );
        } catch (activityError) {
          console.error(
            "تعذر تسجيل النشاط:",
            activityError
          );
        }

        setMessage(
          "تم تعديل المنطقة بنجاح."
        );
      } else {
        await addDoc(
          collection(
            db,
            "mapRegions"
          ),
          {
            ...payload,
            createdAt:
              serverTimestamp(),
          }
        );

        try {
          await addActivity(
            `أضاف منطقة للخريطة: ${cleanName}`,
            cleanName
          );
        } catch (activityError) {
          console.error(
            "تعذر تسجيل النشاط:",
            activityError
          );
        }

        setMessage(
          "تمت إضافة المنطقة بنجاح."
        );
      }

      setEditingId(null);
      setForm(emptyForm);
    } catch (error) {
      console.error(
        "تعذر حفظ منطقة الخريطة:",
        error
      );

      setErrorMessage(
        "حدث خطأ أثناء حفظ المنطقة."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteRegion(
    region: MapRegion
  ) {
    const confirmed =
      window.confirm(
        `هل أنتِ متأكدة من حذف منطقة "${region.name}"؟`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(region.id);
      setMessage("");
      setErrorMessage("");

      await deleteDoc(
        doc(
          db,
          "mapRegions",
          region.id
        )
      );

      try {
        await addActivity(
          `حذف منطقة من الخريطة: ${region.name}`,
          region.name
        );
      } catch (activityError) {
        console.error(
          "تعذر تسجيل النشاط:",
          activityError
        );
      }

      if (
        editingId === region.id
      ) {
        resetForm();
      }

      setMessage(
        "تم حذف المنطقة."
      );
    } catch (error) {
      console.error(
        "تعذر حذف المنطقة:",
        error
      );

      setErrorMessage(
        "حدث خطأ أثناء حذف المنطقة."
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <RoleGuard
      allow={["owner", "leader"]}
    >
      <main
        dir="rtl"
        className="space-y-8"
      >
        <header className="flex flex-wrap items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-yellow-500/20 bg-yellow-500/10">
              <MapPinned
                size={31}
                className="text-yellow-400"
              />
            </div>

            <div>
              <h1 className="text-3xl font-black text-yellow-400 md:text-4xl">
                إدارة مناطق الخريطة
              </h1>

              <p className="mt-2 text-zinc-400">
                حددي مكان المنطقة وحجمها
                ولونها مباشرة فوق الخريطة.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={startNewRegion}
            className="flex items-center gap-2 rounded-2xl bg-yellow-500 px-5 py-3 font-black text-black transition hover:bg-yellow-400"
          >
            <Plus size={19} />
            إضافة منطقة
          </button>
        </header>

        {message && (
          <div className="flex items-center gap-3 rounded-2xl border border-green-500/20 bg-green-500/10 px-5 py-4 font-bold text-green-400">
            <CheckCircle2 size={20} />
            {message}
          </div>
        )}

        {errorMessage && (
          <div className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 font-bold text-red-400">
            <AlertTriangle size={20} />
            {errorMessage}
          </div>
        )}

        <section className="grid items-start gap-6 2xl:grid-cols-[minmax(0,1fr)_390px_430px]">
          <div className="space-y-4">
            <div className="flex items-center gap-2 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-sm font-bold text-yellow-400">
              <MousePointer2 size={18} />

              اضغطي على أي مكان في الخريطة
              لنقل المنطقة الحالية إليه.
            </div>

            <div
              ref={imageContainerRef}
              onClick={handleMapClick}
              className="relative cursor-crosshair overflow-hidden rounded-[30px] border border-yellow-500/20 bg-black shadow-2xl"
            >
              <img
                src={mapImageUrl}
                alt="خريطة قطاع الميكانيك"
                className="block h-auto w-full select-none"
                draggable={false}
              />

              {previewRegions.map(
                (region) => {
                  const editing =
                    region.id ===
                    editingId;

                  return (
                    <button
                      key={region.id}
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();

                        const original =
                          regions.find(
                            (item) =>
                              item.id ===
                              region.id
                          );

                        if (original) {
                          startEditing(
                            original
                          );
                        }
                      }}
                      className={`absolute flex items-center justify-center border-2 transition ${
                        editing
                          ? "z-20 ring-4 ring-yellow-400/40"
                          : "z-10"
                      }`}
                      style={{
                        left: `${region.x}%`,
                        top: `${region.y}%`,
                        width: `${region.width}%`,
                        height: `${region.height}%`,

                        borderRadius: `${region.borderRadius}%`,

                        transform: `rotate(${region.rotate}deg)`,

                        borderColor:
                          region.color,

                        backgroundColor:
                          hexToRgba(
                            region.color,
                            region.opacity
                          ),

                        boxShadow:
                          editing
                            ? `0 0 35px ${hexToRgba(
                                region.color,
                                0.55
                              )}`
                            : "none",
                      }}
                    >
                      {region.showLabel && (
                        <span
                          className="rounded-full border px-3 py-2 text-sm font-black text-white shadow-xl backdrop-blur-md"
                          style={{
                            borderColor:
                              region.color,

                            backgroundColor:
                              "rgba(0,0,0,.78)",
                          }}
                        >
                          {region.name}
                        </span>
                      )}
                    </button>
                  );
                }
              )}

              {!editingId && (
                <div
                  className="pointer-events-none absolute z-20 flex items-center justify-center border-2 border-dashed"
                  style={{
                    left: `${form.x}%`,
                    top: `${form.y}%`,
                    width: `${form.width}%`,
                    height: `${form.height}%`,

                    borderRadius: `${form.borderRadius}%`,

                    transform: `rotate(${form.rotate}deg)`,

                    borderColor:
                      form.color,

                    backgroundColor:
                      hexToRgba(
                        form.color,
                        form.opacity
                      ),
                  }}
                >
                  {form.showLabel && (
                    <span className="rounded-full bg-black/80 px-3 py-2 text-sm font-black text-white">
                      {form.name}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <aside className="rounded-[30px] border border-white/10 bg-[#141414] p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-black text-white">
                  {editingId
                    ? "تعديل المنطقة"
                    : "منطقة جديدة"}
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  عدلي البيانات وشوفي
                  المعاينة مباشرة.
                </p>
              </div>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-white/10 bg-white/5 p-2 text-zinc-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            <div className="mt-6 space-y-5">
              <label className="block">
                <span className="mb-2 block font-bold text-zinc-300">
                  اسم المنطقة
                </span>

                <input
                  value={form.name}
                  onChange={(event) =>
                    updateForm(
                      "name",
                      event.target.value
                    )
                  }
                  className="w-full rounded-2xl border border-white/10 bg-zinc-900 p-4 text-white outline-none focus:border-yellow-500"
                />
              </label>

              <label className="block">
                <span className="mb-2 block font-bold text-zinc-300">
                  المسميات المرتبطة
                </span>

                <select
                  value={
                    form.regionKey
                  }
                  onChange={(event) =>
                    updateForm(
                      "regionKey",
                      event.target
                        .value as MechanicRegionKey
                    )
                  }
                  className="w-full rounded-2xl border border-white/10 bg-zinc-900 p-4 text-white outline-none focus:border-yellow-500"
                >
                  {regionOptions.map(
                    (option) => (
                      <option
                        key={
                          option.value
                        }
                        value={
                          option.value
                        }
                      >
                        {option.label}
                      </option>
                    )
                  )}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block font-bold text-zinc-300">
                  الوصف
                </span>

                <textarea
                  value={
                    form.description
                  }
                  onChange={(event) =>
                    updateForm(
                      "description",
                      event.target.value
                    )
                  }
                  rows={3}
                  className="w-full resize-none rounded-2xl border border-white/10 bg-zinc-900 p-4 text-white outline-none focus:border-yellow-500"
                />
              </label>

              <label className="block">
                <span className="mb-2 block font-bold text-zinc-300">
                  لون المنطقة
                </span>

                <div className="flex gap-3">
                  <input
                    type="color"
                    value={form.color}
                    onChange={(event) =>
                      updateForm(
                        "color",
                        event.target
                          .value
                      )
                    }
                    className="h-14 w-20 cursor-pointer rounded-xl border border-white/10 bg-zinc-900 p-2"
                  />

                  <input
                    value={form.color}
                    onChange={(event) =>
                      updateForm(
                        "color",
                        event.target
                          .value
                      )
                    }
                    dir="ltr"
                    className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-zinc-900 p-4 text-left text-white outline-none focus:border-yellow-500"
                  />
                </div>
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label>
                  <span className="mb-2 block text-sm font-bold text-zinc-300">
                    X
                  </span>

                  <input
                    type="number"
                    value={form.x}
                    min={0}
                    max={100}
                    step="0.1"
                    onChange={(event) =>
                      updateForm(
                        "x",
                        Number(
                          event.target
                            .value
                        )
                      )
                    }
                    className="w-full rounded-xl border border-white/10 bg-zinc-900 p-3 text-white"
                  />
                </label>

                <label>
                  <span className="mb-2 block text-sm font-bold text-zinc-300">
                    Y
                  </span>

                  <input
                    type="number"
                    value={form.y}
                    min={0}
                    max={100}
                    step="0.1"
                    onChange={(event) =>
                      updateForm(
                        "y",
                        Number(
                          event.target
                            .value
                        )
                      )
                    }
                    className="w-full rounded-xl border border-white/10 bg-zinc-900 p-3 text-white"
                  />
                </label>

                <label>
                  <span className="mb-2 block text-sm font-bold text-zinc-300">
                    العرض
                  </span>

                  <input
                    type="number"
                    value={
                      form.width
                    }
                    min={1}
                    max={100}
                    step="0.5"
                    onChange={(event) =>
                      updateForm(
                        "width",
                        Number(
                          event.target
                            .value
                        )
                      )
                    }
                    className="w-full rounded-xl border border-white/10 bg-zinc-900 p-3 text-white"
                  />
                </label>

                <label>
                  <span className="mb-2 block text-sm font-bold text-zinc-300">
                    الارتفاع
                  </span>

                  <input
                    type="number"
                    value={
                      form.height
                    }
                    min={1}
                    max={100}
                    step="0.5"
                    onChange={(event) =>
                      updateForm(
                        "height",
                        Number(
                          event.target
                            .value
                        )
                      )
                    }
                    className="w-full rounded-xl border border-white/10 bg-zinc-900 p-3 text-white"
                  />
                </label>

                <label>
                  <span className="mb-2 block text-sm font-bold text-zinc-300">
                    الدوران
                  </span>

                  <input
                    type="number"
                    value={
                      form.rotate
                    }
                    min={-180}
                    max={180}
                    onChange={(event) =>
                      updateForm(
                        "rotate",
                        Number(
                          event.target
                            .value
                        )
                      )
                    }
                    className="w-full rounded-xl border border-white/10 bg-zinc-900 p-3 text-white"
                  />
                </label>

                <label>
                  <span className="mb-2 block text-sm font-bold text-zinc-300">
                    تدوير الزوايا
                  </span>

                  <input
                    type="number"
                    value={
                      form.borderRadius
                    }
                    min={0}
                    max={100}
                    onChange={(event) =>
                      updateForm(
                        "borderRadius",
                        Number(
                          event.target
                            .value
                        )
                      )
                    }
                    className="w-full rounded-xl border border-white/10 bg-zinc-900 p-3 text-white"
                  />
                </label>
              </div>

              <label className="block">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-bold text-zinc-300">
                    شفافية اللون
                  </span>

                  <span className="text-sm text-yellow-400">
                    {form.opacity}
                  </span>
                </div>

                <input
                  type="range"
                  min={0.05}
                  max={0.9}
                  step={0.05}
                  value={form.opacity}
                  onChange={(event) =>
                    updateForm(
                      "opacity",
                      Number(
                        event.target
                          .value
                      )
                    )
                  }
                  className="w-full"
                />
              </label>

              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <span className="font-bold text-white">
                  عرض الاسم
                </span>

                <Toggle
                  checked={
                    form.showLabel
                  }
                  onChange={(value) =>
                    updateForm(
                      "showLabel",
                      value
                    )
                  }
                />
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <span className="font-bold text-white">
                  المنطقة فعالة
                </span>

                <Toggle
                  checked={form.active}
                  onChange={(value) =>
                    updateForm(
                      "active",
                      value
                    )
                  }
                />
              </div>

              <button
                type="button"
                onClick={saveRegion}
                disabled={saving}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-yellow-500 p-4 font-black text-black transition hover:bg-yellow-400 disabled:opacity-50"
              >
                {saving ? (
                  <Loader2
                    size={20}
                    className="animate-spin"
                  />
                ) : (
                  <Save size={20} />
                )}

                {editingId
                  ? "حفظ التعديل"
                  : "إضافة المنطقة"}
              </button>
            </div>
          </aside>

          <RegionTitlesPreview
            regionKey={form.regionKey}
            regionName={form.name}
            regionColor={form.color}
            description={form.description}
          />
        </section>

        <section className="rounded-[30px] border border-white/10 bg-[#141414] p-6">
          <h2 className="text-2xl font-black text-white">
            المناطق المسجلة
          </h2>

          {loading ? (
            <div className="flex min-h-48 items-center justify-center">
              <Loader2
                size={38}
                className="animate-spin text-yellow-400"
              />
            </div>
          ) : regions.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-white/10 p-8 text-center text-zinc-500">
              لا توجد مناطق حتى الآن.
            </div>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {regions.map((region) => (
                <article
                  key={region.id}
                  className="rounded-2xl border border-white/10 bg-black/20 p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span
                        className="h-5 w-5 rounded-full"
                        style={{
                          backgroundColor:
                            region.color,
                        }}
                      />

                      <div>
                        <h3 className="font-black text-white">
                          {region.name}
                        </h3>

                        <p className="mt-1 text-xs text-zinc-500">
                          {
                            region.regionKey
                          }
                        </p>
                      </div>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        region.active
                          ? "bg-green-500/10 text-green-400"
                          : "bg-red-500/10 text-red-400"
                      }`}
                    >
                      {region.active
                        ? "فعالة"
                        : "مخفية"}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                    <div className="rounded-xl bg-white/[0.03] p-3 text-zinc-400">
                      X: {region.x}
                    </div>

                    <div className="rounded-xl bg-white/[0.03] p-3 text-zinc-400">
                      Y: {region.y}
                    </div>

                    <div className="rounded-xl bg-white/[0.03] p-3 text-zinc-400">
                      العرض:{" "}
                      {region.width}
                    </div>

                    <div className="rounded-xl bg-white/[0.03] p-3 text-zinc-400">
                      الارتفاع:{" "}
                      {region.height}
                    </div>
                  </div>

                  <div className="mt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        startEditing(
                          region
                        )
                      }
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-yellow-500/20 bg-yellow-500/10 py-3 font-bold text-yellow-400"
                    >
                      <Pencil size={17} />
                      تعديل
                    </button>

                    <button
                      type="button"
                      disabled={
                        deletingId ===
                        region.id
                      }
                      onClick={() =>
                        deleteRegion(
                          region
                        )
                      }
                      className="flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 font-bold text-red-400 disabled:opacity-50"
                    >
                      {deletingId ===
                      region.id ? (
                        <Loader2
                          size={17}
                          className="animate-spin"
                        />
                      ) : (
                        <Trash2
                          size={17}
                        />
                      )}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </RoleGuard>
  );
}