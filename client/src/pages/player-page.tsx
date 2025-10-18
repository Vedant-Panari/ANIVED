import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useRef, useEffect } from "react";
import NavigationHeader from "@/components/navigation-header";
import VideoPlayer from "@/components/video-player";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, ThumbsUp, ThumbsDown, Share } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

interface RouteParams {
  episodeId: string;
}

export default function PlayerPage() {
  const { episodeId } = useParams<RouteParams>();
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(0);

  const { data: episode, isLoading: episodeLoading } = useQuery({
    queryKey: ["/api/episodes", episodeId],
    enabled: !!episodeId,
  });

  const { data: episodes, isLoading: episodesLoading } = useQuery({
    queryKey: ["/api/anime", episode?.animeId, "episodes"],
    enabled: !!episode?.animeId,
  });

  const addViewingHistoryMutation = useMutation({
    mutationFn: async (data: { episodeId: string; progress: number; completed: boolean }) => {
      await apiRequest("POST", "/api/viewing-history", data);
    },
  });

  // Update viewing progress
  useEffect(() => {
    if (!user || !episodeId || !episode) return;

    const interval = setInterval(() => {
      if (currentTime > 0) {
        const isCompleted = currentTime >= (episode.duration || 0) * 0.8; // 80% completion
        
        addViewingHistoryMutation.mutate({
          episodeId,
          progress: currentTime,
          completed: isCompleted,
        });
      }
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [currentTime, episodeId, episode, user]);

  const currentEpisodeIndex = episodes?.findIndex((ep: any) => ep.id === episodeId) ?? -1;
  const previousEpisode = episodes?.[currentEpisodeIndex - 1];
  const nextEpisode = episodes?.[currentEpisodeIndex + 1];

  if (episodeLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <NavigationHeader />
        <main className="pt-16">
          <div className="container mx-auto px-4 py-8 max-w-6xl">
            <Skeleton className="w-full aspect-video mb-6" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!episode) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <NavigationHeader />
        <main className="pt-16 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Episode not found</h1>
            <p className="text-muted-foreground">The episode you're looking for doesn't exist.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground" data-testid="player-page">
      <NavigationHeader />
      
      <main className="pt-16">
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              {/* Video Player */}
              <VideoPlayer
                src={episode.videoUrl}
                poster={episode.thumbnailUrl}
                subtitles={episode.subtitles}
                onTimeUpdate={setCurrentTime}
                testId="video-player"
              />
              
              {/* Episode Info */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-foreground mb-2" data-testid="episode-title">
                      Episode {episode.episodeNumber}: {episode.title}
                    </h2>
                    <p className="text-muted-foreground" data-testid="episode-description">
                      {episode.description || "No description available."}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" data-testid="button-like">
                      <ThumbsUp className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" data-testid="button-dislike">
                      <ThumbsDown className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" data-testid="button-share">
                      <Share className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Episode Navigation */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <Button
                    variant="outline"
                    disabled={!previousEpisode}
                    className="flex items-center space-x-2"
                    data-testid="button-previous-episode"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous Episode</span>
                  </Button>
                  
                  <div className="text-center">
                    <span className="text-sm text-muted-foreground">
                      Episode {episode.episodeNumber}
                      {episodes && ` of ${episodes.length}`}
                    </span>
                  </div>
                  
                  <Button
                    disabled={!nextEpisode}
                    className="flex items-center space-x-2"
                    data-testid="button-next-episode"
                  >
                    <span>Next Episode</span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Episodes List */}
            {episodes && episodes.length > 1 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-foreground mb-4">All Episodes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="episodes-grid">
                  {episodes.map((ep: any, index: number) => (
                    <div
                      key={ep.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        ep.id === episodeId
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                      data-testid={`episode-card-${ep.episodeNumber}`}
                    >
                      {ep.thumbnailUrl && (
                        <img
                          src={ep.thumbnailUrl}
                          alt={`Episode ${ep.episodeNumber}`}
                          className="w-full h-24 object-cover rounded mb-3"
                        />
                      )}
                      <h4 className="font-medium text-foreground text-sm mb-1">
                        Episode {ep.episodeNumber}: {ep.title}
                      </h4>
                      {ep.duration && (
                        <p className="text-xs text-muted-foreground">
                          {Math.floor(ep.duration / 60)} minutes
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
