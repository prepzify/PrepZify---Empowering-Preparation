import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, XCircle, ChevronRight, RotateCcw, Home, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { updateXp } from '../lib/firebase';
import { questionsService, Question } from '../services/questionsService';

export default function QuickPrepAssessment({ isModal = false, onClose }: { isModal?: boolean, onClose?: () => void }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [showResult, setShowResult] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadQuestions() {
      try {
        // Attempt to seed if empty (silent background)
        questionsService.seedQuestions().catch(console.error);
        
        const data = await questionsService.getQuestions(20);
        setQuestions(data);
        setAnswers(new Array(data.length).fill(null));
      } catch (error) {
        console.error('Loader failed:', error);
      } finally {
        setLoading(false);
      }
    }
    loadQuestions();
  }, []);

  const handleOptionClick = (optionIndex: number) => {
    if (answers[currentStep] !== null) return;
    const newAnswers = [...answers];
    newAnswers[currentStep] = optionIndex;
    setAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowResult(true);
    }
  };

  const score = answers.reduce((acc, ans, idx) => {
    return ans === questions[idx].correctAnswer ? acc + 1 : acc;
  }, 0);

  const reset = async () => {
    setLoading(true);
    const data = await questionsService.getQuestions(20);
    setQuestions(data);
    setCurrentStep(0);
    setAnswers(new Array(data.length).fill(null));
    setShowResult(false);
    setLoading(false);
  };

  useEffect(() => {
    if (showResult && score > 0) {
      const xp = score * 20;
      updateXp(xp, score);
    }
  }, [showResult, score]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 w-full min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Generating Fresh Questions...</p>
        </div>
      </div>
    );
  }

  if (showResult) {
    return (
      <div className={`flex flex-col items-center justify-center p-6 bg-surface ${isModal ? 'max-w-lg mx-auto' : 'min-h-screen'}`}>
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center w-full"
        >
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-1">Assessment Complete!</h2>
          <p className="text-on-surface-variant text-sm mb-6">You've finished the quick technical and aptitude check.</p>
          
          <div className="bg-surface-container p-4 rounded-xl border border-outline mb-6 w-full shadow-sm">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Final Score</p>
            <div className="text-4xl font-black text-primary mb-1">
              {score} / {questions.length}
            </div>
            <div className="text-xs font-medium text-on-surface">
              {Math.round((score / (questions.length || 1)) * 100)}% Accuracy
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <button 
              onClick={reset}
              className="flex-1 bg-surface-container-high border border-outline py-3 rounded-lg font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-surface-container-highest transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Try Again
            </button>
            <button 
              onClick={onClose || (() => navigate('/'))}
              className="flex-1 bg-primary text-white py-3 rounded-lg font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:brightness-110 transition-all font-black"
            >
              <Home className="w-3.5 h-3.5" /> Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const q = questions[currentStep];
  if (!q) return null;
  const isCorrect = answers[currentStep] === q.correctAnswer;

  return (
    <div className={`bg-surface ${isModal ? 'p-6 rounded-2xl w-full max-w-lg' : 'min-h-screen p-6'}`}>
      <div className="max-w-lg mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <span className="bg-primary/10 text-primary px-3 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider mb-1 inline-block">
              Question {currentStep + 1} of {questions.length}
            </span>
            <h1 className="text-lg font-bold capitalize">{q.type} Assessment</h1>
          </div>
          {isModal && (
            <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface p-1.5 bg-surface-container rounded-full">
              <XCircle className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1 bg-surface-container rounded-full mb-6 overflow-hidden">
          <motion.div 
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / (questions.length || 1)) * 100}%` }}
          />
        </div>

        <div className="min-h-[300px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="space-y-4"
            >
              <h2 className="text-base md:text-lg font-medium leading-relaxed">
                {q.question}
              </h2>

              <div className="space-y-2">
                {q.options.map((option, idx) => {
                  const isSelected = answers[currentStep] === idx;
                  const isAnswerCorrect = q.correctAnswer === idx;
                  
                  let bgColor = 'bg-surface-container hover:bg-surface-container-high transition-colors';
                  let borderColor = 'border-outline';
                  
                  if (isSelected) {
                    if (isAnswerCorrect) {
                      bgColor = 'bg-emerald-500/10';
                      borderColor = 'border-emerald-500';
                    } else {
                      bgColor = 'bg-red-500/10';
                      borderColor = 'border-red-500';
                    }
                  } else if (answers[currentStep] !== null && isAnswerCorrect) {
                     borderColor = 'border-emerald-500 border-2';
                  }

                  return (
                    <button
                      key={idx}
                      disabled={answers[currentStep] !== null}
                      onClick={() => handleOptionClick(idx)}
                      className={`w-full text-left p-3.5 rounded-xl border-2 ${bgColor} ${borderColor} flex items-center justify-between transition-all group`}
                    >
                      <span className={`text-xs font-medium ${isSelected ? 'font-bold' : ''}`}>{option}</span>
                      {isSelected && (isAnswerCorrect ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-red-500" />)}
                    </button>
                  );
                })}
              </div>

              {answers[currentStep] !== null && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-3 rounded-lg ${isCorrect ? 'bg-emerald-500/5' : 'bg-amber-500/5'} border border-outline mt-4 shadow-sm`}
                >
                  <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant mb-0.5">Explanation</p>
                  <p className="text-xs text-on-surface-variant">{q.explanation}</p>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            disabled={answers[currentStep] === null}
            onClick={nextQuestion}
            className={`px-6 py-2 rounded-full font-bold uppercase tracking-widest text-[10px] flex items-center gap-2 transition-all ${
              answers[currentStep] === null 
                ? 'bg-surface-container-highest text-on-surface-variant cursor-not-allowed opacity-50' 
                : 'bg-primary text-white hover:brightness-110 font-black'
            }`}
          >
            {currentStep === questions.length - 1 ? 'Finish' : 'Next'}
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

