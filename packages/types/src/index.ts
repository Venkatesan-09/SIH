// ─────────────────────────────────────────────────────────────────────────────
// @skilltwin/types — Shared DTOs, enums, and interfaces
// Mirrors the Prisma schema enums and forms the contract between api ↔ web ↔ ai
// ─────────────────────────────────────────────────────────────────────────────

// ─── Enums ───────────────────────────────────────────────────────────────────

export enum Role {
  EMPLOYEE = 'EMPLOYEE',
  ADMIN = 'ADMIN',
  TRAINER = 'TRAINER', // REQUIRES CONFIRMATION: no dedicated UI screen exists yet
}

export enum GapPriority {
  LOW = 'LOW',
  MODERATE = 'MODERATE',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum EnrollmentStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export enum CourseProvider {
  IGOT = 'IGOT',
  INTERNAL = 'INTERNAL',
  MOCK = 'MOCK',
}

export enum DocumentStatus {
  UPLOADED = 'UPLOADED',
  PROCESSING = 'PROCESSING',
  PROCESSED = 'PROCESSED',
  FAILED = 'FAILED',
}

export enum QuestionDifficulty {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
}

// ─── Auth DTOs ────────────────────────────────────────────────────────────────

export interface RegisterDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  departmentId?: string;
  jobRoleId?: string;
  yearsOfService?: number;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: UserDto;
  accessToken: string;
  refreshToken?: string;
}

// ─── User / Profile ───────────────────────────────────────────────────────────

export interface UserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  departmentId?: string | null;
  jobRoleId?: string | null;
  yearsOfService?: number | null;
  highestQualification?: string | null;
  specialization?: string | null;
  onboardingStatus?: string;
  profileCompleted?: boolean;
  roleCompleted?: boolean;
  assessmentCompleted?: boolean;
  skillTwinGenerated?: boolean;
  department?: DepartmentDto | null;
  jobRole?: JobRoleDto | null;
  createdAt: string;
}

export interface DepartmentDto {
  id: string;
  name: string;
}

export interface JobRoleDto {
  id: string;
  title: string;
  departmentId?: string | null;
}

// ─── Competency / Skill Score ─────────────────────────────────────────────────

export interface CompetencyDto {
  id: string;
  name: string;
  cluster: string;
  description?: string | null;
}

export interface SkillScoreDto {
  id: string;
  userId: string;
  competencyId: string;
  competency: CompetencyDto;
  assessmentComponent: number;
  selfComponent: number;
  experienceComponent: number;
  trainingComponent: number;
  currentScore: number;
  trend: number;
  lastAssessedAt?: string | null;
  updatedAt: string;
}

// ─── Skill Gap ────────────────────────────────────────────────────────────────

export interface SkillGapDto {
  id: string;
  userId: string;
  competencyId: string;
  competency: CompetencyDto;
  currentScore: number;
  requiredScore: number;
  gapPct: number;
  priorityScore: number;
  priorityBand: GapPriority;
  computedAt: string;
  explanation?: string; // AI-generated, cached
}

// ─── Assessment ───────────────────────────────────────────────────────────────

export interface AssessmentDto {
  id: string;
  title: string;
  description?: string | null;
  competencyId?: string | null;
  competency?: CompetencyDto | null;
  difficulty: QuestionDifficulty;
  durationMins: number;
  isAiGenerated: boolean;
  questionCount?: number;
  createdAt: string;
}

export interface QuestionDto {
  id: string;
  assessmentId: string;
  competencyId?: string | null;
  prompt: string;
  options: string[];
  difficulty: QuestionDifficulty;
  order: number;
  // correctIndex intentionally omitted in client-facing DTO
}

export interface QuestionResultDto extends QuestionDto {
  correctIndex: number; // only included in results response after submission
  explanation?: string | null;
}

export interface SubmitAssessmentDto {
  attemptId: string;
  answers: Array<{ questionId: string; selectedIndex: number }>;
}

export interface AssessmentResultDto {
  attemptId: string;
  scorePct: number;
  correctCount: number;
  totalCount: number;
  strengths: CompetencyDto[];
  weakAreas: CompetencyDto[];
  aiInsight: string;
  questions: QuestionResultDto[];
}

// ─── Courses / Learning Paths ─────────────────────────────────────────────────

