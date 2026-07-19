"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  collection,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";

import {
  AlertTriangle,
  BadgeCheck,
  ChevronDown,
  ChevronUp,
  Loader2,
  MapPinned,
  MousePointer2,
  ShieldCheck,
  UserRoundCog,
  X,
} from "lucide-react";

import { db } from "@/lib/firebase";

import {
  getTitlesForRegion,
  mechanicRegions,
  temporaryTitles,
  titleInstructions,
  type MechanicRegionKey,
} from "@/lib/mechanicTitles";

type GtaMapProps = {
  publicMode?: boolean;
};

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
  hoverOpacity: number;
  glow: number;

  showLabel: boolean;
  active: boolean;
};

const mapImageUrl =
  "/maps/gta-map.png";

function hexToRgba(
  hex: string,
  opacity: number
) {
  const cleaned = hex.replace("#", "");

  const full =
    cleaned.length === 3
      ? cleaned
          .split("")
          .map(
            (character) =>
              character + character
          )
          .join("")
      : cleaned.padEnd(6, "0").slice(0, 6);

  const red =
    Number.parseInt(full.slice(0, 2), 16) || 0;

  const green =
    Number.parseInt(full.slice(2, 4), 16) || 0;

  const blue =
    Number.parseInt(full.slice(4, 6), 16) || 0;

  return `rgba(${red}, ${green}, ${blue}, ${opacity})`;
}

function clamp(
  value: number,
  min: number,
  max: number
) {
  return Math.max(min, Math.min(max, value));
}

