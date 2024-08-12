import "dotenv/config";
import { Pinecone } from "@pinecone-database/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";

const loader = new CSVLoader("./developerskie.csv");
const docs = await loader.load();

const pinecone = new Pinecone();

const pineconeIndex = pinecone.Index("developerskie");

pineconeIndex.deleteAll();

console.log("Inserting documents in Pinecone...");

await PineconeStore.fromDocuments(docs, new OpenAIEmbeddings(), {
  pineconeIndex,
});

console.log("Documents inserted in Pinecone.");
