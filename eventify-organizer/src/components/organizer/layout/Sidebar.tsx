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
    Sparkles,
    MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
    collapsed: boolean;
    onToggle: () => void;
}

const navSections = [
    {
        label: "Main",
        items: [
            { title: "Overview", icon: LayoutDashboard, path: "/organizer" },
            { title: "Calendars", icon: Calendar, path: "/organizer/calendars" },
            { title: "Events", icon: CalendarDays, path: "/organizer/events" },
            { title: "Registrations", icon: FileText, path: "/organizer/registrations" },
        ]
    },
    {
        label: "Sales",
        items: [
            { title: "Tickets", icon: Ticket, path: "/organizer/tickets" },
            { title: "Scan Tickets", icon: Scan, path: "/organizer/scan" },
            { title: "Attendees", icon: Users, path: "/organizer/attendees" },
            { title: "Earnings", icon: DollarSign, path: "/organizer/earnings" },
        ]
    },
    {
        label: "Engagement",
        items: [
            { title: "Promotions", icon: Megaphone, path: "/organizer/promotions" },
            { title: "Reviews", icon: Star, path: "/organizer/reviews" },
            { title: "Merchandise", icon: ShoppingBag, path: "/organizer/merchandise" },
            { title: "Forms", icon: MessageSquare, path: "/organizer/forms" },
        ]
    },
    {
        label: "Settings",
        items: [
            { title: "Profile", icon: User, path: "/organizer/profile" },
            { title: "Management", icon: Settings, path: "/organizer/management" },
        ]
    }
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
    const location = useLocation();

    return (
        <motion.aside
            className={cn(
                "h-screen sticky top-0 bg-[#0c0c0e] border-r border-white/5 hidden md:flex flex-col z-40 overflow-hidden",
                "transition-all duration-500 ease-in-out",
                "fixed md:sticky",
                collapsed ? "-left-full md:left-0" : "left-0"
            )}
            animate={{ width: collapsed ? 80 : 260 }}
        >
            {/* Logo Area */}
            <div className="h-20 flex items-center px-6">
                <div className="flex items-center gap-3">
                    <div className="size-9 rounded-lg bg-indigo-600 flex items-center justify-center">
                        <Sparkles className="size-5 text-white" />
                    </div>
                    {!collapsed && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col"
                        >
                            <span className="font-bold text-base text-white leading-tight tracking-tight uppercase">
                                Organizer
                            </span>
                            <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-widest">
                                Dashboard
                            </span>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 px-3 space-y-7 overflow-y-auto overflow-x-hidden scrollbar-none">
                {navSections.map((section, idx) => (
                    <div key={idx} className="space-y-1">
                        {!collapsed && (
                            <h3 className="px-3 text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2">
                                {section.label}
                            </h3>
                        )}
                        <div className="space-y-0.5">
                            {section.items.map((item) => {
                                const isActive = item.path === "/organizer"
                                    ? location.pathname === "/organizer"
                                    : location.pathname.startsWith(item.path);

                                return (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        className={({ isActive: linkActive }) => cn(
                                            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                                            isActive
                                                ? "bg-white/10 text-white"
                                                : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
                                        )}
                                    >
                                        {/* Simple color indicator for active */}
                                        {isActive && (
                                            <motion.div
                                                layoutId="active-bar"
                                                className="absolute left-0 w-1 h-5 bg-indigo-500 rounded-r-full"
                                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                            />
                                        )}

                                        <item.icon className={cn(
                                            "w-5 h-5 flex-shrink-0 transition-colors",
                                            isActive ? "text-indigo-400" : "text-zinc-500 group-hover:text-zinc-300"
                                        )} />

                                        {!collapsed && (
                                            <motion.span
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="truncate"
                                            >
                                                {item.title}
                                            </motion.span>
                                        )}
                                    </NavLink>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Bottom Section */}
            <div className="p-4 border-t border-white/5">
                <button
                    onClick={onToggle}
                    className={cn(
                        "w-full flex items-center justify-center gap-2 h-10 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200",
                        "bg-zinc-900 text-zinc-500 hover:text-white hover:bg-zinc-800 border border-white/5"
                    )}
                >
                    {collapsed ? (
                        <ChevronRight className="w-4 h-4" />
                    ) : (
                        <>
                            <ChevronLeft className="w-4 h-4" />
                            <span>Collapse</span>
                        </>
                    )}
                </button>
            </div>
        </motion.aside>
    );
}
