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

// ---------------------------------------------------------------------------
// Tool registrations
// ---------------------------------------------------------------------------

// 1. Health Metrics
server.tool(
  "get_health_metrics",
  "Retrieve Apple Health metrics (e.g. step count, heart rate, sleep, nutrition) aggregated over a date range. " +
    "Use this tool when the user asks about any quantitative health or fitness measurement tracked by Apple Health. " +
    "Returns time-series data points for the requested metrics within the specified date range.",
  {
    start: z
      .string()
      .describe(
        "Start of the date range (inclusive). " +
          "Format: 'yyyy-MM-dd HH:mm:ss Z' where Z is the timezone offset. " +
          "Example: '2025-08-01 00:00:00 +0200'"
      ),
    end: z
      .string()
      .describe(
        "End of the date range (inclusive). " +
          "Format: 'yyyy-MM-dd HH:mm:ss Z' where Z is the timezone offset. " +
          "Example: '2025-08-31 23:59:59 +0200'"
      ),
    metrics: z
      .string()
      .default("")
      .describe(
        "Comma-separated list of metric names to retrieve, or empty string to retrieve ALL available metrics. " +
          "Default: '' (all metrics). " +
          "Available metric names: " +
          "active_energy, apple_exercise_time, apple_move_time, apple_sleeping_wrist_temperature, " +
          "apple_stand_hour, apple_standtime, atrial_fibrillation_burden, basal_body_temperature, " +
          "basal_energy, blood_glucose, blood_oxygen_saturation, blood_pressure, body_fat_percentage, " +
          "body_mass, body_mass_index, body_temperature, breathing_disturbances, biotin, caffeine, " +
          "calcium, carbohydrates, chloride, cholesterol, chromium, copper, cycling_cadence, " +
          "cycling_distance, cycling_functional_threshold_power, cycling_power, cycling_speed, " +
          "dietary_energy, downhill_snow_sports, environmental_audio, fiber, flights_climbed, folate, " +
          "forced_expiratory_volume, forced_vital_capacity, headphone_audio, heart_rate, " +
          "heart_rate_recovery_one_minute, heart_rate_variability, height, inhaler_usage, " +
          "insulin_delivery, lean_body_mass, mindful_minutes, peak_expiratory_flow_rate, " +
          "peripheral_perfusion_index, physical_effort, respiratory_rate, resting_heart_rate, " +
          "running_ground_contact_time, running_power, running_speed, running_stride_length, " +
          "running_vertical_oscillation, sexual_activity, six_minute_walking_test_distance, " +
          "sleep_analysis, stair_speed_down, stair_speed_up, step_count, sugar, swim_stroke_count, " +
          "swimming_distance, under_water_depth, vo2_max, waist_circumference, walk_run_distance, " +
          "walking_asymmetry_percentage, walking_double_support_percentage, walking_heart_rate, " +
          "walking_speed, walking_step_length, water, wheelchair_distance, wheelchair_push_count. " +
          "Example: 'step_count,heart_rate,sleep_analysis'"
      ),
    interval: z
      .string()
      .default("days")
      .describe(
        "Aggregation interval for the returned data points. " +
          "Valid values: 'days', 'hours', 'minutes', 'seconds'. " +
          "Default: 'days'. " +
          "Example: 'hours'"
      ),
    aggregate: z
      .boolean()
      .default(true)
      .describe(
        "Whether to aggregate metric values within each interval. " +
          "When true, values are combined (summed, averaged, etc. depending on the metric type) per interval. " +
          "Default: true"
      ),
  },
  async ({ start, end, metrics, interval, aggregate }) => {
    return sendToolRequest("health_metrics", {
      start,
      end,
      metrics,
      interval,
      aggregate,
    });
  }
);

