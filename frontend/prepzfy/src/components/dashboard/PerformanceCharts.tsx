import React from "react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Activity, BarChart3 } from "lucide-react";

const PROGRESS_DATA = [
  { day: "Mon", solved: 2, score: 65 },
  { day: "Tue", solved: 5, score: 72 },
  { day: "Wed", solved: 4, score: 68 },
  { day: "Thu", solved: 8, score: 85 },
  { day: "Fri", solved: 12, score: 82 },
  { day: "Sat", solved: 15, score: 90 },
  { day: "Sun", solved: 10, score: 88 },
];

const SKILL_DATA = [
  { name: "Arrays", score: 85, color: "#6366f1" },
  { name: "Strings", score: 70, color: "#8b5cf6" },
  { name: "DP", score: 45, color: "#ec4899" },
  { name: "Graphs", score: 60, color: "#06b6d4" },
  { name: "SQL", score: 90, color: "#10b981" },
];

export default function PerformanceCharts() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <Card className="border-none shadow-sm bg-white overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Activity className="text-indigo-600" size={16} />
            Coding Progress
          </CardTitle>
          <div className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">
            +12% this week
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={PROGRESS_DATA}>
                <defs>
                  <linearGradient id="colorSolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  dy={10} 
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="solved" 
                  stroke="#6366f1" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorSolved)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm bg-white overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <BarChart3 className="text-indigo-600" size={16} />
            Concept Proficiency
          </CardTitle>
          <TrendingUp className="text-indigo-400" size={14} />
        </CardHeader>
        <CardContent className="pt-4">
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={SKILL_DATA} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                <XAxis type="number" hide domain={[0, 100]} />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 600, fill: '#475569' }}
                  width={60}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={12}>
                  {SKILL_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
