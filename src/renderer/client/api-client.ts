import axios from 'axios'

export const client = axios.create({
  baseURL: import.meta.env.DEV
    ? 'http://localhost:3000'
    : 'https://valorant-discord-tools-server-production.up.railway.app',
  timeout: 5000,
})
