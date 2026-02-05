import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, ArrowRight } from 'lucide-react';
import { format, isWithinInterval, addDays, startOfDay, endOfDay } from 'date-fns';

import { getImageUrl } from '@/lib/utils'; // Import helper

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  background_image_url: string;
  target_date: string;
  address: string;
}

interface UpcomingThisWeekProps {
  events: Event[];
}

export const UpcomingThisWeek = ({ events }: UpcomingThisWeekProps) => {
  const navigate = useNavigate();

  // Filter events happening in the next 7 days
  const today = startOfDay(new Date());
  const nextWeek = endOfDay(addDays(today, 7));

  const upcomingEvents = events
    .filter((event) => {
      const eventDate = new Date(event.target_date);
      return isWithinInterval(eventDate, { start: today, end: nextWeek });
    })
    .slice(0, 4); // Show max 4 events

  if (upcomingEvents.length === 0) return null;

  return (
    <section className="px-4 md:px-8 py-8 md:py-12 bg-[#f8f8f8]">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-[#ff6bff] px-3 py-1 rounded-full">
              <span className="text-sm font-medium">This Week</span>
            </div>
            <h2 className="text-lg md:text-xl font-medium">Upcoming Events</h2>
          </div>
          <button
            onClick={() => document.getElementById('events-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex items-center gap-1 text-sm font-medium hover:underline"
          >
            View all <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {upcomingEvents.map((event) => (
            <div
              key={event.id}
              onClick={() => navigate(`/event/${event.id}`)}
              className="bg-white border border-black cursor-pointer group hover:shadow-lg transition-shadow duration-300"
            >
              <div className="h-32 overflow-hidden">
                <div
                  className="h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                  style={{ backgroundImage: `url(${getImageUrl(event.background_image_url)})` }}
                />
              </div>
              <div className="p-4">
                <h3 className="font-medium text-base mb-2 line-clamp-1">{event.title}</h3>
                <div className="flex items-center gap-2 text-gray-600 text-xs mb-1">
                  <Calendar className="w-3 h-3" />
                  <span>{format(new Date(event.target_date), 'EEE, MMM d')}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 text-xs mb-1">
                  <Clock className="w-3 h-3" />
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 text-xs">
                  <MapPin className="w-3 h-3" />
                  <span className="line-clamp-1">{event.address}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
