import "dotenv/config";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const HAE_HOST = process.env.HAE_HOST || "localhost";
const HAE_PORT = parseInt(process.env.HAE_PORT || "9000");
const DEFAULT_TIMEOUT = parseInt(process.env.HAE_TIMEOUT || "86400000");

const server = new McpServer({
  name: "Health Auto Export",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});

// Health Metrics
server.tool(
  "Get Health Metrics",
  "Get health metrics data for a specified date range",
  {
    host: z.string().describe("Hostname or IP address of the target server"),
    port: z.number().min(1).max(65535).describe("Port number to connect to"),
    method: z.string().describe("JSON-RPC method name"),
    params: z
      .object({
        name: z.string().describe("Tool name to call: health_metrics"),
        arguments: z
          .object({
            start: z
              .string()
              .describe("Start timestamp (e.g., '2025-08-01 00:00:00 +0200')"),
            end: z
              .string()
              .describe("End timestamp (e.g., '2025-08-31 23:59:59 +0200')"),
            metrics: z
              .string()
              .describe(
                "Metrics to export as a comma separated list, or empty string for all metrics (e.g., 'step_count')"
              ),
            interval: z
              .string()
              .describe("Aggregation interval for metrics (e.g., 'days')"),
            aggregate: z.boolean().describe("Aggregate metrics (e.g. true)"),
          })
          .describe("Arguments for the health_metrics tool call"),
      })
      .describe("JSON-RPC parameters with name and arguments"),
    id: z
      .union([z.string(), z.number()])
      .optional()
      .describe("JSON-RPC request ID (default: auto-generated)"),
    timeout: z
      .number()
      .min(1000)
      .max(DEFAULT_TIMEOUT)
      .optional()
      .describe(
        `Connection timeout in milliseconds (default: ${DEFAULT_TIMEOUT})`
      ),
  },
  handleRequest
);

// Workouts
server.tool(
  "Get Workouts",
  "Get workouts for a specified date range",
  {
    host: z.string().describe("Hostname or IP address of the target server"),
    port: z.number().min(1).max(65535).describe("Port number to connect to"),
    method: z.string().describe("JSON-RPC method name"),
    params: z
      .object({
        name: z.string().describe("Tool name to call: workouts"),
        arguments: z
          .object({
            start: z
              .string()
              .describe("Start timestamp (e.g. '2025-08-01 00:00:00 +0200')"),
            end: z
              .string()
              .describe("End timestamp (e.g. '2025-08-31 23:59:59 +0200')"),
            includeMetadata: z
              .boolean()
              .describe("Include health metric metadata (e.g. true)"),
            includeRoutes: z
              .boolean()
              .describe("Include route data (e.g. true)"),
            metadataAggregation: z
              .string()
              .describe(
                "Aggregation interval for health metric metadata (e.g. 'minutes' or 'seconds')"
              ),
          })
          .describe("Arguments for the workouts tool call"),
      })
      .describe("JSON-RPC parameters with name and arguments"),
    id: z
      .union([z.string(), z.number()])
      .optional()
      .describe("JSON-RPC request ID (default: auto-generated)"),
    timeout: z
      .number()
      .min(1000)
      .max(DEFAULT_TIMEOUT)
      .optional()
      .describe(
        `Connection timeout in milliseconds (default: ${DEFAULT_TIMEOUT})`
      ),
  },
  handleRequest
);

// Symptoms
server.tool(
  "Get Symptoms",
  "Get symptoms data for a specified date range",
  {
    host: z.string().describe("Hostname or IP address of the target server"),
    port: z.number().min(1).max(65535).describe("Port number to connect to"),
    method: z.string().describe("JSON-RPC method name"),
    params: z
      .object({
        name: z.string().describe("Tool name to call: symptoms"),
        arguments: z
          .object({
            start: z
              .string()
              .describe("Start timestamp (e.g. '2025-08-01 00:00:00 +0200')"),
            end: z
              .string()
              .describe("End timestamp (e.g. '2025-08-31 23:59:59 +0200')"),
          })
          .describe("Arguments for the symptoms tool call"),
      })
      .describe("JSON-RPC parameters with name and arguments"),
    id: z
      .union([z.string(), z.number()])
      .optional()
      .describe("JSON-RPC request ID (default: auto-generated)"),
    timeout: z
      .number()
      .min(1000)
      .max(DEFAULT_TIMEOUT)
      .optional()
      .describe(
        `Connection timeout in milliseconds (default: ${DEFAULT_TIMEOUT})`
      ),
  },
  handleRequest
);

