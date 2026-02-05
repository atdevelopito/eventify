import { useNavigate, useLocation } from "react-router-dom";
import { Home, Compass, ShoppingBag, User, Ticket } from "lucide-react";
import { useRole } from "./RoleContext";

export const MobileBottomNav = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useRole();

    const isActive = (path: string) => location.pathname === path;

    // Don't show on specific pages if needed (e.g., auth)
    if (location.pathname === '/auth') return null;

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border rounded-t-2xl shadow-[0_-5px_10px_rgba(0,0,0,0.05)] pb-1">
            <div className="flex items-center justify-around py-2">
                <button
                    onClick={() => navigate("/")}
                    className={`flex flex-col items-center justify-center p-1 rounded-lg transition-all duration-300 w-full ${isActive("/") ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`}
                >
                    <Home className={`w-6 h-6 ${isActive("/") ? "fill-current" : ""}`} />
                    <span className="text-[10px] font-medium leading-none mt-1">Home</span>
                </button>

                <button
                    onClick={() => navigate("/discover")}
                    className={`flex flex-col items-center justify-center p-1 rounded-lg transition-all duration-300 w-full ${isActive("/discover") ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`}
                >
                    <Compass className={`w-6 h-6 ${isActive("/discover") ? "fill-current" : ""}`} />
                    <span className="text-[10px] font-medium leading-none mt-1">Discover</span>
                </button>

                <button
                    onClick={() => navigate("/merch")}
                    className={`flex flex-col items-center justify-center p-1 rounded-lg transition-all duration-300 w-full ${isActive("/merch") ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`}
                >
                    <ShoppingBag className={`w-6 h-6 ${isActive("/merch") ? "fill-current" : ""}`} />
                    <span className="text-[10px] font-medium leading-none mt-1">Merch</span>
                </button>

                {user ? (
                    <button
                        onClick={() => navigate("/my-tickets")}
                        className={`flex flex-col items-center justify-center p-1 rounded-lg transition-all duration-300 w-full ${isActive("/my-tickets") ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`}
                    >
                        <Ticket className={`w-6 h-6 ${isActive("/my-tickets") ? "fill-current" : ""}`} />
                        <span className="text-[10px] font-medium leading-none mt-1">Tickets</span>
                    </button>
                ) : (
                    <button
                        onClick={() => navigate("/auth")}
                        className={`flex flex-col items-center justify-center p-1 rounded-lg transition-all duration-300 w-full ${isActive("/auth") ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`}
                    >
                        <User className={`w-6 h-6 ${isActive("/auth") ? "fill-current" : ""}`} />
                        <span className="text-[10px] font-medium leading-none mt-1">Sign In</span>
                    </button>
                )}
            </div>
        </div>
    );
};
