import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Hotels API
export const hotelsAPI = {
  // Get all hotels with filters
  getAll: async (params = {}) => {
    const response = await api.get('/hotels', { params });
    return response.data;
  },

  // Get hotel by ID
  getById: async (id) => {
    const response = await api.get(`/hotels/${id}`);
    return response.data;
  },

  // Create new hotel
  create: async (hotelData) => {
    const response = await api.post('/hotels', hotelData);
    return response.data;
  },

  // Update hotel
  update: async (id, hotelData) => {
    const response = await api.put(`/hotels/${id}`, hotelData);
    return response.data;
  },

  // Soft delete hotel
  delete: async (id) => {
    const response = await api.delete(`/hotels/${id}`);
    return response.data;
  },

  // Restore deleted hotel
  restore: async (id) => {
    const response = await api.post(`/hotels/${id}/restore`);
    return response.data;
  },

  // Get hotels by location
  getByLocation: async (location, limit = 20) => {
    const response = await api.get(`/hotels/location/${location}`, {
      params: { limit },
    });
    return response.data;
  },

  // Get hotel statistics
  getStats: async () => {
    const response = await api.get('/hotels/stats/summary');
    return response.data;
  },
};

export default api;
