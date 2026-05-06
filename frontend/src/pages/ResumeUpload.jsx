import { useState, useEffect, useRef } from 'react';
import { resumeAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FiUploadCloud, FiFile, FiCheck, FiStar, FiAlertCircle, FiAward } from 'react-icons/fi';

const ResumeUpload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    loadExistingAnalysis();
  }, []);

  const loadExistingAnalysis = async () => {
    try {
      const res = await resumeAPI.getAnalysis();
      setAnalysis(res.data.resume);
    } catch {
      // No existing analysis
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.type === 'application/pdf') {
      setFile(dropped);
    } else {
      toast.error('Please upload a PDF file');
    }
  };

  const handleUpload = async () => {
    if (!file) return toast.error('Please select a file');
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('resume', file);
      const res = await resumeAPI.upload(formData);
      setAnalysis(res.data.resume);
      setFile(null);
      toast.success('Resume analyzed successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-primary-light';
    if (score >= 40) return 'text-warning';
    return 'text-danger';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Resume Analyzer</h1>
        <p className="text-text-secondary mt-1">Upload your resume to get AI-powered analysis and feedback</p>
      </div>

      {/* Upload Zone */}
      <div className="glass-card p-8">
        <div
          className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer
            ${dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(e) => setFile(e.target.files[0])}
          />
          <FiUploadCloud className="w-12 h-12 text-primary mx-auto mb-4" />
          <p className="text-text-primary font-medium">
            {file ? file.name : 'Drag & drop your PDF resume here'}
          </p>
          <p className="text-text-muted text-sm mt-2">
            {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'or click to browse • PDF only • Max 5MB'}
          </p>
        </div>

        {file && (
          <div className="mt-4 flex items-center gap-4">
            <div className="flex items-center gap-2 flex-1 p-3 rounded-xl bg-surface-lighter/30">
              <FiFile className="text-primary" />
              <span className="text-sm text-text-primary truncate">{file.name}</span>
            </div>
            <button onClick={handleUpload} disabled={uploading} className="btn btn-primary">
              {uploading ? <div className="spinner w-5 h-5 border-2" /> : <>Analyze <FiCheck /></>}
            </button>
          </div>
        )}

        {uploading && (
          <div className="mt-6 text-center">
            <div className="spinner mx-auto mb-3" />
            <p className="text-text-secondary text-sm">Analyzing your resume with AI... This may take a moment.</p>
          </div>
        )}
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-6 animate-slide-up">
          {/* Score Section */}
          <div className="glass-card p-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Score Circle */}
              <div className="relative w-36 h-36 shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="#334155" strokeWidth="8" />
                  <circle
                    cx="60" cy="60" r="52" fill="none"
                    stroke={analysis.score >= 80 ? '#10b981' : analysis.score >= 60 ? '#7c3aed' : analysis.score >= 40 ? '#f59e0b' : '#ef4444'}
                    strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={`${(analysis.score / 100) * 327} 327`}
                    className="score-ring"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-3xl font-bold ${getScoreColor(analysis.score)}`}>{analysis.score}</span>
                  <span className="text-xs text-text-muted">out of 100</span>
                </div>
              </div>

              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-xl font-bold text-text-primary flex items-center gap-2 justify-center sm:justify-start">
                  <FiAward className="text-primary" /> Resume Score
                </h2>
                <p className="text-text-secondary mt-2 text-sm">{analysis.feedback?.summary || 'Analysis complete'}</p>
                <p className="text-text-muted text-xs mt-2">File: {analysis.fileName} • Analyzed: {new Date(analysis.analyzedAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4">Extracted Skills</h2>
            <div className="flex flex-wrap gap-2">
              {analysis.extractedSkills?.map((skill, i) => (
                <span key={i} className="px-3 py-1.5 rounded-full bg-primary/15 text-primary-light text-sm font-medium border border-primary/20">
                  {skill}
                </span>
              ))}
              {(!analysis.extractedSkills || analysis.extractedSkills.length === 0) && (
                <p className="text-text-muted text-sm">No skills extracted</p>
              )}
            </div>
          </div>

          {/* Feedback */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold text-success mb-4 flex items-center gap-2">
                <FiStar /> Strengths
              </h2>
              <ul className="space-y-2">
                {analysis.feedback?.strengths?.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                    <FiCheck className="text-success mt-0.5 shrink-0" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold text-warning mb-4 flex items-center gap-2">
                <FiAlertCircle /> Areas to Improve
              </h2>
              <ul className="space-y-2">
                {analysis.feedback?.improvements?.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                    <FiAlertCircle className="text-warning mt-0.5 shrink-0" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Education & Experience */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold text-text-primary mb-4">Education</h2>
              <ul className="space-y-2">
                {analysis.education?.map((e, i) => (
                  <li key={i} className="text-sm text-text-secondary p-2 rounded-lg bg-surface-lighter/30">{e}</li>
                ))}
                {(!analysis.education || analysis.education.length === 0) && <p className="text-text-muted text-sm">No education data found</p>}
              </ul>
            </div>

            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold text-text-primary mb-4">Experience</h2>
              <ul className="space-y-2">
                {analysis.experience?.map((e, i) => (
                  <li key={i} className="text-sm text-text-secondary p-2 rounded-lg bg-surface-lighter/30">{e}</li>
                ))}
                {(!analysis.experience || analysis.experience.length === 0) && <p className="text-text-muted text-sm">No experience data found</p>}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeUpload;
