export const metadata = {
  title: "ورشة علي حنش",
  description: "مجموعة تحديات ميكانيكية تفاعلية داخل ورشة علي حنش",
};

export default function AliHanishWorkshopPage() {
  return (
    <main className="fixed inset-0 overflow-hidden bg-black">
      <iframe
        src="/game/ali-hanish-workshop.html"
        title="ورشة علي حنش"
        className="h-full w-full border-0"
        allow="fullscreen"
      />
    </main>
  );
}
