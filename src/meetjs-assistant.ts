import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";
import "dotenv/config";

const openai = new ChatOpenAI({
  model: "gpt-4o",
  temperature: 0.5,
});
const pinecone = new Pinecone();

const pineconeIndex = pinecone.Index("meetjs");
const vectorStore = await PineconeStore.fromExistingIndex(
  new OpenAIEmbeddings(),
  { pineconeIndex },
);

const question = "Where is next meet.js taking place?";

const retrieval = await vectorStore.similaritySearchWithScore(question, 20);
console.log("Retrieval:");
console.log(retrieval.map((r) => r[0].pageContent));

const systemTemplate = `
Role: You are an assistant for meet js meetup attenders. Based on the given question and context, you should provide the most relevant information about the meetup. Respond with concise answers up to 3 sentences. 
Context: ${retrieval.map((r) => JSON.stringify(r[0].metadata)).join("\n")}
Current date: ${new Date().toISOString()}`;

const messages = [
  new SystemMessage(systemTemplate),
  new HumanMessage(question),
];

console.log("Messages:");
console.log(messages);

const response = await openai.invoke(messages);

console.log("Response:");
console.log(response.content);
