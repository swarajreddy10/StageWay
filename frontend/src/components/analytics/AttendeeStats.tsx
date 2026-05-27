"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface AttendeeStatsProps {
  demographics: { ageGroup: string; count: number }[];
  timeSlots: { hour: number; registrations: number }[];
}

const COLORS = ["#1E5A55", "#D8573B", "#F0B34B", "#9BBF9A", "#2F7A74"];

export function AttendeeStats({ demographics, timeSlots }: AttendeeStatsProps) {
  const timeSlotData = timeSlots.map((slot) => ({
    hour: `${slot.hour}:00`,
    registrations: slot.registrations,
  }));

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="rounded-3xl border border-white/[0.08] bg-[#0e1018] shadow-sm">
        <CardHeader>
          <CardTitle>Attendee Demographics</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={demographics}
                cx="50%"
                cy="50%"
                labelLine={false}
                nameKey="ageGroup"
                label={({ name, percent }) => {
                  const safePercent = typeof percent === "number" ? percent : 0;
                  return `${name ?? ""} ${(safePercent * 100).toFixed(0)}%`;
                }}
                outerRadius={80}
                fill="#1E5A55"
                dataKey="count"
              >
                {demographics.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border border-white/[0.08] bg-[#0e1018] shadow-sm">
        <CardHeader>
          <CardTitle>Popular Time Slots</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={timeSlotData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="registrations" fill="#D8573B" name="Registrations" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
