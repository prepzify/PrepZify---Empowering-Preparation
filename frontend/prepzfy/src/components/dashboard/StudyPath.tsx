import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, ArrowRight, CheckCircle2, BookOpen, Code2, Loader2, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { generateStudyPath } from "../../services/gemini";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "../../context/AuthContext";
import { db, handleFirestoreError, OperationType } from "../../lib/firebase";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

export default function StudyPath() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [plan, setPlan] = useState<any>(null);

  const fetchExistingPlan = async () => {
    if (!user) return;
    const planPath = `studyPlans/${user.uid}`;
    try {
      const planDoc = await getDoc(doc(db, "studyPlans", user.uid));
      if (planDoc.exists()) {
        setPlan(planDoc.data());
      } else {
        await handleGenerate();
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, planPath);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!user || !profile) return;
    setGenerating(true);
    const planPath = `studyPlans/${user.uid}`;
    try {
      // Collect training data for Gemini
      const analysisData = {
        name: profile.name,
        skills: profile.skills || [],
        stats: profile.stats || {},
        // In a real app, we would fetch recent interview results here too
      };
      
      const result = await generateStudyPath(analysisData);
      if (result) {
        const isNew = !plan;
        const planWithMeta = {
          ...result,
          userId: user.uid,
          updatedAt: serverTimestamp(),
          createdAt: isNew ? serverTimestamp() : plan.createdAt
        };
        await setDoc(doc(db, "studyPlans", user.uid), planWithMeta);
        setPlan(planWithMeta);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, planPath);
    } finally {
      setGenerating(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExistingPlan();
  }, [user, profile]);

  if (loading) {
    return (
      <Card className="border-none shadow-sm">
        <CardHeader>
          <Skeleton className="h-8 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-sm bg-gradient-to-br from-indigo-50/50 to-white relative overflow-hidden">
      {generating && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center gap-3">
          <Loader2 className="animate-spin text-indigo-600" size={32} />
          <p className="text-sm font-bold text-indigo-900 animate-pulse">Gemini is architecting your path...</p>
        </div>
      )}
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <Sparkles className="text-indigo-600" size={20} />
          AI Personalized Study Path
        </CardTitle>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleGenerate}
            disabled={generating}
            className="p-2 hover:bg-indigo-100 rounded-full transition-colors text-indigo-600 disabled:opacity-50"
            title="Regenerate Path"
          >
            <RefreshCw size={16} className={generating ? "animate-spin" : ""} />
          </button>
          <Badge className="bg-indigo-600">{plan?.estimatedTimeToReady || "2 Weeks"}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-white rounded-xl border border-indigo-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
            <Sparkles size={40} className="text-indigo-600" />
          </div>
          <p className="text-sm text-gray-600 leading-relaxed relative z-10">
            {plan?.summary || "Analyzing your performance to generate a custom roadmap..."}
          </p>
        </div>

        <div className="space-y-4">
          {plan?.items?.map((item: any, idx: number) => (
            <div key={idx} className="relative pl-8 group">
              <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gray-100 group-last:bg-transparent">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white border-2 border-indigo-600 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-xl border border-gray-100 hover:border-indigo-200 transition-all hover:shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-gray-900">{item.topic}</h4>
                  <Badge variant={item.priority === 'High' ? 'destructive' : 'secondary'} className="text-[10px] uppercase">
                    {item.priority} Priority
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 mb-4">{item.reason}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {item.resources?.map((res: any, rIdx: number) => (
                    <a 
                      key={rIdx} 
                      href={res.url || "#"} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2 rounded-lg bg-gray-50 hover:bg-indigo-50 transition-colors group/link border border-transparent hover:border-indigo-100"
                    >
                      <div className="flex items-center gap-2">
                        {res.type === 'Course' ? <BookOpen size={14} className="text-indigo-500" /> : <Code2 size={14} className="text-emerald-500" />}
                        <span className="text-xs font-medium text-gray-700 truncate max-w-[120px]">{res.title}</span>
                      </div>
                      <ArrowRight size={12} className="text-gray-300 group-hover/link:text-indigo-500 transition-colors" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          ))}
          {(!plan?.items || plan.items.length === 0) && !generating && (
            <div className="text-center py-12">
              <p className="text-sm text-gray-400 font-medium italic">No path generated yet. Click refresh to start.</p>
            </div>
          )}
        </div>

        {plan?.items?.length > 0 && (
          <button className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 group">
            <CheckCircle2 size={18} />
            Mark current milestone as completed
          </button>
        )}
      </CardContent>
    </Card>
  );
}
