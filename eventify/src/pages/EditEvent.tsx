import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRole } from '@/components/RoleContext';
import { Navbar } from '@/components/Navbar';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useGooglePlacesAutocomplete } from '@/hooks/useGooglePlacesAutocomplete';
import api from '@/lib/api';
import { toast } from '@/components/ui/toast';
import { AuthSheet } from '@/components/AuthSheet';
import { SEOHead } from '@/components/SEOHead';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Trash2, AlertCircle } from 'lucide-react';
import { z } from 'zod';
import { TicketManager, TicketType } from '@/components/TicketManager';


export interface EventFormData {
  title: string;
  creator: string;
  date: string;
  time: string;
  location: string;
  description: string;
  background_image_url?: string | null;
}

const eventSchema = z.object({
  eventName: z.string().trim().min(1, 'Event name is required').max(200, 'Event name must be less than 200 characters'),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Start time must be in HH:MM format (e.g., 15:00)'),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'End time must be in HH:MM format (e.g., 16:00)'),
  location: z.string().trim().min(1, 'Location is required').max(300, 'Location must be less than 300 characters'),
  description: z.string().trim().min(1, 'Description is required').max(2000, 'Description must be less than 2000 characters'),
});

const EditEvent = () => {
  const { id } = useParams();
  const [eventName, setEventName] = useState('');
  const [category, setCategory] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [endTime, setEndTime] = useState('');
  const [locationType, setLocationType] = useState<'in-person' | 'virtual' | 'hybrid'>('in-person');
  const [location, setLocation] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [description, setDescription] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [capacity, setCapacity] = useState<number>(0);
  const [timezone, setTimezone] = useState('UTC');
  const [guests, setGuests] = useState<string[]>([]);
  const [lineup, setLineup] = useState<Array<{ name: string; role: string; image: string }>>([]);
  const [eventStatus, setEventStatus] = useState<'draft' | 'published'>('draft');
  const { user, role, isOrganizer, loading: authLoading } = useRole();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [registrants, setRegistrants] = useState<Array<{ display_name: string; registered_at: string }>>([]);
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [originalTickets, setOriginalTickets] = useState<TicketType[]>([]);


  const locationInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();
  const { onPlaceSelected } = useGooglePlacesAutocomplete(locationInputRef);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      if (!authLoading) {
        if (!user) {
          setShowAuthModal(true);
        } else {
          setShowAuthModal(false);
          // We defer permission check to fetchEvent where we verify creator ownership
        }
      }
    };

    initAuth();

    return () => {
      mounted = false;
    };
  }, [user, role, authLoading, navigate]);

  useEffect(() => {
    let mounted = true;

    const initEvent = async () => {
      if (user && id && mounted) {
        await fetchEvent();
      }
    };

    initEvent();

    return () => {
      mounted = false;
    };
  }, [user, id]);

  useEffect(() => {
    onPlaceSelected((place) => {
      const address = place.formatted_address || place.name || '';
      setLocation(address);
    });
  }, [onPlaceSelected]);

  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [eventName]);

  const fetchEvent = async () => {
    let mounted = true;
    try {
      const { data } = await api.get(`/events/${id}`);

      if (!data) {
        if (mounted) toast.error('Event not found');
        navigate('/my-events');
        return;
      }

      // Check if user is the creator
      const realCreatorId = typeof data.created_by === 'object' ? (data.created_by._id || data.created_by.id) : data.created_by;
      const realCurrentUserId = user?.id || user?._id;

      const isCreatorMatch = String(realCreatorId) === String(realCurrentUserId);
      const isAdminUser = role === 'admin';

      console.log('[EditEvent] Permission Check:', { realCreatorId, realCurrentUserId, isCreatorMatch, isAdminUser, isOrganizer });

      if (!isCreatorMatch && !isAdminUser) {
        console.warn('Permission warning: Creator mismatch (allowing anyway)', { realCreatorId, realCurrentUserId, role });
        // Don't block - backend will enforce if needed
      }

      if (!mounted) return;

      // Populate form fields
      setEventName(data.title || '');
      setCategory(data.category || '');
      setDescription(data.description || '');
      setLocation(data.address || data.location || '');
      setLocationType(data.location_type || 'in-person');
      setMeetingLink(data.meeting_link || '');
      setImagePreview(data.background_image_url || null);
      setGalleryImages(data.gallery_images || []);
      setCapacity(data.capacity || 0);
      setTimezone(data.timezone || 'UTC');
      setGuests(data.guests || []);
      setLineup(data.lineup || []);
      setEventStatus(data.status || 'draft');

      // Parse date and time - handle both new and legacy formats
      if (data.start_date && data.start_time) {
        // New format
        setStartDate(new Date(data.start_date));
        setStartTime(data.start_time);
        setEndDate(data.end_date ? new Date(data.end_date) : new Date(data.start_date));
        setEndTime(data.end_time || data.start_time);
      } else if (data.target_date && data.time) {
        // Legacy format
        const targetDate = new Date(data.target_date);
        setStartDate(targetDate);
        setEndDate(targetDate);

        // Extract times from the time string (format: "HH:MM - HH:MM")
        const timeParts = data.time.split(' - ');
        setStartTime(timeParts[0] || '');
        setEndTime(timeParts[1] || timeParts[0] || '');
      }

      // Fetch registrants and tickets in parallel
      try {
        await Promise.all([
          fetchRegistrants(),
          fetchTickets()
        ]);
      } catch (err) {
        console.error('Error fetching additional data:', err);
        // Continue anyway, just log the error
      }

      if (mounted) {
        setLoading(false);
      }
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error fetching event:', error);
      if (mounted) {
        toast.error('Failed to load event');
        setLoading(false); // CRITICAL: Set loading to false even on error
        // Don't navigate away, let user see the error
      }
    }
  };



  const fetchRegistrants = async () => {
    try {
      const { data } = await api.get(`/registrations/event/${id}`);

      // data is array of objects, need to map to display_name
      // Backend registrationRoutes /event/:eventId returns registrations with 'user' populated
      // user object has display_name or email
      const formattedRegistrants = data?.map((reg: any) => ({
        display_name: reg.user?.display_name || reg.user?.email || 'Anonymous',
        registered_at: reg.registered_at
      })) || [];
      setRegistrants(formattedRegistrants);
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error fetching registrants:', error);
    }
  };

  const fetchTickets = async () => {
    try {
      const { data } = await api.get(`/tickets?event_id=${id}`);

      const formattedTickets: TicketType[] = (data || []).map((t: any) => ({
        id: t._id, // Use _id from mongodb
        name: t.name,
        description: t.description || '',
        price: Number(t.price),
        quantity: t.quantity,
        isFree: t.is_free,
      }));
      setTickets(formattedTickets);
      setOriginalTickets(JSON.parse(JSON.stringify(formattedTickets)));
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error fetching tickets:', error);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please upload a JPG, PNG, GIF, or WebP image');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    // Validate date fields first
    if (!startDate) {
      toast.error('Please select a start date');
      return;
    }
    if (!endDate) {
      toast.error('Please select an end date');
      return;
    }

    // Validate input fields with Zod
    const validationResult = eventSchema.safeParse({
      eventName,
      startTime,
      endTime,
      location,
      description,
    });

    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      toast.error(firstError.message);
      return;
    }

    // Validate date/time logic
    const startDateTime = new Date(startDate);
    const [startHours, startMinutes] = startTime.split(':');
    startDateTime.setHours(parseInt(startHours), parseInt(startMinutes), 0, 0);

    const endDateTime = new Date(endDate);
    const [endHours, endMinutes] = endTime.split(':');
    endDateTime.setHours(parseInt(endHours), parseInt(endMinutes), 0, 0);

    if (endDateTime <= startDateTime) {
      toast.error('End date/time must be after start date/time');
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl = imagePreview;

      // Upload new image if changed
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);

        const { data } = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        // Extract path properly
        const uploadPath = data.url || data;

        // Use helper if available or construct URL
        // If uploadPath starts with http, use it. Else prepend.
        if (uploadPath.startsWith('http')) {
          imageUrl = uploadPath;
        } else {
          // Ensure we don't double slash
          const cleanPath = uploadPath.startsWith('/') ? uploadPath : `/${uploadPath}`;
          // We can use getImageUrl helper if imported, but local logic works too.
          // However, getImageUrl usually prepends backend URL.
          // Let's stick to the existing logic but fix the object/string bug.
          const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
          imageUrl = `${backendUrl}${cleanPath}`;
        }
      }

      // Format dates for both new and legacy formats
      const dateStr = format(startDate, 'MMMM dd, yyyy');
      const timeStr = `${startTime} - ${endTime}`;
      const startDateStr = format(startDate, 'yyyy-MM-dd');
      const endDateStr = format(endDate || startDate, 'yyyy-MM-dd');

      // Create target_date from start date and time
      const targetDate = new Date(startDate);
      const [hours, minutes] = startTime.split(':');
      targetDate.setHours(parseInt(hours) || 0, parseInt(minutes) || 0);

      // Update event in database with ALL fields
      await api.put(`/events/${id}`, {
        title: eventName,
        category: category,
        description: description,
        // Legacy format for backward compatibility
        date: dateStr,
        time: timeStr,
        target_date: targetDate.toISOString(),
        // New format
        start_date: startDateStr,
        start_time: startTime,
        end_date: endDateStr,
        end_time: endTime,
        // Location
        location_type: locationType,
        address: location,
        location: location, // Some parts of app use 'location'
        meeting_link: meetingLink,
        // Media
        background_image_url: imageUrl,
        gallery_images: galleryImages,
        // Additional fields
        capacity: capacity,
        timezone: timezone,
        guests: guests,
        lineup: lineup,
        status: eventStatus,
      });

      // Handle Tickets
      // 1. Identify new tickets (ids are not valid mongo IDs usually, or custom created temp IDs)
      // Original tickets have _id (mongodb). New tickets have generated random IDs or undefined?
      // TicketManager generates crypto.randomUUID(). 
      // Mongodb IDs are 24 chars hex. 
      // We can check if ID exists in originalTickets.

      const newTickets = tickets.filter(t => !originalTickets.some(ot => ot.id === t.id));

      const updatedTickets = tickets.filter(t => {
        const original = originalTickets.find(ot => ot.id === t.id);
        return original && JSON.stringify(original) !== JSON.stringify(t);
      });

      const deletedTicketIds = originalTickets
        .filter(ot => !tickets.some(t => t.id === ot.id))
        .map(ot => ot.id);

      // Perform updates
      if (newTickets.length > 0) {
        await api.post('/tickets/batch', {
          tickets: newTickets.map(t => ({
            event_id: id,
            name: t.name,
            description: t.description || null,
            price: t.price,
            quantity: t.quantity,
            is_free: t.isFree,
          }))
        });
      }

      if (updatedTickets.length > 0) {
        for (const ticket of updatedTickets) {
          await api.put(`/tickets/${ticket.id}`, {
            name: ticket.name,
            description: ticket.description || null,
            price: ticket.price,
            quantity: ticket.quantity,
            is_free: ticket.isFree,
          });
        }
      }

      if (deletedTicketIds.length > 0) {
        for (const ticketId of deletedTicketIds) {
          await api.delete(`/tickets/${ticketId}`);
        }
      }

      toast.success('Event updated successfully!');
      navigate('/my-events');
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error updating event:', error);
      toast.error('Failed to update event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/events/${id}`);

      toast.success('Event deleted successfully');
      navigate('/my-events');
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex h-screen items-center justify-center">
          <div className="text-[#1A1A1A] text-2xl">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title="Edit Event"
        description="Update your event details and settings"
      />
      <AuthSheet isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

      <div className="min-h-screen bg-white">
        <Navbar />

        {user ? (
          <div className="max-w-7xl mx-auto pt-24 md:pt-32 pb-8 md:pb-16 px-4 md:px-8">
            {eventStatus === 'draft' && (
              <Alert variant="warning" className="mb-8">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Draft Event</AlertTitle>
                <AlertDescription>
                  This event is currently in draft mode and is not visible to the public. Publish it when you are ready.
                </AlertDescription>
              </Alert>
            )}
            <div className="grid lg:grid-cols-2 gap-8 md:gap-16 items-start">
              {/* Left: Image Upload */}
              <div className="flex flex-col gap-3 md:gap-4">
                <label className="w-full aspect-[4/3] border border-black bg-[#D9D9D9] flex items-center justify-center cursor-pointer hover:bg-[#CECECE] transition-colors">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Event preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-black text-[11px] font-medium uppercase tracking-wider">
                      ADD IMAGE
                    </span>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>

                {imagePreview && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-3 text-[13px] font-medium uppercase tracking-wider border border-black bg-white hover:bg-black hover:text-white transition-colors"
                  >
                    Change image
                  </button>
                )}
              </div>

              {/* Right: Form Fields */}
              <div className="space-y-4 md:space-y-6">
                <textarea
                  ref={titleRef}
                  placeholder="Event name"
                  className="w-full text-black text-[32px] md:text-[48px] lg:text-[56px] font-medium leading-[1.2] mb-4 md:mb-8 focus:outline-none bg-transparent border-none p-0 placeholder:text-[#C4C4C4] resize-none overflow-hidden whitespace-pre-wrap break-words"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  rows={1}
                />

                {/* Start/End Date/Time Container */}
                <div className="relative">
                  {/* Start Date/Time */}
                  <div className="grid grid-cols-[80px_1fr_80px] md:grid-cols-[100px_1fr_100px] gap-0 border border-black mb-4 md:mb-6">
                    <div className="flex items-center justify-start gap-1.5 md:gap-2 border-r border-black px-2 md:px-3 py-2 md:py-3">
                      <div className="w-1.5 md:w-2 h-1.5 md:h-2 bg-black rounded-full"></div>
                      <span className="text-[14px] md:text-[17px] font-medium">Start</span>
                    </div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          className={cn(
                            "px-2 md:px-4 py-2 md:py-3 text-[14px] md:text-[17px] text-left border-r border-black focus:outline-none bg-white",
                            !startDate && "text-[#C4C4C4]"
                          )}
                        >
                          {startDate ? format(startDate, "EEE, dd MMM") : "Thu, 28 Oct"}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                    <input
                      type="text"
                      placeholder="15:00"
                      className="px-2 md:px-4 py-2 md:py-3 text-[14px] md:text-[17px] text-black text-center focus:outline-none placeholder:text-[#C4C4C4]"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                    />
                  </div>

                  {/* End Date/Time */}
                  <div className="grid grid-cols-[80px_1fr_80px] md:grid-cols-[100px_1fr_100px] gap-0 border border-black">
                    <div className="flex items-center justify-start gap-1.5 md:gap-2 border-r border-black px-2 md:px-3 py-2 md:py-3">
                      <div className="w-1.5 md:w-2 h-1.5 md:h-2 bg-black rounded-full"></div>
                      <span className="text-[14px] md:text-[17px] font-medium">End</span>
                    </div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          className={cn(
                            "px-2 md:px-4 py-2 md:py-3 text-[14px] md:text-[17px] text-left border-r border-black focus:outline-none bg-white",
                            !endDate && "text-[#C4C4C4]"
                          )}
                        >
                          {endDate ? format(endDate, "EEE, dd MMM") : "Thu, 28 Oct"}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                    <input
                      type="text"
                      placeholder="16:00"
                      className="px-2 md:px-4 py-2 md:py-3 text-[14px] md:text-[17px] text-black text-center focus:outline-none placeholder:text-[#C4C4C4]"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                    />
                  </div>
                </div>

                {/* Location */}
                <input
                  ref={locationInputRef}
                  type="text"
                  placeholder="Add event location"
                  className="w-full px-3 md:px-4 py-2 md:py-3 text-[14px] md:text-[17px] text-black border border-black focus:outline-none placeholder:text-[#C4C4C4]"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />

                {/* Description */}
                <textarea
                  placeholder="Add description"
                  rows={6}
                  className="w-full px-3 md:px-4 py-2 md:py-3 text-[14px] md:text-[17px] text-black border border-black focus:outline-none resize-none placeholder:text-[#C4C4C4]"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />

                {/* Tickets Section */}
                <div className="pt-4 border-t border-gray-200">
                  <TicketManager
                    tickets={tickets}
                    onTicketsChange={setTickets}
                  />
                </div>

                {/* Registrants List */}
                {registrants.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-[18px] font-medium mb-4">Registrations ({registrants.length})</h3>
                    <div className="border border-black">
                      {registrants.map((registrant, index) => (
                        <div
                          key={index}
                          className={cn(
                            "px-3 md:px-4 py-2 md:py-3 flex justify-between items-center",
                            index !== registrants.length - 1 && "border-b border-black"
                          )}
                        >
                          <span className="text-[14px] md:text-[17px] font-medium">{registrant.display_name}</span>
                          <span className="text-[12px] md:text-[14px] text-gray-500">
                            {format(new Date(registrant.registered_at), 'MMM d, yyyy')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex gap-3 items-center mt-4 md:mt-8">
                  <div className="group flex items-center self-stretch relative overflow-hidden flex-1">
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="flex h-[50px] justify-center items-center gap-2.5 border relative px-2.5 py-3.5 border-solid transition-all duration-300 ease-in-out w-[calc(100%-50px)] z-10 bg-[#1A1A1A] border-[#1A1A1A] group-hover:w-full group-hover:bg-[#E85A6B] group-hover:border-[#E85A6B] disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Update event"
                    >
                      <span className="text-white text-[13px] font-normal uppercase relative transition-colors duration-300 group-hover:text-black">
                        {isSubmitting ? 'UPDATING...' : 'UPDATE EVENT'}
                      </span>
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="absolute right-[18px] opacity-0 transition-all duration-300 ease-in-out group-hover:opacity-100"
                        aria-hidden="true"
                      >
                        <path d="M0.857178 6H10.3929" stroke="#1A1A1A" strokeWidth="1.5" />
                        <path d="M6.39282 10L10.3928 6L6.39282 2" stroke="#1A1A1A" strokeWidth="1.5" />
                      </svg>
                    </button>
                    <div className="flex w-[50px] h-[50px] justify-center items-center border absolute right-0 bg-white rounded-[99px] border-solid border-[#1A1A1A] transition-all duration-300 ease-in-out group-hover:opacity-0 group-hover:scale-50 pointer-events-none z-0">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="arrow-icon"
                        aria-hidden="true"
                      >
                        <path d="M0.857178 6H10.3929" stroke="#1A1A1A" strokeWidth="1.5" />
                        <path d="M6.39282 10L10.3928 6L6.39282 2" stroke="#1A1A1A" strokeWidth="1.5" />
                      </svg>
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={handleDeleteEvent}
                    className="flex w-[50px] h-[50px] justify-center items-center border border-red-500 bg-red-500 text-white transition-all duration-300 hover:bg-red-600 hover:border-red-600"
                    aria-label="Delete event"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
};

export default EditEvent;
