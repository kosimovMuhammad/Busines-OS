"use client";

import { KpiRow } from "./kpi-row";
import { RevenueChart } from "./revenue-chart";
import { PipelineBreakdown } from "./pipeline-breakdown";
import { TaskBreakdown } from "./task-breakdown";
import { ActivityFeed } from "./activity-feed";
import { UpcomingMeetings } from "./upcoming-meetings";
import { ForecastCard } from "./forecast-card";

export function DashboardContent() {
  return (
    <div className="space-y-6">
      <KpiRow />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <PipelineBreakdown />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <TaskBreakdown />
        <div className="lg:col-span-2">
          <ActivityFeed />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <UpcomingMeetings />
        <ForecastCard />
      </div>
    </div>
  );
}
