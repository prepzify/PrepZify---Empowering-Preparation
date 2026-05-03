import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { testAPI } from '../services/api';
import { FiCheck, FiX, FiArrowLeft, FiAward } from 'react-icons/fi';

const TestResult = () => {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    loadResult();
  }, [id]);

  const loadResult = async () => {
    try {
      const res = await testAPI.getResult(id);
      setResult(res.data.test);
    } catch (err) {
      console.error('Load result error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="spinner" /></div>;
  if (!result) return <div className="text-center py-20 text-text-muted">Result not found</div>;

  const scoreColor = result.score >= 80 ? '#10b981' : result.score >= 60 ? '#7c3aed' : result.score >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <Link to="/test" className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary text-sm no-underline">
        <FiArrowLeft /> Back to Tests
      </Link>

      {/* Score Card */}
      <div className="glass-card p-8 text-center">
        <div className="relative w-40 h-40 mx-auto mb-6">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="#334155" strokeWidth="8" />
            <circle cx="60" cy="60" r="52" fill="none" stroke={scoreColor} strokeWidth="8" strokeLinecap="round"
              strokeDasharray={`${(result.score / 100) * 327} 327`} className="score-ring" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold" style={{ color: scoreColor }}>{result.score}%</span>
          </div>
        </div>

        <h1 className="text-xl font-bold text-text-primary flex items-center justify-center gap-2">
          <FiAward style={{ color: scoreColor }} /> Test Result
        </h1>
        <p className="text-text-secondary mt-2 capitalize">{result.type} {result.companyName && `• ${result.companyName}`} • {result.difficulty}</p>

        <div className="flex justify-center gap-8 mt-6">
          <div>
            <p className="text-2xl font-bold text-success">{result.correctCount}</p>
            <p className="text-xs text-text-muted">Correct</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-danger">{result.totalQuestions - result.correctCount}</p>
            <p className="text-xs text-text-muted">Wrong</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary">{result.totalQuestions}</p>
            <p className="text-xs text-text-muted">Total</p>
          </div>
        </div>
      </div>

      {/* Weak Areas */}
      {result.weakAreas?.length > 0 && (
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-3">Weak Areas to Improve</h2>
          <div className="flex flex-wrap gap-2">
            {result.weakAreas.map((area, i) => (
              <span key={i} className="px-3 py-1.5 rounded-full bg-danger/15 text-danger text-sm border border-danger/20">{area}</span>
            ))}
          </div>
        </div>
      )}

      {/* Review Toggle */}
      <button onClick={() => setShowReview(!showReview)} className="btn btn-secondary w-full">
        {showReview ? 'Hide' : 'Show'} Question Review
      </button>

      {/* Question Review */}
      {showReview && (
        <div className="space-y-4">
          {result.questions.map((q, i) => (
            <div key={i} className={`glass-card p-5 border-l-4 ${q.isCorrect ? 'border-l-success' : 'border-l-danger'}`}>
              <div className="flex items-start gap-3 mb-3">
                <span className={`mt-0.5 ${q.isCorrect ? 'text-success' : 'text-danger'}`}>
                  {q.isCorrect ? <FiCheck className="w-5 h-5" /> : <FiX className="w-5 h-5" />}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-text-primary">Q{i + 1}. {q.question}</p>
                  {q.topic && <span className="text-xs text-text-muted mt-1 inline-block">{q.topic}</span>}
                </div>
              </div>

              <div className="ml-8 space-y-1.5">
                {q.options.map((opt, oi) => {
                  const isCorrect = opt === q.correctAnswer;
                  const isUserAnswer = opt === q.userAnswer;
                  return (
                    <div key={oi} className={`text-sm p-2 rounded-lg ${isCorrect ? 'bg-success/10 text-success' : isUserAnswer && !isCorrect ? 'bg-danger/10 text-danger' : 'text-text-muted'}`}>
                      {String.fromCharCode(65 + oi)}. {opt}
                      {isCorrect && ' ✓'}
                      {isUserAnswer && !isCorrect && ' ✗ (your answer)'}
                    </div>
                  );
                })}
              </div>

              {q.explanation && (
                <p className="ml-8 mt-3 text-xs text-text-secondary bg-surface-lighter/30 p-3 rounded-lg">
                  <strong>Explanation:</strong> {q.explanation}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Link to="/test" className="btn btn-primary flex-1 no-underline">Take Another Test</Link>
        <Link to="/study-plan" className="btn btn-secondary flex-1 no-underline">Get Study Plan</Link>
      </div>
    </div>
  );
};

export default TestResult;
