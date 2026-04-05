import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { useCart } from "@/components/CartContext";
import { Trash2, Plus, Minus, CreditCard, Lock, Check, Smartphone, ArrowLeft, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/toast";
import api from "@/lib/api";
import { useRole } from "@/components/RoleContext";
import { motion, AnimatePresence } from "framer-motion";

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
            <div className="min-h-screen bg-[#f9f9f8]">
                <Navbar />
                <div className="pt-40 pb-20 px-4 text-center max-w-md mx-auto">
                    <div className="w-12 h-12 bg-[#f0efed] rounded-full flex items-center justify-center mx-auto mb-6">
                        <Zap className="w-5 h-5 text-[#b8b5ad]" />
                    </div>
                    <h1 className="text-lg font-semibold mb-2 text-[#1a1a1a]">No items yet</h1>
                    <p className="text-[#9e9a93] text-sm mb-8">Browse events and add tickets to get started.</p>
                    <button
                        onClick={() => navigate('/discover')}
                        className="bg-[#1a1a1a] text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-[#333] transition-colors"
                    >
                        Browse events
                    </button>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f9f9f8] font-sans antialiased">
            <SEOHead title="Checkout | Eventify" description="Complete your purchase." />
            <Navbar />

            <div className="max-w-[960px] mx-auto px-6 pt-32 pb-24">
                {/* Header */}
                <div className="mb-10">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-1.5 text-[#b8b5ad] hover:text-[#1a1a1a] transition-colors mb-6 text-sm"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Back</span>
                    </button>
                    <h1 className="text-2xl font-semibold text-[#1a1a1a] tracking-tight">Checkout</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-16 items-start">
                    {/* Left */}
                    <div className="lg:col-span-3 space-y-10">

                        {/* Contact */}
                        <div>
                            <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-[#b8b5ad] mb-4">Contact</p>

                            {user ? (
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-[#f0efed] text-[#7a7670] rounded-full flex items-center justify-center font-semibold text-sm">
                                        {user.name?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-[#1a1a1a]">{user.name}</p>
                                        <p className="text-xs text-[#b8b5ad]">{user.email}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <input
                                            type="text"
                                            placeholder="Name"
                                            value={guestDetails.name}
                                            onChange={(e) => setGuestDetails({ ...guestDetails, name: e.target.value })}
                                            className="w-full px-4 py-3 bg-white border border-[#e8e6e1] rounded-xl text-sm text-[#1a1a1a] placeholder:text-[#ccc9c1] outline-none focus:border-[#1a1a1a] transition-colors"
                                            required
                                        />
                                        <input
                                            type="email"
                                            placeholder="Email"
                                            value={guestDetails.email}
                                            onChange={(e) => setGuestDetails({ ...guestDetails, email: e.target.value })}
                                            className="w-full px-4 py-3 bg-white border border-[#e8e6e1] rounded-xl text-sm text-[#1a1a1a] placeholder:text-[#ccc9c1] outline-none focus:border-[#1a1a1a] transition-colors"
                                            required
                                        />
                                    </div>
                                    <input
                                        type="tel"
                                        placeholder="Phone (optional)"
                                        value={guestDetails.phone}
                                        onChange={(e) => setGuestDetails({ ...guestDetails, phone: e.target.value })}
                                        className="w-full px-4 py-3 bg-white border border-[#e8e6e1] rounded-xl text-sm text-[#1a1a1a] placeholder:text-[#ccc9c1] outline-none focus:border-[#1a1a1a] transition-colors"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="border-t border-[#eeece7]" />

                        {/* Payment */}
                        <div>
                            <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-[#b8b5ad] mb-5">Payment method</p>

                            <div className="space-y-2">
                                {/* Mobile options */}
                                {[
                                    { id: 'bkash', name: 'bKash', logo: bkashLogo },
                                    { id: 'nagad', name: 'Nagad', color: '#F37021' },
                                    { id: 'pathao', name: 'Pathao Pay', logo: pathaoPayLogo }
                                ].map((method) => (
                                    <button
                                        key={method.id}
                                        onClick={() => setPaymentMethod(method.id as any)}
                                        className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-left transition-all ${
                                            paymentMethod === method.id
                                                ? 'bg-white border border-[#1a1a1a]'
                                                : 'bg-white border border-[#e8e6e1] hover:border-[#ccc9c1]'
                                        }`}
                                    >
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                            paymentMethod === method.id ? 'border-[#1a1a1a] bg-[#1a1a1a]' : 'border-[#d4d1cb]'
                                        }`}>
                                            {paymentMethod === method.id && <Check className="w-3 h-3 text-white" />}
                                        </div>
                                        <div className="h-5 flex items-center">
                                            {method.id === 'nagad' ? (
                                                <span className="font-bold italic text-sm" style={{ color: method.color }}>{method.name}</span>
                                            ) : (
                                                <img src={method.logo} alt={method.name} className="h-5 object-contain" />
                                            )}
                                        </div>
                                    </button>
                                ))}

                                {/* Card */}
                                <button
                                    onClick={() => setPaymentMethod('card')}
                                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-left transition-all ${
                                        paymentMethod === 'card'
                                            ? 'bg-white border border-[#1a1a1a]'
                                            : 'bg-white border border-[#e8e6e1] hover:border-[#ccc9c1]'
                                    }`}
                                >
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                        paymentMethod === 'card' ? 'border-[#1a1a1a] bg-[#1a1a1a]' : 'border-[#d4d1cb]'
                                    }`}>
                                        {paymentMethod === 'card' && <Check className="w-3 h-3 text-white" />}
                                    </div>
                                    <CreditCard className="w-4 h-4 text-[#9e9a93]" />
                                    <span className="text-sm text-[#1a1a1a] font-medium">Card</span>
                                    <div className="ml-auto flex items-center gap-1.5 text-[#ccc9c1]">
                                        <span className="text-[9px] font-black italic text-[#0055A5]/40">VISA</span>
                                        <div className="flex -space-x-1">
                                            <div className="w-2.5 h-2.5 rounded-full bg-[#EB001B]/30" />
                                            <div className="w-2.5 h-2.5 rounded-full bg-[#F79E1B]/30" />
                                        </div>
                                    </div>
                                </button>
                            </div>

                            <div className="flex items-center gap-1.5 mt-5 text-[#ccc9c1]">
                                <Lock className="w-3 h-3" />
                                <p className="text-[10px] font-medium">Encrypted & secure</p>
                            </div>
                        </div>
                    </div>

                    {/* Right: Summary */}
                    <div className="lg:col-span-2 lg:sticky lg:top-28">
                        <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-[#b8b5ad] mb-4">Summary</p>

                        {/* Items */}
                        <div className="space-y-4 mb-6">
                            <AnimatePresence mode="popLayout">
                                {items.map((item) => (
                                    <motion.div
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="flex gap-3"
                                    >
                                        <div className="w-12 h-12 bg-[#f0efed] rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                                            {item.image ? (
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <Zap className="w-4 h-4 text-[#d4d1cb]" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <h3 className="text-sm font-medium text-[#1a1a1a] truncate pr-2 capitalize">{item.name}</h3>
                                                <button onClick={() => removeFromCart(item.id)} className="text-[#d4d1cb] hover:text-[#e85a6b] transition-colors">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                            <p className="text-[10px] text-[#b8b5ad] mt-0.5">{item.ticketType || 'Ticket'}</p>
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-sm font-medium text-[#1a1a1a]">{item.price === 0 ? 'Free' : `৳${item.price}`}</span>
                                                <div className="flex items-center gap-0 border border-[#e8e6e1] rounded-lg overflow-hidden">
                                                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-7 h-7 flex items-center justify-center text-[#9e9a93] hover:bg-[#f0efed] transition-colors"><Minus className="w-3 h-3" /></button>
                                                    <span className="w-6 text-center text-xs font-medium text-[#1a1a1a]">{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center text-[#9e9a93] hover:bg-[#f0efed] transition-colors"><Plus className="w-3 h-3" /></button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        <div className="border-t border-[#eeece7] pt-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-[#b8b5ad]">Subtotal</span>
                                <span className="text-[#1a1a1a] font-medium">{totalPrice === 0 ? 'Free' : `৳${totalPrice}`}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-[#b8b5ad]">Fees</span>
                                <span className="text-[#1a1a1a] font-medium">৳0</span>
                            </div>
                        </div>

                        <div className="border-t border-[#eeece7] mt-3 pt-4 flex justify-between items-baseline">
                            <span className="text-sm text-[#b8b5ad]">Total</span>
                            <span className="text-xl font-semibold text-[#1a1a1a]">
                                {totalPrice === 0 ? 'Free' : `৳${totalPrice}`}
                            </span>
                        </div>

                        <button
                            onClick={handleCheckout}
                            disabled={isProcessing || !paymentMethod}
                            className={`w-full mt-6 py-3.5 rounded-xl text-sm font-medium transition-colors ${
                                isProcessing || !paymentMethod
                                    ? 'bg-[#f0efed] text-[#ccc9c1] cursor-not-allowed'
                                    : 'bg-[#1a1a1a] text-white hover:bg-[#333]'
                            }`}
                        >
                            {isProcessing ? "Processing..." : totalPrice === 0 ? "Confirm" : "Pay"}
                        </button>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default Checkout;
