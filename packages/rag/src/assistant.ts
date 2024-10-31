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

const model = new ChatOpenAI({
  model: "gpt-4o",
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
    date: "5 lis 2024",
  },
});

const prompts = ChatPromptTemplate.fromMessages([
  ["system", SYSTEM_PROMPT],
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

const answer = await chain.invoke(
  "Are there any interesting topics about DDD?",
);

console.log({ answer });
