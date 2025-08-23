import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
    InitializedNotificationSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { MockGoogleCalendarClient } from './test-client.js';
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

export function createTestServer(): Server {
    const serverInstance = new Server(
        {
            name: "google-calendar-test",
            version: "0.1.0-test",
        },
        {
            capabilities: {
                tools: {},
            },
        }
    );

    // Use mock client instead of real Google Calendar client
    const mockClient = new MockGoogleCalendarClient() as any;

    serverInstance.setNotificationHandler(InitializedNotificationSchema, async () => {
        console.log('Google Calendar MCP Test Server initialized - using MOCK data');
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
        
        console.log(`[TEST] Tool called: ${name}`, args);
        
        switch (name) {
            case "google_calendar_create_event":
                return await handleCreateEventTool(mockClient, args);
            case "google_calendar_reschedule_event":
                return await handleRescheduleEventTool(mockClient, args);
            case "google_calendar_delete_event":
                return await handleDeleteEventTool(mockClient, args);
            case "google_calendar_list_events":
                return await handleListEventsTool(mockClient, args);
            default:
                return {
                    content: [{ type: "text", text: `Unknown tool: ${name}` }],
                    isError: true,
                };
        }
    });

    return serverInstance;
}