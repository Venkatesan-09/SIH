import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { Link } from 'react-router-dom';
import { TrendingUp, BookOpen, ListChecks, ChevronRight, Loader2 } from 'lucide-react';

function MiniLineChart({ data }: { data: { date: string; score: number }[] }) {
  if (!data.length) return null;
  const max = Math.max(...data.map(d => d.score), 100);
  const pts = data.map((d, i) => ({ x: (i / (data.length - 1)) * 240, y: 60 - (d.score / max) * 55 }));
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  return (
    <svg viewBox="0 0 240 65" className="w-full" style={{ height: 65 }}>
      <defs>
        <linearGradient id="prog-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0E8F73" stopOpacity={0.3} />
          <stop offset="100%" stopColor="#0E8F73" stopOpacity={0.0} />
        </linearGradient>
      </defs>
      <path d={`${path} L ${pts[pts.length - 1]!.x} 65 L 0 65 Z`} fill="url(#prog-gradient)" />
      <path d={path} fill="none" stroke="#0E8F73" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={3} fill="#0E8F73" />)}
    </svg>
  );
}

export function ProgressPage() {
  const { data, isLoading } = useQuery({ queryKey: ['progress'], queryFn: () => api.get('/progress').then(r => r.data) });
  const { data: pathsData } = useQuery({ queryKey: ['learning-paths'], queryFn: () => api.get('/learning-paths').then(r => r.data) });

  if (isLoading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin text-primary" size={32} /></div>;

  const { growthSeries = [], totalHours = 0, assessmentScores = [], completedCourses = [] } = data ?? {};

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Page Header */}
      <div className="border-b border-border bg-surface px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">Growth & Learning Trajectory</h1>
            <p className="text-sm text-text-secondary mt-1">Audit trail of competency score improvements, learning milestones, and assessments.</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* KPI Highlight Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card p-5 text-center shadow-sm">
            <div className="text-3xl font-black text-primary">{Math.round(totalHours)}</div>
            <div className="text-xs font-semibold text-text-secondary mt-1 uppercase tracking-wider">Hours Learned</div>
          </div>
          <div className="card p-5 text-center shadow-sm">
            <div className="text-3xl font-black text-accent-teal">{completedCourses.length}</div>
            <div className="text-xs font-semibold text-text-secondary mt-1 uppercase tracking-wider">Completed Courses</div>
          </div>
          <div className="card p-5 text-center shadow-sm">
            <div className="text-3xl font-black text-info">{assessmentScores.length}</div>
            <div className="text-xs font-semibold text-text-secondary mt-1 uppercase tracking-wider">Validated Assessments</div>
          </div>
        </div>

        {/* 2-Column Desktop Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Growth Chart & Learning Paths (lg: col-span-7) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Growth chart */}
            <div className="card p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-bold text-base text-text-primary">Competency Progression Over Time</h2>
                  <p className="text-xs text-text-secondary">Historical trajectory of composite Skill Twin readiness</p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-accent-teal/10 text-accent-teal flex items-center justify-center">
                  <TrendingUp size={18} />
                </div>
              </div>
              <div className="py-2">
                <MiniLineChart data={growthSeries} />
              </div>
              <div className="flex justify-between text-xs text-text-secondary mt-3 pt-3 border-t border-border">
                {growthSeries.map((d: any) => <span key={d.date} className="font-medium">{d.date.slice(5)}</span>)}
              </div>
            </div>

            {/* Learning Paths */}
            {((pathsData?.paths ?? pathsData?.learningPaths ?? []).length > 0) && (
              <div className="card p-6 shadow-sm">
                <h2 className="font-bold text-base text-text-primary mb-4">Active Learning Paths</h2>
                <div className="space-y-3">
                  {(pathsData?.paths ?? pathsData?.learningPaths ?? []).map((p: any) => {
                    const done = p.items.filter((i: any) => i.status === 'COMPLETED').length;
                    const pct = p.items.length > 0 ? Math.round((done / p.items.length) * 100) : 0;
                    return (
                      <Link
                        key={p.id}
                        to={`/learning-paths/${p.id}`}
                        className="p-4 rounded-xl border border-border hover:border-primary/40 hover:shadow-card-hover transition-all block bg-background/50 group"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-bold text-sm text-text-primary group-hover:text-primary transition-colors">{p.title}</div>
                          <ChevronRight size={16} className="text-text-secondary group-hover:translate-x-0.5 transition-transform" />
                        </div>
                        <div className="progress-bar-track h-2 mb-1.5">
                          <div className="progress-bar-fill bg-primary" style={{ width: `${pct}%` }} />
                        </div>
                        <div className="flex justify-between text-xs text-text-secondary">
                          <span>{done}/{p.items.length} courses completed</span>
                          <span className="font-bold text-primary">{pct}%</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Assessment Scores History (lg: col-span-5) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="card p-6 shadow-sm">
              <h2 className="font-bold text-base text-text-primary mb-4">Assessment History & Scores</h2>
              {assessmentScores.length > 0 ? (
                <div className="divide-y divide-border">
                  {assessmentScores.map((a: any, i: number) => (
                    <div key={i} className="py-3.5 flex items-center justify-between">
                      <div className="min-w-0 flex-1 pr-3">
                        <div className="text-sm font-semibold text-text-primary truncate">{a.assessmentTitle}</div>
                        <div className="text-xs text-text-secondary mt-0.5">{new Date(a.date).toLocaleDateString()}</div>
                      </div>
                      <div className={`text-base font-extrabold ${a.scorePct >= 70 ? 'text-accent-teal' : a.scorePct >= 50 ? 'text-warning' : 'text-critical'}`}>
                        {Math.round(a.scorePct)}%
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-text-secondary text-sm">
                  No assessments completed yet. Take an assessment to record scores!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
