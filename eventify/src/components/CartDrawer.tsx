import React from 'react';
import { useCart } from './CartContext';
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';

import { Link } from 'react-router-dom';
import { getImageUrl } from '@/lib/utils';

export const CartDrawer: React.FC = () => {
    const { isCartOpen, setIsCartOpen, items, removeFromCart, updateQuantity, totalPrice } = useCart();

    if (!isCartOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={() => setIsCartOpen(false)}
            />

            {/* Drawer */}
            <div className="relative w-full max-w-md h-full bg-background border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5" />
                        Your Cart
                    </h2>
                    <button
                        onClick={() => setIsCartOpen(false)}
                        className="p-2 hover:bg-muted rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {items.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                            <ShoppingBag className="w-12 h-12 mb-4 opacity-50" />
                            <p>Your cart is empty</p>
                            <button
                                onClick={() => setIsCartOpen(false)}
                                className="mt-4 px-6 py-2 bg-foreground text-background font-bold rounded-full hover:bg-foreground/90"
                            >
                                Start Shopping
                            </button>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div key={`${item.id}-${item.size}`} className="flex gap-4 p-3 border border-border rounded-lg bg-card">
                                <div className="w-20 h-20 bg-muted rounded-md overflow-hidden flex-shrink-0">
                                    <img
                                        src={item.image ? getImageUrl(item.image) : "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=60"}
                                        alt={item.name}
                                        onError={(e) => {
                                            e.currentTarget.src = "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=60";
                                        }}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <h3 className="font-medium line-clamp-1">{item.name}</h3>
                                        <p className="text-sm text-muted-foreground">BDT {item.price.toFixed(2)}</p>
                                    </div>
                                    <div className="flex items-center justify-between mt-2">
                                        <div className="flex items-center border border-border rounded-md">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="p-1 hover:bg-muted"
                                            >
                                                <Minus className="w-3 h-3" />
                                            </button>
                                            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="p-1 hover:bg-muted"
                                            >
                                                <Plus className="w-3 h-3" />
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="text-destructive hover:text-destructive/80 p-1"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {items.length > 0 && (
                    <div className="p-4 border-t border-border bg-muted/20">
                        <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>BDT {totalPrice.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold">
                                <span>Total</span>
                                <span>BDT {totalPrice.toFixed(2)}</span>
                            </div>
                        </div>
                        <Link
                            to="/checkout"
                            onClick={() => setIsCartOpen(false)}
                            className="w-full py-3 bg-black text-white border border-black font-bold text-sm uppercase hover:bg-gray-800 transition-colors block text-center"
                        >
                            Proceed to Checkout
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};
