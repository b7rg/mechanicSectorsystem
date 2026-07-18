interface Props {
  title: string;
  subtitle: string;
}

export default function SectionTitle({
  title,
  subtitle,
}: Props) {
  return (
    <div className="mb-16 text-center">

      <p className="logo text-sm tracking-[6px] text-yellow-400 uppercase">
        {subtitle}
      </p>

      <h2 className="mt-4 text-5xl font-bold">
        {title}
      </h2>

    </div>
  );
}