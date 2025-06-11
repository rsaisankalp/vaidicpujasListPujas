
import { fetchEvents } from '@/lib/google-sheet-service';
import { categorizePujaEvent } from '@/ai/flows/categorize-puja-event';
import { isTomorrow, isThisWeek, parsePujaDate, formatPujaDate, formatPujaTime } from '@/lib/date-utils';
import EventSection from '@/components/events/EventSection';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Bell, BookOpen, Flower2, Zap, UtensilsCrossed } from 'lucide-react';
import type { ProcessedPujaEvent, PujaEventData } from '@/types';

// Helper to get icon and image hint
const getEventVisuals = (activity: string, seva: string): { icon: React.ElementType, imageHint: string } => {
  const lowerActivity = activity.toLowerCase();
  const lowerSeva = seva.toLowerCase();

  if (lowerActivity.includes('homa') || lowerSeva.includes('homa')) {
    if (lowerSeva.includes('ganpati')) return { icon: UtensilsCrossed, imageHint: 'ganesha fire ritual' };
    return { icon: Bell, imageHint: 'fire ritual' };
  }
  if (lowerActivity.includes('parayan') || lowerSeva.includes('parayan')) {
    return { icon: BookOpen, imageHint: 'scripture reading' };
  }
  if (lowerActivity.includes('archana') || lowerSeva.includes('archana')) {
    return { icon: Flower2, imageHint: 'flower offering' };
  }
  if (lowerActivity.includes('ganpati') || lowerSeva.includes('ganpati')) {
    return { icon: UtensilsCrossed, imageHint: 'ganesha worship' };
  }
  return { icon: Zap, imageHint: 'spiritual event' };
};


export default async function Home() {
  const rawEvents: PujaEventData[] = await fetchEvents();
  
  const processedEvents: ProcessedPujaEvent[] = await Promise.all(
    rawEvents.map(async (event) => {
      try {
        const parsedDt = parsePujaDate(event.Date, event.Time);
        let categoryData;
        try {
           categoryData = await categorizePujaEvent({
            seva: event.Seva,
            venue: event.Venue,
            activity: event.Activity,
          });
        } catch (aiError) {
          console.warn("AI categorization failed for event:", event.Seva, aiError);
          categoryData = { category: undefined, tags: [] }; // Fallback if AI fails
        }
        
        const visuals = getEventVisuals(event.Activity, event.Seva);

        return {
          ...event,
          id: event.details || `${event.Seva}-${event.Date}-${event.Time}-${Math.random()}`, 
          parsedDate: parsedDt,
          category: categoryData.category,
          tags: categoryData.tags,
          ...visuals,
          formattedDate: formatPujaDate(parsedDt),
          formattedTime: formatPujaTime(parsedDt),
        };
      } catch (error) {
        console.error("Error processing event:", event.Seva, error);
        const parsedDt = parsePujaDate(event.Date, event.Time); // Attempt to parse date even on error for fallback
        const visuals = getEventVisuals(event.Activity, event.Seva); // Get visuals even on error
        return {
          ...event,
          id: event.details || `${event.Seva}-${event.Date}-${event.Time}-${Math.random()}`,
          parsedDate: parsedDt || new Date(0), 
          category: undefined, 
          tags: [],
          ...visuals,
          formattedDate: parsedDt ? formatPujaDate(parsedDt) : event.Date,
          formattedTime: parsedDt ? formatPujaTime(parsedDt) : event.Time,
        };
      }
    })
  );

  processedEvents.sort((a, b) => {
    if (!a.parsedDate || !b.parsedDate) return 0; // Should not happen with fallbacks
    return a.parsedDate.getTime() - b.parsedDate.getTime();
  });

  const now = new Date();
  const upcomingEvents = processedEvents.filter(event => event.parsedDate && event.parsedDate.getTime() >= now.setHours(0,0,0,0));


  const tomorrowEvents = upcomingEvents.filter(event => event.parsedDate && isTomorrow(event.parsedDate));
  const thisWeekEvents = upcomingEvents.filter(
    event => event.parsedDate && isThisWeek(event.parsedDate) && !isTomorrow(event.parsedDate) 
  );
  const otherUpcomingEvents = upcomingEvents.filter(
    event => event.parsedDate && !isTomorrow(event.parsedDate) && !isThisWeek(event.parsedDate)
  );


  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <section className="mb-12 text-center">
          <h1 className="font-headline text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 text-primary">
            Discover Sacred Pujas
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Connect with divine energies through ancient Vaidic rituals. Find events and register with ease.
          </p>
        </section>

        {tomorrowEvents.length > 0 && (
          <EventSection title="Tomorrow's Puja/Homa" events={tomorrowEvents} isTomorrowSection />
        )}
        {thisWeekEvents.length > 0 && (
          <EventSection title="This Week's Pujas/Homas" events={thisWeekEvents} />
        )}
        {otherUpcomingEvents.length > 0 && (
          <EventSection title="Next Pujas/Homas" events={otherUpcomingEvents} />
        )}
        
        {upcomingEvents.length === 0 && (
           <div className="text-center py-10">
             <Zap className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
             <p className="text-xl text-muted-foreground">No upcoming pujas scheduled at the moment.</p>
             <p className="text-muted-foreground">Please check back later for new events.</p>
           </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
