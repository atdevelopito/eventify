import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Clock, UserPlus, Calendar, Ticket } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

interface ActivityItem {
  id: string;
  type: 'registration' | 'event_created' | 'ticket_sold';
  description: string;
  timestamp: string;
  eventTitle?: string;
}

export const RecentActivity: React.FC = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentActivity();
  }, []);

  const fetchRecentActivity = async () => {
    try {
      const { data } = await api.get('/analytics/organizer/activity');
      setActivities(data);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'registration':
        return UserPlus;
      case 'event_created':
        return Calendar;
      case 'ticket_sold':
        return Ticket;
      default:
        return Clock;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'registration':
        return 'bg-black text-white';
      case 'event_created':
        return 'bg-white text-black border-black';
      case 'ticket_sold':
        return 'bg-gray-100 text-black';
      default:
        return 'bg-gray-50 text-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="border border-gray-200 bg-white p-6 rounded-2xl">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-100 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-100 w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-100 w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden h-full flex flex-col">
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-black" />
          <h2 className="text-lg font-bold text-black tracking-tight">Recent Activity</h2>
        </div>
      </div>

      <div className="flex-1">
        {activities.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center min-h-[200px]">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Clock className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-black font-medium mb-1">No recent activity</p>
            <p className="text-sm text-black/40">Activity will appear here as people register for your events</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {activities.map((activity) => {
              const Icon = getActivityIcon(activity.type);
              return (
                <div key={activity.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border border-gray-100 ${activity.type === 'registration' ? 'bg-[#E85A6B] text-white' :
                      activity.type === 'event_created' ? 'bg-black text-white' :
                        'bg-gray-100 text-black'
                    }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-black truncate">{activity.description}</p>
                    <p className="text-xs text-black/50 mt-0.5 font-medium">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
