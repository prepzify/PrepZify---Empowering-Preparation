import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLocation } from 'react-router-dom';
import { 
  Sparkles, 
  Brain, 
  Code2, 
  ListChecks, 
  ArrowRight, 
  Loader2,
  CheckCircle2,
  XCircle,
  Trophy,
  Target,
  Clock,
  Timer,
  AlertCircle,
  BarChart3
} from 'lucide-react';
import { generateQuestions } from '../../services/assessmentService';
import { Question } from '../../types';
import CodeEditor from '../editor/CodeEditor';
import { useAuth } from '../../context/AuthContext';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { doc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';

const codingTopics = [
  'Array', 'String', 'Hash Table', 'Math', 'Dynamic Programming', 'Sorting', 'Greedy',
  'Depth-First Search', 'Binary Search', 'Database', 'Bit Manipulation', 'Matrix',
  'Tree', 'Breadth-First Search', 'Two Pointers', 'Prefix Sum', 'Heap (Priority Queue)',
  'Simulation', 'Counting', 'Graph Theory', 'Binary Tree', 'Stack', 'Sliding Window',
  'Enumeration', 'Design', 'Backtracking', 'Union-Find', 'Number Theory', 'Linked List',
  'Ordered Set', 'Segment Tree', 'Monotonic Stack', 'Divide and Conquer', 'Combinatorics',
  'Trie', 'Bitmask', 'Queue', 'Recursion', 'Geometry', 'Binary Indexed Tree', 'Memoization',
  'Hash Function', 'Binary Search Tree', 'Topological Sort', 'Shortest Path', 'String Matching',
  'Rolling Hash', 'Game Theory', 'Interactive', 'Data Stream', 'Monotonic Queue', 'Brainteaser',
  'Doubly-Linked List', 'Merge Sort', 'Randomized', 'Counting Sort', 'Iterator', 'Concurrency',
  'Quickselect', 'Suffix Array', 'Sweep Line', 'Probability and Statistics',
  'Minimum Spanning Tree', 'Bucket Sort', 'Shell', 'Reservoir Sampling', 'Eulerian Circuit',
  'Radix Sort', 'Strongly Connected Component', 'Rejection Sampling'
];

export default function DynamicAssessment() {
  const { user } = useAuth();
  const location = useLocation();
  const isAptitudePage = location.pathname.includes('aptitude');
  
  const [topic, setTopic] = useState(isAptitudePage ? 'Quantitative Aptitude' : 'Programming Fundamentals');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [assessmentType, setAssessmentType] = useState<'MCQ' | 'Coding'>('MCQ');
  
  // Code persistence state: questionIndex -> language -> code
  const [questionCodes, setQuestionCodes] = useState<Record<number, Record<string, string>>>({});
  // Track solved status per question
  const [questionStatus, setQuestionStatus] = useState<Record<number, boolean>>({});

  const handleTypeChange = (newType: 'MCQ' | 'Coding') => {
    setAssessmentType(newType);
    if (newType === 'Coding') {
      setTopic('Array');
    } else {
      setTopic(isAptitudePage ? 'Quantitative Aptitude' : 'Programming Fundamentals');
    }
  };
  
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentQuestion = questions[currentIndex];

  const updateProfileStats = async (finalScore: number) => {
    if (!user) return;
    
    try {
      const userRef = doc(db, 'users', user.uid);
      const pointsToAward = assessmentType === 'Coding' ? finalScore * 50 : finalScore * 10;
      
      await updateDoc(userRef, {
        'stats.problemsSolved': increment(assessmentType === 'Coding' ? finalScore : 0),
        'stats.points': increment(pointsToAward),
        updatedAt: serverTimestamp()
      });
      console.log(`Awarded ${pointsToAward} points to user profile.`);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  useEffect(() => {
    if (timeLeft !== null && timeLeft > 0 && !isCompleted) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => (prev !== null ? prev - 1 : null));
      }, 1000);
    } else if (timeLeft === 0 && !isCompleted) {
      setIsTimeUp(true);
      setIsCompleted(true);
      updateProfileStats(score);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeLeft, isCompleted]);

  const getInitialTime = (type: 'MCQ' | 'Coding', diff: 'Easy' | 'Medium' | 'Hard') => {
    if (type === 'MCQ') {
      return diff === 'Easy' ? 15 : diff === 'Medium' ? 25 : 35;
    } else {
      return (diff === 'Easy' ? 15 : diff === 'Medium' ? 30 : 45) * 60;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleGenerate = async (type: 'MCQ' | 'Coding') => {
    setIsGenerating(true);
    setAssessmentType(type);
    setQuestions([]);
    setCurrentIndex(0);
    setScore(0);
    setIsCorrect(false);
    setIsCompleted(false);
    setShowResult(false);
    setSelectedOption(null);
    setIsTimeUp(false);
    setTimeLeft(null);
    setQuestionCodes({});
    setQuestionStatus({});
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      // Get recent questions from localStorage to avoid repetition
      const seenKey = `seen_questions_${topic}_${type}`;
      const seenQuestions = JSON.parse(localStorage.getItem(seenKey) || '[]');
      
      // Force exactly 3 questions for Coding as requested
      const targetCount = type === 'Coding' ? 3 : 10;
      const qSet = await generateQuestions(topic, difficulty, type, targetCount, seenQuestions);
      
      // Safety check to ensure we move forward even if AI returns fewer
      if (qSet.length > 0) {
        setQuestions(qSet);
        
        // Update seen questions in localStorage (keep last 20)
        const newSeen = [...qSet.map(q => q.content.substring(0, 50)), ...seenQuestions].slice(0, 20);
        localStorage.setItem(seenKey, JSON.stringify(newSeen));
        
        const perQuestionTime = getInitialTime(type, difficulty);
        setTimeLeft(perQuestionTime * qSet.length);
      } else {
        throw new Error("No questions generated");
      }
    } catch (err) {
      console.error("Generation failed:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleMcqSubmit = (isTimeout = false) => {
    if (!currentQuestion) return;
    if (!selectedOption && !isTimeout) return;
    
    const correct = selectedOption === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    if (correct) setScore(prev => prev + 1);
    setShowResult(true);
    if (isTimeout) setIsTimeUp(true);
  };

  const handleCodingSuccess = () => {
    if (!questionStatus[currentIndex]) {
      setScore(prev => prev + 1);
      setQuestionStatus(prev => ({ ...prev, [currentIndex]: true }));
      setIsCorrect(true);
    }
  };

  const handleCodeChange = (newCode: string, lang: string) => {
    setQuestionCodes(prev => ({
      ...prev,
      [currentIndex]: {
        ...(prev[currentIndex] || {}),
        [lang]: newCode
      }
    }));
  };

  const currentQuestionAsProblem = currentQuestion && currentQuestion.type === 'Coding' ? {
    id: currentQuestion.id,
    title: `Coding Challenge ${currentIndex + 1}`,
    difficulty: currentQuestion.difficulty,
    topic: currentQuestion.topicId || topic,
    statement: currentQuestion.content,
    constraints: ["Return the expected output", "Standard execution time limit"],
    testCases: currentQuestion.testCases?.map(tc => ({ 
      input: tc.input, 
      expectedOutput: tc.output,
      explanation: `Test case from AI` 
    })) || [],
    hiddenTestCases: (currentQuestion as any).hiddenTestCases?.map((tc: any) => ({ 
      input: tc.input, 
      expectedOutput: tc.output 
    })) || [],
    defaultCode: {
      ...(currentQuestion.codeTemplates || {}),
      ...(questionCodes[currentIndex] || {})
    }
  } : null;

  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowResult(false);
      setSelectedOption(null);
      setIsCorrect(questionStatus[currentIndex + 1] || false);
      setIsTimeUp(false);
    } else {
      setIsCompleted(true);
      await updateProfileStats(score);
    }
  };

  const goToQuestion = (index: number) => {
    setCurrentIndex(index);
    setShowResult(false);
    setSelectedOption(null);
    setIsCorrect(questionStatus[index] || false);
    setIsTimeUp(false);
  };

  const resetAssessment = () => {
    setQuestions([]);
    setCurrentIndex(0);
    setIsCompleted(false);
    setQuestionCodes({});
    setQuestionStatus({});
  };

  if (isCompleted) {
    return (
      <Card className="border-none shadow-xl overflow-hidden">
        <CardContent className="p-12 text-center space-y-8">
          <div className="w-24 h-24 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
            <Trophy size={48} />
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-2">Assessment Completed!</h2>
            <p className="text-gray-500">Great job on finishing the {topic} module.</p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-6 bg-gray-50 rounded-2xl">
              <div className="text-2xl font-black text-indigo-600">{score}/{questions.length}</div>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Final Score</div>
            </div>
            <div className="p-6 bg-gray-50 rounded-2xl">
              <div className="text-2xl font-black text-emerald-600">{Math.round((score/questions.length) * 100)}%</div>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Accuracy</div>
            </div>
            <div className="p-6 bg-gray-50 rounded-2xl">
              <div className="text-2xl font-black text-amber-600">{difficulty}</div>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Difficulty</div>
            </div>
          </div>
          <Button 
            onClick={resetAssessment}
            className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 rounded-2xl font-bold"
          >
            Practice Another Topic
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {questions.length === 0 ? (
        <Card className="border-none shadow-sm overflow-hidden">
          <CardHeader className="bg-indigo-600 text-white p-8">
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="text-indigo-200" />
              <CardTitle className="text-2xl font-bold">AI Assessment Generator</CardTitle>
            </div>
            <p className="text-indigo-100 opacity-80">Generate a set of 10 personalized practice questions tailored to your target topics.</p>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest block">Topic Domain</label>
                
                <div className="flex gap-2">
                  {(['MCQ', 'Coding'] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => handleTypeChange(t)}
                      className={`flex-1 py-3 rounded-2xl text-sm font-bold transition-all ${
                        assessmentType === t 
                          ? 'bg-gray-900 text-white shadow-xl' 
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                    >
                      {t} Mode
                    </button>
                  ))}
                </div>

                {assessmentType === 'MCQ' ? (
                  <div className="space-y-6">
                    {isAptitudePage && (
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Aptitude & Reasoning</h4>
                        <div className="flex flex-wrap gap-2">
                          {['Quantitative Aptitude', 'Logical Reasoning', 'Verbal Ability', 'Data Interpretation', 'Abstract Reasoning'].map(t => (
                            <button
                              key={t}
                              onClick={() => setTopic(t)}
                              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                                topic === t 
                                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                              }`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        {isAptitudePage ? 'Technical MCQ Library' : 'Core Tech Topics'}
                      </h4>
                      <div className="flex flex-wrap gap-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                        {[
                          'Programming Fundamentals', 'Data Structures', 'Algorithms', 
                          'Object Oriented Programming', 'DBMS', 'Operating Systems', 
                          'Computer Networks', 'Cybersecurity', 'AI & Machine Learning', 
                          'Software Engineering', 'Web Development', 'Cloud Computing & DevOps', 
                          'Discrete Mathematics', 'Computer Org & Architecture',
                          ...codingTopics.filter(t => !['Data Structures', 'Algorithms', 'DBMS', 'Operating Systems'].includes(t)) // Avoid simple duplicates
                        ].map(t => (
                          <button
                            key={t}
                            onClick={() => setTopic(t)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                              topic === t 
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">Coding Topics</h4>
                    <div className="flex flex-wrap gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      {codingTopics.map(t => (
                        <button
                          key={t}
                          onClick={() => setTopic(t)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            topic === t 
                              ? 'bg-rose-600 text-white shadow-lg shadow-rose-200' 
                              : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-100'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest block">Difficulty Level</label>
                <div className="flex gap-2">
                  {(['Easy', 'Medium', 'Hard'] as const).map(d => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
                        difficulty === d 
                          ? 'bg-gray-900 text-white shadow-lg shadow-gray-200' 
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {assessmentType === 'MCQ' ? (
                <Button 
                  onClick={() => handleGenerate('MCQ')}
                  disabled={isGenerating}
                  className="h-20 bg-indigo-600 hover:bg-indigo-700 rounded-2xl flex flex-col gap-1 group transition-all shadow-xl shadow-indigo-100"
                >
                  <div className="flex items-center gap-2 font-bold text-white">
                    <ListChecks size={24} />
                    Generate Multiple Choice Set
                  </div>
                  <span className="text-[10px] text-indigo-200 font-medium tracking-wide">Batch of 10 Concept Verification Questions</span>
                </Button>
              ) : (
                <Button 
                  onClick={() => handleGenerate('Coding')}
                  disabled={isGenerating}
                  className="h-20 bg-gray-900 hover:bg-black rounded-2xl flex flex-col gap-1 group transition-all shadow-xl"
                >
                  <div className="flex items-center gap-2 font-bold text-white">
                    <Code2 size={24} />
                    Generate Coding Batch
                  </div>
                  <span className="text-[10px] text-gray-500 font-medium tracking-wide">3 Hands-on Algorithms Challenges</span>
                </Button>
              )}
            </div>

            {isGenerating && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center gap-3 text-indigo-600 font-bold p-12 border-2 border-dashed border-indigo-100 rounded-3xl"
              >
                <Loader2 className="animate-spin" />
                AI is crafting 10 high-quality unique questions...
              </motion.div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                onClick={resetAssessment}
                className="text-gray-500 hover:text-gray-900"
              >
                ← Exit
              </Button>
              <div className="h-4 w-px bg-gray-200 mx-2 hidden md:block" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Assessment in Progress</span>
                <div className="flex items-center gap-2 mt-1">
                  <div className="h-1.5 w-32 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-indigo-600"
                      initial={{ width: 0 }}
                      animate={{ width: `${(score / questions.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-indigo-600 whitespace-nowrap">
                    {score}/{questions.length} Solved
                  </span>
                </div>
              </div>
            </div>

            {/* Question Navigation */}
            <div className="flex items-center gap-1.5 bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
              {questions.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToQuestion(i)}
                  className={`w-10 h-10 rounded-xl text-xs font-black transition-all flex items-center justify-center border-2 ${
                    currentIndex === i 
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200' 
                      : questionStatus[i]
                      ? 'bg-emerald-50 border-emerald-500/30 text-emerald-600'
                      : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'
                  }`}
                >
                  Q{i + 1}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4">
              {timeLeft !== null && !showResult && (
                <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full font-mono font-bold text-sm ${
                  timeLeft < 10 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-amber-100 text-amber-600'
                }`}>
                  <Timer size={14} />
                  {formatTime(timeLeft)}
                </div>
              )}
              <Badge variant="outline" className="text-gray-400 border-gray-200">{topic}</Badge>
              <Badge className={
                difficulty === 'Easy' ? 'bg-emerald-500' :
                difficulty === 'Medium' ? 'bg-amber-500' : 'bg-red-500'
              }>{difficulty}</Badge>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="h-[calc(100vh-280px)] min-h-[600px]"
            >
              {currentQuestion.type === 'MCQ' ? (
                <div className="h-full max-w-3xl mx-auto">
                  <Card className="border-none shadow-xl h-full">
                    <CardContent className="p-8 space-y-8 h-full flex flex-col justify-center">
                      <h3 className="text-xl font-bold leading-relaxed">{currentQuestion.content}</h3>
                      
                      <div className="grid gap-3">
                        {currentQuestion.options?.map((opt, i) => (
                          <button
                            key={i}
                            disabled={showResult}
                            onClick={() => setSelectedOption(opt)}
                            className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex items-center justify-between group ${
                              selectedOption === opt 
                                ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-600/10' 
                                : 'border-gray-100 hover:border-gray-200 bg-white shadow-sm'
                            } ${
                              showResult && opt === currentQuestion.correctAnswer
                                ? 'border-emerald-500 bg-emerald-50'
                                : showResult && selectedOption === opt && opt !== currentQuestion.correctAnswer
                                ? 'border-red-500 bg-red-50'
                                : ''
                            }`}
                          >
                            <span className={`flex items-center gap-4 ${
                              selectedOption === opt ? 'text-indigo-900 font-bold' : 'text-gray-600'
                            } ${
                              showResult && opt === currentQuestion.correctAnswer ? 'text-emerald-900 font-bold' : ''
                            }`}>
                              <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-50 text-[10px] font-black">
                                {String.fromCharCode(65 + i)}
                              </span>
                              {opt}
                            </span>
                            {showResult && opt === currentQuestion.correctAnswer && <CheckCircle2 className="text-emerald-500" />}
                            {showResult && selectedOption === opt && opt !== currentQuestion.correctAnswer && <XCircle className="text-red-500" />}
                          </button>
                        ))}
                      </div>

                      {!showResult ? (
                        <div className="flex gap-4">
                           <Button 
                            onClick={() => handleMcqSubmit(false)}
                            disabled={!selectedOption}
                            className="flex-1 h-14 bg-indigo-600 hover:bg-indigo-700 rounded-2xl font-bold shadow-lg shadow-indigo-100 transition-all hover:scale-[1.01]"
                          >
                            Submit Answer
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={() => handleNext()}
                            className="h-14 px-8 border-2 border-gray-100 rounded-2xl font-bold text-gray-400 hover:text-gray-900 overflow-hidden group"
                          >
                            Skip <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </div>
                      ) : (
                        <div className="pt-6 border-t border-gray-100 flex flex-col items-center gap-6">
                          <div className={`p-4 rounded-2xl flex items-center gap-3 w-full border ${
                            isCorrect ? 'bg-emerald-50 border-emerald-100 text-emerald-900' : 'bg-red-50 border-red-100 text-red-900'
                          }`}>
                            {isCorrect ? <Trophy size={20} /> : <Target size={20} />}
                            <p className="font-bold">
                              {isTimeUp && !isCorrect 
                                ? `Times up! The correct answer was: ${currentQuestion.correctAnswer}` 
                                : isCorrect 
                                ? 'Correct! Ready for the next one?' 
                                : `Not quite correct. The answer was: ${currentQuestion.correctAnswer}`}
                            </p>
                          </div>
                          <Button 
                            onClick={handleNext}
                            className="w-full h-14 bg-gray-900 hover:bg-black rounded-2xl font-bold flex items-center justify-center gap-2"
                          >
                            {currentIndex < questions.length - 1 ? 'Next Question' : 'View Results'}
                            <ArrowRight size={18} />
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="h-full">
                  {/* full width editor with internal description panel */}
                  {currentQuestionAsProblem && (
                    <CodeEditor 
                      problem={currentQuestionAsProblem as any} 
                      isAssessmentMode={true} 
                      onSuccess={handleCodingSuccess}
                      onCodeChange={handleCodeChange}
                    />
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
