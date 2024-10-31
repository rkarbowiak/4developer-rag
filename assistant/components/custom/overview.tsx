import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

export const Overview = () => {
  return (
    <motion.div
      key="overview"
      className="max-w-3xl mx-auto md:mt-20"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: 0.5 }}
    >
      <div className="rounded-xl p-6 flex flex-col gap-8 leading-relaxed text-center max-w-xl">
        <p className="flex flex-row justify-center gap-4 items-center">
          <Image
            src={'/images/4developers_logo_light.png'}
            width={'162'}
            height={'29'}
            alt={'4dev logo'}
          />
        </p>
        <p>
          This is a 4Developer assistant used for presentation purposes. The
          website is created based on the{' '}
          <Link
            className="font-medium underline underline-offset-4"
            href="https://github.com/vercel/ai-chatbot"
            target="_blank"
          >
            open source
          </Link>{' '}
          chatbot template built with Next.js.
        </p>
        <p>
          You can ask any questions you want about the 4Developers conference. I
          have the knowledge about all the presentations and agenda for
          4Developer Wrocław conference.
        </p>
      </div>
    </motion.div>
  );
};
