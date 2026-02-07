import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import type { NostrEvent } from '@nostrify/nostrify';

export function usePosts(limit = 50) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['posts', limit],
    queryFn: async () => {
      const events = await nostr.query([
        {
          kinds: [1],
          limit,
        },
      ]);

      // Sort by created_at descending
      return events.sort((a, b) => b.created_at - a.created_at);
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}
