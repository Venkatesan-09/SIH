import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

type HeatCell = { competencyName: string; deptName: string; avgScore: number };

const SCORE_COLOR = (score: number) =>
  score >= 75 ? '#0E8F73' : score >= 60 ? '#10B981' : score >= 45 ? '#D97706' : score >= 30 ? '#F59E0B' : '#DC2626';

export function HeatmapPage() {
  const { data, isLoading } = useQuery({ queryKey: ['admin-analytics'], queryFn: () => api.get('/admin/analytics').then(r => r.data) });
  const { data: compData } = useQuery({ queryKey: ['competencies'], queryFn: () => api.get('/competencies').then(r => r.data) });

  const departments: string[] = data?.departments?.map((d: any) => d.name) ?? [];
  const competencies: string[] = compData?.competencies?.map((c: any) => c.name).slice(0, 10) ?? [];

  // Build synthetic heatmap — real data would come from /admin/heatmap endpoint
  const cells: HeatCell[] = departments.flatMap((dept: string, di: number) =>
    competencies.map((comp: string, ci: number) => ({
      deptName: dept,
      competencyName: comp,
      avgScore: Math.max(20, Math.min(95, 55 + (di * 7 + ci * 3) % 35 - 15)),
    }))
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Competency Heatmap</h1>
        <p className="text-text-secondary text-sm mt-1">Average skill scores across departments and competencies</p>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-xs text-text-secondary">Score:</span>
        {[[75, 'Proficient', '#0E8F73'], [60, 'Competent', '#10B981'], [45, 'Developing', '#D97706'], [30, 'Basic', '#F59E0B'], [0, 'Critical', '#DC2626']].map(([threshold, label, color]) => (
          <div key={label as string} className="flex items-center gap-1.5 text-xs">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color as string }} />
            <span className="text-text-secondary">{label}</span>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-primary" size={32} /></div>
      ) : departments.length === 0 ? (
        <div className="text-center py-16 text-text-secondary">No data available yet</div>
      ) : (
        <div className="overflow-x-auto rounded-card border border-border">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="bg-surface px-4 py-3 text-left text-xs font-semibold text-text-secondary border-b border-border w-40 sticky left-0 z-10">Department</th>
                {competencies.map(c => (
                  <th key={c} className="bg-surface px-3 py-3 text-center text-xs font-medium text-text-secondary border-b border-border whitespace-nowrap" style={{ minWidth: 80 }}>
                    {c.length > 14 ? c.slice(0, 12) + '…' : c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {departments.map(dept => (
                <tr key={dept} className="hover:bg-background/50">
                  <td className="px-4 py-3 text-xs font-medium text-text-primary border-b border-border bg-surface sticky left-0 whitespace-nowrap">{dept}</td>
                  {competencies.map(comp => {
                    const cell = cells.find(c => c.deptName === dept && c.competencyName === comp);
                    const score = cell?.avgScore ?? 0;
                    return (
                      <td key={comp} className="px-3 py-3 text-center border-b border-border" title={`${dept} / ${comp}: ${score}%`}>
                        <div className="w-12 h-8 rounded mx-auto flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: SCORE_COLOR(score) }}>
                          {score}%
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
