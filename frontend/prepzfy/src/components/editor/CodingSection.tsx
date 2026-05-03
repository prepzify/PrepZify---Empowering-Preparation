import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Code2, 
  ChevronRight, 
  Search, 
  Tag as TagIcon, 
  ArrowLeft,
  Trophy,
  Activity,
  Zap,
  CheckCircle2,
  Maximize2,
  Minimize2
} from "lucide-react";
import CodeEditor from "./CodeEditor";
import { CODING_TOPICS, CODING_PROBLEMS, Problem } from "../../constants/codingProblems";


export default function CodingSection() {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [solvedCount, setSolvedCount] = React.useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  React.useEffect(() => {
    const updateStats = () => {
      const solved = JSON.parse(localStorage.getItem('solved_problems') || '{}');
      setSolvedCount(Object.keys(solved).length);
    };
    updateStats();
    window.addEventListener('storage', updateStats);
    return () => window.removeEventListener('storage', updateStats);
  }, []);

  const filteredTopics = CODING_TOPICS.filter(topic => 
    topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProblems = CODING_PROBLEMS.filter(p => 
    (!selectedTopic || p.topic === selectedTopic) &&
    (p.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (selectedProblem) {
    return (
      <div className="flex flex-col h-[700px] gap-4">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setSelectedProblem(null)}
            className="text-gray-500 hover:text-indigo-600 gap-2"
          >
            <ArrowLeft size={16} />
            Back to Problems
          </Button>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] uppercase">{selectedProblem.topic}</Badge>
            <Badge className={`${
              selectedProblem.difficulty === "Easy" ? "bg-green-100 text-green-700" :
              selectedProblem.difficulty === "Medium" ? "bg-amber-100 text-amber-700" :
              "bg-red-100 text-red-700"
            } text-[10px] uppercase font-bold`}>
              {selectedProblem.difficulty}
            </Badge>
          </div>
        </div>

        <div className={`grid grid-cols-1 lg:grid-cols-5 gap-6 h-full overflow-hidden ${isExpanded ? 'fixed inset-0 z-50 bg-white p-6' : ''}`}>
          {/* Problem Statement Card */}
          {!isExpanded && (
            <Card className="lg:col-span-2 border-none shadow-sm flex flex-col h-full overflow-hidden">
              <CardHeader className="pb-2 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold text-gray-900">{selectedProblem.title}</CardTitle>
                </div>
              </CardHeader>
              <ScrollArea className="flex-1">
                <CardContent className="py-6 space-y-6">
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Problem Statement</h4>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {selectedProblem.statement}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Constraints</h4>
                    <ul className="list-disc list-inside text-xs text-gray-600 space-y-1">
                      {selectedProblem.constraints.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Examples</h4>
                    {selectedProblem.testCases.map((tc, i) => (
                      <div key={i} className="p-3 bg-gray-50 rounded-lg border border-gray-100 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-gray-400 uppercase">Input:</span>
                          <code className="text-xs font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">{tc.input}</code>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-gray-400 uppercase">Output:</span>
                          <code className="text-xs font-mono text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">{tc.expectedOutput}</code>
                        </div>
                        {tc.explanation && (
                          <div className="flex flex-col gap-1 mt-1 pt-1 border-t border-gray-200">
                            <span className="text-[10px] font-bold text-gray-400 uppercase">Explanation:</span>
                            <p className="text-[11px] text-gray-600 leading-tight italic">{tc.explanation}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </ScrollArea>
            </Card>
          )}

          {/* Editor Container */}
          <div className={`${isExpanded ? 'lg:col-span-5 h-[calc(100vh-120px)] mt-12' : 'lg:col-span-3 h-full'} transition-all duration-300`}>
            {isExpanded && (
              <div className="absolute top-6 left-6 right-6 flex items-center justify-between pointer-events-none">
                 <h2 className="text-xl font-bold pointer-events-auto">{selectedProblem.title}</h2>
                 <Button 
                   variant="outline" 
                   size="sm" 
                   onClick={() => setIsExpanded(false)}
                   className="pointer-events-auto gap-2 bg-white"
                 >
                   <Minimize2 size={16} />
                   Exit Full Screen
                 </Button>
              </div>
            )}
            <CodeEditor 
              problem={selectedProblem} 
              isExpanded={isExpanded}
              onToggleExpand={() => setIsExpanded(!isExpanded)}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Topics / Tags Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
            <TagIcon size={16} className="text-indigo-600" />
            Browse by Topics
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search topics or problems..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-1.5 bg-white border border-gray-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all w-64"
            />
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Badge 
            variant={selectedTopic === null ? "default" : "outline"}
            className={`cursor-pointer px-3 py-1 text-[10px] font-bold uppercase ${selectedTopic === null ? 'bg-indigo-600' : 'hover:bg-indigo-50'}`}
            onClick={() => setSelectedTopic(null)}
          >
            All Problems
          </Badge>
          {filteredTopics.map((topic) => (
            <Badge 
              key={topic}
              variant={selectedTopic === topic ? "default" : "outline"}
              className={`cursor-pointer px-3 py-1 text-[10px] font-bold uppercase transition-all ${
                selectedTopic === topic ? "bg-indigo-600" : "hover:border-indigo-400 hover:text-indigo-600"
              }`}
              onClick={() => setSelectedTopic(topic === selectedTopic ? null : topic)}
            >
              {topic}
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Statistics Cards */}
        <div className="space-y-4">
          <Card className="border-none shadow-sm bg-white">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-50 text-green-600">
                  <Activity size={20} />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase">Solved</div>
                  <div className="text-xl font-black text-gray-900">{solvedCount} / {CODING_PROBLEMS.length}</div>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-gray-400">PROGRESS</span>
                  <span className="text-indigo-600">{((solvedCount / CODING_PROBLEMS.length) * 100).toFixed(1)}%</span>
                </div>
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 transition-all duration-500" style={{ width: `${(solvedCount / CODING_PROBLEMS.length) * 100}%` }} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-gradient-to-br from-gray-900 to-gray-800 text-white">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-3">
                <Zap size={20} className="text-amber-400" />
                <span className="font-bold text-sm">Daily Streak: 14 Days</span>
              </div>
              <p className="text-[10px] text-gray-400">Solve one more problem to unlock the "Consistent Coder" badge!</p>
            </CardContent>
          </Card>
        </div>

        {/* Problems List */}
        <div className="lg:col-span-3 space-y-3">
          {filteredProblems.length > 0 ? (
            filteredProblems.map((problem) => (
              <Card 
                key={problem.id} 
                className="border-none shadow-sm bg-white hover:shadow-md transition-all cursor-pointer group border-l-4 border-l-transparent hover:border-l-indigo-500"
                onClick={() => setSelectedProblem(problem)}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center font-bold text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                      {problem.id === 'two-sum' ? <CheckCircle2 size={16} className="text-green-500" /> : <Code2 size={16} />}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{problem.title}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] text-gray-400 font-bold uppercase">{problem.topic}</span>
                        <span className="text-[10px] text-gray-300">•</span>
                        <span className={`text-[10px] font-black uppercase ${
                          problem.difficulty === 'Easy' ? 'text-green-500' : 
                          problem.difficulty === 'Medium' ? 'text-amber-500' : 'text-red-500'
                        }`}>
                          {problem.difficulty}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-gray-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 space-y-4">
              <Search size={48} className="opacity-10" />
              <p className="italic">No problems found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
