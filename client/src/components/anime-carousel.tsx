import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import AnimeCard from "./anime-card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";

interface AnimeCarouselProps {
  title: string;
  anime: any[];
  viewAllLink?: string;
  testId?: string;
}

export default function AnimeCarousel({ title, anime, viewAllLink, testId }: AnimeCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  if (!anime || anime.length === 0) {
    return (
      <div className="space-y-4" data-testid={testId}>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        </div>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📺</div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No anime available</h3>
          <p className="text-muted-foreground">Check back later for new content!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid={testId}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground" data-testid={`${testId}-title`}>
          {title}
        </h2>
        <div className="flex items-center space-x-2">
          {/* Scroll Controls */}
          <Button
            variant="outline"
            size="sm"
            onClick={scrollLeft}
            className="hidden md:flex"
            data-testid={`${testId}-scroll-left`}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={scrollRight}
            className="hidden md:flex"
            data-testid={`${testId}-scroll-right`}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          
          {/* View All Link */}
          {viewAllLink && (
            <Link href={viewAllLink}>
              <Button
                variant="link"
                className="text-primary hover:text-primary/80 transition-colors p-0"
                data-testid={`${testId}-view-all`}
              >
                View All
              </Button>
            </Link>
          )}
        </div>
      </div>
      
      {/* Carousel */}
      <div className="relative">
        <div
          ref={scrollRef}
          className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide"
          data-testid={`${testId}-carousel`}
        >
          {anime.map((item, index) => (
            <div key={item.id} className="flex-none w-48">
              <AnimeCard
                anime={item}
                onClick={() => {}} // Will be handled by Link inside AnimeCard
                testId={`${testId}-card-${index}`}
              />
            </div>
          ))}
        </div>
        
        {/* Gradient overlays for visual effect */}
        <div className="absolute left-0 top-0 bottom-4 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-4 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none" />
      </div>
    </div>
  );
}
