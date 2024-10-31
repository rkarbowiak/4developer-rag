'use client';

import cx from 'classnames';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { Dispatch, ReactNode, SetStateAction } from 'react';

import { Markdown } from './markdown';

import { UICanvas } from '@/components/custom/canvas';

export const Message = ({
  role,
  content,
  canvas,
  setCanvas,
}: {
  role: string;
  content: string | ReactNode;
  canvas: UICanvas;
  setCanvas: Dispatch<SetStateAction<UICanvas>>;
}) => {
  return (
    <motion.div
      className="w-full mx-auto max-w-3xl px-4 group/message "
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      data-role={role}
    >
      <div
        className={cx(
          'flex gap-4 group-data-[role=user]/message:px-5 w-full group-data-[role=user]/message:w-fit group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:py-3.5 rounded-xl',
          {
            'group-data-[role=user]/message:bg-muted': !canvas,
            'group-data-[role=user]/message:bg-zinc-300 dark:group-data-[role=user]/message:bg-violet-900':
              canvas,
          }
        )}
      >
        {role === 'assistant' && (
          <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border">
            <Sparkles className="size-4" />
          </div>
        )}
        <div className="flex flex-col gap-2 w-full">
          {content && (
            <div className="flex flex-col gap-4">
              <Markdown>{content as string}</Markdown>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
