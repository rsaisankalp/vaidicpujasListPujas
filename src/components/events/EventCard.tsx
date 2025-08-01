
import PujaImage from './PujaImage';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, Clock, MapPin, Sparkles, Zap, UtensilsCrossed, Bell, BookOpen, Flower2, Heart } from 'lucide-react';
import type { ProcessedPujaEvent } from '@/types';

const iconMap = {
  UtensilsCrossed,
  Bell,
  BookOpen,
  Flower2,
  Zap,
  Heart,
};

interface EventCardProps {
  event: ProcessedPujaEvent;
  isTomorrowHighlight?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({ event, isTomorrowHighlight }) => {
  const EventIconComponent = event.icon ? iconMap[event.icon as keyof typeof iconMap] : Zap;
  const registrationBaseUrl = "https://vaidicpujas.org";

  return (
    <Card className={`flex flex-col overflow-hidden rounded-xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 bg-card ${isTomorrowHighlight ? 'border-2 border-primary ring-2 ring-primary/50' : 'border-border'}`}>
      <div className="relative w-full h-48 sm:h-56">
        <PujaImage
          activity={event.Activity}
          altText={event.Seva || 'Event Image'}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
          imageHint={event.imageHint}
          priority={isTomorrowHighlight}
        />
        {isTomorrowHighlight && (
          <div className="absolute top-3 right-3 bg-primary text-primary-foreground px-3 py-1.5 rounded-full text-xs font-semibold shadow-md">
            Tomorrow
          </div>
        )}
        {event.isGurudevPresence && (
           <div className="absolute bottom-3 left-3 bg-accent text-accent-foreground px-3 py-1.5 rounded-full text-xs font-semibold shadow-md flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>Gurudev in Ashram</span>
          </div>
        )}
      </div>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="font-headline text-xl lg:text-2xl mb-1 leading-tight">{event.Seva}</CardTitle>
        
        {event.category !== "Donation" && (
          <div className="flex items-center text-sm text-muted-foreground mb-1">
            <CalendarDays className="w-4 h-4 mr-2 shrink-0 text-primary" />
            <span>{event.formattedDate}</span>
          </div>
        )}
        {event.category !== "Donation" && (
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="w-4 h-4 mr-2 shrink-0 text-primary" />
            <span>{event.formattedTime}</span>
          </div>
        )}
      </CardHeader>
      <CardContent className="p-4 pt-2 flex-grow">
        <div className="flex items-start text-sm mb-2">
          <MapPin className="w-4 h-4 mr-2 mt-0.5 shrink-0 text-primary" />
          <span className="font-medium">{event.Venue}</span>
        </div>
        <div className="flex items-start text-sm mb-3">
          <EventIconComponent className="w-4 h-4 mr-2 mt-0.5 shrink-0 text-primary" />
          {event.category === 'Donation' ? (
             <span className="text-muted-foreground">{event.details}</span>
          ) : (
            <span className="text-muted-foreground">{event.Activity ? event.Activity.split('-').pop() : 'Event'}</span>
          )}
        </div>
        
      </CardContent>
      <CardFooter className="p-4 mt-auto bg-card">
        <Button asChild className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-transform transform hover:scale-105 py-3 text-base">
          <Link href={`${registrationBaseUrl}${event.link}`} target="_blank" rel="noopener noreferrer">
            Register
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EventCard;
