import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';

interface ExerciseMediaGalleryProps {
  images: string[];
  videoUrl?: string;
  videoType?: 'youtube' | 'local';
}

export function ExerciseMediaGallery({ images, videoUrl, videoType = 'youtube' }: ExerciseMediaGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return videoId ? `https://www.youtube.com/embed/${videoId[1]}` : url;
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Main Display Area */}
      <div className="aspect-video bg-gray-900 relative">
        {showVideo && videoUrl ? (
          // Video Display
          videoType === 'youtube' ? (
            <iframe
              src={getYouTubeEmbedUrl(videoUrl)}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Exercise video"
            />
          ) : (
            <video
              src={videoUrl}
              controls
              className="w-full h-full"
            />
          )
        ) : (
          // Image Display
          images.length > 0 && (
            <>
              <img
                src={images[currentImageIndex]}
                alt={`Exercise demonstration ${currentImageIndex + 1}`}
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><text x="50%" y="50%" text-anchor="middle" dy=".3em" font-size="48">💪</text></svg>';
                }}
              />

              {/* Image Navigation */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* Image Counter */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                {currentImageIndex + 1} / {images.length}
              </div>
            </>
          )
        )}
      </div>

      {/* Controls */}
      <div className="p-4 flex gap-2">
        {videoUrl && (
          <button
            onClick={() => setShowVideo(!showVideo)}
            className="flex-1 flex items-center justify-center gap-2 bg-[var(--color-accent-primary)] text-white px-4 py-2 rounded hover:bg-[var(--color-accent-secondary)] transition-colors"
          >
            <Play className="w-4 h-4" />
            {showVideo ? 'הצג תמונות' : 'צפה בסרטון'}
          </button>
        )}

        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto">
            {images.map((img, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentImageIndex(index);
                  setShowVideo(false);
                }}
                className={`flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 transition-colors ${
                  currentImageIndex === index && !showVideo
                    ? 'border-[var(--color-accent-primary)]'
                    : 'border-transparent'
                }`}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
