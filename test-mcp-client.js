#!/usr/bin/env node

import { spawn } from 'child_process';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

async function testMCPServer() {
    console.log('🚀 Starting MCP Calendar Server test...\n');
    
    // Start the test server
    const serverProcess = spawn('node', ['dist/test-index.js'], {
        stdio: ['pipe', 'pipe', 'pipe']
    });
    
    // Create MCP client
    const transport = new StdioClientTransport({
        command: 'node',
        args: ['dist/test-index.js']
    });
    
    const client = new Client(
        {
            name: "test-client",
            version: "1.0.0"
        },
        {
            capabilities: {}
        }
    );
    
    try {
        await client.connect(transport);
        console.log('✅ Connected to MCP server');
        
        // Test 1: List available tools
        console.log('\n📋 Testing: List Tools');
        const tools = await client.request({ method: 'tools/list' }, {});
        console.log('Available tools:', tools.tools.map(t => t.name).join(', '));
        
        // Test 2: List existing events  
        console.log('\n📅 Testing: List Events');
        const listResult = await client.request({
            method: 'tools/call',
            params: {
                name: 'google_calendar_list_events',
                arguments: {}
            }
        }, {});
        console.log('List events result:', listResult.content[0].text);
        
        // Test 3: Create a new event
        console.log('\n➕ Testing: Create Event');
        const createResult = await client.request({
            method: 'tools/call',
            params: {
                name: 'google_calendar_create_event',
                arguments: {
                    summary: 'Test Meeting via MCP',
                    description: 'This event was created through the MCP server test',
                    start: {
                        dateTime: '2024-08-25T15:00:00Z',
                        timeZone: 'UTC'
                    },
                    end: {
                        dateTime: '2024-08-25T16:00:00Z', 
                        timeZone: 'UTC'
                    },
                    location: 'Virtual Meeting Room',
                    attendees: [
                        { email: 'test@example.com', displayName: 'Test User' }
                    ]
                }
            }
        }, {});
        console.log('Create event result:', createResult.content[0].text);
        
        // Test 4: Reschedule the existing event
        console.log('\n🔄 Testing: Reschedule Event');
        const rescheduleResult = await client.request({
            method: 'tools/call',
            params: {
                name: 'google_calendar_reschedule_event',
                arguments: {
                    eventId: 'test-event-1',
                    start: {
                        dateTime: '2024-08-25T14:00:00Z',
                        timeZone: 'UTC'
                    },
                    end: {
                        dateTime: '2024-08-25T15:30:00Z',
                        timeZone: 'UTC'
                    }
                }
            }
        }, {});
        console.log('Reschedule event result:', rescheduleResult.content[0].text);
        
        // Test 5: Delete an event
        console.log('\n🗑️  Testing: Delete Event');
        const deleteResult = await client.request({
            method: 'tools/call',
            params: {
                name: 'google_calendar_delete_event',
                arguments: {
                    eventId: 'test-event-1'
                }
            }
        }, {});
        console.log('Delete event result:', deleteResult.content[0].text);
        
        // Test 6: List events after changes
        console.log('\n📅 Testing: List Events After Changes');
        const finalListResult = await client.request({
            method: 'tools/call',
            params: {
                name: 'google_calendar_list_events',
                arguments: {}
            }
        }, {});
        console.log('Final list result:', finalListResult.content[0].text);
        
        console.log('\n✅ All tests completed successfully!');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await client.close();
        serverProcess.kill();
    }
}

testMCPServer().catch(console.error);