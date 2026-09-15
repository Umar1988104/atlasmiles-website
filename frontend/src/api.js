const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(path, options = {}) {
  const token = localStorage.getItem("atlasmiles_token");
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || "Something went wrong. Please try again.");
  }
  return data;
}

export const api = {
  getPackages: () => request("/packages"),
  getPackage: (id) => request(`/packages/${id}`),
  getDestinations: () => request("/destinations"),

  register: (payload) =>
    request("/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  login: (payload) =>
    request("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  getProfile: () => request("/auth/profile"),
  updateProfile: (payload) =>
    request("/auth/profile", { method: "PUT", body: JSON.stringify(payload) }),
  toggleSavedPackage: (packageId) =>
    request(`/auth/saved-packages/${packageId}`, { method: "POST" }),
  changePassword: (payload) =>
    request("/auth/profile/password", { method: "PUT", body: JSON.stringify(payload) }),
  forgotPassword: (payload) =>
    request("/auth/forgot-password", { method: "POST", body: JSON.stringify(payload) }),
  resetPassword: (payload) =>
    request("/auth/reset-password", { method: "POST", body: JSON.stringify(payload) }),

  createBooking: (payload) =>
    request("/bookings", { method: "POST", body: JSON.stringify(payload) }),
  getBookings: () => request("/bookings"),
  getBooking: (id) => request(`/bookings/${id}`),
  payBooking: (id) => request(`/bookings/${id}/pay`, { method: "POST" }),
  cancelBooking: (id) => request(`/bookings/${id}/cancel`, { method: "POST" }),

  getNotifications: () => request("/notifications"),
  markAllNotificationsRead: () => request("/notifications/read-all", { method: "PUT" }),

  getPackageReviews: (packageId) => request(`/reviews/package/${packageId}`),
  submitReview: (payload) => request("/reviews", { method: "POST", body: JSON.stringify(payload) }),

  getGallery: () => request("/gallery"),

  admin: {
    getStats: () => request("/admin/stats"),
    getPackages: () => request("/admin/packages"),
    createPackage: (payload) => request("/admin/packages", { method: "POST", body: JSON.stringify(payload) }),
    updatePackage: (id, payload) => request(`/admin/packages/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
    deletePackage: (id) => request(`/admin/packages/${id}`, { method: "DELETE" }),

    getBookings: () => request("/admin/bookings"),
    updateBookingStatus: (id, status) => request(`/admin/bookings/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) }),
    updateTripStatus: (id, payload) => request(`/admin/bookings/${id}/trip-status`, { method: "PUT", body: JSON.stringify(payload) }),

    getUsers: () => request("/admin/users"),
    toggleUserDisabled: (id) => request(`/admin/users/${id}/toggle-disabled`, { method: "PUT" }),

    getReviews: () => request("/admin/reviews"),
    updateReviewStatus: (id, status) => request(`/admin/reviews/${id}`, { method: "PUT", body: JSON.stringify({ status }) }),

    getGallery: () => request("/admin/gallery"),
    addGalleryImage: (payload) => request("/admin/gallery", { method: "POST", body: JSON.stringify(payload) }),
    toggleGalleryPublished: (id) => request(`/admin/gallery/${id}/toggle-published`, { method: "PUT" }),
    deleteGalleryImage: (id) => request(`/admin/gallery/${id}`, { method: "DELETE" })
  }
};
