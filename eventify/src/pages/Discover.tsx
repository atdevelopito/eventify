import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import api from '@/lib/api';
import { SEOHead } from '@/components/SEOHead';
import { Footer } from '@/components/Footer';
import { useNavigate } from 'react-router-dom';
import { EventCard } from '@/components/EventCard';
import { Calendar, Clock, MapPin, Search, Filter, Ticket } from 'lucide-react';
import { format, isFuture, isPast, isToday } from 'date-fns';
import SuggestiveSearch from '@/components/ui/suggestive-search';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  background_image_url: string;
  target_date: string;
  address: string;
  category?: string; // If available, otherwise we might mock or omit
}

const CATEGORIES = [
  "All",
  "Music",
  "Tech",
  "Arts",
  "Sports",
  "Food",
  "Business"
];

const Discover = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'live' | 'upcoming' | 'past'>('all');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, []);


  const fetchEvents = async () => {
    try {
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timed out')), 15000)
      );

      // Race the request against the timeout
      const requestPromise = api.get('/events?limit=100&sort=target_date');

      const { data } = await Promise.race([
        requestPromise,
        timeoutPromise
      ]) as any;

      if (data.events) {
        // Map backend fields to frontend expected fields
        const mappedEvents = data.events.map((e: any) => ({
          ...e,
          id: e._id || e.id,
          background_image_url: e.cover_image || e.background_image_url || '',
          target_date: e.start_date || e.target_date,
          address: e.venue || e.address || e.city || 'TBA'
        }));
        setEvents(mappedEvents);
      }
      setError(null);
    } catch (error: any) {
      console.error('Error fetching events:', error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.address.toLowerCase().includes(searchQuery.toLowerCase());

    // Case-insensitive category match
    const matchesCategory = selectedCategory === 'All'
      ? true
      : (event.category?.toLowerCase() === selectedCategory.toLowerCase());

    let matchesType = true;
    const eventDate = new Date(event.target_date);

    if (filterType === 'live') {
      matchesType = isToday(eventDate);
    } else if (filterType === 'upcoming') {
      // Upcoming = Future OR Today (Relaxed view)
      matchesType = isFuture(eventDate) || isToday(eventDate);
    } else if (filterType === 'past') {
      matchesType = isPast(eventDate) && !isToday(eventDate);
    }

    return matchesSearch && matchesCategory && matchesType;
  });

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SEOHead
        title="Discover Events"
        description="Find and attend the best events near you."
      />

      <Navbar />

      {/* Main Content */}
      <div className="flex-1 pt-[80px]"> {/* Offset for Navbar */}

        {/* Sticky Filter Bar */}
        <div className="sticky top-[58px] z-40 bg-white border-b border-black px-4 md:px-8 py-4 shadow-sm">
          <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row gap-4 justify-between items-center">

            {/* Left: Toggles */}
            <div className="flex items-center bg-[#f0f0f0] rounded-full p-1 border border-black/10">
              {(['all', 'live', 'upcoming', 'past'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${filterType === type
                    ? 'bg-black text-white shadow-md'
                    : 'text-gray-500 hover:text-black'
                    }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Middle: Categories (Optional, could be scrollable) */}
            {/* User said "just a catagury", implying simple category selection */}
            <div className="flex item-center gap-2 overflow-x-auto max-w-full no-scrollbar px-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`whitespace-nowrap px-3 py-1 text-[11px] uppercase font-medium border border-black transition-colors ${selectedCategory === cat ? 'bg-[#E85A6B] text-white' : 'bg-white hover:bg-black/5'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Right: Search */}
            <div className="relative w-full md:w-[300px]">
              <SuggestiveSearch
                value={searchQuery}
                onChange={setSearchQuery}
                suggestions={[
                  "Rooftop Jazz",
                  "Tech Conference",
                  "Art Exhibition",
                  "Food Festival",
                  "Business Summit",
                  "Yoga Workshop"
                ]}
                placeholder="Search events..."
                className="h-10 bg-white border-black"
                showLeading={true}
                showTrailing={false}
              />
            </div>

          </div>
        </div>

        {/* Events Grid */}
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-8">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <h3 className="text-xl font-bold mb-2">No events found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your search or filters.</p>



              <button
                onClick={() => { setFilterType('all'); setSearchQuery(''); setSelectedCategory('All'); fetchEvents(); }}
                className="mt-4 text-[#E85A6B] font-bold underline hover:text-black"
              >
                Retry Fetching
              </button>
            </div>
          )}
        </div>

      </div>

      <Footer />
    </div>
  );
};

export default Discover;
