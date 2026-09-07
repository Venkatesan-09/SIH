import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { ArrowLeft, BookOpen, CheckCircle, Circle, ChevronRight, Loader2 } from 'lucide-react';

const STATUS_ICON = {
  COMPLETED: <CheckCircle size={18} className="text-accent-teal" />,
  IN_PROGRESS: <div className="w-4.5 h-4.5 rounded-full border-2 border-primary border-t-transparent animate-spin" />,
  NOT_STARTED: <Circle size={18} className="text-border" />,
};

export function LearningPathDetailPage() {
  const { id } = useParams();
  const { data, isLoading } = useQuery({ queryKey: ['learning-path', id], queryFn: () => api.get(`/learning-paths/${id}`).then(r => r.data) });

  if (isLoading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin text-primary" size={32} /></div>;
  const path = data?.path ?? data?.learningPath;
  if (!path) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <BookOpen className="text-text-secondary/40 mb-3" size={48} />
        <h2 className="text-lg font-bold text-text-primary mb-1">Learning Path Not Found</h2>
        <p className="text-sm text-text-secondary mb-4">We could not load the requested learning roadmap.</p>
        <Link to="/progress" className="btn-primary text-xs px-4 py-2">Back to Learning Paths</Link>
      </div>
    );
  }

  const completed = path.items.filter((i: any) => i.status === 'COMPLETED').length;
  const pct = path.items.length > 0 ? Math.round((completed / path.items.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* ─── Hero Header Banner (Consistent with Platform Theme) ─── */}
      <div className="gradient-primary px-4 sm:px-6 lg:px-8 pt-8 lg:pt-10 pb-16 lg:pb-20 text-white">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb / Back Link */}
          <Link
            to="/progress"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white text-xs sm:text-sm font-medium mb-4 transition-colors group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Learning Paths & Trajectory</span>
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Title & Metadata */}
            <div className="max-w-3xl space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-semibold border border-white/20">
                  AI-Architected Trajectory
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                  MoSPI Standard
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
                {path.title}
              </h1>
              <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
                Targeted skill remediation path designed to systematically elevate your operational competency from baseline to official production standards.
              </p>
            </div>

            {/* Quick KPI Progress Block */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 w-full lg:w-80 flex-shrink-0 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-white">
                <span className="uppercase tracking-wider text-white/75">Path Completion</span>
                <span className="text-sm font-extrabold text-white">{pct}%</span>
              </div>
              <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-white/70 pt-1 border-t border-white/10">
                <span>Completed: {completed} / {path.items.length} Courses</span>
                <span>{path.items.length - completed} Remaining</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Main Content Body (max-w-7xl aligned, -mt-8 overlay) ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 space-y-6">
        {/* Rationale / Why This Path */}
        {path.rationale && (
          <div className="card p-5 sm:p-6 shadow-sm border-l-4 border-primary bg-surface flex flex-col sm:flex-row items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 font-bold">
              AI
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xs font-bold uppercase tracking-wider text-primary mb-1">
                Strategic Remediation Objective
              </h2>
              <p className="text-sm text-text-secondary leading-relaxed">
                {path.rationale}
              </p>
            </div>
          </div>
        )}

        {/* Course Sequence Card */}
        <div className="card p-6 sm:p-8 shadow-sm bg-surface border border-border space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-5 border-b border-border">
            <div>
              <h2 className="text-lg font-bold text-text-primary">Step-by-Step Curriculum Sequence</h2>
              <p className="text-xs text-text-secondary mt-0.5">
                Complete each milestone sequentially to systematically advance your cadre rating and competency benchmark.
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                {path.items.length} Sequential Milestones
              </span>
            </div>
          </div>

          {/* Sequence List */}
          <div className="space-y-4">
            {path.items.map((item: any, i: number) => {
              const diff = (item.course.difficulty || item.course.level || 'INTERMEDIATE').toUpperCase();
              const levelBadge = diff === 'BEGINNER'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                : diff === 'INTERMEDIATE'
                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                : 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';

              const isComplete = item.status === 'COMPLETED';

              return (
                <div
                  key={item.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isComplete
                      ? 'border-emerald-500/30 bg-emerald-500/5'
                      : 'border-border hover:border-primary/40 bg-surface hover:shadow-card-hover'
                  } flex flex-col md:flex-row md:items-center justify-between gap-5`}
                >
                  {/* Left: Icon & Course Details */}
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    <div className="flex-shrink-0 mt-1">
                      {STATUS_ICON[item.status as keyof typeof STATUS_ICON] ?? STATUS_ICON.NOT_STARTED}
                    </div>

                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-black uppercase tracking-wider text-text-secondary">
                          Milestone {i + 1}
                        </span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${levelBadge}`}>
                          {diff}
                        </span>
                        {item.course.durationHrs && (
                          <span className="text-xs font-medium text-text-secondary">
                            · {item.course.durationHrs}h duration
                          </span>
                        )}
                        {item.course.provider && (
                          <span className="text-xs font-medium text-text-secondary">
                            · {item.course.provider}
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-text-primary leading-tight">
                        {item.course.title}
                      </h3>

                      {item.course.description && (
                        <p className="text-xs sm:text-sm text-text-secondary line-clamp-2 leading-relaxed">
                          {item.course.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Action Button */}
                  <div className="flex items-center gap-3 flex-shrink-0 self-end md:self-center">
                    <Link
                      to={`/courses/${item.course.id}`}
                      className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5 shadow-sm"
                    >
                      <BookOpen size={14} />
                      <span>Study Course</span>
                      <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
