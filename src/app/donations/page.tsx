
'use client';

import { useState, useEffect, useMemo } from 'react';
import { fetchEvents } from '@/lib/google-sheet-service';
import { parsePujaDate, formatPujaDate, formatPujaTime, isValidDate } from '@/lib/date-utils';
import EventCard from '@/components/events/EventCard'; 
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Heart, Search as SearchIcon, Zap } from 'lucide-react';
import type { ProcessedPujaEvent, PujaEventData } from '@/types';

const getDonationVisuals = (activity: string, seva: string): { icon: React.ElementType, imageHint: string } => {
  // Generic visuals for donations
  return { icon: Heart, imageHint: 'charity donation' };
};

export default function DonationsPage() {
  const [allProcessedDonations, setAllProcessedDonations] = useState<ProcessedPujaEvent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDonations() {
      setIsLoading(true);
      const rawEvents: PujaEventData[] = await fetchEvents();
      
      const donationEvents = rawEvents.filter(event => event.Activity.toLowerCase().startsWith('donation-'));

      const processedDonations = donationEvents.map((event) => {
        try {
          const parsedDt = parsePujaDate(event.Date, event.Time);
          const visuals = getDonationVisuals(event.Activity, event.Seva);
          const uniqueId = event.details || event.UniqueID || `${event.Seva}-${event.Date}-${event.Time}-${Math.random().toString(36).substring(7)}`;
          
          let displayDate = event.Date; // Default to original date string
          if (isValidDate(parsedDt) && !event.Date.toLowerCase().includes(' to ')) {
            displayDate = formatPujaDate(parsedDt);
          }

          return {
            ...event,
            id: uniqueId,
            parsedDate: parsedDt,
            category: "Donation", // Explicitly categorize
            tags: ["charity", "support"], // Generic tags for donations
            ...visuals,
            formattedDate: displayDate,
            formattedTime: isValidDate(parsedDt) ? formatPujaTime(parsedDt) : event.Time,
          };
        } catch (error) {
          const parsedDt = parsePujaDate(event.Date, event.Time); 
          const visuals = getDonationVisuals(event.Activity, event.Seva);
          const uniqueId = event.details || event.UniqueID || `${event.Seva}-${event.Date}-${event.Time}-${Math.random().toString(36).substring(7)}`;
          let displayDate = event.Date;
          if (isValidDate(parsedDt) && !event.Date.toLowerCase().includes(' to ')) {
            displayDate = formatPujaDate(parsedDt);
          }
          return {
            ...event,
            id: uniqueId,
            parsedDate: parsedDt && isValidDate(parsedDt) ? parsedDt : new Date(0), 
            category: "Donation",
            tags: ["charity", "support"],
            ...visuals,
            formattedDate: displayDate,
            formattedTime: parsedDt && isValidDate(parsedDt) ? formatPujaTime(parsedDt) : event.Time,
          };
        }
      });
      
      // Sort donations, e.g., by Seva name or keep as is from sheet
      processedDonations.sort((a, b) => a.Seva.localeCompare(b.Seva));
      setAllProcessedDonations(processedDonations);
      setIsLoading(false);
    }
    loadDonations();
  }, []);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) {
        return allProcessedDonations; // Show all donations if no search query
    }
    const lowerSearchQuery = searchQuery.toLowerCase();
    return allProcessedDonations.filter(event =>
        (event.Seva && event.Seva.toLowerCase().includes(lowerSearchQuery)) ||
        (event.Activity && event.Activity.toLowerCase().includes(lowerSearchQuery)) ||
        (event.Venue && event.Venue.toLowerCase().includes(lowerSearchQuery)) ||
        (event.category && event.category.toLowerCase().includes(lowerSearchQuery)) ||
        (event.tags && event.tags.some(tag => tag.toLowerCase().includes(lowerSearchQuery)))
    );
  }, [searchQuery, allProcessedDonations]);


  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <section className="mb-12 text-center">
          <h1 className="font-headline text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 text-primary">
            Support Our Causes
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Your generous contributions help us continue our activities and services.
          </p>
        </section>

        {isLoading ? (
          <div className="text-center py-10">
            <Heart className="w-16 h-16 mx-auto text-muted-foreground mb-4 animate-pulse" />
            <p className="text-xl text-muted-foreground">Loading donation opportunities...</p>
          </div>
        ) : searchResults.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {searchResults.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <SearchIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-xl text-muted-foreground">No donation opportunities found matching your search criteria.</p>
            {searchQuery.trim() && <p className="text-muted-foreground">Try a different search term.</p>}
            {!searchQuery.trim() && allProcessedDonations.length === 0 && 
              <p className="text-muted-foreground">Currently, there are no active donation campaigns listed.</p>
            }
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
