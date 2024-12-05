import { getRecentMessages, clearMessages, getRecentMessagesFromRedis } from "./message";
import { saveMessagesToDB } from "../services/databaseService";
import { Mutex } from "async-mutex";

const groupLocks: Record<string, Mutex> = {};

export async function dumpMessagesToDB(groupId: string) {
    console.log(`Dumping messages for group ${groupId}, time: ${new Date().toISOString()}`);
    if (!groupLocks[groupId]) {
      groupLocks[groupId] = new Mutex();
    }
  
    const mutex = groupLocks[groupId];
    await mutex.runExclusive(async () => {
      const messages = await getRecentMessagesFromRedis(groupId);
      console.log(`THis is the messages that are being dumped in dumpMessagesToDB: ${messages[0].message}`);
      if (messages.length === 0) return;
  
      await saveMessagesToDB(groupId, messages);
      await clearMessages(groupId);
    });
  }