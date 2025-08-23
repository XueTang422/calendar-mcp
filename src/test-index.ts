#!/usr/bin/env node

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createTestServer } from './test-server.js';

/**
 * Test version of the Google Calendar MCP Server
 * Uses mock data instead of real Google Calendar API
 */
async function main() {
    try {
        console.error("Starting Google Calendar MCP Test Server...");
        console.error("This version uses MOCK data for testing MCP functionality");
        
        const server = createTestServer();
        const transport = new StdioServerTransport();
        
        await server.connect(transport);
        console.error("Google Calendar MCP Test Server running on stdio with mock data");
    } catch (error) {
        console.error("Fatal error running Google Calendar test server:", error);
        process.exit(1);
    }
}

main();