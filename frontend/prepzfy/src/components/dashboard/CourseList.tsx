import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, ExternalLink, Star, Clock, PlayCircle, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { getCourseRecommendations } from "../../services/gemini";
import { Skeleton } from "@/components/ui/skeleton";

export default function CourseList() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      // In a real app, we'd pass actual skills
      const result = await getCourseRecommendations(["Dynamic Programming", "System Design", "Java Concurrency"]);
      setCourses(result);
      setLoading(false);
    };
    fetchCourses();
  }, []);

  const filteredCourses = courses.filter(c => 
    c.title.toLowerCase().includes(search.toLowerCase()) || 
    c.provider.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <Input 
            placeholder="Search courses, providers..." 
            className="pl-10 h-11 rounded-xl border-gray-200 focus:ring-indigo-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="px-3 py-1 cursor-pointer hover:bg-gray-100">Free</Badge>
          <Badge variant="outline" className="px-3 py-1 cursor-pointer hover:bg-gray-100">Paid</Badge>
          <Badge variant="outline" className="px-3 py-1 cursor-pointer hover:bg-gray-100">Certification</Badge>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="border-none shadow-sm">
              <Skeleton className="h-40 w-full rounded-t-xl" />
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course, idx) => (
            <Card key={idx} className="group border-none shadow-sm hover:shadow-md transition-all bg-white overflow-hidden flex flex-col">
              <div className="h-40 bg-indigo-50 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent" />
                <BookOpen size={48} className="text-indigo-200 group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute top-3 right-3">
                  <Badge className="bg-white/80 backdrop-blur-sm text-indigo-600 border-none shadow-sm">
                    {course.provider}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-5 flex-1 flex flex-col">
                <h4 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                  {course.title}
                </h4>
                <p className="text-xs text-gray-500 mb-4 line-clamp-2 italic">
                  "{course.reason}"
                </p>
                
                <div className="mt-auto space-y-4">
                  <div className="flex items-center justify-between text-[11px] text-gray-400 font-medium">
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      12-15 Hours
                    </div>
                    <div className="flex items-center gap-1">
                      <Star size={12} className="text-amber-400 fill-amber-400" />
                      4.8 (2.4k)
                    </div>
                  </div>
                  
                  <button className="w-full py-2.5 bg-gray-50 text-gray-700 rounded-lg font-bold text-xs hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-2 border border-gray-100 group-hover:border-indigo-600">
                    <PlayCircle size={14} />
                    Start Learning
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
