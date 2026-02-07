import { useSeoMeta } from '@unhead/react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Radio, Users, Clock, ExternalLink } from 'lucide-react';
import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthor } from '@/hooks/useAuthor';
import { genUserName } from '@/lib/genUserName';
import { formatDistanceToNow } from 'date-fns';
import { nip19 } from 'nostr-tools';
import { Link } from 'react-router-dom';

interface LiveStreamEvent {
  id: string;
  pubkey: string;
  created_at: number;
  kind: number;
  tags: string[][];
  content: string;
}

const Live = () => {
  const { nostr } = useNostr();

  useSeoMeta({
    title: 'Live Streams - erybody',
    description: 'Watch live streams on Nostr',
  });

  // Fetch live streaming events (kind 30311)
  const { data: liveStreams, isLoading } = useQuery({
    queryKey: ['live-streams'],
    queryFn: async () => {
      const events = await nostr.query([
        {
          kinds: [30311],
          limit: 50,
        },
      ]);
      return events.sort((a, b) => {
        // Prioritize live streams, then by created_at
        const aStatus = a.tags.find(([name]) => name === 'status')?.[1] || '';
        const bStatus = b.tags.find(([name]) => name === 'status')?.[1] || '';
        
        if (aStatus === 'live' && bStatus !== 'live') return -1;
        if (bStatus === 'live' && aStatus !== 'live') return 1;
        
        return b.created_at - a.created_at;
      });
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
        <div className="flex items-center gap-3">
          <Radio className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Live Streams</h1>
        </div>

        {/* Live Streams Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {isLoading ? (
            <>
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <Skeleton className="h-40 w-full rounded-lg" />
                      <div className="space-y-2">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-8 w-8 rounded-full" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          ) : liveStreams && liveStreams.length > 0 ? (
            liveStreams.map((stream) => (
              <LiveStreamCard key={stream.id} stream={stream} />
            ))
          ) : (
            <div className="col-span-full">
              <Card className="border-dashed">
                <CardContent className="py-12 px-8 text-center">
                  <Radio className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    No live streams found. Check back later!
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

function LiveStreamCard({ stream }: { stream: LiveStreamEvent }) {
  const author = useAuthor(stream.pubkey);
  const metadata = author.data?.metadata;
  
  const title = stream.tags.find(([name]) => name === 'title')?.[1] || 'Untitled Stream';
  const summary = stream.tags.find(([name]) => name === 'summary')?.[1] || '';
  const image = stream.tags.find(([name]) => name === 'image')?.[1];
  const streamingUrl = stream.tags.find(([name]) => name === 'streaming')?.[1];
  const status = stream.tags.find(([name]) => name === 'status')?.[1] || 'planned';
  const starts = stream.tags.find(([name]) => name === 'starts')?.[1];
  const currentParticipants = stream.tags.find(([name]) => name === 'current_participants')?.[1];
  const hashtags = stream.tags.filter(([name]) => name === 't').map(([_, tag]) => tag);
  
  const displayName = metadata?.name ?? genUserName(stream.pubkey);
  const profileImage = metadata?.picture;
  const npub = nip19.npubEncode(stream.pubkey);

  const startsDate = starts ? new Date(parseInt(starts) * 1000) : null;
  const timeText = startsDate 
    ? status === 'live' 
      ? 'Live now' 
      : formatDistanceToNow(startsDate, { addSuffix: true })
    : null;

  return (
    <Card className="hover:bg-card/80 transition-colors overflow-hidden">
      {/* Stream Image/Thumbnail */}
      {image && (
        <div className="relative aspect-video bg-muted overflow-hidden">
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover"
          />
          {status === 'live' && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-red-600 text-white hover:bg-red-700">
                <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
                LIVE
              </Badge>
            </div>
          )}
          {currentParticipants && (
            <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded-md text-sm flex items-center gap-1">
              <Users className="w-3 h-3" />
              {currentParticipants}
            </div>
          )}
        </div>
      )}

      <CardHeader className="space-y-3">
        <CardTitle className="text-lg line-clamp-2">{title}</CardTitle>
        
        {/* Stream Metadata */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to={`/${npub}`} className="flex items-center gap-2 hover:text-foreground transition-colors">
            <Avatar className="w-6 h-6">
              <AvatarImage src={profileImage} alt={displayName} />
              <AvatarFallback className="text-xs">{displayName[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="font-medium">{displayName}</span>
          </Link>
          {timeText && (
            <>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {timeText}
              </div>
            </>
          )}
        </div>

        {/* Summary */}
        {summary && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {summary}
          </p>
        )}

        {/* Hashtags */}
        {hashtags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {hashtags.slice(0, 3).map((tag, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Watch Button */}
        {streamingUrl && status === 'live' && (
          <a
            href={streamingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors w-full font-semibold"
          >
            Watch Stream
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </CardHeader>
    </Card>
  );
}

export default Live;
