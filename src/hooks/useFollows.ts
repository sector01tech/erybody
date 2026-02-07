import { useNostr } from '@nostrify/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { useToast } from '@/hooks/useToast';

export function useFollows() {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();
  const { mutate: createEvent } = useNostrPublish();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's follow list (kind 3)
  const { data: followList, isLoading } = useQuery({
    queryKey: ['follows-list', user?.pubkey],
    queryFn: async () => {
      if (!user?.pubkey) return null;

      const events = await nostr.query([
        {
          kinds: [3],
          authors: [user.pubkey],
          limit: 1,
        },
      ]);

      return events[0] || null;
    },
    enabled: !!user?.pubkey,
  });

  // Get followed pubkeys
  const followedPubkeys = followList?.tags
    .filter(([name]) => name === 'p')
    .map(([_, pubkey]) => pubkey) || [];

  const isFollowing = (pubkey: string) => {
    return followedPubkeys.includes(pubkey);
  };

  const follow = (pubkey: string, relay = '', petname = '') => {
    if (!user) {
      toast({
        title: 'Login required',
        description: 'Please log in to follow users.',
        variant: 'destructive',
      });
      return;
    }

    // Get existing tags or create new array
    const existingTags = followList?.tags.filter(([name]) => name !== 'p') || [];
    const existingPTags = followList?.tags.filter(([name]) => name === 'p') || [];

    // Add new follow if not already present
    if (!followedPubkeys.includes(pubkey)) {
      const newPTags = [
        ...existingPTags,
        ['p', pubkey, relay, petname],
      ];

      createEvent(
        {
          kind: 3,
          content: followList?.content || '',
          tags: [...existingTags, ...newPTags],
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['follows-list'] });
            toast({
              title: 'Followed!',
              description: 'You are now following this user.',
            });
          },
          onError: () => {
            toast({
              title: 'Error',
              description: 'Failed to follow user.',
              variant: 'destructive',
            });
          },
        }
      );
    }
  };

  const unfollow = (pubkey: string) => {
    if (!user || !followList) return;

    // Remove the follow
    const newTags = followList.tags.filter(
      ([name, value]) => !(name === 'p' && value === pubkey)
    );

    createEvent(
      {
        kind: 3,
        content: followList.content || '',
        tags: newTags,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['follows-list'] });
          toast({
            title: 'Unfollowed',
            description: 'You unfollowed this user.',
          });
        },
        onError: () => {
          toast({
            title: 'Error',
            description: 'Failed to unfollow user.',
            variant: 'destructive',
          });
        },
      }
    );
  };

  const toggleFollow = (pubkey: string, relay = '', petname = '') => {
    if (isFollowing(pubkey)) {
      unfollow(pubkey);
    } else {
      follow(pubkey, relay, petname);
    }
  };

  return {
    followedPubkeys,
    followCount: followedPubkeys.length,
    isFollowing,
    follow,
    unfollow,
    toggleFollow,
    isLoading,
  };
}
