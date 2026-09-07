import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import {
  BookOpen,
  Star,
  Clock,
  Filter,
  Loader2,
  CheckCircle2,
  PlayCircle,
  Award,
  Search,
  X,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { toast } from '../../components/ui/toaster';

const PROVIDERS = ['ALL', 'INTERNAL', 'IGOT', 'MOCK'];
const DIFFICULTIES = ['ALL', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

export function CoursesPage() {
  const [activeTab, setActiveTab] = useState<'catalogue' | 'enrolled'>('catalogue');
  const [searchQuery, setSearchQuery] = useState('');
  const [provider, setProvider] = useState('ALL');
  const [difficulty, setDifficulty] = useState('ALL');
  const qc = useQueryClient();

  // All courses query
  const { data, isLoading } = useQuery({
    queryKey: ['courses', provider, difficulty],
    queryFn: () =>
      api.get('/courses', {
        params: {
          provider: provider === 'ALL' ? undefined : provider,
          difficulty: difficulty === 'ALL' ? undefined : difficulty,
        },
      }).then((r) => r.data),
  });

  // Enrolled courses query
  const { data: enrolledData, isLoading: enrolledLoading } = useQuery({
    queryKey: ['courses-enrolled'],
    queryFn: () => api.get('/courses/enrolled').then((r) => r.data),
  });

  const enrolledCourseIds = new Set(
    (enrolledData?.courses ?? []).map((c: any) => c.id)
  );

  const enrollMutation = useMutation({
    mutationFn: (id: string) => api.post(`/courses/${id}/enroll`),
    onSuccess: () => {
      toast({ title: 'Enrolled successfully!', variant: 'success' });
      qc.invalidateQueries({ queryKey: ['courses'] });
      qc.invalidateQueries({ queryKey: ['courses-enrolled'] });
    },
    onError: () => toast({ title: 'Enrollment failed', variant: 'destructive' }),
  });

  const enrolledList = enrolledData?.courses ?? [];

  // Filtered courses based on search query
  const filteredCatalogue = useMemo(() => {
    const list = data?.courses ?? [];
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (c: any) =>
        c.title?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        c.provider?.toLowerCase().includes(q) ||
        c.courseSkills?.some((cs: any) => cs.competency?.name?.toLowerCase().includes(q))
    );
  }, [data?.courses, searchQuery]);

  const filteredEnrolled = useMemo(() => {
    if (!searchQuery.trim()) return enrolledList;
    const q = searchQuery.toLowerCase();
    return enrolledList.filter(
      (c: any) =>
        c.title?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        c.provider?.toLowerCase().includes(q) ||
        c.courseSkills?.some((cs: any) => cs.competency?.name?.toLowerCase().includes(q))
    );
  }, [enrolledList, searchQuery]);

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Page Header */}
      <div className="border-b border-border bg-surface px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">Learning & Course Center</h1>
            <p className="text-sm text-text-secondary mt-1">Explore iGOT Karmayogi integrated modules and statistical competency coursework.</p>
          </div>

          {/* Search Input Bar */}
          <div className="w-full md:w-80 relative">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search courses, skills, topics…"
              className="input pl-10 pr-9 py-2 text-sm w-full"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary p-0.5"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Main Tab Switcher: Catalogue vs My Enrolled Courses */}
        <div className="flex border-b border-border mb-6 gap-8">
          <button
            onClick={() => setActiveTab('catalogue')}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'catalogue'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <BookOpen size={17} />
            <span>Course Catalogue</span>
            <span className="badge bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full font-bold">
              {filteredCatalogue.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('enrolled')}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 relative ${
              activeTab === 'enrolled'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <Award size={17} />
            <span>My Enrolled Courses</span>
            {enrolledList.length > 0 && (
              <span className="badge bg-accent-teal-light text-accent-teal text-xs px-2 py-0.5 rounded-full font-bold">
                {enrolledList.length}
              </span>
            )}
          </button>
        </div>

        {/* Enrolled Courses Tab */}
        {activeTab === 'enrolled' && (
          <div>
            {enrolledLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="skeleton h-44 rounded-card" />
                ))}
              </div>
            )}

            {!enrolledLoading && filteredEnrolled.length === 0 && (
              <div className="card p-12 text-center text-text-secondary max-w-xl mx-auto">
                <BookOpen size={40} className="mx-auto mb-3 opacity-40 text-primary" />
                <div className="font-bold text-lg text-text-primary mb-1">
                  {searchQuery ? 'No matching enrolled courses' : 'No Enrolled Courses Yet'}
                </div>
                <p className="text-xs text-text-secondary max-w-sm mx-auto mb-5 leading-relaxed">
                  {searchQuery
                    ? `No enrolled courses matched "${searchQuery}". Try a different term.`
                    : 'Explore the course catalogue to find courses matching your skill gaps and start learning.'}
                </p>
                {!searchQuery && (
                  <button
                    onClick={() => setActiveTab('catalogue')}
                    className="btn-primary btn-sm mx-auto"
                  >
                    Browse Catalogue
                  </button>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredEnrolled.map((c: any) => {
                const isCompleted = c.enrollmentStatus === 'COMPLETED';
                return (
                  <div key={c.id} className="card p-5 hover:shadow-card-hover transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex items-start gap-3.5 mb-3">
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            isCompleted ? 'bg-accent-teal/15 text-accent-teal' : 'bg-primary/10 text-primary'
                          }`}
                        >
                          {isCompleted ? <CheckCircle2 size={22} /> : <PlayCircle size={22} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                isCompleted
                                  ? 'bg-accent-teal/15 text-accent-teal'
                                  : 'bg-primary/15 text-primary'
                              }`}
                            >
                              {c.enrollmentStatus?.replace('_', ' ') ?? 'ENROLLED'}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded font-bold bg-background border border-border text-text-secondary">
                              {c.provider}
                            </span>
                          </div>
                          <div className="font-bold text-sm text-text-primary leading-snug line-clamp-2">{c.title}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-text-secondary mb-4">
                        {c.durationHrs && (
                          <span className="flex items-center gap-1">
                            <Clock size={12} /> {c.durationHrs} hrs
                          </span>
                        )}
                        {c.rating && (
                          <span className="flex items-center gap-1 text-warning font-semibold">
                            <Star size={12} /> {c.rating}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-border flex gap-2">
                      <Link to={`/courses/${c.id}`} className="btn-primary btn-sm flex-1 text-center font-bold">
                        Continue Learning
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Catalogue Tab */}
        {activeTab === 'catalogue' && (
          <div>
            {/* Filters bar */}
            <div className="card p-4 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider text-text-secondary mr-2">Provider:</span>
                {PROVIDERS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setProvider(p)}
                    className={`filter-chip text-xs px-3 py-1 ${provider === p ? 'active' : ''}`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider text-text-secondary mr-2">Level:</span>
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`filter-chip text-xs px-3 py-1 ${difficulty === d ? 'active' : ''}`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Courses Multi-Column Responsive Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {isLoading &&
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="skeleton h-48 rounded-card" />
                ))}

              {filteredCatalogue.map((c: any) => {
                const isEnrolled = enrolledCourseIds.has(c.id);
                return (
                  <div key={c.id} className="card p-5 hover:shadow-card-hover transition-all flex flex-col justify-between bg-surface group">
                    <div>
                      <div className="flex items-start gap-3.5 mb-3">
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            c.provider === 'IGOT' ? 'bg-primary/10 text-primary' : 'bg-info-light text-info'
                          }`}
                        >
                          <BookOpen size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                                c.provider === 'IGOT'
                                  ? 'bg-primary/10 text-primary'
                                  : 'bg-info-light text-info'
                              }`}
                            >
                              {c.provider}
                            </span>
                            <span className="text-xs text-text-secondary flex items-center gap-1 font-medium">
                              <Clock size={11} /> {c.durationHrs}h
                            </span>
                            {c.rating && (
                              <span className="text-xs text-warning font-semibold flex items-center gap-0.5">
                                <Star size={11} /> {c.rating}
                              </span>
                            )}
                          </div>
                          <div className="font-bold text-sm leading-snug text-text-primary group-hover:text-primary transition-colors line-clamp-2">
                            {c.title}
                          </div>
                        </div>
                      </div>

                      {c.description && (
                        <p className="text-xs text-text-secondary line-clamp-2 mb-4 leading-relaxed">
                          {c.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-border flex items-center gap-2">
                      <Link
                        to={`/courses/${c.id}`}
                        className="btn-secondary btn-sm flex-1 text-center font-medium"
                      >
                        Details
                      </Link>
                      {isEnrolled ? (
                        <Link
                          to={`/courses/${c.id}`}
                          className="btn-primary btn-sm flex-1 text-center bg-accent-teal hover:bg-teal-700 font-bold"
                        >
                          Continue
                        </Link>
                      ) : (
                        <button
                          onClick={() => enrollMutation.mutate(c.id)}
                          disabled={enrollMutation.isPending}
                          className="btn-primary btn-sm flex-1 font-bold"
                        >
                          {enrollMutation.isPending ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            'Enroll'
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {!isLoading && filteredCatalogue.length === 0 && (
              <div className="text-center py-20 text-text-secondary card">
                <BookOpen size={40} className="mx-auto mb-3 opacity-30 text-primary" />
                <div className="font-bold text-base text-text-primary">No courses match your filters</div>
                <p className="text-xs text-text-secondary mt-1">Try resetting the provider or difficulty filter.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

