import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { useCart } from "@/components/CartContext";
import { Trash2, Plus, Minus, CreditCard, Lock, CheckCircle, Smartphone, ArrowLeft, ShieldCheck, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/toast";
import api from "@/lib/api";
import { useRole } from "@/components/RoleContext";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

// Assets
import bkashLogo from '@/assets/bkash-logo.png';
import pathaoPayLogo from '@/assets/pathao-pay-logo.png';

const Checkout = () => {
    const { items, totalPrice, updateQuantity, removeFromCart, clearCart } = useCart();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'nagad' | 'pathao' | 'card' | null>(null);
    const { user } = useRole();

    const [guestDetails, setGuestDetails] = useState({
        name: '',
        email: '',
        phone: ''
    });

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            if (!guestDetails.name || !guestDetails.email) {
                toast.error("Please enter your name and email to continue.");
                return;
            }
        }

        if (!paymentMethod) {
            toast.error("Please select a payment method");
            return;
        }

        setIsProcessing(true);

        try {
            const pendingRegistrationIds: string[] = [];

            for (const item of items) {
                const targetEventId = item.eventId || (item.type !== 'merch' ? item.id : null);

                if (targetEventId) {
                    try {
                        const { data } = await api.post('/registrations', {
                            event_id: targetEventId,
                            ticket_type: item.ticketType || 'General',
                            quantity: item.quantity,
                            price: item.price,
                            payment_method: paymentMethod === 'card' ? 'Card' : 'Mobile Banking',
                            guest_name: !user ? guestDetails.name : undefined,
                            guest_email: !user ? guestDetails.email : undefined,
                            guest_phone: !user ? guestDetails.phone : undefined
                        });

                        if (data.id) {
                            pendingRegistrationIds.push(data.id);
                        }
                    } catch (err) {
                        console.error(`Failed to init registration for ${item.name}`, err);
                        toast.error(`Failed to start order for ${item.name}`);
                        throw err;
                    }
                }
            }

            if (pendingRegistrationIds.length === 0 && items.some(i => i.price > 0)) {
                toast.error("Cart error: No valid tickets found.");
                return;
            }

            await new Promise(resolve => setTimeout(resolve, 2000));

            await Promise.all(pendingRegistrationIds.map(id =>
                api.post(`/registrations/${id}/confirm_payment`)
            ));

            clearCart();
            toast.success("Order placed successfully!", {
                title: "Purchase Complete",
            });
            navigate("/order-success", {
                state: {
                    registrationIds: pendingRegistrationIds,
                    totalAmount: totalPrice,
                    paymentMethod: paymentMethod,
                    guestName: user?.name || guestDetails.name
                }
            });
        } catch (error) {
            console.error("Checkout failed:", error);
            toast.error("Failed to process order. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-white selection:bg-[#E85A6B]/30">
                <Navbar />
                <div className="pt-40 pb-20 px-4 text-center max-w-lg mx-auto">
                    <div className="bg-white border border-black p-12 rounded-xl">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Zap className="w-8 h-8 text-gray-400" />
                        </div>
                        <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
                        <p className="text-muted-foreground mb-8 leading-relaxed">Looks like you haven't added any tickets or merchandise to your collection yet.</p>
                        <Button
                            onClick={() => navigate('/discover')}
                            className="w-full bg-black text-white px-8 py-4 rounded-xl font-bold hover:bg-[#E85A6B] transition-all flex items-center justify-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Explore Events
                        </Button>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white selection:bg-[#E85A6B]/30 font-sans antialiased">
            <SEOHead title="Secure Checkout | Eventify" description="Complete your ticket purchase securely." />
            <Navbar />

            <div className="max-w-7xl mx-auto px-6 pt-32 pb-24">
                {/* Minimal Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <button
                            onClick={() => navigate(-1)}
                            className="group flex items-center gap-2 text-muted-foreground hover:text-black transition-colors mb-4 text-sm font-medium"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Back to Event
                        </button>
                        <h1 className="text-4xl font-bold tracking-tight text-black">
                            Checkout<span className="text-[#E85A6B]">.</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full border border-gray-200">
                        <ShieldCheck className="w-4 h-4 text-green-600" />
                        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Secure Encryption</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Main Content Layout */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Step 1: Contact Info */}
                        <section className="bg-white border border-black p-8 md:p-10 rounded-xl">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-bold flex items-center gap-4">
                                    <span className="flex items-center justify-center w-8 h-8 bg-black text-white rounded-full text-sm font-bold">1</span>
                                    Contact Details
                                </h2>
                                {user && (
                                    <span className="text-[10px] font-bold uppercase tracking-widest bg-gray-100 text-gray-600 px-3 py-1 rounded-full border border-gray-200">
                                        Verified Member
                                    </span>
                                )}
                            </div>

                            {user ? (
                                <div className="p-6 bg-gray-50 rounded-xl border border-gray-200 flex items-center gap-6">
                                    <div className="w-14 h-14 bg-black text-white rounded-xl flex items-center justify-center font-bold text-xl">
                                        {user.name?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-lg text-black">{user.name}</p>
                                        <p className="text-muted-foreground text-sm font-medium">{user.email}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2 group">
                                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Full Name</label>
                                        <input
                                            type="text"
                                            placeholder="Linkon Khan"
                                            value={guestDetails.name}
                                            onChange={(e) => setGuestDetails({ ...guestDetails, name: e.target.value })}
                                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-black transition-all font-medium"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2 group">
                                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Email Address</label>
                                        <input
                                            type="email"
                                            placeholder="linkon@example.com"
                                            value={guestDetails.email}
                                            onChange={(e) => setGuestDetails({ ...guestDetails, email: e.target.value })}
                                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-black transition-all font-medium"
                                            required
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-2 group">
                                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Phone Number (Optional)</label>
                                        <input
                                            type="tel"
                                            placeholder="+880 1XXX XXXXXX"
                                            value={guestDetails.phone}
                                            onChange={(e) => setGuestDetails({ ...guestDetails, phone: e.target.value })}
                                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-black transition-all font-medium"
                                        />
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* Step 2: Payment Method */}
                        <section className="bg-white border border-black p-8 md:p-10 rounded-xl">
                            <h2 className="text-xl font-bold mb-10 flex items-center gap-4">
                                <span className="flex items-center justify-center w-8 h-8 bg-black text-white rounded-full text-sm font-bold">2</span>
                                Select Payment
                            </h2>

                            <div className="space-y-10">
                                {/* Mobile Banking Selection */}
                                <div className="space-y-6">
                                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-3">
                                        <Smartphone className="w-4 h-4" />
                                        Mobile Banking
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        {[
                                            { id: 'bkash', name: 'bKash', logo: bkashLogo },
                                            { id: 'nagad', name: 'Nagad', color: 'text-[#F37021]' },
                                            { id: 'pathao', name: 'Pathao Pay', logo: pathaoPayLogo }
                                        ].map((method) => (
                                            <div
                                                key={method.id}
                                                onClick={() => setPaymentMethod(method.id as any)}
                                                className={`group relative cursor-pointer border-2 rounded-xl p-6 flex flex-col items-center justify-center gap-4 transition-all duration-300 h-28 ${paymentMethod === method.id
                                                    ? 'border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                                                    : 'border-gray-200 bg-gray-50 hover:border-black hover:bg-white'
                                                    }`}
                                            >
                                                <div className={`h-8 w-full flex items-center justify-center transition-all ${paymentMethod === method.id ? 'grayscale-0' : 'grayscale group-hover:grayscale-0 opacity-60 group-hover:opacity-100'}`}>
                                                    {method.id === 'nagad' ? (
                                                        <span className={`font-bold italic text-xl ${method.color}`}>{method.name}</span>
                                                    ) : (
                                                        <img src={method.logo} alt={method.name} className="h-full object-contain pointer-events-none" />
                                                    )}
                                                </div>
                                                <span className={`text-[10px] font-bold uppercase tracking-widest ${paymentMethod === method.id ? 'text-black' : 'text-muted-foreground'}`}>
                                                    {method.id}
                                                </span>

                                                {paymentMethod === method.id && (
                                                    <div className="absolute top-2 right-2 bg-black text-white rounded-full p-0.5">
                                                        <CheckCircle className="w-3.5 h-3.5" />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="relative flex items-center justify-center py-4">
                                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
                                    <span className="relative bg-white px-6 text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Or Card Payment</span>
                                </div>

                                {/* Card Selection */}
                                <div
                                    onClick={() => setPaymentMethod('card')}
                                    className={`group relative border-2 rounded-xl p-8 cursor-pointer transition-all duration-300 ${paymentMethod === 'card'
                                        ? 'border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                                        : 'border-gray-200 bg-gray-50 hover:border-black hover:bg-white'
                                        }`}
                                >
                                    <div className="flex items-center justify-between gap-6">
                                        <div className="flex items-center gap-6">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${paymentMethod === 'card' ? 'bg-black text-white' : 'bg-white text-gray-400 border border-gray-100'}`}>
                                                <CreditCard className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className={`font-bold text-lg ${paymentMethod === 'card' ? 'text-black' : ''}`}>Credit or Debit Card</h3>
                                                <p className="text-xs font-medium text-muted-foreground">
                                                    Secure payment with Stripe
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 opacity-50">
                                            <div className="bg-white px-2 py-1 rounded-md border border-gray-100">
                                                <span className="text-[#0055A5] font-black italic text-[10px]">VISA</span>
                                            </div>
                                            <div className="bg-white px-2 py-1 rounded-md border border-gray-100">
                                                <div className="flex -space-x-1">
                                                    <div className="w-2.5 h-2.5 rounded-full bg-[#EB001B]"></div>
                                                    <div className="w-2.5 h-2.5 rounded-full bg-[#F79E1B]"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {paymentMethod === 'card' && (
                                        <div className="absolute top-2 right-2 bg-black text-white rounded-full p-0.5">
                                            <CheckCircle className="w-3.5 h-3.5" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-12 flex items-center gap-4 bg-gray-50 p-6 rounded-xl border border-gray-100">
                                <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
                                <p className="text-[10px] text-muted-foreground font-medium leading-relaxed uppercase tracking-wider">
                                    Your secure payment is processed through encrypted channels. We do not store your card details.
                                </p>
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Order Summary (Sticky) */}
                    <div className="lg:col-span-4 lg:sticky lg:top-24">
                        <section className="bg-white border border-black rounded-xl p-8">
                            <h2 className="text-xl font-bold mb-8">Order Summary</h2>

                            {/* Cart Items List */}
                            <div className="space-y-6 mb-10 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                                <AnimatePresence mode="popLayout">
                                    {items.map((item) => (
                                        <motion.div
                                            key={item.id}
                                            layout
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="flex gap-4 group"
                                        >
                                            <div className="w-16 h-16 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100 flex items-center justify-center">
                                                {item.image ? (
                                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Zap className="w-5 h-5 text-gray-200" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h3 className="font-bold text-xs text-black leading-tight truncate pr-4">{item.name}</h3>
                                                    <button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                                <p className="text-[9px] font-bold uppercase tracking-widest text-[#E85A6B] mb-2">{item.ticketType || 'Ticket'}</p>

                                                <div className="flex items-center justify-between mt-auto">
                                                    <p className="text-xs font-bold text-black">BDT {item.price}</p>
                                                    <div className="flex items-center bg-gray-50 rounded border border-gray-200">
                                                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-5 h-5 flex items-center justify-center hover:bg-gray-200 transition-colors"><Minus className="w-2.5 h-2.5" /></button>
                                                        <span className="w-6 text-center text-[10px] font-bold">{item.quantity}</span>
                                                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-5 h-5 flex items-center justify-center hover:bg-gray-200 transition-colors"><Plus className="w-2.5 h-2.5" /></button>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>

                            {/* Totals Breakdown */}
                            <div className="space-y-4 pt-8 border-t border-gray-100">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-muted-foreground font-medium">Subtotal</span>
                                    <span className="text-black font-bold">BDT {totalPrice.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-muted-foreground font-medium">Taxes & Fees</span>
                                    <span className="text-black font-bold uppercase tracking-widest text-[9px]">Calculated</span>
                                </div>
                                <div className="flex justify-between items-center pt-6 mt-4 border-t border-gray-200">
                                    <span className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">Total</span>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-black tracking-tight">BDT {totalPrice.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Action Button */}
                            <div className="mt-8">
                                <Button
                                    onClick={handleCheckout}
                                    disabled={isProcessing}
                                    className="w-full py-6 rounded-xl bg-black text-white hover:bg-[#E85A6B] transition-all font-bold uppercase tracking-widest text-xs"
                                >
                                    {isProcessing ? "Processing..." : "Confirm & Pay"}
                                </Button>
                            </div>

                            <div className="mt-8 flex items-center justify-center gap-4 opacity-30 grayscale group">
                                <img src={bkashLogo} alt="bKash" className="h-4 object-contain" />
                                <img src={pathaoPayLogo} alt="Pathao" className="h-4 object-contain" />
                                <span className="text-[10px] font-bold italic text-[#F37021]">NAGAD</span>
                            </div>
                        </section>
                    </div>
                </div>
            </div>

            <Footer />

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #E0E0E0;
                    border-radius: 10px;
                }
            `}</style>
        </div>
    );
};

export default Checkout;
