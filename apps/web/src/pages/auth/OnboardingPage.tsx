import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Building2,
  Briefcase,
  GraduationCap,
  User,
  ChevronDown,
  Loader2,
  Cpu,
  CheckCircle2,
  Target,
  Award,
  ListChecks,
  Radar,
  TrendingUp,
  Brain,
  Zap,
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { toast } from '../../components/ui/toaster';

// SVG Radar Chart for Step 5: Skill Twin Generated
function RadarChart({ scores }: { scores: Array<{ label: string; value: number; required: number }> }) {
  if (!scores || scores.length === 0) {
    return null;
  }

  const N = scores.length;
  const cx = 150, cy = 150, r = 105;
  const toXY = (i: number, val: number) => {
    const angle = (2 * Math.PI * i) / N - Math.PI / 2;
    return { x: cx + (r * val / 100) * Math.cos(angle), y: cy + (r * val / 100) * Math.sin(angle) };
  };
  const axisXY = (i: number, val = 1) => {
    const angle = (2 * Math.PI * i) / N - Math.PI / 2;
    return { x: cx + r * val * Math.cos(angle), y: cy + r * val * Math.sin(angle) };
  };
  const toPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return '';
    return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
  };

  const actualPts = scores.map((s, i) => toXY(i, s.value));
  const reqPts = scores.map((s, i) => toXY(i, s.required));

  return (
    <svg viewBox="0 0 300 300" className="w-full max-w-xs mx-auto">
      {[20, 40, 60, 80, 100].map((pct) => (
        <polygon
          key={pct}
          points={scores.map((_, i) => { const p = axisXY(i, pct / 100); return `${p.x},${p.y}`; }).join(' ')}
          fill="none"
          stroke="#E2E4EE"
          strokeWidth={1}
        />
      ))}
      {scores.map((_, i) => {
        const end = axisXY(i);
        return <line key={i} x1={cx} y1={cy} x2={end.x} y2={end.y} stroke="#E2E4EE" strokeWidth={1} />;
      })}
      <path d={toPath(reqPts)} fill="#6366F1" fillOpacity={0.08} stroke="#6366F1" strokeWidth={1.5} strokeDasharray="4 3" />
      <path d={toPath(actualPts)} fill="#0E8F73" fillOpacity={0.2} stroke="#0E8F73" strokeWidth={2} />
      {actualPts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={4} fill="#0E8F73" />)}
      {scores.map((s, i) => {
        const lp = axisXY(i, 1.18);
        return (
          <text key={i} x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="middle" fontSize={9} fill="#5F6787" className="font-semibold">
            {s.label.length > 13 ? s.label.slice(0, 11) + '…' : s.label}
          </text>
        );
      })}
    </svg>
  );
}

