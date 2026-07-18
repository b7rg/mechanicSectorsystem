"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

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
  Eraser,
  Loader2,
  MapPinned,
  Pencil,
  Plus,
  Redo2,
  Save,
  Sparkles,
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

type MapPoint = {
  x: number;
  y: number;
};

type MapRegion = {
  id: string;
  name: string;
  description: string;
  regionKey: MechanicRegionKey;
  points: MapPoint[];
  color: string;
  opacity: number;
  glow: number;
  showLabel: boolean;
  active: boolean;
};

type RegionForm = Omit<MapRegion, "id">;

const mapImageUrl = "/maps/gta-map.png";

const emptyForm: RegionForm = {
  name: "منطقة جديدة",
  description: "",
  regionKey: "los",
  points: [],
  color: "#facc15",
  opacity: 0.22,
  glow: 16,
  showLabel: true,
  active: true,
};

const regionOptions: Array<{
  value: MechanicRegionKey;
  label: string;
}> = [
  { value: "los", label: "لوس" },
  { value: "sandy", label: "ساندي" },
  { value: "paleto", label: "بوليتو" },
  { value: "coast", label: "الساحل" },
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
  const clean = hex.replace("#", "").trim();

  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((item) => item + item)
          .join("")
      : clean.padEnd(6, "0").slice(0, 6);

  const red =
    Number.parseInt(full.slice(0, 2), 16) || 0;
  const green =
    Number.parseInt(full.slice(2, 4), 16) || 0;
  const blue =
    Number.parseInt(full.slice(4, 6), 16) || 0;

  return `rgba(${red}, ${green}, ${blue}, ${opacity})`;
}

function distance(
  first: MapPoint,
  second: MapPoint
) {
  return Math.hypot(
    first.x - second.x,
    first.y - second.y
  );
}

function perpendicularDistance(
  point: MapPoint,
  lineStart: MapPoint,
  lineEnd: MapPoint
) {
  const dx = lineEnd.x - lineStart.x;
  const dy = lineEnd.y - lineStart.y;

  if (dx === 0 && dy === 0) {
    return distance(point, lineStart);
  }

  const numerator = Math.abs(
    dy * point.x -
      dx * point.y +
      lineEnd.x * lineStart.y -
      lineEnd.y * lineStart.x
  );

  return numerator / Math.hypot(dx, dy);
}

function simplifyPoints(
  points: MapPoint[],
  tolerance = 0.45
): MapPoint[] {
  if (points.length <= 3) {
    return points;
  }

  let maxDistance = 0;
  let index = 0;

  for (
    let current = 1;
    current < points.length - 1;
    current += 1
  ) {
    const nextDistance =
      perpendicularDistance(
        points[current],
        points[0],
        points[points.length - 1]
      );

    if (nextDistance > maxDistance) {
      maxDistance = nextDistance;
      index = current;
    }
  }

  if (maxDistance <= tolerance) {
    return [
      points[0],
      points[points.length - 1],
    ];
  }

  const left = simplifyPoints(
    points.slice(0, index + 1),
    tolerance
  );

  const right = simplifyPoints(
    points.slice(index),
    tolerance
  );

  return [
    ...left.slice(0, -1),
    ...right,
  ];
}

function createSmoothClosedPath(
  points: MapPoint[]
) {
  if (points.length < 3) {
    return "";
  }

  const last = points[points.length - 1];
  const first = points[0];

  const startX = (last.x + first.x) / 2;
  const startY = (last.y + first.y) / 2;

  let path = `M ${startX} ${startY}`;

  points.forEach((point, index) => {
    const next =
      points[(index + 1) % points.length];

    const midX = (point.x + next.x) / 2;
    const midY = (point.y + next.y) / 2;

    path += ` Q ${point.x} ${point.y} ${midX} ${midY}`;
  });

  return `${path} Z`;
}

function getBounds(points: MapPoint[]) {
  if (points.length === 0) {
    return {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    };
  }

  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  return {
    x: Number(minX.toFixed(2)),
    y: Number(minY.toFixed(2)),
    width: Number(
      Math.max(0.5, maxX - minX).toFixed(2)
    ),
    height: Number(
      Math.max(0.5, maxY - minY).toFixed(2)
    ),
  };
}

