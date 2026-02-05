import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * PageTransitionLoader Component
 * 
 * Provides a lightweight global page transition loader.
 * Appears briefly on every route change and scrolls the viewport to the top.
 */
export const PageTransitionLoader: React.FC = () => {
    const { pathname } = useLocation();
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Start loading when pathname changes
        setIsLoading(true);
        setProgress(30);

        // Ensure scroll to top
        window.scrollTo({ top: 0, behavior: 'instant' });

        // Simulate progress and hide loader
        const progressTimer = setTimeout(() => {
            setProgress(70);
        }, 100);

        const completeTimer = setTimeout(() => {
            setProgress(100);
            setTimeout(() => {
                setIsLoading(false);
                setProgress(0);
            }, 200);
        }, 400);

        return () => {
            clearTimeout(progressTimer);
            clearTimeout(completeTimer);
        };
    }, [pathname]);

    if (!isLoading) return null;

    return (
        <div
            className="fixed top-0 left-0 w-full h-1 z-[9999] pointer-events-none transition-opacity duration-300"
            style={{ opacity: progress === 100 ? 0 : 1 }}
        >
            <div
                className="h-full bg-[#E85A6B] transition-all duration-300 ease-out shadow-[0_0_10px_rgba(232,90,107,0.7)]"
                style={{ width: `${progress}%` }}
            />
        </div>
    );
};
