/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Stats from "./components/dashboard/Stats";
import CodingSection from "./components/editor/CodingSection";
import Leaderboard from "./components/dashboard/Leaderboard";
import StudyPath from "./components/dashboard/StudyPath";
import InterviewSession from "./components/interview/InterviewSession";
import CourseList from "./components/dashboard/CourseList";
import ResumeChecker from "./components/dashboard/ResumeChecker";
import Profile from "./components/dashboard/Profile";
import DynamicAssessment from "./components/dashboard/DynamicAssessment";
import PerformanceCharts from "./components/dashboard/PerformanceCharts";
import { useAuth } from "./context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";

export default function App() {
  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/coding" element={<PageWrapper title="Coding Practice"><CodingSection /></PageWrapper>} />
          <Route path="/interview" element={<PageWrapper title="Interview Preparation"><InterviewSession /></PageWrapper>} />
          <Route path="/resume" element={<PageWrapper title="Resume Analyzer"><ResumeChecker /></PageWrapper>} />
          <Route path="/courses" element={<PageWrapper title="Learning Modules"><CourseList /></PageWrapper>} />
          <Route path="/profile" element={<PageWrapper title="Your Profile"><Profile /></PageWrapper>} />
          <Route path="/aptitude" element={<PageWrapper title="Aptitude Assessment"><DynamicAssessment /></PageWrapper>} />
        </Routes>
      </main>
    </div>
  );
}

function PageWrapper({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      </div>
      {children}
    </div>
  );
}

function Dashboard() {
  const { profile } = useAuth();
  
  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {profile?.name || 'User'}! 👋</h1>
          <p className="text-gray-500 mt-1">Ready for your specialized PrepZfy placement training today?</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border-indigo-100 px-3 py-1">
            Pro Member
          </Badge>
          <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-100 px-3 py-1 flex items-center gap-1">
            <Trophy size={12} />
            Top 1%
          </Badge>
        </div>
      </div>

      <Stats />

      <PerformanceCharts />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <SectionHeader title="Your Learning Path" description="AI-tailored curriculum based on your goals" />
          <StudyPath />
        </div>

        <div className="space-y-8">
          <Leaderboard />

          <Card className="border-none shadow-sm bg-gradient-to-br from-gray-900 to-gray-800 text-white">
            <CardHeader>
              <CardTitle className="text-lg">Upcoming Visits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <CompanyVisit logo="G" name="Google" role="Software Engineer" days="14" />
              <CompanyVisit logo="A" name="Amazon" role="SDE Intern" days="21" />
              <CompanyVisit logo="M" name="Microsoft" role="Full Stack Dev" days="28" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ title, description }: { title: string, description: string }) {
  return (
    <div>
      <h2 className="text-xl font-bold tracking-tight">{title}</h2>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  );
}

function CompanyVisit({ logo, name, role, days }: { logo: string, name: string, role: string, days: string }) {
  return (
    <div className="flex items-center justify-between group cursor-pointer">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center font-bold group-hover:bg-indigo-500 transition-colors">{logo}</div>
        <div>
          <div className="text-sm font-bold">{name}</div>
          <div className="text-xs text-gray-400">{role}</div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-xs font-bold text-indigo-400">In {days} Days</div>
      </div>
    </div>
  );
}

