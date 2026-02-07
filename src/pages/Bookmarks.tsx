import { useSeoMeta } from '@unhead/react';
import { Layout } from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Bookmark } from 'lucide-react';
import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { PostCard } from '@/components/PostCard';
import { Skeleton } from '@/components/ui/skeleton';
import type { NostrEvent } from '@nostrify/nostrify';

const Bookmarks = () => {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();

  useSeoMeta({
    title: 'Bookmarks - erybody',
    description: 'Your saved posts',
  });

  // Fetch user's bookmark lists (kind 10003)
  const { data: bookmarkList, isLoading: listLoading } = useQuery({
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

  // Extract event IDs from bookmark list
  const bookmarkedEventIds = bookmarkList?.tags
    .filter(([name]) => name === 'e')
    .map(([_, eventId]) => eventId) || [];

  // Fetch bookmarked events
  const { data: bookmarkedEvents, isLoading: eventsLoading } = useQuery({
    queryKey: ['bookmarked-events', bookmarkedEventIds.join(',')],
    queryFn: async () => {
      if (bookmarkedEventIds.length === 0) return [];

      const events = await nostr.query([
        {
          ids: bookmarkedEventIds,
        },
      ]);

      // Sort by the order in the bookmark list
      return bookmarkedEventIds
        .map(id => events.find(e => e.id === id))
        .filter((e): e is NostrEvent => e !== undefined);
    },
    enabled: bookmarkedEventIds.length > 0,
  });

  const isLoading = listLoading || eventsLoading;

  if (!user) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto py-12 px-4">
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">Please log in to view bookmarks</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-6 px-4 space-y-6">
        <div className="flex items-center gap-3">
          <Bookmark className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Bookmarks</h1>
        </div>

        {/* Bookmarked Posts */}
        <div className="space-y-4">
          {isLoading ? (
            <>
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="flex-1 space-y-3">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-4/5" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          ) : bookmarkedEvents && bookmarkedEvents.length > 0 ? (
            bookmarkedEvents.map((event) => <PostCard key={event.id} event={event} />)
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-12 px-8 text-center">
                <Bookmark className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  No bookmarks yet. Bookmark posts to save them for later!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Bookmarks;