// State of Mind
server.tool(
  "Get State of Mind",
  "Get state of mind data for a specified date range",
  {
    host: z.string().describe("Hostname or IP address of the target server"),
    port: z.number().min(1).max(65535).describe("Port number to connect to"),
    method: z.string().describe("JSON-RPC method name"),
    params: z
      .object({
        name: z.string().describe("Tool name to call: state_of_mind"),
        arguments: z
          .object({
            start: z
              .string()
              .describe("Start timestamp (e.g. '2025-08-01 00:00:00 +0200')"),
            end: z
              .string()
              .describe("End timestamp (e.g. '2025-08-31 23:59:59 +0200')"),
          })
          .describe("Arguments for the state_of_mind tool call"),
      })
      .describe("JSON-RPC parameters with name and arguments"),
    id: z
      .union([z.string(), z.number()])
      .optional()
      .describe("JSON-RPC request ID (default: auto-generated)"),
    timeout: z
      .number()
      .min(1000)
      .max(DEFAULT_TIMEOUT)
      .optional()
      .describe(
        `Connection timeout in milliseconds (default: ${DEFAULT_TIMEOUT})`
      ),
  },
  handleRequest
);

// Medications
server.tool(
  "Get Medications",
  "Get medications data for a specified date range",
  {
    host: z.string().describe("Hostname or IP address of the target server"),
    port: z.number().min(1).max(65535).describe("Port number to connect to"),
    method: z.string().describe("JSON-RPC method name"),
    params: z
      .object({
        name: z.string().describe("Tool name to call: medications"),
        arguments: z
          .object({
            start: z
              .string()
              .describe("Start timestamp (e.g. '2025-08-01 00:00:00 +0200')"),
            end: z
              .string()
              .describe("End timestamp (e.g. '2025-08-31 23:59:59 +0200')"),
          })
          .describe("Arguments for the medications tool call"),
      })
      .describe("JSON-RPC parameters with name and arguments"),
    id: z
      .union([z.string(), z.number()])
      .optional()
      .describe("JSON-RPC request ID (default: auto-generated)"),
    timeout: z
      .number()
      .min(1000)
      .max(DEFAULT_TIMEOUT)
      .optional()
      .describe(
        `Connection timeout in milliseconds (default: ${DEFAULT_TIMEOUT})`
      ),
  },
  handleRequest
);

// Cycle Tracking
server.tool(
  "Get Cycle Tracking",
  "Get cycle tracking data for a specified date range",
  {
    host: z.string().describe("Hostname or IP address of the target server"),
    port: z.number().min(1).max(65535).describe("Port number to connect to"),
    method: z.string().describe("JSON-RPC method name"),
    params: z
      .object({
        name: z.string().describe("Tool name to call: cycle_tracking"),
        arguments: z
          .object({
            start: z
              .string()
              .describe("Start timestamp (e.g. '2025-08-01 00:00:00 +0200')"),
            end: z
              .string()
              .describe("End timestamp (e.g. '2025-08-31 23:59:59 +0200')"),
          })
          .describe("Arguments for the cycle_tracking tool call"),
      })
      .describe("JSON-RPC parameters with name and arguments"),
    id: z
      .union([z.string(), z.number()])
      .optional()
      .describe("JSON-RPC request ID (default: auto-generated)"),
    timeout: z
      .number()
      .min(1000)
      .max(DEFAULT_TIMEOUT)
      .optional()
      .describe(
        `Connection timeout in milliseconds (default: ${DEFAULT_TIMEOUT})`
      ),
  },
  handleRequest
);

// ECG
server.tool(
  "Get ECG",
  "Get ecg data for a specified date range",
  {
    host: z.string().describe("Hostname or IP address of the target server"),
    port: z.number().min(1).max(65535).describe("Port number to connect to"),
    method: z.string().describe("JSON-RPC method name"),
    params: z
      .object({
        name: z.string().describe("Tool name to call: ecg"),
        arguments: z
          .object({
            start: z
              .string()
              .describe("Start timestamp (e.g. '2025-08-01 00:00:00 +0200')"),
            end: z
              .string()
              .describe("End timestamp (e.g. '2025-08-31 23:59:59 +0200')"),
          })
          .describe("Arguments for the ecg tool call"),
      })
      .describe("JSON-RPC parameters with name and arguments"),
    id: z
      .union([z.string(), z.number()])
      .optional()
      .describe("JSON-RPC request ID (default: auto-generated)"),
    timeout: z
      .number()
      .min(1000)
      .max(DEFAULT_TIMEOUT)
      .optional()
      .describe(
        `Connection timeout in milliseconds (default: ${DEFAULT_TIMEOUT})`
      ),
  },
  handleRequest
);

