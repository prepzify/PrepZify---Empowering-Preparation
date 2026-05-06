import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { FiFileText, FiEdit3, FiBookOpen, FiUsers, FiBriefcase, FiTrendingUp, FiTarget, FiAlertTriangle } from 'react-icons/fi';

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await dashboardAPI.get();
      setData(res.data.dashboard);
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 skeleton w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-32 skeleton" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-72 skeleton" />
          <div className="h-72 skeleton" />
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Resume Score',
      value: data?.resume?.score ?? '—',
      suffix: data?.resume ? '/100' : '',
      icon: FiFileText,
      color: 'from-violet-500 to-purple-600',
      link: '/resume',
    },
    {
      label: 'Tests Taken',
      value: data?.tests?.totalTests ?? 0,
      icon: FiEdit3,
      color: 'from-cyan-500 to-blue-600',
      link: '/test',
    },
    {
      label: 'Avg Test Score',
      value: data?.tests?.averageScore ?? 0,
      suffix: '%',
      icon: FiTrendingUp,
      color: 'from-emerald-500 to-green-600',
      link: '/test',
    },
    {
      label: 'Skills',
      value: data?.resume?.skillsCount ?? 0,
      icon: FiTarget,
      color: 'from-amber-500 to-orange-600',
      link: '/resume',
    },
  ];

  // Prepare chart data
  const scoreTrendData = data?.tests?.scoreTrend?.map((t, i) => ({
    name: `Test ${i + 1}`,
    score: t.score,
  })) || [];

  const weakAreasData = data?.weakAreas?.slice(0, 6).map(w => ({
    name: w.area.length > 12 ? w.area.substring(0, 12) + '…' : w.area,
    count: w.frequency,
  })) || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Welcome back, {user?.name?.split(' ')[0] || 'there'}! 👋</h1>
        <p className="text-text-secondary mt-1">Here&apos;s your placement preparation overview</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Link key={card.label} to={card.link} className="glass-card glass-card-hover p-5 no-underline block">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-text-muted text-xs font-medium uppercase tracking-wider">{card.label}</p>
                <p className="text-3xl font-bold text-text-primary mt-2">
                  {card.value}<span className="text-lg text-text-secondary">{card.suffix}</span>
                </p>
              </div>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Trend Chart */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            <FiTrendingUp className="text-primary" /> Score Trend
          </h2>
          {scoreTrendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={scoreTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }}
                />
                <Line type="monotone" dataKey="score" stroke="#7c3aed" strokeWidth={3} dot={{ fill: '#7c3aed', r: 5 }} activeDot={{ r: 7, fill: '#a78bfa' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-52 flex items-center justify-center text-text-muted">
              <p>Take some tests to see your score trend</p>
            </div>
          )}
        </div>

        {/* Weak Areas Chart */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            <FiAlertTriangle className="text-warning" /> Weak Areas
          </h2>
          {weakAreasData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weakAreasData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }}
                />
                <Bar dataKey="count" fill="#ef4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-52 flex items-center justify-center text-text-muted">
              <p>Complete tests to identify weak areas</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions & Recent Tests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { to: '/resume', label: 'Upload Resume', icon: FiFileText, color: 'text-violet-400' },
              { to: '/test', label: 'Take a Test', icon: FiEdit3, color: 'text-cyan-400' },
              { to: '/study-plan', label: 'Study Plan', icon: FiBookOpen, color: 'text-emerald-400' },
              { to: '/interview', label: 'Mock Interview', icon: FiUsers, color: 'text-amber-400' },
              { to: '/companies', label: 'Companies', icon: FiBriefcase, color: 'text-rose-400' },
              { to: '/chat', label: 'AI Assistant', icon: FiBookOpen, color: 'text-blue-400' },
            ].map(action => (
              <Link key={action.to} to={action.to} className="flex items-center gap-3 p-3 rounded-xl bg-surface-lighter/30 hover:bg-surface-lighter/60 transition-colors no-underline">
                <action.icon className={`w-5 h-5 ${action.color}`} />
                <span className="text-sm text-text-secondary">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Tests */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Recent Tests</h2>
          {data?.tests?.recentTests?.length > 0 ? (
            <div className="space-y-3">
              {data.tests.recentTests.map((test) => (
                <div key={test.id} className="flex items-center justify-between p-3 rounded-xl bg-surface-lighter/30">
                  <div>
                    <p className="text-sm font-medium text-text-primary capitalize">{test.type} {test.companyName && `· ${test.companyName}`}</p>
                    <p className="text-xs text-text-muted">{new Date(test.completedAt).toLocaleDateString()}</p>
                  </div>
                  <div className={`text-lg font-bold ${test.score >= 70 ? 'text-success' : test.score >= 40 ? 'text-warning' : 'text-danger'}`}>
                    {test.score}%
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-muted text-sm">No tests completed yet</p>
          )}
        </div>
      </div>

      {/* Company Recommendations */}
      {data?.companyRecommendations && data.companyRecommendations.length > 0 && (
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            <FiBriefcase className="text-primary" /> Recommended Companies
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.companyRecommendations.slice(0, 6).map((comp, i) => (
              <div key={i} className="p-4 rounded-xl bg-surface-lighter/30 border border-border/50">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-text-primary text-sm">{comp.company}</h3>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${comp.matchScore >= 70 ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'}`}>
                    {comp.matchScore}%
                  </span>
                </div>
                <p className="text-xs text-text-muted line-clamp-2">{comp.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
