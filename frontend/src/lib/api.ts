import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: API_URL,
})

export const getCourses = async () => {
  const { data } = await api.get('/api/courses/')
  return data
}

export const getAssignments = async () => {
  const { data } = await api.get('/api/assignments/')
  return data
}

export const getResources = async (courseId?: number) => {
  const { data } = await api.get('/api/resources/', {
    params: courseId ? { course_id: courseId } : {}
  })
  return data
}

export const getNewResources = async () => {
  const { data } = await api.get('/api/resources/new')
  return data
}

export const getSchedule = async () => {
  const { data } = await api.get('/api/schedule/')
  return data
}

export const triggerSync = async () => {
  const { data } = await api.post('/api/sync/')
  return data
}
