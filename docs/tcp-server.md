# Health Auto Export TCP Server

## About

This document explains how to work with the [Health Auto Export](https://apple.co/3iqbU2d) TCP server on iPhone/iPad.

## Protocol

- **Transport:** Raw TCP (no HTTP, no TLS)
- **Encoding:** UTF-8 JSON
- **Connection model:** One request per connection — the server sends a response and closes the socket
- **Default port:** 9000
- **Security:** No TLS or authentication. Only use on a trusted local network.

### Request Format

JSON-RPC 2.0 objects:

```json
{"jsonrpc":"2.0", "id":"1", "method":"callTool", "params":{...}}
```

### Supported Methods

| Method | Description |
|--------|-------------|
| `callTool` | Invoke a tool with arguments (see below) |
| `listTools` | Discover available tools and their schemas (**known issue:** not yet functional, fix coming in a future app release) |

## Setup

### 1. Start the Health Data Server

1. Open the Health Auto Export app on your iPhone/iPad
2. Navigate to `Automations > Server > Start Server`

_The TCP server requires premium access after the free trial period._

### 2. Find Your Device's IP Address

On the iPhone/iPad:

1. Go to `Settings > Wi-Fi > tap the info (i) next to your connected network`
2. Note the IP Address (e.g., `192.168.1.37`)

### 3. Send a Request

Ensure your computer and iOS device are on the same Wi-Fi network.

```bash
IP=192.168.1.37
PORT=9000
echo -n '{
  "jsonrpc":"2.0",
  "id":"1",
  "method":"callTool",
  "params":{
    "name":"health_metrics",
    "arguments":{
      "start":"2025-08-01 00:00:00 +0200",
      "end":"2025-08-31 23:59:59 +0200",
      "metrics":"step_count,heart_rate",
      "interval":"days",
      "aggregate":true
    }
  }
}' | nc $IP $PORT
```

## Tool Reference

All tools require `start` and `end` date parameters in the format: **`yyyy-MM-dd HH:mm:ss Z`** (where `Z` is a timezone offset like `+0200` or `+0000`).

### `health_metrics`

Retrieve quantitative Apple Health metrics aggregated over a date range. Covers activity, heart, body composition, nutrition, sleep, respiratory, and more.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `start` | string | Yes | — | Start of date range |
| `end` | string | Yes | — | End of date range |
| `metrics` | string | No | `""` (all) | Comma-separated list of metric names to retrieve, or empty string for all. See [full list below](#available-health-metrics). |
| `interval` | string | No | `"days"` | Aggregation interval: `"days"`, `"hours"`, `"minutes"`, or `"seconds"` |
| `aggregate` | boolean | No | `true` | Aggregate values within each interval (sum, average, etc. depending on metric type) |

**Example — daily step count and heart rate for January:**

```json
{
  "jsonrpc":"2.0", "id":"1", "method":"callTool",
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
}
```

### `workouts`

Retrieve workout sessions (runs, walks, cycling, swimming, strength training, etc.) with type, duration, energy burned, and distance.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `start` | string | Yes | — | Start of date range |
| `end` | string | Yes | — | End of date range |
| `includeMetadata` | boolean | No | `false` | Include per-workout health metric time-series (heart rate, calories, cadence, etc.) |
| `includeRoutes` | boolean | No | `false` | Include GPS latitude/longitude coordinate paths for outdoor workouts |
| `metadataAggregation` | string | No | `"minutes"` | Resolution for metadata time-series: `"minutes"` or `"seconds"` |

**Example — workouts with heart rate data at per-second resolution:**

```json
{
  "jsonrpc":"2.0", "id":"2", "method":"callTool",
  "params":{
    "name":"workouts",
    "arguments":{
      "start":"2025-03-01 00:00:00 +0000",
      "end":"2025-03-31 23:59:59 +0000",
      "includeMetadata":true,
      "includeRoutes":false,
      "metadataAggregation":"seconds"
    }
  }
}
```

### `symptoms`

Retrieve logged symptom entries including type, severity, and timestamps. Covers symptoms such as headaches, nausea, fatigue, dizziness, and more.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `start` | string | Yes | — | Start of date range |
| `end` | string | Yes | — | End of date range |

### `state_of_mind`

Retrieve State of Mind journal entries with mood labels, valence, and associated context. Users log how they feel at a moment or over a day.

> **Requires iOS 18 or later.**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `start` | string | Yes | — | Start of date range |
| `end` | string | Yes | — | End of date range |

### `medications`

Retrieve medication dosage logs with medication names, dosage amounts, and timestamps of logged doses.

> **Requires iOS 26 or later.**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `start` | string | Yes | — | Start of date range |
| `end` | string | Yes | — | End of date range |

### `cycle_tracking`

Retrieve menstrual cycle data including flow level, cervical mucus quality, and other cycle-related indicators.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `start` | string | Yes | — | Start of date range |
| `end` | string | Yes | — | End of date range |

### `ecg`

Retrieve Apple Watch electrocardiogram (ECG) recordings with classification (sinus rhythm, atrial fibrillation, inconclusive, etc.), average heart rate, and voltage measurements.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `start` | string | Yes | — | Start of date range |
| `end` | string | Yes | — | End of date range |

### `heart_notifications`

Retrieve heart-related notification events from Apple Watch — irregular rhythm alerts, high/low heart rate warnings, and associated data.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `start` | string | Yes | — | Start of date range |
| `end` | string | Yes | — | End of date range |

## Tips & Limitations

- **One request per connection.** The server closes the socket after sending the response. Open a new TCP connection for each request.
- **Message size limit.** The receiver reads up to ~8 KB per receive call. Keep requests small as a single JSON object (no streaming or chunking).
- **Valid JSON only.** UTF-8 encoded, no trailing commas, no comments.
- **Timezone awareness.** Be explicit about timezone offsets in date parameters. Do not omit the `Z` offset.
- **Foreground only.** The server will not accept connections if the app is backgrounded or the device is locked.
- **No TLS or auth.** Use on a private/trusted network, or tunnel through a VPN.
- **Large date ranges.** Fetching months of data can produce very large responses. Use smaller date windows or filter specific metrics to keep responses manageable.

## Troubleshooting

If you experience connection issues or errors, verify the following:

- Your computer and iOS device are on the **same Wi-Fi network**
- You have set the correct device **IP address** and **port 9000**
- Health Auto Export is **open in the foreground** and the server is **started**
- No corporate/VPN firewall is **blocking LAN traffic**
- The `method` is spelled correctly (`callTool`, not `calltool`)
- All **required parameters** (`start`, `end`) are included
- Date formats **exactly match** `yyyy-MM-dd HH:mm:ss Z` (e.g., `2025-08-01 00:00:00 +0200`)

## Available Health Metrics

The `metrics` parameter for `health_metrics` accepts a comma-separated list of names, or an empty string for all. Below is the full list, grouped by category.

### Activity & Movement
- `active_energy` — Active energy burned (kcal)
- `apple_exercise_time` — Exercise minutes
- `apple_move_time` — Move time (minutes)
- `apple_stand_hour` — Stand hours
- `apple_standtime` — Stand time (minutes)
- `flights_climbed` — Flights of stairs climbed
- `physical_effort` — Physical effort intensity (kcal/hr/kg)
- `step_count` — Steps taken
- `walk_run_distance` — Walking + running distance (km)

### Heart & Cardiovascular
- `heart_rate` — Heart rate (bpm), includes min/max/avg
- `heart_rate_recovery_one_minute` — Heart rate recovery 1 min after exercise
- `heart_rate_variability` — HRV in milliseconds
- `resting_heart_rate` — Resting heart rate (bpm)
- `walking_heart_rate` — Average heart rate while walking
- `atrial_fibrillation_burden` — AFib burden percentage
- `blood_pressure` — Systolic/diastolic blood pressure
- `blood_oxygen_saturation` — SpO2 percentage
- `peripheral_perfusion_index` — Peripheral perfusion index
- `vo2_max` — VO2 max (mL/kg/min)

### Sleep
- `sleep_analysis` — Sleep stages (deep, REM, core, awake, in-bed duration)
- `apple_sleeping_wrist_temperature` — Wrist temperature during sleep

### Body Composition
- `body_mass` — Body weight
- `body_mass_index` — BMI
- `body_fat_percentage` — Body fat %
- `lean_body_mass` — Lean body mass
- `height` — Height
- `waist_circumference` — Waist circumference

### Respiratory
- `respiratory_rate` — Breaths per minute
- `breathing_disturbances` — Breathing disturbance events during sleep
- `forced_expiratory_volume` — FEV1
- `forced_vital_capacity` — FVC
- `peak_expiratory_flow_rate` — Peak expiratory flow
- `inhaler_usage` — Inhaler usage count

### Running
- `running_ground_contact_time` — Ground contact time
- `running_power` — Running power (watts)
- `running_speed` — Running speed (km/hr)
- `running_stride_length` — Stride length
- `running_vertical_oscillation` — Vertical oscillation

### Walking & Mobility
- `walking_speed` — Walking speed (km/hr)
- `walking_step_length` — Step length (cm)
- `walking_asymmetry_percentage` — Walking asymmetry %
- `walking_double_support_percentage` — Double support time %
- `stair_speed_down` — Stair descent speed
- `stair_speed_up` — Stair ascent speed
- `six_minute_walking_test_distance` — 6-minute walk test distance

### Cycling
- `cycling_cadence` — Cycling cadence (RPM)
- `cycling_distance` — Cycling distance (km)
- `cycling_functional_threshold_power` — FTP (watts)
- `cycling_power` — Cycling power (watts)
- `cycling_speed` — Cycling speed (km/hr)

### Swimming
- `swim_stroke_count` — Swim stroke count
- `swimming_distance` — Swimming distance
- `under_water_depth` — Underwater depth

### Other Sports
- `downhill_snow_sports` — Downhill snow sports distance
- `wheelchair_distance` — Wheelchair distance
- `wheelchair_push_count` — Wheelchair push count

### Nutrition
- `dietary_energy` — Dietary calories consumed (kcal)
- `carbohydrates` — Carbohydrates (g)
- `fiber` — Dietary fiber (g)
- `sugar` — Sugar (g)
- `caffeine` — Caffeine (mg)
- `water` — Water intake (mL)
- `cholesterol` — Cholesterol (mg)

### Vitamins & Minerals
- `biotin` — Biotin (mcg)
- `calcium` — Calcium (mg)
- `chloride` — Chloride (mg)
- `chromium` — Chromium (mcg)
- `copper` — Copper (mg)
- `folate` — Folate (mcg)

### Metabolic
- `basal_body_temperature` — Basal body temperature
- `basal_energy` — Basal energy burned (kcal)
- `blood_glucose` — Blood glucose level
- `body_temperature` — Body temperature
- `insulin_delivery` — Insulin delivery

### Audio & Environment
- `environmental_audio` — Environmental sound level (dBASPL)
- `headphone_audio` — Headphone audio level (dBASPL)

### Mindfulness & Other
- `mindful_minutes` — Mindful minutes
- `sexual_activity` — Sexual activity
