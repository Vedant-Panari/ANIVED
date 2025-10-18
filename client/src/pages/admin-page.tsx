import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import NavigationHeader from "@/components/navigation-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertAnimeSchema, insertEpisodeSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { Plus, Edit, Trash2, Users, Film, BarChart3, TrendingUp, AlertTriangle } from "lucide-react";

const animeFormSchema = insertAnimeSchema.extend({
  genres: z.string().min(1, "At least one genre is required"),
});

const episodeFormSchema = insertEpisodeSchema;

type AnimeFormData = z.infer<typeof animeFormSchema>;
type EpisodeFormData = z.infer<typeof episodeFormSchema>;

export default function AdminPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedAnime, setSelectedAnime] = useState<string>("");

  // Check if user is admin
  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <NavigationHeader />
        <main className="pt-16 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
            <p className="text-muted-foreground">You don't have permission to access the admin panel.</p>
          </div>
        </main>
      </div>
    );
  }

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/admin/stats"],
    queryFn: async () => {
      // Mock stats since we don't have a dedicated stats endpoint
      const [animeRes, usersRes] = await Promise.all([
        fetch("/api/anime"),
        // We'll need to add a users endpoint for admin
      ]);
      
      return {
        totalUsers: 245678,
        activeSubscriptions: 89432,
        totalAnime: 3247,
        totalViews: 12800000
      };
    }
  });

  const { data: anime, isLoading: animeLoading } = useQuery({
    queryKey: ["/api/anime", { limit: 50 }],
  });

  const animeForm = useForm<AnimeFormData>({
    resolver: zodResolver(animeFormSchema),
    defaultValues: {
      title: "",
      description: "",
      genres: "",
      studio: "",
      releaseYear: new Date().getFullYear(),
      episodeCount: 1,
      posterUrl: "",
      bannerUrl: "",
      status: "ongoing",
      isPremium: false,
    },
  });

  const episodeForm = useForm<EpisodeFormData>({
    resolver: zodResolver(episodeFormSchema),
    defaultValues: {
      animeId: "",
      episodeNumber: 1,
      title: "",
      description: "",
      duration: 1440, // 24 minutes in seconds
      videoUrl: "",
      thumbnailUrl: "",
    },
  });

  const createAnimeMutation = useMutation({
    mutationFn: async (data: AnimeFormData) => {
      const processedData = {
        ...data,
        genres: data.genres.split(",").map(g => g.trim()),
      };
      const response = await apiRequest("POST", "/api/anime", processedData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/anime"] });
      toast({
        title: "Success",
        description: "Anime created successfully",
      });
      animeForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createEpisodeMutation = useMutation({
    mutationFn: async (data: EpisodeFormData) => {
      const response = await apiRequest("POST", "/api/episodes", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/anime"] });
      toast({
        title: "Success",
        description: "Episode created successfully",
      });
      episodeForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteAnimeMutation = useMutation({
    mutationFn: async (animeId: string) => {
      await apiRequest("DELETE", `/api/anime/${animeId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/anime"] });
      toast({
        title: "Success",
        description: "Anime deleted successfully",
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

  const onCreateAnime = async (data: AnimeFormData) => {
    await createAnimeMutation.mutateAsync(data);
  };

  const onCreateEpisode = async (data: EpisodeFormData) => {
    await createEpisodeMutation.mutateAsync(data);
  };

  return (
    <div className="min-h-screen bg-background text-foreground" data-testid="admin-page">
      <NavigationHeader />
      
      <main className="pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-secondary p-6 text-primary-foreground rounded-lg mb-8">
              <h1 className="text-3xl font-bold mb-2" data-testid="admin-title">Admin Dashboard</h1>
              <p className="opacity-90">Content management and platform analytics</p>
            </div>

            {/* Stats Cards */}
            <div className="grid lg:grid-cols-4 gap-6 mb-8">
              {statsLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <Skeleton className="h-8 w-24 mb-2" />
                      <Skeleton className="h-4 w-16" />
                    </CardContent>
                  </Card>
                ))
              ) : (
                <>
                  <Card data-testid="stat-total-users">
                    <CardContent className="p-6 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Users className="h-6 w-6 text-primary mr-2" />
                        <div className="text-2xl font-bold text-foreground">
                          {stats?.totalUsers.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">Total Users</div>
                      <div className="text-xs text-green-500 mt-1">↗ +12.5%</div>
                    </CardContent>
                  </Card>

                  <Card data-testid="stat-active-subscriptions">
                    <CardContent className="p-6 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <TrendingUp className="h-6 w-6 text-secondary mr-2" />
                        <div className="text-2xl font-bold text-foreground">
                          {stats?.activeSubscriptions.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">Active Subscriptions</div>
                      <div className="text-xs text-green-500 mt-1">↗ +8.2%</div>
                    </CardContent>
                  </Card>

                  <Card data-testid="stat-total-anime">
                    <CardContent className="p-6 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Film className="h-6 w-6 text-accent mr-2" />
                        <div className="text-2xl font-bold text-foreground">
                          {stats?.totalAnime.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">Anime Titles</div>
                      <div className="text-xs text-accent mt-1">+15 this week</div>
                    </CardContent>
                  </Card>

                  <Card data-testid="stat-total-views">
                    <CardContent className="p-6 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <BarChart3 className="h-6 w-6 text-chart-4 mr-2" />
                        <div className="text-2xl font-bold text-foreground">
                          {(stats?.totalViews / 1000000).toFixed(1)}M
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">Total Views</div>
                      <div className="text-xs text-green-500 mt-1">↗ +15.3%</div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            {/* Content Management */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Add New Anime */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Content Management</CardTitle>
                      <CardDescription>Add new anime and episodes to the platform</CardDescription>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button data-testid="button-add-anime">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Anime
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Add New Anime</DialogTitle>
                          <DialogDescription>
                            Fill in the details to add a new anime to the platform
                          </DialogDescription>
                        </DialogHeader>
                        
                        <form onSubmit={animeForm.handleSubmit(onCreateAnime)} className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="title">Title</Label>
                              <Input
                                id="title"
                                {...animeForm.register("title")}
                                placeholder="Enter anime title"
                                data-testid="input-anime-title"
                              />
                              {animeForm.formState.errors.title && (
                                <p className="text-sm text-destructive mt-1">
                                  {animeForm.formState.errors.title.message}
                                </p>
                              )}
                            </div>
                            
                            <div>
                              <Label htmlFor="studio">Studio</Label>
                              <Input
                                id="studio"
                                {...animeForm.register("studio")}
                                placeholder="Animation studio"
                                data-testid="input-anime-studio"
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                              id="description"
                              {...animeForm.register("description")}
                              placeholder="Enter anime description"
                              rows={3}
                              data-testid="textarea-anime-description"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="genres">Genres (comma-separated)</Label>
                              <Input
                                id="genres"
                                {...animeForm.register("genres")}
                                placeholder="Action, Adventure, Drama"
                                data-testid="input-anime-genres"
                              />
                              {animeForm.formState.errors.genres && (
                                <p className="text-sm text-destructive mt-1">
                                  {animeForm.formState.errors.genres.message}
                                </p>
                              )}
                            </div>
                            
                            <div>
                              <Label htmlFor="releaseYear">Release Year</Label>
                              <Input
                                id="releaseYear"
                                type="number"
                                {...animeForm.register("releaseYear", { valueAsNumber: true })}
                                min="1900"
                                max={new Date().getFullYear() + 5}
                                data-testid="input-anime-year"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="episodeCount">Episode Count</Label>
                              <Input
                                id="episodeCount"
                                type="number"
                                {...animeForm.register("episodeCount", { valueAsNumber: true })}
                                min="1"
                                data-testid="input-anime-episodes"
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor="status">Status</Label>
                              <Select
                                value={animeForm.watch("status")}
                                onValueChange={(value) => animeForm.setValue("status", value)}
                              >
                                <SelectTrigger data-testid="select-anime-status">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="ongoing">Ongoing</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                  <SelectItem value="upcoming">Upcoming</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="posterUrl">Poster URL</Label>
                              <Input
                                id="posterUrl"
                                {...animeForm.register("posterUrl")}
                                placeholder="https://example.com/poster.jpg"
                                data-testid="input-anime-poster"
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor="bannerUrl">Banner URL</Label>
                              <Input
                                id="bannerUrl"
                                {...animeForm.register("bannerUrl")}
                                placeholder="https://example.com/banner.jpg"
                                data-testid="input-anime-banner"
                              />
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="isPremium"
                              {...animeForm.register("isPremium")}
                              className="rounded border-border"
                              data-testid="checkbox-anime-premium"
                            />
                            <Label htmlFor="isPremium">Premium Content</Label>
                          </div>

                          <div className="flex justify-end space-x-2">
                            <Button
                              type="submit"
                              disabled={createAnimeMutation.isPending}
                              data-testid="button-submit-anime"
                            >
                              {createAnimeMutation.isPending ? "Creating..." : "Create Anime"}
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {/* Recent Uploads */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-foreground">Recent Uploads</h4>
                    
                    {animeLoading ? (
                      <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="flex items-center space-x-4 p-4 bg-muted/30 rounded-lg">
                            <Skeleton className="w-12 h-16" />
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-4 w-3/4" />
                              <Skeleton className="h-3 w-1/2" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3" data-testid="recent-uploads">
                        {anime?.anime.slice(0, 5).map((item: any) => (
                          <div
                            key={item.id}
                            className="flex items-center space-x-4 p-4 bg-muted/30 rounded-lg"
                            data-testid={`upload-item-${item.id}`}
                          >
                            {item.posterUrl && (
                              <img
                                src={item.posterUrl}
                                alt={item.title}
                                className="w-12 h-16 object-cover rounded"
                              />
                            )}
                            <div className="flex-1">
                              <h4 className="font-medium text-foreground">{item.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                {item.episodeCount} episodes • {item.studio}
                              </p>
                              <div className="flex items-center space-x-2 mt-1">
                                {item.isPremium && (
                                  <Badge className="bg-accent/20 text-accent">Premium</Badge>
                                )}
                                <Badge variant="secondary">{item.status}</Badge>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                data-testid={`button-edit-${item.id}`}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => deleteAnimeMutation.mutate(item.id)}
                                data-testid={`button-delete-${item.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Add Episodes */}
              <Card>
                <CardHeader>
                  <CardTitle>Episode Management</CardTitle>
                  <CardDescription>Add episodes to existing anime</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <form onSubmit={episodeForm.handleSubmit(onCreateEpisode)} className="space-y-4">
                    <div>
                      <Label htmlFor="animeSelect">Select Anime</Label>
                      <Select
                        value={episodeForm.watch("animeId")}
                        onValueChange={(value) => episodeForm.setValue("animeId", value)}
                      >
                        <SelectTrigger data-testid="select-episode-anime">
                          <SelectValue placeholder="Choose an anime" />
                        </SelectTrigger>
                        <SelectContent>
                          {anime?.anime.map((item: any) => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="episodeNumber">Episode Number</Label>
                        <Input
                          id="episodeNumber"
                          type="number"
                          {...episodeForm.register("episodeNumber", { valueAsNumber: true })}
                          min="1"
                          data-testid="input-episode-number"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="episodeDuration">Duration (minutes)</Label>
                        <Input
                          id="episodeDuration"
                          type="number"
                          {...episodeForm.register("duration", { 
                            valueAsNumber: true,
                            setValueAs: (value) => value * 60 // Convert minutes to seconds
                          })}
                          min="1"
                          data-testid="input-episode-duration"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="episodeTitle">Episode Title</Label>
                      <Input
                        id="episodeTitle"
                        {...episodeForm.register("title")}
                        placeholder="Episode title"
                        data-testid="input-episode-title"
                      />
                    </div>

                    <div>
                      <Label htmlFor="episodeDescription">Description</Label>
                      <Textarea
                        id="episodeDescription"
                        {...episodeForm.register("description")}
                        placeholder="Episode description"
                        rows={2}
                        data-testid="textarea-episode-description"
                      />
                    </div>

                    <div>
                      <Label htmlFor="videoUrl">Video URL</Label>
                      <Input
                        id="videoUrl"
                        {...episodeForm.register("videoUrl")}
                        placeholder="https://example.com/video.mp4"
                        data-testid="input-episode-video"
                      />
                    </div>

                    <div>
                      <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
                      <Input
                        id="thumbnailUrl"
                        {...episodeForm.register("thumbnailUrl")}
                        placeholder="https://example.com/thumbnail.jpg"
                        data-testid="input-episode-thumbnail"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={createEpisodeMutation.isPending}
                      className="w-full"
                      data-testid="button-submit-episode"
                    >
                      {createEpisodeMutation.isPending ? "Creating..." : "Add Episode"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