export function OnboardingPage() {
  const { user, updateUser } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const qc = useQueryClient();

  // Active Step: 2 = Profile, 3 = Role, 4 = AI Assessment, 5 = SkillTwin
  const [step, setStep] = useState<2 | 3 | 4 | 5>(2);

  // Form State
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [education, setEducation] = useState(user?.highestQualification ?? '');
  const [specialization, setSpecialization] = useState(user?.specialization ?? '');
  const [departmentId, setDepartmentId] = useState(user?.departmentId ?? '');
  const [jobRoleId, setJobRoleId] = useState(user?.jobRoleId ?? '');
  const [yearsOfService, setYearsOfService] = useState<number>(user?.yearsOfService ?? 4);

  // Assessment State (Step 4)
  const [currentAssessment, setCurrentAssessment] = useState<any>(null);
  const [isGeneratingAssessment, setIsGeneratingAssessment] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isSubmittingAssessment, setIsSubmittingAssessment] = useState(false);

  // Fetch Master Data from Backend
  const { data: masterDepts } = useQuery({
    queryKey: ['master-departments'],
    queryFn: () => api.get('/master-data/departments').then((r) => r.data.departments),
  });

  const { data: masterEducation } = useQuery({
    queryKey: ['master-education'],
    queryFn: () => api.get('/master-data/education').then((r) => r.data.education),
  });

  const { data: masterExp } = useQuery({
    queryKey: ['master-experience'],
    queryFn: () => api.get('/master-data/experience-levels').then((r) => r.data.experienceLevels),
  });

  const { data: roles } = useQuery({
    queryKey: ['roles', departmentId],
    queryFn: () =>
      api.get('/roles', { params: departmentId ? { departmentId } : {} }).then((r) => r.data.roles || r.data.jobRoles),
    enabled: !!departmentId,
  });

  // Fetch fresh user profile on mount / refresh
  const { data: meUser } = useQuery({
    queryKey: ['me'],
    queryFn: () => api.get('/users/me').then((r) => r.data.user),
  });

  // Determine & Restore Onboarding Step from Backend State
  useEffect(() => {
    const activeUser = meUser || user;
    if (activeUser) {
      if (activeUser.firstName) setFirstName(activeUser.firstName);
      if (activeUser.lastName) setLastName(activeUser.lastName);
      if (activeUser.highestQualification) setEducation(activeUser.highestQualification);
      if (activeUser.specialization) setSpecialization(activeUser.specialization);
      if (activeUser.departmentId) setDepartmentId(activeUser.departmentId);
      if (activeUser.jobRoleId) setJobRoleId(activeUser.jobRoleId);
      if (activeUser.yearsOfService != null) setYearsOfService(activeUser.yearsOfService);
      updateUser(activeUser);

      // Check URL query parameter override if specified
      const stepParam = searchParams.get('step');
      if (stepParam && ['2', '3', '4', '5'].includes(stepParam)) {
        setStep(Number(stepParam) as any);
      } else {
        // Automatically restore based on persistent MongoDB flags
        if (activeUser.skillTwinGenerated || activeUser.onboardingStatus === 'COMPLETED') {
          setStep(5);
        } else if (activeUser.assessmentCompleted || activeUser.onboardingStatus === 'SKILLTWIN_REQUIRED') {
          setStep(5);
        } else if (activeUser.roleCompleted || activeUser.onboardingStatus === 'ASSESSMENT_REQUIRED') {
          setStep(4);
        } else if (activeUser.profileCompleted || activeUser.onboardingStatus === 'ROLE_REQUIRED') {
          setStep(3);
        } else {
          setStep(2);
        }
      }
    }
  }, [meUser]);

  // Set default education if not set
  useEffect(() => {
    if (!education && masterEducation && masterEducation.length > 0) {
      setEducation(masterEducation[0].name);
    }
  }, [masterEducation, education]);

  // Selected Role details & competencies from backend
  const selectedRole = (roles ?? []).find((r: any) => r.id === jobRoleId);
  const { data: roleCompetenciesData } = useQuery({
    queryKey: ['role-competencies', jobRoleId],
    queryFn: () => api.get(`/roles/${jobRoleId}/competencies`).then((r) => r.data.roleCompetencies),
    enabled: !!jobRoleId,
  });

  const roleCompetencies = roleCompetenciesData || selectedRole?.roleCompetencies || [];

  // Fetch SkillTwin Profile for Step 5
  const { data: skillTwinData } = useQuery({
    queryKey: ['skilltwin-me'],
    queryFn: () => api.get('/skilltwin/me').then((r) => r.data.skillTwin),
    enabled: step === 5,
  });

  // Step 2: Save Profile
  const handleSaveProfile = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      toast({ title: 'Please enter your first and last name', variant: 'destructive' });
      return;
    }
    if (!departmentId) {
      toast({ title: 'Please select your department / cadre', variant: 'destructive' });
      return;
    }

    try {
      const res = await api.patch('/users/me/profile', {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        highestQualification: education || 'Master of Statistics (M.Stat)',
        specialization: specialization || 'General Analysis',
        departmentId,
        yearsOfService: Number(yearsOfService),
      });

      updateUser(res.data.user);
      qc.invalidateQueries({ queryKey: ['me'] });
      setStep(3);
      setSearchParams({ step: '3' });
      toast({ title: 'Profile Saved', description: 'Proceed to select your job role.', variant: 'success' });
    } catch {
      toast({ title: 'Could not save profile', variant: 'destructive' });
    }
  };

  // Step 3: Save Job Role & Load Benchmark Competencies
  const handleSaveRole = async () => {
    if (!jobRoleId) {
      toast({ title: 'Please select your designation / role', variant: 'destructive' });
      return;
    }

    try {
      const res = await api.patch('/users/me/role', {
        departmentId,
        jobRoleId,
      });

      updateUser(res.data.user);
      qc.invalidateQueries({ queryKey: ['me'] });
      qc.invalidateQueries({ queryKey: ['competencies-me'] });
      qc.invalidateQueries({ queryKey: ['skill-gaps'] });
      qc.invalidateQueries({ queryKey: ['progress'] });
      qc.invalidateQueries({ queryKey: ['skilltwin-me'] });
      setStep(4);
      setSearchParams({ step: '4' });
      toast({ title: 'Role Confirmed', description: 'Starting AI Skill Assessment generation.', variant: 'success' });

      // Automatically generate role-specific assessment questions
      triggerGenerateAssessment();
    } catch {
      toast({ title: 'Could not save role', variant: 'destructive' });
    }
  };

  // Step 4: Generate Real AI Assessment
  const triggerGenerateAssessment = async () => {
    setIsGeneratingAssessment(true);
    try {
      const res = await api.post('/assessments/generate');
      setCurrentAssessment(res.data.assessment);
    } catch {
      // If assessment generation errors, fetch fallback catalog
      const cat = await api.get('/assessments');
      if (cat.data.assessments?.[0]) {
        const det = await api.get(`/assessments/${cat.data.assessments[0].id}/questions`);
        setCurrentAssessment({
          id: cat.data.assessments[0].id,
          title: cat.data.assessments[0].title,
          questions: det.data.questions,
        });
      }
    } finally {
      setIsGeneratingAssessment(false);
    }
  };

  // Step 4: Submit Assessment Answers
  const handleSubmitAssessment = async () => {
    setIsSubmittingAssessment(true);
    try {
      if (currentAssessment?.id) {
        const payload = {
          answers: Object.entries(answers).map(([qId, idx]) => ({ questionId: qId, selectedIndex: idx })),
        };
        await api.post(`/assessments/${currentAssessment.id}/submit`, payload);
      }

      // Finalize SkillTwin in MongoDB
      await api.post('/skilltwin/generate');

      qc.invalidateQueries({ queryKey: ['me'] });
      qc.invalidateQueries({ queryKey: ['skilltwin-me'] });
      qc.invalidateQueries({ queryKey: ['competencies-me'] });
      qc.invalidateQueries({ queryKey: ['skill-gaps'] });
      qc.invalidateQueries({ queryKey: ['progress'] });

      setStep(5);
      setSearchParams({ step: '5' });
      toast({ title: 'Assessment Completed!', description: 'Your SkillTwin has been successfully created.', variant: 'success' });
    } catch {
      setStep(5);
      setSearchParams({ step: '5' });
    } finally {
      setIsSubmittingAssessment(false);
    }
  };

  const questions = currentAssessment?.questions || [];

  // Calculate radar chart coordinates for Step 5
  const radarScores = (skillTwinData?.radarData || []).map((s: any) => ({
    label: s.label,
    value: s.value,
    required: s.required,
  }));

  const avgScore = skillTwinData?.avgCurrentScore ?? 65;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-8 px-4 sm:px-6">
      <div className="w-full max-w-3xl card p-6 sm:p-10 shadow-card">
        {/* Top Header & Workflow Tracker */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
          <button
            onClick={() => {
              if (step === 3) { setStep(2); setSearchParams({ step: '2' }); }
              else if (step === 4) { setStep(3); setSearchParams({ step: '3' }); }
              else if (step === 5) { setStep(4); setSearchParams({ step: '4' }); }
              else navigate(-1);
            }}
            className="p-1 text-primary hover:text-primary-hover transition-colors flex items-center gap-1 text-xs font-semibold"
          >
            <ArrowLeft size={16} /> Back
          </button>

          {/* Stepper Workflow Progress Bar (Steps 1 to 5) */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-accent-teal text-white flex items-center gap-1">
              <CheckCircle2 size={11} /> 1. Login
            </span>
            <span className="text-text-secondary text-xs">›</span>

            <span
              className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                step === 2
                  ? 'bg-primary text-white shadow-xs'
                  : step > 2
                  ? 'bg-accent-teal text-white'
                  : 'bg-surface border text-text-secondary'
              }`}
            >
              {step > 2 ? <CheckCircle2 size={11} /> : <User size={11} />} 2. Profile
            </span>
            <span className="text-text-secondary text-xs">›</span>

            <span
              className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                step === 3
                  ? 'bg-primary text-white shadow-xs'
                  : step > 3
                  ? 'bg-accent-teal text-white'
                  : 'bg-surface border text-text-secondary'
              }`}
            >
              {step > 3 ? <CheckCircle2 size={11} /> : <Award size={11} />} 3. Role
            </span>
            <span className="text-text-secondary text-xs">›</span>

            <span
              className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                step === 4
                  ? 'bg-primary text-white shadow-xs'
                  : step > 4
                  ? 'bg-accent-teal text-white'
                  : 'bg-surface border text-text-secondary'
              }`}
            >
              {step > 4 ? <CheckCircle2 size={11} /> : <ListChecks size={11} />} 4. Assessment
            </span>
            <span className="text-text-secondary text-xs">›</span>

            <span
              className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                step === 5 ? 'bg-primary text-white shadow-xs' : 'bg-surface border text-text-secondary'
              }`}
            >
              <Radar size={11} /> 5. SkillTwin
            </span>
          </div>

          <button
            onClick={() => navigate('/dashboard')}
            className="text-xs font-bold text-primary tracking-wider uppercase hover:underline"
          >
            Dashboard
          </button>
        </div>

        {/* AI Engine Status Badge */}
        <div className="mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-ai-bg text-ai-text text-xs font-extrabold tracking-wide uppercase">
            <Sparkles size={13} />
            SkillTwin AI Vector Intelligence Engine
          </span>
        </div>

        {/* STEP 2: COMPLETE PROFILE */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary mb-1 tracking-tight">
                2. Complete Your Employee Profile
              </h1>
              <p className="text-text-secondary text-sm leading-relaxed">
                Provide your official personal details, educational qualifications, department, and work experience.
              </p>
            </div>

            {/* Personal Information */}
            <div className="card p-4 bg-background/50 border border-border space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <User size={14} /> Personal Information
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">First Name</label>
                  <input
                    type="text"
                    required
                    className="input"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First Name"
                  />
                </div>
                <div>
                  <label className="label">Last Name</label>
                  <input
                    type="text"
                    required
                    className="input"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last Name"
                  />
                </div>
              </div>
              <div>
                <label className="label">Government Email / ID</label>
                <input
                  type="email"
                  disabled
                  className="input bg-surface cursor-not-allowed opacity-75"
                  value={user?.email ?? ''}
                />
              </div>
            </div>

            {/* Education Details */}
            <div className="card p-4 bg-background/50 border border-border space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <GraduationCap size={14} /> Education Details
              </div>
              <div>
                <label className="label">Highest Qualification</label>
                <div className="relative">
                  <select
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    className="input py-2.5 text-sm bg-surface cursor-pointer"
                  >
                    {(masterEducation ?? []).map((edu: any) => (
                      <option key={edu.code} value={edu.name}>
                        {edu.category}: {edu.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary">
                    <ChevronDown size={16} />
                  </div>
                </div>
              </div>
              <div>
                <label className="label">Specialization / Subject Area (Optional)</label>
                <input
                  type="text"
                  className="input"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  placeholder="e.g., Sample Surveys, Econometrics, Computer Science"
                />
              </div>
            </div>

            {/* Department & Experience */}
            <div className="card p-4 bg-background/50 border border-border space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <Building2 size={14} /> Department & Work Experience
              </div>

              <div>
                <label className="label">Primary Department / Cadre</label>
                <div className="relative">
                  <select
                    value={departmentId}
                    onChange={(e) => {
                      setDepartmentId(e.target.value);
                      setJobRoleId('');
                    }}
                    className="input py-2.5 text-sm bg-surface cursor-pointer"
                  >
                    <option value="">Select Department / Cadre…</option>
                    {(masterDepts ?? []).map((d: any) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary">
                    <ChevronDown size={16} />
                  </div>
                </div>
              </div>

              <div>
                <label className="label">Work Experience (Years of Service)</label>
                <div className="grid grid-cols-4 gap-2">
                  {(masterExp ?? [
                    { code: '0_2', label: '0–2 Years', defaultYears: 1 },
                    { code: '3_5', label: '3–5 Years', defaultYears: 4 },
                    { code: '6_10', label: '6–10 Years', defaultYears: 8 },
                    { code: '10_PLUS', label: '10+ Years', defaultYears: 12 },
                  ]).map((b: any) => {
                    const isSelected =
                      (b.code === '0_2' && yearsOfService <= 2) ||
                      (b.code === '3_5' && yearsOfService >= 3 && yearsOfService <= 5) ||
                      (b.code === '6_10' && yearsOfService >= 6 && yearsOfService <= 10) ||
                      (b.code === '10_PLUS' && yearsOfService > 10);
                    return (
                      <button
                        key={b.code}
                        type="button"
                        onClick={() => setYearsOfService(b.defaultYears)}
                        className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                          isSelected
                            ? 'bg-primary text-white border-primary shadow-sm'
                            : 'bg-surface text-text-primary border-border hover:border-primary/40'
                        }`}
                      >
                        {b.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <button
              onClick={handleSaveProfile}
              className="btn-primary w-full py-3.5 font-bold flex items-center justify-center gap-2 text-sm shadow-md"
            >
              <span>Next: Step 3 — Role & Competencies Setup</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* STEP 3: ROLE & COMPETENCIES */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary mb-1 tracking-tight">
                3. Role & Competencies Setup
              </h1>
              <p className="text-text-secondary text-sm leading-relaxed">
                Select your official job role to preview mandatory competency requirements and target score benchmarks.
              </p>
            </div>

            {/* Select Job Role */}
            <div className="card p-4 bg-background/50 border border-border space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <Briefcase size={14} /> Select Designation / Job Role
              </label>
              <div className="relative">
                <select
                  value={jobRoleId}
                  onChange={(e) => setJobRoleId(e.target.value)}
                  className="input py-3 text-sm font-semibold bg-surface cursor-pointer"
                >
                  <option value="">Select Role…</option>
                  {(roles ?? []).map((r: any) => (
                    <option key={r.id} value={r.id}>
                      {r.title}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary">
                  <ChevronDown size={18} />
                </div>
              </div>
            </div>

            {/* Role Competencies Preview */}
            {roleCompetencies.length > 0 && (
              <div className="card p-5 border border-primary/30 bg-primary/5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-text-primary">
                    <Target size={16} className="text-primary" />
                    <span>Role Competencies & Target Benchmarks</span>
                  </div>
                  <span className="badge bg-primary text-white text-[11px] px-2.5 py-0.5 font-bold">
                    {roleCompetencies.length} Required Skills
                  </span>
                </div>

                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {roleCompetencies.map((rc: any) => (
                    <div key={rc.id || rc.competencyId} className="p-3 rounded-xl bg-surface border border-border/80 shadow-xs">
                      <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                        <span className="text-text-primary">{rc.competency?.name || 'Competency'}</span>
                        <span className="text-primary font-black">Target Score: {rc.requiredScore}%</span>
                      </div>
                      <div className="progress-bar-track h-2">
                        <div
                          className="progress-bar-fill bg-primary"
                          style={{ width: `${rc.requiredScore}%` }}
                        />
                      </div>
                      <div className="text-[11px] text-text-secondary mt-1 flex justify-between">
                        <span>Cluster: {rc.competency?.cluster || 'Official Statistics'}</span>
                        <span>Weight: {rc.importance || 75}/100</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 flex items-center gap-3">
              <button
                onClick={() => { setStep(2); setSearchParams({ step: '2' }); }}
                className="btn-secondary py-3 px-5 text-sm font-semibold"
              >
                Back
              </button>
              <button
                onClick={handleSaveRole}
                disabled={!jobRoleId}
                className="btn-primary flex-1 py-3.5 text-sm font-bold flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
              >
                <ListChecks size={18} />
                <span>Confirm Role & Proceed to AI Assessment</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: AI ASSESSMENT */}
        {step === 4 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <span className="badge bg-primary/10 text-primary text-xs px-2.5 py-0.5 font-bold mb-2 inline-block">
                Workflow Step 4 of 5
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary mb-1 tracking-tight">
                4. AI Diagnostic Assessment
              </h1>
              <p className="text-text-secondary text-sm leading-relaxed">
                Evaluating core competencies tailored to your role as{' '}
                <strong className="text-text-primary">{selectedRole?.title ?? user?.jobRole?.title ?? 'Statistical Officer'}</strong>.
              </p>
            </div>

            {isGeneratingAssessment ? (
              <div className="card p-12 text-center space-y-4 bg-surface border border-border">
                <Loader2 size={40} className="animate-spin text-primary mx-auto" />
                <div className="font-bold text-base text-text-primary">Generating AI Role Diagnostic Assessment…</div>
                <p className="text-xs text-text-secondary max-w-sm mx-auto">
                  Gemini 3.5 Flash is tailoring diagnostic questions to your department and verified competency benchmarks.
                </p>
              </div>
            ) : questions.length > 0 ? (
              <div className="space-y-5">
                {questions.map((q: any, qIdx: number) => (
                  <div key={q.id} className="card p-5 bg-surface border border-border space-y-3">
                    <div className="flex items-start gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-primary/15 text-primary text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                        {qIdx + 1}
                      </span>
                      <div className="font-bold text-sm text-text-primary leading-snug">{q.prompt}</div>
                    </div>

                    <div className="space-y-2 pt-1 pl-8">
                      {q.options.map((opt: string, optIdx: number) => {
                        const isSelected = answers[q.id] === optIdx;
                        return (
                          <button
                            key={optIdx}
                            type="button"
                            onClick={() => setAnswers({ ...answers, [q.id]: optIdx })}
                            className={`w-full text-left p-3 rounded-xl text-xs font-medium border transition-all flex items-center gap-3 ${
                              isSelected
                                ? 'bg-primary/10 border-primary text-primary font-bold shadow-xs'
                                : 'bg-background hover:bg-surface border-border text-text-primary'
                            }`}
                          >
                            <span
                              className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-bold ${
                                isSelected ? 'border-primary bg-primary text-white' : 'border-text-secondary/40'
                              }`}
                            >
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card p-6 text-center space-y-3 bg-surface border border-border">
                <ListChecks size={36} className="mx-auto text-primary opacity-60" />
                <div className="font-bold text-base text-text-primary">Diagnostic Questions Ready</div>
                <button
                  onClick={triggerGenerateAssessment}
                  className="btn-primary py-2.5 px-5 text-xs font-bold mx-auto flex items-center gap-2"
                >
                  <Sparkles size={14} /> Start Assessment Questions
                </button>
              </div>
            )}

            <div className="pt-4 flex items-center gap-3">
              <button
                onClick={() => { setStep(3); setSearchParams({ step: '3' }); }}
                className="btn-secondary py-3 px-5 text-sm font-semibold"
              >
                Back
              </button>
              <button
                onClick={handleSubmitAssessment}
                disabled={isSubmittingAssessment || isGeneratingAssessment || questions.length === 0}
                className="btn-primary flex-1 py-3.5 text-sm font-bold flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
              >
                {isSubmittingAssessment ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Cpu size={18} />
                )}
                <span>{isSubmittingAssessment ? 'Evaluating Assessment…' : 'Submit & Generate Skill Twin 🦾'}</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: SKILLTWIN GENERATED */}
        {step === 5 && (
          <div className="space-y-6 animate-fade-in">
            {/* Success Hero Banner */}
            <div className="gradient-primary p-6 sm:p-8 rounded-card text-white text-center relative overflow-hidden shadow-lg">
              <div className="absolute inset-0 opacity-15 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, white 0%, transparent 70%)' }} />
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-extrabold uppercase mb-3">
                <Sparkles size={14} /> Step 5 Complete
              </span>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                Skill Twin Successfully Generated! 🎉
              </h1>
              <p className="text-white/80 text-sm mt-2 max-w-xl mx-auto leading-relaxed">
                Your AI-powered digital competency twin is now live and fully calibrated against mandatory benchmarks for{' '}
                <strong className="text-white underline">{user?.jobRole?.title ?? selectedRole?.title ?? 'your role'}</strong>.
              </p>
            </div>

            {/* Radar & Scores Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* SVG Radar Chart */}
              <div className="card p-5 flex flex-col items-center justify-center bg-surface border border-border shadow-xs">
                <div className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-2 flex items-center gap-1.5">
                  <Radar size={14} className="text-primary" /> Skill Twin Vector Radar
                </div>
                <RadarChart scores={radarScores} />
                <div className="flex items-center gap-4 text-xs mt-3 pt-3 border-t border-border w-full justify-center">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-accent-teal" />
                    <span className="font-semibold text-text-primary">Actual ({avgScore}%)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-0.5 border-t-2 border-dashed border-[#6366F1]" />
                    <span className="font-semibold text-text-primary">Role Target</span>
                  </div>
                </div>
              </div>

              {/* AI Gap Insights & Summary */}
              <div className="space-y-4">
                <div className="card p-5 bg-ai-bg/40 border border-ai-border space-y-2">
                  <div className="text-xs font-extrabold uppercase tracking-wider text-ai-text flex items-center gap-1.5">
                    <Brain size={14} /> AI Twin Readiness Diagnostic
                  </div>
                  <div className="text-2xl font-black text-text-primary">{skillTwinData?.readinessPct ?? avgScore}% Overall Readiness</div>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Evaluated across {radarScores.length} core competencies. Deterministic benchmarks and targeted learning recommendations are ready.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-bold text-text-primary uppercase tracking-wider">Top Competencies & Gaps</div>
                  {(skillTwinData?.competencies || radarScores).slice(0, 3).map((s: any) => (
                    <div key={s.competencyName || s.label} className="p-3 rounded-xl bg-surface border border-border flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-text-primary block">{s.competencyName || s.label}</span>
                        <span className="text-[10px] text-text-secondary">{s.proficiencyLevel || 'Developing'} · Priority: {s.priority || 'Medium'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-accent-teal">{s.currentScore || s.value}%</span>
                        <span className="text-text-secondary">/ {s.requiredScore || s.required}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons to Explore Full App */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-border">
              <Link to="/skill-twin/radar" className="btn-secondary py-3 px-4 text-xs font-bold flex items-center justify-center gap-1.5">
                <Radar size={15} /> Inspect Twin Radar
              </Link>
              <Link to="/courses" className="btn-secondary py-3 px-4 text-xs font-bold flex items-center justify-center gap-1.5">
                <TrendingUp size={15} /> Learning Paths
              </Link>
              <Link to="/dashboard" className="btn-primary py-3 px-4 text-xs font-bold flex items-center justify-center gap-1.5 shadow-md">
                <Zap size={15} /> Open Dashboard →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
