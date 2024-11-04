import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import { LlamaCpp } from "@langchain/community/llms/llama_cpp";

import "dotenv/config";

const llamaPath = "../rags/llama/Meta-Llama-3-8B-Instruct-Q4_K_M.gguf";

const openai = new ChatOpenAI();
const anthropic = new ChatAnthropic();
const llama = new LlamaCpp({
  modelPath: llamaPath,
  maxTokens: 100,
});

const question = "What we will drink today during MeetJS meetup?";

const antropicResponse = await anthropic.invoke(question);
console.log(antropicResponse.content);

const openaiResponse = await openai.invoke(question);
console.log(openaiResponse.content);

const llamaResponse = await llama.invoke(question, {
  maxTokens: 100,
  stop: ["\n", "<|eot_id|>", "<|end_of_text|>", "assistant:"],
  recursionLimit: 10,
});
console.log(llamaResponse);
