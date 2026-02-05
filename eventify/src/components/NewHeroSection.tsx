import { useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import api from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { ArrowRight, Ticket } from 'lucide-react';
import { getImageUrl } from '@/lib/utils'; // Import helper
import { FlipWords } from './ui/flip-words';

interface Event {
    id: string;
    title: string;
    background_image_url: string;
    date: string;
    address: string;
}

export const NewHeroSection = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [emblaRef] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 4000 })]);
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                console.log("Fetching hero events...");
                // Only fetch FEATURED events
                const { data } = await api.get('/events?sort=-target_date&limit=5&featured=true');
                console.log("Hero events API response:", data);
                const eventsList = data.events || [];
                // map _id to id
                const formattedEvents = eventsList.map((e: any) => ({
                    ...e,
                    id: e.id || e._id,
                    // Prioritize background_image_url as it's the standard for seeded events
                    background_image_url: e.background_image_url || e.cover_image
                }));
                console.log("Formatted Hero Events:", formattedEvents);
                setEvents(formattedEvents);
            } catch (error) {
                console.error("Failed to fetch hero events", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
                <div className="md:col-span-2 bg-gray-200 rounded-lg aspect-[4/5] md:aspect-[16/9]" />
                <div className="md:col-span-1 bg-gray-200 rounded-lg aspect-[4/3] md:aspect-auto h-full min-h-[300px]" />
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* Carousel Section - Takes up 2/3 on desktop */}
            <div className="md:col-span-2 relative rounded-lg overflow-hidden aspect-[4/5] md:aspect-[16/9] border border-black group bg-gray-100 dark:bg-neutral-900">
                {events.length > 0 ? (
                    <div className="overflow-hidden h-full" ref={emblaRef}>
                        <div className="flex h-full">
                            {events.map((event) => (
                                <div className="flex-[0_0_100%] min-w-0 relative h-full cursor-pointer" key={event.id} onClick={() => navigate(`/event/${event.id}`)}>
                                    <img
                                        src={getImageUrl(event.background_image_url)} // Use helper
                                        alt={event.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                    <div className="absolute bottom-0 left-0 p-6 md:p-10 text-white">
                                        <div className="bg-primary/90 text-primary-foreground text-xs font-bold px-3 py-1 rounded-full w-fit mb-3">
                                            FEATURED
                                        </div>
                                        <h2 className="text-3xl md:text-5xl font-bold mb-2 leading-tight">{event.title}</h2>
                                        <p className="text-white/80 text-sm md:text-lg flex items-center gap-2">
                                            <span>{event.date}</span>
                                            <span>•</span>
                                            <span>{event.address}</span>
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-6 text-muted-foreground">
                        <Ticket className="w-12 h-12 mb-4 opacity-20" />
                        <h3 className="text-xl font-medium text-foreground">No featured events</h3>
                        <p className="text-sm">Check back later for updates!</p>
                    </div>
                )}
            </div>

            {/* CTA Card Section - Takes up 1/3 on desktop */}
            <div className="md:col-span-1 relative rounded-lg overflow-hidden aspect-[4/3] md:aspect-auto border border-black bg-black text-white flex flex-col justify-end p-6 md:p-8">
                {/* Background Image/Effect */}
                <div className="absolute inset-0 opacity-40">
                    <img src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=60" alt="Concert Crowd" className="w-full h-full object-cover" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

                <div className="relative z-10">
                    <h3 className="text-2xl md:text-3xl font-bold mb-4 leading-tight">
                        Get Your
                        <br />
                        <span className="text-[#E85A6B]">
                            <FlipWords words={["Desired", "Perfect", "Dream", "Ideal"]} className="text-white px-0" />
                        </span>
                        <br />
                        Event Pass!
                    </h3>
                    <Button
                        onClick={() => navigate('/discover')}
                        className="w-full md:w-auto bg-[#2F4F4F] hover:bg-[#1f3f3f] text-white border-0"
                    >
                        Explore <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                </div>
            </div>

        </div>
    );
};
