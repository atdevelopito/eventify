import React, { useState, useMemo, useEffect } from 'react';
import { Ticket, Plus, Minus, ShoppingCart, Check } from 'lucide-react';
import api from '@/lib/api';
import { toast } from '@/components/ui/toast';
import { useCart } from '@/components/CartContext';


interface EventTicket {
    name: string;
    description?: string;
    price: string | number;
    quantity: string | number;
    maxQuantity?: string | number;
    limitPerOrder?: string | number;
    remainingQuantity?: string | number;
    type: 'free' | 'paid';
    discounts?: { code: string; amount: string | number; type: 'percent' | 'fixed' }[];
    form_id?: string;
    form_title?: string;
}

interface TicketCheckoutProps {
    eventId: string;
    eventTitle: string;
    eventImage?: string; // Add optional image prop
    onCheckout?: (tickets: { [key: string]: number }, total: number) => void;
}

export const TicketCheckout: React.FC<TicketCheckoutProps> = (props) => {
    const { eventId, eventTitle, onCheckout } = props;
    const { addToCart, setIsCartOpen } = useCart();
    const [loading, setLoading] = useState(false);
    const [tickets, setTickets] = useState<EventTicket[]>([]);
    const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
    const [promoCode, setPromoCode] = useState('');
    const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; amount: number } | null>(null);

    // We need to track which tickets still need forms filled
    // const [ticketsNeedingForms, setTicketsNeedingForms] = useState<EventTicket[]>([]); // Removed for Add to Cart flow

    useEffect(() => {
        fetchEventTickets();
    }, [eventId]);

    const fetchEventTickets = async () => {
        try {
            const { data } = await api.get(`/events/${eventId}`);
            const eventTickets = data.tickets || [];
            setTickets(eventTickets);

            // Initialize quantities
            const initialQuantities: { [key: string]: number } = {};
            eventTickets.forEach((ticket: EventTicket, index: number) => {
                initialQuantities[`ticket_${index}`] = 0;
            });
            setQuantities(initialQuantities);
        } catch (error) {
            console.error('Error fetching event tickets:', error);
            toast.error('Failed to load tickets');
        }
    };

    const handleIncrement = (ticketKey: string, ticket: EventTicket) => {
        setQuantities(prev => {
            const currentQty = prev[ticketKey] || 0;
            const limit = ticket.limitPerOrder ? Number(ticket.limitPerOrder) : null;

            // Check order limit
            if (limit && currentQty >= limit) {
                toast.error(`Limit of ${limit} tickets per order reached`);
                return prev;
            }

            // Check total available stock
            if (ticket.quantity && currentQty >= Number(ticket.quantity)) {
                toast.error('No more tickets available');
                return prev;
            }

            return {
                ...prev,
                [ticketKey]: currentQty + 1,
            };
        });
    };

    const handleDecrement = (ticketKey: string) => {
        setQuantities(prev => ({
            ...prev,
            [ticketKey]: Math.max(0, (prev[ticketKey] || 0) - 1),
        }));
    };

    const applyPromoCode = () => {
        if (!promoCode.trim()) return;

        // Find if this code exists on ANY selected ticket
        let totalDiscountAmount = 0;
        let isValid = false;

        tickets.forEach((ticket, index) => {
            const qty = quantities[`ticket_${index}`] || 0;
            if (qty > 0 && ticket.discounts) {
                const discount = ticket.discounts.find(d => d.code.toUpperCase() === promoCode.toUpperCase().trim());
                if (discount) {
                    isValid = true;
                    // Calculate discount for this ticket line item
                    const price = Number(ticket.price);
                    let discountVal = 0;

                    if (discount.type === 'percent') {
                        discountVal = (price * (Number(discount.amount) / 100)) * qty;
                    } else {
                        discountVal = Number(discount.amount) * qty;
                    }
                    totalDiscountAmount += discountVal;
                }
            }
        });

        if (isValid) {
            setAppliedDiscount({ code: promoCode.toUpperCase(), amount: totalDiscountAmount });
            toast.success(`Promo code applied: -৳${totalDiscountAmount.toLocaleString()}`);
        } else {
            setAppliedDiscount(null);
            toast.error('Invalid promo code for selected tickets');
        }
    };

    const { totalQuantity, totalPrice, finalPrice } = useMemo(() => {
        let qty = 0;
        let price = 0;

        tickets.forEach((ticket, index) => {
            const count = quantities[`ticket_${index}`] || 0;
            qty += count;
            price += count * Number(ticket.price);
        });

        let discount = 0;
        if (appliedDiscount) {
            // Recalculate discount dynamically based on current quantities
            // This ensures if user changes qty after applying code, discount updates or stays valid
            // Ideally we re-run logic or keep simple
            // Let's re-run verify logic inside useMemo for robustness
            let dynamicDiscount = 0;
            let stillValid = false;
            tickets.forEach((ticket, index) => {
                const count = quantities[`ticket_${index}`] || 0;
                if (count > 0 && ticket.discounts) {
                    const d = ticket.discounts.find(dc => dc.code.toUpperCase() === appliedDiscount.code);
                    if (d) {
                        stillValid = true;
                        if (d.type === 'percent') {
                            dynamicDiscount += (Number(ticket.price) * (Number(d.amount) / 100)) * count;
                        } else {
                            dynamicDiscount += Number(d.amount) * count;
                        }
                    }
                }
            });
            if (stillValid) discount = dynamicDiscount;
        }

        return {
            totalQuantity: qty,
            totalPrice: price,
            finalPrice: Math.max(0, price - discount)
        };
    }, [quantities, tickets, appliedDiscount]);

    const handleAddToCart = () => {
        if (totalQuantity === 0) return;

        // Add each selected ticket to cart
        tickets.forEach((ticket, index) => {
            const quantity = quantities[`ticket_${index}`];
            if (quantity > 0) {
                // Calculate price with discount if applicable
                let itemPrice = Number(ticket.price);
                if (appliedDiscount && ticket.discounts) {
                    const d = ticket.discounts.find(dc => dc.code === appliedDiscount.code);
                    if (d) {
                        if (d.type === 'percent') {
                            itemPrice -= itemPrice * (Number(d.amount) / 100);
                        } else {
                            itemPrice -= Number(d.amount);
                        }
                    }
                }
                itemPrice = Math.max(0, itemPrice);

                addToCart({
                    id: `${eventId}_${ticket.name}`, // Create unique ID for the ticket item
                    name: `${eventTitle} - ${ticket.name}`,
                    price: itemPrice,
                    image: props.eventImage || '', // Use passed event image
                    quantity: quantity,
                    type: 'ticket',
                    eventId: eventId,
                    ticketType: ticket.name
                });
            }
        });

        toast.success(`Added ${totalQuantity} tickets to cart`);
        setIsCartOpen(true);

        // Reset local state
        const resetQuantities: { [key: string]: number } = {};
        tickets.forEach((_, index) => {
            resetQuantities[`ticket_${index}`] = 0;
        });
        setQuantities(resetQuantities);
        setAppliedDiscount(null);
        setPromoCode('');
    };

    if (tickets.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                <Ticket className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No tickets available for this event</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Select Tickets</h3>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                    <Ticket className="w-4 h-4" />
                    <span>{totalQuantity} selected</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {tickets.map((ticket, index) => {
                    const ticketKey = `ticket_${index}`;
                    const quantity = quantities[ticketKey] || 0;
                    const price = Number(ticket.price);
                    const subtotal = quantity * price;
                    const remaining = ticket.quantity ? Number(ticket.quantity) : null;
                    const limit = ticket.limitPerOrder ? Number(ticket.limitPerOrder) : null;

                    return (
                        <div
                            key={ticketKey}
                            className={`bg-white border-2 rounded-xl p-5 transition-all duration-300 ${quantity > 0
                                ? 'border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                                : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            {/* Ticket Header */}
                            <div className="mb-4">
                                <div className="flex items-start justify-between mb-2">
                                    <h4 className="text-lg font-bold uppercase tracking-tight">{ticket.name}</h4>
                                    {quantity > 0 && (
                                        <div className="bg-[#FA76FF] text-black text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                            <Check className="w-3 h-3" />
                                            {quantity}
                                        </div>
                                    )}
                                </div>
                                {ticket.description && (
                                    <p className="text-xs text-gray-500 mb-3">{ticket.description}</p>
                                )}
                                <div className="text-2xl font-bold text-black">
                                    {ticket.type === 'free' || price === 0 ? (
                                        <span className="text-green-600">FREE</span>
                                    ) : (
                                        <>
                                            ৳{price.toLocaleString()}
                                            <span className="text-sm font-normal text-gray-500">/ticket</span>
                                        </>
                                    )}
                                </div>
                                {remaining !== null && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        {remaining} tickets available
                                    </p>
                                )}
                                {limit && (
                                    <p className="text-xs text-orange-600 font-medium mt-1">
                                        Max {limit} per order
                                    </p>
                                )}
                            </div>

                            {/* Quantity Selector */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-2">
                                    <button
                                        onClick={() => handleDecrement(ticketKey)}
                                        disabled={quantity === 0}
                                        className="w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="text-lg font-bold min-w-[40px] text-center">{quantity}</span>
                                    <button
                                        onClick={() => handleIncrement(ticketKey, ticket)}
                                        disabled={(limit !== null && quantity >= limit) || (remaining !== null && quantity >= remaining)}
                                        className="w-8 h-8 flex items-center justify-center bg-black text-white border border-black rounded-md hover:bg-[#FA76FF] hover:text-black transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Subtotal */}
                                {quantity > 0 && (
                                    <div className="text-center text-sm">
                                        <span className="text-gray-500">Subtotal: </span>
                                        <span className="font-bold text-black">
                                            {price === 0 ? 'FREE' : `৳${subtotal.toLocaleString()}`}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Checkout Summary & Promo Code */}
            <div className="bg-gray-50 border-2 border-black rounded-xl p-6 space-y-6">

                {/* Promo Code Section - Only show if tickets selected */}
                {totalQuantity > 0 && (
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Have a promo code?"
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black uppercase text-sm font-medium"
                        />
                        <button
                            onClick={applyPromoCode}
                            className="px-4 py-2 bg-white border border-black text-black font-bold uppercase text-xs rounded-lg hover:bg-black hover:text-white transition-colors"
                        >
                            Apply
                        </button>
                    </div>
                )}

                <div className="space-y-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="text-lg font-bold uppercase">Subtotal</h4>
                        </div>
                        <div className="text-right">
                            <div className="text-lg font-medium text-gray-500">
                                ৳{totalPrice.toLocaleString()}
                            </div>
                        </div>
                    </div>
                    {appliedDiscount && (
                        <div className="flex items-center justify-between text-green-600">
                            <div>
                                <h4 className="text-sm font-bold uppercase flex items-center gap-1">
                                    <Check className="w-3 h-3" /> Code: {appliedDiscount.code}
                                </h4>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-bold">
                                    -৳{Math.round(totalPrice - finalPrice).toLocaleString()}
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-2">
                        <div>
                            <h4 className="text-xl font-black uppercase">Total</h4>
                            <p className="text-xs text-gray-500">{totalQuantity} ticket(s)</p>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-black text-black">
                                {finalPrice === 0 ? 'FREE' : `৳${Math.round(finalPrice).toLocaleString()}`}
                            </div>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleAddToCart}
                    disabled={totalQuantity === 0}
                    className={`w-full py-4 text-sm font-bold uppercase tracking-wider border-2 border-black rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${totalQuantity > 0
                        ? 'bg-black text-white hover:bg-[#FA76FF] hover:text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                >
                    <ShoppingCart className="w-5 h-5" />
                    {totalQuantity > 0 ? 'Add to Cart' : 'Select Tickets'}
                </button>

                {totalQuantity > 0 && (
                    <p className="text-xs text-center text-gray-500">
                        🔒 Secure checkout • {finalPrice === 0 ? 'Free registration' : 'Payment required at checkout'}
                    </p>
                )}
            </div>

            {/* Form Modal */}

        </div>
    );
};
