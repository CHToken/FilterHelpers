// src/utils/connection.ts
import { Connection } from "@solana/web3.js";
import WebSocket from "ws";
import { COMMITMENT_LEVEL, RPC_ENDPOINT, RPC_WEBSOCKET_ENDPOINT } from "./constants";
import { logger } from "./logger";

let connection: Connection;
let ws: WebSocket | null = null;
let pingInterval: NodeJS.Timeout | null = null;
let reconnecting = false;

// Track subscriptions so we can restore them on reconnect
const subscriptions: (() => void)[] = [];

export function trackSubscription(fn: () => void) {
  subscriptions.push(fn);
}

function restoreSubscriptions() {
  logger.info("♻️ Restoring subscriptions...");
  subscriptions.forEach((fn) => {
    try {
      fn();
    } catch (err) {
      logger.error("❌ Failed to restore subscription", err);
    }
  });
}

function createConnection() {
  connection = new Connection(RPC_ENDPOINT, {
    wsEndpoint: RPC_WEBSOCKET_ENDPOINT,
    commitment: COMMITMENT_LEVEL,
  });

  // ⚡ Direct access to underlying WebSocket
  ws = (connection as any)._rpcWebSocket?.socket;

  if (ws) {
    ws.on("open", () => {
      logger.info("🔗 WebSocket connected");
    });

    ws.on("close", () => {
      logger.warn("⚠️ WebSocket closed. Reconnecting...");
      reconnect();
    });

    ws.on("error", (err: any) => {
      logger.error("❌ WebSocket error:", err);
      reconnect();
    });
  }

  // Start ping loop once
  if (!pingInterval) {
    pingInterval = setInterval(() => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        try {
          ws.ping();
          // logger.debug("📡 WS ping sent"); // optional
        } catch (err) {
          logger.error("❌ Ping failed:", err);
        }
      }
    }, 30000); // 30s
  }

  return connection;
}

function reconnect() {
  if (reconnecting) return; // prevent spam
  reconnecting = true;

  setTimeout(() => {
    logger.info("🔄 Reconnecting to RPC WebSocket...");
    createConnection();
    restoreSubscriptions();
    reconnecting = false;
  }, 2000);
}

// Initialize once
connection = createConnection();

export { connection };
