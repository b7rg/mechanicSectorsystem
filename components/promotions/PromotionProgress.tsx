type Props = {
  title: string;
  current: number;
  required: number;
};

export default function PromotionProgress({
  title,
  current,
  required,
}: Props) {
  const percent = Math.min(
    (current / required) * 100,
    100
  );

  return (
    <div className="rounded-2xl border border-white/10 bg-[#1b1b1b] p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-bold text-white">
          {title}
        </span>

        <span className="text-yellow-400">
          {current} / {required}
        </span>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-zinc-800">
        <div
          style={{
            width: `${percent}%`,
          }}
          className="h-full rounded-full bg-yellow-500 transition-all duration-500"
        />
      </div>
    </div>
  );
}