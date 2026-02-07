import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import type { NostrEvent } from '@nostrify/nostrify';
import { nip57 } from 'nostr-tools';

export function useNoteStats(event: NostrEvent | null) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['note-stats', event?.id],
    queryFn: async () => {
      if (!event) return { replies: [], reactions: [], reposts: [], zaps: [], replyCount: 0, likeCount: 0, repostCount: 0, zapTotal: 0 };

      // Query for all interactions with this note
      const interactions = await nostr.query([
        {
          kinds: [1, 6, 7, 9735], // Replies, reposts, reactions, zaps
          '#e': [event.id],
          limit: 500,
        },
      ]);

      // Separate by type
      const replies = interactions.filter(e => e.kind === 1);
      const reposts = interactions.filter(e => e.kind === 6);
      const reactions = interactions.filter(e => e.kind === 7);
      const zaps = interactions.filter(e => e.kind === 9735);

      // Count likes (reactions with + or ❤️ or empty content)
      const likes = reactions.filter(r => 
        !r.content || r.content === '+' || r.content === '❤️' || r.content === '❤'
      );

      // Calculate total zap amount
      let zapTotal = 0;
      zaps.forEach(zap => {
        // Method 1: amount tag
        const amountTag = zap.tags.find(([name]) => name === 'amount')?.[1];
        if (amountTag) {
          const millisats = parseInt(amountTag);
          zapTotal += Math.floor(millisats / 1000);
          return;
        }

        // Method 2: bolt11 invoice
        const bolt11Tag = zap.tags.find(([name]) => name === 'bolt11')?.[1];
        if (bolt11Tag) {
          try {
            const sats = nip57.getSatoshisAmountFromBolt11(bolt11Tag);
            zapTotal += sats;
            return;
          } catch (error) {
            // Ignore parsing errors
          }
        }

        // Method 3: description
        const descriptionTag = zap.tags.find(([name]) => name === 'description')?.[1];
        if (descriptionTag) {
          try {
            const zapRequest = JSON.parse(descriptionTag);
            const requestAmountTag = zapRequest.tags?.find(([name]: string[]) => name === 'amount')?.[1];
            if (requestAmountTag) {
              const millisats = parseInt(requestAmountTag);
              zapTotal += Math.floor(millisats / 1000);
            }
          } catch (error) {
            // Ignore parsing errors
          }
        }
      });

      return {
        replies,
        reactions,
        reposts,
        zaps,
        replyCount: replies.length,
        likeCount: likes.length,
        repostCount: reposts.length,
        zapTotal,
      };
    },
    enabled: !!event?.id,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });
}
