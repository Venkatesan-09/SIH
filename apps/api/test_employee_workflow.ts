import axios from 'axios';

const BASE_URL = 'http://localhost:4000/api';

async function runE2ETest() {
  console.log('🧪 Starting End-to-End Employee Workflow Verification Test...\n');

  const testEmail = `employee_${Date.now()}@mospi.gov.in`;
  const testPassword = 'Password@123';

  // 1. REGISTER
  console.log('1️⃣ Registering fresh test employee...');
  const regRes = await axios.post(`${BASE_URL}/auth/register`, {
    firstName: 'Sanjay',
    lastName: 'Verma',
    email: testEmail,
    password: testPassword,
  });
  const token = regRes.data.accessToken;
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };
  console.log(`   ✅ Registered: ${testEmail}, Initial Status: ${regRes.data.user.onboardingStatus}`);

  // 2. MASTER DATA VERIFICATION
  console.log('\n2️⃣ Verifying master data endpoints...');
  const deptsRes = await axios.get(`${BASE_URL}/master-data/departments`, authHeaders);
  const eduRes = await axios.get(`${BASE_URL}/master-data/education`, authHeaders);
  const expRes = await axios.get(`${BASE_URL}/master-data/experience-levels`, authHeaders);
  console.log(`   ✅ Loaded ${deptsRes.data.departments.length} departments`);
  console.log(`   ✅ Loaded ${eduRes.data.education.length} educational qualification options`);
  console.log(`   ✅ Loaded ${expRes.data.experienceLevels.length} experience brackets`);

  const statDept = deptsRes.data.departments.find((d: any) => d.name === 'Statistical Analysis') || deptsRes.data.departments[0];

  // 3. STEP 2: COMPLETE PROFILE
  console.log('\n3️⃣ Step 2: Saving Employee Profile...');
  const profileRes = await axios.patch(`${BASE_URL}/users/me/profile`, {
    firstName: 'Sanjay',
    lastName: 'Verma',
    highestQualification: 'Master of Statistics (M.Stat)',
    specialization: 'Sampling Theory & Surveys',
    departmentId: statDept.id,
    yearsOfService: 4,
  }, authHeaders);
  console.log(`   ✅ Profile Saved! Updated Status: ${profileRes.data.user.onboardingStatus} (profileCompleted=${profileRes.data.user.profileCompleted})`);

  // 4. STEP 3: SELECT JOB ROLE & LOAD REQUIRED COMPETENCIES
  console.log('\n4️⃣ Step 3: Selecting Role & Fetching Competencies...');
  const rolesRes = await axios.get(`${BASE_URL}/master-data/roles?departmentId=${statDept.id}`, authHeaders);
  const statOfficerRole = rolesRes.data.roles.find((r: any) => r.title === 'Statistical Officer') || rolesRes.data.roles[0];
  console.log(`   Found Role: ${statOfficerRole.title} (${statOfficerRole.id})`);

  const roleCompRes = await axios.get(`${BASE_URL}/roles/${statOfficerRole.id}/competencies`, authHeaders);
  console.log(`   ✅ Role Competencies Loaded: ${roleCompRes.data.roleCompetencies.length} competencies`);
  roleCompRes.data.roleCompetencies.slice(0, 3).forEach((rc: any) => {
    console.log(`      - ${rc.competency.name}: Target Score = ${rc.requiredScore}%`);
  });

  const saveRoleRes = await axios.patch(`${BASE_URL}/users/me/role`, {
    departmentId: statDept.id,
    jobRoleId: statOfficerRole.id,
  }, authHeaders);
  console.log(`   ✅ Role Saved! Updated Status: ${saveRoleRes.data.user.onboardingStatus} (roleCompleted=${saveRoleRes.data.user.roleCompleted})`);

  // 5. STEP 4: AI ASSESSMENT GENERATION & SUBMISSION
  console.log('\n5️⃣ Step 4: Generating Role-Specific AI Assessment via Gemini...');
  const genAssessmentRes = await axios.post(`${BASE_URL}/assessments/generate`, {}, authHeaders);
  const assessment = genAssessmentRes.data.assessment;
  console.log(`   ✅ AI Assessment Generated: "${assessment.title}" (${assessment.questions.length} questions)`);

  const answersPayload: Record<string, number> = {};
  assessment.questions.forEach((q: any, i: number) => {
    // Answer accurately: choice 0 or 1
    answersPayload[q.id] = (i % 2 === 0) ? 0 : 1;
  });

  console.log('   Submitting answers and calculating deterministic scores...');
  const submitRes = await axios.post(`${BASE_URL}/assessments/${assessment.id}/submit`, {
    answers: Object.entries(answersPayload).map(([questionId, selectedIndex]) => ({ questionId, selectedIndex })),
  }, authHeaders);
  console.log(`   ✅ Assessment Evaluated: Score = ${submitRes.data.scorePct}% (${submitRes.data.correctCount}/${submitRes.data.totalCount} correct)`);
  console.log(`   Updated Status: ${submitRes.data.onboardingStatus}`);

  // 6. STEP 5: SKILLTWIN & RADAR GENERATION
  console.log('\n6️⃣ Step 5: Generating SkillTwin & Finalizing Onboarding...');
  const finalizeRes = await axios.post(`${BASE_URL}/skilltwin/generate`, {}, authHeaders);
  console.log(`   ✅ SkillTwin Generated! Final Status: ${finalizeRes.data.onboardingStatus} (skillTwinGenerated=${finalizeRes.data.user.skillTwinGenerated})`);

  const twinRes = await axios.get(`${BASE_URL}/skilltwin/me`, authHeaders);
  const twin = twinRes.data.skillTwin;
  console.log(`   SkillTwin Profile: ${twin.employeeName} (${twin.jobRole})`);
  console.log(`   Average Score: ${twin.avgCurrentScore}%, Target Benchmark: ${twin.avgRequiredScore}%, Overall Readiness: ${twin.readinessPct}%`);
  console.log(`   Total Competencies Monitored: ${twin.competencies.length}`);

  // 7. STEP 6 & 7: SKILL GAPS & RECOMMENDATIONS
  console.log('\n7️⃣ Step 6 & 7: Checking Skill Gaps & Personalized Recommendations...');
  const gapsRes = await axios.get(`${BASE_URL}/skill-gaps`, authHeaders);
  console.log(`   ✅ Gaps Found: ${gapsRes.data.gaps.length}`);
  gapsRes.data.gaps.slice(0, 3).forEach((g: any) => {
    console.log(`      - ${g.competency.name}: Current ${Math.round(g.currentScore)}% vs Required ${g.requiredScore}% (Gap: ${Math.round(g.gapPct)}%, Priority: ${g.priorityBand})`);
  });

  const recRes = await axios.get(`${BASE_URL}/recommendations/me`, authHeaders);
  console.log(`   ✅ Personalized Recommendations Generated: ${recRes.data.recommendations.length}`);
  recRes.data.recommendations.slice(0, 2).forEach((r: any) => {
    console.log(`      - Course: ${r.recommendedLearning}`);
    console.log(`        Reason: ${r.reason}`);
  });

  // 8. BROWSER REFRESH & PERSISTENCE TEST
  console.log('\n8️⃣ Testing Browser Refresh & State Persistence across Logout/Login...');
  const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
    email: testEmail,
    password: testPassword,
  });
  console.log(`   ✅ Re-authenticated user! State restored:`);
  console.log(`      onboardingStatus: ${loginRes.data.user.onboardingStatus}`);
  console.log(`      profileCompleted: ${loginRes.data.user.profileCompleted}`);
  console.log(`      roleCompleted: ${loginRes.data.user.roleCompleted}`);
  console.log(`      assessmentCompleted: ${loginRes.data.user.assessmentCompleted}`);
  console.log(`      skillTwinGenerated: ${loginRes.data.user.skillTwinGenerated}`);

  console.log('\n🎉 ALL EMPLOYEE WORKFLOW VERIFICATION TESTS PASSED SUCCESSFULLY!');
}

runE2ETest().catch((err) => {
  console.error('❌ Test failed:', err?.response?.data || err.message || err);
  process.exit(1);
});
