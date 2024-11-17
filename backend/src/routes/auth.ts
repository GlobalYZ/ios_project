import { FastifyInstance } from "fastify";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post<{ Body: RegisterRequest }>(
    "/auth/register",
    async (request, reply) => {
      try {
        const response = await axios.post(
          process.env.DB_API_URL + "api/auth/register",
          request.body
        );
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          reply
            .code(error.response?.status || 500)
            .send(error.response?.data || error.message);
        } else {
          reply.code(500).send({ error: "Internal Server Error" });
        }
      }
    }
  );
}
