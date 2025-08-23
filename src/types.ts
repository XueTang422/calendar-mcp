/**
 * Arguments for creating a calendar event
 */
export interface CreateEventArgs {
    summary: string;
    description?: string;
    start: {
        dateTime: string;
        timeZone?: string;
    };
    end: {
        dateTime: string;
        timeZone?: string;
    };
    attendees?: Array<{
        email: string;
        displayName?: string;
    }>;
    location?: string;
    calendarId?: string;
}

/**
 * Arguments for rescheduling a calendar event
 */
export interface RescheduleEventArgs {
    eventId: string;
    start: {
        dateTime: string;
        timeZone?: string;
    };
    end: {
        dateTime: string;
        timeZone?: string;
    };
    calendarId?: string;
}

/**
 * Arguments for deleting a calendar event
 */
export interface DeleteEventArgs {
    eventId: string;
    calendarId?: string;
}

/**
 * Arguments for listing calendar events
 */
export interface ListEventsArgs {
    calendarId?: string;
    timeMin?: string;
    timeMax?: string;
    maxResults?: number;
    q?: string;
}

/**
 * Google Calendar event structure
 */
export interface CalendarEvent {
    id: string;
    summary: string;
    description?: string;
    start: {
        dateTime?: string;
        date?: string;
        timeZone?: string;
    };
    end: {
        dateTime?: string;
        date?: string;
        timeZone?: string;
    };
    attendees?: Array<{
        email: string;
        displayName?: string;
        responseStatus?: string;
    }>;
    location?: string;
    status?: string;
    htmlLink?: string;
}

/**
 * Google Calendar API response structure
 */
export interface CalendarResponse {
    kind: string;
    etag: string;
    summary?: string;
    items?: CalendarEvent[];
    nextPageToken?: string;
}