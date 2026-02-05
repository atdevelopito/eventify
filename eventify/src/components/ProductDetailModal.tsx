import React from 'react';
import { X, Heart, ShoppingBag, Star } from 'lucide-react';
import { useCart } from './CartContext';

interface Product {
    id: number;
    name: string;
    price: number;
    image: string;
    category: string;
    rating: number;
    description?: string;
}

interface ProductDetailModalProps {
    product: Product | null;
    isOpen: boolean;
    onClose: () => void;
    isFavorite: boolean;
    onToggleFavorite: (id: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
    product,
    isOpen,
    onClose,
    isFavorite,
    onToggleFavorite
}) => {
    const { addToCart } = useCart();

    if (!isOpen || !product) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            <div className="relative w-full max-w-4xl bg-white border border-black shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col md:flex-row max-h-[90vh]">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full border border-black hover:bg-black hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Image */}
                <div className="w-full md:w-1/2 bg-gray-100 relative">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Details */}
                <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col overflow-y-auto bg-white">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground border border-black px-2 py-0.5 rounded-full">
                            {product.category}
                        </span>
                        <div className="flex items-center gap-1 text-sm bg-black text-white px-2 py-0.5">
                            <Star className="w-3 h-3 fill-[#FA76FF] text-[#FA76FF]" />
                            {product.rating}
                        </div>
                    </div>

                    <h2 className="text-3xl font-bold mb-2">{product.name}</h2>
                    <p className="text-2xl font-medium text-[#FA76FF] mb-6">${product.price.toFixed(2)}</p>

                    <p className="text-gray-600 mb-8 leading-relaxed">
                        {product.description || "Experience premium quality with this exclusive event merchandise. Made from high-quality materials designed for comfort and durability. Perfect for any event enthusiast."}
                    </p>

                    <div className="mt-auto space-y-4">
                        <button
                            onClick={() => {
                                addToCart({ id: product.id, name: product.name, price: product.price, image: product.image });
                                onClose();
                            }}
                            className="w-full bg-black text-white py-4 text-base font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#FA76FF] hover:text-black transition-colors border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                        >
                            <ShoppingBag className="w-5 h-5" />
                            Add to Cart
                        </button>

                        <button
                            onClick={() => onToggleFavorite(product.id)}
                            className={`w-full py-4 text-base font-bold uppercase tracking-wider flex items-center justify-center gap-2 border border-black transition-colors ${isFavorite
                                    ? "bg-pink-100 text-pink-600"
                                    : "bg-white hover:bg-gray-50"
                                }`}
                        >
                            <Heart className={`w-5 h-5 ${isFavorite ? "fill-pink-600" : ""}`} />
                            {isFavorite ? "Saved to Favorites" : "Save to Favorites"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
