// @ts-nocheck
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import "dotenv/config";
import { formatDocumentsAsString } from "langchain/util/document";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import {
  RunnablePassthrough,
  RunnableSequence,
} from "@langchain/core/runnables";
import { Pinecone } from "@pinecone-database/pinecone";
import { StringOutputParser } from "@langchain/core/output_parsers";

class CustomApiProvider {
  constructor(options) {
    // Provider ID can be overridden by the config file (e.g. when using multiple of the same provider)
    this.providerId = options.id || "custom provider";

    // options.config contains any custom options passed to the provider
    this.config = options.config;
  }

  id() {
    return this.providerId;
  }

  async callApi(prompt: any, context: any) {
    const model = new ChatOpenAI({
      model: "gpt-4o",
      temperature: 0.25,
    });

    const pinecone = new Pinecone();

    const pineconeIndex = pinecone.Index("developerskie");
    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings(),
      { pineconeIndex },
    );
    const vectorStoreRetriever = vectorStore.asRetriever();

    const SYSTEM_TEMPLATE = `
      Role: You are an assistant that answers the question related to "Developerskie". Developerskie is an event for developers
      where devs can prepare a presentation, talk about a topic, or ask questions. The event is held in a friendly atmosphere and is open to everyone. Based on the context below, your role is 
      to provide answers to questions related to the topics discussed at Developerskie. Reply in short, informative manner, up to 3 sentences.
      ----------------
      {context}`;

    const prompts = ChatPromptTemplate.fromMessages([
      ["system", SYSTEM_TEMPLATE],
      ["human", "{question}"],
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

    const answer = await chain.invoke(prompt);

    return {
      output: answer,
    };
  }
}

module.exports = CustomApiProvider;
