import { useState } from 'react';
import { interviewAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FiUsers, FiPlay, FiSend, FiAward, FiChevronRight } from 'react-icons/fi';

const Interview = () => {
  const [phase, setPhase] = useState('setup'); // setup | interview | summary
  const [role, setRole] = useState('Software Engineer');
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answer, setAnswer] = useState('');
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);

  const handleStart = async () => {
    setLoading(true);
    try {
      const res = await interviewAPI.getQuestions({ role });
      setQuestions(res.data.questions);
      setEvaluations([]);
      setCurrentQ(0);
      setPhase('interview');
      toast.success('Interview started! Good luck!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start interview');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) return toast.error('Please write your answer');
    setEvaluating(true);
    try {
      const q = questions[currentQ];
      const res = await interviewAPI.evaluate({
        question: q.question,
        answer: answer,
        expectedPoints: q.expectedPoints,
      });
      setEvaluations(prev => [...prev, { questionIndex: currentQ, ...res.data.evaluation }]);
      setAnswer('');

      if (currentQ < questions.length - 1) {
        setCurrentQ(c => c + 1);
      } else {
        setPhase('summary');
      }
    } catch (err) {
      toast.error('Failed to evaluate answer');
    } finally {
      setEvaluating(false);
    }
  };

  const totalScore = evaluations.reduce((sum, e) => sum + (e.score || 0), 0);
  const maxScore = evaluations.reduce((sum, e) => sum + (e.maxScore || 10), 0);

  // Setup Phase
  if (phase === 'setup') {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Mock Interview</h1>
          <p className="text-text-secondary mt-1">Practice with AI-generated interview questions and get feedback</p>
        </div>
        <div className="glass-card p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Target Role</label>
            <input type="text" value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Software Engineer, Data Analyst..." className="w-full" />
          </div>
          <div className="p-4 rounded-xl bg-surface-lighter/30 border border-border/30">
            <h3 className="font-medium text-text-primary text-sm mb-2">How it works:</h3>
            <ul className="text-xs text-text-secondary space-y-1">
              <li>• AI generates 5 interview questions based on your skills & role</li>
              <li>• Answer each question in text</li>
              <li>• Get instant AI feedback with score and suggestions</li>
              <li>• View summary with overall performance</li>
            </ul>
          </div>
          <button onClick={handleStart} disabled={loading} className="btn btn-primary w-full py-3">
            {loading ? <div className="spinner w-5 h-5 border-2" /> : <><FiPlay /> Start Interview</>}
          </button>
        </div>
      </div>
    );
  }

  // Interview Phase
  if (phase === 'interview') {
    const q = questions[currentQ];
    const lastEval = evaluations[evaluations.length - 1];

    return (
      <div className="max-w-3xl mx-auto space-y-4 animate-fade-in">
        {/* Progress */}
        <div className="glass-card p-4 flex items-center justify-between">
          <span className="text-sm text-text-secondary">Question {currentQ + 1} of {questions.length}</span>
          <div className="flex gap-2">
            {questions.map((_, i) => (
              <div key={i} className={`w-3 h-3 rounded-full ${i < currentQ ? 'bg-success' : i === currentQ ? 'bg-primary pulse-glow' : 'bg-surface-lighter'}`} />
            ))}
          </div>
        </div>

        {/* Show feedback from last question */}
        {lastEval && currentQ > 0 && (
          <div className="glass-card p-5 border-l-4 border-l-primary animate-slide-up">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-text-primary">Previous Answer Feedback</p>
              <span className="text-sm font-bold text-primary">{lastEval.score}/{lastEval.maxScore}</span>
            </div>
            <p className="text-xs text-text-secondary">{lastEval.feedback}</p>
          </div>
        )}

        {/* Question */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${q.type === 'technical' ? 'bg-primary/15 text-primary-light' : q.type === 'behavioral' ? 'bg-accent/15 text-accent' : 'bg-warning/15 text-warning'}`}>
              {q.type}
            </span>
            {q.topic && <span className="text-xs text-text-muted">{q.topic}</span>}
          </div>
          <h2 className="text-lg font-medium text-text-primary leading-relaxed">{q.question}</h2>
        </div>

        {/* Answer */}
        <div className="glass-card p-6">
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer here... Be detailed and specific."
            rows={6}
            className="w-full resize-none"
          />
          <div className="flex justify-end mt-4">
            <button onClick={handleSubmitAnswer} disabled={evaluating || !answer.trim()} className="btn btn-primary">
              {evaluating ? <div className="spinner w-5 h-5 border-2" /> : <>Submit Answer <FiSend /></>}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Summary Phase
  if (phase === 'summary') {
    const percentage = Math.round((totalScore / maxScore) * 100);

    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        {/* Score Overview */}
        <div className="glass-card p-8 text-center">
          <FiAward className="w-12 h-12 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-text-primary">Interview Complete!</h1>
          <div className="mt-4">
            <span className={`text-5xl font-bold ${percentage >= 70 ? 'text-success' : percentage >= 40 ? 'text-warning' : 'text-danger'}`}>
              {percentage}%
            </span>
            <p className="text-text-muted mt-2">Overall Score: {totalScore}/{maxScore}</p>
          </div>
        </div>

        {/* Per-question Review */}
        <div className="space-y-4">
          {evaluations.map((ev, i) => (
            <div key={i} className="glass-card p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-medium text-text-primary">Q{ev.questionIndex + 1}. {questions[ev.questionIndex]?.question}</p>
                </div>
                <span className={`text-sm font-bold ${ev.score >= 7 ? 'text-success' : ev.score >= 4 ? 'text-warning' : 'text-danger'}`}>
                  {ev.score}/{ev.maxScore}
                </span>
              </div>
              <p className="text-xs text-text-secondary mb-2">{ev.feedback}</p>
              {ev.strengths?.length > 0 && (
                <div className="text-xs text-success mb-1">✓ {ev.strengths.join(' • ')}</div>
              )}
              {ev.improvements?.length > 0 && (
                <div className="text-xs text-warning">△ {ev.improvements.join(' • ')}</div>
              )}
            </div>
          ))}
        </div>

        <button onClick={() => { setPhase('setup'); setEvaluations([]); }} className="btn btn-primary w-full">
          <FiChevronRight /> Start New Interview
        </button>
      </div>
    );
  }
};

export default Interview;
