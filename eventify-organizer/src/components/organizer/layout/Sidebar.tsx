import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
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
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
    collapsed: boolean;
    onToggle: () => void;
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

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
    const location = useLocation();

    return (
        <motion.aside
            className={cn(
                "h-screen sticky top-0 bg-white border-r border-gray-200 flex flex-col z-40",
                "transition-all duration-300 ease-in-out",
                // Mobile: fixed overlay, hidden by default
                "fixed md:sticky",
                collapsed ? "-left-full md:left-0" : "left-0"
            )}
            animate={{ width: collapsed ? 72 : 260 }}
        >
            {/* Logo */}
            <div className="h-16 flex items-center px-6 border-b border-gray-200">
                <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
                    <span className="font-bold text-lg text-black uppercase tracking-wide">
                        {collapsed ? "O" : "Organizer"}
                    </span>
                    {!collapsed && <span className="text-xs text-gray-500 font-normal ml-1">Dashboard</span>}
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
                {navItems.map((item) => {
                    // Check if current path starts with item path (for nested routes)
                    // But handle root /organizer differently to avoid matching everything
                    const isActive = item.path === "/organizer"
                        ? location.pathname === "/organizer"
                        : location.pathname.startsWith(item.path);

                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive: linkActive }) => cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                                isActive
                                    ? "bg-[#E85A6B] text-white shadow-md shadow-[#E85A6B]/20"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-black"
                            )}
                        >
                            <item.icon className={cn("w-5 h-5 flex-shrink-0 transition-colors", isActive ? "text-white" : "text-gray-400 group-hover:text-black")} />
                            {!collapsed && (
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="truncate"
                                >
                                    {item.title}
                                </motion.span>
                            )}
                            {collapsed && isActive && (
                                <div className="absolute left-full ml-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-50 pointer-events-none">
                                    {item.title}
                                </div>
                            )}
                        </NavLink>
                    );
                })}
            </nav>

            {/* Collapse Button */}
            <div className="p-3 border-t border-gray-200 bg-gray-50/50">
                <button
                    onClick={onToggle}
                    className={cn(
                        "w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium",
                        "text-gray-600 hover:bg-white hover:text-black hover:shadow-sm border border-transparent hover:border-gray-200",
                        "transition-all duration-200"
                    )}
                >
                    {collapsed ? (
                        <ChevronRight className="w-4 h-4" />
                    ) : (
                        <>
                            <ChevronLeft className="w-4 h-4" />
                            <span>Collapse Sidebar</span>
                        </>
                    )}
                </button>
            </div>
        </motion.aside>
    );
}
