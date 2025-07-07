
import { fetchEvents, fetchGurudevEvents } from '@/lib/google-sheet-service';
import { categorizePujaEvent } from '@/ai/flows/categorize-puja-event';
import * as aiCache from '@/lib/ai-cache';
import { 
  parsePujaDates, 
  formatPujaDate, 
  formatPujaTime, 
  isValidDate,
  isEventTomorrow,
  isEventThisWeek,
  doesEventOverlapWithGurudevPresence,
  LONG_RUNNING_EVENT_THRESHOLD_DAYS
} from '@/lib/date-utils';
import { differenceInDays } from 'date-fns';
import type { ProcessedPujaEvent } from '@/types';
import PageContent from './page-content';

const getEventVisuals = (activity: string, seva: string): { icon: string, imageHint: string } => {
  const lowerActivity = activity.toLowerCase();
  const lowerSeva = seva.toLowerCase();

  if (lowerActivity.includes('homa') || lowerSeva.includes('homa')) {
    if (lowerSeva.includes('ganpati')) return { icon: 'UtensilsCrossed', imageHint: 'ganesha fire ritual' };
    return { icon: 'Bell', imageHint: 'fire ritual' };
  }
  if (lowerActivity.includes('parayan') || lowerSeva.includes('parayan')) {
    return { icon: 'BookOpen', imageHint: 'scripture reading' };
  }
  if (lowerActivity.includes('archana') || lowerSeva.includes('archana')) {
    return { icon: 'Flower2', imageHint: 'flower offering' };
  }
  if (lowerActivity.includes('ganpati') || lowerSeva.includes('ganpati')) {
    return { icon: 'UtensilsCrossed', imageHint: 'ganesha worship' };
  }
  return { icon: 'Zap', imageHint: 'spiritual event' };
};

async function loadAppData() {
  const [rawEvents, rawGurudevEvents] = await Promise.all([
    fetchEvents(),
    fetchGurudevEvents()
  ]);
  
  const nonDonationEvents = rawEvents.filter(event => 
    event.Activity && !event.Activity.toLowerCase().startsWith('donation-')
  );

  const processedEventsPromises = nonDonationEvents.map(async (event) => {
    try {
      const { startDate: parsedStartDate, endDate: parsedEndDate } = parsePujaDates(event.Date, event.Time);
      
      const tempEventForGurudevCheck: ProcessedPujaEvent = { 
        ...event,
        id: 'temp', 
        parsedStartDate: parsedStartDate,
        parsedEndDate: parsedEndDate,
        formattedDate: '', 
        formattedTime: '', 
      };
      const isGurudevPresence = doesEventOverlapWithGurudevPresence(tempEventForGurudevCheck, rawGurudevEvents);

      const cacheKey = `category:${event.UniqueID}`;
      let categoryData = await aiCache.get(cacheKey);
      if (!categoryData && process.env.NEXT_PUBLIC_GOOGLE_API_KEY && String(process.env.NEXT_PUBLIC_GOOGLE_API_KEY).trim() !== '') {
        try {
          categoryData = await categorizePujaEvent({
            seva: event.Seva || "Unknown Seva",
            venue: event.Venue || "Unknown Venue",
            activity: event.Activity || "Unknown Activity",
          });
          await aiCache.set(cacheKey, categoryData);
        } catch (aiError) {
          // AI categorization failed
          categoryData = { category: undefined, tags: [] as string[] };
        }
      } else if (!categoryData) {
        categoryData = { category: undefined, tags: [] as string[] };
      }
      
      const visuals = getEventVisuals(event.Activity || "", event.Seva || "");
      const uniqueId = event.UniqueID || event.details || `${event.Seva}-${event.Date}-${event.Time}-${Math.random().toString(36).substring(7)}`;

      let displayDate = event.Date; 
      let isLongRunningFlag = false;

      if (isValidDate(parsedStartDate)) {
        if (parsedEndDate && isValidDate(parsedEndDate)) {
          const durationInDays = differenceInDays(parsedEndDate, parsedStartDate);
          if (durationInDays > LONG_RUNNING_EVENT_THRESHOLD_DAYS) {
            displayDate = "Everyday";
            isLongRunningFlag = true;
          } else {
            displayDate = event.Date; // Use original string for normal ranges
          }
        } else {
          // Single date
          displayDate = formatPujaDate(parsedStartDate);
        }
      } else {
        // Invalid parsedStartDate, keep original event.Date
        displayDate = event.Date;
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
        isGurudevPresence: isGurudevPresence,
        isLongRunning: isLongRunningFlag,
      };
    } catch (error) {
      const { startDate: parsedStartDateFallback, endDate: parsedEndDateFallback } = parsePujaDates(event.Date, event.Time); 
      const visualsFallback = getEventVisuals(event.Activity || "", event.Seva || "");
      const uniqueIdFallback = event.UniqueID || event.details || `${event.Seva}-${event.Date}-${event.Time}-${Math.random().toString(36).substring(7)}`;
      
      let displayDateFallback = event.Date;
      if (event.Date && !event.Date.toLowerCase().includes(' to ') && isValidDate(parsedStartDateFallback)) {
        displayDateFallback = formatPujaDate(parsedStartDateFallback);
      }

      return {
        ...event,
        id: uniqueIdFallback,
        parsedStartDate: isValidDate(parsedStartDateFallback) ? parsedStartDateFallback : new Date(0),
        parsedEndDate: isValidDate(parsedEndDateFallback) ? parsedEndDateFallback : undefined,
        category: undefined, 
        tags: [],
        ...visualsFallback,
        formattedDate: displayDateFallback,
        formattedTime: isValidDate(parsedStartDateFallback) ? formatPujaTime(parsedStartDateFallback) : event.Time,
        isGurudevPresence: false,
        isLongRunning: false,
      };
    }
  });

  const settledEvents = await Promise.all(processedEventsPromises);
  
  settledEvents.sort((a, b) => {
    if (isValidDate(a.parsedStartDate) && isValidDate(b.parsedStartDate)) {
      return a.parsedStartDate.getTime() - b.parsedStartDate.getTime();
    }
    if (isValidDate(a.parsedStartDate)) return -1;
    if (isValidDate(b.parsedStartDate)) return 1;
    return (a.Seva || "").localeCompare(b.Seva || ""); 
  });

  return settledEvents;
}

