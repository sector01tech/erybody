import { useNostr } from '@nostrify/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { useToast } from '@/hooks/useToast';

export function useBookmarks() {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();
  const { mutate: createEvent } = useNostrPublish();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's bookmark list (kind 10003)
  const { data: bookmarkList, isLoading } = useQuery({
    queryKey: ['bookmarks-list', user?.pubkey],
    queryFn: async () => {
      if (!user?.pubkey) return null;

      const events = await nostr.query([
        {
          kinds: [10003],
          authors: [user.pubkey],
          limit: 1,
        },
      ]);

      return events[0] || null;
    },
    enabled: !!user?.pubkey,
  });

  // Get bookmarked event IDs
  const bookmarkedEventIds = bookmarkList?.tags
    .filter(([name]) => name === 'e')
    .map(([_, eventId]) => eventId) || [];

  const isBookmarked = (eventId: string) => {
    return bookmarkedEventIds.includes(eventId);
  };

  const addBookmark = (eventId: string, eventAuthor: string) => {
    if (!user) {
      toast({
        title: 'Login required',
        description: 'Please log in to bookmark posts.',
        variant: 'destructive',
      });
      return;
    }

    // Get existing tags or create new array
    const existingTags = bookmarkList?.tags.filter(([name]) => name !== 'e') || [];
    const existingEventTags = bookmarkList?.tags.filter(([name]) => name === 'e') || [];

    // Add new bookmark if not already present
    if (!bookmarkedEventIds.includes(eventId)) {
      const newEventTags = [
        ...existingEventTags,
        ['e', eventId],
      ];

      createEvent(
        {
          kind: 10003,
          content: '',
          tags: [...existingTags, ...newEventTags],
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bookmarks-list'] });
            queryClient.invalidateQueries({ queryKey: ['bookmarked-events'] });
            toast({
              title: 'Bookmarked!',
              description: 'Post saved to bookmarks.',
            });
          },
          onError: () => {
            toast({
              title: 'Error',
              description: 'Failed to bookmark post.',
              variant: 'destructive',
            });
          },
        }
      );
    }
  };

  const removeBookmark = (eventId: string) => {
    if (!user || !bookmarkList) return;

    // Remove the bookmark
    const newTags = bookmarkList.tags.filter(
      ([name, value]) => !(name === 'e' && value === eventId)
    );

    createEvent(
      {
        kind: 10003,
        content: '',
        tags: newTags,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['bookmarks-list'] });
          queryClient.invalidateQueries({ queryKey: ['bookmarked-events'] });
          toast({
            title: 'Removed',
            description: 'Post removed from bookmarks.',
          });
        },
        onError: () => {
          toast({
            title: 'Error',
            description: 'Failed to remove bookmark.',
            variant: 'destructive',
          });
        },
      }
    );
  };

  const toggleBookmark = (eventId: string, eventAuthor: string) => {
    if (isBookmarked(eventId)) {
      removeBookmark(eventId);
    } else {
      addBookmark(eventId, eventAuthor);
    }
  };

  return {
    bookmarkedEventIds,
    isBookmarked,
    addBookmark,
    removeBookmark,
    toggleBookmark,
    isLoading,
  };
}
