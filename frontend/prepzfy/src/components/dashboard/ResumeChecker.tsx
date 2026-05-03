import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Upload, Loader2, CheckCircle2, AlertCircle, Sparkles, BookOpen, Layout, Zap, BarChart3 } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import { analyzeResume } from "../../services/gemini";
import { useNavigate } from "react-router-dom";

// Set up PDF.js worker - Using a more robust CDN link matching the version
const PDFJS_VERSION = "5.6.205"; // Synced with package.json
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${PDFJS_VERSION}/build/pdf.worker.min.mjs`;

export default function ResumeChecker() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ 
        data: arrayBuffer,
        useWorkerFetch: true,
        isEvalSupported: false,
      });
      
      let pdf;
      try {
        pdf = await loadingTask.promise;
      } catch (err: any) {
        // If it's a password exception, try to open it with an empty password
        // as some PDFs have "owner passwords" that don't block reading content
        if (err.name === "PasswordException") {
          const secondLoadingTask = pdfjsLib.getDocument({
            data: arrayBuffer,
            password: "",
            useWorkerFetch: true,
          });
          pdf = await secondLoadingTask.promise;
        } else {
          throw err;
        }
      }

      let fullText = "";
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => "str" in item ? item.str : "")
          .join(" ");
        fullText += pageText + "\n";
      }
      
      if (!fullText.trim()) {
        throw new Error("Could not extract any text from the PDF. It might be an image-based PDF or have restricted permissions.");
      }
      
      return fullText;
    } catch (err: any) {
      console.error("PDF Extraction Error:", err);
      if (err.name === "PasswordException") {
        throw new Error("This PDF is password protected. Please upload an unprotected version.");
      }
      throw new Error(err.message || "Failed to read PDF content.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setError(null);
    } else {
      setError("Please upload a valid PDF file.");
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setIsAnalyzing(true);
    setError(null);
    try {
      const text = await extractTextFromPDF(file);
      const analysis = await analyzeResume(text);
      if (analysis) {
        setReport(analysis);
      } else {
        setError("AI analysis failed. Please try again.");
      }
    } catch (err: any) {
      console.error("Analysis Error:", err);
      setError(err.message || "Error processing PDF. Please try a different file.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8">
      {!report ? (
        <Card className="border-2 border-dashed border-gray-200 bg-white hover:border-indigo-400 transition-colors">
          <CardContent className="flex flex-col items-center justify-center py-16 space-y-6">
            <div className="h-20 w-20 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Upload size={40} />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900">Upload your Resume</h3>
              <p className="text-sm text-gray-500 mt-2">PDF format only. Max size 5MB.</p>
            </div>
            
            <input 
              type="file" 
              accept=".pdf" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            
            <div className="flex flex-col items-center gap-4">
              {file && (
                <div className="flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-100">
                  <FileText size={18} className="text-indigo-600" />
                  <span className="text-sm font-medium text-indigo-900">{file.name}</span>
                </div>
              )}
              
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isAnalyzing}
                >
                  {file ? "Change File" : "Select File"}
                </Button>
                <Button 
                  onClick={handleAnalyze} 
                  disabled={!file || isAnalyzing}
                  className="bg-indigo-600 hover:bg-indigo-700 gap-2"
                >
                  {isAnalyzing ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                  {isAnalyzing ? "Analyzing..." : "Check ATS Score"}
                </Button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm font-medium">
                <AlertCircle size={16} />
                {error}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Score & Feedback */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-none shadow-sm bg-white overflow-hidden">
              <CardHeader className="bg-gray-50/50 border-b p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl font-bold flex items-center gap-2 text-gray-900">
                      <Layout className="h-5 w-5 text-indigo-600" />
                      ATS Intelligence Report
                    </CardTitle>
                    <CardDescription>Comprehensive visibility analysis using industry-standard criteria</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setReport(null)} className="h-9">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload New
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-10">
                {/* Hero Score Section */}
                <div className="flex flex-col items-center justify-center py-10 bg-gradient-to-br from-indigo-50/30 via-white to-indigo-50/30 rounded-[2.5rem] border border-indigo-100/50 shadow-inner group transition-all duration-500 hover:shadow-indigo-100/20">
                  <div className="relative h-44 w-44 flex items-center justify-center">
                    <svg className="h-full w-full transform -rotate-90">
                      <circle
                        cx="88"
                        cy="88"
                        r="80"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="transparent"
                        className="text-gray-100"
                      />
                      <circle
                        cx="88"
                        cy="88"
                        r="80"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="transparent"
                        strokeDasharray={502.65}
                        strokeDashoffset={502.65 - (502.65 * report.score) / 100}
                        className={`${
                          report.score >= 80 ? 'text-emerald-500' : 
                          report.score >= 60 ? 'text-amber-500' : 'text-rose-500'
                        } transition-all duration-1000 ease-out`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white rounded-full m-4 shadow-sm">
                      <span className="text-5xl font-black tracking-tighter text-gray-900 leading-none">{report.score}%</span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">ATS Match</span>
                    </div>
                  </div>
                  <div className="mt-8 text-center px-6 max-w-md">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {report.score >= 80 ? "Premium Visibility Level" :
                       report.score >= 60 ? "Average Market Visibility" :
                       "High Visibility Risk"}
                    </h3>
                    <p className="text-sm text-gray-500 font-medium">
                      {report.score >= 80 ? "Your resume is highly optimized for modern Applicant Tracking Systems." :
                       report.score >= 60 ? "Solid structure, but lacking specific quantifiable impact and keyword depth." :
                       "Warning: Crucial sections or keywords are missing, leading to high rejection risk."}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FeedbackCard 
                    title="Formatting" 
                    content={report.feedback.formatting} 
                    icon={<FileText className="h-4 w-4" />}
                    variant="indigo"
                  />
                  <FeedbackCard 
                    title="Keywords" 
                    content={report.feedback.keywords} 
                    icon={<Zap className="h-4 w-4" />}
                    variant="emerald"
                  />
                  <FeedbackCard 
                    title="Content Impact" 
                    content={report.feedback.content} 
                    icon={<BarChart3 className="h-4 w-4" />}
                    variant="amber"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-1 bg-rose-500 rounded-full" />
                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Crucial Optimization Gaps</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {report.weakAreas.map((area: string, i: number) => (
                      <div key={i} className="flex items-start gap-4 bg-rose-50/50 p-4 rounded-xl border border-rose-100/50 group transition-all hover:bg-rose-50">
                        <div className="h-6 w-6 rounded-lg bg-rose-100 flex items-center justify-center text-rose-600 text-xs font-bold shrink-0">
                          {i + 1}
                        </div>
                        <p className="text-sm text-gray-700 font-medium leading-relaxed">{area}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 bg-indigo-600 rounded-3xl text-white relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4 group-hover:translate-x-2 transition-transform">
                    <Sparkles size={120} />
                  </div>
                  <div className="relative z-10 space-y-2">
                    <h4 className="font-bold text-lg">AI Recommendation Engine</h4>
                    <p className="text-indigo-100 text-xs max-w-lg leading-relaxed">
                      Based on your current profile, we recommend focusing on quantifiable metrics. 
                      Adding just 3 data points (%, $) can boost your score by up to 15 points.
                    </p>
                    <div className="pt-2 flex gap-3">
                      <Button variant="secondary" size="sm" className="bg-white text-indigo-600 h-8 font-bold text-[10px]">
                        Apply Best Practices
                      </Button>
                      <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 h-8 font-bold text-[10px]">
                        View Examples
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Suggested Practice */}
          <div className="space-y-8">
            <Card className="border-none shadow-sm bg-white">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <BookOpen size={20} className="text-indigo-600" />
                  Suggested Practice
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {report.suggestedPractice.map((practice: any, i: number) => (
                  <div key={i} className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-2 hover:border-indigo-200 transition-colors cursor-pointer group">
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-sm text-gray-900 group-hover:text-indigo-600">{practice.topic}</h5>
                      <Badge className="text-[10px] bg-indigo-100 text-indigo-700">Practice</Badge>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">{practice.reason}</p>
                  </div>
                ))}
                <Button 
                  onClick={() => navigate("/coding")}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 gap-2 mt-4"
                >
                  Go to Practice Modules
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

function FeedbackCard({ 
  title, 
  content, 
  icon, 
  variant = "indigo" 
}: { 
  title: string, 
  content: string, 
  icon?: React.ReactNode,
  variant?: "indigo" | "emerald" | "amber"
}) {
  const styles = {
    indigo: "bg-indigo-50/50 border-indigo-100 text-indigo-600",
    emerald: "bg-emerald-50/50 border-emerald-100 text-emerald-600",
    amber: "bg-amber-50/50 border-amber-100 text-amber-600"
  };

  return (
    <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 group">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg transition-transform group-hover:scale-110 ${styles[variant]}`}>
          {icon}
        </div>
        <h4 className="font-bold text-gray-900 text-sm">{title}</h4>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed font-medium">{content}</p>
    </div>
  );
}
