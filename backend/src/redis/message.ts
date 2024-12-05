import { redisClient } from "./client";
import { redisMessage, redisMessageWithTimeStamp } from "../models/chat";
import { getMessagesFromDB } from "../services/databaseService";

// Save a message to the group's message list
export async function saveMessage(message: redisMessage) {
  const messageData: redisMessageWithTimeStamp = {
    ...message,
    createdAt: new Date().toISOString(),
  };

  await redisClient.rPush(
    `group:${message.groupId}:messages`,
    JSON.stringify(messageData)
  );
}

// Retrieve the most recent 20 messages from a group
export async function getRecentMessages(
  groupId: string,
  limit: number = 20
): Promise<redisMessageWithTimeStamp[]> {
  const messagesFromRedis = await redisClient.lRange(
    `group:${groupId}:messages`,
    -limit,
    -1
  );

  if (messagesFromRedis.length > 0) {
    console.log(`Retrieved ${messagesFromRedis.length} messages from Redis`);
  return messagesFromRedis.map((msg: any) => JSON.parse(msg));
  } else {
    const messagesFromDb = await getMessagesFromDB(groupId, 0, limit);
    if (messagesFromDb.length > 0) {
      const redisMessages = messagesFromDb.map((msg) => JSON.stringify(msg));
      await redisClient.rPush(`group:${groupId}:messages`, redisMessages);
      return messagesFromDb;
    }
  }
  return [];
}

export async function clearMessages(groupId: string) {
  await redisClient.del(`group:${groupId}:messages`);
}
