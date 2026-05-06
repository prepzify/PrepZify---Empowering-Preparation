import { useState, useEffect } from 'react';
import { studyPlanAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FiBookOpen, FiCalendar, FiClock, FiTarget, FiRefreshCw, FiChevronDown, FiChevronUp } from 'react-icons/fi';

const StudyPlan = () => {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [expandedWeek, setExpandedWeek] = useState(0);

  useEffect(() => {
    loadPlan();
  }, []);

  const loadPlan = async () => {
    try {
      const res = await studyPlanAPI.get();
      setPlan(res.data.studyPlan);
    } catch {
      // No plan yet
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await studyPlanAPI.generate();
      setPlan(res.data.studyPlan);
      toast.success('Study plan generated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate plan');
    } finally {
      setGenerating(false);
    }
  };

  const priorityColor = (p) => {
    switch (p) {
      case 'high': return 'text-danger bg-danger/15 border-danger/20';
      case 'medium': return 'text-warning bg-warning/15 border-warning/20';
      default: return 'text-success bg-success/15 border-success/20';
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="spinner" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Study Plan</h1>
          <p className="text-text-secondary mt-1">AI-generated personalized roadmap based on your profile</p>
        </div>
        <button onClick={handleGenerate} disabled={generating} className="btn btn-primary">
          {generating ? <div className="spinner w-5 h-5 border-2" /> : <><FiRefreshCw /> {plan ? 'Regenerate' : 'Generate'}</>}
        </button>
      </div>

      {generating && (
        <div className="glass-card p-8 text-center">
          <div className="spinner mx-auto mb-4" />
          <p className="text-text-secondary">AI is creating your personalized study plan...</p>
        </div>
      )}

      {!plan && !generating && (
        <div className="glass-card p-12 text-center">
          <FiBookOpen className="w-16 h-16 text-text-muted mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-text-primary mb-2">No Study Plan Yet</h2>
          <p className="text-text-secondary mb-6">Upload your resume and take some tests first, then generate a personalized plan.</p>
          <button onClick={handleGenerate} disabled={generating} className="btn btn-primary">Generate Study Plan</button>
        </div>
      )}

      {plan && !generating && (
        <div className="space-y-6">
          {/* Overview */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-2">Overview</h2>
            <p className="text-text-secondary text-sm">{plan.plan.overview}</p>
            {plan.plan.focusAreas && (
              <div className="flex flex-wrap gap-2 mt-4">
                {plan.plan.focusAreas.map((area, i) => (
                  <span key={i} className="px-3 py-1 rounded-full bg-primary/15 text-primary-light text-xs font-medium border border-primary/20">
                    <FiTarget className="inline w-3 h-3 mr-1" />{area}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Weekly Plans */}
          {plan.plan.weeks?.map((week, wi) => (
            <div key={wi} className="glass-card overflow-hidden">
              <button onClick={() => setExpandedWeek(expandedWeek === wi ? -1 : wi)}
                className="w-full p-5 flex items-center justify-between text-left hover:bg-surface-lighter/20 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm">
                    W{week.week}
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary">{week.title}</h3>
                    <p className="text-xs text-text-muted">{week.goal}</p>
                  </div>
                </div>
                {expandedWeek === wi ? <FiChevronUp className="text-text-muted" /> : <FiChevronDown className="text-text-muted" />}
              </button>

              {expandedWeek === wi && (
                <div className="p-5 pt-0 space-y-4 animate-fade-in">
                  {/* Topics */}
                  {week.topics?.map((topic, ti) => (
                    <div key={ti} className="p-4 rounded-xl bg-surface-lighter/30 border border-border/30">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-text-primary text-sm">{topic.name}</h4>
                        <div className="flex items-center gap-2">
                          {topic.priority && (
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${priorityColor(topic.priority)}`}>
                              {topic.priority}
                            </span>
                          )}
                          {topic.estimatedHours && (
                            <span className="text-xs text-text-muted flex items-center gap-1">
                              <FiClock className="w-3 h-3" /> {topic.estimatedHours}h
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-text-secondary">{topic.description}</p>
                      {topic.resources && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {topic.resources.map((r, ri) => (
                            <span key={ri} className="text-xs text-accent bg-accent/10 px-2 py-0.5 rounded">📚 {r}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Daily Plan */}
                  {week.dailyPlan && (
                    <div>
                      <h4 className="font-medium text-text-primary text-sm mb-2 flex items-center gap-2">
                        <FiCalendar className="text-primary" /> Daily Plan
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {Object.entries(week.dailyPlan).map(([day, task]) => (
                          <div key={day} className="flex items-center gap-2 p-2 rounded-lg bg-surface-lighter/20 text-xs">
                            <span className="font-medium text-text-primary capitalize w-20">{day}</span>
                            <span className="text-text-secondary">{task}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Tips */}
          {plan.plan.tips && (
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold text-text-primary mb-3">💡 Pro Tips</h2>
              <ul className="space-y-2">
                {plan.plan.tips.map((tip, i) => (
                  <li key={i} className="text-sm text-text-secondary flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span> {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-xs text-text-muted text-center">Generated: {new Date(plan.generatedAt).toLocaleString()}</p>
        </div>
      )}
    </div>
  );
};

export default StudyPlan;
