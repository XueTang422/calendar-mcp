import { google, calendar_v3 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { Config, validateAuthConfig } from './config.js';
import { CalendarEvent, CalendarResponse, CreateEventArgs, RescheduleEventArgs, DeleteEventArgs, ListEventsArgs } from './types.js';

export class GoogleCalendarClient {
    private calendar: calendar_v3.Calendar | null = null;
    private auth: OAuth2Client | any = null;
    private config: Config;
    private initialized: boolean = false;

    constructor(config: Config) {
        this.config = config;
        // Don't initialize auth in constructor - do it lazily when first needed
    }

    private initializeAuth(): void {
        if (this.initialized) return;
        
        // Validate auth config when first needed
        validateAuthConfig(this.config);
        
        if (this.config.googleCredentialsPath) {
            // Use service account authentication
            this.auth = new google.auth.GoogleAuth({
                keyFile: this.config.googleCredentialsPath,
                scopes: ['https://www.googleapis.com/auth/calendar'],
            });
        } else if (this.config.googleClientId && this.config.googleClientSecret && this.config.googleRefreshToken) {
            // Use OAuth2 authentication
            this.auth = new OAuth2Client(
                this.config.googleClientId,
                this.config.googleClientSecret,
                'urn:ietf:wg:oauth:2.0:oob'
            );
            this.auth.setCredentials({
                refresh_token: this.config.googleRefreshToken,
            });
        } else {
            throw new Error('No valid Google authentication credentials provided');
        }
        
        this.calendar = google.calendar({ version: 'v3', auth: this.auth });
        this.initialized = true;
    }

    /**
     * Creates a new calendar event
     */
    async createEvent(args: CreateEventArgs): Promise<string> {
        try {
            this.initializeAuth();
            if (!this.calendar) throw new Error('Calendar client not initialized');
            
            const calendarId = args.calendarId || 'primary';
            
            const event: calendar_v3.Schema$Event = {
                summary: args.summary,
                description: args.description,
                start: {
                    dateTime: args.start.dateTime,
                    timeZone: args.start.timeZone || 'UTC',
                },
                end: {
                    dateTime: args.end.dateTime,
                    timeZone: args.end.timeZone || 'UTC',
                },
                location: args.location,
                attendees: args.attendees?.map(attendee => ({
                    email: attendee.email,
                    displayName: attendee.displayName,
                })),
            };

            const response = await this.calendar.events.insert({
                calendarId,
                requestBody: event,
                sendUpdates: 'all',
            });

            if (!response.data.id) {
                throw new Error('Failed to create event - no event ID returned');
            }

            return this.formatEventResponse(response.data);
        } catch (error) {
            throw new Error(`Failed to create calendar event: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Reschedules an existing calendar event
     */
    async rescheduleEvent(args: RescheduleEventArgs): Promise<string> {
        try {
            this.initializeAuth();
            if (!this.calendar) throw new Error('Calendar client not initialized');
            
            const calendarId = args.calendarId || 'primary';

            // First, get the existing event
            const existingEvent = await this.calendar.events.get({
                calendarId,
                eventId: args.eventId,
            });

            if (!existingEvent.data) {
                throw new Error(`Event with ID ${args.eventId} not found`);
            }

            // Update the event with new times
            const updatedEvent: calendar_v3.Schema$Event = {
                ...existingEvent.data,
                start: {
                    dateTime: args.start.dateTime,
                    timeZone: args.start.timeZone || 'UTC',
                },
                end: {
                    dateTime: args.end.dateTime,
                    timeZone: args.end.timeZone || 'UTC',
                },
            };

            const response = await this.calendar.events.update({
                calendarId,
                eventId: args.eventId,
                requestBody: updatedEvent,
                sendUpdates: 'all',
            });

            return this.formatEventResponse(response.data);
        } catch (error) {
            throw new Error(`Failed to reschedule event: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Deletes a calendar event
     */
    async deleteEvent(args: DeleteEventArgs): Promise<string> {
        try {
            this.initializeAuth();
            if (!this.calendar) throw new Error('Calendar client not initialized');
            
            const calendarId = args.calendarId || 'primary';

            await this.calendar.events.delete({
                calendarId,
                eventId: args.eventId,
                sendUpdates: 'all',
            });

            return `Event ${args.eventId} has been successfully deleted from calendar ${calendarId}`;
        } catch (error) {
            throw new Error(`Failed to delete event: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Lists calendar events with optional filtering
     */
    async listEvents(args: ListEventsArgs = {}): Promise<string> {
        try {
            this.initializeAuth();
            if (!this.calendar) throw new Error('Calendar client not initialized');
            
            const calendarId = args.calendarId || 'primary';

            const response = await this.calendar.events.list({
                calendarId,
                timeMin: args.timeMin,
                timeMax: args.timeMax,
                maxResults: args.maxResults || 50,
                singleEvents: true,
                orderBy: 'startTime',
                q: args.q,
            });

            if (!response.data.items || response.data.items.length === 0) {
                return 'No events found matching the criteria';
            }

            const events = response.data.items.map(event => this.formatEventForListing(event));
            return JSON.stringify({
                summary: `Found ${events.length} event(s)`,
                events,
                nextPageToken: response.data.nextPageToken,
            }, null, 2);
        } catch (error) {
            throw new Error(`Failed to list events: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Formats a single event response for display
     */
    private formatEventResponse(event: calendar_v3.Schema$Event): string {
        const formatted = {
            id: event.id,
            summary: event.summary,
            description: event.description,
            start: event.start,
            end: event.end,
            location: event.location,
            status: event.status,
            htmlLink: event.htmlLink,
            attendees: event.attendees?.map(attendee => ({
                email: attendee.email,
                displayName: attendee.displayName,
                responseStatus: attendee.responseStatus,
            })),
        };

        return JSON.stringify(formatted, null, 2);
    }

    /**
     * Formats an event for listing display
     */
    private formatEventForListing(event: calendar_v3.Schema$Event): CalendarEvent {
        return {
            id: event.id || '',
            summary: event.summary || 'No title',
            description: event.description || undefined,
            start: {
                dateTime: event.start?.dateTime || undefined,
                date: event.start?.date || undefined,
                timeZone: event.start?.timeZone || undefined,
            },
            end: {
                dateTime: event.end?.dateTime || undefined,
                date: event.end?.date || undefined,
                timeZone: event.end?.timeZone || undefined,
            },
            location: event.location || undefined,
            status: event.status || undefined,
            htmlLink: event.htmlLink || undefined,
            attendees: event.attendees?.map(attendee => ({
                email: attendee.email || '',
                displayName: attendee.displayName || undefined,
                responseStatus: attendee.responseStatus || undefined,
            })),
        };
    }
}