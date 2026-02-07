import { useSeoMeta } from '@unhead/react';
import { Layout } from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Compass, TrendingUp, Users } from 'lucide-react';
import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import { PostCard } from '@/components/PostCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthor } from '@/hooks/useAuthor';
import { genUserName } from '@/lib/genUserName';
import { nip19 } from 'nostr-tools';
import { Link } from 'react-router-dom';

const Explore = () => {
  const { nostr } = useNostr();

  useSeoMeta({
    title: 'Explore - erybody',
    description: 'Discover trending posts and people on Nostr',
  });

  // Fetch recent popular posts (kind 1)
  const { data: trendingPosts, isLoading: postsLoading } = useQuery({
    queryKey: ['trending-posts'],
    queryFn: async () => {
      const events = await nostr.query([
        {
          kinds: [1],
          limit: 50,
        },
      ]);
      return events.sort((a, b) => b.created_at - a.created_at);
    },
    refetchInterval: 60000, // Refetch every minute
  });

  // Fetch active profiles (kind 0)
  const { data: activeProfiles, isLoading: profilesLoading } = useQuery({
    queryKey: ['active-profiles'],
    queryFn: async () => {
      const events = await nostr.query([
        {
          kinds: [0],
          limit: 30,
        },
      ]);
      
      // Parse and return profile data
      return events.map(event => {
        try {
          const metadata = JSON.parse(event.content);
          return {
            pubkey: event.pubkey,
            metadata,
            event,
          };
        } catch {
          return null;
        }
      }).filter(Boolean);
    },
  });

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-6 px-4 space-y-6">
        <div className="flex items-center gap-3">
          <Compass className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Explore</h1>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="trending" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="trending">
              <TrendingUp className="w-4 h-4 mr-2" />
              Trending
            </TabsTrigger>
            <TabsTrigger value="people">
              <Users className="w-4 h-4 mr-2" />
              People
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trending" className="space-y-4 mt-6">
            {postsLoading ? (
              <>
                {[...Array(5)].map((_, i) => (
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
            ) : trendingPosts && trendingPosts.length > 0 ? (
              trendingPosts.map((post) => <PostCard key={post.id} event={post} />)
            ) : (
              <Card className="border-dashed">
                <CardContent className="py-12 px-8 text-center">
                  <p className="text-muted-foreground">
                    No posts found. Check back later!
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="people" className="space-y-4 mt-6">
            {profilesLoading ? (
              <>
                {[...Array(5)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-48" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            ) : activeProfiles && activeProfiles.length > 0 ? (
              activeProfiles.map((profile: any) => {
                const displayName = profile.metadata.name || genUserName(profile.pubkey);
                const npub = nip19.npubEncode(profile.pubkey);
                
                return (
                  <Card key={profile.pubkey} className="hover:bg-card/80 transition-colors">
                    <CardContent className="p-6">
                      <Link to={`/${npub}`} className="flex items-center gap-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={profile.metadata.picture} alt={displayName} />
                          <AvatarFallback>{displayName[0]?.toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{displayName}</h3>
                          {profile.metadata.nip05 && (
                            <p className="text-sm text-muted-foreground truncate">
                              {profile.metadata.nip05}
                            </p>
                          )}
                          {profile.metadata.about && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {profile.metadata.about}
                            </p>
                          )}
                        </div>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Card className="border-dashed">
                <CardContent className="py-12 px-8 text-center">
                  <p className="text-muted-foreground">
                    No profiles found. Check back later!
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Explore;
