#!/usr/bin/env node

import { spawn } from 'child_process';

function testMCPManually() {
    console.log('🚀 Testing MCP server manually with JSON-RPC...\n');
    
    // Start the test server
    const server = spawn('node', ['dist/test-index.js'], {
        stdio: ['pipe', 'pipe', 'pipe']
    });
    
    server.stderr.on('data', (data) => {
        console.log('Server log:', data.toString());
    });
    
    // Test 1: Initialize
    console.log('📋 Sending initialize request...');
    const initRequest = {
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
            protocolVersion: "2024-11-05",
            capabilities: {},
            clientInfo: {
                name: "test-client",
                version: "1.0.0"
            }
        }
    };
    
    server.stdin.write(JSON.stringify(initRequest) + '\n');
    
    // Test 2: List tools
    setTimeout(() => {
        console.log('📋 Sending list tools request...');
        const toolsRequest = {
            jsonrpc: "2.0", 
            id: 2,
            method: "tools/list",
            params: {}
        };
        server.stdin.write(JSON.stringify(toolsRequest) + '\n');
    }, 1000);
    
    // Test 3: Create event
    setTimeout(() => {
        console.log('➕ Sending create event request...');
        const createRequest = {
            jsonrpc: "2.0",
            id: 3,
            method: "tools/call",
            params: {
                name: "google_calendar_create_event",
                arguments: {
                    summary: "Test Meeting",
                    start: { dateTime: "2024-08-25T15:00:00Z" },
                    end: { dateTime: "2024-08-25T16:00:00Z" }
                }
            }
        };
        server.stdin.write(JSON.stringify(createRequest) + '\n');
    }, 2000);
    
    // Test 4: List events
    setTimeout(() => {
        console.log('📅 Sending list events request...');
        const listRequest = {
            jsonrpc: "2.0",
            id: 4, 
            method: "tools/call",
            params: {
                name: "google_calendar_list_events",
                arguments: {}
            }
        };
        server.stdin.write(JSON.stringify(listRequest) + '\n');
    }, 3000);
    
    // Listen for responses
    server.stdout.on('data', (data) => {
        const lines = data.toString().trim().split('\n');
        lines.forEach(line => {
            if (line.trim()) {
                try {
                    const response = JSON.parse(line);
                    console.log('\n✅ Server response:', JSON.stringify(response, null, 2));
                } catch (e) {
                    console.log('\n📤 Raw server output:', line);
                }
            }
        });
    });
    
    server.on('error', (error) => {
        console.error('❌ Server error:', error);
    });
    
    // Clean up after 5 seconds
    setTimeout(() => {
        console.log('\n🏁 Test completed, closing server...');
        server.kill();
    }, 5000);
}

testMCPManually();