function getCenter(points: MapPoint[]) {
  if (points.length === 0) {
    return { x: 50, y: 50 };
  }

  const total = points.reduce(
    (result, point) => ({
      x: result.x + point.x,
      y: result.y + point.y,
    }),
    { x: 0, y: 0 }
  );

  return {
    x: total.x / points.length,
    y: total.y / points.length,
  };
}

function rectangleToPoints(
  x: number,
  y: number,
  width: number,
  height: number
): MapPoint[] {
  return [
    { x, y },
    { x: x + width, y },
    { x: x + width, y: y + height },
    { x, y: y + height },
  ];
}

function normalizePoints(
  value: unknown
): MapPoint[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (
        typeof item !== "object" ||
        item === null
      ) {
        return null;
      }

      const point = item as Record<
        string,
        unknown
      >;

      const x = Number(point.x);
      const y = Number(point.y);

      if (
        !Number.isFinite(x) ||
        !Number.isFinite(y)
      ) {
        return null;
      }

      return {
        x: clamp(x, 0, 100),
        y: clamp(y, 0, 100),
      };
    })
    .filter(
      (point): point is MapPoint =>
        point !== null
    );
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
      aria-pressed={checked}
    >
      <span
        className={`absolute top-1 h-6 w-6 rounded-full bg-white transition ${
          checked ? "right-7" : "right-1"
        }`}
      />
    </button>
  );
}

