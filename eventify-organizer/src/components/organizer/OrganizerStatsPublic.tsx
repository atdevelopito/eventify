import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Calendar, Users, Eye, TrendingUp } from 'lucide-react';

interface Stats {
  totalEvents: number;
  totalRegistrations: number;
  upcomingEvents: number;
  avgRegistrations: number;
  totalRevenue?: number;
}

interface OrganizerStatsPublicProps {
  userId?: string;
}

export const OrganizerStatsPublic: React.FC<OrganizerStatsPublicProps> = ({ userId }) => {
  const [stats, setStats] = useState<Stats>({
    totalEvents: 0,
    totalRegistrations: 0,
    upcomingEvents: 0,
    avgRegistrations: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initFetch = async () => {
      await fetchStats();
    };

    initFetch();

    return () => {
      mounted = false;
    };
  }, [userId]);

  const fetchStats = async () => {
    let mounted = true;
    try {
      if (!userId) return; // Should we handle no userId? 
      const { data } = await api.get(`/analytics/public/${userId}/stats`);

      if (!mounted) return;

      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      if (mounted) {
        setLoading(false);
      }
    }

    return () => {
      mounted = false;
    };
  };

  const statCards = [
    {
      label: 'Total Events',
      value: stats.totalEvents,
      icon: Calendar,
      color: 'bg-black text-white'
    },
    {
      label: 'Total Registrations',
      value: stats.totalRegistrations,
      icon: Users,
      color: 'bg-white border border-black text-black'
    },
    {
      label: 'Upcoming Events',
      value: stats.upcomingEvents,
      icon: TrendingUp,
      color: 'bg-gray-100 text-black'
    },
    {
      label: 'Avg. Registrations',
      value: stats.avgRegistrations,
      icon: Eye,
      color: 'bg-transparent border border-gray-200 text-gray-600'
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="border border-gray-200 rounded-2xl p-6 animate-pulse bg-white h-32">
            <div className="h-8 bg-gray-100 mb-2 w-16 rounded"></div>
            <div className="h-4 bg-gray-100 w-24 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <div key={stat.label} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:border-[#E85A6B]/50 transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-2.5 rounded-lg flex items-center justify-center ${index === 0 ? 'bg-[#E85A6B] text-white' :
                index === 1 ? 'bg-black text-white' :
                  'bg-gray-100 text-black'
              }`}>
              <stat.icon className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold mb-1 text-black tracking-tight group-hover:text-[#E85A6B] transition-colors">{stat.value}</div>
          <div className="text-sm text-black/50 font-medium">{stat.label}</div>
        </div>
      ))}
    </div>
  );
};
