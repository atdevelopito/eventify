import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { useRole } from '@/components/RoleContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toaster, toast } from 'sonner';

import { Switch } from '@/components/ui/switch'; // Ensure this is imported

export default function AdminDashboard() {
    const { user, loading: authLoading } = useRole();
    const navigate = useNavigate();
    const [applications, setApplications] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                // Not logged in, redirect to login
                navigate('/login');
                return;
            }
            fetchData();
        }
    }, [user, authLoading, navigate]);

    const fetchData = async () => {
        try {
            // Parallel fetch
            const [appsRes, eventsRes] = await Promise.all([
                api.get('/admin/applications'),
                api.get('/events?limit=1000&sort=-created_at')
            ]);

            setApplications(appsRes.data);

            // Handle events response structure
            const eventsList = eventsRes.data.events || [];
            const formattedEvents = eventsList.map((e) => ({
                ...e,
                id: e.id || e._id // Map _id to id
            }));
            setEvents(formattedEvents);

        } catch (error) {
            toast.error('Failed to fetch admin data');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, action) => {
        try {
            if (action === 'approve') {
                await api.post(`/admin/applications/${id}/approve`);
                toast.success('Application approved');
            } else {
                await api.post(`/admin/applications/${id}/reject`);
                toast.success('Application rejected');
            }
            // Refresh list
            fetchData();
        } catch (error) {
            toast.error(`Failed to ${action} application`);
        }
    };

    const handleToggleFeatured = async (id, currentStatus) => {
        try {
            const newStatus = !currentStatus;
            // Optimistic update
            setEvents(events.map(e => e.id === id ? { ...e, is_featured: newStatus } : e));

            await api.put(`/admin/events/${id}/feature`, { is_featured: newStatus });
            toast.success(newStatus ? 'Event added to Featured' : 'Event removed from Featured');
        } catch (error) {
            toast.error('Failed to update event status');
            // Revert on error
            setEvents(events.map(e => e.id === id ? { ...e, is_featured: currentStatus } : e));
        }
    };

    if (authLoading || loading) return <div className="p-8 text-center">Loading Admin Panel...</div>;

    const pendingApps = applications.filter(a => a.status === 'pending');
    const processedApps = applications.filter(a => a.status !== 'pending');

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                        <p className="text-gray-500">Manage host applications and featured content</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium">Logged as {user?.email}</span>
                        <Button variant="outline" onClick={() => navigate('/')}>Exit Admin</Button>
                    </div>
                </div>

                <Tabs defaultValue="featured" className="w-full">
                    <TabsList className="mb-8">
                        <TabsTrigger value="featured" className="px-6 py-2">Featured Events</TabsTrigger>
                        <TabsTrigger value="pending" className="px-6 py-2">Pending Apps ({pendingApps.length})</TabsTrigger>
                        <TabsTrigger value="history" className="px-6 py-2">App History</TabsTrigger>
                    </TabsList>

                    <TabsContent value="featured" className="space-y-6 mt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {events.map(event => (
                                <Card key={event.id} className="overflow-hidden transition-all duration-200 hover:shadow-lg border-gray-100 bg-white group">
                                    <div className="relative h-48 w-full overflow-hidden bg-gray-100/50">
                                        {event.background_image_url ? (
                                            <img
                                                src={event.background_image_url.startsWith('http') ? event.background_image_url : `http://${window.location.hostname}:5000/${event.background_image_url}`}
                                                alt={event.title}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                loading="lazy"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = 'https://placehold.co/600x400?text=No+Image';
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                                                <span className="text-sm font-medium">No Image</span>
                                            </div>
                                        )}
                                        <div className="absolute top-3 right-3">
                                            <Badge variant={event.is_featured ? "default" : "secondary"} className={event.is_featured ? "bg-black text-white hover:bg-gray-800" : "bg-white/90 text-gray-700 backdrop-blur-sm"}>
                                                {event.is_featured ? 'Featured' : 'Standard'}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="p-5">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-lg leading-tight text-gray-900 line-clamp-1" title={event.title}>
                                                {event.title}
                                            </h3>
                                        </div>

                                        <div className="text-sm text-gray-500 mb-4 space-y-1">
                                            <p className="flex items-center gap-2">
                                                <span className="w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center text-[10px]">📅</span>
                                                {event.date || 'Date TBD'}
                                            </p>
                                            <p className="flex items-center gap-2">
                                                <span className="w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center text-[10px]">👤</span>
                                                <span className="truncate">{event.creator_name || 'Organizer'}</span>
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                                Slider Visibility
                                            </span>
                                            <Switch
                                                checked={!!event.is_featured}
                                                onCheckedChange={() => handleToggleFeatured(event.id, event.is_featured)}
                                                className="data-[state=checked]:bg-green-600"
                                            />
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="pending" className="space-y-4 mt-6">
                        {pendingApps.length === 0 ? (
                            <div className="p-12 text-center border rounded-lg bg-white text-gray-500">
                                No pending applications
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {pendingApps.map(app => (
                                    <ApplicationCard key={app._id} app={app} onAction={handleAction} />
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="history" className="space-y-4 mt-4">
                        {processedApps.map(app => (
                            <ApplicationCard key={app._id} app={app} onAction={handleAction} readOnly />
                        ))}
                    </TabsContent>
                </Tabs>
            </div>
            <Toaster />
        </div>
    );
}

function ApplicationCard({ app, onAction, readOnly }) {
    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg">{app.organization_name || app.full_name}</CardTitle>
                        <CardDescription>{app.organization_type} • {app.event_type}</CardDescription>
                    </div>
                    <Badge variant={app.status === 'pending' ? 'secondary' : app.status === 'approved' ? 'success' : 'destructive'}>
                        {app.status.toUpperCase()}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                    <h4 className="font-medium mb-1">Contact Info</h4>
                    <p className="text-gray-600">{app.full_name}</p>
                    <p className="text-gray-600">{app.email}</p>
                    <p className="text-gray-600">{app.phone}</p>
                </div>
                <div>
                    <h4 className="font-medium mb-1">Links</h4>
                    {app.website_url && <a href={app.website_url} target="_blank" className="block text-blue-600 hover:underline truncate">{app.website_url}</a>}
                    {app.portfolio_url && <a href={app.portfolio_url} target="_blank" className="block text-blue-600 hover:underline truncate">{app.portfolio_url}</a>}
                </div>
                <div className="md:col-span-2">
                    <h4 className="font-medium mb-1">Description</h4>
                    <p className="text-gray-600 bg-gray-50 p-3 rounded-md">{app.event_description}</p>
                </div>
            </CardContent>
            {!readOnly && (
                <CardFooter className="flex justify-end gap-3 border-t bg-gray-50/50 p-4">
                    <Button variant="destructive" onClick={() => onAction(app._id, 'reject')}>Reject</Button>
                    <Button onClick={() => onAction(app._id, 'approve')} className="bg-green-600 hover:bg-green-700">Approve</Button>
                </CardFooter>
            )}
        </Card>
    );
}
