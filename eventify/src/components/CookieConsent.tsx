import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Cookie, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export const CookieConsent = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if user has already made a choice
        const consent = localStorage.getItem("cookie-consent");
        if (!consent) {
            // Show banner after a small delay for better UX
            const timer = setTimeout(() => setIsVisible(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem("cookie-consent", "true");
        setIsVisible(false);
    };

    const handleDecline = () => {
        localStorage.setItem("cookie-consent", "false");
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 animate-in slide-in-from-bottom-full duration-500">
            <div className="max-w-7xl mx-auto bg-background/95 backdrop-blur border border-border rounded-xl shadow-lg p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4">

                <div className="flex items-start gap-4 flex-1">
                    <div className="p-2 bg-primary/10 rounded-full flex-shrink-0">
                        <Cookie className="w-6 h-6 text-primary" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-semibold text-foreground">We use cookies</h3>
                        <p className="text-sm text-muted-foreground max-w-2xl">
                            We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic.
                            By clicking "Accept All", you consent to our use of cookies.
                            Read our <Link to="/cookies" className="text-primary hover:underline font-medium">Cookie Policy</Link>.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Button variant="outline" onClick={handleDecline} className="flex-1 md:flex-none">
                        Decline
                    </Button>
                    <Button onClick={handleAccept} className="flex-1 md:flex-none">
                        Accept All
                    </Button>
                    <button
                        onClick={() => setIsVisible(false)}
                        className="absolute top-2 right-2 md:static md:hidden text-muted-foreground hover:text-foreground"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

            </div>
        </div>
    );
};
