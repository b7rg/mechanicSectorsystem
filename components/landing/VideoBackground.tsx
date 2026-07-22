export default function VideoBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source
          src="/videos/hero-new.mp4"
          type="video/mp4"
        />
      </video>

      <div className="absolute inset-0 bg-black/60" />

      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-[#0b0b0b]" />
    </div>
  );
}