import { useState } from 'react';
import type { NostrEvent } from '@nostrify/nostrify';

interface MediaPreviewProps {
  event: NostrEvent;
}

// Common image extensions
const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg', '.avif'];
// Common video extensions
const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.m4v'];

function extractUrls(text: string): string[] {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.match(urlRegex) || [];
}

function isImageUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname.toLowerCase();
    return imageExtensions.some(ext => pathname.endsWith(ext));
  } catch {
    return false;
  }
}

function isVideoUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname.toLowerCase();
    return videoExtensions.some(ext => pathname.endsWith(ext));
  } catch {
    return false;
  }
}

export function MediaPreview({ event }: MediaPreviewProps) {
  const urls = extractUrls(event.content);
  const imageUrls = urls.filter(isImageUrl);
  const videoUrls = urls.filter(isVideoUrl);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [failedVideos, setFailedVideos] = useState<Set<string>>(new Set());

  const handleImageError = (url: string) => {
    setFailedImages(prev => new Set(prev).add(url));
  };

  const handleVideoError = (url: string) => {
    setFailedVideos(prev => new Set(prev).add(url));
  };

  const validImages = imageUrls.filter(url => !failedImages.has(url));
  const validVideos = videoUrls.filter(url => !failedVideos.has(url));

  if (validImages.length === 0 && validVideos.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 space-y-3">
      {/* Images */}
      {validImages.length > 0 && (
        <div className={`grid gap-2 ${validImages.length === 1 ? 'grid-cols-1' : validImages.length === 2 ? 'grid-cols-2' : 'grid-cols-2'}`}>
          {validImages.slice(0, 4).map((url, index) => (
            <a
              key={index}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="relative overflow-hidden rounded-lg border border-border hover:opacity-90 transition-opacity"
            >
              <img
                src={url}
                alt={`Image ${index + 1}`}
                className="w-full h-auto max-h-96 object-cover"
                onError={() => handleImageError(url)}
                loading="lazy"
              />
            </a>
          ))}
        </div>
      )}

      {/* Videos */}
      {validVideos.length > 0 && (
        <div className="space-y-2">
          {validVideos.slice(0, 1).map((url, index) => (
            <div key={index} className="relative overflow-hidden rounded-lg border border-border">
              <video
                src={url}
                controls
                className="w-full max-h-96 bg-black"
                onError={() => handleVideoError(url)}
                preload="metadata"
              >
                Your browser does not support the video tag.
              </video>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
