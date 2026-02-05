import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Ticket, DollarSign, TrendingUp, Users, ChevronDown, Search, Filter } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';

interface TicketType {
  id: string;
  name: string;
  price: number;
  quantity: number;
  sold: number;
  is_free: boolean;
  event_id: string;
  eventTitle?: string;
  event?: {
    id: string;
    title: string;
  };
}

interface TicketStats {
  totalTickets: number;
  totalSold: number;
  totalRevenue: number;
}

export const TicketAnalytics: React.FC = () => {
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [stats, setStats] = useState<TicketStats>({
    totalTickets: 0,
    totalSold: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [events, setEvents] = useState<{ id: string; title: string }[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    fetchTicketData();
  }, []);

  const fetchTicketData = async () => {
    try {
      const { data: ticketsData } = await api.get('/organizer/tickets');

      // Extract unique events for filter
      const uniqueEventsMap = new Map();
      ticketsData.forEach((t: any) => {
        if (t.event) {
          const eId = t.event._id || t.event.id;
          uniqueEventsMap.set(eId, { id: eId, title: t.event.title });
        }
      });
      setEvents(Array.from(uniqueEventsMap.values()));

      const formattedTickets: TicketType[] = (ticketsData || []).map((t: any) => ({
        ...t,
        id: t._id,
        eventTitle: t.event?.title || 'Unknown Event',
        event_id: t.event?._id || t.event?.id
      }));

      setTickets(formattedTickets);

      // Calculate stats
      const totalTickets = formattedTickets.reduce((acc, t) => acc + t.quantity, 0);
      const totalSold = formattedTickets.reduce((acc, t) => acc + t.sold, 0);
      const totalRevenue = formattedTickets.reduce((acc, t) => acc + (t.sold * (t.price || 0)), 0);

      setStats({
        totalTickets,
        totalSold,
        totalRevenue,
      });
    } catch (error) {
      console.error('Error fetching ticket data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.eventTitle?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEvent = !selectedEvent || t.event_id === selectedEvent;
    return matchesSearch && matchesEvent;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
        <div className="h-96 bg-gray-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-black text-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-xl">
              <Ticket className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-white/60 text-sm font-medium uppercase tracking-wider">Total Inventory</p>
              <h3 className="text-3xl font-bold mt-1">{stats.totalTickets.toLocaleString()} <span className="text-lg text-white/40 font-normal">tickets</span></h3>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-50 rounded-xl">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Sold</p>
              <h3 className="text-3xl font-bold mt-1 text-gray-900">{stats.totalSold.toLocaleString()}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-xl">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Revenue</p>
              <h3 className="text-3xl font-bold mt-1 text-gray-900">৳{stats.totalRevenue.toLocaleString()}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-gray-50/50">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Ticket Inventory</h2>
            <p className="text-sm text-gray-500">Manage and track ticket sales across all events</p>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            {/* Event Filter */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg bg-white hover:border-black transition-colors text-sm font-medium min-w-[180px] justify-between"
              >
                <span className="truncate max-w-[140px]">
                  {selectedEvent ? events.find(e => e.id === selectedEvent)?.title : 'All Events'}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none max-h-60 overflow-y-auto">
                  <div className="py-1">
                    <button
                      onClick={() => { setSelectedEvent(null); setDropdownOpen(false); }}
                      className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                    >
                      All Events
                    </button>
                    {events.map(event => (
                      <button
                        key={event.id}
                        onClick={() => { setSelectedEvent(event.id); setDropdownOpen(false); }}
                        className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 truncate"
                      >
                        {event.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Search */}
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {filteredTickets.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Ticket className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No tickets found</h3>
              <p className="text-gray-500 mt-1">Create an event to generate ticket inventory.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead className="w-[30%]">Event Details</TableHead>
                  <TableHead>Ticket Type</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="w-[20%]">Sales Progress</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.map((ticket) => {
                  const percent = ticket.quantity > 0 ? (ticket.sold / ticket.quantity) * 100 : 0;
                  const revenue = ticket.sold * ticket.price;
                  const isSoldOut = ticket.quantity > 0 && ticket.sold >= ticket.quantity;

                  return (
                    <TableRow key={ticket.id} className="hover:bg-gray-50/50 transition-colors">
                      <TableCell>
                        <div className="font-semibold text-gray-900">{ticket.eventTitle}</div>
                        <div className="text-xs text-gray-500 font-mono mt-0.5">ID: {ticket.event_id?.slice(-6)}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{ticket.name}</span>
                          {isSoldOut && <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold uppercase rounded-full">Sold Out</span>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{ticket.price === 0 ? 'Free' : `৳${ticket.price.toLocaleString()}`}</div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs font-medium">
                            <span className={isSoldOut ? 'text-red-600' : 'text-gray-700'}>
                              {ticket.sold} / {ticket.quantity === 0 ? '∞' : ticket.quantity} Sold
                            </span>
                            <span className="text-gray-500">{Math.round(percent)}%</span>
                          </div>
                          <Progress value={percent} className={`h-1.5 ${isSoldOut ? 'bg-red-100' : 'bg-gray-100'}`} />
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="font-bold text-gray-900">৳{revenue.toLocaleString()}</div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
};
