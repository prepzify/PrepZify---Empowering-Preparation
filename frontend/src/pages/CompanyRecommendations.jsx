import { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';
import { FiBriefcase, FiCheck, FiTrendingUp } from 'react-icons/fi';

const CompanyRecommendations = () => {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      const res = await dashboardAPI.get();
      setRecommendations(res.data.dashboard.companyRecommendations);
    } catch (err) {
      console.error('Load recommendations error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="spinner" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Company Recommendations</h1>
        <p className="text-text-secondary mt-1">Companies matched to your skills and test performance</p>
      </div>

      {!recommendations || recommendations.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <FiBriefcase className="w-16 h-16 text-text-muted mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-text-primary mb-2">No Recommendations Yet</h2>
          <p className="text-text-secondary">Upload your resume and take some tests to get personalized company recommendations.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((comp, i) => (
            <div key={i} className="glass-card glass-card-hover p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-lg">
                    {comp.company?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary">{comp.company}</h3>
                    <div className="flex items-center gap-1 mt-0.5">
                      <FiTrendingUp className={`w-3 h-3 ${comp.matchScore >= 70 ? 'text-success' : 'text-warning'}`} />
                      <span className={`text-sm font-bold ${comp.matchScore >= 70 ? 'text-success' : 'text-warning'}`}>
                        {comp.matchScore}% match
                      </span>
                    </div>
                  </div>
                </div>
                {/* Match Score Bar */}
                <div className="w-16 h-2 rounded-full bg-surface-lighter overflow-hidden">
                  <div
                    className={`h-full rounded-full ${comp.matchScore >= 70 ? 'bg-success' : comp.matchScore >= 40 ? 'bg-warning' : 'bg-danger'}`}
                    style={{ width: `${comp.matchScore}%` }}
                  />
                </div>
              </div>

              <p className="text-sm text-text-secondary mb-4">{comp.reason}</p>

              {/* Roles */}
              {comp.rolesMatched?.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-text-muted mb-1.5">Matching Roles:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {comp.rolesMatched.map((role, ri) => (
                      <span key={ri} className="px-2 py-0.5 rounded-full bg-accent/10 text-accent text-xs">{role}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills */}
              {comp.skillsMatched?.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-text-muted mb-1.5">Skills Matched:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {comp.skillsMatched.map((skill, si) => (
                      <span key={si} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary-light text-xs flex items-center gap-1">
                        <FiCheck className="w-3 h-3" /> {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tips */}
              {comp.preparationTips?.length > 0 && (
                <div className="mt-3 p-3 rounded-lg bg-surface-lighter/30">
                  <p className="text-xs text-text-muted mb-1">Preparation Tip:</p>
                  <p className="text-xs text-text-secondary">{comp.preparationTips[0]}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CompanyRecommendations;
