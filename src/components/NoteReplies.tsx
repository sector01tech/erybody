import { useState } from 'react';
import type { NostrEvent } from '@nostrify/nostrify';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, MessageCircle } from 'lucide-react';
import { PostCard } from '@/components/PostCard';

interface NoteRepliesProps {
  replies: NostrEvent[];
  replyCount: number;
}

export function NoteReplies({ replies, replyCount }: NoteRepliesProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (replyCount === 0) return null;

  // Sort replies by created_at ascending (oldest first)
  const sortedReplies = [...replies].sort((a, b) => a.created_at - b.created_at);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-muted-foreground hover:text-foreground justify-start mt-2"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          <span className="text-sm">
            {isOpen ? 'Hide' : 'Show'} {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
          </span>
          <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </Button>
      </CollapsibleTrigger>
      
      <CollapsibleContent className="mt-4 space-y-4 ml-4 pl-4 border-l-2 border-border">
        {sortedReplies.map((reply) => (
          <PostCard key={reply.id} event={reply} isReply />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}
