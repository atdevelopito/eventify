import React from 'react';
import TicketQRCode from './TicketQRCode';
import { Calendar, MapPin, Clock, User } from 'lucide-react';

interface TicketCardWithQRProps {
    ticket: {
        ticket_id: string;
        qr_token: string;
        ticket_type: string;
        status: 'valid' | 'used' | 'cancelled';
        event: {
            title: string;
            date: string;
            time: string;
            address: string;
        };
        holder: {
            name: string;
            email: string;
        };
    };
}

/**
 * Complete ticket card with QR code
 * Production-ready component for displaying tickets
 */
const TicketCardWithQR: React.FC<TicketCardWithQRProps> = ({ ticket }) => {
    const getStatusColor = () => {
        switch (ticket.status) {
            case 'valid':
                return 'border-green-500 text-green-700 bg-green-50';
            case 'used':
                return 'border-gray-500 text-gray-700 bg-gray-50';
            case 'cancelled':
                return 'border-red-500 text-red-700 bg-red-50';
            default:
                return 'border-gray-500 text-gray-700 bg-gray-50';
        }
    };

    return (
        <div className="max-w-4xl mx-auto border-4 border-black bg-white shadow-lg">
            {/* Header */}
            <div className="bg-black text-white p-6 text-center">
                <h1 className="text-3xl font-bold tracking-wider">EVENTIFY</h1>
                <p className="text-sm mt-1 opacity-80">OFFICIAL EVENT TICKET</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 p-6">
                {/* Left Column - QR Code */}
                <div className="flex flex-col items-center justify-center space-y-4">
                    <TicketQRCode
                        ticketId={ticket.qr_token}
                        size={280}
                        className="p-4 bg-white"
                    />

                    <div className={`px-4 py-2 border-2 font-bold uppercase text-sm ${getStatusColor()}`}>
                        {ticket.status}
                    </div>

                    <p className="text-xs text-gray-600 text-center max-w-xs">
                        Present this QR code at the venue entrance for validation
                    </p>
                </div>

                {/* Right Column - Ticket Details */}
                <div className="space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold mb-4 border-b-2 border-black pb-2">
                            {ticket.event.title}
                        </h2>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-start gap-3">
                            <Calendar className="w-5 h-5 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-sm text-gray-600">Date</p>
                                <p className="font-semibold">{ticket.event.date}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Clock className="w-5 h-5 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-sm text-gray-600">Time</p>
                                <p className="font-semibold">{ticket.event.time}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-sm text-gray-600">Location</p>
                                <p className="font-semibold">{ticket.event.address}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <User className="w-5 h-5 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-sm text-gray-600">Ticket Holder</p>
                                <p className="font-semibold">{ticket.holder.name}</p>
                                <p className="text-sm text-gray-600">{ticket.holder.email}</p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Ticket ID</span>
                            <span className="font-mono font-bold">{ticket.ticket_id}</span>
                        </div>
                        <div className="flex justify-between text-sm mt-2">
                            <span className="text-gray-600">Type</span>
                            <span className="font-semibold">{ticket.ticket_type}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-100 p-4 text-center border-t-2 border-black">
                <p className="text-xs text-gray-600">
                    This ticket is non-transferable and valid for one-time entry only.
                </p>
            </div>
        </div>
    );
};

export default TicketCardWithQR;
