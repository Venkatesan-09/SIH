import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { Link2, RefreshCw, CheckCircle, AlertTriangle, Loader2, BookOpen } from 'lucide-react';
import { toast } from '../../components/ui/toaster';

export function IGOTIntegrationPage() {
  const [syncing, setSyncing] = useState(false);

  const { data: status, refetch: refetchStatus } = useQuery({
    queryKey: ['igot-status'],
    queryFn: () => api.get('/igot/status').then(r => r.data),
  });

  const { data: igotCourses, isLoading: coursesLoading } = useQuery({
    queryKey: ['igot-courses'],
    queryFn: () => api.get('/igot/courses').then(r => r.data),
  });

  const syncMutation = useMutation({
    mutationFn: () => api.post('/igot/sync'),
    onSuccess: (res) => { toast({ title: `Sync complete — ${res.data.imported} courses imported`, variant: 'success' }); refetchStatus(); },
    onError: () => toast({ title: 'Sync failed', variant: 'destructive' }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Link2 size={18} className="text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">iGOT Karmayogi Integration</h1>
          <p className="text-text-secondary text-sm mt-1">Sync courses from India's national government learning platform</p>
        </div>
      </div>

      {/* Demo notice */}
      <div className="demo-badge inline-flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg">
        <AlertTriangle size={14} /> DEMO / MOCK INTEGRATION — No live iGOT API connection
      </div>

      {/* Status card */}
      <div className="card p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold text-sm">Integration Status</div>
            <div className="flex items-center gap-2 mt-2">
              <div className={`w-2 h-2 rounded-full ${status?.connected ? 'bg-accent-teal' : 'bg-warning'} animate-pulse`} />
              <span className="text-sm">{status?.connected ? 'Connected (Mock)' : 'Mock Mode'}</span>
            </div>
          </div>
          <button onClick={() => syncMutation.mutate()} disabled={syncMutation.isPending} className="btn-primary">
            {syncMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            {syncMutation.isPending ? 'Syncing…' : 'Sync Now'}
          </button>
        </div>
        {status && (
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border text-center">
            <div><div className="text-lg font-bold text-primary">{status.totalCourses}</div><div className="text-xs text-text-secondary">iGOT Courses</div></div>
            <div><div className="text-lg font-bold text-accent-teal">{status.imported}</div><div className="text-xs text-text-secondary">Imported</div></div>
            <div><div className="text-xs text-text-secondary mt-1">Last sync</div><div className="text-xs font-medium">{status.lastSync ? new Date(status.lastSync).toLocaleDateString() : 'Never'}</div></div>
          </div>
        )}
      </div>

      {/* Available courses */}
      <div>
        <div className="font-bold text-base mb-3">Available iGOT Courses</div>
        {coursesLoading ? (
          <div className="flex items-center justify-center py-8"><Loader2 className="animate-spin text-primary" size={24} /></div>
        ) : (
          <div className="space-y-3">
            {(igotCourses?.courses ?? []).map((c: any) => (
              <div key={c.id} className="card p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <BookOpen size={16} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{c.title}</div>
                  <div className="text-xs text-text-secondary mt-0.5">{c.durationHrs}h · {c.difficulty?.toLowerCase()}</div>
                </div>
                <CheckCircle size={16} className="text-accent-teal flex-shrink-0" aria-label="Imported" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
