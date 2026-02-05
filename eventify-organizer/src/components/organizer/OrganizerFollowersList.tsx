import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Users } from 'lucide-react';
// import { toast } from 'sonner'; // Removed unused

interface Follower {
    id: string; // follow id, not user id
    follower: {
        id: string;
        display_name: string | null;
        email?: string; // We might not be able to get email depending on RLS, assume we only get profile data
        avatar_url: string | null;
    };
}

interface OrganizerFollowersListProps {
    userId: string | undefined;
}

export const OrganizerFollowersList: React.FC<OrganizerFollowersListProps> = ({ userId }) => {
    const [followers, setFollowers] = useState<Follower[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userId) {
            fetchFollowers();
        }
    }, [userId]);

    const fetchFollowers = async () => {
        try {
            const { data } = await api.get(`/follows/list/${userId}`);
            // Data is array of { follower: { id, display_name, avatar_url } }
            // Our endpoint returns { ..., follower: { id, display_name, avatar_url } }
            setFollowers(data || []);
        } catch (error) {
            console.error('Error fetching followers:', error);
            // toast.error('Failed to load followers');
        } finally {
            setLoading(false);
        }
    };

    const getInitials = (name: string) => {
        return name?.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2) || '??';
    };

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    My Followers ({followers.length})
                </CardTitle>
            </CardHeader>
            <CardContent>
                {followers.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <p>You don't have any followers yet.</p>
                    </div>
                ) : (
                    <div className="divide-y">
                        {followers.map((item) => (
                            <div key={item.id} className="flex items-center gap-4 py-4">
                                <Avatar>
                                    <AvatarImage src={item.follower.avatar_url || ''} />
                                    <AvatarFallback>{getInitials(item.follower.display_name || 'User')}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium">{item.follower.display_name || 'Anonymous User'}</p>
                                    {/* We omit email for privacy unless specifically enabled in RLS/schema, usually profiles don't expose it publicly 
                      but as an organizer I might want to see who follows me. 
                      Since email is in auth.users, getting it requires a joined view or specific function. 
                      For now we just show display_name.
                  */}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
