import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRole } from '@/components/RoleContext';
import { Navbar } from '@/components/Navbar';
// import { Calendar } from '@/components/ui/calendar';
import { CalendarLume } from '@/components/ui/calendar-lume';
import { MorphButton } from '@/components/ui/morph-button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useGooglePlacesAutocomplete } from '@/hooks/useGooglePlacesAutocomplete';
import api from '@/lib/api';
import { toast } from '@/components/ui/toast';
import { SEOHead } from '@/components/SEOHead';
import { X, ChevronRight, ChevronLeft, Calendar as CalendarIcon, DollarSign, Share2, Plus, Trash2, Settings, Tag, Info } from 'lucide-react';
import { Switch } from '@/components/ui/switch'; // Assuming we have this or I'll standard input checkbox it

const CATEGORIES = [
  "Music", "Nightlife", "Technology", "Business", "Sports", "Arts", "Community", "Food & Drink"
];

interface Discount {
  code: string;
  amount: string; // number as string
  type: 'percent' | 'fixed';
}

interface Ticket {
  name: string;
  price: string;
  quantity: string;
  type: 'free' | 'paid';
  description?: string;
  limitPerOrder?: string;
  discounts?: Discount[];
  showAdvanced?: boolean; // UI state
  form_id?: string;
  form_title?: string;
}

interface LineupItem {
  name: string;
  role: string;
  image: string; // URL
}

