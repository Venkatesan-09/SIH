import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import {
  ArrowLeft,
  BookOpen,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Route,
  Loader2,
  CheckCircle2,
  HelpCircle,
  Target,
  Calendar,
  CheckSquare,
  Layers,
  PlayCircle,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { toast } from '../../components/ui/toaster';

export function SkillDetailPage() {
  const { skillId } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  // Query specific skill gap detail
  const { data, isLoading } = useQuery({
    queryKey: ['skill-gap-detail', skillId],
    queryFn: () => api.get(`/skill-gaps/${skillId}`).then((r) => r.data),
  });

  // Query courses that target this competency
  const gap = data?.gap;
  const competencyId = gap?.competencyId;

  const { data: coursesData } = useQuery({
    queryKey: ['courses-for-competency', competencyId],
    queryFn: () =>
      api.get('/courses', { params: { competencyId } }).then((r) => r.data),
    enabled: !!competencyId,
  });

  const generatePathMutation = useMutation({
    mutationFn: () =>
      api.post('/learning-paths/generate', {
        competencyId: gap.competencyId,
        title: `${gap.competency.name} Accelerated Mastery`,
      }),
    onSuccess: (res) => {
      toast({ title: 'Learning path generated!', variant: 'success' });
      qc.invalidateQueries({ queryKey: ['learning-paths'] });
      navigate(`/learning-paths/${res.data.path.id}`);
    },
    onError: (err: any) => {
      toast({
        title: err.response?.data?.error?.message ?? 'Could not generate path',
        variant: 'destructive',
      });
    },
  });

  if (isLoading || !gap) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen text-text-secondary">
        <div className="text-center">
          <Loader2 className="animate-spin text-primary mx-auto mb-3" size={32} />
          <div className="text-sm">Loading competency intelligence…</div>
        </div>
      </div>
    );
  }

  const score = Math.round(gap.currentScore);
  const trend = gap.competency?.trend ?? 0;
  const skillScore = data?.skillScore;
  const explanation = data?.explanation;
  const intelligence = data?.intelligence;
  const matchingCourses = coursesData?.courses ?? [];

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Header Banner */}
      <div className="gradient-primary px-4 sm:px-6 lg:px-8 pt-8 lg:pt-10 pb-16 lg:pb-20">
        <div className="max-w-7xl mx-auto">
          <Link
            to="/skill-gaps"
            className="inline-flex items-center gap-2 text-white/70 text-sm mb-4 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} /> Back to Skill Gaps
          </Link>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-xs font-semibold mb-2">
                <Sparkles size={12} />
                Action Plan & Competency Intelligence Dossier
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{gap.competency.name}</h1>
              <div className="text-white/70 text-sm mt-1">{gap.competency.cluster}</div>
            </div>

            <div className="flex items-center gap-4 self-start md:self-auto bg-white/10 px-4 py-2.5 rounded-xl border border-white/15">
              <div>
                <div className="text-[10px] uppercase font-bold text-white/70">Current Score</div>
                <div className="text-xl font-extrabold text-white">{score}%</div>
              </div>
              <div className="h-8 w-px bg-white/20" />
              <div>
                <div className="text-[10px] uppercase font-bold text-white/70">Target Benchmark</div>
                <div className="text-xl font-extrabold text-white/90">{gap.requiredScore}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid: 2 columns on desktop (lg:grid-cols-12) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 lg:-mt-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: ChatGPT-Style Action Plan & Intelligence Breakdown (lg: col-span-7) */}
          <div className="lg:col-span-7 space-y-6">
            {/* ChatGPT-Style Executive AI Intelligence Breakdown */}
            <div className="card p-6 border-l-4 border-l-primary bg-surface shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2 text-primary font-bold text-base">
                  <Sparkles size={18} className="animate-pulse" />
                  <span>AI Learning Blueprint: {gap.competency.name}</span>
                </div>
                <span className="badge bg-primary/10 text-primary text-xs font-bold px-2.5 py-0.5 rounded-full">
                  Verified Insights
                </span>
              </div>

              {/* 1. WHAT is this skill */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-text-primary uppercase tracking-wide">
                  <HelpCircle size={15} className="text-primary" />
                  <span>1. What is {gap.competency.name}?</span>
                </div>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed bg-background p-3.5 rounded-xl border border-border/70">
                  {intelligence?.what || `${gap.competency.name} is a vital skill required for operational execution in your statistical cadence.`}
                </p>
              </div>

              {/* 2. WHY should you learn it */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-text-primary uppercase tracking-wide">
                  <Target size={15} className="text-accent-teal" />
                  <span>2. Why Should You Master It? (Impact on Your Role)</span>
                </div>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed bg-background p-3.5 rounded-xl border border-border/70">
                  {intelligence?.why || explanation || `Mastering this competency bridges your ${Math.max(0, gap.requiredScore - gap.currentScore)}% readiness gap and ensures data precision.`}
                </p>
              </div>

              {/* 3. WHEN should you apply & learn it */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-text-primary uppercase tracking-wide">
                  <Calendar size={15} className="text-amber-500" />
                  <span>3. When Should You Learn & Apply It?</span>
                </div>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed bg-background p-3.5 rounded-xl border border-border/70">
                  {intelligence?.when || `You should focus on this competency immediately since your current priority band is marked as ${gap.priorityBand}.`}
                </p>
              </div>

              {/* 4. WHAT ARE THE KEY TOPICS TO LEARN (Curriculum Checklist) */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 text-xs font-bold text-text-primary uppercase tracking-wide">
                  <CheckSquare size={15} className="text-emerald-500" />
                  <span>4. Core Curriculum Checklist & What You Must Learn:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(intelligence?.keyTopics || [
                    'Foundations, definitions, and official terminology',
                    'Standardized operational protocols and workflows',
                    'Microdata validation, anomaly identification, and audits',
                    'Applied reporting standards for government publications',
                  ]).map((topic: string, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-background border border-border/70 flex items-start gap-2.5 text-xs text-text-primary"
                    >
                      <CheckCircle2 size={16} className="text-accent-teal flex-shrink-0 mt-0.5" />
                      <span className="leading-snug">{topic}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. MULTI-TIER PROGRESSIVE ROADMAP (Beginner -> Intermediate -> Advanced -> Master) */}
              {intelligence?.roadmap && intelligence.roadmap.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-text-primary uppercase tracking-wide">
                      <Layers size={16} className="text-primary" />
                      <span>5. Progressive Mastery Roadmap: Beginner to Master</span>
                    </div>
                    <span className="text-[11px] text-text-secondary font-medium">Step-by-step career pathway</span>
                  </div>

                  <div className="space-y-3">
                    {intelligence.roadmap.map((tier: any, ti: number) => {
                      const levelColors: Record<string, { bg: string; text: string; border: string; badge: string }> = {
                        Beginner: {
                          bg: 'bg-emerald-500/5',
                          text: 'text-emerald-600 dark:text-emerald-400',
                          border: 'border-emerald-500/20',
                          badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
                        },
                        Intermediate: {
                          bg: 'bg-blue-500/5',
                          text: 'text-blue-600 dark:text-blue-400',
                          border: 'border-blue-500/20',
                          badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
                        },
                        Advanced: {
                          bg: 'bg-purple-500/5',
                          text: 'text-purple-600 dark:text-purple-400',
                          border: 'border-purple-500/20',
                          badge: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
                        },
                        Master: {
                          bg: 'bg-amber-500/5',
                          text: 'text-amber-600 dark:text-amber-400',
                          border: 'border-amber-500/20',
                          badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
                        },
                      };
                      const defaultStyle = {
                        bg: 'bg-emerald-500/5',
                        text: 'text-emerald-600 dark:text-emerald-400',
                        border: 'border-emerald-500/20',
                        badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
                      };
                      const style = (tier.level && levelColors[tier.level]) ? levelColors[tier.level]! : defaultStyle;

                      return (
                        <div
                          key={ti}
                          className={`p-4 rounded-xl border ${style.border} ${style.bg} transition-all space-y-2.5`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${style.badge}`}>
                                Stage {ti + 1}: {tier.level}
                              </span>
                              <span className="text-xs font-bold text-text-primary">{tier.title}</span>
                            </div>
                            <span className="text-[11px] font-semibold text-text-secondary flex items-center gap-1">
                              <Calendar size={12} /> {tier.duration}
                            </span>
                          </div>

                          <p className="text-xs text-text-secondary leading-relaxed">
                            <strong className="text-text-primary">Operational Focus:</strong> {tier.focus}
                          </p>

                          {tier.topics && (
                            <div className="space-y-1 pt-1">
                              <div className="text-[11px] font-bold text-text-secondary">Key Curriculum Competencies:</div>
                              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                                {tier.topics.map((top: string, toi: number) => (
                                  <li key={toi} className="text-[11px] text-text-primary flex items-start gap-1.5">
                                    <span className={style.text}>•</span>
                                    <span>{top}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {tier.deliverable && (
                            <div className="bg-background/80 rounded-lg p-2.5 border border-border/70 text-[11px] text-text-primary flex items-start gap-2">
                              <Target size={13} className="text-primary flex-shrink-0 mt-0.5" />
                              <div>
                                <strong className="text-primary">Stage Milestone:</strong> {tier.deliverable}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {intelligence?.industryStandards && (
                <div className="text-[11px] text-text-secondary border-t border-border pt-3 flex items-center gap-2">
                  <strong className="text-text-primary">Standards Compliance:</strong> {intelligence.industryStandards}
                </div>
              )}
            </div>

            {/* Score Breakdown Card (§11 Deterministic formula) */}
            <div className="card p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-text-primary">Competency Multi-Source Vector</h2>
                  <p className="text-xs text-text-secondary">Deterministic weighted score composition (§19 Competency Engine)</p>
                </div>
                <span className="badge bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">
                  Formula Engine
                </span>
              </div>

              <div className="space-y-4">
                {[
                  {
                    label: 'Verified Assessment Component (60%)',
                    value: Math.round(skillScore?.assessmentComponent ?? 0),
                    desc: 'Timed psychometric and multiple-choice questions',
                  },
                  {
                    label: 'Self-Appraisal & Feedback (20%)',
                    value: Math.round(skillScore?.selfComponent ?? 50),
                    desc: 'Self-reported proficiency scale',
                  },
                  {
                    label: 'Field Experience & Tenure (10%)',
                    value: Math.round(skillScore?.experienceComponent ?? 40),
                    desc: 'Years of service in statistical cadres',
                  },
                  {
                    label: 'Training History & Prior Courses (10%)',
                    value: Math.round(skillScore?.trainingComponent ?? 0),
                    desc: 'Completed iGOT or internal training modules',
                  },
                ].map((item) => (
                  <div key={item.label} className="p-3 rounded-xl bg-background border border-border/70">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-text-primary">{item.label}</span>
                      <span className="font-bold text-primary">{item.value}%</span>
                    </div>
                    <div className="progress-bar-track h-2 mb-1.5">
                      <div className="progress-bar-fill bg-primary" style={{ width: `${item.value}%` }} />
                    </div>
                    <div className="text-[11px] text-text-secondary">{item.desc}</div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                <div>
                  <div className="text-xs text-text-secondary">Total Calculated Readiness</div>
                  <div className="text-2xl font-black text-primary">{score}%</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-text-secondary">Role Requirement</div>
                  <div className="text-xl font-bold text-text-secondary">{gap.requiredScore}%</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Path Generator, Courses & Live Curricula (lg: col-span-5) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Priority Status Card */}
            <div
              className={`p-5 rounded-card border shadow-sm ${
                gap.gapPct > 0
                  ? 'bg-critical-light border-critical-border'
                  : 'bg-emerald-500/10 border-emerald-500/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-text-secondary">Priority Classification</div>
                  <div className="text-sm font-semibold text-text-primary mt-1">
                    Band: <span className={`font-bold badge badge-${gap.priorityBand.toLowerCase()}`}>{gap.priorityBand}</span>
                  </div>
                  <div className="text-xs text-text-secondary mt-1">Impact Index: {gap.priorityScore}/100</div>
                </div>
                <div className={`text-3xl font-black ${gap.gapPct > 0 ? 'text-critical' : 'text-accent-teal'}`}>
                  {gap.gapPct > 0 ? `-${Math.round(gap.gapPct)}%` : '✓ Met'}
                </div>
              </div>
            </div>

            {/* Primary Action Button */}
            <button
              onClick={() => generatePathMutation.mutate()}
              disabled={generatePathMutation.isPending}
              className="btn-primary w-full py-3.5 text-sm font-bold flex items-center justify-center gap-2 shadow-sm"
            >
              {generatePathMutation.isPending ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Route size={18} />
              )}
              <span>{generatePathMutation.isPending ? 'Generating Personalized Path…' : 'Generate AI Learning Path'}</span>
            </button>

            {/* Matching Courses with Expandable Curricula Preview */}
            {matchingCourses.length > 0 && (
              <div className="card p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3 border-b border-border pb-2.5">
                  <div className="flex items-center gap-2">
                    <Layers size={16} className="text-primary" />
                    <h3 className="font-bold text-sm text-text-primary">Recommended Courses & Curriculums</h3>
                  </div>
                  <span className="text-xs text-text-secondary font-semibold">{matchingCourses.length} available</span>
                </div>

                <div className="divide-y divide-border space-y-4 pt-1">
                  {matchingCourses.map((c: any) => (
                    <div key={c.id} className="pt-3 first:pt-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <Link
                            to={`/courses/${c.id}`}
                            className="text-sm font-bold text-text-primary hover:text-primary transition-colors leading-snug flex items-center gap-1.5"
                          >
                            <span>{c.title}</span>
                            <ChevronRight size={14} className="text-primary opacity-70" />
                          </Link>

                          <div className="text-xs text-text-secondary mt-1 flex flex-wrap items-center gap-2">
                            <span className="badge bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded font-bold">
                              {c.provider}
                            </span>
                            <span>·</span>
                            <span>{c.durationHrs} hours</span>
                            {c.rating && <span>· ★ {c.rating}</span>}
                            {c.curriculum?.institution && (
                              <>
                                <span>·</span>
                                <span className="truncate max-w-[150px]">{c.curriculum.institution}</span>
                              </>
                            )}
                          </div>
                        </div>

                        <Link
                          to={`/courses/${c.id}`}
                          className="btn-secondary btn-sm text-xs font-semibold flex items-center gap-1 flex-shrink-0"
                        >
                          <PlayCircle size={14} className="text-primary" />
                          <span>Watch</span>
                        </Link>
                      </div>

                      {/* Course Curriculum Modules Peek */}
                      {c.curriculum?.modules && c.curriculum.modules.length > 0 && (
                        <div className="mt-3 bg-background rounded-lg p-3 border border-border/70 space-y-1.5">
                          <div className="text-[11px] font-bold text-text-secondary uppercase tracking-wider flex items-center justify-between">
                            <span>Syllabus & Modules ({c.curriculum.modules.length} lessons)</span>
                            <span className="text-primary hover:underline cursor-pointer">
                              <Link to={`/courses/${c.id}`}>View full LMS &rarr;</Link>
                            </span>
                          </div>
                          <div className="space-y-1 mt-1">
                            {c.curriculum.modules.slice(0, 3).map((mod: any, mi: number) => (
                              <div key={mi} className="text-xs text-text-primary flex items-center justify-between py-0.5">
                                <span className="truncate pr-2">• {mod.title}</span>
                                <span className="text-[10px] text-text-secondary flex-shrink-0">{mod.duration}</span>
                              </div>
                            ))}
                            {c.curriculum.modules.length > 3 && (
                              <div className="text-[11px] text-text-secondary italic pt-0.5">
                                + {c.curriculum.modules.length - 3} more lessons in Course LMS
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
