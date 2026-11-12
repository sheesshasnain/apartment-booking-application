
const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "/api"
).replace(/\/$/, "");

export class APIError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "APIError";
    this.status = status;
  }
}

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("access_token");

  const headers = new Headers(options.headers || {});

  if (options.body != null && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response;

  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch {
    throw new APIError(
      "Cannot connect to the server. Check that your backend is running.",
      0
    );
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));

    const message =
      typeof error.detail === "string"
        ? error.detail
        : Array.isArray(error.detail)
          ? error.detail
              .map((item) => item.msg)
              .filter(Boolean)
              .join(", ")
          : `Request failed (${response.status})`;

    throw new APIError(
      message || `Request failed (${response.status})`,
      response.status
    );
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

// Apartment APIs
export const apartmentAPI = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== "" && value !== null && value !== undefined) {
        params.append(key, value);
      }
    });

    const query = params.toString();

    return apiRequest(
      `/apartments${query ? `?${query}` : ""}`
    );
  },

  getById: (id) => apiRequest(`/apartments/${id}`),
};

// Authentication APIs
export const authAPI = {
  register: (data) =>
    apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: (data) =>
    apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Get the authenticated user's profile and role
  getMe: () => apiRequest("/auth/me"),
};

// Booking APIs
export const bookingAPI = {
  create: (data) =>
    apiRequest("/bookings", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getAll: () => apiRequest("/bookings"),

  cancel: (id) =>
    apiRequest(`/bookings/${id}`, {
      method: "DELETE",
    }),
};


export const adminAPI = {
  createApartment: (data) =>
    apiRequest("/apartments", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateApartment: (id, data) =>
    apiRequest(`/apartments/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteApartment: (id) =>
    apiRequest(`/apartments/${id}`, {
      method: "DELETE",
    }),

  getBookings: () => apiRequest("/bookings"),

  // Get registered users and booking statistics
  getCustomers: () => apiRequest("/admin/customers"),
};

