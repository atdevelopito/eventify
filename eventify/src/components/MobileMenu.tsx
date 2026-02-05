import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Home, Calendar, Building2, Activity, ShoppingBag, Phone, Ticket, ChevronRight, LogOut, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRole } from './RoleContext';

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

const MenuLink = ({ to, icon: Icon, label, onClick, delay }: { to: string; icon: any; label: string; onClick: () => void; delay: number }) => (
    <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay, duration: 0.3 }}
    >
        <Link
            to={to}
            onClick={onClick}
            className="group flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 active:scale-[0.98] transition-all border border-transparent hover:border-gray-100"
        >
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[#E85A6B]/10 transition-colors">
                    <Icon className="w-5 h-5 text-gray-900 group-hover:text-[#E85A6B] transition-colors" />
                </div>
                <span className="text-lg font-medium text-gray-900">{label}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#E85A6B] transition-colors" />
        </Link>
    </motion.div>
);

import { createPortal } from 'react-dom';

export const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
    const { user, signOut } = useRole();
    const navigate = useNavigate();

    // Prevent body scroll and handle cleanup
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
            // Slight delay to allow exit animation if needed, but handled by AnimatePresence usually
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleSignOut = async () => {
        await signOut();
        onClose();
        navigate('/');
    };

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[9999] bg-white/80 backdrop-blur-xl" // Extremely high z-index
                >
                    {/* Content Container */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className="absolute inset-0 bg-white flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 pb-2">
                            <div className="h-8 w-8 bg-black rounded-lg flex items-center justify-center">
                                {/* Simplified Logo placeholder if image fails, or use img */}
                                <span className="font-bold text-white text-xs">E</span>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-900" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-6 py-4">

                            {/* Featured Card: My Tickets */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="mb-8"
                            >
                                <Link
                                    to="/my-tickets"
                                    onClick={onClose}
                                    className="block relative overflow-hidden bg-[#111] rounded-3xl p-6 shadow-xl active:scale-[0.98] transition-transform"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#E85A6B] rounded-full blur-[60px] opacity-20 transform translate-x-10 -translate-y-10"></div>
                                    <div className="relative z-10 flex items-center justify-between">
                                        <div>
                                            <p className="text-gray-400 text-sm font-medium mb-1">Quick Access</p>
                                            <h3 className="text-white text-2xl font-bold">My Tickets</h3>
                                        </div>
                                        <div className="w-12 h-12 rounded-full bg-[#E85A6B] flex items-center justify-center">
                                            <Ticket className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>

                            {/* Menu Links */}
                            <div className="space-y-1">
                                <MenuLink to="/" icon={Home} label="Home" onClick={onClose} delay={0.2} />
                                <MenuLink to="/discover" icon={Calendar} label="Discover Events" onClick={onClose} delay={0.25} />
                                <MenuLink to="/activities" icon={Activity} label="Activities" onClick={onClose} delay={0.3} />
                                <MenuLink to="/merch" icon={ShoppingBag} label="Merch Store" onClick={onClose} delay={0.35} />
                                <MenuLink to="/organizer-landing" icon={Building2} label="For Organizers" onClick={onClose} delay={0.4} />
                                <MenuLink to="/contact" icon={Phone} label="Contact Support" onClick={onClose} delay={0.45} />
                            </div>

                            {/* Bottom Actions */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6 }}
                                className="mt-8 pt-8 border-t border-gray-100"
                            >
                                {user ? (
                                    <div className="space-y-3">
                                        <p className="text-sm text-gray-500 font-medium px-4">Signed in as {user.email}</p>
                                        <button
                                            onClick={handleSignOut}
                                            className="w-full flex items-center gap-3 p-4 rounded-2xl bg-gray-50 text-red-500 font-medium hover:bg-red-50 transition-colors"
                                        >
                                            <LogOut className="w-5 h-5" />
                                            Sign Out
                                        </button>
                                    </div>
                                ) : (
                                    <Link
                                        to="/auth"
                                        onClick={onClose}
                                        className="flex items-center justify-center w-full p-4 bg-black text-white rounded-2xl font-bold text-lg hover:bg-gray-900 transition-colors"
                                    >
                                        Sign In / Sign Up
                                    </Link>
                                )}
                            </motion.div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
};
