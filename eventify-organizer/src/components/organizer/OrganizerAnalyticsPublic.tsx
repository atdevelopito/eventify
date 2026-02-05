import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { TrendingUp, Calendar, Users, BarChart3 } from 'lucide-react';
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

interface OrganizerAnalyticsPublicProps {
  compact?: boolean;
  userId?: string;
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

const COLORS = ['#000000', '#E85A6B', '#3b82f6', '#f97316', '#a855f7'];

export const OrganizerAnalyticsPublic: React.FC<OrganizerAnalyticsPublicProps> = ({ compact, userId }) => {
  const [eventStats, setEventStats] = useState<EventStats[]>([]);
  const [dailyRegistrations, setDailyRegistrations] = useState<DailyRegistration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [userId]);

  const fetchAnalytics = async () => {
    try {
      if (!userId) return;
      const { data } = await api.get(`/analytics/public/${userId}/charts`);

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
      <div className="border border-gray-200 p-6 bg-white rounded-2xl">
        <div className="animate-pulse space-y-4">
          <div className="h-40 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="h-full w-full min-h-[200px] flex items-center justify-center">
        {dailyRegistrations.length === 0 ? (
          <div className="text-center text-black/50">
            <TrendingUp className="w-10 h-10 mx-auto mb-3 text-black/20" />
            <p>No registration data yet</p>
          </div>
        ) : (
          <div className="w-full h-full">
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={dailyRegistrations}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-gray-200" />
                <XAxis
                  dataKey="date"
                  fontSize={12}
                  axisLine={false}
                  tickLine={false}
                  className="fill-gray-500"
                  dy={10}
                />
                <YAxis
                  fontSize={12}
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  className="fill-gray-500"
                />
                <Tooltip
                  cursor={{ stroke: '#000', strokeWidth: 1, strokeDasharray: '4 4' }}
                  contentStyle={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    backgroundColor: '#ffffff',
                    color: '#000000',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    padding: '8px 12px'
                  }}
                  itemStyle={{ color: '#000000' }}
                  labelStyle={{ color: '#666666' }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#000000"
                  strokeWidth={3}
                  dot={{ fill: '#000000', strokeWidth: 2, r: 4, stroke: '#fff' }}
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#E85A6B' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Registrations Over Time */}
      <div className="border border-gray-200 bg-white rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-lg font-medium flex items-center gap-2 text-black">
            <TrendingUp className="w-5 h-5 text-[#E85A6B]" />
            Registrations Over Time (Last 7 Days)
          </h2>
        </div>
        <div className="p-6">
          {dailyRegistrations.length === 0 ? (
            <div className="text-center py-12 text-black/50">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 text-black/20" />
              <p>No registration data yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyRegistrations}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-100" />
                <XAxis dataKey="date" fontSize={12} className="fill-gray-500" />
                <YAxis fontSize={12} allowDecimals={false} className="fill-gray-500" />
                <Tooltip
                  contentStyle={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    backgroundColor: '#ffffff',
                    color: '#000000'
                  }}
                  cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                  itemStyle={{ color: '#000000' }}
                  labelStyle={{ color: '#666666' }}
                />
                <Bar dataKey="count" fill="#000000" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Event Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-gray-200 bg-white rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-lg font-medium flex items-center gap-2 text-black">
              <Calendar className="w-5 h-5 text-[#E85A6B]" />
              Top Events by Registrations
            </h2>
          </div>
          <div className="p-6">
            {eventStats.length === 0 ? (
              <div className="text-center py-8 text-black/50">
                No events yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={eventStats} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-100" />
                  <XAxis type="number" fontSize={12} allowDecimals={false} className="fill-gray-500" />
                  <YAxis type="category" dataKey="title" fontSize={11} width={100} className="fill-gray-500" />
                  <Tooltip
                    contentStyle={{
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      backgroundColor: '#ffffff',
                      color: '#000000'
                    }}
                    cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                    itemStyle={{ color: '#000000' }}
                    labelStyle={{ color: '#666666' }}
                  />
                  <Bar dataKey="registrations" fill="#000000" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="border border-gray-200 bg-white rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-lg font-medium flex items-center gap-2 text-black">
              <Users className="w-5 h-5 text-[#E85A6B]" />
              Registration Distribution
            </h2>
          </div>
          <div className="p-6">
            {eventStats.length === 0 ? (
              <div className="text-center py-8 text-black/50">
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
                    label={({ payload, percent }: any) =>
                      percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''
                    }
                  >
                    {eventStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      backgroundColor: '#ffffff',
                      color: '#000000'
                    }}
                    itemStyle={{ color: '#000000' }}
                    labelStyle={{ color: '#666666' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
            {eventStats.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 justify-center">
                {eventStats.map((event, index) => (
                  <div key={event.id} className="flex items-center gap-2 text-xs">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="truncate max-w-[100px] text-black/70">{event.title}</span>
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
