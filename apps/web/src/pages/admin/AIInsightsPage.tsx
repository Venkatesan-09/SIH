import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { Lightbulb, TrendingUp, AlertTriangle, Sparkles, Loader2 } from 'lucide-react';

const KIND_STYLES: Record<string, { bg: string; border: string; icon: any; iconColor: string }> = {
  critical_finding: { bg: 'bg-critical-light', border: 'border-critical', icon: AlertTriangle, iconColor: 'text-critical' },
  positive_trend: { bg: 'bg-success-light', border: 'border-accent-teal', icon: TrendingUp, iconColor: 'text-accent-teal' },
  recommendation: { bg: 'bg-info-light', border: 'border-info', icon: Lightbulb, iconColor: 'text-info' },
};

export function AIInsightsPage() {
  const { data, isLoading } = useQuery({ queryKey: ['admin-ai-insights'], queryFn: () => api.get('/admin/ai-insights').then(r => r.data) });

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-ai-bg flex items-center justify-center flex-shrink-0">
          <Sparkles size={18} className="text-ai-text" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">AI Insights</h1>
          <p className="text-text-secondary text-sm mt-1">Automated intelligence generated from workforce competency data</p>
        </div>
      </div>

      <div className="card p-4 border-l-4 border-primary text-sm text-text-secondary">
        <strong>Implementation Note:</strong> Insights are generated using deterministic analysis of real competency data (§10 — AI only reads, never writes scores). Marked as <span className="demo-badge text-xs">DEMO</span> where data is illustrative.
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-primary" size={32} /></div>
      ) : (
        <div className="space-y-4">
          {(data?.insights ?? []).map((ins: any) => {
            const style = KIND_STYLES[ins.kind as keyof typeof KIND_STYLES] ?? KIND_STYLES['recommendation']!;
            const Icon = style.icon;
            return (
              <div key={ins.id} className={`card p-5 border-l-4 ${style.border} ${style.bg}`}>
                <div className="flex items-start gap-3">
                  <Icon size={18} className={`${style.iconColor} flex-shrink-0 mt-0.5`} />
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{ins.title}</div>
                    <p className="text-text-secondary text-sm mt-1 leading-relaxed">{ins.description}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {ins.competency && <span className="text-xs bg-white/60 px-2 py-0.5 rounded-full border">{ins.competency}</span>}
                      {ins.department && <span className="text-xs bg-white/60 px-2 py-0.5 rounded-full border">{ins.department}</span>}
                      <span className="text-xs text-text-secondary">{new Date(ins.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {(data?.insights?.length ?? 0) === 0 && (
            <div className="text-center py-16 text-text-secondary">
              <Sparkles size={32} className="mx-auto mb-3 opacity-30" />
              <div className="font-medium">No insights generated yet</div>
              <div className="text-sm mt-1">Insights appear once employees complete assessments</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
