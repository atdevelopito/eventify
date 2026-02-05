import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Calendar, Users, QrCode, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function OrganizerBottomNav() {
    const location = useLocation();

    const navItems = [
        {
            icon: LayoutDashboard,
            label: "Home",
            path: "/organizer/dashboard",
        },
        {
            icon: Calendar,
            label: "Events",
            path: "/organizer/events",
        },
        {
            icon: QrCode,
            label: "Scan",
            path: "/organizer/scan",
            highlight: true,
        },
        {
            icon: Users,
            label: "Attendees",
            path: "/organizer/attendees",
        },
        {
            icon: User,
            label: "Profile",
            path: "/organizer/profile",
        },
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 z-50 px-6 pb-safe">
            <div className="flex items-center justify-between h-full">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;

                    if (item.highlight) {
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className="relative -top-5 flex flex-col items-center justify-center"
                            >
                                <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center shadow-lg shadow-black/20 transform transition-transform active:scale-95">
                                    <Icon className="w-6 h-6" />
                                </div>
                                <span className="text-[10px] font-medium mt-1 text-gray-500">
                                    {item.label}
                                </span>
                            </Link>
                        );
                    }

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 transition-colors relative px-2 py-1",
                                isActive ? "text-black" : "text-gray-400 hover:text-gray-600"
                            )}
                        >
                            <Icon className={cn("w-6 h-6", isActive && "fill-current")} />
                            {/* <span className="text-[10px] font-medium">{item.label}</span> */}
                            {isActive && (
                                <span className="absolute -bottom-2 w-1 h-1 rounded-full bg-black" />
                            )}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
