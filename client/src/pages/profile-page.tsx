import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import NavigationHeader from "@/components/navigation-header";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Play, Trash2, Star } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("watchlist");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: watchlist, isLoading: watchlistLoading } = useQuery({
    queryKey: [statusFilter !== "all" ? `/api/watchlist?status=${statusFilter}` : "/api/watchlist"],
    enabled: !!user,
  });

  const { data: viewingHistory, isLoading: historyLoading } = useQuery({
    queryKey: ["/api/viewing-history"],
    enabled: !!user,
  });

  const removeFromWatchlistMutation = useMutation({
    mutationFn: async (animeId: string) => {
      await apiRequest("DELETE", `/api/watchlist/${animeId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/watchlist"] });
      toast({
        title: "Removed from watchlist",
        description: "Anime has been removed from your watchlist",
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

  const updateWatchlistMutation = useMutation({
    mutationFn: async ({ animeId, updates }: { animeId: string; updates: any }) => {
      await apiRequest("PUT", `/api/watchlist/${animeId}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/watchlist"] });
    },
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <NavigationHeader />
        <main className="pt-16 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Please log in</h1>
            <p className="text-muted-foreground">You need to be logged in to view your profile.</p>
          </div>
        </main>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "watching":
        return "bg-blue-500/20 text-blue-500";
      case "completed":
        return "bg-green-500/20 text-green-500";
      case "plan_to_watch":
        return "bg-yellow-500/20 text-yellow-500";
      case "dropped":
        return "bg-red-500/20 text-red-500";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "watching":
        return "Watching";
      case "completed":
        return "Completed";
      case "plan_to_watch":
        return "Plan to Watch";
      case "dropped":
        return "Dropped";
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground" data-testid="profile-page">
      <NavigationHeader />
      
      <main className="pt-16">
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid lg:grid-cols-4 gap-8">
              {/* Profile Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-card border border-border rounded-lg p-6 sticky top-24">
                  <div className="text-center mb-6">
                    <img
                      src={user.profileImageUrl || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100`}
                      alt="User profile"
                      className="w-20 h-20 rounded-full mx-auto mb-4"
                      data-testid="profile-avatar"
                    />
                    <h3 className="text-lg font-semibold text-foreground" data-testid="profile-username">
                      {user.username}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Member since {new Date(user.createdAt).getFullYear()}
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <div className="text-xl font-bold text-foreground" data-testid="watchlist-count">
                        {watchlist?.length || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">Anime in List</div>
                    </div>
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <div className="text-xl font-bold text-foreground" data-testid="completed-count">
                        {watchlist?.filter((item: any) => item.status === "completed").length || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">Completed</div>
                    </div>
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <div className="text-xl font-bold text-foreground" data-testid="watching-count">
                        {watchlist?.filter((item: any) => item.status === "watching").length || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">Currently Watching</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Main Content */}
              <div className="lg:col-span-3">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="watchlist" data-testid="tab-watchlist">My Watchlist</TabsTrigger>
                    <TabsTrigger value="history" data-testid="tab-history">Recently Watched</TabsTrigger>
                  </TabsList>

                  <TabsContent value="watchlist" className="mt-8">
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-foreground">My Watchlist</h2>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant={statusFilter === "all" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setStatusFilter("all")}
                            data-testid="filter-all"
                          >
                            All
                          </Button>
                          <Button
                            variant={statusFilter === "watching" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setStatusFilter("watching")}
                            data-testid="filter-watching"
                          >
                            Watching
                          </Button>
                          <Button
                            variant={statusFilter === "plan_to_watch" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setStatusFilter("plan_to_watch")}
                            data-testid="filter-plan-to-watch"
                          >
                            Plan to Watch
                          </Button>
                          <Button
                            variant={statusFilter === "completed" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setStatusFilter("completed")}
                            data-testid="filter-completed"
                          >
                            Completed
                          </Button>
                        </div>
                      </div>
                      
                      {watchlistLoading ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="space-y-3">
                              <Skeleton className="w-full h-48" />
                              <Skeleton className="h-4 w-3/4" />
                              <Skeleton className="h-3 w-1/2" />
                            </div>
                          ))}
                        </div>
                      ) : watchlist?.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="text-6xl mb-4">📺</div>
                          <h3 className="text-xl font-semibold text-foreground mb-2">
                            Your watchlist is empty
                          </h3>
                          <p className="text-muted-foreground">
                            Start adding anime to your watchlist to track your progress
                          </p>
                        </div>
                      ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="watchlist-grid">
                          {watchlist?.map((item: any) => (
                            <div
                              key={item.id}
                              className="bg-card border border-border rounded-lg overflow-hidden group hover:border-primary/50 transition-colors"
                              data-testid={`watchlist-item-${item.anime.id}`}
                            >
                              {item.anime.posterUrl && (
                                <img
                                  src={item.anime.posterUrl}
                                  alt={item.anime.title}
                                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              )}
                              <div className="p-4">
                                <h3 className="font-medium text-foreground mb-2 group-hover:text-primary transition-colors">
                                  {item.anime.title}
                                </h3>
                                <div className="flex items-center justify-between mb-3">
                                  <Badge className={getStatusColor(item.status)}>
                                    {getStatusLabel(item.status)}
                                  </Badge>
                                  {item.progress > 0 && item.anime.episodeCount && (
                                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                      <span>{item.progress}/{item.anime.episodeCount}</span>
                                    </div>
                                  )}
                                </div>
                                {item.anime.episodeCount && (
                                  <div className="mb-3">
                                    <Progress
                                      value={(item.progress / item.anime.episodeCount) * 100}
                                      className="h-2"
                                    />
                                  </div>
                                )}
                                <div className="flex items-center justify-between">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex items-center space-x-1"
                                    data-testid={`button-continue-${item.anime.id}`}
                                  >
                                    <Play className="w-3 h-3" />
                                    <span>{item.progress > 0 ? "Continue" : "Start"}</span>
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => removeFromWatchlistMutation.mutate(item.animeId)}
                                    data-testid={`button-remove-${item.anime.id}`}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="history" className="mt-8">
                    <h3 className="text-xl font-semibold text-foreground mb-6">Recently Watched</h3>
                    
                    {historyLoading ? (
                      <div className="space-y-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className="flex items-center space-x-4 p-4 border border-border rounded-lg">
                            <Skeleton className="w-20 h-15" />
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-4 w-3/4" />
                              <Skeleton className="h-3 w-1/2" />
                            </div>
                            <Skeleton className="w-16 h-8" />
                          </div>
                        ))}
                      </div>
                    ) : viewingHistory?.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="text-6xl mb-4">🎬</div>
                        <h3 className="text-xl font-semibold text-foreground mb-2">
                          No viewing history
                        </h3>
                        <p className="text-muted-foreground">
                          Start watching anime to see your viewing history here
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4" data-testid="viewing-history">
                        {viewingHistory?.map((item: any) => (
                          <div
                            key={item.id}
                            className="flex items-center space-x-4 p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors cursor-pointer"
                            data-testid={`history-item-${item.id}`}
                          >
                            {item.episode.thumbnailUrl && (
                              <img
                                src={item.episode.thumbnailUrl}
                                alt={`${item.episode.anime.title} Episode ${item.episode.episodeNumber}`}
                                className="w-20 h-15 object-cover rounded"
                              />
                            )}
                            <div className="flex-1">
                              <h4 className="font-medium text-foreground">
                                {item.episode.anime.title} - Episode {item.episode.episodeNumber}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {item.episode.title}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Watched {new Date(item.watchedAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {item.completed ? (
                                <Badge className="bg-green-500/20 text-green-500">Completed</Badge>
                              ) : (
                                <span>
                                  {Math.floor(item.progress / 60)}:{(item.progress % 60).toString().padStart(2, '0')} / 
                                  {Math.floor(item.episode.duration / 60)}:{(item.episode.duration % 60).toString().padStart(2, '0')}
                                </span>
                              )}
                            </div>
                            <Button size="sm" data-testid={`button-rewatch-${item.id}`}>
                              <Play className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
