export type Language = 'he' | 'en'

export const translations = {
  he: {
    // Navigation
    appName: 'Moodle Organizer',
    dashboard: 'דשבורד',
    assignments: 'מטלות',
    courses: 'הקורסים שלי',
    schedule: 'מערכת שעות',

    // Actions
    sync: 'סנכרון',
    syncing: 'מסנכרן...',
    download: 'הורדה',

    // Dashboard
    whatsNew: 'מה חדש',
    newMaterials: 'חומרים חדשים',
    recentlyAdded: 'נוספו לאחרונה',

    // Assignments
    dueDate: 'תאריך הגשה',
    newBadge: 'חדש!',

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
    location: 'מיקום',
    type: 'סוג'
  },

  en: {
    // Navigation
    appName: 'Moodle Organizer',
    dashboard: 'Dashboard',
    assignments: 'Assignments',
    courses: 'My Courses',
    schedule: 'Schedule',

    // Actions
    sync: 'Sync',
    syncing: 'Syncing...',
    download: 'Download',

    // Dashboard
    whatsNew: "What's New",
    newMaterials: 'New Materials',
    recentlyAdded: 'Recently Added',

    // Assignments
    dueDate: 'Due Date',
    newBadge: 'New!',

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
    location: 'Location',
    type: 'Type'
  }
}

export type TranslationKey = keyof typeof translations.he
