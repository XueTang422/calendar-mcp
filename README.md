# Google Calendar MCP Server

A Model Context Protocol (MCP) server for Google Calendar operations, including creating, rescheduling, and deleting calendar events.

## Features

- **Create Events**: Create new calendar events with title, description, location, attendees, and time
- **Reschedule Events**: Update the start and end times of existing events
- **Delete Events**: Remove events from the calendar
- **List Events**: Query and filter calendar events by time range and search terms

## Installation

```bash
npm install
npm run build
```

## Configuration

You need to set up Google Calendar API authentication. Choose one of these methods:

### Method 1: Service Account (Recommended for server applications)

1. Create a service account in the Google Cloud Console
2. Download the service account key file
3. Set the environment variable:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/service-account-key.json"
```

### Method 2: OAuth2 (For personal use)

1. Create OAuth2 credentials in the Google Cloud Console
2. Obtain a refresh token
3. Set these environment variables:

```bash
export GOOGLE_CLIENT_ID="your-client-id"
export GOOGLE_CLIENT_SECRET="your-client-secret"
export GOOGLE_REFRESH_TOKEN="your-refresh-token"
```

### Optional Environment Variables

```bash
export PORT=8080                    # HTTP server port (default: 8080)
export NODE_ENV=production          # Set for production mode
```

## Usage

### HTTP Transport (Default)

```bash
npm start
# or
node dist/index.js
```

The server will start on `http://localhost:8080` by default.

### STDIO Transport (For local development)

```bash
npm run start:stdio
# or
node dist/index.js --stdio
```

### Command Line Options

```bash
node dist/index.js --help          # Show help
node dist/index.js --port 3000     # Use custom port
node dist/index.js --stdio         # Use STDIO transport
```

## Tools Available

### 1. `google_calendar_create_event`

Creates a new calendar event.

**Parameters:**
- `summary` (required): Event title
- `start` (required): Start time object with `dateTime` and optional `timeZone`
- `end` (required): End time object with `dateTime` and optional `timeZone`
- `description` (optional): Event description
- `location` (optional): Event location
- `attendees` (optional): Array of attendee objects with `email` and `displayName`
- `calendarId` (optional): Calendar ID (defaults to 'primary')

**Example:**
```json
{
  "summary": "Team Meeting",
  "description": "Weekly team sync",
  "start": {
    "dateTime": "2024-01-15T10:00:00",
    "timeZone": "America/New_York"
  },
  "end": {
    "dateTime": "2024-01-15T11:00:00",
    "timeZone": "America/New_York"
  },
  "location": "Conference Room A",
  "attendees": [
    {
      "email": "colleague@example.com",
      "displayName": "Colleague Name"
    }
  ]
}
```

### 2. `google_calendar_reschedule_event`

Reschedules an existing event by updating its start and end times.

**Parameters:**
- `eventId` (required): ID of the event to reschedule
- `start` (required): New start time object
- `end` (required): New end time object
- `calendarId` (optional): Calendar ID (defaults to 'primary')

**Example:**
```json
{
  "eventId": "event_id_here",
  "start": {
    "dateTime": "2024-01-15T14:00:00",
    "timeZone": "America/New_York"
  },
  "end": {
    "dateTime": "2024-01-15T15:00:00",
    "timeZone": "America/New_York"
  }
}
```

### 3. `google_calendar_delete_event`

Deletes an existing calendar event.

**Parameters:**
- `eventId` (required): ID of the event to delete
- `calendarId` (optional): Calendar ID (defaults to 'primary')

**Example:**
```json
{
  "eventId": "event_id_here"
}
```

### 4. `google_calendar_list_events`

Lists calendar events with optional filtering.

**Parameters:**
- `calendarId` (optional): Calendar ID (defaults to 'primary')
- `timeMin` (optional): Lower bound for events (ISO 8601)
- `timeMax` (optional): Upper bound for events (ISO 8601)
- `maxResults` (optional): Maximum number of events (1-2500, default: 50)
- `q` (optional): Free text search terms

**Example:**
```json
{
  "timeMin": "2024-01-15T00:00:00Z",
  "timeMax": "2024-01-16T00:00:00Z",
  "maxResults": 10,
  "q": "meeting"
}
```

## Client Configuration

For MCP clients, use this configuration:

```json
{
  "mcpServers": {
    "google-calendar": {
      "url": "http://localhost:8080/mcp"
    }
  }
}
```

## Health Check

The server provides a health check endpoint:

```bash
curl http://localhost:8080/health
```

## Development

```bash
npm run watch    # Watch for changes and recompile
npm run dev      # Build and run with HTTP transport
npm run dev:stdio # Build and run with STDIO transport
```

## Architecture

This server follows the recommended MCP server architecture with:

- **Modular Structure**: Separated concerns with dedicated modules
- **Type Safety**: Full TypeScript coverage
- **Error Handling**: Comprehensive error handling and validation
- **Multiple Transports**: HTTP (default) and STDIO support
- **Production Ready**: Environment configuration and logging

## Project Structure

```
src/
├── index.ts            # Main entry point
├── cli.ts              # Command-line argument parsing
├── config.ts           # Configuration management
├── server.ts           # Server instance creation
├── client.ts           # Google Calendar API client
├── types.ts            # TypeScript type definitions
├── tools/
│   ├── index.ts        # Tool exports
│   └── calendar.ts     # Calendar tool definitions and handlers
└── transport/
    ├── index.ts        # Transport exports
    ├── http.ts         # HTTP transport (primary)
    └── stdio.ts        # STDIO transport (development)
```

## Requirements

- Node.js 18+
- Google Calendar API access
- Valid Google authentication credentials

## License

MIT
