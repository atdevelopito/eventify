import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { useRole } from '@/components/RoleContext';
import { Navbar } from '@/components/Navbar';
import { SEOHead } from '@/components/SEOHead';
import { Footer } from '@/components/Footer';
import { getImageUrl } from '@/lib/utils';
import TicketQRCode from '@/components/TicketQRCode';
import BadgeTabs from '@/components/ui/badge-tabs';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, Ticket, ChevronRight, QrCode } from 'lucide-react';
import { format, parseISO, isPast, isToday } from 'date-fns';

interface RegisteredEvent {
  id: string;
  event_id: string;
  registered_at: string;
  payment_status: string;
  ticket_type: string;
  quantity: number;
  user_name: string;
  qr_token?: string;  // Add QR token
  event: {
    id: string;
    title: string;
    date: string;
    time: string;
    address: string;
    background_image_url: string;
    target_date: string;
  };
}

const isValidDate = (dateString: string) => {
  const d = new Date(dateString);
  return d instanceof Date && !isNaN(d.getTime());
};

const MyTickets = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useRole();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [registrations, setRegistrations] = useState<RegisteredEvent[]>([]);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<RegisteredEvent | null>(null);

  useEffect(() => {
    let mounted = true;

    const initTickets = async () => {
      if (!authLoading) {
        if (!user) {
          navigate('/auth');
          return;
        }
        if (user && mounted) {
          // We call API regardless of ID presence because it uses the HttpOnly token
          await fetchRegistrations();
        }
      }
    };

    initTickets();

    return () => {
      mounted = false;
    };
  }, [user, authLoading, navigate]);

  const fetchRegistrations = async () => {
    let mounted = true;
    try {
      // Fetch tickets instead of registrations
      const { data } = await api.get('/tickets/my');

      if (!mounted) return;

      // Backend returns array of tickets with populated 'event'
      const formattedData = (data || [])
        .map((ticket: any) => ({
          id: ticket.id,
          ticket_id: ticket.ticket_id,
          status: ticket.status,
          ticket_type: ticket.ticket_type,
          created_at: ticket.created_at,
          used_at: ticket.used_at,
          qr_token: ticket.qr_token,
          registered_at: ticket.registration?.registered_at || ticket.created_at,
          payment_status: ticket.registration?.payment_status || 'unknown', // Map from nested object
          event_id: ticket.event?.id,
          event: {
            id: ticket.event?.id,
            title: ticket.event?.title || 'Untitled Event',
            date: ticket.event?.date || 'TBA',
            time: ticket.event?.time || 'TBA',
            address: ticket.event?.address || 'TBA',
            background_image_url: ticket.event?.background_image_url || '',
            target_date: ticket.event?.target_date
          }
        }))
        // Filter: Show Valid or Used tickets. Explicitly filter out canceled/invalid if needed.
        // Since tickets are only generated on payment, broadly allow 'valid'/'used'.
        // Also ensure payment_status isn't 'pending' just in case.
        .filter((t: any) => (t.status === 'valid' || t.status === 'used') && t.payment_status === 'paid')
        // Sort by registration date, newest first
        .sort((a: any, b: any) => new Date(b.registered_at).getTime() - new Date(a.registered_at).getTime());

      setRegistrations(formattedData);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching tickets:', err);
      setError('Failed to load tickets');
      setRegistrations([]);
    } finally {
      setLoading(false);
    }
    return () => {
      mounted = false;
    };
  };

  const upcomingEvents = registrations.filter(reg => {
    if (!reg.event?.target_date) return true; // Show as upcoming if no date
    try {
      const date = parseISO(reg.event.target_date);
      return !isPast(date) || isToday(date);
    } catch (e) {
      return true; // Show on error
    }
  });
  const pastEvents = registrations.filter(reg => {
    if (!reg.event?.target_date) return false;
    try {
      const date = parseISO(reg.event.target_date);
      return isPast(date) && !isToday(date);
    } catch (e) {
      return false;
    }
  });

  const renderEventList = (events: RegisteredEvent[], type: 'upcoming' | 'past') => {
    if (events.length === 0) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 border border-dashed border-black/20"
        >
          <Ticket className="w-12 h-12 mx-auto mb-4 text-black/30" />
          <h3 className="text-lg font-medium mb-2">
            {type === 'upcoming' ? 'No upcoming events' : 'No past events'}
          </h3>
          <p className="text-black/60 mb-6">
            {type === 'upcoming'
              ? "You haven't registered for any upcoming events yet."
              : "You don't have any past event registrations."
            }
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-black text-white text-sm font-medium uppercase tracking-wider hover:bg-black/90 transition-colors"
          >
            Discover Events
          </button>
        </motion.div>
      );
    }

    return (
      <div className="space-y-4">
        {events.map((reg, index) => (
          <motion.div
            key={reg.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => navigate(`/ticket/${reg.id}`)}
            className="border border-black hover:border-[#E85A6B] transition-colors cursor-pointer group"
          >
            <div className="flex flex-col md:flex-row">
              {/* Event Image */}
              <div className="w-full md:w-48 h-32 md:h-auto overflow-hidden">
                <img
                  src={reg.event.background_image_url ? getImageUrl(reg.event.background_image_url) : "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=60"}
                  alt={reg.event.title}
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=60";
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Event Details */}
              <div className="flex-1 p-4 md:p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg md:text-xl font-medium mb-2 group-hover:text-[#E85A6B] transition-colors">
                    {reg.event.title}
                  </h3>
                  <div className="flex flex-wrap gap-4 text-sm text-black/60">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {reg.event.date && isValidDate(reg.event.date)
                          ? new Date(reg.event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                          : reg.event.date || 'Date TBA'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{reg.event.time}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate max-w-[200px]">{reg.event.address}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 border-t border-dashed border-gray-200 pt-4">
                  <div className="flex flex-col">
                    <span className="text-xs text-black/40">
                      Registered {format(parseISO(reg.registered_at), 'MMM d, yyyy')}
                    </span>
                    <span className={`text-xs font-bold uppercase mt-1 ${reg.payment_status === 'paid' ? 'text-green-600' : 'text-orange-500'}`}>
                      {reg.payment_status === 'paid' ? 'Confirmed & Paid' : 'Pending Payment'}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTicket(reg);
                        setShowQRModal(true);
                      }}
                      className="px-3 py-1.5 text-xs font-bold bg-black text-white uppercase tracking-wider hover:bg-[#E85A6B] transition-colors flex items-center gap-1"
                    >
                      <QrCode className="w-3 h-3" />
                      View QR
                    </button>
                    <ChevronRight className="w-5 h-5 text-black/40 group-hover:text-[#E85A6B] group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  const tabItems = [
    {
      value: "upcoming",
      label: "Upcoming",
      badge: upcomingEvents.length,
      content: renderEventList(upcomingEvents, 'upcoming')
    },
    {
      value: "past",
      label: "Past",
      badge: pastEvents.length,
      content: renderEventList(pastEvents, 'past')
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title="My Tickets"
        description="View all your registered events and tickets."
      />
      <Navbar />

      <main className="pt-24 pb-16 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Ticket className="w-8 h-8" />
              <h1 className="text-3xl md:text-4xl font-medium tracking-tight">My Tickets</h1>
            </div>
            <p className="text-black/60">Events you've registered for</p>
          </div>

          <BadgeTabs items={tabItems} defaultValue="upcoming" />

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 text-red-600 p-4 border border-red-200 rounded mb-6 text-center mt-4">
              Error loading tickets: {error}
            </div>
          )}

          {/* Debug Info (Only if empty) */}
          {registrations.length === 0 && !loading && (
            <div className="text-xs text-gray-400 font-mono text-center mb-4 mt-4">
              Debug: UserID {(user?.id || (user as any)?._id) ? 'Present' : 'Missing'} | Total Reg: {registrations.length}
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* QR Code Modal */}
      {showQRModal && selectedTicket && selectedTicket.qr_token && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setShowQRModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white p-8 rounded-lg max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">{selectedTicket.event.title}</h2>
              <p className="text-sm text-gray-600 mb-6">Scan this QR code at the venue</p>

              {/* QR Code */}
              <div className="flex justify-center mb-6">
                <TicketQRCode
                  ticketId={selectedTicket.qr_token}
                  size={280}
                  className="border-4 border-black p-4"
                />
              </div>

              {/* Ticket Info */}
              <div className="space-y-2 text-sm border-t border-gray-200 pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-semibold">{selectedTicket.event.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-semibold">{selectedTicket.event.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-semibold">{selectedTicket.ticket_type}</span>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setShowQRModal(false)}
                className="mt-6 w-full px-6 py-3 bg-black text-white font-bold uppercase tracking-wider hover:bg-[#E85A6B] transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default MyTickets;