import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, ArrowLeft, LayoutDashboard, Menu as MenuIcon } from 'lucide-react';
import { cn } from "@/lib/utils";
import { OrganizerMobileMenu } from './OrganizerMobileMenu';

const NavLink = ({ to, children, isActive }: { to: string; children: React.ReactNode; isActive: boolean }) => (
    <Link
        to={to}
        className={cn(
            "text-sm font-semibold transition-colors duration-200 font-sans tracking-wide flex items-center gap-2",
            isActive ? 'text-black' : 'text-gray-500 hover:text-black'
        )}
    >
        {children}
    </Link>
);

export const OrganizerNavbar: React.FC = () => {
    const [scrolled, setScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSignOut = () => {
        localStorage.removeItem('organizerToken');
        window.location.href = '/organizer/login';
    };

    return (
        <>
            <style>{`
                @media (max-width: 768px) {
                    .desktop-only-section {
                        display: none !important;
                    }
                    .mobile-only-section {
                        display: flex !important;
                    }
                }
                @media (min-width: 769px) {
                    .desktop-only-section {
                        display: flex !important;
                    }
                    .mobile-only-section {
                        display: none !important;
                    }
                }
            `}</style>

            <nav
                className={cn(
                    "fixed top-0 left-0 right-0 z-[40] transition-all duration-500 ease-in-out font-sans border-b border-gray-100",
                    scrolled
                        ? 'py-4 bg-white/95 backdrop-blur-xl shadow-sm'
                        : 'py-4 bg-white'
                )}
            >
                <div className="max-w-[1600px] mx-auto px-6 lg:px-12 flex items-center justify-between">

                    {/* Mobile: Hamburger + Logo */}
                    <div className="mobile-only-section items-center gap-4 w-full justify-between" style={{ display: 'none' }}>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setIsMobileMenuOpen(true)}
                                className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-900"
                            >
                                <MenuIcon className="w-6 h-6" />
                            </button>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center">
                                    <LayoutDashboard className="w-5 h-5" />
                                </div>
                                <span className="font-bold text-lg tracking-tight">Organizer</span>
                            </div>
                        </div>
                    </div>

                    {/* Desktop Logo */}
                    <div className="desktop-only-section items-center gap-3" style={{ display: 'none' }}>
                        <div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center">
                            <LayoutDashboard className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-lg tracking-tight">Eventify Organizer</span>
                    </div>

                    {/* Center: Links (Desktop Only) */}
                    <div className="desktop-only-section items-center gap-8" style={{ display: 'none' }}>
                        <NavLink to="/organizer/dashboard" isActive={location.pathname === '/organizer/dashboard'}>
                            <LayoutDashboard className="w-4 h-4" />
                            <span className="whitespace-nowrap">Dashboard</span>
                        </NavLink>
                    </div>

                    {/* Right: Actions (Desktop Only) */}
                    <div className="desktop-only-section items-center gap-6" style={{ display: 'none' }}>
                        <button
                            onClick={handleSignOut}
                            className="text-sm font-semibold text-gray-500 hover:text-red-600 transition-colors flex items-center gap-2 whitespace-nowrap"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Sign Out</span>
                        </button>

                        <div className="h-6 w-px bg-gray-200" />

                        <a
                            href="http://localhost:5173"
                            className="text-sm font-semibold text-gray-900 hover:text-[#E85A6B] transition-colors flex items-center gap-2 whitespace-nowrap"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back to Main Site</span>
                        </a>
                    </div>

                </div>
            </nav>

            <OrganizerMobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
        </>
    );
};
