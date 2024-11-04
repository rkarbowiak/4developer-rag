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
import * as hub from "langchain/hub";

const prompt = await hub.pull("test");

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

const vectorStoreRetriever = vectorStore.asRetriever();

const chain = RunnableSequence.from([
  {
    question: new RunnablePassthrough(),
    context: vectorStoreRetriever.pipe(formatDocumentsAsString),
  },
  prompt,
  model,
  new StringOutputParser(),
]);

const answer = await chain.invoke(
  "Are there any presentation about RAG in Wroclaw 4developer 2024?",
);

console.log({ answer });
