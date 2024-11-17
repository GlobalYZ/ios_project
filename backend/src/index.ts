// src/index.ts
import fastify, { FastifyInstance } from "fastify";
import { authRoutes } from "./routes/auth";

const server: FastifyInstance = fastify({
  logger: {
    level: "info",
    transport: {
      target: "pino-pretty", // pretty format for log output
    },
  },
});

// add error handling
process.on("unhandledRejection", (err) => {
  console.error("unhandled rejection:", err);
  process.exit(1);
});

// register plugins
server.register(require("@fastify/cors"), {
  origin: true, // allow all origins
});
server.register(require("@fastify/formbody"));

// register routes
server.register(authRoutes, { prefix: "/api" }); // add api prefix

// test route
server.get("/", async () => {
  return { status: "ok", message: "server is running" };
});

const start = async () => {
  try {
    const address = await server.listen({
      port: 3001,
      host: "127.0.0.1",
    });
    console.log(`server started at: ${address}`);
  } catch (err) {
    console.error("server start failed:", err);
    process.exit(1);
  }
};

start();
