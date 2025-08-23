import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
    InitializedNotificationSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { GoogleCalendarClient } from './client.js';
import { Config } from './config.js';
import {
    createEventToolDefinition,
    rescheduleEventToolDefinition,
    deleteEventToolDefinition,
    listEventsToolDefinition,
    handleCreateEventTool,
    handleRescheduleEventTool,
    handleDeleteEventTool,
    handleListEventsTool,
} from './tools/index.js';

export function createStandaloneServer(config: Config): Server {
    const serverInstance = new Server(
        {
            name: "google-calendar",
            version: "0.1.0",
        },
        {
            capabilities: {
                tools: {},
            },
        }
    );

    const calendarClient = new GoogleCalendarClient(config);

    serverInstance.setNotificationHandler(InitializedNotificationSchema, async () => {
        console.log('Google Calendar MCP client initialized');
    });

    serverInstance.setRequestHandler(ListToolsRequestSchema, async () => ({
        tools: [
            createEventToolDefinition,
            rescheduleEventToolDefinition,
            deleteEventToolDefinition,
            listEventsToolDefinition,
        ],
    }));

    serverInstance.setRequestHandler(CallToolRequestSchema, async (request) => {
        const { name, arguments: args } = request.params;
        
        switch (name) {
            case "google_calendar_create_event":
                return await handleCreateEventTool(calendarClient, args);
            case "google_calendar_reschedule_event":
                return await handleRescheduleEventTool(calendarClient, args);
            case "google_calendar_delete_event":
                return await handleDeleteEventTool(calendarClient, args);
            case "google_calendar_list_events":
                return await handleListEventsTool(calendarClient, args);
            default:
                return {
                    content: [{ type: "text", text: `Unknown tool: ${name}` }],
                    isError: true,
                };
        }
    });

    return serverInstance;
}

export class GoogleCalendarServer {
    private config: Config;

    constructor(config: Config) {
        this.config = config;
    }

    getServer(): Server {
        return createStandaloneServer(this.config);
    }
}