function rectangleToPoints(
  x: number,
  y: number,
  width: number,
  height: number
): MapPoint[] {
  const left = clamp(x, 0, 100);
  const top = clamp(y, 0, 100);
  const right = clamp(x + width, 0, 100);
  const bottom = clamp(y + height, 0, 100);

  return [
    { x: left, y: top },
    { x: right, y: top },
    { x: right, y: bottom },
    { x: left, y: bottom },
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
        !item ||
        typeof item !== "object"
      ) {
        return null;
      }

      const point =
        item as Record<string, unknown>;

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

function pointsToSmoothPath(
  points: MapPoint[]
) {
  if (points.length < 3) {
    return "";
  }

  const tension = 0.82;
  const total = points.length;

  let path =
    `M ${points[0].x} ${points[0].y}`;

  for (
    let index = 0;
    index < total;
    index += 1
  ) {
    const previous =
      points[
        (index - 1 + total) % total
      ];

    const current = points[index];

    const next =
      points[(index + 1) % total];

    const following =
      points[(index + 2) % total];

    const controlOne = {
      x:
        current.x +
        ((next.x - previous.x) / 6) *
          tension,
      y:
        current.y +
        ((next.y - previous.y) / 6) *
          tension,
    };

    const controlTwo = {
      x:
        next.x -
        ((following.x - current.x) / 6) *
          tension,
      y:
        next.y -
        ((following.y - current.y) / 6) *
          tension,
    };

    path +=
      ` C ${controlOne.x.toFixed(2)} ${controlOne.y.toFixed(2)}` +
      ` ${controlTwo.x.toFixed(2)} ${controlTwo.y.toFixed(2)}` +
      ` ${next.x.toFixed(2)} ${next.y.toFixed(2)}`;
  }

  return `${path} Z`;
}

function getRegionLabelPosition(
  points: MapPoint[]
) {
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

function TitleBox({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-yellow-500/20 bg-black/40 px-4 py-3 font-mono text-sm font-black text-yellow-300">
      {children}
    </div>
  );
}

function RegionInformation({
  region,
  onClose,
}: {
  region: MapRegion;
  onClose: () => void;
}) {
  const [
    showTemporary,
    setShowTemporary,
  ] = useState(false);

  const [
    showInstructions,
    setShowInstructions,
  ] = useState(false);

  const mechanicRegion =
    mechanicRegions[
      region.regionKey
    ];

  const titleGroups = useMemo(
    () =>
      getTitlesForRegion(
        region.regionKey
      ),
    [region.regionKey]
  );

  return (
    <div
      dir="rtl"
      className="max-h-[850px] overflow-y-auto rounded-[28px] border border-yellow-500/20 bg-[#101010]/95 p-5 shadow-2xl backdrop-blur-2xl"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span
              className="h-4 w-4 rounded-full"
              style={{
                backgroundColor:
                  region.color,
                boxShadow: `0 0 16px ${region.color}`,
              }}
            />

            <BadgeCheck
              size={24}
              className="text-yellow-400"
            />

            <h2 className="text-2xl font-black text-yellow-400">
              مسميات{" "}
              {
                mechanicRegion.shortName
              }
            </h2>
          </div>

          {region.description && (
            <p className="mt-3 text-sm leading-7 text-zinc-400">
              {region.description}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-white/10 bg-white/5 p-2 text-zinc-400 transition hover:text-white"
        >
          <X size={19} />
        </button>
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
                <TitleBox>
                  {
                    group.defaultTitle
                      .fullTitle
                  }
                </TitleBox>

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

                <TitleBox>
                  {
                    group.withoutApproval
                      .fullTitle
                  }
                </TitleBox>
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

                <TitleBox>
                  {
                    group.withApproval
                      .fullTitle
                  }
                </TitleBox>
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
                المسميات الميدانية
                المؤقتة
              </h3>

              <p className="mt-1 text-xs text-zinc-500">
                تستخدم أثناء استلام
                المهمة فقط.
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
            {temporaryTitles.map(
              (title) => (
                <div
                  key={title.id}
                  className="rounded-xl border border-white/10 bg-black/20 p-3"
                >
                  <TitleBox>
                    G - 000 |{" "}
                    {title.title}
                  </TitleBox>

                  <p className="mt-2 text-xs leading-6 text-zinc-500">
                    {
                      title.description
                    }
                  </p>
                </div>
              )
            )}
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
            <AlertTriangle
              size={21}
              className="text-red-400"
            />

            <div>
              <h3 className="font-black text-white">
                تنبيهات استخدام
                المسميات
              </h3>

              <p className="mt-1 text-xs text-zinc-500">
                ضوابط إلزامية لجميع
                أفراد القطاع.
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
              (
                instruction,
                index
              ) => (
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
    </div>
  );
}

export default function GtaMap({
  publicMode = false,
}: GtaMapProps) {
  const [regions, setRegions] =
    useState<MapRegion[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [
    hoveredRegionId,
    setHoveredRegionId,
  ] = useState<string | null>(null);

  const [
    selectedRegionId,
    setSelectedRegionId,
  ] = useState<string | null>(null);

  useEffect(() => {
    const regionsQuery = query(
      collection(db, "mapRegions"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(
      regionsQuery,
      (snapshot) => {
        const nextRegions = snapshot.docs
          .map((regionDocument) => {
            const data =
              regionDocument.data();

            let points =
              normalizePoints(data.points);

            if (points.length < 3) {
              points = rectangleToPoints(
                Number(data.x ?? 0),
                Number(data.y ?? 0),
                Number(data.width ?? 20),
                Number(data.height ?? 15)
              );
            }

            const opacity = clamp(
              Number(data.opacity ?? 0.22),
              0.05,
              0.9
            );

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

              opacity,

              hoverOpacity: clamp(
                Number(
                  data.hoverOpacity ??
                    opacity + 0.28
                ),
                opacity,
                0.95
              ),

              glow: clamp(
                Number(data.glow ?? 16),
                0,
                50
              ),

              showLabel:
                data.showLabel !==
                false,

              active:
                data.active !== false,
            } satisfies MapRegion;
          })
          .filter(
            (region) =>
              region.active
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

  const activeRegionId =
    selectedRegionId ??
    hoveredRegionId;

  const activeRegion =
    regions.find(
      (region) =>
        region.id === activeRegionId
    ) ?? null;

  if (loading) {
    return (
      <div className="flex min-h-[650px] items-center justify-center rounded-[30px] border border-white/10 bg-[#141414]">
        <Loader2
          size={40}
          className="animate-spin text-yellow-400"
        />
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="rounded-[30px] border border-red-500/20 bg-red-500/10 p-8 text-center font-bold text-red-400">
        {errorMessage}
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      className="space-y-5"
    >
      <section className="rounded-[28px] border border-white/10 bg-[#141414]/95 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-yellow-500/20 bg-yellow-500/10">
              <MapPinned
                size={24}
                className="text-yellow-400"
              />
            </div>

            <div>
              <h2 className="text-xl font-black text-white">
                خريطة المسميات
                المعتمدة
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                مرر الماوس فوق المنطقة
                لعرض مسمياتها.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-4 py-2 text-sm font-bold text-yellow-400">
            <MousePointer2 size={17} />

            على الجوال اضغط على
            المنطقة
          </div>
        </div>
      </section>

      <section className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_430px]">
        <div
          className="relative overflow-hidden rounded-[32px] border border-yellow-500/20 bg-black shadow-2xl"
          onMouseLeave={() =>
            setHoveredRegionId(null)
          }
        >
          <img
            src={mapImageUrl}
            alt="خريطة توزيع قطاع الميكانيك"
            className="block h-auto w-full select-none"
            draggable={false}
          />

          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 z-10 h-full w-full"
            aria-label="مناطق الخريطة"
          >
            {regions.map((region) => {
              const active =
                activeRegionId ===
                region.id;

              const path =
                pointsToSmoothPath(
                  region.points
                );

              if (!path) {
                return null;
              }

              return (
                <path
                  key={region.id}
                  d={path}
                  role="button"
                  tabIndex={0}
                  aria-label={`عرض مسميات ${region.name}`}
                  vectorEffect="non-scaling-stroke"
                  onMouseEnter={() =>
                    setHoveredRegionId(
                      region.id
                    )
                  }
                  onMouseLeave={() =>
                    setHoveredRegionId(
                      null
                    )
                  }
                  onFocus={() =>
                    setHoveredRegionId(
                      region.id
                    )
                  }
                  onBlur={() =>
                    setHoveredRegionId(
                      null
                    )
                  }
                  onClick={() =>
                    setSelectedRegionId(
                      (current) =>
                        current ===
                        region.id
                          ? null
                          : region.id
                    )
                  }
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" ||
                      event.key === " "
                    ) {
                      event.preventDefault();

                      setSelectedRegionId(
                        (current) =>
                          current ===
                          region.id
                            ? null
                            : region.id
                      );
                    }
                  }}
                  fill={hexToRgba(
                    region.color,
                    active
                      ? region.hoverOpacity
                      : region.opacity
                  )}
                  stroke={region.color}
                  strokeWidth={
                    active ? 3 : 1.8
                  }
                  className="cursor-pointer outline-none transition-all duration-300"
                  style={{
                    filter:
                      region.glow > 0
                        ? `drop-shadow(0 0 ${
                            active
                              ? region.glow
                              : Math.max(
                                  4,
                                  region.glow *
                                    0.45
                                )
                          }px ${hexToRgba(
                            region.color,
                            active
                              ? 0.9
                              : 0.5
                          )})`
                        : "none",

                    opacity:
                      active ? 1 : 0.94,
                  }}
                />
              );
            })}
          </svg>

          <div className="pointer-events-none absolute inset-0 z-20">
            {regions
              .filter(
                (region) =>
                  region.showLabel
              )
              .map((region) => {
                const position =
                  getRegionLabelPosition(
                    region.points
                  );

                const active =
                  activeRegionId ===
                  region.id;

                return (
                  <span
                    key={`${region.id}-label`}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-black text-white shadow-xl backdrop-blur-md transition-all duration-300 md:px-4 md:py-2 md:text-sm ${
                      active
                        ? "scale-105"
                        : "scale-100"
                    }`}
                    style={{
                      left: `${position.x}%`,
                      top: `${position.y}%`,
                      borderColor:
                        region.color,
                      backgroundColor:
                        "rgba(0,0,0,.78)",
                      boxShadow: active
                        ? `0 0 24px ${hexToRgba(
                            region.color,
                            0.65
                          )}`
                        : undefined,
                    }}
                  >
                    {region.name}
                  </span>
                );
              })}
          </div>

          {regions.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="rounded-2xl border border-yellow-500/20 bg-black/85 px-6 py-4 text-center font-bold text-yellow-400">
                لم تتم إضافة مناطق حتى
                الآن.
              </div>
            </div>
          )}
        </div>

        <aside className="min-h-[650px]">
          {activeRegion ? (
            <RegionInformation
              region={activeRegion}
              onClose={() => {
                setSelectedRegionId(
                  null
                );

                setHoveredRegionId(
                  null
                );
              }}
            />
          ) : (
            <div className="flex min-h-[650px] items-center justify-center rounded-[28px] border border-dashed border-white/10 bg-[#101010] p-8 text-center">
              <div>
                <MousePointer2
                  size={48}
                  className="mx-auto text-yellow-400"
                />

                <h3 className="mt-5 text-xl font-black text-white">
                  اختر منطقة من
                  الخريطة
                </h3>

                <p className="mx-auto mt-3 max-w-sm leading-8 text-zinc-500">
                  عند مرور الماوس فوق
                  المنطقة تظهر المسميات
                  المعتمدة هنا.
                </p>
              </div>
            </div>
          )}
        </aside>
      </section>

      {!publicMode && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-zinc-500">
          الإضافة والتعديل متاحان فقط من صفحة إدارة الخريطة
          لأصحاب الصلاحية.
        </div>
      )}
    </div>
  );
}