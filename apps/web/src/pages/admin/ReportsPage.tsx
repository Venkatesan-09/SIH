import { useState } from 'react';
import { FileText, Download, Loader2, Calendar } from 'lucide-react';
import { api } from '../../services/api';
import { toast } from '../../components/ui/toaster';

const REPORT_TYPES = [
  { id: 'competency_gap', label: 'Competency Gap Report', desc: 'Full breakdown of skill gaps by department and role' },
  { id: 'workforce_readiness', label: 'Workforce Readiness Summary', desc: 'Overall readiness score trends across all departments' },
  { id: 'course_completion', label: 'Course Completion Report', desc: 'Enrollment and completion statistics for all courses' },
  { id: 'assessment_performance', label: 'Assessment Performance', desc: 'Average scores per assessment, by department' },
];

export function ReportsPage() {
  const [generating, setGenerating] = useState<string | null>(null);
  const [period, setPeriod] = useState('Q3-2024');

  const generate = async (type: string) => {
    setGenerating(type);
    try {
      const res = await api.get('/admin/reports/export', { params: { type, period }, responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url; a.download = `${type}_${period}.csv`; a.click();
      URL.revokeObjectURL(url);
      toast({ title: 'Report downloaded!', variant: 'success' });
    } catch {
      toast({ title: 'Report generation failed', variant: 'destructive' });
    } finally {
      setGenerating(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reports & Export</h1>
        <p className="text-text-secondary text-sm mt-1">Generate and download workforce intelligence reports</p>
      </div>

      {/* Period selector */}
      <div className="card p-4 flex items-center gap-3">
        <Calendar size={18} className="text-primary" />
        <div className="flex-1">
          <div className="text-sm font-medium">Reporting Period</div>
          <div className="text-xs text-text-secondary">Data will be filtered by the selected period</div>
        </div>
        <select className="input w-36" value={period} onChange={e => setPeriod(e.target.value)}>
          <option>Q1-2024</option><option>Q2-2024</option><option>Q3-2024</option><option>Q4-2024</option>
        </select>
      </div>

      {/* Report types */}
      <div className="space-y-3">
        {REPORT_TYPES.map(r => (
          <div key={r.id} className="card p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-info-light flex items-center justify-center flex-shrink-0">
              <FileText size={18} className="text-info" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-sm">{r.label}</div>
              <div className="text-xs text-text-secondary mt-0.5">{r.desc}</div>
            </div>
            <button onClick={() => generate(r.id)} disabled={generating === r.id} className="btn-secondary btn-sm flex-shrink-0">
              {generating === r.id ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              {generating === r.id ? 'Generating…' : 'Export CSV'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
