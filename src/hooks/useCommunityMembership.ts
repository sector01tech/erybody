import { useNostr } from '@nostrify/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { useToast } from '@/hooks/useToast';

export function useCommunityMembership() {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();
  const { mutate: createEvent } = useNostrPublish();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's community list (kind 10004)
  const { data: communityList, isLoading } = useQuery({
    queryKey: ['communities-list', user?.pubkey],
    queryFn: async () => {
      if (!user?.pubkey) return null;

      const events = await nostr.query([
        {
          kinds: [10004],
          authors: [user.pubkey],
          limit: 1,
        },
      ]);

      return events[0] || null;
    },
    enabled: !!user?.pubkey,
  });

  // Get joined community identifiers
  const joinedCommunities = communityList?.tags
    .filter(([name]) => name === 'a')
    .map(([_, aTag]) => aTag) || [];

  const isMember = (communityATag: string) => {
    return joinedCommunities.includes(communityATag);
  };

  const joinCommunity = (communityATag: string, relay = '') => {
    if (!user) {
      toast({
        title: 'Login required',
        description: 'Please log in to join communities.',
        variant: 'destructive',
      });
      return;
    }

    // Get existing tags or create new array
    const existingTags = communityList?.tags.filter(([name]) => name !== 'a') || [];
    const existingATags = communityList?.tags.filter(([name]) => name === 'a') || [];

    // Add new community if not already present
    if (!joinedCommunities.includes(communityATag)) {
      const newATags = [
        ...existingATags,
        ['a', communityATag, relay],
      ];

      createEvent(
        {
          kind: 10004,
          content: communityList?.content || '',
          tags: [...existingTags, ...newATags],
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['communities-list'] });
            toast({
              title: 'Joined!',
              description: 'You joined this community.',
            });
          },
          onError: () => {
            toast({
              title: 'Error',
              description: 'Failed to join community.',
              variant: 'destructive',
            });
          },
        }
      );
    }
  };

  const leaveCommunity = (communityATag: string) => {
    if (!user || !communityList) return;

    // Remove the community
    const newTags = communityList.tags.filter(
      ([name, value]) => !(name === 'a' && value === communityATag)
    );

    createEvent(
      {
        kind: 10004,
        content: communityList.content || '',
        tags: newTags,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['communities-list'] });
          toast({
            title: 'Left community',
            description: 'You left this community.',
          });
        },
        onError: () => {
          toast({
            title: 'Error',
            description: 'Failed to leave community.',
            variant: 'destructive',
          });
        },
      }
    );
  };

  const toggleMembership = (communityATag: string, relay = '') => {
    if (isMember(communityATag)) {
      leaveCommunity(communityATag);
    } else {
      joinCommunity(communityATag, relay);
    }
  };

  return {
    joinedCommunities,
    memberCount: joinedCommunities.length,
    isMember,
    joinCommunity,
    leaveCommunity,
    toggleMembership,
    isLoading,
  };
}