export interface CourseDto {
  id: string;
  title: string;
  description?: string | null;
  provider: CourseProvider;
  difficulty: QuestionDifficulty;
  durationHrs?: number | null;
  url?: string | null;
  rating?: number | null;
  courseSkills?: CourseSkillDto[];
  createdAt: string;
  // AI fields (optional, populated by recommendations endpoint)
  aiMatchPct?: number;
  aiMatchRationale?: string;
}

export interface CourseSkillDto {
  competencyId: string;
  competency: CompetencyDto;
  weight: number;
}

export interface LearningPathDto {
  id: string;
  userId: string;
  title: string;
  rationale?: string | null; // AI-generated "Why SkillTwin recommended this"
  createdAt: string;
  items: LearningPathItemDto[];
}

export interface LearningPathItemDto {
  id: string;
  courseId: string;
  course: CourseDto;
  order: number;
  status: EnrollmentStatus;
}

// ─── Progress ─────────────────────────────────────────────────────────────────

export interface ProgressDto {
  growthSeries: Array<{ date: string; score: number }>;
  totalHours: number;
  assessmentScores: Array<{ assessmentTitle: string; scorePct: number; date: string }>;
  completedCourses: CourseDto[];
}

// ─── Documents / AI ───────────────────────────────────────────────────────────

export interface DocumentDto {
  id: string;
  userId: string;
  fileName: string;
  fileType: string;
  fileSizeBytes: number;
  status: DocumentStatus;
  uploadedAt: string;
}

export interface AnalyzeDocumentResponseDto {
  topics: string[];
  competencyMatches: Array<{ competency: string; competencyId?: string; matchPct: number }>;
}

export interface GeneratedQuestionDto {
  id: string;
  competencyId?: string | null;
  competency?: CompetencyDto | null;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: QuestionDifficulty;
  sourceRef?: string | null;
  confidence: number;
  validated: boolean;
}

export interface GeneratedQuizDto {
  id: string;
  documentId: string;
  createdAt: string;
  questions: GeneratedQuestionDto[];
}

export interface TutorReplyDto {
  reply: string;
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export interface AdminDashboardDto {
  totalEmployees: number;
  avgCompetency: number;
  criticalGaps: number;
  trend: Array<{ date: string; avgScore: number }>;
  insights: AIInsightDto[];
}

export interface AIInsightDto {
  id: string;
  kind: 'critical_finding' | 'positive_trend' | 'recommendation';
  title: string;
  description: string;
  competency?: string;
  department?: string;
  createdAt: string;
}

export interface EmployeeListItemDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department?: DepartmentDto | null;
  jobRole?: JobRoleDto | null;
  avgReadiness: number;
  criticalGaps: number;
}

export interface HeatmapCellDto {
  departmentId: string;
  departmentName: string;
  competencyId: string;
  competencyName: string;
  avgScore: number;
  band: 'CRITICAL' | 'DEVELOPING' | 'PROFICIENT' | 'EXPERT';
}

export interface DepartmentAnalyticsDto {
  period: string;
  overallReadiness: number;
  overallReadinessDelta: number;
  activeEmployees: number;
  activeEmployeesDelta: number;
  criticalGaps: number;
  criticalGapsDelta: number;
  departments: Array<{
    id: string;
    name: string;
    readiness: number;
    employeeCount: number;
    criticalGaps: number;
  }>;
}

// ─── iGOT ────────────────────────────────────────────────────────────────────

export interface IGOTStatusDto {
  active: boolean;
  lastSyncedAt: string;
  syncedCourses: number;
  progressSyncPct: number;
  isMock: boolean; // always true until RealIGOTProvider exists
  logs: IGOTLogEntryDto[];
}

export interface IGOTLogEntryDto {
  id: string;
  timestamp: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

// ─── Common / Pagination ──────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
  };
}

// ─── AI Provider interface (mirrored in apps/ai as Python Protocol) ───────────

export interface AIProviderAnalyzeInput {
  text: string;
  fileType: string;
}

export interface AIProviderQuizInput {
  sourceText: string;
  competencyIds: string[];
  questionCount: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AIProviderTutorInput {
  moduleContext: string;
  history: ChatMessage[];
  question: string;
}

export interface AIProviderGapInput {
  skill: string;
  current: number;
  required: number;
  roleContext: string;
}

export interface AIProviderPathInput {
  gaps: SkillGapDto[];
  history: Array<{ courseId: string; status: EnrollmentStatus }>;
}

export interface AIProviderPathOutput {
  courseIds: string[];
  rationale: string;
}
