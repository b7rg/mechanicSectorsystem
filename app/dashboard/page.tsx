import Hero from "@/components/dashboard/Hero";
import StatsCards from "@/components/dashboard/StatsCards";
import LevelsStats from "@/components/dashboard/LevelsStats";
import LevelChart from "@/components/dashboard/LevelChart";
import ActivityCard from "@/components/dashboard/ActivityCard";

export default function DashboardPage() {
  return (
    <main className="space-y-8">
      <Hero />

      <StatsCards />

      <LevelsStats />

      <div className="grid gap-8 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <LevelChart />
        </div>

        <ActivityCard />
      </div>
    </main>
  );
}