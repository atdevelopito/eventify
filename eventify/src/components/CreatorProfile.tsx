import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { UserPlus, Check, Calendar } from 'lucide-react';
import { toast } from '@/components/ui/toast';

interface CreatorProfileProps {
  creatorName: string;
  creatorId?: string;
  avatarUrl?: string;
}

export const CreatorProfile: React.FC<CreatorProfileProps> = ({ creatorName, creatorId, avatarUrl }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [eventCount, setEventCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkAuthAndFollowStatus();
    fetchCreatorStats();
  }, [creatorId]);

  const checkAuthAndFollowStatus = async () => {
    // We assume RoleContext or user state handles auth check mostly, 
    // but here we check follow status if user is logged in.
    // If not logged in, api logic might differ. 
    // Let's rely on api call returning valid info or public info.
    // The previous code checked auth.getSession().
    // We can use a simple check or passed prop?
    // User passed prop might be cleaner but let's assume we can try fetching.

    if (creatorId) {
      try {
        const { data } = await api.get(`/follows/check/${creatorId}`);
        setIsFollowing(data.isFollowing);
        setIsLoggedIn(true); // If this call succeeds with auth? 
        // Actually API might return isFollowing: false if not logged in?
        // Middleware protect would block it if I used protect. 
        // followRoutes /check/ uses protect. So if 401, not logged in.

      } catch (error) {
        setIsLoggedIn(false);
        setIsFollowing(false);
      }
    }
  };

  const fetchCreatorStats = async () => {
    if (!creatorId) return;

    try {
      // Count events 
      // We added total to response.
      const { data: eventsData } = await api.get(`/events?created_by=${creatorId}&limit=1`);
      setEventCount(eventsData.total || 0);

      // Count followers
      const { data: followData } = await api.get(`/follows/count/${creatorId}`);
      setFollowerCount(followData.count || 0);
    } catch (error) {
      console.error("Failed to fetch creator stats", error);
    }
  };

  const handleFollow = async () => {
    if (!isLoggedIn) {
      toast.error('Please sign in to follow creators');
      // Maybe specific error handling if we used context?
      return;
    }

    if (!creatorId) return;

    try {
      if (isFollowing) {
        // Unfollow
        await api.delete(`/follows/${creatorId}`);
        setIsFollowing(false);
        setFollowerCount(prev => Math.max(0, prev - 1));
        toast.info(`Unfollowed ${creatorName}`);
      } else {
        // Follow
        await api.post(`/follows/${creatorId}`);
        setIsFollowing(true);
        setFollowerCount(prev => prev + 1);
        toast.success(`You're now following ${creatorName}`);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast.error('Failed to update follow status');
    }
  };

  // Generate initials from creator name
  const getInitials = (name: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="border border-black p-6">
      <h3 className="text-xs uppercase tracking-widest text-gray-400 mb-4">Event Organizer</h3>

      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-16 h-16 bg-[#E85A6B] border border-black flex items-center justify-center text-xl font-bold text-black shrink-0 overflow-hidden">
          {avatarUrl ? (
            <img src={`http://localhost:5000${avatarUrl}`} alt={creatorName} className="w-full h-full object-cover" />
          ) : (
            getInitials(creatorName)
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-lg font-medium truncate">{creatorName}</h4>

          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {eventCount} {eventCount === 1 ? 'event' : 'events'}
            </span>
            <span>{followerCount} followers</span>
          </div>

          <button
            onClick={handleFollow}
            className={`mt-3 flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-300 ${isFollowing
              ? 'bg-black text-white border border-black'
              : 'bg-white text-black border border-black hover:bg-[#E85A6B] hover:border-[#E85A6B]'
              }`}
          >
            {isFollowing ? (
              <>
                <Check className="w-4 h-4" />
                Following
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Follow
              </>
            )}
          </button>
        </div>
      </div>

      <p className="mt-4 text-sm text-gray-600">
        Follow to get notified about future events from this organizer.
      </p>
    </div>
  );
};
