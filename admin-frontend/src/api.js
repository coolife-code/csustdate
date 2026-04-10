import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

api.interceptors.request.use((config) => {
  const adminKey = localStorage.getItem('admin_key')
  if (adminKey) {
    config.headers['x-admin-key'] = adminKey
  }
  return config
})

api.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error.response?.data || error)
)

export default api
