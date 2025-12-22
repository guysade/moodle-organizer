import React from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import { useLanguage } from './lib/LanguageContext'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCourses, getAssignments, getNewResources, getResources, getSchedule, getExams, triggerSync } from './lib/api'
import Notebooks from './pages/Notebooks'
import CourseMaterials from './pages/CourseMaterials'

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppContent />
    </BrowserRouter>
  )
}

function AppContent() {
  const { language, setLanguage, t, dir } = useLanguage()
  const location = useLocation()
  const queryClient = useQueryClient()

  const toggleLanguage = () => {
    setLanguage(language === 'he' ? 'en' : 'he')
  }

  // Utility function to parse course names and extract localized version
  const getCourseName = (fullname: string, lang: 'he' | 'en') => {
    // Pattern: "0571311001 - סימולציה0571311001 - Simulation"
    // Extract course code pattern (numbers at start)
    const codeMatch = fullname.match(/^(\d+)/)
    if (!codeMatch) return fullname

    const courseCode = codeMatch[1]

    // Split by course code to get both language versions
    const parts = fullname.split(courseCode).filter(p => p.trim())

    if (parts.length >= 2) {
      // First part: " - סימולציה" (Hebrew)
      // Second part: " - Simulation" (English)
      const hebrewPart = parts[0].replace(/^[\s-]+/, '').trim()
      const englishPart = parts[1].replace(/^[\s-]+/, '').trim()

      return lang === 'he' ? hebrewPart : englishPart
    }

    // Fallback: remove course code from start
    return fullname.replace(/^\d+\s*-\s*/, '').trim()
  }

  const [showSyncSuccess, setShowSyncSuccess] = React.useState(false)
  const [lastSync, setLastSync] = React.useState<string | null>(() => {
    return localStorage.getItem('lastSync')
  })

  const syncMutation = useMutation({
    mutationFn: triggerSync,
    onSuccess: () => {
      // Refetch all data after sync
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['courses'] })
        queryClient.invalidateQueries({ queryKey: ['assignments'] })
        queryClient.invalidateQueries({ queryKey: ['resources'] })
        
        const now = new Date().toISOString()
        setLastSync(now)
        localStorage.setItem('lastSync', now)
        setShowSyncSuccess(true)
        setTimeout(() => setShowSyncSuccess(false), 3000)
      }, 2000)
    }
  })

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100" dir={dir}>
      {/* Sidebar */}
      <aside className="fixed start-0 top-0 h-screen w-72 bg-white shadow-xl border-e border-gray-100 z-10 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">{t.appName}</h1>
                <p className="text-xs text-gray-500">TAU Portal</p>
              </div>
            </div>
          </div>
          <button
            onClick={toggleLanguage}
            className="mt-4 w-full px-4 py-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 active:scale-95"
            title={language === 'he' ? 'Switch to English' : 'עברית'}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
            {language === 'he' ? 'English' : 'עברית'}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link
            to="/"
            className={`nav-link ${isActive('/') ? 'active' : ''} flex items-center gap-3`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            {t.dashboard}
          </Link>

          <Link
            to="/assignments"
            className={`nav-link ${isActive('/assignments') ? 'active' : ''} flex items-center gap-3`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            {t.assignments}
          </Link>

          <Link
            to="/exams"
            className={`nav-link ${isActive('/exams') ? 'active' : ''} flex items-center gap-3`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            {t.exams}
          </Link>

          <Link
            to="/courses"
            className={`nav-link ${isActive('/courses') ? 'active' : ''} flex items-center gap-3`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            {t.courses}
          </Link>

          <Link
            to="/materials"
            className={`nav-link ${isActive('/materials') ? 'active' : ''} flex items-center gap-3`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            {t.materials}
          </Link>

          <Link
            to="/notebooks"
            className={`nav-link ${isActive('/notebooks') ? 'active' : ''} flex items-center gap-3`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            {t.notebooks || 'Notebooks'}
          </Link>

          <Link
            to="/schedule"
            className={`nav-link ${isActive('/schedule') ? 'active' : ''} flex items-center gap-3`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {t.schedule}
          </Link>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={() => syncMutation.mutate()}
            disabled={syncMutation.isPending}
            className="w-full btn btn-primary flex items-center justify-center gap-2 shadow-lg mb-2"
          >
            <svg className={`w-5 h-5 ${syncMutation.isPending ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {syncMutation.isPending ? t.syncing : t.sync}
          </button>
          {lastSync && (
            <p className="text-xs text-gray-500 text-center">
              {t.lastSync} {new Date(lastSync).toLocaleTimeString(language === 'he' ? 'he-IL' : 'en-US', {
                hour: '2-digit',
                minute: '2-digit',
                day: 'numeric',
                month: 'numeric'
              })}
            </p>
          )}
        </div>
      </aside>

      {/* Sync Success Toast */}
      {showSyncSuccess && (
        <div className="fixed bottom-8 start-1/2 -translate-x-1/2 z-50 animate-slide-up">
          <div className="bg-gray-800 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3">
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm font-medium">{t.syncSuccess}</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="ms-72 p-8 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/assignments" element={<Assignments />} />
            <Route path="/exams" element={<Exams />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/materials" element={<CourseMaterials />} />
            <Route path="/notebooks" element={<Notebooks />} />
            <Route path="/schedule" element={<Schedule />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}

function Dashboard() {
  const { t, language } = useLanguage()
  const { data: exams } = useQuery({
    queryKey: ['exams'],
    queryFn: getExams
  })
  const { data: resources, isLoading: resourcesLoading, isError: resourcesError } = useQuery({
    queryKey: ['resources'],
    queryFn: getResources
  })
  const { data: courses, isLoading: coursesLoading, isError: coursesError } = useQuery({
    queryKey: ['courses'],
    queryFn: getCourses
  })
  const { data: assignments, isLoading: assignmentsLoading, isError: assignmentsError } = useQuery({
    queryKey: ['assignments'],
    queryFn: getAssignments
  })
  const { data: schedule, isLoading: scheduleLoading, isError: scheduleError } = useQuery({
    queryKey: ['schedule'],
    queryFn: getSchedule
  })

  // Find next exam
  const nextExam = React.useMemo(() => {
    if (!exams) return null
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    
    // Filter future exams and sort by date
    const futureExams = exams
      .filter((e: any) => new Date(e.date) >= now)
      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
      
    return futureExams[0] || null
  }, [exams])

  const getDaysLeft = (dateStr: string) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const examDate = new Date(dateStr)
    examDate.setHours(0, 0, 0, 0)
    
    const diffTime = examDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return { text: t.today, color: 'text-red-600' }
    if (diffDays === 1) return { text: t.tomorrow, color: 'text-orange-600' }
    return { text: `${diffDays} ${t.daysLeft}`, color: 'text-blue-600' }
  }

  // Track current time for live updates
  const [currentTime, setCurrentTime] = React.useState(new Date())

  // Update time every minute
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // Update every minute

    return () => clearInterval(timer)
  }, [])

  // Track which resources have been marked as completed
  const [completedResources, setCompletedResources] = React.useState<Set<number>>(() => {
    const saved = localStorage.getItem('completedResources')
    return saved ? new Set(JSON.parse(saved)) : new Set()
  })

  // Track which courses are hidden from dashboard
  const [hiddenCourses, setHiddenCourses] = React.useState<Set<number>>(() => {
    const saved = localStorage.getItem('hiddenCourses')
    return saved ? new Set(JSON.parse(saved)) : new Set()
  })

  // Show modal to add courses back
  const [showAddCourses, setShowAddCourses] = React.useState(false)

  // Undo functionality for marking resources as complete
  const [undoResource, setUndoResource] = React.useState<{id: number, name: string} | null>(null)
  const undoTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  // Track which assignments are hidden from dashboard
  const [hiddenAssignments, setHiddenAssignments] = React.useState<Set<number>>(() => {
    const saved = localStorage.getItem('hiddenAssignments')
    return saved ? new Set(JSON.parse(saved)) : new Set()
  })

  // Undo functionality for hiding assignments
  const [undoHiddenAssignment, setUndoHiddenAssignment] = React.useState<{id: number, name: string} | null>(null)
  const undoAssignmentTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  // Get pending assignments (not submitted and has due date)
  const pendingAssignments = React.useMemo(() => {
    if (!assignments) return []
    return assignments
      .filter((a: any) => !a.submitted && a.due_date && !hiddenAssignments.has(a.id))
  }, [assignments, hiddenAssignments])

  // Track visibility of grades section
  const [showGrades, setShowGrades] = React.useState(() => {
    const saved = localStorage.getItem('showGrades')
    return saved ? JSON.parse(saved) : true
  })

  const toggleGrades = () => {
    setShowGrades(prev => {
      const next = !prev
      localStorage.setItem('showGrades', JSON.stringify(next))
      return next
    })
  }

  // Get graded assignments
  const gradedAssignments = React.useMemo(() => {
    if (!assignments) return []
    return assignments.filter((a: any) => a.grade)
  }, [assignments])

  // Find current course from schedule
  const currentCourse = React.useMemo(() => {
    if (!schedule) return null

    const now = currentTime
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const currentDay = dayNames[now.getDay()]
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    const currentTimeInMinutes = currentHour * 60 + currentMinute

    // Find course that matches current day and time
    const course = schedule.find((item: any) => {
      if (item.day !== currentDay) return false

      const [startHour, startMinute] = item.start.split(':').map(Number)
      const [endHour, endMinute] = item.end.split(':').map(Number)
      const startTimeInMinutes = startHour * 60 + startMinute
      const endTimeInMinutes = endHour * 60 + endMinute

      return currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes < endTimeInMinutes
    })

    return course || null
  }, [schedule, currentTime])

  // Parse course name to get localized version
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

  // Group resources by course - MUST be before conditional returns
  const resourcesByCourse = React.useMemo(() => {
    if (!resources || !courses) return []

    const grouped = new Map<number, any[]>()

    // First, add all resources to their respective courses
    resources.forEach((resource: any) => {
      // Skip completed resources
      if (completedResources.has(resource.id)) return
      // Skip hidden courses
      if (hiddenCourses.has(resource.course_id)) return

      if (!grouped.has(resource.course_id)) {
        grouped.set(resource.course_id, [])
      }
      grouped.get(resource.course_id)!.push(resource)
    })

    // Sort by time_created within each course (newest first)
    grouped.forEach((resourceList) => {
      resourceList.sort((a, b) => {
        const timeA = a.time_created ? new Date(a.time_created).getTime() : 0
        const timeB = b.time_created ? new Date(b.time_created).getTime() : 0
        return timeB - timeA
      })
    })

    // Include ALL courses, even those without resources
    return courses
      .filter((course: any) => !hiddenCourses.has(course.id))
      .map((course: any) => ({
        course,
        resources: grouped.get(course.id) || []
      }))
  }, [resources, courses, completedResources, hiddenCourses])

  // Get list of all courses for hiding/showing
  const allCourses = React.useMemo(() => {
    if (!courses) return []
    return courses
  }, [courses])

  const toggleResourceComplete = (resourceId: number, resourceName?: string) => {
    setCompletedResources(prev => {
      const next = new Set(prev)
      const isCompleting = !next.has(resourceId)

      if (isCompleting) {
        next.add(resourceId)

        // Clear any existing timeout
        if (undoTimeoutRef.current) {
          clearTimeout(undoTimeoutRef.current)
        }

        // Show undo toast
        setUndoResource({ id: resourceId, name: resourceName || '' })

        // Auto-hide after 5 seconds
        undoTimeoutRef.current = setTimeout(() => {
          setUndoResource(null)
        }, 5000)
      } else {
        next.delete(resourceId)
      }

      localStorage.setItem('completedResources', JSON.stringify([...next]))
      return next
    })
  }

  const undoCompleteResource = () => {
    if (undoResource) {
      setCompletedResources(prev => {
        const next = new Set(prev)
        next.delete(undoResource.id)
        localStorage.setItem('completedResources', JSON.stringify([...next]))
        return next
      })

      // Clear timeout and hide toast
      if (undoTimeoutRef.current) {
        clearTimeout(undoTimeoutRef.current)
      }
      setUndoResource(null)
    }
  }

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (undoTimeoutRef.current) {
        clearTimeout(undoTimeoutRef.current)
      }
      if (undoAssignmentTimeoutRef.current) {
        clearTimeout(undoAssignmentTimeoutRef.current)
      }
    }
  }, [])

  const hideAssignment = (assignmentId: number, assignmentName: string) => {
    setHiddenAssignments(prev => {
      const next = new Set(prev)
      next.add(assignmentId)
      localStorage.setItem('hiddenAssignments', JSON.stringify([...next]))
      return next
    })

    // Clear any existing timeout
    if (undoAssignmentTimeoutRef.current) {
      clearTimeout(undoAssignmentTimeoutRef.current)
    }

    // Show undo toast
    setUndoHiddenAssignment({ id: assignmentId, name: assignmentName })

    // Auto-hide after 5 seconds
    undoAssignmentTimeoutRef.current = setTimeout(() => {
      setUndoHiddenAssignment(null)
    }, 5000)
  }

  const undoHideAssignment = () => {
    if (undoHiddenAssignment) {
      setHiddenAssignments(prev => {
        const next = new Set(prev)
        next.delete(undoHiddenAssignment.id)
        localStorage.setItem('hiddenAssignments', JSON.stringify([...next]))
        return next
      })

      // Clear timeout and hide toast
      if (undoAssignmentTimeoutRef.current) {
        clearTimeout(undoAssignmentTimeoutRef.current)
      }
      setUndoHiddenAssignment(null)
    }
  }

  const hideCourse = (courseId: number) => {
    setHiddenCourses(prev => {
      const next = new Set(prev)
      next.add(courseId)
      localStorage.setItem('hiddenCourses', JSON.stringify([...next]))
      return next
    })
  }

  const unhideCourse = (courseId: number) => {
    setHiddenCourses(prev => {
      const next = new Set(prev)
      next.delete(courseId)
      localStorage.setItem('hiddenCourses', JSON.stringify([...next]))
      return next
    })
  }

  if (resourcesLoading || coursesLoading || assignmentsLoading || scheduleLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner" />
      </div>
    )
  }

  if (resourcesError || coursesError || assignmentsError || scheduleError) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-2">{t.error}</p>
          <p className="text-gray-500 text-sm">{t.clickSyncToStart}</p>
        </div>
      </div>
    )
  }

  // Color palette for course headers
  const colors = [
    'from-blue-500 to-blue-600',
    'from-purple-500 to-purple-600',
    'from-green-500 to-green-600',
    'from-orange-500 to-orange-600',
    'from-pink-500 to-pink-600',
    'from-indigo-500 to-indigo-600',
    'from-teal-500 to-teal-600',
    'from-red-500 to-red-600',
  ]

  // File type icons
  const getFileIcon = (mimetype: string) => {
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

  const formatFileSize = (bytes: number) => {
    if (!bytes) return ''
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="animate-fade-in">
      {/* Current Course Widget */}
      {currentCourse && (
        <div className="mb-4 card p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  {language === 'he' ? 'כעת בלמידה' : 'Currently in Class'}
                </h3>
                <p className="text-xs text-gray-600">
                  {currentCourse.start} - {currentCourse.end}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-green-600">
                {language === 'he' ? 'פעיל כעת' : 'Live Now'}
              </span>
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <h4 className="text-xl font-bold text-gray-800 mb-2">
              {currentCourse.title}
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-gray-600">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div>
                  <p className="text-xs text-gray-500">{language === 'he' ? 'סוג' : 'Type'}</p>
                  <p className="text-sm font-semibold">{currentCourse.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <p className="text-xs text-gray-500">{language === 'he' ? 'מיקום' : 'Location'}</p>
                  <p className="text-sm font-semibold">{currentCourse.location}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Next Exam Widget */}
      {nextExam && (
        <div className="mb-4 card p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  {t.nextExam}
                </h3>
                <p className="text-xs text-gray-600">
                  {new Date(nextExam.date).toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long'
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-bold ${getDaysLeft(nextExam.date).color}`}>
                {getDaysLeft(nextExam.date).text}
              </span>
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <h4 className="text-xl font-bold text-gray-800 mb-2 leading-tight">
              {nextExam.course_name}
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-gray-600">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-xs text-gray-500">{language === 'he' ? 'שעה' : 'Time'}</p>
                  <p className="text-sm font-semibold">
                    {new Date(nextExam.date).toLocaleTimeString(language === 'he' ? 'he-IL' : 'en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
              {nextExam.location && (
                <div className="flex items-center gap-2 text-gray-600">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <p className="text-xs text-gray-500">{t.location}</p>
                    <p className="text-sm font-semibold">{nextExam.location}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Grades Widget */}
      {gradedAssignments.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800">{t.myGrades}</h3>
              <span className="text-xs font-semibold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                {gradedAssignments.length}
              </span>
            </div>
            <button
              onClick={toggleGrades}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
            >
              <svg className={`w-5 h-5 transform transition-transform duration-200 ${showGrades ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {showGrades && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-slide-down">
              {gradedAssignments.map((assignment: any) => (
                <div key={assignment.id} className="bg-white p-4 rounded-xl shadow-sm border border-purple-100 hover:shadow-md transition-all duration-200 group relative overflow-hidden">
                  <div className="absolute top-0 start-0 w-1 h-full bg-gradient-to-b from-purple-500 to-indigo-600"></div>
                  
                  <div className="flex justify-between items-start gap-3 mb-2">
                    <div>
                       <h4 className="font-bold text-gray-800 text-sm leading-tight line-clamp-2 mb-1">
                         {assignment.name}
                       </h4>
                       <p className="text-xs text-gray-500 line-clamp-1">
                         {getCourseName(assignment.course_name)}
                       </p>
                    </div>
                    <div className="bg-purple-50 px-2 py-1 rounded-lg border border-purple-100 text-center min-w-[3rem]">
                       <span className="block text-sm font-bold text-purple-700 leading-none" title={assignment.grade}>
                         {assignment.grade.split('/')[0].trim()} 
                       </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-gray-50">
                    <span className="text-gray-400">
                       {new Date(assignment.due_date).toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US', {
                          month: 'short',
                          day: 'numeric'
                       })}
                    </span>
                    <a
                      href={assignment.cmid ? `https://moodle.tau.ac.il/mod/assign/view.php?id=${assignment.cmid}` : '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-800 font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    >
                      {t.submitted}
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Grid Layout for Assignments and Materials */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
        {/* Pending Assignments Widget */}
        {pendingAssignments.length > 0 && (
          <div className="card p-5 bg-gradient-to-br from-orange-50 to-red-50 border-l-4 border-orange-500 flex flex-col" style={{height: currentCourse ? 'calc(100vh - 13rem)' : 'calc(100vh - 8rem)'}}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">
                    {language === 'he' ? 'מטלות שמחכות להגשה' : 'Pending Assignments'}
                  </h3>
                  <p className="text-xs text-gray-600">
                    {pendingAssignments.length} {language === 'he' ? 'ממתינות' : 'pending'}
                  </p>
                </div>
              </div>
              <Link
                to="/assignments"
                className="px-3 py-1.5 text-xs font-medium text-orange-600 hover:text-orange-700 hover:bg-orange-100 rounded-lg transition-colors duration-200 flex items-center gap-1"
              >
                {language === 'he' ? 'לכל המטלות' : 'View All'}
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <div className="overflow-y-auto space-y-2 flex-1">
              {pendingAssignments.map((assignment: any) => (
                <div key={assignment.id} className="bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 group">
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-800 text-sm mb-1 leading-tight">
                        {assignment.name}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                        <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <span className="truncate">
                          {getCourseName(assignment.course_name)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-xs text-orange-600 font-medium">
                          <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(assignment.due_date).toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        {assignment.submitted ? (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-semibold whitespace-nowrap">
                            ✓ {t.submitted}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-semibold whitespace-nowrap">
                            {t.notSubmitted}
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Action Buttons */}
                    <div className="flex flex-col gap-1 flex-shrink-0">
                      {/* Open Assignment Button */}
                      <a
                        href={assignment.cmid ? `https://moodle.tau.ac.il/mod/assign/view.php?id=${assignment.cmid}` : '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`p-1.5 rounded-lg transition-colors duration-200 ${assignment.cmid ? 'text-blue-600 hover:bg-blue-50' : 'text-gray-400 cursor-not-allowed'}`}
                        title={language === 'he' ? 'פתח מטלה' : 'Open assignment'}
                        onClick={(e) => !assignment.cmid && e.preventDefault()}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                      {/* Remove Button */}
                      <button
                        onClick={() => hideAssignment(assignment.id, assignment.name)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
                        title={language === 'he' ? 'הסר מהדשבורד' : 'Remove from dashboard'}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New Materials Widget */}
        <div className={`card p-5 flex flex-col ${pendingAssignments.length === 0 ? 'lg:col-span-2' : ''}`} style={{height: currentCourse ? 'calc(100vh - 13rem)' : 'calc(100vh - 8rem)'}}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-lg font-bold text-gray-800">{t.whatsNew}</h3>
              <p className="text-xs text-gray-600">
                {resourcesByCourse.length > 0
                  ? `${resourcesByCourse.reduce((sum, item) => sum + item.resources.length, 0)} ${language === 'he' ? 'חומרים' : 'materials'}`
                  : t.recentlyAdded}
              </p>
            </div>
            {hiddenCourses.size > 0 && (
              <button
                onClick={() => setShowAddCourses(!showAddCourses)}
                className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {language === 'he' ? `${hiddenCourses.size} מוסתרים` : `${hiddenCourses.size} hidden`}
              </button>
            )}
          </div>

          {/* Hidden courses modal */}
          {showAddCourses && (
            <div className="mb-3 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-gray-800">
                  {language === 'he' ? 'קורסים מוסתרים' : 'Hidden Courses'}
                </h4>
                <button
                  onClick={() => setShowAddCourses(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-2">
                {allCourses
                  .filter((c: any) => hiddenCourses.has(c.id))
                  .map((course: any) => (
                    <div key={course.id} className="flex items-center justify-between p-2 bg-white rounded-lg">
                      <span className="text-sm font-medium text-gray-800">{getCourseName(course.fullname)}</span>
                      <button
                        onClick={() => unhideCourse(course.id)}
                        className="px-2 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                      >
                        {language === 'he' ? 'הצג' : 'Show'}
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {resourcesByCourse.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="text-sm font-semibold text-gray-800 mb-1">
                  {language === 'he' ? 'כל החומרים הושלמו!' : 'All materials completed!'}
                </h4>
                <p className="text-xs text-gray-500">
                  {language === 'he' ? 'אין חומרים שממתינים' : 'No pending materials'}
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-y-auto flex-1 space-y-3">
          {resourcesByCourse.map((item, index) => {
            const colorClass = colors[index % colors.length]

            return (
              <div key={item.course.id} className="bg-gray-50 rounded-lg overflow-hidden">
                {/* Course Header */}
                <div className={`px-4 py-2.5 bg-gradient-to-r ${colorClass} relative flex items-center justify-between`}>
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="w-7 h-7 bg-white bg-opacity-20 rounded-lg flex items-center justify-center backdrop-blur-sm flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white text-sm leading-tight truncate">
                        {getCourseName(item.course.fullname)}
                      </h3>
                      <p className="text-white text-opacity-90 text-xs truncate">
                        {item.resources.length} {language === 'he' ? 'חומרים' : 'items'}
                      </p>
                    </div>
                  </div>
                  {item.course.notebook_url && (
                    <a
                      href={item.course.notebook_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors duration-200 flex-shrink-0 me-1"
                      title={language === 'he' ? 'פתח מחברת' : 'Open Notebook'}
                    >
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </a>
                  )}
                  <button
                    onClick={() => hideCourse(item.course.id)}
                    className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors duration-200 flex-shrink-0"
                    title={language === 'he' ? 'הסתר' : 'Hide'}
                  >
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Materials List */}
                <div className="p-3 space-y-1.5">
                  {item.resources.length === 0 ? (
                    <div className="bg-white p-3 rounded-lg text-center text-gray-500 text-sm">
                      <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {language === 'he' ? 'כל החומרים הושלמו' : 'All materials completed'}
                    </div>
                  ) : (
                    item.resources.map((resource: any) => (
                      <div
                        key={resource.id}
                        className="bg-white p-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 flex items-center gap-2"
                      >
                        {/* Dismiss Button */}
                        <button
                          onClick={() => toggleResourceComplete(resource.id, resource.filename)}
                          className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200 flex-shrink-0"
                          title={language === 'he' ? 'סמן כהושלם' : 'Mark as done'}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>

                        {/* File Icon */}
                        <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <div className="scale-75">
                            {getFileIcon(resource.mimetype)}
                          </div>
                        </div>

                        {/* File Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-800 text-xs mb-0.5 truncate">
                            {resource.filename}
                          </h4>
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            {resource.filesize && (
                              <span>{formatFileSize(resource.filesize)}</span>
                            )}
                            {resource.time_created && resource.filesize && (
                              <span>•</span>
                            )}
                            {resource.time_created && (
                              <span>
                                {new Date(resource.time_created).toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US', {
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-0.5">
                          {/* Open Button */}
                          <a
                            href={resource.download_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-shrink-0 p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                            title={language === 'he' ? 'פתח' : 'Open'}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                          {/* Download Button */}
                          <a
                            href={resource.download_url}
                            download={resource.filename}
                            className="flex-shrink-0 p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                            title={t.download}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          </a>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )
          })}
            </div>
          )}
        </div>
      </div>

      {/* Undo Toast for Resources */}
      {undoResource && (
        <div className="fixed bottom-8 start-1/2 -translate-x-1/2 z-50 animate-slide-up">
          <div className="bg-gray-800 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 max-w-md">
            <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm flex-1">
              {language === 'he' ? 'הקובץ סומן כהושלם' : 'Marked as completed'}
            </span>
            <button
              onClick={undoCompleteResource}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium transition-colors duration-200"
            >
              {language === 'he' ? 'בטל' : 'Undo'}
            </button>
            <button
              onClick={() => setUndoResource(null)}
              className="text-gray-400 hover:text-white transition-colors duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Undo Toast for Assignments */}
      {undoHiddenAssignment && (
        <div className="fixed bottom-8 start-1/2 -translate-x-1/2 z-50 animate-slide-up">
          <div className="bg-gray-800 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 max-w-md">
            <svg className="w-5 h-5 text-orange-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm flex-1">
              {language === 'he' ? 'המטלה הוסרה מהדשבורד' : 'Assignment removed from dashboard'}
            </span>
            <button
              onClick={undoHideAssignment}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium transition-colors duration-200"
            >
              {language === 'he' ? 'בטל' : 'Undo'}
            </button>
            <button
              onClick={() => setUndoHiddenAssignment(null)}
              className="text-gray-400 hover:text-white transition-colors duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function Assignments() {
  const { t, language } = useLanguage()
  const { data: assignments, isLoading: assignmentsLoading, isError: assignmentsError } = useQuery({
    queryKey: ['assignments'],
    queryFn: getAssignments
  })

  // Parse course name to get localized version
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

  if (assignmentsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner" />
      </div>
    )
  }

  if (assignmentsError) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-2">{t.error}</p>
          <p className="text-gray-500 text-sm">{t.clickSyncToStart}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">{t.allAssignments}</h2>
        <p className="text-gray-600">
          {assignments && assignments.length > 0
            ? `${assignments.length} ${language === 'he' ? 'מטלות' : 'assignments'}`
            : language === 'he' ? 'מטלות ותאריכי הגשה קרובים' : 'Upcoming deadlines and tasks'}
        </p>
      </div>

      {!assignments || assignments.length === 0 ? (
        <div className="card p-8">
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{t.noData}</h3>
            <p className="text-gray-500">{t.clickSyncToStart}</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {assignments.map((assignment: any) => (
            <div
              key={assignment.id}
              className="card p-5 hover:shadow-lg transition-shadow duration-200"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Assignment Name */}
                  <h3 className="font-bold text-gray-800 text-lg mb-2 leading-tight">
                    {assignment.name}
                  </h3>

                  {/* Course Name */}
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span className="truncate">
                      {getCourseName(assignment.course_name)}
                    </span>
                  </div>

                  {/* Due Date */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>
                      {t.dueDate}: {new Date(assignment.due_date).toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>

                {/* Status Badge and Action Button */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {assignment.submitted ? (
                    <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-semibold whitespace-nowrap">
                      ✓ {t.submitted}
                    </span>
                  ) : (
                    <span className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-semibold whitespace-nowrap">
                      {t.notSubmitted}
                    </span>
                  )}
                  {/* Open Assignment Button */}
                  <a
                    href={assignment.cmid ? `https://moodle.tau.ac.il/mod/assign/view.php?id=${assignment.cmid}` : '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-2 rounded-lg transition-colors duration-200 ${assignment.cmid ? 'text-blue-600 hover:bg-blue-50' : 'text-gray-400 cursor-not-allowed'}`}
                    title={language === 'he' ? 'פתח מטלה' : 'Open assignment'}
                    onClick={(e) => !assignment.cmid && e.preventDefault()}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Courses() {
  const { t, language } = useLanguage()
  const { data: courses, isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: getCourses
  })

  // Parse course name to get localized version
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">{t.myCourses}</h2>
        <p className="text-gray-600">Track your course progress</p>
      </div>

      {!courses || courses.length === 0 ? (
        <div className="card p-8">
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{t.noData}</h3>
            <p className="text-gray-500">{t.clickSyncToStart}</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map((course: any) => (
            <div key={course.id} className="card p-6">
              <h3 className="font-bold text-lg text-gray-800 mb-2">{getCourseName(course.fullname)}</h3>
              <p className="text-sm text-gray-600 mb-4">{course.shortname}</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t.progress}</span>
                  <span className="font-semibold text-gray-800">{course.progress}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${course.progress}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Exams() {
  const { t, language } = useLanguage()
  const { data: exams, isLoading, isError } = useQuery({
    queryKey: ['exams'],
    queryFn: getExams
  })

  // Group exams by Moed (A, B)
  const groupedExams = React.useMemo(() => {
    if (!exams) return { moedA: [], moedB: [] }
    
    const moedA: any[] = []
    const moedB: any[] = []
    
    exams.forEach((exam: any) => {
      if (exam.description && exam.description.includes('מועד ב')) {
        moedB.push(exam)
      } else {
        moedA.push(exam)
      }
    })

    // Sort by date
    const sortByDate = (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()
    moedA.sort(sortByDate)
    moedB.sort(sortByDate)

    return { moedA, moedB }
  }, [exams])

  const getDaysLeft = (dateStr: string) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const examDate = new Date(dateStr)
    examDate.setHours(0, 0, 0, 0)
    
    const diffTime = examDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return { text: t.passed, color: 'text-gray-400 bg-gray-50' }
    if (diffDays === 0) return { text: t.today, color: 'text-red-700 bg-red-100' }
    if (diffDays === 1) return { text: t.tomorrow, color: 'text-orange-700 bg-orange-100' }
    return { text: `${diffDays} ${t.daysLeft}`, color: 'text-blue-700 bg-blue-100' }
  }

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

  const renderExamList = (examList: any[], title: string) => (
    <div className="mb-8">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
        {title}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {examList.map((exam: any) => {
          const daysLeft = getDaysLeft(exam.date)
          return (
            <div key={exam.id} className="card p-4 hover:shadow-md transition-shadow duration-200 border-t-4 border-blue-500">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-lg text-gray-800 leading-tight flex-1">
                  {exam.course_name}
                </h4>
                <span className={`text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap ms-2 ${daysLeft.color}`}>
                  {daysLeft.text}
                </span>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="font-medium">
                    {new Date(exam.date).toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>
                    {new Date(exam.date).toLocaleTimeString(language === 'he' ? 'he-IL' : 'en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>

                {exam.location && (
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{exam.location}</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">{t.upcomingExams}</h2>
        <p className="text-gray-600">
          {language === 'he' ? 'לוח מבחנים - סמסטר א\' תשפ"ו' : 'Exam Schedule - Semester A 2026'}
        </p>
      </div>

      {!exams || exams.length === 0 ? (
        <div className="card p-8">
          <div className="empty-state">
             <div className="empty-state-icon">
               <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
               </svg>
             </div>
             <h3 className="text-lg font-semibold text-gray-800 mb-2">{t.noData}</h3>
          </div>
        </div>
      ) : (
        <>
          {groupedExams.moedA.length > 0 && renderExamList(groupedExams.moedA, language === 'he' ? 'מועד א\'' : 'Moed A')}
          {groupedExams.moedB.length > 0 && renderExamList(groupedExams.moedB, language === 'he' ? 'מועד ב\'' : 'Moed B')}
        </>
      )}
    </div>
  )
}

function Schedule() {
  const { t, language } = useLanguage()
  const { data: schedule, isLoading } = useQuery({
    queryKey: ['schedule'],
    queryFn: getSchedule
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner" />
      </div>
    )
  }

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">{t.weeklySchedule}</h2>
        <p className="text-gray-600">
          {language === 'he' ? 'מערכת השעות השבועית שלך' : 'Your weekly class schedule'}
        </p>
      </div>

      {!schedule || schedule.length === 0 ? (
        <div className="card p-8">
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{t.noData}</h3>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {days.map(day => {
            const dayClasses = schedule.filter((item: any) => item.day === day)
            const hasClasses = dayClasses.length > 0

            return (
              <div key={day} className="card p-4">
                <h3 className="font-bold text-center mb-4 text-gray-800 pb-3 border-b border-gray-200">
                  {t.days[day]}
                </h3>
                <div className="space-y-2">
                  {hasClasses ? (
                    dayClasses.map((item: any, idx: number) => (
                      <div key={idx} className="p-3 bg-blue-50 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors duration-200">
                        <p className="font-semibold text-sm text-gray-800 mb-1 leading-tight">{item.title}</p>
                        <p className="text-xs text-gray-600 mb-1">
                          <svg className="w-3 h-3 inline me-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {item.start} - {item.end}
                        </p>
                        <p className="text-xs text-gray-500">
                          <svg className="w-3 h-3 inline me-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {item.location}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                      <svg className="w-12 h-12 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <p className="text-sm text-center">{t.noClasses}</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default App
