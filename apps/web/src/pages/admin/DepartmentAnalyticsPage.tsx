import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { Loader2 } from 'lucide-react';

export function DepartmentAnalyticsPage() {
  const { data, isLoading } = useQuery({ queryKey: ['admin-analytics'], queryFn: () => api.get('/admin/analytics').then(r => r.data) });

  const departments = data?.departments ?? [];
  const maxReadiness = Math.max(...departments.map((d: any) => d.readiness), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Department Analytics</h1>
        <p className="text-text-secondary text-sm mt-1">Comparative readiness across all departments</p>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-primary">{data?.overallReadiness ?? 0}%</div>
          <div className="text-xs text-text-secondary mt-0.5">Overall Readiness</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-text-primary">{data?.activeEmployees ?? 0}</div>
          <div className="text-xs text-text-secondary mt-0.5">Active Employees</div>
        </div>
        <div className="card p-4 text-center">
          <div className={`text-2xl font-bold ${(data?.criticalGaps ?? 0) > 0 ? 'text-critical' : 'text-accent-teal'}`}>{data?.criticalGaps ?? 0}</div>
          <div className="text-xs text-text-secondary mt-0.5">Critical Gaps</div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-primary" size={32} /></div>
      ) : (
        <div className="space-y-3">
          {departments.map((dept: any) => (
            <div key={dept.id} className="card p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-semibold">{dept.name}</div>
                  <div className="text-xs text-text-secondary mt-0.5">{dept.employeeCount} employees</div>
                </div>
                <div className="text-right">
                  <div className={`text-xl font-bold ${dept.readiness >= 70 ? 'text-accent-teal' : dept.readiness >= 50 ? 'text-warning' : 'text-critical'}`}>{dept.readiness}%</div>
                  <div className="text-xs text-text-secondary">Avg. readiness</div>
                </div>
              </div>
              <div className="progress-bar-track">
                <div className={`progress-bar-fill ${dept.readiness >= 70 ? 'bg-accent-teal' : dept.readiness >= 50 ? 'bg-warning' : 'bg-critical'}`} style={{ width: `${dept.readiness}%` }} />
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-text-secondary">
                <span>{dept.criticalGaps} critical gaps</span>
                <span>{dept.readiness >= 70 ? '✅ On track' : dept.readiness >= 50 ? '⚠️ Developing' : '🔴 Needs intervention'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
