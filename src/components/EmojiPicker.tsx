import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Smile } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface CustomEmoji {
  shortcode: string;
  url: string;
}

interface EmojiPickerProps {
  onEmojiSelect: (emoji: { shortcode: string; url: string }) => void;
}

const defaultEmojis: CustomEmoji[] = [
  { shortcode: 'nostr', url: 'https://nostr.build/i/nostr.build_e14c863ac9c55977bc61ae55cc71e8f5e51eb97b5dd3ebd5e8ea3be81f4caef5.png' },
  { shortcode: 'bitcoin', url: 'https://nostr.build/i/nostr.build_8d6d7b6f4c5c21f9ef6a07a3d7c8b9a2c5e8f3a1b4c7d9e6f2a5b8c1d4e7f0a3.png' },
  { shortcode: 'lightning', url: 'https://nostr.build/i/nostr.build_3f8e2b5c9d4a1e7b6c8f2a9d5e1b4c7a3f6e9b2d5c8a1e4b7f0c3a6d9e2b5c8.png' },
  { shortcode: 'zap', url: 'https://nostr.build/i/nostr.build_7a4d1c8e5b2f9a6c3e8d1b4f7a2c5e8b1d4f7a0c3e6b9d2a5c8f1e4b7d0a3c6.png' },
];

export function EmojiPicker({ onEmojiSelect }: EmojiPickerProps) {
  const [customEmojis, setCustomEmojis] = useLocalStorage<CustomEmoji[]>('custom-emojis', []);
  const [newShortcode, setNewShortcode] = useState('');
  const [newUrl, setNewUrl] = useState('');

  const handleAddCustomEmoji = () => {
    if (!newShortcode.trim() || !newUrl.trim()) return;
    
    // Validate shortcode (alphanumeric and underscores only)
    if (!/^[a-zA-Z0-9_]+$/.test(newShortcode)) {
      alert('Shortcode must contain only alphanumeric characters and underscores');
      return;
    }

    const newEmoji = { shortcode: newShortcode.trim(), url: newUrl.trim() };
    setCustomEmojis([...customEmojis, newEmoji]);
    setNewShortcode('');
    setNewUrl('');
  };

  const handleRemoveCustomEmoji = (shortcode: string) => {
    setCustomEmojis(customEmojis.filter(e => e.shortcode !== shortcode));
  };

  const allEmojis = [...defaultEmojis, ...customEmojis];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" type="button">
          <Smile className="w-5 h-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <Tabs defaultValue="emojis" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="emojis">Emojis</TabsTrigger>
            <TabsTrigger value="add">Add Custom</TabsTrigger>
          </TabsList>

          <TabsContent value="emojis" className="space-y-2">
            <div className="grid grid-cols-6 gap-2 max-h-64 overflow-y-auto">
              {allEmojis.map((emoji) => (
                <button
                  key={emoji.shortcode}
                  type="button"
                  onClick={() => onEmojiSelect(emoji)}
                  className="p-2 hover:bg-accent rounded-md transition-colors"
                  title={`:${emoji.shortcode}:`}
                >
                  <img 
                    src={emoji.url} 
                    alt={emoji.shortcode} 
                    className="w-8 h-8 object-contain"
                  />
                </button>
              ))}
            </div>
            {customEmojis.length > 0 && (
              <div className="border-t pt-2 mt-2">
                <p className="text-xs text-muted-foreground mb-2">Your Custom Emojis:</p>
                <div className="space-y-1">
                  {customEmojis.map((emoji) => (
                    <div key={emoji.shortcode} className="flex items-center justify-between text-xs">
                      <span className="truncate">:{emoji.shortcode}:</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        type="button"
                        onClick={() => handleRemoveCustomEmoji(emoji.shortcode)}
                        className="h-6 px-2 text-xs"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="add" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="shortcode">Shortcode</Label>
              <Input
                id="shortcode"
                placeholder="e.g., myemoji"
                value={newShortcode}
                onChange={(e) => setNewShortcode(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Alphanumeric and underscores only
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">Image URL</Label>
              <Input
                id="url"
                placeholder="https://example.com/emoji.png"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
              />
            </div>

            <Button
              onClick={handleAddCustomEmoji}
              className="w-full"
              type="button"
            >
              Add Emoji
            </Button>

            {newUrl && (
              <div className="border rounded-md p-4 text-center">
                <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                <img 
                  src={newUrl} 
                  alt="Preview" 
                  className="w-12 h-12 mx-auto object-contain"
                  onError={(e) => {
                    e.currentTarget.src = '';
                    e.currentTarget.alt = 'Invalid image URL';
                  }}
                />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}
