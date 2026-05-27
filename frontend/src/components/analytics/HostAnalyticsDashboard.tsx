"use client";

import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import type { HostAnalytics } from "@/types/analytics";
import { Calendar, Users, TrendingUp, Clock } from "lucide-react";
import { motion } from "framer-motion";

interface Props { analytics: HostAnalytics; }

const MONO = ["#ffffff", "#888888", "#555555", "#333333", "#aaaaaa", "#666666"];

const darkTooltip = {
  contentStyle: {
    background: "#0a0a0a",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "10px",
    fontSize: "12px",
    color: "rgba(255,255,255,0.8)",
  },
  cursor: { fill: "rgba(255,255,255,0.03)" },
};

function StatTile({ icon, label, value, sub }: {
  icon: React.ReactNode; label: string; value: string | number; sub: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#0e1018] p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-white/40 font-medium uppercase tracking-wider">{label}</p>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04]">{icon}</div>
      </div>
      <p className="font-display text-3xl font-bold text-white">{value}</p>
      <p className="text-xs text-white/30 mt-1">{sub}</p>
    </div>
  );
}

export function HostAnalyticsDashboard({ analytics }: Props) {
  const { overview, topEvents, categoryBreakdown, revenueTimeline, registrationStatus, engagement } = analytics;

  return (
    <div className="space-y-6">
      {/* KPI tiles */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <StatTile
          icon={<Calendar className="h-4 w-4 text-white/50" />}
          label="Total Events"
          value={overview.totalEvents}
          sub={`${overview.publishedEvents} published`}
        />
        <StatTile
          icon={<Users className="h-4 w-4 text-white/50" />}
          label="Registrations"
          value={overview.totalRegistrations}
          sub={`${overview.confirmedRegistrations} confirmed`}
        />
        <StatTile
          icon={<TrendingUp className="h-4 w-4 text-white/50" />}
          label="Avg Check-In Rate"
          value={`${engagement.avgCheckInRate.toFixed(1)}%`}
          sub={`${engagement.avgRegistrationsPerEvent.toFixed(1)} avg regs/event`}
        />
        <StatTile
          icon={<Clock className="h-4 w-4 text-white/50" />}
          label="Peak Hour"
          value={`${engagement.peakRegistrationHour}:00`}
          sub={`${engagement.cancellationRate.toFixed(1)}% cancellation`}
        />
      </motion.div>

      {/* Charts row 1 */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
        className="grid gap-6 md:grid-cols-2"
      >
        {/* Top events bar */}
        <div className="rounded-xl border border-white/[0.08] bg-[#0e1018] p-5">
          <p className="font-semibold text-white mb-1">Top Performing Events</p>
          <p className="text-xs text-white/30 mb-5">Registrations vs check-ins</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={topEvents} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="eventName" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.35)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "rgba(255,255,255,0.35)" }} axisLine={false} tickLine={false} />
              <Tooltip {...darkTooltip} />
              <Bar dataKey="registrations" fill="rgba(255,255,255,0.75)" radius={[4,4,0,0]} name="Registrations" />
              <Bar dataKey="checkedIn" fill="rgba(255,255,255,0.30)" radius={[4,4,0,0]} name="Checked In" />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-6 mt-3 justify-center">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-4 rounded-full bg-white/75" />
              <span className="text-xs text-white/40">Registrations</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-4 rounded-full bg-white/30" />
              <span className="text-xs text-white/40">Checked In</span>
            </div>
          </div>
        </div>

        {/* Registration status pie */}
        <div className="rounded-xl border border-white/[0.08] bg-[#0e1018] p-5">
          <p className="font-semibold text-white mb-1">Registration Status</p>
          <p className="text-xs text-white/30 mb-5">Distribution by status</p>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="55%" height={200}>
              <PieChart>
                <Pie
                  data={registrationStatus}
                  cx="50%" cy="50%"
                  innerRadius={55} outerRadius={90}
                  dataKey="count" nameKey="status"
                  strokeWidth={0}
                >
                  {registrationStatus.map((_, i) => (
                    <Cell key={i} fill={MONO[i % MONO.length]} opacity={0.85} />
                  ))}
                </Pie>
                <Tooltip {...darkTooltip} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2 flex-1">
              {registrationStatus.map((s, i) => (
                <div key={s.status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ background: MONO[i % MONO.length] }} />
                    <span className="text-xs text-white/50 capitalize">{s.status.toLowerCase()}</span>
                  </div>
                  <span className="text-xs font-semibold text-white/70">{s.percentage.toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Revenue timeline */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
        className="rounded-xl border border-white/[0.08] bg-[#0e1018] p-5"
      >
        <p className="font-semibold text-white mb-1">Revenue Timeline</p>
        <p className="text-xs text-white/30 mb-5">Monthly revenue & registration trends</p>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={revenueTimeline}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.35)" }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.35)" }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.35)" }} axisLine={false} tickLine={false} />
            <Tooltip {...darkTooltip} />
            <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="rgba(255,255,255,0.80)" strokeWidth={2.5} dot={false} name="Revenue" />
            <Line yAxisId="right" type="monotone" dataKey="registrations" stroke="rgba(255,255,255,0.35)" strokeWidth={2.5} dot={false} name="Registrations" />
          </LineChart>
        </ResponsiveContainer>
        <div className="flex gap-6 mt-3 justify-center">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-4 rounded-full bg-[#0e1018]" />
            <span className="text-xs text-white/40">Revenue</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-4 rounded-full bg-white/35" />
            <span className="text-xs text-white/40">Registrations</span>
          </div>
        </div>
      </motion.div>

      {/* Category breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}
        className="rounded-xl border border-white/[0.08] bg-[#0e1018] p-5"
      >
        <p className="font-semibold text-white mb-1">Category Performance</p>
        <p className="text-xs text-white/30 mb-5">Events and registrations by category</p>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={categoryBreakdown} layout="vertical" barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.35)" }} axisLine={false} tickLine={false} />
            <YAxis dataKey="category" type="category" width={110} tick={{ fontSize: 11, fill: "rgba(255,255,255,0.45)" }} axisLine={false} tickLine={false} />
            <Tooltip {...darkTooltip} />
            <Bar dataKey="totalRegistrations" fill="rgba(255,255,255,0.70)" radius={[0,4,4,0]} name="Registrations" />
            <Bar dataKey="eventCount" fill="rgba(255,255,255,0.25)" radius={[0,4,4,0]} name="Events" />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex gap-6 mt-3 justify-center">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-4 rounded-full bg-[#141720]" />
            <span className="text-xs text-white/40">Registrations</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-4 rounded-full bg-white/25" />
            <span className="text-xs text-white/40">Events</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
