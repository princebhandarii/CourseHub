import axios from 'axios';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}`,
  timeout: 30000,
});

// ── Request interceptor: attach token ─────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: handle 401 ─────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');

      // Redirect only if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// ─── Course service helpers ────────────────────────────────────────────────────
export const courseService = {
  getAll:        (params)        => api.get('/courses', { params }),
  getOne:        (id)            => api.get(`/courses/${id}`),
  getAdmin:      (params)        => api.get('/courses/admin/all', { params }),
  create:        (data)          => api.post('/courses', data),
  update:        (id, d)         => api.put(`/courses/${id}`, d),
  delete:        (id)            => api.delete(`/courses/${id}`),
  togglePublish: (id)            => api.patch(`/courses/${id}/publish`),
  addSection:    (id, d)         => api.post(`/courses/${id}/sections`, d),
  updateSection: (id, sid, d)    => api.put(`/courses/${id}/sections/${sid}`, d),
  deleteSection: (id, sid)       => api.delete(`/courses/${id}/sections/${sid}`),
  addVideo:      (id, sid, d)    => api.post(`/courses/${id}/sections/${sid}/videos`, d),
  deleteVideo:   (id, sid, vid)  => api.delete(`/courses/${id}/sections/${sid}/videos/${vid}`),
  getCategories: ()              => api.get('/courses/categories'),
};

export const enrollmentService = {
  enroll:        (courseId) => api.post(`/enrollments/${courseId}`),
  getMyEnrolled: ()         => api.get('/enrollments/my'),
  check:         (courseId) => api.get(`/enrollments/check/${courseId}`),
};

export const progressService = {
  update:      (data) => api.put('/progress', data),
  getCourse:   (id)   => api.get(`/progress/${id}`),
  getContinue: ()     => api.get('/progress/continue'),
};

export const reviewService = {
  add:  (courseId, data) => api.post(`/reviews/${courseId}`, data),
  list: (courseId)       => api.get(`/reviews/${courseId}`),
};

export const wishlistService = {
  get:    ()         => api.get('/wishlist'),
  toggle: (courseId) => api.post(`/wishlist/${courseId}`),
};

export const adminService = {
  dashboard:   ()         => api.get('/admin/dashboard'),
  analytics:   ()         => api.get('/admin/analytics'),
  getUsers:    (params)   => api.get('/admin/users', { params }),
  createUser:  (data)     => api.post('/admin/users', data),
  toggleBlock: (id)       => api.patch(`/admin/users/${id}/block`),
  deleteUser:  (id)       => api.delete(`/admin/users/${id}`),
  getStudents: (courseId) => api.get(`/admin/courses/${courseId}/students`),
};

export const userService = {
  getProfile:     ()     => api.get('/users/profile'),
  updateProfile:  (data) => api.put('/users/profile', data),
  changePassword: (data) => api.put('/users/change-password', data),
};

export const paymentService = {
  createOrder: (courseId) => api.post(`/payment/order/${courseId}`),
  verify:      (data)     => api.post('/payment/verify', data),
};
