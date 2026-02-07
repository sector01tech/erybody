import { useSeoMeta } from '@unhead/react';
import { Layout } from '@/components/Layout';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useAuthor } from '@/hooks/useAuthor';
import { genUserName } from '@/lib/genUserName';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { EditProfileForm } from '@/components/EditProfileForm';
import { useState } from 'react';
import { PostCard } from '@/components/PostCard';
import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';

const Profile = () => {
  const { user } = useCurrentUser();
  const author = useAuthor(user?.pubkey || '');
  const { nostr } = useNostr();
  const [isEditing, setIsEditing] = useState(false);

  const metadata = author.data?.metadata;
  const displayName = metadata?.name ?? genUserName(user?.pubkey || '');
  const profileImage = metadata?.picture;
  const banner = metadata?.banner;
  const about = metadata?.about;
  const nip05 = metadata?.nip05;

  useSeoMeta({
    title: `${displayName} - erybody`,
    description: about || 'Nostr profile',
  });

  // Fetch user's posts
  const { data: userPosts, isLoading } = useQuery({
    queryKey: ['user-posts', user?.pubkey],
    queryFn: async () => {
      if (!user?.pubkey) return [];
      const events = await nostr.query([
        {
          kinds: [1],
          authors: [user.pubkey],
          limit: 50,
        },
      ]);
      return events.sort((a, b) => b.created_at - a.created_at);
    },
    enabled: !!user?.pubkey,
  });

  if (!user) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto py-12 px-4">
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">Please log in to view your profile</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        {/* Banner */}
        {banner && (
          <div className="w-full h-48 bg-muted overflow-hidden">
            <img src={banner} alt="Banner" className="w-full h-full object-cover" />
          </div>
        )}

        {/* Profile Header */}
        <div className="px-4 py-6 space-y-6">
          <div className="flex items-start justify-between">
            <Avatar className="w-24 h-24 border-4 border-background -mt-12">
              <AvatarImage src={profileImage} alt={displayName} />
              <AvatarFallback className="text-2xl">
                {displayName[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <Button onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </Button>
          </div>

          {isEditing ? (
            <EditProfileForm />
          ) : (
            <div className="space-y-3">
              <div>
                <h1 className="text-2xl font-bold">{displayName}</h1>
                {nip05 && (
                  <p className="text-muted-foreground text-sm">{nip05}</p>
                )}
              </div>
              {about && <p className="text-foreground">{about}</p>}
            </div>
          )}

          {/* User Posts */}
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
};

export default Profile;
