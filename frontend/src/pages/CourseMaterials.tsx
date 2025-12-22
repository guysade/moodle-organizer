import React, { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getCourses, getResources, downloadCourseZip } from '../lib/api'
import { useLanguage } from '../lib/LanguageContext'

// Helper for file icons
const FileIcon = ({ mimetype }: { mimetype: string }) => {
  if (mimetype?.includes('pdf')) {
    return (
      <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    )
  } else if (mimetype?.includes('image')) {
    return (
      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )
  } else if (mimetype?.includes('video')) {
    return (
      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    )
  } else if (mimetype?.includes('zip') || mimetype?.includes('archive')) {
    return (
      <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
      </svg>
    )
  }
  return (
    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  )
}

export default function CourseMaterials() {
  const { t, language } = useLanguage()
  const [selectedCourseId, setSelectedCourseId] = useState<number | 'all'>('all')
  const [downloadingZip, setDownloadingZip] = useState<number | null>(null)

  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: getCourses
  })

  const { data: resources, isLoading: resourcesLoading } = useQuery({
    queryKey: ['resources'],
    queryFn: () => getResources() // Fetch all resources
  })

  // Parse course name
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

  // Group resources by course and then by section
  const groupedResources = useMemo(() => {
    if (!resources || !courses) return {}

    const grouped: Record<number, Record<string, any[]>> = {}

    resources.forEach((resource: any) => {
      const courseId = resource.course_id
      const section = resource.section || (language === 'he' ? 'כללי' : 'General')
      
      if (!grouped[courseId]) {
        grouped[courseId] = {}
      }
      if (!grouped[courseId][section]) {
        grouped[courseId][section] = []
      }
      grouped[courseId][section].push(resource)
    })

    return grouped
  }, [resources, courses, language])

  const handleDownloadZip = async (courseId: number, courseName: string) => {
    try {
      setDownloadingZip(courseId)
      await downloadCourseZip(courseId, `${courseName}.zip`)
    } catch (error) {
      console.error('Failed to download zip', error)
      alert(t.error)
    } finally {
      setDownloadingZip(null)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (!bytes) return ''
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  if (coursesLoading || resourcesLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner" />
      </div>
    )
  }

  const filteredCourses = selectedCourseId === 'all' 
    ? courses 
    : courses?.filter((c: any) => c.moodle_id === selectedCourseId)

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">{t.materials}</h2>
          <p className="text-gray-600">
            {language === 'he' ? 'כל הקבצים והחומרים מהקורסים שלך' : 'All files and materials from your courses'}
          </p>
        </div>

        {/* Course Filter */}
        <div className="min-w-[200px]">
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="w-full p-2.5 bg-white border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
          >
            <option value="all">{t.allCourses}</option>
            {courses?.map((course: any) => (
              <option key={course.id} value={course.moodle_id}>
                {getCourseName(course.fullname)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!filteredCourses || filteredCourses.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-gray-500">{t.noMaterials}</p>
        </div>
      ) : (
        <div className="space-y-8">
          {filteredCourses.map((course: any) => {
            const courseResources = groupedResources[course.moodle_id]
            const hasResources = courseResources && Object.keys(courseResources).length > 0
            
            if (!hasResources && selectedCourseId !== 'all') {
               return (
                 <div key={course.id} className="card p-8 text-center">
                   <h3 className="text-xl font-bold text-gray-800 mb-2">{getCourseName(course.fullname)}</h3>
                   <p className="text-gray-500">{t.noMaterials}</p>
                 </div>
               )
            }
            
            if (!hasResources) return null

            return (
              <div key={course.id} className="card overflow-hidden border-t-4 border-blue-500">
                {/* Course Header */}
                <div className="p-6 bg-gray-50 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      {getCourseName(course.fullname)}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {course.shortname}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDownloadZip(course.moodle_id, getCourseName(course.fullname))}
                    disabled={downloadingZip === course.moodle_id}
                    className="btn btn-primary flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    {downloadingZip === course.moodle_id ? (
                      <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    )}
                    {t.downloadAll}
                  </button>
                </div>

                {/* Sections and Files */}
                <div className="p-6 space-y-6">
                  {Object.entries(courseResources).map(([sectionName, files]) => (
                    <div key={sectionName}>
                      <h4 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-gray-300 rounded-full"></span>
                        {sectionName}
                      </h4>
                      <div className="grid grid-cols-1 gap-3">
                        {files.map((file: any) => (
                          <div 
                            key={file.id} 
                            className="flex items-center gap-4 p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all duration-200 group"
                          >
                            <div className="flex-shrink-0">
                              <FileIcon mimetype={file.mimetype} />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <h5 className="font-medium text-gray-800 truncate" title={file.filename}>
                                {file.filename}
                              </h5>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span>{formatFileSize(file.filesize)}</span>
                                <span>•</span>
                                <span>
                                  {new Date(file.time_created).toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US')}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {/* Open Button */}
                              <a
                                href={file.download_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-white rounded-lg transition-colors duration-200"
                                title={t.openFile}
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </a>
                              
                              {/* Download Button */}
                              <a
                                href={file.download_url}
                                download={file.filename}
                                className="p-2 text-blue-600 hover:bg-white rounded-lg transition-colors duration-200"
                                title={t.download}
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
