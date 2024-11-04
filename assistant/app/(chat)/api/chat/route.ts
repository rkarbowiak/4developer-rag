import { call4DevAssistantStream } from '@4dev/rag';
import { convertToCoreMessages, Message, StreamingTextResponse } from 'ai';
import { NextResponse } from 'next/server';

import { models } from '@/ai/models';
import { auth } from '@/app/(auth)/auth';
import { deleteChatById, getChatById, saveChat } from '@/db/queries';

export const maxDuration = 60;

const sleep = async (delay: number) =>
  new Promise((resolve) => setTimeout(resolve, delay));

export async function POST(request: Request) {
  const {
    id,
    messages,
    modelId,
  }: { id: string; messages: Array<Message>; modelId: string } =
    await request.json();

  const session = await auth();

  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  const model = models.find((model) => model.id === modelId);

  if (!model) {
    return new Response('Model not found', { status: 404 });
  }

  const lastQuestion = messages.at(-1)?.content;

  if (!lastQuestion) {
    return new Response('Question not found', { status: 404 });
  }

  const history = messages.slice(0, -1);

  const answer = await call4DevAssistantStream(
    lastQuestion,
    history.length > 0 ? history : []
  );

  async function* transformStream(stream: any) {
    let index = 0;
    const reader = stream.getReader();

    let fullAnswer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const words = value.split(/(\s+)/).filter(Boolean);

      for (const word of words) {
        await sleep(25);
        const sanitizedWord = word.replace(/"/g, "'").replace(/\n/g, '\\n');

        yield `${index}: "${sanitizedWord}"\n`;
      }

      fullAnswer += value;
    }

    yield `e:{"finishReason":"stop","isContinued":false}\n`;
    yield `d:{"finishReason":"stop"}`;

    if (session?.user && session.user.id) {
      const coreMessages = convertToCoreMessages(messages);

      try {
        await saveChat({
          id,
          messages: [
            ...coreMessages,
            { role: 'assistant', content: fullAnswer },
          ],
          userId: session.user.id,
        });
      } catch (error) {
        console.error('Failed to save chat:', error);
      }
    }
  }

  const transferredStream = transformStream(answer);

  return new NextResponse(transferredStream as unknown as BodyInit);
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new Response('Not Found', { status: 404 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const chat = await getChatById({ id });

    if (chat.userId !== session.user.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    await deleteChatById({ id });

    return new Response('Chat deleted', { status: 200 });
  } catch (error) {
    return new Response('An error occurred while processing your request', {
      status: 500,
    });
  }
}
