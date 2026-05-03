import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60s — tolerates Render free-tier cold starts (~30-60s spin-up)
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to add JWT token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

// Response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Please check your connection.')
    }
    
    if (error.response) {
      // Server responded with error status
      const status = error.response.status
      const detail = error.response.data?.detail
      
      if (status === 401) {
        // Unauthorized - token expired or invalid
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
        throw new Error(detail || 'Session expired. Please login again.')
      } else if (status === 404) {
        throw new Error(detail || 'Route not found')
      } else if (status === 400) {
        throw new Error(detail || 'Invalid request')
      } else if (status === 422) {
        throw new Error(detail || 'Request body is malformed')
      } else if (status >= 500) {
        throw new Error('Server error. Please try again later.')
      }
    } else if (error.request) {
      // Request made but no response
      throw new Error('Unable to connect to server. Please ensure backend is running on port 8000.')
    }
    
    throw error
  }
)

export default api
