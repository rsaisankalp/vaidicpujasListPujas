'use client';

import { useState, useMemo, useEffect } from 'react';
import EventSection from '@/components/events/EventSection';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Zap, Search as SearchIcon } from 'lucide-react';
import type { ProcessedPujaEvent } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface PageContentProps {
  allProcessedEvents: ProcessedPujaEvent[];
  tomorrowEvents: ProcessedPujaEvent[];
  thisWeekEvents: ProcessedPujaEvent[];
  otherUpcomingEvents: ProcessedPujaEvent[];
  tomorrowSectionTitle: string;
  error?: string;
}

export default function PageContent({
  allProcessedEvents,
  tomorrowEvents,
  thisWeekEvents,
  otherUpcomingEvents,
  tomorrowSectionTitle,
  error,
}: PageContentProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error loading events',
        description: error,
      });
    }
  }, [error, toast]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return [];
    }
    const lowerSearchQuery = searchQuery.toLowerCase();
    return allProcessedEvents.filter(
      (event) =>
        (event.Seva && event.Seva.toLowerCase().includes(lowerSearchQuery)) ||
        (event.Activity &&
          event.Activity.toLowerCase().includes(lowerSearchQuery)) ||
        (event.Venue && event.Venue.toLowerCase().includes(lowerSearchQuery)) ||
        (event.category &&
          event.category.toLowerCase().includes(lowerSearchQuery)) ||
        (event.tags &&
          event.tags.some((tag) => tag.toLowerCase().includes(lowerSearchQuery)))
    );
  }, [searchQuery, allProcessedEvents]);

  const isSearching = searchQuery.trim().length > 0;

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
              Connect with divine energies through ancient Vaidic rituals. Find
              events and register with ease.
            </p>
          </section>
        )}

        {isSearching ? (
          searchResults.length > 0 ? (
            <EventSection title="Search Results" events={searchResults} />
          ) : (
            <div className="text-center py-10">
              <SearchIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-xl text-muted-foreground">
                No events found matching your search.
              </p>
              <p className="text-muted-foreground">Try a different search term.</p>
            </div>
          )
        ) : (
          <>
            {tomorrowEvents.length > 0 && (
              <EventSection
                title={tomorrowSectionTitle}
                events={tomorrowEvents}
                isTomorrowSection
              />
            )}
            {thisWeekEvents.length > 0 && (
              <EventSection
                title="This Week's Pujas/Homas"
                events={thisWeekEvents}
              />
            )}
            {otherUpcomingEvents.length > 0 && (
              <EventSection
                title="Next Pujas/Homas"
                events={otherUpcomingEvents}
              />
            )}

            {allProcessedEvents.length === 0 && !error && (
              <div className="text-center py-10">
                <Zap className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-xl text-muted-foreground">
                  No upcoming pujas scheduled at the moment.
                </p>
                <p className="text-muted-foreground">
                  Please check back later for new events.
                </p>
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
