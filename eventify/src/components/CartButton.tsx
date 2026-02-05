import React from 'react';
import { useCart } from './CartContext';
import { ShoppingBag } from 'lucide-react';

export const CartButton: React.FC = () => {
    const { setIsCartOpen, totalItems } = useCart();

    return (
        <button
            onClick={() => setIsCartOpen(true)}
            className="fixed bottom-6 right-6 z-40 bg-black text-white p-3 rounded-full shadow-lg hover:bg-[#FA76FF] hover:text-black transition-all duration-300 group"
        >
            <div className="relative">
                <ShoppingBag className="w-6 h-6" />
                {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-[#FA76FF] text-black text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border border-black group-hover:bg-white">
                        {totalItems}
                    </span>
                )}
            </div>
        </button>
    );
};
