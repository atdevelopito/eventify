import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Users, Mail, Download, Search, UserCheck, Calendar, Clock, TrendingUp } from 'lucide-react';
import { format, formatDistanceToNow, subDays, startOfDay, endOfDay } from 'date-fns';
import { toast } from '@/components/ui/toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface Attendee {
  id: string;
  user_id: string;
  display_name: string;
  registered_at: string;
  eventTitle: string;
  event_id: string;
}

interface AttendeeStats {
  totalAttendees: number;
  newThisWeek: number;
  uniqueEvents: number;
  avgPerEvent: number;
}

interface DailyData {
  date: string;
  count: number;
}

export const AttendeeInsights: React.FC = () => {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [stats, setStats] = useState<AttendeeStats>({
    totalAttendees: 0,
    newThisWeek: 0,
    uniqueEvents: 0,
    avgPerEvent: 0,
  });
  const [dailyRegistrations, setDailyRegistrations] = useState<DailyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAttendeeData();
  }, []);

  const fetchAttendeeData = async () => {
    try {
      const { data: attendeesData } = await api.get('/organizer/attendees');

      // Structure: id, user_id, display_name, registered_at, eventTitle, event_id
      const formattedAttendees: Attendee[] = attendeesData.map((a: any) => ({
        ...a,
        id: a._id || a.id // handle _id
      }));

      setAttendees(formattedAttendees);

      // Calculate stats
      const oneWeekAgo = subDays(new Date(), 7).toISOString();
      const newThisWeek = formattedAttendees.filter(a => a.registered_at >= oneWeekAgo).length;
      const uniqueEvents = new Set(formattedAttendees.map(a => a.event_id)).size;

      setStats({
        totalAttendees: formattedAttendees.length,
        newThisWeek,
        uniqueEvents,
        avgPerEvent: uniqueEvents > 0 ? Math.round(formattedAttendees.length / uniqueEvents) : 0,
      });

      // Calculate daily registrations for the last 14 days
      const last14Days: DailyData[] = [];
      for (let i = 13; i >= 0; i--) {
        const date = subDays(new Date(), i);
        const dayStart = startOfDay(date).toISOString();
        const dayEnd = endOfDay(date).toISOString();

        const count = formattedAttendees.filter(
          a => a.registered_at >= dayStart && a.registered_at <= dayEnd
        ).length;

        last14Days.push({
          date: format(date, 'MMM d'),
          count,
        });
      }
      setDailyRegistrations(last14Days);

    } catch (error) {
      console.error('Error fetching attendee data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (attendees.length === 0) {
      toast.error('No attendees to export');
      return;
    }

    const headers = ['Name', 'Email', 'Event', 'Ticket Type', 'Registered At'];
    const rows = attendees.map(a => [
      a.display_name,
      // @ts-ignore
      a.email || '-',
      a.eventTitle,
      // @ts-ignore
      a.ticket_type || 'General',
      format(new Date(a.registered_at), 'PPpp')
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendees-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success('Attendees exported successfully');
  };

  const filteredAttendees = attendees.filter(a =>
    a.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.eventTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="border border-foreground p-6 bg-background">
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-muted"></div>
            ))}
          </div>
          <div className="h-64 bg-muted"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border border-foreground p-6 bg-background hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-black rounded-lg">
              <Users className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-3xl font-bold mb-1 text-foreground">{stats.totalAttendees}</div>
          <div className="text-sm text-muted-foreground uppercase tracking-wide">Total Attendees</div>
        </div>

        <div className="border border-foreground p-6 bg-background hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <UserCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="text-3xl font-bold mb-1 text-foreground">{stats.newThisWeek}</div>
          <div className="text-sm text-muted-foreground uppercase tracking-wide">New This Week</div>
        </div>

        <div className="border border-foreground p-6 bg-background hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="text-3xl font-bold mb-1 text-foreground">{stats.uniqueEvents}</div>
          <div className="text-sm text-muted-foreground uppercase tracking-wide">Events Attended</div>
        </div>

        <div className="border border-foreground p-6 bg-background hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <div className="text-3xl font-bold mb-1 text-foreground">{stats.avgPerEvent}</div>
          <div className="text-sm text-muted-foreground uppercase tracking-wide">Avg. Per Event</div>
        </div>
      </div>

      {/* Registration Trend Chart */}
      <div className="border border-foreground bg-background">
        <div className="p-4 border-b border-foreground bg-muted">
          <h2 className="text-lg font-medium flex items-center gap-2 text-foreground">
            <TrendingUp className="w-5 h-5" />
            Registration Trend (Last 14 Days)
          </h2>
        </div>
        <div className="p-6">
          {dailyRegistrations.every(d => d.count === 0) ? (
            <div className="text-center py-12 text-muted-foreground">
              <TrendingUp className="w-12 h-12 mx-auto mb-4" />
              <p>No registration data in the last 14 days</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={dailyRegistrations}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" fontSize={11} className="fill-muted-foreground" />
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
                  stroke="#000000"
                  strokeWidth={2}
                  dot={{ fill: '#000000', strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Search and Export */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search attendees or events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-foreground bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-3 border border-foreground hover:bg-muted transition-colors text-foreground"
        >
          <Download className="w-4 h-4" />
          Export All
        </button>
      </div>

      {/* Attendees Table */}
      <div className="border border-foreground bg-background">
        <div className="p-4 border-b border-foreground bg-muted flex items-center justify-between">
          <h3 className="font-medium flex items-center gap-2 text-foreground">
            <Users className="w-5 h-5" />
            All Attendees ({filteredAttendees.length})
          </h3>
        </div>

        {filteredAttendees.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              {searchTerm ? 'No matching attendees found' : 'No attendees yet'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Attendees will appear here when people register for your events
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-medium">Attendee</TableHead>
                <TableHead className="font-medium">Event info</TableHead>
                <TableHead className="font-medium">Registered</TableHead>
                <TableHead className="font-medium text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAttendees.map((attendee) => (
                <TableRow key={attendee.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-medium">
                        {attendee.display_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{attendee.display_name}</div>
                        {/* @ts-ignore */}
                        <div className="text-xs text-muted-foreground">{attendee.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{attendee.eventTitle}</div>
                    {/* @ts-ignore */}
                    <div className="text-xs text-blue-600 inline-block px-1.5 py-0.5 bg-blue-50 rounded mt-1">{attendee.ticket_type}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span title={format(new Date(attendee.registered_at), 'PPpp')}>
                        {formatDistanceToNow(new Date(attendee.registered_at), { addSuffix: true })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <button
                      onClick={() => toast.info('Email feature coming soon!')}
                      className="p-2 border border-foreground hover:bg-muted transition-colors"
                      title="Send Email"
                    >
                      <Mail className="w-4 h-4" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};
