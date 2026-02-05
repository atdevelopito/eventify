import { AnimatePresence, motion } from "framer-motion";
import {
    LayoutDashboard,
    Calendar,
    CalendarDays,
    Users,
    Ticket,
    Scan,
    Megaphone,
    DollarSign,
    Star,
    ShoppingBag,
    FileText,
    User,
    Settings,
    LogOut,
    ArrowLeft,
    X,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { createPortal } from "react-dom";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

const navItems = [
    { title: "Overview", icon: LayoutDashboard, path: "/organizer" },
    { title: "Calendars", icon: Calendar, path: "/organizer/calendars" },
    { title: "Events", icon: CalendarDays, path: "/organizer/events" },
    { title: "Registrations", icon: FileText, path: "/organizer/registrations" },
    { title: "Tickets", icon: Ticket, path: "/organizer/tickets" },
    { title: "Scan Tickets", icon: Scan, path: "/organizer/scan" },
    { title: "Attendees", icon: Users, path: "/organizer/attendees" },
    { title: "Promotions", icon: Megaphone, path: "/organizer/promotions" },
    { title: "Earnings & Payouts", icon: DollarSign, path: "/organizer/earnings" },
    { title: "Reviews", icon: Star, path: "/organizer/reviews" },
    { title: "Merchandise", icon: ShoppingBag, path: "/organizer/merchandise" },
    { title: "Forms", icon: FileText, path: "/organizer/forms" },
    { title: "Profile", icon: User, path: "/organizer/profile" },
    { title: "Management", icon: Settings, path: "/organizer/management" },
];

export const OrganizerMobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
    const location = useLocation();

    // Prevent body scroll when menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleSignOut = () => {
        localStorage.removeItem('organizerToken');
        onClose();
        window.location.href = '/organizer/login';
    };

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] bg-black/20 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="absolute top-0 left-0 bottom-0 w-[280px] bg-white shadow-2xl flex flex-col h-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center">
                                    <LayoutDashboard className="w-5 h-5" />
                                </div>
                                <span className="font-bold text-lg tracking-tight">Organizer</span>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 -mr-2 rounded-full hover:bg-gray-100 text-gray-500"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Scrollable Links */}
                        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 scrollbar-thin scrollbar-thumb-gray-200">
                            {navItems.map((item) => {
                                const isActive = item.path === "/organizer"
                                    ? location.pathname === "/organizer"
                                    : location.pathname.startsWith(item.path);

                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={onClose}
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors",
                                            isActive
                                                ? "bg-[#E85A6B] text-white"
                                                : "text-gray-600 hover:bg-gray-50 hover:text-black"
                                        )}
                                    >
                                        <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-gray-400")} />
                                        {item.title}
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Footer Actions */}
                        <div className="p-4 border-t border-gray-100 bg-gray-50/50 space-y-2">
                            <a
                                href="http://localhost:5173"
                                className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-white hover:shadow-sm"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                Back to Main Site
                            </a>
                            <button
                                onClick={handleSignOut}
                                className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                            >
                                <LogOut className="w-5 h-5" />
                                Sign Out
                            </button>
                        </div>

                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
};
