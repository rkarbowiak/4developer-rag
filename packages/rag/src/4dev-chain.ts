import { StringOutputParser } from "@langchain/core/output_parsers";
import {
  ChatMessagePromptTemplate,
  ChatPromptTemplate,
} from "@langchain/core/prompts";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";
import { formatDocumentsAsString } from "langchain/util/document";
import { SYSTEM_PROMPT } from "./prompts/system-prompt";
import {
  RunnablePassthrough,
  RunnableSequence,
} from "@langchain/core/runnables";
import { DEFAULT_MODEL, DEVELOPER4_DATE } from "./const";

interface CallAssistantProps {
  model: string;
  date: string;
}

export type AsisstantMessage = {
  role: "function" | "system" | "tool" | "user" | "assistant" | "data";
  content: string;
};

export const create4DevChain = async (
  history: AsisstantMessage[],
  callAssistantProps: CallAssistantProps = {
    model: DEFAULT_MODEL,
    date: DEVELOPER4_DATE,
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
    k: 10,
  });

  const prompts = ChatPromptTemplate.fromMessages([
    ["system", SYSTEM_PROMPT],
    ...history.map((m) =>
      ChatMessagePromptTemplate.fromTemplate(m.content, m.role),
    ),
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

  return chain;
};

interface CallAssistantProps {
  model: string;
  date: string;
}

export const call4DevAssistantStream = async (
  question: string,
  history: AsisstantMessage[],
  callAssistantProps?: CallAssistantProps,
) => {
  const chain = await create4DevChain(history, callAssistantProps);

  return await chain.stream(question);
};

export const call4DevAssistantText = async (
  question: string,
  history: AsisstantMessage[],
  callAssistantProps?: CallAssistantProps,
) => {
  const chain = await create4DevChain(history, callAssistantProps);

  return await chain.invoke(question);
};
