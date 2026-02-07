import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthor } from '@/hooks/useAuthor';
import { genUserName } from '@/lib/genUserName';
import { useToast } from '@/hooks/useToast';
import { Image, Loader2 } from 'lucide-react';
import { useUploadFile } from '@/hooks/useUploadFile';
import { EmojiPicker } from '@/components/EmojiPicker';

export function ComposePost() {
  const { user } = useCurrentUser();
  const author = useAuthor(user?.pubkey || '');
  const { mutate: createEvent, isPending } = useNostrPublish();
  const { mutateAsync: uploadFile, isPending: isUploading } = useUploadFile();
  const { toast } = useToast();
  const [content, setContent] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [emojiTags, setEmojiTags] = useState<Array<[string, string, string]>>([]);

  const metadata = author.data?.metadata;
  const displayName = metadata?.name ?? genUserName(user?.pubkey || '');
  const profileImage = metadata?.picture;

  const handleEmojiSelect = (emoji: { shortcode: string; url: string }) => {
    const emojiText = `:${emoji.shortcode}:`;
    setContent(content + emojiText);
    
    // Add emoji tag if not already present
    const emojiTag: [string, string, string] = ['emoji', emoji.shortcode, emoji.url];
    if (!emojiTags.some(([_, sc]) => sc === emoji.shortcode)) {
      setEmojiTags([...emojiTags, emojiTag]);
    }
  };

  const handleSubmit = () => {
    if (!content.trim() && imageUrls.length === 0) return;

    let finalContent = content;
    
    // Append image URLs to content
    if (imageUrls.length > 0) {
      finalContent = content + (content ? '\n\n' : '') + imageUrls.join('\n');
    }

    createEvent(
      { 
        kind: 1, 
        content: finalContent,
        tags: [...emojiTags],
      },
      {
        onSuccess: () => {
          setContent('');
          setImageUrls([]);
          setEmojiTags([]);
          toast({
            title: 'Posted!',
            description: 'Your note has been published.',
          });
        },
        onError: () => {
          toast({
            title: 'Error',
            description: 'Failed to publish note.',
            variant: 'destructive',
          });
        },
      }
    );
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const file = files[0];
      const [[_, url]] = await uploadFile(file);
      setImageUrls([...imageUrls, url]);
      toast({
        title: 'Image uploaded',
        description: 'Your image has been uploaded successfully.',
      });
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: 'Failed to upload image.',
        variant: 'destructive',
      });
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            Please log in to post
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex gap-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src={profileImage} alt={displayName} />
            <AvatarFallback>{displayName[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-4">
            <Textarea
              placeholder="What's happening?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px] resize-none border-none focus-visible:ring-0 text-lg"
            />

            {imageUrls.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {imageUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img 
                      src={url} 
                      alt={`Upload ${index + 1}`} 
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => setImageUrls(imageUrls.filter((_, i) => i !== index))}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center gap-2">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={isUploading}
                    asChild
                  >
                    <span>
                      {isUploading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Image className="w-5 h-5" />
                      )}
                    </span>
                  </Button>
                </label>
                <EmojiPicker onEmojiSelect={handleEmojiSelect} />
              </div>

              <Button
                onClick={handleSubmit}
                disabled={(!content.trim() && imageUrls.length === 0) || isPending}
                className="font-semibold"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Posting...
                  </>
                ) : (
                  'Post'
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
