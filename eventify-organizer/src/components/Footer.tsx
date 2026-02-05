import React from 'react';

export const Footer = () => {
    return (
        <footer className="bg-gray-50 border-t border-black/5 py-12 px-4">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-2">
                    <span className="font-semibold">Eventify Organizer</span>
                    <span className="text-gray-400">|</span>
                    <span className="text-sm text-gray-500">© 2026 Eventify. All rights reserved.</span>
                </div>
                <div className="flex gap-6 text-sm text-gray-500">
                    <a href="#" className="hover:text-black transition-colors">Privacy Policy</a>
                    <a href="#" className="hover:text-black transition-colors">Terms of Service</a>
                    <a href="#" className="hover:text-black transition-colors">Help Center</a>
                </div>
            </div>
        </footer>
    );
};
