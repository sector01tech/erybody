import { useSeoMeta } from '@unhead/react';
import { Layout } from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Bell, Heart, MessageCircle, Repeat2, Zap } from 'lucide-react';
import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthor } from '@/hooks/useAuthor';
import { genUserName } from '@/lib/genUserName';
import { formatDistanceToNow } from 'date-fns';
import { nip19 } from 'nostr-tools';
import { Link } from 'react-router-dom';
import type { NostrEvent } from '@nostrify/nostrify';

const Notifications = () => {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();

  useSeoMeta({
    title: 'Notifications - erybody',
    description: 'Your Nostr notifications',
  });

  // Fetch notifications (mentions, replies, reactions, reposts, zaps)
  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications', user?.pubkey],
    queryFn: async () => {
      if (!user?.pubkey) return [];

      // Fetch events that mention or interact with the user
      const events = await nostr.query([
        {
          kinds: [1, 6, 7, 9735], // Notes, reposts, reactions, zaps
          '#p': [user.pubkey],
          limit: 100,
        },
      ]);

      return events.sort((a, b) => b.created_at - a.created_at);
    },
    enabled: !!user?.pubkey,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  if (!user) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto py-12 px-4">
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">Please log in to view notifications</p>
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
          <Bell className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Notifications</h1>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {isLoading ? (
            <>
              {[...Array(5)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          ) : notifications && notifications.length > 0 ? (
            notifications.map((notification) => (
              <NotificationCard key={notification.id} event={notification} />
            ))
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-12 px-8 text-center">
                <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  No notifications yet. When someone interacts with your posts, you'll see it here!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

function NotificationCard({ event }: { event: NostrEvent }) {
  const author = useAuthor(event.pubkey);
  const metadata = author.data?.metadata;

  const displayName = metadata?.name ?? genUserName(event.pubkey);
  const profileImage = metadata?.picture;
  const npub = nip19.npubEncode(event.pubkey);

  const timestamp = formatDistanceToNow(new Date(event.created_at * 1000), {
    addSuffix: true,
  });

  const getNotificationIcon = () => {
    switch (event.kind) {
      case 1:
        return <MessageCircle className="w-5 h-5 text-primary" />;
      case 6:
        return <Repeat2 className="w-5 h-5 text-green-500" />;
      case 7:
        return <Heart className="w-5 h-5 text-red-500" />;
      case 9735:
        return <Zap className="w-5 h-5 text-primary" />;
      default:
        return <Bell className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getNotificationText = () => {
    switch (event.kind) {
      case 1:
        return 'mentioned you in a post';
      case 6:
        return 'reposted your post';
      case 7:
        return 'reacted to your post';
      case 9735:
        return 'zapped your post';
      default:
        return 'interacted with you';
    }
  };

  return (
    <Card className="hover:bg-card/80 transition-colors">
      <CardContent className="p-6">
        <div className="flex gap-4">
          <div className="flex flex-col items-center gap-2">
            <Link to={`/${npub}`}>
              <Avatar className="w-12 h-12">
                <AvatarImage src={profileImage} alt={displayName} />
                <AvatarFallback>{displayName[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
            </Link>
            {getNotificationIcon()}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 mb-1">
              <Link to={`/${npub}`} className="font-semibold hover:underline">
                {displayName}
              </Link>
              <span className="text-sm text-muted-foreground">{getNotificationText()}</span>
            </div>
            <p className="text-sm text-muted-foreground">{timestamp}</p>
            
            {event.kind === 1 && event.content && (
              <p className="mt-2 text-sm line-clamp-3">{event.content}</p>
            )}
            {event.kind === 7 && event.content && (
              <p className="mt-2 text-2xl">{event.content}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default Notifications;
