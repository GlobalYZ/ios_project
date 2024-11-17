// src/index.ts
import fastify, { FastifyInstance, FastifyRequest } from "fastify";
import { authRoutes } from "./routes/auth";
import { friendRoutes } from "./routes/friend";
import jwt from "jsonwebtoken";
import { JWTPayload } from "./models/server";

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

const verifyToken = async (request: FastifyRequest) => {
  try {
    const token = request.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      throw new Error("no JWT token provided");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;

    // check if the token is expired
    if (Date.now() >= decoded.exp * 1000) {
      throw new Error("JWT token expired");
    }

    return decoded;
  } catch (error) {
    throw new Error("invalid JWT token");
  }
};

//token verification middleware, all routes registered after this middleware will be protected
server.addHook("preHandler", verifyToken);

server.register(friendRoutes, { prefix: "/api" });

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
