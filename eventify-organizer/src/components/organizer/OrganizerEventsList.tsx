import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, ChevronRight, Edit, Trash2, Eye } from 'lucide-react';
import { toast } from '@/components/ui/toast';
import { format } from 'date-fns';
import { getImageUrl } from '@/lib/utils';

interface OrganizerEventsListProps {
  userId: string;
  limit?: number;
  onViewAll?: () => void;
  onViewRegistrations: (eventId: string) => void;
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

export const OrganizerEventsList: React.FC<OrganizerEventsListProps> = ({
  userId,
  limit,
  onViewAll,
  onViewRegistrations
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
      let url = `/events?created_by=${userId}&sort=target_date`; // Ascending? old code was desc.
      // Backend defaults to asc. I can pass sort=-target_date for desc?
      // mongoDB sort syntax in URL: sort=-target_date or sort=target_date desc?
      // My backend implementation: query.sort(req.query.sort.split(',').join(' '))
      // So 'target_date' is asc, '-target_date' is desc.
      url = `/events?created_by=${userId}&sort=-target_date`;

      if (limit) {
        url += `&limit=${limit}`;
      } else {
        url += `&limit=100`; // Fetch all (reasonable limit)
      }

      const { data } = await api.get(url);

      const eventsData = data.events || [];

      // Fetch registration counts for each event
      // We could add this to the event object in backend? Yes, using virtuals or aggregation.
      // But for now, let's keep frontend logic or optimized endpoint.
      // Doing N+1 calls here is bad but matches old logic.
      // Better: Backend endpoint /registrations/count?eventId=...
      // Or just fetch all registrations for these events?
      // Let's stick to simple individual checks for now to minimize backend changes if not strictly needed.
      // Actually, I can use the new /registrations/event/:id endpoint but that requires auth and returns all regs.
      // Counts are public? Maybe not.
      // Supabase code used { count: 'exact', head: true }.

      const eventsWithCounts = await Promise.all(
        eventsData.map(async (event: any) => {
          // We map _id to id
          const id = event._id || event.id;

          // For count, we might need a specific endpoint or just fetch list and count.
          // Let's use the list endpoint I just made, knowing it might be heavy if thousands.
          // Optimization: Backend endpoint for stats.
          // For now:
          let count = 0;
          try {
            const { data: regs } = await api.get(`/registrations/event/${id}`);
            count = regs.length;
          } catch (e) { console.error(e); }

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

  const handleDelete = async (eventId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this event?')) return;

    try {
      await api.delete(`/events/${eventId}`);
      toast.success('Event deleted successfully');
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  const getEventStatus = (targetDate: string) => {
    const now = new Date();
    const eventDate = new Date(targetDate);
    if (eventDate < now) return { label: 'Past', color: 'bg-muted text-muted-foreground' };
    const daysDiff = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff <= 7) return { label: 'This Week', color: 'bg-black text-white' };
    return { label: 'Upcoming', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' };
  };

  if (loading) {
    return (
      <div className="border border-foreground p-6 bg-background">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-muted"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="border border-foreground bg-background">
      <div className="flex items-center justify-between p-4 border-b border-foreground bg-muted">
        <h2 className="text-lg font-medium text-foreground">{limit ? 'Recent Events' : 'All Events'}</h2>
        {onViewAll && events.length > 0 && (
          <button
            onClick={onViewAll}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            View All <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {events.length === 0 ? (
        <div className="p-12 text-center">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No events yet</p>
          <button
            onClick={() => navigate('/create-event')}
            className="mt-4 px-4 py-2 bg-black border border-foreground text-sm text-white hover:bg-black/80 transition-colors"
          >
            Create Your First Event
          </button>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {events.map((event) => {
            const status = getEventStatus(event.target_date);
            return (
              <div
                key={event.id}
                className="p-4 hover:bg-muted transition-colors"
              >
                <div className="flex gap-4">
                  <div
                    className="w-20 h-20 bg-cover bg-center border border-foreground flex-shrink-0"
                    style={{ backgroundImage: `url(${getImageUrl(event.background_image_url)})` }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-medium text-lg truncate text-foreground">{event.title}</h3>
                        <p className="text-sm text-muted-foreground">{event.date} • {event.time}</p>
                        <p className="text-sm text-muted-foreground truncate">{event.address}</p>
                      </div>
                      <span className={`px-2 py-1 text-[10px] font-medium uppercase ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <button
                        onClick={() => onViewRegistrations(event.id)}
                        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                      >
                        <Users className="w-4 h-4" />
                        {event.registrationCount} registrations
                      </button>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/event/${event.id}`)}
                          className="p-2 border border-foreground hover:bg-muted transition-colors"
                          title="View Event"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/edit-event/${event.id}`)}
                          className="p-2 border border-foreground hover:bg-muted transition-colors"
                          title="Edit Event"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(event.id, e)}
                          className="p-2 border border-foreground hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors"
                          title="Delete Event"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
