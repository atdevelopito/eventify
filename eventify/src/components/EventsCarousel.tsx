import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '@/lib/utils';

interface Event {
  id: string;
  title: string;
  background_image_url: string;
  address: string;
  date: string;
  time: string;
}

export const EventsCarousel = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data } = await api.get('/events?sort=-target_date&limit=10');
        const eventsData = data.events || [];
        const formattedEvents = eventsData.map((e: any) => ({
          ...e,
          id: e.id || e._id
        }));
        setEvents(formattedEvents);
      } catch (error) {
        console.error("Failed to fetch carousel events", error);
      }
    };

    fetchEvents();
  }, []);

  if (events.length === 0) return null;

  // Duplicate the events array exactly twice for seamless loop
  const multipliedEvents = [...events, ...events];

  return (
    <div className="w-full overflow-hidden py-12 pb-20 md:pb-24 bg-background">
      <div className="relative overflow-hidden">
        <div className="flex gap-px w-max animate-scroll-left-fast will-change-[transform]">
          {multipliedEvents.map((event, index) => (
            <div
              key={`${event.id}-${index}`}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/event/${event.id}`);
              }}
              className="relative flex-shrink-0 w-[65vw] md:w-[calc(40vw-0.5px)] aspect-[4/5] max-h-[800px] cursor-pointer overflow-hidden animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'both' }}
            >
              <img
                src={getImageUrl(event.background_image_url)}
                alt={event.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

              <div className="absolute top-4 left-4 flex flex-col gap-0">
                <div className="bg-white border border-black px-3 h-[23px] flex items-center">
                  <div className="text-[11px] font-medium uppercase leading-none">{event.date}</div>
                </div>
                <div className="bg-white border border-t-0 border-black px-3 h-[23px] flex items-center">
                  <div className="text-[11px] font-medium uppercase leading-none">{event.time}</div>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
                <h3 className="text-xl md:text-2xl font-medium mb-1 tracking-tight">{event.title}</h3>
                <p className="text-sm md:text-base text-white/80">{event.address}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
