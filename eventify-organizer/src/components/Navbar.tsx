import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowLeft, LayoutDashboard, UserPlus, LogOut, Menu, X } from 'lucide-react';
import { useRole } from './RoleContext';
import { AnimatePresence, motion } from 'framer-motion';

export const Navbar = () => {
    const { user, isOrganizer, isVerified, signOut } = useRole();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Reliable mobile detection
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        // Initial check
        checkMobile();

        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleSignOut = () => {
        signOut();
        navigate('/login');
        setIsMobileMenuOpen(false);
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-black/5 py-4">
            <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2">
                    <div className="size-8 rounded-lg bg-black text-white flex items-center justify-center">
                        <Sparkles className="size-4" />
                    </div>
                    <span className="font-semibold text-lg">Eventify Organizer</span>
                </Link>

                {/* Mobile Hamburger - Only rendered on mobile */}
                {isMobile && (
                    <button
                        className="p-2 -mr-2 rounded-full hover:bg-gray-100"
                        onClick={() => setIsMobileMenuOpen(true)}
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                )}

                {/* Desktop Menu - Only rendered on desktop */}
                {!isMobile && (
                    <div className="flex items-center gap-4">
                        {user ? (
                            <>
                                {/* Dashboard Link Logic */}
                                {isOrganizer ? (
                                    <Link
                                        to="/organizer"
                                        className="flex items-center gap-2 text-sm font-medium hover:text-black text-gray-600 transition-colors"
                                    >
                                        <LayoutDashboard className="w-4 h-4" />
                                        Dashboard
                                    </Link>
                                ) : isVerified ? (
                                    <Link
                                        to="/verification"
                                        className="flex items-center gap-2 text-sm font-medium hover:text-black text-gray-600 transition-colors"
                                    >
                                        <UserPlus className="w-4 h-4" />
                                        Complete Setup
                                    </Link>
                                ) : (
                                    <Link
                                        to="/verify"
                                        className="flex items-center gap-2 text-sm font-medium hover:text-black text-gray-600 transition-colors"
                                    >
                                        <UserPlus className="w-4 h-4" />
                                        Verify Email
                                    </Link>
                                )}

                                <button
                                    onClick={handleSignOut}
                                    className="text-sm font-medium hover:text-red-600 text-gray-600 transition-colors flex items-center gap-2"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Sign Out
                                </button>
                            </>
                        ) : (
                            <Link
                                to="/login"
                                className="text-sm font-medium hover:text-black text-gray-600 transition-colors"
                            >
                                Log In
                            </Link>
                        )}

                        <a
                            href="https://eventify.fun"
                            className="text-sm font-medium hover:text-gray-600 flex items-center gap-2 transition-colors pl-4 border-l border-gray-200"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Main Site
                        </a>
                    </div>
                )}
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobile && isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 right-0 bg-white border-b border-black/5 shadow-xl p-4 flex flex-col gap-4"
                        style={{ maxHeight: '80vh', overflowY: 'auto' }}
                    >
                        {user ? (
                            <>
                                {isOrganizer ? (
                                    <Link to="/organizer" className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg text-gray-900 font-medium">
                                        <LayoutDashboard className="w-4 h-4" /> Dashboard
                                    </Link>
                                ) : (
                                    <Link to="/verification" className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg text-gray-900 font-medium">
                                        <UserPlus className="w-4 h-4" /> Complete Setup
                                    </Link>
                                )}
                                <button onClick={handleSignOut} className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-lg w-full text-left font-medium">
                                    <LogOut className="w-4 h-4" /> Sign Out
                                </button>
                            </>
                        ) : (
                            <Link to="/login" className="p-3 bg-black text-white text-center rounded-lg font-medium">Log In</Link>
                        )}
                        <a href="https://eventify.fun" className="flex items-center gap-2 p-3 text-gray-600 justify-center border-t border-gray-100 font-medium">
                            <ArrowLeft className="w-4 h-4" /> Back to Main Site
                        </a>

                        {/* Close Button Inside Menu for Accessibility */}
                        <button
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="absolute top-2 right-4 p-2 bg-gray-100 rounded-full"
                            aria-label="Close menu"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};
