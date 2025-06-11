import EventCard from './EventCard';
import type { ProcessedPujaEvent } from '@/types';

interface EventSectionProps {
  title: string;
  events: ProcessedPujaEvent[];
  isTomorrowSection?: boolean; // Specific flag for tomorrow's section styling
}

const EventSection: React.FC<EventSectionProps> = ({ title, events, isTomorrowSection }) => {
  if (events.length === 0) return null;

  return (
    <section className={`py-8 ${isTomorrowSection ? 'bg-primary/10 rounded-xl p-4 sm:p-6 my-6 shadow-lg' : 'my-4'}`}>
      <h2 className={`font-headline text-3xl sm:text-4xl font-bold mb-6 text-center sm:text-left ${isTomorrowSection ? 'text-primary' : 'text-foreground'}`}>
        {title}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {events.map(event => (
          <EventCard key={event.id} event={event} isTomorrowHighlight={isTomorrowSection} />
        ))}
      </div>
    </section>
  );
};

export default EventSection;
