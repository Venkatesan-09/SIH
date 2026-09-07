import { useQuery, useMutation } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { ListChecks, Clock, ChevronRight, Loader2 } from 'lucide-react';
import { toast } from '../../components/ui/toaster';

export function AssessmentCenterPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({ queryKey: ['assessments'], queryFn: () => api.get('/assessments').then(r => r.data) });

  const startMutation = useMutation({
    mutationFn: (id: string) => api.post(`/assessments/${id}/start`).then(r => r.data),
    onSuccess: (_, id) => navigate(`/assessments/${id}/attempt`),
    onError: () => toast({ title: 'Could not start assessment', variant: 'destructive' }),
  });

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Page Header */}
      <div className="border-b border-border bg-surface px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">Assessment Centre</h1>
            <p className="text-sm text-text-secondary mt-1">Validate your statistical proficiencies with standardized, timed tests to update your Skill Twin.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="badge bg-primary/10 text-primary text-xs px-2.5 py-1 rounded-full font-bold">
              {(data?.assessments ?? []).length} Available Tests
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {isLoading && Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-44 rounded-card" />
          ))}

          {(data?.assessments ?? []).map((a: any) => (
            <div key={a.id} className="card p-5 hover:shadow-card-hover transition-all flex flex-col justify-between group bg-surface">
              <div>
                <div className="flex items-start gap-3.5 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary group-hover:scale-105 transition-transform">
                    <ListChecks size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-text-primary leading-snug group-hover:text-primary transition-colors line-clamp-2">
                      {a.title}
                    </div>
                    {a.competency && (
                      <div className="text-xs text-text-secondary mt-0.5 truncate">
                        {a.competency.name} · {a.competency.cluster}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-3 text-xs text-text-secondary">
                  <span className="flex items-center gap-1 font-medium">
                    <Clock size={12} /> {a.durationMins} min
                  </span>
                  <span>·</span>
                  <span>{a.questionCount ?? '10'} questions</span>
                  <span>·</span>
                  <span className={`capitalize px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    a.difficulty === 'ADVANCED'
                      ? 'bg-critical-light text-critical'
                      : a.difficulty === 'INTERMEDIATE'
                      ? 'bg-warning-light text-warning'
                      : 'bg-accent-teal-light text-accent-teal'
                  }`}>
                    {a.difficulty?.toLowerCase()}
                  </span>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-border flex gap-2">
                <Link to={`/assessments/${a.id}/results`} className="btn-secondary btn-sm flex-1 text-center font-medium">
                  Past Results
                </Link>
                <button
                  onClick={() => startMutation.mutate(a.id)}
                  disabled={startMutation.isPending}
                  className="btn-primary btn-sm flex-1 font-bold"
                >
                  {startMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : 'Start Test'}
                  {!startMutation.isPending && <ChevronRight size={14} />}
                </button>
              </div>
            </div>
          ))}
        </div>

        {!isLoading && (data?.assessments?.length ?? 0) === 0 && (
          <div className="text-center py-20 text-text-secondary card max-w-lg mx-auto">
            <ListChecks size={40} className="mx-auto mb-3 opacity-30 text-primary" />
            <div className="font-bold text-base text-text-primary">No assessments available right now</div>
            <div className="text-xs text-text-secondary mt-1">Check back later or explore courses to learn.</div>
          </div>
        )}
      </div>
    </div>
  );
}
