import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useRole } from '@/components/RoleContext';
import { toast } from '@/components/ui/toast';

export const DevBypass = () => {
    const { user } = useRole();
    const [loading, setLoading] = useState(false);

    if (process.env.NODE_ENV !== 'development' && !window.location.hostname.includes('localhost')) {
        return null;
    }

    const handleVerify = async () => {
        if (!user) {
            toast.error("Please sign in first (any account)");
            return;
        }
        setLoading(true);
        try {
            const { error } = await supabase.rpc('dev_force_verify');
            if (error) throw error;

            toast.success("Dev Bypass: You are now Verified & Pro!");
            window.location.reload();
        } catch (e: any) {
            console.error(e);
            toast.error(`Bypass failed: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = async () => {
        if (!user) return;
        setLoading(true);
        try {
            await supabase.from('host_applications').delete().eq('user_id', user.id);
            await supabase.from('subscriptions' as any).delete().eq('user_id', user.id);
            // Also remove admin role if it exists, to truly reset
            await supabase.from('user_roles').delete().eq('user_id', user.id).eq('role', 'admin');

            toast.success("Dev Bypass: Reset complete.");
            window.location.reload();
        } catch (e) {
            console.error(e);
            toast.error("Reset failed");
        } finally {
            setLoading(false);
        }
    };

    const handleFixStorage = async () => {
        if (!user) return;
        setLoading(true);
        try {
            // Create bucket if not exists
            const { data, error } = await supabase.storage.createBucket('event-images', {
                public: true,
                fileSizeLimit: 10485760, // 10MB
                allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp']
            });

            if (error && error.message.includes('already exists')) {
                toast.info("Storage bucket already exists");
            } else if (error) {
                throw error;
            } else {
                toast.success("Storage bucket created!");
            }
        } catch (e: any) {
            console.error(e);
            toast.error(`Storage fix failed: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleMakeAdmin = async () => {
        if (!user) {
            toast.error("Please sign in first");
            return;
        }
        setLoading(true);
        try {
            // 1. Grant Admin Role
            const { error: roleError } = await supabase
                .from('user_roles')
                .insert({ user_id: user.id, role: 'admin' });

            if (roleError) {
                // Ignore unique constraint violation if they are already admin
                if (!roleError.message.includes('unique constraint')) {
                    console.error("Role Error:", roleError);
                }
            }

            // 2. Grant Host Verification (Approved Status)
            const { data: existingApp } = await supabase
                .from('host_applications')
                .select('id')
                .eq('user_id', user.id)
                .maybeSingle();

            if (existingApp) {
                await supabase
                    .from('host_applications')
                    .update({ status: 'approved' })
                    .eq('id', existingApp.id);
            } else {
                await supabase
                    .from('host_applications')
                    .insert({
                        user_id: user.id,
                        status: 'approved',
                        full_name: user.email?.split('@')[0] || 'Admin',
                        email: user.email || 'admin@admin.com',
                        phone: '1234567890',
                        event_type: 'All',
                        event_description: 'Admin Host',
                        expected_attendees: '1000+',
                    });
            }

            toast.success("You are now an Admin & Verified Host!");
            window.location.reload();
        } catch (e: any) {
            console.error(e);
            toast.error(`Partial success or check console: ${e.message}`);
            window.location.reload();
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="fixed bottom-4 left-4 z-[9999] bg-black text-white p-2 rounded shadow-lg flex gap-2 text-xs opacity-50 hover:opacity-100 transition-opacity">
            <span className="font-bold my-auto mr-2">DEV:</span>
            <button onClick={handleVerify} disabled={loading} className="underline hover:text-[#FA76FF]">
                Force Verify
            </button>
            <span className="text-gray-500">|</span>
            <button onClick={handleMakeAdmin} disabled={loading} className="underline hover:text-[#FA76FF]">
                Grant Admin
            </button>
            <span className="text-gray-500">|</span>
            <button onClick={handleFixStorage} disabled={loading} className="underline hover:text-[#FA76FF]">
                Fix Storage
            </button>
            <span className="text-gray-500">|</span>
            <button onClick={handleReset} disabled={loading} className="underline hover:text-red-400">
                Reset
            </button>
        </div>
    );
};