// Heart Notifications
server.tool(
  "Get Heart Notifications",
  "Get heart notifications data for a specified date range",
  {
    host: z.string().describe("Hostname or IP address of the target server"),
    port: z.number().min(1).max(65535).describe("Port number to connect to"),
    method: z.string().describe("JSON-RPC method name"),
    params: z
      .object({
        name: z.string().describe("Tool name to call: heart_notifications"),
        arguments: z
          .object({
            start: z
              .string()
              .describe("Start timestamp (e.g. '2025-08-01 00:00:00 +0200')"),
            end: z
              .string()
              .describe("End timestamp (e.g. '2025-08-31 23:59:59 +0200')"),
          })
          .describe("Arguments for the heart_notifications tool call"),
      })
      .describe("JSON-RPC parameters with name and arguments"),
    id: z
      .union([z.string(), z.number()])
      .optional()
      .describe("JSON-RPC request ID (default: auto-generated)"),
    timeout: z
      .number()
      .min(1000)
      .max(DEFAULT_TIMEOUT)
      .optional()
      .describe(
        `Connection timeout in milliseconds (default: ${DEFAULT_TIMEOUT})`
      ),
  },
  handleRequest
);

interface HealthMetricsArgs {
  start: string;
  end: string;
}

async function handleRequest({
  host,
  port,
  method,
  params,
  id,
  timeout = DEFAULT_TIMEOUT,
}: {
  host: string;
  port: number;
  method: string;
  params: {
    name: string;
    arguments: HealthMetricsArgs;
  };
  id?: string | number | undefined;
  timeout?: number | undefined;
}): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  const net = await import("net");

  const requestId = id || Math.floor(Math.random() * 1000);
  const jsonrpcRequest = {
    jsonrpc: "2.0",
    id: requestId,
    method: method,
    params: params || {},
  };

  const message = JSON.stringify(jsonrpcRequest);

  return new Promise((resolve) => {
    const client = new net.Socket();
    let responseData = "";
    let hasResponded = false;

    client.setTimeout(timeout);

    client.connect(port, host, () => {
      client.write(message);
    });

    client.on("data", (data) => {
      responseData += data.toString();
    });

    client.on("end", () => {
      if (!hasResponded) {
        hasResponded = true;
        let responseText = `JSON-RPC request to ${host}:${port} completed successfully.\n`;
        responseText += `Request: ${message}\n\n`;

        if (responseData) {
          try {
            const parsedResponse = JSON.parse(responseData);
            responseText += `Response: ${JSON.stringify(
              parsedResponse,
              null,
              2
            )}`;
          } catch {
            responseText += `Raw Response: ${responseData}`;
          }
        } else {
          responseText += "No response data received";
        }

        resolve({
          content: [{ type: "text", text: responseText }],
        });
      }
    });

    client.on("error", (error) => {
      if (!hasResponded) {
        hasResponded = true;
        resolve({
          content: [
            {
              type: "text",
              text: `JSON-RPC request to ${host}:${port} failed: ${error.message}`,
            },
          ],
        });
      }
    });

    client.on("timeout", () => {
      if (!hasResponded) {
        hasResponded = true;
        client.destroy();
        resolve({
          content: [
            {
              type: "text",
              text: `JSON-RPC request to ${host}:${port} timed out after ${timeout}ms`,
            },
          ],
        });
      }
    });

    client.on("close", () => {
      if (!hasResponded) {
        hasResponded = true;
        resolve({
          content: [
            {
              type: "text",
              text: `JSON-RPC request to ${host}:${port} closed`,
            },
          ],
        });
      }
    });
  });
}

async function healthCheck(
  host: string,
  port: number,
  timeout: number = 5000
): Promise<boolean> {
  const net = await import("net");

  return new Promise((resolve) => {
    const client = new net.Socket();
    let hasResponded = false;

    client.setTimeout(timeout);

    client.connect(port, host, () => {
      if (!hasResponded) {
        hasResponded = true;
        client.destroy();
        resolve(true);
      }
    });

    client.on("error", () => {
      if (!hasResponded) {
        hasResponded = true;
        resolve(false);
      }
    });

    client.on("timeout", () => {
      if (!hasResponded) {
        hasResponded = true;
        client.destroy();
        resolve(false);
      }
    });
  });
}

async function main() {
  console.error(`Performing health check to ${HAE_HOST}:${HAE_PORT}...`);
  const isHealthy = await healthCheck(HAE_HOST, HAE_PORT);

  if (!isHealthy) {
    console.error(
      `Health check failed: Cannot connect to ${HAE_HOST}:${HAE_PORT}`
    );
    process.exit(1);
  }

  console.error(
    `Health check passed: Successfully connected to ${HAE_HOST}:${HAE_PORT}`
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Health Auto Export MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
