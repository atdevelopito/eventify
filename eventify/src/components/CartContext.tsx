import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
    id: number | string;
    name: string;
    price: number;
    image: string;
    quantity: number;
    size?: string;
    type?: string;
    eventId?: string;
    ticketType?: string;
}

interface CartContextType {
    items: CartItem[];
    addToCart: (product: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
    removeFromCart: (id: number | string) => void;
    updateQuantity: (id: number | string, quantity: number) => void;
    clearCart: () => void;
    isCartOpen: boolean;
    setIsCartOpen: (open: boolean) => void;
    totalItems: number;
    totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Load cart from local storage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('eventure-cart');
        if (savedCart) {
            try {
                setItems(JSON.parse(savedCart));
            } catch (e) {
                console.error('Failed to parse cart', e);
            }
        }
    }, []);

    // Save to local storage on change
    useEffect(() => {
        localStorage.setItem('eventure-cart', JSON.stringify(items));
    }, [items]);

    const addToCart = (product: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
        setItems(prev => {
            const existing = prev.find(item => item.id === product.id && item.size === product.size);
            const qtyToAdd = product.quantity || 1;

            if (existing) {
                return prev.map(item =>
                    (item.id === product.id && item.size === product.size)
                        ? { ...item, ...product, quantity: item.quantity + qtyToAdd }
                        : item
                );
            }
            return [...prev, { ...product, quantity: qtyToAdd }];
        });
        setIsCartOpen(true);
    };

    const removeFromCart = (id: number | string) => {
        setItems(prev => prev.filter(item => item.id !== id));
    };

    const updateQuantity = (id: number | string, quantity: number) => {
        if (quantity < 1) {
            removeFromCart(id);
            return;
        }
        setItems(prev => prev.map(item => item.id === id ? { ...item, quantity } : item));
    };

    const clearCart = () => setItems([]);

    const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
    const totalPrice = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    return (
        <CartContext.Provider value={{
            items,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            isCartOpen,
            setIsCartOpen,
            totalItems,
            totalPrice
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