// 2. Workouts
server.tool(
  "get_workouts",
  "Retrieve Apple Health workout sessions (e.g. runs, walks, cycling, swimming, strength training) within a date range. " +
    "Use this tool when the user asks about exercise sessions, workout history, or training data. " +
    "Returns workout type, duration, energy burned, distance, and optionally GPS routes and per-minute health metric metadata.",
  {
    start: z
      .string()
      .describe(
        "Start of the date range (inclusive). " +
          "Format: 'yyyy-MM-dd HH:mm:ss Z' where Z is the timezone offset. " +
          "Example: '2025-08-01 00:00:00 +0200'"
      ),
    end: z
      .string()
      .describe(
        "End of the date range (inclusive). " +
          "Format: 'yyyy-MM-dd HH:mm:ss Z' where Z is the timezone offset. " +
          "Example: '2025-08-31 23:59:59 +0200'"
      ),
    includeMetadata: z
      .boolean()
      .default(false)
      .describe(
        "Whether to include health metric metadata (heart rate, calories, etc.) recorded during each workout. " +
          "Default: false. Set to true for detailed physiological data during workouts."
      ),
    includeRoutes: z
      .boolean()
      .default(false)
      .describe(
        "Whether to include GPS route data for location-based workouts (running, cycling, hiking, etc.). " +
          "Default: false. Set to true to get latitude/longitude coordinate paths."
      ),
    metadataAggregation: z
      .string()
      .default("minutes")
      .describe(
        "Aggregation interval for health metric metadata within each workout. " +
          "Only relevant when includeMetadata is true. " +
          "Valid values: 'minutes', 'seconds'. " +
          "Default: 'minutes'. Use 'seconds' for higher-resolution data."
      ),
  },
  async ({
    start,
    end,
    includeMetadata,
    includeRoutes,
    metadataAggregation,
  }) => {
    return sendToolRequest("workouts", {
      start,
      end,
      includeMetadata,
      includeRoutes,
      metadataAggregation,
    });
  }
);

// 3. Symptoms
server.tool(
  "get_symptoms",
  "Retrieve logged symptom entries from Apple Health within a date range. " +
    "Use this tool when the user asks about symptoms they have tracked, such as headaches, nausea, fatigue, or other health symptoms. " +
    "Returns symptom type, severity, and timestamps for each logged entry.",
  {
    start: z
      .string()
      .describe(
        "Start of the date range (inclusive). " +
          "Format: 'yyyy-MM-dd HH:mm:ss Z' where Z is the timezone offset. " +
          "Example: '2025-08-01 00:00:00 +0200'"
      ),
    end: z
      .string()
      .describe(
        "End of the date range (inclusive). " +
          "Format: 'yyyy-MM-dd HH:mm:ss Z' where Z is the timezone offset. " +
          "Example: '2025-08-31 23:59:59 +0200'"
      ),
  },
  async ({ start, end }) => {
    return sendToolRequest("symptoms", { start, end });
  }
);

// 4. State of Mind
server.tool(
  "get_state_of_mind",
  "Retrieve State of Mind journal entries from Apple Health within a date range. " +
    "Use this tool when the user asks about their mood, emotions, or mental well-being logs. " +
    "State of Mind is an iOS 18+ feature where users log how they are feeling at a moment or over a day. " +
    "Returns mood labels, valence, and associated context for each entry.",
  {
    start: z
      .string()
      .describe(
        "Start of the date range (inclusive). " +
          "Format: 'yyyy-MM-dd HH:mm:ss Z' where Z is the timezone offset. " +
          "Example: '2025-08-01 00:00:00 +0200'"
      ),
    end: z
      .string()
      .describe(
        "End of the date range (inclusive). " +
          "Format: 'yyyy-MM-dd HH:mm:ss Z' where Z is the timezone offset. " +
          "Example: '2025-08-31 23:59:59 +0200'"
      ),
  },
  async ({ start, end }) => {
    return sendToolRequest("state_of_mind", { start, end });
  }
);

// 5. Medications
server.tool(
  "get_medications",
  "Retrieve logged medication dosage records from Apple Health within a date range. " +
    "Use this tool when the user asks about their medication history, adherence, or dosage logs. " +
    "Requires iOS 26 or later. Returns medication names, dosage amounts, and timestamps of logged doses.",
  {
    start: z
      .string()
      .describe(
        "Start of the date range (inclusive). " +
          "Format: 'yyyy-MM-dd HH:mm:ss Z' where Z is the timezone offset. " +
          "Example: '2025-08-01 00:00:00 +0200'"
      ),
    end: z
      .string()
      .describe(
        "End of the date range (inclusive). " +
          "Format: 'yyyy-MM-dd HH:mm:ss Z' where Z is the timezone offset. " +
          "Example: '2025-08-31 23:59:59 +0200'"
      ),
  },
  async ({ start, end }) => {
    return sendToolRequest("medications", { start, end });
  }
);

