import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '@/lib/api';

// Define types locally since we removed Supabase types
export interface User {
    id: string;
    email: string;
    name?: string;
    is_verified?: boolean; // From backend response
    verified?: boolean; // Sometimes mapped differently
    role?: string;
    is_organizer?: boolean;
    avatar_url?: string;
}

export type AppRole = 'admin' | 'user';

export interface Subscription {
    id: string;
    plan_id: 'free' | 'pro' | 'enterprise';
    status: string;
    current_period_end: string | null;
}

export type VerificationStatus = 'none' | 'pending' | 'approved' | 'rejected';

interface RoleContextType {
    user: User | null;
    role: AppRole | null;
    subscription: Subscription | null;
    isAdmin: boolean;
    isPro: boolean;
    isVerified: boolean;
    isOrganizer: boolean;
    verificationStatus: VerificationStatus;
    loading: boolean;
    checkAuth: () => Promise<void>;
    login: (token: string, userData: any) => void;
    signOut: () => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<AppRole | null>(null);
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('none');
    const [loading, setLoading] = useState(true);

    const checkAuth = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const { data } = await api.get('/user/dashboard'); // Use /user/dashboard instead of /auth/me
            const userData = data.user;
            console.log('[RoleContext] Dashboard response:', userData);
            console.log('[RoleContext] is_organizer value:', userData.is_organizer);
            setUser(userData);

            // Map role
            setRole(userData.role);

            // Map verification
            const isVerified = userData.verified || userData.is_verified || userData.role !== 'unverified';
            if (isVerified) {
                setVerificationStatus('approved');
            } else {
                setVerificationStatus('pending');
            }

            // Mock subscription for now
            setSubscription({
                id: 'sub_123',
                plan_id: 'free',
                status: 'active',
                current_period_end: null
            });
        } catch (error) {
            console.error('Auth check failed:', error);
            localStorage.removeItem('token');
            setUser(null);
            setRole(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Safe check for body
        if (typeof document !== 'undefined' && document.body) {
            document.body.classList.add('auth-loading');
        }

        checkAuth().finally(() => {
            if (typeof document !== 'undefined' && document.body) {
                document.body.classList.remove('auth-loading');
            }
        });
    }, []);

    const login = (token: string, userData: any) => {
        localStorage.setItem('token', token);
        // Assuming userData contains info we allow setting immediately
        // But better to fetch fresh
        checkAuth();
    };

    const signOut = () => {
        localStorage.removeItem('token');
        setUser(null);
        setRole(null);
        setSubscription(null);
        setVerificationStatus('none');
    };

    const isAdmin = role === 'admin';
    const isPro = subscription?.plan_id === 'pro' || subscription?.plan_id === 'enterprise';
    const isVerified = verificationStatus === 'approved';
    const isOrganizer = user?.is_organizer === true;

    console.log('[RoleContext] Computed isOrganizer:', isOrganizer, 'from user.is_organizer:', user?.is_organizer);

    return (
        <RoleContext.Provider value={{ user, role, subscription, isAdmin, isPro, isVerified, isOrganizer, verificationStatus, loading, login, signOut, checkAuth }}>
            {children}
        </RoleContext.Provider>
    );
};

export const useRole = () => {
    const context = useContext(RoleContext);
    if (context === undefined) {
        throw new Error('useRole must be used within a RoleProvider');
    }
    return context;
};
