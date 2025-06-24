// utils/calendarExport.js

/**
 * Converts assignments to iCalendar (.ics) format for Google Calendar import
 * @param {Object} project - The project object
 * @param {Array} assignments - Array of assignment objects
 * @param {String} filterCategory - Optional category filter applied
 * @returns {String} - iCalendar formatted string
 */

// eslint-disable-next-line no-unused-vars
export function exportToGoogleCalendar(project, assignments, filterCategory = null) {
  // iCalendar header
  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Event Management System//Event Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeIcsText(project.name)} - משימות כנס`,
    'X-WR-TIMEZONE:Asia/Jerusalem'
  ];

  // Add each assignment as a calendar event
  assignments.forEach(assignment => {
    const event = createCalendarEvent(assignment, project);
    if (event) {
      icsContent = icsContent.concat(event);
    }
  });

  // iCalendar footer
  icsContent.push('END:VCALENDAR');

  return icsContent.join('\r\n');
}

/**
 * Creates a single calendar event from an assignment
 * @param {Object} assignment - Assignment object
 * @param {Object} project - Project object
 * @returns {Array} - Array of iCalendar event lines
 */
function createCalendarEvent(assignment, project) {
  if (!assignment.DueDate) {
    return null; // Skip assignments without due dates
  }

  const now = new Date();
  const dueDate = new Date(assignment.DueDate);
  const uid = `assignment-${assignment._id}@event-management-system.com`;
  
  // Create event summary (title)
  const summary = assignment.Assignment?.Assignment || 'משימה ללא שם';
  
  // Create event description
  const description = createEventDescription(assignment, project);
  
  // Set event timing - make it an all-day event on the due date
  const startDate = formatDateForIcs(dueDate);
  const endDate = formatDateForIcs(new Date(dueDate.getTime() + 24 * 60 * 60 * 1000)); // Next day for all-day event
  
  // Determine event status and priority
  const status = getEventStatus(assignment.Status);
  const priority = assignment.Important ? '1' : '5'; // 1 = high, 5 = normal
  
  return [
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${formatDateForIcs(now, true)}`,
    `DTSTART;VALUE=DATE:${startDate}`,
    `DTEND;VALUE=DATE:${endDate}`,
    `SUMMARY:${escapeIcsText(summary)}`,
    `DESCRIPTION:${escapeIcsText(description)}`,
    `STATUS:${status}`,
    `PRIORITY:${priority}`,
    `CATEGORIES:${escapeIcsText(assignment.Assignment?.Step || 'כללי')}`,
    assignment.Important ? 'X-MICROSOFT-CDO-IMPORTANCE:2' : 'X-MICROSOFT-CDO-IMPORTANCE:1',
    'END:VEVENT'
  ];
}

/**
 * Creates a detailed description for the calendar event
 * @param {Object} assignment - Assignment object
 * @param {Object} project - Project object
 * @returns {String} - Event description
 */
function createEventDescription(assignment, project) {
  const parts = [
    `פרוייקט: ${project.name}`,
    `תאריך הכנס: ${formatHebrewDate(project.date)}`,
    `שלב: ${assignment.Assignment?.Step || 'לא צוין'}`,
    `סטטוס: ${getHebrewStatus(assignment.Status)}`,
    assignment.Important ? '⭐ משימה חשובה' : '',
    assignment.Assignee ? `מבצע: ${assignment.Assignee.name || assignment.Assignee.Email}` : '',
    assignment.EstimatedTime ? `זמן משוער: ${formatHebrewDate(assignment.EstimatedTime)}` : '',
    assignment.RecommendedStartDate ? `תאריך התחלה מומלץ: ${formatHebrewDate(assignment.RecommendedStartDate)}` : ''
  ].filter(part => part); // Remove empty parts

  return parts.join('\\n');
}

/**
 * Formats date for iCalendar format (YYYYMMDD or YYYYMMDDTHHMMSSZ)
 * @param {Date} date - Date object
 * @param {Boolean} includeTime - Whether to include time (for timestamps)
 * @returns {String} - Formatted date string
 */
function formatDateForIcs(date, includeTime = false) {
  if (!date) return '';
  
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  if (includeTime) {
    const hours = String(d.getUTCHours()).padStart(2, '0');
    const minutes = String(d.getUTCMinutes()).padStart(2, '0');
    const seconds = String(d.getUTCSeconds()).padStart(2, '0');
    return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
  }
  
  return `${year}${month}${day}`;
}

/**
 * Formats date for Hebrew display
 * @param {Date|String} date - Date object or string
 * @returns {String} - Formatted Hebrew date
 */
function formatHebrewDate(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('he-IL');
}

/**
 * Converts assignment status to Hebrew
 * @param {String} status - Assignment status
 * @returns {String} - Hebrew status
 */
function getHebrewStatus(status) {
  const statusMap = {
    'Pending': 'עוד לא התחילה',
    'In Progress': 'בתהליך',
    'InProgress': 'בתהליך',
    'Done': 'הושלם'
  };
  return statusMap[status] || status;
}

/**
 * Converts assignment status to iCalendar event status
 * @param {String} status - Assignment status
 * @returns {String} - iCalendar status
 */
function getEventStatus(status) {
  const statusMap = {
    'Pending': 'TENTATIVE',
    'In Progress': 'CONFIRMED',
    'InProgress': 'CONFIRMED',
    'Done': 'CONFIRMED'
  };
  return statusMap[status] || 'TENTATIVE';
}

/**
 * Escapes text for iCalendar format
 * @param {String} text - Text to escape
 * @returns {String} - Escaped text
 */
function escapeIcsText(text) {
  if (!text) return '';
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '');
}

/**
 * Downloads the iCalendar file
 * @param {String} icsContent - iCalendar content
 * @param {String} filename - File name (without extension)
 */
export function downloadIcsFile(icsContent, filename) {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.ics`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Main export function to be called from Vue component
 * @param {Object} project - Project object
 * @param {Array} assignments - Assignments to export
 * @param {String} filterCategory - Current filter category (optional)
 */
export function exportProjectToCalendar(project, assignments, filterCategory = null) {
  if (!project || !assignments || assignments.length === 0) {
    throw new Error('לא ניתן לייצא - אין משימות או פרוייקט');
  }

  // Filter out assignments without due dates
  const validAssignments = assignments.filter(assignment => assignment.DueDate);
  
  if (validAssignments.length === 0) {
    throw new Error('לא ניתן לייצא - אין משימות עם תאריך יעד');
  }

  const icsContent = exportToGoogleCalendar(project, validAssignments, filterCategory);
  
  // Create filename - sanitize for file system
  const categoryText = filterCategory ? `_${filterCategory}` : '';
  const filename = `${project.name}${categoryText}_משימות_כנס`.replace(/[<>:"/\\|?*]/g, '_');
  
  downloadIcsFile(icsContent, filename);
  
  return {
    success: true,
    exportedCount: validAssignments.length,
    totalCount: assignments.length
  };
}