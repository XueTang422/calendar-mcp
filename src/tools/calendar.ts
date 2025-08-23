import { Tool, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { GoogleCalendarClient } from '../client.js';
import { CreateEventArgs, RescheduleEventArgs, DeleteEventArgs, ListEventsArgs } from '../types.js';

/**
 * Tool definition for creating calendar events
 */
export const createEventToolDefinition: Tool = {
    name: "google_calendar_create_event",
    description: "Creates a new event in Google Calendar. Requires summary, start time, and end time. Optionally accepts description, location, attendees, and calendar ID.",
    inputSchema: {
        type: "object",
        properties: {
            summary: {
                type: "string",
                description: "Title/summary of the event"
            },
            description: {
                type: "string",
                description: "Detailed description of the event"
            },
            start: {
                type: "object",
                properties: {
                    dateTime: {
                        type: "string",
                        description: "Start date and time in ISO 8601 format (e.g., '2024-01-15T10:00:00')"
                    },
                    timeZone: {
                        type: "string",
                        description: "Time zone (e.g., 'America/New_York'). Defaults to UTC"
                    }
                },
                required: ["dateTime"]
            },
            end: {
                type: "object",
                properties: {
                    dateTime: {
                        type: "string",
                        description: "End date and time in ISO 8601 format (e.g., '2024-01-15T11:00:00')"
                    },
                    timeZone: {
                        type: "string",
                        description: "Time zone (e.g., 'America/New_York'). Defaults to UTC"
                    }
                },
                required: ["dateTime"]
            },
            location: {
                type: "string",
                description: "Location of the event"
            },
            attendees: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        email: {
                            type: "string",
                            description: "Email address of the attendee"
                        },
                        displayName: {
                            type: "string",
                            description: "Display name of the attendee"
                        }
                    },
                    required: ["email"]
                },
                description: "List of attendees to invite"
            },
            calendarId: {
                type: "string",
                description: "ID of the calendar to create the event in. Defaults to 'primary'"
            }
        },
        required: ["summary", "start", "end"]
    }
};

/**
 * Tool definition for rescheduling calendar events
 */
export const rescheduleEventToolDefinition: Tool = {
    name: "google_calendar_reschedule_event",
    description: "Reschedules an existing calendar event by updating its start and end times. Requires the event ID and new start/end times.",
    inputSchema: {
        type: "object",
        properties: {
            eventId: {
                type: "string",
                description: "ID of the event to reschedule"
            },
            start: {
                type: "object",
                properties: {
                    dateTime: {
                        type: "string",
                        description: "New start date and time in ISO 8601 format (e.g., '2024-01-15T10:00:00')"
                    },
                    timeZone: {
                        type: "string",
                        description: "Time zone (e.g., 'America/New_York'). Defaults to UTC"
                    }
                },
                required: ["dateTime"]
            },
            end: {
                type: "object",
                properties: {
                    dateTime: {
                        type: "string",
                        description: "New end date and time in ISO 8601 format (e.g., '2024-01-15T11:00:00')"
                    },
                    timeZone: {
                        type: "string",
                        description: "Time zone (e.g., 'America/New_York'). Defaults to UTC"
                    }
                },
                required: ["dateTime"]
            },
            calendarId: {
                type: "string",
                description: "ID of the calendar containing the event. Defaults to 'primary'"
            }
        },
        required: ["eventId", "start", "end"]
    }
};

/**
 * Tool definition for deleting calendar events
 */
export const deleteEventToolDefinition: Tool = {
    name: "google_calendar_delete_event",
    description: "Deletes an existing calendar event. Requires the event ID.",
    inputSchema: {
        type: "object",
        properties: {
            eventId: {
                type: "string",
                description: "ID of the event to delete"
            },
            calendarId: {
                type: "string",
                description: "ID of the calendar containing the event. Defaults to 'primary'"
            }
        },
        required: ["eventId"]
    }
};

/**
 * Tool definition for listing calendar events
 */