// 6. Cycle Tracking
server.tool(
  "get_cycle_tracking",
  "Retrieve menstrual cycle tracking data from Apple Health within a date range. " +
    "Use this tool when the user asks about their period, menstrual cycle, ovulation, or related reproductive health data. " +
    "Returns cycle events including flow level, cervical mucus quality, and other cycle-related indicators.",
  {
    start: z
      .string()
      .describe(
        "Start of the date range (inclusive). " +
          "Format: 'yyyy-MM-dd HH:mm:ss Z' where Z is the timezone offset. " +
          "Example: '2025-08-01 00:00:00 +0200'"
      ),
    end: z
      .string()
      .describe(
        "End of the date range (inclusive). " +
          "Format: 'yyyy-MM-dd HH:mm:ss Z' where Z is the timezone offset. " +
          "Example: '2025-08-31 23:59:59 +0200'"
      ),
  },
  async ({ start, end }) => {
    return sendToolRequest("cycle_tracking", { start, end });
  }
);

// 7. ECG
server.tool(
  "get_ecg",
  "Retrieve electrocardiogram (ECG) recordings and metadata from Apple Health within a date range. " +
    "Use this tool when the user asks about their ECG results, heart rhythm classifications, or Apple Watch ECG recordings. " +
    "Returns ECG classification (e.g. sinus rhythm, atrial fibrillation), average heart rate, and voltage measurements.",
  {
    start: z
      .string()
      .describe(
        "Start of the date range (inclusive). " +
          "Format: 'yyyy-MM-dd HH:mm:ss Z' where Z is the timezone offset. " +
          "Example: '2025-08-01 00:00:00 +0200'"
      ),
    end: z
      .string()
      .describe(
        "End of the date range (inclusive). " +
          "Format: 'yyyy-MM-dd HH:mm:ss Z' where Z is the timezone offset. " +
          "Example: '2025-08-31 23:59:59 +0200'"
      ),
  },
  async ({ start, end }) => {
    return sendToolRequest("ecg", { start, end });
  }
);

// 8. Heart Notifications
server.tool(
  "get_heart_notifications",
  "Retrieve heart-related notification events from Apple Health within a date range. " +
    "Use this tool when the user asks about irregular heart rhythm alerts, high/low heart rate notifications, " +
    "or any cardiovascular warnings generated by Apple Watch. " +
    "Returns notification type, timestamp, and any associated heart rate or rhythm data.",
  {
    start: z
      .string()
      .describe(
        "Start of the date range (inclusive). " +
          "Format: 'yyyy-MM-dd HH:mm:ss Z' where Z is the timezone offset. " +
          "Example: '2025-08-01 00:00:00 +0200'"
      ),
    end: z
      .string()
      .describe(
        "End of the date range (inclusive). " +
          "Format: 'yyyy-MM-dd HH:mm:ss Z' where Z is the timezone offset. " +
          "Example: '2025-08-31 23:59:59 +0200'"
      ),
  },
  async ({ start, end }) => {
    return sendToolRequest("heart_notifications", { start, end });
  }
);

// ---------------------------------------------------------------------------
// Internal transport layer -- hidden from MCP consumers
// ---------------------------------------------------------------------------

async function sendToolRequest(
  toolName: string,
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  const net = await import("net");

  const requestId = Math.floor(Math.random() * 1000);
  const jsonrpcRequest = {
    jsonrpc: "2.0",
    id: requestId,
    method: "callTool",
    params: {
      name: toolName,
      arguments: args,
    },
  };

  const message = JSON.stringify(jsonrpcRequest);

  return new Promise((resolve) => {
    const client = new net.Socket();
    let responseData = "";
    let hasResponded = false;

    client.setTimeout(DEFAULT_TIMEOUT);

    client.connect(HAE_PORT, HAE_HOST, () => {
      client.write(message);
    });

    client.on("data", (data) => {
      responseData += data.toString();
    });

    client.on("end", () => {
      if (!hasResponded) {
        hasResponded = true;
        let responseText = "";

        if (responseData) {
          try {
            const parsedResponse = JSON.parse(responseData);
            responseText = JSON.stringify(parsedResponse, null, 2);
          } catch {
            responseText = responseData;
          }
        } else {
          responseText = "No response data received from Health Auto Export.";
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
              text:
                `Failed to connect to Health Auto Export at ${HAE_HOST}:${HAE_PORT}: ${error.message}. ` +
                "Ensure the Health Auto Export app is open in the foreground with the server started, " +
                "and that this machine is on the same Wi-Fi network as the iOS device.",
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
              text:
                `Request to Health Auto Export timed out after ${DEFAULT_TIMEOUT}ms. ` +
                "The app may be backgrounded or the device may be locked.",
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
              text: "Connection to Health Auto Export closed unexpectedly.",
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
