// Configuración de URLs de API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://crud-backend-jchh.onrender.com';

export const API_ENDPOINTS = {
  USERS: `${API_BASE_URL}/users`,
  HEALTH: `${API_BASE_URL}/healthz`,
  METRICS: `${API_BASE_URL}/metrics`
};
