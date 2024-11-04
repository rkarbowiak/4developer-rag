import "dotenv/config";
import { Pinecone } from "@pinecone-database/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import events from "../../4dev-output.json";
import { Document } from "@langchain/core/documents";

export async function insertDocuments() {
  const docs = events.map(
    (event) =>
      new Document({
        pageContent: Object.values(event).join(" | "),
        metadata: event,
      }),
  );

  const pinecone = new Pinecone();

  const pineconeIndex = pinecone.Index("4developers");

  pineconeIndex.deleteAll();

  console.log("Inserting documents in Pinecone...");

  await PineconeStore.fromDocuments(docs, new OpenAIEmbeddings(), {
    pineconeIndex,
  });

  console.log("Documents inserted in Pinecone.");
}
