import axios from 'axios';

export const API_BASE_URL = 'http://localhost:5001/api';
export const SERVER_BASE_URL = 'http://localhost:5001';

// Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const hotelsAPI = {
  // get all hotels with filters
  getAll: async (params = {}) => {
    const response = await api.get('/hotels', { params });
    return response.data;
  },

  // get by id
  getById: async (id) => {
    const response = await api.get(`/hotels/${id}`);
    return response.data;
  },

  // create
  create: async (hotelData) => {
    const response = await api.post('/hotels', hotelData);
    return response.data;
  },

  // update
  update: async (id, hotelData) => {
    const response = await api.put(`/hotels/${id}`, hotelData);
    return response.data;
  },

  // soft delete
  delete: async (id) => {
    const response = await api.delete(`/hotels/${id}`);
    return response.data;
  },

  // restore
  restore: async (id) => {
    const response = await api.post(`/hotels/${id}/restore`);
    return response.data;
  },

  // Upload hotel image — Content-Type: undefined lets axios set multipart boundary
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('hotel_image', file);
    const response = await api.post('/hotels/upload-image', formData, {
      headers: { 'Content-Type': undefined },
    });
    return response.data;
  },

  // get by location
  getByLocation: async (location, limit = 20) => {
    const response = await api.get(`/hotels/location/${location}`, {
      params: { limit },
    });
    return response.data;
  },

  // stats
  getStats: async () => {
    const response = await api.get('/hotels/stats/summary');
    return response.data;
  },
};

export default api;
