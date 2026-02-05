import React from 'react';
import { Calendar, MapPin, Clock, Ticket, ChevronRight, Download, Eye } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '@/lib/utils';

interface TicketCardProps {
    ticket: {
        id: string;
        ticket_id: string;
        status: 'valid' | 'used' | 'cancelled';
        ticket_type: string;
        created_at: string;
        used_at?: string;
        event: {
            id: string;
            title: string;
            date: string;
            time: string;
            address: string;
            background_image_url: string;
        };
    };
}

const TicketCard: React.FC<TicketCardProps> = ({ ticket }) => {
    const navigate = useNavigate();

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'valid':
                return 'bg-green-100 text-green-800 border-green-300';
            case 'used':
                return 'bg-gray-100 text-gray-800 border-gray-300';
            case 'cancelled':
                return 'bg-red-100 text-red-800 border-red-300';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };


    return (
        <div className="border border-black hover:border-[#E85A6B] transition-colors cursor-pointer group">
            <div className="flex flex-col md:flex-row">
                {/* Event Image */}
                <div className="w-full md:w-48 h-32 md:h-auto overflow-hidden">
                    <img
                        src={getImageUrl(ticket.event.background_image_url)}
                        alt={ticket.event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                </div>

                {/* Ticket Details */}
                <div className="flex-1 p-4 md:p-6 flex flex-col justify-between">
                    <div>
                        <div className="flex items-start justify-between mb-2">
                            <h3 className="text-lg md:text-xl font-medium group-hover:text-[#E85A6B] transition-colors">
                                {ticket.event.title}
                            </h3>
                            <span className={`px-2 py-1 text-xs font-bold uppercase border ${getStatusColor(ticket.status)}`}>
                                {ticket.status}
                            </span>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-black/60 mb-3">
                            <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>{ticket.event.date}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{ticket.event.time}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                <span className="truncate max-w-[200px]">{ticket.event.address}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-black/40">
                            <Ticket className="w-4 h-4" />
                            <span>Ticket ID: {ticket.ticket_id}</span>
                            <span>•</span>
                            <span>{ticket.ticket_type}</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 border-t border-dashed border-gray-200 pt-4">
                        <span className="text-xs text-black/40">
                            Purchased {format(parseISO(ticket.created_at), 'MMM d, yyyy')}
                        </span>

                        <div className="flex gap-2">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/ticket/${ticket.id}`);
                                }}
                                className="px-3 py-1.5 text-xs font-bold bg-black text-white uppercase tracking-wider hover:bg-[#E85A6B] transition-colors flex items-center gap-1"
                            >
                                <Eye className="w-3 h-3" />
                                View Ticket
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/event/${ticket.event.id}`);
                                }}
                                className="px-3 py-1.5 text-xs font-bold border border-black text-black uppercase tracking-wider hover:bg-black hover:text-white transition-colors flex items-center gap-1"
                            >
                                View Event
                                <ChevronRight className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicketCard;
