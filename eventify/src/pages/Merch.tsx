import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { CartDrawer } from "@/components/CartDrawer";
import { CartButton } from "@/components/CartButton";
import { useCart } from "@/components/CartContext";
import { ProductDetailModal } from "@/components/ProductDetailModal";
import { ShoppingBag, Star, Heart, ArrowRight } from "lucide-react";

const merchItems = [
    {
        id: 1,
        name: "Eventify Classic Tee",
        price: 29.99,
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
        category: "Apparel",
        isNew: true,
        rating: 4.8,
    },
    {
        id: 2,
        name: "Event Crew Hoodie",
        price: 59.99,
        image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop",
        category: "Apparel",
        isNew: false,
        rating: 4.9,
    },
    {
        id: 3,
        name: "Festival Cap",
        price: 24.99,
        image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&h=400&fit=crop",
        category: "Accessories",
        isNew: true,
        rating: 4.7,
    },
    {
        id: 4,
        name: "Eventify Tote Bag",
        price: 19.99,
        image: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&h=400&fit=crop",
        category: "Accessories",
        isNew: false,
        rating: 4.6,
    },
    {
        id: 5,
        name: "Limited Edition Poster",
        price: 14.99,
        image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=400&fit=crop",
        category: "Prints",
        isNew: true,
        rating: 4.9,
    },
    {
        id: 6,
        name: "Sticker Pack",
        price: 9.99,
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
        category: "Accessories",
        isNew: false,
        rating: 4.5,
    },
];

const categories = ["All", "Apparel", "Accessories", "Prints"];

const Merch = () => {
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [favorites, setFavorites] = useState<number[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<typeof merchItems[0] | null>(null);
    const { addToCart } = useCart();

    const filteredItems = selectedCategory === "All"
        ? merchItems
        : merchItems.filter(item => item.category === selectedCategory);

    const toggleFavorite = (id: number) => {
        setFavorites(prev =>
            prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
        );
    };

    return (
        <div className="min-h-screen bg-white">
            <SEOHead
                title="Merch | Eventify"
                description="Shop exclusive Eventify merchandise. Tees, hoodies, accessories and more."
            />
            <div className="animate-fade-in" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
                <Navbar />
            </div>

            {/* Hero Section */}
            <section className="pt-32 md:pt-40 lg:pt-48 pb-6 md:pb-16 lg:pb-24 px-4 md:px-8">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium mb-6 md:mb-10 flex flex-col items-center justify-center gap-2 md:gap-4">
                        <div className="flex items-center gap-2 md:gap-4 flex-wrap justify-center">
                            <span className="border border-black px-4 py-2 md:px-6 md:py-4 bg-white animate-fade-in" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>Official</span>
                            <span className="bg-[#E85A6B] border border-black px-4 py-2 md:px-6 md:py-4 rounded-full animate-fade-in" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>merch</span>
                        </div>
                        <div className="flex items-center justify-center">
                            <span className="border border-black px-4 py-2 md:px-6 md:py-4 bg-white animate-fade-in" style={{ animationDelay: '0.5s', animationFillMode: 'both' }}>store</span>
                        </div>
                    </h1>
                    <p className="text-sm md:text-base lg:text-[18px] text-black max-w-2xl mx-auto animate-fade-in px-4" style={{ animationDelay: '0.7s', animationFillMode: 'both' }}>
                        Premium quality merchandise for event enthusiasts. Limited drops, timeless designs.
                    </p>
                </div>
            </section>

            {/* Category Filters */}
            <section className="px-4 md:px-8 py-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-wrap justify-center gap-3">
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-4 md:px-6 py-2 md:py-3 text-sm md:text-base font-medium transition-all duration-300 border border-black rounded-full ${selectedCategory === category
                                    ? "bg-black text-white"
                                    : "bg-white text-black hover:bg-black hover:text-white"
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Products Grid */}
            <section className="px-4 md:px-8 py-12 md:py-16">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredItems.map((item, index) => (
                            <div
                                key={item.id}
                                onClick={() => setSelectedProduct(item)}
                                className="group relative bg-white border border-black overflow-hidden transition-all duration-300 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-fade-in cursor-pointer rounded-xl"
                                style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'both' }}
                            >
                                {/* Image */}
                                <div className="relative aspect-square overflow-hidden">
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />

                                    {/* Badges */}
                                    {item.isNew && (
                                        <div className="absolute top-4 left-4 bg-[#E85A6B] text-black px-3 py-1 text-xs font-bold border border-black rounded-md">
                                            NEW
                                        </div>
                                    )}

                                    {/* Favorite Button */}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); toggleFavorite(item.id); }}
                                        className={`absolute top-4 right-4 w-10 h-10 border border-black flex items-center justify-center transition-all duration-300 rounded-full ${favorites.includes(item.id)
                                            ? "bg-[#E85A6B]"
                                            : "bg-white hover:bg-[#E85A6B]"
                                            }`}
                                    >
                                        <Heart className={`w-4 h-4 ${favorites.includes(item.id) ? "fill-black" : ""}`} />
                                    </button>

                                    {/* Quick Add */}
                                    <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); addToCart({ id: item.id, name: item.name, price: item.price, image: item.image }); }}
                                            className="w-full bg-black text-white py-3 text-sm font-medium flex items-center justify-center gap-2 hover:bg-[#E85A6B] hover:text-black transition-colors border border-black rounded-lg"
                                        >
                                            <ShoppingBag className="w-4 h-4" />
                                            Add to Cart
                                        </button>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-5 border-t border-black">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                            {item.category}
                                        </span>
                                        <span className="flex items-center gap-1 text-xs">
                                            <Star className="w-3 h-3 fill-[#E85A6B] text-[#E85A6B]" />
                                            {item.rating}
                                        </span>
                                    </div>
                                    <h3 className="text-base font-medium mb-2">{item.name}</h3>
                                    <p className="text-lg font-bold">${item.price.toFixed(2)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="px-4 md:px-8 py-12 md:py-20 bg-muted/30">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-2xl md:text-3xl font-medium mb-4">Want Custom Event Merch?</h2>
                    <p className="text-muted-foreground max-w-xl mx-auto mb-8">
                        We create exclusive merchandise for events. Get in touch to discuss your custom order.
                    </p>
                    <a
                        href="/contact"
                        className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 font-medium hover:bg-[#E85A6B] hover:text-black transition-colors border border-black rounded-lg"
                    >
                        Contact Us
                        <ArrowRight className="w-4 h-4" />
                    </a>
                </div>
            </section>

            <Footer />
            <CartButton />
            <CartDrawer />

            <ProductDetailModal
                product={selectedProduct}
                isOpen={!!selectedProduct}
                onClose={() => setSelectedProduct(null)}
                isFavorite={selectedProduct ? favorites.includes(selectedProduct.id) : false}
                onToggleFavorite={toggleFavorite}
            />
        </div>
    );
};

export default Merch;
