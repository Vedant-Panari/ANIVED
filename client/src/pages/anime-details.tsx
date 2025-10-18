import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import NavigationHeader from "@/components/navigation-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Star, Play, Plus, Info } from "lucide-react";

interface RouteParams {
  id: string;
}

export default function AnimeDetailsPage() {
  const { id } = useParams<RouteParams>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: anime, isLoading: animeLoading } = useQuery({
    queryKey: ["/api/anime", id],
  });

  const { data: episodes, isLoading: episodesLoading } = useQuery({
    queryKey: ["/api/anime", id, "episodes"],
    enabled: !!id,
  });

  const { data: reviews, isLoading: reviewsLoading } = useQuery({
    queryKey: ["/api/anime", id, "reviews"],
    enabled: !!id,
  });

  const { data: watchlist } = useQuery({
    queryKey: ["/api/watchlist"],
    enabled: !!user,
  });

  const addToWatchlistMutation = useMutation({
    mutationFn: async (data: { animeId: string; status: string }) => {
      await apiRequest("POST", "/api/watchlist", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/watchlist"] });
      toast({
        title: "Added to watchlist",
        description: "Anime has been added to your watchlist",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const isInWatchlist = watchlist?.some((item: any) => item.animeId === id);

  const handleAddToWatchlist = () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to add anime to your watchlist",
        variant: "destructive",
      });
      return;
    }

    addToWatchlistMutation.mutate({
      animeId: id!,
      status: "plan_to_watch",
    });
  };

  if (animeLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <NavigationHeader />
        <main className="pt-16">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col lg:flex-row gap-8">
              <Skeleton className="w-full lg:w-80 h-96" />
              <div className="flex-1 space-y-4">
                <Skeleton className="h-12 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-24 w-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-10 w-32" />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!anime) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <NavigationHeader />
        <main className="pt-16 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Anime not found</h1>
            <p className="text-muted-foreground">The anime you're looking for doesn't exist.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground" data-testid="anime-details-page">
      <NavigationHeader />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative h-[60vh] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/50 to-transparent z-10"></div>
          {anime.bannerUrl && (
            <img
              src={anime.bannerUrl}
              alt={`${anime.title} banner`}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          
          <div className="relative z-20 container mx-auto px-4 h-full flex items-end pb-8">
            <div className="flex flex-col lg:flex-row gap-8 items-end">
              {anime.posterUrl && (
                <img
                  src={anime.posterUrl}
                  alt={`${anime.title} poster`}
                  className="w-48 h-72 object-cover rounded-lg shadow-lg"
                  data-testid="anime-poster"
                />
              )}
              
              <div className="flex-1">
                <div className="mb-4">
                  {anime.isPremium && (
                    <Badge className="bg-accent/20 text-accent mb-2">PREMIUM</Badge>
                  )}
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground" data-testid="anime-title">
                  {anime.title}
                </h1>
                
                <div className="flex items-center space-x-4 mb-4">
                  {anime.rating && (
                    <div className="flex items-center space-x-2">
                      <div className="flex text-accent">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(Number(anime.rating)) ? "fill-current" : ""
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-foreground font-medium" data-testid="anime-rating">
                        {anime.rating}
                      </span>
                    </div>
                  )}
                  {anime.releaseYear && (
                    <span className="text-muted-foreground">{anime.releaseYear}</span>
                  )}
                  {anime.studio && (
                    <span className="text-muted-foreground">{anime.studio}</span>
                  )}
                  {anime.episodeCount && (
                    <span className="text-muted-foreground">{anime.episodeCount} episodes</span>
                  )}
                </div>
                
                {anime.genres && anime.genres.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {anime.genres.map((genre) => (
                      <Badge key={genre} variant="secondary" data-testid={`genre-${genre}`}>
                        {genre}
                      </Badge>
                    ))}
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button className="flex items-center space-x-2" data-testid="button-watch-now">
                    <Play className="w-4 h-4" />
                    <span>Watch Now</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleAddToWatchlist}
                    disabled={isInWatchlist || addToWatchlistMutation.isPending}
                    className="flex items-center space-x-2"
                    data-testid="button-add-to-watchlist"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isInWatchlist ? "In Watchlist" : "Add to List"}</span>
                  </Button>
                  <Button variant="outline" className="flex items-center space-x-2">
                    <Info className="w-4 h-4" />
                    <span>More Info</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Content Tabs */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
                <TabsTrigger value="episodes" data-testid="tab-episodes">Episodes</TabsTrigger>
                <TabsTrigger value="reviews" data-testid="tab-reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-8">
                <div className="grid lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    <h3 className="text-xl font-semibold mb-4">Synopsis</h3>
                    <p className="text-muted-foreground leading-relaxed" data-testid="anime-description">
                      {anime.description || "No description available."}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Information</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="font-medium text-foreground">Status:</span>
                        <span className="text-muted-foreground ml-2">{anime.status}</span>
                      </div>
                      {anime.studio && (
                        <div>
                          <span className="font-medium text-foreground">Studio:</span>
                          <span className="text-muted-foreground ml-2">{anime.studio}</span>
                        </div>
                      )}
                      {anime.releaseYear && (
                        <div>
                          <span className="font-medium text-foreground">Release Year:</span>
                          <span className="text-muted-foreground ml-2">{anime.releaseYear}</span>
                        </div>
                      )}
                      {anime.episodeCount && (
                        <div>
                          <span className="font-medium text-foreground">Episodes:</span>
                          <span className="text-muted-foreground ml-2">{anime.episodeCount}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="episodes" className="mt-8">
                {episodesLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-4 p-4 border border-border rounded-lg">
                        <Skeleton className="w-16 h-12" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                        <Skeleton className="w-20 h-8" />
                      </div>
                    ))}
                  </div>
                ) : episodes?.length === 0 ? (
                  <div className="text-center py-12">
                    <h3 className="text-lg font-semibold mb-2">No episodes available</h3>
                    <p className="text-muted-foreground">Episodes will be added soon.</p>
                  </div>
                ) : (
                  <div className="space-y-4" data-testid="episodes-list">
                    {episodes?.map((episode: any) => (
                      <div
                        key={episode.id}
                        className="flex items-center space-x-4 p-4 border border-border rounded-lg hover:border-primary/50 transition-colors"
                        data-testid={`episode-${episode.episodeNumber}`}
                      >
                        {episode.thumbnailUrl && (
                          <img
                            src={episode.thumbnailUrl}
                            alt={`Episode ${episode.episodeNumber}`}
                            className="w-20 h-12 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground">
                            Episode {episode.episodeNumber}: {episode.title}
                          </h4>
                          {episode.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {episode.description}
                            </p>
                          )}
                          {episode.duration && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {Math.floor(episode.duration / 60)} minutes
                            </p>
                          )}
                        </div>
                        <Button size="sm" data-testid={`button-play-episode-${episode.episodeNumber}`}>
                          <Play className="w-4 h-4 mr-2" />
                          Play
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="reviews" className="mt-8">
                {reviewsLoading ? (
                  <div className="space-y-6">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="border-b border-border pb-6">
                        <div className="flex items-start space-x-4">
                          <Skeleton className="w-10 h-10 rounded-full" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-1/4" />
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-3 w-1/6" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : reviews?.length === 0 ? (
                  <div className="text-center py-12">
                    <h3 className="text-lg font-semibold mb-2">No reviews yet</h3>
                    <p className="text-muted-foreground">Be the first to review this anime!</p>
                  </div>
                ) : (
                  <div className="space-y-6" data-testid="reviews-list">
                    {reviews?.map((review: any) => (
                      <div
                        key={review.id}
                        className="border-b border-border pb-6 last:border-b-0"
                        data-testid={`review-${review.id}`}
                      >
                        <div className="flex items-start space-x-4">
                          <img
                            src={review.user.profileImageUrl || `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&h=40`}
                            alt={review.user.username}
                            className="w-10 h-10 rounded-full"
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="font-medium text-foreground">
                                {review.user.username}
                              </span>
                              <div className="flex text-accent">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < review.rating ? "fill-current" : ""
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            {review.title && (
                              <h4 className="font-medium text-foreground mb-2">{review.title}</h4>
                            )}
                            <p className="text-muted-foreground leading-relaxed">
                              {review.content}
                            </p>
                            <div className="flex items-center space-x-4 mt-3">
                              <button className="flex items-center space-x-1 text-muted-foreground hover:text-primary transition-colors">
                                <i className="fas fa-thumbs-up text-sm"></i>
                                <span className="text-sm">{review.likes || 0}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>
    </div>
  );
}
