import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import {
  Briefcase,
  Target,
  Users,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Loader2,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import { toast } from '../../components/ui/toaster';

export function ManagementActionsPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [targetDepartment, setTargetDepartment] = useState('Field Operations Division (FOD)');
  const [competencyName, setCompetencyName] = useState('GIS & Spatial Analysis');
  const [assignedCourseTitle, setAssignedCourseTitle] = useState('GIS in Official Statistics & Field Surveys');
  const [targetDate, setTargetDate] = useState('2026-12-31');

  // Query interventions
  const { data, isLoading } = useQuery({
    queryKey: ['admin-interventions'],
    queryFn: () => api.get('/admin/interventions').then((r) => r.data),
  });

  // Query departments and courses for dropdowns
  const { data: deptData } = useQuery({
    queryKey: ['departments'],
    queryFn: () => api.get('/departments').then((r) => r.data),
  });

  const { data: courseData } = useQuery({
    queryKey: ['courses'],
    queryFn: () => api.get('/courses').then((r) => r.data),
  });

  const deployMutation = useMutation({
    mutationFn: (payload: any) => api.post('/admin/interventions', payload).then((r) => r.data),
    onSuccess: () => {
      toast({ title: 'Targeted Training Program Deployed!', variant: 'success' });
      qc.invalidateQueries({ queryKey: ['admin-interventions'] });
      setShowModal(false);
      setTitle('');
    },
    onError: () => toast({ title: 'Deployment failed', variant: 'destructive' }),
  });

  const handleDeploy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast({ title: 'Please enter an intervention program title', variant: 'destructive' });
      return;
    }
    deployMutation.mutate({
      title,
      targetDepartment,
      competencyName,
      assignedCourseTitle,
      targetCompletionDate: targetDate,
    });
  };

  const interventions = data?.interventions || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold mb-1.5">
            Admin Step 9 · Management Actions
          </div>
          <h1 className="text-2xl font-bold text-text-primary">Targeted Interventions & Programs</h1>
          <p className="text-text-secondary text-sm mt-0.5">
            Plan training programs, assign targeted courses to departments, and track workforce capacity improvement.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center justify-center gap-2 self-start sm:self-auto font-bold"
        >
          <Plus size={16} /> Deploy New Training Program
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="flex items-center justify-between text-text-secondary mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Interventions</span>
            <Target size={18} className="text-primary" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-text-primary">{interventions.length}</div>
          <div className="text-xs text-text-secondary mt-1">Directly closing department skill gaps</div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between text-text-secondary mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Enrolled Officers</span>
            <Users size={18} className="text-accent-teal" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-accent-teal">
            {interventions.reduce((sum: number, it: any) => sum + (it.enrolledOfficersCount || 0), 0)}
          </div>
          <div className="text-xs text-text-secondary mt-1">Officers undergoing targeted training</div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between text-text-secondary mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Program Completion</span>
            <TrendingUp size={18} className="text-warning" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-text-primary">
            {interventions.length > 0
              ? Math.round(interventions.reduce((sum: number, it: any) => sum + (it.progressPct || 0), 0) / interventions.length)
              : 0}
            %
          </div>
          <div className="text-xs text-text-secondary mt-1">Overall intervention trajectory</div>
        </div>
      </div>

      {/* Interventions List */}
      <div className="card overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h2 className="font-bold text-base text-text-primary">Workforce Training Programs</h2>
          <span className="text-xs text-text-secondary">Tracked in real-time</span>
        </div>

        {isLoading ? (
          <div className="p-12 flex items-center justify-center">
            <Loader2 className="animate-spin text-primary" size={28} />
          </div>
        ) : interventions.length === 0 ? (
          <div className="text-center py-16 text-text-secondary">
            <Briefcase size={36} className="mx-auto mb-2 opacity-30" />
            <div className="font-semibold text-sm">No management interventions deployed yet</div>
            <p className="text-xs mt-1">Deploy an intervention to assign courses and improve department competency.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {interventions.map((it: any) => (
              <div key={it.id} className="p-5 hover:bg-surface-elevated/40 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base text-text-primary">{it.title}</span>
                      <span className="badge bg-accent-teal-light text-accent-teal text-[10px] font-bold px-2 py-0.5">
                        {it.status}
                      </span>
                    </div>
                    <div className="text-xs text-text-secondary flex flex-wrap items-center gap-x-4 gap-y-1">
                      <span>
                        Target: <strong>{it.targetDepartment}</strong>
                      </span>
                      <span>·</span>
                      <span>
                        Competency: <strong>{it.competencyName}</strong>
                      </span>
                      <span>·</span>
                      <span>
                        Course: <strong>{it.assignedCourseTitle}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 lg:min-w-[260px] justify-between">
                    <div className="text-left">
                      <div className="text-xs font-semibold text-text-secondary">Participating Officers</div>
                      <div className="text-sm font-bold text-text-primary flex items-center gap-1.5 mt-0.5">
                        <Users size={14} className="text-primary" /> {it.enrolledOfficersCount} Officers
                      </div>
                    </div>

                    <div className="flex-1 max-w-[120px]">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-text-secondary">Progress</span>
                        <span className="font-bold text-text-primary">{it.progressPct}%</span>
                      </div>
                      <div className="w-full bg-border h-2 rounded-full overflow-hidden">
                        <div className="bg-accent-teal h-full rounded-full" style={{ width: `${it.progressPct}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Deploy Intervention Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="card max-w-lg w-full p-6 space-y-4 shadow-xl bg-surface">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-base text-text-primary flex items-center gap-2">
                <Target size={18} className="text-primary" /> Deploy Targeted Training Program
              </h3>
              <button onClick={() => setShowModal(false)} className="text-text-secondary hover:text-text-primary text-sm font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleDeploy} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-text-secondary uppercase tracking-wider block mb-1">
                  Program Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Q4 National Accounts Modernization Mandate"
                  className="input w-full text-sm"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-text-secondary uppercase tracking-wider block mb-1">
                  Target Department
                </label>
                <select
                  className="input w-full text-sm"
                  value={targetDepartment}
                  onChange={(e) => setTargetDepartment(e.target.value)}
                >
                  {(deptData?.departments || []).map((d: any) => (
                    <option key={d.id} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                  <option value="Field Operations Division (FOD)">Field Operations Division (FOD)</option>
                  <option value="National Accounts Division">National Accounts Division</option>
                  <option value="Data Science & AI">Data Science & AI</option>
                  <option value="Economic Statistics Cadre">Economic Statistics Cadre</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-text-secondary uppercase tracking-wider block mb-1">
                  Target Competency Focus
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sampling Theory, Survey Design, Machine Learning"
                  className="input w-full text-sm"
                  value={competencyName}
                  onChange={(e) => setCompetencyName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-text-secondary uppercase tracking-wider block mb-1">
                  Assigned Course / Learning Path
                </label>
                <select
                  className="input w-full text-sm"
                  value={assignedCourseTitle}
                  onChange={(e) => setAssignedCourseTitle(e.target.value)}
                >
                  {(courseData?.courses || []).map((c: any) => (
                    <option key={c.id} value={c.title}>
                      {c.title} ({c.provider})
                    </option>
                  ))}
                  <option value="GIS in Official Statistics & Field Surveys">
                    GIS in Official Statistics & Field Surveys (IGOT)
                  </option>
                  <option value="Modern System of National Accounts (SNA 2008)">
                    Modern System of National Accounts (SNA 2008)
                  </option>
                  <option value="Machine Learning for Official Statistics">
                    Machine Learning for Official Statistics
                  </option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-text-secondary uppercase tracking-wider block mb-1">
                  Target Completion Date
                </label>
                <input
                  type="date"
                  className="input w-full text-sm"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                />
              </div>

              <div className="pt-3 border-t border-border flex justify-end gap-2.5">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={deployMutation.isPending} className="btn-primary font-bold">
                  {deployMutation.isPending ? 'Deploying…' : 'Deploy Program'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
