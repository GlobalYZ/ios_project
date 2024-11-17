import { FastifyInstance } from "fastify";
import axios from "axios";
import { errorHandler } from "../services/dbErrorHandler";

interface AddFriendRequest {
  userId: string;
  friendId: string;
}

export async function friendRoutes(fastify: FastifyInstance) {
  fastify.post<{ Body: AddFriendRequest }>(
    "/friend/add",
    async (request, reply) => {
      try {
        const response = await axios.post(
          process.env.DB_API_URL + "api/friend/add",
          request.body
        );
        return response.data;
      } catch (error) {
        errorHandler(error, reply);
      }
    }
  );
}
