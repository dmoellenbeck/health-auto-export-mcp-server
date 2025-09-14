import "dotenv/config";
import { createConnection } from "net";

const HAE_HOST = process.env.HAE_HOST || "192.168.1.137";
const HAE_PORT = parseInt(process.env.HAE_PORT || "9000");
const HAE_TIMEOUT = parseInt(process.env.HAE_TIMEOUT || "86400000");

const payload = {
  host: HAE_HOST,
  port: HAE_PORT,
  method: "callTool",
  params: {
    name: "health_metrics",
    arguments: {
      start: "2025-01-01 00:00:00 +0000",
      end: "2025-01-31 23:59:59 +0000",
    },
  },
};

const jsonrpcRequest = {
  jsonrpc: "2.0",
  id: Math.floor(Math.random() * 1000),
  method: payload.method,
  params: payload.params,
};

const message = JSON.stringify(jsonrpcRequest);

console.log("Sending JSON-RPC request:");
console.log(JSON.stringify(jsonrpcRequest, null, 2));
console.log(`\nConnecting to ${payload.host}:${payload.port}...\n`);

const client = createConnection(payload.port, payload.host, () => {
  console.log("Connected to server");
  client.write(message);
  console.log("Request sent");
});

let responseData = "";
let responseComplete = false;

client.on("data", (data) => {
  responseData += data.toString();
  console.log("Received data:", data.toString());

  try {
    const parsedResponse = JSON.parse(responseData);
    if (parsedResponse && !responseComplete) {
      responseComplete = true;
      console.log("\nParsed response:");
      console.log(JSON.stringify(parsedResponse, null, 2));
    }
  } catch (error) {
    console.log("Error parsing response:", error);
  }
});

client.on("end", () => {
  console.log("\nConnection ended");
  if (responseData) {
    try {
      const parsedResponse = JSON.parse(responseData);
      console.log("\nParsed response:");
      console.log(JSON.stringify(parsedResponse, null, 2));
    } catch (error) {
      console.log("\nRaw response (not JSON):");
      console.log(responseData);
    }
  } else {
    console.log("No response data received");
  }
  process.exit(0);
});

client.on("error", (error) => {
  console.error("Connection error:", error.message);
  process.exit(1);
});

client.on("timeout", () => {
  console.error("Connection timed out");
  client.destroy();
  process.exit(1);
});

client.setTimeout(HAE_TIMEOUT);
