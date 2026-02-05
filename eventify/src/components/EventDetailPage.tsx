import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { useRole } from '@/components/RoleContext';
import { Navbar } from './Navbar';
import { EventCountdown } from './EventCountdown';
import { EventMeta } from './EventMeta';
import { EventHeader } from './EventHeader';
import { EventDescription } from './EventDescription';
import { EventRegistration } from './EventRegistration';
import { AuthSheet } from './AuthSheet';
import { SEOHead } from './SEOHead';
import { PaymentAndShare } from './PaymentAndShare';
import { CreatorProfile } from './CreatorProfile';
import { EventMap } from './EventMap';
import { TicketCheckout } from './TicketCheckout';
import { getImageUrl } from '@/lib/utils';
import { Music, Twitter, Instagram, Globe, AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface Event {
  id: string;
  title: string;
  creator: string;
  creator_name?: string;
  creator_avatar?: string;
  created_by: string;
  description: string;
  date: string;
  time: string;
  address: string;
  cover_image?: string;
  background_image_url?: string;
  start_date?: string;
  start_time?: string;
  target_date?: string;
  gallery_images: string[] | null;
  lineup?: { name: string; role: string; image: string }[];
}

type ErrorType = 'not-found' | 'server-error' | null;

export const EventDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useRole();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorType, setErrorType] = useState<ErrorType>(null);

  const [isRegistered, setIsRegistered] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [tickets, setTickets] = useState<any[]>([]);
  // unused: const [selectedTicket, setSelectedTicket] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [id]);

  // Check registration separately when user changes
  useEffect(() => {
    if (user && id && !errorType) {
      checkRegistration();
    }
  }, [user, id]);

  const loadData = async () => {
    setLoading(true);
    setErrorType(null);
    try {
      await Promise.all([fetchEvent(), fetchTickets()]);
    } catch (e) {
      // Individual fetch errors are handled inside, but this catches anything unexpected
      console.error("Critical load error", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvent = async () => {
    try {
      if (!id) return;

      // MOCK DATA GENERATOR FOR FRONTEND TESTING
      if (id === 'test') {
        // ... existing mock data ...
        setEvent({
          id: 'test',
          title: "Neon Nights Music Festival 2026",
          creator: "Eventify Official",
          created_by: "test_user",
          description: "Experience the ultimate cyberpunk-themed music festival! Join us for a night of electrifying beats, neon lights, and unforgettable memories. Featuring top artists from around the globe, immersive art installations, and gourmet food trucks. \n\nGet ready to dance under the stars and witness the most spectacular light show of the year. This is not just a concert; it's a journey into the future of sound and light. Don't miss out on the event of a lifetime!",
          date: "October 15, 2026",
          time: "7:00 PM",
          address: "Bangladesh National Museum, Shahbag, Dhaka",
          background_image_url: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=1200&auto=format&fit=crop&q=80",
          target_date: "2026-10-15T19:00:00.000Z",
          gallery_images: [
            "https://images.unsplash.com/photo-1459749411177-2733399ecc52?w=800&auto=format&fit=crop&q=60",
            "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&auto=format&fit=crop&q=60",
            "https://images.unsplash.com/photo-1533174072545-e8d4aa97edf9?w=800&auto=format&fit=crop&q=60",
            "https://images.unsplash.com/photo-1514525253440-b393452e8d26?w=800&auto=format&fit=crop&q=60"
          ]
        });
        return;
      }

      const { data } = await api.get(`/events/${id}`);

      // Map backend fields to frontend expected fields
      // Ensure we have fallbacks for critical fields to prevent crashes
      const mappedEvent = {
        ...data,
        id: data._id || data.id, // Ensure ID exists
        title: data.title || 'Untitled Event',
        creator_avatar: data.creator_avatar,
        description: data.description || '',
        background_image_url: data.cover_image || data.background_image_url || null, // Allow null for intentional empty state
        // Prefer start_date > target_date > date > current time
        target_date: data.start_date || data.target_date || data.date || new Date().toISOString(),
        // Display date/time logic
        date: data.date || (data.start_date ? new Date(data.start_date).toLocaleDateString() : 'Date TBA'),
        time: data.time || (data.start_time ? data.start_time : 'Time TBA'),
        address: data.venue || data.address || data.city || 'Location TBA',
        gallery_images: Array.isArray(data.gallery_images) ? data.gallery_images : [],
        lineup: Array.isArray(data.lineup) ? data.lineup : []
      };
      setEvent(mappedEvent);
    } catch (err: any) {
      console.error('Exception fetching event:', err);
      if (err.response && err.response.status === 404) {
        setErrorType('not-found');
      } else {
        setErrorType('server-error');
      }
    }
  };

  const checkRegistration = async () => {
    if (!id || !user) return;
    try {
      const { data } = await api.get(`/registrations/check/${id}`);
      setIsRegistered(data.isRegistered);
    } catch (error) {
      console.warn('Error checking registration, defaulting to false:', error);
      setIsRegistered(false);
    }
  };

  const fetchTickets = async () => {
    if (!id) return;
    try {
      const { data } = await api.get(`/tickets?event_id=${id}`);
      setTickets(data || []);
      // if (data && data.length > 0) setSelectedTicket(data[0]._id || data[0].id);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      // Don't block the whole page for tickets failure, just show empty tickets list
    }
  };

  // --- LOADING STATE ---
  if (loading) {
    return (
      <div className="min-h-screen bg-white pb-20">
        <Navbar />
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 md:pt-32">
          {/* Hero Skeleton */}
          <Skeleton className="w-full aspect-[21/9] md:aspect-[2.5/1] rounded-2xl mb-8 md:mb-12" />

          <div className="flex flex-col lg:flex-row gap-12 items-start">
            <div className="flex-1 w-full space-y-10">
              {/* Header Skeleton */}
              <div className="space-y-4">
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-1/4" />
              </div>
              <div className="w-full h-px bg-gray-100" />
              {/* Description Skeleton */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
            {/* Sidebar Skeleton */}
            <div className="hidden lg:block w-[380px] shrink-0 sticky top-24">
              <Skeleton className="h-[400px] w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- ERROR STATE: NOT FOUND ---
  if (errorType === 'not-found' || !event) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <SEOHead title="Event Not Found" description="The event you're looking for doesn't exist." />
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
          <div className="bg-gray-50 p-6 rounded-full mb-6">
            <AlertCircle className="w-12 h-12 text-gray-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Event Not Found</h1>
          <p className="text-gray-500 max-w-md mb-8">
            The event you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
            </Button>
            <Button onClick={() => navigate('/discover')}>
              Browse Events
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // --- ERROR STATE: SERVER ERROR ---
  if (errorType === 'server-error') {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <SEOHead title="Error" description="Something went wrong." />
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
          <div className="bg-red-50 p-6 rounded-full mb-6">
            <AlertCircle className="w-12 h-12 text-red-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Something went wrong</h1>
          <p className="text-gray-500 max-w-md mb-8">
            We couldn't load the event details due to a server error. Please try again later.
          </p>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => navigate('/')}>
              Go Home
            </Button>
            <Button onClick={loadData}>
              <RefreshCw className="mr-2 h-4 w-4" /> Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // --- SAFE DATA ACCESSORS ---
  // Ensure we don't crash on missing properties when rendering
  const bgImage = getImageUrl(event.background_image_url || event.cover_image);
  const targetDateObj = event.target_date ? new Date(event.target_date) : new Date();

  return (
    <>
      <SEOHead
        title={event.title}
        description={event.description?.substring(0, 160) || "Event details"}
        image={bgImage}
        keywords={`event, ${event.title}, ${event.address}, community event`}
      />
      {/* Preload fonts if possible here, or assume they are global */}
      <link href="https://fonts.googleapis.com/css2?family=Host+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <Navbar />

      <main className="min-h-screen bg-white pb-20">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 md:pt-32">

          {/* Hero Image Section */}
          <div className="relative w-full aspect-[21/9] md:aspect-[2.5/1] rounded-2xl overflow-hidden mb-8 md:mb-12 shadow-sm order-1 bg-gray-100">
            {bgImage ? (
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
                style={{ backgroundImage: `url("${bgImage}")` }}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                <span className="text-sm uppercase tracking-widest font-medium">No Cover Image</span>
              </div>
            )}

            <div className="absolute inset-0 bg-black/10" />

            {/* Countdown Overlay */}
            {event.target_date && (
              <div className="absolute bottom-6 right-6 z-10 hidden md:block scale-75 origin-bottom-right">
                <EventCountdown targetDate={targetDateObj} />
              </div>
            )}
          </div>

          <div className="flex flex-col lg:flex-row gap-12 items-start relative">
            {/* Left Column: Main Content */}
            <div className="flex-1 w-full space-y-10 order-2">

              {/* Header Section */}
              <div className="space-y-6">
                <EventHeader title={event.title} creator={event.creator_name || event.creator || 'Organizer'} />
                <EventMeta date={event.date} time={event.time} />
                <div className="flex items-center text-sm text-gray-500 gap-2">
                  <span className="inline-block w-4 h-4 bg-gray-200 rounded-full" />
                  <span>{event.address}</span>
                </div>
              </div>

              <div className="w-full h-px bg-gray-100" />

              <EventDescription description={event.description} />

              <div className="w-full h-px bg-gray-100" />

              <TicketCheckout
                eventId={event.id}
                eventTitle={event.title}
                eventImage={bgImage} // Pass the hero image
                onCheckout={(tickets, total) => {
                  console.log('Checkout:', tickets, total);
                  // Handle checkout logic here
                }}
              />

              <div className="w-full h-px bg-gray-100" />

              <h3 className="text-xl font-bold text-gray-900">Payment Methods & Share</h3>
              <PaymentAndShare
                eventTitle={event.title}
                eventDate={event.target_date || ''} // Use original string if needed, or ISO
                eventAddress={event.address}
              />

              <div className="w-full h-px bg-gray-100" />

              {/* Map only if address exists */}
              {event.address && event.address !== 'Location TBA' && (
                <>
                  <EventMap address={event.address} />
                  <div className="w-full h-px bg-gray-100" />
                </>
              )}

              <div className="pb-12">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Organizer</h3>
                <CreatorProfile
                  creatorName={event.creator_name || event.creator || 'Organizer'}
                  creatorId={event.created_by}
                  avatarUrl={event.creator_avatar}
                />
              </div>

              {/* Lineup Section - Only render if lineup exists and has items */}
              {event.lineup && event.lineup.length > 0 && (
                <div className="pb-16">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Featured Artists</h3>
                    <span className="text-sm font-medium text-gray-500 uppercase tracking-widest">Lineup</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {event.lineup.map((artist, idx) => (
                      <div key={idx} className="flex items-center gap-5 p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-gray-200 transition-all duration-300 group">

                        <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-gray-200 shadow-sm">
                          {artist.image ? (
                            <img src={getImageUrl(artist.image)} alt={artist.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-500">
                              <Music className="w-8 h-8 opacity-50" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-900 text-lg flex items-center gap-2 truncate">
                            {artist.name}
                            <span className="text-blue-500 shrink-0" title="Verified">
                              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                            </span>
                          </h4>
                          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide truncate">{artist.role}</p>

                          <div className="flex gap-3 pt-2">
                            <Twitter className="w-4 h-4 text-gray-400 hover:text-black cursor-pointer transition-colors" />
                            <Instagram className="w-4 h-4 text-gray-400 hover:text-black cursor-pointer transition-colors" />
                            <Globe className="w-4 h-4 text-gray-400 hover:text-black cursor-pointer transition-colors" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="w-full h-px bg-gray-100 mt-16" />
                </div>
              )}
            </div>

            {/* Right Column: Sticky Action Card */}
            <div className="hidden lg:block w-[380px] shrink-0 sticky top-24 order-3">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
                <div className="space-y-2">
                  <h3 className="font-bold text-xl">Event Registration</h3>
                  <p className="text-sm text-gray-500">Secure your spot for this event.</p>
                </div>
                <EventRegistration
                  eventId={event.id}
                  onRegister={checkRegistration}
                  isRegistered={isRegistered}
                  onAuthRequired={() => setIsAuthOpen(true)}
                  targetDate={targetDateObj}
                  className=""
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Sticky Bottom Bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50">
          <EventRegistration
            eventId={event.id}
            onRegister={checkRegistration}
            isRegistered={isRegistered}
            onAuthRequired={() => setIsAuthOpen(true)}
            targetDate={targetDateObj}
            className=""
          />
        </div>

      </main>
      <AuthSheet isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
};