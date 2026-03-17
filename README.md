# Health Auto Export MCP Server

An [MCP](https://modelcontextprotocol.io/) (Model Context Protocol) server that bridges LLM clients to the [Health Auto Export](https://apple.co/3iqbU2d) iOS app, giving AI assistants direct access to Apple Health data.

Query health metrics, workouts, sleep, ECG recordings, and more — all from natural language through any MCP-compatible client.

## Available Tools

The server exposes 8 tools covering all Health Auto Export data types:

| Tool | Description | Optional Parameters |
|------|-------------|---------------------|
| `get_health_metrics` | 80+ health & fitness metrics (steps, heart rate, sleep, nutrition, body composition, etc.) | `metrics`, `interval`, `aggregate` |
| `get_workouts` | Workout sessions with type, duration, energy, distance | `includeMetadata`, `includeRoutes`, `metadataAggregation` |
| `get_symptoms` | Logged symptom entries (headaches, fatigue, nausea, etc.) | — |
| `get_state_of_mind` | Mood and emotion journal entries (iOS 18+) | — |
| `get_medications` | Medication dosage logs (iOS 26+) | — |
| `get_cycle_tracking` | Menstrual cycle data | — |
| `get_ecg` | Apple Watch ECG recordings and classifications | — |
| `get_heart_notifications` | Heart-related alerts (irregular rhythm, high/low HR) | — |

All tools require `start` and `end` date parameters in the format `yyyy-MM-dd HH:mm:ss Z`.

For detailed protocol documentation and the full list of available health metrics, see [docs/tcp-server.md](docs/tcp-server.md).

## Prerequisites

- **Node.js** 18+
- **Health Auto Export app** on iPhone/iPad with Premium access
- **Same Wi-Fi network** between your computer and iOS device

## Quick Start

1. **Clone and install**:
   ```bash
   git clone https://github.com/dmoellenbeck/health-auto-export-mcp-server.git
   cd health-auto-export-mcp-server
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set `HAE_HOST` to your iOS device's IP address (find it in Settings > Wi-Fi > tap the info icon next to your network).

3. **Build**:
   ```bash
   npm run build
   ```

4. **Start the iOS server**: Open Health Auto Export on your device and navigate to `Automations > Server > Start Server`.

## MCP Client Setup

### Claude Desktop

Add to your `claude_desktop_config.json` (Settings > Developer > Edit Config):

```json
{
  "mcpServers": {
    "health_auto_export": {
      "command": "node",
      "args": ["/absolute/path/to/dist/server.js"]
    }
  }
}
```

Restart Claude Desktop to activate.

### Claude Code

Add the MCP server via the CLI:

```bash
claude mcp add health_auto_export node /absolute/path/to/dist/server.js
```

### Other MCP Clients

Any MCP-compatible client can connect using the stdio transport. The server binary is `dist/server.js`.

For more on MCP client configuration, see [Connecting to local MCP servers](https://modelcontextprotocol.io/docs/develop/connect-local-servers).

## Development

```bash
npm run dev          # Run via ts-node (no build step)
npm run build        # Compile TypeScript to dist/
npm start            # Run compiled server
```

## Direct TCP Usage

You can also query the Health Auto Export app directly over TCP without the MCP layer:

```bash
echo -n '{
  "jsonrpc":"2.0",
  "id":"1",
  "method":"callTool",
  "params":{
    "name":"health_metrics",
    "arguments":{
      "start":"2025-01-01 00:00:00 +0000",
      "end":"2025-01-31 23:59:59 +0000",
      "metrics":"step_count,heart_rate",
      "interval":"days",
      "aggregate":true
    }
  }
}' | nc 192.168.1.37 9000
```

See `src/example/client_example.ts` for a TypeScript TCP client example.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `HAE_HOST` | iOS device IP address | `localhost` |
| `HAE_PORT` | TCP server port | `9000` |
| `HAE_TIMEOUT` | Request timeout (ms) | `86400000` (24h) |

## License

MIT
