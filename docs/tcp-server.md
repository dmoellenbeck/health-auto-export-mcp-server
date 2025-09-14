# Health Auto Export TCP Server

## About

This document explains how to work with the [Health Auto Export](https://apple.co/3iqbU2d) TCP server on iPhone/iPad.

**Protocol:** TCP with JSON messages. HTTP is currently not supported.

**Format:**

JSON-RPC-style objects:

```json
{"jsonrpc":"2.0","id":"...","method":"...","params":{...}}
```

**Methods supported:**

- `listTools` — discover available tools and their schemas
  - **Known issue:** `listTools` currently will not work but will be fixed in the next app release
- `callTool` — invoke one of the tools with arguments
- Connections: one request per connection. The server sends a response and closes the socket.
- Health Auto Export listens on port 9000
- Security: no TLS/auth. Only use on a trusted network.

## Start the Health Data Server

1. Start the server inside the Health Auto Export app for iPhone/iPad.
2. Navigate to `Automations -> Server -> Start Server`

_using the TCP server requires premium access after the free access perdiod has ended_

## Find Your Device's IP Address

On the iPhone/iPad running the app:

1. Mavigate to `Settings → Wi-Fi → tap the info ⓘ next to your network`.
2. Note the device IP Address (e.g., 192.168.1.37).

## Send A Request

Make sure your computer and device are on the same Wi-Fi network.

```bash
IP=192.168.1.37
PORT=9000
echo -n '{
  "jsonrpc":"2.0",
  "id":"99",
  "method":"callTool",
  "params":{
    "name":"health_metrics",
    "metrics": "step_count",
    "arguments":{
      "start":"2025-08-01 00:00:00 +0200",
      "end":"2025-08-31 23:59:59 +0200",
      "interval":"days",
      "aggregate":true
    }
  }
}' | nc $IP $PORT
```

### Tool Calling

`callTool` cheatsheet

All `start` and `end` dates must follow the format: `yyyy-MM-dd HH:mm:ss Z`

| Tool name             | Required args  | Optional args (defaults)                                                                    | Notes                                                                    |
| --------------------- | -------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `health_metrics`      | `start`, `end` | `metrics`=`""`,`interval` = `"days"`, `aggregate` = `true`                                  | Health metrics export. See the bottom of the page for filtering options. |
| `workouts`            | `start`, `end` | `includeMetadata` = `false`, `includeRoutes` = `false`, `metadataAggregation` = `"minutes"` | Workout sessions; can include route & health metric metadata.            |
| `symptoms`            | `start`, `end` | –                                                                                           | Export logged symptoms data.                                             |
| `state_of_mind`       | `start`, `end` | –                                                                                           | Export logged State of Mind data (requires iOS 18 and later).            |
| `medications`         | `start`, `end` | –                                                                                           | Export logged medication dosages (requires iOS 26 and later).            |
| `cycle_tracking`      | `start`, `end` | –                                                                                           | Export menstrual cycle data.                                             |
| `ecg`                 | `start`, `end` | –                                                                                           | Export ECG recordings & metadata.                                        |
| `heart_notifications` | `start`, `end` | –                                                                                           | Export heart notification events + associated data.                      |

## Tips & Limitations

- One message per connection: The server cancels the connection after sending JSON. Open a new socket for each request.
- Message size: The receiver reads up to ~8 KB per receive. Keep requests small and as a single JSON object (no streaming/chunking).
- Encoding: UTF-8 JSON only. Avoid trailing commas and ensure valid JSON.
- Clock & timezone: Your examples use +0200. When generating dates in clients, be explicit about timezone.
- Foreground only: With the current code, the server won’t accept connections if the app is backgrounded or the device is locked.
- Local/secure networks: No TLS or auth. Use on a private network or behind a tunnel/VPN if needed.

## Troubleshooting:

Ensure the following in event of connection issues or errors:

- Your Phone and computer are on the same Wi-Fi network.
- You have set the correct device IP and port 9000.
- Health Auto Export is open in the foreground and the server is started.
- No corporate/VPN firewall blocking LAN traffic.
- You send methods correctly specified methods and tool calls.
- All required paramters are included in tool calls.
- Date formats exactly match yyyy-MM-dd HH:mm:ss Z.
- If you plan to fetch large ranges, consider smaller start/end windows to keep responses manageable.

## List of available health metrics:

The `metrics` parameter is a comma separated list of health metrics or empty string for all metrics. Find the full list of metrics below.

- `active_energy`
- `apple_exercise_time`
- `apple_move_time`
- `apple_sleeping_wrist_temperature`
- `apple_stand_hour`
- `apple_standtime`
- `atrial_fibrillation_burden`
- `basal_body_temperature`
- `basal_energy`
- `blood_glucose`
- `blood_oxygen_saturation`
- `blood_pressure`
- `body_fat_percentage`
- `body_mass`
- `body_mass_index`
- `body_temperature`
- `breathing_disturbances`
- `biotin`
- `caffeine`
- `calcium`
- `carbohydrates`
- `chloride`
- `cholesterol`
- `chromium`
- `copper`
- `cycling_cadence`
- `cycling_distance`
- `cycling_functional_threshold_power`
- `cycling_power`
- `cycling_speed`
- `dietary_energy`
- `downhill_snow_sports`
- `environmental_audio`
- `fiber`
- `flights_climbed`
- `folate`
- `forced_expiratory_volume`
- `forced_vital_capacity`
- `headphone_audio`
- `heart_rate`
- `heart_rate_recovery_one_minute`
- `heart_rate_variability`
- `height`
- `inhaler_usage`
- `insulin_delivery`
- `lean_body_mass`
- `mindful_minutes`
- `peak_expiratory_flow_rate`
- `peripheral_perfusion_index`
- `physical_effort`
- `respiratory_rate`
- `resting_heart_rate`
- `running_ground_contact_time`
- `running_power`
- `running_speed`
- `running_stride_length`
- `running_vertical_oscillation`
- `sexual_activity`
- `six_minute_walking_test_distance`
- `sleep_analysis`
- `stair_speed_down`
- `stair_speed_up`
- `step_count`
- `sugar`
- `swim_stroke_count`
- `swimming_distance`
- `under_water_depth`
- `vo2_max`
- `waist_circumference`
- `walk_run_distance`
- `walking_asymmetry_percentage`
- `walking_double_support_percentage`
- `walking_heart_rate`
- `walking_speed`
- `walking_step_length`
- `water`
- `wheelchair_distance`
- `wheelchair_push_count`
