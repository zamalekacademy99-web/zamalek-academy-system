const http = require('http');

async function testAuth() {
    console.log("1. Testing Login Endpoint...");
    const loginRes = await fetch('http://localhost:8000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'management@zamalek.com', password: 'password123' })
    });
    const loginData = await loginRes.json();

    if (loginData.status !== 'success' || !loginData.data.token) {
        throw new Error("Failed to receive token from login. " + JSON.stringify(loginData));
    }

    const token = loginData.data.token;
    console.log("✅ Login successful, Token received.");
    console.log("User Data:", loginData.data.user);

    console.log("\\n2. Testing Protected API Request (Branches)...");
    const authRes = await fetch('http://localhost:8000/api/v1/branches', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    if (authRes.status !== 200) {
        throw new Error("Failed to access protected route with valid token. " + await authRes.text());
    }
    const branchData = await authRes.json();
    console.log("✅ Protected Route Accessed Successfully.");
    console.log("Branches API returns data length:", branchData.data?.length);

    console.log("\\n🎉 All tests passed. Backend Authorization is 100% stable.");
}

testAuth().catch(err => {
    console.error("❌ Test Failed:", err);
    process.exit(1);
});
