import axios from 'axios';

const BASE_URL = "http://localhost:5000/api";
export const API_BASE_URL = BASE_URL;
export const SERVER_BASE_URL = 'http://localhost:5000';
export const BACKEND = SERVER_BASE_URL;

// Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Enhanced request helper
async function request(path, options = {}) {
  try {
    const isFormData = options.body instanceof FormData;
    const config = {
      method: options.method || 'GET',
      url: `${BASE_URL}${path}`,
      headers: isFormData ? {} : { "Content-Type": "application/json" },
      ...options,
      data: options.body
    };
    
    const res = await axios(config);
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || "Request failed");
  }
}

// Auth
export const login = (payload) => request("/users/login", { method: "POST", body: payload });

// User (CRUD)
export const getUsers = () => request("/users");
export const createUser = (payload) => request("/users", { method: "POST", body: payload });
export const updateUser = (id, payload) => request(`/users/${id}`, { method: "PUT", body: payload });
export const deleteUser = (id) => request(`/users/${id}`, { method: "DELETE" });

// Destination (Create, Read)
export const getDestinations = () => request("/destinations");
export const createDestination = (payload) => request("/destinations", { method: "POST", body: payload });

// Hotel (Create, Read)
export const getHotels = () => request("/hotels");
export const createHotel = (payload) => request("/hotels", { method: "POST", body: payload });

// Transport (Create, Read)
export const getTransports = () => request("/transports");
export const createTransport = (payload) => request("/transports", { method: "POST", body: payload });
export const getTransportsByProvider = (providerId) => request(`/transports/provider/${providerId}`);

// Reviews (placeholder - add if backend supports)
export const createReview = (payload) => Promise.resolve({ message: "Reviews coming soon" });
export const getReviewsByDestination = (id) => Promise.resolve([]);
export const getReviewsByHotel = (id) => Promise.resolve([]);
export const getReviewsByTransport = (id) => Promise.resolve([]);

// Budget & Expenses
export const getBudgets = () => request("/budgets");
export const getBudgetsByUser = (userId) => request(`/budgets/user/${userId}`);
export const createBudget = (payload) => request("/budgets", { method: "POST", body: payload });
export const addExpense = (budgetId, payload) => request(`/budgets/${budgetId}/expenses`, { method: "POST", body: payload });
export const getExpenses = (budgetId) => request(`/budgets/${budgetId}/expenses`);

// Legacy hotels API for compatibility
export const hotelsAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/hotels', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/hotels/${id}`);
    return response.data;
  },
  create: async (hotelData) => {
    const response = await api.post('/hotels', hotelData);
    return response.data;
  },
  update: async (id, hotelData) => {
    const response = await api.put(`/hotels/${id}`, hotelData);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/hotels/${id}`);
    return response.data;
  },
  restore: async (id) => {
    const response = await api.post(`/hotels/${id}/restore`);
    return response.data;
  },
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('hotel_image', file);
    const response = await api.post('/hotels/upload-image', formData, {
      headers: { 'Content-Type': undefined },
    });
    return response.data;
  },
  getByLocation: async (location, limit = 20) => {
    const response = await api.get(`/hotels/location/${location}`, {
      params: { limit },
    });
    return response.data;
  },
  getStats: async () => {
    const response = await api.get('/hotels/stats/summary');
    return response.data;
  },
};

export default api;
