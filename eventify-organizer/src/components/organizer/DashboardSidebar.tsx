import React from 'react';
import {
    BarChart3,
    Calendar,
    Ticket,
    Users,
    TrendingUp,
    ShoppingBag,
    User,
    LayoutDashboard,
    Megaphone, // Promotions
    DollarSign, // Payouts/Earnings
    Star, // Reviews
    Settings, // Management
    CalendarDays, // Calendars
    ClipboardList // Forms
} from 'lucide-react';
import { SidebarCalendar } from './SidebarCalendar';

interface SidebarItem {
    id: string;
    label: string;
    icon: React.ElementType;
}

interface DashboardSidebarProps {
    activeSection: string;
    onSelectSection: (section: string) => void;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ activeSection, onSelectSection }) => {
    const items: SidebarItem[] = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'calendar', label: 'Calendars', icon: CalendarDays },
        { id: 'events', label: 'Events', icon: Calendar },
        { id: 'registrations', label: 'Registrations', icon: Users },
        { id: 'tickets', label: 'Tickets', icon: Ticket },
        { id: 'users', label: 'Attendees', icon: User },
        { id: 'promotions', label: 'Promotions', icon: Megaphone },
        { id: 'earnings', label: 'Earnings & Payouts', icon: DollarSign },
        { id: 'reviews', label: 'Reviews', icon: Star },
        { id: 'merchandise', label: 'Merchandise', icon: ShoppingBag },
        { id: 'forms', label: 'Forms', icon: ClipboardList },
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'management', label: 'Management', icon: Settings },
    ];

    return (
        <div className="flex flex-col w-64 bg-white border-r border-gray-200 min-h-screen pt-8 pb-10 sticky top-0 h-screen overflow-y-auto">
            <div className="px-6 mb-8">
                <h2 className="text-xl font-bold text-black uppercase tracking-tighter">
                    Organizer
                </h2>
                <p className="text-xs text-black/50 font-medium">EVENT DASHBOARD</p>
            </div>

            <nav className="flex-1 px-4 space-y-2">
                {items.map((item) => {
                    const isActive = activeSection === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onSelectSection(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-lg transition-all duration-300 ${isActive
                                ? 'bg-[#E85A6B] text-white shadow-[0_0_15px_rgba(191,18,77,0.4)]'
                                : 'text-black/60 hover:bg-black/5 hover:text-black'
                                }`}
                        >
                            <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-black/40'}`} />
                            {item.label}
                        </button>
                    );
                })}
            </nav>

            {/* Sidebar Calendar Widget */}
            <div className="px-4">
                <div className="rounded-xl border border-black/10 overflow-hidden bg-white">
                    <SidebarCalendar />
                </div>
            </div>

            <div className="p-4 mt-auto">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <p className="text-xs font-medium mb-1 text-black">Pass Verification</p>
                    <p className="text-[10px] text-black/50">Scan tickets via mobile app</p>
                </div>
            </div>
        </div>
    );
};
