import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { getCourses } from '../lib/api'
import { useLanguage } from '../lib/LanguageContext'

export default function Notebooks() {
  const { t, language } = useLanguage()
  const { data: courses, isLoading, isError } = useQuery({
    queryKey: ['courses'],
    queryFn: getCourses
  })

  // Parse course name to get localized version (copied logic from App.tsx)
  const getCourseName = (fullname: string) => {
    const codeMatch = fullname.match(/^(\d+)/)
    if (!codeMatch) return fullname

    const courseCode = codeMatch[1]
    const parts = fullname.split(courseCode).filter(p => p.trim())

    if (parts.length >= 2) {
      const hebrewPart = parts[0].replace(/^[\s-]+/, '').trim()
      const englishPart = parts[1].replace(/^[\s-]+/, '').trim()
      return language === 'he' ? hebrewPart : englishPart
    }

    return fullname.replace(/^\d+\s*-\s*/, '').trim()
  }

  // Filter courses that have a notebook_url
  const notebookCourses = React.useMemo(() => {
    if (!courses) return []
    return courses.filter((c: any) => c.notebook_url)
  }, [courses])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-2">{t.error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">{t.notebooks || 'Notebooks'}</h2>
        <p className="text-gray-600">
          {language === 'he' ? 'מחברות NotebookLM לקורסים שלך' : 'NotebookLM notebooks for your courses'}
        </p>
      </div>

      {!notebookCourses || notebookCourses.length === 0 ? (
        <div className="card p-8">
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{t.noData}</h3>
            <p className="text-gray-500">
              {language === 'he' ? 'לא נמצאו מחברות לקורסים שלך' : 'No notebooks found for your courses'}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notebookCourses.map((course: any) => (
            <div key={course.id} className="card group hover:shadow-lg transition-all duration-300 border-t-4 border-blue-500 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-600 transition-colors duration-300">
                    <svg className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                </div>
                
                <h3 className="font-bold text-xl text-gray-800 mb-2 leading-tight min-h-[3.5rem]">
                  {getCourseName(course.fullname)}
                </h3>
                
                <p className="text-sm text-gray-500 mb-6">
                  {course.shortname}
                </p>

                <a 
                  href={course.notebook_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full btn btn-primary flex items-center justify-center gap-2 group-hover:scale-[1.02] transition-transform duration-200"
                >
                  <span>{language === 'he' ? 'פתח מחברת' : 'Open Notebook'}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
