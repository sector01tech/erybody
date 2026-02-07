import { useSeoMeta } from '@unhead/react';
import { Layout } from '@/components/Layout';
import { DMMessagingInterface } from '@/components/dm/DMMessagingInterface';

const Messages = () => {
  useSeoMeta({
    title: 'Messages - erybody',
    description: 'Private encrypted messaging on Nostr',
  });

  return (
    <Layout>
      <div className="h-full flex flex-col">
        <DMMessagingInterface className="flex-1" />
      </div>
    </Layout>
  );
};

export default Messages;
