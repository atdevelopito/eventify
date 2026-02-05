import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, Ticket, User } from 'lucide-react';
import { useRole } from './RoleContext';

export const BottomNav = () => {
    const location = useLocation();
    const { user } = useRole();

    const isActive = (path: string) => location.pathname === path;

    const navItems = [
        {
            label: 'Home',
            path: '/',
            icon: Home
        },
        {
            label: 'Events',
            path: '/discover',
            icon: Calendar
        },
        {
            label: 'Tickipass',
            path: '/my-tickets',
            icon: Ticket
        },
        {
            label: 'Profile',
            path: user ? '/dashboard' : '/auth',
            icon: User
        }
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 rounded-t-2xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] pb-safe">
            <div className="flex items-center justify-around p-3">
                {navItems.map((item) => {
                    const active = isActive(item.path);
                    return (
                        <Link
                            key={item.label}
                            to={item.path}
                            className={`flex flex-col items-center gap-1 min-w-[64px] transition-colors ${active ? 'text-[#E85A6B]' : 'text-black font-medium'
                                }`}
                        >
                            <item.icon
                                className={`w-6 h-6 ${active ? 'fill-current' : ''}`}
                                strokeWidth={active ? 2.5 : 2}
                            />
                            <span className="text-[10px] font-bold">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};
