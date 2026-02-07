import { useSeoMeta } from '@unhead/react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Image as ImageIcon, ExternalLink } from 'lucide-react';
import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthor } from '@/hooks/useAuthor';
import { genUserName } from '@/lib/genUserName';
import { useCommunityMembership } from '@/hooks/useCommunityMembership';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { nip19 } from 'nostr-tools';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface CommunityEvent {
  id: string;
  pubkey: string;
  created_at: number;
  kind: number;
  tags: string[][];
  content: string;
}

const Communities = () => {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();
  const { isMember, toggleMembership } = useCommunityMembership();

  useSeoMeta({
    title: 'Communities - erybody',
    description: 'Discover and join Nostr communities',
  });

  // Fetch community definitions (kind 34550)
  const { data: communities, isLoading } = useQuery({
    queryKey: ['communities'],
    queryFn: async () => {
      const events = await nostr.query([
        {
          kinds: [34550],
          limit: 50,
        },
      ]);
      return events.sort((a, b) => b.created_at - a.created_at);
    },
    refetchInterval: 60000, // Refetch every minute
  });

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Communities</h1>
        </div>

        {/* Communities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isLoading ? (
            <>
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <Skeleton className="h-16 w-16 rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-5 w-3/4" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-2/3" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          ) : communities && communities.length > 0 ? (
            communities.map((community) => (
              <CommunityCard 
                key={community.id} 
                community={community}
                user={user}
                isMember={isMember}
                toggleMembership={toggleMembership}
              />
            ))
          ) : (
            <div className="col-span-full">
              <Card className="border-dashed">
                <CardContent className="py-12 px-8 text-center">
                  <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    No communities found. Check back later!
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

interface CommunityCardProps {
  community: CommunityEvent;
  user: any;
  isMember: (aTag: string) => boolean;
  toggleMembership: (aTag: string, relay?: string) => void;
}

function CommunityCard({ community, user, isMember, toggleMembership }: CommunityCardProps) {
  const author = useAuthor(community.pubkey);
  const metadata = author.data?.metadata;
  
  const dTag = community.tags.find(([name]) => name === 'd')?.[1] || '';
  const name = community.tags.find(([name]) => name === 'name')?.[1] || dTag || 'Untitled Community';
  const description = community.tags.find(([name]) => name === 'description')?.[1] || '';
  const image = community.tags.find(([name]) => name === 'image')?.[1];
  
  const moderators = community.tags.filter(([name, _, __, role]) => name === 'p' && role === 'moderator');
  const moderatorCount = moderators.length;
  
  const displayName = metadata?.name ?? genUserName(community.pubkey);
  const npub = nip19.npubEncode(community.pubkey);
  const naddr = nip19.naddrEncode({
    kind: 34550,
    pubkey: community.pubkey,
    identifier: dTag,
  });

  // Create the 'a' tag for this community
  const communityATag = `34550:${community.pubkey}:${dTag}`;
  const joined = isMember(communityATag);

  return (
    <Card className="hover:bg-card/80 transition-colors overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Community Image */}
          <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
            {image ? (
              <img 
                src={image} 
                alt={name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <Users className="w-8 h-8 text-muted-foreground" />
            )}
          </div>

          <div className="flex-1 min-w-0 space-y-2">
            {/* Community Name */}
            <Link to={`/${naddr}`}>
              <CardTitle className="text-lg hover:underline line-clamp-1">
                {name}
              </CardTitle>
            </Link>

            {/* Description */}
            {description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {description}
              </p>
            )}

            {/* Metadata */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Link to={`/${npub}`} className="hover:text-foreground transition-colors">
                by {displayName}
              </Link>
              {moderatorCount > 0 && (
                <>
                  <span>•</span>
                  <span>{moderatorCount} {moderatorCount === 1 ? 'moderator' : 'moderators'}</span>
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-2">
              <Button asChild variant="outline" size="sm" className="flex-1">
                <Link to={`/${naddr}`}>
                  View
                </Link>
              </Button>
              {user && (
                <Button
                  onClick={() => toggleMembership(communityATag)}
                  variant={joined ? 'secondary' : 'default'}
                  size="sm"
                  className="flex-1"
                >
                  {joined ? 'Leave' : 'Join'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default Communities;
