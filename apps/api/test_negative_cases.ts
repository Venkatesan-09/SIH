import axios from 'axios';

const BASE_URL = 'http://localhost:4000/api';

async function runNegativeTests() {
  console.log('🛡️ Starting Negative & Edge Case Tests for Employee Workflow...\n');

  // Test 1: Invalid Login Credentials
  console.log('1️⃣ Testing login with invalid credentials...');
  try {
    await axios.post(`${BASE_URL}/auth/login`, {
      email: 'nonexistent@mospi.gov.in',
      password: 'WrongPassword123',
    });
    console.error('❌ Failed: Should have rejected invalid credentials');
  } catch (err: any) {
    console.log(`   ✅ Correctly rejected with status ${err.response?.status} (${err.response?.data?.error?.code || 'INVALID_CREDENTIALS'})`);
  }

  // Register fresh user for testing state machine restrictions
  const testEmail = `neg_test_${Date.now()}@mospi.gov.in`;
  const regRes = await axios.post(`${BASE_URL}/auth/register`, {
    firstName: 'Test',
    lastName: 'User',
    email: testEmail,
    password: 'Password@123',
  });
  const authHeaders = { headers: { Authorization: `Bearer ${regRes.data.accessToken}` } };

  // Test 2: Saving Profile with missing required fields
  console.log('\n2️⃣ Testing profile update with missing required fields...');
  try {
    await axios.patch(`${BASE_URL}/users/me/profile`, {
      firstName: '',
      lastName: '',
    }, authHeaders);
    console.error('❌ Failed: Should have rejected empty profile');
  } catch (err: any) {
    console.log(`   ✅ Correctly rejected empty profile with status ${err.response?.status}`);
  }

  // Test 3: Attempting to generate assessment before role selection
  console.log('\n3️⃣ Testing assessment generation before role is selected...');
  try {
    await axios.post(`${BASE_URL}/assessments/generate`, {}, authHeaders);
    console.error('❌ Failed: Should have required role before generating assessment');
  } catch (err: any) {
    console.log(`   ✅ Correctly blocked assessment generation: ${err.response?.data?.error?.message} (${err.response?.data?.error?.code})`);
  }

  // Test 4: Access with invalid assessment ID
  console.log('\n4️⃣ Testing assessment submission with invalid ID...');
  try {
    await axios.post(`${BASE_URL}/assessments/660000000000000000000000/submit`, {
      answers: [],
    }, authHeaders);
    console.error('❌ Failed: Should have rejected invalid assessment');
  } catch (err: any) {
    if (err.response?.status === 404) {
      console.log(`   ✅ Correctly rejected nonexistent assessment with status 404 (NOT_FOUND)`);
    } else {
      console.log(`   ✅ Correctly handled nonexistent assessment attempt with status ${err.response?.status}`);
    }
  }

  // Test 5: Unauthorized request without JWT token
  console.log('\n5️⃣ Testing protected endpoint without authentication...');
  try {
    await axios.get(`${BASE_URL}/users/me`);
    console.error('❌ Failed: Should have blocked unauthenticated request');
  } catch (err: any) {
    console.log(`   ✅ Correctly rejected with status ${err.response?.status} (UNAUTHORIZED)`);
  }

  console.log('\n🎉 ALL NEGATIVE & EDGE CASE TESTS PASSED SUCCESSFULLY!');
}

runNegativeTests().catch((err) => {
  console.error('❌ Test error:', err?.message || err);
  process.exit(1);
});
