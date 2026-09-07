import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import { TrendingUp, AlertTriangle, BookOpen, Brain, ChevronRight, Zap, Target } from 'lucide-react';

function ScoreRing({ score, size = 80 }: { score: number; size?: number }) {
  const r = (size - 10) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? '#0E8F73' : score >= 40 ? '#D97706' : '#DC2626';
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E2E4EE" strokeWidth={8} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={8} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
      <text x={size / 2} y={size / 2} textAnchor="middle" dominantBaseline="middle" className="rotate-90" style={{ transform: `rotate(90deg) translate(0, 0)`, transformOrigin: `${size / 2}px ${size / 2}px`, fontSize: 18, fontWeight: 700, fill: color }}>
        {score}
      </text>
    </svg>
  );
}

export function DashboardPage() {
  const { user } = useAuthStore();
  const { data: gapData, isLoading: gapLoading } = useQuery({ queryKey: ['skill-gaps'], queryFn: () => api.get('/skill-gaps').then(r => r.data) });
  const { data: scoresData } = useQuery({ queryKey: ['competencies-me'], queryFn: () => api.get('/competencies/me').then(r => r.data) });
  const { data: coursesData } = useQuery({ queryKey: ['courses-recommended'], queryFn: () => api.get('/courses/recommended').then(r => r.data) });

  const gaps = gapData?.gaps ?? [];
  const scores = scoresData?.skillScores ?? [];
  const avgReadiness = scores.length > 0 ? Math.round(scores.reduce((s: number, ss: any) => s + ss.currentScore, 0) / scores.length) : 0;
  const criticalGaps = gaps.filter((g: any) => g.priorityBand === 'CRITICAL' || g.priorityBand === 'HIGH').length;
  const topGaps = gaps.slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      {/* Top Welcome Banner */}
      <div className="gradient-primary px-4 sm:px-6 lg:px-8 pt-8 lg:pt-10 pb-20 lg:pb-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 70% 50%, white 0%, transparent 60%)' }} />
        <div className="max-w-7xl mx-auto relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="text-white/70 text-xs sm:text-sm font-medium mb-1">Good day,</div>
            <div className="text-white text-2xl sm:text-3xl font-extrabold tracking-tight">{user?.firstName} {user?.lastName}</div>
            <div className="text-white/70 text-xs sm:text-sm mt-1.5 flex items-center gap-2 flex-wrap">
              <span className="bg-white/15 px-2.5 py-0.5 rounded-full font-medium">{user?.department?.name ?? 'MoSPI Statistical Cadre'}</span>
              <span>·</span>
              <span>{user?.jobRole?.title ?? 'Statistical Officer'}</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5 self-start md:self-auto">
            <Link to="/skill-twin/radar" className="btn bg-white text-primary hover:bg-white/90 text-xs sm:text-sm font-semibold shadow-sm">
              <Target size={15} /> View Full Radar
            </Link>
            <Link to="/ai-studio/tutor" className="btn bg-white/20 text-white hover:bg-white/30 text-xs sm:text-sm font-semibold">
              <Zap size={15} /> AI Tutor
            </Link>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 lg:-mt-16 relative z-10 pb-12">
        {/* Onboarding & Workflow Quick Action Banner (Steps 1 to 5) */}
        <div className="mb-6 card p-5 bg-surface border border-border shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-3">
            <div>
              <div className="text-sm font-extrabold text-text-primary flex items-center gap-2">
                <span>Employee Competency Workflow (Steps 1–5)</span>
                <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-accent-teal text-white">Live AI Connected</span>
              </div>
              <p className="text-xs text-text-secondary mt-0.5">
                Complete all 5 stages from profile setup to AI diagnostic assessment and SkillTwin generation.
              </p>
            </div>
            <Link
              to="/onboarding/profile"
              className="btn-primary text-xs font-bold py-2 px-4 flex items-center justify-center gap-1.5 whitespace-nowrap shadow-xs self-start sm:self-auto"
            >
              Launch 5-Step Setup Wizard <ChevronRight size={14} />
            </Link>
          </div>

          {/* Quick Jump Buttons for Steps 2 to 5 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <Link
              to="/onboarding/profile"
              className="p-2.5 rounded-xl bg-background hover:bg-surface border border-border flex items-center gap-2.5 text-xs font-semibold text-text-primary transition-all group"
            >
              <div className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs flex-shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                2-3
              </div>
              <div className="truncate">
                <div className="font-bold truncate">Profile & Role</div>
                <div className="text-[10px] text-text-secondary truncate">Steps 2 & 3</div>
              </div>
            </Link>

            <Link
              to="/assessments"
              className="p-2.5 rounded-xl bg-background hover:bg-surface border border-border flex items-center gap-2.5 text-xs font-semibold text-text-primary transition-all group"
            >
              <div className="w-6 h-6 rounded-lg bg-warning/10 text-warning flex items-center justify-center font-bold text-xs flex-shrink-0 group-hover:bg-warning group-hover:text-white transition-colors">
                4
              </div>
              <div className="truncate">
                <div className="font-bold truncate">AI Assessment</div>
                <div className="text-[10px] text-text-secondary truncate">Step 4</div>
              </div>
            </Link>

            <Link
              to="/skill-twin/radar"
              className="p-2.5 rounded-xl bg-background hover:bg-surface border border-border flex items-center gap-2.5 text-xs font-semibold text-text-primary transition-all group"
            >
              <div className="w-6 h-6 rounded-lg bg-accent-teal/10 text-accent-teal flex items-center justify-center font-bold text-xs flex-shrink-0 group-hover:bg-accent-teal group-hover:text-white transition-colors">
                5
              </div>
              <div className="truncate">
                <div className="font-bold truncate">SkillTwin Radar</div>
                <div className="text-[10px] text-text-secondary truncate">Step 5</div>
              </div>
            </Link>

            <Link
              to="/ai-studio/generate-quiz"
              className="p-2.5 rounded-xl bg-ai-bg/60 hover:bg-ai-bg border border-ai-border flex items-center gap-2.5 text-xs font-semibold text-ai-text transition-all group"
            >
              <div className="w-6 h-6 rounded-lg bg-ai-border text-ai-text flex items-center justify-center font-bold text-xs flex-shrink-0">
                🤖
              </div>
              <div className="truncate">
                <div className="font-bold truncate">AI Quiz Studio</div>
                <div className="text-[10px] text-ai-text/80 truncate">Upload & Quiz</div>
              </div>
            </Link>
          </div>
        </div>

        {/* KPI & Readiness Highlight Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 mb-6">
          {/* Main Overall Readiness Card (lg: col-span-7) */}
          <div className="lg:col-span-7 card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-5 shadow-sm">
            <div className="flex items-center justify-center">
              <ScoreRing score={avgReadiness} size={92} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="label-eyebrow">Overall Readiness Index</div>
              <div className="flex items-baseline gap-3">
                <div className="text-3xl font-extrabold text-text-primary tracking-tight">{avgReadiness}%</div>
                <div className="text-xs font-semibold px-2 py-0.5 rounded-full bg-surface border border-border text-text-secondary">
                  {avgReadiness >= 70 ? '🟢 On Track' : avgReadiness >= 40 ? '🟡 Developing' : '🔴 Needs Focus'}
                </div>
              </div>
              <p className="text-xs text-text-secondary mt-1">
                Measured against mandatory competency benchmarks for your role.
              </p>
              <div className="mt-3 progress-bar-track h-2.5">
                <div className="progress-bar-fill bg-accent-teal" style={{ width: `${avgReadiness}%` }} />
              </div>
            </div>
            <div className="sm:self-center">
              <Link to="/skill-twin/radar" className="btn-secondary btn-sm whitespace-nowrap w-full sm:w-auto">
                Inspect Twin <ChevronRight size={14} />
              </Link>
            </div>
          </div>

          {/* Quick Metrics (lg: col-span-5) */}
          <div className="lg:col-span-5 grid grid-cols-3 gap-3">
            <div className="card p-4 flex flex-col justify-center text-center shadow-sm">
              <div className="text-2xl sm:text-3xl font-black text-text-primary">{scores.length}</div>
              <div className="text-[11px] font-medium text-text-secondary mt-1">Skills Tracked</div>
            </div>
            <div className={`p-4 flex flex-col justify-center text-center rounded-card shadow-sm ${criticalGaps > 0 ? 'bg-critical-light border border-critical-border' : 'card'}`}>
              <div className={`text-2xl sm:text-3xl font-black ${criticalGaps > 0 ? 'text-critical' : 'text-text-primary'}`}>{criticalGaps}</div>
              <div className="text-[11px] font-medium text-text-secondary mt-1">Critical Gaps</div>
            </div>
            <div className="card p-4 flex flex-col justify-center text-center shadow-sm">
              <div className="text-2xl sm:text-3xl font-black text-text-primary">{coursesData?.courses?.length ?? 0}</div>
              <div className="text-[11px] font-medium text-text-secondary mt-1">Recommended</div>
            </div>
          </div>
        </div>

        {/* 2-Column Desktop Layout (8 cols left / 4 cols right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ─── Left / Primary Column (8 Cols) ─── */}
          <div className="lg:col-span-8 space-y-6">
            {/* Top Priority Gaps */}
            <div className="card p-5 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-text-primary">Priority Competency Gaps</h2>
                  <p className="text-xs text-text-secondary mt-0.5">High-impact areas where current capability is below role benchmark</p>
                </div>
                <Link to="/skill-gaps" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
                  View All ({gaps.length}) <ChevronRight size={13} />
                </Link>
              </div>

              {gapLoading ? (
                <div className="space-y-3">
                  <div className="skeleton h-16 w-full rounded-xl" />
                  <div className="skeleton h-16 w-full rounded-xl" />
                </div>
              ) : topGaps.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {topGaps.map((gap: any) => (
                    <Link
                      key={gap.id}
                      to={`/skills/${gap.id}`}
                      className="gap-card p-4 border border-border rounded-xl hover:shadow-card-hover hover:border-primary/40 transition-all block bg-background/40"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="font-semibold text-sm text-text-primary truncate">{gap.competency.name}</div>
                        <span className={`badge badge-${gap.priorityBand.toLowerCase()} flex-shrink-0 text-[10px]`}>{gap.priorityBand}</span>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs text-text-secondary">
                          <span>Current: <strong className="text-text-primary">{Math.round(gap.currentScore)}%</strong></span>
                          <span>Target: <strong className="text-text-primary">{gap.requiredScore}%</strong></span>
                          <span className="text-critical font-bold">-{Math.round(gap.gapPct)}%</span>
                        </div>
                        <div className="progress-bar-track relative">
                          <div className="progress-bar-fill bg-accent-teal" style={{ width: `${gap.currentScore}%` }} />
                          <div className="h-full w-0.5 bg-critical absolute top-0" style={{ left: `${gap.requiredScore}%` }} title={`Required: ${gap.requiredScore}%`} />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-text-secondary text-sm">
                  🎉 No critical skill gaps identified! All competencies meet or exceed required targets.
                </div>
              )}
            </div>

            {/* Recommended Learning Courses Grid */}
            {(coursesData?.courses?.length ?? 0) > 0 && (
              <div className="card p-5 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base font-bold text-text-primary">Curated Courses for Your Profile</h2>
                    <p className="text-xs text-text-secondary mt-0.5">Aligned with your statistical role and active competencies</p>
                  </div>
                  <Link to="/courses" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
                    Full Catalogue <ChevronRight size={13} />
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {coursesData.courses.slice(0, 3).map((c: any) => (
                    <Link
                      key={c.id}
                      to={`/courses/${c.id}`}
                      className="border border-border rounded-xl p-4 hover:shadow-card-hover hover:border-primary/40 transition-all flex flex-col justify-between bg-surface group"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2.5">
                          <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-primary/10 text-primary uppercase">
                            {c.provider}
                          </span>
                          <span className="text-xs font-semibold text-accent-teal flex items-center gap-0.5">
                            ★ {c.rating}
                          </span>
                        </div>
                        <div className="font-bold text-sm text-text-primary group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                          {c.title}
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-border/70 flex items-center justify-between text-xs text-text-secondary">
                        <span>{c.durationHrs} hours</span>
                        <span className="text-primary font-medium group-hover:underline">Explore →</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ─── Right / Sidebar Column (4 Cols) ─── */}
          <div className="lg:col-span-4 space-y-6">
            {/* AI-Powered Tools Card */}
            <div className="card p-5 shadow-sm bg-gradient-to-b from-ai-bg/30 to-surface">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-ai-text text-white flex items-center justify-center">
                  <Brain size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-primary">AI Learning Assistant</h3>
                  <p className="text-[11px] text-text-secondary">Intelligent tutoring & quiz tools</p>
                </div>
              </div>

              <div className="space-y-3">
                <Link
                  to="/ai-studio/generate-quiz"
                  className="p-3 rounded-xl border border-border bg-surface hover:border-primary/50 hover:shadow-sm transition-all flex items-start gap-3 block"
                >
                  <div className="w-8 h-8 rounded-lg bg-ai-bg text-ai-text flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Brain size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-xs text-text-primary">Generate Quiz from Document</div>
                    <div className="text-[11px] text-text-secondary mt-0.5">Upload MoSPI docs or manuals to create instant quizzes</div>
                  </div>
                </Link>

                <Link
                  to="/ai-studio/tutor"
                  className="p-3 rounded-xl border border-border bg-surface hover:border-accent-teal/50 hover:shadow-sm transition-all flex items-start gap-3 block"
                >
                  <div className="w-8 h-8 rounded-lg bg-accent-teal-light text-accent-teal flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Zap size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-xs text-text-primary">Ask SkillTwin AI Tutor</div>
                    <div className="text-[11px] text-text-secondary mt-0.5">Statistical methodology, concepts & career advice</div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Quick Actions & Assessments Center Card */}
            <div className="card p-5 shadow-sm">
              <h3 className="text-sm font-bold text-text-primary mb-3">Next Milestones</h3>
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-background border border-border/80 text-xs">
                  <div className="font-semibold text-text-primary mb-1">Verify Your Competency</div>
                  <p className="text-text-secondary leading-relaxed">
                    Take an official assessment to increase your certified readiness score.
                  </p>
                  <Link to="/assessments" className="mt-2.5 inline-flex items-center gap-1 text-primary font-bold hover:underline">
                    Browse Assessments <ChevronRight size={12} />
                  </Link>
                </div>

                <div className="p-3 rounded-xl bg-background border border-border/80 text-xs">
                  <div className="font-semibold text-text-primary mb-1">Track Progress & Growth</div>
                  <p className="text-text-secondary leading-relaxed">
                    Review your learning trajectory, hours invested, and completed modules.
                  </p>
                  <Link to="/progress" className="mt-2.5 inline-flex items-center gap-1 text-primary font-bold hover:underline">
                    View My Growth <ChevronRight size={12} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
