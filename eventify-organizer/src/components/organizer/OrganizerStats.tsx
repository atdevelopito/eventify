import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Calendar, Users, Eye, TrendingUp } from 'lucide-react';

interface OrganizerStatsProps {
  userId: string;
}

interface Stats {
  totalEvents: number;
  totalRegistrations: number;
  upcomingEvents: number;
  avgRegistrations: number;
}

export const OrganizerStats: React.FC<OrganizerStatsProps> = ({ userId }) => {
  const [stats, setStats] = useState<Stats>({
    totalEvents: 0,
    totalRegistrations: 0,
    upcomingEvents: 0,
    avgRegistrations: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) fetchStats();
  }, [userId]);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/organizer/stats');
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: 'Total Events',
      value: stats.totalEvents,
      icon: Calendar,
      color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
    },
    {
      label: 'Total Registrations',
      value: stats.totalRegistrations,
      icon: Users,
      color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
    },
    {
      label: 'Upcoming Events',
      value: stats.upcomingEvents,
      icon: TrendingUp,
      color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
    },
    {
      label: 'Avg. Registrations',
      value: stats.avgRegistrations,
      icon: Eye,
      color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="border border-foreground p-6 animate-pulse bg-background">
            <div className="h-8 bg-muted mb-2 w-16"></div>
            <div className="h-4 bg-muted w-24"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat) => (
        <div key={stat.label} className="border border-foreground p-6 hover:shadow-lg transition-shadow bg-background">
          <div className="flex items-center gap-3 mb-3">
            <div className={`p-2 ${stat.color} rounded-lg`}>
              <stat.icon className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold mb-1 text-foreground">{stat.value}</div>
          <div className="text-sm text-muted-foreground uppercase tracking-wide">{stat.label}</div>
        </div>
      ))}
    </div>
  );
};