export const listEventsToolDefinition: Tool = {
    name: "google_calendar_list_events",
    description: "Lists calendar events with optional filtering by time range, search query, and calendar ID.",
    inputSchema: {
        type: "object",
        properties: {
            calendarId: {
                type: "string",
                description: "ID of the calendar to list events from. Defaults to 'primary'"
            },
            timeMin: {
                type: "string",
                description: "Lower bound (inclusive) for events to list in ISO 8601 format (e.g., '2024-01-15T00:00:00Z')"
            },
            timeMax: {
                type: "string",
                description: "Upper bound (exclusive) for events to list in ISO 8601 format (e.g., '2024-01-16T00:00:00Z')"
            },
            maxResults: {
                type: "number",
                description: "Maximum number of events to return (1-2500). Defaults to 50"
            },
            q: {
                type: "string",
                description: "Free text search terms to find events that match"
            }
        }
    }
};

/**
 * Type guard for create event arguments
 */
function isCreateEventArgs(args: unknown): args is CreateEventArgs {
    return (
        typeof args === "object" &&
        args !== null &&
        "summary" in args &&
        typeof (args as { summary: unknown }).summary === "string" &&
        "start" in args &&
        typeof (args as { start: unknown }).start === "object" &&
        "end" in args &&
        typeof (args as { end: unknown }).end === "object"
    );
}

/**
 * Type guard for reschedule event arguments
 */
function isRescheduleEventArgs(args: unknown): args is RescheduleEventArgs {
    return (
        typeof args === "object" &&
        args !== null &&
        "eventId" in args &&
        typeof (args as { eventId: unknown }).eventId === "string" &&
        "start" in args &&
        typeof (args as { start: unknown }).start === "object" &&
        "end" in args &&
        typeof (args as { end: unknown }).end === "object"
    );
}

/**
 * Type guard for delete event arguments
 */
function isDeleteEventArgs(args: unknown): args is DeleteEventArgs {
    return (
        typeof args === "object" &&
        args !== null &&
        "eventId" in args &&
        typeof (args as { eventId: unknown }).eventId === "string"
    );
}

/**
 * Type guard for list events arguments
 */
function isListEventsArgs(args: unknown): args is ListEventsArgs {
    return (
        typeof args === "object" &&
        args !== null
    );
}

/**
 * Handles create event tool calls
 */
export async function handleCreateEventTool(
    client: GoogleCalendarClient, 
    args: unknown
): Promise<CallToolResult> {
    try {
        if (!args) {
            throw new Error("No arguments provided");
        }

        if (!isCreateEventArgs(args)) {
            throw new Error("Invalid arguments for google_calendar_create_event");
        }

        const result = await client.createEvent(args);
        
        return {
            content: [{ type: "text", text: result }],
            isError: false,
        };
    } catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error creating calendar event: ${error instanceof Error ? error.message : String(error)}`,
                },
            ],
            isError: true,
        };
    }
}

/**
 * Handles reschedule event tool calls
 */
export async function handleRescheduleEventTool(
    client: GoogleCalendarClient, 
    args: unknown
): Promise<CallToolResult> {
    try {
        if (!args) {
            throw new Error("No arguments provided");
        }

        if (!isRescheduleEventArgs(args)) {
            throw new Error("Invalid arguments for google_calendar_reschedule_event");
        }

        const result = await client.rescheduleEvent(args);
        
        return {
            content: [{ type: "text", text: result }],
            isError: false,
        };
    } catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error rescheduling calendar event: ${error instanceof Error ? error.message : String(error)}`,
                },
            ],
            isError: true,
        };
    }
}

/**
 * Handles delete event tool calls
 */
export async function handleDeleteEventTool(
    client: GoogleCalendarClient, 
    args: unknown
): Promise<CallToolResult> {
    try {
        if (!args) {
            throw new Error("No arguments provided");
        }

        if (!isDeleteEventArgs(args)) {
            throw new Error("Invalid arguments for google_calendar_delete_event");
        }

        const result = await client.deleteEvent(args);
        
        return {
            content: [{ type: "text", text: result }],
            isError: false,
        };
    } catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error deleting calendar event: ${error instanceof Error ? error.message : String(error)}`,
                },
            ],
            isError: true,
        };
    }
}

/**
 * Handles list events tool calls
 */
export async function handleListEventsTool(
    client: GoogleCalendarClient, 
    args: unknown
): Promise<CallToolResult> {
    try {
        if (!isListEventsArgs(args)) {
            throw new Error("Invalid arguments for google_calendar_list_events");
        }

        const result = await client.listEvents(args as ListEventsArgs);
        
        return {
            content: [{ type: "text", text: result }],
            isError: false,
        };
    } catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error listing calendar events: ${error instanceof Error ? error.message : String(error)}`,
                },
            ],
            isError: true,
        };
    }
}