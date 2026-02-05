import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { ArrowRight } from 'lucide-react';
import { getImageUrl } from '@/lib/utils';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  background_image_url: string;
  target_date: string;
  address: string;
}

interface MoreEventsProps {
  currentEventId: string;
}

export const MoreEvents: React.FC<MoreEventsProps> = ({ currentEventId }) => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMoreEvents();
  }, [currentEventId]);

  const fetchMoreEvents = async () => {
    try {
      const now = new Date().toISOString();
      const { data } = await api.get(`/events?exclude=${currentEventId}&minDate=${now}&sort=target_date&limit=4`);

      const eventsData = data.events || [];
      const formattedEvents = eventsData.map((e: any) => ({
        ...e,
        id: e.id || e._id // Map _id to id
      }));

      setEvents(formattedEvents);
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error fetching more events:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || events.length === 0) return null;

  return (
    <section className="border-t border-black">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xs uppercase tracking-widest text-gray-400">More Events</h3>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1 text-sm font-medium hover:text-[#ff6bff] transition-colors group"
          >
            View All
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {events.map((event) => (
            <div
              key={event.id}
              onClick={() => navigate(`/event/${event.id}`)}
              className="cursor-pointer group"
            >
              <div className="relative overflow-hidden border border-black">
                <div
                  className="aspect-square bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                  style={{ backgroundImage: `url(${getImageUrl(event.background_image_url)})` }}
                />
                <div className="absolute top-2 left-2 flex flex-col gap-0">
                  <div className="bg-white border border-black px-2 h-[20px] flex items-center">
                    <span className="text-[10px] font-medium uppercase leading-none">{event.date}</span>
                  </div>
                </div>
              </div>
              <h4 className="mt-2 text-sm font-medium line-clamp-1 group-hover:text-[#ff6bff] transition-colors">
                {event.title}
              </h4>
              <p className="text-xs text-gray-500 line-clamp-1">{event.address}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
