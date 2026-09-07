import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useState } from 'react';
import { Search, Filter, Users, ChevronRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export function EmployeeManagementPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-employees', search, page],
    queryFn: () => api.get('/admin/employees', { params: { search, page, pageSize: 15 } }).then(r => r.data),
  });

  const employees = data?.employees ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Employee Management</h1>
          <p className="text-text-secondary text-sm mt-1">View competency readiness across your workforce</p>
        </div>
        <div className="text-sm text-text-secondary bg-surface border border-border px-3 py-1.5 rounded-lg">
          {data?.total ?? 0} employees
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
        <input type="text" placeholder="Search by name or email…" className="input pl-9" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-background border-b border-border">
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary">Employee</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary">Department</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary">Role</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-text-secondary">Readiness</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-text-secondary">Critical Gaps</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading && Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}><td colSpan={5} className="px-4 py-3"><div className="skeleton h-4 rounded w-full" /></td></tr>
              ))}
              {employees.map((emp: any) => (
                <tr key={emp.id} className="hover:bg-background/60 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary text-xs font-bold">{emp.firstName?.[0]}{emp.lastName?.[0]}</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium">{emp.firstName} {emp.lastName}</div>
                        <div className="text-xs text-text-secondary">{emp.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-text-secondary">{emp.department?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-sm text-text-secondary">{emp.jobRole?.title ?? '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-16 h-1.5 bg-border rounded-full">
                        <div className="h-full bg-accent-teal rounded-full" style={{ width: `${emp.avgReadiness}%` }} />
                      </div>
                      <span className={`text-sm font-bold ${emp.avgReadiness >= 70 ? 'text-accent-teal' : emp.avgReadiness >= 40 ? 'text-warning' : 'text-critical'}`}>{emp.avgReadiness}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-sm font-bold ${emp.criticalGaps > 0 ? 'text-critical' : 'text-accent-teal'}`}>{emp.criticalGaps}</span>
                  </td>
                </tr>
              ))}
              {!isLoading && employees.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-text-secondary text-sm">No employees found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 px-4 py-3 border-t border-border">
            <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="btn-secondary btn-sm">Prev</button>
            <span className="text-sm text-text-secondary">Page {page} of {totalPages}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages} className="btn-secondary btn-sm">Next</button>
          </div>
        )}
      </div>
    </div>
  );
}
