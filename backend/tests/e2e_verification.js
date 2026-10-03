const BASE_URL = 'http://localhost:5000/api/v1';

async function req(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  const res = await fetch(url, {
    ...options,
    headers,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || `HTTP ${res.status}`);
  }
  return data;
}

async function runVerification() {
  console.log('🧪 Starting CampusConnect Automated E2E Verification...\n');

  try {
    // 1. Health check
    const health = await req('http://localhost:5000/health');
    console.log('✅ 1. Backend Health Check:', health.service, '-', health.institution);

    // 2. Auth Verify (.edu Gating)
    const authRes = await req(`${BASE_URL}/auth/verify`, {
      method: 'POST',
      body: JSON.stringify({
        idToken: 'mock_token',
        domain: 'psit.ac.in',
        email: 'yathartha@psit.ac.in',
      }),
    });
    const token = authRes.data.token;
    const user = authRes.data.user;
    console.log(`✅ 2. Institutional Auth (.edu Gated): Verified ${user.email} (Karma: ${user.karmaScore})`);

    const authHeaders = { Authorization: `Bearer ${token}` };

    // 3. User Session
    const sessionRes = await req(`${BASE_URL}/auth/session`, { headers: authHeaders });
    console.log('✅ 3. Session Context Retrieved:', sessionRes.data.fullName, `(${sessionRes.data.department})`);

    // 4. Marketplace Listings
    const marketRes = await req(`${BASE_URL}/marketplace/items?category=textbook`);
    console.log(`✅ 4. Marketplace Queries: Retrieved ${marketRes.data.length} textbook listings.`);

    // 5. Post New Listing
    const newListing = await req(`${BASE_URL}/marketplace`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        title: 'Fluid Mechanics & Hydraulics (B.Tech 3rd Sem)',
        price: 280,
        type: 'gear',
        category: 'textbook',
        description: 'Complete syllabus textbook for AKTU Mechanical 3rd sem.',
      }),
    });
    console.log('✅ 5. Create Listing Succeeded:', newListing.data.title, `(ID: ${newListing.data._id})`);

    // 6. Peer Skills Match
    const skillsRes = await req(`${BASE_URL}/skills/match?subjectCode=DBMS`);
    console.log(`✅ 6. Peer Skills Match: Found ${skillsRes.data.length} mentors ready for 1-on-1 tutoring.`);

    // 7. Study Groups
    const groupRes = await req(`${BASE_URL}/study-groups`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        subject: 'Compiler Design Lab Session',
        location: 'CS Lab 2 (Terminal Room)',
        subjectCode: 'KCS601',
      }),
    });
    console.log('✅ 7. Real-Time Study Group Created:', groupRes.data.subject, `at ${groupRes.data.location}`);

    // 8. Cryptographic Handshake (Initiate -> OTP + QR JWT)
    const txInit = await req(`${BASE_URL}/exchange/initiate`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        listingId: newListing.data._id,
        buyerId: user.id,
      }),
    });
    const tx = txInit.data;
    console.log(`✅ 8. Exchange Handshake Initiated: Dynamic OTP = ${tx.otp} (TTL: ${tx.expiresInSeconds}s)`);

    // 9. Handshake Verification (Timing-safe OTP & Karma Award)
    const txVerify = await req(`${BASE_URL}/exchange/verify`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        transactionId: tx.transactionId,
        otp: tx.otp,
      }),
    });
    console.log(`✅ 9. Handshake Verification: Status = ${txVerify.data.status} (+${txVerify.data.karmaAwarded} Karma Awarded)`);

    console.log('\n🎉 ALL 9 REQUIREMENTS & VERIFICATIONS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Verification failed:', err.message);
    process.exit(1);
  }
}

runVerification();
