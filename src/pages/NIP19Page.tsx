import { nip19 } from 'nostr-tools';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import { Layout } from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthor } from '@/hooks/useAuthor';
import { genUserName } from '@/lib/genUserName';
import { PostCard } from '@/components/PostCard';
import { Skeleton } from '@/components/ui/skeleton';
import NotFound from './NotFound';

export function NIP19Page() {
  const { nip19: identifier } = useParams<{ nip19: string }>();
  const { nostr } = useNostr();

  if (!identifier) {
    return <NotFound />;
  }

  let decoded;
  try {
    decoded = nip19.decode(identifier);
  } catch {
    return <NotFound />;
  }

  const { type, data } = decoded;

  switch (type) {
    case 'npub':
    case 'nprofile':
      return <ProfileView pubkey={type === 'npub' ? data : data.pubkey} />;

    case 'note':
      return <NoteView noteId={data} />;

    case 'nevent':
      return <NoteView noteId={data.id} />;

    case 'naddr':
      return <AddrView addr={data} />;

    default:
      return <NotFound />;
  }
}

function ProfileView({ pubkey }: { pubkey: string }) {
  const { nostr } = useNostr();
  const author = useAuthor(pubkey);
  const metadata = author.data?.metadata;
  const displayName = metadata?.name ?? genUserName(pubkey);
  const profileImage = metadata?.picture;
  const banner = metadata?.banner;
  const about = metadata?.about;
  const nip05 = metadata?.nip05;

  const { data: userPosts, isLoading } = useQuery({
    queryKey: ['user-posts', pubkey],
    queryFn: async () => {
      const events = await nostr.query([
        {
          kinds: [1],
          authors: [pubkey],
          limit: 50,
        },
      ]);
      return events.sort((a, b) => b.created_at - a.created_at);
    },
  });

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        {banner && (
          <div className="w-full h-48 bg-muted overflow-hidden">
            <img src={banner} alt="Banner" className="w-full h-full object-cover" />
          </div>
        )}

        <div className="px-4 py-6 space-y-6">
          <div className="flex items-start gap-4">
            <Avatar className="w-24 h-24 border-4 border-background -mt-12">
              <AvatarImage src={profileImage} alt={displayName} />
              <AvatarFallback className="text-2xl">
                {displayName[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="space-y-3">
            <div>
              <h1 className="text-2xl font-bold">{displayName}</h1>
              {nip05 && (
                <p className="text-muted-foreground text-sm">{nip05}</p>
              )}
            </div>
            {about && <p className="text-foreground">{about}</p>}
          </div>

          <div className="pt-6 border-t space-y-4">
            <h2 className="text-xl font-semibold">Posts</h2>
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
            ) : userPosts && userPosts.length > 0 ? (
              userPosts.map((post) => <PostCard key={post.id} event={post} />)
            ) : (
              <Card className="border-dashed">
                <CardContent className="py-12 px-8 text-center">
                  <p className="text-muted-foreground">No posts yet</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

function NoteView({ noteId }: { noteId: string }) {
  const { nostr } = useNostr();

  const { data: event, isLoading } = useQuery({
    queryKey: ['note', noteId],
    queryFn: async () => {
      const events = await nostr.query([
        {
          ids: [noteId],
          limit: 1,
        },
      ]);
      return events[0] || null;
    },
  });

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-6 px-4">
        {isLoading ? (
          <Card>
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
        ) : event ? (
          <PostCard event={event} />
        ) : (
          <Card className="border-dashed">
            <CardContent className="py-12 px-8 text-center">
              <p className="text-muted-foreground">Note not found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}

function AddrView({ addr }: { addr: { kind: number; pubkey: string; identifier: string } }) {
  const { nostr } = useNostr();

  const { data: event, isLoading } = useQuery({
    queryKey: ['addr', addr.kind, addr.pubkey, addr.identifier],
    queryFn: async () => {
      const events = await nostr.query([
        {
          kinds: [addr.kind],
          authors: [addr.pubkey],
          '#d': [addr.identifier],
          limit: 1,
        },
      ]);
      return events[0] || null;
    },
  });

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-6 px-4">
        {isLoading ? (
          <Card>
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
        ) : event ? (
          <PostCard event={event} />
        ) : (
          <Card className="border-dashed">
            <CardContent className="py-12 px-8 text-center">
              <p className="text-muted-foreground">Event not found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
} 