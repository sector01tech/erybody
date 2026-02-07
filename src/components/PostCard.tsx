import type { NostrEvent, NostrMetadata } from '@nostrify/nostrify';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthor } from '@/hooks/useAuthor';
import { genUserName } from '@/lib/genUserName';
import { NoteContent } from '@/components/NoteContent';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, Repeat2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ZapButton } from '@/components/ZapButton';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { nip19 } from 'nostr-tools';
import { Link } from 'react-router-dom';

interface PostCardProps {
  event: NostrEvent;
}

export function PostCard({ event }: PostCardProps) {
  const author = useAuthor(event.pubkey);
  const { user } = useCurrentUser();
  const { mutate: createEvent } = useNostrPublish();
  const metadata: NostrMetadata | undefined = author.data?.metadata;

  const displayName = metadata?.name ?? genUserName(event.pubkey);
  const profileImage = metadata?.picture;
  const username = metadata?.name ? `@${metadata.name}` : genUserName(event.pubkey);
  const npub = nip19.npubEncode(event.pubkey);
  const noteId = nip19.noteEncode(event.id);

  const timestamp = formatDistanceToNow(new Date(event.created_at * 1000), {
    addSuffix: true,
  });

  const handleRepost = () => {
    if (!user) return;
    
    createEvent({
      kind: 6,
      content: JSON.stringify(event),
      tags: [
        ['e', event.id],
        ['p', event.pubkey],
      ],
    });
  };

  const handleReply = () => {
    // This would open a reply dialog
    console.log('Reply to', event.id);
  };

  return (
    <Card className="hover:bg-card/80 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <Link to={`/${npub}`}>
            <Avatar className="w-12 h-12 cursor-pointer hover:opacity-80 transition-opacity">
              <AvatarImage src={profileImage} alt={displayName} />
              <AvatarFallback>{displayName[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
          </Link>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Link 
                to={`/${npub}`}
                className="font-semibold hover:underline truncate"
              >
                {displayName}
              </Link>
              <span className="text-muted-foreground text-sm truncate">
                {username}
              </span>
              <span className="text-muted-foreground text-sm">·</span>
              <Link 
                to={`/${noteId}`}
                className="text-muted-foreground text-sm hover:underline whitespace-nowrap"
              >
                {timestamp}
              </Link>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="whitespace-pre-wrap break-words mb-4">
          <NoteContent event={event} className="text-base" />
        </div>

        <div className="flex items-center justify-between max-w-md">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-primary hover:bg-primary/10 -ml-2"
            onClick={handleReply}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            <span className="text-sm">Reply</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-green-500 hover:bg-green-500/10"
            onClick={handleRepost}
            disabled={!user}
          >
            <Repeat2 className="w-4 h-4 mr-2" />
            <span className="text-sm">Repost</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
          >
            <Heart className="w-4 h-4 mr-2" />
            <span className="text-sm">Like</span>
          </Button>

          <ZapButton event={event} />
        </div>
      </CardContent>
    </Card>
  );
}
