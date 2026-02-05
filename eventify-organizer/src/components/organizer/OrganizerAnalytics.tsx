import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { TrendingUp, Calendar, Users, BarChart3 } from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface OrganizerAnalyticsProps {
  userId: string;
  compact?: boolean;
}

interface EventStats {
  id: string;
  title: string;
  registrations: number;
}

interface DailyRegistration {
  date: string;
  count: number;
}

const COLORS = ['#E85A6B', '#4ade80', '#60a5fa', '#f97316', '#a855f7'];

export const OrganizerAnalytics: React.FC<OrganizerAnalyticsProps> = ({ userId, compact }) => {
  const [eventStats, setEventStats] = useState<EventStats[]>([]);
  const [dailyRegistrations, setDailyRegistrations] = useState<DailyRegistration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) fetchAnalytics();
  }, [userId]);

  const fetchAnalytics = async () => {
    try {
      const { data } = await api.get('/analytics/organizer/charts');

      setEventStats(data.eventStats || []);
      setDailyRegistrations(data.dailyRegistrations || []);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="border border-foreground p-6 bg-background">
        <div className="animate-pulse space-y-4">
          <div className="h-40 bg-muted"></div>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="border border-foreground bg-background">
        <div className="p-4 border-b border-foreground bg-muted">
          <h2 className="text-lg font-medium flex items-center gap-2 text-foreground">
            <TrendingUp className="w-5 h-5" />
            Registrations (Last 7 Days)
          </h2>
        </div>
        <div className="p-4">
          {dailyRegistrations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No registration data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={dailyRegistrations}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" fontSize={12} className="fill-muted-foreground" />
                <YAxis fontSize={12} allowDecimals={false} className="fill-muted-foreground" />
                <Tooltip
                  contentStyle={{
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 0,
                    backgroundColor: 'hsl(var(--background))'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#E85A6B"
                  strokeWidth={2}
                  dot={{ fill: '#E85A6B', strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Registrations Over Time */}
      <div className="border border-foreground bg-background">
        <div className="p-4 border-b border-foreground bg-muted">
          <h2 className="text-lg font-medium flex items-center gap-2 text-foreground">
            <TrendingUp className="w-5 h-5" />
            Registrations Over Time (Last 7 Days)
          </h2>
        </div>
        <div className="p-6">
          {dailyRegistrations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p>No registration data yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyRegistrations}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" fontSize={12} className="fill-muted-foreground" />
                <YAxis fontSize={12} allowDecimals={false} className="fill-muted-foreground" />
                <Tooltip
                  contentStyle={{
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 0,
                    backgroundColor: 'hsl(var(--background))'
                  }}
                />
                <Bar dataKey="count" fill="#000000" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Event Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-foreground bg-background">
          <div className="p-4 border-b border-foreground bg-muted">
            <h2 className="text-lg font-medium flex items-center gap-2 text-foreground">
              <Calendar className="w-5 h-5" />
              Top Events by Registrations
            </h2>
          </div>
          <div className="p-6">
            {eventStats.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No events yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={eventStats} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis type="number" fontSize={12} allowDecimals={false} className="fill-muted-foreground" />
                  <YAxis type="category" dataKey="title" fontSize={11} width={100} className="fill-muted-foreground" />
                  <Tooltip
                    contentStyle={{
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 0,
                      backgroundColor: 'hsl(var(--background))'
                    }}
                  />
                  <Bar dataKey="registrations" fill="#000000" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="border border-foreground bg-background">
          <div className="p-4 border-b border-foreground bg-muted">
            <h2 className="text-lg font-medium flex items-center gap-2 text-foreground">
              <Users className="w-5 h-5" />
              Registration Distribution
            </h2>
          </div>
          <div className="p-6">
            {eventStats.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={eventStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="registrations"
                    label={({ title, percent }) =>
                      percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''
                    }
                  >
                    {eventStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 0,
                      backgroundColor: 'hsl(var(--background))'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
            {eventStats.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 justify-center">
                {eventStats.map((event, index) => (
                  <div key={event.id} className="flex items-center gap-2 text-xs">
                    <div
                      className="w-3 h-3"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="truncate max-w-[100px] text-muted-foreground">{event.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