export default function ManageMapRegionsPage() {
  const mapRef =
    useRef<HTMLDivElement | null>(null);

  const [regions, setRegions] = useState<
    MapRegion[]
  >([]);

  const [form, setForm] =
    useState<RegionForm>(emptyForm);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [drawingMode, setDrawingMode] =
    useState(false);

  const [drawing, setDrawing] =
    useState(false);

  const [draftPoints, setDraftPoints] =
    useState<MapPoint[]>([]);

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
        const nextRegions =
          snapshot.docs.map(
            (regionDocument) => {
              const data =
                regionDocument.data();

              let points =
                normalizePoints(data.points);

              if (points.length < 3) {
                const x = Number(
                  data.x ?? 45
                );
                const y = Number(
                  data.y ?? 45
                );
                const width = Number(
                  data.width ?? 20
                );
                const height = Number(
                  data.height ?? 15
                );

                points = rectangleToPoints(
                  x,
                  y,
                  width,
                  height
                );
              }

              return {
                id: regionDocument.id,
                name:
                  typeof data.name ===
                  "string"
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
                points,
                color:
                  typeof data.color ===
                  "string"
                    ? data.color
                    : "#facc15",
                opacity: Number(
                  data.opacity ?? 0.22
                ),
                glow: Number(
                  data.glow ?? 16
                ),
                showLabel:
                  data.showLabel !== false,
                active:
                  data.active !== false,
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

  const activeDrawingPoints =
    drawing && draftPoints.length > 0
      ? draftPoints
      : form.points;

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
    setDrawingMode(false);
    setDrawing(false);
    setDraftPoints([]);
    setMessage("");
    setErrorMessage("");
  }

  function startNewRegion() {
    setEditingId(null);
    setForm({
      ...emptyForm,
      name: "منطقة جديدة",
    });
    setDraftPoints([]);
    setDrawingMode(true);
    setMessage(
      "اسحب بإصبعك أو بالماوس حول المنطقة، واترك السحب عند النهاية."
    );
    setErrorMessage("");

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
      points: region.points,
      color: region.color,
      opacity: region.opacity,
      glow: region.glow,
      showLabel: region.showLabel,
      active: region.active,
    });
    setDrawingMode(false);
    setDrawing(false);
    setDraftPoints([]);
    setMessage(
      "يمكن تعديل البيانات أو الضغط على إعادة الرسم."
    );
    setErrorMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function beginRedraw() {
    setForm((current) => ({
      ...current,
      points: [],
    }));
    setDraftPoints([]);
    setDrawingMode(true);
    setDrawing(false);
    setMessage(
      "ابدئ السحب فوق الخريطة لرسم المنطقة من جديد."
    );
    setErrorMessage("");
  }

  function getPointerPoint(
    event: ReactPointerEvent<
      HTMLDivElement
    >
  ): MapPoint | null {
    const container = mapRef.current;

    if (!container) {
      return null;
    }

    const bounds =
      container.getBoundingClientRect();

    if (
      bounds.width <= 0 ||
      bounds.height <= 0
    ) {
      return null;
    }

    return {
      x: Number(
        clamp(
          ((event.clientX - bounds.left) /
            bounds.width) *
            100,
          0,
          100
        ).toFixed(2)
      ),
      y: Number(
        clamp(
          ((event.clientY - bounds.top) /
            bounds.height) *
            100,
          0,
          100
        ).toFixed(2)
      ),
    };
  }

  function handlePointerDown(
    event: ReactPointerEvent<
      HTMLDivElement
    >
  ) {
    if (!drawingMode) {
      return;
    }

    const point = getPointerPoint(event);

    if (!point) {
      return;
    }

    event.currentTarget.setPointerCapture(
      event.pointerId
    );

    setDrawing(true);
    setDraftPoints([point]);
    setMessage(
      "استمر بالسحب حول حدود المنطقة."
    );
  }

  function handlePointerMove(
    event: ReactPointerEvent<
      HTMLDivElement
    >
  ) {
    if (!drawingMode || !drawing) {
      return;
    }

    const point = getPointerPoint(event);

    if (!point) {
      return;
    }

    setDraftPoints((current) => {
      const last =
        current[current.length - 1];

      if (
        last &&
        distance(last, point) < 0.28
      ) {
        return current;
      }

      const next = [...current, point];

      return next.length > 450
        ? next.filter(
            (_, index) => index % 2 === 0
          )
        : next;
    });
  }

  function finishDrawing() {
    if (!drawingMode || !drawing) {
      return;
    }

    setDrawing(false);

    if (draftPoints.length < 6) {
      setDraftPoints([]);
      setErrorMessage(
        "الرسم قصير جدًا. اسحب حول مساحة أكبر."
      );
      return;
    }

    const simplified =
      simplifyPoints(
        draftPoints,
        0.38
      ).slice(0, 140);

    if (simplified.length < 3) {
      setDraftPoints([]);
      setErrorMessage(
        "تعذر تكوين المنطقة. أعد الرسم."
      );
      return;
    }

    setForm((current) => ({
      ...current,
      points: simplified,
    }));

    setDraftPoints([]);
    setDrawingMode(false);
    setErrorMessage("");
    setMessage(
    "تم رسم المنطقة بانحناءات ناعمة. عدل اللون والتوهج ثم احفظ "
    );
  }

  async function saveRegion() {
    const cleanName =
      form.name.trim();

    if (!cleanName) {
      setErrorMessage(
        "اكتب اسم المنطقة."
      );
      return;
    }

    if (form.points.length < 3) {
      setErrorMessage(
        "ارسم حدود المنطقة أولًا."
      );
      return;
    }

    const bounds =
      getBounds(form.points);

    try {
      setSaving(true);
      setMessage("");
      setErrorMessage("");

      const payload = {
        name: cleanName,
        description:
          form.description.trim(),
        regionKey: form.regionKey,
        points: form.points.map(
          (point) => ({
            x: Number(
              point.x.toFixed(2)
            ),
            y: Number(
              point.y.toFixed(2)
            ),
          })
        ),
        color: form.color,
        opacity: Number(form.opacity),
        glow: Number(form.glow),
        showLabel: form.showLabel,
        active: form.active,

        // تبقى للتوافق مع أي مكون قديم يعتمد على المستطيل.
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height,
        rotate: 0,
        borderRadius: 30,

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
      setDrawingMode(false);
      setDrawing(false);
      setDraftPoints([]);
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
        `هل تريد حذف منطقة "${region.name}"؟`
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
                رسم مناطق الخريطة
              </h1>

              <p className="mt-2 text-zinc-400">
                ارسم المنطقة بحرية، والنظام
                يحولها لشكل ناعم ومتوهج.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={startNewRegion}
            className="flex items-center gap-2 rounded-2xl bg-yellow-500 px-5 py-3 font-black text-black transition hover:bg-yellow-400"
          >
            <Plus size={19} />
            رسم منطقة جديدة
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

        <section className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
          <div className="space-y-4">
            <div
              className={`flex items-center justify-between gap-4 rounded-2xl border px-4 py-3 text-sm font-bold ${
                drawingMode
                  ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-300"
                  : "border-white/10 bg-white/[0.03] text-zinc-400"
              }`}
            >
              <div className="flex items-center gap-2">
                <Pencil size={18} />

                {drawingMode
                  ? "اسحب حول حدود المنطقة واترك السحب عند النهاية."
                  : "اختار منطقة للتعديل أو ابدئ رسم منطقة جديدة."}
              </div>

              {(form.points.length > 0 ||
                draftPoints.length > 0) && (
                <button
                  type="button"
                  onClick={beginRedraw}
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white"
                >
                  <Redo2 size={16} />
                  إعادة الرسم
                </button>
              )}
            </div>

            <div
              ref={mapRef}
              onPointerDown={
                handlePointerDown
              }
              onPointerMove={
                handlePointerMove
              }
              onPointerUp={
                finishDrawing
              }
              onPointerCancel={
                finishDrawing
              }
              className={`relative touch-none overflow-hidden rounded-[30px] border bg-black shadow-2xl ${
                drawingMode
                  ? "cursor-crosshair border-yellow-500/40"
                  : "border-white/10"
              }`}
            >
              <img
                src={mapImageUrl}
                alt="خريطة قطاع الميكانيك"
                className="block h-auto w-full select-none"
                draggable={false}
              />

              <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="absolute inset-0 h-full w-full"
              >
                {previewRegions.map(
                  (region) => {
                    const editing =
                      region.id ===
                      editingId;

                    return (
                      <path
                        key={region.id}
                        d={createSmoothClosedPath(
                          region.points
                        )}
                        fill={hexToRgba(
                          region.color,
                          region.opacity
                        )}
                        stroke={
                          region.color
                        }
                        strokeWidth={
                          editing
                            ? 0.75
                            : 0.45
                        }
                        vectorEffect="non-scaling-stroke"
                        className={
                          drawingMode
                            ? "pointer-events-none"
                            : "cursor-pointer transition-opacity hover:opacity-90"
                        }
                        style={{
                          filter: `drop-shadow(0 0 ${Math.max(
                            2,
                            region.glow * 0.32
                          )}px ${region.color}) drop-shadow(0 0 ${Math.max(
                            4,
                            region.glow
                          )}px ${hexToRgba(
                            region.color,
                            0.8
                          )})`,
                        }}
                        onPointerDown={(
                          event
                        ) => {
                          if (
                            drawingMode
                          ) {
                            return;
                          }

                          event.stopPropagation();
                          startEditing(
                            region
                          );
                        }}
                      />
                    );
                  }
                )}

                {activeDrawingPoints.length >=
                  2 && (
                  <path
                    d={
                      activeDrawingPoints.length >=
                      3
                        ? createSmoothClosedPath(
                            activeDrawingPoints
                          )
                        : `M ${activeDrawingPoints[0].x} ${activeDrawingPoints[0].y} L ${activeDrawingPoints[1].x} ${activeDrawingPoints[1].y}`
                    }
                    fill={
                      activeDrawingPoints.length >=
                      3
                        ? hexToRgba(
                            form.color,
                            form.opacity
                          )
                        : "none"
                    }
                    stroke={
                      form.color
                    }
                    strokeWidth={0.8}
                    strokeDasharray={
                      drawing
                        ? "1.5 1"
                        : undefined
                    }
                    vectorEffect="non-scaling-stroke"
                    className="pointer-events-none"
                    style={{
                      filter: `drop-shadow(0 0 ${Math.max(
                        2,
                        form.glow * 0.32
                      )}px ${form.color}) drop-shadow(0 0 ${Math.max(
                        4,
                        form.glow
                      )}px ${hexToRgba(
                        form.color,
                        0.8
                      )})`,
                    }}
                  />
                )}
              </svg>

              {previewRegions.map(
                (region) => {
                  if (
                    !region.showLabel ||
                    region.points.length <
                      3
                  ) {
                    return null;
                  }

                  const center =
                    getCenter(
                      region.points
                    );

                  return (
                    <button
                      key={`label-${region.id}`}
                      type="button"
                      onClick={() =>
                        startEditing(
                          region
                        )
                      }
                      className="absolute z-20 -translate-x-1/2 -translate-y-1/2 rounded-full border bg-black/80 px-3 py-1.5 text-xs font-black text-white shadow-xl backdrop-blur-md"
                      style={{
                        left: `${center.x}%`,
                        top: `${center.y}%`,
                        borderColor:
                          region.color,
                        boxShadow: `0 0 16px ${hexToRgba(
                          region.color,
                          0.55
                        )}`,
                      }}
                    >
                      {region.name}
                    </button>
                  );
                }
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
                  الرسم يحدد الموقع والحجم
                  والانحناءات تلقائيًا.
                </p>
              </div>

              {(editingId ||
                form.points.length >
                  0) && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-white/10 bg-white/5 p-2 text-zinc-400 hover:text-white"
                  aria-label="إغلاق التعديل"
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
                  value={form.regionKey}
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
                        key={option.value}
                        value={option.value}
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
                        event.target.value
                      )
                    }
                    className="h-14 w-20 cursor-pointer rounded-xl border border-white/10 bg-zinc-900 p-2"
                  />

                  <input
                    value={form.color}
                    onChange={(event) =>
                      updateForm(
                        "color",
                        event.target.value
                      )
                    }
                    dir="ltr"
                    className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-zinc-900 p-4 text-left text-white outline-none focus:border-yellow-500"
                  />
                </div>
              </label>

              <label className="block rounded-2xl border border-yellow-500/10 bg-yellow-500/[0.03] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-2 font-bold text-zinc-200">
                    <Sparkles
                      size={17}
                      className="text-yellow-400"
                    />
                    قوة التوهج
                  </span>

                  <span className="text-sm font-black text-yellow-400">
                    {form.glow}
                  </span>
                </div>

                <input
                  type="range"
                  min={0}
                  max={32}
                  step={1}
                  value={form.glow}
                  onChange={(event) =>
                    updateForm(
                      "glow",
                      Number(
                        event.target.value
                      )
                    )
                  }
                  className="w-full"
                />
              </label>

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
                  max={0.75}
                  step={0.05}
                  value={form.opacity}
                  onChange={(event) =>
                    updateForm(
                      "opacity",
                      Number(
                        event.target.value
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

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={beginRedraw}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-4 font-black text-white transition hover:border-yellow-500/30"
                >
                  <Eraser size={18} />
                  إعادة الرسم
                </button>

                <button
                  type="button"
                  onClick={saveRegion}
                  disabled={saving}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-yellow-500 p-4 font-black text-black transition hover:bg-yellow-400 disabled:opacity-50"
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
                    ? "حفظ"
                    : "إضافة"}
                </button>
              </div>
            </div>
          </aside>
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
                  style={{
                    boxShadow:
                      region.glow > 0
                        ? `inset 0 0 0 1px ${hexToRgba(
                            region.color,
                            0.18
                          )}`
                        : undefined,
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span
                        className="h-5 w-5 rounded-full"
                        style={{
                          backgroundColor:
                            region.color,
                          boxShadow: `0 0 ${Math.max(
                            6,
                            region.glow
                          )}px ${region.color}`,
                        }}
                      />

                      <div>
                        <h3 className="font-black text-white">
                          {region.name}
                        </h3>

                        <p className="mt-1 text-xs text-zinc-500">
                          {
                            regionOptions.find(
                              (option) =>
                                option.value ===
                                region.regionKey
                            )?.label
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