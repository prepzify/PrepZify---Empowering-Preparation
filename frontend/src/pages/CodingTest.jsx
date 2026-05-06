import { useState } from 'react';
import { codingTestAPI } from '../services/api';
import toast from 'react-hot-toast';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import {
  FiPlay, FiSend, FiCode, FiClock, FiCheck, FiX, FiChevronDown, FiChevronUp,
  FiTarget, FiZap, FiAward, FiRefreshCw, FiEye, FiAlertTriangle
} from 'react-icons/fi';

const LANGUAGES = [
  { id: 'python', name: 'Python', icon: '🐍', color: 'from-yellow-400 to-blue-500' },
  { id: 'javascript', name: 'JavaScript', icon: '⚡', color: 'from-yellow-400 to-yellow-600' },
  { id: 'java', name: 'Java', icon: '☕', color: 'from-red-400 to-orange-500' },
  { id: 'cpp', name: 'C++', icon: '⚙️', color: 'from-blue-400 to-blue-600' },
  { id: 'c', name: 'C', icon: '🔧', color: 'from-gray-400 to-blue-500' },
];

const DIFFICULTIES = [
  { id: 'easy', label: 'Easy', color: 'text-success', bg: 'bg-success/15 border-success/30' },
  { id: 'medium', label: 'Medium', color: 'text-warning', bg: 'bg-warning/15 border-warning/30' },
  { id: 'hard', label: 'Hard', color: 'text-danger', bg: 'bg-danger/15 border-danger/30' },
];

const getLanguageExtension = (lang) => {
  switch (lang) {
    case 'javascript': return javascript();
    case 'python': return python();
    case 'java': return java();
    case 'cpp': case 'c': return cpp();
    default: return python();
  }
};

