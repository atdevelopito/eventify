import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, ChevronRight, Edit, Trash2, Eye, Plus, MapPin, Ticket } from 'lucide-react';
import { toast } from '@/components/ui/toast';
import { getImageUrl } from '@/lib/utils';

interface OrganizerEventsListPublicProps {
  limit?: number;
  onViewAll?: () => void;
  onViewRegistrations: (eventId: string) => void;
  userId?: string;
}

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  target_date: string;
  background_image_url: string;
  address: string;
  registrationCount?: number;
}

export const OrganizerEventsListPublic: React.FC<OrganizerEventsListPublicProps> = ({
  limit,
  onViewAll,
  onViewRegistrations,
  userId
}) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const initFetch = async () => {
      await fetchEvents();
    };

    initFetch();

    return () => {
      mounted = false;
    };
  }, [userId]);

  const fetchEvents = async () => {
    let mounted = true;
    try {
      let url = '/events?sort=-target_date';
      if (userId) url += `&created_by=${userId}`;
      if (limit) url += `&limit=${limit}`;

      const { data } = await api.get(url);

      // Fetch registration counts
      const eventsData = data.events || [];
      const eventsWithCounts = await Promise.all(
        eventsData.map(async (event: any) => {
          const id = event._id || event.id;
          let count = 0;
          try {
            const { data: regData } = await api.get(`/registrations/count/${id}`);
            count = regData.count;
          } catch (e) {
            // ignore
          }
          return { ...event, id, registrationCount: count };
        })
      );

      if (!mounted) return;
      setEvents(eventsWithCounts);
    } catch (error) {
      console.error('Error fetching events:', error);
      if (mounted) {
        toast.error('Failed to load events');
      }
    } finally {
      if (mounted) {
        setLoading(false);
      }
    }

    return () => {
      mounted = false;
    };
  };

  const getEventStatus = (targetDate: string) => {
    const now = new Date();
    const eventDate = new Date(targetDate);
    if (eventDate < now) return { label: 'Past', color: 'bg-gray-100 text-gray-500' };
    const daysDiff = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff <= 7) return { label: 'This Week', color: 'bg-black text-white' };
    return { label: 'Upcoming', color: 'bg-green-100 text-green-700' };
  };

  if (loading) {
    return (
      <div className="border border-gray-200 p-6 bg-white">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (limit) {
    // Compact/Widget View
    return (
      <div className="bg-transparent text-black">
        {events.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-black font-medium mb-1">No events yet</p>
            <p className="text-sm text-black/50 mb-4">Create your first event to get started</p>
            <button
              onClick={() => navigate('/create-event')}
              className="px-5 py-2.5 bg-[#E85A6B] text-white rounded-lg text-sm font-medium hover:bg-[#a61043] transition-all shadow-sm"
            >
              Create Event
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4 p-4">
            {events.map((event) => {
              const status = getEventStatus(event.target_date);
              return (
                <div
                  key={event.id}
                  onClick={() => navigate(`/event/${event.id}`)}
                  className="group flex gap-4 p-3 rounded-xl hover:bg-gray-50 transition-all cursor-pointer border border-transparent hover:border-gray-200"
                >
                  <div
                    className="w-16 h-16 rounded-lg bg-cover bg-center flex-shrink-0 border border-black/10 shadow-sm"
                    style={{ backgroundImage: `url(${getImageUrl(event.background_image_url)})` }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-base truncate text-black group-hover:text-[#E85A6B] transition-colors">{event.title}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                    <div className="text-xs text-black/50 mt-1 flex items-center gap-2">
                      <span>{event.date}</span>
                      <span>•</span>
                      <span>{event.time}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-3">
                      <span className="text-xs font-medium text-black bg-black/5 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {event.registrationCount || 0}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Full View
  return (
    <div className="bg-transparent">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-black">All Events</h2>
        {events.length > 0 && (
          <button
            onClick={() => navigate('/create-event')}
            className="flex items-center gap-2 px-4 py-2 bg-[#E85A6B] text-white rounded-lg text-sm font-medium hover:bg-[#a61043] transition-all"
          >
            <Plus className="w-4 h-4" /> New Event
          </button>
        )}
      </div>

      {events.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium text-black">No events yet</p>
          <p className="text-black/50 mb-6">Create your first event to get started</p>
          <button
            onClick={() => navigate('/create-event')}
            className="px-6 py-3 bg-[#E85A6B] text-white rounded-lg font-medium hover:bg-[#a61043] transition-all"
          >
            Create Your First Event
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => {
            const status = getEventStatus(event.target_date);
            return (
              <div
                key={event.id}
                className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:border-black/20 transition-all flex flex-col md:flex-row gap-6"
              >
                <div
                  className="w-full md:w-48 h-32 rounded-lg bg-cover bg-center border border-black/10"
                  style={{ backgroundImage: `url(${getImageUrl(event.background_image_url)})` }}
                />
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-xl text-black mb-1">{event.title}</h3>
                        <p className="text-black/60 flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4" /> {event.date} • {event.time}
                        </p>
                        <p className="text-black/60 flex items-center gap-2 text-sm mt-1">
                          <MapPin className="w-4 h-4" /> {event.address}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2 text-sm font-medium text-black/80">
                        <Users className="w-4 h-4 text-[#E85A6B]" />
                        {event.registrationCount || 0} Registrations
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onViewRegistrations(event.id)}
                        className="px-4 py-2 border border-black/10 rounded-lg text-sm font-medium hover:bg-gray-50 text-black transition-colors"
                      >
                        Registrations
                      </button>
                      <button
                        onClick={() => navigate(`/edit-event/${event.id}`)}
                        className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                      >
                        Manage
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
