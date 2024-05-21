import { Pinecone } from "@pinecone-database/pinecone";
import { Document } from "@langchain/core/documents";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import presentations from "../presentations.json";
import "dotenv/config";

const pinecone = new Pinecone();

const pineconeIndex = pinecone.Index("meetjs");

await pineconeIndex.deleteAll();
console.log("Pinecone index cleared.");

const docs = presentations.map(
  (presentation) =>
    new Document({
      metadata: presentation,
      pageContent: `${presentation.title}, ${presentation.body}, ${presentation.tags}`,
    }),
);

await PineconeStore.fromDocuments(docs, new OpenAIEmbeddings(), {
  pineconeIndex,
  maxConcurrency: 5,
});
console.log("Documents inserted in Pinecone.");
