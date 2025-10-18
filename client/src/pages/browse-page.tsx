import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import NavigationHeader from "@/components/navigation-header";
import AnimeCard from "@/components/anime-card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function BrowsePage() {
  const [location, setLocation] = useLocation();
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    search: "",
    genre: "",
    studio: "",
    year: "",
    sortBy: "title",
    sortOrder: "asc",
  });

  // Build query string from filters
  const buildQueryString = () => {
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.genre) params.set('genre', filters.genre);
    if (filters.studio) params.set('studio', filters.studio);
    if (filters.year) params.set('year', filters.year);
    params.set('sortBy', filters.sortBy);
    params.set('sortOrder', filters.sortOrder);
    params.set('page', currentPage.toString());
    params.set('limit', '20');
    return params.toString();
  };

  const { data, isLoading } = useQuery({
    queryKey: [`/api/anime?${buildQueryString()}`],
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const totalPages = data ? Math.ceil(data.total / 20) : 0;

  return (
    <div className="min-h-screen bg-background text-foreground" data-testid="browse-page">
      <NavigationHeader />
      
      <main className="pt-16">
        <section className="py-12 bg-card/30">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Filters Sidebar */}
              <div className="lg:w-64 flex-none">
                <div className="bg-card border border-border rounded-lg p-6 sticky top-24">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Filters</h3>
                  
                  {/* Search */}
                  <div className="mb-6">
                    <Label htmlFor="search" className="text-sm font-medium text-foreground mb-3 block">
                      Search
                    </Label>
                    <Input
                      id="search"
                      data-testid="input-search"
                      placeholder="Search anime..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange("search", e.target.value)}
                    />
                  </div>

                  {/* Genre Filter */}
                  <div className="mb-6">
                    <Label className="text-sm font-medium text-foreground mb-3 block">Genre</Label>
                    <Select
                      value={filters.genre}
                      onValueChange={(value) => handleFilterChange("genre", value)}
                    >
                      <SelectTrigger data-testid="select-genre">
                        <SelectValue placeholder="All Genres" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Genres</SelectItem>
                        <SelectItem value="Action">Action</SelectItem>
                        <SelectItem value="Adventure">Adventure</SelectItem>
                        <SelectItem value="Comedy">Comedy</SelectItem>
                        <SelectItem value="Drama">Drama</SelectItem>
                        <SelectItem value="Fantasy">Fantasy</SelectItem>
                        <SelectItem value="Romance">Romance</SelectItem>
                        <SelectItem value="Thriller">Thriller</SelectItem>
                        <SelectItem value="Supernatural">Supernatural</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Studio Filter */}
                  <div className="mb-6">
                    <Label className="text-sm font-medium text-foreground mb-3 block">Studio</Label>
                    <Select
                      value={filters.studio}
                      onValueChange={(value) => handleFilterChange("studio", value)}
                    >
                      <SelectTrigger data-testid="select-studio">
                        <SelectValue placeholder="All Studios" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Studios</SelectItem>
                        <SelectItem value="Studio Ghibli">Studio Ghibli</SelectItem>
                        <SelectItem value="Toei Animation">Toei Animation</SelectItem>
                        <SelectItem value="Madhouse">Madhouse</SelectItem>
                        <SelectItem value="Ufotable">Ufotable</SelectItem>
                        <SelectItem value="MAPPA">MAPPA</SelectItem>
                        <SelectItem value="Wit Studio">Wit Studio</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Release Year */}
                  <div className="mb-6">
                    <Label className="text-sm font-medium text-foreground mb-3 block">Release Year</Label>
                    <Select
                      value={filters.year}
                      onValueChange={(value) => handleFilterChange("year", value)}
                    >
                      <SelectTrigger data-testid="select-year">
                        <SelectValue placeholder="All Years" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Years</SelectItem>
                        <SelectItem value="2024">2024</SelectItem>
                        <SelectItem value="2023">2023</SelectItem>
                        <SelectItem value="2022">2022</SelectItem>
                        <SelectItem value="2021">2021</SelectItem>
                        <SelectItem value="2020">2020</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sort Options */}
                  <div>
                    <Label className="text-sm font-medium text-foreground mb-3 block">Sort By</Label>
                    <Select
                      value={`${filters.sortBy}-${filters.sortOrder}`}
                      onValueChange={(value) => {
                        const [sortBy, sortOrder] = value.split("-");
                        setFilters(prev => ({ ...prev, sortBy, sortOrder }));
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger data-testid="select-sort">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="title-asc">Title A-Z</SelectItem>
                        <SelectItem value="title-desc">Title Z-A</SelectItem>
                        <SelectItem value="rating-desc">Rating High to Low</SelectItem>
                        <SelectItem value="rating-asc">Rating Low to High</SelectItem>
                        <SelectItem value="releaseYear-desc">Newest First</SelectItem>
                        <SelectItem value="releaseYear-asc">Oldest First</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              {/* Anime Grid */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <h2 className="text-xl font-semibold text-foreground">Browse Anime</h2>
                    <span className="text-sm text-muted-foreground" data-testid="results-count">
                      {data ? `${data.total} results` : "Loading..."}
                    </span>
                  </div>
                </div>
                
                {isLoading ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <div key={i} className="space-y-3">
                        <Skeleton className="w-full aspect-[3/4]" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    ))}
                  </div>
                ) : data?.anime.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">No anime found</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your filters or search terms
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6" data-testid="anime-grid">
                      {data?.anime.map((anime) => (
                        <AnimeCard
                          key={anime.id}
                          anime={anime}
                          onClick={() => setLocation(`/anime/${anime.id}`)}
                        />
                      ))}
                    </div>
                    
                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-center mt-12 space-x-2" data-testid="pagination">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          data-testid="button-prev-page"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const page = i + 1;
                          return (
                            <Button
                              key={page}
                              variant={currentPage === page ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(page)}
                              data-testid={`button-page-${page}`}
                            >
                              {page}
                            </Button>
                          );
                        })}
                        
                        {totalPages > 5 && (
                          <>
                            <span className="text-muted-foreground">...</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(totalPages)}
                              data-testid={`button-page-${totalPages}`}
                            >
                              {totalPages}
                            </Button>
                          </>
                        )}
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          data-testid="button-next-page"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
