import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

interface AnimeCardProps {
  anime: {
    id: string;
    title: string;
    posterUrl?: string;
    rating?: string;
    releaseYear?: number;
    genres?: string[];
    isPremium?: boolean;
    status?: string;
  };
  onClick?: () => void;
  testId?: string;
}

export default function AnimeCard({ anime, onClick, testId }: AnimeCardProps) {
  const content = (
    <div className="group cursor-pointer" data-testid={testId}>
      {/* Poster Image */}
      <div className="relative overflow-hidden rounded-lg mb-3">
        {anime.posterUrl ? (
          <img
            src={anime.posterUrl}
            alt={`${anime.title} poster`}
            className="w-full aspect-[3/4] object-cover group-hover:scale-105 transition-transform duration-300"
            data-testid={`${testId}-poster`}
          />
        ) : (
          <div className="w-full aspect-[3/4] bg-muted flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
            <div className="text-center">
              <div className="text-4xl mb-2">🎬</div>
              <p className="text-sm text-muted-foreground">No Image</p>
            </div>
          </div>
        )}
        
        {/* Premium Badge */}
        {anime.isPremium && (
          <Badge className="absolute top-2 right-2 bg-accent/20 text-accent backdrop-blur-sm">
            PREMIUM
          </Badge>
        )}
        
        {/* Status Badge */}
        {anime.status && anime.status !== "completed" && (
          <Badge
            className="absolute top-2 left-2 backdrop-blur-sm"
            variant={anime.status === "ongoing" ? "default" : "secondary"}
          >
            {anime.status === "ongoing" ? "ONGOING" : anime.status.toUpperCase()}
          </Badge>
        )}
      </div>
      
      {/* Info */}
      <div className="space-y-2">
        {/* Title */}
        <h3
          className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-tight"
          data-testid={`${testId}-title`}
        >
          {anime.title}
        </h3>
        
        {/* Rating */}
        {anime.rating && (
          <div className="flex items-center space-x-2" data-testid={`${testId}-rating`}>
            <div className="flex text-accent">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(Number(anime.rating)) ? "fill-current" : ""
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">{anime.rating}</span>
          </div>
        )}
        
        {/* Year and Genres */}
        <div className="space-y-1">
          {anime.releaseYear && (
            <p className="text-xs text-muted-foreground" data-testid={`${testId}-year`}>
              {anime.releaseYear}
            </p>
          )}
          
          {anime.genres && anime.genres.length > 0 && (
            <p className="text-xs text-muted-foreground line-clamp-1" data-testid={`${testId}-genres`}>
              {anime.genres.slice(0, 2).join(", ")}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  if (onClick) {
    return (
      <div onClick={onClick} data-testid={testId}>
        {content}
      </div>
    );
  }

  return (
    <Link href={`/anime/${anime.id}`} data-testid={`${testId}-link`}>
      {content}
    </Link>
  );
}
