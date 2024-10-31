import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import "dotenv/config";
import { formatDocumentsAsString } from "langchain/util/document";
import {
  RunnablePassthrough,
  RunnableSequence,
} from "@langchain/core/runnables";
import { Pinecone } from "@pinecone-database/pinecone";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { SYSTEM_PROMPT } from "./prompts/system-prompt";

interface CallAssistantProps {
  model: string;
  date: string;
}

export type AsisstantMessage = {
  role: "function" | "system" | "tool" | "user" | "assistant" | "data";
  content: string;
};

export const call4DevAssistant = async (
  question: string,
  history: AsisstantMessage[],
  callAssistantProps: CallAssistantProps = {
    model: "gpt-4o",
    date: "5 lis 2024",
  },
) => {
  const model = new ChatOpenAI({
    model: callAssistantProps.model,
    temperature: 0.25,
  });

  const pinecone = new Pinecone();

  const pineconeIndex = pinecone.Index("4developers");
  const vectorStore = await PineconeStore.fromExistingIndex(
    new OpenAIEmbeddings(),
    { pineconeIndex },
  );

  const vectorStoreRetriever = vectorStore.asRetriever({
    filter: {
      date: callAssistantProps.date,
    },
  });

  console.log(...(history.map((m) => [m.role, m.content]) as any));

  const prompts = ChatPromptTemplate.fromMessages([
    ["system", SYSTEM_PROMPT],
    ...(history.map((m) => [m.role, m.content]) as any),
    ["user", "{question}"],
  ]);

  const chain = RunnableSequence.from([
    {
      question: new RunnablePassthrough(),
      context: vectorStoreRetriever.pipe(formatDocumentsAsString),
    },
    prompts,
    model,
    new StringOutputParser(),
  ]);

  console.log("co jest");
  return await chain.stream(question);
};
