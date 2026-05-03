import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { testAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FiPlay, FiChevronLeft, FiChevronRight, FiCheck, FiClock, FiTarget } from 'react-icons/fi';

const TestInterface = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState('config'); // config | testing | submitting
  const [config, setConfig] = useState({ type: 'resume-based', difficulty: 'medium', count: 10, companyName: '' });
  const [testData, setTestData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentQ, setCurrentQ] = useState(0);
  const [loading, setLoading] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Timer
  useState(() => {
    let interval;
    if (phase === 'testing') {
      interval = setInterval(() => setTimeElapsed(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [phase]);

  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const handleGenerate = async () => {
    if (config.type === 'company-based' && !config.companyName.trim()) {
      return toast.error('Please enter a company name');
    }
    setLoading(true);
    try {
      const res = await testAPI.generate(config);
      setTestData(res.data.test);
      setAnswers({});
      setCurrentQ(0);
      setTimeElapsed(0);
      setPhase('testing');
      toast.success('Test generated! Good luck!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate test');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    const answeredCount = Object.keys(answers).length;
    if (answeredCount < testData.questions.length) {
      const confirm = window.confirm(`You've answered ${answeredCount}/${testData.questions.length} questions. Submit anyway?`);
      if (!confirm) return;
    }
    setPhase('submitting');
    try {
      const orderedAnswers = testData.questions.map((_, i) => answers[i] || '');
      const res = await testAPI.submit({ testId: testData.id, answers: orderedAnswers });
      toast.success('Test submitted!');
      navigate('/test/result/' + res.data.result.id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submit failed');
      setPhase('testing');
    }
  };

  // Config Phase
  if (phase === 'config') {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Mock Test</h1>
          <p className="text-text-secondary mt-1">Configure and start an AI-generated placement test</p>
        </div>

        <div className="glass-card p-6 space-y-6">
          {/* Test Type */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-3">Test Type</label>
            <div className="grid grid-cols-2 gap-3">
              {['resume-based', 'company-based'].map(type => (
                <button key={type} onClick={() => setConfig(c => ({ ...c, type }))}
                  className={`p-4 rounded-xl border text-left transition-all ${config.type === type ? 'border-primary bg-primary/10 text-primary-light' : 'border-border text-text-secondary hover:border-primary/50'}`}>
                  <p className="font-semibold text-sm capitalize">{type.replace('-', ' ')}</p>
                  <p className="text-xs mt-1 opacity-75">{type === 'resume-based' ? 'Based on your resume skills' : 'Based on target company'}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Company Name (conditional) */}
          {config.type === 'company-based' && (
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Target Company</label>
              <input type="text" value={config.companyName} onChange={(e) => setConfig(c => ({ ...c, companyName: e.target.value }))} placeholder="e.g. Google, Amazon, TCS..." className="w-full" />
            </div>
          )}

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-3">Difficulty</label>
            <div className="grid grid-cols-3 gap-3">
              {['easy', 'medium', 'hard'].map(d => (
                <button key={d} onClick={() => setConfig(c => ({ ...c, difficulty: d }))}
                  className={`p-3 rounded-xl border text-center text-sm font-medium capitalize transition-all ${config.difficulty === d ? 'border-primary bg-primary/10 text-primary-light' : 'border-border text-text-secondary hover:border-primary/50'}`}>
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Question Count */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Number of Questions</label>
            <select value={config.count} onChange={(e) => setConfig(c => ({ ...c, count: parseInt(e.target.value) }))} className="w-full">
              <option value={5}>5 Questions</option>
              <option value={10}>10 Questions</option>
              <option value={15}>15 Questions</option>
              <option value={20}>20 Questions</option>
            </select>
          </div>

          <button onClick={handleGenerate} disabled={loading} className="btn btn-primary w-full py-3 text-base">
            {loading ? <div className="spinner w-5 h-5 border-2" /> : <><FiPlay /> Start Test</>}
          </button>

          {loading && <p className="text-center text-text-muted text-sm">AI is generating your questions... Please wait.</p>}
        </div>
      </div>
    );
  }

  // Testing Phase
  if (phase === 'testing' || phase === 'submitting') {
    const q = testData.questions[currentQ];
    const answeredCount = Object.keys(answers).length;

    return (
      <div className="max-w-3xl mx-auto space-y-4 animate-fade-in">
        {/* Header Bar */}
        <div className="glass-card p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-text-secondary flex items-center gap-1">
              <FiTarget className="text-primary" /> {answeredCount}/{testData.totalQuestions} answered
            </span>
            <span className="text-sm font-medium text-text-secondary flex items-center gap-1">
              <FiClock className="text-accent" /> {formatTime(timeElapsed)}
            </span>
          </div>
          <button onClick={handleSubmit} disabled={phase === 'submitting'} className="btn btn-success text-sm py-2 px-4">
            {phase === 'submitting' ? <div className="spinner w-4 h-4 border-2" /> : <><FiCheck /> Submit</>}
          </button>
        </div>

        {/* Progress Dots */}
        <div className="flex gap-1.5 flex-wrap">
          {testData.questions.map((_, i) => (
            <button key={i} onClick={() => setCurrentQ(i)}
              className={`w-8 h-8 rounded-lg text-xs font-medium transition-all
                ${i === currentQ ? 'bg-primary text-white' : answers[i] ? 'bg-success/20 text-success border border-success/30' : 'bg-surface-lighter/50 text-text-muted hover:bg-surface-lighter'}`}>
              {i + 1}
            </button>
          ))}
        </div>

        {/* Question Card */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-2 py-0.5 rounded-full bg-primary/15 text-primary-light text-xs font-medium">Q{currentQ + 1}</span>
            {q.topic && <span className="px-2 py-0.5 rounded-full bg-surface-lighter text-text-muted text-xs">{q.topic}</span>}
          </div>
          <h2 className="text-lg font-medium text-text-primary leading-relaxed mb-6">{q.question}</h2>

          <div className="space-y-3">
            {q.options.map((opt, oi) => (
              <button key={oi} onClick={() => setAnswers(a => ({ ...a, [currentQ]: opt }))}
                className={`w-full text-left p-4 rounded-xl border transition-all text-sm
                  ${answers[currentQ] === opt
                    ? 'border-primary bg-primary/10 text-primary-light'
                    : 'border-border/50 text-text-secondary hover:border-primary/30 hover:bg-surface-lighter/30'}`}>
                <span className="font-medium mr-2">{String.fromCharCode(65 + oi)}.</span>
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button onClick={() => setCurrentQ(c => Math.max(0, c - 1))} disabled={currentQ === 0} className="btn btn-secondary">
            <FiChevronLeft /> Previous
          </button>
          <button onClick={() => setCurrentQ(c => Math.min(testData.questions.length - 1, c + 1))} disabled={currentQ === testData.questions.length - 1} className="btn btn-secondary">
            Next <FiChevronRight />
          </button>
        </div>
      </div>
    );
  }
};

export default TestInterface;
