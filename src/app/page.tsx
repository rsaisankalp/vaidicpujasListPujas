
'use client';

import { useState, useEffect, useMemo } from 'react';
import { fetchEvents } from '@/lib/google-sheet-service';
import { categorizePujaEvent } from '@/ai/flows/categorize-puja-event';
import { 
  parsePujaDates, 
  formatPujaDate, 
  formatPujaTime, 
  isValidDate,
  isEventTomorrow,
  isEventThisWeek
} from '@/lib/date-utils';
import EventSection from '@/components/events/EventSection';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Bell, BookOpen, Flower2, Zap, UtensilsCrossed, Search as SearchIcon } from 'lucide-react';
import type { ProcessedPujaEvent, PujaEventData } from '@/types';

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

export default function Home() {
  const [allProcessedEvents, setAllProcessedEvents] = useState<ProcessedPujaEvent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadEvents() {
      setIsLoading(true);
      const rawEvents: PujaEventData[] = await fetchEvents();
      
      const nonDonationEvents = rawEvents.filter(event => !event.Activity.toLowerCase().startsWith('donation-'));

      const processedEventsPromises = nonDonationEvents.map(async (event) => {
        try {
          const { startDate: parsedStartDate, endDate: parsedEndDate } = parsePujaDates(event.Date, event.Time);
          let categoryData = { category: undefined, tags: [] };

          if (process.env.NEXT_PUBLIC_GOOGLE_API_KEY && String(process.env.NEXT_PUBLIC_GOOGLE_API_KEY).trim() !== '') {
            try {
              categoryData = await categorizePujaEvent({
                seva: event.Seva,
                venue: event.Venue,
                activity: event.Activity,
              });
            } catch (aiError) {
              // AI categorization failed, proceed with default categoryData
            }
          }
          
          const visuals = getEventVisuals(event.Activity, event.Seva);
          const uniqueId = event.details || event.UniqueID || `${event.Seva}-${event.Date}-${event.Time}-${Math.random().toString(36).substring(7)}`;

          let displayDate = event.Date; // Default to original date string from CSV
          // If it's not a range and the start date is valid, format the start date
          if (!event.Date.toLowerCase().includes(' to ') && isValidDate(parsedStartDate)) {
            displayDate = formatPujaDate(parsedStartDate);
          }

          return {
            ...event,
            id: uniqueId,
            parsedStartDate: parsedStartDate,
            parsedEndDate: parsedEndDate,
            category: categoryData.category,
            tags: categoryData.tags,
            ...visuals,
            formattedDate: displayDate,
            formattedTime: isValidDate(parsedStartDate) ? formatPujaTime(parsedStartDate) : event.Time,
          };
        } catch (error) {
          const { startDate: parsedStartDate, endDate: parsedEndDate } = parsePujaDates(event.Date, event.Time); 
          const visuals = getEventVisuals(event.Activity, event.Seva);
          const uniqueId = event.details || event.UniqueID || `${event.Seva}-${event.Date}-${event.Time}-${Math.random().toString(36).substring(7)}`;
          
          let displayDate = event.Date;
          if (!event.Date.toLowerCase().includes(' to ') && isValidDate(parsedStartDate)) {
            displayDate = formatPujaDate(parsedStartDate);
          }

          return {
            ...event,
            id: uniqueId,
            parsedStartDate: isValidDate(parsedStartDate) ? parsedStartDate : new Date(0),
            parsedEndDate: isValidDate(parsedEndDate) ? parsedEndDate : undefined,
            category: undefined, 
            tags: [],
            ...visuals,
            formattedDate: displayDate,
            formattedTime: isValidDate(parsedStartDate) ? formatPujaTime(parsedStartDate) : event.Time,
          };
        }
      });

      const settledEvents = await Promise.all(processedEventsPromises);
      
      settledEvents.sort((a, b) => {
        if (!isValidDate(a.parsedStartDate) || !isValidDate(b.parsedStartDate)) return 0;
        return a.parsedStartDate.getTime() - b.parsedStartDate.getTime();
      });
      setAllProcessedEvents(settledEvents);
      setIsLoading(false);
    }
    loadEvents();
  }, []);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) {
        return [];
    }
    const lowerSearchQuery = searchQuery.toLowerCase();
    return allProcessedEvents.filter(event =>
        (event.Seva && event.Seva.toLowerCase().includes(lowerSearchQuery)) ||
        (event.Activity && event.Activity.toLowerCase().includes(lowerSearchQuery)) ||
        (event.Venue && event.Venue.toLowerCase().includes(lowerSearchQuery)) ||
        (event.category && event.category.toLowerCase().includes(lowerSearchQuery)) ||
        (event.tags && event.tags.some(tag => tag.toLowerCase().includes(lowerSearchQuery)))
    );
  }, [searchQuery, allProcessedEvents]);

  const isSearching = searchQuery.trim().length > 0;

  const todayForFiltering = new Date();

  const upcomingEvents = allProcessedEvents.filter(event => {
    if (!isValidDate(event.parsedStartDate)) return false;
    const todayStartOfDay = new Date(todayForFiltering.getFullYear(), todayForFiltering.getMonth(), todayForFiltering.getDate());
    
    if (event.parsedEndDate && isValidDate(event.parsedEndDate)) {
      return event.parsedEndDate >= todayStartOfDay;
    } else {
      return event.parsedStartDate >= todayStartOfDay;
    }
  });

  const tomorrowEvents = upcomingEvents.filter(event => isEventTomorrow(event, todayForFiltering));
  
  const thisWeekEvents = upcomingEvents.filter(
    event => isEventThisWeek(event, todayForFiltering) && !isEventTomorrow(event, todayForFiltering) 
  );
  
  const otherUpcomingEvents = upcomingEvents.filter(
    event => !isEventTomorrow(event, todayForFiltering) && !isEventThisWeek(event, todayForFiltering)
  );

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {!isSearching && (
          <section className="mb-12 text-center">
            <h1 className="font-headline text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 text-primary">
              Discover Sacred Pujas
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Connect with divine energies through ancient Vaidic rituals. Find events and register with ease.
            </p>
          </section>
        )}

        {isLoading ? (
          <div className="text-center py-10">
            <Zap className="w-16 h-16 mx-auto text-muted-foreground mb-4 animate-pulse" />
            <p className="text-xl text-muted-foreground">Loading events...</p>
          </div>
        ) : isSearching ? (
          searchResults.length > 0 ? (
            <EventSection title="Search Results" events={searchResults} />
          ) : (
            <div className="text-center py-10">
              <SearchIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-xl text-muted-foreground">No events found matching your search.</p>
              <p className="text-muted-foreground">Try a different search term.</p>
            </div>
          )
        ) : (
          <>
            {tomorrowEvents.length > 0 && (
              <EventSection title="Tomorrow's Puja/Homa" events={tomorrowEvents} isTomorrowSection />
            )}
            {thisWeekEvents.length > 0 && (
              <EventSection title="This Week's Pujas/Homas" events={thisWeekEvents} />
            )}
            {otherUpcomingEvents.length > 0 && (
              <EventSection title="Next Pujas/Homas" events={otherUpcomingEvents} />
            )}
            
            {!isSearching && upcomingEvents.length === 0 && !isLoading && (
               <div className="text-center py-10">
                 <Zap className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                 <p className="text-xl text-muted-foreground">No upcoming pujas scheduled at the moment.</p>
                 <p className="text-muted-foreground">Please check back later for new events.</p>
               </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
