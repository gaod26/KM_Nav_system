import api from './api'

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'

// Get stored token
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY)
}

// Get stored user
export const getUser = () => {
  const userStr = localStorage.getItem(USER_KEY)
  return userStr ? JSON.parse(userStr) : null
}

// Check if user is logged in
export const isAuthenticated = () => {
  return !!getToken()
}

// Register a new user
export const register = async (username, password) => {
  try {
    const response = await api.post('/auth/register', { username, password })
    const { access_token, username: user } = response.data
    
    // Store token and user info
    localStorage.setItem(TOKEN_KEY, access_token)
    localStorage.setItem(USER_KEY, JSON.stringify({ username: user }))
    
    return { success: true, user: { username: user } }
  } catch (error) {
    const message = error.response?.data?.detail || error.message || 'Registration failed'
    return { success: false, error: message }
  }
}

// Login user
export const login = async (username, password) => {
  try {
    const response = await api.post('/auth/login', { username, password })
    const { access_token, username: user } = response.data
    
    // Store token and user info
    localStorage.setItem(TOKEN_KEY, access_token)
    localStorage.setItem(USER_KEY, JSON.stringify({ username: user }))
    
    return { success: true, user: { username: user } }
  } catch (error) {
    const message = error.response?.data?.detail || error.message || 'Login failed'
    return { success: false, error: message }
  }
}

// Logout user
export const logout = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

// Get navigation history
export const getHistory = async (limit = 10, offset = 0) => {
  try {
    const token = getToken()
    if (!token) {
      throw new Error('Not authenticated')
    }
    
    const response = await api.get('/history', {
      params: { limit, offset },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    
    return { success: true, history: response.data }
  } catch (error) {
    const message = error.response?.data?.detail || error.message || 'Failed to fetch history'
    return { success: false, error: message }
  }
}
