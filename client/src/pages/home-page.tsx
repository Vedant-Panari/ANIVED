import NavigationHeader from "@/components/navigation-header";
import HeroSection from "@/components/hero-section";
import AnimeCarousel from "@/components/anime-carousel";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomePage() {
  const { data: popularAnime, isLoading: popularLoading } = useQuery({
    queryKey: ["/api/anime", { sortBy: "rating", sortOrder: "desc", limit: 10 }],
  });

  const { data: recentAnime, isLoading: recentLoading } = useQuery({
    queryKey: ["/api/anime", { sortBy: "releaseYear", sortOrder: "desc", limit: 10 }],
  });

  const { data: actionAnime, isLoading: actionLoading } = useQuery({
    queryKey: ["/api/anime", { genre: "Action", limit: 10 }],
  });

  return (
    <div className="min-h-screen bg-background text-foreground" data-testid="home-page">
      <NavigationHeader />
      
      <main className="pt-16">
        <HeroSection />
        
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4">
            {popularLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-48" />
                <div className="flex space-x-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="w-48 h-64" />
                  ))}
                </div>
              </div>
            ) : (
              <AnimeCarousel
                title="Trending Now"
                anime={popularAnime?.anime || []}
                viewAllLink="/browse?sort=rating"
                testId="trending-carousel"
              />
            )}
          </div>
        </section>

        <section className="py-12 bg-card/30">
          <div className="container mx-auto px-4">
            {recentLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-48" />
                <div className="flex space-x-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="w-48 h-64" />
                  ))}
                </div>
              </div>
            ) : (
              <AnimeCarousel
                title="Recently Added"
                anime={recentAnime?.anime || []}
                viewAllLink="/browse?sort=releaseYear"
                testId="recent-carousel"
              />
            )}
          </div>
        </section>

        <section className="py-12 bg-background">
          <div className="container mx-auto px-4">
            {actionLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-48" />
                <div className="flex space-x-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="w-48 h-64" />
                  ))}
                </div>
              </div>
            ) : (
              <AnimeCarousel
                title="Action & Adventure"
                anime={actionAnime?.anime || []}
                viewAllLink="/browse?genre=Action"
                testId="action-carousel"
              />
            )}
          </div>
        </section>
      </main>

      <footer className="bg-card border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                  <i className="fas fa-play text-white text-sm"></i>
                </div>
                <span className="text-xl font-bold text-foreground">AniVED</span>
              </div>
              <p className="text-muted-foreground mb-4">
                The ultimate destination for anime streaming and community engagement.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <i className="fab fa-discord"></i>
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <i className="fab fa-reddit"></i>
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <i className="fab fa-instagram"></i>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-4">Browse</h4>
              <ul className="space-y-2">
                <li><a href="/browse" className="text-muted-foreground hover:text-primary transition-colors">Popular Anime</a></li>
                <li><a href="/browse?sort=releaseYear" className="text-muted-foreground hover:text-primary transition-colors">New Releases</a></li>
                <li><a href="/browse?sort=rating" className="text-muted-foreground hover:text-primary transition-colors">Top Rated</a></li>
                <li><a href="/browse" className="text-muted-foreground hover:text-primary transition-colors">Genres</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-4">Community</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Forums</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Reviews</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Discussion</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Fan Art</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Help Center</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Contact Us</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border mt-8 pt-8 text-center">
            <p className="text-muted-foreground">&copy; 2024 AniVED. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
