const baseUrl =
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8081";
const accessToken = process.env.SUPABASE_TEST_ACCESS_TOKEN;

if (!accessToken) {
  console.error("Missing SUPABASE_TEST_ACCESS_TOKEN.");
  process.exit(1);
}

const fetchWithCookie = async (url, options = {}) => {
  const response = await fetch(url, options);
  return response;
};

const readJson = async (response) => {
  const text = await response.text();
  if (!text) return null;
  return JSON.parse(text);
};

const extractCookie = (setCookie) => {
  if (!setCookie) return null;
  const cookiePair = setCookie.split(";")[0];
  return cookiePair || null;
};

const expectStatus = (response, allowed, label) => {
  if (!allowed.includes(response.status)) {
    throw new Error(`${label} failed with status ${response.status}`);
  }
};

const main = async () => {
  console.log("Auth smoke: starting");

  const authResponse = await fetchWithCookie(`${baseUrl}/api/auth/supabase`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: "include",
  });
  expectStatus(authResponse, [200], "Supabase auth");
  const setCookie = authResponse.headers.get("set-cookie");
  const sessionCookie = extractCookie(setCookie);
  if (!sessionCookie) {
    throw new Error("Session cookie missing in auth response.");
  }

  const authBody = await readJson(authResponse);
  if (!authBody?.user?.role) {
    throw new Error("Auth response missing user role.");
  }

  const userResponse = await fetchWithCookie(`${baseUrl}/api/auth/user`, {
    headers: {
      Cookie: sessionCookie,
    },
    credentials: "include",
  });
  expectStatus(userResponse, [200], "Auth user");
  const userBody = await readJson(userResponse);
  const role = (userBody?.role || authBody.user.role || "").toUpperCase();
  console.log(`Auth smoke: role=${role || "UNKNOWN"}`);

  const hostEndpoint = await fetchWithCookie(`${baseUrl}/api/events/my`, {
    headers: {
      Cookie: sessionCookie,
    },
    credentials: "include",
  });

  if (role === "HOST" || role === "ADMIN") {
    expectStatus(hostEndpoint, [200], "Host endpoint");
  } else {
    expectStatus(hostEndpoint, [401, 403], "Attendee host endpoint block");
  }

  const logoutResponse = await fetchWithCookie(`${baseUrl}/api/auth/logout`, {
    method: "POST",
    headers: {
      Cookie: sessionCookie,
    },
    credentials: "include",
  });
  expectStatus(logoutResponse, [204], "Logout");

  const postLogout = await fetchWithCookie(`${baseUrl}/api/auth/user`, {
    headers: {
      Cookie: sessionCookie,
    },
    credentials: "include",
  });
  expectStatus(postLogout, [401], "Post-logout auth user");

  console.log("Auth smoke: passed");
};

main().catch((error) => {
  console.error(error?.message || error);
  process.exit(1);
});
