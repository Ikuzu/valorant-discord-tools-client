import axios from 'axios'

export const client = axios.create({
  baseURL: import.meta.env.API_BASE_URL,
  timeout: 5000,
})
