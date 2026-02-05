import React from 'react';
import { EventCard } from './EventCard';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  background_image_url: string;
  target_date: string;
  address: string;
  min_ticket_price?: number;
  category?: string;
}

interface FeaturedEventsProps {
  events: Event[];
}

export const FeaturedEvents: React.FC<FeaturedEventsProps> = ({ events }) => {
  const upcomingEvents = events;

  if (upcomingEvents.length === 0) return null;

  return (
    <section className="pt-4 bg-white">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
        {upcomingEvents.map((event) => {


          return (
            <EventCard key={event.id} event={event} />
          );
        })}
      </div>
    </section>
  );
};
