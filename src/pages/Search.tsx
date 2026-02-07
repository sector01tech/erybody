import { useState } from 'react';
import { useSeoMeta } from '@unhead/react';
import { Layout } from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search as SearchIcon } from 'lucide-react';
import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import { PostCard } from '@/components/PostCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthor } from '@/hooks/useAuthor';
import { genUserName } from '@/lib/genUserName';
import { useFollows } from '@/hooks/useFollows';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { nip19 } from 'nostr-tools';
import { Link } from 'react-router-dom';

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const { nostr } = useNostr();
  const { user } = useCurrentUser();
  const { isFollowing, toggleFollow } = useFollows();

  useSeoMeta({
    title: 'Search - erybody',
    description: 'Search for posts and people on Nostr',
  });

  // Debounce search query
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    const timeout = setTimeout(() => {
      setDebouncedQuery(value);
    }, 500);
    return () => clearTimeout(timeout);
  };

  // Search for posts containing the query
  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ['search-posts', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery.trim()) return [];
      
      // Search for posts containing the search term
      const events = await nostr.query([
        {
          kinds: [1],
          search: debouncedQuery,
          limit: 50,
        },
      ]);
      return events.sort((a, b) => b.created_at - a.created_at);
    },
    enabled: debouncedQuery.trim().length > 0,
  });

  // Search for profiles matching the query
  const { data: profiles, isLoading: profilesLoading } = useQuery({
    queryKey: ['search-profiles', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery.trim()) return [];
      
      // Search for kind 0 events (profiles)
      const events = await nostr.query([
        {
          kinds: [0],
          search: debouncedQuery,
          limit: 20,
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
    enabled: debouncedQuery.trim().length > 0,
  });

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-6 px-4 space-y-6">
        <div className="flex items-center gap-3">
          <SearchIcon className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Search</h1>
        </div>

        {/* Search Input */}
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search for posts or people..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 h-12 text-lg"
          />
        </div>

        {/* Results Tabs */}
        {debouncedQuery.trim().length > 0 ? (
          <Tabs defaultValue="posts" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="posts">Posts</TabsTrigger>
              <TabsTrigger value="people">People</TabsTrigger>
            </TabsList>

            <TabsContent value="posts" className="space-y-4 mt-6">
              {postsLoading ? (
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
              ) : posts && posts.length > 0 ? (
                posts.map((post) => <PostCard key={post.id} event={post} />)
              ) : (
                <Card className="border-dashed">
                  <CardContent className="py-12 px-8 text-center">
                    <p className="text-muted-foreground">
                      No posts found matching "{debouncedQuery}"
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="people" className="space-y-4 mt-6">
              {profilesLoading ? (
                <>
                  {[...Array(3)].map((_, i) => (
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
              ) : profiles && profiles.length > 0 ? (
              profiles.map((profile: any) => {
                const displayName = profile.metadata.name || genUserName(profile.pubkey);
                const npub = nip19.npubEncode(profile.pubkey);
                const isOwnProfile = user?.pubkey === profile.pubkey;
                const following = isFollowing(profile.pubkey);
                
                return (
                  <Card key={profile.pubkey} className="hover:bg-card/80 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <Link to={`/${npub}`}>
                          <Avatar className="w-12 h-12 cursor-pointer hover:opacity-80 transition-opacity">
                            <AvatarImage src={profile.metadata.picture} alt={displayName} />
                            <AvatarFallback>{displayName[0]?.toUpperCase()}</AvatarFallback>
                          </Avatar>
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link to={`/${npub}`}>
                            <h3 className="font-semibold truncate hover:underline">{displayName}</h3>
                          </Link>
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
                        {!isOwnProfile && user && (
                          <Button
                            onClick={() => toggleFollow(profile.pubkey)}
                            variant={following ? 'outline' : 'default'}
                            size="sm"
                          >
                            {following ? 'Unfollow' : 'Follow'}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
              ) : (
                <Card className="border-dashed">
                  <CardContent className="py-12 px-8 text-center">
                    <p className="text-muted-foreground">
                      No people found matching "{debouncedQuery}"
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        ) : (
          <Card className="border-dashed">
            <CardContent className="py-12 px-8 text-center">
              <SearchIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                Enter a search term to find posts and people
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Search;
