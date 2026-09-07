import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Star,
  ExternalLink,
  Loader2,
  CheckCircle2,
  PlayCircle,
  Award,
  Video,
  FileText,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from '../../components/ui/toaster';

export function CourseDetailPage() {
  const { id } = useParams();
  const qc = useQueryClient();
  const [activeModule, setActiveModule] = useState<number>(0);
  const [learningStarted, setLearningStarted] = useState<boolean>(false);

  const { data, isLoading } = useQuery({
    queryKey: ['course', id],
    queryFn: () => api.get(`/courses/${id}`).then((r) => r.data),
  });

  const enrollMutation = useMutation({
    mutationFn: () => api.post(`/courses/${id}/enroll`),
    onSuccess: () => {
      toast({ title: 'Enrolled successfully!', variant: 'success' });
      qc.invalidateQueries({ queryKey: ['course', id] });
      qc.invalidateQueries({ queryKey: ['courses-enrolled'] });
    },
    onError: () => toast({ title: 'Enrollment failed', variant: 'destructive' }),
  });

  // Track explicitly completed module IDs
  const [completedModuleIds, setCompletedModuleIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`course_completed_${id}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );

  const saveCompletedModule = (moduleId: string, totalModules: number) => {
    setCompletedModuleIds((prev) => {
      if (prev.includes(moduleId)) return prev;
      const next = [...prev, moduleId];
      try {
        localStorage.setItem(`course_completed_${id}`, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const c = data?.course;
  const isEnrolled = !!data?.isEnrolled || !!data?.enrollment;
  const enrollment = data?.enrollment;
  const progress = data?.progress;

  if (!c) return null;

  // Extract curriculum modules from backend data
  const curriculum = c.curriculum;
  const rawModules: Array<{
    id: string;
    title: string;
    duration: string;
    type: string;
    videoUrl?: string;
    desc: string;
    learningObjectives?: string[];
    notes?: string;
  }> = curriculum?.modules && curriculum.modules.length > 0
    ? curriculum.modules
    : [
        {
          id: 'm-1',
          title: `Module 1: Foundations of ${c.title}`,
          duration: '30 mins',
          type: 'Video Lecture',
          videoUrl: 'https://www.youtube-nocookie.com/embed/oHcrna8FBlM',
          desc: `Core concepts, official protocols, and theoretical fundamentals for ${c.title}.`,
          learningObjectives: ['Understand domain definitions and standards', 'Apply foundational frameworks to real cases'],
          notes: 'Standard MoSPI operational benchmarks apply.',
        },
      ];

  // A module is marked complete ONLY if:
  // 1) The course enrollment itself is COMPLETED, OR
  // 2) The user explicitly clicked "Mark Complete" (stored in completedModuleIds)
  const isCourseFinished = enrollment?.status === 'COMPLETED' || (rawModules.length > 0 && completedModuleIds.length >= rawModules.length);

  const modules = rawModules.map((m: any, idx: number) => {
    const isExplicitlyCompleted = completedModuleIds.includes(m.id || `mod-${idx}`);
    // Also consider backend progress pct if no localStorage set yet
    const isCompletedFromDb = !completedModuleIds.length && progress?.pct && progress.pct >= Math.round(((idx + 1) / rawModules.length) * 100);
    return {
      ...m,
      completed: isCourseFinished || isExplicitlyCompleted || isCompletedFromDb,
    };
  });

  const currentLesson = modules[activeModule] || modules[0] || {
    id: 'm-fallback',
    title: `Module 1: Foundations of ${c.title}`,
    duration: '30 mins',
    type: 'Video Lecture',
    videoUrl: 'https://www.youtube-nocookie.com/embed/oHcrna8FBlM',
    completed: false,
    desc: `Core concepts and official protocols for ${c.title}.`,
    learningObjectives: ['Understand domain definitions and standards'],
    notes: 'Standard MoSPI operational benchmarks apply.',
  };

  const completedCount = modules.filter((m) => m.completed).length;
  const progressPct = isCourseFinished
    ? 100
    : isEnrolled
      ? Math.round((completedCount / Math.max(1, modules.length)) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Header */}
      <div className="gradient-primary px-4 sm:px-6 lg:px-8 pt-8 lg:pt-10 pb-16 lg:pb-20">
        <div className="max-w-7xl mx-auto">
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 text-white/70 text-sm mb-4 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} /> All Courses
          </Link>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span
                  className={`inline-flex text-xs px-2.5 py-1 rounded-full font-bold ${
                    c.provider === 'IGOT' ? 'bg-white/20 text-white' : 'bg-white/10 text-white/90'
                  }`}
                >
                  {c.provider}
                </span>
                {isEnrolled && (
                  <span className="badge bg-emerald-400/20 text-emerald-300 text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1">
                    <CheckCircle2 size={13} /> {enrollment?.status === 'COMPLETED' ? 'Completed' : 'Enrolled'}
                  </span>
                )}
                {curriculum?.institution && (
                  <span className="inline-flex text-xs px-2.5 py-1 rounded-full font-medium bg-white/10 text-white/90">
                    {curriculum.institution}
                  </span>
                )}
              </div>
              <h1 className="text-white text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug">{c.title}</h1>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-white/80 text-sm">
                {c.durationHrs && (
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {c.durationHrs} hours
                  </span>
                )}
                {c.rating && (
                  <span className="flex items-center gap-1 text-amber-300 font-bold">
                    <Star size={14} />
                    {c.rating} / 5
                  </span>
                )}
                <span className="capitalize font-medium">{c.difficulty?.toLowerCase()}</span>
                {curriculum?.instructor && (
                  <span className="text-white/70">Instructor: <strong className="text-white">{curriculum.instructor}</strong></span>
                )}
              </div>
            </div>

            <div className="self-start md:self-auto">
              {isEnrolled ? (
                <button
                  onClick={() => setLearningStarted(!learningStarted)}
                  className="btn bg-white text-primary hover:bg-white/90 font-bold text-sm shadow-sm flex items-center gap-2"
                >
                  <PlayCircle size={18} />
                  {learningStarted ? 'Hide Video Player' : 'Resume Learning'}
                </button>
              ) : (
                <button
                  onClick={() => enrollMutation.mutate()}
                  disabled={enrollMutation.isPending}
                  className="btn bg-white text-primary hover:bg-white/90 font-bold text-sm shadow-sm flex items-center gap-2"
                >
                  {enrollMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <BookOpen size={16} />}
                  Enroll in Course
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid: 2 Columns on desktop (lg:grid-cols-12) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 lg:-mt-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Learning Player & Curriculum (lg: col-span-8) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Status Card if Enrolled */}
            {isEnrolled && (
              <div className="card p-5 border-l-4 border-l-accent-teal shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-accent-teal uppercase tracking-wide">
                      {enrollment?.status === 'COMPLETED' ? 'Course Completed' : 'Course In Progress'}
                    </div>
                    <div className="text-base font-bold text-text-primary mt-0.5">
                      {enrollment?.status === 'COMPLETED'
                        ? 'You have completed this course! Take the Re-Assessment to update your verified SkillTwin score.'
                        : 'You are actively enrolled in this course'}
                    </div>
                    {enrollment?.enrolledAt && (
                      <div className="text-xs text-text-secondary mt-1">
                        Enrolled on {new Date(enrollment.enrolledAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <Award size={36} className="text-accent-teal opacity-80" />
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-xs text-text-secondary mb-1">
                    <span>Curriculum Progress</span>
                    <span className="font-bold text-text-primary">{progressPct}% Completed</span>
                  </div>
                  <div className="progress-bar-track h-2">
                    <div className="progress-bar-fill bg-accent-teal" style={{ width: `${progressPct}%` }} />
                  </div>
                </div>
              </div>
            )}

            {/* Learning Player / Active Module view */}
            {learningStarted && (
              <div className="card p-5 sm:p-6 border-2 border-primary animate-fade-in shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-primary font-bold text-sm">
                    <PlayCircle size={18} />
                    <span>Now Playing: {currentLesson.title}</span>
                  </div>
                  <span className="badge bg-primary/10 text-primary text-xs font-semibold">
                    {currentLesson.duration} · {currentLesson.type}
                  </span>
                </div>

                {/* Real Interactive Video Player */}
                <div className="w-full aspect-video rounded-xl bg-slate-950 overflow-hidden shadow-md mb-4 border border-border">
                  {currentLesson.videoUrl ? (
                    <iframe
                      src={currentLesson.videoUrl}
                      title={currentLesson.title}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-white p-6 text-center">
                      <Video size={48} className="text-primary mb-3 opacity-80" />
                      <div className="font-bold text-base">{currentLesson.title}</div>
                      <div className="text-xs text-white/60 mt-1 max-w-md">
                        Interactive learning walkthrough and demonstration stream. Follow along with the lesson notes below.
                      </div>
                    </div>
                  )}
                </div>

                {/* Lesson Description & Learning Objectives */}
                <div className="space-y-3 mb-5">
                  <div className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                    {currentLesson.desc}
                  </div>

                  {currentLesson.learningObjectives && currentLesson.learningObjectives.length > 0 && (
                    <div className="bg-primary/5 rounded-lg p-3.5 border border-primary/15">
                      <div className="text-xs font-bold text-primary mb-2 flex items-center gap-1.5">
                        <CheckCircle2 size={14} /> Lesson Learning Objectives:
                      </div>
                      <ul className="space-y-1">
                        {currentLesson.learningObjectives.map((obj: string, i: number) => (
                          <li key={i} className="text-xs text-text-primary flex items-start gap-2">
                            <span className="text-primary font-bold">•</span>
                            <span>{obj}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {currentLesson.notes && (
                    <div className="bg-amber-500/10 rounded-lg p-3 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200">
                      <strong>Methodology Note / Formula:</strong> {currentLesson.notes}
                    </div>
                  )}
                </div>

                {/* Player Controls */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    disabled={activeModule === 0}
                    onClick={() => setActiveModule((m) => Math.max(0, m - 1))}
                    className="btn-secondary btn-sm flex-1 disabled:opacity-40"
                  >
                    Previous Lesson
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      // Save current active module as completed
                      const currentModId = currentLesson.id || `mod-${activeModule}`;
                      saveCompletedModule(currentModId, modules.length);

                      if (activeModule < modules.length - 1) {
                        const nextModule = activeModule + 1;
                        setActiveModule(nextModule);
                        const pct = Math.round(((completedModuleIds.includes(currentModId) ? completedModuleIds.length : completedModuleIds.length + 1) / modules.length) * 100);
                        try {
                          await api.post(`/courses/${id}/progress`, { pct, completed: false, hoursLogged: 1 });
                          qc.invalidateQueries({ queryKey: ['course', id] });
                          qc.invalidateQueries({ queryKey: ['progress'] });
                        } catch (e) {}
                        toast({ title: `Lesson ${activeModule + 1} completed! Progress saved.`, variant: 'success' });
                      } else {
                        // Mark all modules as complete
                        modules.forEach((m, idx) => saveCompletedModule(m.id || `mod-${idx}`, modules.length));
                        try {
                          await api.post(`/courses/${id}/progress`, { pct: 100, completed: true, hoursLogged: 2 });
                          qc.invalidateQueries({ queryKey: ['course', id] });
                          qc.invalidateQueries({ queryKey: ['courses-enrolled'] });
                          qc.invalidateQueries({ queryKey: ['progress'] });
                          qc.invalidateQueries({ queryKey: ['skill-gaps'] });
                          qc.invalidateQueries({ queryKey: ['competencies-me'] });
                        } catch (e) {}
                        toast({
                          title: 'Course Completed! 🎉',
                          description: 'Curriculum completed. Take the Re-Assessment to update your verified SkillTwin score!',
                          variant: 'success',
                        });
                      }
                    }}
                    className="btn-primary btn-sm flex-1 font-bold"
                  >
                    {activeModule < modules.length - 1 ? 'Mark Complete & Next Lesson' : 'Finish Course & Re-Assess'}
                  </button>
                </div>
              </div>
            )}

            {/* Course Curriculum List */}
            <div className="card p-5 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="font-bold text-base text-text-primary">Course Curriculum & Modules</div>
                  <div className="text-xs text-text-secondary mt-0.5">
                    {modules.length} modules · Structured learning path
                  </div>
                </div>
                {isEnrolled && !learningStarted && (
                  <button
                    onClick={() => setLearningStarted(true)}
                    className="btn-primary btn-sm text-xs font-semibold flex items-center gap-1.5"
                  >
                    <PlayCircle size={14} /> Start Watching
                  </button>
                )}
              </div>

              <div className="divide-y divide-border">
                {modules.map((m, idx) => (
                  <div
                    key={m.id || idx}
                    onClick={() => {
                      if (isEnrolled) {
                        setActiveModule(idx);
                        setLearningStarted(true);
                      }
                    }}
                    className={`py-4 flex items-start gap-3.5 transition-colors ${
                      isEnrolled ? 'cursor-pointer hover:bg-primary/5 rounded-lg px-2 -mx-2' : ''
                    } ${activeModule === idx && learningStarted ? 'bg-primary/10 rounded-lg px-2 -mx-2' : ''}`}
                  >
                    <div className="mt-0.5">
                      {m.completed ? (
                        <CheckCircle2 size={20} className="text-accent-teal" />
                      ) : (
                        <PlayCircle
                          size={20}
                          className={activeModule === idx && learningStarted ? 'text-primary' : 'text-text-secondary'}
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-text-primary leading-tight">
                        {m.title}
                      </div>
                      <div className="text-xs text-text-secondary mt-1 flex items-center gap-2">
                        <span className="flex items-center gap-1">
                          <Clock size={11} /> {m.duration}
                        </span>
                        <span>·</span>
                        <span className="capitalize">{m.type}</span>
                      </div>
                      <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">{m.desc}</p>
                      {m.learningObjectives && m.learningObjectives.length > 0 && (
                        <div className="mt-2 text-xs text-primary/90 flex flex-wrap gap-x-3 gap-y-1">
                          {m.learningObjectives.slice(0, 2).map((obj: string, oi: number) => (
                            <span key={oi} className="inline-flex items-center gap-1">
                              ✓ {obj}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    {isEnrolled && (
                      <span className="text-xs text-primary font-bold flex items-center gap-0.5 mt-1">
                        {activeModule === idx && learningStarted ? 'Playing' : 'Open'}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Course Info & Competencies (lg: col-span-4) */}
          <div className="lg:col-span-4 space-y-6">
            {c.description && (
              <div className="card p-5 shadow-sm">
                <div className="font-bold text-sm mb-2 text-text-primary">About this Course</div>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">{c.description}</p>
              </div>
            )}

            {/* Skills covered */}
            {c.courseSkills?.length > 0 && (
              <div className="card p-5 shadow-sm">
                <div className="font-bold text-sm mb-3 text-text-primary">Competencies Addressed</div>
                <div className="space-y-3">
                  {c.courseSkills.map((cs: any) => (
                    <div key={cs.id} className="p-2.5 rounded-lg bg-background border border-border/70">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-text-primary">{cs.competency.name}</span>
                        <span className="font-bold text-accent-teal">{cs.weight}% weight</span>
                      </div>
                      <div className="progress-bar-track h-1.5">
                        <div
                          className="progress-bar-fill bg-accent-teal"
                          style={{ width: `${cs.weight}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* iGOT link */}
            {c.url && (
              <a
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                className="card p-4 flex items-center gap-3 hover:shadow-card-hover transition-shadow"
              >
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <ExternalLink size={18} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-text-primary truncate">Official Platform Link</div>
                  <div className="text-xs text-text-secondary">Open course on {c.provider}</div>
                </div>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
