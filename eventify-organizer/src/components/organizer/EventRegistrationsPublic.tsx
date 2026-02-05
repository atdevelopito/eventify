import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Users, Mail, Download, Calendar, ChevronDown, Search, FileText } from 'lucide-react';
import { toast } from '@/components/ui/toast';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface EventRegistrationsPublicProps {
  selectedEventId: string | null;
  onSelectEvent: (eventId: string | null) => void;
}

interface Event {
  id: string;
  title: string;
}

interface Registration {
  id: string;
  user_id: string;
  registered_at: string;
  user_name?: string;
  user_email?: string;
  ticket_type?: string;
  price?: number;
  quantity?: number;
  status?: string;
  payment_status?: string;
  form_responses?: Record<string, any>;
}

export const EventRegistrationsPublic: React.FC<EventRegistrationsPublicProps> = ({
  selectedEventId,
  onSelectEvent
}) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      fetchRegistrations(selectedEventId);
    }
  }, [selectedEventId]);

  const fetchEvents = async () => {
    try {
      const { data } = await api.get('/events?sort=-target_date');
      setEvents(data.events || []);
      if (!selectedEventId && data.events && data.events.length > 0) {
        onSelectEvent(data.events[0].id);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrations = async (eventId: string) => {
    setLoadingRegistrations(true);
    try {
      const { data } = await api.get(`/registrations/event/${eventId}`);
      // Backend now sends populated data
      setRegistrations(data);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      toast.error('Failed to load registrations');
    } finally {
      setLoadingRegistrations(false);
    }
  };

  const handleExportCSV = () => {
    if (registrations.length === 0) {
      toast.error('No registrations to export');
      return;
    }

    const selectedEvent = events.find(e => e.id === selectedEventId);
    const headers = ['Name', 'Email', 'Ticket Type', 'Quantity', 'Price', 'Status', 'Registered At'];
    const rows = registrations.map(r => [
      r.user_name || 'Anonymous',
      r.user_email || '-',
      r.ticket_type || 'General',
      r.quantity || 1,
      r.price || 0,
      r.status || 'confirmed',
      format(new Date(r.registered_at), 'PPpp')
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedEvent?.title || 'event'}-registrations.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success('Registrations exported successfully');
  };

  const filteredRegistrations = registrations.filter(r =>
    r.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.user_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedEvent = events.find(e => e.id === selectedEventId);

  if (loading) {
    return (
      <div className="border border-gray-200 rounded-lg p-12 text-center bg-white shadow-sm">
        <div className="animate-pulse text-gray-500">Loading events...</div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="border border-gray-200 rounded-lg p-12 text-center bg-white shadow-sm">
        <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-900 font-medium">No events found</p>
        <p className="text-sm text-gray-500 mt-2">Create an event to start receiving registrations</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Event Selector and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-lg bg-white min-w-[280px] justify-between hover:bg-gray-50 transition-colors shadow-sm text-left"
          >
            <div>
              <span className="block text-xs text-gray-500 font-medium uppercase tracking-wider mb-0.5">Selected Event</span>
              <span className="block text-sm font-bold text-gray-900 truncate max-w-[200px]">{selectedEvent?.title || 'Select an event'}</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute z-20 top-full left-0 right-0 mt-2 border border-gray-200 rounded-lg bg-white shadow-xl max-h-60 overflow-y-auto">
              {events.map((event) => (
                <button
                  key={event.id}
                  onClick={() => {
                    onSelectEvent(event.id);
                    setDropdownOpen(false);
                  }}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between group ${event.id === selectedEventId ? 'bg-gray-50' : ''}`}
                >
                  <span className={`text-sm font-medium ${event.id === selectedEventId ? 'text-black' : 'text-gray-600 group-hover:text-black'}`}>
                    {event.title}
                  </span>
                  {event.id === selectedEventId && <div className="w-2 h-2 bg-black rounded-full" />}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-5 py-3 border border-gray-200 rounded-lg hover:bg-white hover:border-black transition-all shadow-sm text-gray-700 hover:text-black font-medium text-sm bg-white"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black shadow-sm transition-all"
        />
      </div>

      {/* Registrations Table */}
      <div className="border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <h3 className="font-bold flex items-center gap-2 text-gray-900">
            <Users className="w-4 h-4 text-gray-500" />
            Guest List <span className="text-gray-400 font-normal">({filteredRegistrations.length})</span>
          </h3>
        </div>

        {loadingRegistrations ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin mb-4" />
            <div className="text-gray-500 text-sm">Loading registrations...</div>
          </div>
        ) : filteredRegistrations.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-900 font-medium">No registrations yet</p>
            <p className="text-sm text-gray-500 mt-1">
              {searchTerm ? 'No guests match your search' : 'Share your event link to get started!'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-gray-100">
                  <TableHead className="font-semibold text-gray-900 w-[30%]">Attendee</TableHead>
                  <TableHead className="font-semibold text-gray-900">Ticket Type</TableHead>
                  <TableHead className="font-semibold text-gray-900">Price</TableHead>
                  <TableHead className="font-semibold text-gray-900">Status</TableHead>
                  <TableHead className="font-semibold text-gray-900">Date</TableHead>
                  <TableHead className="font-semibold text-gray-900 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRegistrations.map((registration) => (
                  <TableRow key={registration.id} className="hover:bg-gray-50 border-gray-100 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-gray-800 to-black rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm">
                          {registration.user_name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-900 text-sm">{registration.user_name}</span>
                          <span className="text-xs text-gray-500">{registration.user_email || 'No email provided'}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                        {registration.ticket_type || 'General'}
                        {registration.quantity && registration.quantity > 1 && (
                          <span className="bg-black text-white text-[10px] px-1.5 rounded-full ml-1">x{registration.quantity}</span>
                        )}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-gray-900">{registration.price === 0 ? 'Free' : `৳${(registration.price || 0).toLocaleString()}`}</span>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${registration.status === 'confirmed' || registration.status === 'paid'
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${registration.status === 'confirmed' || registration.status === 'paid' ? 'bg-green-500' : 'bg-yellow-500'
                          }`} />
                        {registration.status === 'confirmed' || registration.status === 'paid' ? 'Confirmed' : 'Pending'}
                      </span>
                    </TableCell>
                    <TableCell className="text-gray-500 text-sm">
                      {format(new Date(registration.registered_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {registration.form_responses && Object.keys(registration.form_responses).length > 0 && (
                          <Sheet>
                            <SheetTrigger asChild>
                              <button
                                className="p-2 rounded-md hover:bg-gray-100 text-gray-500 hover:text-black transition-colors"
                                title="View Form Data"
                              >
                                <FileText className="w-4 h-4" />
                              </button>
                            </SheetTrigger>
                            <SheetContent>
                              <SheetHeader>
                                <SheetTitle>Registration Details</SheetTitle>
                                <SheetDescription>
                                  Submitted data for {registration.user_name}
                                </SheetDescription>
                              </SheetHeader>
                              <div className="mt-6 space-y-6">
                                {Object.entries(registration.form_responses).map(([key, value]) => (
                                  <div key={key} className="space-y-1">
                                    {/* Try to resolve question label if possible, otherwise use key (ID) */}
                                    {/* Since we don't have the form schema here easily, we might just show key or try to assume key is readable? 
                                        Actually key is question ID. 
                                        If we want readable labels, we need the form schema. 
                                        For now, display raw ID or value. 
                                        IMPROVEMENT: fetching form schema or storing label in response would be better.
                                        But looking at FormModal, we stored: [questionId]: value.
                                        Ideally we should store { questionId, questionLabel, answer } in backend.
                                        But for now let's just show what we have.
                                    */}
                                    <h4 className="text-sm font-medium text-gray-500 break-words">{key}</h4>
                                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                                      {Array.isArray(value) ? value.join(', ') : String(value)}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </SheetContent>
                          </Sheet>
                        )}
                        <button
                          onClick={() => toast.info('Email feature coming soon!')}
                          className="p-2 rounded-md hover:bg-gray-100 text-gray-500 hover:text-black transition-colors"
                          title="Send Email"
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};
