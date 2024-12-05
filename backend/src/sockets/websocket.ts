import { FastifyInstance } from "fastify";
import WebSocket, { WebSocketServer } from "ws";
import {
  saveMessage,
  getRecentMessages,
  clearMessages,
} from "../redis/message";
import { dumpMessagesToDB } from "../redis/dumpService";

const connectedClients: Record<string, Set<WebSocket>> = {};
const dumpTimers: Record<string, NodeJS.Timeout> = {};

export function setupWebsocket(server: FastifyInstance) {
  // Create a WebSocket server and attach it to the Fastify server
  const wss = new WebSocketServer({ noServer: true });

  // Handle WebSocket upgrade requests
  server.server.on("upgrade", (request, socket, head) => {
    if (request.url?.startsWith("/ws")) {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    } else {
      socket.destroy();
    }
  });

  // Handle WebSocket connections
  wss.on("connection", async (socket, request) => {
    const url = request.url;

    if (!url) {
      console.error("No URL found in request");
      socket.close();
      return;
    }

    const querystring = url.split("?")[1];
    const groupId = querystring?.split("=")[1];

    if (!groupId) {
      console.error("No group ID found in URL");
      socket.close();
      return;
    }

    if (!connectedClients[groupId]) {
      connectedClients[groupId] = new Set();

      dumpTimers[groupId] = setInterval(() => {
        dumpMessagesToDB(groupId);
      }, 10 * 60 * 1000);
    }

    connectedClients[groupId].add(socket);

    const recentMessages = await getRecentMessages(groupId);
    console.log(`Sending ${recentMessages} recent messages to client`);
    socket.send(JSON.stringify({ type: "recentMessages", messages: recentMessages }));

    socket.on("message", async (messageBuffer) => {
      const message = JSON.parse(messageBuffer.toString());
      console.log(`Received message: ${message}`);

      await saveMessage(message);
    

      // Broadcast message to all connected clients in the same group
      for (const client of connectedClients[groupId]) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: "newMessage", message }));
        }
      }
    });

    socket.on("close", async () => {
      // Remove the disconnected socket from the group
      connectedClients[groupId].delete(socket);
    
      // Check if no users are left in the group
      if (connectedClients[groupId].size === 0) {
        console.log(`All users have left group ${groupId}. Cleaning up...`);
    
        // Clear the interval for dumping messages
        clearInterval(dumpTimers[groupId]);
        delete dumpTimers[groupId];
    
        // Safely dump Redis messages to the database before clearing Redis
        try {
          console.log(`Dumping messages for group ${groupId} to the database...`);
          await dumpMessagesToDB(groupId); // Save messages to the database
          console.log(`Messages for group ${groupId} successfully saved.`);
        } catch (error) {
          console.error(
            `Failed to dump messages for group ${groupId} to the database:`,
            error
          );
          // Optionally, you might want to retry or log for monitoring
        }
    
        // Clear Redis only after confirming dump is successful
        try {
          console.log(`Clearing messages for group ${groupId} from Redis...`);
          await clearMessages(groupId); // Remove messages from Redis
          console.log(`Messages for group ${groupId} successfully cleared.`);
        } catch (error) {
          console.error(
            `Failed to clear messages for group ${groupId} from Redis:`,
            error
          );
        }
      } else {
        console.log(
          `User disconnected from group ${groupId}. Remaining users: ${connectedClients[groupId].size}`
        );
      }
    });
    
  });
}
