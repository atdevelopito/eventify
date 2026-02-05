import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Users, Mail, Download, Calendar, ChevronDown, Search, DollarSign, Tag, CheckCircle, Clock } from 'lucide-react';
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
import { MorphButton } from '@/components/ui/morph-button';

interface EventRegistrationsProps {
  userId: string;
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
  user_email?: string;
  user_name?: string;
  ticket_type?: string;
  quantity?: number;
  price?: number;
  status?: string;
  payment_status?: string;
}

export const EventRegistrations: React.FC<EventRegistrationsProps> = ({
  userId,
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
  }, [userId]);

  useEffect(() => {
    if (selectedEventId) {
      fetchRegistrations(selectedEventId);
    }
  }, [selectedEventId]);

  const fetchEvents = async () => {
    try {
      // Fetch events created by user
      const { data } = await api.get(`/events?created_by=${userId}&limit=100&sort=-target_date`);
      const eventList = (data.events || []).map((e: any) => ({
        ...e,
        id: e._id || e.id
      }));

      setEvents(eventList);

      // Auto-select first event if none selected
      if (!selectedEventId && eventList.length > 0) {
        onSelectEvent(eventList[0].id);
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

      const formattedRegs = data.map((reg: any) => ({
        id: reg.id,
        user_id: reg.user_id,
        registered_at: reg.registered_at,
        user_name: reg.user_name || 'Anonymous',
        user_email: reg.user_email || 'Unknown',
        ticket_type: reg.ticket_type,
        quantity: reg.quantity,
        price: reg.price,
        status: reg.status,
        payment_status: reg.payment_status
      }));

      setRegistrations(formattedRegs);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      toast.error('Failed to load registrations. Ensure you created this event.');
      setRegistrations([]);
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
    const headers = ['Name', 'Email', 'Ticket Type', 'Qty', 'Price', 'Status', 'Registered At'];
    const rows = registrations.map(r => [
      r.user_name || 'Anonymous',
      r.user_email || 'N/A',
      r.ticket_type || 'General',
      r.quantity || 1,
      r.price || 0,
      r.status || 'confirmed',
      (() => {
        try {
          return r.registered_at ? format(new Date(r.registered_at), 'PPpp') : 'Unknown';
        } catch (e) {
          return 'Invalid Date';
        }
      })()
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

  if (loading) return (
    <div className="border border-border p-12 text-center bg-card rounded-2xl">
      <div className="animate-pulse text-muted-foreground">Loading events...</div>
    </div>
  );

  if (events.length === 0) return (
    <div className="border border-border p-12 text-center bg-card rounded-2xl">
      <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
      <p className="text-muted-foreground">No events found</p>
      <p className="text-sm text-muted-foreground mt-2">Create an event to start receiving registrations</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Event Selector and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative z-20">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-4 py-3 border border-input bg-background min-w-[280px] justify-between hover:bg-accent hover:text-accent-foreground transition-all rounded-lg shadow-sm"
          >
            <span className="truncate font-medium">{selectedEvent?.title || 'Select an event'}</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setDropdownOpen(false)}
              ></div>
              <div className="absolute z-30 top-full left-0 right-0 mt-1 border border-input bg-popover text-popover-foreground rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {events.map((event) => (
                  <button
                    key={event.id}
                    onClick={() => {
                      onSelectEvent(event.id);
                      setDropdownOpen(false);
                    }}
                    className={`w-full px-4 py-3 text-left hover:bg-accent hover:text-accent-foreground transition-colors ${event.id === selectedEventId ? 'bg-primary/10 font-bold text-primary' : ''}`}
                  >
                    {event.title}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <MorphButton
          onClick={async () => {
            // Fake loading for effect
            return new Promise(resolve => {
              setTimeout(() => {
                handleExportCSV();
                resolve(void 0);
              }, 800);
            });
          }}
          text="Export CSV"
          icon={<Download className="w-4 h-4" />}
          className="h-12 px-6"
        />
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Registrations Table */}
      <div className="border border-border bg-card rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border bg-muted/50 flex items-center justify-between">
          <h3 className="font-bold flex items-center gap-2">
            <Users className="w-5 h-5" />
            Registrations ({filteredRegistrations.length})
          </h3>
        </div>

        {loadingRegistrations ? (
          <div className="p-12 text-center">
            <div className="animate-pulse text-muted-foreground">Loading registrations...</div>
          </div>
        ) : filteredRegistrations.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground font-medium">
              {searchTerm ? 'No matching registrations found' : 'No registrations available for this event'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-bold">Attendee</TableHead>
                  <TableHead className="font-bold">Ticket Details</TableHead>
                  <TableHead className="font-bold">Price</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                  <TableHead className="font-bold">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRegistrations.map((registration) => (
                  <TableRow key={registration.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                          {registration.user_name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div>
                          <div className="font-bold text-foreground">{registration.user_name}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {registration.user_email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Tag className="w-3 h-3 text-muted-foreground" />
                          <span className="font-medium text-sm">{registration.ticket_type || 'General'}</span>
                        </div>
                        <div className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full w-fit">
                          Qty: {registration.quantity || 1}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-sm">
                        {registration.price && registration.price > 0 ? `$${registration.price}` : 'Free'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${registration.payment_status === 'paid'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                        }`}>
                        {registration.payment_status === 'paid' ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                        {registration.payment_status || 'Pending'}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {(() => {
                        try {
                          return registration.registered_at
                            ? format(new Date(registration.registered_at), 'MMM d, yyyy')
                            : 'N/A';
                        } catch (e) {
                          return 'Inv. Date';
                        }
                      })()}
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
