"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * SkillTwin MongoDB Seed Data
 */
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
const HASH_ROUNDS = 12;
async function main() {
    console.log('🌱 Seeding SkillTwin database (MongoDB)...');
    // ─── Departments ──────────────────────────────────────────────────────────
    const deptNames = ['Statistical Analysis', 'Data Science & AI', 'Information Technology', 'Human Resources', 'Policy & Governance', 'Field Operations'];
    const depts = {};
    for (const name of deptNames) {
        const existing = await prisma.department.findFirst({ where: { name } });
        const dept = existing ?? await prisma.department.create({ data: { name } });
        depts[name] = dept;
    }
    console.log(`✅ Departments: ${Object.keys(depts).length}`);
    // ─── Job Roles ────────────────────────────────────────────────────────────
    const roleData = [
        { title: 'Senior Statistician', dept: 'Statistical Analysis' },
        { title: 'Junior Statistician', dept: 'Statistical Analysis' },
        { title: 'Data Analyst', dept: 'Data Science & AI' },
        { title: 'ML Engineer', dept: 'Data Science & AI' },
        { title: 'Database Administrator', dept: 'Information Technology' },
        { title: 'Systems Analyst', dept: 'Information Technology' },
        { title: 'Policy Analyst', dept: 'Policy & Governance' },
        { title: 'Field Enumerator', dept: 'Field Operations' },
    ];
    const roles = {};
    for (const r of roleData) {
        const existing = await prisma.jobRole.findFirst({ where: { title: r.title, departmentId: depts[r.dept].id } });
        const role = existing ?? await prisma.jobRole.create({ data: { title: r.title, departmentId: depts[r.dept].id } });
        roles[r.title] = role;
    }
    console.log(`✅ Job Roles: ${Object.keys(roles).length}`);
    // ─── Competencies ─────────────────────────────────────────────────────────
    const competencyData = [
        { name: 'Statistical Inference', cluster: 'Statistical Analysis', description: 'Hypothesis testing, confidence intervals, p-values.' },
        { name: 'Survey Design & Methodology', cluster: 'Statistical Analysis', description: 'Survey design, sampling strategies, questionnaire construction.' },
        { name: 'Data Collection Methods', cluster: 'Statistical Analysis', description: 'Primary/secondary data collection, CAPI/PAPI systems.' },
        { name: 'Sampling Theory', cluster: 'Statistical Analysis', description: 'Stratified, cluster, systematic sampling with variance estimation.' },
        { name: 'Time Series Analysis', cluster: 'Statistical Analysis', description: 'Trend analysis, seasonal decomposition, ARIMA forecasting.' },
        { name: 'Data Engineering', cluster: 'Data Engineering', description: 'ETL pipelines, data warehouse design.' },
        { name: 'Machine Learning', cluster: 'Data Engineering', description: 'Supervised/unsupervised learning, model evaluation.' },
        { name: 'Data Visualization', cluster: 'Data Engineering', description: 'Charts, dashboards, Power BI, Tableau.' },
        { name: 'SQL & Database Management', cluster: 'Data Engineering', description: 'Advanced SQL, database design, indexing.' },
        { name: 'Python Programming', cluster: 'Data Engineering', description: 'Python for data analysis using pandas, numpy, scikit-learn.' },
        { name: 'Statistical Policy', cluster: 'Policy & Governance', description: 'National statistical frameworks, NSO mandates, SDMX.' },
        { name: 'Data Privacy & Ethics', cluster: 'Policy & Governance', description: 'Data protection, anonymization, informed consent.' },
        { name: 'Report Writing', cluster: 'Policy & Governance', description: 'Clear communication of statistical findings.' },
        { name: 'GIS & Spatial Analysis', cluster: 'Technical Execution', description: 'Geographic information systems, spatial statistics.' },
        { name: 'R Programming', cluster: 'Technical Execution', description: 'Statistical computing with R, tidyverse, ggplot2.' },
        { name: 'Quality Assurance', cluster: 'Technical Execution', description: 'Data validation, outlier detection, QC protocols.' },
        { name: 'Project Management', cluster: 'Technical Execution', description: 'Planning and executing statistical survey projects.' },
    ];
    const comps = {};
    for (const c of competencyData) {
        const existing = await prisma.competency.findFirst({ where: { name: c.name } });
        const comp = existing ?? await prisma.competency.create({ data: c });
        comps[c.name] = comp;
    }
    console.log(`✅ Competencies: ${Object.keys(comps).length}`);
    // ─── Role Competencies ────────────────────────────────────────────────────
    const rcData = [
        { role: 'Junior Statistician', skill: 'Statistical Inference', required: 65, importance: 80 },
        { role: 'Junior Statistician', skill: 'Survey Design & Methodology', required: 60, importance: 70 },
        { role: 'Junior Statistician', skill: 'Data Collection Methods', required: 70, importance: 75 },
        { role: 'Junior Statistician', skill: 'Sampling Theory', required: 60, importance: 65 },
        { role: 'Junior Statistician', skill: 'Data Visualization', required: 60, importance: 60 },
        { role: 'Junior Statistician', skill: 'Report Writing', required: 65, importance: 65 },
        { role: 'Senior Statistician', skill: 'Statistical Inference', required: 85, importance: 90 },
        { role: 'Senior Statistician', skill: 'Survey Design & Methodology', required: 80, importance: 85 },
        { role: 'Senior Statistician', skill: 'Sampling Theory', required: 80, importance: 80 },
        { role: 'Senior Statistician', skill: 'Report Writing', required: 80, importance: 80 },
        { role: 'Senior Statistician', skill: 'Quality Assurance', required: 75, importance: 75 },
        { role: 'Data Analyst', skill: 'Data Engineering', required: 75, importance: 80 },
        { role: 'Data Analyst', skill: 'Machine Learning', required: 70, importance: 75 },
        { role: 'Data Analyst', skill: 'Data Visualization', required: 80, importance: 85 },
        { role: 'Data Analyst', skill: 'SQL & Database Management', required: 75, importance: 80 },
        { role: 'Data Analyst', skill: 'Python Programming', required: 70, importance: 75 },
        { role: 'ML Engineer', skill: 'Machine Learning', required: 90, importance: 95 },
        { role: 'ML Engineer', skill: 'Python Programming', required: 85, importance: 90 },
        { role: 'ML Engineer', skill: 'Data Engineering', required: 80, importance: 80 },
        { role: 'Policy Analyst', skill: 'Statistical Policy', required: 85, importance: 90 },
        { role: 'Policy Analyst', skill: 'Data Privacy & Ethics', required: 80, importance: 85 },
        { role: 'Policy Analyst', skill: 'Report Writing', required: 85, importance: 90 },
        { role: 'Field Enumerator', skill: 'Data Collection Methods', required: 85, importance: 95 },
        { role: 'Field Enumerator', skill: 'Survey Design & Methodology', required: 65, importance: 70 },
        { role: 'Field Enumerator', skill: 'GIS & Spatial Analysis', required: 60, importance: 65 },
    ];
    for (const rc of rcData) {
        const roleId = roles[rc.role]?.id;
        const compId = comps[rc.skill]?.id;
        if (!roleId || !compId)
            continue;
        const existing = await prisma.roleCompetency.findFirst({ where: { jobRoleId: roleId, competencyId: compId } });
        if (!existing) {
            await prisma.roleCompetency.create({ data: { jobRoleId: roleId, competencyId: compId, requiredScore: rc.required, importance: rc.importance } });
        }
    }
    console.log(`✅ Role Competencies: ${rcData.length}`);
    // ─── Demo Users ───────────────────────────────────────────────────────────
    const demoHash = await bcryptjs_1.default.hash('Demo@12345', HASH_ROUNDS);
    const adminHash = await bcryptjs_1.default.hash('Admin@12345', HASH_ROUNDS);
    let demoEmployee = await prisma.user.findFirst({ where: { email: 'demo@skilltwin.gov.in' } });
    if (!demoEmployee) {
        demoEmployee = await prisma.user.create({
            data: {
                email: 'demo@skilltwin.gov.in', passwordHash: demoHash,
                firstName: 'Arun', lastName: 'Kumar', role: client_1.Role.EMPLOYEE,
                departmentId: depts['Statistical Analysis'].id,
                jobRoleId: roles['Junior Statistician'].id,
                yearsOfService: 3, isDemo: true,
                preferences: { create: {} },
            },
        });
    }
    let demoAdmin = await prisma.user.findFirst({ where: { email: 'admin@skilltwin.gov.in' } });
    if (!demoAdmin) {
        demoAdmin = await prisma.user.create({
            data: {
                email: 'admin@skilltwin.gov.in', passwordHash: adminHash,
                firstName: 'Priya', lastName: 'Sharma', role: client_1.Role.ADMIN,
                departmentId: depts['Human Resources'].id, isDemo: true,
                preferences: { create: {} },
            },
        });
    }
    // MoSPI requested accounts
    const mospiAdminHash = await bcryptjs_1.default.hash('Admin@123', HASH_ROUNDS);
    const mospiEmpHash = await bcryptjs_1.default.hash('Employee@123', HASH_ROUNDS);
    let mospiAdmin = await prisma.user.findFirst({ where: { email: 'admin@mospi.gov.in' } });
    if (!mospiAdmin) {
        mospiAdmin = await prisma.user.create({
            data: {
                email: 'admin@mospi.gov.in', passwordHash: mospiAdminHash,
                firstName: 'System', lastName: 'Admin', role: client_1.Role.ADMIN,
                departmentId: depts['Information Technology'].id, isDemo: true,
                preferences: { create: {} },
            },
        });
    }
    else {
        await prisma.user.update({
            where: { id: mospiAdmin.id },
            data: { passwordHash: mospiAdminHash, role: client_1.Role.ADMIN },
        });
    }
    let mospiEmp = await prisma.user.findFirst({ where: { email: 'emp1@mospi.gov.in' } });
    if (!mospiEmp) {
        mospiEmp = await prisma.user.create({
            data: {
                email: 'emp1@mospi.gov.in', passwordHash: mospiEmpHash,
                firstName: 'Ramesh', lastName: 'Verma', role: client_1.Role.EMPLOYEE,
                departmentId: depts['Statistical Analysis'].id,
                jobRoleId: roles['Junior Statistician'].id,
                yearsOfService: 2, isDemo: true,
                preferences: { create: {} },
            },
        });
    }
    else {
        await prisma.user.update({
            where: { id: mospiEmp.id },
            data: { passwordHash: mospiEmpHash, role: client_1.Role.EMPLOYEE },
        });
    }
    // ─── Skill Scores & Gaps for demo employee ────────────────────────────────
    const demoScores = {
        'Statistical Inference': { a: 52, s: 60, e: 55, t: 50 },
        'Survey Design & Methodology': { a: 68, s: 70, e: 65, t: 60 },
        'Data Collection Methods': { a: 75, s: 80, e: 78, t: 70 },
        'Sampling Theory': { a: 45, s: 50, e: 42, t: 45 },
        'Data Visualization': { a: 62, s: 65, e: 60, t: 55 },
        'Report Writing': { a: 70, s: 72, e: 68, t: 65 },
    };
    for (const [skillName, sc] of Object.entries(demoScores)) {
        const comp = comps[skillName];
        if (!comp)
            continue;
        const currentScore = Math.round(sc.a * 0.60 + sc.s * 0.20 + sc.e * 0.10 + sc.t * 0.10);
        const existing = await prisma.skillScore.findFirst({ where: { userId: demoEmployee.id, competencyId: comp.id } });
        if (!existing) {
            await prisma.skillScore.create({
                data: { userId: demoEmployee.id, competencyId: comp.id, assessmentComponent: sc.a, selfComponent: sc.s, experienceComponent: sc.e, trainingComponent: sc.t, currentScore, trend: Math.round((Math.random() - 0.3) * 10), lastAssessedAt: new Date() },
            });
        }
    }
    // Gaps
    const juniorRoleId = roles['Junior Statistician'].id;
    const roleComps = await prisma.roleCompetency.findMany({ where: { jobRoleId: juniorRoleId } });
    for (const rc of roleComps) {
        const score = await prisma.skillScore.findFirst({ where: { userId: demoEmployee.id, competencyId: rc.competencyId } });
        const currentScore = score?.currentScore ?? 0;
        const gapPct = Math.max(0, rc.requiredScore - currentScore);
        const priorityScore = Math.round((gapPct / 100) * 50 + (rc.importance / 100) * 35 + 15);
        const priorityBand = priorityScore >= 80 ? 'CRITICAL' : priorityScore >= 60 ? 'HIGH' : priorityScore >= 35 ? 'MODERATE' : 'LOW';
        const existingGap = await prisma.skillGap.findFirst({ where: { userId: demoEmployee.id, competencyId: rc.competencyId } });
        if (!existingGap) {
            await prisma.skillGap.create({ data: { userId: demoEmployee.id, competencyId: rc.competencyId, currentScore, requiredScore: rc.requiredScore, gapPct, priorityScore, priorityBand: priorityBand } });
        }
    }
    console.log(`✅ Demo user scores & gaps seeded`);
    // ─── Sample Courses ───────────────────────────────────────────────────────
    const courseData = [
        { title: 'Fundamentals of Statistical Inference', provider: client_1.CourseProvider.INTERNAL, difficulty: client_1.QuestionDifficulty.INTERMEDIATE, durationHrs: 8, rating: 4.5, skills: [{ skill: 'Statistical Inference', weight: 90 }] },
        { title: 'Survey Design Masterclass', provider: client_1.CourseProvider.INTERNAL, difficulty: client_1.QuestionDifficulty.INTERMEDIATE, durationHrs: 12, rating: 4.7, skills: [{ skill: 'Survey Design & Methodology', weight: 95 }, { skill: 'Data Collection Methods', weight: 60 }] },
        { title: 'Stratified & Cluster Sampling Techniques', provider: client_1.CourseProvider.INTERNAL, difficulty: client_1.QuestionDifficulty.ADVANCED, durationHrs: 10, rating: 4.6, skills: [{ skill: 'Sampling Theory', weight: 95 }] },
        { title: 'Data Visualization with Python & Power BI', provider: client_1.CourseProvider.IGOT, providerRef: 'igot-dv-001', difficulty: client_1.QuestionDifficulty.BEGINNER, durationHrs: 6, rating: 4.3, skills: [{ skill: 'Data Visualization', weight: 90 }, { skill: 'Python Programming', weight: 50 }] },
        { title: 'SQL for Government Data Systems', provider: client_1.CourseProvider.IGOT, providerRef: 'igot-sql-002', difficulty: client_1.QuestionDifficulty.INTERMEDIATE, durationHrs: 9, rating: 4.4, skills: [{ skill: 'SQL & Database Management', weight: 90 }] },
        { title: 'Machine Learning for Statistical Applications', provider: client_1.CourseProvider.IGOT, providerRef: 'igot-ml-003', difficulty: client_1.QuestionDifficulty.ADVANCED, durationHrs: 15, rating: 4.8, skills: [{ skill: 'Machine Learning', weight: 95 }, { skill: 'Python Programming', weight: 70 }] },
        { title: 'Statistical Policy & Governance Frameworks', provider: client_1.CourseProvider.INTERNAL, difficulty: client_1.QuestionDifficulty.INTERMEDIATE, durationHrs: 7, rating: 4.2, skills: [{ skill: 'Statistical Policy', weight: 90 }] },
        { title: 'Report Writing for Statistical Publications', provider: client_1.CourseProvider.INTERNAL, difficulty: client_1.QuestionDifficulty.BEGINNER, durationHrs: 5, rating: 4.3, skills: [{ skill: 'Report Writing', weight: 90 }] },
        { title: 'Quality Assurance in Statistical Production', provider: client_1.CourseProvider.INTERNAL, difficulty: client_1.QuestionDifficulty.INTERMEDIATE, durationHrs: 6, rating: 4.4, skills: [{ skill: 'Quality Assurance', weight: 90 }] },
        { title: 'GIS & Spatial Analysis for Census Operations', provider: client_1.CourseProvider.INTERNAL, difficulty: client_1.QuestionDifficulty.INTERMEDIATE, durationHrs: 11, rating: 4.5, skills: [{ skill: 'GIS & Spatial Analysis', weight: 95 }] },
        { title: 'Python for Data Analysis', provider: client_1.CourseProvider.IGOT, providerRef: 'igot-py-004', difficulty: client_1.QuestionDifficulty.INTERMEDIATE, durationHrs: 10, rating: 4.6, skills: [{ skill: 'Python Programming', weight: 90 }] },
        { title: 'Data Privacy & Ethics in Public Statistics', provider: client_1.CourseProvider.INTERNAL, difficulty: client_1.QuestionDifficulty.BEGINNER, durationHrs: 4, rating: 4.1, skills: [{ skill: 'Data Privacy & Ethics', weight: 90 }] },
    ];
    const courseMap = {};
    for (const c of courseData) {
        let course = await prisma.course.findFirst({ where: { title: c.title } });
        if (!course) {
            course = await prisma.course.create({ data: { title: c.title, provider: c.provider, providerRef: c.providerRef, difficulty: c.difficulty, durationHrs: c.durationHrs, rating: c.rating } });
        }
        courseMap[c.title] = course;
        for (const s of c.skills) {
            const comp = comps[s.skill];
            if (!comp)
                continue;
            const existing = await prisma.courseSkill.findFirst({ where: { courseId: course.id, competencyId: comp.id } });
            if (!existing)
                await prisma.courseSkill.create({ data: { courseId: course.id, competencyId: comp.id, weight: s.weight } });
        }
    }
    console.log(`✅ Courses: ${courseData.length}`);
    // ─── Sample Assessment ────────────────────────────────────────────────────
    const statComp = comps['Statistical Inference'];
    let assessment = await prisma.assessment.findFirst({ where: { title: 'Statistical Inference — Level 1' } });
    if (!assessment) {
        assessment = await prisma.assessment.create({
            data: { title: 'Statistical Inference — Level 1', description: 'Baseline assessment for statistical inference competency.', competencyId: statComp.id, difficulty: client_1.QuestionDifficulty.INTERMEDIATE, durationMins: 30 },
        });
        const questions = [
            { prompt: 'What is the null hypothesis in a two-sample t-test comparing two group means?', options: ['The two groups have equal means', 'The two groups have different means', 'One group has larger variance', 'Sample sizes are equal'], correctIndex: 0, explanation: 'The null hypothesis states no difference between population means.' },
            { prompt: 'A 95% confidence interval means:', options: ['95% probability the true mean is in the interval', '95% of such intervals would contain the true mean', 'The sample mean is 95% accurate', 'Normal distribution with 95% certainty'], correctIndex: 1, explanation: 'Confidence intervals are frequentist — 95% of intervals constructed this way contain the true parameter.' },
            { prompt: 'A p-value of 0.03 at α=0.05 means:', options: ['Null hypothesis is definitely false', 'We reject the null hypothesis', '3% chance of Type I error', 'Effect is practically significant'], correctIndex: 1, explanation: 'Since p<α we reject the null hypothesis.' },
            { prompt: 'Type II error refers to:', options: ['Rejecting a true null', 'Failing to reject a false null', 'Setting too high α', 'Using biased sample'], correctIndex: 1, explanation: 'Type II error occurs when we miss a real effect.' },
            { prompt: 'Which test compares proportions from two independent groups?', options: ['Paired t-test', 'Chi-square test', 'Z-test for two proportions', 'ANOVA'], correctIndex: 2, explanation: 'Z-test for two proportions is designed for comparing proportions from independent samples.' },
        ];
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            await prisma.question.create({ data: { assessmentId: assessment.id, competencyId: statComp.id, prompt: q.prompt, options: q.options, correctIndex: q.correctIndex, explanation: q.explanation, difficulty: client_1.QuestionDifficulty.INTERMEDIATE, order: i } });
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
                    items: { create: [{ courseId: c1.id, order: 0, status: client_1.EnrollmentStatus.IN_PROGRESS }, { courseId: c2.id, order: 1, status: client_1.EnrollmentStatus.NOT_STARTED }] },
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
//# sourceMappingURL=seed.js.map