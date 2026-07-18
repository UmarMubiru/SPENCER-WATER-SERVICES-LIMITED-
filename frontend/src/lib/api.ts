const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

// Endpoints that should remain public (do not require Authorization header)
const PUBLIC_ENDPOINT_PREFIXES = [
  '/users/auth',
  '/users/auth/',
  '/users/auth/token',
  '/users/auth/token/',
  '/users/register',
  '/users/invitations',
  '/users/invitations/',
];

function getToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return localStorage.getItem("token");
  } catch (e) {
    return null;
  }
}

function createHeaders(
  includeJson: boolean = true,
  extraHeaders: HeadersInit = {}
): HeadersInit {
  const headers: HeadersInit = {};

  if (includeJson) {
    headers["Content-Type"] = "application/json";
  }

  const token = getToken();

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // If no token and the endpoint is not public, log a helpful warning for debugging
  // Note: the endpoint path isn't available here, so calling code uses request()

  return {
    ...headers,
    ...extraHeaders,
  };
}

async function request(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  // warn if this appears to be an authenticated endpoint but there's no token
  try {
    const token = getToken();
    const isPublic = PUBLIC_ENDPOINT_PREFIXES.some((p) => endpoint.startsWith(p));
    const isServer = typeof window === 'undefined';
    if (!token && !isPublic) {
      // eslint-disable-next-line no-console
      console.warn(
        `api: calling protected endpoint ${endpoint} without token (server=${isServer})`
      );
      // include stack for debugging where possible
      try {
        // eslint-disable-next-line no-console
        console.warn(new Error().stack);
      } catch (e) {
        // ignore
      }
    }
  } catch (e) {
    // ignore errors reading token during SSR
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: createHeaders(
      !(options.body instanceof FormData),
      options.headers
    ),
  });

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } catch (e) {
        // ignore
      }
      window.location.href = "/auth/login";
    } else {
      // SSR received 401 for protected endpoint
      // eslint-disable-next-line no-console
      console.warn(`api: received 401 for ${endpoint} during SSR`);
    }

    throw new Error("Authentication expired.");
  }

  return response;
}

export const api = {
  get(endpoint: string) {
    return request(endpoint);
  },

  post(endpoint: string, body: unknown) {
    return request(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  put(endpoint: string, body: unknown) {
    return request(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  },

  patch(endpoint: string, body: unknown) {
    return request(endpoint, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },

  delete(endpoint: string) {
    return request(endpoint, {
      method: "DELETE",
    });
  },

  upload(endpoint: string, formData: FormData) {
    return request(endpoint, {
      method: "POST",
      body: formData,
    });
  },
};