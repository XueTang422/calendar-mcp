import { CreateEventArgs, RescheduleEventArgs, DeleteEventArgs, ListEventsArgs } from './types.js';

/**
 * Mock Google Calendar client for testing MCP functionality
 */
export class MockGoogleCalendarClient {
    private events: Map<string, any> = new Map();
    private nextId = 1;

    constructor() {
        // Add some mock events for testing
        this.events.set('test-event-1', {
            id: 'test-event-1',
            summary: 'Existing Test Meeting',
            description: 'This is a test event',
            start: { dateTime: '2024-08-24T10:00:00Z', timeZone: 'UTC' },
            end: { dateTime: '2024-08-24T11:00:00Z', timeZone: 'UTC' },
            location: 'Test Location',
            status: 'confirmed',
            htmlLink: 'https://calendar.google.com/event?eid=test-event-1',
            attendees: [
                { email: 'test@example.com', displayName: 'Test User', responseStatus: 'accepted' }
            ]
        });
    }

    /**
     * Mock create event
     */
    async createEvent(args: CreateEventArgs): Promise<string> {
        const eventId = `mock-event-${this.nextId++}`;
        
        const event = {
            id: eventId,
            summary: args.summary,
            description: args.description,
            start: args.start,
            end: args.end,
            location: args.location,
            status: 'confirmed',
            htmlLink: `https://calendar.google.com/event?eid=${eventId}`,
            attendees: args.attendees?.map(attendee => ({
                ...attendee,
                responseStatus: 'needsAction'
            }))
        };

        this.events.set(eventId, event);

        return JSON.stringify({
            message: 'Event created successfully',
            event
        }, null, 2);
    }

    /**
     * Mock reschedule event
     */
    async rescheduleEvent(args: RescheduleEventArgs): Promise<string> {
        const event = this.events.get(args.eventId);
        
        if (!event) {
            throw new Error(`Event with ID ${args.eventId} not found`);
        }

        event.start = args.start;
        event.end = args.end;
        
        return JSON.stringify({
            message: 'Event rescheduled successfully',
            event
        }, null, 2);
    }

    /**
     * Mock delete event
     */
    async deleteEvent(args: DeleteEventArgs): Promise<string> {
        const event = this.events.get(args.eventId);
        
        if (!event) {
            throw new Error(`Event with ID ${args.eventId} not found`);
        }

        this.events.delete(args.eventId);
        
        return `Event "${event.summary}" (${args.eventId}) has been successfully deleted`;
    }

    /**
     * Mock list events
     */
    async listEvents(args: ListEventsArgs = {}): Promise<string> {
        let events = Array.from(this.events.values());

        // Apply search filter if provided
        if (args.q) {
            const query = args.q.toLowerCase();
            events = events.filter(event => 
                event.summary?.toLowerCase().includes(query) ||
                event.description?.toLowerCase().includes(query) ||
                event.location?.toLowerCase().includes(query)
            );
        }

        // Apply time filters (simplified)
        if (args.timeMin || args.timeMax) {
            events = events.filter(event => {
                const eventStart = new Date(event.start.dateTime);
                if (args.timeMin && eventStart < new Date(args.timeMin)) return false;
                if (args.timeMax && eventStart > new Date(args.timeMax)) return false;
                return true;
            });
        }

        // Apply maxResults
        if (args.maxResults) {
            events = events.slice(0, args.maxResults);
        }

        return JSON.stringify({
            summary: `Found ${events.length} event(s) [MOCK DATA]`,
            events: events.map(event => ({
                id: event.id,
                summary: event.summary,
                description: event.description,
                start: event.start,
                end: event.end,
                location: event.location,
                status: event.status,
                htmlLink: event.htmlLink,
                attendees: event.attendees
            })),
            nextPageToken: events.length > 10 ? 'mock-next-page-token' : undefined
        }, null, 2);
    }
}