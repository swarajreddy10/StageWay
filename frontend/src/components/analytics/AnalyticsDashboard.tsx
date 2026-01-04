"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RegistrationChart } from "./RegistrationChart";
import { AttendeeStats } from "./AttendeeStats";
import type { EventAnalytics } from "@/types/analytics";

interface AnalyticsDashboardProps {
  analytics: EventAnalytics;
}

export function AnalyticsDashboard({ analytics }: AnalyticsDashboardProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-3xl border border-white/70 bg-white/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalRegistrations}</div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-white/70 bg-white/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Checked In</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.checkedInCount}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.checkInRate.toFixed(1)}% check-in rate
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-white/70 bg-white/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Check-ins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.totalRegistrations - analytics.checkedInCount}
            </div>
          </CardContent>
        </Card>

        {analytics.revenue && (
          <Card className="rounded-3xl border border-white/70 bg-white/80 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics.revenue.currency} {analytics.revenue.total.toFixed(2)}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <RegistrationChart data={analytics.registrationTrend} />

      <AttendeeStats
        demographics={analytics.attendeeDemographics}
        timeSlots={analytics.popularTimeSlots}
      />
    </div>
  );
}