const CreateEvent = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useRole();
  const [step, setStep] = useState(1);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Details
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Step 2: Logistics & Tickets
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [endTime, setEndTime] = useState('');
  const [duration, setDuration] = useState('1h 0m'); // Keep for now or calculate

  const [locationType, setLocationType] = useState<'in-person' | 'virtual' | 'hybrid'>('in-person');
  const [locationAddress, setLocationAddress] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [guests, setGuests] = useState<string[]>([]);

  const [guestInput, setGuestInput] = useState('');
  const [lineup, setLineup] = useState<LineupItem[]>([]);

  // Tickets State
  const [tickets, setTickets] = useState<Ticket[]>([
    { name: 'General Admission', price: '0', quantity: '100', type: 'free', showAdvanced: false, discounts: [] }
  ]);
  const [forms, setForms] = useState<Array<{ id: string; title: string }>>([]);

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const { data } = await api.get('/forms/organizer');
        setForms(data);
      } catch (error) {
        console.error('Error fetching forms:', error);
      }
    };
    if (user) fetchForms();
  }, [user]);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const { onPlaceSelected } = useGooglePlacesAutocomplete(locationInputRef);

  useEffect(() => {
    onPlaceSelected((place) => {
      setLocationAddress(place.formatted_address || place.name || '');
    });
  }, [onPlaceSelected]);

  useEffect(() => {
    if (!authLoading && !user) setShowAuthModal(true);
  }, [user, authLoading]);

  // Handlers
  const handleNext = () => {
    if (step === 1) {
      if (!title) return toast.error("Please enter an event title");
    }
    if (step === 2) {
      if (!startDate) return toast.error("Please select a start date");
      if (!startTime) return toast.error("Please select a start time");
      if (!endDate) return toast.error("Please select an end date");
      if (!endTime) return toast.error("Please select an end time");

      // Validate end date/time is after start date/time
      const startDateTime = new Date(startDate);
      const [startHour, startMinute] = startTime.split(':').map(Number);
      startDateTime.setHours(startHour, startMinute, 0, 0);

      const endDateTime = new Date(endDate);
      const [endHour, endMinute] = endTime.split(':').map(Number);
      endDateTime.setHours(endHour, endMinute, 0, 0);

      if (endDateTime <= startDateTime) {
        return toast.error("Event end date/time must be after start date/time");
      }

      if (tickets.length === 0) return toast.error("Please add at least one ticket type");
    }
    setStep(s => s + 1);
  };

  const handleBack = () => setStep(s => s - 1);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) return toast.error('Max size 5MB');
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const addGuest = () => {
    if (guestInput && guestInput.includes('@')) {
      setGuests([...guests, guestInput]);
      setGuestInput('');
    }
  };

  // Lineup Handlers
  const addLineupItem = () => {
    setLineup([...lineup, { name: '', role: '', image: '' }]);
  };

  const updateLineupItem = (index: number, field: keyof LineupItem, value: string) => {
    const newLineup = [...lineup];
    newLineup[index] = { ...newLineup[index], [field]: value };
    setLineup(newLineup);
  };

  const removeLineupItem = (index: number) => {
    setLineup(lineup.filter((_, i) => i !== index));
  };

  // Ticket Handlers
  const addTicket = () => {
    setTickets([...tickets, { name: '', price: '0', quantity: '100', type: 'free', showAdvanced: false, discounts: [] }]);
  };

  const updateTicket = (index: number, field: keyof Ticket, value: any) => {
    const newTickets = [...tickets];

    // Handle form_id and form_title together
    if (field === 'form_id') {
      newTickets[index] = {
        ...newTickets[index],
        form_id: value || undefined,
        // Don't update form_title here, it will be set separately
      };
    } else if (field === 'form_title') {
      newTickets[index] = {
        ...newTickets[index],
        form_title: value
      };
    } else {
      newTickets[index] = { ...newTickets[index], [field]: value };
    }

    // Auto-set type based on price
    if (field === 'price') {
      newTickets[index].type = Number(value) > 0 ? 'paid' : 'free';
    }

    setTickets(newTickets);
  };

  const removeTicket = (index: number) => {
    setTickets(tickets.filter((_, i) => i !== index));
  };

  const toggleTicketAdvanced = (index: number) => {
    const newTickets = [...tickets];
    newTickets[index].showAdvanced = !newTickets[index].showAdvanced;
    setTickets(newTickets);
  };

  const addDiscount = (ticketIndex: number) => {
    const newTickets = [...tickets];
    if (!newTickets[ticketIndex].discounts) newTickets[ticketIndex].discounts = [];
    newTickets[ticketIndex].discounts?.push({ code: '', amount: '10', type: 'percent' });
    setTickets(newTickets);
  };

  const updateDiscount = (ticketIndex: number, discountIndex: number, field: keyof Discount, value: any) => {
    const newTickets = [...tickets];
    if (newTickets[ticketIndex].discounts) {
      newTickets[ticketIndex].discounts![discountIndex] = { ...newTickets[ticketIndex].discounts![discountIndex], [field]: value };
      setTickets(newTickets);
    }
  };

  const removeDiscount = (ticketIndex: number, discountIndex: number) => {
    const newTickets = [...tickets];
    if (newTickets[ticketIndex].discounts) {
      newTickets[ticketIndex].discounts = newTickets[ticketIndex].discounts!.filter((_, i) => i !== discountIndex);
      setTickets(newTickets);
    }
  };


  const handleSubmit = async (status: 'draft' | 'published') => {
    if (!user) return setShowAuthModal(true);
    setIsSubmitting(true);

    try {
      let imageUrl = '';
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('type', 'events'); // Specify events subdirectory
        const { data } = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        // Extract URL from response object
        imageUrl = data.url || data;
      }

      // Clean up ticket UI state before sending
      const cleanTickets = tickets.map(({ showAdvanced, ...t }) => t);

      const payload = {
        title,
        description,
        date: startDate ? format(startDate, 'MMMM dd, yyyy') : '',
        time: startTime,
        start_date: startDate ? format(startDate, 'yyyy-MM-dd') : '',
        start_time: startTime,
        end_date: endDate ? format(endDate, 'yyyy-MM-dd') : '',
        end_time: endTime,
        address: locationAddress,
        location: locationType === 'virtual' ? 'Virtual' : locationAddress,
        background_image_url: imageUrl,
        status,
        category,
        meeting_link: meetingLink,
        location_type: locationType,
        guests,

        lineup,
        target_date: startDate ? startDate.toISOString() : null,
        tickets: cleanTickets
      };

      const { data: response } = await api.post('/events', payload);
      toast.success(`Event ${status === 'draft' ? 'saved as draft' : 'published'}!`);
      navigate(`/events/${response.id}`);

    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to create event');
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <SEOHead title="Create Event - Eventify" description="Create a new event" />
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-12 md:py-24 animate-in fade-in duration-500">

        {/* Cover Image */}
        <div className="mb-12">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-full aspect-[2.5/1] rounded-3xl border border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors overflow-hidden relative group bg-gray-50/50"
          >
            {imagePreview ? (
              <>
                <img src={imagePreview} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="px-4 py-2 bg-white rounded-full text-sm font-medium shadow-sm">Change Cover</span>
                </div>
              </>
            ) : (
              <div className="text-center">
                <p className="text-lg text-gray-500 font-medium tracking-tight">cover image</p>
                <p className="text-xs text-gray-400 mt-1">Recommended size 1200x500</p>
              </div>
            )}
            <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
          </div>
        </div>

        <div className="space-y-12">

          {/* STEP 1: DETAILS */}
          {step === 1 && (
            <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
              <div className="border-b border-gray-200 pb-5">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900">Event Details</h2>
                <p className="text-gray-500 mt-2 text-lg">Basic information about your event.</p>
              </div>

              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-lg font-semibold text-gray-900">Event Title</label>
                  <input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g., Tech Startup Mixer 2024"
                    className="w-full px-5 py-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all placeholder:text-gray-400 text-gray-900 text-xl font-medium"
                    autoFocus
                  />
                </div>

                {/* Category */}
                <div className="space-y-3">
                  <label className="text-lg font-semibold text-gray-900">Category</label>
                  <div className="flex flex-wrap gap-3">
                    {CATEGORIES.map(c => (
                      <button
                        key={c}
                        onClick={() => setCategory(c)}
                        className={cn(
                          "px-5 py-3 rounded-xl text-base font-medium transition-all border",
                          category === c
                            ? "bg-black text-white border-black shadow-sm"
                            : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        )}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-3">
                  <label className="text-lg font-semibold text-gray-900">Description</label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Tell people what your event is about..."
                    rows={6}
                    className="w-full px-5 py-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all resize-none placeholder:text-gray-400 text-gray-900 leading-relaxed text-lg"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: LOGISTICS & TICKETS */}
          {step === 2 && (
            <div className="space-y-16 animate-in slide-in-from-bottom-4 duration-500">

              {/* Date & Guests Section */}
              <div className="space-y-10">
                <div className="border-b border-gray-200 pb-5">
                  <h2 className="text-3xl font-bold tracking-tight text-gray-900">Date & Location</h2>
                  <p className="text-gray-500 mt-2 text-lg">Where and when is it happening?</p>
                </div>

                <div className="space-y-10">
                  {/* Start Date & End Date Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* START */}
                    <div className="space-y-4 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wide">Starts</h3>
                      </div>

                      <div className="space-y-3">
                        <div className="space-y-2">
                          <label className="text-base font-semibold text-gray-700">Date</label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <button className={cn("w-full px-5 py-4 bg-white border border-gray-200 rounded-xl text-left text-lg font-medium transition-all hover:bg-gray-50 flex items-center justify-between focus:outline-none focus:border-black focus:ring-1 focus:ring-black", !startDate && "text-gray-400")}>
                                {startDate ? format(startDate, "MMM dd, yyyy") : "Select date"}
                                <CalendarIcon className="w-5 h-5 text-gray-400" />
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 border border-gray-200 rounded-xl bg-white shadow-xl" align="start">
                              <CalendarLume selected={startDate} onSelect={setStartDate} className="shadow-none border-0" />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div className="space-y-2">
                          <label className="text-base font-semibold text-gray-700">Time</label>
                          <input
                            type="time"
                            value={startTime}
                            onChange={e => setStartTime(e.target.value)}
                            className="w-full px-5 py-4 bg-white border border-gray-200 rounded-xl text-lg font-medium transition-all hover:bg-gray-50 focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                          />
                        </div>
                      </div>
                    </div>

                    {/* END */}
                    <div className="space-y-4 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wide">Ends</h3>
                      </div>

                      <div className="space-y-3">
                        <div className="space-y-2">
                          <label className="text-base font-semibold text-gray-700">Date</label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <button className={cn("w-full px-5 py-4 bg-white border border-gray-200 rounded-xl text-left text-lg font-medium transition-all hover:bg-gray-50 flex items-center justify-between focus:outline-none focus:border-black focus:ring-1 focus:ring-black", !endDate && "text-gray-400")}>
                                {endDate ? format(endDate, "MMM dd, yyyy") : "Select date"}
                                <CalendarIcon className="w-5 h-5 text-gray-400" />
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 border border-gray-200 rounded-xl bg-white shadow-xl" align="start">
                              <CalendarLume selected={endDate} onSelect={setEndDate} className="shadow-none border-0" />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div className="space-y-2">
                          <label className="text-base font-semibold text-gray-700">Time</label>
                          <input
                            type="time"
                            value={endTime}
                            onChange={e => setEndTime(e.target.value)}
                            className="w-full px-5 py-4 bg-white border border-gray-200 rounded-xl text-lg font-medium transition-all hover:bg-gray-50 focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="space-y-5">
                    <div className="space-y-3">
                      <label className="text-lg font-semibold text-gray-900">Location Type</label>
                      <div className="grid grid-cols-3 gap-4">
                        {['in-person', 'virtual', 'hybrid'].map((type) => (
                          <button
                            key={type}
                            onClick={() => setLocationType(type as any)}
                            className={cn(
                              "py-3.5 rounded-xl text-base font-medium capitalize transition-all border",
                              locationType === type
                                ? "bg-black text-white border-black shadow-sm"
                                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                            )}
                          >
                            {type.replace('-', ' ')}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-lg font-semibold text-gray-900">Address / Link</label>
                      <input
                        ref={locationInputRef}
                        value={locationAddress}
                        onChange={e => setLocationAddress(e.target.value)}
                        placeholder={locationType === 'virtual' ? "Enter meeting link..." : "Search for a venue address..."}
                        className="w-full px-5 py-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all placeholder:text-gray-400 text-lg"
                      />
                    </div>
                  </div>

                  {/* Guests */}
                  <div className="space-y-3">
                    <label className="text-lg font-semibold text-gray-900">Invite Guests (Optional)</label>
                    <div className="flex gap-3">
                      <input
                        value={guestInput}
                        onChange={e => setGuestInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addGuest()}
                        placeholder="Enter email address"
                        className="flex-1 px-5 py-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all placeholder:text-gray-400 text-lg"
                      />
                      <button onClick={addGuest} className="px-8 py-4 bg-white border border-gray-200 text-gray-900 rounded-xl font-medium text-lg hover:bg-gray-50 hover:border-gray-300 transition-colors">
                        Add
                      </button>
                    </div>
                    {guests.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {guests.map((g, i) => (
                          <div key={i} className="pl-4 pr-3 py-2 bg-gray-50 rounded-lg text-sm font-medium flex items-center gap-3 border border-gray-200 text-gray-700">
                            {g}
                            <button onClick={() => setGuests(guests.filter((_, idx) => idx !== i))}><X className="w-4 h-4 text-gray-400 hover:text-red-500" /></button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>


              <div className="space-y-10 pt-10 border-t border-gray-100">
                <div className="border-b border-gray-200 pb-5">
                  <h2 className="text-3xl font-bold tracking-tight text-gray-900">Lineup & Artists</h2>
                  <p className="text-gray-500 mt-2 text-lg">Add performers, speakers, or special guests.</p>
                </div>

                <div className="space-y-6">
                  {lineup.map((item, index) => (
                    <div key={index} className="flex flex-col md:flex-row gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200 items-start md:items-center">
                      <div className="flex-1 space-y-1">
                        <label className="text-xs font-bold uppercase text-gray-500">Name</label>
                        <input
                          value={item.name}
                          onChange={e => updateLineupItem(index, 'name', e.target.value)}
                          placeholder="Artist Name"
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <label className="text-xs font-bold uppercase text-gray-500">Role</label>
                        <input
                          value={item.role}
                          onChange={e => updateLineupItem(index, 'role', e.target.value)}
                          placeholder="e.g. Headliner, Speaker"
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <label className="text-xs font-bold uppercase text-gray-500">Image URL</label>
                        <input
                          value={item.image}
                          onChange={e => updateLineupItem(index, 'image', e.target.value)}
                          placeholder="https://..."
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                        />
                      </div>
                      <button onClick={() => removeLineupItem(index)} className="p-2 text-gray-400 hover:text-red-500 mt-5"><Trash2 className="w-5 h-5" /></button>
                    </div>
                  ))}
                  <button onClick={addLineupItem} className="px-6 py-3 border border-gray-300 rounded-xl font-medium text-gray-600 hover:border-black hover:text-black hover:bg-gray-50 transition-all flex items-center gap-2">
                    <Plus className="w-5 h-5" /> Add Artist
                  </button>
                </div>
              </div>

              {/* Tickets Section */}
              <div className="space-y-10 pt-10 border-t border-gray-100">
                <div className="border-b border-gray-200 pb-5">
                  <h2 className="text-3xl font-bold tracking-tight text-gray-900">Tickets</h2>
                  <p className="text-gray-500 mt-2 text-lg">Configure your ticket types and pricing.</p>
                </div>

                <div className="space-y-6">
                  {tickets.map((ticket, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-gray-300 transition-colors">
                      {/* Main Row */}
                      <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
                        <div className="flex-1 w-full space-y-2">
                          <label className="text-sm font-bold text-gray-500 uppercase tracking-wide">Name</label>
                          <input
                            value={ticket.name}
                            onChange={e => updateTicket(index, 'name', e.target.value)}
                            placeholder="e.g. Regular Entry"
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-black focus:ring-1 focus:ring-black text-lg font-medium placeholder:text-gray-400"
                          />
                        </div>
                        <div className="w-full md:w-36 space-y-2">
                          <label className="text-sm font-bold text-gray-500 uppercase tracking-wide">Price</label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">৳</span>
                            <input
                              type="number"
                              value={ticket.price}
                              onChange={e => updateTicket(index, 'price', e.target.value)}
                              className="w-full pl-8 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-black focus:ring-1 focus:ring-black text-lg font-medium"
                            />
                          </div>
                        </div>
                        <div className="w-full md:w-36 space-y-2">
                          <label className="text-sm font-bold text-gray-500 uppercase tracking-wide">Qty</label>
                          <input
                            type="number"
                            value={ticket.quantity}
                            onChange={e => updateTicket(index, 'quantity', e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-black focus:ring-1 focus:ring-black text-lg font-medium"
                          />
                        </div>
                        <div className="flex items-center gap-2 pb-1">
                          <button
                            onClick={() => toggleTicketAdvanced(index)}
                            className={cn("p-3.5 rounded-xl border transition-all", ticket.showAdvanced ? "bg-gray-100 border-gray-300 text-gray-900" : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900")}
                            title="Settings"
                          >
                            <Settings className="w-5 h-5" />
                          </button>
                          <button onClick={() => removeTicket(index)} className="p-3.5 bg-white border border-gray-200 text-gray-400 rounded-xl hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition-all">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {/* Advanced Options */}
                      {ticket.showAdvanced && (
                        <>
                          <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-10 animate-in slide-in-from-top-1">
                            {/* Description */}
                            <div className="space-y-5">
                              <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Description</label>
                                <textarea
                                  value={ticket.description || ''}
                                  onChange={e => updateTicket(index, 'description', e.target.value)}
                                  placeholder="Includes access strictly to..."
                                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-black focus:ring-1 focus:ring-black text-base resize-none placeholder:text-gray-400"
                                  rows={2}
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Limit per Order</label>
                                <input
                                  type="number"
                                  value={ticket.limitPerOrder || ''}
                                  onChange={e => updateTicket(index, 'limitPerOrder', e.target.value)}
                                  placeholder="No limit"
                                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-black focus:ring-1 focus:ring-black text-base placeholder:text-gray-400"
                                />
                              </div>
                            </div>

                            {/* Form Selection */}
                            <div className="space-y-2">
                              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">Attach Form (Optional)</label>
                              <select
                                value={ticket.form_id || ''}
                                onChange={(e) => {
                                  const formId = e.target.value;
                                  const formTitle = forms.find(f => f.id === formId)?.title;

                                  // Update both fields at once to avoid race condition
                                  const newTickets = [...tickets];
                                  newTickets[index] = {
                                    ...newTickets[index],
                                    form_id: formId || undefined,
                                    form_title: formTitle
                                  };
                                  setTickets(newTickets);
                                }}
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-black focus:ring-1 focus:ring-black text-base"
                              >
                                <option value="">No Form Required</option>
                                {forms.map(form => (
                                  <option key={form.id} value={form.id}>{form.title}</option>
                                ))}
                              </select>
                              <p className="text-xs text-gray-500">Attendees will be asked to fill this form before checkout.</p>
                            </div>
                          </div>

                          {/* Discounts */}
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><Tag className="w-4 h-4" /> Promo Codes</label>
                              <button onClick={() => addDiscount(index)} className="text-xs font-bold tracking-wide uppercase text-black hover:underline">+ Add Code</button>
                            </div>

                            <div className="space-y-3">
                              {ticket.discounts && ticket.discounts.length > 0 ? (
                                ticket.discounts.map((discount, dIndex) => (
                                  <div key={dIndex} className="flex gap-3">
                                    <input
                                      value={discount.code}
                                      onChange={e => updateDiscount(index, dIndex, 'code', e.target.value)}
                                      placeholder="CODE"
                                      className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-base uppercase font-medium placeholder:text-gray-400 placeholder:normal-case focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                                    />
                                    <div className="relative w-28">
                                      <input
                                        type="number"
                                        value={discount.amount}
                                        onChange={e => updateDiscount(index, dIndex, 'amount', e.target.value)}
                                        className="w-full pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-base focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                                      />
                                      <button
                                        onClick={() => updateDiscount(index, dIndex, 'type', discount.type === 'percent' ? 'fixed' : 'percent')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500 hover:text-black bg-gray-100 px-1.5 py-0.5 rounded"
                                      >
                                        {discount.type === 'percent' ? '%' : '৳'}
                                      </button>
                                    </div>
                                    <button onClick={() => removeDiscount(index, dIndex)} className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"><X className="w-4 h-4" /></button>
                                  </div>
                                ))
                              ) : (
                                <div className="text-sm text-gray-400 italic py-1">No promo codes active.</div>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}

                  <button onClick={addTicket} className="w-full py-5 border border-dashed border-gray-300 rounded-2xl text-gray-500 font-medium text-lg hover:border-black hover:text-black hover:bg-gray-50 transition-all flex items-center justify-center gap-3">
                    <Plus className="w-5 h-5" /> Add Another Ticket Type
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* STEP 3: REVIEW - Keeping this clean */}
          {step === 3 && (
            <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-500">
              <div className="border-b border-gray-200 pb-5">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900">Review & Publish</h2>
                <p className="text-gray-500 mt-2 text-lg">Double check your event details.</p>
              </div>

              <div className="space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                  <div className="space-y-10">
                    <div>
                      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Event Title</h3>
                      <p className="text-4xl font-bold text-gray-900 tracking-tight">{title || "Untitled Event"}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Description</h3>
                      <p className="text-gray-600 leading-relaxed max-w-lg text-lg">{description || "No description provided."}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                      {/* Start */}
                      <div>
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div> Starts
                        </h3>
                        <p className="text-xl font-medium text-gray-900">{startDate ? format(startDate, "MMM dd, yyyy") : "TBD"}</p>
                        <p className="text-lg text-gray-500">{startTime || "TBD"}</p>
                      </div>
                      {/* End */}
                      <div>
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-red-500"></div> Ends
                        </h3>
                        <p className="text-xl font-medium text-gray-900">{endDate ? format(endDate, "MMM dd, yyyy") : "TBD"}</p>
                        <p className="text-lg text-gray-500">{endTime || "TBD"}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-8">
                    {/* Ticket Section Summary */}
                    <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
                      <h3 className="text-base font-bold text-gray-900 mb-6 flex items-center gap-2 uppercase tracking-wider"><Tag className="w-5 h-5" /> Tickets Configured</h3>
                      <div className="space-y-4">
                        {tickets.length > 0 ? tickets.map((t, i) => (
                          <div key={i} className="flex justify-between items-center bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                            <div>
                              <p className="font-bold text-gray-900 text-lg">{t.name || "Ticket"}</p>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-sm text-gray-500 font-medium bg-gray-100 px-3 py-1 rounded-full">{t.quantity} available</span>
                                {t.discounts && t.discounts.length > 0 && (
                                  <span className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full font-bold border border-green-100">{t.discounts.length} PROMOS</span>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="font-bold text-2xl tracking-tight">৳ {t.price}</span>
                            </div>
                          </div>
                        )) : (
                          <p className="text-gray-400 text-lg">No tickets added</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Organizer Section */}
                <div className="pt-10 border-t border-gray-200 flex items-center gap-5">
                  <div className="w-16 h-16 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                    {user?.avatar_url && <img src={user.avatar_url} className="w-full h-full object-cover" />}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{user?.name || "Organizer Name"}</h3>
                    <p className="text-base text-gray-500">{user?.email}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Floating Action Bar */}
        <div className="mt-20 flex items-center justify-between border-t border-gray-100 pt-8">
          <div>
            {step > 1 && (
              <button onClick={handleBack} className="text-gray-500 font-medium hover:text-black transition-colors flex items-center gap-2">
                <ChevronLeft className="w-5 h-5" /> Back
              </button>
            )}
          </div>

          <div className="flex items-center gap-4">
            {step < 3 ? (
              <button onClick={handleNext} className="px-10 py-3 bg-black text-white rounded-full font-medium text-lg hover:bg-gray-900 transition-all">
                Next
              </button>
            ) : (
              <>
                <MorphButton
                  onClick={() => handleSubmit('draft')}
                  text="Save Draft"
                  variant="secondary"
                  isLoading={isSubmitting}
                  className="px-6 h-14"
                />
                <MorphButton
                  onClick={() => handleSubmit('published')}
                  text="Create Event"
                  variant="primary"
                  isLoading={isSubmitting}
                  className="px-10 h-14 text-lg"
                />
              </>
            )}
          </div>
        </div>

      </div>
    </div >
  );
};

export default CreateEvent;
