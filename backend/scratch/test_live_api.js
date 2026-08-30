import axios from "axios";

async function testLiveApi() {
  console.log("📡 Testing live backend API connection at http://localhost:5000/api/v1 ...");
  try {
    const loginRes = await axios.post("http://localhost:5000/api/v1/auth/login", {
      email: "admin@somalia.gov.so",
      password: "Password123!",
    });
    console.log("✅ Live auth login status:", loginRes.status, loginRes.data.message);

    const cookies = loginRes.headers["set-cookie"];
    const cookieHeader = Array.isArray(cookies) ? cookies.join("; ") : cookies;

    const listRes = await axios.get("http://localhost:5000/api/v1/admin/data-collectors", {
      headers: { Cookie: cookieHeader },
    });
    console.log("✅ Live GET /admin/data-collectors status:", listRes.status);
    console.log("   Data Collectors Count:", listRes.data.data ? listRes.data.data.length : 0);

    const officersRes = await axios.get("http://localhost:5000/api/v1/admin/data-officers", {
      headers: { Cookie: cookieHeader },
    });
    console.log("✅ Live GET /admin/data-officers status:", officersRes.status);
    console.log("   Data Officers Count:", officersRes.data.data ? officersRes.data.data.length : 0);

    console.log("\n🎉 LIVE API ENDPOINTS ARE FULLY BUILT AND RESPONDING SUCCESSFULLY!");
  } catch (error) {
    console.error("❌ Live API Test Error:", error.response ? error.response.data : error.message);
  }
}

testLiveApi();
