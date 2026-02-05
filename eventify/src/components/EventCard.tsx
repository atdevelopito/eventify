import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Ticket, ShoppingBag } from 'lucide-react';
import { format } from 'date-fns';
import { getImageUrl } from '@/lib/utils';
import { useCart } from './CartContext';

export interface EventCardProps {
    event: {
        id: string;
        title: string;
        target_date: string; // ISO string expected
        background_image_url: string;
        address: string;
        min_ticket_price?: number;
        category?: string;
    };
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const dateObj = new Date(event.target_date);
    const isValidDate = !isNaN(dateObj.getTime());
    const day = isValidDate ? format(dateObj, 'd') : '--';
    const month = isValidDate ? format(dateObj, 'MMM') : 'TBA';
    const price = event.min_ticket_price ? `BDT ${event.min_ticket_price}` : 'BDT 20';

    return (
        <div
            onClick={() => navigate(`/events/${event.id}`)}
            className="group cursor-pointer flex flex-col gap-3"
        >
            {/* Image Container - Fixed Height 248px */}
            <div className="relative h-[248px] w-full overflow-hidden rounded-lg bg-gray-100">
                <div
                    className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                    style={{ backgroundImage: `url('${getImageUrl(event.background_image_url)}')` }}
                />
                {/* Category over image - Static, clean */}
                <div className="absolute top-3 left-3">
                    <span className="bg-white/95 text-black text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-sm">
                        {event.category || 'Event'}
                    </span>
                </div>
            </div>

            {/* Content - Clean Typography below image */}
            <div className="flex gap-4 pt-1">
                {/* Date - Left Aligned Fixed Width */}
                <div className="flex-shrink-0 flex flex-col items-center w-12 pt-1">
                    <span className="text-xs font-bold text-red-600 uppercase tracking-wider">{month}</span>
                    <span className="text-2xl font-black text-black leading-none">{day}</span>
                </div>

                {/* Main Info */}
                <div className="flex flex-col gap-1.5 border-l border-gray-200 pl-4 flex-1">
                    <h3 className="text-lg font-bold leading-tight text-gray-900 group-hover:text-black transition-colors line-clamp-2">
                        {event.title}
                    </h3>

                    <div className="flex items-center gap-1.5 text-sm font-medium text-gray-500">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="line-clamp-1">{event.address}</span>
                    </div>

                    <div className="mt-1 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-bold text-black min-w-0">
                            <Ticket className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">Starting {price}</span>
                        </div>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                addToCart({
                                    id: event.id,
                                    name: event.title,
                                    price: event.min_ticket_price || 20,
                                    image: event.background_image_url,
                                    eventId: event.id, // Critical for checkout registration
                                    ticketType: 'General' // Default for card quick-add
                                });
                            }}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-black text-white hover:bg-[#E85A6B] transition-colors"
                            title="Add to Cart"
                        >
                            <ShoppingBag className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
