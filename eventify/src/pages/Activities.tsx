import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { FlipWords } from "@/components/ui/flip-words";
import { Timer } from "lucide-react";

const Activities = () => {
    return (
        <div className="min-h-screen bg-white flex flex-col">
            <SEOHead
                title="Activities | Eventify"
                description="Discover exciting activities and events happening near you."
            />
            <Navbar />

            <div className="flex-1 flex flex-col items-center justify-center px-4 text-center py-20">
                <div className="bg-black/5 p-6 rounded-full mb-8 animate-pulse">
                    <Timer className="w-12 h-12 md:w-16 md:h-16 text-black" />
                </div>

                <h1 className="text-4xl md:text-6xl font-bold mb-6">
                    Activities are <br className="md:hidden" />
                    <span className="text-[#E85A6B]">
                        <FlipWords words={["Coming Soon", "Launching Soon", "In The Works"]} className="text-[#E85A6B] px-0" />
                    </span>
                </h1>

                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
                    We're curating a collection of unique local experiences just for you.
                    From workshops to outdoor adventures, get ready to discover something new.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                    <input
                        type="email"
                        placeholder="Enter your email for updates"
                        className="flex-1 px-4 py-3 rounded-lg border border-black focus:ring-2 focus:ring-[#E85A6B] outline-none"
                    />
                    <button className="bg-black text-white px-8 py-3 rounded-lg font-bold hover:bg-[#E85A6B] transition-colors">
                        Notify Me
                    </button>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default Activities;
