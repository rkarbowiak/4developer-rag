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
import { SYSTEM_PROMPT } from "../prompts/system-prompt";
import { call4DevAssistantText } from "../4dev-chain";

class CustomApiProvider {
  constructor(options) {
    this.providerId = options.id || "custom provider";
    this.config = options.config;
  }

  id() {
    return this.providerId;
  }

  async callApi(prompt, context) {
    const answer = await call4DevAssistantText(prompt, []);

    return {
      output: answer,
    };
  }
}

export default CustomApiProvider;
