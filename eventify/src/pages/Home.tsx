import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import api from '@/lib/api';
import { SEOHead } from '@/components/SEOHead';
import { NewHeroSection } from '@/components/NewHeroSection';
import { EventsCarousel } from '@/components/EventsCarousel';
import { CategoryFilters } from '@/components/CategoryFilters';
import { UpcomingThisWeek } from '@/components/UpcomingThisWeek';
import { NewsletterCTA } from '@/components/NewsletterCTA';
import { FeaturedEvents } from '@/components/FeaturedEvents';
import { StatsSection } from '@/components/StatsSection';
import { HowItWorks } from '@/components/HowItWorks';
import { Footer } from '@/components/Footer';
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { format, isFuture, isPast, isToday } from 'date-fns';

interface Event {
    id: string;
    title: string;
    date: string;
    time: string;
    background_image_url: string;
    target_date: string;
    address: string;
    category?: string;
}

const Home = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [filterType, setFilterType] = useState<'all' | 'live' | 'upcoming' | 'past'>('all');

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            // Fetch all events for homepage (limit 100 for now) and sorted by target_date
            const { data } = await api.get('/events?limit=100&sort=target_date');

            // Backend returns { events: [], ... }
            if (data.events) {
                // Map backend fields to frontend expected fields
                const mappedEvents = data.events.map((e: any) => ({
                    ...e,
                    id: e._id || e.id,
                    // Pass RAW path, let EventCard handle resolution (prevents double-wrapping issues)
                    background_image_url: e.background_image_url || e.cover_image,
                    target_date: e.start_date || e.target_date,
                    address: e.venue || e.address || e.city || 'TBA'
                }));
                setEvents(mappedEvents);
            }
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredEvents = events.filter(event => {
        // Category Filter
        const matchesCategory = selectedCategory && selectedCategory !== 'All'
            ? event.category === selectedCategory
            : true;

        // Status Filter
        let matchesType = true;

        // Safe date parsing
        let eventDate;
        try {
            eventDate = event.target_date ? new Date(event.target_date) : new Date();
            if (isNaN(eventDate.getTime())) eventDate = new Date();
        } catch (e) {
            eventDate = new Date();
        }

        if (filterType === 'live') {
            matchesType = isToday(eventDate);
        } else if (filterType === 'upcoming') {
            // Upcoming = Future + Today (formerly 'active')
            matchesType = isFuture(eventDate) || isToday(eventDate);
        } else if (filterType === 'past') {
            matchesType = isPast(eventDate) && !isToday(eventDate);
        }

        return matchesCategory && matchesType;
    });

    return (
        <div className="min-h-screen bg-white">
            <SEOHead
                title="Eventure - Discover Local Events"
                description="Explore popular events near you, browse by category, or check out some of the great community calendars."
                keywords="events, discover events, community events, local events, event calendar"
            />
            <div className="fixed top-0 left-0 right-0 z-50">
                <Navbar />
            </div>

            {/* Main Content Container matching Navbar */}
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 space-y-12 pb-12">
                {/* Hero Section */}
                <NewHeroSection />

                {/* Category Filters */}
                <CategoryFilters
                    selectedCategory={selectedCategory}
                    onCategorySelect={setSelectedCategory}
                />

                {/* Featured Events */}
                <FeaturedEvents events={filteredEvents} />

                {/* Stats Section */}
                <StatsSection eventsCount={events.length} />

                {/* How It Works */}
                <HowItWorks />

                {/* Newsletter CTA */}
                <NewsletterCTA />
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default Home;
