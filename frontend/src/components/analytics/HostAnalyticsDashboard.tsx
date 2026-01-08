"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { HostAnalytics } from "@/types/analytics";
import { TrendingUp, Users, Calendar, DollarSign } from "lucide-react";

interface HostAnalyticsDashboardProps {
  analytics: HostAnalytics;
}

const COLORS = ["#1E5A55", "#D8573B", "#F4A261", "#2A9D8F", "#E76F51", "#264653"];

export function HostAnalyticsDashboard({ analytics }: HostAnalyticsDashboardProps) {
  const { overview, topEvents, categoryBreakdown, revenueTimeline, registrationStatus, engagement } = analytics;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-3xl border border-white/70 bg-white/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalEvents}</div>
            <p className="text-xs text-muted-foreground">{overview.publishedEvents} published</p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-white/70 bg-white/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalRegistrations}</div>
            <p className="text-xs text-muted-foreground">{overview.confirmedRegistrations} confirmed</p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-white/70 bg-white/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Check-In Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{engagement.avgCheckInRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {engagement.avgRegistrationsPerEvent.toFixed(1)} avg regs/event
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-white/70 bg-white/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peak Hour</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{engagement.peakRegistrationHour}:00</div>
            <p className="text-xs text-muted-foreground">
              {engagement.cancellationRate.toFixed(1)}% cancellation rate
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="rounded-3xl border border-white/70 bg-white/80 shadow-sm">
          <CardHeader>
            <CardTitle>Top Performing Events</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topEvents}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="eventName" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="registrations" fill="#1E5A55" name="Registrations" />
                <Bar dataKey="checkedIn" fill="#D8573B" name="Checked In" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-white/70 bg-white/80 shadow-sm">
          <CardHeader>
            <CardTitle>Registration Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={registrationStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="status"
                >
                  {registrationStatus.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-3xl border border-white/70 bg-white/80 shadow-sm">
        <CardHeader>
          <CardTitle>Revenue Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueTimeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                stroke="#1E5A55"
                strokeWidth={2}
                name="Revenue"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="registrations"
                stroke="#D8573B"
                strokeWidth={2}
                name="Registrations"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border border-white/70 bg-white/80 shadow-sm">
        <CardHeader>
          <CardTitle>Category Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryBreakdown} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" />
              <YAxis dataKey="category" type="category" width={100} />
              <Tooltip />
              <Legend />
              <Bar dataKey="totalRegistrations" fill="#1E5A55" name="Total Registrations" />
              <Bar dataKey="eventCount" fill="#F4A261" name="Event Count" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
