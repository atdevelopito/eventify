import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { Navbar } from '@/components/Navbar';
import { SEOHead } from '@/components/SEOHead';
import { Footer } from '@/components/Footer';
import TicketCardWithQR from '@/components/TicketCardWithQR';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, XCircle, Loader2 } from 'lucide-react';

interface TicketDetails {
    id: string;
    ticket_id: string;
    status: 'valid' | 'used' | 'cancelled';
    ticket_type: string;
    qr_token: string;
    created_at: string;
    used_at?: string;
    event: {
        id: string;
        title: string;
        date: string;
        time: string;
        address: string;
        background_image_url: string;
        description: string;
    };
    holder: {
        name: string;
        email: string;
    };
}

const TicketDetail = () => {
    const { ticketId } = useParams<{ ticketId: string }>();
    const navigate = useNavigate();
    const [ticket, setTicket] = useState<TicketDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchTicket();
    }, [ticketId]);

    const fetchTicket = async () => {
        try {
            setLoading(true);
            setError(null);
            const { data } = await api.get(`/tickets/${ticketId}`);
            setTicket(data);
        } catch (err: any) {
            console.error('Error fetching ticket:', err);
            setError(err.response?.data?.message || 'Failed to load ticket');
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleDownload = () => {
        // Trigger browser print dialog which allows "Save as PDF"
        window.print();
    };

    // Loading State
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-black" />
                    <p className="text-gray-600">Loading your ticket...</p>
                </div>
            </div>
        );
    }

    // Error State
    if (error || !ticket) {
        return (
            <div className="min-h-screen bg-white">
                <SEOHead title="Ticket Not Found" description="Ticket not found" />
                <Navbar />
                <main className="pt-24 pb-16 px-4 md:px-8">
                    <div className="max-w-2xl mx-auto text-center">
                        <XCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
                        <h1 className="text-2xl font-medium mb-2">Ticket Not Found</h1>
                        <p className="text-black/60 mb-6">
                            {error || 'This ticket does not exist or you do not have access to it.'}
                        </p>
                        <button
                            onClick={() => navigate('/my-tickets')}
                            className="px-6 py-3 bg-black text-white text-sm font-medium uppercase tracking-wider hover:bg-black/90 transition-colors"
                        >
                            Back to My Tickets
                        </button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    // Success State - Display Ticket
    return (
        <div className="min-h-screen bg-white">
            <SEOHead
                title={`Ticket - ${ticket.event.title}`}
                description={`Your ticket for ${ticket.event.title}`}
            />

            {/* Hide navbar when printing */}
            <div className="print:hidden">
                <Navbar />
            </div>

            <main className="pt-24 pb-16 px-4 md:px-8 print:pt-0 print:px-0">
                <div className="max-w-5xl mx-auto">
                    {/* Action Buttons - Hidden when printing */}
                    <div className="flex items-center justify-between mb-6 print:hidden">
                        <button
                            onClick={() => navigate('/my-tickets')}
                            className="flex items-center gap-2 text-sm text-black/60 hover:text-black transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to My Tickets
                        </button>

                        <div className="flex gap-3">
                            <button
                                onClick={handleDownload}
                                className="px-4 py-2 border border-black text-black text-sm font-medium uppercase tracking-wider hover:bg-black hover:text-white transition-colors flex items-center gap-2"
                            >
                                <Download className="w-4 h-4" />
                                Download / Print
                            </button>
                        </div>
                    </div>

                    {/* Ticket Card with QR Code */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <TicketCardWithQR ticket={ticket} />
                    </motion.div>

                    {/* Additional Actions - Hidden when printing */}
                    <div className="mt-6 text-center print:hidden">
                        <button
                            onClick={() => navigate(`/event/${ticket.event.id}`)}
                            className="text-sm text-black/60 hover:text-black underline transition-colors"
                        >
                            View Event Details
                        </button>
                    </div>
                </div>
            </main>

            {/* Hide footer when printing */}
            <div className="print:hidden">
                <Footer />
            </div>
        </div>
    );
};

export default TicketDetail;
