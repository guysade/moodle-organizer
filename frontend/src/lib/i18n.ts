export type Language = 'he' | 'en'

export const translations = {
  he: {
    // Navigation
    appName: 'Moodle Organizer',
    dashboard: 'דשבורד',
    assignments: 'מטלות',
    exams: 'מבחנים',
    courses: 'הקורסים שלי',
    schedule: 'מערכת שעות',
    notebooks: 'מחברות',
    materials: 'חומרי לימוד',

    // Actions
    sync: 'סנכרון',
    syncing: 'מסנכרן...',
    syncSuccess: 'הסנכרון הושלם בהצלחה',
    lastSync: 'סנכרון אחרון:',
    download: 'הורדה',

    // Dashboard
    whatsNew: 'מה חדש',
    newMaterials: 'חומרים חדשים',
    recentlyAdded: 'נוספו לאחרונה',

    // Assignments
    dueDate: 'תאריך הגשה',
    newBadge: 'חדש!',
    submitted: 'הוגש',
    notSubmitted: 'לא הוגש',
    allAssignments: 'כל המטלות',

    // Courses
    myCourses: 'הקורסים שלי',
    progress: 'התקדמות',
    completed: 'הושלם',

    // Schedule
    weeklySchedule: 'מערכת שעות שבועית',
    noClasses: 'אין שיעורים',
    days: {
      Sunday: 'ראשון',
      Monday: 'שני',
      Tuesday: 'שלישי',
      Wednesday: 'רביעי',
      Thursday: 'חמישי',
      Friday: 'שישי',
      Saturday: 'שבת'
    },

    // States
    loading: 'טוען...',
    noData: 'אין נתונים להצגה',
    clickSyncToStart: 'לחץ על כפתור הסנכרון להתחלה',
    error: 'שגיאה',

    // Other
    file: 'קובץ',
    files: 'קבצים',
    downloadAll: 'הורד הכל (ZIP)',
    openFile: 'פתח קובץ',
    filterByCourse: 'סנן לפי קורס',
    allCourses: 'כל הקורסים',
    noMaterials: 'לא נמצאו חומרים',
    location: 'מיקום',
    type: 'סוג',
    grades: 'ציונים',
    myGrades: 'הציונים שלי',
    grade: 'ציון',
    
    // Exams
    upcomingExams: 'מבחנים קרובים',
    allExams: 'כל המבחנים',
    moed: 'מועד',
    nextExam: 'הבחינה הבאה',
    daysLeft: 'ימים נותרו',
    today: 'היום',
    tomorrow: 'מחר',
    passed: 'עבר'
  },

  en: {
    // Navigation
    appName: 'Moodle Organizer',
    dashboard: 'Dashboard',
    assignments: 'Assignments',
    exams: 'Exams',
    courses: 'My Courses',
    schedule: 'Schedule',
    notebooks: 'Notebooks',
    materials: 'Course Materials',

    // Actions
    sync: 'Sync',
    syncing: 'Syncing...',
    syncSuccess: 'Sync completed successfully',
    lastSync: 'Last sync:',
    download: 'Download',

    // Dashboard
    whatsNew: "What's New",
    newMaterials: 'New Materials',
    recentlyAdded: 'Recently Added',

    // Assignments
    dueDate: 'Due Date',
    newBadge: 'New!',
    submitted: 'Submitted',
    notSubmitted: 'Not Submitted',
    allAssignments: 'All Assignments',

    // Courses
    myCourses: 'My Courses',
    progress: 'Progress',
    completed: 'Completed',

    // Schedule
    weeklySchedule: 'Weekly Schedule',
    noClasses: 'No Classes',
    days: {
      Sunday: 'Sunday',
      Monday: 'Monday',
      Tuesday: 'Tuesday',
      Wednesday: 'Wednesday',
      Thursday: 'Thursday',
      Friday: 'Friday',
      Saturday: 'Saturday'
    },

    // States
    loading: 'Loading...',
    noData: 'No data to display',
    clickSyncToStart: 'Click the sync button to get started',
    error: 'Error',

    // Other
    file: 'File',
    files: 'Files',
    downloadAll: 'Download All (ZIP)',
    openFile: 'Open File',
    filterByCourse: 'Filter by Course',
    allCourses: 'All Courses',
    noMaterials: 'No materials found',
    location: 'Location',
    type: 'Type',
    grades: 'Grades',
    myGrades: 'My Grades',
    grade: 'Grade',

    // Exams
    upcomingExams: 'Upcoming Exams',
    allExams: 'All Exams',
    moed: 'Moed',
    nextExam: 'Next Exam',
    daysLeft: 'Days left',
    today: 'Today',
    tomorrow: 'Tomorrow',
    passed: 'Passed'
  }
}

export type TranslationKey = keyof typeof translations.he