const CodingTest = () => {
  const [phase, setPhase] = useState('config');
  const [config, setConfig] = useState({
    language: 'python', mode: 'resume-based', companyName: '', difficulty: '',
  });
  const [challenge, setChallenge] = useState(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timerRef, setTimerRef] = useState(null);
  const [showHints, setShowHints] = useState(false);
  const [runningCode, setRunningCode] = useState(false);
  const [runResults, setRunResults] = useState(null);
  const [activeTab, setActiveTab] = useState('testcases');

  const startTimer = () => {
    const ref = setInterval(() => setTimeElapsed(t => t + 1), 1000);
    setTimerRef(ref);
  };
  const stopTimer = () => { if (timerRef) clearInterval(timerRef); };
  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const handleGenerate = async () => {
    if (config.mode === 'company-based' && !config.companyName.trim()) {
      return toast.error('Please enter a company name');
    }
    setLoading(true);
    try {
      const res = await codingTestAPI.generate(config);
      setChallenge(res.data.challenge);
      setCode(res.data.challenge.starterCodes?.[config.language] || res.data.challenge.starterCode || '');
      setTimeElapsed(0);
      setPhase('coding');
      startTimer();
      toast.success('Challenge generated! Good luck!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate challenge');
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = (newLang) => {
    setConfig(c => ({ ...c, language: newLang }));
    // Update code to the new language's boilerplate
    if (challenge?.starterCodes?.[newLang]) {
      setCode(challenge.starterCodes[newLang]);
    }
  };

  const handleRunCode = async () => {
    if (!code.trim()) return toast.error('Please write some code first');
    setRunningCode(true);
    setActiveTab('result');
    setRunResults(null);
    try {
      const res = await codingTestAPI.run({
        challengeId: challenge.id,
        code,
        language: config.language,
      });
      setRunResults(res.data);
      if (res.data.summary.allPassed) {
        toast.success('All visible test cases passed!');
      } else if (res.data.summary.compilationError) {
        toast.error('Compilation Error');
      } else {
        toast.error(`${res.data.summary.failed} test cases failed`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to run code');
    } finally {
      setRunningCode(false);
    }
  };

  const handleSubmit = async () => {
    if (!code.trim()) return toast.error('Please write some code first');
    stopTimer();
    setLoading(true);
    try {
      const res = await codingTestAPI.submit({ challengeId: challenge.id, code });
      setResult(res.data.result);
      setPhase('result');
      toast.success('Solution evaluated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Evaluation failed');
      startTimer();
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    stopTimer();
    setPhase('config');
    setChallenge(null);
    setCode('');
    setResult(null);
    setTimeElapsed(0);
    setShowHints(false);
    setRunResults(null);
    setActiveTab('testcases');
  };

  // ── CONFIG PHASE ──
  if (phase === 'config') {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <FiCode className="text-primary" /> Coding Test
          </h1>
          <p className="text-text-secondary mt-1">Solve AI-generated coding challenges in your preferred language</p>
        </div>

        <div className="glass-card p-6 space-y-6">
          {/* Language Selector */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-3">Programming Language</label>
            <div className="grid grid-cols-5 gap-2">
              {LANGUAGES.map(lang => (
                <button key={lang.id} onClick={() => setConfig(c => ({ ...c, language: lang.id }))}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all text-center
                    ${config.language === lang.id
                      ? 'border-primary bg-primary/10 text-primary-light shadow-lg shadow-primary/10'
                      : 'border-border text-text-secondary hover:border-primary/50'}`}>
                  <span className="text-xl">{lang.icon}</span>
                  <span className="text-xs font-semibold">{lang.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Mode Toggle */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-3">Challenge Mode</label>
            <div className="grid grid-cols-2 gap-3">
              {['resume-based', 'company-based'].map(mode => (
                <button key={mode} onClick={() => setConfig(c => ({ ...c, mode }))}
                  className={`p-4 rounded-xl border text-left transition-all
                    ${config.mode === mode ? 'border-primary bg-primary/10 text-primary-light' : 'border-border text-text-secondary hover:border-primary/50'}`}>
                  <p className="font-semibold text-sm capitalize">{mode.replace('-', ' ')}</p>
                  <p className="text-xs mt-1 opacity-75">
                    {mode === 'resume-based' ? 'Difficulty based on your resume score & skills' : 'Problems matching target company patterns'}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Company Input */}
          {config.mode === 'company-based' && (
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Target Company</label>
              <input type="text" value={config.companyName}
                onChange={(e) => setConfig(c => ({ ...c, companyName: e.target.value }))}
                placeholder="e.g. Google, Amazon, Microsoft, TCS..."
                className="w-full" />
            </div>
          )}

          {/* Difficulty (optional override) */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-3">
              Difficulty <span className="text-text-muted">(auto-selected from your profile if blank)</span>
            </label>
            <div className="grid grid-cols-4 gap-3">
              <button onClick={() => setConfig(c => ({ ...c, difficulty: '' }))}
                className={`p-3 rounded-xl border text-center text-sm font-medium transition-all
                  ${!config.difficulty ? 'border-primary bg-primary/10 text-primary-light' : 'border-border text-text-secondary hover:border-primary/50'}`}>
                Auto
              </button>
              {DIFFICULTIES.map(d => (
                <button key={d.id} onClick={() => setConfig(c => ({ ...c, difficulty: d.id }))}
                  className={`p-3 rounded-xl border text-center text-sm font-medium capitalize transition-all
                    ${config.difficulty === d.id ? `${d.bg} ${d.color}` : 'border-border text-text-secondary hover:border-primary/50'}`}>
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <button onClick={handleGenerate} disabled={loading} className="btn btn-primary w-full py-3 text-base">
            {loading ? <div className="spinner w-5 h-5 border-2" /> : <><FiZap /> Generate Challenge</>}
          </button>
          {loading && <p className="text-center text-text-muted text-sm animate-pulse">AI is crafting your challenge... Please wait.</p>}
        </div>
      </div>
    );
  }

  // ── CODING PHASE ──
  if (phase === 'coding') {
    const prob = challenge.problem;
    return (
      <div className="space-y-4 animate-fade-in">
        {/* Top Bar */}
        <div className="glass-card p-3 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-primary/15 text-primary-light text-xs font-bold">
              {LANGUAGES.find(l => l.id === challenge.language)?.icon} {LANGUAGES.find(l => l.id === challenge.language)?.name}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              challenge.difficulty === 'easy' ? 'bg-success/15 text-success' :
              challenge.difficulty === 'hard' ? 'bg-danger/15 text-danger' : 'bg-warning/15 text-warning'}`}>
              {challenge.difficulty?.toUpperCase()}
            </span>
            {challenge.companyName && (
              <span className="px-3 py-1 rounded-full bg-accent/15 text-accent text-xs font-bold">{challenge.companyName}</span>
            )}
            <span className="text-sm text-text-secondary flex items-center gap-1"><FiClock className="text-accent" /> {formatTime(timeElapsed)}</span>
          </div>
          <div className="flex gap-2">
            <button onClick={handleReset} className="btn btn-secondary text-sm py-2 px-3"><FiRefreshCw /> New</button>
            <button onClick={handleRunCode} disabled={runningCode || loading} className="btn btn-primary text-sm py-2 px-4 bg-primary text-white hover:bg-primary-dark">
              {runningCode ? <div className="spinner w-4 h-4 border-2" /> : <><FiPlay /> Run Code</>}
            </button>
            <button onClick={handleSubmit} disabled={loading || runningCode} className="btn btn-success text-sm py-2 px-4">
              {loading ? <div className="spinner w-4 h-4 border-2" /> : <><FiSend /> Submit</>}
            </button>
          </div>
        </div>

        {/* Split Pane */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" style={{ minHeight: '70vh' }}>
          {/* Left: Problem */}
          <div className="glass-card p-5 overflow-y-auto" style={{ maxHeight: '75vh' }}>
            <h2 className="text-lg font-bold text-text-primary mb-3">{prob.title}</h2>
            <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap mb-4">{prob.description}</p>

            {prob.inputFormat && (
              <div className="mb-3">
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Input Format</h3>
                <p className="text-sm text-text-secondary">{prob.inputFormat}</p>
              </div>
            )}
            {prob.outputFormat && (
              <div className="mb-4">
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Output Format</h3>
                <p className="text-sm text-text-secondary">{prob.outputFormat}</p>
              </div>
            )}

            {/* Examples */}
            {prob.examples?.map((ex, i) => (
              <div key={i} className="mb-3 p-3 rounded-lg bg-surface/60 border border-border/40">
                <p className="text-xs font-semibold text-text-muted mb-1">Example {i + 1}</p>
                <div className="grid grid-cols-2 gap-2 mb-1">
                  <div>
                    <p className="text-xs text-text-muted">Input</p>
                    <pre className="text-xs text-text-primary font-mono bg-surface-lighter/50 p-2 rounded mt-0.5 overflow-x-auto">{ex.input}</pre>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">Output</p>
                    <pre className="text-xs text-text-primary font-mono bg-surface-lighter/50 p-2 rounded mt-0.5 overflow-x-auto">{ex.output}</pre>
                  </div>
                </div>
                {ex.explanation && <p className="text-xs text-text-muted italic">💡 {ex.explanation}</p>}
              </div>
            ))}

            {/* Constraints */}
            {prob.constraints?.length > 0 && (
              <div className="mb-3">
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Constraints</h3>
                <ul className="text-xs text-text-secondary space-y-0.5">
                  {prob.constraints.map((c, i) => <li key={i}>• {c}</li>)}
                </ul>
              </div>
            )}

            {/* Hints */}
            {challenge.hints?.length > 0 && (
              <div className="mt-4">
                <button onClick={() => setShowHints(!showHints)}
                  className="flex items-center gap-1 text-xs font-medium text-warning hover:text-warning/80 transition-colors">
                  <FiEye /> {showHints ? 'Hide Hints' : 'Show Hints'}
                  {showHints ? <FiChevronUp /> : <FiChevronDown />}
                </button>
                {showHints && (
                  <div className="mt-2 p-3 rounded-lg bg-warning/5 border border-warning/20">
                    {challenge.hints.map((h, i) => (
                      <p key={i} className="text-xs text-warning/80 mb-1">💡 {h}</p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Code Editor & Console */}
          <div className="flex flex-col gap-4" style={{ maxHeight: '75vh' }}>
            
            {/* Editor Container */}
            <div className="glass-card overflow-hidden flex flex-col flex-1 min-h-0">
              <div className="px-4 py-2 border-b border-border/50 flex items-center justify-between bg-surface-lighter/30">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-text-muted">Language:</span>
                  <select 
                    value={config.language} 
                    onChange={(e) => handleLanguageChange(e.target.value)}
                    className="bg-surface border border-border/50 text-text-primary text-xs rounded px-2 py-1 outline-none focus:border-primary"
                  >
                    {LANGUAGES.map(l => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>
                <span className="text-xs text-text-muted">{challenge.totalTestCases} test cases</span>
              </div>
              <div className="flex-1 overflow-auto">
                <CodeMirror
                  value={code}
                  onChange={(val) => setCode(val)}
                  theme={vscodeDark}
                  extensions={[getLanguageExtension(config.language)]}
                  height="100%"
                  minHeight="300px"
                  style={{ fontSize: '14px' }}
                  basicSetup={{
                    lineNumbers: true,
                    highlightActiveLineGutter: true,
                    foldGutter: true,
                    autocompletion: true,
                    bracketMatching: true,
                    closeBrackets: true,
                    indentOnInput: true,
                  }}
                />
              </div>
            </div>

            {/* Console Container */}
            <div className="glass-card flex flex-col h-64 shrink-0">
              <div className="flex items-center gap-4 px-4 border-b border-border/50 bg-surface-lighter/30">
                <button onClick={() => setActiveTab('testcases')} className={`py-2 text-xs font-semibold border-b-2 transition-colors ${activeTab === 'testcases' ? 'border-primary text-primary-light' : 'border-transparent text-text-muted hover:text-text-secondary'}`}>
                  Test Cases
                </button>
                <button onClick={() => setActiveTab('result')} className={`py-2 text-xs font-semibold border-b-2 transition-colors ${activeTab === 'result' ? 'border-primary text-primary-light' : 'border-transparent text-text-muted hover:text-text-secondary'}`}>
                  Run Result
                </button>
              </div>
              <div className="p-4 overflow-y-auto flex-1 bg-surface/30">
                {activeTab === 'testcases' ? (
                  <div className="space-y-4">
                    {challenge.testCases.map((tc, i) => (
                      <div key={i}>
                        <p className="text-xs font-medium text-text-secondary mb-1">Case {i + 1}</p>
                        <div className="grid grid-cols-2 gap-2">
                          <div><p className="text-[10px] text-text-muted mb-0.5">Input</p><pre className="text-xs font-mono bg-background/50 p-2 rounded text-text-primary overflow-x-auto">{tc.input}</pre></div>
                          <div><p className="text-[10px] text-text-muted mb-0.5">Expected Output</p><pre className="text-xs font-mono bg-background/50 p-2 rounded text-text-primary overflow-x-auto">{tc.expectedOutput}</pre></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div>
                    {!runResults && !runningCode && <p className="text-xs text-text-muted italic">Run your code to see results here.</p>}
                    {runningCode && <div className="flex items-center gap-2 text-primary text-sm"><div className="spinner w-4 h-4 border-2" /> Running against test cases...</div>}
                    
                    {runResults && (
                      <div className="space-y-4">
                        {runResults.summary.compilationError && (
                          <div className="p-3 bg-danger/10 border border-danger/30 rounded-lg">
                            <p className="text-sm font-semibold text-danger mb-1">Compilation Error</p>
                            <pre className="text-xs text-danger/90 whitespace-pre-wrap font-mono">{runResults.summary.compilationError}</pre>
                          </div>
                        )}
                        {!runResults.summary.compilationError && (
                          <div className="flex gap-4 mb-4">
                            <span className={`text-sm font-bold ${runResults.summary.allPassed ? 'text-success' : 'text-danger'}`}>
                              {runResults.summary.allPassed ? 'Accepted' : 'Wrong Answer'}
                            </span>
                            <span className="text-sm text-text-secondary">{runResults.summary.passed}/{runResults.summary.total} test cases passed</span>
                          </div>
                        )}
                        
                        {!runResults.summary.compilationError && runResults.results.map((r, i) => (
                          <div key={i} className="mb-4">
                            <div className="flex items-center gap-2 mb-2">
                              {r.passed ? <FiCheck className="text-success" /> : <FiX className="text-danger" />}
                              <span className="text-xs font-semibold text-text-primary">Test Case {r.testCase}</span>
                              <span className="text-[10px] bg-surface-lighter px-2 py-0.5 rounded text-text-muted">{r.executionTime}ms</span>
                            </div>
                            <div className="grid grid-cols-1 gap-2 pl-6">
                              <div><p className="text-[10px] text-text-muted">Input</p><pre className="text-xs font-mono bg-background/50 p-2 rounded text-text-primary overflow-x-auto">{r.input}</pre></div>
                              <div><p className="text-[10px] text-text-muted">Expected Output</p><pre className="text-xs font-mono bg-background/50 p-2 rounded text-text-primary overflow-x-auto">{r.expectedOutput}</pre></div>
                              <div>
                                <p className="text-[10px] text-text-muted">STDOUT (Actual Output)</p>
                                <pre className={`text-xs font-mono bg-background/50 p-2 rounded overflow-x-auto ${r.passed ? 'text-text-primary' : 'text-danger/90'}`}>{r.actualOutput || <span className="italic opacity-50">No output</span>}</pre>
                              </div>
                              {r.error && (
                                <div><p className="text-[10px] text-danger">Error</p><pre className="text-xs font-mono bg-danger/10 p-2 rounded text-danger overflow-x-auto">{r.error}</pre></div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── RESULT PHASE ──
  if (phase === 'result' && result) {
    const ev = result.evaluation;
    const scoreColor = result.score >= 70 ? 'text-success' : result.score >= 40 ? 'text-warning' : 'text-danger';
    const scoreRing = result.score >= 70 ? 'stroke-emerald-500' : result.score >= 40 ? 'stroke-amber-500' : 'stroke-red-500';
    const circumference = 2 * Math.PI * 54;
    const dashOffset = circumference - (circumference * result.score / 100);

    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <FiAward className="text-primary" /> Challenge Results
          </h1>
          <button onClick={handleReset} className="btn btn-primary"><FiRefreshCw /> New Challenge</button>
        </div>

        {/* Score + Meta */}
        <div className="glass-card p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Score Ring */}
            <div className="relative w-32 h-32 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="54" fill="none" stroke="#334155" strokeWidth="8" />
                <circle cx="60" cy="60" r="54" fill="none" className={scoreRing} strokeWidth="8"
                  strokeDasharray={circumference} strokeDashoffset={dashOffset}
                  strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1.5s ease-in-out' }} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-3xl font-bold ${scoreColor}`}>{result.score}</span>
                <span className="text-xs text-text-muted">/100</span>
              </div>
            </div>

            <div className="flex-1 space-y-2 text-center sm:text-left">
              <h2 className="text-xl font-bold text-text-primary">{result.problem?.title}</h2>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                <span className="px-2 py-0.5 rounded-full bg-primary/15 text-primary-light text-xs font-medium">
                  {LANGUAGES.find(l => l.id === result.language)?.name}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  result.difficulty === 'easy' ? 'bg-success/15 text-success' :
                  result.difficulty === 'hard' ? 'bg-danger/15 text-danger' : 'bg-warning/15 text-warning'}`}>
                  {result.difficulty}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-surface-lighter text-text-muted text-xs">
                  ⏱ {formatTime(timeElapsed)}
                </span>
              </div>
              {ev.feedback && <p className="text-sm text-text-secondary mt-2">{ev.feedback}</p>}
            </div>
          </div>
        </div>

        {/* Test Results */}
        <div className="glass-card p-6">
          <h3 className="text-base font-semibold text-text-primary mb-4 flex items-center gap-2"><FiTarget /> Test Case Results</h3>
          <div className="space-y-2">
            {ev.testResults?.map((tr, i) => (
              <div key={i} className={`p-3 rounded-xl border flex items-center justify-between
                ${tr.passed ? 'border-success/30 bg-success/5' : 'border-danger/30 bg-danger/5'}`}>
                <div className="flex items-center gap-3">
                  {tr.passed
                    ? <div className="w-7 h-7 rounded-full bg-success/20 flex items-center justify-center"><FiCheck className="w-4 h-4 text-success" /></div>
                    : <div className="w-7 h-7 rounded-full bg-danger/20 flex items-center justify-center"><FiX className="w-4 h-4 text-danger" /></div>
                  }
                  <div>
                    <span className="text-sm font-medium text-text-primary">Test Case {tr.testCase || i + 1}</span>
                    {tr.notes && <p className="text-xs text-text-muted">{tr.notes}</p>}
                  </div>
                </div>
                <span className={`text-xs font-bold ${tr.passed ? 'text-success' : 'text-danger'}`}>
                  {tr.passed ? 'PASSED' : 'FAILED'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Code Quality + Complexity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Code Quality */}
          <div className="glass-card p-6">
            <h3 className="text-base font-semibold text-text-primary mb-4">Code Quality</h3>
            <div className="space-y-3">
              {[
                { label: 'Readability', val: ev.codeQuality?.readability },
                { label: 'Efficiency', val: ev.codeQuality?.efficiency },
                { label: 'Correctness', val: ev.codeQuality?.correctness },
                { label: 'Edge Cases', val: ev.codeQuality?.edgeCases },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-text-secondary">{item.label}</span>
                    <span className="text-text-primary font-medium">{item.val || 0}/10</span>
                  </div>
                  <div className="h-2 bg-surface-lighter rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-1000"
                      style={{ width: `${(item.val || 0) * 10}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Complexity */}
          <div className="glass-card p-6">
            <h3 className="text-base font-semibold text-text-primary mb-4">Complexity Analysis</h3>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-surface-lighter/30">
                <p className="text-xs text-text-muted">Time Complexity</p>
                <p className="text-lg font-mono font-bold text-accent">{ev.complexity?.time || 'N/A'}</p>
              </div>
              <div className="p-3 rounded-lg bg-surface-lighter/30">
                <p className="text-xs text-text-muted">Space Complexity</p>
                <p className="text-lg font-mono font-bold text-primary-light">{ev.complexity?.space || 'N/A'}</p>
              </div>
              {ev.complexity?.analysis && (
                <p className="text-xs text-text-secondary">{ev.complexity.analysis}</p>
              )}
            </div>
          </div>
        </div>

        {/* Strengths / Improvements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-card p-6">
            <h3 className="text-base font-semibold text-success mb-3 flex items-center gap-2"><FiCheck /> Strengths</h3>
            <ul className="space-y-1.5">
              {ev.strengths?.map((s, i) => (
                <li key={i} className="text-sm text-text-secondary flex items-start gap-2">
                  <span className="text-success mt-0.5">✓</span> {s}
                </li>
              ))}
            </ul>
          </div>
          <div className="glass-card p-6">
            <h3 className="text-base font-semibold text-warning mb-3 flex items-center gap-2"><FiAlertTriangle /> Improvements</h3>
            <ul className="space-y-1.5">
              {ev.improvements?.map((s, i) => (
                <li key={i} className="text-sm text-text-secondary flex items-start gap-2">
                  <span className="text-warning mt-0.5">→</span> {s}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Optimal Solution Hint */}
        {ev.optimalSolution && ev.optimalSolution !== 'N/A' && (
          <div className="glass-card p-6">
            <h3 className="text-base font-semibold text-text-primary mb-2">💡 Optimal Approach</h3>
            <p className="text-sm text-text-secondary">{ev.optimalSolution}</p>
          </div>
        )}

        {/* Compilation Issues */}
        {ev.compilationIssues && ev.compilationIssues !== 'None' && (
          <div className="glass-card p-4 border border-danger/30 bg-danger/5">
            <p className="text-sm text-danger font-medium">⚠️ Compilation Issues</p>
            <p className="text-sm text-text-secondary mt-1">{ev.compilationIssues}</p>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default CodingTest;
