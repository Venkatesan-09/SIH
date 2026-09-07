/**
 * SkillTwin MongoDB Seed Data
 */
import { PrismaClient, Role, CourseProvider, QuestionDifficulty, EnrollmentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const HASH_ROUNDS = 12;

async function main() {
  console.log('🌱 Seeding SkillTwin database (MongoDB)...');

  // ─── Departments (MoSPI Standard 10) ─────────────────────────────────────────
  const deptNames = [
    'Statistical Analysis',
    'Survey & Field Operations',
    'Data Processing',
    'Data Science & AI',
    'Information Technology',
    'Economics & Econometrics',
    'GIS & Geospatial',
    'Policy & Governance',
    'Human Resources',
    'Administration & Finance',
  ];
  const depts: Record<string, { id: string }> = {};
  for (const name of deptNames) {
    const existing = await prisma.department.findFirst({ where: { name } });
    const dept = existing ?? await prisma.department.create({ data: { name } });
    depts[name] = dept;
  }
  console.log(`✅ Departments: ${Object.keys(depts).length}`);

  // ─── Job Roles (19+ Standard MoSPI Roles) ───────────────────────────────────
  const roleData = [
    // Statistical Cadre
    { title: 'Statistical Officer', dept: 'Statistical Analysis' },
    { title: 'Senior Statistical Officer', dept: 'Statistical Analysis' },
    { title: 'Assistant Statistical Officer', dept: 'Statistical Analysis' },
    { title: 'Statistical Analyst', dept: 'Statistical Analysis' },
    { title: 'Statistical Investigator', dept: 'Survey & Field Operations' },
    { title: 'Field Enumerator', dept: 'Survey & Field Operations' },
    // Data / AI
    { title: 'Data Analyst', dept: 'Data Science & AI' },
    { title: 'Data Scientist', dept: 'Data Science & AI' },
    { title: 'Data Engineer', dept: 'Data Science & AI' },
    { title: 'Machine Learning Engineer', dept: 'Data Science & AI' },
    { title: 'AI Specialist', dept: 'Data Science & AI' },
    // Technical
    { title: 'Software Developer', dept: 'Information Technology' },
    { title: 'Systems Analyst', dept: 'Information Technology' },
    { title: 'Database Administrator', dept: 'Information Technology' },
    { title: 'IT Officer', dept: 'Information Technology' },
    { title: 'GIS Analyst', dept: 'GIS & Geospatial' },
    { title: 'Cybersecurity Officer', dept: 'Information Technology' },
    // Economics
    { title: 'Economist', dept: 'Economics & Econometrics' },
    { title: 'Econometrician', dept: 'Economics & Econometrics' },
    { title: 'Policy Analyst', dept: 'Policy & Governance' },
    // Management & General
    { title: 'Project Manager', dept: 'Administration & Finance' },
    { title: 'Training / Capacity Building Officer', dept: 'Human Resources' },
    { title: 'Administrative Officer', dept: 'Administration & Finance' },
  ];
  const roles: Record<string, { id: string }> = {};
  for (const r of roleData) {
    const targetDeptId = depts[r.dept]?.id || depts['Statistical Analysis']!.id;
    const existing = await prisma.jobRole.findFirst({ where: { title: r.title, departmentId: targetDeptId } });
    const role = existing ?? await prisma.jobRole.create({ data: { title: r.title, departmentId: targetDeptId } });
    roles[r.title] = role;
  }
  console.log(`✅ Job Roles: ${Object.keys(roles).length}`);

  // ─── Competencies (4 Primary Domains) ──────────────────────────────────────
  const competencyData = [
    // Statistical Competencies
    { name: 'Survey Design', cluster: 'Statistical Competencies', description: 'Questionnaire design, frame development, CAPI/PAPI workflows.' },
    { name: 'Sampling Methods', cluster: 'Statistical Competencies', description: 'Stratified, cluster, multi-stage sampling with design effect calibration.' },
    { name: 'Statistical Analysis', cluster: 'Statistical Competencies', description: 'Descriptive and inferential analysis, regression, hypothesis testing.' },
    { name: 'Data Quality', cluster: 'Statistical Competencies', description: 'Validation rules, imputation, consistency audits, outlier screening.' },
    { name: 'National Accounts', cluster: 'Statistical Competencies', description: 'GDP compilation, input-output tables, economic aggregates.' },
    { name: 'Price Statistics', cluster: 'Statistical Competencies', description: 'Consumer & wholesale price index formulation, Laspeyres/Paasche indices.' },
    { name: 'Labour Statistics', cluster: 'Statistical Competencies', description: 'Periodic Labour Force Survey methodologies and workforce participation.' },
    { name: 'Agricultural Statistics', cluster: 'Statistical Competencies', description: 'Crop yield estimation, area enumeration, agricultural census data.' },
    { name: 'Industrial Statistics', cluster: 'Statistical Competencies', description: 'Annual Survey of Industries (ASI) data processing and index of industrial production.' },
    { name: 'Social Statistics', cluster: 'Statistical Competencies', description: 'Health, education, demographic indicators, population censuses.' },
    { name: 'SDG Indicators', cluster: 'Statistical Competencies', description: 'National Indicator Framework monitoring for UN Sustainable Development Goals.' },
    { name: 'Statistical Metadata', cluster: 'Statistical Competencies', description: 'SDMX standardization, classification schemes (NIC, NPC, NCO).' },
    { name: 'Official Statistics Methodology', cluster: 'Statistical Competencies', description: 'Fundamental Principles of Official Statistics and MoSPI governance.' },

    // Technical Competencies
    { name: 'Python', cluster: 'Technical Competencies', description: 'Python for data engineering and analysis using pandas, numpy, and statsmodels.' },
    { name: 'R Programming', cluster: 'Technical Competencies', description: 'Statistical computing with R, tidyverse, survey package, and ggplot2.' },
    { name: 'SQL', cluster: 'Technical Competencies', description: 'Complex relational querying, data aggregation, and database views.' },
    { name: 'Stata', cluster: 'Technical Competencies', description: 'Econometric modeling, panel data regression, and microdata processing.' },
    { name: 'SPSS', cluster: 'Technical Competencies', description: 'Statistical software for survey data analysis and cross-tabulation.' },
    { name: 'Data Visualization', cluster: 'Technical Competencies', description: 'Interactive visual analytics, dashboards, Power BI, and Superset.' },
    { name: 'Data Analytics', cluster: 'Technical Competencies', description: 'Exploratory data analysis, diagnostic metrics, and trend synthesis.' },
    { name: 'Machine Learning', cluster: 'Technical Competencies', description: 'Predictive modeling, classification algorithms, and hyperparameter tuning.' },
    { name: 'Artificial Intelligence', cluster: 'Technical Competencies', description: 'LLMs, automated validation pipelines, neural representations.' },
    { name: 'GIS', cluster: 'Technical Competencies', description: 'Geographic information systems, spatial autocorrelation, thematic mapping.' },
    { name: 'Data Engineering', cluster: 'Technical Competencies', description: 'Scalable ETL pipelines, data lakes, partition management.' },

    // Digital Governance
    { name: 'Cybersecurity', cluster: 'Digital Governance', description: 'Threat mitigation, secure credential hygiene, endpoint defense.' },
    { name: 'Data Privacy', cluster: 'Digital Governance', description: 'Digital Personal Data Protection Act compliance and PII safeguarding.' },
    { name: 'Digital Public Infrastructure', cluster: 'Digital Governance', description: 'Aadhaar, DigiLocker, and Open Data government protocols.' },
    { name: 'IT Governance', cluster: 'Digital Governance', description: 'Government cloud compliance, audit logging, and service delivery frameworks.' },

    // Behavioural & Managerial
    { name: 'Leadership', cluster: 'Behavioural & Managerial', description: 'Strategic vision, team empowerment, and administrative stewardship.' },
    { name: 'Communication', cluster: 'Behavioural & Managerial', description: 'Clear technical reporting, stakeholder presentations, policy briefings.' },
    { name: 'Project Management', cluster: 'Behavioural & Managerial', description: 'Survey lifecycle management, milestone tracking, resource budgeting.' },
    { name: 'Ethics', cluster: 'Behavioural & Managerial', description: 'Professional integrity, objectivity in statistical publication.' },
    { name: 'Problem Solving', cluster: 'Behavioural & Managerial', description: 'Root cause analysis and operational anomaly resolution.' },
  ];
  const comps: Record<string, { id: string }> = {};
  for (const c of competencyData) {
    const existing = await prisma.competency.findFirst({ where: { name: c.name } });
    const comp = existing ?? await prisma.competency.create({ data: c });
    comps[c.name] = comp;
  }
  console.log(`✅ Competencies: ${Object.keys(comps).length}`);

  // ─── Role Competency Mappings ─────────────────────────────────────────────
  const rcData = [
    // Statistical Officer (Canonical Example from spec §12)
    { role: 'Statistical Officer', skill: 'Survey Design', required: 80, importance: 90 },
    { role: 'Statistical Officer', skill: 'Sampling Methods', required: 85, importance: 95 },
    { role: 'Statistical Officer', skill: 'Statistical Analysis', required: 85, importance: 95 },
    { role: 'Statistical Officer', skill: 'Data Quality', required: 80, importance: 85 },
    { role: 'Statistical Officer', skill: 'Statistical Metadata', required: 70, importance: 75 },
    { role: 'Statistical Officer', skill: 'SDG Indicators', required: 65, importance: 70 },
    { role: 'Statistical Officer', skill: 'Python', required: 60, importance: 70 },
    { role: 'Statistical Officer', skill: 'R Programming', required: 60, importance: 70 },
    { role: 'Statistical Officer', skill: 'SQL', required: 65, importance: 75 },
    { role: 'Statistical Officer', skill: 'Data Visualization', required: 70, importance: 75 },
    { role: 'Statistical Officer', skill: 'Machine Learning', required: 50, importance: 60 },
    { role: 'Statistical Officer', skill: 'Communication', required: 70, importance: 75 },

    // Senior Statistical Officer
    { role: 'Senior Statistical Officer', skill: 'Statistical Analysis', required: 90, importance: 95 },
    { role: 'Senior Statistical Officer', skill: 'Sampling Methods', required: 90, importance: 95 },
    { role: 'Senior Statistical Officer', skill: 'Survey Design', required: 85, importance: 90 },
    { role: 'Senior Statistical Officer', skill: 'Official Statistics Methodology', required: 85, importance: 90 },
    { role: 'Senior Statistical Officer', skill: 'Leadership', required: 80, importance: 85 },
    { role: 'Senior Statistical Officer', skill: 'Project Management', required: 80, importance: 85 },

    // Data Analyst
    { role: 'Data Analyst', skill: 'SQL', required: 80, importance: 85 },
    { role: 'Data Analyst', skill: 'Python', required: 75, importance: 80 },
    { role: 'Data Analyst', skill: 'Data Visualization', required: 85, importance: 90 },
    { role: 'Data Analyst', skill: 'Data Analytics', required: 85, importance: 90 },
    { role: 'Data Analyst', skill: 'Data Quality', required: 75, importance: 75 },

    // Data Scientist / ML Engineer
    { role: 'Data Scientist', skill: 'Machine Learning', required: 85, importance: 90 },
    { role: 'Data Scientist', skill: 'Python', required: 85, importance: 90 },
    { role: 'Data Scientist', skill: 'Statistical Analysis', required: 80, importance: 85 },
    { role: 'Data Scientist', skill: 'Artificial Intelligence', required: 75, importance: 80 },

    // Systems Analyst
    { role: 'Systems Analyst', skill: 'Data Engineering', required: 80, importance: 85 },
    { role: 'Systems Analyst', skill: 'SQL', required: 80, importance: 85 },
    { role: 'Systems Analyst', skill: 'IT Governance', required: 75, importance: 80 },
    { role: 'Systems Analyst', skill: 'Cybersecurity', required: 75, importance: 80 },

    // Software Developer
    { role: 'Software Developer', skill: 'Python', required: 85, importance: 90 },
    { role: 'Software Developer', skill: 'SQL', required: 80, importance: 85 },
    { role: 'Software Developer', skill: 'Data Engineering', required: 80, importance: 80 },
    { role: 'Software Developer', skill: 'Cybersecurity', required: 75, importance: 80 },
    { role: 'Software Developer', skill: 'Data Quality', required: 75, importance: 75 },
    { role: 'Software Developer', skill: 'Data Visualization', required: 70, importance: 70 },

    // Database Administrator
    { role: 'Database Administrator', skill: 'SQL', required: 90, importance: 95 },
    { role: 'Database Administrator', skill: 'Data Engineering', required: 85, importance: 90 },
    { role: 'Database Administrator', skill: 'Cybersecurity', required: 85, importance: 90 },
    { role: 'Database Administrator', skill: 'Data Privacy', required: 80, importance: 85 },
    { role: 'Database Administrator', skill: 'Data Quality', required: 80, importance: 80 },

    // IT Officer & Cybersecurity Officer
    { role: 'IT Officer', skill: 'Cybersecurity', required: 85, importance: 90 },
    { role: 'IT Officer', skill: 'IT Governance', required: 85, importance: 90 },
    { role: 'IT Officer', skill: 'Digital Public Infrastructure', required: 80, importance: 85 },
    { role: 'Cybersecurity Officer', skill: 'Cybersecurity', required: 95, importance: 95 },
    { role: 'Cybersecurity Officer', skill: 'Data Privacy', required: 90, importance: 90 },

    // GIS Analyst
    { role: 'GIS Analyst', skill: 'GIS', required: 90, importance: 95 },
    { role: 'GIS Analyst', skill: 'Data Visualization', required: 80, importance: 85 },
    { role: 'GIS Analyst', skill: 'Python', required: 75, importance: 80 },

    // Assistant Statistical Officer & Statistical Analyst
    { role: 'Assistant Statistical Officer', skill: 'Survey Design', required: 75, importance: 80 },
    { role: 'Assistant Statistical Officer', skill: 'Sampling Methods', required: 75, importance: 80 },
    { role: 'Assistant Statistical Officer', skill: 'Statistical Analysis', required: 75, importance: 80 },
    { role: 'Assistant Statistical Officer', skill: 'Data Quality', required: 75, importance: 75 },
    { role: 'Assistant Statistical Officer', skill: 'Data Visualization', required: 65, importance: 70 },

    { role: 'Statistical Analyst', skill: 'Statistical Analysis', required: 80, importance: 85 },
    { role: 'Statistical Analyst', skill: 'Python', required: 75, importance: 80 },
    { role: 'Statistical Analyst', skill: 'R Programming', required: 75, importance: 80 },
    { role: 'Statistical Analyst', skill: 'Data Visualization', required: 80, importance: 85 },

    // Economist & Policy Analyst
    { role: 'Economist', skill: 'National Accounts', required: 85, importance: 90 },
    { role: 'Economist', skill: 'Price Statistics', required: 85, importance: 90 },
    { role: 'Economist', skill: 'Statistical Analysis', required: 80, importance: 85 },
    { role: 'Policy Analyst', skill: 'Official Statistics Methodology', required: 85, importance: 90 },
    { role: 'Policy Analyst', skill: 'Communication', required: 85, importance: 90 },
  ];

  for (const rc of rcData) {
    const roleId = roles[rc.role]?.id;
    const compId = comps[rc.skill]?.id;
    if (!roleId || !compId) continue;
    const existing = await prisma.roleCompetency.findFirst({ where: { jobRoleId: roleId, competencyId: compId } });
    if (!existing) {
      await prisma.roleCompetency.create({ data: { jobRoleId: roleId, competencyId: compId, requiredScore: rc.required, importance: rc.importance } });
    }
  }
  console.log(`✅ Role Competencies: ${rcData.length}`);

  // ─── Demo Users ───────────────────────────────────────────────────────────
  const demoHash = await bcrypt.hash('Demo@12345', HASH_ROUNDS);
  const adminHash = await bcrypt.hash('Admin@12345', HASH_ROUNDS);

  let demoEmployee = await prisma.user.findFirst({ where: { email: 'demo@skilltwin.gov.in' } });
  if (!demoEmployee) {
    demoEmployee = await prisma.user.create({
      data: {
        email: 'demo@skilltwin.gov.in', passwordHash: demoHash,
        firstName: 'Arun', lastName: 'Kumar', role: Role.EMPLOYEE,
        departmentId: depts['Statistical Analysis']!.id,
        jobRoleId: (roles['Statistical Officer'] || roles['Statistical Analyst'] || Object.values(roles)[0])!.id,
        yearsOfService: 3, isDemo: true,
        highestQualification: 'Master of Statistics (M.Stat)',
        specialization: 'Sample Surveys & Inference',
        profileCompleted: true,
        roleCompleted: true,
        assessmentCompleted: true,
        skillTwinGenerated: true,
        onboardingStatus: 'COMPLETED',
        preferences: { create: {} },
      },
    });
  }

  let demoAdmin = await prisma.user.findFirst({ where: { email: 'admin@skilltwin.gov.in' } });
  if (!demoAdmin) {
    demoAdmin = await prisma.user.create({
      data: {
        email: 'admin@skilltwin.gov.in', passwordHash: adminHash,
        firstName: 'Priya', lastName: 'Sharma', role: Role.ADMIN,
        departmentId: depts['Human Resources']!.id, isDemo: true,
        preferences: { create: {} },
      },
    });
  }

  // MoSPI requested accounts
  const mospiAdminHash = await bcrypt.hash('Admin@123', HASH_ROUNDS);
  const mospiEmpHash = await bcrypt.hash('Employee@123', HASH_ROUNDS);

  let mospiAdmin = await prisma.user.findFirst({ where: { email: 'admin@mospi.gov.in' } });
  if (!mospiAdmin) {
    mospiAdmin = await prisma.user.create({
      data: {
        email: 'admin@mospi.gov.in', passwordHash: mospiAdminHash,
        firstName: 'System', lastName: 'Admin', role: Role.ADMIN,
        departmentId: depts['Information Technology']!.id, isDemo: true,
        preferences: { create: {} },
      },
    });
  } else {
    await prisma.user.update({
      where: { id: mospiAdmin.id },
      data: { passwordHash: mospiAdminHash, role: Role.ADMIN },
    });
  }

  let mospiEmp = await prisma.user.findFirst({ where: { email: 'emp1@mospi.gov.in' } });
  if (!mospiEmp) {
    mospiEmp = await prisma.user.create({
      data: {
        email: 'emp1@mospi.gov.in', passwordHash: mospiEmpHash,
        firstName: 'Ramesh', lastName: 'Verma', role: Role.EMPLOYEE,
        departmentId: depts['Statistical Analysis']!.id,
        jobRoleId: roles['Junior Statistician']!.id,
        yearsOfService: 2, isDemo: true,
        preferences: { create: {} },
      },
    });
  } else {
    await prisma.user.update({
      where: { id: mospiEmp.id },
      data: { passwordHash: mospiEmpHash, role: Role.EMPLOYEE },
    });
  }

  // ─── Skill Scores & Gaps for demo employee ────────────────────────────────
  const demoScores: Record<string, { a: number; s: number; e: number; t: number }> = {
    'Statistical Inference':    { a: 52, s: 60, e: 55, t: 50 },
    'Survey Design & Methodology': { a: 68, s: 70, e: 65, t: 60 },
    'Data Collection Methods': { a: 75, s: 80, e: 78, t: 70 },
    'Sampling Theory':         { a: 45, s: 50, e: 42, t: 45 },
    'Data Visualization':      { a: 62, s: 65, e: 60, t: 55 },
    'Report Writing':          { a: 70, s: 72, e: 68, t: 65 },
  };
  for (const [skillName, sc] of Object.entries(demoScores)) {
    const comp = comps[skillName];
    if (!comp) continue;
    const currentScore = Math.round(sc.a * 0.60 + sc.s * 0.20 + sc.e * 0.10 + sc.t * 0.10);
    const existing = await prisma.skillScore.findFirst({ where: { userId: demoEmployee.id, competencyId: comp.id } });
    if (!existing) {
      await prisma.skillScore.create({
        data: { userId: demoEmployee.id, competencyId: comp.id, assessmentComponent: sc.a, selfComponent: sc.s, experienceComponent: sc.e, trainingComponent: sc.t, currentScore, trend: Math.round((Math.random() - 0.3) * 10), lastAssessedAt: new Date() },
      });
    }
  }
  // Gaps
  const targetRoleId = demoEmployee.jobRoleId || (roles['Statistical Officer'] || Object.values(roles)[0])!.id;
  const roleComps = await prisma.roleCompetency.findMany({ where: { jobRoleId: targetRoleId } });
  for (const rc of roleComps) {
    const score = await prisma.skillScore.findFirst({ where: { userId: demoEmployee.id, competencyId: rc.competencyId } });
    const currentScore = score?.currentScore ?? 0;
    const gapPct = Math.max(0, rc.requiredScore - currentScore);
    const priorityScore = Math.round((gapPct / 100) * 50 + (rc.importance / 100) * 35 + 15);
    const priorityBand = priorityScore >= 80 ? 'CRITICAL' : priorityScore >= 60 ? 'HIGH' : priorityScore >= 35 ? 'MODERATE' : 'LOW';
    const existingGap = await prisma.skillGap.findFirst({ where: { userId: demoEmployee.id, competencyId: rc.competencyId } });
    if (!existingGap) {
      await prisma.skillGap.create({ data: { userId: demoEmployee.id, competencyId: rc.competencyId, currentScore, requiredScore: rc.requiredScore, gapPct, priorityScore, priorityBand: priorityBand as any } });
    }
  }
  console.log(`✅ Demo user scores & gaps seeded`);

  // ─── Sample Courses ───────────────────────────────────────────────────────
  const courseData = [
    { title: 'Fundamentals of Statistical Inference', provider: CourseProvider.INTERNAL, difficulty: QuestionDifficulty.INTERMEDIATE, durationHrs: 8, rating: 4.5, skills: [{ skill: 'Statistical Inference', weight: 90 }] },
    { title: 'Survey Design Masterclass', provider: CourseProvider.INTERNAL, difficulty: QuestionDifficulty.INTERMEDIATE, durationHrs: 12, rating: 4.7, skills: [{ skill: 'Survey Design & Methodology', weight: 95 }, { skill: 'Data Collection Methods', weight: 60 }] },
    { title: 'Stratified & Cluster Sampling Techniques', provider: CourseProvider.INTERNAL, difficulty: QuestionDifficulty.ADVANCED, durationHrs: 10, rating: 4.6, skills: [{ skill: 'Sampling Theory', weight: 95 }] },
    { title: 'Data Visualization with Python & Power BI', provider: CourseProvider.IGOT, providerRef: 'igot-dv-001', difficulty: QuestionDifficulty.BEGINNER, durationHrs: 6, rating: 4.3, skills: [{ skill: 'Data Visualization', weight: 90 }, { skill: 'Python Programming', weight: 50 }] },
    { title: 'SQL for Government Data Systems', provider: CourseProvider.IGOT, providerRef: 'igot-sql-002', difficulty: QuestionDifficulty.INTERMEDIATE, durationHrs: 9, rating: 4.4, skills: [{ skill: 'SQL & Database Management', weight: 90 }] },
    { title: 'Machine Learning for Statistical Applications', provider: CourseProvider.IGOT, providerRef: 'igot-ml-003', difficulty: QuestionDifficulty.ADVANCED, durationHrs: 15, rating: 4.8, skills: [{ skill: 'Machine Learning', weight: 95 }, { skill: 'Python Programming', weight: 70 }] },
    { title: 'Statistical Policy & Governance Frameworks', provider: CourseProvider.INTERNAL, difficulty: QuestionDifficulty.INTERMEDIATE, durationHrs: 7, rating: 4.2, skills: [{ skill: 'Statistical Policy', weight: 90 }] },
    { title: 'Report Writing for Statistical Publications', provider: CourseProvider.INTERNAL, difficulty: QuestionDifficulty.BEGINNER, durationHrs: 5, rating: 4.3, skills: [{ skill: 'Report Writing', weight: 90 }] },
    { title: 'Quality Assurance in Statistical Production', provider: CourseProvider.INTERNAL, difficulty: QuestionDifficulty.INTERMEDIATE, durationHrs: 6, rating: 4.4, skills: [{ skill: 'Quality Assurance', weight: 90 }] },
    { title: 'GIS & Spatial Analysis for Census Operations', provider: CourseProvider.INTERNAL, difficulty: QuestionDifficulty.INTERMEDIATE, durationHrs: 11, rating: 4.5, skills: [{ skill: 'GIS & Spatial Analysis', weight: 95 }] },
    { title: 'Python for Data Analysis', provider: CourseProvider.IGOT, providerRef: 'igot-py-004', difficulty: QuestionDifficulty.INTERMEDIATE, durationHrs: 10, rating: 4.6, skills: [{ skill: 'Python Programming', weight: 90 }] },
    { title: 'Data Privacy & Ethics in Public Statistics', provider: CourseProvider.INTERNAL, difficulty: QuestionDifficulty.BEGINNER, durationHrs: 4, rating: 4.1, skills: [{ skill: 'Data Privacy & Ethics', weight: 90 }] },
  ];
  const courseMap: Record<string, { id: string }> = {};
  for (const c of courseData) {
    let course = await prisma.course.findFirst({ where: { title: c.title } });
    if (!course) {
      course = await prisma.course.create({ data: { title: c.title, provider: c.provider, providerRef: (c as any).providerRef, difficulty: c.difficulty, durationHrs: c.durationHrs, rating: c.rating } });
    }
    courseMap[c.title] = course;
    for (const s of c.skills) {
      const comp = comps[s.skill];
      if (!comp) continue;
      const existing = await prisma.courseSkill.findFirst({ where: { courseId: course.id, competencyId: comp.id } });
      if (!existing) await prisma.courseSkill.create({ data: { courseId: course.id, competencyId: comp.id, weight: s.weight } });
    }
  }
  console.log(`✅ Courses: ${courseData.length}`);

  // ─── Sample Assessment ────────────────────────────────────────────────────
  const statComp = comps['Statistical Inference']!;
  let assessment = await prisma.assessment.findFirst({ where: { title: 'Statistical Inference — Level 1' } });
  if (!assessment) {
    assessment = await prisma.assessment.create({
      data: { title: 'Statistical Inference — Level 1', description: 'Baseline assessment for statistical inference competency.', competencyId: statComp.id, difficulty: QuestionDifficulty.INTERMEDIATE, durationMins: 30 },
    });
    const questions = [
      { prompt: 'What is the null hypothesis in a two-sample t-test comparing two group means?', options: ['The two groups have equal means', 'The two groups have different means', 'One group has larger variance', 'Sample sizes are equal'], correctIndex: 0, explanation: 'The null hypothesis states no difference between population means.' },
      { prompt: 'A 95% confidence interval means:', options: ['95% probability the true mean is in the interval', '95% of such intervals would contain the true mean', 'The sample mean is 95% accurate', 'Normal distribution with 95% certainty'], correctIndex: 1, explanation: 'Confidence intervals are frequentist — 95% of intervals constructed this way contain the true parameter.' },
      { prompt: 'A p-value of 0.03 at α=0.05 means:', options: ['Null hypothesis is definitely false', 'We reject the null hypothesis', '3% chance of Type I error', 'Effect is practically significant'], correctIndex: 1, explanation: 'Since p<α we reject the null hypothesis.' },
      { prompt: 'Type II error refers to:', options: ['Rejecting a true null', 'Failing to reject a false null', 'Setting too high α', 'Using biased sample'], correctIndex: 1, explanation: 'Type II error occurs when we miss a real effect.' },
      { prompt: 'Which test compares proportions from two independent groups?', options: ['Paired t-test', 'Chi-square test', 'Z-test for two proportions', 'ANOVA'], correctIndex: 2, explanation: 'Z-test for two proportions is designed for comparing proportions from independent samples.' },
    ];
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]!;
      await prisma.question.create({ data: { assessmentId: assessment.id, competencyId: statComp.id, prompt: q.prompt, options: q.options, correctIndex: q.correctIndex, explanation: q.explanation, difficulty: QuestionDifficulty.INTERMEDIATE, order: i } });
    }
  }

  // ─── Learning Path for demo user ──────────────────────────────────────────
  const existing = await prisma.learningPath.findFirst({ where: { userId: demoEmployee.id } });
  if (!existing) {
    const c1 = courseMap['Fundamentals of Statistical Inference'];
    const c2 = courseMap['Stratified & Cluster Sampling Techniques'];
    if (c1 && c2) {
      await prisma.learningPath.create({
        data: {
          userId: demoEmployee.id,
          title: 'Statistical Analysis Mastery Path',
          rationale: 'Based on your Statistical Inference gap of 8% and Sampling Theory gap of 15%, SkillTwin has sequenced these two courses to close your most critical competency deficits.',
          items: { create: [{ courseId: c1.id, order: 0, status: EnrollmentStatus.IN_PROGRESS }, { courseId: c2.id, order: 1, status: EnrollmentStatus.NOT_STARTED }] },
        },
      });
    }
  }
  console.log(`✅ Learning path seeded`);

  console.log('\n🎉 Seed complete!');
  console.log('Demo: demo@skilltwin.gov.in / Demo@12345');
  console.log('Admin: admin@skilltwin.gov.in / Admin@12345');
}

main().catch(console.error).finally(() => prisma.$disconnect());
