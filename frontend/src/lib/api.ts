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
  const response = await api.get('/api/schedule/')
  return response.data
}

export const getExams = async () => {
  const response = await api.get('/api/exams/')
  return response.data
}

export const downloadCourseZip = async (courseId: number, filename: string) => {
  const response = await api.get(`/api/resources/download-zip/${courseId}`, {
    responseType: 'blob'
  })
  
  // Create blob link to download
  const url = window.URL.createObjectURL(new Blob([response.data]))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  link.remove()
}

export const triggerSync = async () => {
  const { data } = await api.post('/api/sync/')
  return data
}
