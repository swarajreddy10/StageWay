"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";

interface RegistrationChartProps {
  data: { date: string; count: number }[];
}

export function RegistrationChart({ data }: RegistrationChartProps) {
  const chartData = data.map((item) => ({
    date: format(new Date(item.date), "MMM d"),
    registrations: item.count,
  }));

  return (
    <Card className="rounded-3xl border border-white/[0.08] bg-[#0e1018] shadow-sm">
      <CardHeader>
        <CardTitle>Registration Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="registrations"
              stroke="#1E5A55"
              strokeWidth={2}
              name="Registrations"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