export default async function Home() {
  let allProcessedEvents: ProcessedPujaEvent[] = [];
  let error: string | undefined = undefined;

  try {
    allProcessedEvents = await loadAppData();
  } catch (e) {
    error = "Failed to load event data. Please check your connection and try refreshing the page.";
    allProcessedEvents = []; // Ensure it's an empty array on error
  }
  
  const todayForFiltering = new Date();

  const upcomingEvents = allProcessedEvents.filter(event => {
    if (!isValidDate(event.parsedStartDate)) return false;
    const todayStartOfDay = new Date(todayForFiltering.getFullYear(), todayForFiltering.getMonth(), todayForFiltering.getDate());
    
    if (event.parsedEndDate && isValidDate(event.parsedEndDate) && !event.isLongRunning) {
      return event.parsedEndDate >= todayStartOfDay;
    } else if (event.isLongRunning) {
        return true;
    }
    return event.parsedStartDate >= todayStartOfDay;
  });

  const tomorrowEvents = upcomingEvents.filter(event => isEventTomorrow(event, todayForFiltering));
  const thisWeekEvents = upcomingEvents.filter(
    event => isEventThisWeek(event, todayForFiltering) && !isEventTomorrow(event, todayForFiltering) 
  );
  const otherUpcomingEvents = upcomingEvents.filter(
    event => !isEventTomorrow(event, todayForFiltering) && !isEventThisWeek(event, todayForFiltering)
  );

  const tomorrowSectionTitle = (() => {
    const hasGurudevEventTomorrow = tomorrowEvents.some(event => event.isGurudevPresence);
    return hasGurudevEventTomorrow ? "Tomorrow's Puja/Homa in the presence of Gurudev" : "Tomorrow's Puja/Homa";
  })();

  return (
    <PageContent 
      allProcessedEvents={allProcessedEvents}
      tomorrowEvents={tomorrowEvents}
      thisWeekEvents={thisWeekEvents}
      otherUpcomingEvents={otherUpcomingEvents}
      tomorrowSectionTitle={tomorrowSectionTitle}
      error={error}
    />
  );
}
