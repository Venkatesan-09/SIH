import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { Users, AlertTriangle, TrendingUp, BookOpen, Loader2 } from 'lucide-react';

function StatCard({ label, value, delta, icon: Icon, color = 'primary' }: { label: string; value: number | string; delta?: number; icon: any; color?: string }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${color}/10`}>
          <Icon size={18} className={`text-${color}`} />
        </div>
        {delta !== undefined && (
          <span className={`text-xs font-semibold ${delta >= 0 ? 'text-accent-teal' : 'text-critical'}`}>
            {delta >= 0 ? '+' : ''}{delta}%
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-text-primary">{value}</div>
      <div className="text-xs text-text-secondary mt-0.5">{label}</div>
    </div>
  );
}

export function AdminDashboardPage() {
  const { data, isLoading } = useQuery({ queryKey: ['admin-dashboard'], queryFn: () => api.get('/admin/dashboard').then(r => r.data) });

  if (isLoading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin text-primary" size={32} /></div>;

  const { totalEmployees = 0, avgReadiness = 0, criticalGaps = 0, insights = [], trend = [] } = data ?? {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Workforce Dashboard</h1>
        <p className="text-text-secondary text-sm mt-1">Real-time competency intelligence across all departments</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Employees" value={totalEmployees} icon={Users} />
        <StatCard label="Avg. Readiness" value={`${avgReadiness}%`} icon={TrendingUp} color="accent-teal" />
        <StatCard label="Critical Gaps" value={criticalGaps} icon={AlertTriangle} color="critical" />
        <StatCard label="Active Courses" value={data?.activeCourses ?? '—'} icon={BookOpen} color="info" />
      </div>

      {/* Trend chart */}
      {trend.length > 0 && (
        <div className="card p-5">
          <div className="font-semibold text-sm mb-4">Readiness Trend</div>
          <div className="flex items-end gap-2 h-24">
            {trend.map((t: any, idx: number) => (
              <div key={`${t.date}-${idx}`} className="flex-1 flex flex-col items-center gap-1">
                <div className="text-xs text-primary font-semibold">{t.avgScore}%</div>
                <div className="w-full rounded-t bg-primary/20 hover:bg-primary/40 transition-colors" style={{ height: `${(t.avgScore / 100) * 80}px` }} />
                <div className="text-[10px] text-text-secondary whitespace-nowrap">{t.date}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Insights */}
      {insights.length > 0 && (
        <div>
          <h2 className="font-bold text-base mb-3">AI Insights</h2>
          <div className="space-y-3">
            {insights.map((ins: any) => (
              <div key={ins.id} className={`card p-4 border-l-4 ${ins.kind === 'critical_finding' ? 'border-critical' : ins.kind === 'positive_trend' ? 'border-accent-teal' : 'border-primary'}`}>
                <div className="font-semibold text-sm">{ins.title}</div>
                <p className="text-text-secondary text-xs mt-1">{ins.description}</p>
                <div className="flex gap-2 mt-2">
                  {ins.competency && <span className="text-xs bg-border px-2 py-0.5 rounded">{ins.competency}</span>}
                  {ins.department && <span className="text-xs bg-border px-2 py-0.5 rounded">{ins.department}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
