import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useRole } from './RoleContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: ('user' | 'admin' | 'organizer')[];
    requireSubscription?: boolean;
    requireVerification?: boolean;
    requireOrganizer?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    allowedRoles,
    requireSubscription = false,
    requireVerification = false,
    requireOrganizer = false
}) => {
    const { user, role, loading, isPro, isVerified, isOrganizer } = useRole();
    const location = useLocation();

    // CRITICAL: Always show loading state first to prevent flash
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="w-8 h-8 border-2 border-[#FA76FF] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // After loading completes, check authentication
    if (!user) {
        return <Navigate to="/auth" state={{ from: location }} replace />;
    }

    if (requireOrganizer && !isOrganizer) {
        console.log('[ProtectedRoute] Blocking organizer access. requireOrganizer:', requireOrganizer, 'isOrganizer:', isOrganizer);
        return <Navigate to="/verification" replace />;
    }

    if (allowedRoles && role && !allowedRoles.includes(role)) {
        return <Navigate to="/" replace />;
    }

    if (requireVerification && !isVerified) {
        return <Navigate to="/verification" replace />;
    }

    // Only render children after all checks pass
    return <>{children}</>;
};
