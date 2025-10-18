import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Play, Plus, Info, Star } from "lucide-react";

export default function HeroSection() {
  // Get a featured anime (highest rated or most popular)
  const { data: featuredData, isLoading } = useQuery({
    queryKey: ["/api/anime", { sortBy: "rating", sortOrder: "desc", limit: 1 }],
  });

  const featuredAnime = featuredData?.anime[0];

  if (isLoading) {
    return (
      <section className="relative h-[70vh] overflow-hidden" data-testid="hero-section">
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/50 to-transparent z-10"></div>
        <Skeleton className="absolute inset-0 w-full h-full" />
        
        <div className="relative z-20 container mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl space-y-6">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-20 w-full" />
            <div className="flex space-x-4">
              <Skeleton className="h-12 w-32" />
              <Skeleton className="h-12 w-32" />
              <Skeleton className="h-12 w-32" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!featuredAnime) {
    return (
      <section className="relative h-[70vh] overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20" data-testid="hero-section">
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/50 to-transparent z-10"></div>
        
        <div className="relative z-20 container mx-auto px-4 h-full flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 text-foreground">
              Welcome to AniVED
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Discover amazing anime series and join our community
            </p>
            <Link href="/browse">
              <Button size="lg" data-testid="browse-button">
                <Play className="h-5 w-5 mr-2" />
                Start Watching
              </Button>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative h-[70vh] overflow-hidden" data-testid="hero-section">
      {/* Background with overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/50 to-transparent z-10"></div>
      {featuredAnime.bannerUrl && (
        <img
          src={featuredAnime.bannerUrl}
          alt={`${featuredAnime.title} banner`}
          className="absolute inset-0 w-full h-full object-cover"
          data-testid="hero-background"
        />
      )}
      
      <div className="relative z-20 container mx-auto px-4 h-full flex items-center">
        <div className="max-w-2xl">
          {/* New Episode Badge */}
          <div className="mb-4">
            <Badge className="bg-primary/20 text-primary" data-testid="hero-badge">
              Featured
            </Badge>
          </div>
          
          {/* Title */}
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-foreground" data-testid="hero-title">
            {featuredAnime.title}
          </h1>
          
          {/* Description */}
          <p className="text-lg text-muted-foreground mb-6 leading-relaxed" data-testid="hero-description">
            {featuredAnime.description || "Discover this amazing anime series and immerse yourself in its captivating world."}
          </p>
          
          {/* Stats */}
          <div className="flex items-center space-x-4 mb-6">
            {featuredAnime.rating && (
              <div className="flex items-center space-x-2" data-testid="hero-rating">
                <div className="flex text-accent">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(Number(featuredAnime.rating)) ? "fill-current" : ""
                      }`}
                    />
                  ))}
                </div>
                <span className="text-foreground font-medium">{featuredAnime.rating}</span>
              </div>
            )}
            
            {featuredAnime.releaseYear && (
              <span className="text-muted-foreground">{featuredAnime.releaseYear}</span>
            )}
            
            {featuredAnime.genres && featuredAnime.genres.length > 0 && (
              <span className="text-muted-foreground">
                {featuredAnime.genres.slice(0, 2).join(", ")}
              </span>
            )}
            
            {featuredAnime.isPremium && (
              <Badge className="bg-accent/20 text-accent">PREMIUM</Badge>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href={`/anime/${featuredAnime.id}`}>
              <Button className="flex items-center space-x-2" size="lg" data-testid="hero-watch-button">
                <Play className="w-5 h-5" />
                <span>Watch Now</span>
              </Button>
            </Link>
            
            <Button
              variant="outline"
              size="lg"
              className="flex items-center space-x-2 bg-muted/50 hover:bg-muted text-foreground"
              data-testid="hero-add-button"
            >
              <Plus className="w-5 h-5" />
              <span>Add to List</span>
            </Button>
            
            <Link href={`/anime/${featuredAnime.id}`}>
              <Button
                variant="outline"
                size="lg"
                className="flex items-center space-x-2 bg-muted/50 hover:bg-muted text-foreground"
                data-testid="hero-info-button"
              >
                <Info className="w-5 h-5" />
                <span>More Info</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
