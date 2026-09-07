import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { AlertTriangle, ChevronRight, Filter } from 'lucide-react';
import { useState } from 'react';

const BANDS = ['ALL', 'CRITICAL', 'HIGH', 'MODERATE', 'LOW'];

export function SkillGapsPage() {
  const [filter, setFilter] = useState('ALL');
  const { data, isLoading } = useQuery({ queryKey: ['skill-gaps'], queryFn: () => api.get('/skill-gaps').then(r => r.data) });
  const gaps = (data?.gaps ?? []).filter((g: any) => filter === 'ALL' || g.priorityBand === filter);

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Page Header */}
      <div className="border-b border-border bg-surface px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">Competency Skill Gaps</h1>
            <p className="text-sm text-text-secondary mt-1">Priority-ranked competency gaps requiring focused training or upskilling.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="badge bg-primary/10 text-primary text-xs px-2.5 py-1 rounded-full font-bold">
              {gaps.length} Total Gaps
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Filter chips bar */}
        <div className="card p-3 mb-6 flex items-center gap-2 overflow-x-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-text-secondary mr-2 flex-shrink-0">Priority Filter:</span>
          {BANDS.map(b => (
            <button
              key={b}
              onClick={() => setFilter(b)}
              className={`filter-chip text-xs flex-shrink-0 px-3 py-1 font-semibold ${filter === b ? 'active' : ''}`}
            >
              {b}
            </button>
          ))}
        </div>

        {/* Responsive Grid of Skill Gap Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {isLoading && Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-36 rounded-card" />
          ))}

          {gaps.map((gap: any) => (
            <Link
              key={gap.id}
              to={`/skills/${gap.id}`}
              className="card p-5 hover:shadow-card-hover hover:border-primary/40 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-text-primary group-hover:text-primary transition-colors leading-snug truncate">
                      {gap.competency.name}
                    </div>
                    <div className="text-xs text-text-secondary mt-0.5">{gap.competency.cluster}</div>
                  </div>
                  <span className={`badge badge-${gap.priorityBand.toLowerCase()} flex-shrink-0`}>{gap.priorityBand}</span>
                </div>

                <div className="space-y-2 mt-4">
                  <div className="flex justify-between text-xs text-text-secondary">
                    <span>Current: <strong className="text-text-primary">{Math.round(gap.currentScore)}%</strong></span>
                    <span>Required: <strong className="text-text-primary">{gap.requiredScore}%</strong></span>
                    <span className="text-critical font-bold">-{Math.round(gap.gapPct)}%</span>
                  </div>
                  <div className="progress-bar-track relative h-2">
                    <div className="progress-bar-fill bg-accent-teal" style={{ width: `${gap.currentScore}%` }} />
                    <div className="h-full w-0.5 bg-critical absolute top-0" style={{ left: `${gap.requiredScore}%` }} title={`Required: ${gap.requiredScore}%`} />
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs">
                <span className="text-text-secondary">Priority Score: {gap.priorityScore}/100</span>
                <span className="text-primary font-semibold group-hover:underline flex items-center gap-0.5">
                  Action Plan <ChevronRight size={13} />
                </span>
              </div>
            </Link>
          ))}
        </div>

        {!isLoading && gaps.length === 0 && (
          <div className="text-center py-20 text-text-secondary card max-w-lg mx-auto">
            <AlertTriangle size={36} className="mx-auto mb-3 opacity-30 text-accent-teal" />
            <div className="font-bold text-base text-text-primary">No gaps found for this filter</div>
            <div className="text-xs text-text-secondary mt-1">Your competencies are on track!</div>
          </div>
        )}
      </div>
    </div>
  );
}
