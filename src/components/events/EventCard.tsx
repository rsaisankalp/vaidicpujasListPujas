
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Clock, MapPin, Sparkles, Zap } from 'lucide-react'; // Added Sparkles
import type { ProcessedPujaEvent } from '@/types';

interface EventCardProps {
  event: ProcessedPujaEvent;
  isTomorrowHighlight?: boolean; 
}

const EventCard: React.FC<EventCardProps> = ({ event, isTomorrowHighlight }) => {
  const EventIconComponent = event.icon || Zap; 
  const registrationBaseUrl = "https://vaidicpujas.org";

  return (
    <Card className={`flex flex-col overflow-hidden rounded-xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 bg-card ${isTomorrowHighlight ? 'border-2 border-primary ring-2 ring-primary/50' : 'border-border'}`}>
      <div className="relative w-full h-48 sm:h-56">
        <Image
          src={`https://placehold.co/600x400.png`}
          alt={event.Seva}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
          data-ai-hint={event.imageHint || "spiritual event"}
          priority={isTomorrowHighlight} 
        />
        {isTomorrowHighlight && (
          <div className="absolute top-3 right-3 bg-primary text-primary-foreground px-3 py-1.5 rounded-full text-xs font-semibold shadow-md">
            Tomorrow
          </div>
        )}
      </div>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="font-headline text-xl lg:text-2xl mb-1 leading-tight">{event.Seva}</CardTitle>
        
        {event.isGurudevPresence && (
          <div className="flex items-center text-sm text-accent font-semibold mb-1.5">
            <Sparkles className="w-4 h-4 mr-2 shrink-0 text-accent" />
            <span>In the presence of Gurudev</span>
          </div>
        )}

        <div className="flex items-center text-sm text-muted-foreground mb-1">
          <CalendarDays className="w-4 h-4 mr-2 shrink-0 text-primary" />
          <span>{event.formattedDate}</span>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Clock className="w-4 h-4 mr-2 shrink-0 text-primary" />
          <span>{event.formattedTime}</span>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2 flex-grow">
        <div className="flex items-start text-sm mb-2">
          <MapPin className="w-4 h-4 mr-2 mt-0.5 shrink-0 text-primary" />
          <span className="font-medium">{event.Venue}</span>
        </div>
        <div className="flex items-start text-sm mb-3">
          <EventIconComponent className="w-4 h-4 mr-2 mt-0.5 shrink-0 text-primary" />
          <span className="text-muted-foreground">{event.Activity.split('-').pop()}</span>
        </div>
        
        {event.category && (
          <div className="mb-2">
            <Badge variant="secondary" className="text-xs bg-secondary/70 text-secondary-foreground py-1 px-2 rounded-md">{event.category}</Badge>
          </div>
        )}
        {event.tags && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {event.tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="outline" className="text-xs border-primary/50 text-primary py-0.5 px-1.5 rounded-md">{tag}</Badge>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 mt-auto bg-card">
        <Button asChild className="w-full bg-accent text-accent-foreground hover:bg-accent/90 transition-transform transform hover:scale-105 py-3 text-base">
          <Link href={`${registrationBaseUrl}${event.link}`} target="_blank" rel="noopener noreferrer">
            Register
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EventCard;
