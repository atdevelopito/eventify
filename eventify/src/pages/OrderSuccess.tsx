import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AnimatedTicket } from '@/components/ui/ticket-confirmation-card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';

interface OrderState {
    registrationIds: string[];
    totalAmount: number;
    paymentMethod: string;
    guestName?: string;
}

const OrderSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [state, setState] = useState<OrderState | null>(null);

    useEffect(() => {
        if (location.state) {
            setState(location.state as OrderState);
        } else {
            // Redirect if accessed directly without state
            navigate('/');
        }
    }, [location, navigate]);

    if (!state) return null;

    // Derive display values
    const mainTicketId = state.registrationIds[0] || 'Unknown';
    // Use a fallback for last4Digits since we don't handle real cards
    const last4Digits = state.paymentMethod === 'card' ? '4242' : '88XX';
    // Generate a pseudo-realistic barcode value from the ID
    const barcodeValue = mainTicketId.replace(/\D/g, '').padEnd(12, '0').slice(0, 14);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <SEOHead title="Order Confirmed" description="Thank you for your purchase!" />
            <Navbar />

            <main className="flex-grow flex flex-col items-center justify-center pt-24 pb-12 px-4">
                <div className="max-w-md w-full space-y-8 flex flex-col items-center">

                    <div className="text-center space-y-2">
                        <div className="inline-flex items-center justify-center p-3 bg-green-100 text-green-600 rounded-full mb-4">
                            <CheckCircle className="w-8 h-8" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">Order Confirmed!</h1>
                        <p className="text-gray-600">
                            Your {state.registrationIds.length > 1 ? 'tickets have' : 'ticket has'} been sent to your email.
                        </p>
                    </div>

                    {/* The Ticket Card */}
                    <div className="w-full flex justify-center transform hover:scale-105 transition-transform duration-500">
                        <AnimatedTicket
                            ticketId={`#${mainTicketId.slice(-8).toUpperCase()}`}
                            amount={state.totalAmount}
                            date={new Date()} // Current time as purchase time
                            cardHolder={state.guestName || "Valued Customer"}
                            last4Digits={last4Digits}
                            barcodeValue={barcodeValue || "123456789012"}
                        />
                    </div>

                    <div className="w-full flex flex-col gap-3 pt-8">
                        <Button
                            onClick={() => navigate('/my-tickets')}
                            className="w-full h-12 text-base font-bold bg-black hover:bg-gray-800"
                        >
                            View My Tickets <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => navigate('/')}
                            className="w-full h-12 text-base"
                        >
                            Continue Shopping
                        </Button>
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
};

export default OrderSuccess;
